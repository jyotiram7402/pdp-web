"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { CardProduct } from "@/lib/types";
import type { CatalogIndex } from "@/lib/facets";
import {
  PER_PAGE_OPTIONS,
  SORT_OPTIONS,
  countActive,
  defaultState,
  parseState,
  runFilters,
  toSearch,
  type FilterState,
  type SortKey,
} from "@/lib/filter";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProductCard } from "../product-card";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { ChevronDownIcon, GridIcon, ListIcon, SearchIcon, SlidersIcon, XIcon } from "../ui/icons";
import { EmptyState } from "../ui/primitives";
import { ActiveFilters } from "./active-filters";
import { FacetPanel, type FacetActions } from "./facet-panel";
import { Pagination } from "./pagination";
import { ProductRow } from "./product-row";
import { QuickView } from "./quick-view";

type View = "grid" | "list";

/** Reports URL query changes made by Next.js navigation (links, back/forward, router.push). */
function SearchParamsWatcher({ onChange }: { onChange: (search: string) => void }) {
  const params = useSearchParams();
  const search = params.toString();
  useEffect(() => {
    onChange(search);
  }, [search, onChange]);
  return null;
}

const normalizeSearch = (search: string) => {
  const query = new URLSearchParams(search).toString();
  return query ? `?${query}` : "";
};

/**
 * Client-side faceted browsing over a pre-built index. The first page is
 * server-rendered; filtering, sorting and paging then run instantly in the
 * browser and are mirrored into the URL so every view can be shared.
 */
