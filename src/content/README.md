# Content (markdown)

Editorial text for each page. The title (`<h1>`), metadata and SEO come from `src/data/*.ts`;
only the page body lives here. The text itself is written in pt-BR (the site's language).

| File                              | Page                                      |
| --------------------------------- | ----------------------------------------- |
| `pages/home.md`                   | `/`                                       |
| `pages/tools.md`                  | `/ferramentas`                            |
| `categories/<category>.md`        | `/ferramentas/<category>`                 |
| `tools/<category>/<tool>.md`      | `/ferramentas/<category>/<tool>`          |

`<category>` and `<tool>` are the URL slugs (e.g. `imagem`, `comprimir-imagem`). Slugs stay in
Portuguese on purpose: they are public URLs. Only folder names are in English.

Rules:

- Start at `##` (the `<h1>` belongs to the page). A `#` is demoted to `##` automatically.
- A `## Perguntas frequentes` section with `###` questions generates the FAQPage schema.
- A missing file means a page with no extra text (it does not break the build).
