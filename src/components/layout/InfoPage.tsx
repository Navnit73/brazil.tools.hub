import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { getInfoPage, infoPagePath, isInfoPageIndexable, type InfoPageData } from "@/data/pages";
import { getPageContent } from "@/lib/content";
import { webPageJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "./Container";
import { PageHeader } from "./PageHeader";

export function infoPageMetadata(slug: InfoPageData["slug"]): Metadata {
  const page = getInfoPage(slug);
  return buildMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: infoPagePath(page),
    index: isInfoPageIndexable(page),
    image: { url: "/opengraph-image", alt: page.h1 },
  });
}

interface InfoPageProps {
  slug: InfoPageData["slug"];
  /** Conteúdo extra exibido antes do texto em markdown (ex.: canal de contato). */
  children?: ReactNode;
}

/** Página institucional: trilha, `<h1>`, texto de `src/content/pages/<slug>.md` e WebPage JSON-LD. */
export async function InfoPage({ slug, children }: InfoPageProps) {
  const page = getInfoPage(slug);
  const path = infoPagePath(page);
  const content = await getPageContent(`pages/${slug}`);
  const updated = new Date(page.updatedAt).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <Container className="py-6 sm:py-8">
      <Breadcrumbs
        items={[
          { name: "Início", path: "/" },
          { name: page.name, path },
        ]}
      />
      <div className="mt-4">
        <PageHeader title={page.h1} description={page.intro}>
          {page.showUpdatedAt && (
            <p className="mt-3 text-sm text-muted">
              Última atualização: <time dateTime={page.updatedAt}>{updated}</time>
            </p>
          )}
        </PageHeader>
      </div>

      <div className="max-w-3xl">
        {children}
        {content && <MarkdownContent html={content.html} className="mt-8" />}
      </div>

      <JsonLd
        data={webPageJsonLd({
          type: page.schemaType,
          path,
          name: page.h1,
          description: page.seo.description,
          dateModified: page.updatedAt,
          // Sem imagem própria: herda a imagem Open Graph da raiz.
          imagePath: "/",
        })}
      />
    </Container>
  );
}
