import Link from "next/link";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd, type BreadcrumbItem } from "@/lib/seo/json-ld";

interface BreadcrumbsProps {
  /** Trilha completa a partir da home; o último item é a página atual. */
  items: BreadcrumbItem[];
}

/** Breadcrumb visível + schema BreadcrumbList a partir da mesma fonte. */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <>
      <nav aria-label="Trilha de navegação" className="breadcrumbs py-0 text-sm text-muted">
        <ol>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.path}>
                {isLast ? (
                  <span aria-current="page" className="text-text">
                    {item.name}
                  </span>
                ) : (
                  // Área de toque de 48px de altura (recomendação do Google), sem mudar o tamanho do texto.
                  <Link href={item.path} className="inline-flex min-h-12 items-center hover:text-primary">
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </>
  );
}
