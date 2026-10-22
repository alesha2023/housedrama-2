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
  Maximize,
  Minimize,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { reportPlayback } from "@/lib/drama/api";
import { pickTitle } from "@/lib/drama/display";
import { usePrefs } from "@/lib/drama/i18n";
import { previewPathPrefix } from "@/lib/preview-path-prefix";
import { openMonetagAd } from "@/lib/drama/monetag";
import { readProgress, readWatchlist, toggleWatchlist, upsertHistory, writeProgress } from "@/lib/drama/storage";
import type { DramaCard, Episode, ProviderId, StreamCandidate, StreamPayload } from "@/lib/drama/types";
import { cn } from "@/lib/utils";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const SPONSOR_SMARTLINKS = [
  "https://auctionr.org/4/e02ff50611e53dfb3b95d9b7fe94759f",
  "https://asiafilm.org/4/3b9a06b621155c33e54e072a498d0691",
  "https://asiafilm.org/4/4a0d43260f21506b6b29c2febdc90ea2",
  "https://uplcm.com/4/12057622",
  "https://uplcm.com/4/12057617",
  "https://uplcm.com/4/12057615",
  "https://uplcm.com/4/12017844",
  "https://auctionr.org/4/97ee6d6eed24baa0974e41f4f1567470",
];

function formatPlaybackTime(seconds: number | null | undefined) {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds < 0) return "00:00";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function cuePlainText(cue: TextTrackCue) {
  const raw = "text" in cue ? String((cue as VTTCue).text) : "";
  return raw.replace(/<[^>]*>/g, "").replace(/\u00a0/g, " ").trim();
}

function showSubtitle(video: HTMLVideoElement, lang: string | null) {
  const tracks = video.textTracks;
  const want = lang?.toLowerCase() ?? "";
  let shown = false;
  for (let index = 0; index < tracks.length; index += 1) {
    const track = tracks[index];
    const match = Boolean(want) && !shown && (track.language.toLowerCase() === want || track.label === lang);
    // "hidden" keeps cues available for the small overlay and stops the browser
    // from painting its own oversized captions.
    track.mode = match ? "hidden" : "disabled";
    if (match) shown = true;
  }
}

