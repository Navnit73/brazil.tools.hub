"use client";

import { useState } from "react";
import { renameFile } from "@/lib/file";
import { ActionBar, RunButton } from "./components/ActionBar";
import { PasswordInput, PdfFileGate } from "./components/PdfFileGate";
import { TaskResult } from "./components/TaskResult";
import { usePdfFile } from "./hooks/usePdfFile";
import { usePdfTask } from "./hooks/usePdfTask";
import { protectPdf } from "./lib/operations";
import { docKey } from "./lib/render";

const MIN_LENGTH = 4;

export default function ProtectPdf() {
  const pdf = usePdfFile();
  return (
    <PdfFileGate pdf={pdf} label="Escolha o PDF para proteger">
      {pdf.doc && pdf.file && <ProtectEditor key={docKey(pdf.doc)} file={pdf.file} />}
    </PdfFileGate>
  );
}

function ProtectEditor({ file }: { file: File }) {
  const task = usePdfTask();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const tooShort = password.length > 0 && password.length < MIN_LENGTH;
  const mismatch = confirm.length > 0 && confirm !== password;
  const valid = password.length >= MIN_LENGTH && confirm === password;

  function edit(setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      task.reset();
    };
  }

  function protect() {
    void task.run(async () => [{ name: renameFile(file.name, "pdf", "-protegido"), blob: await protectPdf(file, password) }]);
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (valid) protect();
      }}
    >
      <PasswordInput
        label="Nova senha"
        value={password}
        onChange={edit(setPassword)}
        autoComplete="new-password"
        error={tooShort ? `Use pelo menos ${MIN_LENGTH} caracteres.` : null}
        hint="Misture letras, números e símbolos para uma senha mais forte."
      />
      <PasswordInput
        label="Repita a senha"
        value={confirm}
        onChange={edit(setConfirm)}
        autoComplete="new-password"
        error={mismatch ? "As senhas não são iguais." : null}
      />
      <p className="rounded-m-md bg-md-surface-low p-3 text-xs text-md-on-surface-variant">
        <strong className="text-md-on-surface">Guarde a senha.</strong> Sem ela não é possível abrir o PDF, e não há como recuperá-la. O
        arquivo usa criptografia AES de 256 bits.
      </p>

      <TaskResult task={task} progressLabel="Protegendo o PDF" successMessage={() => "Pronto! Seu PDF agora só abre com a senha."} />

      <ActionBar>
        <RunButton running={task.running} disabled={!valid} onClick={protect}>
          Proteger PDF
        </RunButton>
      </ActionBar>
    </form>
  );
}
