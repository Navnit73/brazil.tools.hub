import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  /** HTML gerado a partir de arquivos markdown do repositório (conteúdo confiável). */
  html: string;
  className?: string;
}

export function MarkdownContent({ html, className }: MarkdownContentProps) {
  return <div className={cn("content-prose", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
