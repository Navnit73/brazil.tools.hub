import Link from "next/link";
import { siteConfig } from "@/config/site";
import { mainNavigation } from "@/data/navigation";
import { MainNav } from "@/components/navigation/MainNav";
import { Container } from "./Container";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <Container className="flex h-(--header-height) items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-text" aria-label={`${siteConfig.name} — página inicial`}>
          <span aria-hidden="true" className="grid size-7 place-items-center rounded-sm bg-primary text-sm text-on-primary">
            BT
          </span>
          <span>{siteConfig.name}</span>
        </Link>
        <MainNav items={mainNavigation} />
      </Container>
    </header>
  );
}
