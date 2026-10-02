# ExpertPDP — QA Test Report

| | |
| --- | --- |
| **Application** | ExpertPDP product catalog (Next.js 16 · React 19 · Tailwind CSS v4) |
| **Build tested (live)** | v1.0.0, commit `ea1ce3f` — https://pdp-web-rust.vercel.app |
| **Fix build** | Working copy after commit `ea1ce3f`: ExpertPDP rename + fixes for every defect below (not yet deployed) |
| **Test dates** | 1–2 October 2026 |
| **Test type** | Functional, UI/responsive, accessibility, SEO, performance, security headers, data integrity, link health, negative/edge cases |
| **Prepared by** | Claude (AI-assisted QA pass) |

---

## 1. Summary

| | Count |
| --- | --- |
| Test cases executed on the live site | **157** |
| Passed | **147** |
| Failed | **3** (2 defects, both Major) |
| Passed with a minor issue | **5** (5 Low defects) |
| Observations (no defect) | 1 |
| Not run (by design) | 1 |
| Extra search cases added to verify the fix | 7 (all pass on the fix build) |

**Defects found: 7** (2 Major, 5 Low) plus 2 enhancements and 2 observations. **All 7 defects and enhancement ENH-01 are fixed in the code.** The fixes were verified locally against the real project code and data: unit tests, a UI harness at 9 screen widths, and a strict TypeScript check with 0 errors. They go live once the changes are committed and pushed (see section 8).

**Release recommendation:**
- **v1.0.0 as deployed:** *not* recommended for a wider audience. One of the six "Popular" searches on the home page ("IP 66") returns no results, and every page scrolls sideways on tablets and small laptops.
- **Fix build:** **GO**, once the short post-deploy smoke test in section 8 passes.

### Results by area (live site)

| Area | Cases | Pass | Fail | Minor | Other |
| --- | ---: | ---: | ---: | ---: | --- |
| General | 6 | 6 | | | |
| Header & navigation | 9 | 9 | | | |
| Search palette | 14 | 14 | | | +7 fix cases |
| Home page | 12 | 11 | 1 | | |
| Listing pages (filters, sort, pagination) | 32 | 31 | | 1 | |
| Product page | 27 | 27 | | | |
| Cart | 8 | 8 | | | |
| Quote request | 5 | 4 | | | 1 not run |
| Compare | 6 | 6 | | | |
| Persistence | 2 | 2 | | | |
| Responsive / mobile | 10 | 8 | 2 | | |
| Accessibility | 6 | 5 | | 1 | |
| SEO | 7 | 5 | | 2 | |
| Performance | 7 | 7 | | | |
| Security headers | 1 | 1 | | | |
| Dark mode | 1 | 1 | | | |
| Errors & API | 4 | 2 | | 1 | 1 observation |
| **Total** | **157** | **147** | **3** | **5** | **2** |

---

## 2. Scope

**In scope:** header, mega menu and mobile menu; search palette; home page; listing pages (every filter type, all 9 sorts, pagination, URL state); product page (gallery, video, buy box, specs, downloads, variants, related products, **compatible products**); cart, quote and compare; data persistence and cross-tab sync; layout at 375–1440 px; accessibility (WCAG 2.2 AA checks); SEO; performance; HTTP security headers; error handling.

**Data integrity:** every filter count and sort order was checked against expected values computed independently from `data/products.json`, not just "looks right". All 246 document and CAD links were requested and returned HTTP 200.

**Not covered (see recommendations):** real iOS/Android devices, Safari and Firefox engines, a screen-reader walkthrough, load testing, real delivery of quote e-mails, and the inRiver Excel import (the file is not available yet).

## 3. Environment and method

- **Site:** Vercel production deployment https://pdp-web-rust.vercel.app, build v1.0.0.
- **Browser:** Chromium (the browser built into the Claude desktop app). Viewports: 375×812 (phone), 640, 768×1024 (tablet), 820, 900, 1024×800 (small laptop), 1100, 1280, 1440×900 (desktop). Light and dark themes.
- **HTTP-level checks:** Node.js 24 with normal TLS validation, for status codes, response headers, meta tags, sitemap, robots and link health.
- **Fix verification:** the real project source ran in a local in-browser harness (esbuild-wasm, React 19), plus Node unit tests on the real `src/lib` code and data, plus a strict TypeScript 5.9.3 check against Next.js 16.3.8 / React 19 type definitions (0 errors). No npm commands were run and nothing was installed or added to the project for testing.

### Why the Playwright MCP server was not used

