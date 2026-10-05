import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { SearchTools } from "@/components/tool/SearchTools";
import { ToolGrid } from "@/components/tool/ToolGrid";
import { JsonLd } from "@/components/ui/JsonLd";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { categories } from "@/data/categories";
import { getToolsByCategory } from "@/data/tools";
import { TOOLS_BASE_PATH } from "@/lib/constants";
import { getPageContent } from "@/lib/content";
import { buildBreadcrumbs, categoryPath } from "@/lib/routes";
import { getSearchItems } from "@/lib/search";
import { collectionPageJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

const title = "Todas as ferramentas online grátis";
const description =
  "Lista completa de ferramentas online gratuitas: imagem, PDF, calculadoras, Pix, documentos, WhatsApp e texto.";

export const metadata: Metadata = buildMetadata({ title, description, path: TOOLS_BASE_PATH });

export default async function ToolsIndexPage() {
  const content = await getPageContent("paginas/ferramentas");
  const groups = categories.map((category) => ({ category, tools: getToolsByCategory(category.slug) }));

  return (
    <Container className="py-6 sm:py-8">
      <Breadcrumbs items={buildBreadcrumbs()} />
      <div className="mt-4">
        <PageHeader title={title} description={description}>
          <div className="mt-6">
            <SearchTools items={getSearchItems()} />
          </div>
        </PageHeader>
      </div>

      <div className="mt-10 flex flex-col gap-10">
        {groups.map(({ category, tools }) => (
          <section key={category.slug} aria-labelledby={`cat-${category.slug}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-2">
              <h2 id={`cat-${category.slug}`} className="text-xl font-bold">
                {category.name}
              </h2>
              <Link href={categoryPath(category.slug)} className="text-sm font-medium text-primary hover:underline">
                Ver categoria
              </Link>
            </div>
            <div className="mt-4">
              {tools.length > 0 ? (
                <ToolGrid tools={tools} headingLevel="h3" />
              ) : (
                <p className="text-sm text-muted">Novas ferramentas em breve.</p>
              )}
            </div>
          </section>
        ))}
      </div>

      {content && <MarkdownContent html={content.html} className="mt-12" />}

      <JsonLd
        data={collectionPageJsonLd({
          name: title,
          description,
          path: TOOLS_BASE_PATH,
          items: categories.map((category) => ({ name: category.name, path: categoryPath(category.slug) })),
        })}
      />
    </Container>
  );
}
