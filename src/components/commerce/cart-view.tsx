"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { downloadText, toCsv } from "@/lib/csv";
import { formatPrice } from "@/lib/format";
import { cart, cartStore, itemCount, quote, subtotal, toast, useStore } from "@/lib/store";
import { Button, buttonVariants } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { BagIcon, DownloadIcon, InfoIcon, QuoteIcon, ShieldCheckIcon, TruckIcon } from "../ui/icons";
import { EmptyState } from "../ui/primitives";
import { LineItem } from "./line-item";

export function CartView() {
  const lines = useStore(cartStore);
  const router = useRouter();
  const [notice, setNotice] = useState(false);
  const total = subtotal(lines);
  const count = itemCount(lines);

  if (!lines.length) {
    return (
      <EmptyState icon={<BagIcon size={22} />} title="Your cart is empty" description="Browse the catalog and add parts to your cart.">
        <Link href="/catalog" className={buttonVariants({ variant: "ink" })}>
          Browse products
        </Link>
      </EmptyState>
    );
  }

  const convertToQuote = () => {
    for (const line of lines) quote.add(line, line.qty);
    toast({ title: "Cart copied to your quote list", description: `${lines.length} ${lines.length === 1 ? "part" : "parts"}` });
    setNotice(false);
    router.push("/quote");
  };

  const checkout = () => {
    if (siteConfig.checkoutUrl) window.location.href = siteConfig.checkoutUrl;
    else setNotice(true);
  };

  const exportCsv = () => {
    const rows = [["Part number", "Description", "Quantity", "Unit price (USD)", "Line total (USD)"]];
    for (const l of lines) {
      rows.push([l.sku, l.title, String(l.qty), l.price != null ? l.price.toFixed(2) : "", l.price != null ? (l.price * l.qty).toFixed(2) : ""]);
    }
    downloadText("cart.csv", toCsv(rows));
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-14">
      <div>
        <div className="flex items-center justify-between gap-4 border-b pb-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{count}</span> {count === 1 ? "item" : "items"} · {lines.length}{" "}
            {lines.length === 1 ? "part number" : "part numbers"}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={exportCsv}>
              <DownloadIcon size={15} /> Export CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={cart.clear}>
              Clear cart
            </Button>
          </div>
        </div>
        <div className="divide-y">
          {lines.map((line) => (
            <LineItem key={line.sku} line={line} onQty={(qty) => cart.setQty(line.sku, qty)} onRemove={() => cart.remove(line.sku)} />
          ))}
        </div>
      </div>

      <aside className="lg:sticky lg:top-[calc(var(--header-height)+24px)] lg:self-start">
        <div className="rounded-3xl border bg-card p-6 shadow-[0_24px_48px_-36px_rgb(15_23_42/0.35)]">
          <h2 className="text-lg font-semibold text-foreground">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium tabular-nums text-foreground">{formatPrice(total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="text-muted-foreground">Calculated at checkout</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax</dt>
              <dd className="text-muted-foreground">Calculated at checkout</dd>
            </div>
          </dl>
          <div className="mt-5 flex items-baseline justify-between border-t pt-5">
            <span className="font-semibold text-foreground">Estimated total</span>
            <span className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">{formatPrice(total)}</span>
          </div>
          <Button size="lg" className="mt-6 w-full" onClick={checkout}>
            Checkout
          </Button>
          <Button variant="outline" className="mt-2 w-full" onClick={convertToQuote}>
            <QuoteIcon size={16} /> Request a formal quote
          </Button>
          <ul className="mt-6 space-y-2.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <ShieldCheckIcon size={15} className="text-success" /> Prices shown in USD, excluding tax
            </li>
            <li className="flex items-center gap-2">
              <TruckIcon size={15} className="text-muted-foreground" /> Lead times confirmed with your order or quote
            </li>
          </ul>
        </div>
      </aside>

      <Dialog open={notice} onClose={() => setNotice(false)} label="Checkout" width="30rem">
        <div className="rounded-3xl border bg-background p-6 shadow-2xl sm:p-7">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
            <InfoIcon size={20} />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-foreground">Online checkout isn’t connected yet</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Send this cart as a quote request instead — we’ll confirm pricing, availability and lead time for {count} {count === 1 ? "item" : "items"}.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setNotice(false)}>
              Keep shopping
            </Button>
            <Button onClick={convertToQuote}>
              <QuoteIcon size={16} /> Request a quote
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
