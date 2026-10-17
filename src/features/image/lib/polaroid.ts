import { Caveat } from "next/font/google";
import { encodeCanvas } from "./encode";
import { context2d, createCanvas, renderImage, type CropRect, type Rotation, type Size } from "./render";

/** Fonte manuscrita da legenda. Só é baixada quando a ferramenta pede (`ensureCaptionFont`). */
const caveat = Caveat({ subsets: ["latin"], weight: "600", display: "swap", preload: false });
const CAPTION_FONT = `600 {size}px ${caveat.style.fontFamily}, cursive`;

/** Medidas reais em milímetros: moldura e área da foto. */
export const POLAROID_FORMATS = {
  classic: { label: "Polaroid clássica", width: 88, height: 107, photoWidth: 79, photoHeight: 79, top: 6 },
  square: { label: "Instax Square", width: 72, height: 86, photoWidth: 62, photoHeight: 62, top: 7 },
  mini: { label: "Instax Mini", width: 54, height: 86, photoWidth: 46, photoHeight: 62, top: 7 },
} as const;

export type PolaroidFormat = keyof typeof POLAROID_FORMATS;

export const FRAME_COLORS = {
  white: { label: "Branca", color: "#ffffff", ink: "#2b2b2b" },
  cream: { label: "Creme", color: "#f4eedf", ink: "#3b3127" },
  black: { label: "Preta", color: "#1d1d1f", ink: "#f2f2f2" },
  pink: { label: "Rosa", color: "#f7d9de", ink: "#5a2d36" },
  blue: { label: "Azul", color: "#d7e6f4", ink: "#23384d" },
  green: { label: "Verde", color: "#d9ecdc", ink: "#243f2a" },
} as const;

export type FrameColor = keyof typeof FRAME_COLORS;

export interface PolaroidOptions {
  format: PolaroidFormat;
  /** Área da foto em porcentagem da imagem já girada/espelhada. */
  crop: CropRect;
  rotation: Rotation;
  flipX: boolean;
  flipY: boolean;
  frame: FrameColor;
  caption: string;
  vintage: boolean;
}

/** Fonte de pixels aceita por `renderImage` (imagem decodificada ou prévia reduzida). */
export interface PhotoSource extends Size {
  source: CanvasImageSource;
  release: () => void;
}

const MM_PER_INCH = 25.4;
export const PRINT_DPI = 300;

export function mmToPx(mm: number, dpi: number): number {
  return Math.round((mm / MM_PER_INCH) * dpi);
}

/** Proporção (largura / altura) da área da foto no formato. */
export function photoRatio(format: PolaroidFormat): number {
  const { photoWidth, photoHeight } = POLAROID_FORMATS[format];
  return photoWidth / photoHeight;
}

/** Garante que a fonte da legenda esteja carregada antes de desenhar no canvas. */
export async function ensureCaptionFont(): Promise<void> {
  try {
    await document.fonts.load(CAPTION_FONT.replace("{size}", "48"));
  } catch {
    // Sem a fonte, a legenda usa a manuscrita padrão do sistema (`cursive`).
  }
}

/** Desenha a polaroid completa (moldura, foto e legenda) no tamanho real em `dpi`. */
export function renderPolaroid(image: PhotoSource, options: PolaroidOptions, dpi: number): HTMLCanvasElement {
  const format = POLAROID_FORMATS[options.format];
  const frame = FRAME_COLORS[options.frame];
  const px = (mm: number) => mmToPx(mm, dpi);

  const canvas = createCanvas(px(format.width), px(format.height));
  const ctx = context2d(canvas);
  ctx.fillStyle = frame.color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const photo = renderImage(image, {
    rotation: options.rotation,
    flipX: options.flipX,
    flipY: options.flipY,
    crop: options.crop,
    width: px(format.photoWidth),
    height: px(format.photoHeight),
  });
  if (options.vintage) applyVintage(photo);

  const left = px((format.width - format.photoWidth) / 2);
  const top = px(format.top);
  ctx.drawImage(photo, left, top, px(format.photoWidth), px(format.photoHeight));
  // Contorno discreto: na foto impressa, a borda da imagem fica levemente marcada.
  ctx.strokeStyle = "rgb(0 0 0 / 0.12)";
  ctx.lineWidth = Math.max(1, dpi / 300);
  ctx.strokeRect(left, top, px(format.photoWidth), px(format.photoHeight));

  const caption = options.caption.trim();
  if (caption) {
    const bottomTop = format.top + format.photoHeight;
    const bottomHeight = format.height - bottomTop;
    const maxWidth = px(format.photoWidth);
    let size = px(Math.min(bottomHeight * 0.42, 9));
    ctx.font = CAPTION_FONT.replace("{size}", String(size));
    const measured = ctx.measureText(caption).width;
    if (measured > maxWidth) {
      size = Math.floor((size * maxWidth) / measured);
      ctx.font = CAPTION_FONT.replace("{size}", String(size));
    }
    ctx.fillStyle = frame.ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(caption, canvas.width / 2, px(bottomTop + bottomHeight / 2));
  }
  return canvas;
}

