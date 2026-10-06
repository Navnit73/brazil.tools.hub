import { IMAGE_FORMATS, type ImageFormat } from "./formats";
import { context2d, createCanvas } from "./render";
import { encodeAvif, encodeWebp } from "./wasm-encoders";

/** Lembra quais formatos o navegador codifica nativamente (evita testar de novo). */
const nativeSupport = new Map<ImageFormat, boolean>();

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
}

/** Formatos sem transparência (JPG) ganham fundo branco em vez de preto. */
function flatten(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const output = createCanvas(canvas.width, canvas.height);
  const ctx = context2d(output);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, output.width, output.height);
  ctx.drawImage(canvas, 0, 0);
  return output;
}

/**
 * Codificadores WebAssembly (Squoosh/jSquash), baixados só quando o navegador
 * não gera o formato sozinho — ex.: AVIF na maioria dos navegadores, WebP no Safari.
 */
async function encodeWithWasm(canvas: HTMLCanvasElement, format: ImageFormat, quality: number): Promise<Blob> {
  const imageData = canvas.getContext("2d", { willReadFrequently: true })!.getImageData(0, 0, canvas.width, canvas.height);
  const q = Math.round(quality * 100);
  let buffer: ArrayBuffer;
  if (format === "avif") {
    buffer = await encodeAvif(imageData, q);
  } else if (format === "webp") {
    buffer = await encodeWebp(imageData, q);
  } else {
    throw new Error(`Seu navegador não consegue gerar imagens ${IMAGE_FORMATS[format].label}.`);
  }
  return new Blob([buffer], { type: IMAGE_FORMATS[format].mime });
}

/**
 * Gera o arquivo final no formato pedido.
 * @param quality 0–1; ignorado em formatos sem perda (PNG).
 */
export async function encodeCanvas(canvas: HTMLCanvasElement, format: ImageFormat, quality = 0.9): Promise<Blob> {
  const info = IMAGE_FORMATS[format];
  const source = info.transparency ? canvas : flatten(canvas);

  if (nativeSupport.get(format) !== false) {
    const blob = await canvasToBlob(source, info.mime, quality);
    // Navegadores sem suporte devolvem PNG silenciosamente em vez do formato pedido.
    if (blob?.type === info.mime) {
      nativeSupport.set(format, true);
      return blob;
    }
    // `null` indica falta de memória, não falta de suporte: não memoriza.
    if (blob) nativeSupport.set(format, false);
  }

  try {
    return await encodeWithWasm(source, format, quality);
  } catch (error) {
    console.error(error);
    throw new Error(`Não foi possível gerar ${info.label} neste navegador. Tente outro formato.`);
  }
}
