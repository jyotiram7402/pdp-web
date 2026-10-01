"use client";

import Link from "next/link";
import { cartStore, compareStore, itemCount, quoteStore, ui, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { CartIcon, CompareIcon, MoonIcon, QuoteIcon, SunIcon } from "../ui/icons";
import { CountBadge } from "../ui/primitives";

/** Display is left to the caller ("grid" or "hidden sm:grid") so utilities never conflict. */
const iconButton =
  "relative size-10 place-items-center rounded-xl text-foreground/80 transition-colors hover:bg-muted hover:text-foreground";

export function ThemeToggle({ className = "grid" }: { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      onClick={() => {
        const root = document.documentElement;
        const dark = !root.classList.contains("dark");
        root.classList.toggle("dark", dark);
        try {
          window.localStorage.setItem("theme", dark ? "dark" : "light");
        } catch {
          /* ignore */
        }
      }}
      className={cn(iconButton, className)}
    >
      <MoonIcon size={19} className="dark:hidden" />
      <SunIcon size={19} className="hidden dark:block" />
    </button>
  );
}

export function HeaderActions() {
  const cart = useStore(cartStore);
  const quote = useStore(quoteStore);
  const compared = useStore(compareStore);
  const cartCount = itemCount(cart);

  return (
    <div className="flex items-center gap-0.5">
      <Link href="/compare" aria-label={`Compare products (${compared.length})`} title="Compare" className={cn(iconButton, "hidden sm:grid")}>
        <CompareIcon size={20} />
        <CountBadge count={compared.length} />
      </Link>
      <Link href="/quote" aria-label={`Quote list (${quote.length})`} title="Quote list" className={cn(iconButton, "grid")}>
        <QuoteIcon size={20} />
        <CountBadge count={quote.length} />
      </Link>
      <button type="button" onClick={ui.openCart} aria-label={`Cart (${cartCount} items)`} title="Cart" className={cn(iconButton, "grid")}>
        <CartIcon size={20} />
        <CountBadge count={cartCount} />
      </button>
      <ThemeToggle className="hidden sm:grid" />
    </div>
  );
}
