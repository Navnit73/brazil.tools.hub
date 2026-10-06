/**
 * Codificadores WebAssembly (jSquash/Squoosh), importados só quando usados.
 *
 * O AVIF usa o codec de thread única direto, em vez de `@jsquash/avif/encode.js`:
 * aquele módulo também referencia a variante multithread, cujo worker se importa
 * em ciclo e trava o build do Turbopack. A variante multithread só rodaria em
 * páginas com isolamento cross-origin (COOP/COEP), que este site não usa.
 */
import type { AVIFModule } from "@jsquash/avif/codec/enc/avif_enc.js";

let avifModule: Promise<AVIFModule> | null = null;

export async function encodeAvif(image: ImageData, quality: number): Promise<ArrayBuffer> {
  avifModule ??= import("@jsquash/avif/codec/enc/avif_enc.js").then(({ default: factory }) => factory({ noInitialRun: true }));
  const [{ defaultOptions }, module] = await Promise.all([import("@jsquash/avif/meta.js"), avifModule]);
  const output = module.encode(new Uint8Array(image.data.buffer), image.width, image.height, {
    ...defaultOptions,
    quality,
    // Mais rápido que o padrão (6), com perda mínima de compressão; importante no celular.
    speed: 8,
  });
  if (!output) throw new Error("Falha ao gerar AVIF.");
  return output.buffer as ArrayBuffer;
}

export async function encodeWebp(image: ImageData, quality: number): Promise<ArrayBuffer> {
  const { default: encode } = await import("@jsquash/webp/encode.js");
  return encode(image, { quality });
}
