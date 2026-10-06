import { siteConfig } from "@/config/site";

/** Páginas institucionais (E-E-A-T). O corpo fica em `src/content/pages/<slug>.md`. */
export interface InfoPageData {
  slug: "sobre" | "contato" | "privacidade" | "termos";
  /** Nome curto para breadcrumb e rodapé. */
  name: string;
  h1: string;
  intro: string;
  seo: { title: string; description: string };
  schemaType: "AboutPage" | "ContactPage" | "WebPage";
  /** Data da última revisão do texto (ISO 8601), usada no sitemap e exibida nas páginas legais. */
  updatedAt: string;
  /** Exibe "Última atualização" (páginas legais). */
  showUpdatedAt?: boolean;
}

export const infoPages: InfoPageData[] = [
  {
    slug: "sobre",
    name: "Sobre",
    h1: "Sobre o PDFImagem",
    intro: "Ferramentas gratuitas de PDF e imagem que funcionam no seu navegador, sem cadastro e sem enviar seus arquivos.",
    seo: {
      title: "Sobre: ferramentas grátis de PDF e imagem",
      description:
        "Conheça o PDFImagem: ferramentas grátis de PDF e imagem que funcionam no navegador, sem cadastro e sem enviar seus arquivos. Veja como tudo funciona.",
    },
    schemaType: "AboutPage",
    updatedAt: "2026-10-06",
  },
  {
    slug: "contato",
    name: "Contato",
    h1: "Fale com o PDFImagem",
    intro: "Dúvidas, sugestões de novas ferramentas ou algo que não funcionou como deveria? Conte para a gente.",
    seo: {
      title: "Contato: dúvidas, sugestões e suporte técnico",
      description:
        "Fale com o PDFImagem para tirar dúvidas, relatar um problema em uma ferramenta ou sugerir novos recursos. Respondemos pelo e-mail informado nesta página.",
    },
    schemaType: "ContactPage",
    updatedAt: "2026-10-06",
  },
  {
    // TODO: revisar com um advogado antes de publicar (texto-base, não é aconselhamento jurídico).
    slug: "privacidade",
    name: "Privacidade",
    h1: "Política de privacidade",
    intro: "Como o PDFImagem trata dados pessoais, em linha com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).",
    seo: {
      title: "Política de privacidade (LGPD) e seus dados",
      description:
        "Saiba como o PDFImagem trata seus dados de acordo com a LGPD: arquivos processados no navegador, sem cadastro e sem cookies de rastreamento. Leia a política.",
    },
    schemaType: "WebPage",
    updatedAt: "2026-10-06",
    showUpdatedAt: true,
  },
  {
    // TODO: revisar com um advogado antes de publicar (texto-base, não é aconselhamento jurídico).
    slug: "termos",
    name: "Termos de uso",
    h1: "Termos de uso",
    intro: "As regras para usar as ferramentas do PDFImagem. Ao usar o site, você concorda com estes termos.",
    seo: {
      title: "Termos de uso das ferramentas de PDF e imagem",
      description:
        "Leia os termos de uso do PDFImagem: regras para usar as ferramentas grátis de PDF e imagem, responsabilidades, limitações e a legislação brasileira aplicável.",
    },
    schemaType: "WebPage",
    updatedAt: "2026-10-06",
    showUpdatedAt: true,
  },
];

export function getInfoPage(slug: InfoPageData["slug"]): InfoPageData {
  const page = infoPages.find((item) => item.slug === slug);
  if (!page) throw new Error(`Página institucional desconhecida: ${slug}`);
  return page;
}

export function infoPagePath(page: Pick<InfoPageData, "slug">): string {
  return `/${page.slug}`;
}

/** A página de contato só entra no índice quando há um canal real configurado. */
export function isInfoPageIndexable(page: InfoPageData): boolean {
  return page.slug !== "contato" || siteConfig.company.email !== undefined;
}
