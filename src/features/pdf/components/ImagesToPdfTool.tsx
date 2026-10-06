"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/tool/FileDropzone";
import { ToolStatus } from "@/components/tool/ToolStatus";
import { EmptyState } from "@/components/ui/EmptyState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { BlobImage } from "@/features/image/components/BlobImage";
import { IMAGE_INPUT_ACCEPT, MAX_INPUT_BYTES } from "@/features/image/lib/formats";
import { matchesAccept, renameFile } from "@/lib/file";
import { cn } from "@/lib/utils";
import { moveItem, useDragReorder } from "../hooks/useDragReorder";
import { usePdfTask } from "../hooks/usePdfTask";
import { imagesToPdf, type ImagesToPdfOptions, type OrientationOption, type PageSizeOption } from "../lib/operations";
import { ActionBar, RunButton } from "./ActionBar";
import { PdfIcon } from "./icons";
import { PageAction, PageGrid } from "./PageCard";
import { TaskResult } from "./TaskResult";

const MAX_IMAGES = 100;

const sizeOptions = [
  { value: "a4", label: "A4" },
  { value: "letter", label: "Carta" },
  { value: "fit", label: "Tamanho da imagem" },
] as const;

const orientationOptions = [
  { value: "auto", label: "Automática" },
  { value: "portrait", label: "Retrato" },
  { value: "landscape", label: "Paisagem" },
] as const;

const marginOptions = [
  { value: "0", label: "Sem margem" },
  { value: "20", label: "Pequena" },
  { value: "40", label: "Grande" },
] as const;

/** Dimensões das folhas em pontos, para a pré-visualização. */
const SHEETS = { a4: [595.28, 841.89], letter: [612, 792] } as const;

interface ImageItem {
  id: number;
  file: File;
  /** Dimensões já com a rotação EXIF aplicada (lidas da miniatura). */
  size?: { width: number; height: number };
}

let nextId = 0;

interface ImagesToPdfToolProps {
  /** Formato em destaque nos textos (todos os formatos comuns são aceitos). */
  format: "JPG" | "PNG";
}

/** JPG para PDF e PNG para PDF: cada imagem vira uma página, com pré-visualização fiel. */
export function ImagesToPdfTool({ format }: ImagesToPdfToolProps) {
  const task = usePdfTask();
  const [items, setItems] = useState<ImageItem[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<PageSizeOption>("a4");
  const [orientation, setOrientation] = useState<OrientationOption>("auto");
  const [margin, setMargin] = useState<"0" | "20" | "40">("20");

  function change<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      task.reset();
    };
  }

  function addFiles(files: File[]) {
    const problems: string[] = [];
    const accepted: ImageItem[] = [];
    for (const file of files) {
      if (!matchesAccept(file, IMAGE_INPUT_ACCEPT)) problems.push(`${file.name}: formato não suportado`);
      else if (file.size > MAX_INPUT_BYTES) problems.push(`${file.name}: maior que 50 MB`);
      else accepted.push({ id: nextId++, file });
    }
    const room = Math.max(0, MAX_IMAGES - items.length);
    if (accepted.length > room) problems.push(`limite de ${MAX_IMAGES} imagens por PDF`);
    setItems([...items, ...accepted.slice(0, room)]);
    setNotice(problems.length > 0 ? `Alguns arquivos foram ignorados — ${problems.join("; ")}.` : null);
    task.reset();
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    setItems(moveItem(items, from, to));
    task.reset();
  };
  const remove = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
    task.reset();
  };
  const drag = useDragReorder(move, task.running);

  const options: ImagesToPdfOptions = { pageSize, orientation, margin: Number(margin) };

  function convert() {
    const files = items.map((item) => item.file);
    void task.run(async ({ report }) => {
      report(0, files.length);
      const blob = await imagesToPdf(files, options, (done) => report(done, files.length));
      return [{ name: files.length === 1 ? renameFile(files[0].name, "pdf") : "imagens.pdf", blob }];
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <FileDropzone
        accept={IMAGE_INPUT_ACCEPT}
        multiple
        acceptPaste
        compact={items.length > 0}
        disabled={task.running}
        label={items.length > 0 ? "Adicionar mais imagens" : `Escolha as imagens ${format}`}
        hint={
          items.length > 0
            ? `Até ${MAX_IMAGES} imagens por PDF.`
            : `${format === "JPG" ? "JPG, PNG" : "PNG, JPG"}, WebP ou GIF, até 50 MB cada. As imagens não saem do seu dispositivo.`
        }
        onFiles={addFiles}
      />
      {notice && <ToolStatus kind="info">{notice}</ToolStatus>}

      <div className="grid gap-4 sm:grid-cols-2">
        <SegmentedControl
          label="Tamanho da página"
          options={sizeOptions}
          value={pageSize}
          onChange={change(setPageSize)}
          disabled={task.running}
        />
        {pageSize !== "fit" && (
          <SegmentedControl
            label="Orientação"
            options={orientationOptions}
            value={orientation}
            onChange={change(setOrientation)}
            disabled={task.running}
          />
        )}
        <SegmentedControl label="Margem" options={marginOptions} value={margin} onChange={change(setMargin)} disabled={task.running} />
      </div>

      <TaskResult
        task={task}
        progressLabel="Adicionando imagem"
        successMessage={() => `Pronto! PDF criado com ${items.length} ${items.length === 1 ? "página" : "páginas"}.`}
      />

      {items.length === 0 ? (
        <EmptyState title="Nenhuma imagem selecionada">Cada imagem vira uma página do PDF, na ordem que você escolher.</EmptyState>
      ) : (
        <>
          <p className="text-xs text-md-on-surface-variant">Cada imagem vira uma página. Arraste ou use as setas para mudar a ordem.</p>
          <PageGrid label="Páginas do PDF" wide>
            {items.map((item, index) => (
              <li
                key={item.id}
                {...drag.itemProps(index)}
                className={cn(
                  "flex min-w-0 cursor-grab flex-col",
                  drag.dragging === index && "opacity-50",
                  drag.over === index && drag.dragging !== index && "rounded-m-sm outline-2 outline-offset-2 outline-primary",
                )}
              >
                <div className="rounded-m-sm p-1.5 ring-1 ring-md-outline-variant">
                  <SheetPreview
                    item={item}
                    options={options}
                    onSize={(size) => setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, size } : entry)))}
                  />
                  <span className="block truncate pt-1.5 text-center text-xs font-medium text-md-on-surface-variant" title={item.file.name}>
                    {index + 1} · {item.file.name}
                  </span>
                </div>
                <div className="mt-1 flex justify-center gap-1">
                  <PageAction
                    label={`Mover ${item.file.name} para trás`}
                    onClick={() => move(index, index - 1)}
                    disabled={task.running || index === 0}
                  >
                    <PdfIcon name="arrowLeft" className="size-4" />
                  </PageAction>
                  <PageAction label={`Remover ${item.file.name}`} onClick={() => remove(item.id)} disabled={task.running}>
                    <PdfIcon name="trash" className="size-4" />
                  </PageAction>
                  <PageAction
                    label={`Mover ${item.file.name} para frente`}
                    onClick={() => move(index, index + 1)}
                    disabled={task.running || index === items.length - 1}
                  >
                    <PdfIcon name="arrowRight" className="size-4" />
                  </PageAction>
                </div>
              </li>
            ))}
          </PageGrid>
        </>
      )}

      {items.length > 0 && (
        <ActionBar
          summary={`${items.length} ${items.length === 1 ? "imagem" : "imagens"} · ${items.length} ${items.length === 1 ? "página" : "páginas"}`}
        >
          <button
            type="button"
            className="btn btn-ghost min-h-12"
            onClick={() => {
              setItems([]);
              setNotice(null);
              task.reset();
            }}
            disabled={task.running}
          >
            Limpar
          </button>
          <RunButton running={task.running} onClick={convert}>
            Converter para PDF
          </RunButton>
        </ActionBar>
      )}
    </div>
  );
}

