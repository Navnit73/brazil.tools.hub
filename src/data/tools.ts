import type { Category } from "@/types/category";
import type { Tool, ToolRef } from "@/types/tool";
import { MAX_RELATED_TOOLS } from "@/lib/constants";

/**
 * Registro central de ferramentas. Para adicionar uma nova:
 * 1. crie o componente em `src/features/<área>/` e registre a chave em `src/features/index.tsx`;
 * 2. adicione a entrada abaixo;
 * 3. escreva o conteúdo em `src/content/tools/<category>/<slug>.md`.
 */
export const tools: Tool[] = [
  {
    // Uma página para "redimensionar imagem" e "redimensionar foto" (mesma intenção de busca).
    // O antigo /redimensionar-foto redireciona para cá (next.config.ts).
    slug: "redimensionar-imagem",
    category: "imagem",
    name: "Redimensionar imagem",
    h1: "Redimensionar imagem e foto online",
    description:
      "Mude a largura e a altura de imagens e fotos JPG, PNG, WebP ou AVIF em pixels ou porcentagem, mantendo a proporção e a qualidade.",
    keywords: [
      "redimensionar imagem",
      "redimensionar foto",
      "redimensionar imagem online",
      "redimensionar foto online grátis",
      "alterar tamanho da imagem",
      "mudar tamanho da foto",
      "redimensionar jpg",
      "redimensionar png",
    ],
    seo: {
      title: "Redimensionar imagem e foto online grátis",
      description:
        "Redimensione imagens e fotos online grátis: altere largura e altura em pixels ou %, mantendo a proporção. JPG, PNG e WebP, sem enviar nada.",
    },
    component: "image/resize",
    related: ["imagem/comprimir-imagem", "imagem/converter-jpg-para-webp", "imagem/editor-de-imagem"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "comprimir-imagem",
    category: "imagem",
    name: "Comprimir imagem",
    h1: "Comprimir imagem online",
    description:
      "Reduza o tamanho e o peso de imagens JPG, PNG e WebP em KB, mantendo boa qualidade visual. Até 20 fotos de uma vez.",
    keywords: [
      "comprimir imagem",
      "comprimir imagem online",
      "compactar imagem",
      "reduzir tamanho da imagem",
      "diminuir peso da imagem",
      "comprimir foto",
      "diminuir kb da imagem",
    ],
    seo: {
      title: "Comprimir imagem online grátis",
      description:
        "Comprima imagens online grátis e reduza o peso em KB sem perder qualidade visível. Compacte JPG, PNG e WebP ou defina um limite, como 200 KB.",
    },
    component: "image/compress",
    related: ["imagem/redimensionar-imagem", "imagem/converter-jpg-para-webp", "imagem/converter-imagem"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "editor-de-imagem",
    category: "imagem",
    name: "Editor de imagem",
    description: "Corte, gire, redimensione e ajuste brilho, contraste e saturação de fotos no navegador.",
    keywords: ["editor de imagem online", "cortar foto", "girar imagem", "editar foto online grátis"],
    seo: {
      title: "Editor de imagem online grátis",
      description:
        "Edite fotos online grátis: corte, gire, espelhe, redimensione e ajuste brilho, contraste e saturação. Sem cadastro e sem enviar a imagem.",
    },
    component: "image/editor",
    related: ["imagem/redimensionar-imagem", "imagem/comprimir-imagem", "imagem/converter-imagem"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "converter-imagem",
    category: "imagem",
    name: "Converter imagem",
    description: "Converta imagens entre JPG, PNG, WebP e AVIF, uma ou várias de uma vez.",
    keywords: ["converter imagem", "converter png para jpg", "converter webp para jpg", "converter para avif"],
    seo: {
      title: "Converter imagem online grátis: JPG, PNG, WebP e AVIF",
      description:
        "Converta imagens para JPG, PNG, WebP ou AVIF online grátis, em lote e direto no navegador. Suas fotos não são enviadas a nenhum servidor.",
    },
    component: "image/convert",
    related: ["imagem/converter-jpg-para-webp", "imagem/comprimir-imagem", "imagem/redimensionar-imagem"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "converter-jpg-para-webp",
    category: "imagem",
    name: "Converter JPG para WebP",
    h1: "Converter JPG para WebP online",
    description:
      "Transforme fotos JPG em WebP, um formato bem mais leve com a mesma qualidade visual. Converta até 20 imagens de uma vez.",
    keywords: [
      "converter jpg para webp",
      "jpg para webp",
      "transformar jpg em webp",
      "converter imagem para webp",
      "jpg para webp grátis",
    ],
    seo: {
      title: "Converter JPG para WebP online grátis",
      description:
        "Converta JPG para WebP online grátis, em lote e direto no navegador. Arquivos mais leves com a mesma qualidade, ideais para sites e lojas virtuais.",
    },
    component: "image/jpg-to-webp",
    related: ["imagem/comprimir-imagem", "imagem/converter-imagem", "imagem/redimensionar-imagem"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "juntar-pdf",
    category: "pdf",
    name: "Juntar PDF",
    h1: "Juntar PDF online",
    description:
      "Combine vários arquivos PDF em um único documento, na ordem que você escolher. Até 50 arquivos de uma vez.",
    keywords: [
      "juntar pdf",
      "unir pdf",
      "mesclar pdf",
      "juntar pdf online",
      "juntar arquivos pdf",
      "combinar pdf",
      "juntar pdf grátis",
    ],
    seo: {
      title: "Juntar PDF online grátis: unir arquivos PDF em um só",
      description:
        "Junte vários PDFs em um só, online e grátis. Arraste para definir a ordem e baixe na hora. Os arquivos não são enviados: tudo acontece no navegador.",
    },
    component: "pdf/merge",
    related: ["pdf/dividir-pdf", "pdf/organizar-pdf", "pdf/comprimir-pdf"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "dividir-pdf",
    category: "pdf",
    name: "Dividir PDF",
    h1: "Dividir PDF online",
    description:
      "Separe um PDF em vários arquivos: uma página por arquivo, a cada N páginas ou pelos intervalos que você escolher.",
    keywords: [
      "dividir pdf",
      "separar pdf",
      "separar páginas do pdf",
      "dividir pdf online",
      "cortar pdf",
      "dividir pdf em partes",
    ],
    seo: {
      title: "Dividir PDF online grátis: separar páginas em arquivos",
      description:
        "Divida um PDF em vários arquivos online e grátis: por página, a cada N páginas ou por intervalos. Baixe tudo em .zip, sem enviar nada.",
    },
    component: "pdf/split",
    related: ["pdf/extrair-paginas-pdf", "pdf/juntar-pdf", "pdf/remover-paginas-pdf"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "comprimir-pdf",
    category: "pdf",
    name: "Comprimir PDF",
    h1: "Comprimir PDF online",
    description:
      "Reduza o tamanho de arquivos PDF com fotos e documentos digitalizados, mantendo o texto nítido.",
    keywords: [
      "comprimir pdf",
      "reduzir tamanho pdf",
      "diminuir tamanho pdf",
      "compactar pdf",
      "comprimir pdf online",
      "diminuir mb pdf",
    ],
    seo: {
      title: "Comprimir PDF online grátis: reduzir o tamanho do PDF",
      description:
        "Comprima PDFs online grátis e reduza o tamanho em MB para enviar por e-mail ou WhatsApp. Três níveis de compressão, direto no navegador.",
    },
    component: "pdf/compress",
    related: ["pdf/juntar-pdf", "pdf/pdf-para-jpg", "pdf/dividir-pdf"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "pdf-para-jpg",
    category: "pdf",
    name: "PDF para JPG",
    h1: "Converter PDF para JPG",
    description:
      "Transforme cada página de um PDF em uma imagem JPG, em baixa, média ou alta resolução.",
    keywords: [
      "pdf para jpg",
      "converter pdf para jpg",
      "transformar pdf em jpg",
      "pdf em jpg",
      "pdf para jpeg",
      "pdf para foto",
    ],
    seo: {
      title: "PDF para JPG online grátis: converter PDF em imagem JPG",
      description:
        "Converta PDF para JPG online grátis: cada página vira uma imagem, em até 300 DPI. Escolha as páginas e baixe em .zip, sem enviar o arquivo.",
    },
    component: "pdf/to-jpg",
    related: ["pdf/jpg-para-pdf", "pdf/pdf-para-png", "pdf/converter-pdf-em-imagem"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "jpg-para-pdf",
    category: "pdf",
    name: "JPG para PDF",
    h1: "Converter JPG para PDF",
    description:
      "Junte fotos JPG em um único PDF, uma por página, em A4, Carta ou no tamanho da imagem.",
    keywords: [
      "jpg para pdf",
      "converter jpg para pdf",
      "transformar jpg em pdf",
      "foto para pdf",
      "imagem para pdf",
      "juntar fotos em pdf",
    ],
    seo: {
      title: "JPG para PDF online grátis: converter fotos em PDF",
      description:
        "Converta JPG para PDF online grátis: junte várias fotos em um só PDF, escolha a ordem, o tamanho da página e a margem. Sem enviar as fotos.",
    },
    component: "pdf/from-jpg",
    related: ["pdf/pdf-para-jpg", "pdf/png-para-pdf", "pdf/juntar-pdf"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "pdf-para-png",
    category: "pdf",
    name: "PDF para PNG",
    h1: "Converter PDF para PNG",
    description:
      "Transforme as páginas de um PDF em imagens PNG nítidas, sem perda de qualidade.",
    keywords: [
      "pdf para png",
      "converter pdf para png",
      "transformar pdf em png",
      "pdf em png",
    ],
    seo: {
      title: "PDF para PNG online grátis: converter PDF em imagem PNG",
      description:
        "Converta PDF para PNG online grátis, sem perda de qualidade: cada página vira uma imagem em até 300 DPI. Tudo no seu navegador.",
    },
    component: "pdf/to-png",
    related: ["pdf/png-para-pdf", "pdf/pdf-para-jpg", "pdf/converter-pdf-em-imagem"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "png-para-pdf",
    category: "pdf",
    name: "PNG para PDF",
    h1: "Converter PNG para PDF",
    description:
      "Junte imagens PNG, prints e capturas de tela em um único PDF, uma por página.",
    keywords: [
      "png para pdf",
      "converter png para pdf",
      "transformar png em pdf",
      "print para pdf",
      "imagem png em pdf",
    ],
    seo: {
      title: "PNG para PDF online grátis: converter imagens PNG em PDF",
      description:
        "Converta PNG para PDF online grátis: junte prints e imagens em um só PDF, na ordem que quiser, em A4, Carta ou tamanho original.",
    },
    component: "pdf/from-png",
    related: ["pdf/pdf-para-png", "pdf/jpg-para-pdf", "pdf/juntar-pdf"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "pdf-para-texto",
    category: "pdf",
    name: "PDF para texto",
    h1: "Converter PDF para texto",
    description:
      "Extraia todo o texto de um PDF para copiar, editar ou salvar como arquivo .txt.",
    keywords: [
      "pdf para texto",
      "extrair texto de pdf",
      "copiar texto de pdf",
      "pdf para txt",
      "converter pdf em texto",
    ],
    seo: {
      title: "PDF para texto online grátis: extrair texto de PDF",
      description:
        "Extraia o texto de um PDF online grátis: copie com um toque ou baixe em .txt. Funciona com PDFs protegidos, se você tiver a senha.",
    },
    component: "pdf/to-text",
    related: ["pdf/pdf-para-jpg", "pdf/dividir-pdf", "pdf/comprimir-pdf"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "extrair-paginas-pdf",
    category: "pdf",
    name: "Extrair páginas do PDF",
    h1: "Extrair páginas de PDF",
    description:
      "Escolha páginas de um PDF e salve só elas em um novo arquivo, ou uma por arquivo.",
    keywords: [
      "extrair páginas pdf",
      "extrair páginas de pdf",
      "salvar páginas de um pdf",
      "separar páginas pdf",
      "copiar páginas pdf",
    ],
    seo: {
      title: "Extrair páginas de PDF online grátis",
      description:
        "Extraia páginas de um PDF online grátis: toque nas páginas ou digite intervalos (1-3, 5) e baixe um novo PDF só com elas.",
    },
    component: "pdf/extract-pages",
    related: ["pdf/dividir-pdf", "pdf/remover-paginas-pdf", "pdf/organizar-pdf"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "girar-pdf",
    category: "pdf",
    name: "Girar PDF",
    h1: "Girar PDF online",
    description:
      "Gire todas as páginas de um PDF ou só algumas, para a esquerda ou para a direita, e salve.",
    keywords: [
      "girar pdf",
      "rotacionar pdf",
      "virar pdf",
      "girar páginas pdf",
      "girar pdf e salvar",
    ],
    seo: {
      title: "Girar PDF online grátis: rotacionar páginas e salvar",
      description:
        "Gire páginas de PDF online grátis: todas de uma vez ou uma por uma, vendo a prévia. Salve o PDF já na posição certa.",
    },
    component: "pdf/rotate",
    related: ["pdf/organizar-pdf", "pdf/remover-paginas-pdf", "pdf/juntar-pdf"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "organizar-pdf",
    category: "pdf",
    name: "Organizar PDF",
    h1: "Organizar páginas de PDF",
    description:
      "Reordene, gire e exclua páginas de um PDF arrastando miniaturas. Insira páginas de outros PDFs ou em branco.",
    keywords: [
      "organizar pdf",
      "reordenar páginas pdf",
      "mudar ordem das páginas pdf",
      "ordenar pdf",
      "editar páginas pdf",
    ],
    seo: {
      title: "Organizar PDF online grátis: reordenar páginas",
      description:
        "Organize as páginas de um PDF online grátis: arraste para mudar a ordem, gire, exclua e insira páginas. Sem enviar o arquivo.",
    },
    component: "pdf/organize",
    related: ["pdf/girar-pdf", "pdf/remover-paginas-pdf", "pdf/adicionar-paginas-pdf"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "remover-paginas-pdf",
    category: "pdf",
    name: "Remover páginas do PDF",
    h1: "Remover páginas de PDF",
    description:
      "Exclua páginas em branco ou desnecessárias de um PDF e salve o documento sem elas.",
    keywords: [
      "remover páginas pdf",
      "excluir páginas pdf",
      "apagar páginas do pdf",
      "deletar página pdf",
      "tirar página do pdf",
    ],
    seo: {
      title: "Remover páginas de PDF online grátis",
      description:
        "Remova páginas de um PDF online grátis: toque nas páginas que quer excluir e baixe o documento sem elas. Rápido e sem cadastro.",
    },
    component: "pdf/remove-pages",
    related: ["pdf/extrair-paginas-pdf", "pdf/organizar-pdf", "pdf/dividir-pdf"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "adicionar-paginas-pdf",
    category: "pdf",
    name: "Adicionar páginas ao PDF",
    h1: "Adicionar páginas ao PDF",
    description:
      "Insira páginas de outro PDF ou páginas em branco no início, no fim ou depois da página que você escolher.",
    keywords: [
      "adicionar páginas pdf",
      "inserir páginas pdf",
      "adicionar página em branco pdf",
      "colocar página no pdf",
      "inserir pdf em outro pdf",
    ],
    seo: {
      title: "Adicionar páginas ao PDF online grátis",
      description:
        "Adicione páginas a um PDF online grátis: insira páginas de outro PDF ou em branco, onde quiser, e reorganize antes de salvar.",
    },
    component: "pdf/add-pages",
    related: ["pdf/juntar-pdf", "pdf/organizar-pdf", "pdf/remover-paginas-pdf"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "proteger-pdf",
    category: "pdf",
    name: "Proteger PDF com senha",
    h1: "Proteger PDF com senha",
    description:
      "Coloque senha em um PDF com criptografia AES de 256 bits. Só quem tiver a senha consegue abrir.",
    keywords: [
      "proteger pdf com senha",
      "colocar senha em pdf",
      "pdf com senha",
      "criptografar pdf",
      "bloquear pdf",
    ],
    seo: {
      title: "Proteger PDF com senha online grátis",
      description:
        "Coloque senha em PDF online grátis, com criptografia AES de 256 bits. O arquivo é protegido no seu navegador e não é enviado a nenhum servidor.",
    },
    component: "pdf/protect",
    related: ["pdf/desbloquear-pdf", "pdf/comprimir-pdf", "pdf/juntar-pdf"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "desbloquear-pdf",
    category: "pdf",
    name: "Desbloquear PDF",
    h1: "Desbloquear PDF: remover senha",
    description:
      "Remova a senha e as restrições de impressão, cópia e edição de um PDF do qual você sabe a senha.",
    keywords: [
      "desbloquear pdf",
      "remover senha pdf",
      "tirar senha de pdf",
      "desproteger pdf",
      "pdf sem senha",
    ],
    seo: {
      title: "Desbloquear PDF online grátis: remover senha do PDF",
      description:
        "Remova a senha de um PDF online grátis: digite a senha uma vez e baixe uma cópia que abre direto, sem restrições para imprimir ou copiar.",
    },
    component: "pdf/unlock",
    related: ["pdf/proteger-pdf", "pdf/pdf-para-texto", "pdf/juntar-pdf"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "converter-pdf-em-imagem",
    category: "pdf",
    name: "Converter PDF em imagem",
    h1: "Converter PDF em imagem",
    description:
      "Transforme as páginas de um PDF em imagens JPG ou PNG, escolhendo resolução e páginas.",
    keywords: [
      "converter pdf em imagem",
      "pdf para imagem",
      "transformar pdf em imagem",
      "salvar pdf como imagem",
      "pdf em foto",
    ],
    seo: {
      title: "Converter PDF em imagem online grátis (JPG ou PNG)",
      description:
        "Converta PDF em imagem online grátis: escolha JPG ou PNG, a resolução e as páginas. Baixe uma a uma ou todas em .zip.",
    },
    component: "pdf/to-image",
    related: ["pdf/pdf-para-jpg", "pdf/pdf-para-png", "pdf/jpg-para-pdf"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "porcentagem",
    category: "calculadoras",
    name: "Calculadora de porcentagem",
    description: "Calcule porcentagens, aumentos e descontos de forma rápida.",
    keywords: ["calcular porcentagem", "calculadora de porcentagem", "quanto é x% de y"],
    seo: {
      title: "Calculadora de porcentagem online",
      description:
        "Calcule porcentagem online: quanto é X% de Y, aumento, desconto e variação percentual, com o passo a passo da conta.",
    },
    component: "calculator/percentage",
    related: ["pix/gerador-qr-code"],
    updatedAt: "2026-10-05",
  },
  {
    slug: "gerador-qr-code",
    category: "pix",
    name: "Gerador de QR Code Pix",
    description: "Crie um QR Code Pix e um código copia e cola para receber pagamentos.",
    keywords: ["gerar qr code pix", "qr code pix grátis", "pix copia e cola"],
    seo: {
      title: "Gerador de QR Code Pix grátis",
      description:
        "Gere QR Code Pix estático e código copia e cola grátis, com valor e descrição opcionais. Sem cadastro e sem taxas.",
    },
    component: "pix/qr-code",
    related: ["calculadoras/porcentagem"],
    updatedAt: "2026-10-05",
  },
];

const toolMap = new Map(tools.map((tool) => [`${tool.category}/${tool.slug}`, tool]));

export function getTool(category: string, slug: string): Tool | undefined {
  return toolMap.get(`${category}/${slug}`);
}

/** Parâmetros estáticos de `/ferramentas/[category]/[tool]` (página e imagem OG). */
export function getToolParams(): Array<{ category: string; tool: string }> {
  return tools.map((tool) => ({ category: tool.category, tool: tool.slug }));
}

export function getToolsByCategory(category: Category["slug"]): Tool[] {
  return tools.filter((tool) => tool.category === category);
}

/** Relacionadas declaradas primeiro, completadas com outras da mesma categoria. */
export function getRelatedTools(tool: Tool, limit = MAX_RELATED_TOOLS): Tool[] {
  const declared = tool.related
    .map((ref: ToolRef) => toolMap.get(ref))
    .filter((related): related is Tool => related !== undefined);
  const sameCategory = getToolsByCategory(tool.category).filter(
    (candidate) => candidate !== tool && !declared.includes(candidate),
  );
  return [...declared, ...sameCategory].slice(0, limit);
}
