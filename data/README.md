# Data model

The site reads two files at build time:

- `products.json` — an array of products (one entry per part number / SKU)
- `categories.json` — optional descriptions for category pages

Types are defined in `src/lib/types.ts`. Everything else (category tree, filters, search index,
product families, variants tables) is derived automatically.

## Product fields

| Field | Type | Example | Notes |
| --- | --- | --- | --- |
| `sku` | string | `"E3-15-15"` | Unique part number. |
| `slug` | string | `"e3-15-15"` | URL segment: lowercase, letters/digits/dashes. |
| `name` | string | `"VISE ACTION® Compression Latch"` | Short name. |
| `title` | string | `"VISE ACTION® Compression Latch, Large Size, …"` | Full descriptive title shown on cards and the product page. |
| `brand` | string | `"Southco"` | |
| `family` | `{ code, name }` | `{ "code": "E3", "name": "VISE ACTION® Compression Latches" }` | Product family / series. Drives the “Product family” filter and the variants table. |
| `category` | string[] | `["Latches", "Compression Latches", "Quarter Turn Latches"]` | Path from the top level. Any depth. |
| `accessoryType` | string \| null | `"Keys"` | Set for accessories (keys, cams, gaskets …), `null` for main products. |
| `description` | string | | Paragraphs separated by a blank line (`\n\n`). |
| `features` | string[] | | Optional bullet points. |
| `images` | `{ src, alt }[]` | | First image is the main image. Absolute URLs or paths under `/public`. |
| `videos` | `{ provider, id, hash?, title, duration?, thumbnail? }[]` | `{ "provider": "vimeo", "id": "414847006", … }` | `provider`: `vimeo`, `youtube` or `file` (then `id` is the video URL). |
| `documents` | `{ type, label, format, url }[]` | | `type`: `cad`, `drawing`, `catalog`, `datasheet`, `certificate`, `manual`, `other`. |
| `certifications` | string[] | `["RoHS", "UL"]` | Badges and the “Certifications” filter. |
| `specs` | `{ name, value, unit? }[]` | `{ "name": "Grip - Minimum", "value": "11.40", "unit": "mm" }` | All technical attributes. Numeric values with `mm` get an inch conversion automatically. |
| `price` | number \| null | `26.04` | Unit list price; `null` shows “Price on request”. |
| `currency` | string | `"USD"` | |
| `stock` | `{ status, quantity }` | `{ "status": "in_stock", "quantity": 5087 }` | `status`: `in_stock`, `low_stock`, `out_of_stock`. |
| `popularity` | number | `999` | Higher = more popular (“Most popular” sort). |
| `added` | number \| null | `2903` | Creation order or timestamp, higher = newer (“Newest” sort). |
| `featured` | boolean | | Featured parts come first in the default sort and on the home page. |
| `related` | string[] | `["E3-15-25", "E3-55-55"]` | SKUs for **Related products**. |
| `compatible` | `{ sku, group, note? }[]` | `{ "sku": "E3-5-15", "group": "Keys" }` | SKUs for **Compatible products**, grouped under `group`. `note` is an optional short remark shown on the card. |

## Category descriptions

```json
[{ "path": ["Latches", "Compression Latches"], "description": "Whether compressing gaskets …" }]
```

## Filters from specs

Filters are configured in `src/config/facets.ts` by spec `name` (e.g. `"Material"`, `"Head Style"`).
Any other spec with 2–40 distinct values automatically becomes an extra filter.
The **Application fit** inputs use the `Grip - Minimum` / `Grip - Maximum` and
`Min. Outer Panel Thickness` / `Max Outer Panel Thickness` spec pairs.

## What we need from the inRiver Excel export

One row per SKU is ideal, with columns for:

1. Part number, short name, full title, brand, family code and family name
2. Category path (or category levels in separate columns)
3. Long description and optional feature bullets
4. Image URLs (main + additional), video URLs, document URLs (CAD, drawing, catalog, data sheet, certificates)
5. Every technical attribute as its own column (column header = spec name, with unit if any, e.g. `Grip - Minimum (mm)`)
6. Price, currency, stock status or quantity
7. **Related products**: list of SKUs (comma separated)
8. **Compatible products**: list of SKUs, ideally with the relation type (e.g. `Keys`, `Cams`, `Gaskets`)

Related and compatible lists can also come as a separate sheet (`SKU`, `Related SKU`, `Relation type`).
A converter from the Excel file to `products.json` will be added once the export is available.
