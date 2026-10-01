import type { StockStatus } from "./types";
import { compactKey } from "./utils";

export interface SearchProduct {
  sku: string;
  slug: string;
  title: string;
  family: string;
  familyName: string;
  category: string;
  image: string | null;
  price: number | null;
  stock: StockStatus;
  accessory: string | null;
}

export interface SearchCategory {
  name: string;
  trail: string;
  href: string;
  count: number;
}

export interface SearchFamily {
  code: string;
  name: string;
  href: string;
  count: number;
  image: string | null;
}

export interface SearchIndex {
  products: SearchProduct[];
  categories: SearchCategory[];
  families: SearchFamily[];
}

export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 8);
}

/** Every token must appear in the text, or (for part numbers) in the compacted SKU. */
export function matchTokens(text: string, skuKey: string, tokens: string[]): boolean {
  return tokens.every((token) => {
    if (text.includes(token)) return true;
    const compact = compactKey(token);
    return compact.length >= 2 && skuKey.includes(compact);
  });
}

/** Score boost for part-number matches so "e3-15" ranks E3-15-15 first. */
export function skuScore(skuKey: string, tokens: string[]): number {
  const q = compactKey(tokens.join(""));
  if (!q) return 0;
  if (skuKey === q) return 100;
  if (skuKey.startsWith(q)) return 50;
  if (skuKey.includes(q)) return 20;
  return 0;
}

export function searchProducts(index: SearchIndex, query: string, limit = 8): { items: SearchProduct[]; total: number } {
  const tokens = tokenize(query);
  if (!tokens.length) return { items: [], total: 0 };
  const scored: Array<{ item: SearchProduct; score: number }> = [];
  for (const item of index.products) {
    const key = compactKey(item.sku);
    const text = `${item.sku} ${item.title} ${item.family} ${item.familyName} ${item.category} ${item.accessory ?? ""}`.toLowerCase();
    if (!matchTokens(text, key, tokens)) continue;
    let score = skuScore(key, tokens);
    const title = item.title.toLowerCase();
    for (const t of tokens) if (title.includes(t)) score += 4;
    scored.push({ item, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return { items: scored.slice(0, limit).map((s) => s.item), total: scored.length };
}

export function searchCategories(index: SearchIndex, query: string, limit = 3): SearchCategory[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  return index.categories.filter((c) => tokens.every((t) => c.trail.toLowerCase().includes(t))).slice(0, limit);
}

export function searchFamilies(index: SearchIndex, query: string, limit = 3): SearchFamily[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  return index.families
    .filter((f) => matchTokens(`${f.code} ${f.name}`.toLowerCase(), compactKey(f.code), tokens))
    .slice(0, limit);
}
