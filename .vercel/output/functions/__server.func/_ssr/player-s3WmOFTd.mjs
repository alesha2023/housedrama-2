import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, S as useRouter, X as require_react, b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as cn, g as pickTitle, y as usePrefs } from "./cards-Dd_haNas.mjs";
import { A as AudioLines, D as ChevronLeft, c as Star, f as RotateCcw, h as Menu, n as VolumeX, p as Play, r as Volume2, t as X, u as Share2, x as Globe } from "../_libs/lucide-react.mjs";
import { f as previewPathPrefix, w as reportPlayback } from "./router-02Yj-4nf.mjs";
import { n as openMonetagAd } from "./monetag-Dx3ZioJW.mjs";
import { a as upsertHistory, i as toggleWatchlist, n as readProgress, o as writeProgress, r as readWatchlist } from "./storage-CrxvcQ_E.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/player-s3WmOFTd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SPEEDS = [
	.5,
	.75,
	1,
	1.25,
	1.5,
	2
];
var SPONSOR_SMARTLINKS = [
	"https://auctionr.org/4/e02ff50611e53dfb3b95d9b7fe94759f",
	"https://asiafilm.org/4/3b9a06b621155c33e54e072a498d0691",
	"https://asiafilm.org/4/4a0d43260f21506b6b29c2febdc90ea2",
	"https://uplcm.com/4/12057622",
	"https://uplcm.com/4/12057617",
	"https://uplcm.com/4/12057615",
	"https://uplcm.com/4/12017844",
	"https://auctionr.org/4/97ee6d6eed24baa0974e41f4f1567470"
];
function formatPlaybackTime(seconds) {
	if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds < 0) return "00:00";
	const total = Math.floor(seconds);
	const hours = Math.floor(total / 3600);
	const minutes = Math.floor(total % 3600 / 60);
	const secs = total % 60;
	return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}` : `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
