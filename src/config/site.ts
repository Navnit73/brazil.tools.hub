export const siteConfig = {
  name: "PDFImagem",
  shortName: "PDFImagem",
  description:
    "Junte, divida, comprima e converta PDF e imagens online grátis, direto no navegador e sem cadastro. Seus arquivos não saem do aparelho. Experimente agora!",
  // Host canônico: https, sem "www" e sem barra final (o next.config.ts redireciona as outras variações).
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdfimagem.com").replace(/\/$/, ""),
  locale: "pt_BR",
  language: "pt-BR",
  // Metadados (theme-color, manifest, imagem OG) não leem CSS; mantenha em sincronia com --color-primary.
  themeColor: "#15803d",
  /**
   * Dados da empresa responsável pelo site. Só aparecem nas páginas e no JSON-LD quando preenchidos:
   * nunca invente valores.
   * TODO: preencher com os dados reais (razão social, CNPJ e e-mail de contato que você monitora).
   */
  company: {
    legalName: undefined as string | undefined,
    cnpj: undefined as string | undefined,
    email: undefined as string | undefined,
  },
} as const;
