"use client";

import { useId, useState } from "react";
import { formatRanges, parsePageSelection } from "../lib/ranges";
import type { PDFDocumentProxy } from "../lib/render";
import { PageCard, PageGrid } from "./PageCard";

interface PageSelectionProps {
  doc: PDFDocumentProxy;
  selected: ReadonlySet<number>;
  onChange: (selected: Set<number>) => void;
  /** `remove` marca as páginas escolhidas com X vermelho. */
  tone?: "select" | "remove";
  disabled?: boolean;
}

/**
 * Escolha de páginas por toque nas miniaturas ou digitando intervalos ("1-3, 5").
 * As duas formas ficam sincronizadas.
 */
export function PageSelection({ doc, selected, onChange, tone = "select", disabled }: PageSelectionProps) {
  const id = useId();
  const pageCount = doc.numPages;
  // Texto digitado enquanto é editado; `null` = mostrar o texto derivado da seleção.
  const [draft, setDraft] = useState<string | null>(null);
  const { error } = draft === null || draft.trim() === "" ? { error: null } : parsePageSelection(draft, pageCount);

  function type(text: string) {
    setDraft(text);
    if (text.trim() === "") return onChange(new Set());
    const result = parsePageSelection(text, pageCount);
    if (result.pages) onChange(new Set(result.pages));
  }

  function set(pages: Iterable<number>) {
    setDraft(null);
    onChange(new Set(pages));
  }

  function toggle(index: number) {
    const next = new Set(selected);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    set(next);
  }

  const all = Array.from({ length: pageCount }, (_, index) => index);
  const quick = [
    { label: "Todas", pages: () => all },
    { label: "Nenhuma", pages: () => [] },
    { label: "Inverter", pages: () => all.filter((index) => !selected.has(index)) },
    { label: "Ímpares", pages: () => all.filter((index) => index % 2 === 0) },
    { label: "Pares", pages: () => all.filter((index) => index % 2 === 1) },
  ];

  return (
    <fieldset disabled={disabled} className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-1 text-sm">
        <label htmlFor={`${id}-ranges`} className="font-medium">
          {tone === "remove" ? "Páginas para remover" : "Páginas escolhidas"}
        </label>
        <input
          id={`${id}-ranges`}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Ex.: 1-3, 5, 8"
          value={draft ?? formatRanges(selected)}
          onChange={(event) => type(event.target.value)}
          onBlur={() => !error && setDraft(null)}
          className="input min-h-11 w-full max-w-md"
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-hint`}
        />
        <p id={`${id}-hint`} className={error ? "text-xs text-error" : "text-xs text-md-on-surface-variant"}>
          {error ?? "Toque nas páginas abaixo ou digite os números e intervalos, separados por vírgula."}
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Seleção rápida">
        {quick.map((option) => (
          <button key={option.label} type="button" className="btn btn-sm min-h-9" onClick={() => set(option.pages())}>
            {option.label}
          </button>
        ))}
      </div>

      <PageGrid label="Páginas do PDF">
        {all.map((index) => (
          <PageCard
            key={index}
            doc={doc}
            pageNumber={index + 1}
            selected={selected.has(index)}
            tone={tone}
            onToggle={() => toggle(index)}
          />
        ))}
      </PageGrid>
    </fieldset>
  );
}
