import type { Category, CategorySlug } from "@/types/category";

export const categories: Category[] = [
  {
    slug: "imagem",
    name: "Ferramentas de imagem",
    shortName: "Imagem",
    description: "Redimensione, comprima e converta fotos direto no navegador.",
    keywords: ["editar foto online", "redimensionar imagem", "comprimir imagem"],
    seo: {
      title: "Ferramentas de imagem online grátis",
      description:
        "Redimensione, comprima e converta imagens online grátis, sem instalar nada. Suas fotos são processadas no seu próprio navegador.",
    },
  },
  {
    slug: "pdf",
    name: "Ferramentas de PDF",
    shortName: "PDF",
    description: "Junte, divida e organize arquivos PDF de forma rápida.",
    keywords: ["juntar pdf", "dividir pdf", "editar pdf online"],
    seo: {
      title: "Ferramentas de PDF online grátis",
      description:
        "Junte, divida e organize arquivos PDF online grátis. Simples, rápido e sem cadastro.",
    },
  },
  {
    slug: "calculadoras",
    name: "Calculadoras",
    shortName: "Calculadoras",
    description: "Porcentagem, juros, prazos e outras contas do dia a dia.",
    keywords: ["calculadora online", "calcular porcentagem", "calculadora grátis"],
    seo: {
      title: "Calculadoras online grátis",
      description:
        "Calculadoras online grátis para porcentagem, juros, datas e outras contas do dia a dia, com explicação passo a passo.",
    },
  },
  {
    slug: "pix",
    name: "Ferramentas Pix",
    shortName: "Pix",
    description: "Gere QR Codes e códigos Pix copia e cola para receber pagamentos.",
    keywords: ["qr code pix", "pix copia e cola", "gerar pix"],
    seo: {
      title: "Ferramentas Pix: QR Code e copia e cola",
      description:
        "Gere QR Code Pix e códigos copia e cola grátis para receber pagamentos. Sem cadastro e sem taxas.",
    },
  },
  {
    slug: "documentos",
    name: "Documentos",
    shortName: "Documentos",
    description: "Validação e formatação de CPF, CNPJ, CEP e outros documentos.",
    keywords: ["validar cpf", "validar cnpj", "formatar documento"],
    seo: {
      title: "Ferramentas para documentos brasileiros",
      description:
        "Valide e formate CPF, CNPJ, CEP e outros documentos brasileiros online, de forma rápida e gratuita.",
    },
  },
  {
    slug: "whatsapp",
    name: "Ferramentas para WhatsApp",
    shortName: "WhatsApp",
    description: "Crie links diretos e mensagens prontas para o WhatsApp.",
    keywords: ["link whatsapp", "gerar link whatsapp", "mensagem whatsapp"],
    seo: {
      title: "Ferramentas para WhatsApp online grátis",
      description:
        "Crie links diretos para WhatsApp, mensagens prontas e QR Codes para o seu número. Grátis e sem cadastro.",
    },
  },
  {
    slug: "texto",
    name: "Ferramentas de texto",
    shortName: "Texto",
    description: "Contador de palavras, conversor de maiúsculas e mais.",
    keywords: ["contador de palavras", "converter texto", "ferramentas de texto"],
    seo: {
      title: "Ferramentas de texto online grátis",
      description:
        "Conte palavras e caracteres, converta maiúsculas e minúsculas e formate textos online grátis.",
    },
  },
];

const categoryMap = new Map(categories.map((category) => [category.slug, category]));

/** Parâmetros estáticos de `/ferramentas/[category]` (página e imagem OG). */
export function getCategoryParams(): Array<{ category: string }> {
  return categories.map((category) => ({ category: category.slug }));
}

export function getCategory(slug: string): Category | undefined {
  return categoryMap.get(slug as CategorySlug);
}
