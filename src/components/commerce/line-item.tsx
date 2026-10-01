"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { productHref } from "@/lib/product";
import type { Line } from "@/lib/store";
import { cn } from "@/lib/utils";
import { TrashIcon } from "../ui/icons";
import { StockDot } from "../ui/primitives";
import { ProductImage } from "../ui/product-image";
import { QuantityInput } from "../ui/quantity-input";

/** One cart or quote line with quantity stepper and remove action. */
export function LineItem({
  line,
  onQty,
  onRemove,
  showPrice = true,
  compact = false,
  onNavigate,
}: {
  line: Line;
  onQty: (qty: number) => void;
  onRemove: () => void;
  showPrice?: boolean;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className={cn("flex gap-4", compact ? "py-4" : "py-5")}>
      <Link href={productHref(line.slug)} onClick={onNavigate} className="shrink-0">
        <ProductImage
          src={line.image}
          alt={line.title}
          sizes={compact ? "72px" : "96px"}
          className={cn("rounded-xl", compact ? "size-[72px]" : "size-24")}
          imageClassName="p-1.5"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={productHref(line.slug)} onClick={onNavigate} className="font-mono text-sm font-semibold text-foreground hover:text-primary">
              {line.sku}
            </Link>
            <p className={cn("text-[13px] leading-snug text-muted-foreground", compact ? "line-clamp-1" : "line-clamp-2")}>{line.title}</p>
          </div>
          {showPrice && (
            <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
              {line.price != null ? formatPrice(line.price * line.qty) : "On request"}
            </p>
          )}
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          <div className="flex items-center gap-3">
            <QuantityInput value={line.qty} onChange={onQty} size="sm" label={`Quantity for ${line.sku}`} />
            {showPrice && line.price != null && line.qty > 1 && (
              <span className="text-xs tabular-nums text-muted-foreground">{formatPrice(line.price)} each</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!compact && <StockDot status={line.stock} />}
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${line.sku}`}
              className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-danger"
            >
              <TrashIcon size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
