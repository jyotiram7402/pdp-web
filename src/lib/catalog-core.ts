import type { CardProduct, CategoryMeta, Product, ProductVideo, StockStatus } from "./types";
import type { SearchIndex } from "./search";
import { VARIANT_SPECS } from "@/config/facets";
import { formatRange, gripRange, productHref, toCard } from "./product";
import { collator, slugify, specValue } from "./utils";

export interface CategoryNode {
  name: string;
  slug: string;
  /** Slug segments from the root. */
  path: string[];
  /** Display names from the root. */
  names: string[];
  href: string;
  description: string;
  count: number;
  image: string | null;
  children: CategoryNode[];
}

export interface FamilySummary {
  code: string;
  name: string;
  count: number;
  image: string | null;
  href: string;
  category: string[];
  description: string;
  video: ProductVideo | null;
}

export interface Catalog {
  products: Product[];
  bySku: Map<string, Product>;
  bySlug: Map<string, Product>;
  roots: CategoryNode[];
  nodes: Map<string, CategoryNode>;
  families: FamilySummary[];
}

export interface Crumb {
  name: string;
  href: string;
}

/** Featured first, then most popular, then part number. */
export function defaultOrder(a: Product, b: Product): number {
  return Number(b.featured) - Number(a.featured) || b.popularity - a.popularity || collator.compare(a.sku, b.sku);
}

export function categoryHref(names: string[]): string {
  return names.length ? `/catalog/${names.map(slugify).join("/")}` : "/catalog";
}

export function buildCatalog(input: Product[], categories: CategoryMeta[]): Catalog {
  const products = input.slice().sort(defaultOrder);
  const bySku = new Map(products.map((p) => [p.sku, p]));
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const descriptions = new Map(categories.map((c) => [c.path.join("/"), c.description]));

  const roots: CategoryNode[] = [];
  const nodes = new Map<string, CategoryNode>();
  const fallbackImage = new Map<string, string>();

  for (const product of products) {
    let level = roots;
    const names: string[] = [];
    const path: string[] = [];
    for (const name of product.category) {
      names.push(name);
      path.push(slugify(name));
      const key = path.join("/");
      let node = nodes.get(key);
      if (!node) {
        node = {
          name,
          slug: path[path.length - 1],
          path: path.slice(),
          names: names.slice(),
          href: `/catalog/${key}`,
          description: descriptions.get(names.join("/")) ?? "",
          count: 0,
          image: null,
          children: [],
        };
        nodes.set(key, node);
        level.push(node);
      }
      node.count++;
      const image = product.images[0]?.src;
      if (image) {
        if (!node.image && !product.accessoryType) node.image = image;
        if (!fallbackImage.has(key)) fallbackImage.set(key, image);
      }
      level = node.children;
    }
  }

  for (const [key, node] of nodes) {
    if (!node.image) node.image = fallbackImage.get(key) ?? null;
    node.children.sort((a, b) => b.count - a.count);
  }
  roots.sort((a, b) => b.count - a.count);

  const byFamily = new Map<string, Product[]>();
  for (const product of products) {
    const list = byFamily.get(product.family.code);
    if (list) list.push(product);
    else byFamily.set(product.family.code, [product]);
  }
  const families: FamilySummary[] = Array.from(byFamily.entries())
    .map(([code, list]) => {
      const lead = list.find((p) => !p.accessoryType) ?? list[0];
      return {
        code,
        name: lead.family.name,
        count: list.length,
        image: lead.images[0]?.src ?? null,
        href: `${categoryHref(lead.category)}?family=${encodeURIComponent(code)}`,
        category: lead.category,
        description: lead.description,
        video: list.find((p) => p.videos.length)?.videos[0] ?? null,
      };
    })
    .sort((a, b) => b.count - a.count);

  return { products, bySku, bySlug, roots, nodes, families };
}

export function productsIn(catalog: Catalog, node: CategoryNode | null): Product[] {
  if (!node) return catalog.products;
  return catalog.products.filter((p) => node.path.every((segment, i) => p.category[i] !== undefined && slugify(p.category[i]) === segment));
}

export function categoryCrumbs(node: CategoryNode): Crumb[] {
  return node.path.map((_, i) => ({ name: node.names[i], href: `/catalog/${node.path.slice(0, i + 1).join("/")}` }));
}

/* ---------------------------------------------------------------- product page */

export interface CompatibleGroup {
  group: string;
  items: Array<CardProduct & { note: string | null }>;
}

export interface VariantRow {
  sku: string;
  slug: string;
  price: number | null;
  stock: StockStatus;
  grip: string | null;
  values: string[];
  current: boolean;
}

export interface VariantTable {
  columns: string[];
  showGrip: boolean;
  rows: VariantRow[];
}

export interface ProductPageData {
  product: Product;
  card: CardProduct;
  breadcrumbs: Crumb[];
  related: CardProduct[];
  compatible: CompatibleGroup[];
  variants: VariantTable | null;
  family: FamilySummary | null;
}

