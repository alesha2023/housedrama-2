import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as PageIntro, n as EmptyState, t as DramaGrid, y as usePrefs } from "./cards-Dd_haNas.mjs";
import { c as Route$12 } from "./router-02Yj-4nf.mjs";
import { t as SeoItemList } from "./seo-item-list-Hb2yKshb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/latest-Bwd4AFFI.js
var import_jsx_runtime = require_jsx_runtime();
function LatestPage() {
	const data = Route$12.useLoaderData();
	const { t } = usePrefs();
	const latest = data.sections.find((section) => section.id === "latest")?.items ?? [];
	const fresh = data.sections.find((section) => section.id === "new")?.items ?? [];
	const items = [...latest, ...fresh.filter((item) => !latest.some((have) => have.provider === item.provider && have.seriesId === item.seriesId))];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			eyebrow: t.newEyebrow,
			title: t.latestTitle,
			description: t.latestBody
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeoItemList, {
			items,
			name: "Drama China Terbaru dan Episode Baru"
		}),
		items.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DramaGrid, { items }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: t.noNew,
			body: t.noNewBody
		})
	] });
}
//#endregion
export { LatestPage as component };
