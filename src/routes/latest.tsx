import { createFileRoute } from "@tanstack/react-router";
import { DramaGrid, EmptyState, PageIntro, PageSkeleton } from "@/components/drama/cards";
import { SeoItemList } from "@/components/drama/seo-item-list";
import { getHomeData } from "@/lib/drama/api";
import { pageSeo } from "@/lib/drama/site";
import { usePrefs } from "@/lib/drama/i18n";

export const Route = createFileRoute("/latest")({
  loader: () => getHomeData({ data: { lang: "en" } }),
  pendingComponent: PageSkeleton,
  head: () => pageSeo({
    title: "Latest Chinese Short Dramas & New Episodes — HouseDrama",
    description: "Watch the latest Chinese short dramas and discover new episodes, trending romance, CEO stories, revenge, and fantasy on HouseDrama.",
    path: "/latest",
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
      <SeoItemList items={items} name="Latest Chinese Short Dramas and New Episodes" />
      {items.length ? <DramaGrid items={items} /> : <EmptyState title={t.noNew} body={t.noNewBody} />}
    </div>
  );
}
