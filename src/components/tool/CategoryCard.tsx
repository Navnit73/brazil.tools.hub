import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { categoryPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";
import { categoryVisuals } from "./categoryVisuals";

interface CategoryCardProps {
  category: Category;
  toolCount: number;
  headingLevel?: "h2" | "h3";
}

export function CategoryCard({ category, toolCount, headingLevel: Heading = "h2" }: CategoryCardProps) {
  const visual = categoryVisuals[category.slug];

  return (
    <article className="group relative flex h-full flex-col rounded-sm border border-border bg-background p-5 shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_32px_-12px_rgb(21_128_61/0.25)]">
      <span aria-hidden="true" className={cn("grid size-11 place-items-center rounded-sm ring-1 ring-inset", visual.tile)}>
        <Icon name={visual.icon} className="size-5.5" />
      </span>
      <Heading className="mt-4 text-lg font-semibold tracking-tight">
        {/* Link estendido: o card inteiro é clicável sem aninhar elementos interativos. */}
        <Link href={categoryPath(category.slug)} className="after:absolute after:inset-0 group-hover:text-primary">
          {category.name}
        </Link>
      </Heading>
      <p className="mt-1 flex-1 text-sm text-muted">{category.description}</p>
      <p className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs font-medium">
        <span className={toolCount > 0 ? "text-primary" : "text-muted"}>
          {toolCount > 0 ? `${toolCount} ${toolCount === 1 ? "ferramenta" : "ferramentas"}` : "Em breve"}
        </span>
        <Icon
          name="arrowRight"
          className="size-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </p>
    </article>
  );
}
