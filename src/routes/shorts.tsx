import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Play, Share2, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getDetailData, getShortsData, getStreamData } from "@/lib/drama/api";
import { pickTitle } from "@/lib/drama/display";
import { usePrefs } from "@/lib/drama/i18n";
import { providerLabel } from "@/lib/drama/providers";
import { previewPathPrefix } from "@/lib/preview-path-prefix";
import { readWatchlist, toggleWatchlist } from "@/lib/drama/storage";
import type { DramaCard, StreamCandidate } from "@/lib/drama/types";
import { maybeOpenMonetagAd } from "@/lib/drama/monetag";

export const Route = createFileRoute("/shorts")({
  loader: () => getShortsData({ data: { lang: "id", page: 1 } }),
  head: () => ({
    meta: [
      { title: "Shorts — HouseDrama" },
      { name: "description", content: "A vertical autoplay feed of short dramas from every available provider." },
    ],
  }),
  component: ShortsPage,
});

function ShortsPage() {
  const initial = Route.useLoaderData();
  const { t, contentLang } = usePrefs();
  const scroller = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState(initial.items);
  const [page, setPage] = useState(initial.page);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(false);
  const loadingMore = useRef(false);

  async function more() {
    if (!hasMore || loadingMore.current) return;
    loadingMore.current = true;
    setLoading(true);
    const next = await getShortsData({ data: { lang: "id", page: page + 1 } });
    setItems((current) => {
      const seen = new Set(current.map((item) => `${item.provider}-${item.seriesId}`));
      return [...current, ...next.items.filter((item) => !seen.has(`${item.provider}-${item.seriesId}`))];
    });
    setPage(next.page);
    setHasMore(next.hasMore);
    setLoading(false);
    loadingMore.current = false;
  }

  function onScroll() {
    const el = scroller.current;
    if (!el || el.clientHeight < 1) return;
    const index = Math.round(el.scrollTop / el.clientHeight);
    setActive(index);
    if (index >= items.length - 3) void more();
  }

  function advance() {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollTop + el.clientHeight, behavior: "smooth" });
  }

  if (!items.length) {
    return (
      <div className="grid h-full place-items-center px-6 text-center text-white">
        <p>{t.shortsEmpty}</p>
      </div>
    );
  }

  return (
    <div ref={scroller} onScroll={onScroll} className="h-full snap-y snap-mandatory overflow-y-auto bg-black">
      {items.map((item, index) => (
        <ShortClip
          key={`${item.provider}-${item.seriesId}`}
          item={item}
          active={index === active}
          muted={muted}
          title={pickTitle(item, contentLang)}
          onToggleMute={() => setMuted((value) => !value)}
          onEnded={advance}
        />
      ))}
      {loading ? <p className="grid h-16 place-items-center bg-black text-sm text-white/70">{t.loading}</p> : null}
    </div>
  );
}