function variantTable(catalog: Catalog, product: Product): VariantTable | null {
  const members = catalog.products
    .filter((p) => p.family.code === product.family.code && !!p.accessoryType === !!product.accessoryType)
    .sort((a, b) => collator.compare(a.sku, b.sku));
  if (members.length < 2) return null;

  const distinct = (name: string) => new Set(members.map((m) => specValue(m, name) ?? "—")).size;
  const columns = VARIANT_SPECS.filter((name) => distinct(name) > 1).slice(0, 4);
  const grips = members.map((m) => {
    const range = gripRange(m);
    return range ? formatRange(range) : null;
  });
  const showGrip = new Set(grips.filter(Boolean)).size > 1;

  return {
    columns,
    showGrip,
    rows: members.map((m, i) => ({
      sku: m.sku,
      slug: m.slug,
      price: m.price,
      stock: m.stock.status,
      grip: grips[i],
      values: columns.map((name) => specValue(m, name) ?? "—"),
      current: m.sku === product.sku,
    })),
  };
}

export function getProductPageData(catalog: Catalog, product: Product): ProductPageData {
  const nodeKey = product.category.map(slugify).join("/");
  const node = catalog.nodes.get(nodeKey);
  const breadcrumbs: Crumb[] = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/catalog" },
    ...(node ? categoryCrumbs(node) : []),
    { name: product.sku, href: productHref(product.slug) },
  ];

  const related = product.related
    .map((sku) => catalog.bySku.get(sku))
    .filter((p): p is Product => !!p)
    .map(toCard);

  const groups = new Map<string, CompatibleGroup>();
  for (const ref of product.compatible) {
    const match = catalog.bySku.get(ref.sku);
    if (!match) continue;
    let group = groups.get(ref.group);
    if (!group) {
      group = { group: ref.group, items: [] };
      groups.set(ref.group, group);
    }
    group.items.push({ ...toCard(match), note: ref.note ?? null });
  }

  return {
    product,
    card: toCard(product),
    breadcrumbs,
    related,
    compatible: Array.from(groups.values()),
    variants: variantTable(catalog, product),
    family: catalog.families.find((f) => f.code === product.family.code) ?? null,
  };
}

/* ---------------------------------------------------------------- search index */

export function buildSearchIndex(catalog: Catalog): SearchIndex {
  return {
    products: catalog.products.map((p) => ({
      sku: p.sku,
      slug: p.slug,
      title: p.title,
      family: p.family.code,
      familyName: p.family.name,
      category: p.category[p.category.length - 1] ?? "",
      image: p.images[0]?.src ?? null,
      price: p.price,
      stock: p.stock.status,
      accessory: p.accessoryType,
    })),
    categories: Array.from(catalog.nodes.values()).map((n) => ({
      name: n.name,
      trail: n.names.join(" › "),
      href: n.href,
      count: n.count,
    })),
    families: catalog.families.map((f) => ({ code: f.code, name: f.name, href: f.href, count: f.count, image: f.image })),
  };
}

/* ---------------------------------------------------------------- home page */

export interface HomeData {
  stats: { products: number; families: number; documents: number; compatible: number };
  categories: CategoryNode[];
  families: FamilySummary[];
  featured: CardProduct[];
  showcase: CardProduct[];
  spotlight: { video: ProductVideo; family: FamilySummary } | null;
}

export function buildHomeData(catalog: Catalog): HomeData {
  const categories = catalog.roots.length === 1 ? catalog.roots[0].children : catalog.roots;
  const featured = catalog.products.filter((p) => p.featured && !p.accessoryType && p.images.length).map(toCard);

  // Three hero products from different families.
  const showcase: CardProduct[] = [];
  const seen = new Set<string>();
  for (const card of featured) {
    if (seen.has(card.familyCode)) continue;
    seen.add(card.familyCode);
    showcase.push(card);
    if (showcase.length === 3) break;
  }

  const spotlightFamily = catalog.families.find((f) => f.video);
  return {
    stats: {
      products: catalog.products.length,
      families: catalog.families.length,
      documents: catalog.products.reduce((n, p) => n + p.documents.length, 0),
      compatible: catalog.products.reduce((n, p) => n + p.compatible.length, 0),
    },
    categories,
    families: catalog.families.filter((f) => f.image && f.count > 1),
    featured: featured.slice(0, 12),
    showcase,
    spotlight: spotlightFamily?.video ? { video: spotlightFamily.video, family: spotlightFamily } : null,
  };
}

/* ---------------------------------------------------------------- navigation */

export interface NavCategory {
  name: string;
  href: string;
  count: number;
  image: string | null;
  children: Array<{ name: string; href: string; count: number }>;
}

export interface NavFamily {
  code: string;
  name: string;
  href: string;
  image: string | null;
  count: number;
}

export interface NavData {
  categories: NavCategory[];
  families: NavFamily[];
  total: number;
}

/** Navigation shows the second level (e.g. "Compression Latches") with its children. */
export function buildNav(catalog: Catalog): NavData {
  const level = catalog.roots.length === 1 ? catalog.roots[0].children : catalog.roots;
  return {
    categories: level.map((n) => ({
      name: n.name,
      href: n.href,
      count: n.count,
      image: n.image,
      children: n.children.map((c) => ({ name: c.name, href: c.href, count: c.count })),
    })),
    families: catalog.families
      .filter((f) => f.image)
      .slice(0, 4)
      .map((f) => ({ code: f.code, name: f.name, href: f.href, image: f.image, count: f.count })),
    total: catalog.products.length,
  };
}
