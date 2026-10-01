import type { ProductSpec } from "./types";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[®™]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Natural, case-insensitive ordering ("IP 65" < "IP 66", "M5" < "M10"). */
export const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

export function specValue(product: { specs: ProductSpec[] }, name: string): string | null {
  const spec = product.specs.find((s) => s.name === name);
  return spec ? spec.value : null;
}

/** Lowercase alphanumerics only, so "e3 15 15", "E3-15-15" and "e31515" all match. */
export function compactKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
