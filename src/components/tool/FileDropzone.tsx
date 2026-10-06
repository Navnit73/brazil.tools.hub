"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  /** Mesmo formato do atributo `accept` do input. */
  accept: string;
  multiple?: boolean;
  disabled?: boolean;
  /** Texto principal da área (ex.: "Escolha uma imagem"). */
  label: string;
  /** Texto auxiliar abaixo do rótulo (formatos, limites…). */
  hint?: string;
  /** Aceita arquivos colados com Ctrl+V / Cmd+V enquanto a área estiver na página. */
  acceptPaste?: boolean;
  /** Versão compacta, para adicionar mais arquivos depois da primeira seleção. */
  compact?: boolean;
  onFiles: (files: File[]) => void;
}

/**
 * Área de seleção de arquivos com arrastar e soltar, seletor nativo e colar.
 * É um `<label>` envolvendo um input real: funciona com teclado, leitor de tela
 * e toque sem JavaScript adicional.
 */
export function FileDropzone({
  accept,
  multiple = false,
  disabled = false,
  label,
  hint,
  acceptPaste = false,
  compact = false,
  onFiles,
}: FileDropzoneProps) {
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);
  const onFilesRef = useRef(onFiles);

  useEffect(() => {
    onFilesRef.current = onFiles;
  });

  useEffect(() => {
    if (!acceptPaste || disabled) return;
    function handlePaste(event: ClipboardEvent) {
      const files = Array.from(event.clipboardData?.files ?? []);
      if (files.length === 0) return;
      event.preventDefault();
      onFilesRef.current(multiple ? files : files.slice(0, 1));
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [acceptPaste, disabled, multiple]);

  function emit(list: FileList | null) {
    const files = Array.from(list ?? []);
    if (files.length > 0) onFiles(multiple ? files : files.slice(0, 1));
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    emit(event.target.files);
    // Permite escolher o mesmo arquivo de novo.
    event.target.value = "";
  }

  function handleDragEnter(event: DragEvent) {
    event.preventDefault();
    if (disabled) return;
    dragDepth.current += 1;
    setDragging(true);
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    if (!disabled) emit(event.dataTransfer.files);
  }

  return (
    <label
      htmlFor={id}
      onDragEnter={handleDragEnter}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-m-md border-2 border-dashed text-center transition-colors",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
        compact ? "min-h-20 px-4 py-3" : "min-h-48 px-4 py-8 sm:min-h-56",
        dragging ? "border-primary bg-md-primary-container" : "border-md-outline-variant bg-md-surface-low hover:border-primary",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <input
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleChange}
        className="sr-only"
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {!compact && (
        <span aria-hidden="true" className="grid size-14 place-items-center rounded-m-lg bg-md-primary-container text-md-on-primary-container">
          <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
        </span>
      )}
      <span className="font-display text-base font-medium sm:text-lg">
        {label}
        <span className="mt-0.5 block font-sans text-sm font-normal text-md-on-surface-variant">
          {dragging ? "Solte para adicionar" : "Toque para escolher ou arraste para cá"}
        </span>
      </span>
      {hint && (
        <span id={`${id}-hint`} className="text-xs text-md-on-surface-variant">
          {hint}
        </span>
      )}
    </label>
  );
}