export function CatalogExplorer({ index }: { index: CatalogIndex }) {
  const { facets } = index;
  const pathname = usePathname();
  const [state, setState] = useState<FilterState>(defaultState);
  const [view, setView] = useState<View>("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quick, setQuick] = useState<CardProduct | null>(null);
  const urlRef = useRef<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const syncFromUrl = useCallback(
    (search: string) => {
      const normalized = normalizeSearch(search);
      if (normalized === urlRef.current) return;
      urlRef.current = normalized;
      setState(parseState(normalized, facets));
    },
    [facets],
  );

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("catalog.view");
      if (saved === "grid" || saved === "list") setView(saved);
    } catch {
      /* ignore */
    }
  }, []);

  // The URL is read only through SearchParamsWatcher (one source of truth);
  // until it has reported once, nothing is written back.
  useEffect(() => {
    if (urlRef.current === null) return;
    const search = toSearch(state, facets);
    if (search === urlRef.current) return;
    const timer = window.setTimeout(() => {
      urlRef.current = search;
      window.history.replaceState(window.history.state, "", `${pathname}${search}`);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [state, facets, pathname]);

  // Filtering a few thousand items takes ~1–15 ms, so it runs synchronously;
  // cards and filter sections are memoized so only what changed re-renders.
  const result = useMemo(() => runFilters(index, state), [index, state]);
  const total = result.items.length;
  const totalPages = Math.max(1, Math.ceil(total / state.perPage));
  const page = Math.min(state.page, totalPages);
  const start = (page - 1) * state.perPage;
  const pageItems = result.items.slice(start, start + state.perPage);
  const activeCount = countActive(state);
  const filtered = activeCount > 0 || state.q.trim().length > 0;
  const hasFacets = facets.length > 0;

  const update = useCallback((fn: (s: FilterState) => FilterState) => setState((s) => ({ ...fn(s), page: 1 })), []);

  const actions = useMemo<FacetActions>(
    () => ({
      toggle: (id, value) =>
        update((s) => {
          const current = s.list[id] ?? [];
          const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
          const list = { ...s.list };
          if (next.length) list[id] = next;
          else delete list[id];
          return { ...s, list };
        }),
      setRange: (id, range) =>
        update((s) => {
          const ranges = { ...s.range };
          if (range) ranges[id] = range;
          else delete ranges[id];
          return { ...s, range: ranges };
        }),
      setFit: (id, value) =>
        update((s) => {
          const fit = { ...s.fit };
          if (value != null) fit[id] = value;
          else delete fit[id];
          return { ...s, fit };
        }),
    }),
    [update],
  );

  const setQuery = (q: string) => update((s) => ({ ...s, q }));
  const clearAll = () => setState((s) => ({ ...defaultState(), sort: s.sort, perPage: s.perPage }));
  const goToPage = (next: number) => {
    setState((s) => ({ ...s, page: next }));
    const top = topRef.current;
    if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const changeView = (next: View) => {
    setView(next);
    try {
      window.localStorage.setItem("catalog.view", next);
    } catch {
      /* ignore */
    }
  };

  return (
    <div ref={topRef} className="scroll-mt-[calc(var(--header-height)+16px)]">
      <Suspense fallback={null}>
        <SearchParamsWatcher onChange={syncFromUrl} />
      </Suspense>

      <div className={cn(hasFacets && "lg:grid lg:grid-cols-[272px_minmax(0,1fr)] lg:gap-10")}>
        <aside className={hasFacets ? "hidden lg:block" : "hidden"} aria-label="Filters">
          <div className="sticky top-[calc(var(--header-height)+20px)] -mr-3 max-h-[calc(100dvh-var(--header-height)-40px)] overflow-y-auto overscroll-contain pb-8 pr-3">
            <div className="mb-3 flex h-6 items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Filters</h2>
              {activeCount > 0 && (
                <button type="button" onClick={clearAll} className="text-[13px] font-medium text-primary hover:underline">
                  Clear all ({activeCount})
                </button>
              )}
            </div>
            <FacetPanel facets={facets} state={state} result={result} actions={actions} />
          </div>
        </aside>

        <section aria-label="Products" className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {hasFacets && (
              <Button variant="outline" onClick={() => setFiltersOpen(true)} className="lg:hidden">
                <SlidersIcon size={16} />
                Filters
                {activeCount > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
                    {activeCount}
                  </span>
                )}
              </Button>
            )}

            <div className="relative order-last w-full sm:order-none sm:w-auto sm:min-w-[220px] sm:flex-1 lg:max-w-sm">
              <SearchIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                enterKeyHint="search"
                value={state.q}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search part number or keyword"
                aria-label="Search within these products"
                className="h-10 w-full rounded-xl border bg-background pl-9 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
              />
              {state.q && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <XIcon size={14} />
                </button>
              )}
            </div>

            <p className="text-sm text-muted-foreground" aria-live="polite">
              <span className="font-semibold tabular-nums text-foreground">{formatNumber(total, 0)}</span> {total === 1 ? "product" : "products"}
              {filtered && <span className="hidden sm:inline"> of {formatNumber(index.items.length, 0)}</span>}
            </p>

            <div className="ml-auto flex items-center gap-2">
              <label className="relative flex items-center">
                <span className="mr-2 hidden text-sm text-muted-foreground xl:inline">Sort by</span>
                <select
                  value={state.sort}
                  onChange={(e) => setState((s) => ({ ...s, sort: e.target.value as SortKey, page: 1 }))}
                  aria-label="Sort products"
                  className="h-10 appearance-none rounded-xl border bg-background pl-3 pr-9 text-sm font-medium text-foreground outline-none transition-colors hover:border-foreground/25 focus:border-ring"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon size={16} className="pointer-events-none absolute right-3 text-muted-foreground" />
              </label>
              <div className="flex rounded-xl border p-0.5" role="group" aria-label="Layout">
                {(
                  [
                    ["grid", GridIcon, "Grid view"],
                    ["list", ListIcon, "List view"],
                  ] as const
                ).map(([key, Icon, label]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={view === key}
                    aria-label={label}
                    title={label}
                    onClick={() => changeView(key)}
                    className={cn(
                      "grid size-9 place-items-center rounded-[10px] transition-colors",
                      view === key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered && (
            <div className="mt-4">
              <ActiveFilters facets={facets} state={state} actions={actions} onQuery={setQuery} onClear={clearAll} />
            </div>
          )}

          <div className="mt-5">
            {total === 0 ? (
              <EmptyState
                icon={<SearchIcon size={22} />}
                title="No products match"
                description="Try removing a filter, widening a range, or searching for a different part number."
              >
                {filtered && (
                  <Button variant="outline" onClick={clearAll}>
                    Clear all filters
                  </Button>
                )}
              </EmptyState>
            ) : view === "grid" ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {pageItems.map((item, i) => (
                  <ProductCard key={item.sku} product={item} onQuickView={setQuick} eager={page === 1 && i < 4} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {pageItems.map((item) => (
                  <ProductRow key={item.sku} product={item} onQuickView={setQuick} />
                ))}
              </div>
            )}
          </div>

          {total > PER_PAGE_OPTIONS[0] && (
            <div className="mt-10 flex flex-col items-center gap-4">
              <Pagination page={page} totalPages={totalPages} onPage={goToPage} />
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
                <span className="tabular-nums">
                  Showing {formatNumber(start + 1, 0)}–{formatNumber(Math.min(start + state.perPage, total), 0)} of {formatNumber(total, 0)}
                </span>
                <span aria-hidden="true">·</span>
                <label className="flex items-center gap-1.5">
                  Per page
                  <select
                    value={state.perPage}
                    onChange={(e) => setState((s) => ({ ...s, perPage: Number(e.target.value), page: 1 }))}
                    className="h-8 rounded-lg border bg-background px-2 text-[13px] font-medium text-foreground outline-none focus:border-ring"
                  >
                    {PER_PAGE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          )}
        </section>
      </div>

      <Dialog open={filtersOpen} onClose={() => setFiltersOpen(false)} label="Filters" side="left" width="24rem">
        <div className="flex h-full flex-col bg-background shadow-2xl">
          <div className="flex h-16 shrink-0 items-center justify-between border-b px-5">
            <h2 className="text-base font-semibold text-foreground">Filters</h2>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              aria-label="Close filters"
              className="grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <XIcon size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-3">
            <FacetPanel facets={facets} state={state} result={result} actions={actions} />
          </div>
          <div className="flex shrink-0 gap-2 border-t p-4">
            <Button variant="outline" onClick={clearAll} disabled={!activeCount}>
              Clear
            </Button>
            <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
              Show {formatNumber(total, 0)} {total === 1 ? "result" : "results"}
            </Button>
          </div>
        </div>
      </Dialog>

      <QuickView product={quick} onClose={() => setQuick(null)} />
    </div>
  );
}
