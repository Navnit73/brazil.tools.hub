import type { BackgroundRemovalPipeline, ProgressInfo } from "@huggingface/transformers";
import { context2d, createCanvas } from "./render";

/** MODNet (Apache-2.0): recorte de pessoas, ~6,6 MB na versão quantizada. */
const PERSON_MODEL = "Xenova/modnet";

export type RgbColor = [number, number, number];

export interface SegmentProgress {
  stage: "download" | "process";
  /** 0–100, só durante o download. */
  percent?: number;
}

type ProgressListener = (progress: SegmentProgress) => void;

/** Quem está esperando o modelo: o download é um só, mesmo com várias chamadas ao mesmo tempo. */
const listeners = new Set<ProgressListener>();
let segmenterPromise: Promise<BackgroundRemovalPipeline> | null = null;

function loadSegmenter(): Promise<BackgroundRemovalPipeline> {
  segmenterPromise ??= (async () => {
    // Importação dinâmica: a biblioteca (e o onnxruntime) só é baixada quando alguém remove um fundo.
    const { pipeline } = await import("@huggingface/transformers");
    return pipeline("background-removal", PERSON_MODEL, {
      dtype: "q8",
      progress_callback: (info: ProgressInfo) => {
        if (info.status === "progress_total") {
          listeners.forEach((listener) => listener({ stage: "download", percent: info.progress }));
        }
      },
    });
  })().catch((error: unknown) => {
    // Permite tentar de novo (ex.: a conexão caiu durante o download).
    segmenterPromise = null;
    throw error;
  });
  return segmenterPromise;
}

/**
 * Recorta a pessoa da foto com IA. Devolve um novo canvas do mesmo tamanho,
 * com o fundo transparente (canal alfa = máscara do MODNet).
 */
export async function segmentPerson(source: HTMLCanvasElement, onProgress?: ProgressListener): Promise<HTMLCanvasElement> {
  if (onProgress) listeners.add(onProgress);
  try {
    let segmenter: BackgroundRemovalPipeline;
    try {
      segmenter = await loadSegmenter();
    } catch (cause) {
      console.error(cause);
      throw new Error("Não foi possível baixar o modelo de IA. Verifique a sua conexão e tente de novo.");
    }

    onProgress?.({ stage: "process" });
    try {
      const { RawImage } = await import("@huggingface/transformers");
      const output = await segmenter(RawImage.fromCanvas(source));
      const result = createCanvas(source.width, source.height);
      const ctx = context2d(result);
      ctx.drawImage(source, 0, 0);
      const pixels = ctx.getImageData(0, 0, result.width, result.height);
      const { data } = pixels;
      const matte = output.data;
      // Mantém a transparência que a imagem já tinha (PNG) e aplica a máscara por cima.
      for (let i = 3; i < data.length; i += 4) {
        data[i] = (data[i] * matte[i]) / 255;
      }
      ctx.putImageData(pixels, 0, 0);
      return result;
    } catch (cause) {
      console.error(cause);
      throw new Error("Não foi possível remover o fundo desta imagem. Tente uma foto menor ou outro navegador.");
    }
  } finally {
    if (onProgress) listeners.delete(onProgress);
  }
}

export interface RemoveColorOptions {
  /** 0–100: quanto a cor pode variar e ainda ser considerada fundo. */
  tolerance: number;
  /** `true`: só remove a cor conectada às bordas (preserva a mesma cor dentro do objeto). */
  fromEdges: boolean;
  /** Cor do fundo; se omitida, é estimada pelos cantos da imagem. */
  color?: RgbColor;
}

/** Maior distância possível entre duas cores RGB. */
const MAX_DISTANCE = Math.sqrt(3 * 255 ** 2);

/** Cor do fundo estimada pelos quatro cantos (mediana por canal, resiste a um canto diferente). */
export function sampleCornerColor(source: HTMLCanvasElement): RgbColor {
  const ctx = context2d(source);
  const { width, height } = source;
  const corners = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ].map(([x, y]) => ctx.getImageData(x, y, 1, 1).data);
  const median = (channel: number) => {
    const values = corners.map((pixel) => pixel[channel]).sort((a, b) => a - b);
    return Math.round((values[1] + values[2]) / 2);
  };
  return [median(0), median(1), median(2)];
}

