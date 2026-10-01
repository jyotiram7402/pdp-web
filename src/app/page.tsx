import { HomeView } from "@/components/home/home-view";
import { buildHomeData } from "@/lib/catalog-core";
import { getCatalog } from "@/lib/data";

export default function HomePage() {
  return <HomeView data={buildHomeData(getCatalog())} />;
}
