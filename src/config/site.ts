export const siteConfig = {
  name: "Brasil Tools Hub",
  shortName: "Tools Hub",
  description:
    "Ferramentas online gratuitas para o dia a dia: imagens, PDF, calculadoras, Pix, documentos, WhatsApp e texto. Rápidas, simples e sem cadastro.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://brasiltoolshub.com.br").replace(/\/$/, ""),
  locale: "pt_BR",
  language: "pt-BR",
  // Metadados (theme-color, manifest, imagem OG) não leem CSS; mantenha em sincronia com --color-primary.
  themeColor: "#15803d",
} as const;
