import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { ToolGrid } from "@/components/tool/ToolGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { JsonLd } from "@/components/ui/JsonLd";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { getCategory, getCategoryParams } from "@/data/categories";
import { getToolsByCategory } from "@/data/tools";
import { getPageContent } from "@/lib/content";
import { buildBreadcrumbs, categoryPath, toolPath } from "@/lib/routes";
import { collectionPageJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

export const generateStaticParams = getCategoryParams;

export async function generateMetadata({ params }: PageProps<"/ferramentas/[category]">): Promise<Metadata> {
  const category = getCategory((await params).category);
  if (!category) return {};
  return buildMetadata({
    title: category.seo.title,
    description: category.seo.description,
    path: categoryPath(category.slug),
    keywords: category.keywords,
    // Categorias sem ferramentas ainda são conteúdo raso: fora do índice até terem itens.
    index: getToolsByCategory(category.slug).length > 0,
  });
}

export default async function CategoryPage({ params }: PageProps<"/ferramentas/[category]">) {
  const category = getCategory((await params).category);
  if (!category) notFound();

  const tools = getToolsByCategory(category.slug);
  const content = await getPageContent(`categories/${category.slug}`);
  const path = categoryPath(category.slug);

  return (
    <Container className="py-6 sm:py-8">
      <Breadcrumbs items={buildBreadcrumbs({ category })} />
      <div className="mt-4">
        <PageHeader title={category.name} description={category.description} />
      </div>

      <section aria-labelledby="lista-ferramentas" className="mt-8">
        <h2 id="lista-ferramentas" className="sr-only">
          Ferramentas disponíveis
        </h2>
        {tools.length > 0 ? (
          <ToolGrid tools={tools} headingLevel="h3" />
        ) : (
          <EmptyState title="Novas ferramentas em breve">
            Estamos preparando ferramentas para esta categoria.
          </EmptyState>
        )}
      </section>

      {content && <MarkdownContent html={content.html} className="mt-12" />}

      {tools.length > 0 && (
        <JsonLd
          data={collectionPageJsonLd({
            name: category.name,
            description: category.seo.description,
            path,
            items: tools.map((tool) => ({ name: tool.name, path: toolPath(tool) })),
          })}
        />
      )}
    </Container>
  );
}
