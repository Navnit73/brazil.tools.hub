import { getCategory } from "@/data/categories";
import { getTool, getToolParams } from "@/data/tools";
import { ogImageSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Ferramenta online grátis";
export const size = ogImageSize;
export const contentType = "image/png";

export const generateStaticParams = getToolParams;

export default async function OpengraphImage({ params }: { params: Promise<{ category: string; tool: string }> }) {
  const { category, tool: slug } = await params;
  const tool = getTool(category, slug);
  return renderOgImage({
    eyebrow: getCategory(category)?.name ?? "Ferramentas",
    title: tool?.name ?? "Ferramenta online grátis",
  });
}
