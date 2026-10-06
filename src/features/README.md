# features

Interactive client components, one per tool, grouped by area
(`image/`, `pdf/`, `pix/`, `calculator/`, plus empty `documents/`, `finance/`, `text/`, `whatsapp/`).

- Each file is `"use client"` with a default export, built from `ToolInput`, `ToolOutput` and `ToolActions`.
- `index.tsx` registers every component under a key (e.g. `"image/compress"`) using `next/dynamic`,
  so each tool is its own chunk, downloaded only on that tool's page.
- A tool in `src/data/tools.ts` points to its component through that key.

To add one: create the component → register the key in `index.tsx` → add the entry in `src/data/tools.ts` → write `src/content/tools/<category>/<slug>.md`.

## image/

Four tools sharing one client-side pipeline (nothing is uploaded):

| File | Tool |
| ---- | ---- |
| `ImageEditor.tsx` | Crop (free or fixed ratio), rotate/flip, resize, brightness/contrast/saturation, export as JPG/PNG/WebP/AVIF |
| `ResizeImage.tsx` | The editor opened on the resize panel |
| `CompressImage.tsx` | Batch compression by quality or by target size (KB), optional format change and max dimension |
| `ConvertImage.tsx` | Batch conversion between JPG, PNG, WebP and AVIF |

- `lib/` — pure logic, no React: `decode` (EXIF-aware), `render` (orient → crop → resize → adjust), `encode`
  (native `canvas.toBlob`, falling back to WebAssembly encoders in `wasm-encoders` only when the browser can't
  produce the format, e.g. AVIF in most browsers or WebP in Safari), `process` (convert/compress), `editor` (editor state).
- `hooks/useImageBatch` — file list, validation, sequential processing, progress and cancel for batch tools.
- `components/ImageBatchTool` — the shared layout for batch tools; a new batch tool only supplies its settings and a
  `(file) => Promise<ProcessedImage>` function.

Import the AVIF encoder only through `lib/wasm-encoders.ts`: `@jsquash/avif/encode.js` also references the
multithreaded build, whose worker hangs the Turbopack build.