function ShortClip({
  item,
  active,
  muted,
  title,
  onToggleMute,
  onEnded,
}: {
  item: DramaCard;
  active: boolean;
  muted: boolean;
  title: string;
  onToggleMute: () => void;
  onEnded: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [candidate, setCandidate] = useState<StreamCandidate | null>(null);
  const [episodeId, setEpisodeId] = useState(item.firstEpisodeId);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readWatchlist().some((entry) => entry.provider === item.provider && entry.seriesId === item.seriesId));
  }, [item.provider, item.seriesId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
  }, [muted]);

  useEffect(() => {
    if (!active) {
      videoRef.current?.pause();
      return;
    }
    let cancel = false;
    setFailed(false);
    void (async () => {
      let nextEpisode = episodeId;
      if (!nextEpisode) {
        const detail = await getDetailData({ data: { provider: item.provider, seriesId: item.seriesId, lang: "id" } });
        nextEpisode = detail.episodes[0]?.episodeId ?? detail.drama?.firstEpisodeId ?? null;
        if (nextEpisode) setEpisodeId(nextEpisode);
      }
      if (!nextEpisode || cancel) {
        if (!cancel && !nextEpisode) setFailed(true);
        return;
      }
      const stream = await getStreamData({
        data: { provider: item.provider, seriesId: item.seriesId, episodeId: nextEpisode, lang: "id" },
      });
      if (cancel) return;
      const next = stream.candidates[0] ?? null;
      setCandidate(next);
      if (!next) setFailed(true);
    })().catch(() => {
      if (!cancel) setFailed(true);
    });
    return () => {
      cancel = true;
    };
  }, [active, episodeId, item.provider, item.seriesId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !active || !candidate) return;
    let hls: { destroy: () => void } | null = null;
    let gone = false;
    const src = /mydramawave\.com/i.test(candidate.url) ? mediaUrl(candidate.url) : candidate.url;

    const play = async () => {
      try {
        await video.play();
      } catch {
        video.muted = true;
        try {
          await video.play();
        } catch {
          /* the play button stays available */
        }
      }
    };

    void (async () => {
      if (candidate.format === "hls" && !video.canPlayType("application/vnd.apple.mpegurl")) {
        const mod = await import("hls.js");
        if (gone) return;
        const Hls = mod.default;
        if (!Hls.isSupported()) {
          video.src = src;
          void play();
          return;
        }
        const player = new Hls({ enableWorker: true, maxBufferLength: 12 });
        hls = player;
        player.loadSource(src);
        player.attachMedia(video);
        player.on(Hls.Events.MANIFEST_PARSED, () => void play());
      } else {
        video.src = src;
        void play();
      }
    })();

    return () => {
      gone = true;
      hls?.destroy();
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [active, candidate]);

  return (
    <section className="relative h-full snap-start bg-black">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        poster={item.posterUrl || undefined}
        playsInline
        loop={false}
        muted={muted}
        onEnded={onEnded}
        onTimeUpdate={(event) => {
          const video = event.currentTarget;
          if (video.duration > 0) setProgress(video.currentTime / video.duration);
        }}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onClick={() => {
          const video = videoRef.current;
          if (!video) return;
          if (video.paused) void video.play();
          else video.pause();
        }}
      />
      {(!active || !candidate) && item.posterUrl ? (
        <img src={item.posterUrl} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
      ) : null}
      {paused && active ? (
        <span className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="grid size-16 place-items-center rounded-full bg-black/45 text-white">
            <Play className="ml-1 size-8 fill-current" />
          </span>
        </span>
      ) : null}
      <div className="absolute inset-x-0 bottom-[4.7rem] z-10 bg-linear-to-t from-black/75 via-black/25 to-transparent px-4 pt-16 pb-3 pr-20 text-white lg:bottom-0">
        <p className="text-sm font-semibold">@{providerLabel(item.provider)}</p>
        <h2 className="mt-1 text-base font-semibold leading-snug">{title}</h2>
        {item.description ? <p className="mt-1 line-clamp-2 text-sm text-white/85">{item.description}</p> : null}
        {failed ? <p className="mt-2 text-sm text-white/80">Video pratinjau tidak tersedia dari provider ini. Buka episode lengkap untuk mencoba pemutar utama, atau geser ke atas untuk video berikutnya.</p> : null}
      </div>
      <div className="absolute right-3 bottom-[6.2rem] z-10 flex flex-col items-center gap-4 text-white lg:bottom-8">
        {item.posterUrl ? (
          <Link
            to="/drama/$provider/$seriesId"
            params={{ provider: item.provider, seriesId: item.seriesId }}
            className="size-12 overflow-hidden rounded-full border-2 border-white"
          >
            <img src={item.posterUrl} alt="" className="h-full w-full object-cover" />
          </Link>
        ) : null}
        <button
          type="button"
          className="grid place-items-center gap-1 text-xs font-semibold"
          onClick={() => {
            const next = toggleWatchlist({
              provider: item.provider,
              seriesId: item.seriesId,
              title: item.title,
              originalTitle: item.originalTitle,
              posterUrl: item.posterUrl,
              episodeCount: item.episodeCount,
              savedAt: Date.now(),
            });
            setSaved(next.some((entry) => entry.provider === item.provider && entry.seriesId === item.seriesId));
          }}
        >
          <Heart className={saved ? "size-8 fill-current text-[#ff2d55]" : "size-8"} />
          <span>{saved ? "Disimpan" : "Suka"}</span>
        </button>
        {episodeId ? (
          <Link
            to="/watch/$provider/$seriesId/$episodeId"
            params={{ provider: item.provider, seriesId: item.seriesId, episodeId }}
            onClick={() => maybeOpenMonetagAd()}
            search={{ auto: true }}
            className="grid place-items-center gap-1 text-xs font-semibold"
          >
            <Play className="size-8" />
            <span>Episode Lengkap</span>
          </Link>
        ) : null}
        <button
          type="button"
          className="grid place-items-center gap-1 text-xs font-semibold"
          onClick={() => {
            const prefix = previewPathPrefix(window.location.hostname, window.location.pathname) ?? "";
            const url = `${window.location.origin}${prefix}/drama/${item.provider}/${item.seriesId}`;
            if (navigator.share) void navigator.share({ title, url }).catch(() => undefined);
            else void navigator.clipboard?.writeText(url);
          }}
        >
          <Share2 className="size-7" />
          <span>Bagikan</span>
        </button>
      </div>
      <div className="absolute inset-x-0 bottom-[4.5rem] z-10 h-0.5 bg-white/25 lg:bottom-0">
        <span className="block h-full bg-white" style={{ width: `${Math.min(100, progress * 100)}%` }} />
      </div>
      <button
        type="button"
        onClick={onToggleMute}
        className="absolute top-4 right-4 z-10 grid size-10 place-items-center rounded-full bg-black/40 text-white"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
      </button>
    </section>
  );
}

function mediaUrl(url: string) {
  const prefix = typeof window === "undefined" ? "" : (previewPathPrefix(window.location.hostname, window.location.pathname) ?? "");
  return `${prefix}/api/media?u=${encodeURIComponent(url)}`;
}
