/** Esqueleto com altura fixa para evitar layout shift enquanto a ferramenta carrega. */
export function ToolLoading() {
  return (
    <div role="status" className="flex min-h-80 items-center justify-center rounded-m-md bg-md-surface-low">
      <span className="loading loading-spinner loading-md text-primary" aria-hidden="true" />
      <span className="sr-only">Carregando ferramenta…</span>
    </div>
  );
}
