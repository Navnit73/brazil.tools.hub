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
    <article className="relative cursor-pointer has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-primary flex h-full flex-col rounded-m-md bg-md-surface-low p-5 text-md-on-surface sm:p-6">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className={cn("grid size-11 shrink-0 place-items-center rounded-m-lg", visual.tone)}>
          <Icon name={visual.icon} className="size-5" />
        </span>
        {showCategory && (
          <span className="inline-flex h-6 items-center rounded-m-sm border border-md-outline-variant px-2 text-xs font-medium text-md-on-surface-variant">
            {getCategory(tool.category)?.shortName}
          </span>
        )}
        <span
          aria-hidden="true"
          className="ml-auto grid size-10 place-items-center rounded-m-sm text-md-on-surface-variant"
        >
          <Icon name="arrowRight" className="size-5" />
        </span>
      </div>
      <Heading className="mt-4 font-display text-base font-medium sm:text-lg">
        <Link href={toolPath(tool)} className="after:absolute after:inset-0 focus-visible:outline-none">
          {tool.name}
        </Link>
      </Heading>
      <p className="mt-1 text-sm leading-relaxed text-md-on-surface-variant">{tool.description}</p>
    </article>
  );
}
