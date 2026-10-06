"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolStatus } from "@/components/tool/ToolStatus";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { renameFile } from "@/lib/file";
import { cn } from "@/lib/utils";
import { moveItem, useDragReorder } from "../hooks/useDragReorder";
import { usePdfFile } from "../hooks/usePdfFile";
import { usePdfTask } from "../hooks/usePdfTask";
import { PDF_ACCEPT, PdfPasswordError, validatePdfFile } from "../lib/document";
import { normalizeRotation, organizePdf, type PlannedPage } from "../lib/operations";
import { docKey, openPdf, type PDFDocumentProxy } from "../lib/render";
import { disposePdf } from "../lib/thumbnails";
import { ActionBar, RunButton } from "./ActionBar";
import { PdfIcon } from "./icons";
import { PageAction, PageCard, PageGrid } from "./PageCard";
import { PdfFileGate } from "./PdfFileGate";
import { TaskResult } from "./TaskResult";

type Variant = "organize" | "add";

interface Source {
  file: File;
  doc: PDFDocumentProxy;
}

type EditorPage = { id: number; rotation: number } & ({ kind: "page"; source: number; index: number } | { kind: "blank" });

/** A4 em pontos. */
const BLANK_SIZE: [number, number] = [595.28, 841.89];
const SOURCE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

let nextPageId = 0;

/**
 * Organizar PDF e Adicionar páginas: a mesma grade de páginas para reordenar,
 * girar, excluir e inserir páginas de outros PDFs ou em branco.
 */
export function OrganizeTool({ variant }: { variant: Variant }) {
  const pdf = usePdfFile();
  return (
    <PdfFileGate pdf={pdf} label={variant === "add" ? "Escolha o PDF que vai receber as páginas" : "Escolha o PDF para organizar"}>
      {pdf.doc && pdf.file && <OrganizeEditor key={docKey(pdf.doc)} variant={variant} main={{ file: pdf.file, doc: pdf.doc }} />}
    </PdfFileGate>
  );
}

function pagesOf(source: number, count: number): EditorPage[] {
  return Array.from({ length: count }, (_, index) => ({ id: nextPageId++, kind: "page", source, index, rotation: 0 }));
}

const positionOptions = [
  { value: "end", label: "No final" },
  { value: "start", label: "No início" },
  { value: "after", label: "Depois da página…" },
] as const;

