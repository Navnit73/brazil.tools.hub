"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolStatus } from "@/components/tool/ToolStatus";
import { RangeField } from "@/components/ui/RangeField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { matchesAccept } from "@/lib/file";
import { cn } from "@/lib/utils";
import { ImageBatchTool } from "./components/ImageBatchTool";
import { useImageBatch } from "./hooks/useImageBatch";
import { decodeImage, type DecodedImage } from "./lib/decode";
import { IMAGE_INPUT_ACCEPT } from "./lib/formats";
import { context2d, fitWithin, renderImage } from "./lib/render";
import { drawWatermark, hasWatermark, watermarkImage, type WatermarkKind, type WatermarkOptions, type WatermarkPosition } from "./lib/watermark";

const kindOptions = [
  { value: "text", label: "Texto" },
  { value: "logo", label: "Logo" },
] as const;

const TEXT_SUGGESTIONS = ["Somente para fins de cadastro", "Cópia sem valor legal", "© Seu nome"];

const COLOR_SWATCHES = [
  { value: "#ffffff", label: "Branco" },
  { value: "#000000", label: "Preto" },
  { value: "#808080", label: "Cinza" },
  { value: "#d32f2f", label: "Vermelho" },
];

const POSITION_LABELS = [
  ["Superior esquerdo", "Superior centro", "Superior direito"],
  ["Centro esquerdo", "Centro", "Centro direito"],
  ["Inferior esquerdo", "Inferior centro", "Inferior direito"],
];

/** Faixas de tamanho: texto em altura da letra, logo em largura (ambos em % da largura da foto). */
const SIZE_RANGE: Record<WatermarkKind, { min: number; max: number; initial: number }> = {
  text: { min: 2, max: 20, initial: 5 },
  logo: { min: 5, max: 60, initial: 20 },
};

/** Lado maior da prévia: leve para redesenhar a cada ajuste. */
const PREVIEW_MAX_SIDE = 1000;

type Settings = Omit<WatermarkOptions, "logo">;

const INITIAL_SETTINGS: Settings = {
  kind: "text",
  text: "",
  color: "#ffffff",
  size: SIZE_RANGE.text.initial,
  opacity: 0.6,
  rotation: 0,
  position: { row: 2, col: 2 },
  tile: false,
  margin: 3,
};

