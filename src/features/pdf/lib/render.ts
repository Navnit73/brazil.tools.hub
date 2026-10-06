/**
 * Visualização com PDF.js: miniaturas, PDF para imagem e PDF para texto.
 * A biblioteca e o worker só são baixados na primeira vez que uma página precisa deles.
 */
import type { PDFDocumentProxy } from "pdfjs-dist";
import { PdfError, PdfPasswordError, readBytes } from "./document";

type PdfJs = typeof import("pdfjs-dist");

let pdfjsPromise: Promise<PdfJs> | null = null;

function getPdfJs(): Promise<PdfJs> {
  pdfjsPromise ??= import("pdfjs-dist").then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerPort = new Worker(new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url), {
      type: "module",
    });
    return pdfjs;
  });
  return pdfjsPromise;
}

export type { PDFDocumentProxy };

const docKeys = new WeakMap<PDFDocumentProxy, number>();
let nextDocKey = 0;

/** Identificador estável de um documento aberto, para usar como `key` do React. */
export function docKey(doc: PDFDocumentProxy): number {
  let key = docKeys.get(doc);
  if (key === undefined) docKeys.set(doc, (key = ++nextDocKey));
  return key;
}

/** Abre um PDF para visualização. Lança `PdfPasswordError` se precisar de senha. */
export async function openPdf(file: Blob, password?: string): Promise<PDFDocumentProxy> {
  const [pdfjs, bytes] = await Promise.all([getPdfJs(), readBytes(file)]);
  const task = pdfjs.getDocument({ data: bytes, password, enableXfa: false });
  try {
    return await task.promise;
  } catch (error) {
    if (error instanceof pdfjs.PasswordException) {
      throw new PdfPasswordError(error.code === pdfjs.PasswordResponses.INCORRECT_PASSWORD ? "wrong" : "required");
    }
    throw new PdfError("Não foi possível abrir este PDF. O arquivo pode estar corrompido ou incompleto.");
  }
}

/** Maior lado permitido no canvas: acima disso alguns celulares falham ou travam. */
const MAX_CANVAS_SIDE = 8192;
const MAX_CANVAS_PIXELS = 36_000_000;

export interface RenderOptions {
  /** 1 = 72 DPI. Ignorado se `width` for informado. */
  scale?: number;
  /** Largura desejada em pixels (para miniaturas). */
  width?: number;
  /** Rotação extra em graus, somada à da própria página. */
  rotation?: number;
  /** Fundo branco (necessário para JPG). PNG pode ficar transparente onde a página não tem fundo. */
  background?: string;
}

/** Desenha uma página (`pageNumber` a partir de 1) em um canvas novo. */
export async function renderPage(doc: PDFDocumentProxy, pageNumber: number, options: RenderOptions = {}): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(pageNumber);
  try {
    const rotation = (page.rotate + (options.rotation ?? 0)) % 360;
    const base = page.getViewport({ scale: 1, rotation });
    let scale = options.width ? options.width / base.width : (options.scale ?? 1);
    // Reduz a escala se o resultado passar do que o navegador aguenta.
    scale = Math.min(scale, MAX_CANVAS_SIDE / base.width, MAX_CANVAS_SIDE / base.height);
    scale = Math.min(scale, Math.sqrt(MAX_CANVAS_PIXELS / (base.width * base.height)));
    const viewport = page.getViewport({ scale, rotation });

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const context = canvas.getContext("2d", { alpha: !options.background })!;
    if (options.background) {
      context.fillStyle = options.background;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    return canvas;
  } finally {
    page.cleanup();
  }
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new PdfError("Não foi possível gerar a imagem."))), type, quality);
  });
}

/** Libera a memória de um canvas que não será mais usado (importante no Safari do iPhone). */
export function releaseCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 0;
  canvas.height = 0;
}

/** Texto de uma página, com quebras de linha onde o PDF indica. */
export async function extractPageText(doc: PDFDocumentProxy, pageNumber: number): Promise<string> {
  const page = await doc.getPage(pageNumber);
  try {
    const content = await page.getTextContent();
    let text = "";
    for (const item of content.items) {
      if (!("str" in item)) continue;
      text += item.str;
      if (item.hasEOL) text += "\n";
    }
    return text
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  } finally {
    page.cleanup();
  }
}
