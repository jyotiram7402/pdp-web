"use client";

import { memo, useEffect, useState, type ReactNode } from "react";
import type { FacetMeta } from "@/lib/facets";
import { optionLabel } from "@/lib/facets";
import type { FilterResult, FilterState, RangeStat } from "@/lib/filter";
import { formatNumber, formatPrice } from "@/lib/format";
import { clamp, cn } from "@/lib/utils";
import { CheckIcon, ChevronDownIcon, RulerIcon, SearchIcon, XIcon } from "../ui/icons";
import { RangeSlider } from "../ui/range-slider";

export interface FacetActions {
  toggle: (facetId: string, value: string) => void;
  setRange: (facetId: string, range: [number | null, number | null] | null) => void;
  setFit: (facetId: string, value: number | null) => void;
}

/** Stable empty selection so memoized sections don't re-render needlessly. */
const NONE: string[] = [];

export function FacetPanel({
  facets,
  state,
  result,
  actions,
}: {
  facets: FacetMeta[];
  state: FilterState;
  result: FilterResult;
  actions: FacetActions;
}) {
  const fits = facets.filter((f) => f.type === "fit");
  return (
    <div>
      {fits.length > 0 && (
        <div className="mb-2 rounded-2xl border bg-subtle p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <RulerIcon size={16} className="text-primary" /> Application fit
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Enter your dimensions to show only parts that fit.</p>
          <div className="mt-4 space-y-4">
            {fits.map((facet) => (
              <FitField key={facet.id} facet={facet} value={state.fit[facet.id] ?? null} actions={actions} />
            ))}
          </div>
        </div>
      )}
      {facets.map((facet, fi) => {
        if (facet.type === "list") {
          return (
            <ListFacet
              key={facet.id}
              facet={facet}
              counts={result.counts[fi] ?? NONE_COUNTS}
              selected={state.list[facet.id] ?? NONE}
              actions={actions}
            />
          );
        }
        if (facet.type === "range") {
          return <RangeFacet key={facet.id} facet={facet} stat={result.stats[fi] ?? null} value={state.range[facet.id] ?? null} actions={actions} />;
        }
        return null;
      })}
    </div>
  );
}

const NONE_COUNTS: number[] = [];

function FacetSection({
  title,
  badge,
  defaultOpen,
  children,
}: {
  title: string;
  badge?: number;
  defaultOpen: boolean;
  children: ReactNode;
}) {
  const [initialOpen] = useState(defaultOpen);
  return (
    <details open={initialOpen} className="group border-b last:border-b-0">
      <summary className="flex list-none items-center justify-between gap-2 py-3.5 text-sm font-semibold text-foreground">
        <span className="flex items-center gap-2">
          {title}
          {!!badge && (
            <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">{badge}</span>
          )}
        </span>
        <ChevronDownIcon size={16} className="text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="pb-4">{children}</div>
    </details>
  );
}

const LIST_LIMIT = 6;