The corporate network inspects HTTPS traffic (Forcepoint/Websense). Every HTTPS site, including `*.vercel.app`, therefore arrives with a certificate issued by **"Websense Public Primary Certificate Authority"**. Windows and the Claude desktop browser trust that certificate. The browser bundled with the Playwright MCP server does not, so every page failed with `ERR_CERT_AUTHORITY_INVALID`. Certificate validation was **not** bypassed; all tests ran in the built-in browser instead, with identical coverage. To use Playwright later, any of these options keeps TLS validation on:

1. Start the Playwright MCP server with the installed Edge or Chrome (`--browser msedge` or `--browser chrome`). These use the Windows certificate store, which already trusts the corporate CA.
2. Ask IT to add the Websense root certificate to the environment Playwright runs in.
3. Run automated browser tests outside the corporate proxy, for example in GitHub Actions against the Vercel URL.

---

## 4. Defect log

Severity: **Major** = a visible feature is broken or every page is affected; **Low** = cosmetic, SEO or accessibility polish.

### DEF-01 · Major · Spec values are not searchable: the "IP 66" popular search returns 0 results

| | |
| --- | --- |
| Area | Search palette, "Search within" on listing pages, home page popular chips |
| Steps | 1. Open the home page. 2. Click **IP 66** under the hero search (or press Ctrl+K and type `IP 66`). |
| Expected | The 24 parts rated IP 66 (IP 66, IP 67). |
| Actual | "0 products" in the listing; "No results" in the palette. |
| Root cause | Search only covered part number, title, family, category and accessory type. Spec values (material, finish, IP rating …) and certifications were not indexed, even though the search box placeholder promises "specs". |
| Found while fixing | Matching was by plain substring. `UL` found 11 parts, mostly unrelated hits like "Tub**ul**ar", instead of the 123 UL-certified parts. A search for `IP` matched every part with "gr**ip**" in its title. Hyphens and "&" were handled inconsistently: `stainless-steel` → 0 vs `stainless steel` → 67; `quarter-turn` → 52 vs `quarter turn` → 113; `lift and turn` → 11 unrelated hits ("st**and**ard") vs `lift & turn` → 62. |
| Fix | Searchable spec values come from a configurable list (`SEARCH_SPECS` in `src/config/facets.ts`) plus certifications, in both the search index and the listing index. Words must now match from the start of a word. Part numbers and codes are also compared without spaces or punctuation (`IP66`, `ip-66`, `e31515`). Dashes count as spaces and "&" as "and". Part-number ranking is unchanged. |
| Files | `src/config/facets.ts`, `src/lib/product.ts`, `src/lib/search.ts`, `src/lib/filter.ts`, `src/lib/facets.ts`, `src/lib/catalog-core.ts` |
| Verified | 12 unit tests on the real data, plus UI tests in the harness (see §6). The search index grows by about 1.8 KB compressed. |
| Status | **Fixed — verify after deploy** |

### DEF-04 · Major · Pages scroll sideways on tablets (768 px) and small laptops (1024 px)

| | |
| --- | --- |
| Area | Header (every page) and footer (every page) |
| Steps | Open any page in a 1024 px or a 768 px wide window and swipe or scroll sideways. |
| Expected | Page width equals the window width. |
| Actual | **a)** At 1024 px the page is 21 px too wide. The header search box could not shrink below 386 px, which pushed the header icons past the edge. **b)** At 768 px the page is 2 px too wide. The footer's "Request a quote" button (146 px) did not fit its 140 px column, a 12-column grid squeezed onto a tablet. |
| Fix | a) The search box can now shrink: its text truncates with "…" (`min-w-0`). b) The footer uses a 2×2 grid below 1024 px and keeps the original 12-column layout on desktop. |
| Files | `src/components/layout/site-header.tsx`, `src/components/layout/site-footer.tsx` |
| Verified | 10 page types × 9 widths (375–1440 px): no sideways scroll, no layout conflicts, no errors. Desktop look unchanged. |
| Status | **Fixed** |

### DEF-02 · Low · An out-of-range page number stays in the URL

| | |
| --- | --- |
| Steps | Open `/catalog/latches/compression-latches?page=99` (e.g. an old shared link). |
| Expected | The last real page is shown and the URL says so. |
| Actual | The correct page was shown, but `page=99` stayed in the address bar, so re-sharing the link spreads a wrong URL. |
| Fix | The URL is rewritten to the page actually shown (`src/components/catalog/catalog-explorer.tsx`). |
| Verified | `?material=Steel&page=99` → `page=4` ("Showing 73–74 of 74"); `page=0` and `page=-5` are dropped; `page=3` is kept. |
| Status | **Fixed** |

