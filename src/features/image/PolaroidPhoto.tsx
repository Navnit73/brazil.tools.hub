"use client";

import { useEffect, useId, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolStatus } from "@/components/tool/ToolStatus";
import { RangeField } from "@/components/ui/RangeField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { downloadBlob, fileBaseName, formatBytes, matchesAccept } from "@/lib/file";
import { cn } from "@/lib/utils";
import { RotatePanel } from "./components/EditorPanels";
import { decodeImage, type DecodedImage } from "./lib/decode";
import { encodeCanvas } from "./lib/encode";
import { IMAGE_FORMATS, IMAGE_INPUT_ACCEPT, IMAGE_INPUT_HINT } from "./lib/formats";
import {
  FRAME_COLORS,
  POLAROID_FORMATS,
  PRINT_DPI,
  buildSheetPdf,
  centeredCrop,
  clampCrop,
  ensureCaptionFont,
  fullCrop,
  mmToPx,
  perSheet,
  photoRatio,
  polaroidBlob,
  renderPolaroid,
  zoomCrop,
  type FrameColor,
  type PhotoSource,
  type PolaroidFormat,
  type PolaroidOptions,
  type SheetItem,
} from "./lib/polaroid";
import { context2d, fitWithin, orientedSize, renderImage, type CropRect, type Rotation } from "./lib/render";

const formatOptions = (Object.keys(POLAROID_FORMATS) as PolaroidFormat[]).map((key) => ({
  value: key,
  label: POLAROID_FORMATS[key].label,
}));

const panelOptions = [
  { value: "photo", label: "Foto" },
  { value: "frame", label: "Moldura" },
] as const;

type PolaroidPanel = (typeof panelOptions)[number]["value"];

const outputOptions = [
  { value: "jpeg", label: "JPG" },
  { value: "png", label: "PNG" },
] as const;

type OutputFormat = (typeof outputOptions)[number]["value"];

/** Fonte da prévia: reduzida para redesenhar rápido a cada ajuste. */
const PREVIEW_MAX_SIDE = 1600;
/** Resolução da prévia da polaroid (nítida em telas de alta densidade). */
const PREVIEW_DPI = 160;
const INITIAL_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.1;
const MOVE_STEP = 0.05;
const MAX_CAPTION = 40;

interface LoadedImage {
  file: File;
  image: DecodedImage;
  preview: PhotoSource;
}

interface Framing {
  rotation: Rotation;
  flipX: boolean;
  flipY: boolean;
  crop: CropRect;
}

