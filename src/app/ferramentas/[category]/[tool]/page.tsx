import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "@/components/tool/ToolShell";
import { getCategory } from "@/data/categories";
import { getRelatedTools, getTool, getToolParams, isToolLive } from "@/data/tools";
import { getPageContent } from "@/lib/content";
import { toolPath } from "@/lib/routes";
import { buildMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

export const generateStaticParams = getToolParams;

export async function generateMetadata({ params }: PageProps<"/ferramentas/[category]/[tool]">): Promise<Metadata> {
  const { category, tool: slug } = await params;
  const tool = getTool(category, slug);
  if (!tool) return {};
  return buildMetadata({
    title: tool.seo.title,
    description: tool.seo.description,
    path: toolPath(tool),
    keywords: tool.keywords,
    index: isToolLive(tool),
  });
}

export default async function ToolPage({ params }: PageProps<"/ferramentas/[category]/[tool]">) {
  const { category: categorySlug, tool: slug } = await params;
  const tool = getTool(categorySlug, slug);
  const category = getCategory(categorySlug);
  if (!tool || !category) notFound();

  const content = await getPageContent(`tools/${tool.category}/${tool.slug}`);

  return <ToolShell tool={tool} category={category} content={content} related={getRelatedTools(tool)} />;
}
