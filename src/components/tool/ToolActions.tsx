import type { ReactNode } from "react";

interface ToolActionsProps {
  children: ReactNode;
  /** Texto auxiliar exibido ao lado das ações (ex.: status). */
  note?: string;
}

export function ToolActions({ children, note }: ToolActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {children}
      {note && <p className="text-sm text-muted">{note}</p>}
    </div>
  );
}
