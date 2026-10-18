import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/drama/cards";
import { Player } from "@/components/drama/player";
import { getWatchData } from "@/lib/drama/api";
import { usePrefs } from "@/lib/drama/i18n";
import { isProviderId, type Episode } from "@/lib/drama/types";

export const Route = createFileRoute("/watch/$provider/$seriesId/$episodeId")({
  validateSearch: (search: Record<string, unknown>): { auto?: boolean; lang?: string } => ({
    ...(search.auto === 1 || search.auto === "1" || search.auto === true ? { auto: true } : {}),
    ...(typeof search.lang === "string" ? { lang: search.lang } : {}),
  }),
  loader: async ({ params }) => {
    if (!isProviderId(params.provider)) throw new Error("Unknown provider");
    return getWatchData({
      data: { provider: params.provider, seriesId: params.seriesId, episodeId: params.episodeId, lang: "en" },
    });
  },
  staleTime: 60_000,
  pendingMs: 0,
  pendingMinMs: 300,
  pendingComponent: WatchPending,
  head: ({ loaderData, params }) => ({
    meta: [
      {
        title: loaderData?.detail.drama
          ? `Tonton ${loaderData.detail.drama.displayTitle || loaderData.detail.drama.title} — HouseDrama`
          : "Tonton Drama — HouseDrama",
      },
      { name: "robots", content: "noindex,follow" },
      {
        name: "description",
        content: `Tonton episode ${params.episodeId} di HouseDrama. Buka halaman detail drama untuk melihat informasi dan daftar episode.`,
      },
    ],
  }),
  component: WatchPage,
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
    return <EmptyState title={t.cantOpen} body={detail.error || t.missingDrama} />;
  }

  const episode: Episode =
    detail.episodes.find((item) => item.episodeId === params.episodeId) ?? {
      episodeId: params.episodeId,
      index: Number(params.episodeId) || 1,
      title: `Episode ${params.episodeId}`,
      coverUrl: detail.drama.posterUrl,
      durationSec: null,
      access: "open",
    };

  return (
    <Player drama={detail.drama} episodes={detail.episodes.length ? detail.episodes : [episode]} episode={episode} initial={stream} alsoOn={detail.alsoOn} autoStart={auto !== false} />
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
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#ff4d6d] border-r-[#ffb3c1]" />
          <img src="/logo.png?v=4" alt="" className="h-9 w-auto" />
        </div>
        <p className="text-sm font-medium text-white/80">{loadingText}</p>
      </div>
    </div>
  );
}
