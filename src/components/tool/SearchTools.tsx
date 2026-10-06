"use client";

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface SearchItem {
  name: string;
  description: string;
  category: string;
  href: string;
  keywords: string[];
}

interface SearchToolsProps {
  items: SearchItem[];
  maxResults?: number;
  /** `hero`: campo maior, com ícone, para destaque na página inicial. */
  size?: "default" | "hero";
}

/** Remove acentos e caixa para que "calculo" encontre "Cálculo". */
function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

/** Combobox acessível (padrão WAI-ARIA) sem dependências. */
export function SearchTools({ items, maxResults = 8, size = "default" }: SearchToolsProps) {
  const hero = size === "hero";
  const router = useRouter();
  const id = useId();
  const listId = `${id}-lista`;
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);

  const index = useMemo(
    () => items.map((item) => ({ item, haystack: normalize([item.name, item.category, item.description, ...item.keywords].join(" ")) })),
    [items],
  );

  const results = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];
    return index
      .filter(({ haystack }) => terms.every((term) => haystack.includes(term)))
      .slice(0, maxResults)
      .map(({ item }) => item);
  }, [index, query, maxResults]);

  const expanded = open && query.trim().length > 0;

  function go(item: SearchItem) {
    setOpen(false);
    router.push(item.href);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && results.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp" && results.length > 0) {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? results.length - 1 : current - 1));
    } else if (event.key === "Enter") {
      const target = results[activeIndex] ?? results[0];
      if (target) {
        event.preventDefault();
        go(target);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className={cn("relative w-full", hero ? "max-w-2xl" : "max-w-xl")} role="search">
      <label htmlFor={`${id}-input`} className="sr-only">
        Buscar ferramentas
      </label>
      {hero && (
        <Icon
          name="search"
          className="pointer-events-none absolute left-5 top-7 z-10 size-5 -translate-y-1/2 text-md-on-surface-variant"
        />
      )}
      <input
        id={`${id}-input`}
        type="search"
        role="combobox"
        autoComplete="off"
        spellCheck={false}
        placeholder="Buscar ferramenta (ex.: juntar pdf, pix, porcentagem)"
        className={cn(
          "input input-bordered w-full text-text",
          hero &&
            "h-14 rounded-m-sm border-transparent bg-md-surface-lowest pl-13 pr-5 text-base shadow-m1 transition-shadow focus-within:border-transparent focus-within:shadow-m3",
        )}
        value={query}
        aria-expanded={expanded}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={expanded && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(-1);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />

      <ul
        id={listId}
        role="listbox"
        aria-label="Resultados da busca"
        hidden={!expanded}
        className={cn(
          "absolute inset-x-0 top-full z-30 max-h-96 overflow-y-auto border border-border bg-background text-left text-text shadow-lg",
          hero ? "mt-2 rounded-m-lg border-none py-2 shadow-m2" : "mt-1 rounded-sm",
        )}
      >
        {results.length === 0 ? (
          <li role="option" aria-selected={false} aria-disabled className="px-3 py-2 text-sm text-muted">
            Nenhuma ferramenta encontrada.
          </li>
        ) : (
          results.map((item, itemIndex) => (
            <li
              key={item.href}
              id={`${listId}-${itemIndex}`}
              role="option"
              aria-selected={itemIndex === activeIndex}
              // `mousedown` evita que o blur do input feche a lista antes do clique.
              onMouseDown={(event) => {
                event.preventDefault();
                go(item);
              }}
              onMouseEnter={() => setActiveIndex(itemIndex)}
              className={cn("cursor-pointer px-3 py-2", hero && "px-5", itemIndex === activeIndex && (hero ? "bg-md-secondary-container" : "bg-primary-light"))}
            >
              <span className="block text-sm font-medium">{item.name}</span>
              <span className="block text-xs text-muted">{item.category}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
