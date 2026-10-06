/** Ajustes de cor em porcentagem; 100 = sem alteração (mesma escala dos filtros CSS). */
export interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
}

export const DEFAULT_ADJUSTMENTS: Adjustments = { brightness: 100, contrast: 100, saturation: 100 };

export function hasAdjustments(adjustments: Adjustments): boolean {
  return (Object.keys(DEFAULT_ADJUSTMENTS) as Array<keyof Adjustments>).some((key) => adjustments[key] !== DEFAULT_ADJUSTMENTS[key]);
}

/** Filtro CSS para a prévia ao vivo (rápido, feito pela GPU). */
export function adjustmentsToCssFilter({ brightness, contrast, saturation }: Adjustments): string {
  return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
}

/**
 * Aplica os ajustes nos pixels com as mesmas fórmulas dos filtros CSS, na mesma ordem.
 * Feito à mão porque `ctx.filter` não existe em todos os navegadores (ex.: Safari antigo),
 * garantindo que o arquivo baixado fique igual à prévia.
 */
export function applyAdjustments(canvas: HTMLCanvasElement, adjustments: Adjustments): void {
  if (!hasAdjustments(adjustments)) return;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;

  const b = adjustments.brightness / 100;
  const c = adjustments.contrast / 100;
  const s = adjustments.saturation / 100;
  const intercept = 0.5 * (1 - c) * 255;
  // Matriz de saturação da especificação Filter Effects.
  // prettier-ignore
  const m = [
    0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s,
    0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s,
    0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s,
  ];

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    // Uint8ClampedArray limita a 0–255 na escrita; os passos intermediários também são limitados, como no CSS.
    const r = clamp(clamp(data[i] * b) * c + intercept);
    const g = clamp(clamp(data[i + 1] * b) * c + intercept);
    const bl = clamp(clamp(data[i + 2] * b) * c + intercept);
    data[i] = m[0] * r + m[1] * g + m[2] * bl;
    data[i + 1] = m[3] * r + m[4] * g + m[5] * bl;
    data[i + 2] = m[6] * r + m[7] * g + m[8] * bl;
  }
  ctx.putImageData(image, 0, 0);
}

function clamp(value: number): number {
  return value < 0 ? 0 : value > 255 ? 255 : value;
}
