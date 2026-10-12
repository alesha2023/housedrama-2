import { createFileRoute } from "@tanstack/react-router";
import { DramaGrid, EmptyState, PageIntro, PageSkeleton } from "@/components/drama/cards";
import { getHomeData } from "@/lib/drama/api";
import { usePrefs } from "@/lib/drama/i18n";

export const Route = createFileRoute("/latest")({
  loader: () => getHomeData({ data: { lang: "id" } }),
  pendingComponent: PageSkeleton,
  head: () => ({
    meta: [
      { title: "Latest short dramas — HouseDrama" },
      { name: "description", content: "Newly released Chinese short dramas from the connected catalogs." },
    ],
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
      {items.length ? <DramaGrid items={items} /> : <EmptyState title={t.noNew} body={t.noNewBody} />}
    </div>
  );
}
