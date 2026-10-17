"use client";

import "@excalidraw/excalidraw/index.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CaptureUpdateAction,
  Excalidraw,
  MainMenu,
  Sidebar,
  WelcomeScreen,
  convertToExcalidrawElements,
  serializeAsJSON,
} from "@excalidraw/excalidraw";
import type { FileId, OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type {
  AppState,
  BinaryFileData,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";
import { cn } from "@/lib/utils";
import { ICON_CATEGORIES, iconDataUrl, normalize, type BoardIcon } from "./whiteboard/icons";
import { loadFiles, loadSceneData, saveFiles, saveSceneJson } from "./whiteboard/storage";

const ICONS_SIDEBAR = "icons";
const ICON_SIZE = 96;
/** Intervalo para salvar: o onChange dispara a cada movimento do ponteiro. */
const SAVE_DELAY = 400;

const BOARD_PRESETS = [
  { id: "white", label: "Quadro branco", background: "#ffffff", stroke: "#1e1e1e", grid: false },
  { id: "grid", label: "Folha quadriculada", background: "#ffffff", stroke: "#1e1e1e", grid: true },
  { id: "chalk", label: "Lousa verde", background: "#23473a", stroke: "#ffffff", grid: false },
  { id: "black", label: "Quadro negro", background: "#1b1b1f", stroke: "#ffffff", grid: false },
] as const;

type BoardPreset = (typeof BOARD_PRESETS)[number];

/** O quadro abre sempre com o lápis (Desenhar) ativo, inclusive ao restaurar uma cena salva. */
const PENCIL: AppState["activeTool"] = { type: "freedraw", customType: null, locked: false, lastActiveTool: null };

async function loadInitialData(savedFileIds: Set<string>): Promise<ExcalidrawInitialDataState> {
  // Começa sempre claro (é um quadro branco); o tema escolhido no menu fica salvo com a cena.
  const theme = "light";
  const scene = loadSceneData();
  if (!scene) return { appState: { theme, activeTool: PENCIL } };
  const elements = scene.elements as OrderedExcalidrawElement[];
  const used = new Set(elements.flatMap((element) => (element.type === "image" && element.fileId && !element.isDeleted ? [element.fileId] : [])));
  const files = await loadFiles(used);
  for (const file of files) savedFileIds.add(file.id);
  return {
    elements,
    appState: { theme, ...scene.appState, activeTool: PENCIL },
    files: Object.fromEntries(files.map((file) => [file.id, file])),
    scrollToContent: true,
  };
}

/**
 * Quadro branco completo (Excalidraw, licença MIT): desenho à mão livre, formas,
 * texto, imagens, ícones, zoom infinito, tela cheia e salvamento automático no navegador.
 */
export default function Whiteboard() {
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  /** Imagens já gravadas no IndexedDB (conjunto mutável, estável entre renderizações). */
  const [savedFileIds] = useState(() => new Set<string>());
  const [initialData] = useState(() => loadInitialData(savedFileIds));
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pending = useRef<{ elements: readonly OrderedExcalidrawElement[]; appState: AppState; files: BinaryFiles } | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const iconCascade = useRef(0);

  function flushSave() {
    clearTimeout(saveTimer.current);
    saveTimer.current = undefined;
    const scene = pending.current;
    if (!scene) return;
    pending.current = null;
    saveSceneJson(serializeAsJSON(scene.elements, scene.appState, {}, "local"));
    void saveFiles(scene.files, savedFileIds);
  }

  function onChange(elements: readonly OrderedExcalidrawElement[], appState: AppState, files: BinaryFiles) {
    pending.current = { elements, appState, files };
    saveTimer.current ??= setTimeout(flushSave, SAVE_DELAY);
  }

  // Salva na hora ao sair da página ou trocar de aba.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") flushSave();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flushSave);
    return () => {
      flushSave();
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flushSave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- flushSave só usa refs e o conjunto estável de arquivos.
  }, []);

  // Tela cheia nativa quando o navegador permite; no iPhone, o quadro cobre a tela via CSS.
  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === wrapperRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // O Excalidraw mede o contêiner na montagem: avisa que o tamanho mudou.
    const frame = requestAnimationFrame(() => api?.refresh());
    return () => {
      document.body.style.overflow = overflow;
      cancelAnimationFrame(frame);
      requestAnimationFrame(() => api?.refresh());
    };
  }, [fullscreen, api]);

  function toggleFullscreen() {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else if (fullscreen) {
      setFullscreen(false);
    } else if (document.fullscreenEnabled) {
      wrapper.requestFullscreen().catch(() => setFullscreen(true));
    } else {
      setFullscreen(true);
    }
  }

  function applyPreset(preset: BoardPreset) {
    api?.updateScene({
      appState: {
        viewBackgroundColor: preset.background,
        currentItemStrokeColor: preset.stroke,
        gridModeEnabled: preset.grid,
        // No tema escuro o Excalidraw inverte as cores: os fundos prontos usam o tema claro.
        theme: "light",
      },
      captureUpdate: CaptureUpdateAction.EVENTUALLY,
    });
  }

  function insertIcon(icon: BoardIcon) {
    if (!api) return;
    const appState = api.getAppState();
    const color = appState.currentItemStrokeColor;
    const fileId = `icon-${icon.id}-${color.replace(/[^a-z0-9]/gi, "")}` as FileId;
    const file: BinaryFileData = {
      id: fileId,
      dataURL: iconDataUrl(icon.svg, color, 256) as BinaryFileData["dataURL"],
      mimeType: "image/svg+xml",
      created: Date.now(),
    };
    api.addFiles([file]);

    // Centro da área visível, em coordenadas da cena, com um leve deslocamento a cada ícone.
    const zoom = appState.zoom.value;
    const offset = (iconCascade.current++ % 6) * 16;
    const [element] = convertToExcalidrawElements([
      {
        type: "image",
        fileId,
        x: -appState.scrollX + appState.width / 2 / zoom - ICON_SIZE / 2 + offset,
        y: -appState.scrollY + appState.height / 2 / zoom - ICON_SIZE / 2 + offset,
        width: ICON_SIZE,
        height: ICON_SIZE,
      },
    ]);
    api.updateScene({
      elements: [...api.getSceneElementsIncludingDeleted(), element],
      appState: { selectedElementIds: { [element.id]: true } },
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-md-on-surface-variant">
        <p>Desenhe, escreva e insira ícones. Tudo fica salvo neste navegador.</p>
        <button type="button" className="btn btn-outline btn-primary min-h-11" onClick={toggleFullscreen}>
          <FullscreenIcon exit={false} />
          Abrir em tela cheia
        </button>
      </div>

      <div
        ref={wrapperRef}
        className={cn(
          "overflow-hidden",
          fullscreen ? "fixed inset-0 z-[100] h-dvh w-screen bg-white" : "relative h-[75vh] min-h-[30rem] rounded-m-md border border-md-outline-variant",
        )}
      >
        <Excalidraw
          excalidrawAPI={setApi}
          initialData={initialData}
          onChange={onChange}
          langCode="pt-BR"
          name="quadro-branco"
          UIOptions={{
            canvasActions: { toggleTheme: true, changeViewBackgroundColor: true, loadScene: true, saveToActiveFile: true, saveAsImage: true, clearCanvas: true },
            tools: { image: true },
          }}
          renderTopRightUI={() => (
            <div className="flex items-center gap-2">
              <Sidebar.Trigger
                name={ICONS_SIDEBAR}
                title="Ícones"
                icon={<SvgIcon d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9Z" />}
              >
                Ícones
              </Sidebar.Trigger>
              <button
                type="button"
                title={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
                aria-label={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
                className="flex size-9 items-center justify-center rounded-lg"
                style={{ background: "var(--island-bg-color)", boxShadow: "var(--shadow-island)", color: "var(--icon-fill-color)" }}
                onClick={toggleFullscreen}
              >
                <FullscreenIcon exit={fullscreen} />
              </button>
            </div>
          )}
        >
          <MainMenu>
            <MainMenu.DefaultItems.LoadScene />
            <MainMenu.DefaultItems.SaveToActiveFile />
            <MainMenu.DefaultItems.SaveAsImage />
            <MainMenu.DefaultItems.SearchMenu />
            <MainMenu.DefaultItems.Help />
            <MainMenu.DefaultItems.ClearCanvas />
            <MainMenu.Separator />
            <MainMenu.Group title="Fundo do quadro">
              {BOARD_PRESETS.map((preset) => (
                <MainMenu.Item
                  key={preset.id}
                  onSelect={() => applyPreset(preset)}
                  icon={<span className="block size-4 rounded-full border border-black/20" style={{ background: preset.background }} />}
                >
                  {preset.label}
                </MainMenu.Item>
              ))}
            </MainMenu.Group>
            <MainMenu.Separator />
            <MainMenu.DefaultItems.ToggleTheme />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
          </MainMenu>

          <WelcomeScreen>
            <WelcomeScreen.Hints.MenuHint />
            <WelcomeScreen.Hints.ToolbarHint />
            <WelcomeScreen.Hints.HelpHint />
            <WelcomeScreen.Center>
              <WelcomeScreen.Center.Heading>Quadro branco online: escolha uma ferramenta e comece a desenhar</WelcomeScreen.Center.Heading>
              <WelcomeScreen.Center.Menu>
                <WelcomeScreen.Center.MenuItem
                  onSelect={() => api?.toggleSidebar({ name: ICONS_SIDEBAR, force: true })}
                  icon={<SvgIcon d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9Z" />}
                >
                  Inserir ícones
                </WelcomeScreen.Center.MenuItem>
                <WelcomeScreen.Center.MenuItem
                  onSelect={() => applyPreset(BOARD_PRESETS[2])}
                  icon={<span className="block size-4 rounded-full" style={{ background: BOARD_PRESETS[2].background }} />}
                >
                  Usar lousa verde
                </WelcomeScreen.Center.MenuItem>
                <WelcomeScreen.Center.MenuItemLoadScene />
                <WelcomeScreen.Center.MenuItemHelp />
              </WelcomeScreen.Center.Menu>
            </WelcomeScreen.Center>
          </WelcomeScreen>

          <Sidebar name={ICONS_SIDEBAR}>
            <Sidebar.Header>Ícones</Sidebar.Header>
            <IconPicker onPick={insertIcon} />
          </Sidebar>
        </Excalidraw>
      </div>
    </div>
  );
}

function IconPicker({ onPick }: { onPick: (icon: BoardIcon) => void }) {
  const [query, setQuery] = useState("");
  const categories = useMemo(() => {
    const term = normalize(query.trim());
    if (!term) return ICON_CATEGORIES;
    return ICON_CATEGORIES.map((category) => ({
      ...category,
      icons: category.icons.filter((icon) => normalize(`${icon.label} ${icon.tags ?? ""} ${category.label}`).includes(term)),
    })).filter((category) => category.icons.length > 0);
  }, [query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 px-3 pb-3" style={{ color: "var(--text-primary-color)" }}>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar ícone (ex.: seta, ideia, gráfico)"
        aria-label="Buscar ícone"
        className="h-10 w-full rounded-lg border px-3 text-sm"
        style={{ background: "var(--input-bg-color)", borderColor: "var(--input-border-color)", color: "inherit" }}
      />
      <p className="text-xs opacity-70">Toque para inserir no centro do quadro, na cor do traço selecionada.</p>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {categories.length === 0 && <p className="py-6 text-center text-sm opacity-70">Nenhum ícone encontrado.</p>}
        {categories.map((category) => (
          <section key={category.label} className="mb-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-70">{category.label}</h3>
            <div className="grid grid-cols-5 gap-1">
              {category.icons.map((icon) => (
                <button
                  key={icon.id}
                  type="button"
                  title={icon.label}
                  aria-label={`Inserir ${icon.label}`}
                  className="flex aspect-square items-center justify-center rounded-lg hover:bg-[var(--button-hover-bg)] [&_svg]:size-6"
                  onClick={() => onPick(icon)}
                  // SVGs estáticos do Lucide, empacotados com o site.
                  dangerouslySetInnerHTML={{ __html: icon.svg }}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function SvgIcon({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function FullscreenIcon({ exit }: { exit: boolean }) {
  return <SvgIcon d={exit ? "M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" : "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"} />;
}
