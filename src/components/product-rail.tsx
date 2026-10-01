"use client";

import { useEffect, useRef, useState } from "react";
import type { CardProduct } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";
import { ChevronLeftIcon, ChevronRightIcon } from "./ui/icons";

/** Horizontal, swipeable product carousel with arrow controls on desktop. */
export function ProductRail({ products, label, className }: { products: CardProduct[]; label: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [products.length]);

  const scroll = (dir: number) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  const arrow =
    "absolute top-[34%] z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border bg-background text-foreground shadow-[0_10px_30px_-10px_rgb(15_23_42/0.35)] transition-all hover:scale-105 disabled:pointer-events-none disabled:opacity-0 lg:grid";

  return (
    <div className={cn("relative", className)}>
      <div
        ref={ref}
        role="region"
        aria-label={label}
        className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-6 pt-1 sm:-mx-6 sm:gap-4 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0"
      >
        {products.map((product) => (
          <div
            key={product.sku}
            className="w-[70%] shrink-0 snap-start sm:w-[42%] md:w-[30%] lg:w-[calc((100%_-_3rem)/4)] xl:w-[calc((100%_-_4rem)/5)]"
          >
            <ProductCard product={product} className="h-full" />
          </div>
        ))}
      </div>
      <button type="button" aria-label="Scroll left" onClick={() => scroll(-1)} disabled={edges.start} className={cn(arrow, "-left-5")}>
        <ChevronLeftIcon size={20} />
      </button>
      <button type="button" aria-label="Scroll right" onClick={() => scroll(1)} disabled={edges.end} className={cn(arrow, "-right-5")}>
        <ChevronRightIcon size={20} />
      </button>
    </div>
  );
}
