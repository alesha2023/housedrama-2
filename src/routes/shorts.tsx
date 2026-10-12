import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { EmptyState, PageIntro, PageSkeleton, Poster, ProviderBadge } from "@/components/drama/cards";
import { getShortsData } from "@/lib/drama/api";
import { pickTitle } from "@/lib/drama/display";
import { usePrefs } from "@/lib/drama/i18n";

export const Route = createFileRoute("/shorts")({
  loader: () => getShortsData({ data: { lang: "id", page: 1 } }),
  pendingComponent: PageSkeleton,
  head: () => ({
    meta: [
      { title: "Short drama feed — HouseDrama" },
      { name: "description", content: "A vertical feed of short dramas from AnyReel and FreeReels." },
    ],
  }),
  component: ShortsPage,
});

function ShortsPage() {
  const initial = Route.useLoaderData();
  const { t, contentLang } = usePrefs();
  const [items, setItems] = useState(initial.items);
  const [page, setPage] = useState(initial.page);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [loading, setLoading] = useState(false);

  async function more() {
    setLoading(true);
    const next = await getShortsData({ data: { lang: "id", page: page + 1 } });
    setItems((current) => [...current, ...next.items]);
    setPage(next.page);
    setHasMore(next.hasMore);
    setLoading(false);
  }

  return (
    <div>
      <PageIntro title={t.shorts} description={t.shortsBody} />
      {items.length ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const playable = Boolean(item.firstEpisodeId);
            const title = pickTitle(item, contentLang);
            const card = (
              <>
                <div className="relative overflow-hidden rounded-card">
                  <div className="aspect-drama">
                    <Poster src={item.posterUrl} alt={title} />
                  </div>
                  <div className="absolute left-2 top-2">
                    <ProviderBadge provider={item.provider} />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink to-transparent p-3 text-player-ink">
                    <h2 className="line-clamp-2 text-base font-semibold">{title}</h2>
                  </div>
                </div>
              </>
            );
            return playable ? (
              <Link
                key={`${item.provider}-${item.seriesId}`}
                to="/watch/$provider/$seriesId/$episodeId"
                params={{ provider: item.provider, seriesId: item.seriesId, episodeId: item.firstEpisodeId! }}
              >
                {card}
              </Link>
            ) : (
              <Link
                key={`${item.provider}-${item.seriesId}`}
                to="/drama/$provider/$seriesId"
                params={{ provider: item.provider, seriesId: item.seriesId }}
              >
                {card}
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState title={t.empty} body={t.shortsEmpty} />
      )}
      {hasMore ? (
        <button type="button" onClick={() => void more()} className="mt-6 h-12 rounded-full bg-primary px-5 font-semibold text-primary-ink">
          {loading ? t.loading : t.loadMore}
        </button>
      ) : null}
    </div>
  );
}
