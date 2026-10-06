/**
 * Operações de página (juntar, dividir, extrair, remover, girar, organizar),
 * imagens para PDF e senha. Sem React; recebem e devolvem Blobs.
 */
import { degrees, PageSizes, PDFDocument, type PDFPage } from "@cantoo/pdf-lib";
import { decodeImage } from "@/features/image/lib/decode";
import { loadPdf, PdfError, readBytes, savePdf } from "./document";

/** Ângulo normalizado em 0, 90, 180 ou 270. */
export function normalizeRotation(angle: number): number {
  return (((Math.round(angle / 90) * 90) % 360) + 360) % 360;
}

function rotate(page: PDFPage, extra: number) {
  if (extra % 360 !== 0) page.setRotation(degrees(normalizeRotation(page.getRotation().angle + extra)));
}

/** Uma página do documento final: vinda de um PDF de origem ou em branco. */
export type PlannedPage =
  { kind: "page"; source: number; index: number; rotation: number } | { kind: "blank"; width: number; height: number };

/** Monta um PDF novo a partir de páginas de um ou mais documentos, na ordem dada. */
export async function buildPdf(sources: PDFDocument[], plan: PlannedPage[]): Promise<PDFDocument> {
  const output = await PDFDocument.create();
  const copied = new Map<number, PDFPage[]>();

  // Uma chamada a copyPages por documento: recursos compartilhados (fontes, imagens) são copiados uma vez só.
  for (const [sourceIndex, source] of sources.entries()) {
    const indices = plan.flatMap((page) => (page.kind === "page" && page.source === sourceIndex ? [page.index] : []));
    if (indices.length > 0) copied.set(sourceIndex, await output.copyPages(source, indices));
  }

  const cursor = new Map<number, number>();
  for (const page of plan) {
    if (page.kind === "blank") {
      output.addPage([page.width, page.height]);
      continue;
    }
    const position = cursor.get(page.source) ?? 0;
    cursor.set(page.source, position + 1);
    const added = output.addPage(copied.get(page.source)![position]);
    rotate(added, page.rotation);
  }
  return output;
}

const pagesOf = (indices: number[], rotation = 0): PlannedPage[] => indices.map((index) => ({ kind: "page", source: 0, index, rotation }));

export async function mergePdfs(files: File[], onProgress?: (done: number) => void): Promise<Blob> {
  const output = await PDFDocument.create();
  for (const [position, file] of files.entries()) {
    let source: PDFDocument;
    try {
      source = await loadPdf(file);
    } catch (error) {
      throw new PdfError(`${file.name}: ${error instanceof Error ? error.message : "não foi possível ler o arquivo."}`);
    }
    const pages = await output.copyPages(source, source.getPageIndices());
    pages.forEach((page) => output.addPage(page));
    onProgress?.(position + 1);
  }
  return savePdf(output);
}

/** Um PDF por grupo de páginas. */
export async function splitPdf(file: File, groups: number[][], onProgress?: (done: number) => void): Promise<Blob[]> {
  const source = await loadPdf(file);
  const results: Blob[] = [];
  for (const group of groups) {
    results.push(await savePdf(await buildPdf([source], pagesOf(group))));
    onProgress?.(results.length);
  }
  return results;
}

/** Novo PDF só com as páginas indicadas, na ordem dada. */
export async function extractPages(file: File, indices: number[]): Promise<Blob> {
  const source = await loadPdf(file);
  return savePdf(await buildPdf([source], pagesOf(indices)));
}

/** Remove as páginas indicadas, mantendo o restante do documento (favoritos, formulários…). */
export async function removePages(file: File, indices: number[]): Promise<Blob> {
  const doc = await loadPdf(file);
  if (indices.length >= doc.getPageCount()) throw new PdfError("Mantenha pelo menos uma página no documento.");
  for (const index of [...indices].sort((a, b) => b - a)) doc.removePage(index);
  return savePdf(doc);
}

/** Gira cada página pelo ângulo extra correspondente (múltiplos de 90°), no próprio documento. */
export async function rotatePages(file: File, rotations: number[]): Promise<Blob> {
  const doc = await loadPdf(file);
  doc.getPages().forEach((page, index) => rotate(page, rotations[index] ?? 0));
  return savePdf(doc);
}

/** Organiza páginas de um ou mais PDFs (reordenar, girar, excluir, páginas em branco). */
export async function organizePdf(files: File[], plan: PlannedPage[]): Promise<Blob> {
  const sources = await Promise.all(files.map((file) => loadPdf(file)));
  return savePdf(await buildPdf(sources, plan));
}

// ---------------------------------------------------------------------------
// Imagens para PDF

export type PageSizeOption = "a4" | "letter" | "fit";
export type OrientationOption = "auto" | "portrait" | "landscape";

export interface ImagesToPdfOptions {
  pageSize: PageSizeOption;
  orientation: OrientationOption;
  /** Margem em pontos (1 pt = 1/72 pol.). */
  margin: number;
}

