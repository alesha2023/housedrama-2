import { createFileRoute } from "@tanstack/react-router";
import { DramaGrid, EmptyState, PageIntro, PageSkeleton } from "@/components/drama/cards";
import { getHomeData } from "@/lib/drama/api";
import { usePrefs } from "@/lib/drama/i18n";

export const Route = createFileRoute("/trending")({
  loader: () => getHomeData({ data: { lang: "id" } }),
  pendingComponent: PageSkeleton,
  head: () => ({
    meta: [
      { title: "Trending short dramas — HouseDrama" },
      { name: "description", content: "Trending Chinese short dramas ranked by AnyReel and DramaBox." },
    ],
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
      {items.length ? <DramaGrid items={items} /> : <EmptyState title={t.noRank} body={t.noRankBody} />}
    </div>
  );
}