export default function Watermark() {
  const id = useId();
  const batch = useImageBatch();
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const [logo, setLogo] = useState<{ name: string; image: DecodedImage } | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [quality, setQuality] = useState(90);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [decoded, setDecoded] = useState<{ file: File; canvas: HTMLCanvasElement } | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<DecodedImage | null>(null);

  const options: WatermarkOptions = { ...settings, logo: logo?.image ?? null };
  const ready = hasWatermark(options);
  const { items } = batch;
  const previewFile = items[Math.min(previewIndex, items.length - 1)]?.file;
  // Prévia só da foto atual: some ao limpar a lista ou trocar de foto até a nova decodificar.
  const base = decoded && decoded.file === previewFile ? decoded.canvas : null;

  // Libera o logo ao sair da página.
  useEffect(() => () => logoRef.current?.release(), []);

  // Decodifica a foto da prévia uma vez, em tamanho reduzido.
  useEffect(() => {
    if (!previewFile) return;
    let active = true;
    decodeImage(previewFile)
      .then((image) => {
        const canvas = renderImage(image, fitWithin(image, PREVIEW_MAX_SIDE));
        image.release();
        if (active) setDecoded({ file: previewFile, canvas });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [previewFile]);

  // Redesenha a marca sobre a prévia a cada ajuste, com a mesma função do arquivo final.
  const logoImage = logo?.image ?? null;
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas || !base) return;
    canvas.width = base.width;
    canvas.height = base.height;
    context2d(canvas).drawImage(base, 0, 0);
    drawWatermark(canvas, { ...settings, logo: logoImage });
  }, [base, settings, logoImage]);

  function update(patch: Partial<Settings>) {
    setSettings((current) => ({ ...current, ...patch }));
    batch.resetResults();
  }

  function changeKind(kind: WatermarkKind) {
    update({ kind, size: SIZE_RANGE[kind].initial });
  }

  async function openLogo([file]: File[]) {
    if (!file) return;
    setLogoError(null);
    if (!matchesAccept(file, IMAGE_INPUT_ACCEPT)) {
      setLogoError("Formato não suportado. Use um logo em PNG (com fundo transparente), WebP ou JPG.");
      return;
    }
    try {
      const image = await decodeImage(file);
      logoRef.current?.release();
      logoRef.current = image;
      setLogo({ name: file.name, image });
      batch.resetResults();
    } catch (cause) {
      setLogoError(cause instanceof Error ? cause.message : "Não foi possível abrir o logo.");
    }
  }

  const sizeRange = SIZE_RANGE[settings.kind];

  return (
    <ImageBatchTool
      batch={batch}
      actionLabel="Aplicar marca d'água"
      progressLabel="Aplicando marca d'água"
      emptyTitle="Nenhuma imagem selecionada"
      canRun={ready}
      process={(file) => watermarkImage(file, options, quality / 100)}
      settings={
        <>
          {base && (
            <figure className="flex flex-col gap-2">
              <div className="flex items-center justify-center overflow-hidden rounded-m-md border border-md-outline-variant bg-md-surface-high p-2">
                <canvas
                  ref={previewRef}
                  role="img"
                  aria-label={previewFile ? `Prévia da marca d'água em ${previewFile.name}` : "Prévia da marca d'água"}
                  className="block max-h-80 max-w-full"
                />
              </div>
              <figcaption className="flex items-center justify-between gap-2 text-xs text-md-on-surface-variant">
                <span className="min-w-0 truncate">Prévia: {previewFile?.name}</span>
                {items.length > 1 && (
                  <span className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm min-h-11 min-w-11"
                      aria-label="Prévia da imagem anterior"
                      onClick={() => setPreviewIndex((index) => (index - 1 + items.length) % items.length)}
                    >
                      ‹
                    </button>
                    <span className="tabular-nums">
                      {Math.min(previewIndex, items.length - 1) + 1}/{items.length}
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm min-h-11 min-w-11"
                      aria-label="Prévia da próxima imagem"
                      onClick={() => setPreviewIndex((index) => (index + 1) % items.length)}
                    >
                      ›
                    </button>
                  </span>
                )}
              </figcaption>
            </figure>
          )}

          <SegmentedControl label="Tipo de marca d'água" options={kindOptions} value={settings.kind} onChange={changeKind} />

          {settings.kind === "text" ? (
            <div className="flex flex-col gap-2 text-sm">
              <label htmlFor={`${id}-text`} className="font-medium text-md-on-surface">
                Texto da marca d&apos;água
              </label>
              <input
                id={`${id}-text`}
                type="text"
                maxLength={80}
                value={settings.text}
                placeholder="Ex.: Somente para fins de cadastro"
                onChange={(event) => update({ text: event.target.value })}
                className="input min-h-11 w-full bg-md-surface-lowest"
              />
              <div className="flex flex-wrap gap-2" role="group" aria-label="Sugestões de texto">
                {TEXT_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="btn btn-outline btn-sm min-h-11 border-md-outline-variant font-normal"
                    onClick={() => update({ text: suggestion })}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <fieldset className="mt-2 flex flex-col gap-2">
                <legend className="mb-2 font-medium text-md-on-surface">Cor</legend>
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_SWATCHES.map((swatch) => (
                    <button
                      key={swatch.value}
                      type="button"
                      aria-label={swatch.label}
                      aria-pressed={settings.color === swatch.value}
                      title={swatch.label}
                      className={cn(
                        "size-11 rounded-full border-2 border-md-outline-variant",
                        settings.color === swatch.value && "ring-2 ring-md-primary ring-offset-2",
                      )}
                      style={{ backgroundColor: swatch.value }}
                      onClick={() => update({ color: swatch.value })}
                    />
                  ))}
                  <label className="flex min-h-11 cursor-pointer items-center gap-2">
                    <input
                      type="color"
                      value={settings.color}
                      onChange={(event) => update({ color: event.target.value })}
                      className="size-11 cursor-pointer rounded-m-sm border border-md-outline-variant bg-transparent"
                    />
                    Outra cor
                  </label>
                </div>
              </fieldset>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <FileDropzone
                accept={IMAGE_INPUT_ACCEPT}
                compact
                label={logo ? `Trocar logo (${logo.name})` : "Escolha o logo"}
                hint="Prefira PNG com fundo transparente."
                onFiles={openLogo}
              />
              {logoError && <ToolStatus kind="error">{logoError}</ToolStatus>}
            </div>
          )}

          <RangeField
            label={settings.kind === "text" ? "Tamanho do texto" : "Tamanho do logo"}
            value={settings.size}
            min={sizeRange.min}
            max={sizeRange.max}
            step={1}
            format={(value) => `${value}%`}
            hint="Proporcional à largura de cada foto: fica do mesmo tamanho relativo em todas."
            onChange={(size) => update({ size })}
          />
          <RangeField
            label="Opacidade"
            value={Math.round(settings.opacity * 100)}
            min={10}
            max={100}
            step={5}
            format={(value) => `${value}%`}
            onChange={(value) => update({ opacity: value / 100 })}
          />
          <RangeField
            label="Rotação"
            value={settings.rotation}
            min={-90}
            max={90}
            step={5}
            format={(value) => `${value}°`}
            onChange={(rotation) => update({ rotation })}
          />

          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={settings.tile}
              onChange={(event) => {
                const tile = event.target.checked;
                // Mosaico costuma ficar na diagonal: aplica um ângulo se ainda não houver.
                update({ tile, rotation: tile && settings.rotation === 0 ? -30 : settings.rotation });
              }}
            />
            Repetir em mosaico (protege documentos)
          </label>

          {!settings.tile && (
            <>
              <PositionPicker value={settings.position} onChange={(position) => update({ position })} />
              <RangeField
                label="Margem"
                value={settings.margin}
                min={0}
                max={15}
                step={1}
                format={(value) => `${value}%`}
                onChange={(margin) => update({ margin })}
              />
            </>
          )}

          <RangeField
            label="Qualidade"
            value={quality}
            min={10}
            max={100}
            step={5}
            format={(value) => `${value}%`}
            hint="Vale para JPG, WebP e AVIF. Cada imagem é salva no próprio formato."
            onChange={(value) => {
              setQuality(value);
              batch.resetResults();
            }}
          />

          {items.length > 0 && !ready && (
            <p className="text-xs text-md-on-surface-variant">
              {settings.kind === "text" ? "Digite o texto da marca d'água para continuar." : "Escolha o logo para continuar."}
            </p>
          )}
        </>
      }
    />
  );
}

