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
    <section aria-label={title} aria-live="polite" className="rounded-m-md bg-md-surface-low p-4">
      <h2 className="text-sm font-medium text-md-on-surface">{title}</h2>
      <div className="mt-2 text-sm">{children ?? <p className="text-md-on-surface-variant">{placeholder}</p>}</div>
    </section>
  );
}
