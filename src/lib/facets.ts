import type { CardProduct, Product } from "./types";
import { AUTO_FACETS, FACETS, HIDDEN_SPECS } from "@/config/facets";
import { STOCK_LABEL, toNumber } from "./format";
import { rangeSpec, toCard } from "./product";
import { collator, slugify, specValue } from "./utils";

/* ---------------------------------------------------------------- config types */

export type FacetField = "category" | "family" | "stock" | "certifications" | "kind" | "brand";

interface FacetBase {
  /** URL parameter name. */
  id: string;
  label: string;
  collapsed?: boolean;
}

export interface ListFacetDef extends FacetBase {
  type: "list";
  field?: FacetField;
  spec?: string;
  /** Split comma separated spec values into separate options. */
  multi?: boolean;
}

export interface RangeFacetDef extends FacetBase {
  type: "range";
  field?: "price";
  spec?: string;
  unit?: string;
  format?: "currency" | "number";
}

export interface FitFacetDef extends FacetBase {
  type: "fit";
  minSpec: string;
  maxSpec: string;
  unit: string;
  help?: string;
}

export type FacetDef = ListFacetDef | RangeFacetDef | FitFacetDef;

/* --------------------------------------------------------------- index types */

export interface FacetMeta {
  id: string;
  label: string;
  type: "list" | "range" | "fit";
  /** List facets: option values as they appear in URLs. */
  options: string[];
  /** Optional display labels aligned with `options`. */
  labels: string[] | null;
  min: number;
  max: number;
  unit: string | null;
  format: "currency" | "number" | null;
  help: string | null;
  collapsed: boolean;
}

/** list → option indexes, range → number, fit → [min, max]. */
export type FacetCell = number[] | number | null;

export interface IndexItem extends CardProduct {
  category: string;
  popularity: number;
  added: number;
  featured: boolean;
  /** Facet values aligned with `CatalogIndex.facets`. */
  v: FacetCell[];
}

export interface CatalogIndex {
  facets: FacetMeta[];
  items: IndexItem[];
}

/* ------------------------------------------------------------------- builders */

const RESERVED_PARAMS = new Set(["q", "sort", "page", "per", "view"]);
/** Lists longer than this are ordered by frequency instead of alphabetically. */
const FREQUENCY_ORDER_AFTER = 6;
const STOCK_ORDER = ["in_stock", "low_stock", "out_of_stock"];
const KIND_LABEL: Record<string, string> = { product: "Products", accessory: "Accessories" };

interface Built {
  meta: FacetMeta;
  cells: FacetCell[];
}

function baseMeta(def: FacetDef): FacetMeta {
  return {
    id: def.id,
    label: def.label,
    type: def.type,
    options: [],
    labels: null,
    min: 0,
    max: 0,
    unit: null,
    format: null,
    help: null,
    collapsed: def.collapsed ?? false,
  };
}

function listValues(def: ListFacetDef, product: Product): string[] {
  switch (def.field) {
    case "category":
      return product.category.length ? [product.category[product.category.length - 1]] : [];
    case "family":
      return product.family.code ? [product.family.code] : [];
    case "stock":
      return [product.stock.status];
    case "certifications":
      return product.certifications;
    case "kind":
      return [product.accessoryType ? "accessory" : "product"];
    case "brand":
      return product.brand ? [product.brand] : [];
    default: {
      if (!def.spec) return [];
      const raw = specValue(product, def.spec);
      if (!raw) return [];
      return def.multi ? raw.split(/\s*,\s*/).filter(Boolean) : [raw];
    }
  }
}

function buildList(def: ListFacetDef, products: Product[], familyNames: Map<string, string>): Built | null {
  const perProduct = products.map((p) => listValues(def, p));
  const distinct = new Set<string>();
  for (const values of perProduct) for (const v of values) distinct.add(v);
  if (distinct.size < 2) return null;

  let options = Array.from(distinct);
  if (def.field === "stock") options.sort((a, b) => STOCK_ORDER.indexOf(a) - STOCK_ORDER.indexOf(b));
  else if (def.field === "kind") options = ["product", "accessory"].filter((o) => distinct.has(o));
  else if (options.length > FREQUENCY_ORDER_AFTER) {
    // Long lists: most common options first, so "Show all" hides the rare ones.
    const frequency = new Map<string, number>();
    for (const values of perProduct) for (const v of values) frequency.set(v, (frequency.get(v) ?? 0) + 1);
    options.sort((a, b) => (frequency.get(b) ?? 0) - (frequency.get(a) ?? 0) || collator.compare(a, b));
  } else options.sort(collator.compare);

  const position = new Map(options.map((o, i) => [o, i]));
  const cells: FacetCell[] = perProduct.map((values) =>
    values.map((v) => position.get(v)).filter((i): i is number => i !== undefined),
  );

  let labels: string[] | null = null;
  if (def.field === "family") labels = options.map((code) => `${code} · ${familyNames.get(code) ?? ""}`.trim());
  else if (def.field === "stock") labels = options.map((o) => STOCK_LABEL[o as keyof typeof STOCK_LABEL] ?? o);
  else if (def.field === "kind") labels = options.map((o) => KIND_LABEL[o] ?? o);

  return { meta: { ...baseMeta(def), options, labels }, cells };
}

