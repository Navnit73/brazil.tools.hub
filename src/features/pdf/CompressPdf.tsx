"use client";

import { useState } from "react";
import { ToolStatus } from "@/components/tool/ToolStatus";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { renameFile } from "@/lib/file";
import { ActionBar, RunButton } from "./components/ActionBar";
import { PdfFileGate } from "./components/PdfFileGate";
import { TaskResult } from "./components/TaskResult";
import { usePdfFile } from "./hooks/usePdfFile";
import { usePdfTask } from "./hooks/usePdfTask";
import { docKey } from "./lib/render";
import { compressPdf, type CompressionLevel, type CompressResult } from "./lib/compress";

const levelOptions = [
  { value: "low", label: "Leve" },
  { value: "recommended", label: "Recomendada" },
  { value: "high", label: "Forte" },
] as const;

const levelHints: Record<CompressionLevel, string> = {
  low: "Fotos com qualidade quase igual à original. Redução menor.",
  recommended: "Bom equilíbrio: arquivo bem menor e fotos nítidas na tela.",
  high: "O menor arquivo possível. As fotos perdem detalhes, mas o texto continua nítido.",
};

export default function CompressPdf() {
  const pdf = usePdfFile();
  return (
    <PdfFileGate pdf={pdf} label="Escolha o PDF para comprimir">
      {pdf.doc && pdf.file && <CompressEditor key={docKey(pdf.doc)} file={pdf.file} />}
    </PdfFileGate>
  );
}

function CompressEditor({ file }: { file: File }) {
  const task = usePdfTask();
  const [level, setLevel] = useState<CompressionLevel>("recommended");
  const [stats, setStats] = useState<CompressResult | null>(null);

  function compress() {
    setStats(null);
    void task.run(async ({ report, cancelled }) => {
      const result = await compressPdf(file, level, report, cancelled);
      setStats(result);
      // Sem ganho, não oferecemos o download de uma cópia igual ao original.
      return result.keptOriginal ? [] : [{ name: renameFile(file.name, "pdf", "-comprimido"), blob: result.blob }];
    });
  }

  const original = file.size;
  const saved = stats && !stats.keptOriginal ? Math.round((1 - stats.blob.size / original) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <SegmentedControl
          label="Nível de compressão"
          options={levelOptions}
          value={level}
          onChange={(value) => {
            setLevel(value);
            setStats(null);
            task.reset();
          }}
          disabled={task.running}
        />
        <p className="text-xs text-md-on-surface-variant">{levelHints[level]}</p>
      </div>

      {stats?.keptOriginal && (
        <ToolStatus kind="info">
          {stats.imagesFound === 0
            ? "Este PDF não tem fotos que possam ser comprimidas (normalmente é só texto, que já é leve). O arquivo original já está otimizado."
            : "Não foi possível deixar este PDF menor: ele já está otimizado. Tente o nível Forte."}
        </ToolStatus>
      )}
      <TaskResult
        task={task}
        progressLabel="Comprimindo imagem"
        originalSize={original}
        successMessage={() => `Pronto! Seu PDF ficou ${saved}% menor.`}
      />

      <ActionBar>
        {task.running && (
          <button type="button" className="btn btn-ghost min-h-12" onClick={task.cancel}>
            Cancelar
          </button>
        )}
        <RunButton running={task.running} onClick={compress}>
          Comprimir PDF
        </RunButton>
      </ActionBar>
    </div>
  );
}
