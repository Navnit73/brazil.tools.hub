import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { CategoryCard } from "@/components/tool/CategoryCard";
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
import { toolPath } from "@/lib/routes";
import { getSearchItems } from "@/lib/search";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  ...buildMetadata({ title: seoConfig.defaultTitle, description: siteConfig.description, path: "/" }),
  // Na home o título não usa o template "%s | Nome".
  title: { absolute: seoConfig.defaultTitle },
};

const highlights: Array<{ icon: IconName; label: string }> = [
  { icon: "gift", label: "100% grátis" },
  { icon: "check", label: "Sem cadastro" },
  { icon: "shield", label: "Arquivos no seu dispositivo" },
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
    description: "Sem filas, sem e-mail de confirmação e sem anúncios no caminho. Abriu, usou, pronto.",
  },
  {
    icon: "smartphone",
    title: "Funciona em qualquer tela",
    description: "Computador, tablet ou celular: as ferramentas se adaptam ao seu dispositivo sem instalar nada.",
  },
  {
    icon: "gift",
    title: "Gratuito e sem cadastro",
    description: "Todas as ferramentas são livres para usar quantas vezes quiser, sem criar conta.",
  },
];

/** Atalhos exibidos sob a busca do hero. */
const quickLinks = tools.slice(0, 5);

