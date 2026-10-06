"use client";

import { ToolProgress } from "@/components/tool/ToolProgress";
import { ToolStatus } from "@/components/tool/ToolStatus";
import type { usePdfTask } from "../hooks/usePdfTask";
import type { NamedBlob } from "../lib/zip";
import { ResultDownloads } from "./ResultDownloads";

interface TaskResultProps {
  task: ReturnType<typeof usePdfTask>;
  /** Ex.: "Juntando" → "Juntando 2 de 5…". */
  progressLabel: string;
  successMessage: (outputs: NamedBlob[]) => string;
  zipName?: string;
  originalSize?: number;
}

/** Progresso, erro ou downloads de uma tarefa de PDF. */
export function TaskResult({ task, progressLabel, successMessage, zipName, originalSize }: TaskResultProps) {
  return (
    <div aria-live="polite" className="flex flex-col gap-3 empty:hidden">
      {task.running &&
        (task.progress ? (
          <ToolProgress
            label={`${progressLabel} ${Math.min(task.progress.done + 1, task.progress.total)} de ${task.progress.total}…`}
            value={task.progress.done}
            max={task.progress.total}
          />
        ) : (
          <p role="status" className="flex items-center gap-2 text-sm font-medium">
            <span className="loading loading-spinner loading-sm" aria-hidden="true" /> {progressLabel}…
          </p>
        ))}
      {task.error && <ToolStatus kind="error">{task.error}</ToolStatus>}
      {task.outputs && task.outputs.length > 0 && (
        <ResultDownloads outputs={task.outputs} message={successMessage(task.outputs)} zipName={zipName} originalSize={originalSize} />
      )}
    </div>
  );
}
