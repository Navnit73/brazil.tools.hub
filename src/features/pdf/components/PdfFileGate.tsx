"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolStatus } from "@/components/tool/ToolStatus";
import { formatBytes } from "@/lib/file";
import { toolPath } from "@/lib/routes";
import type { usePdfFile } from "../hooks/usePdfFile";
import { PDF_ACCEPT, PDF_INPUT_HINT } from "../lib/document";
import { PdfIcon } from "./icons";

interface PdfFileGateProps {
  pdf: ReturnType<typeof usePdfFile>;
  /** Texto da área de seleção (ex.: "Escolha o PDF para dividir"). */
  label?: string;
  /**
   * Ferramentas que só leem o PDF (para imagem, para texto) podem pedir a senha.
   * As que gravam um novo PDF mandam o usuário desbloquear antes.
   */
  acceptPassword?: boolean;
  disabled?: boolean;
  /** Conteúdo exibido com o PDF aberto. */
  children: ReactNode;
}

/** Seleção de um único PDF com todos os estados: vazio, abrindo, senha, erro e pronto. */
export function PdfFileGate({ pdf, label = "Escolha um arquivo PDF", acceptPassword = false, disabled, children }: PdfFileGateProps) {
  const { file, status, error } = pdf;

  if (status === "empty" || status === "error" || !file) {
    return (
      <div className="flex flex-col gap-3">
        <FileDropzone accept={PDF_ACCEPT} label={label} hint={PDF_INPUT_HINT} onFiles={pdf.select} disabled={disabled} />
        {error && <ToolStatus kind="error">{error}</ToolStatus>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-m-md bg-md-surface-low p-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-m-sm bg-md-primary-container text-md-on-primary-container">
          <PdfIcon name="file" />
        </span>
        <div className="min-w-0 flex-1 text-sm">
          <p className="truncate font-medium" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs text-md-on-surface-variant">
            {formatBytes(file.size)}
            {status === "ready" && ` · ${pdf.pageCount} ${pdf.pageCount === 1 ? "página" : "páginas"}`}
            {status === "loading" && " · abrindo…"}
          </p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm min-h-11" onClick={pdf.clear} disabled={disabled}>
          Trocar arquivo
        </button>
      </div>

      {status === "loading" && (
        <div role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-md-on-surface-variant">
          <span className="loading loading-spinner loading-md" aria-hidden="true" /> Abrindo o PDF…
        </div>
      )}

      {status === "password" &&
        (acceptPassword ? (
          <PasswordForm error={error} onSubmit={pdf.submitPassword} />
        ) : (
          <ToolStatus kind="info">
            Este PDF está protegido por senha. Remova a senha com o{" "}
            <Link className="font-semibold underline" href={toolPath({ category: "pdf", slug: "desbloquear-pdf" })}>
              Desbloquear PDF
            </Link>{" "}
            e depois volte aqui.
          </ToolStatus>
        ))}

      {status === "ready" && children}
    </div>
  );
}

function PasswordForm({ error, onSubmit }: { error: string | null; onSubmit: (password: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <form
      className="flex flex-col gap-3 rounded-m-md bg-md-surface-low p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (value) onSubmit(value);
      }}
    >
      <p className="flex items-center gap-2 text-sm font-medium">
        <PdfIcon name="lock" className="size-4" /> Este PDF está protegido. Digite a senha para abrir.
      </p>
      <PasswordInput label="Senha do PDF" value={value} onChange={setValue} error={error} autoFocus />
      <button type="submit" className="btn btn-primary min-h-11 self-start" disabled={!value}>
        Abrir PDF
      </button>
    </form>
  );
}

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  hint?: string;
  autoFocus?: boolean;
  autoComplete?: string;
}

/** Campo de senha com botão de mostrar/ocultar. */
export function PasswordInput({ label, value, onChange, error, hint, autoFocus, autoComplete = "off" }: PasswordInputProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const message = error ?? hint;

  return (
    <div className="flex flex-col gap-1 text-sm">
      <label htmlFor={id} className="font-medium">
        {label}
      </label>
      <div className="join w-full max-w-sm">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          spellCheck={false}
          onChange={(event) => onChange(event.target.value)}
          className="input join-item min-h-11 w-full"
          aria-invalid={Boolean(error)}
          aria-describedby={message ? `${id}-hint` : undefined}
        />
        <button
          type="button"
          className="btn join-item min-h-11"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
        >
          <PdfIcon name={visible ? "eyeOff" : "eye"} />
        </button>
      </div>
      {message && (
        <p id={`${id}-hint`} className={error ? "text-xs text-error" : "text-xs text-md-on-surface-variant"}>
          {message}
        </p>
      )}
    </div>
  );
}
