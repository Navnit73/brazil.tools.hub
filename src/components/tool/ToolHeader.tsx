import { PageHeader } from "@/components/layout/PageHeader";
import type { Tool } from "@/types/tool";

interface ToolHeaderProps {
  tool: Pick<Tool, "name" | "h1" | "description">;
}

export function ToolHeader({ tool }: ToolHeaderProps) {
  return <PageHeader title={tool.h1 ?? tool.name} description={tool.description} />;
}
