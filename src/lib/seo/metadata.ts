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
  /**
   * Imagem Open Graph explícita, para segmentos sem `opengraph-image` próprio: o objeto
   * `openGraph` da página substitui o herdado e, sem isto, ficaria sem imagem.
   */
  image?: { url: string; alt: string };
}

/**
 * Metadados completos por página. Open Graph e Twitter são sobrescritos por
 * inteiro em cada segmento no Next.js, por isso são sempre montados aqui.
 *
 * Só existe a versão pt-BR: o hreflang aponta para a própria página (pt-BR) e
 * a usa também como `x-default` para os demais países lusófonos. Se um dia
 * houver /pt-pt/ ou /pt-ao/ com conteúdo localizado, acrescente-os aqui.
 */
export function buildMetadata({ title, description, path, keywords, index = true, image }: PageMetadataInput): Metadata {
  const images = image && [{ ...image, width: 1200, height: 630, type: "image/png" }];
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: path,
      languages: { [siteConfig.language]: path, "x-default": path },
    },
    robots: index ? undefined : { index: false, follow: true },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      url: path,
      title,
      description,
      ...(images && { images }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: seoConfig.twitterHandle,
      ...(images && { images }),
    },
  };
}
