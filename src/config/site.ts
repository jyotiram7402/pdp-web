const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

/**
 * Brand and business settings. The design is brand-neutral: change the name,
 * tagline and contact details here, and the colors in src/app/globals.css.
 */
export const siteConfig = {
  name: "ExpertPDP",
  tagline: "Precision access hardware",
  description:
    "Specify, compare and source engineered latches and access hardware — complete specifications, CAD models and compatible accessories for every part.",
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (vercelProductionUrl ? `https://${vercelProductionUrl}` : "http://localhost:3000")
  ).replace(/\/$/, ""),
  locale: "en-US",
  currency: "USD",
  announcement: "CAD models, technical drawings and compliance documents for every part",
  contact: {
    email: "sales@example.com",
    phone: "+1 (555) 010-2000",
    hours: "Mon–Fri · 8:00–18:00",
  },
  quote: {
    email: process.env.NEXT_PUBLIC_QUOTE_EMAIL || "sales@example.com",
    endpoint: process.env.NEXT_PUBLIC_QUOTE_ENDPOINT || "",
  },
  checkoutUrl: process.env.NEXT_PUBLIC_CHECKOUT_URL || "",
  popularSearches: ["E3", "Lever latch", "Stainless steel", "IP 66", "Key locking", "Cam"],
} as const;
