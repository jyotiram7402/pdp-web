import type { ReactNode } from "react";
import Link from "next/link";
import type { StockStatus } from "@/lib/types";
import { STOCK_LABEL, formatNumber, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "./icons";

type ContainerTag = "div" | "section" | "header" | "footer" | "main" | "nav";

export function Container({ as: Tag = "div", className, children }: { as?: ContainerTag; className?: string; children: ReactNode }) {
  return <Tag className={cn("mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8", className)}>{children}</Tag>;
}

export function Chip({ children, tone = "default", className }: { children: ReactNode; tone?: "default" | "primary"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center truncate rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tone === "primary" ? "border-primary/30 bg-primary-soft text-primary" : "text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-md border bg-background px-1 font-sans text-[11px] font-medium text-muted-foreground shadow-[0_1px_0_var(--border)]",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

export function CountBadge({ count, className }: { count: number; className?: string }) {
  if (!count) return null;
  return (
    <span
      className={cn(
        "absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground tabular-nums ring-2 ring-background",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** Font size comes from `className` (e.g. "text-base"); the component sets no size of its own. */
export function Price({ value, currency = "USD", className }: { value: number | null; currency?: string; className?: string }) {
  if (value == null) return <span className={cn("font-medium text-muted-foreground", className)}>Price on request</span>;
  return <span className={cn("font-semibold tracking-tight text-foreground tabular-nums", className)}>{formatPrice(value, currency)}</span>;
}

const STOCK_TONE: Record<StockStatus, string> = {
  in_stock: "bg-success",
  low_stock: "bg-warning",
  out_of_stock: "bg-muted-foreground/45",
};

export function StockDot({
  status,
  quantity,
  size = "xs",
  block = false,
  className,
}: {
  status: StockStatus;
  quantity?: number | null;
  size?: "xs" | "sm";
  /** Render on its own line instead of inline. */
  block?: boolean;
  className?: string;
}) {
  const detail = quantity && status !== "out_of_stock" ? ` · ${formatNumber(quantity, 0)} available` : "";
  return (
    <span
      className={cn(
        "items-center gap-1.5 font-medium text-muted-foreground",
        block ? "flex" : "inline-flex",
        size === "sm" ? "text-[13px]" : "text-xs",
        className,
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", STOCK_TONE[status])} aria-hidden="true" />
      {STOCK_LABEL[status]}
      {detail}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
  className,
  id,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-3", className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</p>}
        <h2 id={id} className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
          {title}
        </h2>
        {description && <p className="mt-2 text-pretty text-[15px] leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary">
          {linkLabel}
          <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  children,
  bordered = true,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  children?: ReactNode;
  bordered?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl px-6 py-14 text-center",
        bordered && "border border-dashed",
        className,
      )}
    >
      {icon && <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">{icon}</div>}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>}
      {children && <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{children}</div>}
    </div>
  );
}
