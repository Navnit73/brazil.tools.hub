import { renameFile } from "@/lib/file";
import { decodeImage, type DecodedImage } from "./decode";
import { encodeCanvas } from "./encode";
import { IMAGE_FORMATS } from "./formats";
import type { ProcessedImage } from "./process";
import { resolveOutputFormat } from "./process";
import { context2d, renderImage } from "./render";

export type WatermarkKind = "text" | "logo";

/** Linha e coluna da grade 3×3 (0 = topo/esquerda, 2 = base/direita). */
export interface WatermarkPosition {
  row: 0 | 1 | 2;
  col: 0 | 1 | 2;
}

export interface WatermarkOptions {
  kind: WatermarkKind;
  text: string;
  color: string;
  /** Altura do texto ou largura do logo, em % da largura da imagem: fica proporcional em fotos de tamanhos diferentes. */
  size: number;
  /** 0–1. */
  opacity: number;
  /** Graus, sentido horário. */
  rotation: number;
  position: WatermarkPosition;
  /** Repete a marca em mosaico por toda a imagem. */
  tile: boolean;
  /** Distância da borda, em % do menor lado da imagem. */
  margin: number;
  logo: DecodedImage | null;
}

/** A marca tem algo para desenhar (texto não vazio ou logo carregado). */
export function hasWatermark(options: WatermarkOptions): boolean {
  return options.kind === "text" ? options.text.trim().length > 0 : options.logo !== null;
}

interface Mark {
  width: number;
  height: number;
  /** Desenha a marca centralizada na origem do contexto. */
  draw: (ctx: CanvasRenderingContext2D) => void;
}

function createMark(ctx: CanvasRenderingContext2D, canvasWidth: number, options: WatermarkOptions): Mark | null {
  if (!hasWatermark(options)) return null;

  if (options.kind === "logo" && options.logo) {
    const { logo } = options;
    const width = Math.max(1, (options.size / 100) * canvasWidth);
    const height = (width * logo.height) / logo.width;
    return { width, height, draw: (c) => c.drawImage(logo.source, -width / 2, -height / 2, width, height) };
  }

  const text = options.text.trim();
  const fontSize = Math.max(6, (options.size / 100) * canvasWidth);
  const font = `600 ${fontSize}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  ctx.font = font;
  const width = ctx.measureText(text).width;
  const height = fontSize * 1.2;
  return {
    width,
    height,
    draw: (c) => {
      c.font = font;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillStyle = options.color;
      // Sombra discreta: mantém a marca legível em fundos claros e escuros.
      c.shadowColor = isLight(options.color) ? "rgba(0, 0, 0, 0.45)" : "rgba(255, 255, 255, 0.45)";
      c.shadowBlur = fontSize * 0.08;
      c.fillText(text, 0, 0);
    },
  };
}

/** Desenha a marca d'água sobre o canvas (mesma função para prévia e arquivo final). */
export function drawWatermark(canvas: HTMLCanvasElement, options: WatermarkOptions): void {
  const ctx = context2d(canvas);
  const mark = createMark(ctx, canvas.width, options);
  if (!mark) return;

  const { width: W, height: H } = canvas;
  const angle = (options.rotation * Math.PI) / 180;
  ctx.save();
  ctx.globalAlpha = options.opacity;

  if (options.tile) {
    // Grade girada em torno do centro, grande o bastante para cobrir os cantos.
    const diagonal = Math.hypot(W, H);
    const stepX = mark.width + Math.max(mark.width * 0.6, mark.height * 2);
    const stepY = mark.height * 3.5;
    ctx.translate(W / 2, H / 2);
    ctx.rotate(angle);
    let row = 0;
    for (let y = -diagonal / 2; y <= diagonal / 2 + stepY; y += stepY, row++) {
      const offset = row % 2 === 0 ? 0 : stepX / 2;
      for (let x = -diagonal / 2 - offset; x <= diagonal / 2 + stepX; x += stepX) {
        ctx.save();
        ctx.translate(x, y);
        mark.draw(ctx);
        ctx.restore();
      }
    }
  } else {
    const margin = (options.margin / 100) * Math.min(W, H);
    const { row, col } = options.position;
    const x = [margin + mark.width / 2, W / 2, W - margin - mark.width / 2][col];
    const y = [margin + mark.height / 2, H / 2, H - margin - mark.height / 2][row];
    ctx.translate(x, y);
    ctx.rotate(angle);
    mark.draw(ctx);
  }

  ctx.restore();
}

/** Aplica a marca na resolução original e salva no mesmo formato do arquivo (GIF e BMP viram PNG/JPG). */
export async function watermarkImage(file: File, options: WatermarkOptions, quality: number): Promise<ProcessedImage> {
  const image = await decodeImage(file);
  try {
    const canvas = renderImage(image);
    drawWatermark(canvas, options);
    const format = resolveOutputFormat(file, "original");
    const blob = await encodeCanvas(canvas, format, quality);
    return {
      blob,
      fileName: renameFile(file.name, IMAGE_FORMATS[format].extension, "-marca-dagua"),
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    image.release();
  }
}

/** Luminância relativa aproximada de uma cor `#rrggbb`. */
function isLight(hex: string): boolean {
  const value = Number.parseInt(hex.slice(1, 7), 16);
  if (Number.isNaN(value)) return true;
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}
