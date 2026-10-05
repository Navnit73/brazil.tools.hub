import Link from "next/link";
import { getCategory } from "@/data/categories";
import { toolPath } from "@/lib/routes";
import type { Tool } from "@/types/tool";

interface ToolCardProps {
  tool: Tool;
  headingLevel?: "h2" | "h3";
  showCategory?: boolean;
}

export function ToolCard({ tool, headingLevel: Heading = "h3", showCategory = false }: ToolCardProps) {
  return (
    <article className="group relative flex h-full flex-col rounded-sm border border-border bg-background p-4 hover:border-primary">
      {showCategory && (
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">{getCategory(tool.category)?.shortName}</p>
      )}
      <Heading className="text-base font-semibold">
        <Link href={toolPath(tool)} className="after:absolute after:inset-0 group-hover:text-primary">
          {tool.name}
        </Link>
      </Heading>
      <p className="mt-1 text-sm text-muted">{tool.description}</p>
    </article>
  );
}
