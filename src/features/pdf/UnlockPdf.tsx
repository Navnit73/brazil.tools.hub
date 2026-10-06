"use client";

import { renameFile } from "@/lib/file";
import { ActionBar, RunButton } from "./components/ActionBar";
import { PdfFileGate } from "./components/PdfFileGate";
import { TaskResult } from "./components/TaskResult";
import { usePdfFile } from "./hooks/usePdfFile";
import { usePdfTask } from "./hooks/usePdfTask";
import { unlockPdf } from "./lib/operations";
import { docKey } from "./lib/render";

/**
 * O PdfFileGate pede a senha de abertura (se houver) e confere se está certa;
 * depois disso, basta gravar uma cópia sem criptografia.
 */
export default function UnlockPdf() {
  const pdf = usePdfFile();
  return (
    <PdfFileGate pdf={pdf} label="Escolha o PDF protegido" acceptPassword>
      {pdf.doc && pdf.file && <UnlockEditor key={docKey(pdf.doc)} file={pdf.file} password={pdf.password} />}
    </PdfFileGate>
  );
}

function UnlockEditor({ file, password }: { file: File; password?: string }) {
  const task = usePdfTask();

  function unlock() {
    void task.run(async () => [{ name: renameFile(file.name, "pdf", "-desbloqueado"), blob: await unlockPdf(file, password) }]);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-md-on-surface-variant">
        {password
          ? "Senha correta. Agora gere uma cópia do PDF que abre sem senha."
          : "Este PDF abre sem senha, mas pode ter restrições para imprimir, copiar ou editar. Gere uma cópia sem essas restrições."}
      </p>
      <TaskResult
        task={task}
        progressLabel="Removendo a senha"
        successMessage={() => "Pronto! Seu PDF agora abre sem senha e sem restrições."}
      />
      <ActionBar>
        <RunButton running={task.running} onClick={unlock}>
          Desbloquear PDF
        </RunButton>
      </ActionBar>
    </div>
  );
}
