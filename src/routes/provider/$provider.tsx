import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { DramaGrid, EmptyState, ErrorNote, PageIntro, PageSkeleton } from "@/components/drama/cards";
import { MissingPage } from "@/components/drama/not-found";
import { getBrowseData } from "@/lib/drama/api";
import { usePrefs } from "@/lib/drama/i18n";
import { providerLabel, isProviderHidden } from "@/lib/drama/providers";
import { pageSeo } from "@/lib/drama/site";
import { isProviderId, type ProviderId } from "@/lib/drama/types";

export const Route = createFileRoute("/provider/$provider")({
  loader: ({ params }) => {
    if (!isProviderId(params.provider) || isProviderHidden(params.provider)) throw notFound();
    return getBrowseData({ data: { lang: "en", provider: params.provider, page: 1, rail: null } });
  },
  pendingComponent: PageSkeleton,
  head: ({ params, loaderData }) => {
    const label = isProviderId(params.provider) ? providerLabel(params.provider) : "Provider";
    const empty = !loaderData?.items?.length;
    return pageSeo({
      title: `${label} Short Dramas — HouseDrama`,
      description: `Browse short dramas from ${label} on HouseDrama. Open a title for its synopsis and episode list.`,
      path: `/provider/${encodeURIComponent(params.provider)}`,
      robots: empty ? "noindex,follow" : "index,follow,max-image-preview:large",
    });
  },
  component: ProviderPage,
  notFoundComponent: () => (
    <MissingPage
      title="Provider not found"
      body="This provider is not in the public HouseDrama catalog. The page was not filled with another provider's dramas."
    />
  ),
});

function ProviderPage() {
  const params = Route.useParams();
  const initial = Route.useLoaderData();
  const { t } = usePrefs();
  const provider: ProviderId = params.provider as ProviderId;
  const [items, setItems] = useState(initial.items);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [loading, setLoading] = useState(false);

  if (!isProviderId(params.provider)) {
    return <EmptyState title={t.unknownProvider} body={t.unknownProviderBody} />;
  }

  async function more() {
    setLoading(true);
    const next = await getBrowseData({ data: { lang: "en", provider, page: page + 1, rail: null } });
    setItems((current) => [...current, ...next.items]);
    setPage(next.page);
    setHasMore(next.hasMore);
    setLoading(false);
  }

  return (
    <div>
      <PageIntro eyebrow={t.providerLabel} title={providerLabel(provider)} description={t.providerIntro} />
      <div className="mt-4">{initial.providers.some((item) => !item.ok) ? <ErrorNote message={initial.providers.find((item) => !item.ok)?.error || t.providersDown} /> : null}</div>
      {items.length ? <DramaGrid items={items} /> : <EmptyState title={t.empty} body={t.providerEmpty} />}
      {hasMore ? (
        <button type="button" onClick={() => void more()} className="mt-6 h-12 rounded-full bg-ink px-5 font-semibold text-player-ink">
          {loading ? t.loading : t.loadMore}
        </button>
      ) : null}
    </div>
  );
}
