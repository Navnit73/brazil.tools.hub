import type { Tool } from "@/types/tool";
import { ToolGrid } from "./ToolGrid";

interface RelatedToolsProps {
  tools: Tool[];
}

export function RelatedTools({ tools }: RelatedToolsProps) {
  if (tools.length === 0) return null;
  return (
    <section aria-labelledby="ferramentas-relacionadas" className="mt-12">
      <h2 id="ferramentas-relacionadas" className="text-xl font-bold">
        Ferramentas relacionadas
      </h2>
      <div className="mt-4">
        <ToolGrid tools={tools} headingLevel="h3" showCategory />
      </div>
    </section>
  );
}
