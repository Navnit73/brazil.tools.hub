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
    <article className="relative cursor-pointer has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-primary flex h-full flex-col rounded-m-md border border-md-outline-variant bg-md-surface-lowest p-5 text-md-on-surface sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <span aria-hidden="true" className={cn("grid size-12 place-items-center rounded-m-lg", visual.tone)}>
          <Icon name={visual.icon} className="size-6" />
        </span>
        {toolCount > 0 ? (
          <span className="inline-flex h-6 items-center rounded-m-sm bg-md-surface-high px-2 text-xs font-medium text-md-on-surface-variant">
            {toolCount} {toolCount === 1 ? "ferramenta" : "ferramentas"}
          </span>
        ) : (
          <span className="inline-flex h-6 items-center rounded-m-sm border border-md-outline-variant px-2 text-xs font-medium text-md-on-surface-variant">
            Em breve
          </span>
        )}
      </div>
      <Heading className="mt-4 font-display text-lg font-medium sm:mt-5">
        {/* Link estendido: o card inteiro é clicável sem aninhar elementos interativos. */}
        <Link href={categoryPath(category.slug)} className="after:absolute after:inset-0 focus-visible:outline-none">
          {category.name}
        </Link>
      </Heading>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-md-on-surface-variant">{category.description}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        Explorar
        <Icon name="arrowRight" className="size-4" />
      </span>
    </article>
  );
}
