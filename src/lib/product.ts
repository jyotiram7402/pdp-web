import type { CardProduct, Product } from "./types";
import { HIGHLIGHT_SPECS } from "@/config/facets";
import { formatNumber, toNumber } from "./format";
import { specValue } from "./utils";

export function productHref(slug: string): string {
  return `/product/${slug}`;
}

/** Reads a min/max spec pair as an ordered numeric range. */
export function rangeSpec(product: Product, minName: string, maxName: string): [number, number] | null {
  const lo = toNumber(specValue(product, minName));
  const hi = toNumber(specValue(product, maxName));
  if (lo == null || hi == null) return null;
  return lo <= hi ? [lo, hi] : [hi, lo];
}

export function formatRange(range: [number, number], unit = "mm"): string {
  return `${formatNumber(range[0], 1)}–${formatNumber(range[1], 1)} ${unit}`;
}

export function gripRange(product: Product): [number, number] | null {
  return rangeSpec(product, "Grip - Minimum", "Grip - Maximum");
}

export function panelRange(product: Product): [number, number] | null {
  return rangeSpec(product, "Min. Outer Panel Thickness", "Max Outer Panel Thickness");
}

export function highlightsFor(product: Product): string[] {
  const out: string[] = [];
  const grip = gripRange(product);
  if (grip) out.push(`Grip ${formatRange(grip)}`);
  for (const name of HIGHLIGHT_SPECS) {
    if (out.length >= 3) break;
    const value = specValue(product, name);
    if (value && value.length <= 28 && !out.includes(value)) out.push(value);
  }
  return out;
}

export function toCard(product: Product): CardProduct {
  return {
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    title: product.title,
    image: product.images[0]?.src ?? null,
    price: product.price,
    stock: product.stock.status,
    familyCode: product.family.code,
    familyName: product.family.name,
    accessoryType: product.accessoryType,
    highlights: highlightsFor(product),
  };
}
