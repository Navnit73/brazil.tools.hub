"use client";

import { useId } from "react";

interface RangeFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Formata o valor exibido e anunciado (ex.: `(v) => `${v}%``). */
  format?: (value: number) => string;
  hint?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}

/** Controle deslizante nativo com rótulo e valor visível; área de toque ampla no celular. */
export function RangeField({ label, value, min, max, step = 1, format = String, hint, disabled, onChange }: RangeFieldProps) {
  const id = useId();
  const text = format(value);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <label htmlFor={id} className="font-semibold">
          {label}
        </label>
        <output htmlFor={id} className="tabular-nums text-muted">
          {text}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={text}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(event) => onChange(event.target.valueAsNumber)}
        className="range range-primary my-2 w-full"
      />
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