function readCaption(video: HTMLVideoElement) {
  const lines: string[] = [];
  const tracks = video.textTracks;
  for (let index = 0; index < tracks.length; index += 1) {
    const track = tracks[index];
    if (track.mode === "showing") track.mode = "hidden";
    if (track.mode !== "hidden" || !track.activeCues) continue;
    for (let cueIndex = 0; cueIndex < track.activeCues.length; cueIndex += 1) {
      const line = cuePlainText(track.activeCues[cueIndex]);
      if (line) lines.push(line);
    }
  }
  return lines.join("\n");
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
  const playAfterSponsor = useRef(false);
  const ignoreClick = useRef(false);
  const seekingRef = useRef(false);
  const [payload, setPayload] = useState(initial);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(initial.ok ? null : initial.message);
  const [loading, setLoading] = useState(initial.ok);
  const [playing, setPlaying] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [openSpeed, setOpenSpeed] = useState(false);
  const [openSubs, setOpenSubs] = useState(false);
  const [openList, setOpenList] = useState(false);
  // Episode 1 gets its own sponsor popup before playback. Keep the initial
  // state identical on server/client to avoid a hydration mismatch.
  const [pendingAdEpisode, setPendingAdEpisode] = useState<string | null>(null);
  const [firstEpisodePopupReady, setFirstEpisodePopupReady] = useState(false);
  const [sponsorOpened, setSponsorOpened] = useState(false);
  const [sponsorWait, setSponsorWait] = useState(0);
  const [sponsorClosing, setSponsorClosing] = useState(false);
  const [sponsorProvider, setSponsorProvider] = useState<"monetag" | "adsterra" | null>(null);
  const lastSponsorIndex = useRef<number>(-1);
  const [rate, setRate] = useState(1);
  const [subtitleLang, setSubtitleLang] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [rangePage, setRangePage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const candidate = payload.candidates[index] ?? null;
  const currentIndex = episodes.findIndex((item) => item.episodeId === episode.episodeId);
  const isFirstEpisodeSponsor = pendingAdEpisode !== null && pendingAdEpisode === episodes[0]?.episodeId;
  const previous = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

  useEffect(() => {
    // Episode 1 is always ad-free. Sponsor popup starts from Episode 2,
    // including direct links and automatic/manual episode transitions.
    // A one-time sessionStorage bypass is consumed when returning from a
    // popup that was already completed for the selected episode.
    const isEpisodeOne = episode.episodeId === episodes[0]?.episodeId;
    const bypassKey = `housedrama-sponsor-bypass:${drama.provider}:${drama.seriesId}:${episode.episodeId}`;
    try {
      if (isEpisodeOne || window.sessionStorage.getItem(bypassKey) === "1") {
        if (!isEpisodeOne) window.sessionStorage.removeItem(bypassKey);
        setPendingAdEpisode(null);
      } else {
        setPendingAdEpisode(episode.episodeId);
      }
    } catch {
      setPendingAdEpisode(isEpisodeOne ? null : episode.episodeId);
    }
    setSponsorOpened(false);
    setSponsorWait(0);
    setSponsorClosing(false);
    setSponsorProvider(null);
    setFirstEpisodePopupReady(true);
  }, [drama.provider, drama.seriesId, episode.episodeId, episodes]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onFullscreen = () => setIsFullscreen(document.fullscreenElement === stage);
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => document.removeEventListener("fullscreenchange", onFullscreen);
  }, []);

  useEffect(() => {
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    if (!playing || openList || openSpeed || openSubs || error || loading) {
      setControlsVisible(true);
      return;
    }
    // Start a fresh 10-second countdown when playback begins or a menu closes.
    controlsTimer.current = setTimeout(() => setControlsVisible(false), 10_000);
    return () => { if (controlsTimer.current) clearTimeout(controlsTimer.current); };
  }, [playing, openList, openSpeed, openSubs, error, loading]);

  const revealControls = () => {
    setControlsVisible(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    if (playing && !openList && !openSpeed && !openSubs && !error && !loading) {
      controlsTimer.current = setTimeout(() => setControlsVisible(false), 10_000);
    }
  };

  useEffect(() => {
    if (!sponsorOpened || sponsorWait <= 0) return;
    const timer = window.setTimeout(() => setSponsorWait((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [sponsorOpened, sponsorWait]);

  useEffect(() => {
    if (!sponsorOpened || sponsorWait !== 0 || sponsorClosing || !pendingAdEpisode) return;
    // Let the modal animate out, then continue automatically to the selected episode.
    setSponsorClosing(true);
    const timer = window.setTimeout(() => continuePendingEpisode(), 350);
    return () => window.clearTimeout(timer);
  }, [sponsorOpened, sponsorWait, sponsorClosing, pendingAdEpisode]);

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
    // Do not start stream loading underneath the sponsor popup.
    setLoading(false);
    reported.current = false;
  }, [initial]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Sponsor-first: keep the media element idle until the visitor completes
    // the popup flow. This avoids loading/spinning before the first click.
    if (!firstEpisodePopupReady || pendingAdEpisode) {
      video.pause();
      video.removeAttribute("src");
      video.querySelectorAll("track").forEach((track) => track.remove());
      video.load();
      setLoading(false);
      setPlaying(false);
      return;
    }
    if (!candidate) return;
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
      // Restore this episode's own saved position even when autoplay is enabled.
      // If there is no valid saved position, start the newly selected episode at 0.
      if (saved > 3 && (!video.duration || saved < video.duration - 4)) {
        try { video.currentTime = saved; } catch { /* wait for metadata */ }
      } else {
        try { video.currentTime = 0; } catch { /* wait for metadata */ }
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
  }, [candidate, drama.provider, drama.seriesId, episode.episodeId, firstEpisodePopupReady, pendingAdEpisode, index, payload.candidates.length]);

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
    const video = videoRef.current;
    if (!video) return;
    const update = () => setCaption(readCaption(video));
    const tracks = video.textTracks;
    const bind = () => {
      for (let index = 0; index < tracks.length; index += 1) {
        tracks[index].removeEventListener("cuechange", update);
        tracks[index].addEventListener("cuechange", update);
      }
    };
    const onTrack = () => {
      showSubtitle(video, subtitleLang);
      bind();
      update();
    };
    tracks.addEventListener("addtrack", onTrack);
    tracks.addEventListener("change", onTrack);
    video.addEventListener("timeupdate", update);
    onTrack();
    return () => {
      tracks.removeEventListener("addtrack", onTrack);
      tracks.removeEventListener("change", onTrack);
      video.removeEventListener("timeupdate", update);
      for (let index = 0; index < tracks.length; index += 1) tracks[index].removeEventListener("cuechange", update);
      setCaption("");
    };
  }, [subtitleLang, candidate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Wait for the first-episode sponsor check, then never autoplay behind its popup.
    if (!firstEpisodePopupReady) return;
    if (pendingAdEpisode === episode.episodeId) {
      video.pause();
      setPlaying(false);
      return;
    }
    if (!autoStart && !playAfterSponsor.current) return;
    let cancelled = false;
    let started = false;
    const tryPlay = async () => {
      if (cancelled || started || video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return;
      started = true;
      // Position is set by the metadata handler: resume saved progress for this
      // episode, or start at zero when this episode has no saved progress.
      try {
        await video.play();
        playAfterSponsor.current = false;
      } catch {
        if (cancelled) return;
        // Mobile browsers often block unmuted autoplay. Retry muted once.
        try {
          video.muted = true;
          setMuted(true);
          localStorage.setItem("dramaluma.muted", "1");
          await video.play();
          playAfterSponsor.current = false;
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
  }, [autoStart, candidate, episode.episodeId, firstEpisodePopupReady, pendingAdEpisode]);

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


  function go(episodeId: string, _auto = false) {
    // Require a sponsor popup from Episode 2 onward (manual or autoplay).
    videoRef.current?.pause();
    setPlaying(false);
    setPendingAdEpisode(episodeId);
    setSponsorOpened(false);
    setSponsorWait(0);
    setSponsorClosing(false);
    setSponsorProvider(null);
  }

  function continuePendingEpisode() {
    const episodeId = pendingAdEpisode;
    if (isFirstEpisodeSponsor) {
      try {
        window.sessionStorage.setItem(`housedrama-first-sponsor:${drama.provider}:${drama.seriesId}`, "1");
      } catch {
        // Storage is optional; the current mounted player can still continue.
      }
    }
    setPendingAdEpisode(null);
    setSponsorOpened(false);
    setSponsorWait(0);
    setSponsorClosing(false);
    setSponsorProvider(null);
    if (!episodeId) return;
    // If moving to a different episode, let that route consume a one-time
    // bypass so its initial popup does not reopen after this popup completes.
    if (episodeId !== episode.episodeId) {
      try {
        window.sessionStorage.setItem(`housedrama-sponsor-bypass:${drama.provider}:${drama.seriesId}:${episodeId}`, "1");
      } catch {
        // The transition still works if sessionStorage is unavailable.
      }
    }
    // If the sponsor popup was shown for the episode already on screen, navigating
    // to the same URL may not remount the route or update its `auto` search param.
    // Start playback directly instead. Mobile browsers may block unmuted autoplay,
    // so playContent() retries muted playback and leaves the Play control available
    // if the browser/provider still refuses to start.
    if (episodeId === episode.episodeId) {
      playAfterSponsor.current = true;
      // The stream is attached only after the popup closes. The playback effect
      // waits for canplay/loadeddata and then starts the episode.
      return;
    }

    // A different episode needs a route transition; its `auto` flag lets the
    // player attempt playback after the new stream is ready.
    void navigate({
      to: "/watch/$provider/$seriesId/$episodeId",
      params: { provider: drama.provider, seriesId: drama.seriesId, episodeId },
      search: { auto: true, lang: contentLang },
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
    <div ref={stageRef} onPointerMove={() => { if (!controlsVisible) revealControls(); }} className="relative h-dvh w-full overflow-hidden bg-player text-player-ink">
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
          if (!controlsVisible) {
            revealControls();
            return;
          }
          if (openSpeed || openSubs) {
            setOpenSpeed(false);
            setOpenSubs(false);
            return;
          }
          revealControls();
          void toggle();
        }}
      />
      {caption && !error ? (
        <p className="player-caption pointer-events-none absolute bottom-14 left-4 right-16 z-30 text-center font-medium text-white">{caption}</p>
      ) : null}
      {loading && !error ? (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-linear-to-b from-black/25 via-black/35 to-black/55">
          <div className="grid place-items-center gap-4">
            <div className="relative grid size-20 place-items-center">
              <span className="absolute inset-0 rounded-full border border-white/15" />
              <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#ff4d6d] border-r-[#ffb3c1]" />
              <img src="/logo.png?v=4" alt="" className="h-9 w-auto" />
            </div>
            <p className="text-sm font-medium text-white/85">{({ en: "Loading video…", id: "Memuat video…", hi: "वीडियो लोड हो रहा है…", fil: "Nilo-load ang video…", ms: "Memuatkan video…", th: "กำลังโหลดวิดีโอ…" } as const)[uiLang]}</p>
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

      <div className={cn("pointer-events-none absolute inset-x-0 top-0 z-20 bg-linear-to-b from-black/75 to-transparent px-1 pt-[max(0.25rem,env(safe-area-inset-top))] pb-16 text-white transition-opacity duration-300", controlsVisible ? "opacity-100" : "pointer-events-none opacity-0")}>
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
            aria-label={uiLang === "id" ? "Kecepatan" : uiLang === "ms" ? "Kelajuan" : uiLang === "th" ? "ความเร็ว" : "Speed"}
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
            aria-label={uiLang === "id" ? "Subtitle" : uiLang === "ms" ? "Sari kata" : uiLang === "th" ? "คำบรรยาย" : "Subtitles"}
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
            <button
              type="button"
              aria-pressed={autoplay}
              onClick={() => {
                const enabled = !autoplay;
                setAutoplay(enabled);
                localStorage.setItem("dramaluma.autoplay", enabled ? "1" : "0");
              }}
              className={cn("col-span-3 min-h-10 rounded-xl px-3 text-left text-xs font-semibold", autoplay ? "bg-white/20 text-white" : "bg-black/55 text-white/75")}
            >
              {autoplay ? "✓ Putar episode berikutnya otomatis" : "○ Autoplay episode berikutnya mati"}
            </button>
          </div>
        ) : null}
        {openSubs ? (
          <div className="pointer-events-auto mx-3 mt-2 max-h-64 overflow-auto rounded-2xl bg-black/75 p-1">
            <button
              type="button"
              onClick={() => pickSubtitle(null)}
              className={cn("block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold", !subtitleLang && "text-[#ff4d6d]")}
            >
              {uiLang === "id" ? "Mati" : uiLang === "ms" ? "Tutup" : uiLang === "th" ? "ปิด" : "Off"}
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
              <p className="px-3 py-2 text-sm text-white/70">{uiLang === "id" ? "Subtitle tidak tersedia" : uiLang === "ms" ? "Tiada sari kata" : uiLang === "th" ? "ไม่มีคำบรรยาย" : "No subtitles"}</p>
            )}
          </div>
        ) : null}
      </div>

      {!error ? (
        <div className={cn("absolute right-2 bottom-20 z-20 flex flex-col items-center gap-4 text-white drop-shadow transition-opacity duration-300", controlsVisible ? "opacity-100" : "pointer-events-none opacity-0")}>
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
            <span className="text-[11px] font-medium">{uiLang === "id" ? "Bagikan" : uiLang === "ms" ? "Kongsi" : uiLang === "th" ? "แชร์" : "Share"}</span>
          </button>
          <button type="button" onClick={() => setOpenList(true)} className="grid place-items-center gap-1">
            <Menu className="size-7" />
            <span className="text-[11px] font-medium">{uiLang === "id" ? "Daftar" : uiLang === "ms" ? "Senarai" : uiLang === "th" ? "รายการ" : "List"}</span>
          </button>
          <button type="button" aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"} onClick={async () => {
            const stage = stageRef.current;
            if (!stage) return;
            try {
              if (document.fullscreenElement) await document.exitFullscreen();
              else await stage.requestFullscreen();
            } catch { /* Fullscreen may be blocked by the browser; playback remains usable. */ }
            revealControls();
          }} className="grid place-items-center gap-1">
            {isFullscreen ? <Minimize className="size-7" /> : <Maximize className="size-7" />}
            <span className="text-[11px] font-medium">{isFullscreen ? "Exit" : "Full screen"}</span>
          </button>
        </div>
      ) : null}

      <div className={cn("pointer-events-none absolute inset-x-3 bottom-7 z-30 flex items-center justify-between transition-opacity duration-300 text-[11px] font-semibold tabular-nums text-white [text-shadow:0_1px_3px_rgba(0,0,0,1)]", controlsVisible ? "opacity-100" : "opacity-0")}>
        <span>{formatPlaybackTime(progress)}</span>
        <span>{duration && Number.isFinite(duration) ? formatPlaybackTime(duration) : "--:--"}</span>
      </div>
      <button
        type="button"
        aria-label="Seek video timeline"
        title="Geser untuk maju atau mundur"
        className={cn("absolute inset-x-0 bottom-0 z-20 h-8 touch-none cursor-pointer px-0 transition-opacity duration-300", controlsVisible ? "opacity-100" : "pointer-events-none opacity-0")}
        onPointerDown={(event) => {
          const video = videoRef.current;
          if (!video || !duration) return;
          seekingRef.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
          video.currentTime = ratio * duration;
          setProgress(video.currentTime);
        }}
        onPointerMove={(event) => {
          if (!seekingRef.current) return;
          const video = videoRef.current;
          if (!video || !duration) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
          video.currentTime = ratio * duration;
          setProgress(video.currentTime);
        }}
        onPointerUp={() => { seekingRef.current = false; }}
        onPointerCancel={() => { seekingRef.current = false; }}
        onLostPointerCapture={() => { seekingRef.current = false; }}
        onClick={(event) => {
          const video = videoRef.current;
          if (!video || !duration) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
          video.currentTime = ratio * duration;
          setProgress(video.currentTime);
        }}
      >
        <span className="absolute inset-x-0 bottom-0 h-1.5 bg-white/55 shadow-[0_0_5px_rgba(0,0,0,0.8)]">
          <span className="block h-full bg-[#ff4d6d] shadow-[0_0_5px_rgba(255,77,109,0.9)]" style={{ width: `${duration ? Math.min(100, (progress / duration) * 100) : 0}%` }} />
        </span>
      </button>

      {pendingAdEpisode ? (
        <div className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/65 p-5 transition-opacity duration-300 ease-in-out ${sponsorClosing ? "opacity-0" : "opacity-100"}`} role="dialog" aria-modal="true" aria-label="Iklan">
          <div className={`sponsor-modal w-full max-w-sm rounded-2xl bg-white p-5 text-center text-[#242424] shadow-2xl transition-all duration-300 ease-in-out dark:bg-[#211d27] dark:text-white ${sponsorClosing ? "translate-y-3 scale-95 opacity-0" : "translate-y-0 scale-100 opacity-100"}`}>
            <h2 className="text-lg font-bold text-[#242424] dark:text-white">{isFirstEpisodeSponsor
              ? ({ en: "Support HouseDrama to Start", id: "Dukung HouseDrama untuk Mulai", hi: "शुरू करने के लिए HouseDrama का समर्थन करें", fil: "Suportahan ang HouseDrama para Magsimula", ms: "Sokong HouseDrama untuk Bermula", th: "สนับสนุน HouseDrama เพื่อเริ่มรับชม" } as const)[uiLang]
              : ({ en: "Watch Sponsor First", id: "Tonton Sponsor Dulu", hi: "पहले प्रायोजक देखें", fil: "Panoorin muna ang sponsor", ms: "Tonton Penaja Dahulu", th: "ดูผู้สนับสนุนก่อน" } as const)[uiLang]}</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{isFirstEpisodeSponsor
              ? ({
                en: "Before Episode 1 starts, open the sponsor in a new tab. Return here and continue watching; the video will not start automatically behind this popup.",
                id: "Sebelum Episode 1 dimulai, buka sponsor di tab baru. Kembali ke sini untuk mulai menonton. Video tidak akan langsung berjalan di belakang popup ini.",
                hi: "एपिसोड 1 शुरू करने से पहले प्रायोजक को नए टैब में खोलें। फिर यहाँ लौटकर देखना शुरू करें।",
                fil: "Bago magsimula ang Episode 1, buksan muna ang sponsor sa bagong tab. Bumalik dito para manood.",
                ms: "Sebelum Episod 1 bermula, buka penaja dalam tab baharu. Kembali ke sini untuk mula menonton.",
                th: "ก่อนเริ่มตอนที่ 1 ให้เปิดผู้สนับสนุนในแท็บใหม่ แล้วกลับมาที่นี่เพื่อเริ่มรับชม"
              } as const)[uiLang]
              : ({
              en: `To continue to Episode ${episodes.findIndex((item) => item.episodeId === pendingAdEpisode) + 1}, please open the sponsor first. This helps support HouseDrama.`,
              id: `Untuk melanjutkan ke Episode ${episodes.findIndex((item) => item.episodeId === pendingAdEpisode) + 1}, silakan buka sponsor terlebih dahulu. Ini membantu mendukung HouseDrama.`,
              hi: `एपिसोड ${episodes.findIndex((item) => item.episodeId === pendingAdEpisode) + 1} पर जाने के लिए पहले प्रायोजक लिंक खोलें। इससे HouseDrama को समर्थन मिलता है।`,
              fil: `Para magpatuloy sa Episode ${episodes.findIndex((item) => item.episodeId === pendingAdEpisode) + 1}, buksan muna ang sponsor. Nakakatulong ito sa HouseDrama.`,
              ms: `Untuk meneruskan ke Episod ${episodes.findIndex((item) => item.episodeId === pendingAdEpisode) + 1}, buka penaja dahulu. Ini membantu menyokong HouseDrama.`,
              th: `หากต้องการไปยังตอนที่ ${episodes.findIndex((item) => item.episodeId === pendingAdEpisode) + 1} โปรดเปิดลิงก์ผู้สนับสนุนก่อน เพื่อช่วยสนับสนุน HouseDrama`,
            } as const)[uiLang]}</p>
            <button type="button" className={`mt-4 w-full rounded-xl px-4 py-3 font-semibold text-white ${isFirstEpisodeSponsor ? "bg-gradient-to-r from-[#8b5cf6] to-[#ff4d8d]" : "bg-gradient-to-r from-[#ff4d8d] to-[#ff5a36]"}`} onClick={() => {
              // Open a sponsor in a new tab from this explicit user click. The viewer
              // returns to HouseDrama and presses Continue; no ad completion is claimed.
              const provider = Math.random() < 0.5 ? "monetag" : "adsterra";
              setSponsorProvider(provider);
              if (provider === "monetag") {
                openMonetagAd();
              } else {
                // Open only the selected sponsor URL. Do not inject the Adsterra
                // popunder script here because it can create a sticky clickable overlay
                // that blocks scrolling on mobile.
                const link = SPONSOR_SMARTLINKS[Math.floor(Math.random() * SPONSOR_SMARTLINKS.length)];
                window.open(link, "_blank", "noopener,noreferrer");
              }
              setSponsorClosing(false);
              setSponsorOpened(true);
              setSponsorWait(10);
            }} disabled={sponsorOpened}>
              {sponsorOpened
                ? ({ en: "Sponsor Opened", id: "Sponsor Sudah Dibuka", hi: "प्रायोजक खुल गया", fil: "Nabuksan na ang sponsor", ms: "Penaja Dibuka", th: "เปิดผู้สนับสนุนแล้ว" } as const)[uiLang]
                : (isFirstEpisodeSponsor
                  ? ({ en: "Open Sponsor & Start Episode 1", id: "Buka Sponsor & Mulai Episode 1", hi: "प्रायोजक खोलें और एपिसोड 1 शुरू करें", fil: "Buksan ang Sponsor at Simulan ang Episode 1", ms: "Buka Penaja & Mula Episod 1", th: "เปิดผู้สนับสนุนและเริ่มตอนที่ 1" } as const)[uiLang]
                  : ({ en: "Open Sponsor in New Tab", id: "Buka Sponsor di Tab Baru", hi: "नए टैब में प्रायोजक खोलें", fil: "Buksan ang sponsor sa bagong tab", ms: "Buka Penaja dalam Tab Baharu", th: "เปิดผู้สนับสนุนในแท็บใหม่" } as const)[uiLang])}
            </button>
            {sponsorOpened ? (
              <button type="button" className={`mt-2 w-full rounded-xl border px-4 py-3 font-semibold transition-colors ${sponsorWait > 0 ? "border-gray-300 text-gray-400 dark:border-white/20 dark:text-gray-500" : "border-[#ff4d6d] bg-[#ff4d6d] text-white dark:border-[#ff4d6d] dark:bg-[#ff4d6d] dark:text-white"}`} onClick={continuePendingEpisode} disabled={sponsorWait > 0}>
                {sponsorWait > 0
                  ? ({ en: `Continue in ${sponsorWait}s`, id: `Lanjutkan dalam ${sponsorWait} dtk`, hi: `${sponsorWait} सेकंड में जारी रखें`, fil: `Magpatuloy sa loob ng ${sponsorWait}s`, ms: `Teruskan dalam ${sponsorWait}s`, th: `ดำเนินการต่อใน ${sponsorWait} วินาที` } as const)[uiLang]
                  : (isFirstEpisodeSponsor
                    ? ({ en: "Return & Start Episode 1", id: "Kembali & Mulai Episode 1", hi: "वापस जाएँ और एपिसोड 1 शुरू करें", fil: "Bumalik at Simulan ang Episode 1", ms: "Kembali & Mula Episod 1", th: "กลับมาเริ่มตอนที่ 1" } as const)[uiLang]
                    : ({ en: "Return & Continue Episode", id: "Kembali & Lanjutkan Episode", hi: "वापस जाएँ और एपिसोड जारी रखें", fil: "Bumalik at magpatuloy sa episode", ms: "Kembali & Teruskan Episod", th: "กลับไปดูตอนต่อ" } as const)[uiLang])}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

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
