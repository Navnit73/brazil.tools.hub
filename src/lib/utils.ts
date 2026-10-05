import { siteConfig } from "@/config/site";

/** Junta classes condicionais sem dependências externas. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Converte um caminho relativo em URL absoluta do site. */
export function absoluteUrl(path = "/"): string {
  return path === "/" ? siteConfig.url : `${siteConfig.url}${path}`;
}