const ListFacet = memo(function ListFacet({
  facet,
  counts,
  selected,
  actions,
}: {
  facet: FacetMeta;
  counts: number[];
  selected: string[];
  actions: FacetActions;
}) {
  const onToggle = (value: string) => actions.toggle(facet.id, value);
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState("");

  const options = facet.options
    .map((value, i) => ({ value, label: optionLabel(facet, i), count: counts[i] ?? 0, checked: selected.includes(value) }))
    .sort((a, b) => Number(b.count > 0 || b.checked) - Number(a.count > 0 || a.checked));
  const needle = filter.trim().toLowerCase();
  const filtered = needle ? options.filter((o) => o.label.toLowerCase().includes(needle)) : options;
  const shown = expanded || needle ? filtered : filtered.slice(0, LIST_LIMIT);

  return (
    <FacetSection title={facet.label} badge={selected.length} defaultOpen={!facet.collapsed || selected.length > 0}>
      {options.length > 8 && (
        <div className="relative mb-2">
          <SearchIcon size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={`Find ${facet.label.toLowerCase()}`}
            aria-label={`Find ${facet.label}`}
            className="h-8 w-full rounded-lg border bg-background pl-8 pr-2 text-[13px] outline-none placeholder:text-muted-foreground focus:border-ring"
          />
        </div>
      )}
      <ul className="space-y-px">
        {shown.map((o) => {
          const disabled = o.count === 0 && !o.checked;
          return (
            <li key={o.value}>
              <label
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-1.5 py-[7px] text-[13px] transition-colors",
                  disabled ? "cursor-default opacity-40" : "cursor-pointer hover:bg-muted",
                )}
              >
                <input
                  type="checkbox"
                  checked={o.checked}
                  disabled={disabled}
                  onChange={() => onToggle(o.value)}
                  aria-label={`${facet.label}: ${o.label} (${o.count})`}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded-[5px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1",
                    o.checked ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background",
                  )}
                >
                  {o.checked && <CheckIcon size={11} strokeWidth={3.2} />}
                </span>
                <span className={cn("flex-1 leading-snug", o.checked ? "font-medium text-foreground" : "text-foreground/90")}>{o.label}</span>
                <span className="text-xs tabular-nums text-muted-foreground">{o.count}</span>
              </label>
            </li>
          );
        })}
        {needle && !filtered.length && <li className="px-1.5 py-2 text-[13px] text-muted-foreground">No matches</li>}
      </ul>
      {!needle && filtered.length > LIST_LIMIT && (
        <button type="button" onClick={() => setExpanded((e) => !e)} className="mt-1.5 px-1.5 text-[13px] font-medium text-primary hover:underline">
          {expanded ? "Show less" : `Show all ${filtered.length}`}
        </button>
      )}
    </FacetSection>
  );
});

function formatValue(facet: FacetMeta, n: number): string {
  if (facet.format === "currency") return formatPrice(n).replace(/\.00$/, "");
  return `${formatNumber(n)}${facet.unit ? ` ${facet.unit}` : ""}`;
}

export function formatRangeLabel(facet: FacetMeta, range: [number | null, number | null]): string {
  const [lo, hi] = range;
  if (lo != null && hi != null) return `${formatValue(facet, lo)} – ${formatValue(facet, hi)}`;
  if (lo != null) return `from ${formatValue(facet, lo)}`;
  return `up to ${formatValue(facet, hi ?? facet.max)}`;
}

const RangeFacet = memo(function RangeFacet({
  facet,
  stat,
  value,
  actions,
}: {
  facet: FacetMeta;
  stat: RangeStat | null;
  value: [number | null, number | null] | null;
  actions: FacetActions;
}) {
  const onChange = (range: [number | null, number | null] | null) => actions.setRange(facet.id, range);
  const { min, max } = facet;
  const span = max - min;
  const step = facet.format === "currency" ? (span > 200 ? 5 : 1) : span > 50 ? 1 : 0.1;
  const lo = value?.[0] ?? min;
  const hi = value?.[1] ?? max;
  const [draft, setDraft] = useState<[number, number]>([lo, hi]);
  useEffect(() => setDraft([lo, hi]), [lo, hi]);

  const commit = (next: [number, number]) => {
    const a = clamp(Math.min(next[0], next[1]), min, max);
    const b = clamp(Math.max(next[0], next[1]), min, max);
    const range: [number | null, number | null] = [a <= min ? null : a, b >= max ? null : b];
    onChange(range[0] == null && range[1] == null ? null : range);
  };

  const hist = stat?.hist ?? [];
  const peak = Math.max(1, ...hist);
  const binWidth = hist.length ? span / hist.length : span;
  const active = value != null;

  return (
    <FacetSection title={facet.label} badge={active ? 1 : 0} defaultOpen={!facet.collapsed || active}>
      <div className="px-1">
        {hist.length > 0 && (
          <div className="flex h-12 items-end gap-[2px]" aria-hidden="true">
            {hist.map((count, i) => {
              const start = min + i * binWidth;
              const inside = start + binWidth >= draft[0] && start <= draft[1];
              return (
                <div
                  key={i}
                  className={cn("flex-1 rounded-t-[3px] transition-colors", inside ? "bg-primary/40" : "bg-muted")}
                  style={{ height: count ? `${Math.max(10, (count / peak) * 100)}%` : "4%" }}
                />
              );
            })}
          </div>
        )}
        <RangeSlider
          min={min}
          max={max}
          step={step}
          value={draft}
          onChange={setDraft}
          onCommit={() => commit(draft)}
          className={hist.length ? "-mt-3" : ""}
          labels={[`Minimum ${facet.label.toLowerCase()}`, `Maximum ${facet.label.toLowerCase()}`]}
        />
        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <NumberBox label="Min" value={draft[0]} prefix={facet.format === "currency" ? "$" : undefined} onCommit={(n) => commit([n, draft[1]])} />
          <span className="text-muted-foreground">–</span>
          <NumberBox label="Max" value={draft[1]} prefix={facet.format === "currency" ? "$" : undefined} onCommit={(n) => commit([draft[0], n])} />
        </div>
      </div>
    </FacetSection>
  );
});

