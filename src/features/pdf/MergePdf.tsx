"use client";

import { useId } from "react";
import { ToolActions } from "@/components/tool/ToolActions";
import { ToolInput } from "@/components/tool/ToolInput";
import { ToolOutput } from "@/components/tool/ToolOutput";
import { TOOL_PENDING_NOTE } from "@/lib/constants";

export default function MergePdf() {
  const id = useId();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ToolInput>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Arquivos PDF</legend>
          <input id={`${id}-files`} type="file" multiple accept="application/pdf" className="file-input w-full" aria-describedby={`${id}-files-hint`} />
          <p id={`${id}-files-hint`} className="label">Selecione dois ou mais arquivos. Você poderá reordená-los antes de juntar.</p>
        </fieldset>

        <ToolActions note={TOOL_PENDING_NOTE}>
          <button type="button" className="btn btn-primary" disabled>
            Juntar PDFs
          </button>
        </ToolActions>
      </ToolInput>

      <ToolOutput title="Ordem dos arquivos" placeholder="Os arquivos selecionados aparecerão aqui, na ordem em que serão unidos." />
    </div>
  );
}
