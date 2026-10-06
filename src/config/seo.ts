import { siteConfig } from "./site";

export const seoConfig = {
  titleTemplate: `%s | ${siteConfig.name}`,
  defaultTitle: `Ferramentas de PDF e imagem online grátis | ${siteConfig.name}`,
  // TODO: preencher com o @ real do X/Twitter, se existir.
  twitterHandle: undefined as string | undefined,
  organization: {
    name: siteConfig.name,
    logoPath: "/icons/512.png",
    // TODO: URLs dos perfis oficiais (Instagram, LinkedIn, YouTube…), quando existirem.
    sameAs: [] as string[],
  },
  // Códigos de verificação via variável de ambiente (vazios = tag não é gerada).
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "6BFE4F80CD650E2E0CA99EA3C6C7664F",
  },
  // ID do projeto no Microsoft Clarity (vazio = script não é carregado).
  clarityId: process.env.NEXT_PUBLIC_CLARITY_ID ?? "yteefpujmw",
} as const;
