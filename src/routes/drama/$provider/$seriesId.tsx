import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { LoaderCircle, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState, Poster, ProviderBadge, Rail } from "@/components/drama/cards";
import { EpisodeGrid } from "@/components/drama/player";
import { getDetailData } from "@/lib/drama/api";
import { browserPosterUrl } from "@/lib/drama/images";
import { usePrefs } from "@/lib/drama/i18n";
import { pickDescription, pickTitle } from "@/lib/drama/display";
import { readHistory, readWatchlist, toggleWatchlist, type HistoryEntry } from "@/lib/drama/storage";
import { absoluteSiteUrl, jsonLdScript } from "@/lib/drama/site";
import { applyHttpStatus } from "@/lib/drama/http-status";
import { MissingPage } from "@/components/drama/not-found";
import { isProviderId, type DetailPayload, type ProviderId } from "@/lib/drama/types";

const DETAIL_CACHE_PREFIX = "housedrama:detail:v1:";
const DETAIL_CACHE_TTL = 6 * 60 * 60 * 1000;
const detailMemoryCache = new Map<string, { savedAt: number; data: DetailPayload }>();

function cacheKey(provider: string, seriesId: string) {
  return `${DETAIL_CACHE_PREFIX}${provider}:${seriesId}:en`;
}

function readDetailCache(key: string): DetailPayload | null {
  const memory = detailMemoryCache.get(key);
  if (memory && Date.now() - memory.savedAt < DETAIL_CACHE_TTL && memory.data.ok) return memory.data;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { savedAt?: number; data?: DetailPayload };
    if (!parsed.savedAt || !parsed.data?.ok || Date.now() - parsed.savedAt > DETAIL_CACHE_TTL) {
      window.sessionStorage.removeItem(key);
      return null;
    }
    detailMemoryCache.set(key, { savedAt: parsed.savedAt, data: parsed.data });
    return parsed.data;
  } catch {
    return null;
  }
}

function writeDetailCache(key: string, data: DetailPayload) {
  if (!data.ok || !data.drama) return;
  const entry = { savedAt: Date.now(), data };
  detailMemoryCache.set(key, entry);
  if (typeof window !== "undefined") {
    try { window.sessionStorage.setItem(key, JSON.stringify(entry)); } catch { /* Storage can be full or disabled. */ }
    // Warm only the poster and first two episode covers. Fetching every episode
    // cover eagerly can consume mobile data and delay the first visible content.
    const imageUrls = [data.drama.posterUrl, ...data.episodes.slice(0, 2).map((episode) => episode.coverUrl)]
      .filter((url): url is string => Boolean(url));
    for (const url of new Set(imageUrls)) {
      const image = new Image();
      image.decoding = "async";
      image.loading = "lazy";
      image.src = url;
    }
  }
}

async function loadDetailResilient(provider: string, seriesId: string): Promise<DetailPayload> {
  const key = cacheKey(provider, seriesId);
  const cached = readDetailCache(key);
  if (cached) return cached;
  const empty: DetailPayload = { ok: false, code: "unavailable", error: "This drama could not be loaded. Please try again.", drama: null, episodes: [], similar: [], more: [], alsoOn: [] };
  let lastError = empty.error;
  let lastCode: DetailPayload["code"] = "unavailable";

  // Retry thrown failures, timeouts, and ordinary API failure payloads. Only a
  // successful payload with a drama object is cached.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      const request = getDetailData({ data: { provider: provider as ProviderId, seriesId, lang: "en" } });
      const timeout = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("Loading this drama took too long.")), 7500);
      });
      const result = await Promise.race([request, timeout]);
      if (result.ok && result.drama) {
        writeDetailCache(key, result);
        return result;
      }
      lastError = result.error || empty.error;
      lastCode = result.code === "not_found" ? "not_found" : "unavailable";
    } catch (error) {
      lastError = error instanceof Error ? error.message : empty.error;
      lastCode = "unavailable";
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }

    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return { ...empty, error: lastError, code: lastCode };
}

