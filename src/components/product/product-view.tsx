import type { ReactNode } from "react";
import Link from "next/link";
import { KEY_SPECS } from "@/config/facets";
import { siteConfig } from "@/config/site";
import type { ProductPageData } from "@/lib/catalog-core";
import { formatNumber } from "@/lib/format";
import { formatRange, gripRange, panelRange, productHref } from "@/lib/product";
import type { Product } from "@/lib/types";
import { specValue } from "@/lib/utils";
import { Breadcrumbs, JsonLd } from "../breadcrumbs";
import { ProductRail } from "../product-rail";
import { ArrowRightIcon, PuzzleIcon } from "../ui/icons";
import { Container, SectionHeading } from "../ui/primitives";
import { ProductImage } from "../ui/product-image";
import { BuyBox, type KeyFact } from "./buy-box";
import { CompatibleProducts } from "./compatible-products";
import { DocumentList } from "./document-list";
import { ProductGallery } from "./product-gallery";
import { RecentlyViewed, TrackView } from "./recently-viewed";
import { SectionNav, type SectionLink } from "./section-nav";
import { SpecTable } from "./spec-table";
import { VariantTable } from "./variant-table";
import { VideoGallery } from "./video-gallery";

const FACT_LABELS: Record<string, string> = {
  "Ingress Protection (IP) Rating": "IP rating",
  "Color/Appearance": "Color",
};

function keyFacts(product: Product): KeyFact[] {
  const facts: KeyFact[] = [];
  const grip = gripRange(product);
  if (grip) facts.push({ label: "Grip range", value: formatRange(grip) });
  const panel = panelRange(product);
  if (panel) facts.push({ label: "Panel thickness", value: formatRange(panel) });
  for (const name of KEY_SPECS) {
    if (facts.length >= 6) break;
    const value = specValue(product, name);
    if (value) facts.push({ label: FACT_LABELS[name] ?? name, value });
  }
  return facts;
}

function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-[calc(var(--header-height)+80px)]">
      <SectionHeading id={`${id}-title`} eyebrow={eyebrow} title={title} description={description} />
      <div className="mt-7">{children}</div>
    </section>
  );
}

function structuredData(data: ProductPageData) {
  const { product, breadcrumbs } = data;
  const url = `${siteConfig.url}${productHref(product.slug)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${url}#product`,
        sku: product.sku,
        mpn: product.sku,
        name: `${product.sku} ${product.name}`,
        description: product.title,
        image: product.images.map((i) => i.src),
        brand: { "@type": "Brand", name: product.brand },
        category: product.category.join(" > "),
        url,
        additionalProperty: product.specs.slice(0, 24).map((s) => ({
          "@type": "PropertyValue",
          name: s.name,
          value: s.value,
          ...(s.unit ? { unitText: s.unit } : {}),
        })),
        ...(product.price != null
          ? {
              offers: {
                "@type": "Offer",
                price: product.price.toFixed(2),
                priceCurrency: product.currency,
                availability: product.stock.status === "out_of_stock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
                url,
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: `${siteConfig.url}${c.href}` })),
      },
    ],
  };
}

export function ProductView({ data }: { data: ProductPageData }) {
  const { product, card, breadcrumbs, related, compatible, variants, family } = data;
  const cadUrl = product.documents.find((d) => d.type === "cad")?.url ?? null;
  const drawingUrl = product.documents.find((d) => d.type === "drawing")?.url ?? null;
  const compatibleCount = compatible.reduce((n, g) => n + g.items.length, 0);
  const paragraphs = product.description.split(/\n{2,}/).filter(Boolean);

  const sections: SectionLink[] = [
    { id: "overview", label: "Overview" },
    { id: "specifications", label: "Specifications" },
    ...(product.documents.length ? [{ id: "downloads", label: "Downloads" }] : []),
    ...(product.videos.length ? [{ id: "videos", label: "Videos" }] : []),
    ...(variants ? [{ id: "variants", label: "Variants" }] : []),
    ...(related.length ? [{ id: "related", label: "Related" }] : []),
    { id: "compatible", label: compatibleCount ? `Compatible (${compatibleCount})` : "Compatible" },
  ];

  return (
    <>
      <TrackView product={card} />
      <JsonLd data={structuredData(data)} />

      <Container className="pt-5">
        <Breadcrumbs items={breadcrumbs} />
      </Container>

      <Container className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
        <ProductGallery images={product.images} videos={product.videos} title={product.title} />
        <BuyBox
          product={card}
          brand={product.brand}
          familyHref={family?.href ?? null}
          stockQuantity={product.stock.quantity}
          keyFacts={keyFacts(product)}
          certifications={product.certifications}
          cadUrl={cadUrl}
          drawingUrl={drawingUrl}
        />
      </Container>

      <SectionNav sections={sections} product={card} />

      <Container className="space-y-20 py-14 sm:space-y-24">
        <Section id="overview" eyebrow="Overview" title={product.name}>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div className="max-w-3xl space-y-4 text-[15px] leading-relaxed text-foreground/80 sm:text-base">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-pretty">
                  {p}
                </p>
              ))}
              {product.features.length > 0 && (
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {product.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /> {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {family && (
              <Link
                href={family.href}
                className="group flex items-center gap-4 self-start rounded-3xl border bg-subtle p-4 transition-colors hover:border-foreground/20"
              >
                <ProductImage src={family.image} alt="" sizes="96px" className="size-24 shrink-0 rounded-2xl" imageClassName="p-2" />
                <span className="min-w-0">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Product family</span>
                  <span className="mt-1 block font-semibold text-foreground">
                    {family.code} · {family.name}
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    View all {formatNumber(family.count, 0)} parts <ArrowRightIcon size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </span>
              </Link>
            )}
          </div>
        </Section>

        <Section id="specifications" eyebrow="Specifications" title="Technical specifications" description="Metric values with imperial conversions.">
          <SpecTable product={product} />
        </Section>

        {product.documents.length > 0 && (
          <Section id="downloads" eyebrow="Resources" title="Downloads" description="CAD models, drawings, literature and compliance documents.">
            <DocumentList documents={product.documents} />
          </Section>
        )}

        {product.videos.length > 0 && (
          <Section id="videos" eyebrow="Videos" title="See it in action">
            <VideoGallery videos={product.videos} />
          </Section>
        )}

        {variants && (
          <Section
            id="variants"
            eyebrow="Variants"
            title={`Other ${product.family.code} variants`}
            description={`${variants.rows.length} parts in this family — compare the options that differ.`}
          >
            <VariantTable table={variants} />
          </Section>
        )}

        {related.length > 0 && (
          <Section id="related" eyebrow="Related" title="Related products" description="Similar parts from the same family and category.">
            <ProductRail products={related} label="Related products" />
          </Section>
        )}

        <section
          id="compatible"
          aria-labelledby="compatible-title"
          className="scroll-mt-[calc(var(--header-height)+80px)] rounded-[2rem] border bg-subtle p-5 sm:p-8 lg:p-10"
        >
          <div className="flex flex-wrap items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
              <PuzzleIcon size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Compatible products</p>
              <h2 id="compatible-title" className="mt-1 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
                Works with {product.sku}
              </h2>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                Accessories, keys, cams and mating parts designed to fit this part. Select several to add a complete kit in one step.
              </p>
            </div>
          </div>
          <div className="mt-8">
            <CompatibleProducts groups={compatible} sku={product.sku} />
          </div>
        </section>

        <RecentlyViewed exclude={product.sku} />
      </Container>
    </>
  );
}
