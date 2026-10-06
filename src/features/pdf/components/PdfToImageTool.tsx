"use client";

import { useState } from "react";
import { RangeField } from "@/components/ui/RangeField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { fileBaseName, renameFile } from "@/lib/file";
import { usePdfFile } from "../hooks/usePdfFile";
import { TaskCancelled, usePdfTask } from "../hooks/usePdfTask";
import { canvasToBlob, docKey, releaseCanvas, renderPage, type PDFDocumentProxy } from "../lib/render";
import { ActionBar, RunButton } from "./ActionBar";
import { PageSelection } from "./PageSelection";
import { PdfFileGate } from "./PdfFileGate";
import { TaskResult } from "./TaskResult";

type ImageFormat = "jpeg" | "png";

const FORMATS = {
  jpeg: { label: "JPG", mime: "image/jpeg", extension: "jpg" },
  png: { label: "PNG", mime: "image/png", extension: "png" },
} as const;

const formatOptions = [
  { value: "jpeg", label: "JPG" },
  { value: "png", label: "PNG" },
] as const;

const resolutionOptions = [
  { value: "72", label: "Baixa · 72 DPI" },
  { value: "150", label: "Média · 150 DPI" },
  { value: "300", label: "Alta · 300 DPI" },
] as const;

const pagesOptions = [
  { value: "all", label: "Todas as páginas" },
  { value: "some", label: "Escolher páginas" },
] as const;

/** PDF para JPG, PDF para PNG e Converter PDF em imagem. */
export function PdfToImageTool({ defaultFormat }: { defaultFormat: ImageFormat }) {
  const pdf = usePdfFile();
  return (
    <PdfFileGate pdf={pdf} label="Escolha o PDF para converter" acceptPassword>
      {pdf.doc && pdf.file && <PdfToImageEditor key={docKey(pdf.doc)} doc={pdf.doc} file={pdf.file} defaultFormat={defaultFormat} />}
    </PdfFileGate>
  );
}

function PdfToImageEditor({ doc, file, defaultFormat }: { doc: PDFDocumentProxy; file: File; defaultFormat: ImageFormat }) {
  const pageCount = doc.numPages;
  const task = usePdfTask();
  const [format, setFormat] = useState<ImageFormat>(defaultFormat);
  const [resolution, setResolution] = useState<"72" | "150" | "300">("150");
  const [quality, setQuality] = useState(85);
  const [which, setWhich] = useState<"all" | "some">("all");
  const [selected, setSelected] = useState<Set<number>>(() => new Set());

  function change<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      task.reset();
    };
  }

  const pages = which === "all" ? Array.from({ length: pageCount }, (_, index) => index) : [...selected].sort((a, b) => a - b);
  const info = FORMATS[format];

  function convert() {
    const base = fileBaseName(file.name);
    const scale = Number(resolution) / 72;
    void task.run(async ({ report, cancelled }) => {
      const outputs = [];
      report(0, pages.length);
      for (const [done, index] of pages.entries()) {
        if (cancelled()) throw new TaskCancelled();
        // Uma página por vez: libera a memória antes da próxima (essencial no celular).
        const canvas = await renderPage(doc, index + 1, { scale, background: format === "jpeg" ? "#fff" : undefined });
        try {
          const blob = await canvasToBlob(canvas, info.mime, format === "jpeg" ? quality / 100 : undefined);
          const name = pageCount === 1 ? `${base}.${info.extension}` : `${base}-pagina-${index + 1}.${info.extension}`;
          outputs.push({ name, blob });
        } finally {
          releaseCanvas(canvas);
        }
        report(done + 1, pages.length);
      }
      return outputs;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <SegmentedControl
          label="Formato da imagem"
          options={formatOptions}
          value={format}
          onChange={change(setFormat)}
          disabled={task.running}
        />
        <SegmentedControl
          label="Resolução"
          options={resolutionOptions}
          value={resolution}
          onChange={change(setResolution)}
          disabled={task.running}
        />
        {format === "jpeg" && (
          <RangeField
            label="Qualidade do JPG"
            value={quality}
            min={40}
            max={100}
            step={5}
            format={(value) => `${value}%`}
            hint="85% é ótimo para documentos. Valores menores geram arquivos mais leves."
            disabled={task.running}
            onChange={change(setQuality)}
          />
        )}
        {pageCount > 1 && (
          <SegmentedControl label="Páginas" options={pagesOptions} value={which} onChange={change(setWhich)} disabled={task.running} />
        )}
      </div>
      <p className="-mt-1 text-xs text-md-on-surface-variant">
        {resolution === "300"
          ? "Alta resolução é ideal para imprimir, mas gera arquivos grandes e demora mais em PDFs longos."
          : resolution === "150"
            ? "Média resolução é boa para ler na tela, enviar por WhatsApp ou e-mail."
            : "Baixa resolução gera imagens leves, boas para pré-visualizações."}
      </p>

      <TaskResult
        task={task}
        progressLabel="Convertendo página"
        zipName={renameFile(file.name, "zip", `-${info.extension}`)}
        successMessage={(outputs) =>
          outputs.length === 1
            ? `Pronto! Sua imagem ${info.label} está pronta.`
            : `Pronto! ${outputs.length} imagens ${info.label} geradas.`
        }
      />

      {which === "some" && <PageSelection doc={doc} selected={selected} onChange={change(setSelected)} disabled={task.running} />}

      <ActionBar
        summary={`${pages.length} ${pages.length === 1 ? "página" : "páginas"} → ${pages.length} ${pages.length === 1 ? "imagem" : "imagens"} ${info.label}`}
      >
        {task.running && (
          <button type="button" className="btn btn-ghost min-h-12" onClick={task.cancel}>
            Cancelar
          </button>
        )}
        <RunButton running={task.running} disabled={pages.length === 0} onClick={convert}>
          Converter para {info.label}
        </RunButton>
      </ActionBar>
    </div>
  );
}
