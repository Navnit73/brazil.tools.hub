import { siteConfig } from "@/config/site";
import { ogImageSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = "Todas as ferramentas online grátis";
export const size = ogImageSize;
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOgImage({ eyebrow: siteConfig.name, title: "Todas as ferramentas online grátis" });
}
