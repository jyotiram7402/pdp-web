"use client";

import { memo } from "react";
import Link from "next/link";
import type { CardProduct } from "@/lib/types";
import { addToCart, addToQuote, toggleCompare } from "@/lib/actions";
import { productHref } from "@/lib/product";
import { compareStore, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { CartIcon, CheckIcon, CompareIcon, EyeIcon, QuoteIcon } from "./ui/icons";
import { Chip, Price, StockDot } from "./ui/primitives";
import { ProductImage } from "./ui/product-image";

export const CARD_SIZES = "(min-width: 1536px) 18vw, (min-width: 1024px) 24vw, (min-width: 640px) 33vw, 50vw";

export const ProductCard = memo(function ProductCard({
  product,
  onQuickView,
  eager = false,
  selected,
  onSelect,
  note,
  className,
}: {
  product: CardProduct;
  onQuickView?: (product: CardProduct) => void;
  eager?: boolean;
  /** When provided, the card shows a selection checkbox (used by Compatible products). */
  selected?: boolean;
  onSelect?: (product: CardProduct) => void;
  note?: string | null;
  className?: string;
}) {
  const compared = useStore(compareStore).some((p) => p.sku === product.sku);
  const href = productHref(product.slug);

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-card p-2 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_22px_44px_-28px_rgb(15_23_42/0.4)] has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring",
        selected && "border-primary ring-1 ring-primary",
        className,
      )}
    >
      <div className="relative">
        <ProductImage
          src={product.image}
          alt={product.title}
          sizes={CARD_SIZES}
          eager={eager}
          className="aspect-square rounded-xl"
          imageClassName="p-[10%] transition-transform duration-500 ease-out group-hover:scale-[1.045]"
        />

        <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1">
          {onSelect && (
            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-background/90 px-2 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur">
              <input
                type="checkbox"
                checked={!!selected}
                onChange={() => onSelect(product)}
                className="size-3.5 accent-primary"
                aria-label={`Select ${product.sku}`}
              />
              Select
            </label>
          )}
          {product.accessoryType && !onSelect && (
            <span className="rounded-md bg-background/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/80 shadow-sm backdrop-blur">
              {product.accessoryType}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => toggleCompare(product)}
          aria-pressed={compared}
          aria-label={compared ? `Remove ${product.sku} from compare` : `Add ${product.sku} to compare`}
          title={compared ? "Remove from compare" : "Add to compare"}
          className={cn(
            "absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-lg shadow-sm backdrop-blur transition-all",
            compared
              ? "bg-primary text-primary-foreground"
              : "bg-background/90 text-muted-foreground opacity-100 hover:text-foreground lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100",
          )}
        >
          {compared ? <CheckIcon size={15} /> : <CompareIcon size={15} />}
        </button>

        {onQuickView && (
          <button
            type="button"
            onClick={() => onQuickView(product)}
            className="absolute inset-x-2 bottom-2 z-10 hidden h-9 items-center justify-center gap-1.5 rounded-lg bg-background/90 text-[13px] font-medium text-foreground opacity-0 shadow-sm backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:opacity-100 lg:flex lg:translate-y-1"
          >
            <EyeIcon size={15} /> Quick view
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
        <p className="truncate text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {product.familyCode}
          {product.familyName ? ` · ${product.familyName}` : ""}
        </p>
        <h3 className="mt-1 font-mono text-[15px] font-semibold tracking-tight text-foreground">
          <Link href={href} className="outline-none after:absolute after:inset-0 after:rounded-2xl">
            {product.sku}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted-foreground">{product.title}</p>

        {(note || product.highlights.length > 0) && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {note && <Chip tone="primary">{note}</Chip>}
            {product.highlights.slice(0, note ? 1 : 2).map((h) => (
              <Chip key={h}>{h}</Chip>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3.5">
          <div className="min-w-0">
            <Price value={product.price} className="text-[15px]" />
            <StockDot status={product.stock} block className="mt-0.5" />
          </div>
          <div className="relative z-10 flex shrink-0 gap-1.5">
            <button
              type="button"
              onClick={() => addToQuote(product)}
              aria-label={`Add ${product.sku} to quote list`}
              title="Add to quote list"
              className={buttonVariants({ variant: "outline", size: "icon-sm" })}
            >
              <QuoteIcon size={16} />
            </button>
            <button
              type="button"
              onClick={() => addToCart(product)}
              aria-label={`Add ${product.sku} to cart`}
              title="Add to cart"
              className={buttonVariants({ variant: "primary", size: "icon-sm" })}
            >
              <CartIcon size={16} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-2">
      <div className="skeleton aspect-square rounded-xl" />
      <div className="space-y-2 px-1.5 pb-1 pt-3">
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-4/5 rounded" />
      </div>
    </div>
  );
}
