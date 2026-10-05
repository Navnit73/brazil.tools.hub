import type { ToolComponentKey } from "@/features";
import type { CategorySlug } from "./category";

export interface Tool {
  slug: string;
  category: CategorySlug;
  name: string;
  description: string;
  keywords: string[];
  seo: {
    title: string;
    description: string;
  };
  /** Chave do componente interativo em `src/features/index.tsx` (carregado sob demanda). */
  component: ToolComponentKey;
  /** Slugs (`categoria/ferramenta`) de ferramentas relacionadas. */
  related: ToolRef[];
  /** Data da última atualização relevante (ISO 8601), usada no sitemap. */
  updatedAt: string;
}

export type ToolRef = `${CategorySlug}/${string}`;
