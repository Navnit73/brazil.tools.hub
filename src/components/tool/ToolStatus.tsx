import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ToolStatusKind = "info" | "success" | "error";

interface ToolStatusProps {
  kind: ToolStatusKind;
  children: ReactNode;
  className?: string;
}

const kindClass: Record<ToolStatusKind, string> = {
  // O "info" do tema é verde-claro: no estilo soft, o texto ficaria quase invisível.
  info: "border-md-outline-variant bg-md-surface-high text-md-on-surface",
  success: "alert-success",
  error: "alert-error",
};

/** Mensagem de estado (aviso, sucesso ou erro). Erros são anunciados imediatamente. */
export function ToolStatus({ kind, children, className }: ToolStatusProps) {
  return (
    <div role={kind === "error" ? "alert" : "status"} className={cn("alert alert-soft text-sm", kindClass[kind], className)}>
      <span>{children}</span>
    </div>
  );
}
