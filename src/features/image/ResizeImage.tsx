"use client";

import ImageEditor from "./ImageEditor";

/** Página "Redimensionar foto": o editor completo, já aberto no painel de tamanho. */
export default function ResizeImage() {
  return <ImageEditor initialPanel="resize" />;
}
