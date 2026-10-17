"use client";

import { useEffect, useRef, useState } from "react";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolStatus } from "@/components/tool/ToolStatus";
import { RangeField } from "@/components/ui/RangeField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { downloadBlob, formatBytes, matchesAccept, renameFile } from "@/lib/file";
import { cn } from "@/lib/utils";
import { decodeImage, type DecodedImage } from "./lib/decode";
import { encodeCanvas } from "./lib/encode";
import { IMAGE_FORMATS, IMAGE_INPUT_ACCEPT, IMAGE_INPUT_HINT } from "./lib/formats";
import { context2d, fitWithin, renderImage } from "./lib/render";
import { DEFAULT_SKETCH_OPTIONS, applySketch, type SketchOptions, type SketchStyle } from "./lib/sketch";

const styleOptions = [
  { value: "pencil", label: "Lápis" },
  { value: "color-pencil", label: "Lápis colorido" },
  { value: "outline", label: "Para colorir" },
  { value: "cartoon", label: "Cartoon" },
] as const;

type SliderKey = "detail" | "intensity" | "thickness";

/** Controles de cada estilo, com rótulos no vocabulário de quem desenha. */
const STYLE_CONTROLS: Record<SketchStyle, Array<{ key: SliderKey; label: string }>> = {
  pencil: [
    { key: "detail", label: "Detalhe" },
    { key: "intensity", label: "Traço mais escuro" },
  ],
  "color-pencil": [
    { key: "detail", label: "Detalhe" },
    { key: "intensity", label: "Traço mais escuro" },
  ],
  outline: [
    { key: "detail", label: "Quantidade de linhas" },
    { key: "thickness", label: "Espessura do traço" },
  ],
  cartoon: [
    { key: "detail", label: "Quantidade de cores" },
    { key: "intensity", label: "Contornos" },
    { key: "thickness", label: "Espessura do traço" },
  ],
};

const viewOptions = [
  { value: "after", label: "Desenho" },
  { value: "before", label: "Original" },
] as const;

type View = (typeof viewOptions)[number]["value"];

const outputOptions = [
  { value: "jpeg", label: "JPG" },
  { value: "png", label: "PNG" },
] as const;

type OutputFormat = (typeof outputOptions)[number]["value"];

/** Prévia reduzida: rápida o bastante para redesenhar a cada ajuste. */
const PREVIEW_MAX_SIDE = 1000;
/** Arquivo final: nítido para imprimir, sem esgotar a memória do celular nos filtros. */
const OUTPUT_MAX_SIDE = 3000;
const PREVIEW_DELAY = 120;

interface LoadedImage {
  file: File;
  image: DecodedImage;
  /** Cópia reduzida da foto, base da prévia. */
  preview: HTMLCanvasElement;
}

