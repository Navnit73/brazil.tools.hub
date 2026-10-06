"use client";

import { useState } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { fileBaseName, renameFile } from "@/lib/file";
import { usePdfFile } from "../hooks/usePdfFile";
import { usePdfTask } from "../hooks/usePdfTask";
import { extractPages, removePages, splitPdf } from "../lib/operations";
import { docKey, type PDFDocumentProxy } from "../lib/render";
import { ActionBar, RunButton } from "./ActionBar";
import { PageSelection } from "./PageSelection";
import { PdfFileGate } from "./PdfFileGate";
import { TaskResult } from "./TaskResult";

type Mode = "extract" | "remove";

/** Extrair páginas e Remover páginas: a mesma escolha de páginas, com resultados opostos. */
export function PageSelectTool({ mode }: { mode: Mode }) {
  const pdf = usePdfFile();
  return (
    <PdfFileGate pdf={pdf} label={mode === "extract" ? "Escolha o PDF para extrair páginas" : "Escolha o PDF para remover páginas"}>
      {pdf.doc && pdf.file && <PageSelectEditor key={docKey(pdf.doc)} mode={mode} doc={pdf.doc} file={pdf.file} />}
    </PdfFileGate>
  );
}

const outputOptions = [
  { value: "single", label: "Um PDF com todas" },
  { value: "separate", label: "Um PDF por página" },
] as const;

function PageSelectEditor({ mode, doc, file }: { mode: Mode; doc: PDFDocumentProxy; file: File }) {
  const pageCount = doc.numPages;
  const task = usePdfTask();
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [output, setOutput] = useState<"single" | "separate">("single");
  const count = selected.size;
  const pages = [...selected].sort((a, b) => a - b);
  const removingAll = mode === "remove" && count >= pageCount;

  function select(next: Set<number>) {
    setSelected(next);
    task.reset();
  }

  function run() {
    void task.run(async ({ report }) => {
      if (mode === "remove") {
        return [{ name: renameFile(file.name, "pdf", "-editado"), blob: await removePages(file, pages) }];
      }
      if (output === "single") {
        return [{ name: renameFile(file.name, "pdf", "-extraido"), blob: await extractPages(file, pages) }];
      }
      report(0, pages.length);
      const blobs = await splitPdf(
        file,
        pages.map((page) => [page]),
        (done) => report(done, pages.length),
      );
      return blobs.map((blob, index) => ({ name: `${fileBaseName(file.name)}-pagina-${pages[index] + 1}.pdf`, blob }));
    });
  }

  const summary =
    mode === "remove"
      ? count === 0
        ? "Toque nas páginas que deseja remover."
        : removingAll
          ? "Mantenha pelo menos uma página."
          : `${count} ${count === 1 ? "página será removida" : "páginas serão removidas"} · ficam ${pageCount - count} de ${pageCount}`
      : count === 0
        ? "Toque nas páginas que deseja extrair."
        : `${count} de ${pageCount} ${pageCount === 1 ? "página selecionada" : "páginas selecionadas"}`;

  return (
    <div className="flex flex-col gap-4">
      {mode === "extract" && (
        <SegmentedControl
          label="Formato do resultado"
          options={outputOptions}
          value={output}
          onChange={(value) => {
            setOutput(value);
            task.reset();
          }}
          disabled={task.running}
        />
      )}

      <TaskResult
        task={task}
        progressLabel={mode === "remove" ? "Removendo páginas" : "Extraindo página"}
        zipName={renameFile(file.name, "zip", "-paginas")}
        successMessage={(outputs) =>
          mode === "remove"
            ? `Pronto! Seu PDF agora tem ${pageCount - count} ${pageCount - count === 1 ? "página" : "páginas"}.`
            : outputs.length === 1
              ? `Pronto! Novo PDF com ${count} ${count === 1 ? "página" : "páginas"}.`
              : `Pronto! ${outputs.length} PDFs criados, um por página.`
        }
      />

      <PageSelection
        doc={doc}
        selected={selected}
        onChange={select}
        tone={mode === "remove" ? "remove" : "select"}
        disabled={task.running}
      />

      <ActionBar summary={summary}>
        <RunButton running={task.running} disabled={count === 0 || removingAll} onClick={run}>
          {mode === "remove" ? "Remover páginas" : "Extrair páginas"}
        </RunButton>
      </ActionBar>
    </div>
  );
}
