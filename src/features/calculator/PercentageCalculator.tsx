"use client";

import { ToolActions } from "@/components/tool/ToolActions";
import { ToolInput } from "@/components/tool/ToolInput";
import { ToolOutput } from "@/components/tool/ToolOutput";
import { TOOL_PENDING_NOTE } from "@/lib/constants";

const modes = [
  { value: "of", label: "Quanto é X% de Y" },
  { value: "ratio", label: "X é quantos % de Y" },
  { value: "change", label: "Variação de X para Y" },
] as const;

export default function PercentageCalculator() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ToolInput>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Tipo de cálculo</span>
          <select className="select w-full" defaultValue="of">
            {modes.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">Valor X</span>
            <input type="text" inputMode="decimal" placeholder="Ex.: 15" className="input w-full" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">Valor Y</span>
            <input type="text" inputMode="decimal" placeholder="Ex.: 200" className="input w-full" />
          </label>
        </div>

        <ToolActions note={TOOL_PENDING_NOTE}>
          <button type="button" className="btn btn-primary" disabled>
            Calcular
          </button>
        </ToolActions>
      </ToolInput>

      <ToolOutput placeholder="O resultado e o passo a passo da conta aparecerão aqui." />
    </div>
  );
}
