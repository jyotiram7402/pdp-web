import { buildSearchIndex } from "@/lib/catalog-core";
import { getCatalog } from "@/lib/data";

/** Compact search index, generated at build time and served as a static file. */
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildSearchIndex(getCatalog()));
}