export default async function HomePage() {
  const content = await getPageContent("pages/home");

  const stats = [
    { value: String(tools.length), label: "ferramentas prontas" },
    { value: String(categories.length), label: "categorias" },
    { value: "0", label: "cadastros exigidos" },
    { value: "R$ 0", label: "para sempre" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(34_197_94/0.35),transparent)]" />
          <div className="absolute -bottom-48 -right-32 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,rgb(250_204_21/0.14),transparent)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)] bg-size-[56px_56px] mask-[radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        </div>

        <Container className="flex flex-col items-center py-16 text-center sm:py-24">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-xs font-medium text-green-200 backdrop-blur">
            <Icon name="sparkles" className="size-3.5" />
            Ferramentas feitas para o Brasil
          </p>

          <h1 className="mt-6 max-w-4xl text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Ferramentas online grátis para{" "}
            <span className="bg-linear-to-r from-green-300 via-emerald-300 to-yellow-200 bg-clip-text text-transparent">
              o seu dia a dia
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-base text-slate-300 text-pretty sm:text-lg">
            Imagens, PDF, calculadoras, Pix, documentos, WhatsApp e texto. Tudo rápido, simples e sem cadastro.
          </p>

          <div className="mt-9 flex w-full justify-center">
            <SearchTools items={getSearchItems()} size="hero" />
          </div>

          <div className="mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-slate-400">Populares:</span>
            {quickLinks.map((tool) => (
              <Link
                key={`${tool.category}/${tool.slug}`}
                href={toolPath(tool)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200 transition hover:border-green-400/50 hover:bg-green-400/10 hover:text-white"
              >
                {tool.name}
              </Link>
            ))}
          </div>

          <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-300">
            {highlights.map((item) => (
              <li key={item.label} className="flex items-center gap-2">
                <Icon name={item.icon} className="size-4 text-green-400" />
                {item.label}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Números */}
      <Container className="relative z-10 -mt-8">
        <dl className="grid grid-cols-2 divide-border overflow-hidden rounded-sm border border-border bg-background shadow-[0_20px_40px_-20px_rgb(15_23_42/0.25)] sm:grid-cols-4 sm:divide-x">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse items-center justify-end px-4 py-5 text-center">
              <dt className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">{stat.label}</dt>
              <dd className="text-2xl font-extrabold tracking-tight text-text sm:text-3xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </Container>

      <Container className="py-16 sm:py-20">
        <section aria-labelledby="categorias">
          <SectionHeading
            id="categorias"
            eyebrow="Explore"
            title="Categorias"
            description="Encontre a ferramenta certa organizada por tipo de tarefa."
          />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <li key={category.slug}>
                <CategoryCard category={category} toolCount={getToolsByCategory(category.slug).length} headingLevel="h3" />
              </li>
            ))}
            <li>
              <Link
                href={TOOLS_BASE_PATH}
                className="group flex h-full min-h-44 flex-col justify-between rounded-sm bg-linear-to-br from-primary to-primary-dark p-5 text-on-primary shadow-[0_12px_32px_-12px_rgb(21_128_61/0.6)] transition hover:-translate-y-0.5"
              >
                <span className="grid size-11 place-items-center rounded-sm bg-white/15 ring-1 ring-inset ring-white/25">
                  <Icon name="sparkles" className="size-5.5" />
                </span>
                <span>
                  <span className="block text-lg font-semibold tracking-tight">Ver todas as ferramentas</span>
                  <span className="mt-1 flex items-center gap-1 text-sm text-green-100">
                    Navegue pelo catálogo completo
                    <Icon name="arrowRight" className="size-4 transition group-hover:translate-x-0.5" />
                  </span>
                </span>
              </Link>
            </li>
          </ul>
        </section>

        <section aria-labelledby="populares" className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              id="populares"
              eyebrow="Mais usadas"
              title="Ferramentas populares"
              description="As favoritas de quem passa por aqui."
            />
            <Link
              href={TOOLS_BASE_PATH}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
            >
              Ver todas as ferramentas
              <Icon name="arrowRight" className="size-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="mt-8">
            <ToolGrid tools={tools.slice(0, 6)} headingLevel="h3" showCategory />
          </div>
        </section>
      </Container>

      {/* Benefícios */}
      <section aria-labelledby="por-que" className="border-y border-border bg-surface">
        <Container className="py-16 sm:py-20">
          <SectionHeading
            id="por-que"
            eyebrow="Por que usar"
            title={`Por que escolher o ${siteConfig.name}`}
            description="Ferramentas pensadas para resolver tarefas comuns sem complicação."
            centered
          />
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <li key={benefit.title} className="rounded-sm border border-border bg-background p-6">
                <span
                  aria-hidden="true"
                  className="grid size-11 place-items-center rounded-sm bg-primary-light text-primary ring-1 ring-inset ring-green-200"
                >
                  <Icon name={benefit.icon} className="size-5.5" />
                </span>
                <h3 className="mt-4 font-semibold tracking-tight">{benefit.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{benefit.description}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {content && (
        <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <MarkdownContent html={content.introHtml} className="[&>h2:first-child]:mt-0 [&>h2]:text-2xl [&>h2]:tracking-tight" />

          {content.faq.length > 0 && (
            <section aria-labelledby="faq">
              <h2 id="faq" className="text-2xl font-bold tracking-tight">
                Perguntas frequentes
              </h2>
              <div className="mt-6 divide-y divide-border rounded-sm border border-border bg-background">
                {content.faq.map((item) => (
                  <details key={item.question} className="group px-5 [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium hover:text-primary">
                      {item.question}
                      <Icon name="plus" className="size-5 shrink-0 text-muted transition group-open:rotate-45 group-open:text-primary" />
                    </summary>
                    <p className="pb-4 text-sm text-muted">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </Container>
      )}

      {/* CTA */}
      <Container className="pb-4">
        <div className="relative isolate overflow-hidden rounded-sm bg-slate-950 px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,rgb(34_197_94/0.3),transparent_65%)]"
          />
          <h2 className="mx-auto max-w-2xl text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            Pronto para resolver sua tarefa em segundos?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Escolha uma ferramenta e comece agora mesmo — sem cadastro e sem instalar nada.
          </p>
          <Link
            href={TOOLS_BASE_PATH}
            className="group mt-8 inline-flex items-center gap-2 rounded-sm bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg transition hover:bg-green-50"
          >
            Explorar ferramentas
            <Icon name="arrowRight" className="size-4 transition group-hover:translate-x-0.5" />
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
      <h2 id={id} className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {description && <p className="mt-2 text-muted">{description}</p>}
    </div>
  );
}
