import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { CategoryNode, FamilySummary, HomeData } from "@/lib/catalog-core";
import { formatNumber, plural } from "@/lib/format";
import { productHref } from "@/lib/product";
import { ProductRail } from "../product-rail";
import { RecentlyViewed } from "../product/recently-viewed";
import { VideoEmbed } from "../product/video-embed";
import { buttonVariants } from "../ui/button";
import { ArrowRightIcon, ArrowUpRightIcon, CubeIcon, PlayIcon, PuzzleIcon, QuoteIcon, RulerIcon } from "../ui/icons";
import { Container, SectionHeading } from "../ui/primitives";
import { ProductImage } from "../ui/product-image";
import { HeroSearch } from "./hero-search";

export function HomeView({ data }: { data: HomeData }) {
  return (
    <>
      <Hero data={data} />
      <Stats stats={data.stats} />
      <Categories categories={data.categories} />
      <Families families={data.families} />
      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="Featured" title="Popular parts engineers specify" href="/catalog?sort=popular" linkLabel="See most popular" />
          <ProductRail products={data.featured} label="Featured products" className="mt-8" />
        </Container>
      </section>
      <Features />
      {data.spotlight && <Spotlight spotlight={data.spotlight} />}
      <QuoteBand />
      <Container className="pt-20">
        <RecentlyViewed title="Pick up where you left off" />
      </Container>
    </>
  );
}

