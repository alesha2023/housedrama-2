import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EmptyState, PageSkeleton, Poster, ProviderBadge, Rail } from "@/components/drama/cards";
import { EpisodeGrid } from "@/components/drama/player";
import { getDetailData } from "@/lib/drama/api";
import { usePrefs } from "@/lib/drama/i18n";
import { pickDescription, pickTitle } from "@/lib/drama/display";
import { readWatchlist, toggleWatchlist } from "@/lib/drama/storage";
import { isProviderId } from "@/lib/drama/types";

export const Route = createFileRoute("/drama/$provider/$seriesId")({
  loader: ({ params }) => {
    if (!isProviderId(params.provider)) throw new Error("Unknown provider");
    return getDetailData({ data: { provider: params.provider, seriesId: params.seriesId, lang: "id" } });
  },
  pendingComponent: PageSkeleton,
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.drama ? `${loaderData.drama.title} — HouseDrama` : "Drama — HouseDrama" },
      {
        name: "description",
        content: loaderData?.drama?.displayDescription || loaderData?.drama?.description || "Drama details and episode list from the original provider.",
      },
      ...(loaderData?.drama?.originalTitle
        ? [{ name: "keywords", content: `${loaderData.drama.originalTitle}, ${loaderData.drama.title}` }]
        : []),
    ],
  }),
  component: DetailPage,
});

function DetailPage() {
  const initial = Route.useLoaderData();
  const { t, contentLang } = usePrefs();
  const [data, setData] = useState(initial);
  const [saved, setSaved] = useState(false);
  const drama = data.drama;

  useEffect(() => setData(initial), [initial]);
  useEffect(() => {
    if (!drama) return;
    setSaved(readWatchlist().some((item) => item.provider === drama.provider && item.seriesId === drama.seriesId));
  }, [drama]);

  if (!data.ok || !drama) {
    return <EmptyState title={t.dramaUnavailable} body={data.error || t.dramaMissing} />;
  }

  const first = data.episodes[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: drama.displayTitle || drama.title,
    alternateName: drama.originalTitle && drama.originalTitle !== drama.title ? drama.originalTitle : undefined,
    description: drama.displayDescription || drama.description || undefined,
    image: drama.posterUrl || undefined,
    numberOfEpisodes: drama.episodeCount || data.episodes.length || undefined,
    inLanguage: drama.language || undefined,
    genre: drama.tags,
    isAccessibleForFree: data.episodes.some((episode) => episode.access === "open") ? true : undefined,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-card">
          <div className="aspect-poster">
            <Poster src={drama.posterUrl} alt={pickTitle(drama, contentLang)} priority />
          </div>
        </div>
        <div>
          <ProviderBadge provider={drama.provider} />
          <h1 className="mt-3 text-4xl sm:text-5xl">{pickTitle(drama, contentLang)}</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted">{pickDescription(drama, contentLang) || t.noSynopsis}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted">
            {drama.language ? <span className="rounded-full bg-surface px-3 py-1">{drama.language}</span> : null}
            {drama.episodeCount ? <span className="rounded-full bg-surface px-3 py-1">{drama.episodeCount} {t.episodeUnit}</span> : null}
            {drama.completed === true ? <span className="rounded-full bg-surface px-3 py-1">{t.completed}</span> : null}
            {drama.completed === false ? <span className="rounded-full bg-surface px-3 py-1">{t.ongoing}</span> : null}
            {drama.playCount ? <span className="rounded-full bg-surface px-3 py-1">{drama.playCount} {t.plays}</span> : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {drama.tags.map((tag) => (
              <Link key={tag} to="/search" search={{ q: tag, provider: "all" }} className="rounded-full border border-line px-3 py-1 text-sm">
                {tag}
              </Link>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {first ? (
              <Link
                to="/watch/$provider/$seriesId/$episodeId"
                params={{ provider: drama.provider, seriesId: drama.seriesId, episodeId: first.episodeId }}
                className="inline-flex h-12 items-center rounded-full bg-primary px-5 font-semibold text-primary-ink"
              >
                {t.start}
              </Link>
            ) : null}
            <button
              type="button"
              className="inline-flex h-12 items-center rounded-full border border-line px-5 font-semibold"
              onClick={() => {
                const next = toggleWatchlist({
                  provider: drama.provider,
                  seriesId: drama.seriesId,
                  title: drama.displayTitle || drama.title,
                  originalTitle: drama.originalTitle || drama.title,
                  posterUrl: drama.posterUrl,
                  episodeCount: drama.episodeCount,
                  savedAt: Date.now(),
                });
                setSaved(next.some((item) => item.seriesId === drama.seriesId && item.provider === drama.provider));
              }}
            >
              {saved ? t.saved : t.save}
            </button>
          </div>
        </div>
      </div>
      <section className="mt-8">
        <h2 className="mb-3 text-2xl">{t.episodes}</h2>
        {data.episodes.length ? (
          <>
            <p className="mb-3 text-sm text-muted">{t.limitedNote}</p>
            <EpisodeGrid episodes={data.episodes} provider={drama.provider} seriesId={drama.seriesId} />
          </>
        ) : (
          <p className="text-sm text-muted">{t.noEpisodeList}</p>
        )}
      </section>
      {data.alsoOn.length ? <Rail title={t.also} items={data.alsoOn} /> : null}
      {data.similar.length ? <Rail title={t.similar} items={data.similar} /> : null}
      {data.more.length ? <Rail title={t.more} items={data.more} /> : null}
    </article>
  );
}
