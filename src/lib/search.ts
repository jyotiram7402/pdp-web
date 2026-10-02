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
  /** Searchable spec values and certifications. */
  keywords: string[];
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

/**
 * Lowercase, with dashes read as spaces and "&" as "and", so "Self-Adjusting" / "self adjusting"
 * and "Lift & Turn" / "lift and turn" compare equal.
 */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[-\u2010-\u2015]/g, " ")
    .replace(/&/g, " and ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Query words; a dashed word stays one phrase ("e3-15" → "e3 15", which does not match E3-5-15). */
export function tokenize(query: string): string[] {
  return query.split(/\s+/).map(normalizeText).filter(Boolean).slice(0, 8);
}

/** What a query is matched against, prepared once per item. */
export interface Haystack {
  /** Normalized fields and keywords. */
  text: string;
  /** Compact part number, matched anywhere ("1515" finds E3-15-15). */
  sku: string;
  /** Compact keywords, matched from the start ("ip66" finds "IP 66"). */
  codes: string[];
}

export function haystack(fields: Array<string | null | undefined>, sku = "", keywords: string[] = []): Haystack {
  return {
    text: normalizeText([...fields, ...keywords].filter(Boolean).join(" ")),
    sku: compactKey(sku),
    codes: keywords.map(compactKey).filter(Boolean),
  };
}

const isWordChar = (char: string) => /[a-z0-9]/.test(char);

/** True when `token` starts a word of `text`: "ip" finds "IP 66" but not "grip", "lock" finds "Key Locking". */
function startsWord(text: string, token: string): boolean {
  if (!isWordChar(token[0])) return text.includes(token);
  for (let i = text.indexOf(token); i !== -1; i = text.indexOf(token, i + 1)) {
    if (i === 0 || !isWordChar(text[i - 1])) return true;
  }
  return false;
}

/**
 * Every token must start a word, or match the part number or a keyword with spaces and
 * punctuation ignored, so "e3 15 15", "E3-15-15", "IP66" and "ip-66" all work.
 */
export function matchTokens(h: Haystack, tokens: string[]): boolean {
  return tokens.every((token) => {
    if (startsWord(h.text, token)) return true;
    const compact = compactKey(token);
    return compact.length >= 2 && (h.sku.includes(compact) || h.codes.some((code) => code.startsWith(compact)));
  });
}

/** Score boost for part-number matches so "e3-15" ranks E3-15-15 first. */
function skuScore(skuKey: string, tokens: string[]): number {
  const q = compactKey(tokens.join(""));
  if (!q) return 0;
  if (skuKey === q) return 100;
  if (skuKey.startsWith(q)) return 50;
  if (skuKey.includes(q)) return 20;
  return 0;
}

/** Ranking of a match: part-number hits first, then query words found in the title. */
export function relevance(h: Haystack, title: string, tokens: string[]): number {
  let score = skuScore(h.sku, tokens);
  const text = normalizeText(title);
  for (const t of tokens) if (text.includes(t)) score += 4;
  return score;
}

const productHaystacks = new WeakMap<SearchProduct, Haystack>();
function productHaystack(item: SearchProduct): Haystack {
  let h = productHaystacks.get(item);
  if (!h) {
    h = haystack([item.sku, item.title, item.family, item.familyName, item.category, item.accessory], item.sku, item.keywords);
    productHaystacks.set(item, h);
  }
  return h;
}

export function searchProducts(index: SearchIndex, query: string, limit = 8): { items: SearchProduct[]; total: number } {
  const tokens = tokenize(query);
  if (!tokens.length) return { items: [], total: 0 };
  const scored: Array<{ item: SearchProduct; score: number }> = [];
  for (const item of index.products) {
    const h = productHaystack(item);
    if (matchTokens(h, tokens)) scored.push({ item, score: relevance(h, item.title, tokens) });
  }
  scored.sort((a, b) => b.score - a.score);
  return { items: scored.slice(0, limit).map((s) => s.item), total: scored.length };
}

export function searchCategories(index: SearchIndex, query: string, limit = 3): SearchCategory[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  return index.categories.filter((c) => matchTokens(haystack([c.trail]), tokens)).slice(0, limit);
}

export function searchFamilies(index: SearchIndex, query: string, limit = 3): SearchFamily[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  return index.families.filter((f) => matchTokens(haystack([f.code, f.name], f.code), tokens)).slice(0, limit);
}
