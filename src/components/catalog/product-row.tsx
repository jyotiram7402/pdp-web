"use client";

import { memo } from "react";
import Link from "next/link";
import type { CardProduct } from "@/lib/types";
import { addToCart, addToQuote, toggleCompare } from "@/lib/actions";
import { productHref } from "@/lib/product";
import { compareStore, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";
import { CartIcon, CheckIcon, CompareIcon, EyeIcon, QuoteIcon } from "../ui/icons";
import { Chip, Price, StockDot } from "../ui/primitives";
import { ProductImage } from "../ui/product-image";

/** Dense list-view row for spec-driven browsing. */
export const ProductRow = memo(function ProductRow({ product, onQuickView }: { product: CardProduct; onQuickView?: (p: CardProduct) => void }) {
  const compared = useStore(compareStore).some((p) => p.sku === product.sku);
  return (
    <article className="group relative grid grid-cols-[88px_1fr] gap-x-4 gap-y-3 rounded-2xl border bg-card p-3 transition-[border-color,box-shadow] hover:border-foreground/15 hover:shadow-[0_18px_40px_-30px_rgb(15_23_42/0.45)] has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring sm:grid-cols-[120px_1fr_auto] sm:items-center sm:gap-x-6">
      <ProductImage src={product.image} alt={product.title} sizes="120px" className="aspect-square rounded-xl" imageClassName="p-[10%]" />

      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {product.familyCode}
          {product.familyName ? ` · ${product.familyName}` : ""}
          {product.accessoryType ? ` · ${product.accessoryType}` : ""}
        </p>
        <h3 className="mt-1 font-mono text-[15px] font-semibold tracking-tight text-foreground">
          <Link href={productHref(product.slug)} className="outline-none after:absolute after:inset-0 after:rounded-2xl">
            {product.sku}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted-foreground">{product.title}</p>
        {product.highlights.length > 0 && (
          <div className="mt-2 hidden flex-wrap gap-1 sm:flex">
            {product.highlights.map((h) => (
              <Chip key={h}>{h}</Chip>
            ))}
          </div>
        )}
      </div>

      <div className="col-span-2 flex items-center justify-between gap-3 border-t pt-3 sm:col-span-1 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
        <div className="sm:text-right">
          <Price value={product.price} className="text-base" />
          <StockDot status={product.stock} block className="mt-0.5 sm:justify-end" />
        </div>
        <div className="relative z-10 flex gap-1.5">
          {onQuickView && (
            <button
              type="button"
              onClick={() => onQuickView(product)}
              aria-label={`Quick view ${product.sku}`}
              title="Quick view"
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            >
              <EyeIcon size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={() => toggleCompare(product)}
            aria-pressed={compared}
            aria-label={compared ? `Remove ${product.sku} from compare` : `Add ${product.sku} to compare`}
            title="Compare"
            className={cn(buttonVariants({ variant: compared ? "soft" : "ghost", size: "icon-sm" }))}
          >
            {compared ? <CheckIcon size={16} /> : <CompareIcon size={16} />}
          </button>
          <button
            type="button"
            onClick={() => addToQuote(product)}
            aria-label={`Add ${product.sku} to quote list`}
            title="Add to quote list"
            className={buttonVariants({ variant: "outline", size: "icon-sm" })}
          >
            <QuoteIcon size={16} />
          </button>
          <button type="button" onClick={() => addToCart(product)} className={buttonVariants({ size: "sm" })}>
            <CartIcon size={15} /> Add
          </button>
        </div>
      </div>
    </article>
  );
});