### DEF-03 · Low · The 404 page has the generic home page title

| | |
| --- | --- |
| Steps | Open `/no-such-page`; look at the browser tab. |
| Expected | "Page not found · ExpertPDP". |
| Actual | The home page title, so the tab and browser history give no hint that the page is missing. |
| Fix | `src/app/not-found.tsx` exports page metadata. Next.js 16.3.8 reads metadata from the not-found file (checked in its metadata resolver). |
| Status | **Fixed — verify after deploy** |

### DEF-05 · Low (accessibility) · Dark mode: blue text on light-blue chips is below WCAG AA contrast

| | |
| --- | --- |
| Steps | Switch to dark mode; check accessory chips (e.g. "Cams"), soft buttons and document icons. |
| Expected | Contrast ≥ 4.5:1 (WCAG 2.2 AA). |
| Actual | 4.47:1. |
| Fix | Dark-mode `--primary-soft` darkened slightly (`src/app/globals.css`). The brand blue and light mode are unchanged. |
| Verified | 4.79:1 measured on the rendered page (home and product page, including 11 px chips). |
| Status | **Fixed** |

### DEF-06 · Low (SEO) · The home page has no canonical URL

| | |
| --- | --- |
| Actual | Catalog, category and product pages had `<link rel="canonical">`; the home page did not. |
| Fix | `src/app/page.tsx` declares the canonical `/`. |
| Status | **Fixed — verify after deploy** |

### DEF-07 · Low (SEO) · Link previews of catalog and category pages show the home page

| | |
| --- | --- |
| Steps | View the source of `/catalog/latches/compression-latches` (or paste the link into Teams or Slack). |
| Expected | Preview with the category name and the category's own URL. |
| Actual | `og:title` was the generic site title and `og:url` pointed to the **home page**. Product pages were also missing `og:site_name`. |
| Fix | New helper `src/lib/metadata.ts` gives every catalog, category and product page its own title, description, canonical URL, `og:url` and `og:site_name`. Category pages also use their category image as the preview image. |
| Status | **Fixed — verify after deploy** |

### Enhancements and observations

| ID | Type | Description | Status |
| --- | --- | --- | --- |
| ENH-01 | Enhancement | The two floating product cards in the home hero were not clickable (the main card was). | **Done**: all three link to their product. |
| ENH-02 | Enhancement | No default share image for the home and "All products" pages; previews there show text only. Product and category pages have images. | Open (recommendation) |
| OBS-01 | Observation | `/api/products/<unknown>` returns the HTML 404 page, not JSON. The site never requests unknown parts, and the client handles it correctly. | By design (static API) |
| OBS-02 | Observation | Entering the grip in inches (e.g. 0.75 in) filters correctly but the chip shows the converted value ("19.05 mm"). | By design; optional polish |

---

## 5. Test case catalog (live site, build v1.0.0)

Status: **PASS** · **FAIL** (defect) · **MINOR** (passes with a Low defect) · **NOTE** (observation) · **NOT RUN**.
Expected counts come from `data/products.json` and were computed independently.

### 5.1 General

| ID | Test case | Expected result | Status | Actual / evidence |
| --- | --- | --- | --- | --- |
| GEN-01 | Open the home page | HTTP 200, page title, `lang="en"`, no console errors | PASS | 0 console messages |
| GEN-02 | Check every image on the home page | No broken images | PASS | 32/32 loaded |
| GEN-03 | Inspect image requests | Product photos resized and converted (AVIF/WebP) by the Vercel image optimizer | PASS | 32/32 via `/_next/image` |
| GEN-04 | Browser tab icon | Site icon is served | PASS | `/icon.svg` |
| GEN-05 | Fonts | Geist Sans/Mono self-hosted; no third-party font requests | PASS | |
| GEN-06 | Width at 1440 px | No horizontal overflow | PASS | page width = window width |

### 5.2 Header and navigation

| ID | Test case | Expected result | Status | Actual / evidence |
| --- | --- | --- | --- | --- |
| HDR-01 | Click the logo | Goes to the home page | PASS | |
| HDR-02 | Announcement bar | E-mail link (`mailto:`) and phone shown | PASS | |
| HDR-03 | Main navigation | "All products" → `/catalog`, "Compare" → `/compare` | PASS | |
| HDR-04 | Icon-only buttons | Every icon button has an accessible name and live count | PASS | "Cart (0 items)", "Quote list (0)", "Toggle dark mode" … |
| HDR-05 | Scroll down | Header stays pinned at the top | PASS | |
| HDR-06 | Click "Products" | Mega menu opens (`aria-expanded`), categories with counts, subcategories, families, "Browse all 324 products" | PASS | |
| HDR-07 | Close the mega menu | Closes on Esc, outside click and navigation | PASS | |
| HDR-08 | Hover "Products" | Opens on hover, closes when the pointer leaves | PASS | real pointer |
| HDR-09 | Mega menu geometry | Fully inside the window | PASS | |