function OrganizeEditor({ variant, main }: { variant: Variant; main: Source }) {
  const id = useId();
  const task = usePdfTask();
  const [sources, setSources] = useState<Source[]>([main]);
  const [pages, setPages] = useState<EditorPage[]>(() => pagesOf(0, main.doc.numPages));
  const [position, setPosition] = useState<"end" | "start" | "after">("end");
  const [afterPage, setAfterPage] = useState(1);
  const [notice, setNotice] = useState<{ kind: "info" | "error"; text: string } | null>(null);
  const [adding, setAdding] = useState(false);
  const extraDocs = useRef<PDFDocumentProxy[]>([]);

  // O PDF principal é do usePdfFile; os adicionados aqui são fechados ao sair.
  useEffect(() => {
    const opened = extraDocs.current;
    return () =>
      opened.forEach((doc) => {
        disposePdf(doc);
      });
  }, []);

  function change(next: EditorPage[]) {
    setPages(next);
    task.reset();
  }

  /** Onde entram as páginas novas, conforme a escolha do usuário (sempre "no final" ao organizar). */
  function insertionIndex(): number {
    if (variant === "organize" || position === "end") return pages.length;
    if (position === "start") return 0;
    return Math.min(Math.max(afterPage, 0), pages.length);
  }

  function insert(added: EditorPage[]) {
    const at = insertionIndex();
    change([...pages.slice(0, at), ...added, ...pages.slice(at)]);
  }

  async function addPdfs(files: File[]) {
    setNotice(null);
    setAdding(true);
    const problems: string[] = [];
    const opened: Source[] = [];
    for (const file of files) {
      const problem = validatePdfFile(file);
      if (problem) {
        problems.push(problem);
        continue;
      }
      try {
        const doc = await openPdf(file);
        extraDocs.current.push(doc);
        opened.push({ file, doc });
      } catch (error) {
        problems.push(`${file.name}: ${error instanceof PdfPasswordError ? "protegido por senha" : "não foi possível abrir"}`);
      }
    }
    setAdding(false);

    if (opened.length > 0) {
      const first = sources.length;
      setSources([...sources, ...opened]);
      insert(opened.flatMap((source, offset) => pagesOf(first + offset, source.doc.numPages)));
      const count = opened.reduce((sum, source) => sum + source.doc.numPages, 0);
      if (problems.length === 0)
        setNotice({ kind: "info", text: `${count} ${count === 1 ? "página adicionada" : "páginas adicionadas"}.` });
    }
    if (problems.length > 0) setNotice({ kind: "error", text: `Alguns arquivos foram ignorados — ${problems.join("; ")}.` });
  }

  function addBlank() {
    insert([{ id: nextPageId++, kind: "blank", rotation: 0 }]);
    setNotice({ kind: "info", text: "Página em branco adicionada." });
  }

  const move = (from: number, to: number) => to >= 0 && to < pages.length && change(moveItem(pages, from, to));
  const rotate = (index: number) => change(pages.map((page, i) => (i === index ? { ...page, rotation: page.rotation + 90 } : page)));
  const remove = (index: number) => change(pages.filter((_, i) => i !== index));
  const drag = useDragReorder(move, task.running);

  const multipleSources = sources.length > 1;
  const edited =
    pages.length !== main.doc.numPages ||
    pages.some(
      (page, index) => page.kind !== "page" || page.source !== 0 || page.index !== index || normalizeRotation(page.rotation) !== 0,
    );

  function save() {
    const plan: PlannedPage[] = pages.map((page) => {
      const rotation = normalizeRotation(page.rotation);
      if (page.kind === "page") return { kind: "page", source: page.source, index: page.index, rotation };
      const [width, height] = rotation % 180 === 0 ? BLANK_SIZE : [BLANK_SIZE[1], BLANK_SIZE[0]];
      return { kind: "blank", width, height };
    });
    const files = sources.map((source) => source.file);
    void task.run(async () => [
      { name: renameFile(main.file.name, "pdf", variant === "add" ? "-com-paginas" : "-organizado"), blob: await organizePdf(files, plan) },
    ]);
  }

  function restore() {
    change(pagesOf(0, main.doc.numPages));
    setNotice(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-m-md bg-md-surface-low p-3 sm:p-4">
        <p className="text-sm font-medium">{variant === "add" ? "Adicionar páginas" : "Inserir páginas (opcional)"}</p>

        {variant === "add" && (
          <div className="flex flex-wrap items-end gap-3">
            <SegmentedControl
              label="Onde inserir"
              options={positionOptions}
              value={position}
              onChange={setPosition}
              disabled={task.running}
            />
            {position === "after" && (
              <div className="flex flex-col gap-1 text-sm">
                <label htmlFor={`${id}-after`} className="sr-only">
                  Número da página
                </label>
                <input
                  id={`${id}-after`}
                  type="number"
                  min={1}
                  max={pages.length}
                  inputMode="numeric"
                  value={Number.isNaN(afterPage) ? "" : afterPage}
                  onChange={(event) => setAfterPage(event.target.valueAsNumber)}
                  className="input min-h-10 w-24"
                />
              </div>
            )}
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <FileDropzone
            accept={PDF_ACCEPT}
            multiple
            compact
            disabled={task.running || adding}
            label={adding ? "Abrindo…" : "Adicionar páginas de outro PDF"}
            onFiles={(files) => void addPdfs(files)}
          />
          <button type="button" className="btn min-h-20 sm:min-h-full" onClick={addBlank} disabled={task.running}>
            <PdfIcon name="plus" /> Página em branco
          </button>
        </div>
        {notice && <ToolStatus kind={notice.kind}>{notice.text}</ToolStatus>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-md-on-surface-variant">Arraste as páginas ou use as setas para mudar a ordem.</p>
        <div className="flex gap-1">
          <button
            type="button"
            className="btn btn-ghost btn-sm min-h-9"
            onClick={() => change([...pages].reverse())}
            disabled={task.running || pages.length < 2}
          >
            Inverter ordem
          </button>
          {edited && (
            <button type="button" className="btn btn-ghost btn-sm min-h-9" onClick={restore} disabled={task.running}>
              Desfazer tudo
            </button>
          )}
        </div>
      </div>

      <TaskResult
        task={task}
        progressLabel="Montando o PDF"
        successMessage={() => `Pronto! Seu PDF tem ${pages.length} ${pages.length === 1 ? "página" : "páginas"}.`}
      />

      {pages.length === 0 ? (
        <p className="rounded-m-md bg-md-surface-low p-6 text-center text-sm">
          Todas as páginas foram removidas.{" "}
          <button type="button" className="link font-semibold" onClick={restore}>
            Restaurar o PDF original
          </button>
        </p>
      ) : (
        <PageGrid label="Páginas do novo PDF" wide>
          {pages.map((page, index) => {
            const source = page.kind === "page" ? sources[page.source] : null;
            const origin =
              page.kind === "blank" ? "Em branco" : multipleSources ? `${SOURCE_LETTERS[page.source % 26]}${page.index + 1}` : null;
            const name = `página ${index + 1}`;
            return (
              <PageCard
                key={page.id}
                doc={source?.doc}
                pageNumber={page.kind === "page" ? page.index + 1 : 1}
                rotation={page.rotation}
                label={index + 1}
                itemProps={drag.itemProps(index)}
                className={cn(
                  "cursor-grab",
                  drag.dragging === index && "opacity-50",
                  drag.over === index && drag.dragging !== index && "rounded-m-sm outline-2 outline-offset-2 outline-primary",
                )}
                badge={
                  origin && (
                    <span className="rounded-full bg-md-inverse-surface px-2 py-0.5 text-[0.6875rem] font-semibold text-white shadow-sm">
                      {origin}
                    </span>
                  )
                }
                actions={
                  <>
                    <PageAction
                      label={`Mover ${name} para trás`}
                      onClick={() => move(index, index - 1)}
                      disabled={task.running || index === 0}
                    >
                      <PdfIcon name="arrowLeft" className="size-4" />
                    </PageAction>
                    <PageAction label={`Girar ${name}`} onClick={() => rotate(index)} disabled={task.running}>
                      <PdfIcon name="rotateRight" className="size-4" />
                    </PageAction>
                    <PageAction label={`Excluir ${name}`} onClick={() => remove(index)} disabled={task.running}>
                      <PdfIcon name="trash" className="size-4" />
                    </PageAction>
                    <PageAction
                      label={`Mover ${name} para frente`}
                      onClick={() => move(index, index + 1)}
                      disabled={task.running || index === pages.length - 1}
                    >
                      <PdfIcon name="arrowRight" className="size-4" />
                    </PageAction>
                  </>
                }
              />
            );
          })}
        </PageGrid>
      )}

      {multipleSources && (
        <ul className="flex flex-col gap-1 text-xs text-md-on-surface-variant" aria-label="Arquivos de origem">
          {sources.map((source, index) => (
            <li key={index} className="truncate">
              <strong>{SOURCE_LETTERS[index % 26]}</strong> = {source.file.name}
            </li>
          ))}
        </ul>
      )}

      <ActionBar
        summary={
          pages.length === 0
            ? "Mantenha pelo menos uma página."
            : `${pages.length} ${pages.length === 1 ? "página" : "páginas"} no novo PDF`
        }
      >
        <RunButton running={task.running} disabled={pages.length === 0 || !edited} onClick={save}>
          Salvar PDF
        </RunButton>
      </ActionBar>
    </div>
  );
}
