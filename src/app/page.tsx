import type { Metadata } from "next";
import Link from "next/link";
import { HeroPreview } from "@/components/home/HeroPreview";
import { Container } from "@/components/layout/Container";
import { CategoryCard } from "@/components/tool/CategoryCard";
import { categoryVisuals } from "@/components/tool/categoryVisuals";
import { SearchTools } from "@/components/tool/SearchTools";
import { ToolGrid } from "@/components/tool/ToolGrid";
import { FaqList } from "@/components/ui/FaqList";
import { Icon, type IconName } from "@/components/ui/Icon";
import { JsonLd } from "@/components/ui/JsonLd";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { seoConfig } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { categories } from "@/data/categories";
import { getToolsByCategory, tools } from "@/data/tools";
import { TOOLS_BASE_PATH } from "@/lib/constants";
import { getPageContent } from "@/lib/content";
import { categoryPath, toolPath } from "@/lib/routes";
import { getSearchItems } from "@/lib/search";
import { buildMetadata } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/json-ld";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  ...buildMetadata({ title: seoConfig.defaultTitle, description: siteConfig.description, path: "/" }),
  // Na home o título não usa o template "%s | Nome".
  title: { absolute: seoConfig.defaultTitle },
};

const steps: Array<{ icon: IconName; title: string; description: string }> = [
  { icon: "search", title: "Escolha a ferramenta", description: "Busque pelo nome ou navegue pelas categorias." },
  { icon: "zap", title: "Envie ou digite", description: "Arraste seus arquivos ou preencha os campos. Sem cadastro." },
  { icon: "check", title: "Pronto!", description: "Baixe ou copie o resultado em segundos." },
];

/** Cada benefício usa um papel tonal diferente do Material 3. */
const benefits: Array<{ icon: IconName; title: string; description: string; tone: string }> = [
  {
    icon: "shield",
    title: "Privacidade em primeiro lugar",
    tone: "bg-md-primary-container text-md-on-primary-container",
    description: "Sempre que possível, seus arquivos são processados no próprio navegador e nunca saem do seu aparelho.",
  },
  {
    icon: "zap",
    title: "Rápido de verdade",
    tone: "bg-md-tertiary-container text-md-on-tertiary-container",
    description: "Sem filas, sem e-mail de confirmação e sem etapas desnecessárias. Abriu, usou, pronto.",
  },
  {
    icon: "smartphone",
    title: "Funciona em qualquer tela",
    tone: "bg-md-secondary-container text-md-on-secondary-container",
    description: "Computador, tablet ou celular: as ferramentas se adaptam ao seu dispositivo sem instalar nada.",
  },
  {
    icon: "gift",
    title: "Gratuito e sem cadastro",
    tone: "bg-md-surface-high text-md-on-surface",
    description: "Use quantas vezes quiser, sem criar conta e sem pagar nada.",
  },
];

/** Atalhos exibidos sob a busca do hero. */
const quickLinks = tools.slice(0, 4);

