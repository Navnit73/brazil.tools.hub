"use client";

import { useId, useState } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { fileBaseName, renameFile } from "@/lib/file";
import { cn } from "@/lib/utils";
import { ActionBar, RunButton } from "./components/ActionBar";
import { PageCard, PageGrid } from "./components/PageCard";
import { PdfFileGate } from "./components/PdfFileGate";
import { TaskResult } from "./components/TaskResult";
import { usePdfFile } from "./hooks/usePdfFile";
import { TaskCancelled, usePdfTask } from "./hooks/usePdfTask";
import { splitPdf } from "./lib/operations";
import { chunkPages, groupLabel, parseRanges } from "./lib/ranges";
import { docKey, type PDFDocumentProxy } from "./lib/render";

type Mode = "each" | "every" | "ranges";

const modeOptions = [
  { value: "each", label: "Uma página por arquivo" },
  { value: "every", label: "A cada N páginas" },
  { value: "ranges", label: "Por intervalos" },
] as const;

/** Cores dos grupos na pré-visualização (repetem a partir do 6º arquivo). */
const groupColors = [
  "bg-primary text-white",
  "bg-sky-700 text-white",
  "bg-amber-600 text-white",
  "bg-fuchsia-700 text-white",
  "bg-slate-700 text-white",
];

export default function SplitPdf() {
  const pdf = usePdfFile();
  return (
    <PdfFileGate pdf={pdf} label="Escolha o PDF para dividir">
      {pdf.doc && pdf.file && <SplitEditor key={docKey(pdf.doc)} doc={pdf.doc} file={pdf.file} />}
    </PdfFileGate>
  );
}

function SplitEditor({ doc, file }: { doc: PDFDocumentProxy; file: File }) {
  const id = useId();
  const pageCount = doc.numPages;
  const task = usePdfTask();
  const [mode, setMode] = useState<Mode>(pageCount > 2 ? "ranges" : "each");
  const [every, setEvery] = useState(Math.max(1, Math.min(2, pageCount - 1)));
  const [ranges, setRanges] = useState(() => defaultRanges(pageCount));

  const parsed = mode === "ranges" ? parseRanges(ranges, pageCount) : null;
  const validEvery = Number.isInteger(every) && every >= 1 && every < pageCount;
  const groups =
    mode === "each" ? chunkPages(pageCount, 1) : mode === "every" ? (validEvery ? chunkPages(pageCount, every) : null) : parsed!.groups;

  // Grupo de cada página para a pré-visualização (o primeiro, se a página aparecer em mais de um).
  const groupOf = new Map<number, number>();
  groups?.forEach((group, groupIndex) => group.forEach((page) => !groupOf.has(page) && groupOf.set(page, groupIndex)));

  function change<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      task.reset();
    };
  }

  function split() {
    if (!groups) return;
    const base = fileBaseName(file.name);
    void task.run(async ({ report, cancelled }) => {
      report(0, groups.length);
      const blobs = await splitPdf(file, groups, (done) => {
        if (cancelled()) throw new TaskCancelled();
        report(done, groups.length);
      });
      return blobs.map((blob, index) => ({ name: `${base}-paginas-${groupLabel(groups[index])}.pdf`, blob }));
    });
  }

  if (pageCount < 2) {
    return <p className="rounded-m-md bg-md-surface-low p-4 text-sm">Este PDF tem só uma página, então não há o que dividir.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl label="Como dividir" options={modeOptions} value={mode} onChange={change(setMode)} disabled={task.running} />

      {mode === "every" && (
        <div className="flex flex-col gap-1 text-sm">
          <label htmlFor={`${id}-every`} className="font-medium">
            Páginas por arquivo
          </label>
          <input
            id={`${id}-every`}
            type="number"
            min={1}
            max={pageCount - 1}
            inputMode="numeric"
            value={Number.isNaN(every) ? "" : every}
            onChange={(event) => change(setEvery)(event.target.valueAsNumber)}
            className="input min-h-11 w-32"
            aria-invalid={!validEvery}
            aria-describedby={`${id}-every-hint`}
          />
          <p id={`${id}-every-hint`} className={validEvery ? "text-xs text-md-on-surface-variant" : "text-xs text-error"}>
            {validEvery ? `Gera ${Math.ceil(pageCount / every)} arquivos.` : `Informe um número entre 1 e ${pageCount - 1}.`}
          </p>
        </div>
      )}

      {mode === "ranges" && (
        <div className="flex flex-col gap-1 text-sm">
          <label htmlFor={`${id}-ranges`} className="font-medium">
            Intervalos (um arquivo para cada)
          </label>
          <input
            id={`${id}-ranges`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Ex.: 1-3, 4-6, 7"
            value={ranges}
            onChange={(event) => change(setRanges)(event.target.value)}
            className="input min-h-11 w-full max-w-md"
            aria-invalid={Boolean(parsed?.error)}
            aria-describedby={`${id}-ranges-hint`}
          />
          <p id={`${id}-ranges-hint`} className={parsed?.error ? "text-xs text-error" : "text-xs text-md-on-surface-variant"}>
            {parsed?.error ?? "Separe os arquivos por vírgula. Exemplo: 1-3, 4-6 gera dois PDFs; 8- vai da página 8 até o fim."}
          </p>
        </div>
      )}

      <TaskResult
        task={task}
        progressLabel="Criando arquivo"
        zipName={renameFile(file.name, "zip", "-dividido")}
        successMessage={(outputs) =>
          outputs.length === 1 ? "Pronto! Seu PDF está pronto." : `Pronto! O PDF foi dividido em ${outputs.length} arquivos.`
        }
      />

      <PageGrid label="Pré-visualização da divisão">
        {Array.from({ length: pageCount }, (_, index) => {
          const group = groupOf.get(index);
          return (
            <PageCard
              key={index}
              doc={doc}
              pageNumber={index + 1}
              label={group === undefined ? `${index + 1} · fora` : `${index + 1}`}
              badge={
                group !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold shadow-sm",
                      groupColors[group % groupColors.length],
                    )}
                  >
                    Arquivo {group + 1}
                  </span>
                )
              }
            />
          );
        })}
      </PageGrid>

      <ActionBar
        summary={
          groups
            ? `${groups.length} ${groups.length === 1 ? "arquivo" : "arquivos"} PDF serão criados`
            : "Corrija os intervalos para continuar."
        }
      >
        {task.running && (
          <button type="button" className="btn btn-ghost min-h-12" onClick={task.cancel}>
            Cancelar
          </button>
        )}
        <RunButton running={task.running} disabled={!groups} onClick={split}>
          Dividir PDF
        </RunButton>
      </ActionBar>
    </div>
  );
}

/** Sugestão inicial: metade em cada arquivo (ex.: "1-5, 6-10"). */
function defaultRanges(pageCount: number): string {
  if (pageCount < 2) return "1";
  const half = Math.ceil(pageCount / 2);
  const first = half === 1 ? "1" : `1-${half}`;
  const second = half + 1 === pageCount ? `${pageCount}` : `${half + 1}-${pageCount}`;
  return `${first}, ${second}`;
}
