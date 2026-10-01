"use client";

import type { FacetMeta } from "@/lib/facets";
import { optionLabel } from "@/lib/facets";
import type { FilterState } from "@/lib/filter";
import { formatNumber } from "@/lib/format";
import { XIcon } from "../ui/icons";
import type { FacetActions } from "./facet-panel";
import { formatRangeLabel } from "./facet-panel";

export function ActiveFilters({
  facets,
  state,
  actions,
  onQuery,
  onClear,
}: {
  facets: FacetMeta[];
  state: FilterState;
  actions: FacetActions;
  onQuery: (q: string) => void;
  onClear: () => void;
}) {
  const chips: Array<{ key: string; label: string; remove: () => void }> = [];
  if (state.q.trim()) chips.push({ key: "q", label: `“${state.q.trim()}”`, remove: () => onQuery("") });
  for (const facet of facets) {
    if (facet.type === "list") {
      for (const value of state.list[facet.id] ?? []) {
        chips.push({
          key: `${facet.id}:${value}`,
          label: `${facet.label}: ${optionLabel(facet, facet.options.indexOf(value))}`,
          remove: () => actions.toggle(facet.id, value),
        });
      }
    } else if (facet.type === "range") {
      const range = state.range[facet.id];
      if (range && (range[0] != null || range[1] != null)) {
        chips.push({ key: facet.id, label: `${facet.label}: ${formatRangeLabel(facet, range)}`, remove: () => actions.setRange(facet.id, null) });
      }
    } else {
      const value = state.fit[facet.id];
      if (value != null) {
        chips.push({
          key: facet.id,
          label: `${facet.label} fits ${formatNumber(value)} ${facet.unit ?? ""}`.trim(),
          remove: () => actions.setFit(facet.id, null),
        });
      }
    }
  }
  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.remove}
          className="group inline-flex h-8 max-w-full items-center gap-1.5 rounded-full border bg-background pl-3 pr-2 text-[13px] text-foreground transition-colors hover:border-foreground/30"
        >
          <span className="truncate">{chip.label}</span>
          <XIcon size={14} className="shrink-0 text-muted-foreground group-hover:text-foreground" />
          <span className="sr-only">Remove filter</span>
        </button>
      ))}
      <button type="button" onClick={onClear} className="px-1 text-[13px] font-medium text-primary hover:underline">
        Clear all
      </button>
    </div>
  );
}
