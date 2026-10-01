"use client";

import { cn } from "@/lib/utils";

/** Two overlaid native range inputs: keyboard accessible and touch friendly. */
export function RangeSlider({
  min,
  max,
  step,
  value,
  onChange,
  onCommit,
  className,
  labels = ["Minimum", "Maximum"],
}: {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  onCommit?: () => void;
  className?: string;
  labels?: [string, string];
}) {
  const [lo, hi] = value;
  const span = max - min || 1;
  const pct = (v: number) => ((v - min) / span) * 100;
  const loOnTop = lo > max - span * 0.05;

  return (
    <div className={cn("relative h-6", className)}>
      <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted" />
      <div
        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
        style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={lo}
        aria-label={labels[0]}
        onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])}
        onPointerUp={onCommit}
        onKeyUp={onCommit}
        className="range-input"
        style={{ zIndex: loOnTop ? 4 : 3 }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={hi}
        aria-label={labels[1]}
        onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])}
        onPointerUp={onCommit}
        onKeyUp={onCommit}
        className="range-input"
        style={{ zIndex: 3 }}
      />
    </div>
  );
}
