import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import {
  AudioLines,
  ChevronLeft,
  Globe,
  Menu,
  Play,
  RotateCcw,
  Share2,
  Star,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { reportPlayback } from "@/lib/drama/api";
import { pickTitle } from "@/lib/drama/display";
import { usePrefs } from "@/lib/drama/i18n";
import { previewPathPrefix } from "@/lib/preview-path-prefix";
import { readProgress, readWatchlist, toggleWatchlist, upsertHistory, writeProgress } from "@/lib/drama/storage";
import type { DramaCard, Episode, ProviderId, StreamCandidate, StreamPayload } from "@/lib/drama/types";
import { cn } from "@/lib/utils";
import { loadAdsterraPopunder } from "@/lib/drama/monetag";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function showSubtitle(video: HTMLVideoElement, lang: string | null) {
  const tracks = video.textTracks;
  const want = lang?.toLowerCase() ?? "";
  let shown = false;
  for (let index = 0; index < tracks.length; index += 1) {
    const track = tracks[index];
    const match = Boolean(want) && !shown && (track.language.toLowerCase() === want || track.label === lang);
    track.mode = match ? "showing" : "disabled";
    if (match) shown = true;
  }
}

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
  const { t, contentLang, uiLang } = usePrefs();
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
  const [openSpeed, setOpenSpeed] = useState(false);
  const [openSubs, setOpenSubs] = useState(false);
  const [openList, setOpenList] = useState(false);
  const [rate, setRate] = useState(1);
  const [subtitleLang, setSubtitleLang] = useState<string | null>(null);
  const [rangePage, setRangePage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [pendingAdEpisodeId, setPendingAdEpisodeId] = useState<string | null>(null);
  const [adsterraReady, setAdsterraReady] = useState(false);
  const candidate = payload.candidates[index] ?? null;
  const currentIndex = episodes.findIndex((item) => item.episodeId === episode.episodeId);
  const previous = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

  useEffect(() => {
    setAutoplay(localStorage.getItem("dramaluma.autoplay") !== "0");
    const storedVolume = Number(localStorage.getItem("dramaluma.volume") ?? "1");
    if (Number.isFinite(storedVolume)) setVolume(storedVolume);
    const storedRate = Number(localStorage.getItem("dramaluma.rate") ?? "1");
    if (SPEEDS.includes(storedRate)) setRate(storedRate);
    const storedSubtitle = localStorage.getItem("dramaluma.subtitle");
    if (storedSubtitle === "off") setSubtitleLang(null);
    else if (storedSubtitle) setSubtitleLang(storedSubtitle);
    setMuted(localStorage.getItem("dramaluma.muted") === "1");
  }, []);

  useEffect(() => {
    setSaved(readWatchlist().some((item) => item.provider === drama.provider && item.seriesId === drama.seriesId));
  }, [drama.provider, drama.seriesId]);

  useEffect(() => {
    if (currentIndex >= 0) setRangePage(Math.floor(currentIndex / 30));
  }, [currentIndex]);

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
      video.playbackRate = rate;
      const saved = localStorage.getItem("dramaluma.subtitle");
      const chosen = saved === "off"
        ? null
        : saved || [...video.textTracks].find((track) => track.language.toLowerCase().startsWith(contentLang))?.language
          || video.textTracks[0]?.language
          || null;
      if (!saved && chosen) setSubtitleLang(chosen);
      showSubtitle(video, chosen);
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
    video.playbackRate = rate;
  }, [volume, muted, rate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    showSubtitle(video, subtitleLang);
  }, [subtitleLang, candidate]);

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
        tags: drama.tags.slice(0, 3),
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

  useEffect(() => {
    if (!pendingAdEpisodeId) {
      setAdsterraReady(false);
      return;
    }
    let active = true;
    void loadAdsterraPopunder().then((loaded) => {
      if (active) setAdsterraReady(loaded);
    });
    return () => { active = false; };
  }, [pendingAdEpisodeId]);

  function go(episodeId: string, auto = false) {
    // Gate the NEXT episode after each group of three completed/current episodes.
    // Do not fire Monetag here: Monetag belongs to starting a drama from the catalog.
    const isThirdEpisodeBoundary = currentIndex >= 0 && (currentIndex + 1) % 3 === 0;
    if (isThirdEpisodeBoundary) {
      setAdsterraReady(false);
      setPendingAdEpisodeId(episodeId);
      return;
    }
    void navigate({
      to: "/watch/$provider/$seriesId/$episodeId",
      params: { provider: drama.provider, seriesId: drama.seriesId, episodeId },
      search: auto ? { auto: true, lang: contentLang } : { lang: contentLang },
    });
  }

  function saveDrama() {
    const nextSaved = toggleWatchlist({
      provider: drama.provider,
      seriesId: drama.seriesId,
      title: drama.title,
      originalTitle: drama.originalTitle,
      posterUrl: drama.posterUrl,
      episodeCount: drama.episodeCount,
      savedAt: Date.now(),
    });
    setSaved(nextSaved.some((item) => item.provider === drama.provider && item.seriesId === drama.seriesId));
  }

  function pickSubtitle(lang: string | null) {
    setSubtitleLang(lang);
    localStorage.setItem("dramaluma.subtitle", lang ?? "off");
    const video = videoRef.current;
    if (video) showSubtitle(video, lang);
    setOpenSubs(false);
  }

  async function shareDrama() {
    const url = window.location.href;
    const title = pickTitle(drama, contentLang);
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* dismissed */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard blocked */
    }
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
      if (locked || openList) return;
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
  }, [contentLang, drama.provider, drama.seriesId, navigate, next, openList, previous]);

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
          if (openSpeed || openSubs) {
            setOpenSpeed(false);
            setOpenSubs(false);
            return;
          }
          void toggle();
        }}
      />
      {loading && !error ? (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-linear-to-b from-black/25 via-black/35 to-black/55">
          <div className="grid place-items-center gap-4">
            <div className="relative grid size-20 place-items-center">
              <span className="absolute inset-0 rounded-full border border-white/15" />
              <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#ff4d6d] border-r-[#ffb3c1]" />
              <img src="/logo.png?v=4" alt="" className="h-9 w-auto" />
            </div>
            <p className="text-sm font-medium text-white/85">{uiLang === "id" ? "Memuat video…" : "Loading video…"}</p>
          </div>
        </div>
      ) : null}
      {!error && !loading && !playing && !openList ? (
        <button
          type="button"
          aria-label="Play video"
          onClick={() => void toggle()}
          className="absolute left-1/2 top-1/2 z-10 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white"
        >
          <Play className="ml-1 size-8 fill-current" />
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

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-linear-to-b from-black/75 to-transparent px-1 pt-[max(0.25rem,env(safe-area-inset-top))] pb-16 text-white">
        <div className="pointer-events-auto flex items-center drop-shadow">
          <Link
            to="/drama/$provider/$seriesId"
            params={{ provider: drama.provider, seriesId: drama.seriesId }}
            aria-label={t.details}
            className="grid size-11 shrink-0 place-items-center"
          >
            <ChevronLeft className="size-7" />
          </Link>
          <p className="min-w-0 flex-1 truncate text-[17px] font-semibold">{pickTitle(drama, contentLang)}</p>
          <button
            type="button"
            aria-label={uiLang === "id" ? "Kecepatan" : "Speed"}
            onClick={() => {
              setOpenSpeed((open) => !open);
              setOpenSubs(false);
            }}
            className="h-8 shrink-0 rounded-lg bg-black/50 px-2 text-xs font-bold"
          >
            {rate.toFixed(1)}X
          </button>
          <button
            type="button"
            aria-label={uiLang === "id" ? "Subtitle" : "Subtitles"}
            onClick={() => {
              setOpenSubs((open) => !open);
              setOpenSpeed(false);
            }}
            className="grid size-10 shrink-0 place-items-center"
          >
            <Globe className={cn("size-5", subtitleLang && "text-[#ff4d6d]")} />
          </button>
          <p className="px-2 text-sm tabular-nums">
            {Math.max(currentIndex + 1, 1)}/{episodes.length || 1}
          </p>
        </div>
        {openSpeed ? (
          <div className="pointer-events-auto grid grid-cols-3 gap-2 px-3 pt-2">
            {SPEEDS.map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => {
                  setRate(speed);
                  const video = videoRef.current;
                  if (video) video.playbackRate = speed;
                  localStorage.setItem("dramaluma.rate", String(speed));
                  setOpenSpeed(false);
                }}
                className={cn("h-11 rounded-xl bg-black/55 text-sm font-semibold", rate === speed && "bg-white/30")}
              >
                {speed}X
              </button>
            ))}
          </div>
        ) : null}
        {openSubs ? (
          <div className="pointer-events-auto mx-3 mt-2 max-h-64 overflow-auto rounded-2xl bg-black/75 p-1">
            <button
              type="button"
              onClick={() => pickSubtitle(null)}
              className={cn("block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold", !subtitleLang && "text-[#ff4d6d]")}
            >
              {uiLang === "id" ? "Mati" : "Off"}
            </button>
            {(candidate?.subtitles ?? []).map((track, trackIndex) => (
              <button
                key={`${track.lang}-${track.label}-${trackIndex}`}
                type="button"
                onClick={() => pickSubtitle(track.lang || track.label)}
                className={cn(
                  "block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold",
                  subtitleLang === (track.lang || track.label) && "text-[#ff4d6d]",
                )}
              >
                {track.label || track.lang}
              </button>
            ))}
            {candidate?.subtitles.length ? null : (
              <p className="px-3 py-2 text-sm text-white/70">{uiLang === "id" ? "Subtitle tidak tersedia" : "No subtitles"}</p>
            )}
          </div>
        ) : null}
      </div>

      {!error ? (
        <div className="absolute right-2 bottom-20 z-20 flex flex-col items-center gap-4 text-white drop-shadow">
          <button type="button" aria-label={saved ? t.saved : t.save} onClick={saveDrama} className="grid size-11 place-items-center">
            <Star className={cn("size-7", saved && "fill-current text-[#ff4d6d]")} />
          </button>
          <button
            type="button"
            aria-label={muted ? "Unmute" : "Mute"}
            onClick={() => {
              const video = videoRef.current;
              const nextMuted = !muted;
              setMuted(nextMuted);
              if (video) video.muted = nextMuted;
              localStorage.setItem("dramaluma.muted", nextMuted ? "1" : "0");
            }}
            className="grid size-11 place-items-center"
          >
            {muted || volume === 0 ? <VolumeX className="size-6" /> : <Volume2 className="size-6" />}
          </button>
          <button type="button" onClick={() => void shareDrama()} className="grid place-items-center gap-1">
            <Share2 className="size-7" />
            <span className="text-[11px] font-medium">{uiLang === "id" ? "Bagikan" : "Share"}</span>
          </button>
          <button type="button" onClick={() => setOpenList(true)} className="grid place-items-center gap-1">
            <Menu className="size-7" />
            <span className="text-[11px] font-medium">{uiLang === "id" ? "Daftar" : "List"}</span>
          </button>
        </div>
      ) : null}

      <button
        type="button"
        aria-label="Seek"
        className="absolute inset-x-0 bottom-0 z-20 h-4"
        onClick={(event) => {
          const video = videoRef.current;
          if (!video || !duration) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
          video.currentTime = ratio * duration;
          setProgress(video.currentTime);
        }}
      >
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white/30">
          <span className="block h-full bg-[#ff4d6d]" style={{ width: `${duration ? Math.min(100, (progress / duration) * 100) : 0}%` }} />
        </span>
      </button>

      {openList ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={() => setOpenList(false)}>
          <div
            className="max-h-[78vh] w-full overflow-auto rounded-t-3xl bg-[#2a2a2a] px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-white"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-2">
              <h2 className="min-w-0 truncate text-lg font-semibold">{pickTitle(drama, contentLang)}</h2>
              <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-xs text-white/80">{episodes.length}</span>
              <button type="button" aria-label={t.close} onClick={() => setOpenList(false)} className="ml-auto grid size-9 place-items-center">
                <X className="size-5" />
              </button>
            </div>
            <div className="mb-3 flex gap-4 overflow-x-auto text-sm font-semibold">
              {Array.from({ length: Math.max(1, Math.ceil(episodes.length / 30)) }, (_, page) => {
                const start = page * 30 + 1;
                const end = Math.min(episodes.length, (page + 1) * 30);
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setRangePage(page)}
                    className={page === rangePage ? "text-[#ff4d6d]" : "text-white/70"}
                  >
                    {start}-{end}
                  </button>
                );
              })}
            </div>
            <EpisodeGrid
              sheet
              episodes={episodes.slice(rangePage * 30, rangePage * 30 + 30)}
              current={episode.episodeId}
              provider={drama.provider}
              seriesId={drama.seriesId}
              onPick={() => setOpenList(false)}
            />
          </div>
        </div>
      ) : null}
      {pendingAdEpisodeId ? (
        <div className="absolute inset-0 z-[100] grid place-items-center bg-black/80 p-5 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#1b1b20] p-6 text-center text-white shadow-2xl">
            <img src="/logo.png?v=4" alt="HouseDrama" className="mx-auto mb-5 h-12 w-auto" />
            <h2 className="text-2xl font-bold">Lanjutkan episode berikutnya</h2>
            <p className="mt-3 text-sm leading-6 text-white/70">Tekan tombol di bawah untuk membuka iklan sponsor di tab baru, lalu episode berikutnya akan dilanjutkan.</p>
            <button
              type="button"
              className="mt-6 w-full rounded-full bg-[#ff4d6d] px-5 py-4 font-bold text-white"
              onClick={() => {
                const target = pendingAdEpisodeId;
                if (!target) return;
                // Open Smartlink directly inside the user's click gesture so
                // browser popup blockers are less likely to suppress it.
                window.open("https://asiafilm.org/4/4a0d43260f21506b6b29c2febdc90ea2", "_blank", "noopener,noreferrer");
                setPendingAdEpisodeId(null);
                void navigate({
                  to: "/watch/$provider/$seriesId/$episodeId",
                  params: { provider: drama.provider, seriesId: drama.seriesId, episodeId: target },
                  search: { auto: true, lang: contentLang },
                });
              }}
            >
              Lanjutkan & Buka Iklan
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function EpisodeGrid({
  episodes,
  current,
  provider,
  seriesId,
  onPick,
  sheet = false,
}: {
  episodes: Episode[];
  current?: string;
  provider: ProviderId;
  seriesId: string;
  onPick?: () => void;
  sheet?: boolean;
}) {
  if (sheet) {
    return (
      <div className="grid grid-cols-5 gap-2.5">
        {episodes.map((item) => {
          const active = item.episodeId === current;
          return (
            <Link
              key={item.episodeId}
              to="/watch/$provider/$seriesId/$episodeId"
              params={{ provider, seriesId, episodeId: item.episodeId }}
              onClick={() => { onPick?.(); }}
              className={cn(
                "relative grid aspect-square place-items-center rounded-xl bg-[#3a3a3a] text-base font-medium text-white",
                active && "border-2 border-[#ff4d6d]",
              )}
            >
              {active ? <AudioLines className="size-6 text-[#ff4d6d]" /> : item.index}
            </Link>
          );
        })}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {episodes.map((item) => (
        <Link
          key={item.episodeId}
          to="/watch/$provider/$seriesId/$episodeId"
          params={{ provider, seriesId, episodeId: item.episodeId }}
          onClick={() => { onPick?.(); }}
          className={cn(
            "flex h-12 items-center justify-center rounded-xl border text-sm font-semibold",
            item.episodeId === current ? "border-primary bg-primary text-primary-ink" : "border-line bg-surface text-ink",
          )}
        >
          <span>{item.index}</span>
        </Link>
      ))}
    </div>
  );
}
