# components

Reusable UI. Server Components by default; add `"use client"` only for interaction.

| Folder        | Purpose                                                                          |
| ------------- | -------------------------------------------------------------------------------- |
| `layout/`     | Page frame: `Header`, `Footer`, `Container`, `PageHeader`.                       |
| `navigation/` | `MainNav` and `Breadcrumbs`.                                                     |
| `tool/`       | Tool pages and listings: `ToolShell` (common page structure), `ToolCard`, `ToolGrid`, `CategoryCard`, `RelatedTools`, `SearchTools`, and the widget pieces `ToolInput`, `ToolOutput`, `ToolActions`, `ToolLoading`. |
| `ui/`         | Generic helpers: `JsonLd`, `MarkdownContent`, `EmptyState`, `MuiProvider`.       |

Style only with the tokens from `globals.css` (`bg-surface`, `text-muted`, `rounded-sm`…).
