import Link from "next/link";
import type { Crumb } from "@/lib/catalog-core";
import type { CatalogIndex } from "@/lib/facets";
import { formatNumber, plural } from "@/lib/format";
import { Breadcrumbs } from "../breadcrumbs";
import { Container } from "../ui/primitives";
import { ProductImage } from "../ui/product-image";
import { CatalogExplorer } from "./catalog-explorer";

export interface SubcategoryLink {
  name: string;
  href: string;
  count: number;
  image: string | null;
}

export function CatalogPageView({
  title,
  description,
  breadcrumbs,
  subcategories,
  index,
  explorerKey,
}: {
  title: string;
  description: string;
  breadcrumbs: Crumb[];
  subcategories: SubcategoryLink[];
  index: CatalogIndex;
  explorerKey: string;
}) {
  return (
    <>
      <section className="border-b bg-subtle">
        <Container className="pb-8 pt-6">
          <Breadcrumbs items={breadcrumbs} />
          <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <div className="max-w-3xl">
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-[40px] sm:leading-[1.1]">{title}</h1>
              {description && <p className="mt-3 text-pretty text-[15px] leading-relaxed text-muted-foreground">{description}</p>}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold tabular-nums text-foreground">{formatNumber(index.items.length, 0)}</span>{" "}
              {index.items.length === 1 ? "product" : "products"}
            </p>
          </div>
          {subcategories.length > 0 && (
            <div className="scrollbar-none -mx-4 mt-7 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:px-0">
              {subcategories.map((sub) => (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className="group flex shrink-0 items-center gap-3 rounded-2xl border bg-background p-2 pr-5 transition-[border-color,box-shadow] hover:border-foreground/25 hover:shadow-[0_14px_30px_-24px_rgb(15_23_42/0.5)]"
                >
                  <ProductImage
                    src={sub.image}
                    alt=""
                    sizes="48px"
                    className="size-12 shrink-0 rounded-xl"
                    imageClassName="p-1 transition-transform duration-300 group-hover:scale-110"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{sub.name}</span>
                    <span className="block text-xs text-muted-foreground">{plural(sub.count, "product")}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>
      <Container className="py-8">
        <CatalogExplorer key={explorerKey} index={index} />
      </Container>
    </>
  );
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-8 border-b pb-6">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{description}</p>}
    </div>
  );
}
