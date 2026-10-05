import { PageHeader } from "@/components/layout/PageHeader";
import type { Tool } from "@/types/tool";

interface ToolHeaderProps {
  tool: Pick<Tool, "name" | "description">;
}

export function ToolHeader({ tool }: ToolHeaderProps) {
  return <PageHeader title={tool.name} description={tool.description} />;
}
