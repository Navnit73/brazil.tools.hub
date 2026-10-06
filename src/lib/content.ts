import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { Lexer, Parser, type Links, type Token } from "marked";

const CONTENT_DIR = path.join(process.cwd(), "src", "content");
const FAQ_HEADING = /^perguntas frequentes$/i;

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PageContent {
  html: string;
  /** HTML até (sem incluir) a seção `## Perguntas frequentes` — útil para renderizar o FAQ à parte. */
  introHtml: string;
  faq: FaqItem[];
}

function toHtml(tokens: Token[], links: Links): string {
  return Parser.parse(Object.assign(tokens, { links }));
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

/** Extrai perguntas `###` da seção `## Perguntas frequentes` para o schema FAQPage. */
function findFaqStart(tokens: Token[]): number {
  return tokens.findIndex((token) => token.type === "heading" && token.depth === 2 && FAQ_HEADING.test(token.text.trim()));
}

function extractFaq(tokens: Token[], links: Links): FaqItem[] {
  const start = findFaqStart(tokens);
  if (start === -1) return [];

  const faq: FaqItem[] = [];
  let current: { question: string; body: Token[] } | null = null;
  const flush = () => {
    if (current) faq.push({ question: current.question, answer: stripTags(toHtml(current.body, links)) });
  };

  for (const token of tokens.slice(start + 1)) {
    if (token.type === "heading" && token.depth <= 2) break;
    if (token.type === "heading" && token.depth === 3) {
      flush();
      current = { question: token.text.trim(), body: [] };
    } else if (current) {
      current.body.push(token);
    }
  }
  flush();
  return faq.filter((item) => item.answer.length > 0);
}

/**
 * Lê `src/content/<relativePath>.md`. O `<h1>` vem sempre da página,
 * então títulos `#` no markdown são rebaixados para `##`.
 */
export const getPageContent = cache(async (relativePath: string): Promise<PageContent | null> => {
  let source: string;
  try {
    source = await readFile(path.join(CONTENT_DIR, `${relativePath}.md`), "utf8");
  } catch {
    return null;
  }

  const tokens = Lexer.lex(source);
  for (const token of tokens) {
    if (token.type === "heading" && token.depth === 1) {
      token.depth = 2;
    }
  }

  const faqStart = findFaqStart(tokens);
  return {
    html: toHtml([...tokens], tokens.links),
    introHtml: toHtml(faqStart === -1 ? [...tokens] : tokens.slice(0, faqStart), tokens.links),
    faq: extractFaq(tokens, tokens.links),
  };
});
