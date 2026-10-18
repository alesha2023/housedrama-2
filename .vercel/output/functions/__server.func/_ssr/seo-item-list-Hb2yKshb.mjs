import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/seo-item-list-Hb2yKshb.js
var import_jsx_runtime = require_jsx_runtime();
/** Structured data for public catalog landing pages; does not alter the visible UI. */
function SeoItemList({ items, name }) {
	const visible = items.filter((item) => item.title?.trim() && item.provider && item.seriesId).slice(0, 30);
	if (!visible.length) return null;
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name,
		itemListOrder: "https://schema.org/ItemListOrderDescending",
		numberOfItems: visible.length,
		itemListElement: visible.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			url: `https://house-drama.web.id/drama/${encodeURIComponent(item.provider)}/${encodeURIComponent(item.seriesId)}`,
			name: (item.displayTitle || item.title).slice(0, 180)
		}))
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
		type: "application/ld+json",
		dangerouslySetInnerHTML: { __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }
	});
}
//#endregion
export { SeoItemList as t };
