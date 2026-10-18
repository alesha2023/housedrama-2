import { o as __toESM } from "./_runtime.mjs";
import { C as require_jsx_runtime, X as require_react, b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { c as Rail, g as pickTitle, h as pickDescription, n as EmptyState, o as Poster, s as ProviderBadge, y as usePrefs } from "./_ssr/cards-Dd_haNas.mjs";
import { p as Play } from "./_libs/lucide-react.mjs";
import { r as Route$1 } from "./_ssr/router-02Yj-4nf.mjs";
import { i as toggleWatchlist, r as readWatchlist, t as readHistory } from "./_ssr/storage-CrxvcQ_E.mjs";
import { t as EpisodeGrid } from "./_ssr/player-s3WmOFTd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_seriesId-CRf1uezE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DetailPage() {
	const initial = Route$1.useLoaderData();
	const { t, contentLang } = usePrefs();
	const [data, setData] = (0, import_react.useState)(initial);
	const [saved, setSaved] = (0, import_react.useState)(false);
	const [resumeEntry, setResumeEntry] = (0, import_react.useState)(null);
	const drama = data.drama;
	(0, import_react.useEffect)(() => setData(initial), [initial]);
	(0, import_react.useEffect)(() => {
		if (!drama) return;
		setSaved(readWatchlist().some((item) => item.provider === drama.provider && item.seriesId === drama.seriesId));
		const loadHistory = () => setResumeEntry(readHistory().find((item) => item.provider === drama.provider && item.seriesId === drama.seriesId) ?? null);
		loadHistory();
		window.addEventListener("dramaluma-library", loadHistory);
		return () => window.removeEventListener("dramaluma-library", loadHistory);
	}, [drama]);
	if (!data.ok || !drama) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: t.dramaUnavailable,
		body: data.error || t.dramaMissing
	});
	const first = data.episodes[0];
	const canonicalUrl = `https://house-drama.web.id/drama/${encodeURIComponent(drama.provider)}/${encodeURIComponent(drama.seriesId)}`;
	const displayTitle = drama.displayTitle || drama.title;
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "TVSeries",
		url: canonicalUrl,
		mainEntityOfPage: canonicalUrl,
		name: drama.displayTitle || drama.title,
		alternateName: drama.originalTitle && drama.originalTitle !== drama.title ? drama.originalTitle : void 0,
		description: drama.displayDescription || drama.description || void 0,
		image: drama.posterUrl || void 0,
		numberOfEpisodes: drama.episodeCount || data.episodes.length || void 0,
		inLanguage: drama.language || void 0,
		genre: drama.tags,
		isAccessibleForFree: data.episodes.some((episode) => episode.access === "open") ? true : void 0
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
			type: "application/ld+json",
			dangerouslySetInnerHTML: { __html: JSON.stringify(jsonLd) }
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
			type: "application/ld+json",
			dangerouslySetInnerHTML: { __html: JSON.stringify({
				"@context": "https://schema.org",
				"@type": "BreadcrumbList",
				itemListElement: [
					{
						"@type": "ListItem",
						position: 1,
						name: "Beranda",
						item: "https://house-drama.web.id/"
					},
					{
						"@type": "ListItem",
						position: 2,
						name: "Drama",
						item: "https://house-drama.web.id/discover"
					},
					{
						"@type": "ListItem",
						position: 3,
						name: displayTitle,
						item: canonicalUrl
					}
				]
			}) }
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			"aria-label": "Breadcrumb",
			className: "mb-4 text-sm text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "hover:text-ink",
					children: "Beranda"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mx-2",
					"aria-hidden": "true",
					children: "/"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/discover",
					className: "hover:text-ink",
					children: "Drama"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mx-2",
					"aria-hidden": "true",
					children: "/"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-current": "page",
					className: "text-ink",
					children: displayTitle
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-hidden rounded-card",
				children: first ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/watch/$provider/$seriesId/$episodeId",
					params: {
						provider: drama.provider,
						seriesId: drama.seriesId,
						episodeId: first.episodeId
					},
					search: { auto: true },
					"aria-label": t.start,
					className: "relative block aspect-poster",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Poster, {
						src: drama.posterUrl,
						alt: pickTitle(drama, contentLang),
						priority: true,
						className: "absolute inset-0"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute inset-0 grid place-items-center bg-black/10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-16 place-items-center rounded-full bg-black/55 text-white",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-1 size-8 fill-current" })
						})
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "aspect-poster",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Poster, {
						src: drama.posterUrl,
						alt: pickTitle(drama, contentLang),
						priority: true
					})
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderBadge, { provider: drama.provider }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 text-4xl sm:text-5xl",
					children: pickTitle(drama, contentLang)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-2xl text-sm text-muted",
					children: pickDescription(drama, contentLang) || t.noSynopsis
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2 text-sm text-muted",
					children: [
						drama.language ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-surface px-3 py-1",
							children: drama.language
						}) : null,
						drama.episodeCount ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "rounded-full bg-surface px-3 py-1",
							children: [
								drama.episodeCount,
								" ",
								t.episodeUnit
							]
						}) : null,
						drama.completed === true ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-surface px-3 py-1",
							children: t.completed
						}) : null,
						drama.completed === false ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-surface px-3 py-1",
							children: t.ongoing
						}) : null,
						drama.playCount ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "rounded-full bg-surface px-3 py-1",
							children: [
								drama.playCount,
								" ",
								t.plays
							]
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: drama.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/search",
						search: {
							q: tag,
							provider: "all"
						},
						className: "rounded-full border border-line px-3 py-1 text-sm",
						children: tag
					}, tag))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-wrap gap-2",
					children: [first ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/watch/$provider/$seriesId/$episodeId",
						params: {
							provider: drama.provider,
							seriesId: drama.seriesId,
							episodeId: resumeEntry?.episodeId || first.episodeId
						},
						search: { auto: true },
						className: "inline-flex h-12 items-center rounded-full bg-primary px-5 font-semibold text-primary-ink",
						children: resumeEntry ? `${t.continue} · ${resumeEntry.episodeLabel}` : t.start
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "inline-flex h-12 items-center rounded-full border border-line px-5 font-semibold",
						onClick: () => {
							const next = toggleWatchlist({
								provider: drama.provider,
								seriesId: drama.seriesId,
								title: drama.displayTitle || drama.title,
								originalTitle: drama.originalTitle || drama.title,
								posterUrl: drama.posterUrl,
								episodeCount: drama.episodeCount,
								savedAt: Date.now()
							});
							setSaved(next.some((item) => item.seriesId === drama.seriesId && item.provider === drama.provider));
						},
						children: saved ? t.saved : t.save
					})]
				})
			] })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			"aria-label": "Explore more dramas",
			className: "mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/discover",
					className: "text-primary underline underline-offset-4",
					children: "Explore all dramas"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/provider/$provider",
					params: { provider: drama.provider },
					className: "text-primary underline underline-offset-4",
					children: ["Drama lainnya dari ", drama.provider]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/trending",
					className: "text-primary underline underline-offset-4",
					children: "Drama populer"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/latest",
					className: "text-primary underline underline-offset-4",
					children: "Drama terbaru"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 text-2xl",
				children: t.episodes
			}), data.episodes.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EpisodeGrid, {
				episodes: data.episodes,
				provider: drama.provider,
				seriesId: drama.seriesId
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: t.noEpisodeList
			})]
		}),
		data.alsoOn.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rail, {
			title: t.also,
			items: data.alsoOn
		}) : null,
		data.similar.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rail, {
			title: t.similar,
			items: data.similar
		}) : null,
		data.more.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rail, {
			title: t.more,
			items: data.more
		}) : null
	] });
}
//#endregion
export { DetailPage as component };
