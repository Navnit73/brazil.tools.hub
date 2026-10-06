export type ImageFormat = "jpeg" | "png" | "webp" | "avif";

export interface ImageFormatInfo {
  label: string;
  mime: string;
  extension: string;
  /** Aceita controle de qualidade (compressão com perda). */
  lossy: boolean;
  transparency: boolean;
}

export const IMAGE_FORMATS: Record<ImageFormat, ImageFormatInfo> = {
  jpeg: { label: "JPG", mime: "image/jpeg", extension: "jpg", lossy: true, transparency: false },
  png: { label: "PNG", mime: "image/png", extension: "png", lossy: false, transparency: true },
  webp: { label: "WebP", mime: "image/webp", extension: "webp", lossy: true, transparency: true },
  avif: { label: "AVIF", mime: "image/avif", extension: "avif", lossy: true, transparency: true },
};

export const OUTPUT_FORMATS = Object.keys(IMAGE_FORMATS) as ImageFormat[];

/** Formatos de entrada que os navegadores modernos conseguem abrir. */
export const IMAGE_INPUT_ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif,image/bmp,.jpg,.jpeg,.png,.webp,.avif,.gif,.bmp";

export const IMAGE_INPUT_HINT = "JPG, PNG, WebP, AVIF, GIF ou BMP, até 50 MB. A imagem não sai do seu dispositivo.";

/** Limite por arquivo para evitar travar o navegador em celulares. */
export const MAX_INPUT_BYTES = 50 * 1024 * 1024;

export function formatFromMime(mime: string): ImageFormat | null {
  const entry = Object.entries(IMAGE_FORMATS).find(([, info]) => info.mime === mime);
  return entry ? (entry[0] as ImageFormat) : null;
}

export const formatOptions = OUTPUT_FORMATS.map((format) => ({ value: format, label: IMAGE_FORMATS[format].label }));
