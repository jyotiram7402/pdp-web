import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** "E" monogram for ExpertPDP, drawn with theme colors so it adapts to dark mode. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" className="fill-foreground" />
      <path d="M20.5 9.5H11v13h9.5" fill="none" className="stroke-background" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 16h6" fill="none" className="stroke-background" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="21.4" cy="16" r="1.55" className="fill-primary" />
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
