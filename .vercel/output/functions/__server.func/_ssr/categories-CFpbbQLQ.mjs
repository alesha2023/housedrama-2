import { C as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as railTitle, i as PageIntro, t as DramaGrid, y as usePrefs } from "./cards-Dd_haNas.mjs";
import { u as Route$15 } from "./router-02Yj-4nf.mjs";
import { t as SeoItemList } from "./seo-item-list-Hb2yKshb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/categories-CFpbbQLQ.js
var import_jsx_runtime = require_jsx_runtime();
var GENRES = [
	"romance",
	"revenge",
	"billionaire",
	"ceo",
	"historical",
	"fantasy",
	"family",
	"comedy",
	"completed"
];
function CategoriesPage() {
	const data = Route$15.useLoaderData();
	const { t, uiLang } = usePrefs();
	const counts = /* @__PURE__ */ new Map();
	for (const item of data.items) for (const tag of item.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
	const tags = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 24);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			title: t.categories,
			description: t.categoriesDesc
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeoItemList, {
			items: data.items,
			name: "Kategori Drama China Pendek"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-5 flex flex-wrap gap-2",
			children: GENRES.map((genre) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/discover",
				search: { rail: genre },
				className: "rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-ink",
				children: railTitle(uiLang, genre, genre)
			}, genre))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex flex-wrap gap-2",
			children: tags.map(([tag, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/search",
				search: {
					q: tag,
					provider: "all"
				},
				className: "rounded-full border border-line px-3 py-2 text-sm",
				children: [tag, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-2 text-muted",
					children: count
				})]
			}, tag))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DramaGrid, { items: data.items.slice(0, 10) })
	] });
}
//#endregion
export { CategoriesPage as component };
