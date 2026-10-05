import type { Category } from "@/types/category";
import type { Tool, ToolRef } from "@/types/tool";
import { MAX_RELATED_TOOLS } from "@/lib/constants";

/**
 * Registro central de ferramentas. Para adicionar uma nova:
 * 1. crie o componente em `src/features/<área>/` e registre a chave em `src/features/index.tsx`;
 * 2. adicione a entrada abaixo;
 * 3. escreva o conteúdo em `src/content/ferramentas/<categoria>/<slug>.md`.
 */
export const tools: Tool[] = [
  {
    slug: "redimensionar-foto",
    category: "imagem",
    name: "Redimensionar foto",
    description: "Altere a largura e a altura de fotos em JPG, PNG ou WebP sem perder qualidade.",
    keywords: ["redimensionar foto", "redimensionar imagem online", "mudar tamanho da foto"],
    seo: {
      title: "Redimensionar foto online grátis",
      description:
        "Redimensione fotos JPG, PNG e WebP online grátis. Defina largura e altura em pixels ou porcentagem, direto no navegador.",
    },
    component: "image/resize",
    related: ["imagem/comprimir-imagem", "pdf/juntar-pdf"],
    updatedAt: "2026-10-05",
  },
  {
    slug: "comprimir-imagem",
    category: "imagem",
    name: "Comprimir imagem",
    description: "Reduza o tamanho de arquivos de imagem mantendo boa qualidade visual.",
    keywords: ["comprimir imagem", "reduzir tamanho de foto", "diminuir kb da imagem"],
    seo: {
      title: "Comprimir imagem online grátis",
      description:
        "Comprima imagens JPG, PNG e WebP online grátis e reduza o tamanho do arquivo sem perder qualidade visível.",
    },
    component: "image/compress",
    related: ["imagem/redimensionar-foto"],
    updatedAt: "2026-10-05",
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
