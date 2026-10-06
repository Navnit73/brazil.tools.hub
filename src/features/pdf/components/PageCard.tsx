"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { PDFDocumentProxy } from "../lib/render";
import { PdfIcon } from "./icons";
import { PageThumbnail } from "./PageThumbnail";

interface PageCardProps {
  /** Sem documento, mostra uma página em branco. */
  doc?: PDFDocumentProxy;
  pageNumber: number;
  /** Rotação extra mostrada na miniatura. */
  rotation?: number;
  /** Texto sob a miniatura (padrão: número da página). */
  label?: ReactNode;
  /** Com `onToggle`, a miniatura vira um botão de marcar/desmarcar. */
  selected?: boolean;
  /** `remove` marca com X vermelho (páginas que serão excluídas). */
  tone?: "select" | "remove";
  onToggle?: () => void;
  /** Para cliques que não marcam/desmarcam (ex.: girar): nome acessível da ação, sem indicador de seleção. */
  clickLabel?: string;
  /** Botões exibidos abaixo da miniatura (girar, mover…). */
  actions?: ReactNode;
  /** Etiqueta no canto superior esquerdo (ex.: número do grupo). */
  badge?: ReactNode;
  /** Atributos extras do `<li>` (ex.: arrastar para reordenar). */
  itemProps?: HTMLAttributes<HTMLLIElement>;
  className?: string;
}

/** Miniatura de página com número, seleção e ações. */
export function PageCard({
  doc,
  pageNumber,
  rotation,
  label,
  selected = false,
  tone = "select",
  onToggle,
  clickLabel,
  actions,
  badge,
  itemProps,
  className,
}: PageCardProps) {
  const isToggle = Boolean(onToggle) && !clickLabel;
  const removing = tone === "remove" && selected;
  const thumbnail = (
    <div className="relative">
      {doc ? (
        <PageThumbnail
          doc={doc}
          pageNumber={pageNumber}
          rotation={rotation}
          className={cn("transition-opacity", removing && "opacity-40")}
        />
      ) : (
        <BlankThumbnail rotation={rotation} />
      )}
      {badge && <span className="absolute top-1.5 left-1.5">{badge}</span>}
      {isToggle && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full border-2 transition-colors",
            selected
              ? removing
                ? "border-error bg-error text-white"
                : "border-primary bg-primary text-white"
              : "border-md-outline bg-md-surface-lowest/90",
          )}
        >
          {selected && <PdfIcon name={removing ? "close" : "check"} className="size-3.5" strokeWidth={3} />}
        </span>
      )}
    </div>
  );

  const ring = selected ? (removing ? "ring-2 ring-error" : "ring-2 ring-primary") : "ring-1 ring-md-outline-variant";
  const caption = (
    <span className="block truncate pt-1.5 text-center text-xs font-medium text-md-on-surface-variant">{label ?? pageNumber}</span>
  );

  return (
    <li {...itemProps} className={cn("flex min-w-0 flex-col", className)}>
      {onToggle ? (
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={isToggle ? selected : undefined}
          aria-label={clickLabel ?? `Página ${pageNumber}`}
          className={cn("rounded-m-sm p-1.5 text-left transition-shadow hover:bg-md-surface-low", ring)}
        >
          {thumbnail}
          {caption}
        </button>
      ) : (
        <div className={cn("rounded-m-sm p-1.5", ring)}>
          {thumbnail}
          {caption}
        </div>
      )}
      {actions && <div className="mt-1 flex justify-center gap-1">{actions}</div>}
    </li>
  );
}

/** Página em branco (A4), com a mesma moldura das miniaturas. */
function BlankThumbnail({ rotation = 0 }: { rotation?: number }) {
  const sideways = Math.abs(rotation / 90) % 2 === 1;
  return (
    <div className="grid aspect-[3/4] w-full place-items-center rounded-m-sm bg-md-surface-high">
      <div
        className={cn(
          "bg-white shadow-sm ring-1 ring-black/10 transition-all duration-200",
          sideways ? "aspect-[297/210] w-full" : "aspect-[210/297] h-full",
        )}
      />
    </div>
  );
}

/** Grade responsiva de páginas. */
export function PageGrid({ children, label, wide = false }: { children: ReactNode; label: string; wide?: boolean }) {
  return (
    <ul
      aria-label={label}
      className={cn(
        "grid gap-2 sm:gap-3",
        // `wide`: cartões com mais botões precisam de mais espaço no celular.
        wide ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5",
      )}
    >
      {children}
    </ul>
  );
}

/** Botão pequeno de ícone para as ações de página. */
export function PageAction({
  label,
  onClick,
  children,
  disabled,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="btn btn-ghost btn-xs size-9 p-0 sm:size-8"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}
