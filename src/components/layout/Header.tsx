import Link from "next/link";
import { siteConfig } from "@/config/site";
import { mainNavigation } from "@/data/navigation";
import { MainNav } from "@/components/navigation/MainNav";
import { Container } from "./Container";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70">
      <Container className="flex h-(--header-height) items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-text" aria-label={`${siteConfig.name} — página inicial`}>
          <span aria-hidden="true" className="grid size-7 place-items-center rounded-sm bg-linear-to-br from-green-500 to-primary-dark text-xs font-extrabold text-on-primary shadow-sm ring-1 ring-inset ring-white/20">
            BT
          </span>
          <span className="tracking-tight">{siteConfig.name}</span>
        </Link>
        <MainNav items={mainNavigation} />
      </Container>
    </header>
  );
}