export default async function HomePage() {
  const content = await getPageContent("pages/home");

  // Categoria com mais ferramentas ganha o card de destaque do bento.
  const [featured, ...otherCategories] = [...categories].sort(
    (a, b) => getToolsByCategory(b.slug).length - getToolsByCategory(a.slug).length,
  );
  const featuredTools = getToolsByCategory(featured.slug);
  const featuredVisual = categoryVisuals[featured.slug];

  return (
    <div className="text-md-on-surface">
      {/* Hero */}
      <section className="pt-3 sm:pt-6">
        {/* Mais largo que o Container padrão para o hero ganhar destaque em telas grandes. */}
        <div className="mx-auto w-full max-w-[88rem] px-4 sm:px-6">
          <div className="relative isolate overflow-hidden rounded-m-xl bg-md-primary-container px-5 py-10 text-md-on-primary-container sm:px-10 sm:py-14 lg:px-16 lg:py-20 xl:px-20">
            {/* Formas do Material 3 (sólidas, sem desfoque). */}
            <div aria-hidden="true" className="absolute inset-0 -z-10">
              <div className="absolute -right-24 -top-24 size-80 rotate-12 rounded-m-sm bg-primary/10 sm:size-[26rem]" />
              <div className="absolute -bottom-20 -left-16 size-56 rotate-12 rounded-m-sm bg-md-tertiary-container/70 sm:size-72" />
            </div>

            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12 xl:gap-20">
              <div className="text-center lg:text-left">
                <p className="inline-flex h-8 items-center gap-2 rounded-m-sm bg-md-surface-lowest/70 pl-1 pr-3 text-xs font-medium sm:text-sm">
                  <span className="inline-flex h-6 items-center rounded-m-xs bg-primary px-2 text-[11px] font-medium text-on-primary">
                    Novo
                  </span>
                  Editor de imagem completo no navegador
                </p>

                <h1 className="mt-6 font-display text-[2.25rem] font-normal leading-[2.75rem] tracking-[-0.02em] text-balance sm:text-5xl sm:leading-[3.5rem] lg:text-[3.5rem] lg:leading-[4rem]">
                  Ferramentas de PDF e imagem <span className="font-medium text-primary-dark">online e grátis</span>
                </h1>
                <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-pretty opacity-80 sm:text-lg lg:mx-0">
                  Junte, divida, comprima e converta PDFs e imagens direto no navegador. Rápido, simples e sem cadastro.
                </p>

                <div className="mt-8 flex justify-center lg:justify-start">
                  <SearchTools items={getSearchItems()} size="hero" />
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm lg:justify-start">
                  <span className="w-full opacity-80 sm:w-auto">Populares:</span>
                  {quickLinks.map((tool) => (
                    <Link
                      key={`${tool.category}/${tool.slug}`}
                      href={toolPath(tool)}
                      className="state-layer inline-flex h-12 items-center rounded-m-sm border border-md-on-primary-container/25 bg-md-surface-lowest/50 px-4 font-medium"
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>

                <dl className="mt-8 grid grid-cols-3 gap-2 sm:mt-10 sm:flex sm:flex-wrap sm:justify-center sm:gap-3 lg:justify-start">
                  {[
                    { value: String(tools.length), label: "ferramentas" },
                    { value: String(categories.length), label: "categorias" },
                    { value: "100%", label: "grátis" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="flex flex-col items-center rounded-m-lg bg-md-surface-lowest/60 px-3 py-3 sm:flex-row sm:items-baseline sm:gap-2 sm:px-5"
                    >
                      <dd className="font-display text-2xl font-medium">{stat.value}</dd>
                      <dt className="text-xs opacity-80 sm:text-sm">{stat.label}</dt>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="hidden sm:block">
                <HeroPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section aria-labelledby="categorias">
        <Container className="py-14 sm:py-20">
          <SectionHeading
            id="categorias"
            eyebrow="Explore"
            title="Tudo o que você precisa, em um só lugar"
            description="Ferramentas organizadas por tipo de tarefa para você encontrar a certa em segundos."
          />

          <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            <li className="sm:col-span-2 lg:row-span-2">
              <article className="relative flex h-full min-h-72 cursor-pointer flex-col overflow-hidden rounded-m-xl bg-primary p-6 text-on-primary sm:min-h-80 sm:p-8">
                <div aria-hidden="true" className="absolute -bottom-24 -right-20 size-72 rotate-12 rounded-m-sm bg-white/10" />
                <div aria-hidden="true" className="absolute -right-6 top-10 size-28 rotate-12 rounded-m-sm bg-white/10" />
                <span aria-hidden="true" className="relative grid size-14 place-items-center rounded-m-lg bg-md-primary-container text-md-on-primary-container">
                  <Icon name={featuredVisual.icon} className="size-7" />
                </span>
                <p className="relative mt-6 text-sm font-medium">Destaque</p>
                <h3 className="relative mt-1 font-display text-[1.75rem] font-normal leading-tight sm:text-[2rem]">
                  <Link href={categoryPath(featured.slug)} className="after:absolute after:inset-0">
                    {featured.name}
                  </Link>
                </h3>
                <p className="relative mt-2 max-w-md">{featured.description}</p>
                {/* A lista fica acima do link estendido, mas deixa os vãos entre os chips clicáveis para o card. */}
                <ul className="pointer-events-none relative z-10 mt-auto flex flex-wrap gap-2 pt-8">
                  {featuredTools.map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        href={toolPath(tool)}
                        className="state-layer pointer-events-auto inline-flex h-12 items-center gap-1.5 rounded-m-sm border border-white/40 px-4 text-sm font-medium"
                      >
                        {tool.name}
                        <Icon name="arrowRight" className="size-3.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            </li>

            {otherCategories.map((category) => (
              <li key={category.slug}>
                <CategoryCard category={category} toolCount={getToolsByCategory(category.slug).length} headingLevel="h3" />
              </li>
            ))}

            <li className="sm:col-span-2">
              <Link
                href={TOOLS_BASE_PATH}
                className="flex h-full min-h-36 items-center justify-between gap-4 rounded-m-xl bg-md-tertiary-container p-6 text-md-on-tertiary-container"
              >
                <span>
                  <span className="block font-display text-xl font-medium">Ver todas as ferramentas</span>
                  <span className="mt-1 block text-sm opacity-80">Navegue pelo catálogo completo</span>
                </span>
                {/* Estilo FAB do Material 3. */}
                <span
                  aria-hidden="true"
                  className="grid size-14 shrink-0 place-items-center rounded-m-lg bg-md-surface-lowest shadow-m2"
                >
                  <Icon name="arrowRight" className="size-6" />
                </span>
              </Link>
            </li>
          </ul>
        </Container>
      </section>

      {/* Populares */}
      <section aria-labelledby="populares">
        <Container className="pb-14 sm:pb-20">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              id="populares"
              eyebrow="Mais usadas"
              title="Ferramentas populares"
              description="As favoritas de quem passa por aqui."
            />
            <Link
              href={TOOLS_BASE_PATH}
              className="state-layer inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-m-sm border border-md-outline px-6 text-sm font-medium text-primary sm:self-auto"
            >
              Ver todas
              <Icon name="arrowRight" className="size-4" />
            </Link>
          </div>
          <div className="mt-8 sm:mt-10">
            <ToolGrid tools={tools.slice(0, 6)} headingLevel="h3" showCategory />
          </div>
        </Container>
      </section>

      {/* Como funciona */}
      <section aria-labelledby="como-funciona">
        <Container>
          <div className="rounded-m-xl bg-md-surface-container px-5 py-12 sm:px-10 sm:py-16">
            <SectionHeading id="como-funciona" eyebrow="Como funciona" title="Três passos. Nenhuma complicação." centered />
            <ol className="mt-10 grid gap-3 sm:gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4 rounded-m-lg bg-md-surface-lowest p-5 shadow-m1 md:flex-col sm:p-6">
                  <span
                    aria-hidden="true"
                    className="grid size-12 shrink-0 place-items-center rounded-m-sm bg-md-primary-container text-md-on-primary-container"
                  >
                    <Icon name={step.icon} className="size-6" />
                  </span>
                  <div>
                    <p className="text-xs font-medium tracking-[0.5px] text-primary">Passo {index + 1}</p>
                    <h3 className="mt-1 font-display text-lg font-medium">{step.title}</h3>
                    <p className="mt-1 text-sm text-md-on-surface-variant">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* Benefícios */}
      <section aria-labelledby="por-que">
        <Container className="py-14 sm:py-20">
          <SectionHeading
            id="por-que"
            eyebrow="Por que usar"
            title="Feito para ser simples, rápido e seguro"
            description={`O ${siteConfig.name} resolve tarefas comuns sem complicação e sem pedir nada em troca.`}
          />
          <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <li key={benefit.title} className={cn("rounded-m-xl p-6", benefit.tone)}>
                <span aria-hidden="true" className="grid size-12 place-items-center rounded-m-lg bg-md-surface-lowest/70">
                  <Icon name={benefit.icon} className="size-6" />
                </span>
                <h3 className="mt-5 font-display text-lg font-medium">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed opacity-80">{benefit.description}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {content && (
        <Container className="grid gap-10 pb-14 sm:pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
          <div>
            <p className="text-sm font-medium text-primary">Sobre</p>
            <MarkdownContent
              html={content.introHtml}
              className="mt-2 text-md-on-surface-variant [&>h2:first-child]:mt-0 [&>h2]:font-display [&>h2]:text-[1.75rem] [&>h2]:font-normal [&>h2]:leading-tight [&>h2]:text-md-on-surface sm:[&>h2]:text-[2rem]"
            />
          </div>

          {content.faq.length > 0 && (
            <div className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
              <FaqList id="faq" items={content.faq} />
            </div>
          )}
        </Container>
      )}

      {/* CTA */}
      <Container className="pb-4">
        <div className="relative isolate overflow-hidden rounded-m-xl bg-md-inverse-surface px-6 py-12 text-center text-md-inverse-on-surface sm:px-12 sm:py-16">
          <div aria-hidden="true" className="absolute inset-0 -z-10">
            <div className="absolute -left-16 -top-16 size-48 rotate-12 rounded-m-sm bg-md-inverse-primary/15 sm:size-64" />
            <div className="absolute -bottom-20 -right-12 size-56 rotate-12 rounded-m-sm bg-md-tertiary-container/15 sm:size-72" />
          </div>
          <h2 className="mx-auto max-w-2xl font-display text-[1.75rem] font-normal leading-tight text-balance sm:text-[2.75rem]">
            Resolva sua tarefa agora, em segundos
          </h2>
          <p className="mx-auto mt-4 max-w-xl opacity-80 sm:text-lg">
            Escolha uma ferramenta e comece — sem cadastro e sem instalar nada.
          </p>
          <Link
            href={TOOLS_BASE_PATH}
            className="state-layer mt-8 inline-flex h-12 items-center gap-2 rounded-m-sm bg-md-inverse-primary px-7 font-medium text-md-on-primary-container"
          >
            Explorar ferramentas
            <Icon name="arrowRight" className="size-4" />
          </Link>
        </div>
      </Container>

      <JsonLd
        data={webPageJsonLd({
          path: "/",
          name: seoConfig.defaultTitle,
          description: siteConfig.description,
          hasBreadcrumb: false,
          faq: content?.faq,
        })}
      />
    </div>
  );
}

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
}

function SectionHeading({ id, eyebrow, title, description, centered = false }: SectionHeadingProps) {
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-sm font-medium text-primary-dark">{eyebrow}</p>
      <h2 id={id} className="mt-2 font-display text-[1.75rem] font-normal leading-tight text-md-on-surface text-balance sm:text-4xl">
        {title}
      </h2>
      {description && <p className="mt-3 text-base text-md-on-surface-variant sm:text-lg">{description}</p>}
    </div>
  );
}
