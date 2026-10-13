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
  const [adOpened, setAdOpened] = useState(false);
  const [returnedFromAd, setReturnedFromAd] = useState(false);
  const [canWatch, setCanWatch] = useState(false);

  useEffect(() => {
    setDetail(initial.detail);
    setStream(initial.stream);
    setAdOpened(false);
    setReturnedFromAd(false);
    setCanWatch(false);
  }, [initial]);

  useEffect(() => {
    if (!adOpened || canWatch) return;
    const markReturned = () => setReturnedFromAd(true);
    window.addEventListener("focus", markReturned);
    const onVisibility = () => {
      if (document.visibilityState === "visible") markReturned();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", markReturned);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [adOpened, canWatch]);

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

  if (!canWatch) {
    return (
      <main className="grid min-h-dvh place-items-center bg-player px-5 py-10 text-player-ink">
        <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center shadow-2xl sm:p-8">
          <img src="/logo.png?v=4" alt="HouseDrama" className="mx-auto mb-5 h-12 w-auto" />
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#ff8b9e]">HouseDrama</p>
          <h1 className="text-2xl font-bold text-white">Satu langkah lagi sebelum menonton</h1>
          <p className="mt-3 text-sm leading-6 text-white/70">Buka halaman sponsor terlebih dahulu. Setelah kembali ke HouseDrama, tekan tombol lanjutkan untuk membuka episode.</p>
          <button
            type="button"
            onClick={() => {
              const popup = window.open("https://uplcm.com/4/12017844", "_blank", "noopener,noreferrer");
              setAdOpened(true);
              if (!popup) setReturnedFromAd(false);
            }}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#ff4d6d] px-5 py-3 font-bold text-white transition hover:bg-[#ff6680]"
          >
            Buka Sponsor &amp; Lanjutkan
          </button>
          {adOpened ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/75">{returnedFromAd ? "Kamu sudah kembali ke HouseDrama." : "Jika sudah kembali dari tab sponsor, lanjutkan di sini."}</p>
              <button
                type="button"
                onClick={() => setCanWatch(true)}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Saya sudah kembali, lanjutkan menonton
              </button>
            </div>
          ) : null}
          <p className="mt-5 text-xs leading-5 text-white/45">Catatan: tautan sponsor tidak memberi konfirmasi apakah iklan selesai ditonton. HouseDrama hanya menyediakan langkah kembali secara manual.</p>
        </section>
      </main>
    );
  }

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
