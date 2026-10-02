import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { NavData } from "@/lib/catalog-core";
import { CubeIcon, MailIcon, PhoneIcon } from "../ui/icons";
import { Container } from "../ui/primitives";
import { HeaderActions } from "./header-actions";
import { Logo } from "./logo";
import { MegaMenu } from "./mega-menu";
import { MobileNav } from "./mobile-nav";
import { SearchTrigger } from "./search-command";

export function SiteHeader({ nav }: { nav: NavData }) {
  return (
    <>
      <div className="hidden border-b bg-subtle md:block">
        <Container className="flex h-9 items-center justify-between gap-6 text-xs text-muted-foreground">
          <p className="flex items-center gap-2 truncate">
            <CubeIcon size={14} className="shrink-0 text-primary" />
            {siteConfig.announcement}
          </p>
          <div className="flex shrink-0 items-center gap-5">
            <a href={`mailto:${siteConfig.contact.email}`} className="flex items-center gap-1.5 transition-colors hover:text-foreground">
              <MailIcon size={13} /> {siteConfig.contact.email}
            </a>
            <span className="flex items-center gap-1.5">
              <PhoneIcon size={13} /> {siteConfig.contact.phone}
            </span>
          </div>
        </Container>
      </div>
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl">
        <Container className="flex h-[var(--header-height)] items-center gap-2 lg:gap-5">
          <MobileNav nav={nav} />
          <Logo className="mr-1" />
          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
            <MegaMenu nav={nav} />
            <Link
              href="/catalog"
              className="inline-flex h-10 items-center rounded-xl px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
            >
              All products
            </Link>
            <Link
              href="/compare"
              className="inline-flex h-10 items-center rounded-xl px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
            >
              Compare
            </Link>
          </nav>
          <div className="flex min-w-0 flex-1 justify-end md:justify-center lg:px-4">
            <SearchTrigger />
          </div>
          <HeaderActions />
        </Container>
      </header>
    </>
  );
}
