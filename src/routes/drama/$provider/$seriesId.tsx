import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState, PageSkeleton, Poster, ProviderBadge, Rail } from "@/components/drama/cards";
import { EpisodeGrid } from "@/components/drama/player";
import { getDetailData } from "@/lib/drama/api";
import { usePrefs } from "@/lib/drama/i18n";
import { pickDescription, pickTitle } from "@/lib/drama/display";
import { readHistory, readWatchlist, toggleWatchlist, type HistoryEntry } from "@/lib/drama/storage";
import { isProviderId } from "@/lib/drama/types";

export const Route = createFileRoute("/drama/$provider/$seriesId")({
  loader: ({ params }) => {
    if (!isProviderId(params.provider)) throw new Error("Unknown provider");
    return getDetailData({ data: { provider: params.provider, seriesId: params.seriesId, lang: "en" } });
  },
  pendingComponent: PageSkeleton,
  head: ({ loaderData, params }) => {
    const drama = loaderData?.drama;
    const dramaTitle = (drama?.displayTitle || drama?.title || "Drama China").replace(/\s+/g, " ").trim();
    const title = drama
      ? `${dramaTitle} — Watch Short Drama | HouseDrama`
      : "Drama Not Available — HouseDrama";
    const sourceDescription = (drama?.displayDescription || drama?.description || "").replace(/\s+/g, " ").trim();
    const description = (drama
      ? `${sourceDescription ? `${sourceDescription} ` : `Explore ${dramaTitle} on HouseDrama. `}Read the synopsis, explore series information, and browse available episodes.`
      : "Details for this drama are temporarily unavailable on HouseDrama.").slice(0, 300);
    const canonical = `https://house-drama.web.id/drama/${encodeURIComponent(params.provider)}/${encodeURIComponent(params.seriesId)}`;
    // Keep image metadata absolute. If a provider URL is a wsrv.nl wrapper,
    // unwrap it so Google/social crawlers are not sent to a proxy blocked by robots.txt.
    let image = drama?.posterUrl || "https://house-drama.web.id/og.jpg";
    try {
      const parsedImage = new URL(image);
      if (parsedImage.hostname === "wsrv.nl" || parsedImage.hostname === "images.weserv.nl") {
        const original = parsedImage.searchParams.get("url");
        if (original && /^https?:\/\//i.test(original)) image = original;
      }
    } catch {
      image = "https://house-drama.web.id/og.jpg";
    }
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: drama && (drama.displayTitle || drama.title) ? "index,follow,max-image-preview:large" : "noindex,follow" },
        { name: "googlebot", content: drama ? "index,follow,max-image-preview:large" : "noindex,follow" },
        { property: "og:type", content: "video.tv_show" },
        { property: "og:locale", content: "en_US" },
        { property: "og:site_name", content: "HouseDrama" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonical },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
        ...(drama?.originalTitle && drama.originalTitle !== drama.title
          ? [{ name: "keywords", content: `${drama.originalTitle}, ${drama.displayTitle || drama.title}, Chinese short drama` }]
          : [{ name: "keywords", content: `${drama?.displayTitle || drama?.title || "drama China"}, Chinese short drama` }]),
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: DetailPage,
});

function DetailPage() {
  const initial = Route.useLoaderData();
  const { t, contentLang } = usePrefs();
  const [data, setData] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [resumeEntry, setResumeEntry] = useState<HistoryEntry | null>(null);
  const drama = data.drama;

  useEffect(() => setData(initial), [initial]);
  useEffect(() => {
    if (!drama) return;
    setSaved(readWatchlist().some((item) => item.provider === drama.provider && item.seriesId === drama.seriesId));
    const loadHistory = () => setResumeEntry(
      readHistory().find((item) => item.provider === drama.provider && item.seriesId === drama.seriesId) ?? null,
    );
    loadHistory();
    window.addEventListener("dramaluma-library", loadHistory);
    return () => window.removeEventListener("dramaluma-library", loadHistory);
  }, [drama]);

  if (!data.ok || !drama) {
    return <EmptyState title={t.dramaUnavailable} body={data.error || t.dramaMissing} />;
  }

  const first = data.episodes[0];
  const canonicalUrl = `https://house-drama.web.id/drama/${encodeURIComponent(drama.provider)}/${encodeURIComponent(drama.seriesId)}`;
  const displayTitle = drama.displayTitle || drama.title;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Beranda", item: "https://house-drama.web.id/" },
              { "@type": "ListItem", position: 2, name: "Drama", item: "https://house-drama.web.id/discover" },
              { "@type": "ListItem", position: 3, name: displayTitle, item: canonicalUrl },
            ],
          }),
        }}
      />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <Link to="/" className="hover:text-ink">Beranda</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <Link to="/discover" className="hover:text-ink">Drama</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span aria-current="page" className="text-ink">{displayTitle}</span>
      </nav>
      <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-card">
          {first ? (
            <Link
              to="/watch/$provider/$seriesId/$episodeId"
              params={{ provider: drama.provider, seriesId: drama.seriesId, episodeId: first.episodeId }}
              search={{ auto: true }}
              aria-label={t.start}
              className="relative block aspect-poster"
            >
              <Poster src={drama.posterUrl} alt={pickTitle(drama, contentLang)} priority className="absolute inset-0" />
              <span className="absolute inset-0 grid place-items-center bg-black/10">
                <span className="grid size-16 place-items-center rounded-full bg-black/55 text-white">
                  <Play className="ml-1 size-8 fill-current" />
                </span>
              </span>
            </Link>
          ) : (
            <div className="aspect-poster">
              <Poster src={drama.posterUrl} alt={pickTitle(drama, contentLang)} priority />
            </div>
          )}
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
                params={{ provider: drama.provider, seriesId: drama.seriesId, episodeId: resumeEntry?.episodeId || first.episodeId }}
                  search={{ auto: true }}
                className="inline-flex h-12 items-center rounded-full bg-primary px-5 font-semibold text-primary-ink"
              >
                {resumeEntry ? `${t.continue} · ${resumeEntry.episodeLabel}` : t.start}
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
      <nav aria-label="Jelajahi drama lainnya" className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link to="/discover" className="text-primary underline underline-offset-4">Jelajahi semua drama</Link>
        <Link to="/provider/$provider" params={{ provider: drama.provider }} className="text-primary underline underline-offset-4">Drama lainnya dari {drama.provider}</Link>
        <Link to="/trending" className="text-primary underline underline-offset-4">Drama populer</Link>
        <Link to="/latest" className="text-primary underline underline-offset-4">Drama terbaru</Link>
      </nav>
      <section className="mt-8">
        <h2 className="mb-3 text-2xl">{t.episodes}</h2>
        {data.episodes.length ? (
          <EpisodeGrid episodes={data.episodes} provider={drama.provider} seriesId={drama.seriesId} />
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
