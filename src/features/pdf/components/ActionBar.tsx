import type { ReactNode } from "react";

interface ActionBarProps {
  /** Resumo do que será feito (ex.: "3 de 12 páginas selecionadas"). */
  summary?: ReactNode;
  children: ReactNode;
}

/**
 * Barra de ações presa ao fim da tela: o botão principal continua ao alcance
 * enquanto a pessoa rola uma lista longa de páginas.
 */
export function ActionBar({ summary, children }: ActionBarProps) {
  return (
    <div className="sticky bottom-0 z-10 -mx-3 -mb-3 flex flex-wrap items-center gap-3 border-t border-md-outline-variant bg-md-surface-lowest/95 px-3 py-3 backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6">
      {summary && <p className="min-w-0 flex-1 basis-40 text-sm text-md-on-surface-variant">{summary}</p>}
      <div className="flex flex-1 flex-wrap justify-end gap-2 sm:flex-none">{children}</div>
    </div>
  );
}

interface RunButtonProps {
  running: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function RunButton({ running, disabled, onClick, children }: RunButtonProps) {
  return (
    <button type="button" className="btn btn-primary min-h-12 flex-1 sm:flex-none" disabled={disabled || running} onClick={onClick}>
      {running && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
      {children}
    </button>
  );
}
