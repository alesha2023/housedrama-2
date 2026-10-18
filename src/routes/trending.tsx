import { createFileRoute } from "@tanstack/react-router";
import { DramaGrid, EmptyState, PageIntro, PageSkeleton } from "@/components/drama/cards";
import { SeoItemList } from "@/components/drama/seo-item-list";
import { getHomeData } from "@/lib/drama/api";
import { usePrefs } from "@/lib/drama/i18n";

export const Route = createFileRoute("/trending")({
  loader: () => getHomeData({ data: { lang: "id" } }),
  pendingComponent: PageSkeleton,
  head: () => ({
    meta: [
      { title: "Drama China Pendek Populer & Trending — HouseDrama" },
      { name: "description", content: "Temukan drama China pendek yang sedang populer dan trending di HouseDrama. Jelajahi kisah romantis, CEO, balas dendam, dan drama subtitle Indonesia." },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:title", content: "Drama China Pendek Populer & Trending — HouseDrama" },
      { property: "og:description", content: "Jelajahi drama China pendek yang sedang populer di HouseDrama." },
      { property: "og:url", content: "https://house-drama.web.id/trending" },
    ],
    links: [{ rel: "canonical", href: "https://house-drama.web.id/trending" }],
  }),
  component: TrendingPage,
});

function TrendingPage() {
  const data = Route.useLoaderData();
  const { t } = usePrefs();
  const items = data.sections.find((section) => section.id === "trending")?.items ?? [];
  return (
    <div>
      <PageIntro eyebrow={t.rankEyebrow} title={t.trendTitle} description={t.trendBody} />
      <SeoItemList items={items} name="Drama China Pendek Populer dan Trending" />
      {items.length ? <DramaGrid items={items} /> : <EmptyState title={t.noRank} body={t.noRankBody} />}
    </div>
  );
}
