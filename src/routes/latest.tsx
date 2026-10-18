import { createFileRoute } from "@tanstack/react-router";
import { DramaGrid, EmptyState, PageIntro, PageSkeleton } from "@/components/drama/cards";
import { SeoItemList } from "@/components/drama/seo-item-list";
import { getHomeData } from "@/lib/drama/api";
import { usePrefs } from "@/lib/drama/i18n";

export const Route = createFileRoute("/latest")({
  loader: () => getHomeData({ data: { lang: "en" } }),
  pendingComponent: PageSkeleton,
  head: () => ({
    meta: [
      { title: "Latest Chinese Short Dramas & Episodes — HouseDrama" },
      { name: "description", content: "Discover the latest Chinese short dramas and episode updates from available providers on HouseDrama." },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:title", content: "Latest Chinese Short Dramas & Episodes — HouseDrama" },
      { property: "og:description", content: "Discover the latest dramas and new episodes on HouseDrama." },
      { property: "og:url", content: "https://house-drama.web.id/latest" },
    ],
    links: [{ rel: "canonical", href: "https://house-drama.web.id/latest" }],
  }),
  component: LatestPage,
});

function LatestPage() {
  const data = Route.useLoaderData();
  const { t } = usePrefs();
  const latest = data.sections.find((section) => section.id === "latest")?.items ?? [];
  const fresh = data.sections.find((section) => section.id === "new")?.items ?? [];
  const items = [...latest, ...fresh.filter((item) => !latest.some((have) => have.provider === item.provider && have.seriesId === item.seriesId))];
  return (
    <div>
      <PageIntro eyebrow={t.newEyebrow} title={t.latestTitle} description={t.latestBody} />
      <SeoItemList items={items} name="Drama China Terbaru dan Episode Baru" />
      {items.length ? <DramaGrid items={items} /> : <EmptyState title={t.noNew} body={t.noNewBody} />}
    </div>
  );
}
