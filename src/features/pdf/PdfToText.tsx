"use client";

import { useId, useState } from "react";
import { ToolProgress } from "@/components/tool/ToolProgress";
import { ToolStatus } from "@/components/tool/ToolStatus";
import { downloadBlob, renameFile } from "@/lib/file";
import { ActionBar, RunButton } from "./components/ActionBar";
import { PdfIcon } from "./components/icons";
import { PdfFileGate } from "./components/PdfFileGate";
import { usePdfFile } from "./hooks/usePdfFile";
import { docKey, extractPageText, type PDFDocumentProxy } from "./lib/render";

export default function PdfToText() {
  const pdf = usePdfFile();
  return (
    <PdfFileGate pdf={pdf} label="Escolha o PDF para extrair o texto" acceptPassword>
      {pdf.doc && pdf.file && <TextExtractor key={docKey(pdf.doc)} doc={pdf.doc} file={pdf.file} />}
    </PdfFileGate>
  );
}

function TextExtractor({ doc, file }: { doc: PDFDocumentProxy; file: File }) {
  const id = useId();
  const pageCount = doc.numPages;
  const [pages, setPages] = useState<string[] | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [separators, setSeparators] = useState(pageCount > 1);
  const [copied, setCopied] = useState(false);

  async function extract() {
    setError(null);
    setProgress(0);
    try {
      const texts: string[] = [];
      for (let page = 1; page <= pageCount; page++) {
        texts.push(await extractPageText(doc, page));
        setProgress(page);
      }
      setPages(texts);
    } catch {
      setError("Não foi possível ler o texto deste PDF.");
    } finally {
      setProgress(null);
    }
  }

  const text = pages
    ? separators
      ? pages.map((content, index) => `--- Página ${index + 1} ---\n\n${content}`).join("\n\n")
      : pages.filter(Boolean).join("\n\n")
    : "";
  const empty = pages !== null && pages.every((content) => content.trim() === "");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Não foi possível copiar. Selecione o texto e copie manualmente.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {progress !== null && (
        <ToolProgress label={`Lendo página ${Math.min(progress + 1, pageCount)} de ${pageCount}…`} value={progress} max={pageCount} />
      )}
      {error && <ToolStatus kind="error">{error}</ToolStatus>}

      {pages === null ? (
        <ActionBar summary={`${pageCount} ${pageCount === 1 ? "página" : "páginas"}`}>
          <RunButton running={progress !== null} onClick={extract}>
            Extrair texto
          </RunButton>
        </ActionBar>
      ) : empty ? (
        <ToolStatus kind="info">
          Nenhum texto encontrado. Este PDF provavelmente é uma digitalização (foto do documento): o texto está dentro de imagens e precisa
          de reconhecimento óptico (OCR) para ser lido.
        </ToolStatus>
      ) : (
        <>
          <ToolStatus kind="success">
            Pronto! {words.toLocaleString("pt-BR")} palavras extraídas de {pageCount} {pageCount === 1 ? "página" : "páginas"}.
          </ToolStatus>
          {pageCount > 1 && (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-primary"
                checked={separators}
                onChange={(event) => setSeparators(event.target.checked)}
              />
              Marcar o início de cada página
            </label>
          )}
          <label htmlFor={`${id}-text`} className="sr-only">
            Texto extraído
          </label>
          <textarea
            id={`${id}-text`}
            readOnly
            value={text}
            className="textarea min-h-80 w-full font-mono text-sm leading-relaxed"
            onFocus={(event) => event.currentTarget.select()}
          />
          <ActionBar>
            <button type="button" className="btn min-h-12 flex-1 sm:flex-none" onClick={copy}>
              <PdfIcon name={copied ? "check" : "file"} /> {copied ? "Copiado!" : "Copiar texto"}
            </button>
            <button
              type="button"
              className="btn btn-primary min-h-12 flex-1 sm:flex-none"
              onClick={() => downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), renameFile(file.name, "txt"))}
            >
              <PdfIcon name="download" /> Baixar .txt
            </button>
          </ActionBar>
        </>
      )}
    </div>
  );
}
