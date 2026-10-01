"use client";

import Link from "next/link";
import { dismissToast, toastStore, useStore } from "@/lib/store";
import { buttonVariants } from "./button";
import { XIcon } from "./icons";
import { ProductImage } from "./product-image";

export function Toaster() {
  const toasts = useStore(toastStore);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-[calc(var(--header-height)+0.75rem)] z-[70] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-auto sm:items-end"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="animate-rise pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border bg-card/95 p-2.5 pr-2 shadow-[0_20px_50px_-20px_rgb(15_23_42/0.45)] backdrop-blur-md"
        >
          {t.image !== undefined && (
            <ProductImage src={t.image} alt="" sizes="48px" eager className="size-12 shrink-0 rounded-xl" imageClassName="p-1" />
          )}
          <div className="min-w-0 flex-1 pl-0.5">
            <p className="text-sm font-semibold text-foreground">{t.title}</p>
            {t.description && <p className="truncate text-xs text-muted-foreground">{t.description}</p>}
          </div>
          {t.action &&
            (t.action.href ? (
              <Link href={t.action.href} onClick={() => dismissToast(t.id)} className={buttonVariants({ variant: "soft", size: "sm" })}>
                {t.action.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick?.();
                  dismissToast(t.id);
                }}
                className={buttonVariants({ variant: "soft", size: "sm" })}
              >
                {t.action.label}
              </button>
            ))}
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => dismissToast(t.id)}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <XIcon size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
