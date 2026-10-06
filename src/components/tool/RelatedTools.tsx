import type { Tool } from "@/types/tool";
import { ToolGrid } from "./ToolGrid";

interface RelatedToolsProps {
  tools: Tool[];
}

export function RelatedTools({ tools }: RelatedToolsProps) {
  if (tools.length === 0) return null;
  return (
    <section aria-labelledby="ferramentas-relacionadas" className="mt-14 sm:mt-20">
      <p className="text-sm font-medium text-primary">Continue com</p>
      <h2 id="ferramentas-relacionadas" className="mt-2 font-display text-[1.75rem] font-normal leading-tight sm:text-4xl">
        Ferramentas relacionadas
      </h2>
      <div className="mt-8">
        <ToolGrid tools={tools} headingLevel="h3" showCategory />
      </div>
    </section>
  );
}
