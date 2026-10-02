import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface PageMetadata {
  title: string;
  description: string;
  /** Site-relative path; used for the canonical URL and og:url. */
  path: string;
  /** Open Graph title, when it should differ from the page title. */
  ogTitle?: string;
  images?: Array<{ url: string; alt?: string }>;
}

/**
 * Title, description, canonical URL and matching Open Graph tags for a page.
 * A page's `openGraph` replaces the layout's entirely, so the shared fields are repeated here.
 */
export function pageMetadata({ title, description, path, ogTitle, images }: PageMetadata): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: ogTitle ?? title,
      description,
      url: path,
      ...(images?.length ? { images } : {}),
    },
  };
}
