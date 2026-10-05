# app

Next.js App Router: routes, layouts and generated files.

- `page.tsx`, `layout.tsx`, `not-found.tsx` — home page, root layout, 404.
- `ferramentas/` — public tools routes. The folder name is Portuguese **on purpose**: it is the URL (`/ferramentas`) and renaming it would break SEO and links.
  - `[category]/` — category listing page.
  - `[category]/[tool]/` — individual tool page.
  - `opengraph-image.tsx` — Open Graph image at each level.
- `sitemap.ts`, `robots.ts` — SEO files generated from `src/data`.
- `globals.css` — design tokens (colors, 3px radius) mapped to daisyUI/Tailwind.

Pages are static; their body text is read from `src/content` via `getPageContent`.
