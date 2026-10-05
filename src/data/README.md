# data

Single source of truth for the site structure.

- `categories.ts` — category registry (slug, names, SEO).
- `tools.ts` — tool registry (slug, category, SEO, `component` key, `related`, `updatedAt`). Also exposes the lookup helpers.
- `navigation.ts` — main navigation links.

Routes, sitemap, breadcrumbs, JSON-LD and related-tool links are all generated from these files.
A category with no tools is `noindex` and left out of the sitemap.
