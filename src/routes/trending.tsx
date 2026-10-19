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
      { title: "Trending Chinese Short Dramas to Watch Online — HouseDrama" },
      { name: "description", content: "Watch popular Chinese short dramas online. Explore trending romance, CEO, revenge, and fantasy stories on HouseDrama." },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:title", content: "Trending Chinese Short Dramas to Watch Online — HouseDrama" },
      { property: "og:description", content: "Explore trending Chinese and Asian short dramas, popular stories, and new favorites on HouseDrama." },
      { property: "og:url", content: "https://house-drama.web.id/trending" },
    ],
    links: [{ rel: "canonical", href: "https://house-drama.web.id/trending" }],
  }),
  component: TrendingPage,
});

function TrendingPage() {
  const data = Route.useLoaderData();
  const { t, uiLang } = usePrefs();
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
      <PageIntro
        eyebrow={watchedItems.length ? ({ en: "Trending on HouseDrama", id: "Trending di HouseDrama", hi: "HouseDrama पर ट्रेंडिंग", fil: "Trending sa HouseDrama", ms: "Trending di HouseDrama", th: "กำลังมาแรงบน HouseDrama" }[uiLang]) : t.rankEyebrow}
        title={watchedItems.length ? ({ en: "Most Watched on HouseDrama", id: "Paling Banyak Ditonton di HouseDrama", hi: "HouseDrama पर सबसे ज़्यादा देखे गए", fil: "Pinakamaraming Pinanood sa HouseDrama", ms: "Paling Banyak Ditonton di HouseDrama", th: "รับชมมากที่สุดบน HouseDrama" }[uiLang]) : t.trendTitle}
        description={watchedItems.length ? ({ en: "Dramas visitors have started watching most often on HouseDrama.", id: "Drama yang paling sering mulai ditonton pengunjung HouseDrama.", hi: "वे ड्रामा जिन्हें HouseDrama के दर्शकों ने सबसे ज़्यादा देखना शुरू किया।", fil: "Mga dramang pinakamadalas simulan ng mga bisita sa HouseDrama.", ms: "Drama yang paling kerap mula ditonton oleh pengunjung HouseDrama.", th: "ละครที่ผู้เข้าชม HouseDrama เริ่มรับชมบ่อยที่สุด" }[uiLang]) : t.trendBody}
      />
      <SeoItemList items={items} name="Trending Chinese Short Dramas on HouseDrama" />
      {items.length ? <DramaGrid items={items} /> : <EmptyState title={t.noRank} body={t.noRankBody} />}
    </div>
  );
}
