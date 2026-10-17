import type { BinaryFileData, BinaryFiles } from "@excalidraw/excalidraw/types";

/**
 * O quadro fica salvo só neste navegador: a cena (vetores, leve) no localStorage
 * e as imagens no IndexedDB, que aguenta arquivos grandes. Qualquer falha
 * (janela anônima, armazenamento cheio ou bloqueado) apenas deixa de salvar.
 */
const SCENE_KEY = "pdfimagem:quadro-branco:v2";
const DB_NAME = "pdfimagem-quadro-branco";
const STORE = "files";

export interface SavedScene {
  elements: unknown[];
  appState: Record<string, unknown>;
}

export function loadSceneData(): SavedScene | null {
  try {
    const raw = localStorage.getItem(SCENE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<SavedScene>;
    return Array.isArray(data.elements) ? { elements: data.elements, appState: data.appState ?? {} } : null;
  } catch {
    return null;
  }
}

/** `json` já vem serializado por `serializeAsJSON(…, "local")`, sem os arquivos. */
export function saveSceneJson(json: string): void {
  try {
    localStorage.setItem(SCENE_KEY, json);
  } catch {
    // Sem espaço ou bloqueado: o quadro continua funcionando.
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

let dbPromise: Promise<IDBDatabase> | null = null;

function db(): Promise<IDBDatabase> {
  dbPromise ??= openDb().catch((error) => {
    dbPromise = null;
    throw error;
  });
  return dbPromise;
}

function done(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

/** Lê as imagens usadas pela cena e apaga as que não são mais usadas. */
export async function loadFiles(usedIds: Set<string>): Promise<BinaryFileData[]> {
  try {
    const database = await db();
    const transaction = database.transaction(STORE, "readwrite");
    const store = transaction.objectStore(STORE);
    const files: BinaryFileData[] = [];
    await new Promise<void>((resolve, reject) => {
      const request = store.openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return resolve();
        if (usedIds.has(String(cursor.key))) files.push(cursor.value as BinaryFileData);
        else cursor.delete();
        cursor.continue();
      };
      request.onerror = () => reject(request.error);
    });
    await done(transaction);
    return files;
  } catch {
    return [];
  }
}

/** Grava só as imagens novas. */
export async function saveFiles(files: BinaryFiles, savedIds: Set<string>): Promise<void> {
  const pending = Object.values(files).filter((file) => !savedIds.has(file.id));
  if (!pending.length) return;
  try {
    const database = await db();
    const transaction = database.transaction(STORE, "readwrite");
    for (const file of pending) transaction.objectStore(STORE).put(file, file.id);
    await done(transaction);
    for (const file of pending) savedIds.add(file.id);
  } catch {
    // Sem IndexedDB: as imagens não ficam salvas, mas o desenho sim.
  }
}
