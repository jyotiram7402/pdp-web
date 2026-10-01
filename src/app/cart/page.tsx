import type { Metadata } from "next";
import { PageHeader } from "@/components/catalog/catalog-page-view";
import { CartView } from "@/components/commerce/cart-view";
import { Container } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <Container className="py-10">
      <PageHeader title="Cart" description="Review quantities, export the list, or turn it into a formal quote request." />
      <CartView />
    </Container>
  );
}
