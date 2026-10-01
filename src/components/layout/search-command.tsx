"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { loadSearchIndex } from "@/lib/client-data";
import { formatPrice } from "@/lib/format";
import { searchCategories, searchFamilies, searchProducts, type SearchIndex } from "@/lib/search";
import { ui, uiStore, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Dialog } from "../ui/dialog";
import { ArrowRightIcon, HistoryIcon, LayersIcon, LoaderIcon, SearchIcon, TagIcon, XIcon } from "../ui/icons";
import { Kbd } from "../ui/primitives";
import { ProductImage } from "../ui/product-image";

const RECENT_KEY = "catalog.searches.v1";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/** Header button that opens the search palette. */
export function SearchTrigger() {
  return (
    <>
      <button
        type="button"
        onClick={ui.openSearch}
        className="group hidden h-10 w-full max-w-md items-center gap-2.5 rounded-xl border bg-subtle pl-3 pr-2 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-background md:flex"
      >
        <SearchIcon size={17} />
        <span className="flex-1 truncate text-left">Search part numbers, families, specs…</span>
        <span className="flex items-center gap-1">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>
      <button
        type="button"
        onClick={ui.openSearch}
        aria-label="Search"
        className="grid size-10 place-items-center rounded-xl text-foreground/80 transition-colors hover:bg-muted hover:text-foreground md:hidden"
      >
        <SearchIcon size={20} />
      </button>
    </>
  );
}

type Entry = { key: string; href: string };

