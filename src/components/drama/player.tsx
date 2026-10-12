import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import {
  Captions,
  ChevronLeft,
  ChevronRight,
  Expand,
  Info,
  ListVideo,
  LoaderCircle,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { reportPlayback } from "@/lib/drama/api";
import { pickDescription, pickTitle } from "@/lib/drama/display";
import { usePrefs } from "@/lib/drama/i18n";
import { previewPathPrefix } from "@/lib/preview-path-prefix";
import { readProgress, upsertHistory, writeProgress } from "@/lib/drama/storage";
import type { DramaCard, Episode, ProviderId, StreamCandidate, StreamPayload } from "@/lib/drama/types";
import { cn } from "@/lib/utils";

function withBase(path: string) {
  if (typeof window === "undefined") return path;
  const prefix = previewPathPrefix(window.location.hostname, window.location.pathname) ?? "";
  return `${prefix}${path}`;
}

function needsProxy(url: string) {
  return /mydramawave\.com/i.test(url);
}

export function Player({
  drama,
  episodes,
  episode,
  initial,
  alsoOn,
  autoStart = false,
}: {
  drama: DramaCard;
  episodes: Episode[];
  episode: Episode;
  initial: StreamPayload;
  alsoOn: DramaCard[];
  autoStart?: boolean;
}) {
  const { t, contentLang } = usePrefs();
  const navigate = useNavigate();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reported = useRef(false);
  const ignoreClick = useRef(false);
  const [payload, setPayload] = useState(initial);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(initial.ok ? null : initial.message);
  const [loading, setLoading] = useState(initial.ok);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [openList, setOpenList] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const candidate = payload.candidates[index] ?? null;
  const currentIndex = episodes.findIndex((item) => item.episodeId === episode.episodeId);
  const previous = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    setAutoplay(localStorage.getItem("dramaluma.autoplay") !== "0");
    const storedVolume = Number(localStorage.getItem("dramaluma.volume") ?? "1");
    if (Number.isFinite(storedVolume)) setVolume(storedVolume);
    setMuted(localStorage.getItem("dramaluma.muted") === "1");
  }, []);

  useEffect(() => {
    setPayload(initial);
    setIndex(0);
    setError(initial.ok ? null : initial.message);
    setLoading(initial.ok);
    reported.current = false;
  }, [initial]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !candidate) return;
    let destroyed = false;
    let hls: { destroy: () => void } | null = null;
    // Try the direct stream first. Proxying every HLS error can add another
    // full playlist/segment request and make startup noticeably slower.
    let proxyAttempted = needsProxy(candidate.url);
    let playbackStarted = false;
    const saved = readProgress(drama.provider, drama.seriesId, episode.episodeId);
    setError(null);
    setLoading(true);
    setProgress(0);
    setDuration(null);

    const remember = () => {
      if (!autoStart && saved > 3 && (!video.duration || saved < video.duration - 4)) {
        video.currentTime = saved;
      }
    };

    const fail = (message: string) => {
      if (destroyed) return;
      setLoading(false);
      if (index + 1 < payload.candidates.length) {
        setIndex((value) => value + 1);
        return;
      }
      setError(message);
      if (!reported.current) {
        reported.current = true;
        void reportPlayback({ data: { provider: drama.provider, ok: false } });
      }
    };

    const attach = async (useProxy: boolean) => {
      const src = useProxy ? withBase(`/api/media?u=${encodeURIComponent(candidate.url)}`) : candidate.url;
      const nativeHls = video.canPlayType("application/vnd.apple.mpegurl") !== "";
      if (candidate.format === "mp4" || (candidate.format === "hls" && nativeHls && !useProxy)) {
        video.src = src;
        video.load();
        return;
      }
      const mod = await import("hls.js");
      if (destroyed) return;
      const Hls = mod.default;
      if (!Hls.isSupported()) {
        video.src = src;
        return;
      }
      const player = new Hls({
        enableWorker: true,
        capLevelToPlayerSize: true,
        // Avoid long default network waits before moving to another source.
        manifestLoadingTimeOut: 9000,
        manifestLoadingMaxRetry: 1,
        levelLoadingTimeOut: 9000,
        levelLoadingMaxRetry: 1,
        fragLoadingTimeOut: 12000,
        fragLoadingMaxRetry: 2,
        maxBufferLength: 18,
        maxMaxBufferLength: 30,
        maxBufferHole: 0.5,
        nudgeOffset: 0.1,
        nudgeMaxRetry: 3,
        backBufferLength: 20,
        startFragPrefetch: true,
      });
      hls = player;
      // Some HLS streams do not expose HTMLMediaElement.duration immediately.
      // Use the playlist's total duration as a fallback when it becomes known.
      player.on(Hls.Events.LEVEL_LOADED, (_event, data) => {
        const totalDuration = data?.details?.totalduration;
        if (typeof totalDuration === "number" && Number.isFinite(totalDuration) && totalDuration > 0) {
          setDuration(totalDuration);
        }
      });
      player.on(Hls.Events.ERROR, (_event, data) => {
        // hls.js can report a seek over a tiny gap between segments. Recover by
        // moving to the next buffered range instead of exposing the raw error.
        if (data.details === Hls.ErrorDetails.BUFFER_SEEK_OVER_HOLE) {
          const ranges = video.buffered;
          for (let i = 0; i < ranges.length; i += 1) {
            const start = ranges.start(i);
            const end = ranges.end(i);
            if (video.currentTime < start || (video.currentTime >= start && video.currentTime < end)) {
              if (video.currentTime < start || end - video.currentTime < 0.15) {
                try { video.currentTime = Math.min(end - 0.05, start + 0.05); } catch { /* wait for next segment */ }
              }
              break;
            }
          }
          if (!data.fatal) return;
        }
        if (!data.fatal) return;
        player.destroy();
        hls = null;
        if (!proxyAttempted && !useProxy && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          proxyAttempted = true;
          void attach(true);
          return;
        }
        const friendly = data.type === Hls.ErrorTypes.NETWORK_ERROR
          ? "Koneksi video terputus. Coba lagi atau pilih sumber video lain."
          : data.type === Hls.ErrorTypes.MEDIA_ERROR
            ? "Format atau segmen video bermasalah. Mencoba pemulihan pemutar…"
            : "Video dari sumber ini gagal diputar. Coba lagi atau pilih sumber lain.";
        fail(friendly);
      });
      player.loadSource(src);
      player.attachMedia(video);
    };

    const syncDuration = () => {
      const value = video.duration;
      // Infinity/NaN are common while a live/fragmented HLS playlist is loading.
      // Never present those values as a real 0:00 duration.
      if (Number.isFinite(value) && value > 0) setDuration(value);
    };
    const onLoaded = () => {
      syncDuration();
      remember();
      setLoading(false);
    };
    const onPlaying = () => {
      playbackStarted = true;
      setPlaying(true);
      setLoading(false);
      if (!reported.current) {
        reported.current = true;
        void reportPlayback({ data: { provider: drama.provider, ok: true } });
      }
    };
    const onError = () => {
      // Only use the proxy once, and only before playback begins. Reattaching
      // the same failed source repeatedly creates a slow error loop on mobile.
      if (candidate.format === "hls" && !proxyAttempted && !playbackStarted) {
        proxyAttempted = true;
        void attach(true);
        return;
      }
      fail("Sumber video gagal dimuat. Coba sumber lain atau tekan coba lagi.");
    };
    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("durationchange", syncDuration);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("error", onError);
    for (const track of candidate.subtitles.slice(0, 8)) {
      const element = document.createElement("track");
      element.kind = "subtitles";
      element.label = track.label;
      element.srclang = track.lang.slice(0, 16);
      element.src = withBase(`/api/media?u=${encodeURIComponent(track.url)}`);
      video.appendChild(element);
    }
    void attach(candidate.format === "hls" && needsProxy(candidate.url));

    return () => {
      destroyed = true;
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("durationchange", syncDuration);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("error", onError);
      hls?.destroy();
      video.removeAttribute("src");
      video.querySelectorAll("track").forEach((track) => track.remove());
      video.load();
    };
  }, [candidate, drama.provider, drama.seriesId, episode.episodeId, index, payload.candidates.length]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = muted;
  }, [volume, muted]);

  useEffect(() => {
    if (!autoStart) return;
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    let started = false;
    const tryPlay = async () => {
      if (cancelled || started || video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return;
      started = true;
      // A new episode must never inherit the previous episode's seek position.
      try { video.currentTime = 0; } catch { /* metadata may still be settling */ }
      try {
        await video.play();
      } catch {
        if (cancelled) return;
        // Mobile browsers often block unmuted autoplay. Retry muted once.
        try {
          video.muted = true;
          setMuted(true);
          localStorage.setItem("dramaluma.muted", "1");
          await video.play();
        } catch {
          started = false;
          setPlaying(false);
          // The centered Play button remains available if autoplay is blocked.
        }
      }
    };
    video.addEventListener("canplay", tryPlay);
    video.addEventListener("loadeddata", tryPlay);
    // Handle the race where canplay fired before this effect attached listeners.
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) void tryPlay();
    return () => {
      cancelled = true;
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("loadeddata", tryPlay);
    };
  }, [autoStart, candidate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let last = 0;
    const onTime = () => {
      setProgress(video.currentTime || 0);
      if (video.currentTime - last < 2) return;
      last = video.currentTime;
      writeProgress(drama.provider, drama.seriesId, episode.episodeId, video.currentTime);
      upsertHistory({
        provider: drama.provider,
        seriesId: drama.seriesId,
        episodeId: episode.episodeId,
        episodeLabel: episode.displayTitle || episode.title,
        title: drama.displayTitle || drama.title,
        originalTitle: drama.originalTitle || drama.title,
        posterUrl: drama.posterUrl,
        positionSec: video.currentTime,
        durationSec: Number.isFinite(video.duration) && video.duration > 0 ? video.duration : null,
        updatedAt: Date.now(),
      });
    };
    const onEnded = () => {
      setPlaying(false);
      if (autoplay && next) go(next.episodeId, true);
    };
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", onEnded);
    };
  }, [autoplay, drama, episode, next]);

  function go(episodeId: string, auto = false) {
    void navigate({
      to: "/watch/$provider/$seriesId/$episodeId",
      params: { provider: drama.provider, seriesId: drama.seriesId, episodeId },
      search: auto ? { auto: true, lang: contentLang } : { lang: contentLang },
    });
  }

  useEffect(() => {
    if (!next) return;
    void router.preloadRoute({
      to: "/watch/$provider/$seriesId/$episodeId",
      params: { provider: drama.provider, seriesId: drama.seriesId, episodeId: next.episodeId },
      search: { lang: contentLang },
    });
  }, [contentLang, drama.provider, drama.seriesId, next, router]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let locked = false;
    let tracking = false;
    let startX = 0;
    let startY = 0;

    const jump = (direction: 1 | -1) => {
      if (locked || openList || openInfo) return;
      const target = direction > 0 ? next : previous;
      if (!target) return;
      locked = true;
      ignoreClick.current = true;
      go(target.episodeId, true);
      window.setTimeout(() => {
        locked = false;
      }, 700);
    };

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 24 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      jump(event.deltaY > 0 ? 1 : -1);
    };

    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const target = event.target;
      if (target instanceof Element && target.closest("button, a, input, label")) return;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      tracking = true;
    };

    const onMove = (event: TouchEvent) => {
      if (!tracking || event.touches.length !== 1) return;
      const dy = startY - event.touches[0].clientY;
      if (Math.abs(dy) > 16) event.preventDefault();
    };

    const onEnd = (event: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const touch = event.changedTouches[0];
      if (!touch) return;
      const dy = startY - touch.clientY;
      const dx = startX - touch.clientX;
      if (Math.abs(dy) < 56 || Math.abs(dy) < Math.abs(dx)) return;
      jump(dy > 0 ? 1 : -1);
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("touchstart", onStart, { passive: true });
    stage.addEventListener("touchmove", onMove, { passive: false });
    stage.addEventListener("touchend", onEnd);
    return () => {
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("touchstart", onStart);
      stage.removeEventListener("touchmove", onMove);
      stage.removeEventListener("touchend", onEnd);
    };
  }, [contentLang, drama.provider, drama.seriesId, navigate, next, openInfo, openList, previous]);

  async function playContent() {
    const video = videoRef.current;
    if (!video) return;
    try {
      await video.play();
      setPlaying(true);
    } catch {
      video.muted = true;
      setMuted(true);
      try { await video.play(); setPlaying(true); }
      catch { setError("Tekan Play untuk memulai video."); }
    }
  }

  async function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) {
      video.pause();
      setPlaying(false);
      return;
    }
    await playContent();
  }

  async function retry() {
    setRetrying(true);
    setError(null);
    setIndex(0);
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    const { getStreamData } = await import("@/lib/drama/api");
    const fresh = await getStreamData({
      data: { provider: drama.provider, seriesId: drama.seriesId, episodeId: episode.episodeId, lang: contentLang },
    });
    setPayload(fresh);
    setError(fresh.ok ? null : fresh.message);
    setRetrying(false);
  }

  const mins = (value: number | null) => {
    if (value === null || !Number.isFinite(value) || value < 0) return "--:--";
    const total = Math.floor(value);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
  };


  return (
    <div ref={stageRef} className="relative h-dvh w-full overflow-hidden bg-player text-player-ink">
      <video
        ref={videoRef}
        preload="auto"
        className="absolute inset-0 h-full w-full bg-player object-cover"
        playsInline
        poster={episode.coverUrl || drama.posterUrl || undefined}
        onClick={() => {
          if (ignoreClick.current) {
            ignoreClick.current = false;
            return;
          }
          void toggle();
        }}
      />
      {loading && !error ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-player/40">
          <LoaderCircle className="size-10 animate-spin" />
        </div>
      ) : null}
      {!error && !loading ? (
        <button
          type="button"
          aria-label={playing ? "Pause video" : "Play video"}
          onClick={() => void toggle()}
          className={cn(
            "absolute left-1/2 top-1/2 z-10 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm transition-opacity",
            playing ? "opacity-70 hover:opacity-100 focus:opacity-100" : "opacity-100",
          )}
        >
          {playing ? <Pause className="size-8 fill-current" /> : <Play className="ml-1 size-8 fill-current" />}
        </button>
      ) : null}
      {error ? (
        <div className="absolute inset-0 z-20 grid content-center gap-3 bg-player/90 px-6 text-center">
          <p className="text-sm">{error}</p>
          <button type="button" onClick={() => void retry()} className="mx-auto inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 font-semibold text-primary-ink">
            <RotateCcw className="size-4" />
            {retrying ? t.retrying : t.retry}
          </button>
          {alsoOn[0] ? (
            <Link
              to="/drama/$provider/$seriesId"
              params={{ provider: alsoOn[0].provider, seriesId: alsoOn[0].seriesId }}
              className="text-sm font-semibold text-primary"
            >
              Try {alsoOn[0].provider}
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-linear-to-b from-player via-player/55 to-transparent px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-10">
        <div className="pointer-events-auto flex items-center gap-1">
          <Link
            to="/drama/$provider/$seriesId"
            params={{ provider: drama.provider, seriesId: drama.seriesId }}
            aria-label={t.details}
            className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-player-ink/10"
          >
            <ChevronLeft className="size-6" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{pickTitle(drama, contentLang)}</p>
            <p className="truncate text-xs text-player-ink/75">
              {pickTitle(episode, contentLang)}
              {candidate?.quality ? ` · ${candidate.quality}` : ""}
            </p>
          </div>
          <IconButton label={t.details} onClick={() => setOpenInfo(true)}>
            <Info className="size-5" />
          </IconButton>
        </div>
      </div>

      {previous ? (
        <button
          type="button"
          aria-label={t.prev}
          onClick={() => go(previous.episodeId)}
          className="absolute top-1/2 left-2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-player/50 hover:bg-player/80"
        >
          <ChevronLeft className="size-6" />
        </button>
      ) : null}
      {next ? (
        <button
          type="button"
          aria-label={t.next}
          onClick={() => go(next.episodeId)}
          className="absolute top-1/2 right-2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-player/50 hover:bg-player/80"
        >
          <ChevronRight className="size-6" />
        </button>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-player via-player/75 to-transparent p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <input
          aria-label="Seek"
          className="h-1 w-full accent-primary"
          type="range"
          min={0}
          max={duration ?? 0}
          step={0.1}
          value={duration === null ? 0 : Math.min(progress, duration)}
          onChange={(event) => {
            const video = videoRef.current;
            if (!video) return;
            video.currentTime = Number(event.target.value);
            setProgress(video.currentTime);
          }}
        />
        <div className="mt-2 flex items-center gap-1">
          <IconButton label={playing ? "Pause" : "Play"} onClick={() => void toggle()}>
            {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
          </IconButton>
          <IconButton
            label={muted ? "Unmute" : "Mute"}
            onClick={() => {
              const video = videoRef.current;
              const nextMuted = !muted;
              setMuted(nextMuted);
              if (video) video.muted = nextMuted;
              localStorage.setItem("dramaluma.muted", nextMuted ? "1" : "0");
            }}
          >
            {muted || volume === 0 ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </IconButton>
          <input
            aria-label="Volume"
            className="hidden h-1 w-16 accent-primary sm:block"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(event) => {
              const nextVolume = Number(event.target.value);
              setVolume(nextVolume);
              setMuted(nextVolume === 0);
              const video = videoRef.current;
              if (video) {
                video.volume = nextVolume;
                video.muted = nextVolume === 0;
              }
              localStorage.setItem("dramaluma.volume", String(nextVolume));
            }}
          />
          <span className="ml-1 text-xs tabular-nums">
            {mins(progress)} / {mins(duration)}
          </span>
          <span className="ml-auto" />
          <label className="mr-1 hidden items-center gap-2 text-xs font-medium sm:inline-flex">
            <input
              type="checkbox"
              checked={autoplay}
              onChange={(event) => {
                setAutoplay(event.target.checked);
                localStorage.setItem("dramaluma.autoplay", event.target.checked ? "1" : "0");
              }}
            />
            {t.autoplay}
          </label>
          {candidate?.subtitles.length ? <Captions className="size-4 opacity-80" aria-label="Subtitles available" /> : null}
          <IconButton label="Episodes" onClick={() => setOpenList(true)}>
            <ListVideo className="size-5" />
          </IconButton>
          <IconButton
            label="Fullscreen"
            onClick={() => {
              const stage = stageRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
              const video = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
              if (document.fullscreenElement) {
                void document.exitFullscreen();
                return;
              }
              if (stage?.requestFullscreen) {
                void stage.requestFullscreen().catch(() => {
                  if (stage.webkitRequestFullscreen) stage.webkitRequestFullscreen();
                  else video?.webkitEnterFullscreen?.();
                });
              } else if (stage?.webkitRequestFullscreen) stage.webkitRequestFullscreen();
              else video?.webkitEnterFullscreen?.();
            }}
          >
            {fullscreen ? <Minimize2 className="size-5" /> : <Expand className="size-5" />}
          </IconButton>
        </div>
      </div>

      {openInfo ? (
        <div className="fixed inset-0 z-50 grid items-end bg-ink/40 sm:items-center sm:justify-center" onClick={() => setOpenInfo(false)}>
          <div className="max-h-[80vh] w-full overflow-auto rounded-t-card bg-bg p-4 text-ink sm:max-w-lg sm:rounded-card" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-2xl">{pickTitle(drama, contentLang)}</h2>
              <button type="button" className="h-11 shrink-0 px-3 font-semibold" onClick={() => setOpenInfo(false)}>
                {t.close}
              </button>
            </div>
            <p className="text-sm text-muted">
              {pickTitle(episode, contentLang)}
              {episode.access === "limited" ? ` · ${t.episodeLimited}` : ""}
            </p>
            <p className="mt-3 text-sm text-muted">{pickDescription(drama, contentLang) || t.noSynopsis}</p>
            <Link
              to="/drama/$provider/$seriesId"
              params={{ provider: drama.provider, seriesId: drama.seriesId }}
              className="mt-4 inline-flex h-11 items-center font-semibold text-primary"
            >
              {t.details}
            </Link>
          </div>
        </div>
      ) : null}

      {openList ? (
        <div className="fixed inset-0 z-50 grid items-end bg-ink/40 sm:items-center sm:justify-center" onClick={() => setOpenList(false)}>
          <div className="max-h-[80vh] w-full overflow-auto rounded-t-card bg-bg p-4 text-ink sm:max-w-lg sm:rounded-card" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-2xl">{t.episodes}</h2>
              <label className="inline-flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={autoplay}
                  onChange={(event) => {
                    setAutoplay(event.target.checked);
                    localStorage.setItem("dramaluma.autoplay", event.target.checked ? "1" : "0");
                  }}
                />
                {t.autoplay}
              </label>
              <button type="button" className="h-11 px-3 font-semibold" onClick={() => setOpenList(false)}>
                {t.close}
              </button>
            </div>
            <EpisodeGrid
              episodes={episodes}
              current={episode.episodeId}
              provider={drama.provider}
              seriesId={drama.seriesId}
              onPick={() => setOpenList(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="grid size-11 place-items-center rounded-full hover:bg-player-ink/10">
      {children}
    </button>
  );
}

export function EpisodeGrid({
  episodes,
  current,
  provider,
  seriesId,
  onPick,
}: {
  episodes: Episode[];
  current?: string;
  provider: ProviderId;
  seriesId: string;
  onPick?: () => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {episodes.map((item) => (
        <Link
          key={item.episodeId}
          to="/watch/$provider/$seriesId/$episodeId"
          params={{ provider, seriesId, episodeId: item.episodeId }}
          onClick={onPick}
          className={cn(
            "flex h-12 items-center justify-center rounded-xl border text-sm font-semibold",
            item.episodeId === current ? "border-primary bg-primary text-primary-ink" : "border-line bg-surface text-ink",
          )}
        >
          <span>
            {item.index}
            {item.access === "limited" ? <span className="ml-1 text-[10px] font-medium opacity-80">·</span> : null}
          </span>
        </Link>
      ))}
    </div>
  );
}
