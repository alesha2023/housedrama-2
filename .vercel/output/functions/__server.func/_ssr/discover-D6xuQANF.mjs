import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as railTitle, i as PageIntro, n as EmptyState, r as ErrorNote, t as DramaGrid, y as usePrefs } from "./cards-Dd_haNas.mjs";
import { _ as getBrowseData, l as Route$14 } from "./router-02Yj-4nf.mjs";
import { t as SeoItemList } from "./seo-item-list-Hb2yKshb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/discover-D6xuQANF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DiscoverPage() {
	const initial = Route$14.useLoaderData();
	const { rail } = Route$14.useSearch();
	const { t, uiLang } = usePrefs();
	const [data, setData] = (0, import_react.useState)(initial);
	const [page, setPage] = (0, import_react.useState)(1);
	const [loading, setLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setData(initial);
		setPage(1);
	}, [initial]);
	async function more() {
		const nextPage = page + 1;
		setLoading(true);
		const next = await getBrowseData({ data: {
			lang: "en",
			provider: "all",
			page: nextPage,
			rail: rail ?? null
		} });
		setData((current) => ({
			...next,
			items: [...current.items, ...next.items.filter((item) => !current.items.some((have) => have.provider === item.provider && have.seriesId === item.seriesId))]
		}));
		setPage(nextPage);
		setLoading(false);
	}
	const title = rail ? railTitle(uiLang, rail, rail.replace(/-/g, " ")) : t.discover;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			eyebrow: "HouseDrama",
			title,
			description: t.discoverBody
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeoItemList, {
			items: data.items,
			name: title
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children: data.providers.some((item) => !item.ok) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: t.providersDown }) : null
		}),
		data.items.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DramaGrid, { items: data.items }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: t.empty,
			body: t.emptyBrowse
		}),
		data.hasMore ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => void more(),
			disabled: loading,
			className: "mt-6 h-12 rounded-full bg-ink px-5 font-semibold text-player-ink",
			children: loading ? t.loading : t.loadMore
		}) : null
	] });
}
//#endregion
export { DiscoverPage as component };
