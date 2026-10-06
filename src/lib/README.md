# lib

Shared logic with no UI.

- `content.ts` — reads markdown from `src/content`, converts it to HTML and extracts FAQ items (server only).
- `routes.ts` — URL builders (`categoryPath`, `toolPath`) and breadcrumb trail.
- `search.ts` — tool search used by `SearchTools`.
- `file.ts` — `formatBytes`, `renameFile`, `downloadBlob`, `matchesAccept` (browser only).
- `constants.ts`, `utils.ts` — constants and small helpers.
- `seo/` — `metadata.ts` (Next metadata), `json-ld.ts` (structured data), `og-image.tsx` (Open Graph images).
