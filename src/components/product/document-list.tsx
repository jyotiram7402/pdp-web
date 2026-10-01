import type { ReactNode } from "react";
import type { DocumentType, ProductDocument } from "@/lib/types";
import { BadgeCheckIcon, BookIcon, ChartIcon, CubeIcon, ExternalLinkIcon, FileDownIcon, FileTextIcon } from "../ui/icons";

const ICONS: Record<DocumentType, ReactNode> = {
  cad: <CubeIcon size={20} />,
  drawing: <FileDownIcon size={20} />,
  catalog: <BookIcon size={20} />,
  datasheet: <ChartIcon size={20} />,
  certificate: <BadgeCheckIcon size={20} />,
  manual: <FileTextIcon size={20} />,
  other: <FileTextIcon size={20} />,
};

const DESCRIPTIONS: Partial<Record<DocumentType, string>> = {
  cad: "2D & 3D models in all major formats",
  drawing: "Dimensioned technical drawing",
  catalog: "Full family catalog page",
  datasheet: "Test and performance results",
  certificate: "Compliance declaration for this part",
};

const GROUPS: Array<{ title: string; types: DocumentType[] }> = [
  { title: "CAD & drawings", types: ["cad", "drawing"] },
  { title: "Literature & data", types: ["catalog", "datasheet", "manual", "other"] },
  { title: "Compliance", types: ["certificate"] },
];

export function DocumentList({ documents }: { documents: ProductDocument[] }) {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {GROUPS.map((group) => {
        const docs = documents.filter((d) => group.types.includes(d.type));
        if (!docs.length) return null;
        return (
          <div key={group.title} className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
            <ul className="mt-3 space-y-2">
              {docs.map((doc) => (
                <li key={doc.url}>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3.5 rounded-2xl border bg-card p-3.5 transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-[0_14px_30px_-24px_rgb(15_23_42/0.45)]"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">{ICONS[doc.type]}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">{doc.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">{DESCRIPTIONS[doc.type] ?? "Open document"}</span>
                    </span>
                    <span className="rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{doc.format}</span>
                    <ExternalLinkIcon size={16} className="shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