/** Tom quente, pretos esmaecidos e vinheta, como em filme instantâneo antigo. */
function applyVintage(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 22 + data[i] * 0.86 * 1.06;
    data[i + 1] = 20 + data[i + 1] * 0.86;
    data[i + 2] = 28 + data[i + 2] * 0.86 * 0.86;
  }
  ctx.putImageData(imageData, 0, 0);

  const { width, height } = canvas;
  const vignette = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.35, width / 2, height / 2, Math.hypot(width, height) / 2);
  vignette.addColorStop(0, "rgb(40 25 10 / 0)");
  vignette.addColorStop(1, "rgb(40 25 10 / 0.38)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

/** Maior quadro com a proporção `ratio` que cabe na imagem, em porcentagem (zoom 1). */
export function fullCrop({ width, height }: Size, ratio: number): Pick<CropRect, "width" | "height"> {
  const byHeight = ((height * ratio) / width) * 100;
  return byHeight <= 100 ? { width: byHeight, height: 100 } : { width: 100, height: (width / ratio / height) * 100 };
}

/** Quadro com o zoom pedido, mantendo o centro do quadro atual. */
export function zoomCrop(crop: CropRect, size: Size, ratio: number, zoom: number): CropRect {
  const full = fullCrop(size, ratio);
  const width = full.width / zoom;
  const height = full.height / zoom;
  return clampCrop({ x: crop.x + (crop.width - width) / 2, y: crop.y + (crop.height - height) / 2, width, height });
}

export function centeredCrop(size: Size, ratio: number, zoom = 1): CropRect {
  return zoomCrop({ x: 0, y: 0, width: 100, height: 100 }, size, ratio, zoom);
}

/** Mantém o quadro dentro da imagem. */
export function clampCrop(crop: CropRect): CropRect {
  return {
    ...crop,
    x: Math.min(Math.max(0, crop.x), 100 - crop.width),
    y: Math.min(Math.max(0, crop.y), 100 - crop.height),
  };
}

/** Polaroid pronta para a folha de impressão (JPG em 300 DPI). */
export interface SheetItem {
  id: number;
  format: PolaroidFormat;
  blob: Blob;
  /** URL da miniatura; liberar com `URL.revokeObjectURL` ao remover. */
  url: string;
}

export async function polaroidBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return encodeCanvas(canvas, "jpeg", 0.92);
}

/** A4 em milímetros, com margem segura para impressoras domésticas e espaço para o corte. */
const SHEET = { width: 210, height: 297, margin: 10, gap: 4 };

interface Placement {
  item: SheetItem;
  page: number;
  x: number;
  y: number;
}

/** Distribui as polaroids em linhas, da esquerda para a direita, abrindo novas páginas quando preciso. */
function layoutSheet(items: SheetItem[], fillLastPage: boolean): Placement[] {
  const areaWidth = SHEET.width - 2 * SHEET.margin;
  const areaHeight = SHEET.height - 2 * SHEET.margin;
  const placements: Placement[] = [];
  let page = 0;
  let x = 0;
  let y = 0;
  let rowHeight = 0;

  function place(item: SheetItem, allowNewPage: boolean): boolean {
    const { width, height } = POLAROID_FORMATS[item.format];
    let nx = x;
    let ny = y;
    let nRow = rowHeight;
    let nPage = page;
    if (nx > 0 && nx + width > areaWidth) {
      ny += nRow + SHEET.gap;
      nx = 0;
      nRow = 0;
    }
    if (ny + height > areaHeight) {
      if (!allowNewPage) return false;
      nPage += 1;
      nx = 0;
      ny = 0;
      nRow = 0;
    }
    placements.push({ item, page: nPage, x: nx, y: ny });
    page = nPage;
    x = nx + width + SHEET.gap;
    y = ny;
    rowHeight = Math.max(nRow, height);
    return true;
  }

  for (const item of items) place(item, true);
  const last = items.at(-1);
  if (fillLastPage && last) {
    while (place(last, false));
  }
  return placements;
}

/** Quantas polaroids de um formato cabem em uma folha A4. */
export function perSheet(format: PolaroidFormat): number {
  const sample: SheetItem = { id: 0, format, blob: new Blob(), url: "" };
  return layoutSheet([sample], true).length;
}

/** Gera o PDF A4 em tamanho real, com linhas de corte tracejadas em volta de cada polaroid. */
export async function buildSheetPdf(items: SheetItem[], fillLastPage: boolean): Promise<Blob> {
  const { PDFDocument, PageSizes, rgb } = await import("@cantoo/pdf-lib");
  const pt = (mm: number) => (mm * 72) / MM_PER_INCH;
  const doc = await PDFDocument.create();
  const embedded = new Map<number, Awaited<ReturnType<typeof doc.embedJpg>>>();
  const pages: ReturnType<typeof doc.addPage>[] = [];

  for (const { item, page, x, y } of layoutSheet(items, fillLastPage)) {
    while (pages.length <= page) pages.push(doc.addPage(PageSizes.A4));
    let image = embedded.get(item.id);
    if (!image) {
      image = await doc.embedJpg(new Uint8Array(await item.blob.arrayBuffer()));
      embedded.set(item.id, image);
    }
    const { width, height } = POLAROID_FORMATS[item.format];
    const box = {
      x: pt(SHEET.margin + x),
      y: pt(SHEET.height - SHEET.margin - y - height),
      width: pt(width),
      height: pt(height),
    };
    pages[page].drawImage(image, box);
    pages[page].drawRectangle({ ...box, borderColor: rgb(0.6, 0.6, 0.6), borderWidth: 0.5, borderDashArray: [3, 3] });
  }

  const bytes = await doc.save({ useObjectStreams: true });
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}
