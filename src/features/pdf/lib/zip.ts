import { zipSync, type Zippable } from "fflate";
import { readBytes } from "./document";

export interface NamedBlob {
  name: string;
  blob: Blob;
}

/** Junta vários arquivos em um .zip. Sem recompressão: PDF, JPG e PNG já são comprimidos. */
export async function zipFiles(files: NamedBlob[]): Promise<Blob> {
  const entries: Zippable = {};
  for (const { name, blob } of files) {
    let unique = name;
    for (let copy = 2; unique in entries; copy++) unique = name.replace(/(\.[^.]+)?$/, `-${copy}$1`);
    entries[unique] = [await readBytes(blob), { level: 0 }];
  }
  return new Blob([zipSync(entries) as BlobPart], { type: "application/zip" });
}
