# features

Interactive client components, one per tool, grouped by area
(`image/`, `pdf/`, `pix/`, `calculator/`, plus empty `documents/`, `finance/`, `text/`, `whatsapp/`).

- Each file is `"use client"` with a default export, built from `ToolInput`, `ToolOutput` and `ToolActions`.
- `index.tsx` registers every component under a key (e.g. `"image/compress"`) using `next/dynamic`,
  so each tool is its own chunk, downloaded only on that tool's page.
- A tool in `src/data/tools.ts` points to its component through that key.

To add one: create the component → register the key in `index.tsx` → add the entry in `src/data/tools.ts` → write `src/content/tools/<category>/<slug>.md`.
