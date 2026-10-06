import { MAX_INPUT_BYTES } from "./formats";

export interface DecodedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  /** Libera a memória da imagem decodificada. */
  release: () => void;
}

export class ImageError extends Error {}

/** Lê um arquivo de imagem já com a orientação EXIF aplicada. */
export async function decodeImage(file: File): Promise<DecodedImage> {
  if (file.size > MAX_INPUT_BYTES) {
    throw new ImageError("O arquivo passa de 50 MB. Escolha uma imagem menor.");
  }

  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
    } catch {
      // Alguns navegadores só decodificam certos formatos via <img>; tenta abaixo.
    }
  }

  const url = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = "async";
  image.src = url;
  try {
    await image.decode();
  } catch {
    URL.revokeObjectURL(url);
    throw new ImageError("Não foi possível abrir esta imagem. Ela pode estar corrompida ou em um formato que seu navegador não suporta.");
  }
  return {
    source: image,
    width: image.naturalWidth,
    height: image.naturalHeight,
    release: () => URL.revokeObjectURL(url),
  };
}
