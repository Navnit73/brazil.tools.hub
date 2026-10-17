import { context2d, createCanvas } from "./render";

/** Pixels por centímetro em 300 DPI. */
const PX_PER_CM = 300 / 2.54;

/** Folha 10 × 15 cm (tamanho padrão de revelação) com 3 × 3 fotos 3 × 4 cm. */
export const PHOTO_SHEET = { widthCm: 10, heightCm: 15, columns: 3, rows: 3 } as const;

export const PHOTO_SHEET_COUNT = PHOTO_SHEET.columns * PHOTO_SHEET.rows;

/** Tamanho da foto 3 × 4 cm na folha, em 300 DPI. */
export const SHEET_PHOTO_SIZE = { width: Math.round(3 * PX_PER_CM), height: Math.round(4 * PX_PER_CM) };

/**
 * Monta a folha para imprimir: fotos em tamanho real, espaçadas por igual,
 * com contorno cinza-claro para guiar o corte.
 */
export function renderPhotoSheet(photo: HTMLCanvasElement): HTMLCanvasElement {
  const { widthCm, heightCm, columns, rows } = PHOTO_SHEET;
  const sheet = createCanvas(widthCm * PX_PER_CM, heightCm * PX_PER_CM);
  const ctx = context2d(sheet);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, sheet.width, sheet.height);

  const { width, height } = SHEET_PHOTO_SIZE;
  const gapX = (sheet.width - columns * width) / (columns + 1);
  const gapY = (sheet.height - rows * height) / (rows + 1);
  ctx.strokeStyle = "#cccccc";
  ctx.lineWidth = 1;

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const x = Math.round(gapX + column * (width + gapX));
      const y = Math.round(gapY + row * (height + gapY));
      ctx.drawImage(photo, x, y, width, height);
      ctx.strokeRect(x - 0.5, y - 0.5, width + 1, height + 1);
    }
  }
  return sheet;
}
