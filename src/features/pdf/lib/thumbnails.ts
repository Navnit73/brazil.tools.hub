/**
 * Miniaturas de páginas, geradas sob demanda e guardadas por documento.
 * Viram imagens (URL `blob:`) para não manter dezenas de canvases na memória.
 */
import { canvasToBlob, releaseCanvas, renderPage, type PDFDocumentProxy } from "./render";

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

const THUMBNAIL_WIDTH = 240;
/** Poucas renderizações simultâneas mantêm a rolagem fluida no celular. */
const MAX_CONCURRENT = 2;

const cache = new WeakMap<PDFDocumentProxy, Map<number, Promise<Thumbnail>>>();
const urls = new WeakMap<PDFDocumentProxy, string[]>();
let active = 0;
const waiting: Array<() => void> = [];

async function withSlot<T>(task: () => Promise<T>): Promise<T> {
  if (active >= MAX_CONCURRENT) await new Promise<void>((resolve) => waiting.push(resolve));
  active++;
  try {
    return await task();
  } finally {
    active--;
    waiting.shift()?.();
  }
}

export function getThumbnail(doc: PDFDocumentProxy, pageNumber: number): Promise<Thumbnail> {
  let pages = cache.get(doc);
  if (!pages) cache.set(doc, (pages = new Map()));
  let thumbnail = pages.get(pageNumber);
  if (!thumbnail) {
    thumbnail = withSlot(async () => {
      const canvas = await renderPage(doc, pageNumber, { width: THUMBNAIL_WIDTH, background: "#fff" });
      try {
        const blob = await canvasToBlob(canvas, "image/jpeg", 0.8);
        const url = URL.createObjectURL(blob);
        urls.set(doc, [...(urls.get(doc) ?? []), url]);
        return { url, width: canvas.width, height: canvas.height };
      } finally {
        releaseCanvas(canvas);
      }
    });
    // Falhas não ficam em cache: a próxima exibição tenta de novo.
    thumbnail.catch(() => pages.delete(pageNumber));
    pages.set(pageNumber, thumbnail);
  }
  return thumbnail;
}

/** Fecha um documento aberto com `openPdf` e libera suas miniaturas. */
export function disposePdf(doc: PDFDocumentProxy) {
  urls.get(doc)?.forEach((url) => URL.revokeObjectURL(url));
  urls.delete(doc);
  cache.delete(doc);
  void doc.loadingTask.destroy();
}