function cuePlainText(cue) {
	return ("text" in cue ? String(cue.text) : "").replace(/<[^>]*>/g, "").replace(/\u00a0/g, " ").trim();
}
function showSubtitle(video, lang) {
	const tracks = video.textTracks;
	const want = lang?.toLowerCase() ?? "";
	let shown = false;
	for (let index = 0; index < tracks.length; index += 1) {
		const track = tracks[index];
		const match = Boolean(want) && !shown && (track.language.toLowerCase() === want || track.label === lang);
		track.mode = match ? "hidden" : "disabled";
		if (match) shown = true;
	}
}
function readCaption(video) {
	const lines = [];
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
function withBase(path) {
	if (typeof window === "undefined") return path;
	return `${previewPathPrefix(window.location.hostname, window.location.pathname) ?? ""}${path}`;
}
function needsProxy(url) {
	return /mydramawave\.com/i.test(url);
}
function Player({ drama, episodes, episode, initial, alsoOn, autoStart = false }) {
	const { t, contentLang, uiLang } = usePrefs();
	const navigate = useNavigate();
	const router = useRouter();
	const videoRef = (0, import_react.useRef)(null);
	const stageRef = (0, import_react.useRef)(null);
	const reported = (0, import_react.useRef)(false);
	const ignoreClick = (0, import_react.useRef)(false);
	const seekingRef = (0, import_react.useRef)(false);
	const [payload, setPayload] = (0, import_react.useState)(initial);
	const [index, setIndex] = (0, import_react.useState)(0);
	const [error, setError] = (0, import_react.useState)(initial.ok ? null : initial.message);
	const [loading, setLoading] = (0, import_react.useState)(initial.ok);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [muted, setMuted] = (0, import_react.useState)(false);
	const [volume, setVolume] = (0, import_react.useState)(1);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [duration, setDuration] = (0, import_react.useState)(null);
	const [openSpeed, setOpenSpeed] = (0, import_react.useState)(false);
	const [openSubs, setOpenSubs] = (0, import_react.useState)(false);
	const [openList, setOpenList] = (0, import_react.useState)(false);
	const [pendingAdEpisode, setPendingAdEpisode] = (0, import_react.useState)(null);
	const [sponsorOpened, setSponsorOpened] = (0, import_react.useState)(false);
	const [sponsorProvider, setSponsorProvider] = (0, import_react.useState)(null);
	(0, import_react.useRef)(-1);
	const [rate, setRate] = (0, import_react.useState)(1);
	const [subtitleLang, setSubtitleLang] = (0, import_react.useState)(null);
	const [caption, setCaption] = (0, import_react.useState)("");
	const [rangePage, setRangePage] = (0, import_react.useState)(0);
	const [saved, setSaved] = (0, import_react.useState)(false);
	const [autoplay, setAutoplay] = (0, import_react.useState)(true);
	const [retrying, setRetrying] = (0, import_react.useState)(false);
	const candidate = payload.candidates[index] ?? null;
	const currentIndex = episodes.findIndex((item) => item.episodeId === episode.episodeId);
	const previous = currentIndex > 0 ? episodes[currentIndex - 1] : null;
	const next = currentIndex >= 0 && currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;
	(0, import_react.useEffect)(() => {
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
	(0, import_react.useEffect)(() => {
		setSaved(readWatchlist().some((item) => item.provider === drama.provider && item.seriesId === drama.seriesId));
	}, [drama.provider, drama.seriesId]);
	(0, import_react.useEffect)(() => {
		if (currentIndex >= 0) setRangePage(Math.floor(currentIndex / 30));
	}, [currentIndex]);
	(0, import_react.useEffect)(() => {
		setPayload(initial);
		setIndex(0);
		setError(initial.ok ? null : initial.message);
		setLoading(initial.ok);
		reported.current = false;
	}, [initial]);
	(0, import_react.useEffect)(() => {
		const video = videoRef.current;
		if (!video || !candidate) return;
		let destroyed = false;
		let hls = null;
		let proxyAttempted = needsProxy(candidate.url);
		let playbackStarted = false;
		const saved = readProgress(drama.provider, drama.seriesId, episode.episodeId);
		setError(null);
		setLoading(true);
		setProgress(0);
		setDuration(null);
		const remember = () => {
			if (saved > 3 && (!video.duration || saved < video.duration - 4)) try {
				video.currentTime = saved;
			} catch {}
			else try {
				video.currentTime = 0;
			} catch {}
		};
		const fail = (message) => {
			if (destroyed) return;
			setLoading(false);
			if (index + 1 < payload.candidates.length) {
				setIndex((value) => value + 1);
				return;
			}
			setError(message);
			if (!reported.current) {
				reported.current = true;
				reportPlayback({ data: {
					provider: drama.provider,
					ok: false
				} });
			}
		};
		const attach = async (useProxy) => {
			const src = useProxy ? withBase(`/api/media?u=${encodeURIComponent(candidate.url)}`) : candidate.url;
			const nativeHls = video.canPlayType("application/vnd.apple.mpegurl") !== "";
			if (candidate.format === "mp4" || candidate.format === "hls" && nativeHls && !useProxy) {
				video.src = src;
				video.load();
				return;
			}
			const mod = await import("../_libs/hls.js.mjs").then((n) => n.t);
			if (destroyed) return;
			const Hls = mod.default;
			if (!Hls.isSupported()) {
				video.src = src;
				return;
			}
			const player = new Hls({
				enableWorker: true,
				capLevelToPlayerSize: true,
				subtitleDisplay: false,
				manifestLoadingTimeOut: 9e3,
				manifestLoadingMaxRetry: 1,
				levelLoadingTimeOut: 9e3,
				levelLoadingMaxRetry: 1,
				fragLoadingTimeOut: 12e3,
				fragLoadingMaxRetry: 2,
				maxBufferLength: 18,
				maxMaxBufferLength: 30,
				maxBufferHole: .5,
				nudgeOffset: .1,
				nudgeMaxRetry: 3,
				backBufferLength: 20,
				startFragPrefetch: true
			});
			hls = player;
			player.on(Hls.Events.LEVEL_LOADED, (_event, data) => {
				const totalDuration = data?.details?.totalduration;
				if (typeof totalDuration === "number" && Number.isFinite(totalDuration) && totalDuration > 0) setDuration(totalDuration);
			});
			player.on(Hls.Events.ERROR, (_event, data) => {
				if (data.details === Hls.ErrorDetails.BUFFER_SEEK_OVER_HOLE) {
					const ranges = video.buffered;
					for (let i = 0; i < ranges.length; i += 1) {
						const start = ranges.start(i);
						const end = ranges.end(i);
						if (video.currentTime < start || video.currentTime >= start && video.currentTime < end) {
							if (video.currentTime < start || end - video.currentTime < .15) try {
								video.currentTime = Math.min(end - .05, start + .05);
							} catch {}
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
					attach(true);
					return;
				}
				const friendly = data.type === Hls.ErrorTypes.NETWORK_ERROR ? "Koneksi video terputus. Coba lagi atau pilih sumber video lain." : data.type === Hls.ErrorTypes.MEDIA_ERROR ? "Format atau segmen video bermasalah. Mencoba pemulihan pemutar…" : "Video dari sumber ini gagal diputar. Coba lagi atau pilih sumber lain.";
				fail(friendly);
			});
			player.loadSource(src);
			player.attachMedia(video);
		};
		const syncDuration = () => {
			const value = video.duration;
			if (Number.isFinite(value) && value > 0) setDuration(value);
		};
		const onLoaded = () => {
			syncDuration();
			remember();
			video.playbackRate = rate;
			const saved = localStorage.getItem("dramaluma.subtitle");
			const chosen = saved === "off" ? null : saved || [...video.textTracks].find((track) => track.language.toLowerCase().startsWith(contentLang))?.language || video.textTracks[0]?.language || null;
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
				reportPlayback({ data: {
					provider: drama.provider,
					ok: true
				} });
			}
		};
		const onError = () => {
			if (candidate.format === "hls" && !proxyAttempted && !playbackStarted) {
				proxyAttempted = true;
				attach(true);
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
		attach(candidate.format === "hls" && needsProxy(candidate.url));
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
	}, [
		candidate,
		drama.provider,
		drama.seriesId,
		episode.episodeId,
		index,
		payload.candidates.length
	]);
	(0, import_react.useEffect)(() => {
		const video = videoRef.current;
		if (!video) return;
		video.volume = volume;
		video.muted = muted;
		video.playbackRate = rate;
	}, [
		volume,
		muted,
		rate
	]);
	(0, import_react.useEffect)(() => {
		const video = videoRef.current;
		if (!video) return;
		showSubtitle(video, subtitleLang);
	}, [subtitleLang, candidate]);
	(0, import_react.useEffect)(() => {
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
	(0, import_react.useEffect)(() => {
		if (!autoStart) return;
		const video = videoRef.current;
		if (!video) return;
		let cancelled = false;
		let started = false;
		const tryPlay = async () => {
			if (cancelled || started || video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return;
			started = true;
			try {
				await video.play();
			} catch {
				if (cancelled) return;
				try {
					video.muted = true;
					setMuted(true);
					localStorage.setItem("dramaluma.muted", "1");
					await video.play();
				} catch {
					started = false;
					setPlaying(false);
				}
			}
		};
		video.addEventListener("canplay", tryPlay);
		video.addEventListener("loadeddata", tryPlay);
		if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) tryPlay();
		return () => {
			cancelled = true;
			video.removeEventListener("canplay", tryPlay);
			video.removeEventListener("loadeddata", tryPlay);
		};
	}, [autoStart, candidate]);
	(0, import_react.useEffect)(() => {
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
				updatedAt: Date.now()
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
	}, [
		autoplay,
		drama,
		episode,
		next
	]);
	function go(episodeId, auto = false) {
		if (currentIndex >= 0 && (currentIndex + 1) % 2 === 0) {
			setPendingAdEpisode(episodeId);
			setSponsorOpened(false);
			setSponsorProvider(null);
			return;
		}
		navigate({
			to: "/watch/$provider/$seriesId/$episodeId",
			params: {
				provider: drama.provider,
				seriesId: drama.seriesId,
				episodeId
			},
			search: auto ? {
				auto: true,
				lang: contentLang
			} : { lang: contentLang }
		});
	}
	function continuePendingEpisode() {
		const episodeId = pendingAdEpisode;
		setPendingAdEpisode(null);
		setSponsorOpened(false);
		setSponsorProvider(null);
		if (!episodeId) return;
		navigate({
			to: "/watch/$provider/$seriesId/$episodeId",
			params: {
				provider: drama.provider,
				seriesId: drama.seriesId,
				episodeId
			},
			search: { lang: contentLang }
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
			savedAt: Date.now()
		});
		setSaved(nextSaved.some((item) => item.provider === drama.provider && item.seriesId === drama.seriesId));
	}
	function pickSubtitle(lang) {
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
				await navigator.share({
					title,
					url
				});
			} catch {}
			return;
		}
		try {
			await navigator.clipboard.writeText(url);
		} catch {}
	}
	(0, import_react.useEffect)(() => {
		if (!next) return;
		router.preloadRoute({
			to: "/watch/$provider/$seriesId/$episodeId",
			params: {
				provider: drama.provider,
				seriesId: drama.seriesId,
				episodeId: next.episodeId
			},
			search: { lang: contentLang }
		});
	}, [
		contentLang,
		drama.provider,
		drama.seriesId,
		next,
		router
	]);
	(0, import_react.useEffect)(() => {
		const stage = stageRef.current;
		if (!stage) return;
		let locked = false;
		let tracking = false;
		let startX = 0;
		let startY = 0;
		const jump = (direction) => {
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
		const onWheel = (event) => {
			if (Math.abs(event.deltaY) < 24 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
			event.preventDefault();
			jump(event.deltaY > 0 ? 1 : -1);
		};
		const onStart = (event) => {
			if (event.touches.length !== 1) return;
			const target = event.target;
			if (target instanceof Element && target.closest("button, a, input, label")) return;
			startX = event.touches[0].clientX;
			startY = event.touches[0].clientY;
			tracking = true;
		};
		const onMove = (event) => {
			if (!tracking || event.touches.length !== 1) return;
			const dy = startY - event.touches[0].clientY;
			if (Math.abs(dy) > 16) event.preventDefault();
		};
		const onEnd = (event) => {
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
	}, [
		contentLang,
		drama.provider,
		drama.seriesId,
		navigate,
		next,
		openList,
		previous
	]);
	async function playContent() {
		const video = videoRef.current;
		if (!video) return;
		try {
			await video.play();
			setPlaying(true);
		} catch {
			video.muted = true;
			setMuted(true);
			try {
				await video.play();
				setPlaying(true);
			} catch {
				setError("Tekan Play untuk memulai video.");
			}
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
		const { getStreamData } = await import("../_libs/_.mjs").then((n) => n.n);
		const fresh = await getStreamData({ data: {
			provider: drama.provider,
			seriesId: drama.seriesId,
			episodeId: episode.episodeId,
			lang: contentLang
		} });
		setPayload(fresh);
		setError(fresh.ok ? null : fresh.message);
		setRetrying(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: stageRef,
		className: "relative h-dvh w-full overflow-hidden bg-player text-player-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref: videoRef,
				preload: "auto",
				className: "absolute inset-0 h-full w-full bg-player object-cover",
				playsInline: true,
				poster: episode.coverUrl || drama.posterUrl || void 0,
				onClick: () => {
					if (ignoreClick.current) {
						ignoreClick.current = false;
						return;
					}
					if (openSpeed || openSubs) {
						setOpenSpeed(false);
						setOpenSubs(false);
						return;
					}
					toggle();
				}
			}),
			caption && !error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "player-caption pointer-events-none absolute bottom-14 left-4 right-16 z-30 text-center font-medium text-white",
				children: caption
			}) : null,
			loading && !error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 z-10 grid place-items-center bg-linear-to-b from-black/25 via-black/35 to-black/55",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid place-items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative grid size-20 place-items-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 rounded-full border border-white/15" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#ff4d6d] border-r-[#ffb3c1]" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/logo.png?v=4",
								alt: "",
								className: "h-9 w-auto"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-white/85",
						children: uiLang === "id" ? "Memuat video…" : "Loading video…"
					})]
				})
			}) : null,
			!error && !loading && !playing && !openList ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Play video",
				onClick: () => void toggle(),
				className: "absolute left-1/2 top-1/2 z-10 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-1 size-8 fill-current" })
			}) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 z-20 grid content-center gap-3 bg-player/90 px-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: error
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => void retry(),
						className: "mx-auto inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 font-semibold text-primary-ink",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), retrying ? t.retrying : t.retry]
					}),
					alsoOn[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/drama/$provider/$seriesId",
						params: {
							provider: alsoOn[0].provider,
							seriesId: alsoOn[0].seriesId
						},
						className: "text-sm font-semibold text-primary",
						children: ["Try ", alsoOn[0].provider]
					}) : null
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-x-0 top-0 z-20 bg-linear-to-b from-black/75 to-transparent px-1 pt-[max(0.25rem,env(safe-area-inset-top))] pb-16 text-white",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-auto flex items-center drop-shadow",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/drama/$provider/$seriesId",
								params: {
									provider: drama.provider,
									seriesId: drama.seriesId
								},
								"aria-label": t.details,
								className: "grid size-11 shrink-0 place-items-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-7" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "min-w-0 flex-1 truncate text-[17px] font-semibold",
								children: pickTitle(drama, contentLang)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"aria-label": uiLang === "id" ? "Kecepatan" : "Speed",
								onClick: () => {
									setOpenSpeed((open) => !open);
									setOpenSubs(false);
								},
								className: "h-8 shrink-0 rounded-lg bg-black/50 px-2 text-xs font-bold",
								children: [rate.toFixed(1), "X"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": uiLang === "id" ? "Subtitle" : "Subtitles",
								onClick: () => {
									setOpenSubs((open) => !open);
									setOpenSpeed(false);
								},
								className: "grid size-10 shrink-0 place-items-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: cn("size-5", subtitleLang && "text-[#ff4d6d]") })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "px-2 text-sm tabular-nums",
								children: [
									Math.max(currentIndex + 1, 1),
									"/",
									episodes.length || 1
								]
							})
						]
					}),
					openSpeed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-auto grid grid-cols-3 gap-2 px-3 pt-2",
						children: [SPEEDS.map((speed) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setRate(speed);
								const video = videoRef.current;
								if (video) video.playbackRate = speed;
								localStorage.setItem("dramaluma.rate", String(speed));
								setOpenSpeed(false);
							},
							className: cn("h-11 rounded-xl bg-black/55 text-sm font-semibold", rate === speed && "bg-white/30"),
							children: [speed, "X"]
						}, speed)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": autoplay,
							onClick: () => {
								const enabled = !autoplay;
								setAutoplay(enabled);
								localStorage.setItem("dramaluma.autoplay", enabled ? "1" : "0");
							},
							className: cn("col-span-3 min-h-10 rounded-xl px-3 text-left text-xs font-semibold", autoplay ? "bg-white/20 text-white" : "bg-black/55 text-white/75"),
							children: autoplay ? "✓ Putar episode berikutnya otomatis" : "○ Autoplay episode berikutnya mati"
						})]
					}) : null,
					openSubs ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-auto mx-3 mt-2 max-h-64 overflow-auto rounded-2xl bg-black/75 p-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => pickSubtitle(null),
								className: cn("block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold", !subtitleLang && "text-[#ff4d6d]"),
								children: uiLang === "id" ? "Mati" : "Off"
							}),
							(candidate?.subtitles ?? []).map((track, trackIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => pickSubtitle(track.lang || track.label),
								className: cn("block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold", subtitleLang === (track.lang || track.label) && "text-[#ff4d6d]"),
								children: track.label || track.lang
							}, `${track.lang}-${track.label}-${trackIndex}`)),
							candidate?.subtitles.length ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-3 py-2 text-sm text-white/70",
								children: uiLang === "id" ? "Subtitle tidak tersedia" : "No subtitles"
							})
						]
					}) : null
				]
			}),
			!error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute right-2 bottom-20 z-20 flex flex-col items-center gap-4 text-white drop-shadow",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": saved ? t.saved : t.save,
						onClick: saveDrama,
						className: "grid size-11 place-items-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-7", saved && "fill-current text-[#ff4d6d]") })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": muted ? "Unmute" : "Mute",
						onClick: () => {
							const video = videoRef.current;
							const nextMuted = !muted;
							setMuted(nextMuted);
							if (video) video.muted = nextMuted;
							localStorage.setItem("dramaluma.muted", nextMuted ? "1" : "0");
						},
						className: "grid size-11 place-items-center",
						children: muted || volume === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-6" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-6" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => void shareDrama(),
						className: "grid place-items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-7" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] font-medium",
							children: uiLang === "id" ? "Bagikan" : "Share"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setOpenList(true),
						className: "grid place-items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-7" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] font-medium",
							children: uiLang === "id" ? "Daftar" : "List"
						})]
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-x-3 bottom-7 z-30 flex items-center justify-between text-[11px] font-semibold tabular-nums text-white [text-shadow:0_1px_3px_rgba(0,0,0,1)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatPlaybackTime(progress) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: duration && Number.isFinite(duration) ? formatPlaybackTime(duration) : "--:--" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Seek video timeline",
				title: "Geser untuk maju atau mundur",
				className: "absolute inset-x-0 bottom-0 z-20 h-8 touch-none cursor-pointer px-0",
				onPointerDown: (event) => {
					const video = videoRef.current;
					if (!video || !duration) return;
					seekingRef.current = true;
					event.currentTarget.setPointerCapture(event.pointerId);
					const rect = event.currentTarget.getBoundingClientRect();
					video.currentTime = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)) * duration;
					setProgress(video.currentTime);
				},
				onPointerMove: (event) => {
					if (!seekingRef.current) return;
					const video = videoRef.current;
					if (!video || !duration) return;
					const rect = event.currentTarget.getBoundingClientRect();
					video.currentTime = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)) * duration;
					setProgress(video.currentTime);
				},
				onPointerUp: () => {
					seekingRef.current = false;
				},
				onPointerCancel: () => {
					seekingRef.current = false;
				},
				onLostPointerCapture: () => {
					seekingRef.current = false;
				},
				onClick: (event) => {
					const video = videoRef.current;
					if (!video || !duration) return;
					const rect = event.currentTarget.getBoundingClientRect();
					video.currentTime = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)) * duration;
					setProgress(video.currentTime);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute inset-x-0 bottom-0 h-1.5 bg-white/55 shadow-[0_0_5px_rgba(0,0,0,0.8)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block h-full bg-[#ff4d6d] shadow-[0_0_5px_rgba(255,77,109,0.9)]",
						style: { width: `${duration ? Math.min(100, progress / duration * 100) : 0}%` }
					})
				})
			}),
			pendingAdEpisode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-[60] flex items-center justify-center bg-black/65 p-5",
				role: "dialog",
				"aria-modal": "true",
				"aria-label": "Iklan",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-sm rounded-2xl bg-white p-5 text-center text-[#242424] shadow-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-bold",
							children: contentLang === "en" ? "Watch Sponsor First" : "Tonton Sponsor Dulu"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-gray-600",
							children: contentLang === "en" ? `To continue to Episode ${episodes.findIndex((item) => item.episodeId === pendingAdEpisode) + 1}, please open the sponsor first. This helps support HouseDrama.` : `Untuk melanjutkan ke Episode ${episodes.findIndex((item) => item.episodeId === pendingAdEpisode) + 1}, silakan buka sponsor terlebih dahulu. Ini membantu mendukung HouseDrama.`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mt-4 w-full rounded-xl bg-gradient-to-r from-[#ff4d8d] to-[#ff5a36] px-4 py-3 font-semibold text-white",
							onClick: () => {
								const provider = Math.random() < .5 ? "monetag" : "adsterra";
								setSponsorProvider(provider);
								if (provider === "monetag") openMonetagAd();
								else {
									const link = SPONSOR_SMARTLINKS[Math.floor(Math.random() * SPONSOR_SMARTLINKS.length)];
									window.open(link, "_blank", "noopener,noreferrer");
								}
								setSponsorOpened(true);
							},
							disabled: sponsorOpened,
							children: sponsorOpened ? contentLang === "en" ? "Sponsor Opened" : "Sponsor Sudah Dibuka" : contentLang === "en" ? "Open Sponsor in New Tab" : "Buka Sponsor di Tab Baru"
						}),
						sponsorOpened ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700",
							onClick: continuePendingEpisode,
							children: contentLang === "en" ? "Return & Continue Episode" : "Kembali & Lanjutkan Episode"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-xs text-gray-500",
							children: contentLang === "en" ? "Sponsor links are selected randomly. Ads may be blocked or unavailable; opening a link does not verify an ad view." : "Link sponsor dipilih secara acak. Iklan bisa diblokir atau tidak tersedia; membuka link tidak menjamin tayangan iklan tercatat."
						})
					]
				})
			}) : null,
			openList ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-end bg-black/50",
				onClick: () => setOpenList(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-h-[78vh] w-full overflow-auto rounded-t-3xl bg-[#2a2a2a] px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-white",
					onClick: (event) => event.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "min-w-0 truncate text-lg font-semibold",
									children: pickTitle(drama, contentLang)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-md bg-white/10 px-1.5 py-0.5 text-xs text-white/80",
									children: episodes.length
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": t.close,
									onClick: () => setOpenList(false),
									className: "ml-auto grid size-9 place-items-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-3 flex gap-4 overflow-x-auto text-sm font-semibold",
							children: Array.from({ length: Math.max(1, Math.ceil(episodes.length / 30)) }, (_, page) => {
								const start = page * 30 + 1;
								const end = Math.min(episodes.length, (page + 1) * 30);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setRangePage(page),
									className: page === rangePage ? "text-[#ff4d6d]" : "text-white/70",
									children: [
										start,
										"-",
										end
									]
								}, page);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EpisodeGrid, {
							sheet: true,
							episodes: episodes.slice(rangePage * 30, rangePage * 30 + 30),
							current: episode.episodeId,
							provider: drama.provider,
							seriesId: drama.seriesId,
							onPick: () => setOpenList(false)
						})
					]
				})
			}) : null
		]
	});
}
function EpisodeGrid({ episodes, current, provider, seriesId, onPick, sheet = false }) {
	if (sheet) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-5 gap-2.5",
		children: episodes.map((item) => {
			const active = item.episodeId === current;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/watch/$provider/$seriesId/$episodeId",
				params: {
					provider,
					seriesId,
					episodeId: item.episodeId
				},
				onClick: () => {
					onPick?.();
				},
				className: cn("relative grid aspect-square place-items-center rounded-xl bg-[#3a3a3a] text-base font-medium text-white", active && "border-2 border-[#ff4d6d]"),
				children: active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudioLines, { className: "size-6 text-[#ff4d6d]" }) : item.index
			}, item.episodeId);
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-4 gap-2 sm:grid-cols-6",
		children: episodes.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/watch/$provider/$seriesId/$episodeId",
			params: {
				provider,
				seriesId,
				episodeId: item.episodeId
			},
			onClick: () => {
				onPick?.();
			},
			className: cn("flex h-12 items-center justify-center rounded-xl border text-sm font-semibold", item.episodeId === current ? "border-primary bg-primary text-primary-ink" : "border-line bg-surface text-ink"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.index })
		}, item.episodeId))
	});
}
//#endregion
export { Player as n, EpisodeGrid as t };
