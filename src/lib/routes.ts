import type { CategorySlug } from "@/types/category";
import type { Tool } from "@/types/tool";
import { TOOLS_BASE_PATH } from "./constants";

export function categoryPath(slug: CategorySlug): string {
  return `${TOOLS_BASE_PATH}/${slug}`;
}

export function toolPath(tool: Pick<Tool, "category" | "slug">): string {
  return `${TOOLS_BASE_PATH}/${tool.category}/${tool.slug}`;
}

interface Crumb {
  name: string;
  path: string;
}

/** Trilha padrão: Início › Ferramentas › Categoria › Ferramenta. */
export function buildBreadcrumbs(input: {
  category?: { slug: CategorySlug; shortName: string };
  tool?: Pick<Tool, "category" | "slug" | "name">;
} = {}): Crumb[] {
  const crumbs: Crumb[] = [
    { name: "Início", path: "/" },
    { name: "Ferramentas", path: TOOLS_BASE_PATH },
  ];
  if (input.category) crumbs.push({ name: input.category.shortName, path: categoryPath(input.category.slug) });
  if (input.tool) crumbs.push({ name: input.tool.name, path: toolPath(input.tool) });
  return crumbs;
}
