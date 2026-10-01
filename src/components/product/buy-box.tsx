"use client";

import { useState } from "react";
import Link from "next/link";
import type { CardProduct } from "@/lib/types";
import { addToCart, addToQuote, toggleCompare } from "@/lib/actions";
import { formatPrice } from "@/lib/format";
import { compareStore, toast, useStore } from "@/lib/store";
import { Button } from "../ui/button";
import { CopyButton } from "../ui/copy-button";
import { CartIcon, CheckIcon, CompareIcon, CubeIcon, FileDownIcon, QuoteIcon, ShareIcon, ShieldCheckIcon } from "../ui/icons";
import { Price, StockDot } from "../ui/primitives";
import { QuantityInput } from "../ui/quantity-input";

export interface KeyFact {
  label: string;
  value: string;
}

export function BuyBox({
  product,
  brand,
  familyHref,
  stockQuantity,
  keyFacts,
  certifications,
  cadUrl,
  drawingUrl,
}: {
  product: CardProduct;
  brand: string;
  familyHref: string | null;
  stockQuantity: number | null;
  keyFacts: KeyFact[];
  certifications: string[];
  cadUrl: string | null;
  drawingUrl: string | null;
}) {
  const [qty, setQty] = useState(1);
  const compared = useStore(compareStore).some((p) => p.sku === product.sku);

  const share = async () => {
    const url = window.location.href.split("#")[0];
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: product.sku, text: product.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: url });
    } catch {
      /* dismissed */
    }
  };

  return (
    <div id="buy-box" className="min-w-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span className="font-semibold text-foreground">{brand}</span>
        <span className="text-border" aria-hidden="true">
          /
        </span>
        {familyHref ? (
          <Link href={familyHref} className="text-muted-foreground transition-colors hover:text-primary">
            {product.familyCode} · {product.familyName}
          </Link>
        ) : (
          <span className="text-muted-foreground">
            {product.familyCode} · {product.familyName}
          </span>
        )}
        {product.accessoryType && (
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {product.accessoryType}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <h1 className="font-mono text-[32px] font-semibold leading-tight tracking-tight text-foreground sm:text-[40px]">{product.sku}</h1>
        <CopyButton value={product.sku} label="Copy part number" size="md" />
      </div>
      <p className="mt-2 text-pretty text-base leading-relaxed text-foreground/75 sm:text-[17px]">{product.title}</p>

      <div className="mt-6 rounded-3xl border bg-card p-5 shadow-[0_24px_48px_-36px_rgb(15_23_42/0.35)] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Unit price</p>
            <Price value={product.price} className="mt-1 block text-[32px] leading-none" />
          </div>
          <StockDot status={product.stock} quantity={stockQuantity} size="sm" />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <QuantityInput value={qty} onChange={setQty} size="lg" />
          <Button size="lg" className="min-w-[180px] flex-1" onClick={() => addToCart(product, qty)}>
            <CartIcon size={18} /> Add to cart
          </Button>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => addToQuote(product, qty)}>
            <QuoteIcon size={16} /> Add to quote
          </Button>
          <Button variant={compared ? "soft" : "outline"} aria-pressed={compared} onClick={() => toggleCompare(product)}>
            {compared ? <CheckIcon size={16} /> : <CompareIcon size={16} />}
            {compared ? "In compare" : "Compare"}
          </Button>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          {product.price != null && qty > 1 ? (
            <>
              <span className="font-medium text-foreground tabular-nums">{formatPrice(product.price * qty)}</span> for {qty} units ·{" "}
            </>
          ) : null}
          Need volume pricing or a custom variant? Add it to your quote list.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {cadUrl && (
          <a href={cadUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[13px] font-medium text-foreground transition-colors hover:border-foreground/25 hover:bg-muted">
            <CubeIcon size={16} className="text-primary" /> CAD models
          </a>
        )}
        {drawingUrl && (
          <a href={drawingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[13px] font-medium text-foreground transition-colors hover:border-foreground/25 hover:bg-muted">
            <FileDownIcon size={16} className="text-primary" /> Drawing (PDF)
          </a>
        )}
        <button type="button" onClick={share} className="inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[13px] font-medium text-foreground transition-colors hover:border-foreground/25 hover:bg-muted">
          <ShareIcon size={15} className="text-muted-foreground" /> Share
        </button>
      </div>

      {keyFacts.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border">
          {keyFacts.map((fact) => (
            <div key={fact.label} className="bg-background p-3.5">
              <dt className="text-xs text-muted-foreground">{fact.label}</dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {certifications.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <ShieldCheckIcon size={16} className="text-success" /> Compliance
          </span>
          {certifications.map((c) => (
            <span key={c} className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-foreground">
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
