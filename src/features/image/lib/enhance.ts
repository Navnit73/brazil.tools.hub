import { context2d, createCanvas, fitToCanvasLimit, resample } from "./render";

/** Ajustes de melhoria. Raios em pixels da imagem original. */
export interface EnhanceSettings {
  /** Estica o histograma de cada canal (contraste e cores). */
  autoLevels: boolean;
  /** 0–100: intensidade da máscara de nitidez. */
  sharpness: number;
  /** Raio da nitidez, em px da foto original. */
  radius: number;
  /** 0–100: suavização que preserva bordas. */
  denoise: number;
  /** Ampliação final. */
  scale: 1 | 2 | 4;
}

export const NO_ENHANCE: EnhanceSettings = { autoLevels: false, sharpness: 0, radius: 1, denoise: 0, scale: 1 };

/** Preset de "Melhorar automaticamente": fotos pequenas também são ampliadas. */
export function autoEnhanceSettings({ width, height }: { width: number; height: number }): EnhanceSettings {
  return { autoLevels: true, sharpness: 45, radius: 1, denoise: 20, scale: Math.max(width, height) < 1200 ? 2 : 1 };
}

/** Pontos de corte por canal (R, G, B) para o ajuste automático de níveis. */
export interface Levels {
  low: [number, number, number];
  high: [number, number, number];
}

/** Ignora 0,5% dos pixels mais escuros e mais claros, para não reagir a pixels isolados. */
const CLIP = 0.005;
/** Abaixo dessa faixa o canal já é quase uniforme: esticar só amplificaria ruído. */
const MIN_RANGE = 32;
/** Diferenças menores que isso não são realçadas (evita reforçar granulação). */
const SHARPEN_THRESHOLD = 2;

/** Calcula os níveis a partir de uma versão reduzida da foto inteira. */
export function computeLevels(canvas: HTMLCanvasElement): Levels {
  const { data } = readPixels(canvas);
  const histograms = [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)];
  for (let i = 0; i < data.length; i += 4) {
    histograms[0][data[i]]++;
    histograms[1][data[i + 1]]++;
    histograms[2][data[i + 2]]++;
  }
  const total = data.length / 4;
  const low: Levels["low"] = [0, 0, 0];
  const high: Levels["high"] = [255, 255, 255];
  histograms.forEach((histogram, channel) => {
    let lo = percentile(histogram, total * CLIP);
    let hi = 255 - percentile(histogram.slice().reverse(), total * CLIP);
    if (hi - lo < MIN_RANGE) {
      lo = 0;
      hi = 255;
    }
    low[channel] = lo;
    high[channel] = hi;
  });
  return { low, high };
}

function percentile(histogram: Uint32Array, count: number): number {
  let sum = 0;
  for (let value = 0; value < 256; value++) {
    sum += histogram[value];
    if (sum > count) return value;
  }
  return 255;
}