### 5.3 Search palette

| ID | Test case | Expected result | Status | Actual / evidence |
| --- | --- | --- | --- | --- |
| SRCH-01 | Click the header search | Palette opens with the cursor in the input | PASS | |
| SRCH-02 | Keyboard shortcuts | Ctrl/⌘+K opens and toggles, `/` opens, Esc closes | PASS | |
| SRCH-03 | Type `/` inside another text field | Palette does **not** open | PASS | |
| SRCH-04 | Open with an empty query | Popular searches and product families shown | PASS | 6 + 6 |
| SRCH-05 | Search `E3-15-15` | Exact part ranks first | PASS | |
| SRCH-06 | Search `e31515` (no dashes) | Finds E3-15-15 | PASS | |
| SRCH-07 | Search `stainless key` | Only parts matching both words | PASS | 2 results |
| SRCH-08 | Search `C5`, `lever` | Families group and categories group shown | PASS | |
| SRCH-09 | Search `zzzz` | Friendly "no results" message | PASS | |
| SRCH-10 | Arrow keys, then Enter | Active option moves (`aria-activedescendant`); Enter opens the product | PASS | |
| SRCH-11 | Search, open a result, reopen palette | Recent searches listed | PASS | |
| SRCH-12 | Click × in the input | Query cleared, focus kept | PASS | |
| SRCH-13 | "See all results" for `powder coat` | `/catalog?q=powder+coat`, chip and box filled | PASS | 117 of 324 |
| SRCH-14 | New search while already on `/catalog?q=…` | Results update on the same page | PASS | "stainless" → 67 |
| SRCH-15 | *(fix build)* Search `IP 66`, `IP66`, `ip-66` | Exactly the 24 IP 66-rated parts | PASS | 24 / 24 / 24 |
| SRCH-16 | *(fix build)* Search `IP 65` | Only IP 65 parts, no IP 66 | PASS | 28 |
| SRCH-17 | *(fix build)* Search `UL` | Only UL-certified/UL-spec parts; no "Tubular" hits | PASS | 128 |
| SRCH-18 | *(fix build)* `stainless-steel` vs `stainless steel`; `lift and turn` vs `lift & turn`; `quarter-turn` vs `quarter turn` | Same results for each pair | PASS | 67 / 62 / 113 |
| SRCH-19 | *(fix build)* Search `e3-15` | Only E3-15… parts (not E3-5-15) | PASS | 6 |
| SRCH-20 | *(fix build)* `IP 66` + Material = Stainless Steel | Both conditions apply (AND) | PASS | |
| SRCH-21 | *(fix build)* Queries `-`, `®`, `(((`, `/` | No error; sensible results | PASS | |

### 5.4 Home page

| ID | Test case | Expected result | Status | Actual / evidence |
| --- | --- | --- | --- | --- |
| HOME-01 | Hero badge | Live counts of parts and families | PASS | "324 parts · 15 families" |
| HOME-02 | Click the hero search | Opens the search palette | PASS | |
| HOME-03 | Click each popular chip | Each lists matching products | **FAIL → DEF-01** | E3 66, Lever latch 61, Stainless steel 67, Key locking 33 — **IP 66 → 0** |
| HOME-04 | "Browse the catalog" / "Request a quote" | Go to `/catalog` / `/quote` | PASS | |
| HOME-05 | Click the hero product cards | Open the product | PASS | main card only (ENH-01, now done) |
| HOME-06 | Stats strip | Totals match the data | PASS | 324 / 15 / 1,779 / 1,986 |
| HOME-07 | Category cards | Correct links and counts, singular "1 product" | PASS | |
| HOME-08 | Click a family card (E3) | Category page with the family filter applied | PASS | 65 of 91, all E3 |
| HOME-09 | Featured rail | 12 cards; arrows scroll and disable at the ends | PASS | |
| HOME-10 | Video spotlight | Vimeo player loads (do-not-track) | PASS | |
| HOME-11 | Recently viewed | "Pick up where you left off" lists viewed parts | PASS | |
| HOME-12 | Footer links and copyright | All links valid | PASS | 11 links |

