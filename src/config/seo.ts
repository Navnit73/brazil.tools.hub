import { siteConfig } from "./site";

export const seoConfig = {
  titleTemplate: `%s | ${siteConfig.name}`,
  defaultTitle: `${siteConfig.name} — Ferramentas online grátis`,
  twitterHandle: undefined as string | undefined,
  organization: {
    name: siteConfig.name,
    logoPath: "/icon.svg",
    sameAs: [] as string[],
  },
} as const;
