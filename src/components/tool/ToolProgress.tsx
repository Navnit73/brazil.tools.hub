interface ToolProgressProps {
  /** Texto exibido acima da barra (ex.: "Comprimindo 2 de 5…"). */
  label: string;
  value: number;
  max: number;
}

export function ToolProgress({ label, value, max }: ToolProgressProps) {
  return (
    <div role="status" className="flex flex-col gap-1">
      <p className="text-sm font-semibold">{label}</p>
      <progress className="progress progress-primary w-full" value={value} max={max} aria-label={label} />
    </div>
  );
}
