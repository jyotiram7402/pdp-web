import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogPageView } from "@/components/catalog/catalog-page-view";
import { categoryCrumbs, productsIn } from "@/lib/catalog-core";
import { getCatalog } from "@/lib/data";
import { buildIndex } from "@/lib/facets";

type Props = { params: Promise<{ slug: string[] }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return Array.from(getCatalog().nodes.values()).map((node) => ({ slug: node.path }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const node = getCatalog().nodes.get(slug.join("/"));
  if (!node) return {};
  return {
    title: node.names.length > 1 ? `${node.name} · ${node.names[node.names.length - 2]}` : node.name,
    description: node.description || `Browse ${node.count} ${node.name.toLowerCase()} with full specifications, CAD models and compatible accessories.`,
    alternates: { canonical: node.href },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const catalog = getCatalog();
  const node = catalog.nodes.get(slug.join("/"));
  if (!node) notFound();

  return (
    <CatalogPageView
      title={node.name}
      description={node.description}
      breadcrumbs={[{ name: "Home", href: "/" }, { name: "Products", href: "/catalog" }, ...categoryCrumbs(node)]}
      subcategories={node.children.map((n) => ({ name: n.name, href: n.href, count: n.count, image: n.image }))}
      index={buildIndex(productsIn(catalog, node))}
      explorerKey={node.href}
    />
  );
}