/** Foto estilo polaroid: moldura em tamanho real, legenda manuscrita, efeito vintage e folha A4 para imprimir. */
export default function PolaroidPhoto() {
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<PolaroidFormat>("classic");
  const [framing, setFraming] = useState<Framing | null>(null);
  const [frame, setFrame] = useState<FrameColor>("white");
  const [caption, setCaption] = useState("");
  const [vintage, setVintage] = useState(false);
  const [panel, setPanel] = useState<PolaroidPanel>("photo");
  const [output, setOutput] = useState<OutputFormat>("jpeg");
  const [fontReady, setFontReady] = useState(false);
  const [busy, setBusy] = useState<"download" | "sheet" | "pdf" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetItem[]>([]);
  const [fillSheet, setFillSheet] = useState(true);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const loadedRef = useRef<LoadedImage | null>(null);
  const sheetRef = useRef<SheetItem[]>([]);
  const nextId = useRef(1);
  const drag = useRef<{ x: number; y: number; crop: CropRect } | null>(null);
  const captionId = useId();

  useEffect(
    () => () => {
      loadedRef.current?.image.release();
      for (const item of sheetRef.current) URL.revokeObjectURL(item.url);
    },
    [],
  );

  // A fonte manuscrita só é baixada quando alguém escreve uma legenda.
  const wantsFont = caption.trim().length > 0;
  useEffect(() => {
    if (!wantsFont || fontReady) return;
    let active = true;
    ensureCaptionFont().then(() => active && setFontReady(true));
    return () => {
      active = false;
    };
  }, [wantsFont, fontReady]);

  useEffect(() => {
    const canvas = previewRef.current;
    if (!loaded || !framing || !canvas) return;
    const rendered = renderPolaroid(loaded.preview, { format, frame, caption, vintage, ...framing }, PREVIEW_DPI);
    canvas.width = rendered.width;
    canvas.height = rendered.height;
    context2d(canvas).drawImage(rendered, 0, 0);
  }, [loaded, framing, format, frame, caption, vintage, fontReady]);

  function updateSheet(next: SheetItem[]) {
    sheetRef.current = next;
    setSheet(next);
  }

  async function openFile([file]: File[]) {
    if (!file) return;
    setError(null);
    setNotice(null);
    if (!matchesAccept(file, IMAGE_INPUT_ACCEPT)) {
      setError("Formato não suportado. Escolha uma foto JPG, PNG, WebP, AVIF, GIF ou BMP.");
      return;
    }
    setOpening(true);
    try {
      const image = await decodeImage(file);
      const reduced = renderImage(image, fitWithin(image, PREVIEW_MAX_SIDE));
      const preview: PhotoSource = { source: reduced, width: reduced.width, height: reduced.height, release: () => {} };
      loadedRef.current?.image.release();
      loadedRef.current = { file, image, preview };
      setLoaded(loadedRef.current);
      setFraming({ rotation: 0, flipX: false, flipY: false, crop: centeredCrop(image, photoRatio(format), INITIAL_ZOOM) });
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
    setFraming(null);
    setError(null);
    setNotice(null);
  }

  function removeFromSheet(id: number) {
    const item = sheet.find((candidate) => candidate.id === id);
    if (item) URL.revokeObjectURL(item.url);
    updateSheet(sheet.filter((candidate) => candidate.id !== id));
  }

  async function downloadSheet() {
    if (sheet.length === 0) return;
    setBusy("pdf");
    setError(null);
    try {
      downloadBlob(await buildSheetPdf(sheet, fillSheet), "polaroids-a4.pdf");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível gerar o PDF.");
    } finally {
      setBusy(null);
    }
  }

  const sheetPanel = (
    <SheetPanel
      items={sheet}
      format={format}
      fill={fillSheet}
      busy={busy !== null}
      generating={busy === "pdf"}
      onFillChange={setFillSheet}
      onRemove={removeFromSheet}
      onDownload={downloadSheet}
    />
  );

  if (!loaded || !framing) {
    return (
      <div className="flex flex-col gap-4">
        <FileDropzone
          accept={IMAGE_INPUT_ACCEPT}
          acceptPaste
          disabled={opening}
          label={opening ? "Abrindo foto…" : sheet.length > 0 ? "Escolha a próxima foto" : "Escolha uma foto"}
          hint={IMAGE_INPUT_HINT}
          onFiles={openFile}
        />
        {error && <ToolStatus kind="error">{error}</ToolStatus>}
        {sheet.length > 0 && <div className="rounded-m-md bg-md-surface-low p-4 sm:p-5">{sheetPanel}</div>}
      </div>
    );
  }

  const { file, image } = loaded;
  const view: Framing = framing;
  const ratio = photoRatio(format);
  const oriented = orientedSize(image.width, image.height, view.rotation);
  const { crop } = view;
  const zoom = Math.min(MAX_ZOOM, Math.max(1, fullCrop(oriented, ratio).height / crop.height));
  const spec = POLAROID_FORMATS[format];
  const options: PolaroidOptions = { format, frame, caption, vintage, ...view };
  // Área recortada menor que a foto impressa em 300 DPI: a impressão pode ficar borrada.
  const lowResolution = (crop.height / 100) * oriented.height < mmToPx(spec.photoHeight, PRINT_DPI) * 0.6;

  function setCrop(next: CropRect) {
    setFraming((current) => current && { ...current, crop: clampCrop(next) });
    setNotice(null);
  }

  function changeFormat(next: PolaroidFormat) {
    setFormat(next);
    setCrop(zoomCrop(crop, oriented, photoRatio(next), zoom));
  }

  function rotate(clockwise: boolean) {
    const rotation = ((view.rotation + (clockwise ? 90 : 270)) % 360) as Rotation;
    const size = orientedSize(image.width, image.height, rotation);
    setFraming({ ...view, rotation, crop: centeredCrop(size, ratio, zoom) });
  }

  function flip(axis: "x" | "y") {
    setFraming({
      ...view,
      flipX: axis === "x" ? !view.flipX : view.flipX,
      flipY: axis === "y" ? !view.flipY : view.flipY,
      crop: axis === "x" ? { ...crop, x: 100 - crop.x - crop.width } : { ...crop, y: 100 - crop.y - crop.height },
    });
  }

  /** As setas movem a foto (como o arrastar): mover a foto para a esquerda mostra mais do lado direito. */
  function move(dx: number, dy: number) {
    setCrop({ ...crop, x: crop.x - dx * crop.width * MOVE_STEP, y: crop.y - dy * crop.height * MOVE_STEP });
  }

  function startDrag(event: PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, crop };
  }

  function moveDrag(event: PointerEvent<HTMLCanvasElement>) {
    const start = drag.current;
    if (!start) return;
    const scale = event.currentTarget.clientWidth / spec.width;
    const dx = (event.clientX - start.x) / (spec.photoWidth * scale);
    const dy = (event.clientY - start.y) / (spec.photoHeight * scale);
    setCrop({ ...start.crop, x: start.crop.x - dx * start.crop.width, y: start.crop.y - dy * start.crop.height });
  }

  async function renderFull(): Promise<HTMLCanvasElement> {
    if (caption.trim()) await ensureCaptionFont();
    // Deixa o indicador de carregamento aparecer antes do processamento pesado.
    await new Promise((resolve) => setTimeout(resolve, 0));
    return renderPolaroid(image, options, PRINT_DPI);
  }

  async function download() {
    setBusy("download");
    setError(null);
    setNotice(null);
    try {
      const blob = await encodeCanvas(await renderFull(), output, 0.92);
      const name = `${fileBaseName(file.name)}-polaroid.${IMAGE_FORMATS[output].extension}`;
      downloadBlob(blob, name);
      setNotice(`Pronto! ${name} (${formatBytes(blob.size)}) foi baixada.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível gerar a polaroid.");
    } finally {
      setBusy(null);
    }
  }

  async function addToSheet() {
    setBusy("sheet");
    setError(null);
    try {
      const blob = await polaroidBlob(await renderFull());
      updateSheet([...sheet, { id: nextId.current++, format, blob, url: URL.createObjectURL(blob) }]);
      setNotice("Polaroid adicionada à folha de impressão. Troque a foto para adicionar outra.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível gerar a polaroid.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-6">
      <section aria-label="Prévia" className="flex min-w-0 flex-col gap-2">
        <div className="flex min-h-64 items-center justify-center rounded-m-md border border-md-outline-variant bg-md-surface-high p-4 sm:p-8">
          <canvas
            ref={previewRef}
            role="img"
            aria-label={`Prévia da polaroid de ${file.name}`}
            className="block h-auto max-h-[min(60vh,36rem)] w-auto max-w-full cursor-grab touch-none shadow-lg active:cursor-grabbing"
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
          />
        </div>
        <p className="text-xs text-md-on-surface-variant">
          Arraste a foto para ajustar o enquadramento. {spec.label}: {spec.width} × {spec.height} mm.
        </p>
      </section>

      <div className="flex flex-col gap-5 rounded-m-md bg-md-surface-low p-4 sm:p-5">
        <SegmentedControl label="Formato" options={formatOptions} value={format} onChange={changeFormat} />

        <div className="flex flex-col gap-1 text-sm">
          <label htmlFor={captionId} className="font-medium text-md-on-surface">
            Legenda (opcional)
          </label>
          <input
            id={captionId}
            type="text"
            maxLength={MAX_CAPTION}
            placeholder="Ex.: Verão 2026"
            value={caption}
            onChange={(event) => {
              setCaption(event.target.value);
              setNotice(null);
            }}
            className="input min-h-11 w-full bg-md-surface-lowest"
          />
        </div>

        <SegmentedControl label="Ajustes" options={panelOptions} value={panel} onChange={setPanel} />
        <div>
          {panel === "photo" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-end gap-2">
                <PadButton label="Afastar" disabled={zoom <= 1} onClick={() => setCrop(zoomCrop(crop, oriented, ratio, zoom - ZOOM_STEP))} icon={<path d="M5 12h14" />} />
                <div className="min-w-0 flex-1">
                  <RangeField
                    label="Zoom"
                    value={Math.round(zoom * 100)}
                    min={100}
                    max={MAX_ZOOM * 100}
                    step={5}
                    format={(value) => `${value}%`}
                    onChange={(value) => setCrop(zoomCrop(crop, oriented, ratio, value / 100))}
                  />
                </div>
                <PadButton
                  label="Aproximar"
                  disabled={zoom >= MAX_ZOOM}
                  onClick={() => setCrop(zoomCrop(crop, oriented, ratio, Math.min(MAX_ZOOM, zoom + ZOOM_STEP)))}
                  icon={<path d="M12 5v14M5 12h14" />}
                />
              </div>
              <div className="grid grid-cols-3 gap-1 self-center" role="group" aria-label="Mover a foto">
                <span />
                <PadButton label="Mover para cima" onClick={() => move(0, -1)} icon={<path d="m6 15 6-6 6 6" />} />
                <span />
                <PadButton label="Mover para a esquerda" onClick={() => move(-1, 0)} icon={<path d="m15 6-6 6 6 6" />} />
                <PadButton label="Centralizar" onClick={() => setCrop(centeredCrop(oriented, ratio, zoom))} icon={<circle cx="12" cy="12" r="3" />} />
                <PadButton label="Mover para a direita" onClick={() => move(1, 0)} icon={<path d="m9 6 6 6-6 6" />} />
                <span />
                <PadButton label="Mover para baixo" onClick={() => move(0, 1)} icon={<path d="m6 9 6 6 6-6" />} />
                <span />
              </div>
              <RotatePanel onRotate={rotate} onFlip={flip} />
            </div>
          )}
          {panel === "frame" && (
            <div className="flex flex-col gap-4">
              <ColorPicker value={frame} onChange={setFrame} />
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                <input type="checkbox" className="checkbox checkbox-primary" checked={vintage} onChange={(event) => setVintage(event.target.checked)} />
                Efeito vintage (tom quente e vinheta)
              </label>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 border-t border-md-outline-variant pt-5">
          <SegmentedControl label="Salvar como" options={outputOptions} value={output} onChange={setOutput} />
          <p className="flex items-center justify-between gap-2 rounded-m-sm bg-md-surface-lowest px-3 py-2 text-sm text-md-on-surface-variant">
            Tamanho final
            <strong className="font-medium tabular-nums text-md-on-surface">
              {mmToPx(spec.width, PRINT_DPI)} × {mmToPx(spec.height, PRINT_DPI)} px ({PRINT_DPI} DPI)
            </strong>
          </p>

          {lowResolution && (
            <ToolStatus kind="info">
              A foto tem pouca resolução para esse zoom e pode ficar borrada na impressão. Diminua o zoom ou use uma foto maior.
            </ToolStatus>
          )}
          {error && <ToolStatus kind="error">{error}</ToolStatus>}
          {notice && <ToolStatus kind="success">{notice}</ToolStatus>}

          <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-2 border-t border-md-outline-variant bg-md-surface-low px-4 py-3 sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:border-0 lg:p-0">
            <button type="button" className="btn btn-primary min-h-12 w-full" disabled={busy !== null} onClick={download}>
              {busy === "download" && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
              {busy === "download" ? "Gerando polaroid…" : `Baixar polaroid ${IMAGE_FORMATS[output].label}`}
            </button>
            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost min-h-11 flex-1" disabled={busy !== null} onClick={addToSheet}>
                {busy === "sheet" && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
                Adicionar à folha
              </button>
              <button type="button" className="btn btn-ghost min-h-11 flex-1" disabled={busy !== null} onClick={closeImage}>
                Trocar foto
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-md-outline-variant pt-5">{sheetPanel}</div>
      </div>
    </div>
  );
}

/** Folha A4 com as polaroids adicionadas, em tamanho real, para imprimir e recortar. */
function SheetPanel({
  items,
  format,
  fill,
  busy,
  generating,
  onFillChange,
  onRemove,
  onDownload,
}: {
  items: SheetItem[];
  format: PolaroidFormat;
  fill: boolean;
  busy: boolean;
  generating: boolean;
  onFillChange: (fill: boolean) => void;
  onRemove: (id: number) => void;
  onDownload: () => void;
}) {
  return (
    <section aria-label="Imprimir em folha A4" className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-md-on-surface">Imprimir em folha A4</h3>
      <p className="text-xs text-md-on-surface-variant">
        Cabem {perSheet(format)} polaroids no formato {POLAROID_FORMATS[format].label} por folha, em tamanho real e com linhas de corte.
        {items.length === 0 && " Toque em Adicionar à folha para incluir esta foto; depois, troque a foto para adicionar outras."}
      </p>
      {items.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <li key={item.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- miniatura local (blob:), sem otimização possível */}
              <img src={item.url} alt={`Polaroid ${index + 1}`} className="h-16 w-auto rounded-m-xs border border-md-outline-variant" />
              <button
                type="button"
                aria-label={`Remover polaroid ${index + 1}`}
                className="btn btn-circle btn-xs absolute -right-2 -top-2 border-md-outline-variant bg-md-surface-lowest"
                onClick={() => onRemove(item.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
        <input type="checkbox" className="checkbox checkbox-primary" checked={fill} onChange={(event) => onFillChange(event.target.checked)} />
        Completar a folha com cópias da última foto
      </label>
      <button type="button" className="btn btn-outline btn-primary min-h-11" disabled={busy || items.length === 0} onClick={onDownload}>
        {generating && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
        {generating ? "Gerando PDF…" : `Baixar folha A4 (PDF)${items.length > 0 ? ` · ${items.length}` : ""}`}
      </button>
    </section>
  );
}

function ColorPicker({ value, onChange }: { value: FrameColor; onChange: (value: FrameColor) => void }) {
  const name = useId();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium text-md-on-surface">Cor da moldura</legend>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(FRAME_COLORS) as FrameColor[]).map((key) => (
          <label
            key={key}
            className={cn(
              "flex min-h-11 cursor-pointer items-center gap-2 rounded-m-sm border px-2 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-md-primary",
              value === key ? "border-md-primary bg-md-secondary-container" : "border-md-outline-variant bg-md-surface-lowest",
            )}
          >
            <input type="radio" name={name} value={key} checked={value === key} onChange={() => onChange(key)} className="sr-only" />
            <span aria-hidden="true" className="size-5 shrink-0 rounded-full border border-md-outline" style={{ background: FRAME_COLORS[key].color }} />
            {FRAME_COLORS[key].label}
          </label>
        ))}
      </div>
    </fieldset>
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
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {icon}
      </svg>
    </button>
  );
}
