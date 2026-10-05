"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/data/navigation";
import { cn } from "@/lib/utils";

interface MainNavProps {
  items: NavItem[];
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname();
  // A rota mais específica vence (ex.: /ferramentas/pdf marca "PDF", não "Todas").
  const active = items
    .filter((item) => isActive(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const linkClass = (href: string) =>
    cn(
      "block rounded-sm px-3 py-2 text-sm font-medium hover:bg-surface hover:text-primary",
      href === active ? "text-primary" : "text-text",
    );

  return (
    <>
      <nav aria-label="Principal" className="hidden md:block">
        <ul className="flex items-center gap-1">
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={linkClass(item.href)} aria-current={item.href === active ? "page" : undefined}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* `key` remonta o menu a cada navegação, fechando-o sem estado extra. */}
      <details key={pathname} className="relative md:hidden">
        <summary className="btn btn-ghost btn-sm list-none px-2 [&::-webkit-details-marker]:hidden" aria-label="Abrir menu">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </summary>
        <nav
          aria-label="Principal (celular)"
          className="absolute right-0 top-full mt-2 w-64 rounded-sm border border-border bg-background p-2 shadow-sm"
        >
          <ul>
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass(item.href)} aria-current={item.href === active ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </details>
    </>
  );
}
