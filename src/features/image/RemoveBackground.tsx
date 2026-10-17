"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolProgress } from "@/components/tool/ToolProgress";
import { ToolStatus } from "@/components/tool/ToolStatus";
import { RangeField } from "@/components/ui/RangeField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { downloadBlob, formatBytes, matchesAccept, renameFile } from "@/lib/file";
import { flattenOnColor, pickColor, removeColor, rgbToHex, sampleCornerColor, segmentPerson, type RgbColor, type SegmentProgress } from "./lib/background";
import { decodeImage } from "./lib/decode";
import { encodeCanvas } from "./lib/encode";
import { IMAGE_FORMATS, IMAGE_INPUT_ACCEPT, IMAGE_INPUT_HINT } from "./lib/formats";
import { context2d, fitWithin, renderImage } from "./lib/render";

type RemovalMode = "person" | "color";
type OutputBackground = "transparent" | "white" | "color";
type View = "after" | "before";

const modeOptions = [
  { value: "person", label: "Pessoa (IA)" },
  { value: "color", label: "Cor de fundo" },
] as const;

const backgroundOptions = [
  { value: "transparent", label: "Transparente" },
  { value: "white", label: "Branco" },
  { value: "color", label: "Cor" },
] as const;

const viewOptions = [
  { value: "after", label: "Depois" },
  { value: "before", label: "Antes" },
] as const;

/** Maior lado trabalhado: nítido para impressão e leve para o recorte por cor responder na hora. */
const WORK_MAX_SIDE = 3000;
const PREVIEW_MAX_SIDE = 1600;
const JPEG_QUALITY = 0.92;
/** Espera o usuário parar de mexer na tolerância antes de recalcular. */
const COLOR_DEBOUNCE_MS = 150;

const checkerboard = {
  background: "repeating-conic-gradient(var(--color-border) 0 25%, var(--color-background) 0 50%) 0 0 / 16px 16px",
};

interface LoadedImage {
  file: File;
  /** Imagem já orientada e reduzida para `WORK_MAX_SIDE`. */
  source: HTMLCanvasElement;
}

