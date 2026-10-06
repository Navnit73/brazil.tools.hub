# PDFImagem

Site de ferramentas online em pt-BR. Next.js 16 (App Router), TypeScript, Tailwind CSS v4, daisyUI 5 e MUI (só onde agrega).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de produção (todas as páginas são estáticas)
npm run lint
```

Defina a URL pública em `.env.local` (usada em canonical, sitemap, Open Graph e JSON-LD):

```bash
NEXT_PUBLIC_SITE_URL=https://pdfimagem.com
```

## Estrutura

| Pasta                | Conteúdo                                                                    |
| -------------------- | --------------------------------------------------------------------------- |
| `src/app`            | Rotas: `/`, `/ferramentas`, `/ferramentas/[category]`, `/ferramentas/[category]/[tool]`, sitemap, robots, imagens OG |
| `src/data`           | Registro de categorias, ferramentas e navegação (fonte única da estrutura)   |
| `src/content`        | Texto das páginas em **markdown** (veja `src/content/README.md`)            |
| `src/features`       | Componentes interativos de cada ferramenta, carregados sob demanda          |
| `src/components`     | `layout/`, `navigation/`, `tool/` e `ui/` reutilizáveis                     |
| `src/lib/seo`        | Metadados, JSON-LD e imagens Open Graph                                     |
| `src/config`         | Nome do site, URL, padrões de SEO                                           |
| `src/app/globals.css`| Design tokens (cores, raio de 3px) e mapeamento para daisyUI/Tailwind       |

## Adicionar uma ferramenta

1. Crie o componente em `src/features/<área>/MinhaFerramenta.tsx` (`"use client"`, `export default`), usando `ToolInput`, `ToolOutput` e `ToolActions`.
2. Registre a chave em `src/features/index.tsx` (ex.: `"text/word-count"`).
3. Adicione a entrada em `src/data/tools.ts` (slug, categoria, SEO, `component`, `related`).
4. Escreva `src/content/tools/<category>/<slug>.md`.

A página, metadados, breadcrumbs, JSON-LD, imagem OG, sitemap e links relacionados são gerados automaticamente. Uma categoria nova exige também o slug em `src/types/category.ts` e a entrada em `src/data/categories.ts`.

## Convenções

- Cores e raios só via tokens de `globals.css` (`bg-surface`, `text-muted`, `border-border`, `bg-primary`, `rounded-sm`…). Raio máximo: 3px.
- Server Components por padrão; Client Components só para interação.
- daisyUI para formulários e botões; MUI apenas para controles complexos (envolva com `MuiProvider`). Componentes daisyUI novos precisam entrar no `include` do `globals.css`.
- Categorias sem ferramentas ficam com `noindex` e fora do sitemap até receberem a primeira ferramenta.
# brazil.tools.hub