### 5.5 Listing pages (filters, sort, pagination)

| ID | Test case | Expected result | Status | Actual / evidence |
| --- | --- | --- | --- | --- |
| PLP-01 | Each of the 9 sort options | Order matches the data (featured, popular, newest, price ↑/↓, part no. A–Z/Z–A, name A–Z/Z–A) | PASS | first 6 exact for every sort; prices monotonic |
| PLP-02 | Change sort | Sort saved in the URL; default omitted | PASS | |
| PLP-03 | Material = Zinc Alloy | Expected count | PASS | 138 = 138 |
| PLP-04 | Zinc Alloy **or** Steel (same filter) | OR within a filter | PASS | 212 = 212 |
| PLP-05 | Zinc Alloy **and** Powder Coat (two filters) | AND across filters | PASS | 109 = 109 |
| PLP-06 | Live option counts | Counts update; impossible options disabled | PASS | 56 disabled with "Accessories" |
| PLP-07 | Availability = In stock | Expected count | PASS | 173 = 173 |
| PLP-08 | Application fit: grip 18 mm | Only parts whose grip range contains 18 mm | PASS | 64 = 64 |
| PLP-09 | Grip 0.75 in | Converted to 19.05 mm | PASS | 59 = 59 |
| PLP-10 | Grip `abc`, `-5` | Rejected; no filter applied | PASS | |
| PLP-11 | Panel thickness 3 mm | Expected count | PASS | 190 = 190 |
| PLP-12 | Price $20–$40 | Expected count; chip; URL `price=20..40`; all prices in range | PASS | 113 = 113 |
| PLP-13 | Price histogram and slider | 24-bar histogram; labelled slider handles | PASS | |
| PLP-14 | Long filter lists | "Show all", find-in-filter, "No matches" | PASS | Head style 6 → 30; "hex" → 3 |
| PLP-15 | Collapse / expand a filter | Toggles | PASS | |
| PLP-16 | Search within results | Part numbers (incl. compact), words, clear | PASS | `e31515` → E3-15-15 |
| PLP-17 | Pagination | Numbers, prev/next, ellipsis, disabled at the ends | PASS | 13 pages; "Showing 289–293 of 293" |
| PLP-18 | Per page = 96 | 96 cards; back to page 1 | PASS | |
| PLP-19 | Change a filter on page 3 | Back to page 1 | PASS | |
| PLP-20 | Open a shared filtered URL | Filters, fit, sort and per-page restored; boxes ticked | PASS | 36 results |
| PLP-21 | Open `?page=99` | Last page shown and URL corrected | **MINOR → DEF-02** | page shown correctly, URL kept `page=99` |
| PLP-22 | Browser back / forward | Previous filter state restored | PASS | |
| PLP-23 | Invalid parameters (`material=Nope`, `sort=bad`, `page=abc`, `per=7`, `price=abc`, `grip=xyz`) | Ignored; URL cleaned up | PASS | |
| PLP-24 | Script injection in `q` | Shown as text, never executed | PASS | |
| PLP-25 | Filters with no matches | Empty state with "Clear all filters" | PASS | |
| PLP-26 | Switch to list view, reload | View remembered | PASS | |
| PLP-27 | Card "Add to cart" twice | Quantity merges; toast; badge updates | PASS | Cart (2 items) |
| PLP-28 | Card "Add to quote", "Compare" | Toggles (`aria-pressed`); compare tray appears | PASS | |
| PLP-29 | Several quick actions | At most 3 toasts; auto-dismiss | PASS | |
| PLP-30 | Quick view | Specs, stock, quantity, add, close, "View details" | PASS | |
| PLP-31 | Category with one product | Filter sidebar hidden; full-width grid | PASS | |
| PLP-32 | Family code with slashes (`16/27/48`) | Filter works from the URL | PASS | 26 of 79 |

### 5.6 Product page

