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
      "reduzir foto",
    ],
    seo: {
      title: "Redimensionar imagem e foto online grátis",
      description:
        "Redimensione imagens e fotos online grátis: mude largura e altura em pixels ou %, mantendo a proporção. JPG, PNG e WebP, sem enviar nada. Experimente!",
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
      title: "Comprimir imagem online grátis e reduzir o peso",
      description:
        "Comprima imagens online grátis e reduza o peso em KB sem perder qualidade visível. JPG, PNG e WebP, até 20 fotos de uma vez. Experimente agora!",
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
      title: "Editor de imagem online grátis: cortar e girar",
      description:
        "Edite fotos online grátis: corte, gire, espelhe, redimensione e ajuste brilho, contraste e saturação. Sem cadastro e sem enviar a imagem. Comece já!",
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
    keywords: ["converter imagem", "converter png para jpg", "converter webp para jpg", "converter para avif", "foto para jpg"],
    seo: {
      title: "Converter imagem online: JPG, PNG, WebP e AVIF",
      description:
        "Converta imagens para JPG, PNG, WebP ou AVIF online grátis, em lote e direto no navegador. Suas fotos não são enviadas a nenhum servidor. Converta já!",
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
      title: "Converter JPG para WebP online grátis e em lote",
      description:
        "Converta JPG para WebP online grátis, em lote e direto no navegador. Arquivos mais leves com a mesma qualidade, ideais para sites e lojas virtuais.",
    },
    component: "image/jpg-to-webp",
    related: ["imagem/comprimir-imagem", "imagem/converter-imagem", "imagem/redimensionar-imagem"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "foto-para-oab",
    category: "imagem",
    name: "Foto para OAB",
    h1: "Foto 3x4 para a carteira da OAB",
    description:
      "Recorte sua foto no tamanho 3x4 para a carteira da OAB, com guia do rosto, e baixe em JPG pronta para enviar à seccional.",
    keywords: [
      "foto para oab",
      "foto oab",
      "foto 3x4 oab",
      "foto carteira oab",
      "foto para carteira da oab",
      "foto da carteira da oab",
      "foto 3x4 para carteira da oab",
      "foto advogado oab",
    ],
    seo: {
      title: "Foto 3x4 para OAB online grátis: carteira da OAB",
      description:
        "Faça a foto 3x4 para a carteira da OAB online e grátis: enquadre o rosto com o guia, ajuste as cores e baixe em JPG. Sem cadastro e sem enviar a foto.",
    },
    component: "image/photo-oab",
    related: ["imagem/enem-foto", "imagem/redimensionar-imagem", "imagem/comprimir-imagem"],
    updatedAt: "2026-10-17",
  },
  {
    slug: "enem-foto",
    category: "imagem",
    name: "Foto para o ENEM",
    h1: "Foto para o ENEM: inscrição online",
    description:
      "Recorte sua foto no padrão de documento para a inscrição do ENEM, vestibulares e concursos, com guia do rosto, e baixe em JPG.",
    keywords: [
      "enem foto",
      "foto do enem",
      "foto para enem",
      "foto para o enem",
      "foto pro enem",
      "foto 3x4 para enem",
      "foto para vestibular",
      "foto para inscrição online",
      "foto para concurso público",
    ],
    seo: {
      title: "Foto para o ENEM online grátis: foto da inscrição",
      description:
        "Prepare a foto do ENEM online e grátis: enquadre o rosto e os ombros com o guia, ajuste o brilho e baixe em JPG. Serve também para vestibular e concurso.",
    },
    component: "image/photo-enem",
    related: ["imagem/foto-para-oab", "imagem/redimensionar-imagem", "imagem/comprimir-imagem"],
    updatedAt: "2026-10-17",
  },
  {
    slug: "foto-3x4-online",
    category: "imagem",
    name: "Foto 3x4 online",
    h1: "Foto 3x4 online grátis com fundo branco",
    description:
      "Recorte sua foto no tamanho 3x4, deixe o fundo branco com IA e baixe em JPG ou na folha 10x15 com 9 fotos para imprimir.",
    keywords: [
      "foto 3x4 online",
      "foto 3x4 online grátis",
      "foto 3x4 online fundo branco grátis",
      "foto 3x4 gratuito online",
      "3x4 online",
      "foto 3 4 online",
      "site foto 3x4",
      "imprimir foto 3x4",
    ],
    seo: {
      title: "Foto 3x4 online grátis com fundo branco",
      description:
        "Faça foto 3x4 online grátis: enquadre o rosto, deixe o fundo branco com IA e baixe em JPG ou na folha 10x15 para imprimir. Sem marca-d'água e sem cadastro.",
    },
    component: "image/photo-3x4",
    related: ["imagem/fundo-transparente", "imagem/foto-para-oab", "imagem/enem-foto"],
    updatedAt: "2026-10-17",
  },
  {
    slug: "fundo-transparente",
    category: "imagem",
    name: "Fundo transparente",
    h1: "Fundo transparente online: remover fundo da imagem",
    description:
      "Remova o fundo de fotos com IA ou tire uma cor de fundo sólida de logos e produtos. Baixe em PNG transparente ou com fundo branco.",
    keywords: [
      "fundo transparente online",
      "fundo transparente online grátis",
      "remover fundo da imagem",
      "tirar fundo de foto",
      "png fundo transparente",
      "fundo branco foto online",
      "fundo branco para fotos online",
    ],
    seo: {
      title: "Fundo transparente online grátis: remover fundo",
      description:
        "Deixe o fundo transparente online e grátis: IA para fotos de pessoas e remoção por cor para logos. Baixe em PNG ou com fundo branco, sem enviar nada.",
    },
    component: "image/remove-background",
    related: ["imagem/foto-3x4-online", "imagem/converter-imagem", "imagem/comprimir-imagem"],
    updatedAt: "2026-10-17",
  },
  {
    slug: "melhorar-qualidade-foto",
    category: "imagem",
    name: "Melhorar qualidade da foto",
    h1: "Melhorar a qualidade da foto online",
    description:
      "Aumente a nitidez, corrija contraste e cores, reduza o ruído e amplie fotos em 2× ou 4×, com prévia antes e depois.",
    keywords: [
      "melhorar qualidade da foto",
      "melhor resolução de imagem online",
      "site que melhora a qualidade da foto",
      "site que melhora a qualidade da imagem",
      "nitidez foto online",
      "desborrar imagem online",
      "melhorar imagem online",
      "remasterizar foto online",
    ],
    seo: {
      title: "Melhorar qualidade da foto online grátis e nitidez",
      description:
        "Melhore a qualidade da foto online grátis: mais nitidez, contraste e cores corrigidos, menos ruído e resolução 2× ou 4×. Sem cadastro e sem enviar a foto.",
    },
    component: "image/enhance",
    related: ["imagem/redimensionar-imagem", "imagem/editor-de-imagem", "imagem/comprimir-imagem"],
    updatedAt: "2026-10-17",
  },
  {
    slug: "foto-em-desenho",
    category: "imagem",
    name: "Foto em desenho",
    h1: "Transformar foto em desenho online",
    description:
      "Transforme fotos em desenho a lápis, lápis colorido, desenho para colorir ou cartoon, com prévia na hora e download em JPG ou PNG.",
    keywords: [
      "foto em desenho online",
      "transformar foto em desenho",
      "foto para desenho online",
      "foto desenho online",
      "foto em desenho para colorir",
      "foto em desenho a lápis",
      "foto em cartoon",
    ],
    seo: {
      title: "Foto em desenho online grátis: lápis e para colorir",
      description:
        "Transforme foto em desenho online grátis: lápis, lápis colorido, desenho para colorir ou cartoon. Prévia na hora, sem cadastro e sem enviar a foto.",
    },
    component: "image/sketch",
    related: ["imagem/foto-polaroid", "imagem/editor-de-imagem", "imagem/redimensionar-imagem"],
    updatedAt: "2026-10-17",
  },
  {
    slug: "marca-dagua",
    category: "imagem",
    name: "Marca d'água",
    h1: "Colocar marca d'água em foto online",
    description:
      "Adicione texto ou logo como marca d'água em fotos e documentos, com posição, opacidade e mosaico. Até 20 imagens de uma vez.",
    keywords: [
      "marca d'água online",
      "marca d'água online grátis",
      "colocar marca d'água em foto",
      "marca d'água em imagem",
      "marca d'água em documento",
      "marca d'água com logo",
      "colocar marca d'água em várias fotos",
    ],
    seo: {
      title: "Marca d'água online grátis: texto ou logo em fotos",
      description:
        "Coloque marca d'água em fotos e documentos online grátis: texto ou logo, opacidade, posição e mosaico. Até 20 imagens, sem enviar nada. Experimente!",
    },
    component: "image/watermark",
    related: ["imagem/comprimir-imagem", "imagem/editor-de-imagem", "imagem/redimensionar-imagem"],
    updatedAt: "2026-10-17",
  },
  {
    slug: "foto-polaroid",
    category: "imagem",
    name: "Foto polaroid",
    h1: "Foto polaroid online: moldura e legenda",
    description:
      "Transforme fotos em polaroids com moldura, legenda manuscrita e efeito vintage, no tamanho real para imprimir em folha A4.",
    keywords: [
      "foto polaroid online",
      "fazer foto polaroid",
      "polaroid fotos online",
      "foto estilo polaroid",
      "imprimir fotos polaroid",
      "moldura polaroid",
    ],
    seo: {
      title: "Foto polaroid online grátis: moldura e legenda",
      description:
        "Faça foto polaroid online grátis: moldura clássica, Instax Square ou Mini, legenda manuscrita e efeito vintage. Imprima várias em A4. Sem cadastro.",
    },
    component: "image/polaroid",
    related: ["imagem/foto-em-desenho", "imagem/foto-3x4-online", "imagem/editor-de-imagem"],
    updatedAt: "2026-10-17",
  },
  {
    // Uma página para quadro branco, lousa e "desenhar online" (mesma intenção: uma tela para desenhar).
    slug: "quadro-branco-online",
    category: "imagem",
    name: "Quadro branco online",
    h1: "Quadro branco online grátis para desenhar",
    description:
      "Desenhe, escreva e explique em um quadro branco ou lousa online com formas, setas, texto, ícones, imagens e tela cheia. Exporte em PNG ou SVG.",
    keywords: [
      "quadro branco online",
      "lousa online",
      "quadro de desenho online",
      "desenhar online grátis",
      "quadro para desenhar online",
      "quadro branco virtual",
      "lousa digital online",
      "tela branca para desenhar",
      "folha branca online",
      "rabiscar online",
    ],
    seo: {
      title: "Quadro branco online grátis: lousa para desenhar",
      description:
        "Quadro branco online grátis: desenhe com caneta, formas, setas, texto e mais de 100 ícones, use lousa ou quadriculado em tela cheia e exporte em PNG.",
    },
    component: "image/whiteboard",
    related: ["imagem/foto-em-desenho", "imagem/editor-de-imagem", "imagem/marca-dagua"],
    updatedAt: "2026-10-17",
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
      title: "Juntar PDF online grátis: unir arquivos em um só",
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
      title: "Dividir PDF online grátis: separar páginas",
      description:
        "Divida um PDF em vários arquivos online e grátis: por página, a cada N páginas ou por intervalos. Baixe tudo em .zip, sem enviar nada. Experimente!",
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
      title: "Comprimir PDF online grátis: reduzir o tamanho",
      description:
        "Comprima PDFs online grátis e reduza o tamanho em MB para enviar por e-mail ou WhatsApp. Três níveis de compressão, direto no navegador. Comece agora!",
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
      title: "PDF para JPG online grátis: converter em imagem",
      description:
        "Converta PDF para JPG online grátis: cada página vira uma imagem de até 300 DPI. Escolha as páginas e baixe em .zip, sem enviar o arquivo. Experimente!",
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
      title: "JPG para PDF online grátis: fotos em um só PDF",
      description:
        "Converta JPG para PDF online grátis: junte várias fotos em um só PDF e escolha a ordem, o tamanho da página e a margem. Sem enviar as fotos. Comece já!",
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
      title: "PDF para PNG online grátis: converter em imagem",
      description:
        "Converta PDF para PNG online grátis e sem perda de qualidade: cada página vira uma imagem de até 300 DPI. Tudo no seu navegador. Experimente agora!",
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
      title: "PNG para PDF online grátis: prints em um só PDF",
      description:
        "Converta PNG para PDF online grátis: junte prints e imagens em um só PDF, na ordem que quiser, em A4, Carta ou tamanho original. Experimente agora!",
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
      title: "PDF para texto online grátis: extrair o texto",
      description:
        "Extraia o texto de um PDF online grátis: copie com um toque ou baixe em .txt. Funciona até com PDF protegido, se você tiver a senha. Experimente!",
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
      title: "Extrair páginas de PDF online grátis e rápido",
      description:
        "Extraia páginas de um PDF online grátis: toque nas páginas ou digite intervalos (1-3, 5) e baixe um novo PDF só com elas. Sem cadastro, experimente!",
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
      title: "Girar PDF online grátis: rotacionar páginas",
      description:
        "Gire páginas de PDF online grátis: todas de uma vez ou uma por uma, vendo a prévia. Salve o PDF já na posição certa, sem enviar o arquivo. Experimente!",
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
        "Organize as páginas de um PDF online grátis: arraste para mudar a ordem, gire, exclua e insira páginas. Sem cadastro e sem enviar o arquivo. Comece já!",
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
      title: "Excluir e remover páginas de PDF online grátis",
      description:
        "Remova páginas de um PDF online grátis: toque nas páginas que quer excluir e baixe o documento sem elas. Rápido, sem cadastro e sem enviar nada. Experimente!",
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
        "Adicione páginas a um PDF online grátis: insira páginas de outro PDF ou em branco, onde quiser, e reorganize antes de salvar. Sem enviar nada. Comece já!",
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
      title: "Proteger PDF com senha online grátis (AES-256)",
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
      title: "Desbloquear PDF online grátis: remover a senha",
      description:
        "Remova a senha de um PDF online grátis: digite a senha uma vez e baixe uma cópia que abre direto, sem restrições para imprimir ou copiar. Experimente!",
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
      title: "Converter PDF em imagem JPG ou PNG online grátis",
      description:
        "Converta PDF em imagem online grátis: escolha JPG ou PNG, a resolução e as páginas. Baixe uma a uma ou todas em .zip, sem enviar o arquivo. Experimente!",
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
      title: "Calculadora de porcentagem online grátis",
      description:
        "Calcule porcentagem online grátis: quanto é X% de Y, quanto X representa de Y e a variação percentual, com o passo a passo da conta. Sem cadastro.",
    },
    component: "calculator/percentage",
    // Interface pronta, cálculo ainda não implementado: fora do índice até funcionar.
    comingSoon: true,
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
      title: "Gerador de QR Code Pix grátis e copia e cola",
      description:
        "Gere QR Code Pix estático e código Pix copia e cola grátis, com valor opcional, para receber pagamentos. Sem cadastro, sem taxas e sem instalar nada.",
    },
    component: "pix/qr-code",
    // Interface pronta, cálculo ainda não implementado: fora do índice até funcionar.
    comingSoon: true,
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

/** Ferramentas que já funcionam: as únicas indexáveis (sitemap, `index`, JSON-LD de aplicativo). */
export function isToolLive(tool: Tool): boolean {
  return !tool.comingSoon;
}

/** Uma categoria só é indexável quando tem ao menos uma ferramenta funcionando. */
export function getLiveToolsByCategory(category: Category["slug"]): Tool[] {
  return getToolsByCategory(category).filter(isToolLive);
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
