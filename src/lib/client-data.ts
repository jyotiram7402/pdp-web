import type { Product } from "./types";
import type { SearchIndex } from "./search";

/** Browser-side loaders for the static JSON endpoints (cached per session). */

const productCache = new Map<string, Promise<Product>>();

export function fetchProduct(slug: string): Promise<Product> {
  let request = productCache.get(slug);
  if (!request) {
    request = fetch(`/api/products/${encodeURIComponent(slug)}`).then((res) => {
      if (!res.ok) throw new Error(`Product ${slug} not found`);
      return res.json() as Promise<Product>;
    });
    request.catch(() => productCache.delete(slug));
    productCache.set(slug, request);
  }
  return request;
}

let searchIndex: Promise<SearchIndex> | null = null;

export function loadSearchIndex(): Promise<SearchIndex> {
  if (!searchIndex) {
    searchIndex = fetch("/api/search-index").then((res) => {
      if (!res.ok) throw new Error("Search index unavailable");
      return res.json() as Promise<SearchIndex>;
    });
    searchIndex.catch(() => {
      searchIndex = null;
    });
  }
  return searchIndex;
}