| ID | Test case | Expected result | Status | Actual / evidence |
| --- | --- | --- | --- | --- |
| PDP-01 | Heading and breadcrumb | One H1; 6-level breadcrumb with current page marked; family link | PASS | |
| PDP-02 | Price, stock, key facts, badges | Live stock quantity; compliance badges | PASS | "5,087 available" |
| PDP-03 | Quantity field | Min 1 (− disabled), letters removed, `0` → 1, `12abc5` → 125, max 9,999 (+ disabled) | PASS | |
| PDP-04 | Add 7 to cart | Line total correct | PASS | 7 × $26.04 = $182.28 |
| PDP-05 | Add to quote; compare toggle | Quote line merges; compare label and `aria-pressed` switch | PASS | |
| PDP-06 | Copy part number | Clipboard + "Copied" | PASS | |
| PDP-07 | Share (desktop) | Link copied + toast | PASS | |
| PDP-08 | CAD / Drawing shortcuts | Open in a new tab safely (`noopener noreferrer`) | PASS | |
| PDP-09 | Gallery thumbnails | Images and videos selectable; selection announced | PASS | 1 image + 2 videos |
| PDP-10 | Hover the main image | 2.1× zoom follows the pointer | PASS | |
| PDP-11 | Open / close the lightbox | Works; no arrows for a single image | PASS | |
| PDP-12 | Video thumbnail | Vimeo player in the gallery | PASS | |
| PDP-13 | Section navigation | Jump links, URL hash, active section highlight, sticky | PASS | |
| PDP-14 | Scroll past the buy box | Compact "Add to cart" bar appears and works | PASS | |
| PDP-15 | Specifications | Table, metric + imperial; "Copy specifications" | PASS | 26 lines |
| PDP-16 | Downloads | Grouped: CAD & drawings / Literature & data / Compliance | PASS | 7 links |
| PDP-17 | **Link health**: every document, certificate and CAD link | HTTP 200, correct file type | PASS | 212 PDFs + 14 certificates + 20 CAD |
| PDP-18 | Video playlist | Switches the main player | PASS | |
| PDP-19 | Variants table | All family variants; current marked "Viewing"; rows link | PASS | 34 rows |
| PDP-20 | Related products | Same-family cards | PASS | 12 |
| PDP-21 | **Compatible products** tabs | Grouped by type with counts; keys match the latch head style | PASS | 10 tabs; All 28, Cams 4, Keys 2 |
| PDP-22 | Compatible kit selection | Select → "3 selected · $14.55"; unselect; add kit to quote; clear | PASS | |
| PDP-23 | Accessory page (E3-5-15) | "Works with" lists the latches; accessory badge | PASS | 5 latches |
| PDP-24 | Product without accessories (C2-32-35) | Empty state with "Request a quote" | PASS | |
| PDP-25 | Recently viewed | Newest first; current part excluded | PASS | |
| PDP-26 | Structured data | Product (SKU, price USD, InStock, properties) + BreadcrumbList | PASS | |
| PDP-27 | Meta tags | Title, description, canonical, `og:image` | PASS | |

### 5.7 Cart

| ID | Test case | Expected result | Status | Actual / evidence |
| --- | --- | --- | --- | --- |
| CART-01 | Open the cart drawer | Lines, line totals; subtotal = sum of lines | PASS | 2×21.38 + 3×34.74 + 8×26.04 = $355.30 |
| CART-02 | Change a quantity | Line, subtotal, badge and heading update | PASS | $376.68, Cart (14) |
| CART-03 | Remove a line | Totals update | PASS | $168.36 |
| CART-04 | Close (×) / "View cart & checkout" | Drawer closes / `/cart` opens and drawer closes | PASS | |
| CART-05 | Cart page summary | "6 items · 2 part numbers" | PASS | |
| CART-06 | Export CSV | Correct columns, quoted text, UTF-8 (Excel-safe) | PASS | content checked, no file downloaded |
| CART-07 | Checkout | Explains checkout is not connected; "Keep shopping" closes | PASS | |
| CART-08 | "Request a quote" from the cart | Lines copied to the quote list with quantities; cart kept | PASS | |

### 5.8 Quote request

| ID | Test case | Expected result | Status | Actual / evidence |
| --- | --- | --- | --- | --- |
| QUOTE-01 | Form fields | Labelled, required fields marked, autofill hints | PASS | |
| QUOTE-02 | Submit empty / invalid | 3 errors; errors clear while typing; `not-an-email`, `a@b` rejected | PASS | |
| QUOTE-03 | Edit the quote list | Quantity, remove, badge, indicative value | PASS | $287.01 |
| QUOTE-04 | Export quote CSV | Correct file | PASS | |
| QUOTE-05 | Valid submission | Request sent; confirmation; list cleared | NOT RUN (live) | Live uses e-mail (`mailto:`) and would open the e-mail client. The endpoint mode was verified in the harness. |

### 5.9 Compare and persistence

