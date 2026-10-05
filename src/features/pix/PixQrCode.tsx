"use client";

import { ToolActions } from "@/components/tool/ToolActions";
import { ToolInput } from "@/components/tool/ToolInput";
import { ToolOutput } from "@/components/tool/ToolOutput";
import { TOOL_PENDING_NOTE } from "@/lib/constants";

const keyTypes = ["CPF/CNPJ", "Celular", "E-mail", "Chave aleatória"] as const;

export default function PixQrCode() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ToolInput>
        <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">Tipo de chave</span>
            <select className="select w-full" defaultValue={keyTypes[0]}>
              {keyTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">Chave Pix</span>
            <input type="text" autoComplete="off" className="input w-full" required />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Nome do recebedor</span>
          <input type="text" autoComplete="name" maxLength={25} className="input w-full" required />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">Cidade</span>
            <input type="text" autoComplete="address-level2" maxLength={15} className="input w-full" required />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">
              Valor (R$) <span className="font-normal text-muted">— opcional</span>
            </span>
            <input type="text" inputMode="decimal" placeholder="0,00" className="input w-full" />
          </label>
        </div>

        <ToolActions note={TOOL_PENDING_NOTE}>
          <button type="button" className="btn btn-primary" disabled>
            Gerar QR Code
          </button>
        </ToolActions>
      </ToolInput>

      <ToolOutput placeholder="O QR Code e o código Pix copia e cola aparecerão aqui." />
    </div>
  );
}
