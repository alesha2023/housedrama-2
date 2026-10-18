import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DramaGrid, EmptyState, PageIntro, PageSkeleton } from "@/components/drama/cards";
import { SeoItemList } from "@/components/drama/seo-item-list";
import { getHomeData } from "@/lib/drama/api";
import { usePrefs } from "@/lib/drama/i18n";
import type { DramaCard } from "@/lib/drama/types";

export const Route = createFileRoute("/trending")({
  loader: () => getHomeData({ data: { lang: "en" } }),
  pendingComponent: PageSkeleton,
  head: () => ({
    meta: [
      { title: "Popular & Trending Chinese Short Dramas — HouseDrama" },
      { name: "description", content: "Discover popular Chinese short dramas on HouseDrama, including romance, CEO stories, revenge, and fantasy." },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:title", content: "Popular & Trending Chinese Short Dramas — HouseDrama" },
      { property: "og:description", content: "Explore popular Chinese short dramas on HouseDrama." },
      { property: "og:url", content: "https://house-drama.web.id/trending" },
    ],
    links: [{ rel: "canonical", href: "https://house-drama.web.id/trending" }],
  }),
  component: TrendingPage,
});

function TrendingPage() {
  const data = Route.useLoaderData();
  const { t } = usePrefs();
  const [watchedItems, setWatchedItems] = useState<DramaCard[]>([]);
  useEffect(() => {
    let active = true;
    fetch("/api/drama-trending", { headers: { accept: "application/json" } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Trending unavailable")))
      .then((payload: { items?: DramaCard[] }) => { if (active && Array.isArray(payload.items)) setWatchedItems(payload.items); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);
  const items = watchedItems.length
    ? watchedItems
    : data.sections.find((section) => section.id === "trending")?.items ?? [];
  return (
    <div>
      <PageIntro eyebrow={watchedItems.length ? "Trending on HouseDrama" : t.rankEyebrow} title={watchedItems.length ? "Paling Banyak Ditonton di HouseDrama" : t.trendTitle} description={watchedItems.length ? "Drama yang paling sering mulai ditonton pengunjung HouseDrama." : t.trendBody} />
      <SeoItemList items={items} name={watchedItems.length ? "Drama Paling Banyak Ditonton di HouseDrama" : "Drama China Pendek Populer dan Trending"} />
      {items.length ? <DramaGrid items={items} /> : <EmptyState title={t.noRank} body={t.noRankBody} />}
    </div>
  );
}