function NumberBox({ label, value, prefix, onCommit }: { label: string; value: number; prefix?: string; onCommit: (n: number) => void }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(Math.round(value * 100) / 100)), [value]);
  const commit = () => {
    const n = Number(text.replace(",", "."));
    if (Number.isFinite(n)) onCommit(n);
    else setText(String(value));
  };
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      {prefix && <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{prefix}</span>}
      <input
        inputMode="decimal"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
        }}
        className={cn("h-9 w-full rounded-lg border bg-background pr-2 text-[13px] tabular-nums outline-none focus:border-ring", prefix ? "pl-6" : "pl-2.5")}
      />
    </label>
  );
}

const FitField = memo(function FitField({ facet, value, actions }: { facet: FacetMeta; value: number | null; actions: FacetActions }) {
  const onChange = (next: number | null) => actions.setFit(facet.id, next);
  const [unit, setUnit] = useState<"mm" | "in">("mm");
  const toDisplay = (mm: number) => (unit === "in" ? String(Math.round((mm / 25.4) * 1000) / 1000) : String(Math.round(mm * 100) / 100));
  const [text, setText] = useState(value == null ? "" : toDisplay(value));
  useEffect(() => setText(value == null ? "" : toDisplay(value)), [value, unit]);

  const commit = () => {
    const raw = text.trim().replace(",", ".");
    if (!raw) {
      if (value != null) onChange(null);
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) {
      setText(value == null ? "" : toDisplay(value));
      return;
    }
    const mm = Math.round((unit === "in" ? n * 25.4 : n) * 100) / 100;
    if (mm !== value) onChange(mm);
  };

  const lo = unit === "in" ? facet.min / 25.4 : facet.min;
  const hi = unit === "in" ? facet.max / 25.4 : facet.max;
  const digits = unit === "in" ? 2 : 1;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={`fit-${facet.id}`} className="text-[13px] font-medium text-foreground">
          {facet.label}
        </label>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {formatNumber(lo, digits)}–{formatNumber(hi, digits)} {unit}
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        <div className="relative flex-1">
          <input
            id={`fit-${facet.id}`}
            inputMode="decimal"
            value={text}
            placeholder={unit === "in" ? "e.g. 0.75" : "e.g. 18"}
            onChange={(e) => setText(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
            }}
            className="h-9 w-full rounded-lg border bg-background pl-3 pr-14 text-sm tabular-nums outline-none placeholder:text-muted-foreground/70 focus:border-ring"
          />
          {value != null ? (
            <button
              type="button"
              aria-label={`Clear ${facet.label}`}
              onClick={() => onChange(null)}
              className="absolute right-1.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <XIcon size={13} />
            </button>
          ) : (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{unit}</span>
          )}
        </div>
        <div className="flex rounded-lg border bg-background p-0.5" role="group" aria-label={`${facet.label} unit`}>
          {(["mm", "in"] as const).map((u) => (
            <button
              key={u}
              type="button"
              aria-pressed={unit === u}
              onClick={() => setUnit(u)}
              className={cn(
                "h-7 rounded-md px-2 text-xs font-medium transition-colors",
                unit === u ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {u}
            </button>
          ))}
        </div>
      </div>
      {facet.help && <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{facet.help}</p>}
    </div>
  );
});
