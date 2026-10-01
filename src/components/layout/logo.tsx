import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" className="fill-foreground" />
      <path d="M9 22.5V10l7 7.2L23 10v12.5" fill="none" className="stroke-background" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="25.2" r="1.4" className="fill-primary" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label={`${siteConfig.name} home`} className={cn("flex shrink-0 items-center gap-2.5 rounded-lg", className)}>
      <LogoMark className="size-8" />
      <span className="text-[17px] font-semibold tracking-tight text-foreground">{siteConfig.name}</span>
    </Link>
  );
}