| ID | Test case | Expected result | Status | Actual / evidence |
| --- | --- | --- | --- | --- |
| CMP-01 | Add a 5th product to compare | Refused with a message | PASS | "Compare holds up to 4 products" |
| CMP-02 | Compare tray | 4 thumbnails; remove from tray | PASS | |
| CMP-03 | Compare page | 4 columns; differing rows highlighted | PASS | 30 rows, 26 differ |
| CMP-04 | "Show differences only" | 30 → 26 → 30 rows | PASS | |
| CMP-05 | Remove a column; add to cart from compare | Works | PASS | |
| CMP-06 | Clear all | Empty state + "Browse products" | PASS | |
| PERSIST-01 | Reload the browser | Cart, quote and compare kept | PASS | |
| PERSIST-02 | Two tabs open | Changes in one tab appear in the other without reload | PASS | |

### 5.10 Responsive and mobile

| ID | Test case | Expected result | Status | Actual / evidence |
| --- | --- | --- | --- | --- |
| RESP-01 | 375 px: all page types | No sideways scroll | PASS | |
| RESP-02 | 375 px header | Menu, logo, search, quote, cart; compare + theme inside the menu | PASS | |
| RESP-03 | 375 px listing | 2-column grid; "Filters" drawer with "Show N results" and badge | PASS | |
| RESP-04 | 375 px product page | Gallery above buy box; section nav scrolls | PASS | |
| RESP-05 | 375 px mobile menu | Category accordions; theme toggle; closes on navigation | PASS | |
| RESP-06 | 375 px toasts | Shown at the top, clear of the compare tray | PASS | |
| RESP-07 | Tap targets | Comfortable sizes (whole card is tappable) | PASS | |
| RESP-08 | 768 px (tablet), all pages | No sideways scroll | **FAIL → DEF-04b** | page 2 px too wide (footer) |
| RESP-09 | 1024 px (small laptop), all pages | No sideways scroll | **FAIL → DEF-04a** | page 21 px too wide (header) |
| RESP-10 | 1024 px layout | Filter sidebar, 3-column grid, gallery beside buy box | PASS | |

### 5.11 Accessibility, SEO, performance, security, dark mode, errors

| ID | Test case | Expected result | Status | Actual / evidence |
| --- | --- | --- | --- | --- |
| A11Y-01 | Headings | One H1 per page; no skipped levels | PASS | |
| A11Y-02 | Names and labels | No unnamed buttons/links; all images have alt text; all inputs labelled | PASS | |
| A11Y-03 | Landmarks | Header/nav/main/footer, "Skip to content", result count announced | PASS | |
| A11Y-04 | Contrast, light mode | ≥ 4.5:1 | PASS | lowest 4.76:1 |
| A11Y-05 | Contrast, dark mode | ≥ 4.5:1 | **MINOR → DEF-05** | 4.47:1 on primary-soft chips |
| A11Y-06 | Dialogs and combobox | Focus trapped, Esc closes, ARIA combobox in search | PASS | |
| SEO-01 | `sitemap.xml` | All pages, correct host | PASS | 338 URLs |
| SEO-02 | `robots.txt` | Blocks /api, /cart, /quote, /compare; links the sitemap | PASS | |
| SEO-03 | Titles and descriptions | Unique per page | PASS | |
| SEO-04 | Canonical URLs | On every indexable page | **MINOR → DEF-06** | missing on the home page |
| SEO-05 | Open Graph | Page-specific title, URL, image | **MINOR → DEF-07** | catalog/category generic; no default image (ENH-02) |
| SEO-06 | Server-side rendering | Products present in the raw HTML | PASS | home 12, category 24 cards |
| SEO-07 | `noindex` | Cart, quote, compare and 404 not indexed | PASS | |
| SEC-01 | Response headers | HSTS on; `X-Powered-By` hidden; Brotli compression | PASS | |
| PERF-01 | Home timing (warm) | Fast load | PASS | TTFB 115 ms, load 263 ms |
| PERF-02 | HTML size (compressed) | Small pages | PASS | home 17 KB, category 27 KB, product 21 KB |
| PERF-03 | JavaScript size (compressed) | Reasonable | PASS | ≈ 188 KB total |
| PERF-04 | CDN cache and server response | Served from the edge cache | PASS | cache HIT, TTFB 70–83 ms |
| PERF-05 | Layout shift (CLS) | 0 | PASS | 0 |
| PERF-06 | Main hero image | Loaded early with high priority, responsive sizes | PASS | LCP value: run Lighthouse |
| PERF-07 | Filter response time | Instant | PASS | 5–11 ms |
| DARK-01 | Dark mode | Toggle, remembered, no white flash on load, product photos keep light backgrounds | PASS | |
| ERR-01 | Unknown product, category or page | Branded 404 page with HTTP 404 status | PASS | 5 routes |
| ERR-02 | 404 page title | "Page not found" | **MINOR → DEF-03** | generic home title |
| API-01 | `/api/search-index`, `/api/products/e3-15-15` | JSON, HTTP 200, cached | PASS | |
| API-02 | `/api/products/<unknown>` | 404 | NOTE (OBS-01) | HTML 404, not JSON |

