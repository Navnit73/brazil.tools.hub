import { siteConfig } from "@/config/site";
import { getCategory } from "@/data/categories";
import { getTool, getToolParams } from "@/data/tools";
import { OG_IMAGE_ID } from "@/lib/constants";
import { ogImageSize, renderOgImage } from "@/lib/seo/og-image";

export const generateStaticParams = getToolParams;

/** Uma imagem por ferramenta, com texto alternativo próprio (o `alt` estático seria igual em todas). */
export function generateImageMetadata({ params }: { params: { category: string; tool: string } }) {
  const tool = getTool(params.category, params.tool);
  return [
    {
      id: OG_IMAGE_ID,
      size: ogImageSize,
      contentType: "image/png",
      alt: tool ? `${tool.h1 ?? tool.name}: ferramenta grátis do ${siteConfig.name}` : `Ferramenta grátis do ${siteConfig.name}`,
    },
  ];
}

export default async function OpengraphImage({ params }: { params: Promise<{ category: string; tool: string }> }) {
  const { category, tool: slug } = await params;
  const tool = getTool(category, slug);
  return renderOgImage({
    eyebrow: getCategory(category)?.name ?? "Ferramentas",
    title: tool?.name ?? "Ferramenta online grátis",
  });
}
