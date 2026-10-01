"use client";

import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "../ui/icons";

function pageList(page: number, total: number): Array<number | "gap"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (page >= total - 2) [total - 1, total - 2, total - 3].forEach((p) => pages.add(p));
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out: Array<number | "gap"> = [];
  let previous = 0;
  for (const p of sorted) {
    if (p - previous > 1) out.push("gap");
    out.push(p);
    previous = p;
  }
  return out;
}

const stepClass =
  "inline-flex h-10 items-center gap-1 rounded-xl px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40";

export function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      <button type="button" className={stepClass} disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronLeftIcon size={16} />
        <span className="hidden sm:inline">Previous</span>
      </button>
      {pageList(page, totalPages).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="px-1.5 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? "page" : undefined}
            onClick={() => onPage(p)}
            className={cn(
              "grid size-10 place-items-center rounded-xl text-sm font-medium tabular-nums transition-colors",
              p === page ? "bg-foreground text-background" : "text-foreground hover:bg-muted",
            )}
          >
            {p}
          </button>
        ),
      )}
      <button type="button" className={stepClass} disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
        <span className="hidden sm:inline">Next</span>
        <ChevronRightIcon size={16} />
      </button>
    </nav>
  );
}
