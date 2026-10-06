"use client";

import { downloadBlob, formatBytes } from "@/lib/file";
import { cn } from "@/lib/utils";
import type { BatchItem } from "../hooks/useImageBatch";
import { BlobImage } from "./BlobImage";

interface ImageBatchListProps {
  items: BatchItem[];
  /** Permite remover arquivos (desativado durante o processamento). */
  onRemove?: (id: string) => void;
}

/** Lista de imagens com estado, tamanho antes/depois e download por arquivo. */
export function ImageBatchList({ items, onRemove }: ImageBatchListProps) {
  const done = items.filter((item) => item.status === "done" && item.result);
  const before = done.reduce((sum, item) => sum + item.file.size, 0);
  const after = done.reduce((sum, item) => sum + item.result!.blob.size, 0);

  async function downloadAll() {
    for (const item of done) {
      downloadBlob(item.result!.blob, item.result!.fileName);
      // Pequeno intervalo: alguns navegadores ignoram vários downloads simultâneos.
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {done.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm bg-primary-light p-3 text-sm">
          <p>
            <strong>{done.length} imagens prontas.</strong> Total: {formatBytes(before)} → {formatBytes(after)}
            <SavingsText before={before} after={after} />
          </p>
          <button type="button" className="btn btn-primary btn-sm min-h-11" onClick={downloadAll}>
            Baixar todas
          </button>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <BatchRow key={item.id} item={item} onRemove={onRemove} />
        ))}
      </ul>
    </div>
  );
}

function BatchRow({ item, onRemove }: { item: BatchItem; onRemove?: (id: string) => void }) {
  const { result } = item;

  return (
    <li className="flex items-center gap-3 rounded-sm border border-border bg-background p-2">
      <div className="size-14 shrink-0 overflow-hidden rounded-sm bg-surface">
        <BlobImage blob={item.file} loading="lazy" className="size-full object-cover" />
      </div>

      <div className="min-w-0 flex-1 text-sm">
        <p className="truncate font-medium" title={item.file.name}>
          {item.file.name}
        </p>
        <p className={cn("text-xs", item.status === "error" ? "text-error" : "text-muted")}>
          {item.status === "pending" && formatBytes(item.file.size)}
          {item.status === "processing" && (
            <span className="inline-flex items-center gap-1">
              <span className="loading loading-spinner loading-xs" aria-hidden="true" /> Processando…
            </span>
          )}
          {item.status === "error" && item.error}
          {item.status === "done" && result && (
            <>
              {formatBytes(item.file.size)} → <strong className="text-text">{formatBytes(result.blob.size)}</strong>
              {result.keptOriginal ? " · já estava otimizada" : <SavingsText before={item.file.size} after={result.blob.size} />}
              <span className="block">
                {result.width} × {result.height} px
              </span>
            </>
          )}
        </p>
      </div>

      {item.status === "done" && result ? (
        <button
          type="button"
          className="btn btn-primary btn-sm min-h-11"
          onClick={() => downloadBlob(result.blob, result.fileName)}
          aria-label={`Baixar ${result.fileName}`}
        >
          Baixar
        </button>
      ) : (
        onRemove &&
        item.status !== "processing" && (
          <button
            type="button"
            className="btn btn-ghost btn-sm min-h-11 min-w-11"
            onClick={() => onRemove(item.id)}
            aria-label={`Remover ${item.file.name}`}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        )
      )}
    </li>
  );
}

function SavingsText({ before, after }: { before: number; after: number }) {
  if (before === 0) return null;
  const change = Math.round((1 - after / before) * 100);
  if (change > 0) return <span className="font-semibold text-primary"> (−{change}%)</span>;
  if (change < 0) return <span> (+{-change}%)</span>;
  return null;
}
