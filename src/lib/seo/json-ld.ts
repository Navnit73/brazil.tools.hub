import { siteConfig } from "@/config/site";
import { seoConfig } from "@/config/seo";
import type { FaqItem } from "@/lib/content";
import { absoluteUrl } from "@/lib/utils";
import type { Tool } from "@/types/tool";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

type JsonLd = Record<string, unknown>;

/**
 * Entidades ligadas por `@id`: Organization ← WebSite ← WebPage ← (WebApplication | ItemList),
 * e WebPage → BreadcrumbList. Organization e WebSite são emitidos uma vez, no layout raiz.
 */
const ORGANIZATION_ID = `${siteConfig.url}/#organization`;
const WEBSITE_ID = `${siteConfig.url}/#website`;

const webPageId = (path: string) => `${absoluteUrl(path)}#webpage`;
const breadcrumbId = (path: string) => `${absoluteUrl(path)}#breadcrumb`;

/** Imagem Open Graph gerada pelo arquivo `opengraph-image` do segmento. */
function ogImageUrl(path: string): string {
  return absoluteUrl(path === "/" ? "/opengraph-image" : `${path}/opengraph-image`);
}

export function organizationJsonLd(): JsonLd {
  const { legalName, cnpj, email } = siteConfig.company;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: seoConfig.organization.name,
    url: siteConfig.url,
    logo: { "@type": "ImageObject", url: absoluteUrl(seoConfig.organization.logoPath), width: 512, height: 512 },
    ...(legalName && { legalName }),
    ...(cnpj && { taxID: cnpj }),
    ...(email && {
      email,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email,
        availableLanguage: "Portuguese",
        areaServed: "BR",
      },
    }),
    ...(seoConfig.organization.sameAs.length > 0 && { sameAs: seoConfig.organization.sameAs }),
  };
}

export function websiteJsonLd(): JsonLd {
  // Sem SearchAction: a busca do site filtra no navegador e não tem URL de resultados.
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: siteConfig.language,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function webPageJsonLd(input: {
  path: string;
  name: string;
  description: string;
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage";
  /** `false` na home, que não tem trilha. */
  hasBreadcrumb?: boolean;
  /** Entidade principal (ex.: ItemList de uma listagem). Ignorada quando há FAQ. */
  mainEntity?: JsonLd;
  /** Referência à entidade de que a página trata (ex.: `{ "@id": …#app }`). */
  about?: JsonLd;
  /**
   * FAQ visível na página: a própria página vira também FAQPage (um só nó por URL,
   * em vez de dois tipos de página concorrentes). O texto vem da mesma fonte que o `FaqList`.
   */
  faq?: FaqItem[];
  dateModified?: string;
  /** Segmento cujo `opengraph-image` a página usa (padrão: o próprio caminho). */
  imagePath?: string;
}): JsonLd {
  const { path, name, description, type = "WebPage", hasBreadcrumb = true, mainEntity, about, faq, dateModified } = input;
  const imagePath = input.imagePath ?? path;
  const hasFaq = faq !== undefined && faq.length > 0;
  return {
    "@context": "https://schema.org",
    "@type": hasFaq ? [type, "FAQPage"] : type,
    "@id": webPageId(path),
    url: absoluteUrl(path),
    name,
    description,
    inLanguage: siteConfig.language,
    isPartOf: { "@id": WEBSITE_ID },
    primaryImageOfPage: { "@type": "ImageObject", url: ogImageUrl(imagePath), width: 1200, height: 630 },
    ...(hasBreadcrumb && { breadcrumb: { "@id": breadcrumbId(path) } }),
    ...(about && { about }),
    ...(hasFaq ? { mainEntity: faqQuestions(faq) } : mainEntity && { mainEntity }),
    ...(dateModified && { dateModified }),
  };
}

function faqQuestions(faq: FaqItem[]): JsonLd[] {
  return faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  }));
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": breadcrumbId(items[items.length - 1].path),
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function itemListJsonLd(items: Array<{ name: string; path: string }>): JsonLd {
  return {
    "@type": "ItemList",
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

export function toolAppId(path: string): string {
  return `${absoluteUrl(path)}#app`;
}

/**
 * Sem aggregateRating/review: só devem ser adicionados com avaliações reais e visíveis na página.
 * (Sem eles o Google não exibe o rich result de software, mas a entidade continua útil.)
 */
export function toolJsonLd(tool: Tool, path: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": toolAppId(path),
    name: tool.name,
    description: tool.seo.description,
    url: absoluteUrl(path),
    image: ogImageUrl(path),
    inLanguage: siteConfig.language,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Windows, macOS, Linux, Android, iOS",
    browserRequirements: "Requer JavaScript e um navegador moderno.",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
    },
    dateModified: tool.updatedAt,
    publisher: { "@id": ORGANIZATION_ID },
  };
}
