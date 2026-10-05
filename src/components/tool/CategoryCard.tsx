import Link from "next/link";
import { categoryPath } from "@/lib/routes";
import type { Category } from "@/types/category";

interface CategoryCardProps {
  category: Category;
  toolCount: number;
  headingLevel?: "h2" | "h3";
}

export function CategoryCard({ category, toolCount, headingLevel: Heading = "h2" }: CategoryCardProps) {
  return (
    <article className="group relative flex h-full flex-col rounded-sm border border-border bg-background p-5 hover:border-primary">
      <Heading className="text-lg font-semibold">
        {/* Link estendido: o card inteiro é clicável sem aninhar elementos interativos. */}
        <Link href={categoryPath(category.slug)} className="after:absolute after:inset-0 group-hover:text-primary">
          {category.name}
        </Link>
      </Heading>
      <p className="mt-1 flex-1 text-sm text-muted">{category.description}</p>
      <p className="mt-4 text-xs font-medium text-primary">
        {toolCount > 0 ? `${toolCount} ${toolCount === 1 ? "ferramenta" : "ferramentas"}` : "Em breve"}
      </p>
    </article>
  );
}