function bounds(values: number[]): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return { min, max };
}

function buildRange(def: RangeFacetDef, products: Product[]): Built | null {
  const cells: FacetCell[] = products.map((p) => {
    if (def.field === "price") return p.price ?? null;
    return def.spec ? toNumber(specValue(p, def.spec)) : null;
  });
  const values = cells.filter((c): c is number => typeof c === "number");
  if (new Set(values).size < 2) return null;
  const { min, max } = bounds(values);
  const currency = def.format === "currency";
  return {
    meta: {
      ...baseMeta(def),
      min: currency ? Math.floor(min) : min,
      max: currency ? Math.ceil(max) : max,
      unit: def.unit ?? null,
      format: def.format ?? "number",
    },
    cells,
  };
}

function buildFit(def: FitFacetDef, products: Product[]): Built | null {
  const cells: FacetCell[] = products.map((p) => rangeSpec(p, def.minSpec, def.maxSpec));
  const ranges = cells.filter((c): c is number[] => Array.isArray(c));
  if (ranges.length < 2) return null;
  const { min } = bounds(ranges.map((r) => r[0]));
  const { max } = bounds(ranges.map((r) => r[1]));
  return {
    meta: { ...baseMeta(def), min, max, unit: def.unit, help: def.help ?? null },
    cells,
  };
}

function autoDefs(products: Product[], used: Set<string>, takenIds: Set<string>): FacetDef[] {
  if (!AUTO_FACETS.enabled) return [];
  const stats = new Map<string, { values: Set<string>; count: number; numeric: boolean; unit?: string }>();
  for (const product of products) {
    for (const spec of product.specs) {
      if (used.has(spec.name) || HIDDEN_SPECS.includes(spec.name)) continue;
      let entry = stats.get(spec.name);
      if (!entry) {
        entry = { values: new Set(), count: 0, numeric: true, unit: spec.unit };
        stats.set(spec.name, entry);
      }
      entry.values.add(spec.value);
      entry.count++;
      if (toNumber(spec.value) == null) entry.numeric = false;
    }
  }

  const defs: FacetDef[] = [];
  const sorted = Array.from(stats.entries()).sort((a, b) => b[1].count - a[1].count);
  for (const [name, entry] of sorted) {
    if (entry.count < AUTO_FACETS.minProducts || entry.values.size < 2) continue;
    let id = slugify(name) || "spec";
    if (RESERVED_PARAMS.has(id) || takenIds.has(id)) id = `spec-${id}`;
    takenIds.add(id);
    if (entry.numeric && entry.unit) {
      defs.push({ id, label: name, type: "range", spec: name, unit: entry.unit, collapsed: true });
    } else if (!entry.numeric && entry.values.size <= AUTO_FACETS.maxOptions) {
      defs.push({ id, label: name, type: "list", spec: name, collapsed: true });
    }
  }
  return defs;
}

/** Builds the compact, serializable filter index for a set of products. */
export function buildIndex(products: Product[]): CatalogIndex {
  const familyNames = new Map(products.map((p) => [p.family.code, p.family.name]));
  const used = new Set<string>();
  const takenIds = new Set<string>();
  for (const def of FACETS) {
    takenIds.add(def.id);
    if (def.type === "fit") {
      used.add(def.minSpec);
      used.add(def.maxSpec);
    } else if (def.spec) {
      used.add(def.spec);
    }
  }

  const defs = [...FACETS, ...autoDefs(products, used, takenIds)];
  const facets: FacetMeta[] = [];
  const columns: FacetCell[][] = [];
  for (const def of defs) {
    const built =
      def.type === "list"
        ? buildList(def, products, familyNames)
        : def.type === "range"
          ? buildRange(def, products)
          : buildFit(def, products);
    if (built) {
      facets.push(built.meta);
      columns.push(built.cells);
    }
  }

  const items: IndexItem[] = products.map((product, i) => ({
    ...toCard(product),
    category: product.category[product.category.length - 1] ?? "",
    popularity: product.popularity,
    added: product.added ?? 0,
    featured: product.featured,
    v: columns.map((column) => column[i]),
  }));

  return { facets, items };
}

export function optionLabel(facet: FacetMeta, index: number): string {
  return facet.labels?.[index] ?? facet.options[index] ?? "";
}
