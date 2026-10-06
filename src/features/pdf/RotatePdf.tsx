"use client";

import { useState } from "react";
import { renameFile } from "@/lib/file";
import { ActionBar, RunButton } from "./components/ActionBar";
import { PdfIcon } from "./components/icons";
import { PageAction, PageCard, PageGrid } from "./components/PageCard";
import { PdfFileGate } from "./components/PdfFileGate";
import { TaskResult } from "./components/TaskResult";
import { usePdfFile } from "./hooks/usePdfFile";
import { usePdfTask } from "./hooks/usePdfTask";
import { normalizeRotation, rotatePages } from "./lib/operations";
import { docKey, type PDFDocumentProxy } from "./lib/render";

export default function RotatePdf() {
  const pdf = usePdfFile();
  return (
    <PdfFileGate pdf={pdf} label="Escolha o PDF para girar">
      {pdf.doc && pdf.file && <RotateEditor key={docKey(pdf.doc)} doc={pdf.doc} file={pdf.file} />}
    </PdfFileGate>
  );
}

function RotateEditor({ doc, file }: { doc: PDFDocumentProxy; file: File }) {
  const pageCount = doc.numPages;
  const task = usePdfTask();
  // Ângulo acumulado por página (pode passar de 360°, para a animação seguir o sentido do clique).
  const [rotations, setRotations] = useState<number[]>(() => Array(pageCount).fill(0));
  const changed = rotations.filter((angle) => normalizeRotation(angle) !== 0).length;

  function rotateAll(delta: number) {
    setRotations((current) => current.map((angle) => angle + delta));
    task.reset();
  }

  function rotateOne(index: number, delta: number) {
    setRotations((current) => current.map((angle, i) => (i === index ? angle + delta : angle)));
    task.reset();
  }

  function reset() {
    setRotations(Array(pageCount).fill(0));
    task.reset();
  }

  function save() {
    void task.run(async () => [{ name: renameFile(file.name, "pdf", "-girado"), blob: await rotatePages(file, rotations) }]);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Girar todas as páginas</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn min-h-11" onClick={() => rotateAll(-90)} disabled={task.running}>
            <PdfIcon name="rotateLeft" /> Para a esquerda
          </button>
          <button type="button" className="btn min-h-11" onClick={() => rotateAll(90)} disabled={task.running}>
            <PdfIcon name="rotateRight" /> Para a direita
          </button>
          {changed > 0 && (
            <button type="button" className="btn btn-ghost min-h-11" onClick={reset} disabled={task.running}>
              Desfazer tudo
            </button>
          )}
        </div>
        <p className="text-xs text-md-on-surface-variant">Para girar só algumas, toque na página ou use os botões abaixo de cada uma.</p>
      </div>

      <TaskResult task={task} progressLabel="Girando páginas" successMessage={() => "Pronto! Seu PDF girado está pronto para baixar."} />

      <PageGrid label="Páginas do PDF">
        {rotations.map((rotation, index) => {
          const angle = normalizeRotation(rotation);
          return (
            <PageCard
              key={index}
              doc={doc}
              pageNumber={index + 1}
              rotation={rotation}
              selected={angle !== 0}
              onToggle={() => rotateOne(index, 90)}
              clickLabel={`Girar página ${index + 1} para a direita (agora em ${angle}°)`}
              label={angle === 0 ? `${index + 1}` : `${index + 1} · ${angle}°`}
              actions={
                <>
                  <PageAction
                    label={`Girar página ${index + 1} para a esquerda`}
                    onClick={() => rotateOne(index, -90)}
                    disabled={task.running}
                  >
                    <PdfIcon name="rotateLeft" className="size-4" />
                  </PageAction>
                  <PageAction
                    label={`Girar página ${index + 1} para a direita`}
                    onClick={() => rotateOne(index, 90)}
                    disabled={task.running}
                  >
                    <PdfIcon name="rotateRight" className="size-4" />
                  </PageAction>
                </>
              }
            />
          );
        })}
      </PageGrid>

      <ActionBar
        summary={
          changed === 0
            ? "Nenhuma página girada ainda."
            : `${changed} de ${pageCount} ${pageCount === 1 ? "página girada" : "páginas giradas"}`
        }
      >
        <RunButton running={task.running} disabled={changed === 0} onClick={save}>
          Salvar PDF girado
        </RunButton>
      </ActionBar>
    </div>
  );
}
