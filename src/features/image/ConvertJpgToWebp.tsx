"use client";

import ConvertImage from "./ConvertImage";

/** Página "Converter JPG para WebP": o conversor já com WebP como destino. */
export default function ConvertJpgToWebp() {
  return <ConvertImage defaultFormat="webp" />;
}