/** Transforma uma foto em desenho a lápis, lápis colorido, contorno para colorir ou cartoon. */
export default function PhotoToSketch() {
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<SketchOptions>(DEFAULT_SKETCH_OPTIONS);
  const [view, setView] = useState<View>("after");
  const [format, setFormat] = useState<OutputFormat>("jpeg");
  const [rendering, setRendering] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState<{ name: string; size: number } | null>(null);
  const originalRef = useRef<HTMLCanvasElement>(null);
  const resultRef = useRef<HTMLCanvasElement>(null);
  const loadedRef = useRef<LoadedImage | null>(null);

  useEffect(() => () => loadedRef.current?.image.release(), []);

  useEffect(() => {
    const canvas = originalRef.current;
    if (!loaded || !canvas) return;
    canvas.width = loaded.preview.width;
    canvas.height = loaded.preview.height;
    context2d(canvas).drawImage(loaded.preview, 0, 0);
  }, [loaded]);

  // Espera os controles pararem por um instante antes de recalcular a prévia.
  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      const canvas = resultRef.current;
      if (!canvas) return;
      try {
        const sketch = applySketch(loaded.preview, options);
        canvas.width = sketch.width;
        canvas.height = sketch.height;
        context2d(canvas).drawImage(sketch, 0, 0);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Não foi possível gerar o desenho.");
      } finally {
        setRendering(false);
      }
    }, PREVIEW_DELAY);
    return () => clearTimeout(timer);
  }, [loaded, options]);

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
      loadedRef.current = { file, image, preview: renderImage(image, fitWithin(image, PREVIEW_MAX_SIDE)) };
      setLoaded(loadedRef.current);
      setRendering(true);
      setView("after");
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

  function change(next: Partial<SketchOptions>) {
    setOptions((current) => ({ ...current, ...next }));
    setRendering(true);
    setView("after");
    setExported(null);
  }

  if (!loaded) {
    return (
      <div className="flex flex-col gap-4">
        <FileDropzone
          accept={IMAGE_INPUT_ACCEPT}
          acceptPaste
          disabled={opening}
          label={opening ? "Abrindo imagem…" : "Escolha uma foto para transformar em desenho"}
          hint={IMAGE_INPUT_HINT}
          onFiles={openFile}
        />
        {error && <ToolStatus kind="error">{error}</ToolStatus>}
      </div>
    );
  }

  const { file, image } = loaded;
  const output = fitWithin(image, OUTPUT_MAX_SIDE);

  async function download() {
    setExporting(true);
    setError(null);
    setExported(null);
    // Deixa o indicador de carregamento aparecer antes do processamento pesado.
    await new Promise((resolve) => setTimeout(resolve, 0));
    try {
      const sketch = applySketch(renderImage(image, output), options);
      const blob = await encodeCanvas(sketch, format, 0.92);
      const name = renameFile(file.name, IMAGE_FORMATS[format].extension, "-desenho");
      downloadBlob(blob, name);
      setExported({ name, size: blob.size });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível gerar o desenho.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-6">
      <section aria-label="Prévia" className="flex min-w-0 flex-col gap-2">
        <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-m-md border border-md-outline-variant bg-md-surface-high p-2">
          <canvas
            ref={resultRef}
            role="img"
            aria-label={`Desenho feito a partir de ${file.name}`}
            className={cn("block max-w-full", view !== "after" && "hidden")}
            style={{ maxHeight: "min(60vh, 40rem)" }}
          />
          <canvas
            ref={originalRef}
            role="img"
            aria-label={`Foto original ${file.name}`}
            className={cn("block max-w-full", view !== "before" && "hidden")}
            style={{ maxHeight: "min(60vh, 40rem)" }}
          />
          {rendering && view === "after" && (
            <span className="loading loading-spinner loading-md absolute top-3 right-3 text-md-primary" aria-label="Atualizando prévia" />
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-md-on-surface-variant">
            <span className="min-w-0 truncate font-medium text-md-on-surface">{file.name}</span>
            <span className="rounded-m-xs bg-md-surface-high px-1.5 py-0.5 tabular-nums">
              {image.width} × {image.height} px
            </span>
            <span className="rounded-m-xs bg-md-surface-high px-1.5 py-0.5 tabular-nums">{formatBytes(file.size)}</span>
          </p>
          <SegmentedControl label="Comparar" hideLabel options={viewOptions} value={view} onChange={setView} />
        </div>
      </section>

      <div className="flex flex-col gap-5 rounded-m-md bg-md-surface-low p-4 sm:p-5">
        <SegmentedControl label="Estilo do desenho" options={styleOptions} value={options.style} onChange={(style) => change({ style })} />

        <div className="flex flex-col gap-3">
          {STYLE_CONTROLS[options.style].map(({ key, label }) =>
            key === "thickness" ? (
              <RangeField
                key={key}
                label={label}
                value={options.thickness}
                min={1}
                max={5}
                format={(value) => ["Fino", "Médio", "Grosso", "Mais grosso", "Muito grosso"][value - 1]}
                onChange={(thickness) => change({ thickness })}
              />
            ) : (
              <RangeField
                key={key}
                label={label}
                value={options[key]}
                min={0}
                max={100}
                step={5}
                format={(value) => `${value}%`}
                onChange={(value) => change({ [key]: value })}
              />
            ),
          )}
          <button
            type="button"
            className="btn btn-ghost min-h-11 self-start"
            disabled={JSON.stringify(options) === JSON.stringify({ ...DEFAULT_SKETCH_OPTIONS, style: options.style })}
            onClick={() => change({ ...DEFAULT_SKETCH_OPTIONS, style: options.style })}
          >
            Restaurar ajustes
          </button>
        </div>

        <div className="flex flex-col gap-4 border-t border-md-outline-variant pt-5">
          <SegmentedControl
            label="Salvar como"
            options={outputOptions}
            value={format}
            onChange={(value) => {
              setFormat(value);
              setExported(null);
            }}
          />
          <p className="flex items-center justify-between gap-2 rounded-m-sm bg-md-surface-lowest px-3 py-2 text-sm text-md-on-surface-variant">
            Tamanho final
            <strong className="font-medium tabular-nums text-md-on-surface">
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
          <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-2 border-t border-md-outline-variant bg-md-surface-low px-4 py-3 sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:border-0 lg:p-0">
            <button type="button" className="btn btn-primary min-h-12 w-full" disabled={exporting} onClick={download}>
              {exporting && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
              {exporting ? "Gerando desenho…" : `Baixar desenho em ${IMAGE_FORMATS[format].label}`}
            </button>
            <button type="button" className="btn btn-ghost min-h-11" disabled={exporting} onClick={closeImage}>
              Trocar foto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
