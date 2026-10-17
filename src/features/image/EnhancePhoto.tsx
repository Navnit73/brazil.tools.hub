"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolStatus } from "@/components/tool/ToolStatus";
import { RangeField } from "@/components/ui/RangeField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { downloadBlob, formatBytes, matchesAccept, renameFile } from "@/lib/file";
import { decodeImage, type DecodedImage } from "./lib/decode";
import { encodeCanvas } from "./lib/encode";
import { NO_ENHANCE, autoEnhanceSettings, computeLevels, enhanceCanvas, type EnhanceSettings, type Levels } from "./lib/enhance";
import { IMAGE_FORMATS, IMAGE_INPUT_ACCEPT, IMAGE_INPUT_HINT, formatFromMime, formatOptions, type ImageFormat } from "./lib/formats";
import { MAX_CANVAS_PIXELS, context2d, fitToCanvasLimit, fitWithin, renderImage, resample } from "./lib/render";

/** Maior lado da prévia da imagem inteira: leve para reprocessar a cada ajuste. */
const PREVIEW_MAX_SIDE = 1200;
/** Lado do recorte mostrado em "Detalhe 100%", em pixels do resultado final. */
const DETAIL_SIDE = 512;
/** Espera o usuário parar de arrastar o controle antes de reprocessar a prévia. */
const PREVIEW_DELAY = 120;

type PreviewView = "full" | "detail";

const viewOptions = [
  { value: "full", label: "Imagem inteira" },
  { value: "detail", label: "Detalhe 100%" },
] as const;

interface LoadedImage {
  file: File;
  image: DecodedImage;
  /** Versão reduzida usada na prévia e no cálculo dos níveis. */
  base: HTMLCanvasElement;
  levels: Levels;
}

