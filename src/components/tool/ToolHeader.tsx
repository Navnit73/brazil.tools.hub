import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Icon } from "@/components/ui/Icon";
import { buildBreadcrumbs } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";
import type { Tool } from "@/types/tool";
import { categoryVisuals } from "./categoryVisuals";

interface ToolHeaderProps {
  tool: Tool;
  category: Category;
}

const highlights = ["Grátis", "Sem cadastro", "Funciona no celular"];

/** Cabeçalho tonal da página de ferramenta (mesma linguagem do hero da home): trilha, ícone, `<h1>` e selos. */
export function ToolHeader({ tool, category }: ToolHeaderProps) {
  const visual = categoryVisuals[tool.category];

  return (
    <header className="relative isolate overflow-hidden rounded-m-xl bg-md-primary-container px-5 py-6 text-md-on-primary-container sm:px-8 sm:py-8 lg:px-10">
      <div aria-hidden="true" className="absolute -right-16 -top-24 -z-10 size-64 rotate-12 rounded-m-sm bg-primary/10 sm:size-80" />

      <Breadcrumbs items={buildBreadcrumbs({ category, tool })} />

      <div className="mt-4 flex items-start gap-5 sm:mt-5">
        {/* No celular o ícone some para a ferramenta aparecer mais cedo na tela. */}
        <span aria-hidden="true" className={cn("hidden size-14 shrink-0 place-items-center rounded-m-lg sm:grid", visual.tone)}>
          <Icon name={visual.icon} className="size-7" />
        </span>
        <div className="min-w-0 max-w-3xl">
          <h1 className="font-display text-[1.75rem] font-normal leading-tight text-balance sm:text-4xl">{tool.h1 ?? tool.name}</h1>
          <p className="mt-2 text-base leading-relaxed opacity-80 sm:text-lg">{tool.description}</p>
          <ul className="mt-4 flex flex-wrap gap-2 text-xs font-medium sm:text-sm">
            {highlights.map((label) => (
              <li key={label} className="inline-flex h-8 items-center gap-1.5 rounded-m-sm bg-md-surface-lowest/60 px-3">
                <Icon name="check" className="size-4 text-primary" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
