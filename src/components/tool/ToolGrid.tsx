import type { ComponentProps } from "react";
import type { Tool } from "@/types/tool";
import { ToolCard } from "./ToolCard";

interface ToolGridProps extends Omit<ComponentProps<typeof ToolCard>, "tool"> {
  tools: Tool[];
}

export function ToolGrid({ tools, ...cardProps }: ToolGridProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <li key={`${tool.category}/${tool.slug}`}>
          <ToolCard tool={tool} {...cardProps} />
        </li>
      ))}
    </ul>
  );
}
