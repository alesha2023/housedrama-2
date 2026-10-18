import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react, b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as isProviderId } from "./types-B7znlJsu.mjs";
import { _ as railTitle, c as Rail, g as pickTitle, h as pickDescription, l as TagPills, o as Poster, r as ErrorNote, s as ProviderBadge, u as byPopularity, v as useDisplayTitles, y as usePrefs } from "./cards-Dd_haNas.mjs";
import { p as Play } from "../_libs/lucide-react.mjs";
import { d as Route$18 } from "./router-02Yj-4nf.mjs";
import { t as maybeOpenMonetagAd } from "./monetag-Dx3ZioJW.mjs";
import { t as readHistory } from "./storage-CrxvcQ_E.mjs";
import { t as ProviderPicker } from "./provider-picker-BVwbhLFx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-j3n70Bjp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HomePage() {
	const initial = Route$18.useLoaderData();
	const search = Route$18.useSearch();
	const navigate = useNavigate();
	const { t, contentLang, uiLang } = usePrefs();
	const [data, setData] = (0, import_react.useState)(initial);
	const [history, setHistory] = (0, import_react.useState)([]);
	const [slide, setSlide] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => setData(initial), [initial]);
	(0, import_react.useEffect)(() => {
		setHistory(readHistory());
		const on = () => setHistory(readHistory());
		window.addEventListener("dramaluma-library", on);
		return () => window.removeEventListener("dramaluma-library", on);
	}, []);
	const hero = byPopularity(data.hero);
	const current = hero[slide] ?? hero[0];
	(0, import_react.useEffect)(() => {
		if (hero.length < 2) return;
		const timer = window.setInterval(() => {
			if (document.hidden) return;
			setSlide((value) => (value + 1) % hero.length);
		}, 4e3);
		return () => window.clearInterval(timer);
	}, [hero.length]);
	const showTitle = useDisplayTitles(history.map((item) => item.originalTitle || item.title), contentLang);
	const down = data.providers.filter((item) => !item.ok);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		down.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: `${t.providersDown} (${down.map((item) => item.id).join(", ")})` }) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "h-4 w-1 rounded-full bg-coral",
					"aria-hidden": "true"
				}), t.providerLabel]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderPicker, {
				value: search.provider ?? "all",
				onChange: (value) => {
					navigate({
						to: "/",
						search: value === "all" ? {} : { provider: value }
					});
				},
				className: "w-full max-w-md"
			})]
		}),
		current ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative overflow-hidden rounded-3xl bg-ink shadow-[0_16px_40px_rgb(17_18_22_/_0.12)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid lg:grid-cols-[1.3fr_0.7fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative aspect-[4/5] overflow-hidden sm:aspect-[16/9] lg:aspect-auto lg:min-h-[28rem]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-full transition-transform duration-700 ease-out",
						style: {
							width: `${hero.length * 100}%`,
							transform: `translateX(-${slide % Math.max(hero.length, 1) * (100 / Math.max(hero.length, 1))}%)`
						},
						children: hero.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative h-full shrink-0",
							style: { width: `${100 / Math.max(hero.length, 1)}%` },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Poster, {
									src: item.bannerUrl || item.posterUrl,
									alt: "",
									priority: true,
									className: "absolute inset-0 h-full w-full"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-linear-to-t from-ink via-ink/45 to-ink/10" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "pointer-events-none absolute inset-x-0 bottom-0 z-20 p-5 pb-8 text-white sm:p-8",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mb-3 flex flex-wrap gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderBadge, { provider: item.provider }), item.tags.slice(0, 3).map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "rounded-full bg-white/15 px-2 py-0.5 text-xs",
												children: tag
											}, tag))]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mb-2 text-xs font-semibold tracking-[0.16em] text-white/80 uppercase",
											children: uiLang === "id" ? "Unggulan" : "Featured"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
											className: "max-w-xl text-3xl sm:text-5xl",
											children: pickTitle(item, contentLang)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 max-w-xl line-clamp-3 text-sm text-white/85",
											children: pickDescription(item, contentLang) || t.heroFallback
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "pointer-events-auto mt-5 flex flex-wrap gap-2",
											children: [item.firstEpisodeId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
												to: "/watch/$provider/$seriesId/$episodeId",
												params: {
													provider: item.provider,
													seriesId: item.seriesId,
													episodeId: item.firstEpisodeId
												},
												onClick: () => maybeOpenMonetagAd(),
												search: { auto: true },
												className: "inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-ink",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 fill-current" }), t.play]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
												to: "/drama/$provider/$seriesId",
												params: {
													provider: item.provider,
													seriesId: item.seriesId
												},
												className: "inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-ink",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 fill-current" }), t.play]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/drama/$provider/$seriesId",
												params: {
													provider: item.provider,
													seriesId: item.seriesId
												},
												className: "inline-flex h-12 items-center rounded-full bg-white px-5 font-semibold text-ink",
												children: t.details
											})]
										})
									]
								})
							]
						}, `${item.provider}-${item.seriesId}`))
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden flex-col gap-2 bg-surface p-4 text-ink lg:flex",
					children: hero.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSlide(index),
						className: `flex items-center gap-3 rounded-2xl p-2 text-left ${index === slide ? "bg-bg" : "hover:bg-bg/70"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "h-16 w-12 overflow-hidden rounded-lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Poster, {
								src: item.posterUrl,
								alt: ""
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-semibold",
							children: pickTitle(item, contentLang)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted",
							children: item.tags[0] || item.provider
						})] })]
					}, `${item.provider}-${item.seriesId}`))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-center gap-2 py-3 lg:hidden",
				children: hero.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": `Show ${pickTitle(item, contentLang)}`,
					onClick: () => setSlide(index),
					className: `h-2.5 rounded-full ${index === slide ? "w-6 bg-primary" : "w-2.5 bg-line"}`
				}, `${item.provider}-${item.seriesId}-dot`))
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: t.catalogsEmpty }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4",
			children: [
				"romance",
				"revenge",
				"billionaire",
				"ceo",
				"fantasy",
				"historical",
				"completed"
			].map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/discover",
				search: { rail: id },
				className: "shrink-0 rounded-full bg-surface px-3.5 py-1.5 text-sm font-medium text-ink ring-1 ring-line",
				children: railTitle(uiLang, id, id)
			}, id))
		}),
		history.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-end justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold tracking-tight",
					children: t.continue
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/history",
					className: "text-sm font-semibold text-primary",
					children: t.viewAll
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2",
				children: history.slice(0, 12).map((item) => {
					const known = [...data.hero, ...data.sections.flatMap((section) => section.items)].find((card) => card.provider === item.provider && card.seriesId === item.seriesId);
					const tags = (item.tags?.length ? item.tags : known?.tags ?? []).slice(0, 2);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/watch/$provider/$seriesId/$episodeId",
						params: {
							provider: item.provider,
							seriesId: item.seriesId,
							episodeId: item.episodeId
						},
						onClick: () => maybeOpenMonetagAd(),
						search: { auto: true },
						className: "w-36 shrink-0 sm:w-44",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative aspect-poster overflow-hidden rounded-card",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Poster, {
									src: item.posterUrl,
									alt: item.title
								}), item.durationSec ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute inset-x-0 bottom-0 h-1 bg-black/35",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block h-full bg-primary",
										style: { width: `${Math.min(100, Math.max(4, item.positionSec / item.durationSec * 100))}%` }
									})
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-2 line-clamp-2 text-sm font-semibold",
								children: showTitle(item.title, item.originalTitle)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: item.episodeLabel
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagPills, { tags })
						]
					}, `${item.provider}-${item.seriesId}`);
				})
			})]
		}) : null,
		data.sections.filter((section) => section.id !== "featured").map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rail, {
			title: railTitle(uiLang, section.id, section.title),
			items: section.items,
			more: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLink, {
				id: section.id,
				label: t.viewAll
			})
		}, section.id))
	] });
}
function SectionLink({ id, label }) {
	const className = "text-sm font-semibold text-primary";
	if (id === "trending") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/trending",
		className,
		children: label
	});
	if (id === "latest" || id === "new") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/latest",
		className,
		children: label
	});
	if (isProviderId(id)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/provider/$provider",
		params: { provider: id },
		className,
		children: label
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/discover",
		search: { rail: id },
		className,
		children: label
	});
}
//#endregion
export { HomePage as component };
