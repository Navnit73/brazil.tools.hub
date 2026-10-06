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
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_24px_48px_-20px_rgb(15_23_42/0.25)]">
      <div className="flex items-start justify-between">
        <span
          aria-hidden="true"
          className={cn(
            "grid size-12 place-items-center rounded-[1rem] bg-linear-to-br text-white shadow-lg ring-1 ring-inset ring-white/20",
            visual.gradient,
            visual.glow,
          )}
        >
          <Icon name={visual.icon} className="size-6" />
        </span>
        {toolCount > 0 ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {toolCount} {toolCount === 1 ? "ferramenta" : "ferramentas"}
          </span>
        ) : (
          <span className="rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-xs font-medium text-muted">
            Em breve
          </span>
        )}
      </div>
      <Heading className="mt-5 font-display text-lg font-bold tracking-tight">
        {/* Link estendido: o card inteiro é clicável sem aninhar elementos interativos. */}
        <Link href={categoryPath(category.slug)} className="after:absolute after:inset-0">
          {category.name}
        </Link>
      </Heading>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{category.description}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 transition group-hover:text-primary">
        Explorar
        <Icon name="arrowRight" className="size-4 transition group-hover:translate-x-1" />
      </span>
    </article>
  );
}
