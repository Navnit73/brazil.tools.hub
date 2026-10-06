import { renameFile } from "@/lib/file";
import { decodeImage, type DecodedImage } from "./decode";
import { encodeCanvas } from "./encode";
import { IMAGE_FORMATS, formatFromMime, type ImageFormat } from "./formats";
import { fitWithin, renderImage } from "./render";

export interface ProcessedImage {
  blob: Blob;
  fileName: string;
  width: number;
  height: number;
  /** O resultado não ficou menor, então o arquivo original foi mantido. */
  keptOriginal?: boolean;
}

async function withDecoded<T>(file: File, run: (image: DecodedImage) => Promise<T>): Promise<T> {
  const image = await decodeImage(file);
  try {
    return await run(image);
  } finally {
    image.release();
  }
}

export interface ConvertOptions {
  format: ImageFormat;
  /** 0–1, usado em formatos com perda. */
  quality: number;
}

export function convertImage(file: File, { format, quality }: ConvertOptions): Promise<ProcessedImage> {
  return withDecoded(file, async (image) => {
    const canvas = renderImage(image);
    const blob = await encodeCanvas(canvas, format, quality);
    return {
      blob,
      fileName: renameFile(file.name, IMAGE_FORMATS[format].extension),
      width: canvas.width,
      height: canvas.height,
    };
  });
}

export interface CompressOptions {
  /** `"original"` mantém o formato do arquivo (GIF e BMP viram JPG/PNG). */
  format: ImageFormat | "original";
  /** 0–1. Ignorado quando há `targetBytes`. */
  quality: number;
  /** Limite do maior lado, em pixels. */
  maxSide?: number;
  /** Tamanho máximo desejado; a qualidade é ajustada automaticamente. */
  targetBytes?: number;
}

const MIN_QUALITY = 0.3;
const MAX_QUALITY = 0.95;
const SEARCH_STEPS = 6;
const MAX_DOWNSCALES = 5;

export function resolveOutputFormat(file: File, format: CompressOptions["format"]): ImageFormat {
  if (format !== "original") return format;
  return formatFromMime(file.type) ?? (file.type === "image/gif" ? "png" : "jpeg");
}

export function compressImage(file: File, options: CompressOptions): Promise<ProcessedImage> {
  return withDecoded(file, async (image) => {
    const format = resolveOutputFormat(file, options.format);
    const lossy = IMAGE_FORMATS[format].lossy;
    let size = options.maxSide ? fitWithin(image, options.maxSide) : { width: image.width, height: image.height };

    let canvas = renderImage(image, size);
    let blob: Blob;

    if (!options.targetBytes) {
      blob = await encodeCanvas(canvas, format, options.quality);
    } else {
      const target = options.targetBytes;
      blob = await encodeCanvas(canvas, format, lossy ? MAX_QUALITY : 1);
      // Reduz a qualidade (busca binária) e, se não bastar, as dimensões.
      for (let attempt = 0; blob.size > target && attempt <= MAX_DOWNSCALES; attempt++) {
        if (attempt > 0) {
          size = { width: Math.max(1, Math.round(size.width * 0.8)), height: Math.max(1, Math.round(size.height * 0.8)) };
          canvas = renderImage(image, size);
        }
        if (!lossy) {
          blob = await encodeCanvas(canvas, format);
          continue;
        }
        let low = MIN_QUALITY;
        let high = MAX_QUALITY;
        let best: Blob | null = null;
        // O AVIF em WebAssembly é lento: menos tentativas.
        const steps = format === "avif" ? 4 : SEARCH_STEPS;
        for (let step = 0; step < steps; step++) {
          const quality = (low + high) / 2;
          const candidate = await encodeCanvas(canvas, format, quality);
          if (candidate.size <= target) {
            best = candidate;
            low = quality;
          } else {
            high = quality;
          }
        }
        blob = best ?? (await encodeCanvas(canvas, format, MIN_QUALITY));
      }
    }

    const sameFormat = file.type === IMAGE_FORMATS[format].mime;
    const sameSize = canvas.width === image.width && canvas.height === image.height;
    if (blob.size >= file.size && sameFormat && sameSize) {
      return { blob: file, fileName: file.name, width: image.width, height: image.height, keptOriginal: true };
    }

    return {
      blob,
      fileName: renameFile(file.name, IMAGE_FORMATS[format].extension, "-comprimida"),
      width: canvas.width,
      height: canvas.height,
    };
  });
}
