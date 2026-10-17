"use client";

import "react-image-crop/dist/ReactCrop.css";
import { useEffect, useRef, useState, type ReactNode } from "react";
import ReactCrop from "react-image-crop";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolStatus } from "@/components/tool/ToolStatus";
import { RangeField } from "@/components/ui/RangeField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { downloadBlob, formatBytes, matchesAccept } from "@/lib/file";
import { AdjustPanel, RotatePanel } from "./components/EditorPanels";
import { adjustmentsToCssFilter } from "./lib/adjustments";
import { flattenOnColor, segmentPerson, type SegmentProgress } from "./lib/background";
import { decodeImage, type DecodedImage } from "./lib/decode";
import { INITIAL_EDITOR_STATE, croppedSize, flipView, rotateView, type EditorState } from "./lib/editor";
import { encodeCanvas } from "./lib/encode";
import { IMAGE_INPUT_ACCEPT, IMAGE_INPUT_HINT } from "./lib/formats";
import { PHOTO_SHEET_COUNT, SHEET_PHOTO_SIZE, renderPhotoSheet } from "./lib/photo-sheet";
import { context2d, fitWithin, orientedSize, renderImage, type CropRect, type Size } from "./lib/render";

/** Proporção 3×4 (retrato): largura / altura. */
const RATIO = 3 / 4;

/** 3 × 4 cm em 300 e 600 DPI. */
const PHOTO_SIZES = {
  standard: { label: "354 × 472 px", hint: "300 DPI", width: 354, height: 472 },
  high: { label: "708 × 944 px", hint: "600 DPI", width: 708, height: 944 },
} as const;

type PhotoSize = keyof typeof PHOTO_SIZES;

const sizeOptions = (Object.keys(PHOTO_SIZES) as PhotoSize[]).map((key) => ({
  value: key,
  label: `${PHOTO_SIZES[key].label} (${PHOTO_SIZES[key].hint})`,
}));

const panelOptions = [
  { value: "rotate", label: "Girar" },
  { value: "adjust", label: "Cores" },
] as const;

type PhotoPanel = (typeof panelOptions)[number]["value"];

const PREVIEW_MAX_SIDE = 1600;
const JPEG_QUALITY = 0.92;
/** Maior lado da cópia com fundo branco: sobra resolução para a foto 3×4 em 600 DPI. */
const WHITE_BACKGROUND_MAX_SIDE = 2000;

/** Zoom 1 = o maior quadro 3:4 que cabe na foto. */
const INITIAL_ZOOM = 1 / 0.9;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.1;
/** Cada toque nas setas move o quadro 5% do próprio tamanho. */
const MOVE_STEP = 0.05;

const CROP_LABELS = {
  cropArea: "Enquadramento da foto",
  nwDragHandle: "Canto superior esquerdo",
  nDragHandle: "Borda superior",
  neDragHandle: "Canto superior direito",
  eDragHandle: "Borda direita",
  seDragHandle: "Canto inferior direito",
  sDragHandle: "Borda inferior",
  swDragHandle: "Canto inferior esquerdo",
  wDragHandle: "Borda esquerda",
};

interface LoadedImage {
  file: File;
  image: DecodedImage;
}

interface DocumentPhotoProps {
  /** Nome do arquivo baixado, sem extensão (ex.: "foto-oab-3x4"). */
  fileName: string;
  /** Oferece também a folha 10 × 15 cm com várias fotos para imprimir. */
  printSheet?: boolean;
}

/**
 * Foto 3×4 para documentos: enquadramento travado em 3:4 com guia do rosto,
 * zoom, ajuste de posição, giro, cores e saída em JPG com fundo branco no tamanho de 3 × 4 cm.
 */
