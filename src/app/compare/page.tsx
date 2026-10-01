import type { Metadata } from "next";
import { PageHeader } from "@/components/catalog/catalog-page-view";
import { CompareView } from "@/components/commerce/compare-view";
import { Container } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Compare products",
  robots: { index: false, follow: true },
};

export default function ComparePage() {
  return (
    <Container className="py-10">
      <PageHeader title="Compare products" description="Up to four parts side by side. Rows that differ are highlighted." />
      <CompareView />
    </Container>
  );
}