export default function EnhancePhoto() {
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<EnhanceSettings>(NO_ENHANCE);
  const [view, setView] = useState<PreviewView>("full");
  const [focus, setFocus] = useState({ x: 0.5, y: 0.5 });
  const [compare, setCompare] = useState(50);
  const [processing, setProcessing] = useState(false);
  const [format, setFormat] = useState<ImageFormat>("jpeg");
  const [quality, setQuality] = useState(92);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState<{ name: string; size: number } | null>(null);
  const beforeRef = useRef<HTMLCanvasElement>(null);
  const afterRef = useRef<HTMLCanvasElement>(null);
  const loadedRef = useRef<LoadedImage | null>(null);

  useEffect(() => () => loadedRef.current?.image.release(), []);

  // Reprocessa a prévia (imagem inteira reduzida ou recorte em tamanho real) a cada ajuste.
  useEffect(() => {
    if (!loaded) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setProcessing(true);
      try {
        const { before, after } = await renderPreview(loaded, settings, view, focus);
        if (cancelled) return;
        drawInto(beforeRef.current, before);
        drawInto(afterRef.current, after);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Não foi possível gerar a prévia.");
      } finally {
        if (!cancelled) setProcessing(false);
      }
    }, PREVIEW_DELAY);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [loaded, settings, view, focus]);

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
      const base = renderImage(image, fitWithin(image, PREVIEW_MAX_SIDE));
      loadedRef.current?.image.release();
      loadedRef.current = { file, image, base, levels: computeLevels(base) };
      setLoaded(loadedRef.current);
      // Já abre melhorada: o usuário vê o resultado e compara com o original.
      setSettings(autoEnhanceSettings(image));
      setView("full");
      setFocus({ x: 0.5, y: 0.5 });
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

  function update(next: Partial<EnhanceSettings>) {
    setSettings((current) => ({ ...current, ...next }));
    setExported(null);
  }

  if (!loaded) {
    return (
      <div className="flex flex-col gap-4">
        <FileDropzone
          accept={IMAGE_INPUT_ACCEPT}
          acceptPaste
          disabled={opening}
          label={opening ? "Abrindo imagem…" : "Escolha a foto que quer melhorar"}
          hint={IMAGE_INPUT_HINT}
          onFiles={openFile}
        />
        {error && <ToolStatus kind="error">{error}</ToolStatus>}
      </div>
    );
  }

  const { file, image, levels } = loaded;
  const output = fitToCanvasLimit({ width: image.width * settings.scale, height: image.height * settings.scale });
  const pixels = image.width * image.height;
  const scaleOptions = [
    { value: "1", label: "Original" },
    { value: "2", label: "2×", disabled: pixels >= MAX_CANVAS_PIXELS },
    { value: "4", label: "4×", disabled: pixels * 4 >= MAX_CANVAS_PIXELS },
  ];
  const { lossy, label: formatLabel } = IMAGE_FORMATS[format];

  function pickFocus(event: MouseEvent<HTMLCanvasElement>) {
    if (view !== "full") return;
    const rect = event.currentTarget.getBoundingClientRect();
    setFocus({ x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height });
    setView("detail");
  }

  async function download() {
    setExporting(true);
    setError(null);
    setExported(null);
    await new Promise((resolve) => setTimeout(resolve, 0));
    try {
      const source = renderImage(image);
      const canvas = await enhanceCanvas(source, settings, { unit: source.width / image.width, upscale: true, levels });
      const blob = await encodeCanvas(canvas, format, quality / 100);
      const name = renameFile(file.name, IMAGE_FORMATS[format].extension, "-melhorada");
      downloadBlob(blob, name);
      setExported({ name, size: blob.size });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível gerar a imagem. Tente uma ampliação menor.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-6">
      <section aria-label="Prévia" className="flex min-w-0 flex-col gap-3">
        <SegmentedControl label="Prévia" hideLabel options={viewOptions} value={view} onChange={setView} />
        <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-m-md border border-md-outline-variant bg-md-surface-high p-2">
          <div className="relative">
            <canvas
              ref={beforeRef}
              role="img"
              aria-label={`Original de ${file.name}`}
              className={view === "full" ? "block max-h-[min(60vh,40rem)] max-w-full cursor-zoom-in" : "block max-w-full"}
              onClick={pickFocus}
            />
            <canvas
              ref={afterRef}
              role="img"
              aria-label={`Prévia melhorada de ${file.name}`}
              className={view === "full" ? "absolute inset-0 size-full cursor-zoom-in" : "absolute inset-0 size-full"}
              style={{ clipPath: `inset(0 0 0 ${compare}%)` }}
              onClick={pickFocus}
            />
            <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${compare}%` }} />
            <span className="pointer-events-none absolute left-2 top-2 rounded-m-xs bg-black/60 px-1.5 py-0.5 text-xs text-white">Antes</span>
            <span className="pointer-events-none absolute right-2 top-2 rounded-m-xs bg-black/60 px-1.5 py-0.5 text-xs text-white">Depois</span>
          </div>
          {processing && (
            <span className="loading loading-spinner loading-md absolute bottom-3 right-3 text-md-primary" aria-label="Atualizando prévia" />
          )}
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={compare}
          aria-label="Comparar antes e depois"
          className="range range-primary range-sm w-full"
          onChange={(event) => setCompare(Number(event.target.value))}
        />
        <p className="text-xs text-md-on-surface-variant">
          {view === "full"
            ? "Arraste o controle para comparar. Toque na imagem para ver aquele ponto em tamanho real."
            : "Detalhe em tamanho real do arquivo final. Volte para a imagem inteira para escolher outro ponto."}
        </p>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-md-on-surface-variant">
          <span className="min-w-0 truncate font-medium text-md-on-surface">{file.name}</span>
          <span className="rounded-m-xs bg-md-surface-high px-1.5 py-0.5 tabular-nums">
            {image.width} × {image.height} px
          </span>
          <span className="rounded-m-xs bg-md-surface-high px-1.5 py-0.5 tabular-nums">{formatBytes(file.size)}</span>
        </p>
      </section>

      <div className="flex flex-col gap-5 rounded-m-md bg-md-surface-low p-4 sm:p-5">
        <button
          type="button"
          className="btn btn-outline btn-primary min-h-11"
          onClick={() => {
            setSettings(autoEnhanceSettings(image));
            setExported(null);
          }}
        >
          Melhorar automaticamente
        </button>

        <div className="flex flex-col gap-4">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={settings.autoLevels}
              onChange={(event) => update({ autoLevels: event.target.checked })}
            />
            Corrigir contraste e cores
          </label>
          <RangeField
            label="Nitidez"
            value={settings.sharpness}
            min={0}
            max={100}
            step={5}
            format={(value) => `${value}%`}
            onChange={(sharpness) => update({ sharpness })}
          />
          <RangeField
            label="Raio da nitidez"
            value={settings.radius}
            min={0.5}
            max={3}
            step={0.5}
            format={(value) => `${value.toLocaleString("pt-BR")} px`}
            hint="Valores maiores realçam contornos mais grossos."
            onChange={(radius) => update({ radius })}
          />
          <RangeField
            label="Reduzir ruído"
            value={settings.denoise}
            min={0}
            max={100}
            step={5}
            format={(value) => `${value}%`}
            onChange={(denoise) => update({ denoise })}
          />
          <SegmentedControl
            label="Aumentar resolução"
            options={scaleOptions}
            value={String(settings.scale)}
            onChange={(value) => update({ scale: Number(value) as EnhanceSettings["scale"] })}
          />
        </div>

        <div className="flex flex-col gap-4 border-t border-md-outline-variant pt-5">
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

          <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-2 border-t border-md-outline-variant bg-md-surface-low px-4 py-3 sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:border-0 lg:p-0">
            <button type="button" className="btn btn-primary min-h-12 w-full" disabled={exporting} onClick={download}>
              {exporting && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
              {exporting ? "Melhorando a foto…" : `Baixar ${formatLabel}`}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-ghost min-h-11 flex-1"
                disabled={JSON.stringify(settings) === JSON.stringify(NO_ENHANCE) || exporting}
                onClick={() => update(NO_ENHANCE)}
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

/**
 * Imagem inteira: a versão reduzida, sem ampliar. Detalhe: um recorte da foto
 * original processado exatamente como no arquivo final, em tamanho real.
 */
async function renderPreview(
  { image, base, levels }: LoadedImage,
  settings: EnhanceSettings,
  view: PreviewView,
  focus: { x: number; y: number },
): Promise<{ before: HTMLCanvasElement; after: HTMLCanvasElement }> {
  if (view === "full") {
    const after = await enhanceCanvas(base, settings, { unit: base.width / image.width, upscale: false, levels });
    return { before: base, after };
  }
  const side = Math.round(DETAIL_SIDE / settings.scale);
  const width = Math.min(side, image.width);
  const height = Math.min(side, image.height);
  const x = Math.min(Math.max(0, focus.x * image.width - width / 2), image.width - width);
  const y = Math.min(Math.max(0, focus.y * image.height - height / 2), image.height - height);
  const region = renderImage(image, {
    crop: { x: (x / image.width) * 100, y: (y / image.height) * 100, width: (width / image.width) * 100, height: (height / image.height) * 100 },
  });
  const after = await enhanceCanvas(region, settings, { unit: 1, upscale: true, levels });
  return { before: resample(region, after.width, after.height), after };
}

function drawInto(target: HTMLCanvasElement | null, source: HTMLCanvasElement) {
  if (!target) return;
  target.width = source.width;
  target.height = source.height;
  context2d(target).drawImage(source, 0, 0);
}
