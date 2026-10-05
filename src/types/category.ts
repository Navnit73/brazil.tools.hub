export type CategorySlug =
  | "imagem"
  | "pdf"
  | "calculadoras"
  | "pix"
  | "documentos"
  | "whatsapp"
  | "texto";

export interface Category {
  slug: CategorySlug;
  /** Nome exibido em títulos e cards. */
  name: string;
  /** Nome curto para menus e breadcrumbs. */
  shortName: string;
  description: string;
  keywords: string[];
  seo: {
    title: string;
    description: string;
  };
}
