import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { CategoryCard } from "@/components/tool/CategoryCard";
import { SearchTools } from "@/components/tool/SearchTools";
import { ToolGrid } from "@/components/tool/ToolGrid";
import { JsonLd } from "@/components/ui/JsonLd";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { seoConfig } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { categories } from "@/data/categories";
import { getToolsByCategory, tools } from "@/data/tools";
import { TOOLS_BASE_PATH } from "@/lib/constants";
import { getPageContent } from "@/lib/content";
import { getSearchItems } from "@/lib/search";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  ...buildMetadata({ title: seoConfig.defaultTitle, description: siteConfig.description, path: "/" }),
  // Na home o título não usa o template "%s | Nome".
  title: { absolute: seoConfig.defaultTitle },
};

export default async function HomePage() {
  const content = await getPageContent("paginas/inicio");

  return (
    <>
      <section className="border-b border-border bg-surface">
        <Container className="py-10 sm:py-14">
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
            Ferramentas online grátis para o seu dia a dia
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted sm:text-lg">
            Imagens, PDF, calculadoras, Pix, documentos, WhatsApp e texto. Tudo rápido, simples e sem cadastro.
          </p>
          <div className="mt-6">
            <SearchTools items={getSearchItems()} />
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <section aria-labelledby="categorias">
          <h2 id="categorias" className="text-xl font-bold sm:text-2xl">
            Categorias
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <li key={category.slug}>
                <CategoryCard category={category} toolCount={getToolsByCategory(category.slug).length} headingLevel="h3" />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="populares" className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="populares" className="text-xl font-bold sm:text-2xl">
              Ferramentas populares
            </h2>
            <Link href={TOOLS_BASE_PATH} className="text-sm font-medium text-primary hover:underline">
              Ver todas as ferramentas
            </Link>
          </div>
          <div className="mt-4">
            <ToolGrid tools={tools.slice(0, 6)} headingLevel="h3" showCategory />
          </div>
        </section>

        {content && <MarkdownContent html={content.html} className="mt-12" />}
      </Container>

      <JsonLd
        data={[organizationJsonLd(), websiteJsonLd(), ...(content && content.faq.length > 0 ? [faqJsonLd(content.faq)] : [])]}
      />
    </>
  );
}