/** A imagem desenhada na folha, com o tamanho, a orientação e a margem escolhidos. */
function SheetPreview({
  item,
  options,
  onSize,
}: {
  item: ImageItem;
  options: ImagesToPdfOptions;
  onSize: (size: { width: number; height: number }) => void;
}) {
  const imageRatio = item.size ? item.size.width / item.size.height : 3 / 4;
  let sheetWidth: number;
  let sheetHeight: number;
  if (options.pageSize === "fit") {
    // Mesma conversão do PDF: pixels em 96 DPI.
    sheetWidth = (item.size?.width ?? 600) * 0.75 + options.margin * 2;
    sheetHeight = (item.size?.height ?? 800) * 0.75 + options.margin * 2;
  } else {
    const [short, long] = SHEETS[options.pageSize];
    const landscape = options.orientation === "landscape" || (options.orientation === "auto" && imageRatio > 1);
    [sheetWidth, sheetHeight] = landscape ? [long, short] : [short, long];
  }
  const insetX = `${(options.margin / sheetWidth) * 100}%`;
  const insetY = `${(options.margin / sheetHeight) * 100}%`;
  const sheetRatio = sheetWidth / sheetHeight;

  return (
    <div className="grid aspect-[3/4] w-full place-items-center overflow-hidden rounded-m-sm bg-md-surface-high p-1.5">
      <div
        className="relative max-h-full max-w-full bg-white shadow-sm ring-1 ring-black/10"
        style={{
          aspectRatio: `${sheetWidth} / ${sheetHeight}`,
          // Ocupa a largura ou a altura da moldura, conforme a folha seja mais larga ou mais alta que ela.
          [sheetRatio > 3 / 4 ? "width" : "height"]: "100%",
        }}
      >
        {/* Posição absoluta: `top/bottom` em % usam a altura da folha e `left/right`, a largura — como a margem real. */}
        <BlobImage
          blob={item.file}
          loading="lazy"
          draggable={false}
          className="absolute object-contain"
          style={{
            top: insetY,
            bottom: insetY,
            left: insetX,
            right: insetX,
            width: `calc(100% - 2 * ${insetX})`,
            height: `calc(100% - 2 * ${insetY})`,
          }}
          onLoad={(event) => {
            const image = event.currentTarget;
            if (!item.size) onSize({ width: image.naturalWidth, height: image.naturalHeight });
          }}
        />
      </div>
    </div>
  );
}
