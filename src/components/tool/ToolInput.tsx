import type { ReactNode } from "react";

interface ToolInputProps {
  title?: string;
  children: ReactNode;
}

export function ToolInput({ title = "Dados de entrada", children }: ToolInputProps) {
  return (
    <section aria-label={title} className="flex flex-col gap-4">
      {children}
    </section>
  );
}
