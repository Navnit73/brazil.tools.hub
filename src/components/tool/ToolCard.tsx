import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { getCategory } from "@/data/categories";
import { toolPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { Tool } from "@/types/tool";
import { categoryVisuals } from "./categoryVisuals";

interface ToolCardProps {
  tool: Tool;
  headingLevel?: "h2" | "h3";
  showCategory?: boolean;
}

export function ToolCard({ tool, headingLevel: Heading = "h3", showCategory = false }: ToolCardProps) {
  const visual = categoryVisuals[tool.category];

  return (
    <article className="group relative flex h-full flex-col rounded-[1.25rem] border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_24px_48px_-20px_rgb(15_23_42/0.25)]">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-[0.75rem] bg-linear-to-br text-white shadow-md ring-1 ring-inset ring-white/20",
            visual.gradient,
            visual.glow,
          )}
        >
          <Icon name={visual.icon} className="size-5" />
        </span>
        {showCategory && (
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold text-slate-700", visual.soft)}>
            {getCategory(tool.category)?.shortName}
          </span>
        )}
        <span
          aria-hidden="true"
          className="ml-auto grid size-8 place-items-center rounded-full border border-slate-200 text-slate-400 transition group-hover:border-primary group-hover:bg-primary group-hover:text-white"
        >
          <Icon name="arrowRight" className="size-4 -rotate-45 transition group-hover:rotate-0" />
        </span>
      </div>
      <Heading className="mt-5 font-display text-base font-bold tracking-tight sm:text-lg">
        <Link href={toolPath(tool)} className="after:absolute after:inset-0">
          {tool.name}
        </Link>
      </Heading>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{tool.description}</p>
    </article>
  );
}