---

## 6. Fix verification (re-test before deploy)

| Defect | How it was verified | Result |
| --- | --- | --- |
| DEF-01 | 12 unit tests on the real data (SRCH-15…21, part-number forms, family codes, filters still combine). In the UI: palette "IP 66" → 7 IP 66 parts and "See all" → **24 products of 324**; search within `IP66` 24, `stainless-steel` 67, `lift and turn` 62, `UL` 128, `e3 15 15` 17 with E3-15-15 first. | Fixed |
| DEF-02 | `?material=Steel&page=99` → `page=4`; `page=0`, `page=-5` removed; `page=3` kept. | Fixed |
| DEF-03 | Next.js 16.3.8 metadata resolver confirmed to read the not-found file's metadata. | Fixed (confirm on deploy) |
| DEF-04 | 10 page types × 9 widths (375, 640, 768, 820, 900, 1024, 1100, 1280, 1440): no overflow, 0 layout-class conflicts, 0 errors. Search box truncates at 1024 px; full 448 px from 1280 px. Footer 2×2 at tablet, unchanged on desktop. | Fixed |
| DEF-05 | Dark-mode contrast on rendered page 4.79:1 (was 4.47:1). | Fixed |
| DEF-06, DEF-07 | Metadata code reviewed and type-checked. | Fixed (confirm on deploy) |
| ENH-01 | Hero side cards link to `/product/e3-15-15` and `/product/n2-2-301-01-5`. | Done |
| Regression | Filter counts identical to the live ground truth (Zinc 138, Zinc+Steel 212, Zinc+Powder Coat 109, In stock 173, Accessories 47, grip 18 mm 64, 0.75 in 59, panel 3 mm 190, $20–40 113); all sorts keep every item; URL state round-trips. TypeScript strict check: **0 errors** (631 files). | Pass |

## 7. Brand rename (requested change)

"Meridian" → **ExpertPDP** in `src/config/site.ts` (site name: titles, header, footer, metadata, structured data), a new "E" logo mark in `src/components/layout/logo.tsx` and `src/app/icon.svg` (browser tab icon), and `README.md`. No "Meridian" remains in the project. The live site still shows "Meridian" until the changes are pushed.

## 8. Post-deploy smoke test (after commit + push)

1. Tab title "ExpertPDP — Precision access hardware"; "E" logo in header, footer and browser tab; footer "© 2026 ExpertPDP".
2. Home → click **IP 66** → "24 products of 324". Ctrl+K → `IP66` → IP 66-rated parts.
3. Make the window 1024 px and then 768 px wide → no sideways scrolling on home, a category page and a product page.
4. `/no-such-page` → tab title "Page not found · ExpertPDP".
5. `/catalog/latches/compression-latches?page=99` → address bar changes to `?page=13`.
6. View source of the home page → `<link rel="canonical" href="https://pdp-web-rust.vercel.app">`. On a category page → `og:title` = category name and `og:url` = that page.
7. Dark mode → accessory chips on a product page are readable.

## 9. Recommendations

1. **Lighthouse** (Chrome DevTools → Lighthouse, mobile) on the home, a category and a product page, to record LCP and INP. Those could not be measured here because the test browser window was in the background.
2. **Real devices:** iPhone (Safari) and Android (Chrome): touch, the filter drawer and dialogs, zoom.
3. **Other browsers:** Firefox and Safari desktop.
4. **Screen reader pass:** NVDA + Edge, or VoiceOver.
5. **Quote delivery:** set `NEXT_PUBLIC_QUOTE_ENDPOINT` (e.g. Power Automate or CRM webhook) before go-live, then send a real test request. `mailto:` depends on each visitor's e-mail client.
6. **Automated regression:** once Playwright can reach the site (section 3), automate the 157 cases above, starting with search, filters and cart.
7. **ENH-02:** add a branded 1200×630 share image for the home and "All products" pages.
8. **inRiver import:** when the Excel export arrives, re-run the data checks: missing images, broken document links, related/compatible part numbers that don't exist, duplicate part numbers, and new spec columns (add descriptive ones to `SEARCH_SPECS`).
