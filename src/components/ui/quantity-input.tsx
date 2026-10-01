"use client";

import { useEffect, useState } from "react";
import { MAX_QTY } from "@/lib/store";
import { clamp, cn } from "@/lib/utils";
import { MinusIcon, PlusIcon } from "./icons";

export function QuantityInput({
  value,
  onChange,
  size = "md",
  className,
  label = "Quantity",
}: {
  value: number;
  onChange: (value: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  const commit = (next: number) => {
    const v = clamp(Math.round(next) || 1, 1, MAX_QTY);
    setDraft(String(v));
    if (v !== value) onChange(v);
  };

  const box = size === "sm" ? "h-8" : size === "lg" ? "h-12" : "h-10";
  const btn = size === "sm" ? "w-7" : size === "lg" ? "w-10" : "w-9";

  return (
    <div className={cn("inline-flex items-stretch overflow-hidden rounded-xl border bg-background", box, className)}>
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => commit(value - 1)}
        disabled={value <= 1}
        className={cn("grid place-items-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-35", btn)}
      >
        <MinusIcon size={15} />
      </button>
      <input
        aria-label={label}
        inputMode="numeric"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
        onBlur={() => commit(Number(draft))}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit(Number(draft));
        }}
        className="w-10 bg-transparent text-center text-sm font-medium tabular-nums text-foreground outline-none"
      />
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => commit(value + 1)}
        disabled={value >= MAX_QTY}
        className={cn("grid place-items-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-35", btn)}
      >
        <PlusIcon size={15} />
      </button>
    </div>
  );
}
