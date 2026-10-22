import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DramaGrid, EmptyState, ErrorNote, PageIntro, PageSkeleton } from "@/components/drama/cards";
import { getBrowseData } from "@/lib/drama/api";
import { usePrefs } from "@/lib/drama/i18n";
import { providerLabel } from "@/lib/drama/providers";
import { isProviderId, type ProviderId } from "@/lib/drama/types";

export const Route = createFileRoute("/provider/$provider")({
  loader: ({ params }) => {
    const provider = isProviderId(params.provider) ? params.provider : "anyreel";
    return getBrowseData({ data: { lang: "en", provider, page: 1, rail: null } });
  },
  pendingComponent: PageSkeleton,
  head: ({ params }) => {
    const labels: Record<string, string> = {
      anyreel: "AnyReel", dramabox: "DramaBox", freereels: "FreeReels", melolo: "Melolo",
    };
    const label = labels[params.provider] || params.provider;
    const canonical = `https://house-drama.web.id/provider/${encodeURIComponent(params.provider)}`;
    return {
      meta: [
        { title: `${label} Short Dramas — HouseDrama` },
        { name: "description", content: `Browse short dramas from ${label} on HouseDrama. Explore series details, synopses, and available episodes.` },
        { name: "robots", content: "index,follow" },
        { property: "og:title", content: `${label} Short Dramas — HouseDrama` },
        { property: "og:description", content: `Explore ${label} short dramas, synopses, and available episodes on HouseDrama.` },
        { property: "og:url", content: canonical },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: ProviderPage,
});

function ProviderPage() {
  const params = Route.useParams();
  const initial = Route.useLoaderData();
  const { t } = usePrefs();
  const provider: ProviderId = isProviderId(params.provider) ? params.provider : "anyreel";
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