/** Command-palette style search over every product, family and category (Ctrl/⌘ + K or "/"). */
export function SearchCommand() {
  const { searchOpen } = useStore(uiStore);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (uiStore.get().searchOpen) ui.closeSearch();
        else ui.openSearch();
      } else if (e.key === "/" && !isTypingTarget(e.target)) {
        e.preventDefault();
        ui.openSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    setActive(0);
    setFailed(false);
    try {
      const saved = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]");
      setRecent(Array.isArray(saved) ? saved.filter((s): s is string => typeof s === "string") : []);
    } catch {
      setRecent([]);
    }
    loadSearchIndex()
      .then(setIndex)
      .catch(() => setFailed(true));
    const timer = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(timer);
  }, [searchOpen]);

  useEffect(() => setActive(0), [query]);

  const trimmed = query.trim();
  const results = useMemo(() => {
    if (!index || !trimmed) return null;
    return {
      products: searchProducts(index, trimmed, 7),
      families: searchFamilies(index, trimmed, 3),
      categories: searchCategories(index, trimmed, 3),
    };
  }, [index, trimmed]);

  const allHref = `/catalog?q=${encodeURIComponent(trimmed)}`;
  const entries = useMemo<Entry[]>(() => {
    if (!results) return [];
    return [
      ...results.products.items.map((p) => ({ key: `p:${p.sku}`, href: `/product/${p.slug}` })),
      ...results.families.map((f) => ({ key: `f:${f.code}`, href: f.href })),
      ...results.categories.map((c) => ({ key: `c:${c.href}`, href: c.href })),
      { key: "all", href: allHref },
    ];
  }, [results, allHref]);

  useEffect(() => {
    document.getElementById(`search-option-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const close = () => {
    ui.closeSearch();
    setQuery("");
  };

  const go = (href: string) => {
    if (trimmed) {
      const next = [trimmed, ...recent.filter((r) => r.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }
    close();
    router.push(href);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(entries.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const entry = entries[active];
      if (entry) go(entry.href);
      else if (trimmed) go(allHref);
    }
  };

  const position = (key: string) => entries.findIndex((e) => e.key === key);
  const optionProps = (key: string) => {
    const i = position(key);
    return {
      id: `search-option-${i}`,
      role: "option" as const,
      "aria-selected": i === active,
      onMouseMove: () => setActive(i),
      "data-active": i === active ? "true" : undefined,
    };
  };
  const rowClass = "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors data-[active=true]:bg-muted";

  return (
    <Dialog open={searchOpen} onClose={close} label="Search the catalog" side="top" width="44rem">
      <div className="flex max-h-[inherit] flex-col overflow-hidden rounded-2xl border bg-background shadow-[0_40px_80px_-30px_rgb(15_23_42/0.5)]">
        <div className="flex items-center gap-3 border-b px-4">
          <SearchIcon size={19} className="shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search by part number, family, material…"
            aria-label="Search"
            role="combobox"
            aria-expanded={!!results}
            aria-controls="search-results"
            aria-activedescendant={entries.length ? `search-option-${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
            className="h-14 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <XIcon size={15} />
            </button>
          ) : (
            <Kbd>Esc</Kbd>
          )}
        </div>

        <div id="search-results" role="listbox" aria-label="Search results" className="min-h-0 flex-1 overflow-y-auto p-2">
          {!trimmed && (
            <div className="space-y-5 p-2">
              {recent.length > 0 && (
                <div>
                  <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">Recent searches</p>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setQuery(r)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] text-foreground hover:bg-muted"
                      >
                        <HistoryIcon size={13} className="text-muted-foreground" /> {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">Popular searches</p>
                <div className="flex flex-wrap gap-2">
                  {siteConfig.popularSearches.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setQuery(s)}
                      className="inline-flex h-8 items-center rounded-full border px-3 text-[13px] text-foreground hover:bg-muted"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {index && (
                <div>
                  <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">Product families</p>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {index.families.slice(0, 6).map((f) => (
                      <Link
                        key={f.code}
                        href={f.href}
                        onClick={close}
                        className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted"
                      >
                        <ProductImage src={f.image} alt="" sizes="40px" eager className="size-10 shrink-0 rounded-lg" imageClassName="p-1" />
                        <span className="min-w-0">
                          <span className="block font-mono text-[13px] font-semibold text-foreground">{f.code}</span>
                          <span className="block truncate text-xs text-muted-foreground">{f.name}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {trimmed && !index && !failed && (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <LoaderIcon size={16} className="animate-spin" /> Loading catalog…
            </div>
          )}
          {failed && <p className="py-12 text-center text-sm text-muted-foreground">Search is unavailable right now. Please try again.</p>}

          {results && (
            <div className="space-y-3">
              {results.products.items.length > 0 && (
                <div>
                  <p className="px-3 pb-1 pt-2 text-xs font-medium text-muted-foreground">
                    Products <span className="tabular-nums">({results.products.total})</span>
                  </p>
                  {results.products.items.map((p) => (
                    <button key={p.sku} type="button" onClick={() => go(`/product/${p.slug}`)} className={rowClass} {...optionProps(`p:${p.sku}`)}>
                      <ProductImage src={p.image} alt="" sizes="44px" eager className="size-11 shrink-0 rounded-lg" imageClassName="p-1" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-[13px] font-semibold text-foreground">{p.sku}</span>
                        <span className="block truncate text-xs text-muted-foreground">{p.title}</span>
                      </span>
                      <span className="shrink-0 text-[13px] font-medium tabular-nums text-foreground">{formatPrice(p.price)}</span>
                    </button>
                  ))}
                </div>
              )}
              {results.families.length > 0 && (
                <div>
                  <p className="px-3 pb-1 pt-2 text-xs font-medium text-muted-foreground">Families</p>
                  {results.families.map((f) => (
                    <button key={f.code} type="button" onClick={() => go(f.href)} className={rowClass} {...optionProps(`f:${f.code}`)}>
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                        <LayersIcon size={17} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                        <span className="font-mono font-semibold">{f.code}</span> · {f.name}
                      </span>
                      <span className="text-xs tabular-nums text-muted-foreground">{f.count}</span>
                    </button>
                  ))}
                </div>
              )}
              {results.categories.length > 0 && (
                <div>
                  <p className="px-3 pb-1 pt-2 text-xs font-medium text-muted-foreground">Categories</p>
                  {results.categories.map((c) => (
                    <button key={c.href} type="button" onClick={() => go(c.href)} className={rowClass} {...optionProps(`c:${c.href}`)}>
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                        <TagIcon size={16} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-foreground">{c.trail}</span>
                      <span className="text-xs tabular-nums text-muted-foreground">{c.count}</span>
                    </button>
                  ))}
                </div>
              )}
              {!results.products.items.length && !results.families.length && !results.categories.length && (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No direct matches for “{trimmed}”. Try a shorter part number or a different keyword.
                </p>
              )}
              <button
                type="button"
                onClick={() => go(allHref)}
                className={cn(rowClass, "justify-between font-medium text-primary")}
                {...optionProps("all")}
              >
                <span className="truncate">See all results for “{trimmed}”</span>
                <ArrowRightIcon size={16} className="shrink-0" />
              </button>
            </div>
          )}
        </div>

        <div className="hidden items-center gap-4 border-t px-4 py-2.5 text-[11px] text-muted-foreground sm:flex">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>Enter</Kbd> open
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>Esc</Kbd> close
          </span>
        </div>
      </div>
    </Dialog>
  );
}
