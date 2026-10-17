import { context2d, createCanvas } from "./render";

export type SketchStyle = "pencil" | "color-pencil" | "outline" | "cartoon";

export interface SketchOptions {
  style: SketchStyle;
  /** 0–100: mais detalhe = traços mais finos e mais linhas (no cartoon, mais cores). */
  detail: number;
  /** 0–100: traço mais escuro (no cartoon, mais contornos). */
  intensity: number;
  /** 1–5: espessura das linhas nos estilos de contorno e cartoon. */
  thickness: number;
}

export const DEFAULT_SKETCH_OPTIONS: SketchOptions = { style: "pencil", detail: 60, intensity: 40, thickness: 2 };

/**
 * Lado de referência dos parâmetros: raios de desfoque e espessuras são
 * proporcionais ao tamanho da imagem, então a prévia reduzida e o arquivo
 * final em resolução cheia ficam com a mesma aparência.
 */
const REFERENCE_SIDE = 1000;

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/** Aplica o estilo de desenho e devolve um novo canvas do mesmo tamanho. */
export function applySketch(source: HTMLCanvasElement, options: SketchOptions): HTMLCanvasElement {
  const { width, height } = source;
  const output = createCanvas(width, height);
  const ctx = context2d(output);
  // Áreas transparentes viram papel branco.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0);

  const image = ctx.getImageData(0, 0, width, height);
  const scale = Math.max(width, height) / REFERENCE_SIDE;
  const run = { pencil, "color-pencil": colorPencil, outline, cartoon }[options.style];
  run(image, options, scale);
  ctx.putImageData(image, 0, 0);
  return output;
}

function luminance({ data, width, height }: ImageData): Float32Array {
  const lum = new Float32Array(width * height);
  for (let i = 0, p = 0; i < lum.length; i++, p += 4) {
    lum[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
  }
  return lum;
}

/** Desfoque de caixa separável; três passadas se aproximam de um desfoque gaussiano. */
function blur(values: Float32Array, width: number, height: number, radius: number, passes = 3): Float32Array {
  const r = Math.max(1, Math.round(radius));
  let current = values;
  const temp = new Float32Array(values.length);
  for (let pass = 0; pass < passes; pass++) {
    boxPass(current, temp, width, height, r, 1, width);
    // Na primeira passada não sobrescreve a entrada; depois reaproveita o mesmo buffer.
    const next = current === values ? new Float32Array(values.length) : current;
    boxPass(temp, next, height, width, r, width, 1);
    current = next;
  }
  return current;
}

/** Uma passada de média móvel ao longo de cada linha (`step` entre vizinhos, `stride` entre linhas). */
function boxPass(input: Float32Array, output: Float32Array, length: number, lines: number, r: number, step: number, stride: number) {
  const size = 2 * r + 1;
  for (let line = 0; line < lines; line++) {
    const base = line * stride;
    const at = (i: number) => input[base + Math.min(length - 1, Math.max(0, i)) * step];
    let sum = 0;
    for (let i = -r; i <= r; i++) sum += at(i);
    for (let i = 0; i < length; i++) {
      output[base + i * step] = sum / size;
      sum += at(i + r + 1) - at(i - r);
    }
  }
}

/** Esboço a lápis: cinza ÷ (negativo desfocado), a "subexposição de cores" dos editores de imagem. */
function pencilShade(image: ImageData, { detail, intensity }: SketchOptions, scale: number): Float32Array {
  const { width, height } = image;
  const lum = luminance(image);
  const inverted = new Float32Array(lum.length);
  for (let i = 0; i < lum.length; i++) inverted[i] = 255 - lum[i];
  const blurred = blur(inverted, width, height, lerp(24, 3, detail / 100) * scale);
  // Expoente > 1 escurece os traços sem sujar o papel branco.
  const gamma = lerp(1, 4, intensity / 100);
  const shade = new Float32Array(lum.length);
  for (let i = 0; i < lum.length; i++) {
    const dodge = blurred[i] >= 255 ? 255 : Math.min(255, (lum[i] * 255) / (255 - blurred[i]));
    shade[i] = 255 * Math.pow(dodge / 255, gamma);
  }
  return shade;
}

function pencil(image: ImageData, options: SketchOptions, scale: number) {
  const shade = pencilShade(image, options, scale);
  const { data } = image;
  for (let i = 0, p = 0; i < shade.length; i++, p += 4) {
    data[p] = data[p + 1] = data[p + 2] = shade[i];
  }
}

/** Lápis colorido: o esboço multiplicado pelas cores originais, clareadas como em papel. */
function colorPencil(image: ImageData, options: SketchOptions, scale: number) {
  const shade = pencilShade(image, options, scale);
  const { data } = image;
  for (let i = 0, p = 0; i < shade.length; i++, p += 4) {
    const s = shade[i] / 255;
    for (let c = 0; c < 3; c++) data[p + c] = (data[p + c] * 0.75 + 255 * 0.25) * s;
  }
}

/** Magnitude do gradiente (Sobel), de 0 a ~1442. */
function sobel(lum: Float32Array, width: number, height: number): Float32Array {
  const magnitude = new Float32Array(lum.length);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const tl = lum[i - width - 1], t = lum[i - width], tr = lum[i - width + 1];
      const l = lum[i - 1], r = lum[i + 1];
      const bl = lum[i + width - 1], b = lum[i + width], br = lum[i + width + 1];
      const gx = tr + 2 * r + br - tl - 2 * l - bl;
      const gy = bl + 2 * b + br - tl - 2 * t - tr;
      magnitude[i] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return magnitude;
}

/** Máscara de linhas (1 = linha), engrossada por dilatação quadrada de raio `radius`. */
function lineMask(edges: Float32Array, width: number, height: number, threshold: number, radius: number): Uint8Array {
  const mask = new Uint8Array(edges.length);
  for (let i = 0; i < edges.length; i++) mask[i] = edges[i] > threshold ? 1 : 0;
  if (radius < 1) return mask;

  const temp = new Uint8Array(mask.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let hit = 0;
      for (let k = Math.max(0, x - radius); k <= Math.min(width - 1, x + radius) && !hit; k++) hit = mask[y * width + k];
      temp[y * width + x] = hit;
    }
  }
  const result = new Uint8Array(mask.length);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let hit = 0;
      for (let k = Math.max(0, y - radius); k <= Math.min(height - 1, y + radius) && !hit; k++) hit = temp[k * width + x];
      result[y * width + x] = hit;
    }
  }
  return result;
}

