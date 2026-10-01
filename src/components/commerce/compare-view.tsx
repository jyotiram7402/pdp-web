"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { addToCart } from "@/lib/actions";
import { fetchProduct } from "@/lib/client-data";
import { STOCK_LABEL, formatPrice, formatSpec } from "@/lib/format";
import { productHref } from "@/lib/product";
import { compare, compareStore, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "../ui/button";
import { CartIcon, CompareIcon, XIcon } from "../ui/icons";
import { EmptyState } from "../ui/primitives";
import { ProductImage } from "../ui/product-image";

interface Row {
  name: string;
  values: string[];
  differs: boolean;
}

export function CompareView() {
  const items = useStore(compareStore);
  const [loaded, setLoaded] = useState<Record<string, Product | null>>({});
  const [diffOnly, setDiffOnly] = useState(false);

  useEffect(() => {
    let alive = true;
    for (const item of items) {
      if (item.sku in loaded) continue;
      fetchProduct(item.slug)
        .then((p) => alive && setLoaded((m) => ({ ...m, [item.sku]: p })))
        .catch(() => alive && setLoaded((m) => ({ ...m, [item.sku]: null })));
    }
    return () => {
      alive = false;
    };
  }, [items, loaded]);

  const rows = useMemo<Row[]>(() => {
    const products = items.map((i) => loaded[i.sku]);
    const names: string[] = [];
    for (const p of products) for (const s of p?.specs ?? []) if (!names.includes(s.name)) names.push(s.name);
    const make = (name: string, values: string[]): Row => ({ name, values, differs: new Set(values).size > 1 });
    return [
      make("Price", items.map((i) => formatPrice(i.price))),
      make("Availability", items.map((i) => STOCK_LABEL[i.stock])),
      make("Product family", items.map((i) => `${i.familyCode} · ${i.familyName}`)),
      make("Part type", items.map((i) => i.accessoryType ?? "Product")),
      ...names.map((name) =>
        make(
          name,
          products.map((p) => {
            if (p === undefined) return "…";
            const spec = p?.specs.find((s) => s.name === name);
            return spec ? formatSpec(spec).value : "—";
          }),
        ),
      ),
      make("Certifications", products.map((p) => (p === undefined ? "…" : p?.certifications.join(", ") || "—"))),
    ];
  }, [items, loaded]);

  if (!items.length) {
    return (
      <EmptyState
        icon={<CompareIcon size={22} />}
        title="Nothing to compare yet"
        description="Use the compare button on any product card or product page to add up to 4 parts."
      >
        <Link href="/catalog" className={buttonVariants({ variant: "ink" })}>
          Browse products
        </Link>
      </EmptyState>
    );
  }

  const visible = diffOnly ? rows.filter((r) => r.differs) : rows;
  const columns = `minmax(150px, 220px) repeat(${items.length}, minmax(210px, 1fr))`;
  // Explicit minimum (not max-content) so long titles wrap instead of widening columns.
  const minWidth = 220 + items.length * 220;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground">
          <input type="checkbox" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} className="size-4 accent-primary" />
          Show differences only
        </label>
        <Button variant="ghost" size="sm" onClick={compare.clear}>
          Clear all
        </Button>
      </div>

      <div className="overflow-x-auto rounded-3xl border bg-card">
        <div style={{ minWidth }}>
          <div className="sticky top-0 z-10 grid border-b bg-card" style={{ gridTemplateColumns: columns }}>
            <div className="flex items-end p-4 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {items.length} of 4 products
            </div>
            {items.map((item) => (
              <div key={item.sku} className="relative border-l p-4">
                <button
                  type="button"
                  onClick={() => compare.remove(item.sku)}
                  aria-label={`Remove ${item.sku}`}
                  className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <XIcon size={15} />
                </button>
                <Link href={productHref(item.slug)} className="block">
                  <ProductImage src={item.image} alt={item.title} sizes="200px" className="aspect-[4/3] rounded-2xl" imageClassName="p-4" />
                  <p className="mt-3 font-mono text-sm font-semibold text-foreground hover:text-primary">{item.sku}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">{item.title}</p>
                </Link>
                <Button size="sm" className="mt-3 w-full" onClick={() => addToCart(item)}>
                  <CartIcon size={15} /> Add to cart
                </Button>
              </div>
            ))}
          </div>
          {visible.map((row) => (
            <div
              key={row.name}
              className={cn("grid border-b text-sm last:border-b-0", row.differs && "bg-primary-soft/35")}
              style={{ gridTemplateColumns: columns }}
            >
              <div className="p-4 font-medium text-muted-foreground">{row.name}</div>
              {row.values.map((value, i) => (
                <div key={items[i]?.sku ?? i} className="border-l p-4 text-foreground">
                  {value}
                </div>
              ))}
            </div>
          ))}
          {!visible.length && <p className="p-8 text-center text-sm text-muted-foreground">These products have identical specifications.</p>}
        </div>
      </div>
    </div>
  );
}
