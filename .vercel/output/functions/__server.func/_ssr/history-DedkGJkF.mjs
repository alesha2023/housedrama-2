import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as PageIntro, n as EmptyState, o as Poster, s as ProviderBadge, v as useDisplayTitles, y as usePrefs } from "./cards-Dd_haNas.mjs";
import { t as maybeOpenMonetagAd } from "./monetag-Dx3ZioJW.mjs";
import { t as readHistory } from "./storage-CrxvcQ_E.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/history-DedkGJkF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HistoryPage() {
	const { t, contentLang } = usePrefs();
	const [items, setItems] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		const load = () => setItems(readHistory());
		load();
		window.addEventListener("dramaluma-library", load);
		return () => window.removeEventListener("dramaluma-library", load);
	}, []);
	const showTitle = useDisplayTitles(items.map((item) => item.originalTitle || item.title), contentLang);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
		title: t.history,
		description: t.historyBody
	}), items.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-6 grid gap-3",
		children: items.map((item) => {
			const ratio = item.durationSec ? Math.min(100, Math.round(item.positionSec / item.durationSec * 100)) : 0;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/watch/$provider/$seriesId/$episodeId",
				params: {
					provider: item.provider,
					seriesId: item.seriesId,
					episodeId: item.episodeId
				},
				onClick: () => maybeOpenMonetagAd(),
				className: "flex items-center gap-3 rounded-card border border-line p-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-20 w-14 overflow-hidden rounded-xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Poster, {
						src: item.posterUrl,
						alt: ""
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderBadge, { provider: item.provider }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block truncate font-semibold",
							children: showTitle(item.title, item.originalTitle)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-muted",
							children: item.episodeLabel
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-2 block h-1 overflow-hidden rounded-full bg-line",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block h-full bg-primary",
								style: { width: `${ratio}%` }
							})
						})
					]
				})]
			}, `${item.provider}-${item.seriesId}-${item.episodeId}`);
		})
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: t.empty,
		body: t.historyEmpty
	})] });
}
//#endregion
export { HistoryPage as component };
