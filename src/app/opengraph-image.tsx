import { siteConfig } from "@/config/site";
import { ogImageSize, renderOgImage } from "@/lib/seo/og-image";

export const alt = siteConfig.name;
export const size = ogImageSize;
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOgImage({ eyebrow: siteConfig.name, title: "Ferramentas online grátis para o dia a dia" });
}
