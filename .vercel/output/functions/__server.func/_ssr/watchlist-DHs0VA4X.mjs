import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as PageIntro, n as EmptyState, o as Poster, s as ProviderBadge, v as useDisplayTitles, y as usePrefs } from "./cards-Dd_haNas.mjs";
import { t as X } from "../_libs/lucide-react.mjs";
import { i as toggleWatchlist, r as readWatchlist } from "./storage-CrxvcQ_E.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/watchlist-DHs0VA4X.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function WatchlistPage() {
	const { t, contentLang } = usePrefs();
	const [items, setItems] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		const load = () => setItems(readWatchlist());
		load();
		window.addEventListener("dramaluma-library", load);
		return () => window.removeEventListener("dramaluma-library", load);
	}, []);
	const showTitle = useDisplayTitles(items.map((item) => item.originalTitle || item.title), contentLang);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
		title: t.watchlist,
		description: t.watchlistBody
	}), items.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-6 grid gap-3",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 rounded-3xl border border-line bg-surface p-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/drama/$provider/$seriesId",
				params: {
					provider: item.provider,
					seriesId: item.seriesId
				},
				className: "flex min-w-0 flex-1 items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-24 w-16 shrink-0 overflow-hidden rounded-2xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Poster, {
						src: item.posterUrl,
						alt: ""
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderBadge, { provider: item.provider }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1.5 block text-base font-semibold leading-snug break-words",
							children: showTitle(item.title, item.originalTitle)
						}),
						item.episodeCount ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-1 block text-xs text-muted",
							children: [
								item.episodeCount,
								" ",
								t.eps
							]
						}) : null
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": t.remove,
				className: "grid size-10 shrink-0 place-items-center rounded-full bg-bg text-muted",
				onClick: () => setItems(toggleWatchlist({
					...item,
					savedAt: Date.now()
				})),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
			})]
		}, `${item.provider}-${item.seriesId}`))
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: t.empty,
		body: t.watchlistEmpty,
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/discover",
			className: "font-semibold text-primary",
			children: t.discoverCta
		})
	})] });
}
//#endregion
export { WatchlistPage as component };