export interface EnhanceOptions {
  /** Pixels de `source` por pixel da foto original (prévia reduzida < 1). */
  unit: number;
  /** Aplica a ampliação de `settings.scale` (desligado na prévia da imagem inteira). */
  upscale: boolean;
  levels: Levels;
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Aplica, nesta ordem: redução de ruído → níveis automáticos → ampliação → nitidez.
 * Pausa entre as etapas para a interface continuar respondendo.
 */
export async function enhanceCanvas(source: HTMLCanvasElement, settings: EnhanceSettings, options: EnhanceOptions): Promise<HTMLCanvasElement> {
  let canvas = createCanvas(source.width, source.height);
  const ctx = context2d(canvas);
  ctx.drawImage(source, 0, 0);

  if (settings.denoise > 0 || settings.autoLevels) {
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (settings.denoise > 0) {
      denoise(image, settings.denoise / 100, options.unit);
      await tick();
    }
    if (settings.autoLevels) applyLevels(image, options.levels);
    ctx.putImageData(image, 0, 0);
    await tick();
  }

  let unit = options.unit;
  if (options.upscale && settings.scale > 1) {
    const target = fitToCanvasLimit({ width: canvas.width * settings.scale, height: canvas.height * settings.scale });
    unit *= target.width / canvas.width;
    canvas = resample(canvas, target.width, target.height);
    await tick();
  }

  if (settings.sharpness > 0) {
    const sharpCtx = context2d(canvas);
    const image = sharpCtx.getImageData(0, 0, canvas.width, canvas.height);
    sharpen(image, (settings.sharpness / 100) * 2, settings.radius * unit);
    sharpCtx.putImageData(image, 0, 0);
  }
  return canvas;
}

function readPixels(canvas: HTMLCanvasElement): ImageData {
  return canvas.getContext("2d", { willReadFrequently: true })!.getImageData(0, 0, canvas.width, canvas.height);
}

function applyLevels({ data }: ImageData, { low, high }: Levels): void {
  const tables = [0, 1, 2].map((channel) => {
    const table = new Uint8ClampedArray(256);
    const range = high[channel] - low[channel];
    for (let value = 0; value < 256; value++) table[value] = ((value - low[channel]) / range) * 255;
    return table;
  });
  for (let i = 0; i < data.length; i += 4) {
    data[i] = tables[0][data[i]];
    data[i + 1] = tables[1][data[i + 1]];
    data[i + 2] = tables[2][data[i + 2]];
  }
}

/**
 * Suaviza cada canal só onde a diferença para a vizinhança é pequena (ruído),
 * preservando bordas e texturas fortes — um filtro de superfície simplificado.
 */
function denoise(image: ImageData, strength: number, unit: number): void {
  const { data, width, height } = image;
  const sigma = Math.max(0.5, (0.6 + strength * 1.6) * unit);
  const tolerance = 6 + strength * 20;
  const falloff = 2 * tolerance * tolerance;
  const mix = Math.min(1, 0.4 + strength);
  const channel = new Float32Array(width * height);
  for (let c = 0; c < 3; c++) {
    for (let p = 0, i = c; p < channel.length; p++, i += 4) channel[p] = data[i];
    const blurred = blur(channel, width, height, sigma);
    for (let p = 0, i = c; p < channel.length; p++, i += 4) {
      const diff = blurred[p] - channel[p];
      data[i] = channel[p] + diff * Math.exp(-(diff * diff) / falloff) * mix;
    }
  }
}

/** Máscara de nitidez na luminância: realça bordas sem criar halos coloridos. */
function sharpen(image: ImageData, amount: number, sigma: number): void {
  const { data, width, height } = image;
  const luma = new Float32Array(width * height);
  for (let p = 0, i = 0; p < luma.length; p++, i += 4) luma[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  const blurred = blur(luma, width, height, Math.max(0.5, sigma));
  for (let p = 0, i = 0; p < luma.length; p++, i += 4) {
    const detail = luma[p] - blurred[p];
    if (Math.abs(detail) < SHARPEN_THRESHOLD) continue;
    const delta = amount * (detail - Math.sign(detail) * SHARPEN_THRESHOLD);
    data[i] += delta;
    data[i + 1] += delta;
    data[i + 2] += delta;
  }
}

/** Desfoque gaussiano: kernel exato para raios pequenos, três caixas para os grandes (custo constante). */
function blur(src: Float32Array, width: number, height: number, sigma: number): Float32Array {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  if (sigma <= 2.5) {
    const kernel = gaussianKernel(sigma);
    convolve(src, tmp, width, height, kernel, 1, width);
    convolve(tmp, out, height, width, kernel, width, 1);
    return out;
  }
  out.set(src);
  for (const size of boxSizes(sigma)) {
    const radius = (size - 1) / 2;
    box(out, tmp, width, height, radius, 1, width);
    box(tmp, out, height, width, radius, width, 1);
  }
  return out;
}

function gaussianKernel(sigma: number): Float32Array {
  const radius = Math.ceil(sigma * 3);
  const kernel = new Float32Array(radius * 2 + 1);
  let sum = 0;
  for (let i = -radius; i <= radius; i++) {
    kernel[i + radius] = Math.exp(-(i * i) / (2 * sigma * sigma));
    sum += kernel[i + radius];
  }
  for (let i = 0; i < kernel.length; i++) kernel[i] /= sum;
  return kernel;
}

/**
 * Convolução 1D ao longo de linhas com `length` pixels separados por `step`;
 * `lineStep` pula de uma linha para a próxima. Bordas repetem o último pixel.
 */
function convolve(src: Float32Array, dst: Float32Array, length: number, lines: number, kernel: Float32Array, step: number, lineStep: number): void {
  const radius = (kernel.length - 1) / 2;
  for (let line = 0; line < lines; line++) {
    const start = line * lineStep;
    for (let x = 0; x < length; x++) {
      let acc = 0;
      for (let k = -radius; k <= radius; k++) {
        const xi = x + k < 0 ? 0 : x + k >= length ? length - 1 : x + k;
        acc += src[start + xi * step] * kernel[k + radius];
      }
      dst[start + x * step] = acc;
    }
  }
}

/** Média móvel 1D (mesma convenção de `convolve`). */
function box(src: Float32Array, dst: Float32Array, length: number, lines: number, radius: number, step: number, lineStep: number): void {
  const norm = 1 / (radius * 2 + 1);
  const last = length - 1;
  for (let line = 0; line < lines; line++) {
    const start = line * lineStep;
    let acc = src[start] * (radius + 1);
    for (let i = 1; i <= radius; i++) acc += src[start + Math.min(i, last) * step];
    for (let x = 0; x < length; x++) {
      dst[start + x * step] = acc * norm;
      acc += src[start + Math.min(x + radius + 1, last) * step] - src[start + Math.max(x - radius, 0) * step];
    }
  }
}

/** Tamanhos de três caixas que, aplicadas em sequência, aproximam um gaussiano de `sigma`. */
function boxSizes(sigma: number, passes = 3): number[] {
  const ideal = Math.sqrt((12 * sigma * sigma) / passes + 1);
  let lower = Math.floor(ideal);
  if (lower % 2 === 0) lower--;
  const upper = lower + 2;
  const count = Math.round((12 * sigma * sigma - passes * lower * lower - 4 * passes * lower - 3 * passes) / (-4 * lower - 4));
  return Array.from({ length: passes }, (_, i) => (i < count ? lower : upper));
}
