import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { g as pickTitle, y as usePrefs } from "./cards-Dd_haNas.mjs";
import { i as providerLabel } from "./catalog-DJ2VrmyW.mjs";
import { n as VolumeX, p as Play, r as Volume2, u as Share2, y as Heart } from "../_libs/lucide-react.mjs";
import { S as getStreamData, f as previewPathPrefix, o as Route$9, v as getDetailData, x as getShortsData } from "./router-02Yj-4nf.mjs";
import { t as maybeOpenMonetagAd } from "./monetag-Dx3ZioJW.mjs";
import { i as toggleWatchlist, r as readWatchlist } from "./storage-CrxvcQ_E.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shorts-CEOAbQIC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ShortsPage() {
	const initial = Route$9.useLoaderData();
	const { t, contentLang } = usePrefs();
	const scroller = (0, import_react.useRef)(null);
	const [items, setItems] = (0, import_react.useState)(initial.items);
	const [page, setPage] = (0, import_react.useState)(initial.page);
	const [hasMore, setHasMore] = (0, import_react.useState)(initial.hasMore);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [active, setActive] = (0, import_react.useState)(0);
	const [muted, setMuted] = (0, import_react.useState)(true);
	const loadingMore = (0, import_react.useRef)(false);
	async function more() {
		if (!hasMore || loadingMore.current) return;
		loadingMore.current = true;
		setLoading(true);
		const next = await getShortsData({ data: {
			lang: "en",
			page: page + 1
		} });
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
		if (index >= items.length - 3) more();
	}
	function advance() {
		const el = scroller.current;
		if (!el) return;
		el.scrollTo({
			top: el.scrollTop + el.clientHeight,
			behavior: "smooth"
		});
	}
	if (!items.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid h-full place-items-center px-6 text-center text-white",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t.shortsEmpty })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: scroller,
		onScroll,
		className: "h-full min-h-0 snap-y snap-mandatory overflow-y-auto overscroll-y-contain bg-black [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
		children: [items.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShortClip, {
			item,
			active: index === active,
			muted,
			title: pickTitle(item, contentLang),
			onToggleMute: () => setMuted((value) => !value),
			onEnded: advance
		}, `${item.provider}-${item.seriesId}`)), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "grid h-16 place-items-center bg-black text-sm text-white/70",
			children: t.loading
		}) : null]
	});
}
function ShortClip({ item, active, muted, title, onToggleMute, onEnded }) {
	const videoRef = (0, import_react.useRef)(null);
	const [candidate, setCandidate] = (0, import_react.useState)(null);
	const [episodeId, setEpisodeId] = (0, import_react.useState)(item.firstEpisodeId);
	const [failed, setFailed] = (0, import_react.useState)(false);
	const [paused, setPaused] = (0, import_react.useState)(false);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [saved, setSaved] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setSaved(readWatchlist().some((entry) => entry.provider === item.provider && entry.seriesId === item.seriesId));
	}, [item.provider, item.seriesId]);
	(0, import_react.useEffect)(() => {
		const video = videoRef.current;
		if (!video) return;
		video.muted = muted;
	}, [muted]);
	(0, import_react.useEffect)(() => {
		if (!active) {
			videoRef.current?.pause();
			return;
		}
		let cancel = false;
		setFailed(false);
		(async () => {
			let nextEpisode = episodeId;
			if (!nextEpisode) {
				const detail = await getDetailData({ data: {
					provider: item.provider,
					seriesId: item.seriesId,
					lang: "en"
				} });
				nextEpisode = detail.episodes[0]?.episodeId ?? detail.drama?.firstEpisodeId ?? null;
				if (nextEpisode) setEpisodeId(nextEpisode);
			}
			if (!nextEpisode || cancel) {
				if (!cancel && !nextEpisode) setFailed(true);
				return;
			}
			const stream = await getStreamData({ data: {
				provider: item.provider,
				seriesId: item.seriesId,
				episodeId: nextEpisode,
				lang: "en"
			} });
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
	}, [
		active,
		episodeId,
		item.provider,
		item.seriesId
	]);
	(0, import_react.useEffect)(() => {
		const video = videoRef.current;
		if (!video || !active || !candidate) return;
		let hls = null;
		let gone = false;
		const src = /mydramawave\.com/i.test(candidate.url) ? mediaUrl(candidate.url) : candidate.url;
		const play = async () => {
			try {
				await video.play();
			} catch {
				video.muted = true;
				try {
					await video.play();
				} catch {}
			}
		};
		(async () => {
			if (candidate.format === "hls" && !video.canPlayType("application/vnd.apple.mpegurl")) {
				const mod = await import("../_libs/hls.js.mjs").then((n) => n.t);
				if (gone) return;
				const Hls = mod.default;
				if (!Hls.isSupported()) {
					video.src = src;
					play();
					return;
				}
				const player = new Hls({
					enableWorker: true,
					maxBufferLength: 12
				});
				hls = player;
				player.loadSource(src);
				player.attachMedia(video);
				player.on(Hls.Events.MANIFEST_PARSED, () => void play());
			} else {
				video.src = src;
				play();
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative h-full min-h-full w-full snap-start snap-always overflow-hidden bg-black",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref: videoRef,
				className: "absolute inset-0 h-full w-full object-cover",
				autoPlay: true,
				poster: item.posterUrl || void 0,
				playsInline: true,
				loop: false,
				muted,
				onEnded,
				onTimeUpdate: (event) => {
					const video = event.currentTarget;
					if (video.duration > 0) setProgress(video.currentTime / video.duration);
				},
				onPlay: () => setPaused(false),
				onPause: () => setPaused(true),
				onClick: () => {
					const video = videoRef.current;
					if (!video) return;
					if (video.paused) video.play();
					else video.pause();
				}
			}),
			(!active || !candidate) && item.posterUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: item.posterUrl,
				alt: "",
				className: "pointer-events-none absolute inset-0 h-full w-full object-cover"
			}) : null,
			paused && active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "pointer-events-none absolute inset-0 grid place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-16 place-items-center rounded-full bg-black/45 text-white",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-1 size-8 fill-current" })
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-0 bottom-[4.5rem] z-10 bg-linear-to-t from-black/75 via-black/25 to-transparent px-3 pt-12 pb-2 pr-14 text-white sm:px-4 sm:pr-20 lg:bottom-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-semibold sm:text-sm",
						children: ["@", providerLabel(item.provider)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 line-clamp-2 text-sm font-semibold leading-snug sm:text-base",
						children: title
					}),
					item.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 line-clamp-2 text-xs text-white/85 sm:text-sm",
						children: item.description
					}) : null,
					failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-white/80",
						children: "Video pratinjau tidak tersedia dari provider ini. Buka episode lengkap untuk mencoba pemutar utama, atau geser ke atas untuk video berikutnya."
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute right-2 bottom-[5.7rem] z-10 flex flex-col items-center gap-3 text-white sm:right-3 sm:gap-4 lg:bottom-8",
				children: [
					item.posterUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/drama/$provider/$seriesId",
						params: {
							provider: item.provider,
							seriesId: item.seriesId
						},
						className: "size-9 overflow-hidden rounded-full border-2 border-white sm:size-12",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: item.posterUrl,
							alt: "",
							className: "h-full w-full object-cover"
						})
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "grid place-items-center gap-0.5 text-[10px] font-semibold sm:gap-1 sm:text-xs",
						onClick: () => {
							const next = toggleWatchlist({
								provider: item.provider,
								seriesId: item.seriesId,
								title: item.title,
								originalTitle: item.originalTitle,
								posterUrl: item.posterUrl,
								episodeCount: item.episodeCount,
								savedAt: Date.now()
							});
							setSaved(next.some((entry) => entry.provider === item.provider && entry.seriesId === item.seriesId));
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: saved ? "size-6 fill-current text-[#ff2d55] sm:size-8" : "size-6 sm:size-8" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: saved ? "Disimpan" : "Suka" })]
					}),
					episodeId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/watch/$provider/$seriesId/$episodeId",
						params: {
							provider: item.provider,
							seriesId: item.seriesId,
							episodeId
						},
						onClick: () => maybeOpenMonetagAd(),
						search: { auto: true },
						className: "grid place-items-center gap-0.5 text-[10px] font-semibold sm:gap-1 sm:text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-6 sm:size-8" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Episode Lengkap" })]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "grid place-items-center gap-0.5 text-[10px] font-semibold sm:gap-1 sm:text-xs",
						onClick: () => {
							const prefix = previewPathPrefix(window.location.hostname, window.location.pathname) ?? "";
							const url = `${window.location.origin}${prefix}/drama/${item.provider}/${item.seriesId}`;
							if (navigator.share) navigator.share({
								title,
								url
							}).catch(() => void 0);
							else navigator.clipboard?.writeText(url);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-6 sm:size-7" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bagikan" })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-x-0 bottom-[4.5rem] z-10 h-0.5 bg-white/25 lg:bottom-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block h-full bg-white",
					style: { width: `${Math.min(100, progress * 100)}%` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onToggleMute,
				className: "absolute top-3 right-3 z-10 grid size-9 place-items-center rounded-full bg-black/40 text-white sm:top-4 sm:right-4 sm:size-10",
				"aria-label": muted ? "Unmute" : "Mute",
				children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-5" })
			})
		]
	});
}
function mediaUrl(url) {
	return `${typeof window === "undefined" ? "" : previewPathPrefix(window.location.hostname, window.location.pathname) ?? ""}/api/media?u=${encodeURIComponent(url)}`;
}
//#endregion
export { ShortsPage as component };
