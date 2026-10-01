import type { Product } from "@/lib/types";
import { formatSpec } from "@/lib/format";
import { CopySpecsButton } from "./copy-specs-button";

interface Row {
  name: string;
  value: string;
  alt: string | null;
}

export function SpecTable({ product }: { product: Product }) {
  const rows: Row[] = [
    { name: "Part number", value: product.sku, alt: null },
    { name: "Brand", value: product.brand, alt: null },
    { name: "Product family", value: `${product.family.code} – ${product.family.name}`, alt: null },
    { name: "Category", value: product.category.join(" › "), alt: null },
    ...product.specs.map((spec) => {
      const formatted = formatSpec(spec);
      return { name: spec.name, value: formatted.value, alt: formatted.alt };
    }),
  ];
  if (product.certifications.length) rows.push({ name: "Certifications", value: product.certifications.join(", "), alt: null });

  const half = Math.ceil(rows.length / 2);
  const columns = [rows.slice(0, half), rows.slice(half)];
  const text = rows.map((r) => `${r.name}\t${r.value}`).join("\n");

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <CopySpecsButton text={text} />
      </div>
      <div className="grid gap-x-12 lg:grid-cols-2">
        {columns.map((column, ci) => (
          <dl key={ci} className={ci === 1 ? "border-b lg:border-t" : "border-t lg:border-b"}>
            {column.map((row, ri) => (
              <div key={`${ri}-${row.name}`} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-4 border-t py-3 text-sm first:border-t-0">
                <dt className="text-muted-foreground">{row.name}</dt>
                <dd className="font-medium text-foreground">
                  {row.value}
                  {row.alt && <span className="ml-2 text-xs font-normal tabular-nums text-muted-foreground">({row.alt})</span>}
                </dd>
              </div>
            ))}
          </dl>
        ))}
      </div>
    </div>
  );
}
