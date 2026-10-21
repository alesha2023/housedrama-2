import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DramaGrid, EmptyState, ErrorNote, PageIntro, PageSkeleton } from "@/components/drama/cards";
import { SeoItemList } from "@/components/drama/seo-item-list";
import { getBrowseData } from "@/lib/drama/api";
import { pageSeo } from "@/lib/drama/site";
import { railTitle, usePrefs } from "@/lib/drama/i18n";
import type { BrowsePayload } from "@/lib/drama/types";

export const Route = createFileRoute("/discover")({
  validateSearch: (search: Record<string, unknown>): { rail?: string } => {
    return typeof search.rail === "string" ? { rail: search.rail } : {};
  },
  loaderDeps: ({ search }) => ({ rail: search.rail ?? null }),
  loader: ({ deps }) => getBrowseData({ data: { lang: "en", provider: "all", page: 1, rail: deps.rail } }),
  pendingComponent: PageSkeleton,
  head: ({ match }) => pageSeo({
    title: "Discover Chinese & Asian Short Dramas — HouseDrama",
    description: "Discover Chinese and Asian short dramas from multiple providers. Browse romance, CEO, revenge, fantasy, family, and more on HouseDrama.",
    path: "/discover",
    robots: match.search.rail ? "noindex,follow" : "index,follow,max-image-preview:large",
  }),
  component: DiscoverPage,
});

function DiscoverPage() {
  const initial = Route.useLoaderData();
  const { rail } = Route.useSearch();
  const { t, uiLang } = usePrefs();
  const [data, setData] = useState<BrowsePayload>(initial);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setData(initial);
    setPage(1);
  }, [initial]);

  async function more() {
    const nextPage = page + 1;
    setLoading(true);
    const next = await getBrowseData({
      data: { lang: "en", provider: "all", page: nextPage, rail: rail ?? null },
    });
    setData((current) => ({
      ...next,
      items: [...current.items, ...next.items.filter((item) => !current.items.some((have) => have.provider === item.provider && have.seriesId === item.seriesId))],
    }));
    setPage(nextPage);
    setLoading(false);
  }

  const title = rail ? railTitle(uiLang, rail, rail.replace(/-/g, " ")) : t.discover;
  return (
    <div>
      <PageIntro eyebrow="HouseDrama" title={title} description={t.discoverBody} />
      <SeoItemList items={data.items} name={title} />
      <div className="mt-4">
        {data.providers.some((item) => !item.ok) ? <ErrorNote message={t.providersDown} /> : null}
      </div>
      {data.items.length ? <DramaGrid items={data.items} /> : <EmptyState title={t.empty} body={t.emptyBrowse} />}
      {data.hasMore ? (
        <button type="button" onClick={() => void more()} disabled={loading} className="mt-6 h-12 rounded-full bg-ink px-5 font-semibold text-player-ink">
          {loading ? t.loading : t.loadMore}
        </button>
      ) : null}
    </div>
  );
}
