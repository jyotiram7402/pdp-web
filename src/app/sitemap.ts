import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getCatalog } from "@/lib/data";
import { productHref } from "@/lib/product";

export default function sitemap(): MetadataRoute.Sitemap {
  const catalog = getCatalog();
  const base = siteConfig.url;
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/catalog`, changeFrequency: "weekly", priority: 0.9 },
    ...Array.from(catalog.nodes.values()).map((node) => ({
      url: `${base}${node.href}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...catalog.products.map((product) => ({
      url: `${base}${productHref(product.slug)}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
