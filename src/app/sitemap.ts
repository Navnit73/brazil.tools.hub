import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { infoPagePath, infoPages, isInfoPageIndexable } from "@/data/pages";
import { getLiveToolsByCategory, isToolLive, tools } from "@/data/tools";
import { TOOLS_BASE_PATH } from "@/lib/constants";
import { categoryPath, toolPath } from "@/lib/routes";
import { absoluteUrl } from "@/lib/utils";

function latest(dates: string[]): Date | undefined {
  const max = dates.sort().at(-1);
  return max ? new Date(max) : undefined;
}

/**
 * Só URLs canônicas e indexáveis (as mesmas que não têm `noindex`). Site com um único
 * idioma: sem `alternates.languages` aqui, o hreflang pt-BR/x-default fica no `<head>`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const liveTools = tools.filter(isToolLive);
  const siteUpdated = latest(liveTools.map((tool) => tool.updatedAt));

  const categoryEntries = categories.flatMap((category) => {
    const categoryTools = getLiveToolsByCategory(category.slug);
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

  const infoEntries = infoPages.filter(isInfoPageIndexable).map((page) => ({
    url: absoluteUrl(infoPagePath(page)),
    lastModified: new Date(page.updatedAt),
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  return [
    { url: absoluteUrl("/"), lastModified: siteUpdated, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl(TOOLS_BASE_PATH), lastModified: siteUpdated, changeFrequency: "weekly", priority: 0.9 },
    ...categoryEntries,
    ...liveTools.map((tool) => ({
      url: absoluteUrl(toolPath(tool)),
      lastModified: new Date(tool.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...infoEntries,
  ];
}
