import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/drama/cards";
import { MissingPage } from "@/components/drama/not-found";
import { Player } from "@/components/drama/player";
import { getWatchData } from "@/lib/drama/api";
import { usePrefs } from "@/lib/drama/i18n";
import { applyHttpStatus } from "@/lib/drama/http-status";
import { absoluteSiteUrl } from "@/lib/drama/site";
import { isProviderId } from "@/lib/drama/types";

export const Route = createFileRoute("/watch/$provider/$seriesId/$episodeId")({
  validateSearch: (search: Record<string, unknown>): { auto?: boolean; lang?: string } => ({
    ...(search.auto === 1 || search.auto === "1" || search.auto === true ? { auto: true } : {}),
    ...(typeof search.lang === "string" ? { lang: search.lang } : {}),
  }),
  loader: async ({ params }) => {
    if (!isProviderId(params.provider)) throw notFound();
    const data = await getWatchData({
      data: { provider: params.provider, seriesId: params.seriesId, episodeId: params.episodeId, lang: "en" },
    });
    if (!data.detail.drama) {
      if (data.detail.code === "not_found") throw notFound();
      await applyHttpStatus(503);
      return data;
    }
    const episode = data.detail.episodes.find((item) => item.episodeId === params.episodeId);
    if (!episode) await applyHttpStatus(data.detail.episodes.length ? 404 : 503);
    return data;
  },
  staleTime: 60_000,
  pendingMs: 0,
  pendingMinMs: 300,
  pendingComponent: WatchPending,
  head: ({ loaderData, params }) => {
    const titleName = loaderData?.detail.drama?.displayTitle || loaderData?.detail.drama?.title;
    const title = titleName ? `${titleName} — Watch on HouseDrama` : "Watch — HouseDrama";
    return {
      meta: [
        { title },
        { name: "robots", content: "noindex,follow" },
        {
          name: "description",
          content: titleName
            ? `Watch ${titleName} on HouseDrama. The synopsis and episode list are on the drama page.`
            : "This episode page is for playback. Open the drama page for the synopsis and episode list.",
        },
      ],
      links: [{ rel: "canonical", href: absoluteSiteUrl(`/drama/${encodeURIComponent(params.provider)}/${encodeURIComponent(params.seriesId)}`) }],
    };
  },
  component: WatchPage,
  notFoundComponent: () => (
    <MissingPage
      title="Episode not found"
      body="This watch URL is not in the catalog. Open Discover and choose a drama that is actually listed."
    />
  ),
});

function WatchPage() {
  const initial = Route.useLoaderData();
  const params = Route.useParams();
  const { auto } = Route.useSearch();
  const { t } = usePrefs();
  const [detail, setDetail] = useState(initial.detail);
  const [stream, setStream] = useState(initial.stream);

  // Count one play-start per drama per browser session to avoid duplicate counts on refresh.
  useEffect(() => {
    if (!detail.drama || !isProviderId(params.provider)) return;
    const key = `housedrama-viewed:${params.provider}:${params.seriesId}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Private browsing/storage restrictions should never block playback.
    }
    void fetch("/api/drama-trending", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        provider: params.provider,
        seriesId: params.seriesId,
        title: detail.drama.displayTitle || detail.drama.title,
        posterUrl: detail.drama.posterUrl,
      }),
      keepalive: true,
    }).catch(() => undefined);
  }, [detail.drama, params.provider, params.seriesId]);

  useEffect(() => {
    setDetail(initial.detail);
    setStream(initial.stream);
  }, [initial]);

  if (!isProviderId(params.provider) || !detail.drama) {
    return (
      <>
        <h1 className="sr-only">Episode unavailable</h1>
        <EmptyState title={t.cantOpen} body={detail.error || t.missingDrama} />
      </>
    );
  }

  // Never fabricate an "open" episode when the provider did not return it.
  // Fake episode rows make unavailable videos look playable and can mislead visitors.
  const episode = detail.episodes.find((item) => item.episodeId === params.episodeId);
  if (!episode) {
    return (
      <>
        <h1 className="sr-only">Episode unavailable</h1>
        <EmptyState
          title="Episode unavailable"
          body="The provider did not return this episode. Go back to the drama page and choose an episode that is listed."
        />
      </>
    );
  }

  const titleName = detail.drama.displayTitle || detail.drama.title;
  return (
    <>
      <h1 className="sr-only">{titleName}</h1>
      <Player drama={detail.drama} episodes={detail.episodes} episode={episode} initial={stream} alsoOn={detail.alsoOn} autoStart={auto !== false} />
    </>
  );
}

function WatchPending() {
  const { uiLang } = usePrefs();
  const loadingText = ({ en: "Loading video…", id: "Memuat video…", hi: "वीडियो लोड हो रहा है…", fil: "Nilo-load ang video…", ms: "Memuatkan video…", th: "กำลังโหลดวิดีโอ…" } as const)[uiLang];
  return (
    <div className="grid h-dvh place-items-center bg-player text-player-ink">
      <div className="grid place-items-center gap-4">
        <div className="relative grid size-20 place-items-center">
          <span className="absolute inset-0 rounded-full border border-white/15" />
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#ff2d8d] border-r-[#ffc4d6]" />
          <img src="/logo.png?v=4" alt="" className="h-9 w-auto" />
        </div>
        <p className="text-sm font-medium text-white/80">{loadingText}</p>
      </div>
    </div>
  );
}
