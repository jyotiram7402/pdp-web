import type { Metadata } from "next";
import { CatalogPageView } from "@/components/catalog/catalog-page-view";
import { getCatalog } from "@/lib/data";
import { buildIndex } from "@/lib/facets";

export const metadata: Metadata = {
  title: "All products",
  description: "Browse every part with live filters for fit, material, finish, access restriction, IP rating and compliance.",
  alternates: { canonical: "/catalog" },
};

export default function CatalogPage() {
  const catalog = getCatalog();
  const level = catalog.roots.length === 1 ? catalog.roots[0].children : catalog.roots;
  return (
    <CatalogPageView
      title="All products"
      description="Filter by the exact grip and panel thickness of your application, or by material, finish, access restriction, IP rating and certification."
      breadcrumbs={[
        { name: "Home", href: "/" },
        { name: "Products", href: "/catalog" },
      ]}
      subcategories={level.map((n) => ({ name: n.name, href: n.href, count: n.count, image: n.image }))}
      index={buildIndex(catalog.products)}
      explorerKey="all"
    />
  );
}
