# Product Catalog

A fast, premium product-catalog website: faceted listing pages, rich product pages with
**Related products** and **Compatible products**, cart, quote requests, comparison and instant search.
Built with **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4**. No database —
all product data is read from JSON files at build time and every page is pre-rendered.

> The brand name **Meridian** is a neutral placeholder. Change it in `src/config/site.ts`.

---

## Quick start

Requirements: **Node.js 20.9 or newer** (Node 22 LTS recommended).

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Production build (what Vercel runs):

```bash
npm run build
npm start
```

Type-check only: `npm run typecheck`.

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel: **Add New → Project → Import** the repository. The Next.js preset is detected automatically.
3. Deploy. No environment variables are required.

Optional environment variables (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO, sitemap and structured data (auto-detected on Vercel). |
| `NEXT_PUBLIC_QUOTE_EMAIL` | Inbox that receives quote requests (default `sales@example.com`). |
| `NEXT_PUBLIC_QUOTE_ENDPOINT` | Optional URL that receives quote requests as JSON (Formspree, CRM webhook, Power Automate …). When set, it is used instead of e-mail. |
| `NEXT_PUBLIC_CHECKOUT_URL` | Optional external checkout. When empty, “Checkout” offers to send the cart as a quote. |
| `NEXT_IMAGE_OPTIMIZATION` | `true`/`false`. Defaults to `true` on Vercel and `false` elsewhere (images then load straight from their source, which avoids proxy issues on corporate test machines). |
| `IMAGE_REMOTE_HOSTS` | Extra image hosts for optimization, comma separated (e.g. your inRiver/DAM CDN). |

---

## What’s inside

### Listing pages (`/catalog`, `/catalog/<category>/…`)
- **Filters generated from the data** with live counts: category, product family, price (slider with
  histogram), availability, part type, accessory type, material, finish, color, access restriction,
  head style, IP rating, certifications and more. Any other spec column with 2–40 values becomes an extra
  filter automatically, so new Excel columns show up without code changes.
- **Application fit**: enter a grip or panel thickness (mm or inches) and see only parts whose range covers it.
- **Sorting**: Featured, Most popular, Newest, Price ↑/↓, Part number A–Z/Z–A, Name A–Z/Z–A.
- Search within results, grid / list view, pagination with 24/48/96 per page, active-filter chips,
  quick view, mobile filter drawer.
- Every view is **shareable**: filters, sort and page are mirrored into the URL.
- First page is server-rendered (SEO); filtering then runs instantly in the browser (~5–10 ms).

### Product pages (`/product/<sku>`)
- Zoomable image gallery with full-screen view, videos in the gallery, part number with copy button.
- Price, stock, quantity, **Add to cart**, **Add to quote**, compare, share, CAD and drawing shortcuts.
- Sticky section navigation with a compact add-to-cart, key facts, compliance badges.
- Specifications (metric with imperial conversion, copy as table), downloads (CAD, drawings,
  catalog pages, performance data, compliance declarations), video gallery.
- **Variants** table for the product family (only the columns that differ).
- **Related products** carousel.
- **Compatible products** (new): accessories and mating parts grouped by type (keys, cams, gaskets …),
  multi-select to add a complete kit to the cart or quote in one step.
- Recently viewed, JSON-LD structured data (Product + Breadcrumb).

### Also
- **Search palette** (Ctrl/⌘ + K or `/`): part numbers, families and categories, keyboard navigation.
- **Cart** (drawer + page, CSV export), **quote list** with request form, **compare** up to 4 parts.
  Cart, quote, compare and history are stored in the visitor’s browser (no backend needed).
- Light/dark theme, mega menu, mobile navigation, sitemap.xml, robots.txt, 404/error pages.

---

## Project structure

```
data/
  products.json        Product data (generated from the PIM export)
  categories.json      Category descriptions
  README.md            Data model reference
src/
  app/                 Routes (App Router): home, catalog, product, cart, quote, compare, API JSON
  components/          UI (catalog, product, commerce, layout, home, ui primitives)
  config/
    site.ts            Brand name, contact details, quote e-mail, popular searches
    facets.ts          Which filters appear and in what order
  lib/                 Data model, catalog building, filter engine, search, client stores
```

## Customizing
- **Brand**: `src/config/site.ts` (name, tagline, contact) and `src/components/layout/logo.tsx` (logo mark).
- **Colors / theme**: the tokens at the top of `src/app/globals.css` (light and dark).
- **Filters**: `src/config/facets.ts`.

## Data
The current data is a **test sample of 324 compression latches and accessories** taken from
southco.com (real part numbers, specs, prices, images, documents and Southco Vimeo videos).
southco.com does not publish related or compatible parts, so for this sample they were derived:
*related* = same family, ranked by shared specs; *compatible* = accessories of the same family, with keys
matched to the latch head style. The PIM (inRiver) Excel export will replace this file — see
[`data/README.md`](data/README.md) for the data model and the columns needed.

After editing `data/*.json`, restart `npm run dev` (data is cached per server process).
