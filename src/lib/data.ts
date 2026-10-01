import fs from "node:fs";
import path from "node:path";
import type { CategoryMeta, Product } from "./types";
import { buildCatalog, type Catalog } from "./catalog-core";

/**
 * Server-only data access. Reads data/*.json once per server process.
 * Never import this file from a "use client" component.
 */
let catalog: Catalog | undefined;

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", file), "utf8")) as T;
}

export function getCatalog(): Catalog {
  if (!catalog) {
    catalog = buildCatalog(readJson<Product[]>("products.json"), readJson<CategoryMeta[]>("categories.json"));
  }
  return catalog;
}
