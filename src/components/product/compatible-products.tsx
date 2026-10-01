"use client";

import { useState } from "react";
import Link from "next/link";
import type { CardProduct } from "@/lib/types";
import type { CompatibleGroup } from "@/lib/catalog-core";
import { addManyToCart, addManyToQuote } from "@/lib/actions";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProductCard } from "../product-card";
import { Button, buttonVariants } from "../ui/button";
import { PuzzleIcon, XIcon } from "../ui/icons";
import { EmptyState } from "../ui/primitives";

const INITIAL = 10;

/**
 * Compatible products: accessories and mating parts grouped by type, with
 * multi-select so a visitor can add a complete kit to the cart or quote in one go.
 */
export function CompatibleProducts({ groups, sku }: { groups: CompatibleGroup[]; sku: string }) {
  const all = groups.flatMap((g) => g.items.map((item) => ({ ...item, group: g.group })));
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  if (!all.length) {
    return (
      <EmptyState
        icon={<PuzzleIcon size={22} />}
        title="No compatible accessories are listed for this part yet"
        description={`Our team can confirm mating parts, keys, cams, gaskets and tools that work with ${sku}.`}
      >
        <Link href="/quote" className={buttonVariants({ variant: "outline" })}>
          Ask about compatible parts
        </Link>
      </EmptyState>
    );
  }

  const tabs = [{ key: "all", label: "All", count: all.length }, ...groups.map((g) => ({ key: g.group, label: g.group, count: g.items.length }))];
  const inTab = tab === "all" ? all : all.filter((item) => item.group === tab);
  const visible = expanded ? inTab : inTab.slice(0, INITIAL);
  const picked = all.filter((item) => selected.includes(item.sku));
  const pickedTotal = picked.reduce((sum, item) => sum + (item.price ?? 0), 0);

  const toggle = (product: CardProduct) =>
    setSelected((list) => (list.includes(product.sku) ? list.filter((s) => s !== product.sku) : [...list, product.sku]));

  return (
    <div>
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Accessory types">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => {
              setTab(t.key);
              setExpanded(false);
            }}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
              tab === t.key ? "border-foreground bg-foreground text-background" : "text-foreground hover:border-foreground/30",
            )}
          >
            {t.label}
            <span className="tabular-nums opacity-60">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visible.map((item) => (
          <ProductCard
            key={item.sku}
            product={item}
            note={tab === "all" ? item.group : item.note}
            selected={selected.includes(item.sku)}
            onSelect={toggle}
          />
        ))}
      </div>

      {inTab.length > INITIAL && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={() => setExpanded((e) => !e)}>
            {expanded ? "Show fewer" : `Show all ${inTab.length} compatible products`}
          </Button>
        </div>
      )}

      {picked.length > 0 && (
        <div className="pointer-events-none sticky bottom-24 z-20 mt-6 flex justify-center">
          <div className="animate-rise pointer-events-auto flex flex-wrap items-center gap-2 rounded-2xl border bg-card/95 p-2 pl-4 shadow-[0_24px_60px_-24px_rgb(15_23_42/0.5)] backdrop-blur-md">
            <span className="mr-1 text-sm text-foreground">
              <span className="font-semibold">{picked.length}</span> selected
              {pickedTotal > 0 && <span className="text-muted-foreground"> · {formatPrice(pickedTotal)}</span>}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                addManyToQuote(picked);
                setSelected([]);
              }}
            >
              Add to quote
            </Button>
            <Button
              size="sm"
              onClick={() => {
                addManyToCart(picked);
                setSelected([]);
              }}
            >
              Add to cart
            </Button>
            <button
              type="button"
              onClick={() => setSelected([])}
              aria-label="Clear selection"
              className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <XIcon size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
