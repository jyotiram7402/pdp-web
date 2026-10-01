import Link from "next/link";
import type { VariantTable as VariantTableData } from "@/lib/catalog-core";
import { formatPrice } from "@/lib/format";
import { productHref } from "@/lib/product";
import { cn } from "@/lib/utils";
import { StockDot } from "../ui/primitives";

export function VariantTable({ table }: { table: VariantTableData }) {
  return (
    <div className="overflow-hidden rounded-2xl border">
      <div className="max-h-[560px] overflow-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-subtle text-xs font-medium text-muted-foreground">
            <tr>
              <th scope="col" className="border-b px-4 py-3 font-medium">
                Part number
              </th>
              {table.columns.map((c) => (
                <th key={c} scope="col" className="border-b px-4 py-3 font-medium">
                  {c}
                </th>
              ))}
              {table.showGrip && (
                <th scope="col" className="border-b px-4 py-3 font-medium">
                  Grip range
                </th>
              )}
              <th scope="col" className="border-b px-4 py-3 text-right font-medium">
                Price
              </th>
              <th scope="col" className="border-b px-4 py-3 font-medium">
                Availability
              </th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row.sku} className={cn("border-b last:border-b-0", row.current ? "bg-primary-soft/60" : "hover:bg-muted/60")}>
                <td className="whitespace-nowrap px-4 py-3">
                  {row.current ? (
                    <span className="flex items-center gap-2 font-mono font-semibold text-foreground">
                      {row.sku}
                      <span className="rounded-full bg-primary px-1.5 py-0.5 font-sans text-[10px] font-semibold text-primary-foreground">Viewing</span>
                    </span>
                  ) : (
                    <Link href={productHref(row.slug)} className="font-mono font-semibold text-primary hover:underline">
                      {row.sku}
                    </Link>
                  )}
                </td>
                {row.values.map((v, i) => (
                  <td key={table.columns[i]} className="px-4 py-3 text-foreground/85">
                    {v}
                  </td>
                ))}
                {table.showGrip && <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground/85">{row.grip ?? "—"}</td>}
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-foreground">{formatPrice(row.price)}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StockDot status={row.stock} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