function PositionPicker({ value, onChange }: { value: WatermarkPosition; onChange: (position: WatermarkPosition) => void }) {
  const name = useId();
  return (
    <fieldset className="flex flex-col gap-2 text-sm">
      <legend className="mb-2 font-medium text-md-on-surface">Posição</legend>
      <div className="grid w-fit grid-cols-3 gap-1 rounded-m-sm border border-md-outline-variant bg-md-surface-lowest p-1">
        {POSITION_LABELS.map((labels, row) =>
          labels.map((label, col) => {
            const checked = value.row === row && value.col === col;
            return (
              <label
                key={label}
                title={label}
                className={cn(
                  "flex size-11 cursor-pointer items-center justify-center rounded-m-xs has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-md-primary",
                  checked ? "bg-md-primary" : "hover:bg-md-secondary-container",
                )}
              >
                <input
                  type="radio"
                  name={name}
                  className="sr-only"
                  checked={checked}
                  aria-label={label}
                  onChange={() => onChange({ row: row as WatermarkPosition["row"], col: col as WatermarkPosition["col"] })}
                />
                <span aria-hidden="true" className={cn("size-2.5 rounded-full", checked ? "bg-md-on-primary" : "bg-md-outline")} />
              </label>
            );
          }),
        )}
      </div>
    </fieldset>
  );
}
