import type { CardProduct } from "./types";
import { cart, compare, quote, toast, ui } from "./store";

/** User-facing actions with feedback toasts. Call from client components only. */

export function addToCart(product: CardProduct, qty = 1) {
  cart.add(product, qty);
  toast({
    title: "Added to cart",
    description: `${qty} × ${product.sku}`,
    image: product.image,
    action: { label: "View cart", onClick: ui.openCart },
  });
}

export function addManyToCart(products: CardProduct[]) {
  if (!products.length) return;
  cart.addMany(products);
  toast({
    title: `${products.length} ${products.length === 1 ? "item" : "items"} added to cart`,
    description: products.map((p) => p.sku).join(", "),
    action: { label: "View cart", onClick: ui.openCart },
  });
}

export function addToQuote(product: CardProduct, qty = 1) {
  quote.add(product, qty);
  toast({
    title: "Added to quote list",
    description: `${qty} × ${product.sku}`,
    image: product.image,
    action: { label: "View list", href: "/quote" },
  });
}

export function addManyToQuote(products: CardProduct[]) {
  if (!products.length) return;
  quote.addMany(products);
  toast({
    title: `${products.length} ${products.length === 1 ? "item" : "items"} added to quote list`,
    description: products.map((p) => p.sku).join(", "),
    action: { label: "View list", href: "/quote" },
  });
}

export function toggleCompare(product: CardProduct) {
  const result = compare.toggle(product);
  if (result === "full") {
    toast({ title: "Compare holds up to 4 products", description: "Remove one to add another.", action: { label: "Compare now", href: "/compare" } });
  } else if (result === "added") {
    toast({ title: "Added to compare", description: product.sku, image: product.image, action: { label: "Compare", href: "/compare" } });
  }
}
