"use client";

import { useId, useState } from "react";
import { RangeField } from "@/components/ui/RangeField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ImageBatchTool } from "./components/ImageBatchTool";
import { useImageBatch } from "./hooks/useImageBatch";
import { IMAGE_FORMATS, type ImageFormat } from "./lib/formats";
import { compressImage, resolveOutputFormat } from "./lib/process";

type Mode = "quality" | "size";
type OutputFormat = ImageFormat | "original";

const modeOptions = [
  { value: "quality", label: "Por qualidade" },
  { value: "size", label: "Por tamanho máximo" },
] as const;

const formatChoices = [
  { value: "original", label: "Manter formato" },
  { value: "jpeg", label: "JPG" },
  { value: "webp", label: "WebP" },
  { value: "avif", label: "AVIF" },
] as const;

const maxSideChoices = [
  { value: "0", label: "Original" },
  { value: "1920", label: "1920 px" },
  { value: "1280", label: "1280 px" },
  { value: "800", label: "800 px" },
] as const;

export default function CompressImage() {
  const id = useId();
  const batch = useImageBatch();
  const [mode, setMode] = useState<Mode>("quality");
  const [quality, setQuality] = useState(75);
  const [targetKb, setTargetKb] = useState(200);
  const [format, setFormat] = useState<OutputFormat>("original");
  const [maxSide, setMaxSide] = useState("0");

  /** Qualquer mudança de configuração invalida resultados já gerados. */
  function change<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      batch.resetResults();
    };
  }

  const hasPngOutput = batch.items.some((item) => !IMAGE_FORMATS[resolveOutputFormat(item.file, format)].lossy);
  const validTarget = Number.isFinite(targetKb) && targetKb >= 10;

  return (
    <ImageBatchTool
      batch={batch}
      actionLabel="Comprimir"
      progressLabel="Comprimindo"
      emptyTitle="Nenhuma imagem selecionada"
      canRun={mode === "quality" || validTarget}
      process={(file) =>
        compressImage(file, {
          format,
          quality: quality / 100,
          maxSide: Number(maxSide) || undefined,
          targetBytes: mode === "size" && validTarget ? targetKb * 1024 : undefined,
        })
      }
      settings={
        <>
          <SegmentedControl label="Como comprimir" options={modeOptions} value={mode} onChange={change(setMode)} />

          {mode === "quality" ? (
            <RangeField
              label="Qualidade"
              value={quality}
              min={10}
              max={100}
              step={5}
              format={(value) => `${value}%`}
              hint="Entre 70% e 85% costuma ser o melhor equilíbrio entre peso e nitidez."
              onChange={change(setQuality)}
            />
          ) : (
            <div className="flex flex-col gap-1 text-sm">
              <label htmlFor={`${id}-target`} className="font-semibold">
                Tamanho máximo de cada arquivo
              </label>
              <div className="join w-full max-w-60">
                <input
                  id={`${id}-target`}
                  type="number"
                  min={10}
                  step={10}
                  inputMode="numeric"
                  value={Number.isNaN(targetKb) ? "" : targetKb}
                  onChange={(event) => change(setTargetKb)(event.target.valueAsNumber)}
                  className="input join-item min-h-11 w-full"
                  aria-describedby={`${id}-target-hint`}
                  aria-invalid={!validTarget}
                />
                <span className="join-item flex items-center border border-border-strong bg-surface px-3 font-semibold">KB</span>
              </div>
              <p id={`${id}-target-hint`} className={validTarget ? "text-xs text-muted" : "text-xs text-error"}>
                {validTarget
                  ? "Ideal para formulários com limite de tamanho. A qualidade é ajustada automaticamente."
                  : "Informe pelo menos 10 KB."}
              </p>
            </div>
          )}

          <SegmentedControl label="Formato do arquivo" options={formatChoices} value={format} onChange={change(setFormat)} />
          {hasPngOutput && mode === "quality" && (
            <p className="-mt-2 text-xs text-muted">
              PNG não tem ajuste de qualidade. Para arquivos bem menores, escolha WebP ou reduza as dimensões.
            </p>
          )}

          <SegmentedControl label="Reduzir dimensões (lado maior)" options={maxSideChoices} value={maxSide} onChange={change(setMaxSide)} />
        </>
      }
    />
  );
}
