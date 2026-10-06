import { Container } from "@/components/layout/Container";
import { FaqList } from "@/components/ui/FaqList";
import { JsonLd } from "@/components/ui/JsonLd";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import type { PageContent } from "@/lib/content";
import { faqJsonLd, toolJsonLd } from "@/lib/seo/json-ld";
import { toolPath } from "@/lib/routes";
import type { Category } from "@/types/category";
import type { Tool } from "@/types/tool";
import { RelatedTools } from "./RelatedTools";
import { ToolHeader } from "./ToolHeader";
import { ToolWidget } from "./ToolWidget";

interface ToolShellProps {
  tool: Tool;
  category: Category;
  content: PageContent | null;
  related: Tool[];
}

/** Estrutura comum a toda página de ferramenta. */
export function ToolShell({ tool, category, content, related }: ToolShellProps) {
  const path = toolPath(tool);
  const hasFaq = content !== null && content.faq.length > 0;
  const structuredData = [toolJsonLd(tool, path)];
  if (hasFaq) structuredData.push(faqJsonLd(content.faq));

  return (
    <Container className="pt-3 text-md-on-surface sm:pt-6">
      <ToolHeader tool={tool} category={category} />

      <section
        aria-label={`Usar ${tool.name}`}
        className="mt-3 rounded-m-md border border-md-outline-variant bg-md-surface-lowest p-3 sm:mt-4 sm:p-6"
      >
        <ToolWidget component={tool.component} />
      </section>

      {content && (
        <div className="mt-14 grid gap-12 sm:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
          <MarkdownContent html={hasFaq ? content.introHtml : content.html} className="text-md-on-surface-variant" />
          {hasFaq && (
            <div className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
              <FaqList id="faq" items={content.faq} />
            </div>
          )}
        </div>
      )}

      <RelatedTools tools={related} />
      <JsonLd data={structuredData} />
    </Container>
  );
}
