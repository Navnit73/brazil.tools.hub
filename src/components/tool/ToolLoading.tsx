/** Esqueleto com altura fixa para evitar layout shift enquanto a ferramenta carrega. */
export function ToolLoading() {
  return (
    <div role="status" className="flex min-h-80 items-center justify-center rounded-sm border border-border bg-surface">
      <span className="loading loading-spinner loading-md text-primary" aria-hidden="true" />
      <span className="sr-only">Carregando ferramenta…</span>
    </div>
  );
}
