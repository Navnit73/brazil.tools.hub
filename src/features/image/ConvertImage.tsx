"use client";

import { useState } from "react";
import { RangeField } from "@/components/ui/RangeField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ImageBatchTool } from "./components/ImageBatchTool";
import { useImageBatch } from "./hooks/useImageBatch";
import { IMAGE_FORMATS, formatOptions, type ImageFormat } from "./lib/formats";
import { convertImage } from "./lib/process";

const formatHints: Record<ImageFormat, string> = {
  jpeg: "Compatível com tudo. Áreas transparentes ficam brancas.",
  png: "Sem perda de qualidade e com transparência. Arquivos maiores.",
  webp: "Leve e com transparência. Ótimo para sites e WhatsApp.",
  avif: "O mais leve de todos. Pode demorar alguns segundos por imagem.",
};

interface ConvertImageProps {
  /** Formato pré-selecionado (páginas de conversão específica, ex.: JPG para WebP). */
  defaultFormat?: ImageFormat;
}

export default function ConvertImage({ defaultFormat = "webp" }: ConvertImageProps) {
  const batch = useImageBatch();
  const [format, setFormat] = useState<ImageFormat>(defaultFormat);
  const [quality, setQuality] = useState(90);
  const { lossy } = IMAGE_FORMATS[format];

  return (
    <ImageBatchTool
      batch={batch}
      actionLabel="Converter"
      progressLabel="Convertendo"
      emptyTitle="Nenhuma imagem selecionada"
      process={(file) => convertImage(file, { format, quality: quality / 100 })}
      settings={
        <>
          <div>
            <SegmentedControl
              label="Converter para"
              options={formatOptions}
              value={format}
              onChange={(value) => {
                setFormat(value);
                batch.resetResults();
              }}
            />
            <p className="mt-2 text-xs text-muted">{formatHints[format]}</p>
          </div>

          {lossy && (
            <RangeField
              label="Qualidade"
              value={quality}
              min={10}
              max={100}
              step={5}
              format={(value) => `${value}%`}
              hint="90% mantém a imagem praticamente idêntica à original."
              onChange={(value) => {
                setQuality(value);
                batch.resetResults();
              }}
            />
          )}
        </>
      }
    />
  );
}
