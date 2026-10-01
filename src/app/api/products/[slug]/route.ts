import { getCatalog } from "@/lib/data";

/** Full product record as static JSON (used by quick view and compare). */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getCatalog().products.map((product) => ({ slug: product.slug }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getCatalog().bySlug.get(slug);
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(product);
}