/** Imagens vão ao PDF em 96 DPI (tamanho aproximado de exibição na tela). */
const PX_TO_PT = 72 / 96;

export async function imagesToPdf(files: File[], options: ImagesToPdfOptions, onProgress?: (done: number) => void): Promise<Blob> {
  const doc = await PDFDocument.create();

  for (const [position, file] of files.entries()) {
    const image = await embedImage(doc, file);
    const imageWidth = image.width * PX_TO_PT;
    const imageHeight = image.height * PX_TO_PT;
    const { margin } = options;

    let pageWidth: number;
    let pageHeight: number;
    if (options.pageSize === "fit") {
      [pageWidth, pageHeight] = [imageWidth + margin * 2, imageHeight + margin * 2];
    } else {
      const [short, long] = options.pageSize === "a4" ? PageSizes.A4 : PageSizes.Letter;
      const landscape = options.orientation === "landscape" || (options.orientation === "auto" && image.width > image.height);
      [pageWidth, pageHeight] = landscape ? [long, short] : [short, long];
    }

    // Encaixa a imagem na área útil, centralizada e sem distorcer.
    const scale = Math.min((pageWidth - margin * 2) / imageWidth, (pageHeight - margin * 2) / imageHeight);
    const width = imageWidth * scale;
    const height = imageHeight * scale;
    const page = doc.addPage([pageWidth, pageHeight]);
    page.drawImage(image, { x: (pageWidth - width) / 2, y: (pageHeight - height) / 2, width, height });
    onProgress?.(position + 1);
  }

  return savePdf(doc);
}

async function embedImage(doc: PDFDocument, file: File) {
  const bytes = await readBytes(file);
  try {
    // JPG e PNG entram sem recompressão (sem perda e mais rápido), exceto JPGs de celular
    // com rotação EXIF, que o PDF ignoraria.
    if (isJpeg(bytes) && jpegOrientation(bytes) <= 1) return await doc.embedJpg(bytes);
    if (isPng(bytes)) return await doc.embedPng(bytes);
  } catch {
    // Arquivo fora do padrão esperado pelo pdf-lib: recodifica abaixo.
  }

  const decoded = await decodeImage(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = decoded.width;
    canvas.height = decoded.height;
    const context = canvas.getContext("2d")!;
    // Fundo branco: o JPG não tem transparência e a página do PDF já é branca.
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(decoded.source, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    canvas.width = canvas.height = 0;
    if (!blob) throw new PdfError(`${file.name}: não foi possível converter a imagem.`);
    return await doc.embedJpg(await readBytes(blob));
  } finally {
    decoded.release();
  }
}

const isJpeg = (bytes: Uint8Array) => bytes[0] === 0xff && bytes[1] === 0xd8;
const isPng = (bytes: Uint8Array) => bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;

/** Lê a tag de orientação EXIF (1 = normal; 0 = ausente). */
function jpegOrientation(bytes: Uint8Array): number {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 2;
  while (offset + 4 < view.byteLength) {
    const marker = view.getUint16(offset);
    const length = view.getUint16(offset + 2);
    if (marker === 0xffe1 && view.getUint32(offset + 4) === 0x45786966) {
      const tiff = offset + 10;
      const little = view.getUint16(tiff) === 0x4949;
      const ifd = tiff + view.getUint32(tiff + 4, little);
      const entries = view.getUint16(ifd, little);
      for (let i = 0; i < entries; i++) {
        const entry = ifd + 2 + i * 12;
        if (entry + 10 > view.byteLength) return 0;
        if (view.getUint16(entry, little) === 0x0112) return view.getUint16(entry + 8, little);
      }
      return 0;
    }
    if ((marker & 0xff00) !== 0xff00 || marker === 0xffda) return 0;
    offset += 2 + length;
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Senha

/** Protege com senha de abertura (AES-256). Quem tiver a senha pode imprimir, copiar e editar. */
export async function protectPdf(file: File, password: string): Promise<Blob> {
  const doc = await loadPdf(file);
  doc.encrypt({
    userPassword: password,
    ownerPassword: password,
    permissions: {
      printing: "highResolution",
      modifying: true,
      copying: true,
      annotating: true,
      fillingForms: true,
      contentAccessibility: true,
      documentAssembly: true,
    },
  });
  return savePdf(doc);
}

/** Remove a senha e as restrições de um PDF. Exige a senha de abertura, se houver. */
export async function unlockPdf(file: File, password?: string): Promise<Blob> {
  const bytes = await readBytes(file);
  try {
    await PDFDocument.load(bytes, { updateMetadata: false });
    throw new PdfError("Este PDF não tem senha nem restrições. Não há nada para desbloquear.");
  } catch (error) {
    if (error instanceof PdfError) throw error;
  }

  const source = await loadPdf(bytes, password);
  // Um documento novo não herda o dicionário de criptografia do original.
  const output = await buildPdf([source], pagesOf(source.getPageIndices()));
  return savePdf(output);
}
