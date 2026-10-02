import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/product/product-view";
import { getProductPageData } from "@/lib/catalog-core";
import { getCatalog } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";
import { productHref } from "@/lib/product";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getCatalog().products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getCatalog().bySlug.get(slug);
  if (!product) return {};
  return pageMetadata({
    title: `${product.sku} · ${product.name}`,
    description: product.title,
    path: productHref(product.slug),
    ogTitle: `${product.sku} — ${product.name}`,
    images: product.images.slice(0, 1).map((image) => ({ url: image.src, alt: image.alt })),
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const catalog = getCatalog();
  const product = catalog.bySlug.get(slug);
  if (!product) notFound();
  return <ProductView data={getProductPageData(catalog, product)} />;
}
