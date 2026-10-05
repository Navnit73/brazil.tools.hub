import type { ReactNode } from "react";

interface ToolOutputProps {
  title?: string;
  /** Mostrado enquanto não há resultado. */
  placeholder?: string;
  children?: ReactNode;
}

/** Região anunciada por leitores de tela quando o resultado muda. */
export function ToolOutput({ title = "Resultado", placeholder = "O resultado aparecerá aqui.", children }: ToolOutputProps) {
  return (
    <section aria-label={title} aria-live="polite" className="rounded-sm border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-2 text-sm">{children ?? <p className="text-muted">{placeholder}</p>}</div>
    </section>
  );
}
