"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "../ui/icons";

/** Copies the spec table as tab-separated text (pastes cleanly into Excel / BOM tools). */
export function CopySpecsButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          /* clipboard blocked */
        }
      }}
      className="inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[13px] font-medium text-foreground transition-colors hover:border-foreground/25 hover:bg-muted"
    >
      {copied ? <CheckIcon size={15} className="text-success" /> : <CopyIcon size={15} className="text-muted-foreground" />}
      {copied ? "Copied" : "Copy specifications"}
    </button>
  );
}
