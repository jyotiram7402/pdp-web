import type { CatalogIndex, FacetCell, FacetMeta, IndexItem } from "./facets";
import { matchTokens, skuScore, tokenize } from "./search";
import { collator, compactKey } from "./utils";

export type SortKey =
  | "featured"
  | "popular"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "sku-asc"
  | "sku-desc"
  | "name-asc"
  | "name-desc";

export const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: "featured", label: "Featured" },
  { key: "popular", label: "Most popular" },
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "sku-asc", label: "Part number: A–Z" },
  { key: "sku-desc", label: "Part number: Z–A" },
  { key: "name-asc", label: "Name: A–Z" },
  { key: "name-desc", label: "Name: Z–A" },
];

export const PER_PAGE_OPTIONS: number[] = [24, 48, 96];

export interface FilterState {
  q: string;
  list: Record<string, string[]>;
  range: Record<string, [number | null, number | null]>;
  fit: Record<string, number | null>;
  sort: SortKey;
  page: number;
  perPage: number;
}

export function defaultState(): FilterState {
  return { q: "", list: {}, range: {}, fit: {}, sort: "featured", page: 1, perPage: 24 };
}

/* ------------------------------------------------------------------ URL state */

function finite(value: string | undefined): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function parseState(search: string, facets: FacetMeta[]): FilterState {
  const params = new URLSearchParams(search);
  const state = defaultState();
  state.q = (params.get("q") ?? "").slice(0, 120);

  const sort = params.get("sort");
  if (sort && SORT_OPTIONS.some((o) => o.key === sort)) state.sort = sort as SortKey;
  const per = Number(params.get("per"));
  if (PER_PAGE_OPTIONS.includes(per)) state.perPage = per;
  const page = Number(params.get("page"));
  if (Number.isInteger(page) && page > 1) state.page = page;

  for (const facet of facets) {
    if (facet.type === "list") {
      const values = params.getAll(facet.id).filter((v) => facet.options.includes(v));
      if (values.length) state.list[facet.id] = Array.from(new Set(values));
    } else if (facet.type === "range") {
      const match = (params.get(facet.id) ?? "").match(/^(-?\d*\.?\d*)\.\.(-?\d*\.?\d*)$/);
      if (match) {
        const lo = finite(match[1]);
        const hi = finite(match[2]);
        if (lo != null || hi != null) state.range[facet.id] = [lo, hi];
      }
    } else {
      const value = finite(params.get(facet.id) ?? undefined);
      if (value != null) state.fit[facet.id] = value;
    }
  }
  return state;
}

