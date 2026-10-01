import type { FacetDef } from "@/lib/facets";

/**
 * Filters shown on listing pages, in display order.
 * - list:  checkbox options with live counts (from a product field or a spec)
 * - range: min/max slider (price or a numeric spec)
 * - fit:   "my value fits inside the part's min–max range" (grip, panel thickness)
 * A filter is hidden automatically when the current products don't need it
 * (fewer than two options). Any other low-cardinality spec becomes an extra
 * collapsed filter (see AUTO_FACETS), so new Excel columns appear without code changes.
 */
export const FACETS: FacetDef[] = [
  { id: "category", label: "Category", type: "list", field: "category" },
  { id: "family", label: "Product family", type: "list", field: "family" },
  {
    id: "grip",
    label: "Grip range",
    type: "fit",
    minSpec: "Grip - Minimum",
    maxSpec: "Grip - Maximum",
    unit: "mm",
    help: "Distance from the inside of the door to the frame. Shows parts whose grip range covers it.",
  },
  {
    id: "panel",
    label: "Panel thickness",
    type: "fit",
    minSpec: "Min. Outer Panel Thickness",
    maxSpec: "Max Outer Panel Thickness",
    unit: "mm",
    help: "Your door or panel thickness. Shows parts that accept it.",
  },
  { id: "price", label: "Price", type: "range", field: "price", format: "currency" },
  { id: "availability", label: "Availability", type: "list", field: "stock" },
  { id: "type", label: "Part type", type: "list", field: "kind" },
  { id: "accessory", label: "Accessory type", type: "list", spec: "Accessory Type" },
  { id: "material", label: "Material", type: "list", spec: "Material" },
  { id: "finish", label: "Finish", type: "list", spec: "Finish" },
  { id: "color", label: "Color / appearance", type: "list", spec: "Color/Appearance", multi: true },
  { id: "access", label: "Access restriction", type: "list", spec: "Access Restriction" },
  { id: "head", label: "Head style", type: "list", spec: "Head Style", collapsed: true },
  { id: "ip", label: "IP rating", type: "list", spec: "Ingress Protection (IP) Rating", multi: true },
  { id: "certification", label: "Certifications", type: "list", field: "certifications" },
  { id: "size", label: "Size series", type: "list", spec: "Size Series", collapsed: true },
  { id: "grip-type", label: "Grip type", type: "list", spec: "Grip Type", collapsed: true },
  { id: "mounting", label: "Mounting style", type: "list", spec: "Mounting Style", collapsed: true },
  { id: "installation", label: "Installation", type: "list", spec: "Installation", collapsed: true },
  { id: "series", label: "Series", type: "list", spec: "Series", multi: true, collapsed: true },
  { id: "rotation", label: "Rotation", type: "list", spec: "Rotation", collapsed: true },
  { id: "sealed", label: "Sealed", type: "list", spec: "Sealed", collapsed: true },
  { id: "fire", label: "Fire rating (EN 45545-3)", type: "list", spec: "Fire (EN45545-3) Rating", collapsed: true },
  { id: "compliance", label: "Compliance specification", type: "list", spec: "Compliance Specification", multi: true, collapsed: true },
  { id: "pullup", label: "Pull-up", type: "range", spec: "Pullup", unit: "mm", collapsed: true },
];

/** Extra filters generated from any remaining spec with 2–40 distinct values. */
export const AUTO_FACETS = { enabled: true, maxOptions: 40, minProducts: 2 };

/** Specs never turned into automatic filters (still shown in the spec table). */
export const HIDDEN_SPECS = ["Grip - Minimum (Cam Reversed)", "Grip - Maximum (Cam Reversed)"];

/** Short spec values shown as chips on product cards. */
export const HIGHLIGHT_SPECS = ["Material", "Finish", "Access Restriction", "Head Style", "Accessory Type"];

/** Specs shown in the "At a glance" block on product pages. */
export const KEY_SPECS = [
  "Accessory Type",
  "Material",
  "Finish",
  "Color/Appearance",
  "Access Restriction",
  "Head Style",
  "Ingress Protection (IP) Rating",
  "Installation",
  "Mounting Style",
  "Size Series",
];

/** Columns considered for the "Variants in this family" table, in priority order. */
export const VARIANT_SPECS = [
  "Head Style",
  "Access Restriction",
  "Accessory Type",
  "Material",
  "Finish",
  "Color/Appearance",
  "Size Series",
  "Series",
  "Grip Type",
];
