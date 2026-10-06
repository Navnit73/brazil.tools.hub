"use client";

import "react-image-crop/dist/ReactCrop.css";
import { useEffect, useRef, useState } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolStatus } from "@/components/tool/ToolStatus";
import { RangeField } from "@/components/ui/RangeField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { downloadBlob, formatBytes, matchesAccept, renameFile } from "@/lib/file";
import { cn } from "@/lib/utils";
import { AdjustPanel, CropPanel, ResizePanel, RotatePanel } from "./components/EditorPanels";
import { adjustmentsToCssFilter } from "./lib/adjustments";
import { decodeImage, type DecodedImage } from "./lib/decode";
import {
  ASPECTS,
  INITIAL_EDITOR_STATE,
  croppedSize,
  flipView,
  isEdited,
  outputSize,
  rotateView,
  type AspectKey,
  type EditorState,
} from "./lib/editor";
import { encodeCanvas } from "./lib/encode";
import { IMAGE_FORMATS, IMAGE_INPUT_ACCEPT, IMAGE_INPUT_HINT, formatFromMime, formatOptions, type ImageFormat } from "./lib/formats";
import { context2d, fitWithin, orientedSize, renderImage, type CropRect } from "./lib/render";

export type EditorPanel = "crop" | "rotate" | "resize" | "adjust";

const panelOptions = [
  { value: "crop", label: "Cortar" },
  { value: "rotate", label: "Girar" },
  { value: "resize", label: "Tamanho" },
  { value: "adjust", label: "Cores" },
] as const;

/** Maior lado da prévia: suficiente para telas grandes, leve para redesenhar. */
const PREVIEW_MAX_SIDE = 1600;

const CROP_LABELS = {
  cropArea: "Área de corte",
  nwDragHandle: "Canto superior esquerdo",
  nDragHandle: "Borda superior",
  neDragHandle: "Canto superior direito",
  eDragHandle: "Borda direita",
  seDragHandle: "Canto inferior direito",
  sDragHandle: "Borda inferior",
  swDragHandle: "Canto inferior esquerdo",
  wDragHandle: "Borda esquerda",
};

const checkerboard = {
  background: "repeating-conic-gradient(var(--color-border) 0 25%, var(--color-background) 0 50%) 0 0 / 16px 16px",
};

interface LoadedImage {
  file: File;
  image: DecodedImage;
}

interface ImageEditorProps {
  /** Painel aberto ao carregar a imagem (ex.: "resize" na página de redimensionar). */
  initialPanel?: EditorPanel;
}

