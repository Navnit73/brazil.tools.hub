"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PdfPasswordError, pdfErrorMessage, validatePdfFile } from "../lib/document";
import { openPdf, type PDFDocumentProxy } from "../lib/render";
import { disposePdf } from "../lib/thumbnails";

export type PdfFileStatus = "empty" | "loading" | "ready" | "password" | "error";

/**
 * Um PDF aberto para visualização (miniaturas, contagem de páginas).
 * Usado pelas ferramentas que trabalham com um arquivo por vez.
 */
export function usePdfFile() {
  const [file, setFile] = useState<File | null>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [status, setStatus] = useState<PdfFileStatus>("empty");
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState<string | undefined>(undefined);
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const request = useRef(0);

  const replaceDoc = useCallback((next: PDFDocumentProxy | null) => {
    if (docRef.current) disposePdf(docRef.current);
    docRef.current = next;
    setDoc(next);
  }, []);

  // Fecha o documento ao sair da página (e ignora aberturas que terminarem depois).
  useEffect(
    () => () => {
      request.current++;
      if (docRef.current) disposePdf(docRef.current);
    },
    [],
  );

  const open = useCallback(async (next: File, nextPassword?: string) => {
    const current = ++request.current;
    setStatus("loading");
    setError(null);
    try {
      const opened = await openPdf(next, nextPassword);
      if (current !== request.current) return disposePdf(opened);
      replaceDoc(opened);
      setPassword(nextPassword);
      setStatus("ready");
    } catch (reason) {
      if (current !== request.current) return;
      replaceDoc(null);
      if (reason instanceof PdfPasswordError) {
        setStatus("password");
        setError(reason.reason === "wrong" ? reason.message : null);
      } else {
        setStatus("error");
        setError(pdfErrorMessage(reason));
      }
    }
  }, [replaceDoc]);

  /** Recebe arquivos do seletor; usa o primeiro. */
  const select = useCallback(
    (files: File[]) => {
      const next = files[0];
      if (!next) return;
      const problem = validatePdfFile(next);
      if (problem) {
        setError(`Arquivo ignorado — ${problem}.`);
        if (!docRef.current) setStatus("error");
        return;
      }
      setFile(next);
      void open(next);
    },
    [open],
  );

  const submitPassword = useCallback((value: string) => file && void open(file, value), [file, open]);

  const clear = useCallback(() => {
    request.current++;
    replaceDoc(null);
    setFile(null);
    setPassword(undefined);
    setStatus("empty");
    setError(null);
  }, [replaceDoc]);

  return { file, doc, pageCount: doc?.numPages ?? 0, status, error, password, select, submitPassword, clear };
}
