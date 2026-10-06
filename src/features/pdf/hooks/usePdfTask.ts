"use client";

import { useCallback, useRef, useState } from "react";
import { pdfErrorMessage } from "../lib/document";
import type { NamedBlob } from "../lib/zip";

export interface TaskProgress {
  done: number;
  total: number;
}

export interface TaskContext {
  /** Informa o avanço (ex.: página 3 de 10). */
  report: (done: number, total: number) => void;
  /** `true` depois que o usuário cancela; a tarefa deve parar no próximo passo. */
  cancelled: () => boolean;
}

export class TaskCancelled extends Error {}

/** Estado de uma operação de PDF: executando, progresso, erro e arquivos gerados. */
export function usePdfTask() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<TaskProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<NamedBlob[] | null>(null);
  const cancelledRef = useRef(false);

  const run = useCallback(async (task: (context: TaskContext) => Promise<NamedBlob[]>) => {
    cancelledRef.current = false;
    setRunning(true);
    setError(null);
    setOutputs(null);
    setProgress(null);
    // Deixa o navegador pintar o estado "processando" antes do trabalho pesado.
    await new Promise((resolve) => setTimeout(resolve, 0));
    try {
      const result = await task({
        report: (done, total) => setProgress({ done, total }),
        cancelled: () => cancelledRef.current,
      });
      if (!cancelledRef.current) setOutputs(result);
    } catch (reason) {
      if (!(reason instanceof TaskCancelled)) setError(pdfErrorMessage(reason));
    } finally {
      setRunning(false);
      setProgress(null);
    }
  }, []);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  /** Descarta resultado e erro (ex.: ao mudar uma configuração). */
  const reset = useCallback(() => {
    setOutputs(null);
    setError(null);
  }, []);

  return { running, progress, error, outputs, run, cancel, reset };
}
