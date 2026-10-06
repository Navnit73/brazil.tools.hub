import type { Category } from "@/types/category";
import type { Tool, ToolRef } from "@/types/tool";
import { MAX_RELATED_TOOLS } from "@/lib/constants";

/**
 * Registro central de ferramentas. Para adicionar uma nova:
 * 1. crie o componente em `src/features/<área>/` e registre a chave em `src/features/index.tsx`;
 * 2. adicione a entrada abaixo;
 * 3. escreva o conteúdo em `src/content/tools/<category>/<slug>.md`.
 */
export const tools: Tool[] = [
  {
    // Uma página para "redimensionar imagem" e "redimensionar foto" (mesma intenção de busca).
    // O antigo /redimensionar-foto redireciona para cá (next.config.ts).
    slug: "redimensionar-imagem",
    category: "imagem",
    name: "Redimensionar imagem",
    h1: "Redimensionar imagem e foto online",
    description:
      "Mude a largura e a altura de imagens e fotos JPG, PNG, WebP ou AVIF em pixels ou porcentagem, mantendo a proporção e a qualidade.",
    keywords: [
      "redimensionar imagem",
      "redimensionar foto",
      "redimensionar imagem online",
      "redimensionar foto online grátis",
      "alterar tamanho da imagem",
      "mudar tamanho da foto",
      "redimensionar jpg",
      "redimensionar png",
    ],
    seo: {
      title: "Redimensionar imagem e foto online grátis",
      description:
        "Redimensione imagens e fotos online grátis: altere largura e altura em pixels ou %, mantendo a proporção. JPG, PNG e WebP, sem enviar nada.",
    },
    component: "image/resize",
    related: ["imagem/comprimir-imagem", "imagem/converter-jpg-para-webp", "imagem/editor-de-imagem"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "comprimir-imagem",
    category: "imagem",
    name: "Comprimir imagem",
    h1: "Comprimir imagem online",
    description:
      "Reduza o tamanho e o peso de imagens JPG, PNG e WebP em KB, mantendo boa qualidade visual. Até 20 fotos de uma vez.",
    keywords: [
      "comprimir imagem",
      "comprimir imagem online",
      "compactar imagem",
      "reduzir tamanho da imagem",
      "diminuir peso da imagem",
      "comprimir foto",
      "diminuir kb da imagem",
    ],
    seo: {
      title: "Comprimir imagem online grátis",
      description:
        "Comprima imagens online grátis e reduza o peso em KB sem perder qualidade visível. Compacte JPG, PNG e WebP ou defina um limite, como 200 KB.",
    },
    component: "image/compress",
    related: ["imagem/redimensionar-imagem", "imagem/converter-jpg-para-webp", "imagem/converter-imagem"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "editor-de-imagem",
    category: "imagem",
    name: "Editor de imagem",
    description: "Corte, gire, redimensione e ajuste brilho, contraste e saturação de fotos no navegador.",
    keywords: ["editor de imagem online", "cortar foto", "girar imagem", "editar foto online grátis"],
    seo: {
      title: "Editor de imagem online grátis",
      description:
        "Edite fotos online grátis: corte, gire, espelhe, redimensione e ajuste brilho, contraste e saturação. Sem cadastro e sem enviar a imagem.",
    },
    component: "image/editor",
    related: ["imagem/redimensionar-imagem", "imagem/comprimir-imagem", "imagem/converter-imagem"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "converter-imagem",
    category: "imagem",
    name: "Converter imagem",
    description: "Converta imagens entre JPG, PNG, WebP e AVIF, uma ou várias de uma vez.",
    keywords: ["converter imagem", "converter png para jpg", "converter webp para jpg", "converter para avif"],
    seo: {
      title: "Converter imagem online grátis: JPG, PNG, WebP e AVIF",
      description:
        "Converta imagens para JPG, PNG, WebP ou AVIF online grátis, em lote e direto no navegador. Suas fotos não são enviadas a nenhum servidor.",
    },
    component: "image/convert",
    related: ["imagem/converter-jpg-para-webp", "imagem/comprimir-imagem", "imagem/redimensionar-imagem"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "converter-jpg-para-webp",
    category: "imagem",
    name: "Converter JPG para WebP",
    h1: "Converter JPG para WebP online",
    description:
      "Transforme fotos JPG em WebP, um formato bem mais leve com a mesma qualidade visual. Converta até 20 imagens de uma vez.",
    keywords: [
      "converter jpg para webp",
      "jpg para webp",
      "transformar jpg em webp",
      "converter imagem para webp",
      "jpg para webp grátis",
    ],
    seo: {
      title: "Converter JPG para WebP online grátis",
      description:
        "Converta JPG para WebP online grátis, em lote e direto no navegador. Arquivos mais leves com a mesma qualidade, ideais para sites e lojas virtuais.",
    },
    component: "image/jpg-to-webp",
    related: ["imagem/comprimir-imagem", "imagem/converter-imagem", "imagem/redimensionar-imagem"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "juntar-pdf",
    category: "pdf",
    name: "Juntar PDF",
    description: "Combine vários arquivos PDF em um único documento, na ordem que você escolher.",
    keywords: ["juntar pdf", "unir pdf", "mesclar pdf online"],
    seo: {
      title: "Juntar PDF online grátis",
      description:
        "Junte vários arquivos PDF em um só, online e grátis. Organize a ordem das páginas e baixe o resultado na hora.",
    },
    component: "pdf/merge",
    related: ["imagem/comprimir-imagem"],
    updatedAt: "2026-10-05",
  },
  {
    slug: "porcentagem",
    category: "calculadoras",
    name: "Calculadora de porcentagem",
    description: "Calcule porcentagens, aumentos e descontos de forma rápida.",
    keywords: ["calcular porcentagem", "calculadora de porcentagem", "quanto é x% de y"],
    seo: {
      title: "Calculadora de porcentagem online",
      description:
        "Calcule porcentagem online: quanto é X% de Y, aumento, desconto e variação percentual, com o passo a passo da conta.",
    },
    component: "calculator/percentage",
    related: ["pix/gerador-qr-code"],
    updatedAt: "2026-10-05",
  },
  {
    slug: "gerador-qr-code",
    category: "pix",
    name: "Gerador de QR Code Pix",
    description: "Crie um QR Code Pix e um código copia e cola para receber pagamentos.",
    keywords: ["gerar qr code pix", "qr code pix grátis", "pix copia e cola"],
    seo: {
      title: "Gerador de QR Code Pix grátis",
      description:
        "Gere QR Code Pix estático e código copia e cola grátis, com valor e descrição opcionais. Sem cadastro e sem taxas.",
    },
    component: "pix/qr-code",
    related: ["calculadoras/porcentagem"],
    updatedAt: "2026-10-05",
  },
];

const toolMap = new Map(tools.map((tool) => [`${tool.category}/${tool.slug}`, tool]));

export function getTool(category: string, slug: string): Tool | undefined {
  return toolMap.get(`${category}/${slug}`);
}

/** Parâmetros estáticos de `/ferramentas/[category]/[tool]` (página e imagem OG). */
export function getToolParams(): Array<{ category: string; tool: string }> {
  return tools.map((tool) => ({ category: tool.category, tool: tool.slug }));
}

export function getToolsByCategory(category: Category["slug"]): Tool[] {
  return tools.filter((tool) => tool.category === category);
}

/** Relacionadas declaradas primeiro, completadas com outras da mesma categoria. */
export function getRelatedTools(tool: Tool, limit = MAX_RELATED_TOOLS): Tool[] {
  const declared = tool.related
    .map((ref: ToolRef) => toolMap.get(ref))
    .filter((related): related is Tool => related !== undefined);
  const sameCategory = getToolsByCategory(tool.category).filter(
    (candidate) => candidate !== tool && !declared.includes(candidate),
  );
  return [...declared, ...sameCategory].slice(0, limit);
}
