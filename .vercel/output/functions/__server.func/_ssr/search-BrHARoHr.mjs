import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PROVIDERS } from "./types-B7znlJsu.mjs";
import { i as PageIntro, n as EmptyState, r as ErrorNote, t as DramaGrid, y as usePrefs } from "./cards-Dd_haNas.mjs";
import { E as ChevronRight, g as LoaderCircle } from "../_libs/lucide-react.mjs";
import { b as getSearchData, s as Route$10 } from "./router-02Yj-4nf.mjs";
import { t as ProviderPicker } from "./provider-picker-BVwbhLFx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-BrHARoHr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SearchPage() {
	const initial = Route$10.useLoaderData();
	const search = Route$10.useSearch();
	const navigate = useNavigate();
	const { t } = usePrefs();
	const query = search.q ?? "";
	const [draft, setDraft] = (0, import_react.useState)(query);
	const [data, setData] = (0, import_react.useState)(initial);
	const [page, setPage] = (0, import_react.useState)(1);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const provider = ["all", ...PROVIDERS].includes(search.provider ?? "all") ? search.provider ?? "all" : "all";
	(0, import_react.useEffect)(() => setDraft(query), [query]);
	(0, import_react.useEffect)(() => {
		setData(initial);
		setPage(1);
	}, [initial]);
	(0, import_react.useEffect)(() => {
		const handle = window.setTimeout(() => {
			if (draft.trim() === query) return;
			navigate({
				to: "/search",
				search: {
					q: draft.trim(),
					provider
				}
			});
		}, 350);
		return () => window.clearTimeout(handle);
	}, [
		draft,
		navigate,
		provider,
		query
	]);
	async function searchFor(nextQuery) {
		const q = nextQuery.trim();
		setDraft(q);
		setLoading(true);
		navigate({
			to: "/search",
			search: {
				...q ? { q } : {},
				...provider === "all" ? {} : { provider }
			}
		});
		try {
			const next = await getSearchData({ data: {
				q,
				lang: "en",
				provider,
				page: 1
			} });
			setData(next);
			setPage(1);
		} finally {
			setLoading(false);
		}
	}
	async function more() {
		const nextPage = page + 1;
		setLoading(true);
		try {
			const next = await getSearchData({ data: {
				q: query,
				lang: "en",
				provider,
				page: nextPage
			} });
			setData((current) => ({
				...next,
				items: [...current.items, ...next.items],
				suggestions: current.suggestions
			}));
			setPage(nextPage);
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			title: t.search,
			description: t.searchIntro
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-5 flex flex-col gap-3 sm:flex-row",
			onSubmit: (event) => {
				event.preventDefault();
				searchFor(draft);
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: draft,
					onChange: (event) => setDraft(event.target.value),
					placeholder: t.searchPlaceholder,
					className: "h-12 min-w-0 flex-1 rounded-full border border-line bg-white px-5",
					"aria-label": t.search
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "submit",
					disabled: loading,
					className: "inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-ink disabled:opacity-60",
					"aria-busy": loading,
					children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "size-4 animate-spin",
						"aria-hidden": "true"
					}) : null, loading ? t.searching : t.search]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderPicker, {
				value: provider,
				onChange: (value) => void navigate({
					to: "/search",
					search: {
						q: query,
						...value === "all" ? {} : { provider: value }
					}
				}),
				className: "w-full sm:w-56",
				label: t.providerLabel
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children: data.providers.some((item) => !item.ok) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { message: t.providersDown }) : null
		}),
		draft.trim() && data.suggestions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative z-30",
			"aria-label": "Saran pencarian",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute left-0 right-0 top-2 max-h-[min(60vh,24rem)] overflow-y-auto rounded-2xl border border-line bg-surface shadow-xl",
				children: data.suggestions.filter((suggestion) => {
					const typed = draft.trim().toLocaleLowerCase();
					const title = suggestion.toLocaleLowerCase();
					return title.includes(typed) || typed.split(/\\s+/).every((word) => title.includes(word));
				}).slice(0, 8).map((suggestion) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onMouseDown: (event) => event.preventDefault(),
					onClick: () => void searchFor(suggestion),
					className: "flex min-h-12 w-full items-center justify-between gap-3 border-b border-line/70 px-4 py-3 text-left text-sm last:border-b-0 hover:bg-primary/5 focus-visible:bg-primary/5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "min-w-0 flex-1",
						children: suggestion
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 shrink-0 text-muted" })]
				}, suggestion))
			})
		}) : null,
		loading && !data.items.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-6 text-sm text-muted",
			children: t.searching
		}) : null,
		data.items.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DramaGrid, { items: data.items }) : query && !loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: t.noMatches,
			body: t.noMatchesBody
		}) : null,
		data.hasMore && query ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => void more(),
			className: "mt-6 h-12 rounded-full bg-ink px-5 font-semibold text-player-ink",
			children: t.loadMore
		}) : null
	] });
}
//#endregion
export { SearchPage as component };
