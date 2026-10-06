"use client";

import type { ReactNode } from "react";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolActions } from "@/components/tool/ToolActions";
import { ToolInput } from "@/components/tool/ToolInput";
import { ToolProgress } from "@/components/tool/ToolProgress";
import { ToolStatus } from "@/components/tool/ToolStatus";
import { EmptyState } from "@/components/ui/EmptyState";
import { IMAGE_INPUT_ACCEPT, IMAGE_INPUT_HINT } from "../lib/formats";
import type { ProcessedImage } from "../lib/process";
import { MAX_BATCH_FILES, useImageBatch } from "../hooks/useImageBatch";
import { ImageBatchList } from "./ImageBatchList";

interface ImageBatchToolProps {
  batch: ReturnType<typeof useImageBatch>;
  /** Controles específicos da ferramenta (qualidade, formato…). */
  settings: ReactNode;
  /** Verbo do botão principal (ex.: "Comprimir"). */
  actionLabel: string;
  /** Gerúndio para o progresso (ex.: "Comprimindo"). */
  progressLabel: string;
  process: (file: File) => Promise<ProcessedImage>;
  emptyTitle: string;
  /** `false` quando alguma configuração é inválida. */
  canRun?: boolean;
}

/**
 * Estrutura comum às ferramentas que processam várias imagens com as mesmas
 * configurações (comprimir, converter…): seleção, configurações, progresso e resultados.
 */
export function ImageBatchTool({ batch, settings, actionLabel, progressLabel, process, emptyTitle, canRun = true }: ImageBatchToolProps) {
  const { items, progress, running, notice } = batch;
  const count = items.length;
  const finished = !running && progress !== null && progress.done === progress.total;
  const failed = items.filter((item) => item.status === "error").length;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ToolInput>
        <FileDropzone
          accept={IMAGE_INPUT_ACCEPT}
          multiple
          acceptPaste
          compact={count > 0}
          disabled={running}
          label={count > 0 ? "Adicionar mais imagens" : "Escolha suas imagens"}
          hint={count > 0 ? `Até ${MAX_BATCH_FILES} imagens por vez.` : IMAGE_INPUT_HINT}
          onFiles={batch.addFiles}
        />

        {settings}

        <ToolActions>
          <button
            type="button"
            className="btn btn-primary min-h-12 flex-1 sm:flex-none"
            disabled={count === 0 || running || !canRun}
            onClick={() => batch.run(process)}
          >
            {running && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
            {count > 1 ? `${actionLabel} ${count} imagens` : actionLabel}
          </button>
          {running ? (
            <button type="button" className="btn btn-ghost min-h-12" onClick={batch.cancel}>
              Cancelar
            </button>
          ) : (
            count > 0 && (
              <button type="button" className="btn btn-ghost min-h-12" onClick={batch.clear}>
                Limpar
              </button>
            )
          )}
        </ToolActions>
      </ToolInput>

      <section aria-label="Resultado" className="flex flex-col gap-3">
        {running && progress && (
          <ToolProgress
            label={`${progressLabel} ${Math.min(progress.done + 1, progress.total)} de ${progress.total}…`}
            value={progress.done}
            max={progress.total}
          />
        )}
        {notice && <ToolStatus kind="info">{notice}</ToolStatus>}
        {finished && failed === 0 && (
          <ToolStatus kind="success">
            {count === 1 ? "Pronto! Sua imagem está pronta para baixar." : `Pronto! ${count} imagens prontas para baixar.`}
          </ToolStatus>
        )}
        {finished && failed > 0 && (
          <ToolStatus kind="error">
            {failed === count ? "Não foi possível processar as imagens." : `${failed} de ${count} imagens não puderam ser processadas.`}{" "}
            Veja os detalhes abaixo.
          </ToolStatus>
        )}

        {count > 0 ? (
          <ImageBatchList items={items} onRemove={running ? undefined : batch.remove} />
        ) : (
          <EmptyState title={emptyTitle}>As imagens selecionadas e os resultados aparecerão aqui.</EmptyState>
        )}
      </section>
    </div>
  );
}
