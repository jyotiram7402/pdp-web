import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { NavData } from "@/lib/catalog-core";
import { buttonVariants } from "../ui/button";
import { ArrowRightIcon, ClockIcon, MailIcon, PhoneIcon } from "../ui/icons";
import { Container } from "../ui/primitives";
import { Logo } from "./logo";

export function SiteFooter({ nav }: { nav: NavData }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t bg-subtle">
      <Container className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">{siteConfig.description}</p>
          <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <a href={`mailto:${siteConfig.contact.email}`} className="inline-flex items-center gap-2 hover:text-foreground">
                <MailIcon size={15} /> {siteConfig.contact.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <PhoneIcon size={15} /> {siteConfig.contact.phone}
            </li>
            <li className="flex items-center gap-2">
              <ClockIcon size={15} /> {siteConfig.contact.hours}
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="text-sm font-semibold text-foreground">Products</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.categories.slice(0, 6).map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="text-muted-foreground transition-colors hover:text-foreground">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/catalog" className="text-muted-foreground transition-colors hover:text-foreground">
                All products
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground">Tools</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              ["/compare", "Compare products"],
              ["/quote", "Quote list"],
              ["/cart", "Cart"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-muted-foreground transition-colors hover:text-foreground">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-2xl border bg-background p-5">
            <h3 className="text-sm font-semibold text-foreground">Need help specifying a part?</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Send us your application details and quantities — our team will recommend the right hardware and pricing.
            </p>
            <Link href="/quote" className={buttonVariants({ variant: "ink", size: "sm", className: "mt-4" })}>
              Request a quote <ArrowRightIcon size={14} />
            </Link>
          </div>
        </div>
      </Container>
      <div className="border-t">
        <Container className="flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p>Product names, images and documents belong to their respective manufacturers.</p>
        </Container>
      </div>
    </footer>
  );
}
