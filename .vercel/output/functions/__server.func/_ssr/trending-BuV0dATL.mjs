import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as PageIntro, n as EmptyState, t as DramaGrid, y as usePrefs } from "./cards-Dd_haNas.mjs";
import { a as Route$6 } from "./router-02Yj-4nf.mjs";
import { t as SeoItemList } from "./seo-item-list-Hb2yKshb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trending-BuV0dATL.js
var import_jsx_runtime = require_jsx_runtime();
function TrendingPage() {
	const data = Route$6.useLoaderData();
	const { t } = usePrefs();
	const items = data.sections.find((section) => section.id === "trending")?.items ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			eyebrow: t.rankEyebrow,
			title: t.trendTitle,
			description: t.trendBody
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeoItemList, {
			items,
			name: "Drama China Pendek Populer dan Trending"
		}),
		items.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DramaGrid, { items }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: t.noRank,
			body: t.noRankBody
		})
	] });
}
//#endregion
export { TrendingPage as component };
