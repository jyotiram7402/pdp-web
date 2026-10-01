"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavData } from "@/lib/catalog-core";
import { cn } from "@/lib/utils";
import { Dialog } from "../ui/dialog";
import { ChevronDownIcon, CompareIcon, HomeIcon, LayersIcon, MenuIcon, QuoteIcon, XIcon } from "../ui/icons";
import { ThemeToggle } from "./header-actions";
import { LogoMark } from "./logo";

export function MobileNav({ nav }: { nav: NavData }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="-ml-2 grid size-10 place-items-center rounded-xl text-foreground hover:bg-muted lg:hidden"
      >
        <MenuIcon size={21} />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} label="Menu" side="left" width="22rem">
        <div className="flex h-full flex-col bg-background shadow-2xl">
          <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
            <LogoMark className="size-8" />
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid size-10 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <XIcon size={19} />
              </button>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile">
            <MobileLink href="/" icon={<HomeIcon size={18} />} label="Home" />
            <MobileLink href="/catalog" icon={<LayersIcon size={18} />} label={`All products (${nav.total})`} />
            <p className="mb-1 mt-5 px-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Categories</p>
            {nav.categories.map((category) => (
              <details key={category.href} className="group">
                <summary className="flex list-none items-center justify-between rounded-xl px-3 py-2.5 text-[15px] font-medium text-foreground hover:bg-muted">
                  {category.name}
                  <ChevronDownIcon size={16} className="text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="mb-2 ml-3 border-l pl-3">
                  <Link href={category.href} className="block rounded-lg px-3 py-2 text-sm font-medium text-primary">
                    View all {category.name}
                  </Link>
                  {category.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      {child.name}
                      <span className="text-xs tabular-nums">{child.count}</span>
                    </Link>
                  ))}
                </div>
              </details>
            ))}
            <p className="mb-1 mt-5 px-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Tools</p>
            <MobileLink href="/compare" icon={<CompareIcon size={18} />} label="Compare products" />
            <MobileLink href="/quote" icon={<QuoteIcon size={18} />} label="Quote list" />
          </nav>
        </div>
      </Dialog>
    </>
  );
}

function MobileLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors",
        active ? "bg-muted text-foreground" : "text-foreground/85 hover:bg-muted hover:text-foreground",
      )}
    >
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </Link>
  );
}
