"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Accessible modal built on the native <dialog> element: focus trap, Escape to
 * close and top-layer stacking come from the browser. Click on the backdrop closes it.
 */
export function Dialog({
  open,
  onClose,
  label,
  side = "center",
  width,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  side?: "center" | "top" | "right" | "left";
  /** CSS width, e.g. "56rem". */
  width?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      const root = document.documentElement;
      // Measure only while no other modal has already hidden the scrollbar.
      if (!document.querySelector("dialog[open]")) {
        root.style.setProperty("--scrollbar-width", `${Math.max(0, window.innerWidth - root.clientWidth)}px`);
      }
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const style = width ? ({ "--dialog-width": width } as CSSProperties) : undefined;

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn("dialog", `dialog-${side}`, className)}
      style={style}
    >
      {open ? children : null}
    </dialog>
  );
}
