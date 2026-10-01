"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CardProduct, Product } from "@/lib/types";
import { addToCart, addToQuote } from "@/lib/actions";
import { fetchProduct } from "@/lib/client-data";
import { formatSpec } from "@/lib/format";
import { productHref } from "@/lib/product";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { ArrowRightIcon, CartIcon, QuoteIcon, XIcon } from "../ui/icons";
import { Price, StockDot } from "../ui/primitives";
import { ProductImage } from "../ui/product-image";
import { QuantityInput } from "../ui/quantity-input";

export function QuickView({ product, onClose }: { product: CardProduct | null; onClose: () => void }) {
  return (
    <Dialog open={!!product} onClose={onClose} label={product ? `Quick view: ${product.sku}` : "Quick view"} width="60rem">
      {product && <QuickViewBody product={product} onClose={onClose} />}
    </Dialog>
  );
}

function QuickViewBody({ product, onClose }: { product: CardProduct; onClose: () => void }) {
  const [full, setFull] = useState<Product | null>(null);
  const [failed, setFailed] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    let alive = true;
    setFull(null);
    setFailed(false);
    fetchProduct(product.slug)
      .then((p) => alive && setFull(p))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [product.slug]);

  return (
    <div className="relative grid max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl border bg-background shadow-2xl md:grid-cols-2">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close quick view"
        className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <XIcon size={18} />
      </button>
      <div className="p-4 md:p-6">
        <ProductImage
          src={product.image}
          alt={product.title}
          sizes="(min-width: 768px) 28rem, 90vw"
          eager
          className="aspect-square rounded-2xl"
          imageClassName="p-[12%]"
        />
      </div>
      <div className="flex flex-col px-6 pb-6 md:py-8 md:pl-2 md:pr-8">
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
          {product.familyCode} · {product.familyName}
        </p>
        <h2 className="mt-1.5 font-mono text-2xl font-semibold tracking-tight text-foreground">{product.sku}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.title}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
          <Price value={product.price} className="text-2xl" />
          <StockDot status={product.stock} quantity={full?.stock.quantity} />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl bg-subtle p-4 text-[13px]">
          {full
            ? full.specs.slice(0, 8).map((spec) => (
                <div key={spec.name} className="min-w-0">
                  <dt className="truncate text-muted-foreground">{spec.name}</dt>
                  <dd className="truncate font-medium text-foreground">{formatSpec(spec).value}</dd>
                </div>
              ))
            : Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="skeleton h-3 w-2/3 rounded" />
                  <div className="skeleton h-3.5 w-1/2 rounded" />
                </div>
              ))}
          {failed && <p className="col-span-2 text-muted-foreground">Specifications are unavailable right now.</p>}
        </dl>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
          <QuantityInput value={qty} onChange={setQty} />
          <Button onClick={() => addToCart(product, qty)} className="flex-1">
            <CartIcon size={16} /> Add to cart
          </Button>
          <Button variant="outline" onClick={() => addToQuote(product, qty)}>
            <QuoteIcon size={16} /> Quote
          </Button>
        </div>
        <Link
          href={productHref(product.slug)}
          onClick={onClose}
          className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-medium text-primary hover:underline"
        >
          View full details <ArrowRightIcon size={15} />
        </Link>
      </div>
    </div>
  );
}
