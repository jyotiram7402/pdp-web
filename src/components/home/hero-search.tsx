"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ui } from "@/lib/store";
import { SearchIcon } from "../ui/icons";
import { Kbd } from "../ui/primitives";

export function HeroSearch() {
  return (
    <div className="w-full max-w-xl">
      <button
        type="button"
        onClick={ui.openSearch}
        className="group flex h-14 w-full items-center gap-3 rounded-2xl border bg-background/90 pl-4 pr-3 text-left shadow-[0_20px_50px_-30px_rgb(15_23_42/0.5)] backdrop-blur transition-[border-color,box-shadow] hover:border-foreground/25 hover:shadow-[0_24px_60px_-30px_rgb(15_23_42/0.6)]"
      >
        <SearchIcon size={20} className="text-muted-foreground" />
        <span className="flex-1 truncate text-[15px] text-muted-foreground">Search by part number, family or spec…</span>
        <span className="hidden items-center gap-1 sm:flex">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px]">
        <span className="text-muted-foreground">Popular:</span>
        {siteConfig.popularSearches.slice(0, 5).map((term) => (
          <Link
            key={term}
            href={`/catalog?q=${encodeURIComponent(term)}`}
            className="rounded-full border bg-background/70 px-3 py-1 text-foreground transition-colors hover:border-foreground/30"
          >
            {term}
          </Link>
        ))}
      </div>
    </div>
  );
}
