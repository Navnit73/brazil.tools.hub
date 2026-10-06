import { DEFAULT_ADJUSTMENTS, type Adjustments } from "./adjustments";
import { cropToPixels, fitToCanvasLimit, orientedSize, type CropRect, type Rotation, type Size } from "./render";

export type AspectKey = "free" | "1:1" | "4:3" | "3:4" | "16:9" | "9:16";

export const ASPECTS: Record<AspectKey, { label: string; ratio?: number; inverse: AspectKey }> = {
  free: { label: "Livre", inverse: "free" },
  "1:1": { label: "1:1", ratio: 1, inverse: "1:1" },
  "4:3": { label: "4:3", ratio: 4 / 3, inverse: "3:4" },
  "3:4": { label: "3:4", ratio: 3 / 4, inverse: "4:3" },
  "16:9": { label: "16:9", ratio: 16 / 9, inverse: "9:16" },
  "9:16": { label: "9:16", ratio: 9 / 16, inverse: "16:9" },
};

/** `scale` acompanha o corte automaticamente; `exact` fixa largura e altura. */
export type ResizeSetting = { mode: "scale"; scale: number } | { mode: "exact"; width: number; height: number };

export interface EditorState {
  rotation: Rotation;
  flipX: boolean;
  flipY: boolean;
  crop: CropRect | null;
  aspect: AspectKey;
  resize: ResizeSetting;
  adjustments: Adjustments;
}

export const INITIAL_EDITOR_STATE: EditorState = {
  rotation: 0,
  flipX: false,
  flipY: false,
  crop: null,
  aspect: "free",
  resize: { mode: "scale", scale: 1 },
  adjustments: DEFAULT_ADJUSTMENTS,
};

/** Maior ampliação permitida, para não gerar arquivos gigantes por engano. */
export const MAX_UPSCALE = 4;

/**
 * Gira a visualização 90° (sentido horário quando `clockwise`).
 * O corte acompanha o giro para não se perder o trabalho já feito.
 */
export function rotateView(state: EditorState, clockwise: boolean): EditorState {
  // Com um único espelhamento ativo, o giro no contexto do canvas inverte de sentido.
  const direction = (clockwise ? 1 : -1) * (state.flipX !== state.flipY ? -1 : 1);
  const rotation = ((state.rotation + direction * 90 + 360) % 360) as Rotation;
  const { crop } = state;
  const rotated: CropRect | null = !crop
    ? null
    : clockwise
      ? { x: 100 - crop.y - crop.height, y: crop.x, width: crop.height, height: crop.width }
      : { x: crop.y, y: 100 - crop.x - crop.width, width: crop.height, height: crop.width };
  return { ...state, rotation, crop: rotated, aspect: ASPECTS[state.aspect].inverse };
}

export function flipView(state: EditorState, axis: "x" | "y"): EditorState {
  const { crop } = state;
  if (axis === "x") {
    return { ...state, flipX: !state.flipX, crop: crop && { ...crop, x: 100 - crop.x - crop.width } };
  }
  return { ...state, flipY: !state.flipY, crop: crop && { ...crop, y: 100 - crop.y - crop.height } };
}

/** Tamanho da área cortada, em pixels da imagem original. */
export function croppedSize(image: Size, state: EditorState): Size {
  const { width, height } = cropToPixels(state.crop, orientedSize(image.width, image.height, state.rotation));
  return { width, height };
}

/** Tamanho final do arquivo exportado. */
export function outputSize(image: Size, state: EditorState): Size {
  const base = croppedSize(image, state);
  const size =
    state.resize.mode === "exact"
      ? { width: state.resize.width, height: state.resize.height }
      : { width: Math.round(base.width * state.resize.scale), height: Math.round(base.height * state.resize.scale) };
  return fitToCanvasLimit({ width: Math.max(1, size.width), height: Math.max(1, size.height) });
}

export function isEdited(state: EditorState): boolean {
  return JSON.stringify(state) !== JSON.stringify(INITIAL_EDITOR_STATE);
}
