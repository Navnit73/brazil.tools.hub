import { categories } from "./categories";
import { categoryPath } from "@/lib/routes";
import { TOOLS_BASE_PATH } from "@/lib/constants";

export interface NavItem {
  label: string;
  href: string;
}

export const mainNavigation: NavItem[] = [
  { label: "Todas as ferramentas", href: TOOLS_BASE_PATH },
  ...categories
    .filter((category) => ["imagem", "pdf", "calculadoras", "pix"].includes(category.slug))
    .map((category) => ({ label: category.shortName, href: categoryPath(category.slug) })),
];

export const footerNavigation: NavItem[] = categories.map((category) => ({
  label: category.name,
  href: categoryPath(category.slug),
}));
