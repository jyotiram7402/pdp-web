"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavData } from "@/lib/catalog-core";
import { formatNumber, plural } from "@/lib/format";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";
import { ArrowRightIcon, ChevronDownIcon } from "../ui/icons";
import { Container } from "../ui/primitives";
import { ProductImage } from "../ui/product-image";

export function MegaMenu({ nav }: { nav: NavData }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const schedule = (next: boolean, delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), delay);
  };

  return (
    <div ref={wrapRef} onMouseEnter={() => schedule(true, 90)} onMouseLeave={() => schedule(false, 180)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mega-menu"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex h-10 items-center gap-1 rounded-xl px-3 text-sm font-medium transition-colors hover:bg-muted",
          open ? "bg-muted text-foreground" : "text-foreground/80 hover:text-foreground",
        )}
      >
        Products
        <ChevronDownIcon size={15} className={cn("transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div id="mega-menu" className="animate-fade absolute inset-x-0 top-full border-b bg-background shadow-[0_32px_64px_-32px_rgb(15_23_42/0.35)]">
          <Container className="grid grid-cols-12 gap-10 py-8">
            <div className="col-span-8 grid grid-cols-2 content-start gap-x-8 gap-y-7 xl:grid-cols-3">
              {nav.categories.map((category) => (
                <div key={category.href}>
                  <Link href={category.href} className="group flex items-center gap-3">
                    <ProductImage src={category.image} alt="" sizes="56px" className="size-14 shrink-0 rounded-xl" imageClassName="p-1.5" />
                    <div>
                      <p className="font-semibold text-foreground transition-colors group-hover:text-primary">{category.name}</p>
                      <p className="text-xs text-muted-foreground">{plural(category.count, "product")}</p>
                    </div>
                  </Link>
                  {category.children.length > 0 && (
                    <ul className="ml-7 mt-3 space-y-0.5 border-l pl-4">
                      {category.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="flex items-center justify-between gap-3 rounded-md py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                          >
                            <span>{child.name}</span>
                            <span className="text-xs tabular-nums text-muted-foreground/70">{child.count}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <div className="col-span-4 border-l pl-10">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Popular families</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {nav.families.map((family) => (
                  <Link key={family.code} href={family.href} className="group rounded-2xl border p-2 transition-colors hover:border-foreground/20">
                    <ProductImage
                      src={family.image}
                      alt=""
                      sizes="180px"
                      className="aspect-[4/3] rounded-xl"
                      imageClassName="p-3 transition-transform duration-300 group-hover:scale-105"
                    />
                    <p className="mt-2 px-1 font-mono text-sm font-semibold text-foreground">{family.code}</p>
                    <p className="line-clamp-1 px-1 pb-0.5 text-xs text-muted-foreground">{family.name}</p>
                  </Link>
                ))}
              </div>
              <Link href="/catalog" className={buttonVariants({ variant: "ink", className: "mt-4 w-full" })}>
                Browse all {formatNumber(nav.total, 0)} products <ArrowRightIcon size={16} />
              </Link>
            </div>
          </Container>
        </div>
      )}
    </div>
  );
}