export default function RemoveBackground() {
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<RemovalMode>("person");
  const [tolerance, setTolerance] = useState(20);
  const [fromEdges, setFromEdges] = useState(true);
  const [color, setColor] = useState<RgbColor | null>(null);
  const [personResult, setPersonResult] = useState<HTMLCanvasElement | null>(null);
  const [colorResult, setColorResult] = useState<HTMLCanvasElement | null>(null);
  const [progress, setProgress] = useState<SegmentProgress | null>(null);
  const [background, setBackground] = useState<OutputBackground>("transparent");
  const [customColor, setCustomColor] = useState("#2563eb");
  const [view, setView] = useState<View>("after");
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState<{ name: string; size: number } | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  /** Evita aplicar o resultado da IA de uma imagem que já foi trocada. */
  const runRef = useRef(0);

  const result = mode === "person" ? personResult : colorResult;
  const shown = view === "before" || !result ? loaded?.source : result;

  /** Recorte por IA: roda uma vez por imagem, ao abrir no modo "Pessoa" ou ao trocar para ele. */
  async function runPerson(source: HTMLCanvasElement) {
    const run = ++runRef.current;
    setError(null);
    setProgress({ stage: "download", percent: 0 });
    try {
      const canvas = await segmentPerson(source, (next) => {
        if (runRef.current === run) setProgress(next);
      });
      if (runRef.current === run) setPersonResult(canvas);
    } catch (cause) {
      if (runRef.current === run) setError(cause instanceof Error ? cause.message : "Não foi possível remover o fundo.");
    } finally {
      if (runRef.current === run) setProgress(null);
    }
  }

  // Recorte por cor: rápido, recalculado a cada ajuste.
  useEffect(() => {
    if (!loaded || mode !== "color") return;
    const timer = setTimeout(() => {
      setColorResult(removeColor(loaded.source, { tolerance, fromEdges, color: color ?? undefined }));
    }, COLOR_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [loaded, mode, tolerance, fromEdges, color]);

  useEffect(() => {
    const canvas = previewRef.current;
    if (!shown || !canvas) return;
    const size = fitWithin(shown, PREVIEW_MAX_SIDE);
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = context2d(canvas);
    ctx.clearRect(0, 0, size.width, size.height);
    ctx.drawImage(shown, 0, 0, size.width, size.height);
  }, [shown]);

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
      try {
        // `renderImage` já respeita o limite de pixels do canvas.
        const source = renderImage(image, fitWithin(image, WORK_MAX_SIDE));
        runRef.current++;
        setLoaded({ file, source });
        setPersonResult(null);
        setColorResult(null);
        setColor(null);
        setProgress(null);
        setView("after");
        if (mode === "person") void runPerson(source);
      } finally {
        image.release();
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível abrir a imagem.");
    } finally {
      setOpening(false);
    }
  }

  function closeImage() {
    runRef.current++;
    setLoaded(null);
    setPersonResult(null);
    setColorResult(null);
    setProgress(null);
    setError(null);
    setExported(null);
  }

  if (!loaded) {
    return (
      <div className="flex flex-col gap-4">
        <FileDropzone
          accept={IMAGE_INPUT_ACCEPT}
          acceptPaste
          disabled={opening}
          label={opening ? "Abrindo imagem…" : "Escolha uma imagem para remover o fundo"}
          hint={IMAGE_INPUT_HINT}
          onFiles={openFile}
        />
        {error && <ToolStatus kind="error">{error}</ToolStatus>}
      </div>
    );
  }

  const { file, source } = loaded;
  const transparent = background === "transparent";
  const format = transparent ? "png" : "jpeg";
  const fill = background === "white" ? "#ffffff" : customColor;
  const backgroundColor = color ?? sampleCornerColor(source);

  /** Conta-gotas: no modo "Cor de fundo", um toque na imagem escolhe a cor a remover. */
  function pickFromPreview(event: MouseEvent<HTMLCanvasElement>) {
    if (mode !== "color") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * source.width;
    const y = ((event.clientY - rect.top) / rect.height) * source.height;
    setColor(pickColor(source, x, y));
    setExported(null);
  }

  async function download() {
    if (!result) return;
    setExporting(true);
    setError(null);
    setExported(null);
    await new Promise((resolve) => setTimeout(resolve, 0));
    try {
      const canvas = transparent ? result : flattenOnColor(result, fill);
      const blob = await encodeCanvas(canvas, format, JPEG_QUALITY);
      const name = renameFile(file.name, IMAGE_FORMATS[format].extension, "-sem-fundo");
      downloadBlob(blob, name);
      setExported({ name, size: blob.size });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível gerar a imagem.");
    } finally {
      setExporting(false);
    }
  }

  const previewBackground = view === "before" ? undefined : transparent ? checkerboard : { background: fill };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-6">
      <section aria-label="Prévia" className="flex min-w-0 flex-col gap-2">
        <SegmentedControl label="Visualizar" hideLabel options={viewOptions} value={view} onChange={setView} />
        <div
          className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-m-md border border-md-outline-variant bg-md-surface-high p-2"
          style={previewBackground}
        >
          <canvas
            ref={previewRef}
            role="img"
            aria-label={view === "before" ? `Imagem original: ${file.name}` : `Imagem sem fundo: ${file.name}`}
            className={mode === "color" ? "block max-w-full cursor-crosshair" : "block max-w-full"}
            style={{ maxHeight: "min(60vh, 40rem)" }}
            onClick={pickFromPreview}
          />
          {progress && (
            <div className="absolute inset-x-4 bottom-4 rounded-m-sm bg-md-surface-lowest/95 p-3 shadow">
              <ToolProgress
                label={
                  progress.stage === "download"
                    ? "Baixando o modelo de IA (6 MB, só na primeira vez)…"
                    : "Removendo o fundo…"
                }
                value={progress.stage === "download" ? (progress.percent ?? 0) : 0}
                max={100}
              />
            </div>
          )}
        </div>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-md-on-surface-variant">
          <span className="min-w-0 truncate font-medium text-md-on-surface">{file.name}</span>
          <span className="rounded-m-xs bg-md-surface-high px-1.5 py-0.5 tabular-nums">
            {source.width} × {source.height} px
          </span>
          <span className="rounded-m-xs bg-md-surface-high px-1.5 py-0.5 tabular-nums">{formatBytes(file.size)}</span>
        </p>
      </section>

      <div className="flex flex-col gap-5 rounded-m-md bg-md-surface-low p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          <SegmentedControl
            label="O que tem na imagem?"
            options={modeOptions}
            value={mode}
            onChange={(value) => {
              setMode(value);
              setError(null);
              setExported(null);
              if (value === "person" && !personResult && !progress) void runPerson(source);
            }}
          />
          <p className="text-xs text-md-on-surface-variant">
            {mode === "person"
              ? "A IA identifica pessoas e retratos. Para logos, produtos ou prints em fundo de uma cor só, use “Cor de fundo”."
              : "Remove o fundo de uma cor só, como o branco atrás de um logo ou produto. Toque na imagem para escolher a cor."}
          </p>
        </div>

        {mode === "person" && !personResult && !progress && (
          <button type="button" className="btn btn-outline btn-primary min-h-11 self-start" onClick={() => runPerson(source)}>
            Remover fundo com IA
          </button>
        )}

        {mode === "color" && (
          <div className="flex flex-col gap-4">
            <p className="flex items-center justify-between gap-2 rounded-m-sm bg-md-surface-lowest px-3 py-2 text-sm text-md-on-surface-variant">
              Cor removida
              <span className="flex items-center gap-2 font-medium tabular-nums text-md-on-surface">
                <span
                  aria-hidden="true"
                  className="size-5 rounded-m-xs border border-md-outline-variant"
                  style={{ background: rgbToHex(backgroundColor) }}
                />
                {rgbToHex(backgroundColor).toUpperCase()}
              </span>
            </p>
            <RangeField
              label="Tolerância"
              value={tolerance}
              min={1}
              max={60}
              hint="Aumente se sobrar fundo; diminua se partes do objeto sumirem."
              format={(value) => `${value}%`}
              onChange={(value) => {
                setTolerance(value);
                setExported(null);
              }}
            />
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={fromEdges}
                onChange={(event) => {
                  setFromEdges(event.target.checked);
                  setExported(null);
                }}
              />
              Só o fundo ligado às bordas
            </label>
            {color && (
              <button type="button" className="btn btn-ghost min-h-11 self-start" onClick={() => setColor(null)}>
                Detectar cor automaticamente
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col gap-4 border-t border-md-outline-variant pt-5">
          <SegmentedControl
            label="Fundo da imagem final"
            options={backgroundOptions}
            value={background}
            onChange={(value) => {
              setBackground(value);
              setView("after");
              setExported(null);
            }}
          />
          {background === "color" && (
            <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 text-sm">
              Cor do fundo
              <input
                type="color"
                value={customColor}
                className="h-11 w-16 cursor-pointer rounded-m-xs border border-md-outline-variant bg-md-surface-lowest"
                onChange={(event) => {
                  setCustomColor(event.target.value);
                  setExported(null);
                }}
              />
            </label>
          )}
          <p className="flex items-center justify-between gap-2 rounded-m-sm bg-md-surface-lowest px-3 py-2 text-sm text-md-on-surface-variant">
            Arquivo final
            <strong className="font-medium tabular-nums text-md-on-surface">
              {IMAGE_FORMATS[format].label}, {source.width} × {source.height} px
            </strong>
          </p>

          {error && <ToolStatus kind="error">{error}</ToolStatus>}
          {exported && (
            <ToolStatus kind="success">
              Pronto! {exported.name} ({formatBytes(exported.size)}) foi baixada.
            </ToolStatus>
          )}

          <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-2 border-t border-md-outline-variant bg-md-surface-low px-4 py-3 sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:border-0 lg:p-0">
            <button type="button" className="btn btn-primary min-h-12 w-full" disabled={!result || exporting} onClick={download}>
              {exporting && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
              {exporting ? "Gerando imagem…" : `Baixar ${IMAGE_FORMATS[format].label}`}
            </button>
            <button type="button" className="btn btn-ghost min-h-11" disabled={exporting} onClick={closeImage}>
              Trocar imagem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
