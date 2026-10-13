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
      data: { provider: params.provider, seriesId: params.seriesId, episodeId: params.episodeId, lang: "id" },
    });
  },
  staleTime: 60_000,
  pendingMs: 600,
  pendingMinMs: 0,
  pendingComponent: WatchPending,
  head: ({ loaderData, params }) => ({
    meta: [
      {
        title: loaderData?.detail.drama
          ? `Watch ${loaderData.detail.drama.title} — HouseDrama`
          : "Watch — HouseDrama",
      },
      {
        name: "description",
        content: `Episode ${params.episodeId} from the ${params.provider} catalog.`,
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
  return (
    <div className="grid h-dvh place-items-center bg-player text-player-ink">
      <div className="grid place-items-center gap-4">
        <div className="relative grid size-20 place-items-center">
          <span className="absolute inset-0 rounded-full border border-white/15" />
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#ff4d6d] border-r-[#ffb3c1]" />
          <img src="/logo.png?v=4" alt="" className="h-9 w-auto" />
        </div>
        <p className="text-sm font-medium text-white/80">Memuat video…</p>
      </div>
    </div>
  );
}
