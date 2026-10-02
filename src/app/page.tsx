import type { Metadata } from "next";
import { HomeView } from "@/components/home/home-view";
import { buildHomeData } from "@/lib/catalog-core";
import { getCatalog } from "@/lib/data";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <HomeView data={buildHomeData(getCatalog())} />;
}
