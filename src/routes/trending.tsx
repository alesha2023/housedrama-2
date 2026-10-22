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
      { property: "og:url", content: "https://house-drama.xyz/trending" },
    ],
    links: [{ rel: "canonical", href: "https://house-drama.xyz/trending" }],
  }),
  component: TrendingPage,
});


function getCatalogTrendingFallback(payload: import("@/lib/drama/types").HomePayload) {
  const seen = new Set<string>();
  const items: import("@/lib/drama/types").DramaCard[] = [];
  for (const item of [...payload.hero, ...payload.sections.flatMap((section) => section.items)]) {
    const key = `${item.provider}:${item.seriesId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(item);
    if (items.length >= 12) break;
  }
  return items;
}

function TrendingPage() {
  const catalog = Route.useLoaderData();
  const { uiLang } = usePrefs();
  const [watchedItems, setWatchedItems] = useState<DramaCard[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    // Never leave the page spinning forever if the database/API stalls.
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    fetch("/api/drama-trending", {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("HouseDrama trending unavailable");
        return response.json();
      })
      .then((payload: { items?: DramaCard[] }) => {
        if (active) setWatchedItems(Array.isArray(payload.items) ? payload.items : []);
      })
      .catch(() => { if (active) setWatchedItems([]); })
      .finally(() => {
        clearTimeout(timeoutId);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const recordedViewsAvailable = watchedItems.length > 0;
  const displayItems = recordedViewsAvailable ? watchedItems : getCatalogTrendingFallback(catalog);
  const eyebrow = recordedViewsAvailable
    ? ({ en: "Trending on HouseDrama", id: "Trending di HouseDrama", hi: "HouseDrama पर ट्रेंडिंग", fil: "Trending sa HouseDrama", ms: "Trending di HouseDrama", th: "กำลังมาแรงบน HouseDrama" } as const)[uiLang]
    : ({ en: "Discover on HouseDrama", id: "Jelajahi HouseDrama", hi: "HouseDrama पर खोजें", fil: "Tuklasin sa HouseDrama", ms: "Terokai HouseDrama", th: "ค้นหาบน HouseDrama" } as const)[uiLang];
  const title = recordedViewsAvailable
    ? ({ en: "Most Watched on HouseDrama", id: "Paling Banyak Ditonton di HouseDrama", hi: "HouseDrama पर सबसे ज़्यादा देखे गए", fil: "Pinakamaraming Pinanood sa HouseDrama", ms: "Paling Banyak Ditonton di HouseDrama", th: "รับชมมากที่สุดบน HouseDrama" } as const)[uiLang]
    : ({ en: "Popular Dramas to Explore", id: "Drama Populer untuk Dijelajahi", hi: "देखने के लिए लोकप्रिय ड्रामा", fil: "Mga Sikat na Drama na Tuklasin", ms: "Drama Popular untuk Diterokai", th: "ซีรีส์ยอดนิยมให้ค้นหา" } as const)[uiLang];
  const description = recordedViewsAvailable
    ? ({ en: "Ranked by views recorded on HouseDrama, not by provider rankings.", id: "Diurutkan berdasarkan jumlah tontonan yang tercatat di HouseDrama, bukan peringkat penyedia.", hi: "HouseDrama पर दर्ज व्यू के आधार पर, प्रदाता की रैंकिंग से नहीं।", fil: "Batay sa mga panonood na naitala sa HouseDrama, hindi sa ranking ng provider.", ms: "Disusun mengikut tontonan yang direkodkan di HouseDrama, bukan ranking penyedia.", th: "จัดอันดับตามยอดรับชมที่บันทึกบน HouseDrama ไม่ใช่อันดับจากผู้ให้บริการ" } as const)[uiLang]
    : (uiLang === "id" ? "Data tontonan sedang dipulihkan. Sementara itu, jelajahi pilihan drama dari katalog HouseDrama." : "Recorded view counts are temporarily unavailable. Explore dramas from the HouseDrama catalog in the meantime.");

  return (
    <div>
      <PageIntro eyebrow={eyebrow} title={title} description={description} />
      <SeoItemList items={displayItems} name={recordedViewsAvailable ? "Most Watched on HouseDrama" : "Popular Dramas on HouseDrama"} />
      {loading ? (
        <PageSkeleton />
      ) : displayItems.length ? (
        <DramaGrid items={displayItems} />
      ) : (
        <EmptyState
          title={uiLang === "id" ? "Drama belum tersedia" : "No dramas available"}
          body={uiLang === "id" ? "Coba kembali sebentar lagi." : "Please check back shortly."}
        />
      )}
    </div>
  );
}