/** Cor de um pixel da imagem (para o conta-gotas). */
export function pickColor(source: HTMLCanvasElement, x: number, y: number): RgbColor {
  const [r, g, b] = context2d(source).getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
  return [r, g, b];
}

/**
 * Remove um fundo de cor sólida (logos, produtos em fundo branco, prints).
 * Pixels próximos do limite ficam semitransparentes e a borda é suavizada em 1 px.
 */
export function removeColor(source: HTMLCanvasElement, { tolerance, fromEdges, color }: RemoveColorOptions): HTMLCanvasElement {
  const { width, height } = source;
  const result = createCanvas(width, height);
  const ctx = context2d(result);
  ctx.drawImage(source, 0, 0);
  const pixels = ctx.getImageData(0, 0, width, height);
  const { data } = pixels;
  const [r0, g0, b0] = color ?? sampleCornerColor(source);

  // Abaixo de `inner` o pixel some; entre `inner` e `outer` fica semitransparente.
  const outer = Math.max(1, (tolerance / 100) * MAX_DISTANCE);
  const inner = outer * 0.6;
  const count = width * height;
  /** 0 = fundo, 255 = objeto. */
  const mask = new Uint8ClampedArray(count).fill(255);

  const levelAt = (index: number) => {
    const offset = index * 4;
    const distance = Math.hypot(data[offset] - r0, data[offset + 1] - g0, data[offset + 2] - b0);
    if (distance >= outer) return 255;
    if (distance <= inner) return 0;
    return Math.round(((distance - inner) / (outer - inner)) * 255);
  };

  if (fromEdges) {
    // Preenchimento a partir das bordas: só o fundo conectado à borda é removido.
    const visited = new Uint8Array(count);
    const stack = new Int32Array(count);
    let top = 0;
    const push = (index: number) => {
      if (visited[index]) return;
      visited[index] = 1;
      const level = levelAt(index);
      if (level === 255) return;
      mask[index] = level;
      // A borda semitransparente não propaga: evita "vazar" para dentro do objeto.
      if (level === 0) stack[top++] = index;
    };
    for (let x = 0; x < width; x++) {
      push(x);
      push((height - 1) * width + x);
    }
    for (let y = 0; y < height; y++) {
      push(y * width);
      push(y * width + width - 1);
    }
    while (top > 0) {
      const index = stack[--top];
      const x = index % width;
      if (x > 0) push(index - 1);
      if (x < width - 1) push(index + 1);
      if (index >= width) push(index - width);
      if (index < count - width) push(index + width);
    }
  } else {
    for (let i = 0; i < count; i++) mask[i] = levelAt(i);
  }

  const soft = feather(mask, width, height);
  for (let i = 0; i < count; i++) {
    data[i * 4 + 3] = (data[i * 4 + 3] * Math.min(mask[i], soft[i])) / 255;
  }
  ctx.putImageData(pixels, 0, 0);
  return result;
}

/** Média 3×3 da máscara: suaviza a borda do recorte em 1 px. */
function feather(mask: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const output = new Uint8ClampedArray(mask.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let samples = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const row = y + dy;
        if (row < 0 || row >= height) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const column = x + dx;
          if (column < 0 || column >= width) continue;
          sum += mask[row * width + column];
          samples++;
        }
      }
      output[y * width + x] = sum / samples;
    }
  }
  return output;
}

/** Coloca a imagem recortada sobre um fundo sólido (ex.: branco para documentos). */
export function flattenOnColor(canvas: HTMLCanvasElement, color: string): HTMLCanvasElement {
  const output = createCanvas(canvas.width, canvas.height);
  const ctx = context2d(output);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, output.width, output.height);
  ctx.drawImage(canvas, 0, 0);
  return output;
}

export function rgbToHex([r, g, b]: RgbColor): string {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}
