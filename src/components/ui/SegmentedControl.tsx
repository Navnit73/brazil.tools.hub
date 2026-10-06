"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  /** Esconde o rótulo visualmente (continua disponível para leitores de tela). */
  hideLabel?: boolean;
  disabled?: boolean;
}

/**
 * Grupo de botões de escolha única. Usa radios nativos: setas do teclado,
 * foco e anúncio em leitores de tela funcionam sem código extra.
 */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  hideLabel = false,
  disabled = false,
}: SegmentedControlProps<T>) {
  const name = useId();

  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className={cn("mb-2 text-sm font-medium text-md-on-surface", hideLabel && "sr-only")}>{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex min-h-10 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-m-sm border px-3 text-sm font-medium select-none",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
              "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
              option.value === value
                ? "border-transparent bg-md-secondary-container text-md-on-secondary-container"
                : "border-md-outline-variant bg-md-surface-lowest text-md-on-surface-variant hover:bg-md-surface-low",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {/* Chip de filtro do M3: o selecionado ganha um check. */}
            {option.value === value && (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.25">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
              </svg>
            )}
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
