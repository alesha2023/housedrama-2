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

  // Count one successful play-start per drama per browser session. Do not mark
  // the view as recorded before the API succeeds: on a transient DB/network error
  // that would permanently suppress retries for the rest of the session.
  useEffect(() => {
    if (!detail.drama || !isProviderId(params.provider)) return;
    const key = `housedrama-viewed:${params.provider}:${params.seriesId}`;
    const pendingKey = `${key}:pending`;
    try {
      if (window.sessionStorage.getItem(key) || window.sessionStorage.getItem(pendingKey)) return;
      window.sessionStorage.setItem(pendingKey, "1");
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
    })
      .then((response) => {
        if (!response.ok) throw new Error("View count was not saved");
        try { window.sessionStorage.setItem(key, "1"); } catch { /* storage is optional */ }
      })
      .catch(() => undefined)
      .finally(() => {
        try { window.sessionStorage.removeItem(pendingKey); } catch { /* storage is optional */ }
      });
  }, [detail.drama, params.provider, params.seriesId]);

  useEffect(() => {
    setDetail(initial.detail);
    setStream(initial.stream);
  }, [initial]);

  if (!isProviderId(params.provider) || !detail.drama) {
    return <EmptyState title={t.cantOpen} body={detail.error || t.missingDrama} />;
  }

  // Never fabricate an "open" episode when the provider did not return it.
  // Fake episode rows make unavailable videos look playable and can mislead visitors.
  const episode = detail.episodes.find((item) => item.episodeId === params.episodeId);
  if (!episode) {
    const isEnglish = (params.provider && typeof window !== "undefined" &&
      (new URLSearchParams(window.location.search).get("lang") === "en" ||
       document.documentElement.lang.toLowerCase().startsWith("en"))) || false;
    return (
      <EmptyState
        title={isEnglish ? "Episode unavailable" : "Episode tidak tersedia"}
        body={isEnglish
          ? "The provider did not return this episode. Please return to the drama page and choose an episode that is available."
          : "Provider tidak mengembalikan episode ini. Kembali ke halaman drama dan pilih episode yang tersedia."}
      />
    );
  }

  return (
    <Player drama={detail.drama} episodes={detail.episodes} episode={episode} initial={stream} alsoOn={detail.alsoOn} autoStart={auto !== false} />
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