/** Contornos pretos sobre fundo branco, prontos para colorir. */
function outline(image: ImageData, { detail, thickness }: SketchOptions, scale: number) {
  const { width, height, data } = image;
  // Suaviza antes para ignorar textura fina e ruído.
  const smooth = blur(luminance(image), width, height, lerp(4, 1, detail / 100) * scale, 2);
  const edges = sobel(smooth, width, height);
  const mask = lineMask(edges, width, height, lerp(140, 30, detail / 100), Math.round((thickness - 1) * scale * 0.75));
  for (let i = 0, p = 0; i < mask.length; i++, p += 4) {
    data[p] = data[p + 1] = data[p + 2] = mask[i] ? 0 : 255;
  }
}

/** Cartoon: cores suavizadas e reduzidas a poucos tons, com contornos escuros. */
function cartoon(image: ImageData, { detail, intensity, thickness }: SketchOptions, scale: number) {
  const { width, height, data } = image;
  const size = width * height;
  const radius = 2 * scale;
  const channels = [0, 1, 2].map((c) => {
    const values = new Float32Array(size);
    for (let i = 0; i < size; i++) values[i] = data[i * 4 + c];
    return blur(values, width, height, radius, 2);
  });

  const levels = Math.round(lerp(3, 10, detail / 100));
  const step = 255 / (levels - 1);
  const lum = new Float32Array(size);
  for (let i = 0; i < size; i++) lum[i] = 0.299 * channels[0][i] + 0.587 * channels[1][i] + 0.114 * channels[2][i];
  const edges = sobel(lum, width, height);
  const mask = lineMask(edges, width, height, lerp(260, 60, intensity / 100), Math.round((thickness - 1) * scale * 0.75));

  for (let i = 0, p = 0; i < size; i++, p += 4) {
    if (mask[i]) {
      data[p] = data[p + 1] = data[p + 2] = 20;
      continue;
    }
    for (let c = 0; c < 3; c++) data[p + c] = Math.round(channels[c][i] / step) * step;
  }
}
