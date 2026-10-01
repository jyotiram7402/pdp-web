import type { Metadata } from "next";
import { PageHeader } from "@/components/catalog/catalog-page-view";
import { QuoteView } from "@/components/commerce/quote-view";
import { Container } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Request a quote",
  description: "Send a list of parts and quantities for pricing, availability and lead times.",
  robots: { index: false, follow: true },
};

export default function QuotePage() {
  return (
    <Container className="py-10">
      <PageHeader
        title="Request a quote"
        description="Adjust quantities, add your application details and send the list — you’ll get pricing, availability and lead times."
      />
      <QuoteView />
    </Container>
  );
}
