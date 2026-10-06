"use client";

import ImageEditor from "./ImageEditor";

/** Página "Redimensionar imagem": o editor completo, já aberto no painel de tamanho. */
export default function ResizeImage() {
  return <ImageEditor initialPanel="resize" />;
}
