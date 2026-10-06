/**
 * Compressão de PDF no navegador: recomprime as fotos (JPEG) embutidas com menor
 * qualidade e resolução, e regrava o arquivo com object streams. Texto e desenhos
 * vetoriais não mudam: continuam nítidos e selecionáveis.
 */
import { PDFArray, PDFDict, PDFName, PDFNumber, PDFRawStream, PDFStream, type PDFObject } from "@cantoo/pdf-lib";
import { loadPdf, savePdf } from "./document";

export type CompressionLevel = "low" | "recommended" | "high";

export const COMPRESSION_LEVELS: Record<CompressionLevel, { quality: number; maxSide: number }> = {
  low: { quality: 0.8, maxSide: 2400 },
  recommended: { quality: 0.65, maxSide: 1600 },
  high: { quality: 0.45, maxSide: 1100 },
};

/** Imagens menores que isso quase não pesam; recomprimir só perderia qualidade. */
const MIN_IMAGE_BYTES = 16 * 1024;

export interface CompressResult {
  blob: Blob;
  /** O original já era menor: devolvemos o próprio arquivo. */
  keptOriginal: boolean;
  imagesFound: number;
  imagesCompressed: number;
}

export async function compressPdf(
  file: File,
  level: CompressionLevel,
  onProgress?: (done: number, total: number) => void,
  cancelled?: () => boolean,
): Promise<CompressResult> {
  const doc = await loadPdf(file);
  const { quality, maxSide } = COMPRESSION_LEVELS[level];

  const images = doc.context
    .enumerateIndirectObjects()
    .flatMap(([, object]) => (object instanceof PDFRawStream && isRecompressibleJpeg(object) ? [object] : []));

  let compressed = 0;
  onProgress?.(0, images.length);
  for (const [index, image] of images.entries()) {
    if (cancelled?.()) break;
    if (await recompress(image, quality, maxSide)) compressed++;
    onProgress?.(index + 1, images.length);
  }

  const blob = await savePdf(doc);
  const keptOriginal = blob.size >= file.size;
  return { blob: keptOriginal ? file : blob, keptOriginal, imagesFound: images.length, imagesCompressed: compressed };
}

function isRecompressibleJpeg(stream: PDFRawStream): boolean {
  const { dict } = stream;
  if (dict.lookup(PDFName.of("Subtype")) !== PDFName.of("Image")) return false;
  if (stream.contents.length < MIN_IMAGE_BYTES) return false;
  // Arrays de decodificação e máscaras mudariam o significado dos pixels.
  if (dict.has(PDFName.of("Decode")) || dict.has(PDFName.of("ImageMask"))) return false;

  const filter = dict.lookup(PDFName.of("Filter"));
  const onlyDct =
    filter === PDFName.of("DCTDecode") ||
    (filter instanceof PDFArray && filter.size() === 1 && filter.lookup(0) === PDFName.of("DCTDecode"));
  if (!onlyDct) return false;

  // CMYK e espaços de cor especiais não sobrevivem bem à ida e volta pelo canvas (que é RGB).
  const components = colorComponents(dict.lookup(PDFName.of("ColorSpace")));
  return components === 1 || components === 3;
}

function colorComponents(colorSpace: PDFObject | undefined): number | null {
  if (colorSpace === PDFName.of("DeviceRGB") || colorSpace === PDFName.of("CalRGB")) return 3;
  if (colorSpace === PDFName.of("DeviceGray") || colorSpace === PDFName.of("CalGray")) return 1;
  if (colorSpace instanceof PDFArray && colorSpace.lookup(0) === PDFName.of("ICCBased")) {
    const profile = colorSpace.lookup(1);
    const dict = profile instanceof PDFStream ? profile.dict : profile instanceof PDFDict ? profile : null;
    const n = dict?.lookup(PDFName.of("N"));
    return n instanceof PDFNumber ? n.asNumber() : null;
  }
  return null;
}

let canvas: HTMLCanvasElement | null = null;

/** Recomprime uma imagem; só substitui se o resultado ficar ao menos 10% menor. */
async function recompress(image: PDFRawStream, quality: number, maxSide: number): Promise<boolean> {
  let bitmap: ImageBitmap;
  try {
    // "none": imagens de PDF ignoram a orientação EXIF que o JPEG possa ter.
    bitmap = await createImageBitmap(new Blob([image.contents as BlobPart], { type: "image/jpeg" }), { imageOrientation: "none" });
  } catch {
    return false;
  }

  try {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    canvas ??= document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d")!;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas!.toBlob(resolve, "image/jpeg", quality));
    if (!blob || blob.size > image.contents.length * 0.9) return false;

    const { dict } = image;
    dict.set(PDFName.of("Width"), PDFNumber.of(width));
    dict.set(PDFName.of("Height"), PDFNumber.of(height));
    dict.set(PDFName.of("BitsPerComponent"), PDFNumber.of(8));
    dict.set(PDFName.of("ColorSpace"), PDFName.of("DeviceRGB"));
    dict.set(PDFName.of("Filter"), PDFName.of("DCTDecode"));
    dict.delete(PDFName.of("DecodeParms"));
    image.updateContents(new Uint8Array(await blob.arrayBuffer()));
    return true;
  } finally {
    bitmap.close();
    if (canvas) canvas.width = canvas.height = 0;
  }
}