export default function DocumentPhoto({ fileName, printSheet = false }: DocumentPhotoProps) {
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<EditorState>(INITIAL_EDITOR_STATE);
  const [panel, setPanel] = useState<PhotoPanel>("rotate");
  const [size, setSize] = useState<PhotoSize>("standard");
  const [showGuide, setShowGuide] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState<{ name: string; size: number } | null>(null);
  const [whiteImage, setWhiteImage] = useState<DecodedImage | null>(null);
  const [useWhite, setUseWhite] = useState(false);
  const [segmenting, setSegmenting] = useState<SegmentProgress | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const resultRef = useRef<HTMLCanvasElement>(null);
  const loadedRef = useRef<LoadedImage | null>(null);

  useEffect(() => () => loadedRef.current?.image.release(), []);

  // Com "Fundo branco", a cópia sem fundo substitui a foto em todo o fluxo (prévia, corte e download).
  const source = loaded && (useWhite && whiteImage ? whiteImage : loaded.image);
  const { rotation, flipX, flipY, crop } = state;
  useEffect(() => {
    const canvas = previewRef.current;
    if (!source || !canvas) return;
    const image = source;
    const preview = fitWithin(orientedSize(image.width, image.height, rotation), PREVIEW_MAX_SIDE);
    const rendered = renderImage(image, { rotation, flipX, flipY, ...preview });
    canvas.width = rendered.width;
    canvas.height = rendered.height;
    context2d(canvas).drawImage(rendered, 0, 0);
  }, [source, rotation, flipX, flipY]);

  // Miniatura do resultado, recortada da prévia (declarada depois para usar a prévia já redesenhada).
  useEffect(() => {
    const preview = previewRef.current;
    const canvas = resultRef.current;
    if (!source || !preview || !canvas || !crop) return;
    const ctx = context2d(canvas);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      preview,
      (crop.x / 100) * preview.width,
      (crop.y / 100) * preview.height,
      (crop.width / 100) * preview.width,
      (crop.height / 100) * preview.height,
      0,
      0,
      canvas.width,
      canvas.height,
    );
  }, [source, rotation, flipX, flipY, crop]);

  async function openFile([file]: File[]) {
    if (!file) return;
    setError(null);
    setExported(null);
    if (!matchesAccept(file, IMAGE_INPUT_ACCEPT)) {
      setError("Formato não suportado. Escolha uma foto JPG, PNG, WebP, AVIF, GIF ou BMP.");
      return;
    }
    setOpening(true);
    try {
      const image = await decodeImage(file);
      loadedRef.current?.image.release();
      loadedRef.current = { file, image };
      setLoaded(loadedRef.current);
      setWhiteImage(null);
      setUseWhite(false);
      setState(initialState(image));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível abrir a foto.");
    } finally {
      setOpening(false);
    }
  }

  function closeImage() {
    loadedRef.current?.image.release();
    loadedRef.current = null;
    setLoaded(null);
    setWhiteImage(null);
    setUseWhite(false);
    setError(null);
    setExported(null);
  }

  function edit(next: EditorState | ((current: EditorState) => EditorState)) {
    setState(next);
    setExported(null);
  }

  if (!loaded) {
    return (
      <div className="flex flex-col gap-4">
        <FileDropzone
          accept={IMAGE_INPUT_ACCEPT}
          acceptPaste
          disabled={opening}
          label={opening ? "Abrindo foto…" : "Escolha a sua foto"}
          hint={IMAGE_INPUT_HINT}
          onFiles={openFile}
        />
        {error && <ToolStatus kind="error">{error}</ToolStatus>}
      </div>
    );
  }

  const { file, image: original } = loaded;
  const image = source ?? original;
  const target = PHOTO_SIZES[size];
  const oriented = orientedSize(image.width, image.height, rotation);
  const frame = crop ?? centeredCrop(oriented);
  const zoom = Math.min(MAX_ZOOM, Math.max(1, fullCrop(oriented).height / frame.height));
  // Recorte menor que o tamanho final: a foto será ampliada e pode ficar borrada.
  const lowResolution = croppedSize(image, state).height < target.height;

  function rotate(clockwise: boolean) {
    // O giro troca largura e altura; um novo enquadramento 3:4 é centralizado.
    const rotated = rotateView(state, clockwise);
    const size = orientedSize(image.width, image.height, rotated.rotation);
    edit({ ...rotated, aspect: "3:4", crop: centeredCrop(size) });
  }

  async function toggleWhiteBackground(enabled: boolean) {
    setExported(null);
    if (!enabled || whiteImage) {
      setUseWhite(enabled);
      return;
    }
    const current = loadedRef.current;
    setError(null);
    setSegmenting({ stage: "download" });
    try {
      const copy = renderImage(original, fitWithin(original, WHITE_BACKGROUND_MAX_SIDE));
      const white = flattenOnColor(await segmentPerson(copy, setSegmenting), "#ffffff");
      // A foto foi trocada enquanto o modelo rodava: descarta o resultado.
      if (loadedRef.current !== current) return;
      setWhiteImage({ source: white, width: white.width, height: white.height, release: () => {} });
      setUseWhite(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível trocar o fundo.");
    } finally {
      setSegmenting(null);
    }
  }

  function setZoom(value: number) {
    edit({ ...state, crop: zoomCrop(frame, oriented, Math.min(MAX_ZOOM, Math.max(1, value))) });
  }

  function move(dx: number, dy: number) {
    edit({
      ...state,
      crop: clampCrop({ ...frame, x: frame.x + dx * frame.width * MOVE_STEP, y: frame.y + dy * frame.height * MOVE_STEP }),
    });
  }

  async function download(kind: "photo" | "sheet") {
    setExporting(true);
    setError(null);
    setExported(null);
    await new Promise((resolve) => setTimeout(resolve, 0));
    try {
      const canvas =
        kind === "photo"
          ? renderImage(image, { ...state, width: target.width, height: target.height })
          : renderPhotoSheet(renderImage(image, { ...state, ...SHEET_PHOTO_SIZE }));
      const blob = await encodeCanvas(canvas, "jpeg", JPEG_QUALITY);
      const name = kind === "photo" ? `${fileName}.jpg` : `${fileName}-folha-10x15.jpg`;
      downloadBlob(blob, name);
      setExported({ name, size: blob.size });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível gerar a foto.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-6">
      <section aria-label="Prévia" className="flex min-w-0 flex-col gap-2">
        <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-m-md border border-md-outline-variant bg-md-surface-high p-2">
          <ReactCrop
            crop={crop ? { unit: "%", ...crop } : undefined}
            aspect={RATIO}
            keepSelection
            ariaLabels={CROP_LABELS}
            style={{ maxHeight: "min(60vh, 40rem)" }}
            renderSelectionAddon={() => (showGuide ? <FaceGuide /> : null)}
            onChange={(_, percent) => {
              if (percent.width > 0 && percent.height > 0) edit((current) => ({ ...current, crop: toRect(percent) }));
            }}
          >
            <canvas
              ref={previewRef}
              role="img"
              aria-label={`Prévia de ${file.name}`}
              className="block max-w-full touch-none"
              style={{ maxHeight: "inherit", filter: adjustmentsToCssFilter(state.adjustments) }}
            />
          </ReactCrop>
        </div>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-md-on-surface-variant">
          <span className="min-w-0 truncate font-medium text-md-on-surface">{file.name}</span>
          <span className="rounded-m-xs bg-md-surface-high px-1.5 py-0.5 tabular-nums">
            {image.width} × {image.height} px
          </span>
          <span className="rounded-m-xs bg-md-surface-high px-1.5 py-0.5 tabular-nums">{formatBytes(file.size)}</span>
        </p>
      </section>

      <div className="flex flex-col gap-5 rounded-m-md bg-md-surface-low p-4 sm:p-5">
        <section aria-label="Enquadramento" className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <figure className="flex shrink-0 flex-col items-center gap-1">
              <canvas
                ref={resultRef}
                width={240}
                height={320}
                role="img"
                aria-label="Como a foto vai ficar"
                className="block w-24 rounded-m-xs border border-md-outline-variant"
                style={{ filter: adjustmentsToCssFilter(state.adjustments) }}
              />
              <figcaption className="text-xs text-md-on-surface-variant">Resultado</figcaption>
            </figure>
            <div className="grid grid-cols-3 gap-1" role="group" aria-label="Mover o quadro">
              <span />
              <PadButton label="Mover para cima" onClick={() => move(0, -1)} icon={<path d="m6 15 6-6 6 6" />} />
              <span />
              <PadButton label="Mover para a esquerda" onClick={() => move(-1, 0)} icon={<path d="m15 6-6 6 6 6" />} />
              <PadButton
                label="Centralizar"
                onClick={() => edit({ ...state, crop: zoomCrop({ x: 0, y: 0, width: 100, height: 100 }, oriented, zoom) })}
                icon={<circle cx="12" cy="12" r="3" />}
              />
              <PadButton label="Mover para a direita" onClick={() => move(1, 0)} icon={<path d="m9 6 6 6-6 6" />} />
              <span />
              <PadButton label="Mover para baixo" onClick={() => move(0, 1)} icon={<path d="m6 9 6 6 6-6" />} />
              <span />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <PadButton label="Afastar" disabled={zoom <= 1} onClick={() => setZoom(zoom - ZOOM_STEP)} icon={<path d="M5 12h14" />} />
            <div className="min-w-0 flex-1">
              <RangeField
                label="Zoom"
                value={Math.round(zoom * 100)}
                min={100}
                max={MAX_ZOOM * 100}
                step={5}
                format={(value) => `${value}%`}
                onChange={(value) => setZoom(value / 100)}
              />
            </div>
            <PadButton
              label="Aproximar"
              disabled={zoom >= MAX_ZOOM}
              onClick={() => setZoom(zoom + ZOOM_STEP)}
              icon={<path d="M12 5v14M5 12h14" />}
            />
          </div>

          <p className="text-xs text-md-on-surface-variant">
            Use o zoom e as setas, ou arraste o quadro sobre a foto. O rosto deve ocupar a maior parte do quadro, com os ombros aparecendo.
          </p>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={showGuide}
              onChange={(event) => setShowGuide(event.target.checked)}
            />
            Mostrar guia do rosto
          </label>
        </section>

        <div className="flex flex-col gap-2">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={useWhite}
              disabled={segmenting !== null || exporting}
              onChange={(event) => toggleWhiteBackground(event.target.checked)}
            />
            Fundo branco
            {segmenting && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
          </label>
          <p className="text-xs text-md-on-surface-variant" aria-live="polite">
            {segmenting
              ? segmenting.stage === "download"
                ? `Baixando o modelo de IA (6 MB, só na primeira vez)… ${segmenting.percent !== undefined ? `${Math.round(segmenting.percent)}%` : ""}`
                : "Separando você do fundo…"
              : "A inteligência artificial troca o fundo por branco, direto no seu navegador."}
          </p>
        </div>

        <SegmentedControl label="Ajustes" options={panelOptions} value={panel} onChange={setPanel} />
        <div>
          {panel === "rotate" && <RotatePanel onRotate={rotate} onFlip={(axis) => edit(flipView(state, axis))} />}
          {panel === "adjust" && (
            <AdjustPanel adjustments={state.adjustments} onChange={(adjustments) => edit({ ...state, adjustments })} />
          )}
        </div>

        <div className="flex flex-col gap-4 border-t border-md-outline-variant pt-5">
          <SegmentedControl
            label="Tamanho da foto 3×4"
            options={sizeOptions}
            value={size}
            onChange={(value) => {
              setSize(value);
              setExported(null);
            }}
          />
          <p className="flex items-center justify-between gap-2 rounded-m-sm bg-md-surface-lowest px-3 py-2 text-sm text-md-on-surface-variant">
            Arquivo final
            <strong className="font-medium tabular-nums text-md-on-surface">
              JPG, {target.width} × {target.height} px
            </strong>
          </p>

          {lowResolution && (
            <ToolStatus kind="info">
              A área escolhida tem menos pixels que o tamanho final e a foto pode ficar borrada. Use uma foto de maior resolução ou
              diminua o zoom.
            </ToolStatus>
          )}
          {error && <ToolStatus kind="error">{error}</ToolStatus>}
          {exported && (
            <ToolStatus kind="success">
              Pronto! {exported.name} ({formatBytes(exported.size)}) foi baixada.
            </ToolStatus>
          )}

          <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-2 border-t border-md-outline-variant bg-md-surface-low px-4 py-3 sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:border-0 lg:p-0">
            <button type="button" className="btn btn-primary min-h-12 w-full" disabled={exporting} onClick={() => download("photo")}>
              {exporting && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
              {exporting ? "Gerando foto…" : "Baixar foto 3×4"}
            </button>
            {printSheet && (
              <button
                type="button"
                className="btn btn-outline btn-primary min-h-11 w-full"
                disabled={exporting}
                onClick={() => download("sheet")}
              >
                Baixar folha 10×15 para imprimir ({PHOTO_SHEET_COUNT} fotos)
              </button>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-ghost min-h-11 flex-1"
                disabled={JSON.stringify(state) === JSON.stringify(initialState(original)) || exporting}
                onClick={() => edit(initialState(original))}
              >
                Desfazer tudo
              </button>
              <button type="button" className="btn btn-ghost min-h-11 flex-1" disabled={exporting} onClick={closeImage}>
                Trocar foto
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PadButton({ label, icon, disabled, onClick }: { label: string; icon: ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      className="btn btn-square size-11 border-md-outline-variant bg-md-surface-lowest text-md-on-surface hover:bg-md-secondary-container"
      onClick={onClick}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon}
      </svg>
    </button>
  );
}

/** Contorno do rosto e linha dos olhos, para posicionar a cabeça no quadro. */
function FaceGuide() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 30 40"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 size-full text-white drop-shadow-[0_0_1px_rgb(0_0_0/0.8)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.3"
      strokeDasharray="1 0.8"
      vectorEffect="non-scaling-stroke"
    >
      <ellipse cx="15" cy="16.5" rx="8" ry="11" />
      <line x1="8" x2="22" y1="15" y2="15" />
      <path d="M2 40c0-6 5-9.5 13-9.5S28 34 28 40" />
    </svg>
  );
}

function initialState(image: Size): EditorState {
  return { ...INITIAL_EDITOR_STATE, aspect: "3:4", crop: centeredCrop(image) };
}

/** Maior quadro 3:4 que cabe na foto, em porcentagem (zoom 1). */
function fullCrop({ width, height }: Size): Pick<CropRect, "width" | "height"> {
  const byHeight = ((height * RATIO) / width) * 100;
  return byHeight <= 100 ? { width: byHeight, height: 100 } : { width: 100, height: (width / RATIO / height) * 100 };
}

/** Quadro 3:4 com o zoom pedido, mantendo o centro do quadro atual. */
function zoomCrop(crop: CropRect, size: Size, zoom: number): CropRect {
  const full = fullCrop(size);
  const width = full.width / zoom;
  const height = full.height / zoom;
  return clampCrop({ x: crop.x + (crop.width - width) / 2, y: crop.y + (crop.height - height) / 2, width, height });
}

function centeredCrop(size: Size): CropRect {
  return zoomCrop({ x: 0, y: 0, width: 100, height: 100 }, size, INITIAL_ZOOM);
}

/** Mantém o quadro dentro da foto. */
function clampCrop(crop: CropRect): CropRect {
  return {
    ...crop,
    x: Math.min(Math.max(0, crop.x), 100 - crop.width),
    y: Math.min(Math.max(0, crop.y), 100 - crop.height),
  };
}

function toRect({ x, y, width, height }: CropRect): CropRect {
  return { x, y, width, height };
}
