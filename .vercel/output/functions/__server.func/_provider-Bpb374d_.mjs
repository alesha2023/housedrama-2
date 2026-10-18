import { o as __toESM } from "./_runtime.mjs";
import { C as require_jsx_runtime, X as require_react } from "./_libs/@tanstack/react-router+[...].mjs";
import { r as isProviderId } from "./_ssr/types-B7znlJsu.mjs";
import { i as PageIntro, n as EmptyState, r as ErrorNote, t as DramaGrid, y as usePrefs } from "./_ssr/cards-Dd_haNas.mjs";
import { i as providerLabel } from "./_ssr/catalog-DJ2VrmyW.mjs";
import { _ as getBrowseData, i as Route$2 } from "./_ssr/router-02Yj-4nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_provider-Bpb374d_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProviderPage() {
	const params = Route$2.useParams();
	const initial = Route$2.useLoaderData();
	const { t } = usePrefs();
	const provider = isProviderId(params.provider) ? params.provider : "anyreel";
	const [items, setItems] = (0, import_react.useState)(initial.items);
	const [page, setPage] = (0, import_react.useState)(1);
	const [hasMore, setHasMore] = (0, import_react.useState)(initial.hasMore);
	const [loading, setLoading] = (0, import_react.useState)(false);
	if (!isProviderId(params.provider)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: t.unknownProvider,
		body: t.unknownProviderBody
	});
	async function more() {
		setLoading(true);
		const next = await getBrowseData({ data: {
			lang: "en",
			provider,
			page: page + 1,
			rail: null
		} });
		setItems((current) => [...current, ...next.items]);
		setPage(next.page);
		setHasMore(next.hasMore);
		setLoading(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			eyebrow: t.providerLabel,
			title: providerLabel(provider),
			description: t.providerIntro
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children: initial.providers.some((item) => !item.ok) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: initial.providers.find((item) => !item.ok)?.error || t.providersDown }) : null
		}),
		items.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DramaGrid, { items }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: t.empty,
			body: t.providerEmpty
		}),
		hasMore ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => void more(),
			className: "mt-6 h-12 rounded-full bg-ink px-5 font-semibold text-player-ink",
			children: loading ? t.loading : t.loadMore
		}) : null
	] });
}
//#endregion
export { ProviderPage as component };