export function toSearch(state: FilterState, facets: FacetMeta[]): string {
  const params = new URLSearchParams();
  if (state.q.trim()) params.set("q", state.q.trim());
  for (const facet of facets) {
    if (facet.type === "list") {
      for (const value of state.list[facet.id] ?? []) params.append(facet.id, value);
    } else if (facet.type === "range") {
      const range = state.range[facet.id];
      if (range && (range[0] != null || range[1] != null)) params.set(facet.id, `${range[0] ?? ""}..${range[1] ?? ""}`);
    } else {
      const value = state.fit[facet.id];
      if (value != null) params.set(facet.id, String(value));
    }
  }
  if (state.sort !== "featured") params.set("sort", state.sort);
  if (state.perPage !== 24) params.set("per", String(state.perPage));
  if (state.page > 1) params.set("page", String(state.page));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function countActive(state: FilterState): number {
  let n = 0;
  for (const values of Object.values(state.list)) n += values.length;
  for (const range of Object.values(state.range)) if (range[0] != null || range[1] != null) n++;
  for (const value of Object.values(state.fit)) if (value != null) n++;
  return n;
}

/* ------------------------------------------------------------------ filtering */

export interface RangeStat {
  min: number;
  max: number;
  hist: number[];
}

export interface FilterResult {
  items: IndexItem[];
  /** Per list facet: option counts if that option were selected (OR within a facet, AND across). */
  counts: number[][];
  /** Per range facet: bounds and histogram of matching items, ignoring its own filter. */
  stats: Array<RangeStat | null>;
}

export const HISTOGRAM_BINS = 24;

const textCache = new WeakMap<IndexItem, string>();
function itemText(item: IndexItem): string {
  let text = textCache.get(item);
  if (text === undefined) {
    text = `${item.sku} ${item.title} ${item.familyCode} ${item.familyName} ${item.accessoryType ?? ""} ${item.category}`.toLowerCase();
    textCache.set(item, text);
  }
  return text;
}

export function runFilters(index: CatalogIndex, state: FilterState): FilterResult {
  const { facets, items } = index;
  const tests: Array<{ fi: number; test: (cell: FacetCell) => boolean }> = [];

  facets.forEach((facet, fi) => {
    if (facet.type === "list") {
      const selected = state.list[facet.id];
      if (!selected?.length) return;
      const wanted = new Set(selected.map((v) => facet.options.indexOf(v)).filter((i) => i >= 0));
      if (!wanted.size) return;
      tests.push({ fi, test: (cell) => Array.isArray(cell) && cell.some((i) => wanted.has(i)) });
    } else if (facet.type === "range") {
      const range = state.range[facet.id];
      if (!range || (range[0] == null && range[1] == null)) return;
      const [lo, hi] = range;
      tests.push({ fi, test: (cell) => typeof cell === "number" && (lo == null || cell >= lo) && (hi == null || cell <= hi) });
    } else {
      const value = state.fit[facet.id];
      if (value == null) return;
      tests.push({ fi, test: (cell) => Array.isArray(cell) && cell.length === 2 && cell[0] <= value && value <= cell[1] });
    }
  });

  const tokens = tokenize(state.q);
  const counts = facets.map((f) => (f.type === "list" ? new Array<number>(f.options.length).fill(0) : []));
  const stats: Array<RangeStat | null> = facets.map((f) =>
    f.type === "range" ? { min: Infinity, max: -Infinity, hist: new Array<number>(HISTOGRAM_BINS).fill(0) } : null,
  );

  const tally = (item: IndexItem, only: number) => {
    for (let fi = 0; fi < facets.length; fi++) {
      if (only >= 0 && fi !== only) continue;
      const facet = facets[fi];
      const cell = item.v[fi];
      if (facet.type === "list" && Array.isArray(cell)) {
        for (const i of cell) counts[fi][i]++;
      } else if (facet.type === "range" && typeof cell === "number") {
        const stat = stats[fi];
        if (!stat) continue;
        if (cell < stat.min) stat.min = cell;
        if (cell > stat.max) stat.max = cell;
        const span = facet.max - facet.min || 1;
        const bin = Math.min(HISTOGRAM_BINS - 1, Math.max(0, Math.floor(((cell - facet.min) / span) * HISTOGRAM_BINS)));
        stat.hist[bin]++;
      }
    }
  };

  const matched: IndexItem[] = [];
  for (const item of items) {
    if (tokens.length && !matchTokens(itemText(item), compactKey(item.sku), tokens)) continue;
    let failed = -1;
    let failures = 0;
    for (const t of tests) {
      if (!t.test(item.v[t.fi])) {
        failures++;
        failed = t.fi;
        if (failures > 1) break;
      }
    }
    if (failures === 0) {
      matched.push(item);
      tally(item, -1);
    } else if (failures === 1) {
      tally(item, failed);
    }
  }

  return {
    items: sortItems(matched, state.sort, tokens),
    counts,
    stats: stats.map((s) => (s && s.min <= s.max ? s : null)),
  };
}

export function sortItems(items: IndexItem[], sort: SortKey, tokens: string[] = []): IndexItem[] {
  const list = items.slice();
  const nullsLast = (a: number | null, b: number | null, dir: number) =>
    a == null ? (b == null ? 0 : 1) : b == null ? -1 : (a - b) * dir;
  const featured = (a: IndexItem, b: IndexItem) => Number(b.featured) - Number(a.featured) || b.popularity - a.popularity;

  switch (sort) {
    case "featured": {
      if (!tokens.length) return list.sort(featured);
      const scores = new Map<IndexItem, number>();
      for (const item of list) {
        const title = item.title.toLowerCase();
        let score = skuScore(compactKey(item.sku), tokens);
        for (const t of tokens) if (title.includes(t)) score += 4;
        scores.set(item, score);
      }
      return list.sort((a, b) => (scores.get(b) ?? 0) - (scores.get(a) ?? 0) || featured(a, b));
    }
    case "popular":
      return list.sort((a, b) => b.popularity - a.popularity);
    case "newest":
      return list.sort((a, b) => b.added - a.added);
    case "price-asc":
      return list.sort((a, b) => nullsLast(a.price, b.price, 1));
    case "price-desc":
      return list.sort((a, b) => nullsLast(a.price, b.price, -1));
    case "sku-asc":
      return list.sort((a, b) => collator.compare(a.sku, b.sku));
    case "sku-desc":
      return list.sort((a, b) => collator.compare(b.sku, a.sku));
    case "name-asc":
      return list.sort((a, b) => collator.compare(a.title, b.title));
    case "name-desc":
      return list.sort((a, b) => collator.compare(b.title, a.title));
    default:
      return list;
  }
}
