"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAX_COMPARE, compare, compareStore, useStore } from "@/lib/store";
import { buttonVariants } from "../ui/button";
import { CompareIcon, XIcon } from "../ui/icons";
import { ProductImage } from "../ui/product-image";

/** Floating tray that appears while products are queued for comparison. */
export function CompareTray() {
  const items = useStore(compareStore);
  const pathname = usePathname();
  if (!items.length || pathname === "/compare") return null;

  const slots = Array.from({ length: MAX_COMPARE }, (_, i) => items[i] ?? null);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 sm:bottom-6">
      <div className="animate-rise pointer-events-auto flex max-w-full items-center gap-2 rounded-2xl border bg-card/95 p-2 shadow-[0_24px_60px_-24px_rgb(15_23_42/0.5)] backdrop-blur-md sm:gap-3 sm:pl-3">
        <CompareIcon size={18} className="hidden text-muted-foreground sm:block" />
        <div className="flex gap-1.5">
          {slots.map((item, i) =>
            item ? (
              <div key={item.sku} className="group relative">
                <ProductImage src={item.image} alt={item.sku} sizes="44px" eager className="size-11 rounded-xl border" imageClassName="p-1" />
                <button
                  type="button"
                  onClick={() => compare.remove(item.sku)}
                  aria-label={`Remove ${item.sku} from compare`}
                  className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-foreground text-background opacity-0 shadow transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <XIcon size={11} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <div key={`empty-${i}`} className="hidden size-11 rounded-xl border border-dashed bg-muted/40 sm:block" aria-hidden="true" />
            ),
          )}
        </div>
        <Link href="/compare" className={buttonVariants({ size: "md" })}>
          Compare {items.length}
        </Link>
        <button
          type="button"
          onClick={compare.clear}
          aria-label="Clear compare list"
          className="grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <XIcon size={16} />
        </button>
      </div>
    </div>
  );
}
