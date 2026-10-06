import type { Category, CategorySlug } from "@/types/category";

export const categories: Category[] = [
  {
    slug: "imagem",
    name: "Ferramentas de imagem",
    shortName: "Imagem",
    description: "Redimensione, comprima e converta imagens e fotos direto no navegador.",
    keywords: ["ferramentas de imagem", "redimensionar imagem", "comprimir imagem", "converter jpg para webp", "editar foto online"],
    seo: {
      title: "Ferramentas de imagem e foto online grátis",
      description:
        "Redimensione, comprima e converta imagens online grátis (JPG, PNG e WebP), sem instalar nada. Suas fotos são processadas no navegador. Experimente!",
    },
  },
  {
    slug: "pdf",
    name: "Ferramentas de PDF",
    shortName: "PDF",
    description: "Junte, divida, comprima, converta e proteja PDFs direto no navegador, sem enviar seus arquivos.",
    keywords: ["juntar pdf", "dividir pdf", "comprimir pdf", "pdf para jpg", "jpg para pdf", "editar pdf online"],
    seo: {
      title: "Ferramentas de PDF online grátis e sem cadastro",
      description:
        "Junte, divida, comprima, gire e converta PDFs online grátis: PDF para JPG, JPG para PDF, senha e mais. Tudo no navegador, sem enviar arquivos.",
    },
  },
  {
    slug: "calculadoras",
    name: "Calculadoras",
    shortName: "Calculadoras",
    description: "Porcentagem, juros, prazos e outras contas do dia a dia.",
    keywords: ["calculadora online", "calcular porcentagem", "calculadora grátis"],
    seo: {
      title: "Calculadoras online grátis para o dia a dia",
      description:
        "Calculadoras online grátis para as contas do dia a dia, como porcentagem, aumento e desconto, com explicação passo a passo. Sem cadastro e sem instalar nada.",
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
        "Gere QR Code Pix e códigos copia e cola grátis para receber pagamentos de clientes e amigos, com valor opcional. Sem cadastro, sem taxas e sem instalar nada.",
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
        "Valide e formate CPF, CNPJ, CEP e outros documentos brasileiros online, de forma rápida e gratuita. Novas ferramentas em breve, sem cadastro e sem instalar.",
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
        "Crie links diretos para WhatsApp, mensagens prontas e QR Codes para o seu número, de forma rápida e grátis. Novas ferramentas em breve, sem cadastro.",
    },
  },
  {
    slug: "texto",
    name: "Ferramentas de texto",
    shortName: "Texto",
    description: "Contador de palavras, conversor de maiúsculas e mais.",
    keywords: ["contador de palavras", "converter texto", "ferramentas de texto"],
    seo: {
      title: "Ferramentas de texto online grátis e simples",
      description:
        "Conte palavras e caracteres, converta maiúsculas e minúsculas e formate textos online grátis. Novas ferramentas em breve, sem cadastro e sem instalar nada.",
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