export const Route = createFileRoute("/drama/$provider/$seriesId")({
  loader: async ({ params }) => {
    if (!isProviderId(params.provider)) throw notFound();
    const data = await loadDetailResilient(params.provider, params.seriesId);
    if (!data.drama) {
      if (data.code === "not_found") throw notFound();
      await applyHttpStatus(503);
    }
    return data;
  },
  pendingComponent: DetailPending,
  head: ({ loaderData, params }) => {
    const drama = loaderData?.drama;
    const missing = !loaderData || loaderData.code === "not_found";
    const dramaTitle = (drama?.displayTitle || drama?.title || "HouseDrama").replace(/\s+/g, " ").trim();
    const title = drama
      ? `${dramaTitle} — Synopsis & Episodes | HouseDrama`
      : missing
        ? "Drama Not Found — HouseDrama"
        : "Drama Unavailable — HouseDrama";
    const sourceDescription = (drama?.displayDescription || drama?.description || "").replace(/\s+/g, " ").trim();
    const description = (drama
      ? `${sourceDescription ? `${sourceDescription} ` : `Watch ${dramaTitle} on HouseDrama. `}Explore the synopsis, series information, and available episodes.`
      : missing
        ? "This drama URL is not in the HouseDrama catalog."
        : "This drama is temporarily unavailable on HouseDrama. No substitute title is shown.").slice(0, 300);
    const canonical = absoluteSiteUrl(`/drama/${encodeURIComponent(params.provider)}/${encodeURIComponent(params.seriesId)}`);
    // Keep a JPEG converter URL when the source poster is HEIC. Other proxy URLs still unwrap.
    const image = browserPosterUrl(drama?.posterUrl) || absoluteSiteUrl("/og.jpg");
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: drama ? "index,follow,max-image-preview:large" : "noindex,follow" },
        { name: "googlebot", content: drama ? "index,follow,max-image-preview:large" : "noindex,follow" },
        { property: "og:type", content: "video.tv_show" },
        { property: "og:locale", content: "en_US" },
        { property: "og:site_name", content: "HouseDrama" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonical },
        { property: "og:image", content: image },
        { property: "og:image:secure_url", content: image },
        { property: "og:image:alt", content: `${dramaTitle} poster` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
        { name: "twitter:image:alt", content: `${dramaTitle} poster` },
        ...(drama
          ? [{ name: "keywords", content: `${drama.originalTitle && drama.originalTitle !== drama.title ? `${drama.originalTitle}, ` : ""}${drama.displayTitle || drama.title}, Chinese short drama` }]
          : []),
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: DetailPage,
  notFoundComponent: DramaNotFound,
});

function DramaNotFound() {
  return (
    <MissingPage
      title="Drama not found"
      body="This title is not in the HouseDrama catalog. It was not replaced with a different drama."
    />
  );
}

function DetailPending() {
  const { uiLang } = usePrefs();
  const pendingCopy = {
    en: { title: "Loading drama details…", body: "Fetching the synopsis and episode list. If the provider is slow, retry options will appear." },
    id: { title: "Memuat detail drama…", body: "Sedang mengambil sinopsis dan daftar episode. Jika penyedia lambat, halaman akan menampilkan opsi coba lagi." },
    hi: { title: "ड्रामा विवरण लोड हो रहा है…", body: "सारांश और एपिसोड सूची प्राप्त की जा रही है। प्रदाता धीमा होने पर फिर कोशिश करने का विकल्प दिखेगा।" },
    fil: { title: "Nilo-load ang detalye ng drama…", body: "Kinukuha ang buod at listahan ng episode. May lalabas na opsyong subukan muli kung mabagal ang provider." },
    ms: { title: "Memuatkan butiran drama…", body: "Sedang mendapatkan sinopsis dan senarai episod. Pilihan cuba lagi akan muncul jika penyedia lambat." },
    th: { title: "กำลังโหลดรายละเอียดละคร…", body: "กำลังดึงเรื่องย่อและรายการตอน หากผู้ให้บริการตอบสนองช้า จะมีตัวเลือกให้ลองอีกครั้ง" },
  }[uiLang];
  return (
    <main className="mx-auto min-h-[55vh] max-w-6xl px-4 py-10 sm:px-6" aria-live="polite" aria-busy="true">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-3xl border border-line bg-surface/80 px-6 py-12 text-center">
        <LoaderCircle className="size-9 animate-spin text-primary" aria-hidden="true" />
        <h1 className="mt-4 text-lg font-semibold">{pendingCopy.title}</h1>
        <p className="mt-2 text-sm text-muted">{pendingCopy.body}</p>
      </div>
    </main>
  );
}

function DetailPage() {
  const initial = Route.useLoaderData();
  const { t, contentLang, uiLang } = usePrefs();
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
    return (
      <div className="mx-auto max-w-xl py-12 text-center" role="alert">
        <EmptyState title={t.dramaUnavailable} body={data.error || t.dramaMissing} />
        <button type="button" onClick={() => window.location.reload()} className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 font-semibold text-primary-ink">
          {uiLang === "id" ? "Coba Lagi" : uiLang === "hi" ? "फिर कोशिश करें" : uiLang === "fil" ? "Subukan muli" : uiLang === "ms" ? "Cuba Lagi" : uiLang === "th" ? "ลองอีกครั้ง" : "Try Again"}
        </button>
      </div>
    );
  }

  const first = data.episodes[0];
  const canonicalUrl = absoluteSiteUrl(`/drama/${encodeURIComponent(drama.provider)}/${encodeURIComponent(drama.seriesId)}`);
  const displayTitle = drama.displayTitle || drama.title;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    name: displayTitle,
    ...(drama.originalTitle && drama.originalTitle !== drama.title ? { alternateName: drama.originalTitle } : {}),
    ...(drama.displayDescription || drama.description ? { description: drama.displayDescription || drama.description } : {}),
    ...(browserPosterUrl(drama.posterUrl) ? { image: browserPosterUrl(drama.posterUrl) } : {}),
    ...(drama.episodeCount || data.episodes.length ? { numberOfEpisodes: drama.episodeCount || data.episodes.length } : {}),
    ...(drama.language ? { inLanguage: drama.language } : {}),
    ...(drama.tags?.length ? { genre: drama.tags } : {}),
    publisher: { "@type": "Organization", name: "HouseDrama", url: absoluteSiteUrl("/") },
    ...(data.episodes.some((episode) => episode.access === "open") ? { isAccessibleForFree: true } : {}),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: uiLang === "id" ? "Beranda" : "Home", item: absoluteSiteUrl("/") },
      { "@type": "ListItem", position: 2, name: uiLang === "id" ? "Drama" : "Discover Dramas", item: absoluteSiteUrl("/discover") },
      { "@type": "ListItem", position: 3, name: displayTitle, item: canonicalUrl },
    ],
  };

  return (
    <article className="hd-detail">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumb) }} />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <Link to="/" className="hover:text-ink">{uiLang === "id" ? "Beranda" : "Home"}</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <Link to="/discover" className="hover:text-ink">{uiLang === "id" ? "Drama" : "Discover Dramas"}</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span aria-current="page" className="text-ink">{displayTitle}</span>
      </nav>
      <div className="hd-detail__layout grid gap-6 md:grid-cols-[minmax(180px,260px)_minmax(0,1fr)] md:items-start">
        <div className="hd-detail__poster overflow-hidden rounded-[1.25rem]">
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
        <div className="hd-detail__copy min-w-0">
          <ProviderBadge provider={drama.provider} />
          <h1 className="hd-detail__title mt-3 text-3xl leading-[1.08] font-bold tracking-tight sm:text-5xl">{pickTitle(drama, contentLang)}</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">{pickDescription(drama, contentLang) || t.noSynopsis}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted">
            {drama.language ? <span className="rounded-full bg-surface px-3 py-1">{drama.language}</span> : null}
            {drama.episodeCount ? <span className="rounded-full bg-surface px-3 py-1">{drama.episodeCount} {t.episodeUnit}</span> : null}
            {drama.completed === true ? <span className="rounded-full bg-surface px-3 py-1">{t.completed}</span> : null}
            {drama.completed === false ? <span className="rounded-full bg-surface px-3 py-1">{t.ongoing}</span> : null}
            {drama.playCount ? <span className="rounded-full bg-surface px-3 py-1">{drama.playCount} {t.plays}</span> : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {drama.tags.map((tag) => (
              <Link key={tag} to="/search" search={{ q: tag, provider: "all" }} className="rounded-full bg-[#2a2229] px-3 py-1 text-sm text-[#f0d5e0]">
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
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-ink shadow-md shadow-primary/20 transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {resumeEntry ? `${t.continue} · ${resumeEntry.episodeLabel}` : t.start}
              </Link>
            ) : null}
            <button
              type="button"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-surface px-6 py-3 font-semibold transition-colors hover:border-primary hover:text-primary"
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
      <nav aria-label={uiLang === "id" ? "Jelajahi drama lainnya" : "Explore more dramas"} className="mt-8 flex flex-wrap gap-2">
        <Link to="/discover" className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary">{uiLang === "id" ? "Jelajahi semua drama" : "Explore all dramas"}</Link>
        <Link to="/provider/$provider" params={{ provider: drama.provider }} className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary">{uiLang === "id" ? `Drama lainnya dari ${drama.provider}` : `More from ${drama.provider}`}</Link>
        <Link to="/trending" className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary">{uiLang === "id" ? "Drama populer" : "Popular dramas"}</Link>
        <Link to="/latest" className="inline-flex min-h-10 items-center rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary">{uiLang === "id" ? "Drama terbaru" : "Latest dramas"}</Link>
      </nav>
      <section className="hd-episodes mt-10">
        <h2 className="mb-4 text-2xl">{t.episodes}</h2>
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