export default function ImageEditor({ initialPanel = "crop" }: ImageEditorProps) {
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<EditorState>(INITIAL_EDITOR_STATE);
  const [panel, setPanel] = useState<EditorPanel>(initialPanel);
  const [format, setFormat] = useState<ImageFormat>("jpeg");
  const [quality, setQuality] = useState(90);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState<{ name: string; size: number } | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const loadedRef = useRef<LoadedImage | null>(null);

  // Libera a imagem decodificada ao sair da página.
  useEffect(() => () => loadedRef.current?.image.release(), []);

  // Redesenha a prévia só quando a orientação muda; corte e cores são sobrepostos sem redesenhar.
  const { rotation, flipX, flipY } = state;
  useEffect(() => {
    const canvas = previewRef.current;
    if (!loaded || !canvas) return;
    const { image } = loaded;
    const size = fitWithin(orientedSize(image.width, image.height, rotation), PREVIEW_MAX_SIDE);
    const rendered = renderImage(image, { rotation, flipX, flipY, ...size });
    canvas.width = rendered.width;
    canvas.height = rendered.height;
    context2d(canvas).drawImage(rendered, 0, 0);
  }, [loaded, rotation, flipX, flipY]);

  async function openFile([file]: File[]) {
    if (!file) return;
    setError(null);
    setExported(null);
    if (!matchesAccept(file, IMAGE_INPUT_ACCEPT)) {
      setError("Formato não suportado. Escolha uma imagem JPG, PNG, WebP, AVIF, GIF ou BMP.");
      return;
    }
    setOpening(true);
    try {
      const image = await decodeImage(file);
      loadedRef.current?.image.release();
      loadedRef.current = { file, image };
      setLoaded(loadedRef.current);
      setState(INITIAL_EDITOR_STATE);
      setPanel(initialPanel);
      setFormat(formatFromMime(file.type) ?? "png");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível abrir a imagem.");
    } finally {
      setOpening(false);
    }
  }

  function closeImage() {
    loadedRef.current?.image.release();
    loadedRef.current = null;
    setLoaded(null);
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
          label={opening ? "Abrindo imagem…" : "Escolha uma imagem para editar"}
          hint={IMAGE_INPUT_HINT}
          onFiles={openFile}
        />
        {error && <ToolStatus kind="error">{error}</ToolStatus>}
      </div>
    );
  }

  const { file, image } = loaded;
  const oriented = orientedSize(image.width, image.height, state.rotation);
  const base = croppedSize(image, state);
  const output = outputSize(image, state);
  const { lossy, label: formatLabel } = IMAGE_FORMATS[format];

  function changeAspect(aspect: AspectKey) {
    const ratio = ASPECTS[aspect].ratio;
    let crop: CropRect | null = state.crop;
    if (ratio) {
      const byWidth = makeAspectCrop({ unit: "%", width: 90 }, ratio, oriented.width, oriented.height);
      const sized = byWidth.height > 100 ? makeAspectCrop({ unit: "%", height: 90 }, ratio, oriented.width, oriented.height) : byWidth;
      crop = toRect(centerCrop(sized, oriented.width, oriented.height));
    }
    edit({ ...state, aspect, crop });
  }

  async function download() {
    setExporting(true);
    setError(null);
    setExported(null);
    // Deixa o indicador de carregamento aparecer antes do processamento pesado.
    await new Promise((resolve) => setTimeout(resolve, 0));
    try {
      const canvas = renderImage(image, { ...state, ...output });
      const blob = await encodeCanvas(canvas, format, quality / 100);
      const name = renameFile(file.name, IMAGE_FORMATS[format].extension, "-editada");
      downloadBlob(blob, name);
      setExported({ name, size: blob.size });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível gerar a imagem.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-6">
      <section aria-label="Prévia" className="flex min-w-0 flex-col gap-2">
        <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-sm border border-border p-2" style={checkerboard}>
          <ReactCrop
            crop={state.crop ? { unit: "%", ...state.crop } : undefined}
            aspect={ASPECTS[state.aspect].ratio}
            disabled={panel !== "crop"}
            keepSelection
            ruleOfThirds
            ariaLabels={CROP_LABELS}
            style={{ maxHeight: "min(60vh, 40rem)" }}
            onChange={(_, percent) =>
              edit((current) => ({ ...current, crop: percent.width > 0 && percent.height > 0 ? toRect(percent) : null }))
            }
          >
            <canvas
              ref={previewRef}
              role="img"
              aria-label={`Prévia de ${file.name}`}
              className={cn("block max-w-full", panel === "crop" && "touch-none")}
              style={{ maxHeight: "inherit", filter: adjustmentsToCssFilter(state.adjustments) }}
            />
          </ReactCrop>
        </div>
        <p className="text-xs text-muted">
          <span className="font-medium text-text">{file.name}</span> · {image.width} × {image.height} px · {formatBytes(file.size)}
        </p>
      </section>

      <div className="flex flex-col gap-5">
        <SegmentedControl label="O que você quer fazer?" options={panelOptions} value={panel} onChange={setPanel} />

        <div>
          {panel === "crop" && (
            <CropPanel
              aspect={state.aspect}
              hasCrop={state.crop !== null}
              onAspectChange={changeAspect}
              onStart={() => edit({ ...state, crop: { x: 5, y: 5, width: 90, height: 90 } })}
              onClear={() => edit({ ...state, crop: null, aspect: "free" })}
            />
          )}
          {panel === "rotate" && (
            <RotatePanel onRotate={(clockwise) => edit(rotateView(state, clockwise))} onFlip={(axis) => edit(flipView(state, axis))} />
          )}
          {panel === "resize" && (
            <ResizePanel base={base} output={output} resize={state.resize} onChange={(resize) => edit({ ...state, resize })} />
          )}
          {panel === "adjust" && (
            <AdjustPanel adjustments={state.adjustments} onChange={(adjustments) => edit({ ...state, adjustments })} />
          )}
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-5">
          <SegmentedControl
            label="Salvar como"
            options={formatOptions}
            value={format}
            onChange={(value) => {
              setFormat(value);
              setExported(null);
            }}
          />
          {lossy && (
            <RangeField
              label="Qualidade"
              value={quality}
              min={10}
              max={100}
              step={5}
              format={(value) => `${value}%`}
              onChange={(value) => {
                setQuality(value);
                setExported(null);
              }}
            />
          )}
          <p className="text-sm">
            Tamanho final:{" "}
            <strong className="tabular-nums">
              {output.width} × {output.height} px
            </strong>
          </p>

          {error && <ToolStatus kind="error">{error}</ToolStatus>}
          {exported && (
            <ToolStatus kind="success">
              Pronto! {exported.name} ({formatBytes(exported.size)}) foi baixada.
            </ToolStatus>
          )}

          {/* No celular, a ação principal fica sempre ao alcance do polegar. */}
          <div className="sticky bottom-0 z-10 -mx-1 flex flex-col gap-2 bg-background px-1 py-3 lg:static lg:p-0">
            <button type="button" className="btn btn-primary min-h-12 w-full" disabled={exporting} onClick={download}>
              {exporting && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
              {exporting ? "Gerando imagem…" : `Baixar ${formatLabel}`}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-ghost min-h-11 flex-1"
                disabled={!isEdited(state) || exporting}
                onClick={() => edit(INITIAL_EDITOR_STATE)}
              >
                Desfazer tudo
              </button>
              <button type="button" className="btn btn-ghost min-h-11 flex-1" disabled={exporting} onClick={closeImage}>
                Trocar imagem
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function toRect({ x, y, width, height }: CropRect): CropRect {
  return { x, y, width, height };
}
