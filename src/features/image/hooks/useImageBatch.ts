"use client";

import { useCallback, useRef, useState } from "react";
import { matchesAccept } from "@/lib/file";
import { IMAGE_INPUT_ACCEPT, MAX_INPUT_BYTES } from "../lib/formats";
import type { ProcessedImage } from "../lib/process";

export type BatchItemStatus = "pending" | "processing" | "done" | "error";

export interface BatchItem {
  id: string;
  file: File;
  status: BatchItemStatus;
  result?: ProcessedImage;
  error?: string;
}

export interface BatchProgress {
  done: number;
  total: number;
}

export const MAX_BATCH_FILES = 20;

let nextId = 0;

/**
 * Lista de imagens processadas uma a uma (para não estourar a memória do celular),
 * com progresso, cancelamento e resultado por arquivo. Base de qualquer ferramenta em lote.
 */
export function useImageBatch() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const cancelled = useRef(false);

  const update = (id: string, patch: Partial<BatchItem>) =>
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const addFiles = useCallback(
    (files: File[]) => {
      const accepted: File[] = [];
      const problems: string[] = [];
      for (const file of files) {
        if (!matchesAccept(file, IMAGE_INPUT_ACCEPT)) problems.push(`${file.name}: formato não suportado`);
        else if (file.size > MAX_INPUT_BYTES) problems.push(`${file.name}: maior que 50 MB`);
        else accepted.push(file);
      }

      const room = Math.max(0, MAX_BATCH_FILES - items.length);
      if (accepted.length > room) problems.push(`limite de ${MAX_BATCH_FILES} imagens por vez`);
      const added: BatchItem[] = accepted.slice(0, room).map((file) => ({ id: `img-${nextId++}`, file, status: "pending" }));
      // Novos arquivos invalidam resultados anteriores para manter a lista coerente.
      setItems([...items.map(resetItem), ...added]);
      setProgress(null);
      setNotice(problems.length > 0 ? `Alguns arquivos foram ignorados — ${problems.join("; ")}.` : null);
    },
    [items],
  );

  const remove = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setProgress(null);
    setNotice(null);
  }, []);

  /** Descarta resultados (ex.: ao mudar uma configuração), mantendo os arquivos. */
  const resetResults = useCallback(() => {
    setItems((current) => (current.some((item) => item.status !== "pending") ? current.map(resetItem) : current));
    setProgress(null);
  }, []);

  const run = useCallback(
    async (process: (file: File) => Promise<ProcessedImage>) => {
      const queue = items.map(resetItem);
      setItems(queue);
      setNotice(null);
      cancelled.current = false;
      setRunning(true);
      setProgress({ done: 0, total: queue.length });

      for (const [index, item] of queue.entries()) {
        if (cancelled.current) break;
        update(item.id, { status: "processing" });
        // Deixa o navegador pintar o estado antes do trabalho pesado.
        await new Promise((resolve) => setTimeout(resolve, 0));
        try {
          const result = await process(item.file);
          update(item.id, { status: "done", result });
        } catch (error) {
          update(item.id, { status: "error", error: error instanceof Error ? error.message : "Erro inesperado." });
        }
        setProgress({ done: index + 1, total: queue.length });
      }

      setRunning(false);
      if (cancelled.current) {
        setItems((current) => current.map((item) => (item.status === "processing" ? resetItem(item) : item)));
        setProgress(null);
        setNotice("Processamento cancelado.");
      }
    },
    [items],
  );

  const cancel = useCallback(() => {
    cancelled.current = true;
  }, []);

  return { items, progress, running, notice, addFiles, remove, clear, resetResults, run, cancel };
}

function resetItem(item: BatchItem): BatchItem {
  return item.status === "pending" ? item : { id: item.id, file: item.file, status: "pending" };
}