function Hero({ data }: { data: HomeData }) {
  const [a, b, c] = data.showcase;
  return (
    <section className="relative overflow-hidden border-b">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
      <Container className="relative grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:py-24">
        <div className="animate-rise">
          <p className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-success" />
            {formatNumber(data.stats.products, 0)} parts · {data.stats.families} families · CAD for every part
          </p>
          <h1 className="mt-6 max-w-2xl text-balance text-4xl font-semibold tracking-[-0.035em] text-foreground sm:text-5xl lg:text-6xl">
            Access hardware,{" "}
            <span className="bg-linear-to-r from-primary to-[color-mix(in_oklab,var(--primary)_55%,var(--foreground))] bg-clip-text text-transparent">
              specified in seconds.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-[17px] leading-relaxed text-muted-foreground">
            Filter latches by the exact grip and panel thickness of your application, compare variants side by side, download CAD and
            add every compatible accessory in one step.
          </p>
          <div className="mt-8">
            <HeroSearch />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/catalog" className={buttonVariants({ size: "lg" })}>
              Browse the catalog <ArrowRightIcon size={17} />
            </Link>
            <Link href="/quote" className={buttonVariants({ variant: "outline", size: "lg" })}>
              <QuoteIcon size={17} /> Request a quote
            </Link>
          </div>
        </div>

        {a && (
          <div className="relative mx-auto hidden aspect-square w-full max-w-[560px] sm:block" aria-hidden="true">
            <div className="absolute inset-[8%] rounded-[2.5rem] border bg-background/60 shadow-[0_40px_100px_-50px_rgb(15_23_42/0.6)] backdrop-blur" />
            <Link
              href={productHref(a.slug)}
              tabIndex={-1}
              className="group absolute inset-[14%] overflow-hidden rounded-[2rem] border bg-image transition-transform duration-500 hover:scale-[1.015]"
            >
              <ProductImage src={a.image} alt="" sizes="420px" eager well={false} className="h-full w-full" imageClassName="p-[14%]" />
              <span className="absolute bottom-4 left-4 rounded-xl border bg-background/90 px-3 py-2 shadow-sm backdrop-blur">
                <span className="block font-mono text-sm font-semibold text-foreground">{a.sku}</span>
                <span className="block text-xs text-muted-foreground">{a.highlights.slice(0, 2).join(" · ")}</span>
              </span>
            </Link>
            {b && (
              <Link
                href={productHref(b.slug)}
                tabIndex={-1}
                className="absolute -left-2 top-[6%] w-[34%] rotate-[-6deg] rounded-3xl border bg-card p-2 shadow-[0_30px_60px_-30px_rgb(15_23_42/0.5)] transition-transform duration-500 hover:-translate-y-1 lg:-left-8"
              >
                <ProductImage src={b.image} alt="" sizes="190px" className="aspect-square rounded-2xl" imageClassName="p-3" />
                <p className="px-1.5 pb-1 pt-2 font-mono text-xs font-semibold text-foreground">{b.sku}</p>
              </Link>
            )}
            {c && (
              <Link
                href={productHref(c.slug)}
                tabIndex={-1}
                className="absolute -right-2 bottom-[4%] w-[36%] rotate-[5deg] rounded-3xl border bg-card p-2 shadow-[0_30px_60px_-30px_rgb(15_23_42/0.5)] transition-transform duration-500 hover:-translate-y-1 lg:-right-6"
              >
                <ProductImage src={c.image} alt="" sizes="200px" className="aspect-square rounded-2xl" imageClassName="p-3" />
                <p className="px-1.5 pb-1 pt-2 font-mono text-xs font-semibold text-foreground">{c.sku}</p>
              </Link>
            )}
            <div className="absolute right-[4%] top-[10%] rounded-2xl border bg-background/90 p-3 shadow-lg backdrop-blur">
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <RulerIcon size={13} className="text-primary" /> Application fit
              </p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">Grip 18 mm · Panel 2 mm</p>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}

function Stats({ stats }: { stats: HomeData["stats"] }) {
  const items = [
    { value: formatNumber(stats.products, 0), label: "Parts with full specifications" },
    { value: formatNumber(stats.families, 0), label: "Product families" },
    { value: formatNumber(stats.documents, 0), label: "CAD models, drawings & documents" },
    { value: formatNumber(stats.compatible, 0), label: "Compatible accessory matches" },
  ];
  return (
    <section className="border-b bg-subtle">
      <Container className="grid grid-cols-2 divide-x divide-y sm:divide-y-0 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="px-4 py-8 first:pl-0 sm:px-8">
            <p className="text-3xl font-semibold tracking-tight tabular-nums text-foreground sm:text-4xl">{item.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}

function Categories({ categories }: { categories: CategoryNode[] }) {
  if (!categories.length) return null;
  const [lead, ...rest] = categories;
  const subcategories = lead.children;
  return (
    <section className="py-20">
      <Container>
        <SectionHeading eyebrow="Categories" title="Shop by category" description="Every category comes with filters tuned to its specifications." href="/catalog" linkLabel="All products" />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <Link href={lead.href} className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-foreground text-background lg:row-span-2">
            <div className="p-8 pb-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-background/60">{plural(lead.count, "product")}</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight">{lead.name}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-background/70">{lead.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium">
                Explore {lead.name.toLowerCase()} <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
            <div className="relative mt-auto h-40 min-h-40 overflow-hidden">
              <div className="absolute -bottom-24 left-1/2 aspect-square w-[72%] -translate-x-1/2 rounded-full bg-image transition-transform duration-500 group-hover:-translate-y-2">
                <ProductImage src={lead.image} alt="" sizes="320px" well={false} className="h-full w-full rounded-full" imageClassName="p-[16%]" />
              </div>
            </div>
          </Link>

          {subcategories.slice(0, 4).map((node) => (
            <CategoryCard key={node.href} node={node} />
          ))}
        </div>

        {rest.length > 0 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((node) => (
              <CategoryCard key={node.href} node={node} compact />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

function CategoryCard({ node, compact = false }: { node: CategoryNode; compact?: boolean }) {
  return (
    <Link
      href={node.href}
      className="group flex items-center gap-5 overflow-hidden rounded-[1.75rem] border bg-card p-4 pr-6 transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-[0_24px_50px_-36px_rgb(15_23_42/0.5)]"
    >
      <ProductImage
        src={node.image}
        alt=""
        sizes="140px"
        className={compact ? "size-20 shrink-0 rounded-2xl" : "size-28 shrink-0 rounded-2xl sm:size-32"}
        imageClassName="p-3 transition-transform duration-500 group-hover:scale-110"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{plural(node.count, "product")}</p>
        <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">{node.name}</h3>
        {!compact && node.description && <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{node.description}</p>}
      </div>
      <ArrowUpRightIcon size={18} className="shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}

function Families({ families }: { families: FamilySummary[] }) {
  if (!families.length) return null;
  return (
    <section className="border-y bg-subtle py-20">
      <Container>
        <SectionHeading eyebrow="Product families" title="Engineered families, every variant" description="Each family groups the head styles, finishes and grip ranges you can choose from." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {families.slice(0, 8).map((family) => (
            <Link
              key={family.code}
              href={family.href}
              className="group flex flex-col rounded-[1.75rem] border bg-card p-3 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_24px_50px_-36px_rgb(15_23_42/0.55)]"
            >
              <div className="relative">
                <ProductImage
                  src={family.image}
                  alt=""
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                  className="aspect-[4/3] rounded-2xl"
                  imageClassName="p-[12%] transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-lg bg-foreground px-2 py-1 font-mono text-xs font-semibold text-background">{family.code}</span>
                {family.video && (
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur">
                    <PlayIcon size={11} fill="currentColor" strokeWidth={0} /> Video
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
                <h3 className="text-[15px] font-semibold leading-snug text-foreground">{family.name}</h3>
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{family.description}</p>
                <p className="mt-auto pt-4 text-[13px] font-medium text-primary">
                  {formatNumber(family.count, 0)} parts <ArrowRightIcon size={14} className="inline transition-transform group-hover:translate-x-0.5" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: <RulerIcon size={20} />,
      title: "Filter by exact fit",
      text: "Enter grip and panel thickness in mm or inches and see only the latches that fit your door.",
    },
    {
      icon: <CubeIcon size={20} />,
      title: "CAD & drawings",
      text: "2D/3D CAD models, dimensioned drawings, catalog pages and test data on every product.",
    },
    {
      icon: <PuzzleIcon size={20} />,
      title: "Compatible accessories",
      text: "Keys, cams, gaskets and covers matched to each part — add the complete kit in one click.",
    },
    {
      icon: <QuoteIcon size={20} />,
      title: "Cart or quote",
      text: "Buy at list price, or build a quote list for volume pricing and custom variants.",
    },
  ];
  return (
    <section className="py-20">
      <Container>
        <SectionHeading eyebrow="Built for engineers" title="Everything you need to specify with confidence" />
        <div className="mt-10 grid gap-px overflow-hidden rounded-[2rem] border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="bg-card p-7">
              <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">{f.icon}</span>
              <h3 className="mt-5 text-base font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Spotlight({ spotlight }: { spotlight: NonNullable<HomeData["spotlight"]> }) {
  const { video, family } = spotlight;
  return (
    <section className="py-8">
      <Container>
        <div className="grid items-center gap-10 overflow-hidden rounded-[2rem] border bg-foreground p-6 text-background sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:p-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-background/60">In action</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight">
              {family.code} · {family.name}
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-background/70">{family.description}</p>
            <Link href={family.href} className={buttonVariants({ variant: "secondary", className: "mt-8" })}>
              Explore {family.count} {family.code} parts <ArrowRightIcon size={16} />
            </Link>
          </div>
          <div className="aspect-video overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
            <VideoEmbed video={video} sizes="(min-width: 1024px) 50vw, 100vw" />
          </div>
        </div>
      </Container>
    </section>
  );
}

function QuoteBand() {
  return (
    <section className="pt-20">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] border bg-subtle px-6 py-12 sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
          <div className="relative max-w-2xl">
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Need volume pricing or a custom variant?</h2>
            <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
              Build a quote list from any product page and send it with your application details. {siteConfig.name} replies with pricing,
              availability and lead times.
            </p>
          </div>
          <div className="relative mt-8 flex shrink-0 flex-wrap gap-3 lg:mt-0">
            <Link href="/quote" className={buttonVariants({ variant: "ink", size: "lg" })}>
              <QuoteIcon size={17} /> Start a quote
            </Link>
            <Link href="/catalog" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Browse products
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
