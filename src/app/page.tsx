import type { Metadata } from "next";
import Link from "next/link";
import { HeroPreview } from "@/components/home/HeroPreview";
import { Container } from "@/components/layout/Container";
import { CategoryCard } from "@/components/tool/CategoryCard";
import { categoryVisuals } from "@/components/tool/categoryVisuals";
import { SearchTools } from "@/components/tool/SearchTools";
import { ToolGrid } from "@/components/tool/ToolGrid";
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
import { faqJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
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

const benefits: Array<{ icon: IconName; title: string; description: string }> = [
  {
    icon: "shield",
    title: "Privacidade em primeiro lugar",
    description: "Sempre que possível, seus arquivos são processados no próprio navegador e nunca saem do seu aparelho.",
  },
  {
    icon: "zap",
    title: "Rápido de verdade",
    description: "Sem filas, sem e-mail de confirmação e sem etapas desnecessárias. Abriu, usou, pronto.",
  },
  {
    icon: "smartphone",
    title: "Funciona em qualquer tela",
    description: "Computador, tablet ou celular: as ferramentas se adaptam ao seu dispositivo sem instalar nada.",
  },
  {
    icon: "gift",
    title: "Gratuito e sem cadastro",
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
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-slate-200/70 bg-white">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-green-300/40 blur-3xl" />
          <div className="absolute -top-20 right-[-10rem] h-[30rem] w-[30rem] rounded-full bg-yellow-200/50 blur-3xl" />
          <div className="absolute bottom-[-12rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-teal-200/40 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(rgb(15_23_42/0.08)_1px,transparent_1px)] bg-size-[22px_22px] mask-[radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        </div>

        <Container className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div className="text-center lg:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/80 py-1 pl-1 pr-3.5 text-xs font-semibold text-green-800 shadow-sm backdrop-blur">
              <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] text-white">Novo</span>
              Editor de imagem completo no navegador
            </p>

            <h1 className="mt-6 font-display text-[2.6rem] font-extrabold leading-[1.05] tracking-[-0.035em] text-slate-950 text-balance sm:text-6xl lg:text-[4.25rem]">
              Ferramentas online grátis para{" "}
              <span className="relative whitespace-nowrap">
                <span className="bg-linear-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  o seu dia a dia
                </span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 300 12"
                  preserveAspectRatio="none"
                  className="absolute -bottom-2 left-0 h-3 w-full text-yellow-400"
                >
                  <path d="M2 9c60-6 160-8 296-3" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-slate-600 text-pretty lg:mx-0">
              Imagens, PDF, calculadoras, Pix, documentos, WhatsApp e texto. Tudo rápido, simples e sem cadastro.
            </p>

            <div className="mt-9 flex justify-center lg:justify-start">
              <SearchTools items={getSearchItems()} size="hero" />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm lg:justify-start">
              <span className="text-slate-500">Populares:</span>
              {quickLinks.map((tool) => (
                <Link
                  key={`${tool.category}/${tool.slug}`}
                  href={toolPath(tool)}
                  className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 font-medium text-slate-700 shadow-sm backdrop-blur transition hover:border-primary hover:text-primary"
                >
                  {tool.name}
                </Link>
              ))}
            </div>

            <dl className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-4 lg:justify-start">
              {[
                { value: String(tools.length), label: "ferramentas" },
                { value: String(categories.length), label: "categorias" },
                { value: "100%", label: "grátis" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-baseline gap-2">
                  <dd className="font-display text-2xl font-extrabold text-slate-950">{stat.value}</dd>
                  <dt className="text-sm text-slate-500">{stat.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="hidden lg:block">
            <HeroPreview />
          </div>
        </Container>
      </section>

      {/* Categorias (bento) */}
      <section aria-labelledby="categorias" className="bg-slate-50/60">
        <Container className="py-20 sm:py-24">
          <SectionHeading
            id="categorias"
            eyebrow="Explore"
            title="Tudo o que você precisa, em um só lugar"
            description="Ferramentas organizadas por tipo de tarefa para você encontrar a certa em segundos."
          />

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <li className="sm:col-span-2 lg:row-span-2">
              <article className="group relative flex h-full min-h-80 flex-col overflow-hidden rounded-[1.75rem] bg-slate-950 p-8 text-white shadow-[0_30px_60px_-30px_rgb(15_23_42/0.7)]">
                <div
                  aria-hidden="true"
                  className={cn(
                    "absolute -right-24 -top-24 size-80 rounded-full bg-linear-to-br opacity-40 blur-3xl transition duration-500 group-hover:opacity-60",
                    featuredVisual.gradient,
                  )}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative grid size-14 place-items-center rounded-[1rem] bg-linear-to-br text-white shadow-lg ring-1 ring-inset ring-white/20",
                    featuredVisual.gradient,
                  )}
                >
                  <Icon name={featuredVisual.icon} className="size-7" />
                </span>
                <p className="relative mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Destaque</p>
                <h3 className="relative mt-2 font-display text-3xl font-extrabold tracking-tight">
                  <Link href={categoryPath(featured.slug)} className="after:absolute after:inset-0">
                    {featured.name}
                  </Link>
                </h3>
                <p className="relative mt-2 max-w-md text-slate-300">{featured.description}</p>
                <ul className="relative z-10 mt-auto flex flex-wrap gap-2 pt-8">
                  {featuredTools.map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        href={toolPath(tool)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white hover:text-slate-950"
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
                className="group relative flex h-full min-h-48 flex-col justify-between overflow-hidden rounded-[1.25rem] bg-linear-to-br from-green-600 via-emerald-600 to-teal-600 p-6 text-white shadow-[0_24px_48px_-20px_rgb(5_150_105/0.6)] transition duration-300 hover:-translate-y-1"
              >
                <div
                  aria-hidden="true"
                  className="absolute -bottom-16 -right-10 size-56 rounded-full border-[28px] border-white/10 transition duration-500 group-hover:scale-110"
                />
                <span className="grid size-12 place-items-center rounded-[1rem] bg-white/15 ring-1 ring-inset ring-white/25">
                  <Icon name="sparkles" className="size-6" />
                </span>
                <span>
                  <span className="block font-display text-xl font-bold tracking-tight">Ver todas as ferramentas</span>
                  <span className="mt-1 flex items-center gap-1.5 text-sm text-green-50">
                    Navegue pelo catálogo completo
                    <Icon name="arrowRight" className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            </li>
          </ul>
        </Container>
      </section>

      {/* Populares */}
      <section aria-labelledby="populares">
        <Container className="py-20 sm:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              id="populares"
              eyebrow="Mais usadas"
              title="Ferramentas populares"
              description="As favoritas de quem passa por aqui."
            />
            <Link
              href={TOOLS_BASE_PATH}
              className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-900"
            >
              Ver todas
              <Icon name="arrowRight" className="size-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="mt-12">
            <ToolGrid tools={tools.slice(0, 6)} headingLevel="h3" showCategory />
          </div>
        </Container>
      </section>

      {/* Como funciona */}
      <section aria-labelledby="como-funciona" className="border-y border-slate-200/70 bg-slate-50/60">
        <Container className="py-20 sm:py-24">
          <SectionHeading
            id="como-funciona"
            eyebrow="Como funciona"
            title="Três passos. Nenhuma complicação."
            centered
          />
          <div className="relative mt-14">
            <div
              aria-hidden="true"
              className="absolute left-[16.6%] right-[16.6%] top-8 hidden border-t-2 border-dashed border-slate-300 md:block"
            />
            <ol className="relative grid gap-10 md:grid-cols-3 md:gap-6">
              {steps.map((step, index) => (
                <li key={step.title} className="relative flex flex-col items-center text-center">
                  <span className="relative grid size-16 place-items-center rounded-[1rem] border border-slate-200 bg-white text-primary shadow-[0_12px_30px_-12px_rgb(15_23_42/0.25)]">
                    <Icon name={step.icon} className="size-7" />
                    <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold tracking-tight">{step.title}</h3>
                  <p className="mt-1.5 max-w-xs text-sm text-muted">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* Benefícios */}
      <section aria-labelledby="por-que" className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-80 w-[50rem] -translate-x-1/2 rounded-full bg-green-500/20 blur-3xl" />
        </div>
        <Container className="py-20 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-400">Por que usar</p>
            <h2 id="por-que" className="mt-3 font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
              Feito para ser simples, rápido e seguro
            </h2>
            <p className="mt-3 text-slate-400">
              O {siteConfig.name} resolve tarefas comuns sem complicação e sem pedir nada em troca.
            </p>
          </div>
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <li
                key={benefit.title}
                className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition hover:border-green-400/40 hover:bg-white/[0.07]"
              >
                <span
                  aria-hidden="true"
                  className="grid size-12 place-items-center rounded-[1rem] bg-linear-to-br from-green-400 to-emerald-600 text-white shadow-lg shadow-green-500/20"
                >
                  <Icon name={benefit.icon} className="size-6" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold tracking-tight">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{benefit.description}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {content && (
        <Container className="grid gap-12 py-20 sm:py-24 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Sobre</p>
            <MarkdownContent
              html={content.introHtml}
              className="mt-3 text-slate-600 [&>h2:first-child]:mt-0 [&>h2]:font-display [&>h2]:text-3xl [&>h2]:font-extrabold [&>h2]:tracking-tight [&>h2]:text-slate-950"
            />
          </div>

          {content.faq.length > 0 && (
            <section aria-labelledby="faq">
              <h2 id="faq" className="font-display text-3xl font-extrabold tracking-tight">
                Perguntas frequentes
              </h2>
              <div className="mt-6 space-y-3">
                {content.faq.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-[1rem] border border-slate-200 bg-white px-6 shadow-sm transition open:shadow-md [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold text-slate-900">
                      {item.question}
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 transition group-open:rotate-45 group-open:bg-primary group-open:text-white">
                        <Icon name="plus" className="size-4" />
                      </span>
                    </summary>
                    <p className="pb-5 leading-relaxed text-slate-600">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </Container>
      )}

      {/* CTA */}
      <Container className="pb-4">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-linear-to-br from-green-600 via-emerald-600 to-teal-700 px-6 py-16 text-center text-white shadow-[0_40px_80px_-40px_rgb(5_150_105/0.8)] sm:px-12 sm:py-20">
          <div aria-hidden="true" className="absolute inset-0 -z-10">
            <div className="absolute -left-20 -top-20 size-72 rounded-full border-[40px] border-white/10" />
            <div className="absolute -bottom-24 -right-16 size-96 rounded-full border-[48px] border-white/10" />
            <div className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.15)_1px,transparent_1px)] bg-size-[20px_20px] mask-[radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          </div>
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
            Resolva sua tarefa agora, em segundos
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-green-50/90">
            Escolha uma ferramenta e comece — sem cadastro e sem instalar nada.
          </p>
          <Link
            href={TOOLS_BASE_PATH}
            className="group mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
          >
            Explorar ferramentas
            <Icon name="arrowRight" className="size-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </Container>

      <JsonLd
        data={[organizationJsonLd(), websiteJsonLd(), ...(content && content.faq.length > 0 ? [faqJsonLd(content.faq)] : [])]}
      />
    </>
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
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h2 id={id} className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-950 text-balance sm:text-4xl">
        {title}
      </h2>
      {description && <p className="mt-3 text-lg text-muted">{description}</p>}
    </div>
  );
}
