"use client";

import { toolComponents, type ToolComponentKey } from "@/features";

interface ToolWidgetProps {
  component: ToolComponentKey;
}

/** Renderiza o componente interativo da ferramenta, carregado em um chunk próprio. */
export function ToolWidget({ component }: ToolWidgetProps) {
  const Component = toolComponents[component];
  return <Component />;
}
