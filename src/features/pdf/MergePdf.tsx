"use client";

import { useEffect, useRef, useState } from "react";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolStatus } from "@/components/tool/ToolStatus";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatBytes, renameFile } from "@/lib/file";
import { cn } from "@/lib/utils";
import { ActionBar, RunButton } from "./components/ActionBar";
import { PdfIcon } from "./components/icons";
import { PageAction } from "./components/PageCard";
import { PageThumbnail } from "./components/PageThumbnail";
import { TaskResult } from "./components/TaskResult";
import { moveItem, useDragReorder } from "./hooks/useDragReorder";
import { usePdfTask } from "./hooks/usePdfTask";
import { PDF_ACCEPT, PDF_INPUT_HINT, PdfPasswordError, validatePdfFile } from "./lib/document";
import { mergePdfs } from "./lib/operations";
import { openPdf, type PDFDocumentProxy } from "./lib/render";
import { disposePdf } from "./lib/thumbnails";

const MAX_FILES = 50;

interface MergeItem {
  id: number;
  file: File;
  doc?: PDFDocumentProxy;
  status: "loading" | "ready" | "error";
  error?: string;
}

let nextId = 0;

export default function MergePdf() {
  const [items, setItems] = useState<MergeItem[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const task = usePdfTask();
  const docs = useRef(new Map<number, PDFDocumentProxy>());
  /** Itens ainda na lista; um PDF que termina de abrir depois de removido é fechado na hora. */
  const alive = useRef(new Set<number>());

  // Fecha todos os documentos ao sair da página.
  useEffect(() => {
    const open = docs.current;
    const live = alive.current;
    return () => {
      live.clear();
      open.forEach(disposePdf);
    };
  }, []);

  function update(id: number, patch: Partial<MergeItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function addFiles(files: File[]) {
    const problems: string[] = [];
    const accepted: MergeItem[] = [];
    for (const file of files) {
      const problem = validatePdfFile(file);
      if (problem) problems.push(problem);
      else accepted.push({ id: nextId++, file, status: "loading" });
    }
    const room = Math.max(0, MAX_FILES - items.length);
    if (accepted.length > room) problems.push(`limite de ${MAX_FILES} arquivos por vez`);
    const added = accepted.slice(0, room);

    setItems((current) => [...current, ...added]);
    setNotice(problems.length > 0 ? `Alguns arquivos foram ignorados — ${problems.join("; ")}.` : null);
    task.reset();

    for (const item of added) {
      alive.current.add(item.id);
      openPdf(item.file).then(
        (doc) => {
          if (!alive.current.has(item.id)) return disposePdf(doc);
          docs.current.set(item.id, doc);
          update(item.id, { doc, status: "ready" });
        },
        (error) =>
          update(item.id, {
            status: "error",
            error:
              error instanceof PdfPasswordError ? "Protegido por senha — desbloqueie antes de juntar." : "Não foi possível abrir este PDF.",
          }),
      );
    }
  }

  function remove(id: number) {
    const doc = docs.current.get(id);
    if (doc) disposePdf(doc);
    docs.current.delete(id);
    alive.current.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
    task.reset();
  }

  function clear() {
    docs.current.forEach(disposePdf);
    docs.current.clear();
    alive.current.clear();
    setItems([]);
    setNotice(null);
    task.reset();
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length) return;
    setItems((current) => moveItem(current, from, to));
    task.reset();
  }

  function sortByName() {
    setItems((current) => [...current].sort((a, b) => a.file.name.localeCompare(b.file.name, "pt-BR", { numeric: true })));
    task.reset();
  }

  const drag = useDragReorder(move, task.running);
  const ready = items.filter((item) => item.status === "ready");
  const totalPages = ready.reduce((sum, item) => sum + (item.doc?.numPages ?? 0), 0);
  const hasProblems = items.some((item) => item.status === "error");
  const loading = items.some((item) => item.status === "loading");
  const canMerge = items.length >= 2 && !hasProblems && !loading;

  function merge() {
    const files = items.map((item) => item.file);
    void task.run(async ({ report }) => {
      report(0, files.length);
      const blob = await mergePdfs(files, (done) => report(done, files.length));
      return [{ name: renameFile(files[0].name, "pdf", "-unido"), blob }];
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <FileDropzone
        accept={PDF_ACCEPT}
        multiple
        compact={items.length > 0}
        disabled={task.running}
        label={items.length > 0 ? "Adicionar mais PDFs" : "Escolha os arquivos PDF"}
        hint={items.length > 0 ? `Até ${MAX_FILES} arquivos.` : PDF_INPUT_HINT}
        onFiles={addFiles}
      />
      {notice && <ToolStatus kind="info">{notice}</ToolStatus>}

      {items.length === 0 ? (
        <EmptyState title="Nenhum PDF selecionado">Escolha dois ou mais arquivos. Você poderá mudar a ordem antes de juntar.</EmptyState>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium">Ordem dos arquivos</h2>
            <button type="button" className="btn btn-ghost btn-sm min-h-9" onClick={sortByName} disabled={task.running || items.length < 2}>
              Ordenar por nome
            </button>
          </div>
          <p className="-mt-2 text-xs text-md-on-surface-variant">
            Arraste ou use as setas para mudar a ordem. O primeiro da lista abre o documento final.
          </p>

          <ol className="flex flex-col gap-2">
            {items.map((item, index) => (
              <li
                key={item.id}
                {...drag.itemProps(index)}
                className={cn(
                  "flex items-center gap-3 rounded-m-md bg-md-surface-low p-2 transition-shadow",
                  drag.dragging === index && "opacity-50",
                  drag.over === index && drag.dragging !== index && "ring-2 ring-primary",
                )}
              >
                <span aria-hidden="true" className="hidden cursor-grab text-md-on-surface-variant sm:block">
                  <PdfIcon name="grip" />
                </span>
                <span className="w-5 shrink-0 text-center text-sm font-semibold tabular-nums text-md-on-surface-variant">{index + 1}</span>
                <div className="w-12 shrink-0 sm:w-14">
                  {item.doc ? (
                    <PageThumbnail doc={item.doc} pageNumber={1} />
                  ) : (
                    <div className="grid aspect-[3/4] place-items-center rounded-m-sm bg-md-surface-high text-md-on-surface-variant">
                      {item.status === "loading" ? (
                        <span className="loading loading-spinner loading-xs" aria-hidden="true" />
                      ) : (
                        <PdfIcon name="file" />
                      )}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-medium" title={item.file.name}>
                    {item.file.name}
                  </p>
                  <p className={cn("text-xs", item.status === "error" ? "text-error" : "text-md-on-surface-variant")}>
                    {item.status === "error"
                      ? item.error
                      : `${formatBytes(item.file.size)}${item.doc ? ` · ${item.doc.numPages} ${item.doc.numPages === 1 ? "página" : "páginas"}` : ""}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center">
                  <PageAction
                    label={`Mover ${item.file.name} para cima`}
                    onClick={() => move(index, index - 1)}
                    disabled={task.running || index === 0}
                  >
                    <PdfIcon name="arrowUp" className="size-4" />
                  </PageAction>
                  <PageAction
                    label={`Mover ${item.file.name} para baixo`}
                    onClick={() => move(index, index + 1)}
                    disabled={task.running || index === items.length - 1}
                  >
                    <PdfIcon name="arrowDown" className="size-4" />
                  </PageAction>
                  <PageAction label={`Remover ${item.file.name}`} onClick={() => remove(item.id)} disabled={task.running}>
                    <PdfIcon name="close" className="size-4" />
                  </PageAction>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

      <TaskResult
        task={task}
        progressLabel="Juntando arquivo"
        successMessage={() => `Pronto! ${items.length} arquivos unidos em um PDF de ${totalPages} páginas.`}
      />

      {items.length > 0 && (
        <ActionBar
          summary={
            items.length < 2
              ? "Adicione pelo menos mais um PDF."
              : hasProblems
                ? "Remova os arquivos com problema para continuar."
                : `${items.length} arquivos · ${totalPages} páginas no total`
          }
        >
          <button type="button" className="btn btn-ghost min-h-12" onClick={clear} disabled={task.running}>
            Limpar
          </button>
          <RunButton running={task.running} disabled={!canMerge} onClick={merge}>
            Juntar {items.length >= 2 ? `${items.length} PDFs` : "PDFs"}
          </RunButton>
        </ActionBar>
      )}
    </div>
  );
}
