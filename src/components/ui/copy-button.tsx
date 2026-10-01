"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon } from "./icons";

export function CopyButton({ value, label = "Copy", size = "sm", className }: { value: string; label?: string; size?: "sm" | "md"; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : label}
      title={copied ? "Copied" : label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          /* clipboard blocked */
        }
      }}
      className={cn(
        "relative z-10 inline-grid place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        size === "md" ? "size-8" : "size-7",
        className,
      )}
    >
      {copied ? <CheckIcon size={size === "md" ? 16 : 14} className="text-success" /> : <CopyIcon size={size === "md" ? 16 : 14} />}
    </button>
  );
}
