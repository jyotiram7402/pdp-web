"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { cart, cartStore, itemCount, quote, subtotal, toast, ui, uiStore, useStore } from "@/lib/store";
import { LineItem } from "../commerce/line-item";
import { buttonVariants } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { BagIcon, QuoteIcon, XIcon } from "../ui/icons";
import { EmptyState } from "../ui/primitives";

export function CartDrawer() {
  const { cartOpen } = useStore(uiStore);
  const lines = useStore(cartStore);
  const router = useRouter();
  const count = itemCount(lines);

  const requestQuote = () => {
    for (const line of lines) quote.add(line, line.qty);
    toast({ title: "Cart copied to your quote list", description: `${lines.length} ${lines.length === 1 ? "part" : "parts"}`, action: { label: "View", href: "/quote" } });
    ui.closeCart();
    router.push("/quote");
  };

  return (
    <Dialog open={cartOpen} onClose={ui.closeCart} label="Shopping cart" side="right" width="28rem">
      <div className="flex h-full flex-col bg-background shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-5">
          <h2 className="text-base font-semibold text-foreground">
            Cart <span className="font-normal text-muted-foreground">({count})</span>
          </h2>
          <button
            type="button"
            onClick={ui.closeCart}
            aria-label="Close cart"
            className="grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <XIcon size={18} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 items-center p-5">
            <EmptyState icon={<BagIcon size={22} />} title="Your cart is empty" description="Add parts from the catalog to see them here." bordered={false} className="w-full">
              <Link href="/catalog" onClick={ui.closeCart} className={buttonVariants({ variant: "ink" })}>
                Browse products
              </Link>
            </EmptyState>
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y overflow-y-auto px-5">
              {lines.map((line) => (
                <LineItem
                  key={line.sku}
                  line={line}
                  compact
                  onQty={(qty) => cart.setQty(line.sku, qty)}
                  onRemove={() => cart.remove(line.sku)}
                  onNavigate={ui.closeCart}
                />
              ))}
            </div>
            <div className="shrink-0 space-y-3 border-t bg-subtle p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-lg font-semibold tabular-nums text-foreground">{formatPrice(subtotal(lines))}</span>
              </div>
              <p className="text-xs text-muted-foreground">Shipping and taxes are calculated at checkout.</p>
              <Link href="/cart" onClick={ui.closeCart} className={buttonVariants({ size: "lg", className: "w-full" })}>
                View cart &amp; checkout
              </Link>
              <button type="button" onClick={requestQuote} className={buttonVariants({ variant: "outline", className: "w-full" })}>
                <QuoteIcon size={16} /> Request a quote for these items
              </button>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
