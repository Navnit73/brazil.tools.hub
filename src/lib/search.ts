import { getCategory } from "@/data/categories";
import { tools } from "@/data/tools";
import { toolPath } from "@/lib/routes";
import type { SearchItem } from "@/components/tool/SearchTools";

/** Índice enxuto enviado ao cliente (apenas campos necessários para a busca). */
export function getSearchItems(): SearchItem[] {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    category: getCategory(tool.category)?.shortName ?? "",
    href: toolPath(tool),
    keywords: tool.keywords,
  }));
}
