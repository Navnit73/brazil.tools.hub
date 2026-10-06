import { applyAdjustments, type Adjustments } from "./adjustments";
import type { DecodedImage } from "./decode";

export type Rotation = 0 | 90 | 180 | 270;

/** Área de corte em porcentagem (0–100) da imagem já girada/espelhada. */
export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RenderOptions {
  rotation?: Rotation;
  flipX?: boolean;
  flipY?: boolean;
  crop?: CropRect | null;
  /** Tamanho final em pixels; se omitido, usa o tamanho da área cortada. */
  width?: number;
  height?: number;
  adjustments?: Adjustments;
}

export interface Size {
  width: number;
  height: number;
}

/**
 * Maior área de canvas segura em todos os navegadores (limite do Safari no iOS).
 * Imagens maiores são reduzidas proporcionalmente.
 */
export const MAX_CANVAS_PIXELS = 4096 * 4096;

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

export function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Seu navegador não permitiu processar a imagem (canvas indisponível).");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return ctx;
}

export function orientedSize(width: number, height: number, rotation: Rotation = 0): Size {
  return rotation % 180 === 0 ? { width, height } : { width: height, height: width };
}

/** Converte a área de corte em porcentagem para pixels inteiros dentro da imagem. */
export function cropToPixels(crop: CropRect | null | undefined, size: Size) {
  if (!crop) return { x: 0, y: 0, ...size };
  const x = Math.round((crop.x / 100) * size.width);
  const y = Math.round((crop.y / 100) * size.height);
  return {
    x,
    y,
    width: Math.max(1, Math.min(size.width - x, Math.round((crop.width / 100) * size.width))),
    height: Math.max(1, Math.min(size.height - y, Math.round((crop.height / 100) * size.height))),
  };
}

/** Reduz o tamanho para caber no limite de pixels do canvas, mantendo a proporção. */
export function fitToCanvasLimit({ width, height }: Size): Size {
  const area = width * height;
  if (area <= MAX_CANVAS_PIXELS) return { width, height };
  const scale = Math.sqrt(MAX_CANVAS_PIXELS / area);
  return { width: Math.floor(width * scale), height: Math.floor(height * scale) };
}

/** Escala para que o maior lado não passe de `maxSide`. */
export function fitWithin({ width, height }: Size, maxSide: number): Size {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/**
 * Redimensiona reduzindo pela metade em etapas: uma única redução grande
 * gera serrilhado em vários navegadores, mesmo com `imageSmoothingQuality: "high"`.
 */
export function resample(source: HTMLCanvasElement, width: number, height: number): HTMLCanvasElement {
  let current = source;
  while (current.width / 2 >= width && current.height / 2 >= height) {
    const half = createCanvas(current.width / 2, current.height / 2);
    context2d(half).drawImage(current, 0, 0, half.width, half.height);
    current = half;
  }
  if (current.width === Math.round(width) && current.height === Math.round(height)) return current;
  const output = createCanvas(width, height);
  context2d(output).drawImage(current, 0, 0, output.width, output.height);
  return output;
}

/** Aplica, nesta ordem: giro/espelhamento → corte → redimensionamento → ajustes de cor. */
export function renderImage(image: DecodedImage, options: RenderOptions = {}): HTMLCanvasElement {
  const { rotation = 0, flipX = false, flipY = false, crop, adjustments } = options;
  const oriented = orientedSize(image.width, image.height, rotation);
  const area = cropToPixels(crop, oriented);

  // Etapa 1: recorte na resolução original (ou reduzido, se passar do limite do canvas).
  const stage = fitToCanvasLimit({ width: area.width, height: area.height });
  const scale = stage.width / area.width;
  const canvas = createCanvas(stage.width, stage.height);
  const ctx = context2d(canvas);
  ctx.scale(scale, scale);
  ctx.translate(-area.x, -area.y);
  ctx.translate(oriented.width / 2, oriented.height / 2);
  // Espelhar antes de girar no contexto = espelhar na orientação que o usuário vê.
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(image.source, -image.width / 2, -image.height / 2, image.width, image.height);

  // Etapa 2: tamanho final.
  const target = fitToCanvasLimit({
    width: options.width ?? area.width,
    height: options.height ?? area.height,
  });
  const output = resample(canvas, target.width, target.height);

  // Etapa 3: brilho, contraste e saturação.
  if (adjustments) applyAdjustments(output, adjustments);
  return output;
}
