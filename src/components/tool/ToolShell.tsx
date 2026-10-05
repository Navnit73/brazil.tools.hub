import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import type { PageContent } from "@/lib/content";
import { faqJsonLd, toolJsonLd } from "@/lib/seo/json-ld";
import { buildBreadcrumbs, toolPath } from "@/lib/routes";
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
  const structuredData = [toolJsonLd(tool, path)];
  if (content && content.faq.length > 0) structuredData.push(faqJsonLd(content.faq));

  return (
    <Container className="py-6 sm:py-8">
      <Breadcrumbs items={buildBreadcrumbs({ category, tool })} />
      <div className="mt-4">
        <ToolHeader tool={tool} />
      </div>

      <section aria-label={`Usar ${tool.name}`} className="mt-6 rounded-sm border border-border bg-background p-4 sm:p-6">
        <ToolWidget component={tool.component} />
      </section>

      {content && <MarkdownContent html={content.html} className="mt-10" />}

      <RelatedTools tools={related} />
      <JsonLd data={structuredData} />
    </Container>
  );
}
