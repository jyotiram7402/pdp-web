"use client";

import { useEffect } from "react";
import type { CardProduct } from "@/lib/types";
import { recent, recentStore, useStore } from "@/lib/store";
import { ProductRail } from "../product-rail";
import { SectionHeading } from "../ui/primitives";

/** Records the current product in the visitor's history. */
export function TrackView({ product }: { product: CardProduct }) {
  useEffect(() => {
    recent.push(product);
  }, [product]);
  return null;
}

export function RecentlyViewed({ exclude, title = "Recently viewed" }: { exclude?: string; title?: string }) {
  const items = useStore(recentStore).filter((p) => p.sku !== exclude);
  if (!items.length) return null;
  return (
    <section aria-labelledby="recently-viewed">
      <SectionHeading id="recently-viewed" title={title} />
      <ProductRail products={items} label={title} className="mt-6" />
    </section>
  );
}
