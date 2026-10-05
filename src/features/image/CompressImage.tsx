"use client";

import { useId, useState } from "react";
import Slider from "@mui/material/Slider";
import { MuiProvider } from "@/components/ui/MuiProvider";
import { ToolActions } from "@/components/tool/ToolActions";
import { ToolInput } from "@/components/tool/ToolInput";
import { ToolOutput } from "@/components/tool/ToolOutput";
import { TOOL_PENDING_NOTE } from "@/lib/constants";

export default function CompressImage() {
  const id = useId();
  const [quality, setQuality] = useState(80);

  return (
    <MuiProvider>
      <div className="grid gap-6 lg:grid-cols-2">
        <ToolInput>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Imagens</legend>
            <input id={`${id}-files`} type="file" multiple accept="image/jpeg,image/png,image/webp" className="file-input w-full" aria-describedby={`${id}-files-hint`} />
            <p id={`${id}-files-hint`} className="label">Selecione uma ou mais imagens JPG, PNG ou WebP.</p>
          </fieldset>

          <div>
            <p id={`${id}-quality`} className="text-sm font-semibold">
              Qualidade: {quality}%
            </p>
            <Slider
              value={quality}
              min={10}
              max={100}
              step={5}
              aria-labelledby={`${id}-quality`}
              getAriaValueText={(value) => `${value}%`}
              onChange={(_, value) => setQuality(value as number)}
            />
            <p className="text-xs text-muted">Valores menores geram arquivos mais leves, com menos detalhes.</p>
          </div>

          <ToolActions note={TOOL_PENDING_NOTE}>
            <button type="button" className="btn btn-primary" disabled>
              Comprimir
            </button>
          </ToolActions>
        </ToolInput>

        <ToolOutput placeholder="O tamanho original, o novo tamanho e a economia aparecerão aqui." />
      </div>
    </MuiProvider>
  );
}
