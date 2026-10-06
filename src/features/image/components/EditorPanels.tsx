"use client";

import { useId, useState, type ReactNode } from "react";
import { RangeField } from "@/components/ui/RangeField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { DEFAULT_ADJUSTMENTS, hasAdjustments, type Adjustments } from "../lib/adjustments";
import { ASPECTS, MAX_UPSCALE, type AspectKey, type ResizeSetting } from "../lib/editor";
import type { Size } from "../lib/render";

const aspectOptions = (Object.keys(ASPECTS) as AspectKey[]).map((key) => ({ value: key, label: ASPECTS[key].label }));

export function CropPanel({
  aspect,
  hasCrop,
  onAspectChange,
  onStart,
  onClear,
}: {
  aspect: AspectKey;
  hasCrop: boolean;
  onAspectChange: (aspect: AspectKey) => void;
  /** Cria uma seleção inicial para quem não sabe que pode arrastar. */
  onStart: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl label="Proporção" options={aspectOptions} value={aspect} onChange={onAspectChange} />
      <p className="text-xs text-md-on-surface-variant">
        Arraste sobre a imagem para marcar a área e use os cantos para ajustar. No teclado, selecione a área e use as setas.
      </p>
      {hasCrop ? (
        <button type="button" className="btn btn-ghost min-h-11 self-start" onClick={onClear}>
          Remover corte
        </button>
      ) : (
        <button type="button" className="btn btn-outline btn-primary min-h-11 self-start" onClick={onStart}>
          Marcar área de corte
        </button>
      )}
    </div>
  );
}

export function RotatePanel({ onRotate, onFlip }: { onRotate: (clockwise: boolean) => void; onFlip: (axis: "x" | "y") => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <IconButton label="Girar à esquerda" onClick={() => onRotate(false)} icon={<path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />} />
      <IconButton label="Girar à direita" onClick={() => onRotate(true)} icon={<path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" />} />
      <IconButton label="Espelhar horizontal" onClick={() => onFlip("x")} icon={<path d="M12 3v18M8 7l-5 5 5 5M16 7l5 5-5 5" />} />
      <IconButton label="Espelhar vertical" onClick={() => onFlip("y")} icon={<path d="M3 12h18M7 8l5-5 5 5M7 16l5 5 5-5" />} />
    </div>
  );
}

function IconButton({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return (
    <button type="button" className="btn h-auto min-h-16 flex-col gap-1 border-md-outline-variant bg-md-surface-lowest py-2 text-xs font-medium text-md-on-surface hover:bg-md-secondary-container" onClick={onClick}>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon}
      </svg>
      {label}
    </button>
  );
}

const SCALE_PRESETS = [1, 0.75, 0.5, 0.25];

export function ResizePanel({
  base,
  output,
  resize,
  onChange,
}: {
  /** Tamanho da área cortada (100%). */
  base: Size;
  output: Size;
  resize: ResizeSetting;
  onChange: (resize: ResizeSetting) => void;
}) {
  const [locked, setLocked] = useState(resize.mode === "scale");
  const maxWidth = base.width * MAX_UPSCALE;
  const maxHeight = base.height * MAX_UPSCALE;

  function setWidth(width: number) {
    const value = Math.min(width, maxWidth);
    onChange(locked ? { mode: "scale", scale: value / base.width } : { mode: "exact", width: value, height: output.height });
  }

  function setHeight(height: number) {
    const value = Math.min(height, maxHeight);
    onChange(locked ? { mode: "scale", scale: value / base.height } : { mode: "exact", width: output.width, height: value });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <DimensionInput label="Largura" value={output.width} max={maxWidth} onCommit={setWidth} />
        <DimensionInput label="Altura" value={output.height} max={maxHeight} onCommit={setHeight} />
      </div>

      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
        <input
          type="checkbox"
          className="checkbox checkbox-primary"
          checked={locked}
          onChange={(event) => {
            setLocked(event.target.checked);
            // Ao travar de novo, volta a seguir a proporção da imagem.
            if (event.target.checked && resize.mode === "exact") onChange({ mode: "scale", scale: output.width / base.width });
          }}
        />
        Manter proporção
      </label>

      <SegmentedControl
        label="Atalhos"
        options={SCALE_PRESETS.map((scale) => ({ value: String(scale), label: `${scale * 100}%` }))}
        value={resize.mode === "scale" ? String(resize.scale) : ""}
        onChange={(value) => onChange({ mode: "scale", scale: Number(value) })}
      />
    </div>
  );
}

/** Campo numérico que aceita ficar vazio durante a digitação. */
function DimensionInput({ label, value, max, onCommit }: { label: string; value: number; max: number; onCommit: (value: number) => void }) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1 text-sm">
      <label htmlFor={id} className="font-medium text-md-on-surface">
        {label} (px)
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={1}
        max={Math.round(max)}
        value={draft ?? String(value)}
        onChange={(event) => {
          setDraft(event.target.value);
          const number = Math.round(Number(event.target.value));
          if (number >= 1) onCommit(number);
        }}
        onBlur={() => setDraft(null)}
        className="input min-h-11 w-full bg-md-surface-lowest tabular-nums"
      />
    </div>
  );
}

const ADJUSTMENT_FIELDS: Array<{ key: keyof Adjustments; label: string }> = [
  { key: "brightness", label: "Brilho" },
  { key: "contrast", label: "Contraste" },
  { key: "saturation", label: "Saturação" },
];

export function AdjustPanel({ adjustments, onChange }: { adjustments: Adjustments; onChange: (adjustments: Adjustments) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {ADJUSTMENT_FIELDS.map(({ key, label }) => (
        <RangeField
          key={key}
          label={label}
          value={adjustments[key]}
          min={0}
          max={200}
          step={5}
          format={(value) => `${value > 100 ? "+" : ""}${value - 100}`}
          onChange={(value) => onChange({ ...adjustments, [key]: value })}
        />
      ))}
      {hasAdjustments(adjustments) && (
        <button type="button" className="btn btn-ghost min-h-11 self-start" onClick={() => onChange(DEFAULT_ADJUSTMENTS)}>
          Restaurar cores
        </button>
      )}
    </div>
  );
}
