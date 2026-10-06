/**
 * Intervalos de páginas digitados pelo usuário ("1-3, 5, 8-"), sempre numerados
 * a partir de 1 na interface e a partir de 0 no código.
 */

export type RangeResult = { groups: number[][]; error: null } | { groups: null; error: string };

/**
 * Lê "1-3, 5, 8-" e devolve um grupo (índices a partir de 0) por intervalo.
 * "8-" vai até a última página; "-3" começa na primeira.
 */
export function parseRanges(text: string, pageCount: number): RangeResult {
  // "1 - 3" vira "1-3"; vírgulas, ponto e vírgula e espaços separam intervalos.
  const parts = text
    .replace(/\s*[-–]\s*/g, "-")
    .split(/[\s,;]+/)
    .filter(Boolean);
  if (parts.length === 0) return { groups: null, error: "Informe as páginas, por exemplo: 1-3, 5." };

  const groups: number[][] = [];
  for (const part of parts) {
    const match = /^(\d*)(?:(-)(\d*))?$/.exec(part);
    if (!match || (match[1] === "" && (match[3] ?? "") === "")) {
      return { groups: null, error: `"${part}" não é um intervalo válido. Use, por exemplo: 1-3, 5.` };
    }
    const start = match[1] === "" ? 1 : Number(match[1]);
    const end = match[2] ? (match[3] === "" ? pageCount : Number(match[3])) : start;
    if (start < 1 || end < 1) return { groups: null, error: "As páginas começam em 1." };
    if (start > pageCount || end > pageCount) {
      return { groups: null, error: `O PDF tem ${pageCount} ${pageCount === 1 ? "página" : "páginas"}; "${part}" passa desse número.` };
    }
    const [low, high] = start <= end ? [start, end] : [end, start];
    const group = Array.from({ length: high - low + 1 }, (_, offset) => low - 1 + offset);
    groups.push(start <= end ? group : group.reverse());
  }
  return { groups, error: null };
}

/** Índices únicos, em ordem crescente, de todos os intervalos digitados. */
export function parsePageSelection(text: string, pageCount: number): { pages: number[] | null; error: string | null } {
  const result = parseRanges(text, pageCount);
  if (result.error !== null) return { pages: null, error: result.error };
  return { pages: [...new Set(result.groups.flat())].sort((a, b) => a - b), error: null };
}

/** Converte índices (a partir de 0) no texto mais curto possível: [0,1,2,4] → "1-3, 5". */
export function formatRanges(indices: Iterable<number>): string {
  const sorted = [...new Set(indices)].sort((a, b) => a - b);
  const parts: string[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i];
    while (i + 1 < sorted.length && sorted[i + 1] === sorted[i] + 1) i++;
    const end = sorted[i];
    parts.push(start === end ? `${start + 1}` : `${start + 1}-${end + 1}`);
  }
  return parts.join(", ");
}

/** Divide `pageCount` páginas em blocos de `size`. */
export function chunkPages(pageCount: number, size: number): number[][] {
  const groups: number[][] = [];
  for (let start = 0; start < pageCount; start += size) {
    groups.push(Array.from({ length: Math.min(size, pageCount - start) }, (_, offset) => start + offset));
  }
  return groups;
}

/** Rótulo de um grupo para nomes de arquivo: [0,1,2] → "1-3"; [4] → "5". */
export function groupLabel(group: number[]): string {
  if (group.length === 1) return `${group[0] + 1}`;
  const contiguous = group.every((page, index) => index === 0 || page === group[index - 1] + 1);
  return contiguous ? `${group[0] + 1}-${group[group.length - 1] + 1}` : formatRanges(group).replace(/,\s*/g, "_");
}
