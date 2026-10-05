import Link from "next/link";
import { siteConfig } from "@/config/site";
import { footerNavigation } from "@/data/navigation";
import { TOOLS_BASE_PATH } from "@/lib/constants";
import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <Container className="grid gap-8 py-10 sm:grid-cols-[1fr_2fr]">
        <div>
          <p className="font-bold">{siteConfig.name}</p>
          <p className="mt-2 max-w-xs text-sm text-muted">{siteConfig.description}</p>
        </div>
        <nav aria-label="Categorias de ferramentas">
          <p className="text-sm font-semibold">Categorias</p>
          <ul className="mt-3 grid grid-cols-1 gap-2 text-sm min-[420px]:grid-cols-2 md:grid-cols-3">
            {footerNavigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted hover:text-primary hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={TOOLS_BASE_PATH} className="text-muted hover:text-primary hover:underline">
                Todas as ferramentas
              </Link>
            </li>
          </ul>
        </nav>
      </Container>
      <Container className="border-t border-border py-4 text-xs text-muted">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. Ferramentas gratuitas, feitas no Brasil.
        </p>
      </Container>
    </footer>
  );
}
