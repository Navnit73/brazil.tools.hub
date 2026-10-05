# Conteúdo em markdown

Texto editorial das páginas. Título (`<h1>`), metadados e SEO vêm de `src/data/*.ts`;
aqui fica só o corpo da página.

| Arquivo                                   | Página                                |
| ----------------------------------------- | ------------------------------------- |
| `paginas/inicio.md`                       | `/`                                   |
| `paginas/ferramentas.md`                  | `/ferramentas`                        |
| `categorias/<categoria>.md`               | `/ferramentas/<categoria>`            |
| `ferramentas/<categoria>/<ferramenta>.md` | `/ferramentas/<categoria>/<ferramenta>` |

Regras:

- Comece em `##` (o `<h1>` é da página). Um `#` é rebaixado para `##` automaticamente.
- Uma seção `## Perguntas frequentes` com perguntas em `###` gera o schema FAQPage.
- Arquivo ausente = página sem texto extra (não quebra o build).
