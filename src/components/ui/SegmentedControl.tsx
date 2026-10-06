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
      <legend className={cn("mb-2 text-sm font-semibold", hideLabel && "sr-only")}>{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-sm border px-3 text-sm font-medium select-none",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
              "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
              option.value === value
                ? "border-primary bg-primary text-on-primary"
                : "border-border-strong bg-background hover:border-primary",
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
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
