import { siteConfig } from "@/config/site";
import { getCategory, getCategoryParams } from "@/data/categories";
import { ogImageSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Categoria de ferramentas online grátis";
export const size = ogImageSize;
export const contentType = "image/png";

export const generateStaticParams = getCategoryParams;

export default async function OpengraphImage({ params }: { params: Promise<{ category: string }> }) {
  const category = getCategory((await params).category);
  return renderOgImage({ eyebrow: siteConfig.name, title: category?.name ?? "Ferramentas online grátis" });
}
