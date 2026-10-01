"use client";

import { useEffect, useState } from "react";
import type { CardProduct } from "@/lib/types";
import { addToCart } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { CartIcon } from "../ui/icons";
import { Container, Price } from "../ui/primitives";

export interface SectionLink {
  id: string;
  label: string;
}

/** Sticky in-page navigation with scroll-spy and a compact add-to-cart once the buy box is off screen. */
export function SectionNav({ sections, product }: { sections: SectionLink[]; product: CardProduct }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const targets = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    if (!targets.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -55% 0px", threshold: 0 },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    const box = document.getElementById("buy-box");
    if (!box) return;
    const observer = new IntersectionObserver(([entry]) => setCompact(!entry.isIntersecting && entry.boundingClientRect.top < 0), { threshold: 0 });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(window.history.state, "", `#${id}`);
    setActive(id);
  };

  return (
    <div className="sticky top-[var(--header-height)] z-30 mt-12 border-y bg-background/90 backdrop-blur-xl">
      <Container className="flex h-14 items-center gap-4">
        <nav aria-label="On this page" className="scrollbar-none -mx-1 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                jump(s.id);
              }}
              aria-current={active === s.id ? "true" : undefined}
              className={cn(
                "relative shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active === s.id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
              <span
                className={cn(
                  "absolute inset-x-3 -bottom-[11px] h-0.5 rounded-full bg-foreground transition-opacity",
                  active === s.id ? "opacity-100" : "opacity-0",
                )}
              />
            </a>
          ))}
        </nav>
        <div
          className={cn(
            "hidden shrink-0 items-center gap-3 transition-all duration-300 md:flex",
            compact ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0",
          )}
          aria-hidden={!compact}
        >
          <span className="font-mono text-sm font-semibold text-foreground">{product.sku}</span>
          <Price value={product.price} className="text-sm" />
          <Button size="sm" onClick={() => addToCart(product)} tabIndex={compact ? 0 : -1}>
            <CartIcon size={15} /> Add to cart
          </Button>
        </div>
      </Container>
    </div>
  );
}
