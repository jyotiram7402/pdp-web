import type { ProductSpec, StockStatus } from "./types";

const LOCALE = "en-US";
const currencyFormats = new Map<string, Intl.NumberFormat>();

export function formatPrice(value: number | null | undefined, currency = "USD"): string {
  if (value == null || !Number.isFinite(value)) return "Price on request";
  let format = currencyFormats.get(currency);
  if (!format) {
    format = new Intl.NumberFormat(LOCALE, { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    currencyFormats.set(currency, format);
  }
  return format.format(value);
}

export function formatNumber(value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits }).format(value);
}

/** Parses plain decimal strings ("11.40", "-2", "0.00"); anything else returns null. */
export function toNumber(value: string | null | undefined): number | null {
  if (value == null) return null;
  const text = value.trim();
  if (!/^-?\d+(\.\d+)?$/.test(text)) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

export function formatSpec(spec: ProductSpec): { value: string; alt: string | null } {
  const n = toNumber(spec.value);
  if (n != null && spec.unit === "mm") return { value: `${formatNumber(n)} mm`, alt: `${formatNumber(n / 25.4, 3)} in` };
  if (n != null && spec.unit) return { value: `${formatNumber(n)} ${spec.unit}`, alt: null };
  return { value: spec.unit ? `${spec.value} ${spec.unit}` : spec.value, alt: null };
}

export function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${formatNumber(count, 0)} ${count === 1 ? one : many}`;
}

export const STOCK_LABEL: Record<StockStatus, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
};
