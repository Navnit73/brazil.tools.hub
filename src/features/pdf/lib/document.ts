/**
 * Leitura e gravação de PDFs com `@cantoo/pdf-lib` (fork mantido do pdf-lib,
 * com suporte a criptografia). Tudo roda no navegador.
 */
import { EncryptedPDFError, PDFDocument } from "@cantoo/pdf-lib";

export const PDF_ACCEPT = "application/pdf,.pdf";

/** Limite por arquivo para não travar o navegador em celulares. */
export const MAX_PDF_BYTES = 100 * 1024 * 1024;

export const PDF_INPUT_HINT = "Arquivos PDF de até 100 MB. Nada é enviado: tudo acontece no seu dispositivo.";

export class PdfError extends Error {}

/** O PDF tem senha de abertura (`wrong` = a senha informada não confere). */
export class PdfPasswordError extends PdfError {
  constructor(readonly reason: "required" | "wrong") {
    super(reason === "required" ? "Este PDF está protegido por senha." : "Senha incorreta. Tente novamente.");
  }
}

/** Valida tipo e tamanho; devolve a mensagem de erro ou `null`. */
export function validatePdfFile(file: File): string | null {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return `${file.name}: não é um arquivo PDF`;
  if (file.size > MAX_PDF_BYTES) return `${file.name}: maior que 100 MB`;
  return null;
}

export async function readBytes(file: Blob): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

/**
 * Abre um PDF para edição. PDFs com apenas "senha de proprietário" (restrições de
 * edição, sem senha para abrir) são abertos automaticamente.
 */
export async function loadPdf(source: Blob | Uint8Array, password?: string): Promise<PDFDocument> {
  const bytes = source instanceof Uint8Array ? source : await readBytes(source);
  try {
    return await PDFDocument.load(bytes, { password, updateMetadata: false });
  } catch (error) {
    if (error instanceof EncryptedPDFError) {
      if (password === undefined) return loadPdf(bytes, "");
      throw new PdfPasswordError("required");
    }
    if (error instanceof Error && /password/i.test(error.message)) {
      throw new PdfPasswordError(password ? "wrong" : "required");
    }
    throw new PdfError("Não foi possível ler este PDF. O arquivo pode estar corrompido ou incompleto.");
  }
}

export async function savePdf(doc: PDFDocument): Promise<Blob> {
  const bytes = await doc.save({ useObjectStreams: true });
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}

/** Mensagem amigável para qualquer erro vindo das operações de PDF. */
export function pdfErrorMessage(error: unknown): string {
  if (error instanceof PdfError) return error.message;
  return "Não foi possível processar o PDF. Tente novamente ou use outro arquivo.";
}
