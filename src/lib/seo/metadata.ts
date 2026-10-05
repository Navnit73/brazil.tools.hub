import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { seoConfig } from "@/config/seo";

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  /** `false` gera `noindex, follow` (ex.: páginas ainda sem conteúdo). */
  index?: boolean;
}

/**
 * Metadados completos por página. Open Graph e Twitter são sobrescritos por
 * inteiro em cada segmento no Next.js, por isso são sempre montados aqui.
 */
export function buildMetadata({ title, description, path, keywords, index = true }: PageMetadataInput): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    robots: index ? undefined : { index: false, follow: true },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      url: path,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: seoConfig.twitterHandle,
    },
  };
}
