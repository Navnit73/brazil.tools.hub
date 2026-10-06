"use client";

import { useState } from "react";
import { ToolStatus } from "@/components/tool/ToolStatus";
import { downloadBlob, formatBytes } from "@/lib/file";
import { zipFiles, type NamedBlob } from "../lib/zip";
import { PdfIcon } from "./icons";

interface ResultDownloadsProps {
  outputs: NamedBlob[];
  /** Mensagem de sucesso (ex.: "Pronto! Seu PDF tem 12 páginas."). */
  message: string;
  /** Nome do .zip quando há vários arquivos. */
  zipName?: string;
  /** Tamanho do arquivo original, para mostrar a diferença. */
  originalSize?: number;
}

/** Mensagem de sucesso com o download de cada arquivo e, se forem vários, de todos em .zip. */
export function ResultDownloads({ outputs, message, zipName = "arquivos.zip", originalSize }: ResultDownloadsProps) {
  const [zipping, setZipping] = useState(false);
  const single = outputs.length === 1 ? outputs[0] : null;

  async function downloadZip() {
    setZipping(true);
    try {
      downloadBlob(await zipFiles(outputs), zipName);
    } finally {
      setZipping(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <ToolStatus kind="success">{message}</ToolStatus>

      {single ? (
        <div className="flex flex-wrap items-center gap-3 rounded-m-md bg-md-primary-container p-3 text-md-on-primary-container">
          <div className="min-w-0 flex-1 text-sm">
            <p className="truncate font-medium" title={single.name}>
              {single.name}
            </p>
            <p className="text-xs">
              {originalSize ? `${formatBytes(originalSize)} → ` : ""}
              {formatBytes(single.blob.size)}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary min-h-12 flex-1 sm:flex-none"
            onClick={() => downloadBlob(single.blob, single.name)}
          >
            <PdfIcon name="download" /> Baixar
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-m-md bg-md-primary-container p-3 text-sm text-md-on-primary-container">
            <p>
              <strong>{outputs.length} arquivos</strong> · {formatBytes(outputs.reduce((sum, output) => sum + output.blob.size, 0))}
            </p>
            <button type="button" className="btn btn-primary min-h-11" onClick={downloadZip} disabled={zipping}>
              {zipping ? <span className="loading loading-spinner loading-sm" aria-hidden="true" /> : <PdfIcon name="download" />}
              Baixar todos (.zip)
            </button>
          </div>
          <ul className="flex max-h-96 flex-col gap-2 overflow-y-auto">
            {outputs.map((output, index) => (
              <li key={`${output.name}-${index}`} className="flex items-center gap-3 rounded-m-md bg-md-surface-low p-2 pl-3">
                <PdfIcon name="file" className="size-5 shrink-0 text-md-on-surface-variant" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-medium" title={output.name}>
                    {output.name}
                  </p>
                  <p className="text-xs text-md-on-surface-variant">{formatBytes(output.blob.size)}</p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm min-h-11"
                  onClick={() => downloadBlob(output.blob, output.name)}
                  aria-label={`Baixar ${output.name}`}
                >
                  Baixar
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
