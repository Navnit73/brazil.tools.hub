"use client";

import { useId, useState } from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { MuiProvider } from "@/components/ui/MuiProvider";
import { ToolActions } from "@/components/tool/ToolActions";
import { ToolInput } from "@/components/tool/ToolInput";
import { ToolOutput } from "@/components/tool/ToolOutput";
import { TOOL_PENDING_NOTE } from "@/lib/constants";

type Unit = "px" | "percent";

export default function ResizeImage() {
  const id = useId();
  const [unit, setUnit] = useState<Unit>("px");
  const suffix = unit === "px" ? "px" : "%";

  return (
    <MuiProvider>
      <div className="grid gap-6 lg:grid-cols-2">
        <ToolInput>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Imagem</legend>
            <input id={`${id}-file`} type="file" accept="image/jpeg,image/png,image/webp" className="file-input w-full" aria-describedby={`${id}-file-hint`} />
            <p id={`${id}-file-hint`} className="label">JPG, PNG ou WebP. A imagem não sai do seu dispositivo.</p>
          </fieldset>

          <div>
            <p id={`${id}-unit`} className="mb-2 text-sm font-semibold">Unidade</p>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={unit}
              aria-labelledby={`${id}-unit`}
              onChange={(_, value: Unit | null) => value && setUnit(value)}
            >
              <ToggleButton value="px">Pixels</ToggleButton>
              <ToggleButton value="percent">Porcentagem</ToggleButton>
            </ToggleButtonGroup>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold">Largura ({suffix})</span>
              <input type="number" min={1} inputMode="numeric" className="input w-full" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold">Altura ({suffix})</span>
              <input type="number" min={1} inputMode="numeric" className="input w-full" />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" defaultChecked />
            Manter proporção
          </label>

          <ToolActions note={TOOL_PENDING_NOTE}>
            <button type="button" className="btn btn-primary" disabled>
              Redimensionar
            </button>
          </ToolActions>
        </ToolInput>

        <ToolOutput placeholder="A prévia da imagem redimensionada aparecerá aqui." />
      </div>
    </MuiProvider>
  );
}
