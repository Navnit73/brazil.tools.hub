const byteFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

/** Tamanho legível em pt-BR (ex.: "1,4 MB"). */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${byteFormatter.format(bytes / 1024)} KB`;
  return `${byteFormatter.format(bytes / (1024 * 1024))} MB`;
}

/** Nome do arquivo sem a extensão (ex.: "contrato.pdf" → "contrato"). */
export function fileBaseName(name: string): string {
  return name.replace(/\.[^./\\]+$/, "") || "arquivo";
}

/** Troca a extensão de um nome de arquivo, opcionalmente com um sufixo (ex.: "foto-comprimida.webp"). */
export function renameFile(name: string, extension: string, suffix = ""): string {
  return `${fileBaseName(name)}${suffix}.${extension}`;
}

/** Inicia o download de um Blob no navegador. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  // Safari precisa que a URL continue válida por um instante após o clique.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Verifica se um arquivo corresponde a um `accept` de input (MIME exato, curinga ou extensão). */
export function matchesAccept(file: File, accept: string): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
    .some((token) => {
      if (token.startsWith(".")) return name.endsWith(token);
      if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
      return type === token;
    });
}
