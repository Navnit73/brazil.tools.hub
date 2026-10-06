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
    <article className="group relative flex h-full gap-4 rounded-sm border border-border bg-background p-4 shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_32px_-12px_rgb(21_128_61/0.25)]">
      <span aria-hidden="true" className={cn("grid size-10 shrink-0 place-items-center rounded-sm ring-1 ring-inset", visual.tile)}>
        <Icon name={visual.icon} className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        {showCategory && (
          <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
            {getCategory(tool.category)?.shortName}
          </p>
        )}
        <Heading className="text-base font-semibold tracking-tight">
          <Link href={toolPath(tool)} className="after:absolute after:inset-0 group-hover:text-primary">
            {tool.name}
          </Link>
        </Heading>
        <p className="mt-1 text-sm text-muted">{tool.description}</p>
      </div>
      <Icon
        name="arrowRight"
        className="mt-1 size-4 shrink-0 text-muted opacity-0 transition group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100"
      />
    </article>
  );
}
