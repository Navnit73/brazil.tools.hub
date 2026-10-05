import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { getToolsByCategory, tools } from "@/data/tools";
import { TOOLS_BASE_PATH } from "@/lib/constants";
import { categoryPath, toolPath } from "@/lib/routes";
import { absoluteUrl } from "@/lib/utils";

function latest(dates: string[]): Date | undefined {
  const max = dates.sort().at(-1);
  return max ? new Date(max) : undefined;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUpdated = latest(tools.map((tool) => tool.updatedAt));

  // Apenas páginas indexáveis: categorias vazias ficam de fora (estão com noindex).
  const categoryEntries = categories.flatMap((category) => {
    const categoryTools = getToolsByCategory(category.slug);
    if (categoryTools.length === 0) return [];
    return [
      {
        url: absoluteUrl(categoryPath(category.slug)),
        lastModified: latest(categoryTools.map((tool) => tool.updatedAt)),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
    ];
  });

  return [
    { url: absoluteUrl("/"), lastModified: siteUpdated, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl(TOOLS_BASE_PATH), lastModified: siteUpdated, changeFrequency: "weekly", priority: 0.9 },
    ...categoryEntries,
    ...tools.map((tool) => ({
      url: absoluteUrl(toolPath(tool)),
      lastModified: new Date(tool.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
