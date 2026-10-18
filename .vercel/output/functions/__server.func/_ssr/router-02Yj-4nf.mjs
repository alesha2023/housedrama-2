import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, S as useRouter, X as require_react, _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, p as useRouterState, v as createFileRoute, y as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { r as isProviderId, t as PROVIDERS } from "./types-B7znlJsu.mjs";
import { a as PageSkeleton, d as cn, f as CONTENT_LANGS, m as UI_LANGS, p as PrefsProvider, y as usePrefs } from "./cards-Dd_haNas.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { a as visibleProviders, n as loadBrowse } from "./catalog-DJ2VrmyW.mjs";
import { C as Compass, S as Download, a as UserRound, b as Hash, d as Search, h as Menu, i as Users, l as Sparkles, m as Moon, o as TriangleAlert, s as Sun, t as X, v as House, w as Clock3 } from "../_libs/lucide-react.mjs";
import { a as number, c as union, i as literal, n as array, o as object, r as boolean, s as string, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-Xo5l4zQC.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var api_exports = /* @__PURE__ */ __exportAll({
	adminLogin: () => adminLogin,
	getAdminData: () => getAdminData,
	getBrowseData: () => getBrowseData,
	getDetailData: () => getDetailData,
	getHomeData: () => getHomeData,
	getSearchData: () => getSearchData,
	getShortsData: () => getShortsData,
	getStreamData: () => getStreamData,
	getWatchData: () => getWatchData,
	reportPlayback: () => reportPlayback,
	testFreeReelsApi: () => testFreeReelsApi,
	updateAdminSettings: () => updateAdminSettings
});
var providerSchema = _enum(["all", ...PROVIDERS]);
var getHomeData = createServerFn({ method: "GET" }).validator(object({
	lang: string().min(2).max(12).default("id"),
	provider: _enum(["all", ...PROVIDERS]).default("all")
})).handler(createSsrRpc("786a73520a51aa0595381e5450138fde7c5d93428966ca6cac3c523504159d4f"));
var getBrowseData = createServerFn({ method: "GET" }).validator(object({
	lang: string().min(2).max(12).default("id"),
	provider: providerSchema.default("all"),
	page: number().int().min(1).max(20).default(1),
	rail: string().max(40).nullable().optional()
})).handler(createSsrRpc("c05b815f71d2f077ba3d559eeec639219e867eb3f2d3228aa552a7d3ef48994d"));
var getSearchData = createServerFn({ method: "GET" }).validator(object({
	q: string().max(80).default(""),
	lang: string().min(2).max(12).default("id"),
	provider: providerSchema.default("all"),
	page: number().int().min(1).max(20).default(1)
})).handler(createSsrRpc("61f81ff5feeefeaa94d83a92a007a168d8e11982c92d0802004ccf0bd154630c"));
var getShortsData = createServerFn({ method: "GET" }).validator(object({
	lang: string().min(2).max(12).default("id"),
	page: number().int().min(1).max(20).default(1)
})).handler(createSsrRpc("1aa2564cf941911a0abbd3150139a112143d1e3d8cba60adb4775233066f6487"));
var getDetailData = createServerFn({ method: "GET" }).validator(object({
	provider: _enum(PROVIDERS),
	seriesId: string().min(1).max(80),
	lang: string().min(2).max(12).default("id")
})).handler(createSsrRpc("e2fe3ac46f4e37203c38161be7f17fdacc8b512a59328b0a6efc4941fe55a752"));
var getWatchData = createServerFn({ method: "GET" }).validator(object({
	provider: _enum(PROVIDERS),
	seriesId: string().min(1).max(80),
	episodeId: string().min(1).max(80),
	lang: string().min(2).max(12).default("id")
})).handler(createSsrRpc("44c47f8fedf0a2b952567b206dee2e8f209465e7794578b84bd7f10cc4242714"));
var getStreamData = createServerFn({ method: "GET" }).validator(object({
	provider: _enum(PROVIDERS),
	seriesId: string().min(1).max(80),
	episodeId: string().min(1).max(80),
	lang: string().min(2).max(12).default("id")
})).handler(createSsrRpc("a9e1ff885b50c69cb9c13e0321ceb6dc7af4a8355d4ef23233133b2d13ced664"));
createServerFn({ method: "POST" }).validator(object({
	lang: string().min(2).max(12),
	titles: array(string().max(180)).max(40)
})).handler(createSsrRpc("075dc0356bf3ddb9948a198caba9f9e112022a456432ce7fc082b570b7a11300"));
var reportPlayback = createServerFn({ method: "POST" }).validator(object({
	provider: _enum(PROVIDERS),
	ok: boolean()
})).handler(createSsrRpc("712f09fba6e5b71b305eaa19dd917574602ec92068645d7cf7b77145c07e5889"));
var adminLogin = createServerFn({ method: "POST" }).validator(object({ password: string().min(1).max(80) })).handler(createSsrRpc("feb57e7b65f276d4b52a46c4dd1d36056d3c202498ee7741cbdbdceed8707d0d"));
var getAdminData = createServerFn({ method: "POST" }).validator(object({ token: string().min(8) })).handler(createSsrRpc("62256143c9983dfaa89fc56a2fb28a1b36aaa30213630a3d313d6c6a51ff369e"));
var updateAdminSettings = createServerFn({ method: "POST" }).validator(object({
	token: string().min(8),
	provider: _enum(PROVIDERS).optional(),
	enabled: boolean().optional(),
	section: string().max(40).optional(),
	sectionEnabled: boolean().optional()
})).handler(createSsrRpc("c70d75d2cec19cede1bf35cda2337598f5b89fb558401ea97850b33270af6164"));
var testFreeReelsApi = createServerFn({ method: "POST" }).validator(object({
	token: string().min(8),
	baseUrl: string().url().max(300).default("https://freereels.narto-drama.com/api")
})).handler(createSsrRpc("013928a25cbaf1cade96ee2987ca9397b72ed762fe2924ad3cd0826149c22122"));
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-02Yj-4nf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* Path-based preview hosts serve the dev server under `/{port_id}/` and strip
* that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
* prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
* client routing and generated links aligned with the public URL.
*/
var PATH_BASED_PREVIEW_HOSTS = /* @__PURE__ */ new Set([
	"preview.grok.genai.mil",
	"preview.grok.mil",
	"preview.grokgsac.com"
]);
var PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;
function previewPathPrefix(hostname, pathname) {
	if (!PATH_BASED_PREVIEW_HOSTS.has(hostname.toLowerCase())) return void 0;
	return PORT_ID_PREFIX.exec(pathname)?.[0];
}
function prefixRewrite(prefix) {
	return {
		input: ({ url }) => {
			if (url.pathname === prefix) url.pathname = "/";
			else if (url.pathname.startsWith(`${prefix}/`)) url.pathname = url.pathname.slice(prefix.length);
			return url;
		},
		output: ({ url }) => {
			url.pathname = `${prefix}${url.pathname}`;
			return url;
		}
	};
}
function previewPathRewrite() {
	if (typeof window === "undefined") return void 0;
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
	return prefix ? prefixRewrite(prefix) : void 0;
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function Logo({ className = "h-12 w-auto" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: "/logo.png?v=4",
		alt: "HouseDrama",
		className
	});
}
var LINKS = [
	{
		to: "/",
		key: "home"
	},
	{
		to: "/discover",
		key: "discover"
	},
	{
		to: "/latest",
		key: "latest"
	},
	{
		to: "/trending",
		key: "trending"
	},
	{
		to: "/categories",
		key: "categories"
	}
];
function VisitorCounter() {
	const { uiLang } = usePrefs();
	const [counts, setCounts] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const update = async () => {
			try {
				let visitorId = window.localStorage.getItem("housedrama_visitor_id");
				if (!visitorId) {
					visitorId = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `hd-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
					window.localStorage.setItem("housedrama_visitor_id", visitorId);
				}
				const response = await fetch("/api/visitor-count", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ visitorId })
				});
				if (!response.ok) return;
				const data = await response.json();
				if (!cancelled && Number.isFinite(data.total) && Number.isFinite(data.today)) setCounts(data);
			} catch {}
		};
		update();
		return () => {
			cancelled = true;
		};
	}, []);
	if (!counts) return null;
	const stats = [{
		label: uiLang === "en" ? "Total visitors" : uiLang === "hi" ? "कुल आगंतुक" : uiLang === "fil" ? "Kabuuang bisita" : "Total pengunjung",
		value: counts.total,
		Icon: Users
	}, {
		label: uiLang === "en" ? "Visitors today" : uiLang === "hi" ? "आज के आगंतुक" : uiLang === "fil" ? "Mga bisita ngayon" : "Pengunjung hari ini",
		value: counts.today,
		Icon: UserRound
	}];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "mx-auto grid w-full max-w-md grid-cols-2 gap-3 py-2",
		"aria-label": "Statistik pengunjung",
		children: stats.map(({ label, value, Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-center gap-3 rounded-2xl border border-primary/15 bg-white/75 p-3 shadow-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-5",
					"aria-hidden": "true"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
					className: "block text-lg font-bold leading-tight tabular-nums text-primary",
					children: value.toLocaleString("id-ID")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-1 block text-[11px] leading-tight text-muted",
					children: label
				})]
			})]
		}, label))
	});
}
function PwaInstallPrompt() {
	const [visible, setVisible] = (0, import_react.useState)(false);
	const [installPrompt, setInstallPrompt] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let timer;
		const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
		const wasHandled = () => {
			try {
				return window.localStorage.getItem("housedrama_pwa_prompt_handled") === "1" || window.localStorage.getItem("housedrama_pwa_installed") === "1";
			} catch {
				return true;
			}
		};
		if (isStandalone() || wasHandled()) return;
		const onBeforeInstallPrompt = (event) => {
			event.preventDefault();
			if (wasHandled() || isStandalone()) return;
			setInstallPrompt(event);
			timer = window.setTimeout(() => setVisible(true), 1800);
		};
		const onAppInstalled = () => {
			try {
				window.localStorage.setItem("housedrama_pwa_installed", "1");
				window.localStorage.setItem("housedrama_pwa_prompt_handled", "1");
			} catch {}
			setVisible(false);
		};
		window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
		window.addEventListener("appinstalled", onAppInstalled);
		return () => {
			if (timer !== void 0) window.clearTimeout(timer);
			window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
			window.removeEventListener("appinstalled", onAppInstalled);
		};
	}, []);
	const dismiss = () => {
		setVisible(false);
		try {
			window.localStorage.setItem("housedrama_pwa_prompt_handled", "1");
		} catch {}
	};
	if (!visible || !installPrompt) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-3",
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": "pwa-install-title",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hd-pwa-popup relative w-full max-w-[280px] rounded-2xl border border-line bg-surface p-3.5 text-ink shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: dismiss,
					"aria-label": "Tutup popup",
					className: "absolute right-2 top-2 grid size-8 place-items-center rounded-full text-muted hover:bg-surface-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto mb-2 grid size-10 place-items-center rounded-xl bg-primary/12 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "pwa-install-title",
					className: "text-center text-base font-bold",
					children: "Pasang HouseDrama"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-center text-xs leading-[1.4rem] text-muted",
					children: "Tambahkan HouseDrama seperti aplikasi agar lebih mudah dibuka dari layar utama HP."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						(async () => {
							try {
								await installPrompt.prompt();
								await installPrompt.userChoice;
								dismiss();
							} catch {
								dismiss();
							}
						})();
					},
					className: "mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Pasang HouseDrama"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: dismiss,
					className: "mt-1.5 w-full rounded-full px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface-2",
					children: "Nanti saja"
				})
			]
		})
	});
}
function Shell({ children }) {
	const { t, uiLang, setUiLang, contentLang, setContentLang } = usePrefs();
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const watching = pathname.startsWith("/watch/");
	const shorts = pathname === "/shorts";
	const [open, setOpen] = (0, import_react.useState)(false);
	const [theme, setTheme] = (0, import_react.useState)("light");
	(0, import_react.useEffect)(() => {
		const nextTheme = window.localStorage.getItem("housedrama_theme") === "dark" ? "dark" : "light";
		setTheme(nextTheme);
		document.documentElement.dataset.theme = nextTheme;
		document.documentElement.style.colorScheme = nextTheme;
	}, []);
	const changeTheme = (nextTheme) => {
		setTheme(nextTheme);
		document.documentElement.dataset.theme = nextTheme;
		document.documentElement.style.colorScheme = nextTheme;
		try {
			window.localStorage.setItem("housedrama_theme", nextTheme);
		} catch {}
	};
	const labels = {
		home: t.home,
		discover: t.discover,
		latest: t.latest,
		trending: t.trending,
		categories: t.categories
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("min-h-dvh", watching ? "bg-player text-player-ink" : shorts ? "bg-black text-white" : "page-bg text-ink"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootSplash, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PwaInstallPrompt, {}),
			watching || shorts ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-40 border-b border-line/70 bg-white/75 backdrop-blur-xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-16 max-w-6xl items-center gap-1 px-2 sm:gap-2 sm:px-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "flex shrink-0 items-center",
							onClick: () => setOpen(false),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { className: "h-8 w-auto max-w-[142px] sm:h-10 sm:max-w-none" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "ml-4 hidden items-center gap-1 lg:flex",
							"aria-label": "Primary",
							children: LINKS.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: link.to,
								className: "rounded-full px-3 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-ink data-[status=active]:bg-surface data-[status=active]:text-ink",
								activeOptions: { exact: link.to === "/" },
								children: labels[link.key]
							}, link.to))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex min-w-0 items-center gap-0 sm:gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "sr-only",
									htmlFor: "header-language-select",
									children: "Choose language"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									id: "header-language-select",
									"aria-label": "Choose language",
									value: uiLang,
									className: "h-9 w-[82px] shrink-0 rounded-full border border-line bg-white/80 px-1.5 text-[11px] font-bold text-ink shadow-sm hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary sm:h-10 sm:w-auto sm:max-w-[108px] sm:px-3 sm:text-xs",
									onChange: (event) => setUiLang(event.target.value),
									children: UI_LANGS.map((lang) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: lang.id,
										children: lang.id === "hi" ? "🇮🇳 हिन्दी" : lang.id === "fil" ? "🇵🇭 Filipino" : lang.id === "id" ? "🇮🇩 Indonesia" : "🇺🇸 English"
									}, lang.id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/search",
									"aria-label": t.search,
									className: "grid size-8 shrink-0 place-items-center rounded-full hover:bg-surface sm:size-11",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": theme === "dark" ? "Ganti ke tema terang" : "Ganti ke tema gelap",
									title: theme === "dark" ? "Tema terang" : "Tema gelap",
									className: "grid size-8 shrink-0 place-items-center rounded-full hover:bg-surface sm:size-11",
									onClick: () => changeTheme(theme === "dark" ? "light" : "dark"),
									children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/watchlist",
									"aria-label": t.watchlist,
									className: "hidden size-11 place-items-center rounded-full hover:bg-surface sm:grid",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "grid size-8 shrink-0 place-items-center rounded-full hover:bg-surface sm:size-11 lg:hidden",
									"aria-label": "Menu",
									onClick: () => setOpen((value) => !value),
									children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
								})
							]
						})
					]
				}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-t border-line bg-bg px-4 py-3 lg:hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1",
						children: [
							LINKS.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: link.to,
								onClick: () => setOpen(false),
								className: "rounded-xl px-3 py-3 text-base font-medium hover:bg-surface",
								children: labels[link.key]
							}, link.to)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/shorts",
								onClick: () => setOpen(false),
								className: "rounded-xl px-3 py-3 hover:bg-surface",
								children: t.shorts
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/history",
								onClick: () => setOpen(false),
								className: "rounded-xl px-3 py-3 hover:bg-surface",
								children: t.history
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 rounded-2xl border border-line bg-surface/70 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-center gap-2 text-sm font-semibold text-ink",
									children: [theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4" }), "Ganti tema"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => changeTheme("light"),
										className: cn("flex h-10 items-center justify-center gap-2 rounded-xl border text-sm", theme === "light" ? "border-primary bg-primary/10 text-primary" : "border-line bg-bg text-muted"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4" }), " Terang"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => changeTheme("dark"),
										className: cn("flex h-10 items-center justify-center gap-2 rounded-xl border text-sm", theme === "dark" ? "border-primary bg-primary/10 text-primary" : "border-line bg-bg text-muted"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4" }), " Gelap"]
									})]
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "h-11 rounded-xl border border-line bg-surface px-3",
							value: uiLang,
							onChange: (event) => setUiLang(event.target.value),
							children: UI_LANGS.map((lang) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: lang.id,
								children: lang.label
							}, lang.id))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "h-11 rounded-xl border border-line bg-surface px-3",
							value: contentLang,
							onChange: (event) => setContentLang(event.target.value),
							children: CONTENT_LANGS.map((lang) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: lang.id,
								children: lang.label
							}, lang.id))
						})]
					})]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: cn(watching || shorts ? "h-dvh overflow-hidden" : "mx-auto max-w-6xl px-4 pt-5 pb-28 lg:pb-16"),
				children
			}),
			watching || shorts ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-line pb-28 lg:pb-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-6 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-2.5",
							"aria-label": "Social",
							children: SOCIALS.map((item) => {
								const Icon = item.icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: item.href,
									target: "_blank",
									rel: "noreferrer",
									"aria-label": item.name,
									className: `grid size-10 place-items-center rounded-full border shadow-sm transition-transform hover:scale-105 ${item.className}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {})
								}, item.name);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							className: "flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted",
							"aria-label": "Footer",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/discover",
									className: "hover:text-ink",
									children: t.discover
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/latest",
									className: "hover:text-ink",
									children: t.latest
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/trending",
									className: "hover:text-ink",
									children: t.trending
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/categories",
									className: "hover:text-ink",
									children: t.categories
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/shorts",
									className: "hover:text-ink",
									children: t.shorts
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/about",
									className: "hover:text-ink",
									children: t.about
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/privacy",
									className: "hover:text-ink",
									children: t.privacy
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/terms",
									className: "hover:text-ink",
									children: t.terms
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "w-full max-w-3xl border-t border-line/70 pt-4",
							"aria-labelledby": "footer-topics-title",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "footer-topics-title",
								className: "mb-3 text-sm font-semibold text-ink",
								children: uiLang === "en" ? "Explore by topic" : uiLang === "hi" ? "विषय के अनुसार खोजें" : uiLang === "fil" ? "Mag-explore ayon sa paksa" : "Jelajahi berdasarkan topik"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap justify-center gap-2",
								children: [
									{
										label: uiLang === "en" ? "Chinese Short Dramas" : uiLang === "hi" ? "चीनी शॉर्ट ड्रामा" : uiLang === "fil" ? "Chinese Short Dramas" : "Drama China subtitle Indonesia",
										rail: "romance"
									},
									{
										label: uiLang === "en" ? "Romance Dramas" : uiLang === "hi" ? "रोमांस ड्रामा" : uiLang === "fil" ? "Romance Dramas" : "Drama romantis",
										rail: "romance"
									},
									{
										label: uiLang === "en" ? "CEO Romance" : uiLang === "hi" ? "CEO रोमांस" : uiLang === "fil" ? "CEO Romance" : "Drama CEO",
										rail: "ceo"
									},
									{
										label: uiLang === "en" ? "Revenge Dramas" : uiLang === "hi" ? "बदले की कहानी" : uiLang === "fil" ? "Revenge Dramas" : "Drama balas dendam",
										rail: "revenge"
									},
									{
										label: uiLang === "en" ? "Fantasy Dramas" : uiLang === "hi" ? "फैंटेसी ड्रामा" : uiLang === "fil" ? "Fantasy Dramas" : "Drama fantasi",
										rail: "fantasy"
									},
									{
										label: uiLang === "en" ? "Historical Dramas" : uiLang === "hi" ? "ऐतिहासिक ड्रामा" : uiLang === "fil" ? "Historical Dramas" : "Drama sejarah",
										rail: "historical"
									},
									{
										label: uiLang === "en" ? "Completed Dramas" : uiLang === "hi" ? "पूरे हो चुके ड्रामा" : uiLang === "fil" ? "Kumpletong Drama" : "Drama tamat",
										rail: "completed"
									},
									{
										label: uiLang === "en" ? "Latest Dramas" : uiLang === "hi" ? "नवीनतम ड्रामा" : uiLang === "fil" ? "Pinakabagong Drama" : "Drama terbaru",
										rail: "latest"
									}
								].map((topic) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: topic.rail === "latest" ? "/latest" : "/discover",
									search: topic.rail === "latest" ? void 0 : { rail: topic.rail },
									className: "inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-3 py-1.5 text-xs text-muted shadow-sm transition-colors hover:border-primary hover:text-primary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary",
										"aria-hidden": "true",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, { className: "size-3.5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: topic.label })]
								}, topic.label))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisitorCounter, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "max-w-md text-xs leading-relaxed text-muted",
							children: t.footerNote
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted",
							children: uiLang === "en" ? "HouseDrama · Short-drama catalog from multiple providers" : uiLang === "hi" ? "HouseDrama · कई प्रदाताओं के शॉर्ट ड्रामा का कैटलॉग" : uiLang === "fil" ? "HouseDrama · Katalog ng maiikling drama mula sa iba't ibang provider" : "HouseDrama · Katalog drama pendek dari berbagai penyedia"
						})
					]
				})
			}),
			watching ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: cn("fixed inset-x-0 bottom-0 z-40 lg:hidden", shorts ? "bg-black/55 text-white backdrop-blur-md [&_a]:text-white/75 [&_a[data-status=active]]:text-white" : "border-t border-line/80 bg-white/90 backdrop-blur-xl"),
				"aria-label": "Mobile",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-5 px-1 py-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
							to: "/",
							label: t.home,
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-5" }),
							exact: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
							to: "/discover",
							label: t.discover,
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
							to: "/shorts",
							label: t.shorts,
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
							to: "/search",
							label: t.search,
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
							to: "/watchlist",
							label: t.watchlist,
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-5" })
						})
					]
				})
			})
		]
	});
}
function BootSplash() {
	const [gone, setGone] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const started = window.__boot ?? Date.now();
		const left = Math.max(0, 1e3 - (Date.now() - started));
		const remove = window.setTimeout(() => setGone(true), left);
		return () => window.clearTimeout(remove);
	}, []);
	if (gone) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "boot-splash",
		role: "status",
		"aria-label": "Loading HouseDrama",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "boot-splash__glow" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { className: "boot-splash__logo h-16 w-auto" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "boot-splash__track",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
			})
		]
	});
}
function Tab({ to, label, icon, exact = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		activeOptions: { exact },
		className: "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted data-[status=active]:text-primary",
		children: [icon, label]
	});
}
var SOCIALS = [
	{
		name: "Facebook",
		href: "https://www.facebook.com/profile.php?id=61595327641450",
		icon: FacebookIcon,
		className: "bg-[#1877F2] text-white border-[#1877F2]"
	},
	{
		name: "Instagram",
		href: "https://www.instagram.com/",
		icon: InstagramIcon,
		className: "bg-gradient-to-br from-[#FEDA75] via-[#E4405F] to-[#833AB4] text-white border-transparent"
	},
	{
		name: "TikTok",
		href: "https://www.tiktok.com/@housedrama5",
		icon: TikTokIcon,
		className: "bg-[#111111] text-white border-[#111111]"
	},
	{
		name: "YouTube",
		href: "https://www.youtube.com/",
		icon: YouTubeIcon,
		className: "bg-[#FF0000] text-white border-[#FF0000]"
	}
];
function SocialGlyph({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: "size-5",
		"aria-hidden": "true",
		children
	});
}
function FacebookIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialGlyph, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		fill: "currentColor",
		d: "M24 12.073C24 5.446 18.627 0 12 0S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
	}) });
}
function InstagramIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialGlyph, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		fill: "currentColor",
		d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
	}) });
}
function TikTokIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialGlyph, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		fill: "currentColor",
		d: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
	}) });
}
function YouTubeIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialGlyph, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		fill: "currentColor",
		d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
	}) });
}
var styles_default = "/assets/styles-BQd5HArU.css";
var getInitialCatalogLang = createServerFn({ method: "GET" }).handler(createSsrRpc("83a1fcf8ff0201d6d5955be7fba162e9bad02581b5361d07b30f5fce22cced54"));
var Route$19 = createRootRoute({
	loader: async () => ({ lang: await getInitialCatalogLang() }),
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "HouseDrama — Chinese Short Dramas Online" },
			{
				name: "description",
				content: "Discover Chinese short dramas on HouseDrama. Explore romance, revenge, CEO stories, fantasy, and short-drama episodes from multiple providers."
			},
			{
				property: "og:site_name",
				content: "HouseDrama"
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				property: "og:title",
				content: "HouseDrama — Chinese Short Dramas Online"
			},
			{
				property: "og:description",
				content: "Explore Chinese short dramas, romance, CEO stories, and new episodes on HouseDrama."
			},
			{
				property: "og:image",
				content: "https://house-drama.web.id/og.jpg"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:title",
				content: "HouseDrama — Chinese Short Dramas"
			},
			{
				name: "twitter:description",
				content: "Discover Chinese short dramas and your favorite episodes on HouseDrama."
			},
			{
				name: "twitter:image",
				content: "https://house-drama.web.id/og.jpg"
			},
			{
				name: "theme-color",
				content: "#b34bff"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "64x64",
				href: "/favicon.png"
			},
			{
				rel: "shortcut icon",
				href: "/favicon.ico"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png"
			}
		]
	}),
	component: RootLayout
});
function RootLayout() {
	const { lang } = Route$19.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang,
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
				type: "application/ld+json",
				dangerouslySetInnerHTML: { __html: JSON.stringify({
					"@context": "https://schema.org",
					"@type": "WebSite",
					name: "HouseDrama",
					alternateName: "House Drama",
					url: "https://house-drama.web.id/",
					inLanguage: "en",
					description: "A catalog of Chinese short dramas from multiple providers on HouseDrama."
				}) }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
				type: "application/ld+json",
				dangerouslySetInnerHTML: { __html: JSON.stringify({
					"@context": "https://schema.org",
					"@type": "Organization",
					name: "HouseDrama",
					url: "https://house-drama.web.id/",
					logo: "https://house-drama.web.id/logo.png"
				}) }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: "window.__boot=Date.now();setTimeout(function(){var n=document.querySelector('.boot-splash');if(n)n.classList.add('is-done');},1000);" } }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrefsProvider, {
				initialLang: lang,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) })
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	});
}
var $$splitComponentImporter$15 = () => import("./routes-j3n70Bjp.mjs");
var Route$18 = createFileRoute("/")({
	validateSearch: (search) => ({ ...typeof search.provider === "string" && isProviderId(search.provider) ? { provider: search.provider } : {} }),
	loaderDeps: ({ search }) => ({ provider: search.provider ?? "all" }),
	loader: ({ deps }) => getHomeData({ data: {
		lang: "en",
		provider: deps.provider
	} }),
	pendingComponent: PageSkeleton,
	head: () => ({
		meta: [
			{
				name: "robots",
				content: "index,follow,max-image-preview:large"
			},
			{ title: "HouseDrama — Chinese Short Dramas Online" },
			{
				name: "description",
				content: "Watch Chinese short dramas on HouseDrama. Discover romance, CEO stories, trending dramas, and your favorite short-drama episodes."
			},
			{
				property: "og:title",
				content: "HouseDrama — Chinese Short Dramas Online"
			},
			{
				property: "og:description",
				content: "Discover Chinese short dramas, romance, and CEO stories on HouseDrama."
			},
			{
				property: "og:url",
				content: "https://house-drama.web.id/"
			},
			{
				property: "og:image",
				content: "https://house-drama.web.id/og.jpg"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [{
			rel: "canonical",
			href: "https://house-drama.web.id/"
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./about-Dsq96CA5.mjs");
var Route$17 = createFileRoute("/about")({
	head: () => ({ meta: [{ title: "About HouseDrama" }, {
		name: "description",
		content: "HouseDrama aggregates publicly available Chinese short-drama catalogs. It does not own the shows."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./admin-C0EnA7Ff.mjs");
var Route$16 = createFileRoute("/admin")({
	head: () => ({ meta: [{ title: "Admin — HouseDrama" }, {
		name: "robots",
		content: "noindex"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./categories-CFpbbQLQ.mjs");
var Route$15 = createFileRoute("/categories")({
	loader: () => getBrowseData({ data: {
		lang: "en",
		provider: "all",
		page: 1,
		rail: null
	} }),
	pendingComponent: PageSkeleton,
	head: () => ({
		meta: [
			{ title: "Chinese Short Drama Categories: Romance, CEO, Revenge — HouseDrama" },
			{
				name: "description",
				content: "Browse Chinese short dramas by genre, including romance, CEO stories, revenge, fantasy, family, comedy, and completed dramas on HouseDrama."
			},
			{
				name: "robots",
				content: "index,follow,max-image-preview:large"
			},
			{
				property: "og:title",
				content: "Chinese Short Drama Categories — HouseDrama"
			},
			{
				property: "og:description",
				content: "Explore your favorite short-drama genres and discover your next story."
			},
			{
				property: "og:url",
				content: "https://house-drama.web.id/categories"
			}
		],
		links: [{
			rel: "canonical",
			href: "https://house-drama.web.id/categories"
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./discover-D6xuQANF.mjs");
var Route$14 = createFileRoute("/discover")({
	validateSearch: (search) => {
		return typeof search.rail === "string" ? { rail: search.rail } : {};
	},
	loaderDeps: ({ search }) => ({ rail: search.rail ?? null }),
	loader: ({ deps }) => getBrowseData({ data: {
		lang: "en",
		provider: "all",
		page: 1,
		rail: deps.rail
	} }),
	pendingComponent: PageSkeleton,
	head: () => ({
		meta: [
			{ title: "Discover Chinese Short Dramas — HouseDrama" },
			{
				name: "description",
				content: "Explore Chinese short dramas from multiple providers, including romance, CEO stories, revenge, fantasy, and more."
			},
			{
				name: "robots",
				content: "index,follow,max-image-preview:large"
			},
			{
				property: "og:title",
				content: "Discover Chinese Short Dramas — HouseDrama"
			},
			{
				property: "og:description",
				content: "Find dramas by your favorite genres and themes on HouseDrama."
			},
			{
				property: "og:url",
				content: "https://house-drama.web.id/discover"
			}
		],
		links: [{
			rel: "canonical",
			href: "https://house-drama.web.id/discover"
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./history-DedkGJkF.mjs");
var Route$13 = createFileRoute("/history")({
	head: () => ({ meta: [{ title: "Riwayat Tontonan — HouseDrama" }, {
		name: "robots",
		content: "noindex,follow"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./latest-Bwd4AFFI.mjs");
var Route$12 = createFileRoute("/latest")({
	loader: () => getHomeData({ data: { lang: "en" } }),
	pendingComponent: PageSkeleton,
	head: () => ({
		meta: [
			{ title: "Latest Chinese Short Dramas & Episodes — HouseDrama" },
			{
				name: "description",
				content: "Discover the latest Chinese short dramas and episode updates from available providers on HouseDrama."
			},
			{
				name: "robots",
				content: "index,follow,max-image-preview:large"
			},
			{
				property: "og:title",
				content: "Latest Chinese Short Dramas & Episodes — HouseDrama"
			},
			{
				property: "og:description",
				content: "Discover the latest dramas and new episodes on HouseDrama."
			},
			{
				property: "og:url",
				content: "https://house-drama.web.id/latest"
			}
		],
		links: [{
			rel: "canonical",
			href: "https://house-drama.web.id/latest"
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./privacy-Cl1qJJi2.mjs");
var Route$11 = createFileRoute("/privacy")({
	head: () => ({ meta: [{ title: "Privacy — HouseDrama" }, {
		name: "description",
		content: "HouseDrama stores watch history locally in your browser and does not require an account."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./search-BrHARoHr.mjs");
var Route$10 = createFileRoute("/search")({
	validateSearch: (search) => ({
		...typeof search.q === "string" && search.q ? { q: search.q } : {},
		...typeof search.provider === "string" && search.provider !== "all" ? { provider: search.provider } : {}
	}),
	loaderDeps: ({ search }) => search,
	loader: ({ deps }) => getSearchData({ data: {
		q: deps.q ?? "",
		lang: "en",
		provider: ["all", ...PROVIDERS].includes(deps.provider ?? "all") ? deps.provider ?? "all" : "all",
		page: 1
	} }),
	head: () => ({ meta: [
		{ title: "Search Chinese Short Dramas — HouseDrama" },
		{
			name: "description",
			content: "Search the HouseDrama catalog for Chinese short-drama titles."
		},
		{
			name: "robots",
			content: "noindex,follow"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./shorts-CEOAbQIC.mjs");
var Route$9 = createFileRoute("/shorts")({
	loader: () => getShortsData({ data: {
		lang: "en",
		page: 1
	} }),
	head: () => ({ meta: [{ title: "Shorts — HouseDrama" }, {
		name: "description",
		content: "A vertical autoplay feed of short dramas from every available provider."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var SITE_ORIGIN = "https://house-drama.web.id";
var CACHE_MS = 18e5;
var FEATURED_DRAMA_PATHS = [
	"/drama/freereels/LSjOzwuyTG",
	"/drama/freereels/CtuX3LVyry",
	"/drama/freereels/E8PxLvaL3J",
	"/drama/freereels/ZLM2f8JJEQ",
	"/drama/dramabox/42000026343",
	"/drama/dramabox/42000029045",
	"/drama/freereels/JJYPIFhFmD",
	"/drama/freereels/vyCsDHzEN9",
	"/drama/freereels/hMVo9oiMlB",
	"/drama/freereels/aAHtGDqOPG",
	"/drama/freereels/dqoMUlYLBQ",
	"/drama/dramabox/42000028298",
	"/drama/dramabox/42000028283",
	"/drama/dramabox/42000021480",
	"/drama/dramabox/42000023896"
];
var PATHS = [
	"/",
	"/discover",
	"/trending",
	"/latest",
	"/categories",
	"/provider/anyreel",
	"/provider/dramabox",
	"/provider/freereels",
	"/provider/melolo",
	"/shorts",
	"/about",
	"/privacy",
	"/terms"
];
var cachedXml = null;
function xmlEscape(value) {
	return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function detailUrl(card) {
	if (!card.provider || !card.seriesId || !card.title?.trim()) return null;
	return `${SITE_ORIGIN}/drama/${encodeURIComponent(card.provider)}/${encodeURIComponent(card.seriesId)}`;
}
async function collectProviderCards(providers) {
	const urls = /* @__PURE__ */ new Set();
	const requests = providers.flatMap((provider) => {
		return (provider === "anyreel" || provider === "freereels" ? [
			1,
			2,
			3,
			4,
			5
		] : [1]).map((page) => ({
			provider,
			page
		}));
	});
	const batchSize = 6;
	for (let i = 0; i < requests.length; i += batchSize) {
		const batch = requests.slice(i, i + batchSize);
		const results = await Promise.allSettled(batch.map(({ provider, page }) => loadBrowse({
			lang: "en",
			provider,
			page
		})));
		for (const result of results) {
			if (result.status !== "fulfilled") continue;
			for (const card of result.value.items) {
				const url = detailUrl(card);
				if (url) urls.add(url);
			}
		}
	}
	return urls;
}
async function buildSitemap() {
	const urls = new Set([...PATHS, ...FEATURED_DRAMA_PATHS].map((path) => `${SITE_ORIGIN}${path}`));
	try {
		const dramaUrls = await collectProviderCards(visibleProviders());
		for (const url of dramaUrls) urls.add(url);
	} catch {}
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls].map((url) => `  <url><loc>${xmlEscape(url)}</loc></url>`).join("\n")}\n</urlset>`;
}
var Route$8 = createFileRoute("/sitemap.xml")({ server: { handlers: { GET: async () => {
	let body;
	if (cachedXml && cachedXml.expiresAt > Date.now()) body = cachedXml.body;
	else {
		body = await buildSitemap();
		cachedXml = {
			body,
			expiresAt: Date.now() + CACHE_MS
		};
	}
	return new Response(body, { headers: {
		"content-type": "application/xml; charset=utf-8",
		"cache-control": "public, max-age=1800, stale-while-revalidate=86400"
	} });
} } } });
var $$splitComponentImporter$5 = () => import("./terms-8A_Yvtvs.mjs");
var Route$7 = createFileRoute("/terms")({
	head: () => ({ meta: [{ title: "Terms — HouseDrama" }, {
		name: "description",
		content: "Terms for using HouseDrama’s short-drama catalog."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./trending-BuV0dATL.mjs");
var Route$6 = createFileRoute("/trending")({
	loader: () => getHomeData({ data: { lang: "en" } }),
	pendingComponent: PageSkeleton,
	head: () => ({
		meta: [
			{ title: "Popular & Trending Chinese Short Dramas — HouseDrama" },
			{
				name: "description",
				content: "Discover popular Chinese short dramas on HouseDrama, including romance, CEO stories, revenge, and fantasy."
			},
			{
				name: "robots",
				content: "index,follow,max-image-preview:large"
			},
			{
				property: "og:title",
				content: "Popular & Trending Chinese Short Dramas — HouseDrama"
			},
			{
				property: "og:description",
				content: "Explore popular Chinese short dramas on HouseDrama."
			},
			{
				property: "og:url",
				content: "https://house-drama.web.id/trending"
			}
		],
		links: [{
			rel: "canonical",
			href: "https://house-drama.web.id/trending"
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./watchlist-DHs0VA4X.mjs");
var Route$5 = createFileRoute("/watchlist")({
	head: () => ({ meta: [{ title: "Daftar Tontonan — HouseDrama" }, {
		name: "robots",
		content: "noindex,follow"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var ALLOWED = [
	/(^|\.)videoint\.anyreel\.app$/i,
	/(^|\.)anyreel\.app$/i,
	/(^|\.)mydramawave\.com$/i,
	/(^|\.)dramabox-stream\.narto-drama\.com$/i,
	/(^|\.)dramaboxdb\.com$/i
];
function blockedHost(hostname) {
	const host = hostname.toLowerCase().replace(/\.+$/, "");
	if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return true;
	if (host === "metadata.google.internal" || host === "169.254.169.254") return true;
	const ipv4 = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
	if (ipv4) {
		const a = Number(ipv4[1]);
		const b = Number(ipv4[2]);
		if (a === 10 || a === 127 || a === 0 || a === 192 && b === 168 || a === 172 && b >= 16 && b <= 31 || a === 169 && b === 254) return true;
	}
	return false;
}
function looksLikeMedia(url) {
	const path = `${url.pathname}${url.search}`;
	return /\.(m3u8|mpd|mp4|m4s|ts|m4a|aac|vtt|webvtt|key)(\?|$)/i.test(url.pathname) || /m3u8|mpegurl|video|stream|playlist|\.ts\b/i.test(path);
}
function allowed(url) {
	if (blockedHost(url.hostname)) return false;
	if (ALLOWED.some((pattern) => pattern.test(url.hostname))) return true;
	if (/(^|\.)narto-drama\.com$/i.test(url.hostname)) return true;
	return looksLikeMedia(url);
}
function isPlaylist(contentType, pathname) {
	return /mpegurl|m3u8/i.test(contentType) || pathname.endsWith(".m3u8");
}
function rewritePlaylist(text, baseUrl) {
	const base = new URL(baseUrl);
	const wrap = (raw) => {
		const absolute = new URL(raw, base).toString();
		return `media?u=${encodeURIComponent(absolute)}`;
	};
	return text.split("\n").map((line) => {
		const trimmed = line.trim();
		if (!trimmed) return line;
		if (trimmed.startsWith("#")) return line.replace(/URI="([^"]+)"/g, (_match, uri) => `URI="${wrap(uri)}"`);
		return wrap(trimmed);
	}).join("\n");
}
async function handle({ request }) {
	const target = new URL(request.url).searchParams.get("u");
	if (!target) return new Response("Missing media url", { status: 400 });
	let parsed;
	try {
		parsed = new URL(target);
	} catch {
		return new Response("Invalid media url", { status: 400 });
	}
	if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return new Response("Unsupported protocol", { status: 400 });
	if (!allowed(parsed)) return new Response("Host is not allowed", { status: 403 });
	const headers = new Headers({
		"user-agent": "HouseDrama/1.0",
		accept: "*/*"
	});
	const range = request.headers.get("range");
	if (range) headers.set("range", range);
	let upstream;
	try {
		upstream = await fetch(parsed.toString().replace(/^http:\/\//i, "https://"), {
			headers,
			redirect: "follow",
			signal: AbortSignal.timeout(2e4)
		});
	} catch {
		return new Response("Media host did not respond", { status: 502 });
	}
	const contentType = upstream.headers.get("content-type") || "";
	const finalUrl = upstream.url || parsed.toString();
	if (isPlaylist(contentType, new URL(finalUrl).pathname)) {
		const text = await upstream.text();
		return new Response(rewritePlaylist(text, finalUrl), {
			status: 200,
			headers: {
				"content-type": "application/vnd.apple.mpegurl; charset=utf-8",
				"cache-control": "no-store"
			}
		});
	}
	const responseHeaders = new Headers();
	for (const name of [
		"content-type",
		"content-length",
		"content-range",
		"accept-ranges"
	]) {
		const value = upstream.headers.get(name);
		if (value) responseHeaders.set(name, value);
	}
	if (!responseHeaders.get("content-type")) responseHeaders.set("content-type", "application/octet-stream");
	responseHeaders.set("cache-control", "private, max-age=60");
	return new Response(upstream.body, {
		status: upstream.status,
		headers: responseHeaders
	});
}
var Route$4 = createFileRoute("/api/media")({ server: { handlers: {
	GET: handle,
	HEAD: handle
} } });
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
async function ensureTable() {
	const sql = await getSql();
	await sql.query(`
    CREATE TABLE IF NOT EXISTS housedrama_visitors (
      visitor_id TEXT PRIMARY KEY,
      first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_visit_date DATE NOT NULL DEFAULT (timezone('Asia/Jakarta', now())::date)
    )
  `);
	return sql;
}
async function counts(sql) {
	const rows = await sql.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (
        WHERE last_visit_date = timezone('Asia/Jakarta', now())::date
      )::int AS today
    FROM housedrama_visitors
  `);
	return {
		total: Number(rows[0]?.total ?? 0),
		today: Number(rows[0]?.today ?? 0)
	};
}
async function handleGet() {
	try {
		const sql = await ensureTable();
		return Response.json(await counts(sql), { headers: { "cache-control": "no-store" } });
	} catch (error) {
		console.error("[visitor-count] read failed:", error);
		return Response.json({ error: "Visitor count unavailable" }, { status: 503 });
	}
}
async function handlePost({ request }) {
	try {
		const body = await request.json();
		const visitorId = typeof body.visitorId === "string" ? body.visitorId : "";
		if (!/^[a-zA-Z0-9-]{16,80}$/.test(visitorId)) return Response.json({ error: "Invalid visitor id" }, { status: 400 });
		const sql = await ensureTable();
		await sql.query(`INSERT INTO housedrama_visitors (visitor_id, last_visit_date)
       VALUES ($1, timezone('Asia/Jakarta', now())::date)
       ON CONFLICT (visitor_id) DO UPDATE
       SET last_seen = NOW(),
           last_visit_date = timezone('Asia/Jakarta', now())::date`, [visitorId]);
		return Response.json(await counts(sql), { headers: { "cache-control": "no-store" } });
	} catch (error) {
		console.error("[visitor-count] update failed:", error);
		return Response.json({ error: "Visitor count unavailable" }, { status: 503 });
	}
}
var Route$3 = createFileRoute("/api/visitor-count")({ server: { handlers: {
	GET: handleGet,
	POST: handlePost
} } });
var $$splitComponentImporter$2 = () => import("../_provider-Bpb374d_.mjs");
var Route$2 = createFileRoute("/provider/$provider")({
	loader: ({ params }) => {
		return getBrowseData({ data: {
			lang: "en",
			provider: isProviderId(params.provider) ? params.provider : "anyreel",
			page: 1,
			rail: null
		} });
	},
	pendingComponent: PageSkeleton,
	head: ({ params }) => {
		const label = {
			anyreel: "AnyReel",
			dramabox: "DramaBox",
			freereels: "FreeReels",
			melolo: "Melolo"
		}[params.provider] || params.provider;
		const canonical = `https://house-drama.web.id/provider/${encodeURIComponent(params.provider)}`;
		return {
			meta: [
				{ title: `${label} Short Dramas — HouseDrama` },
				{
					name: "description",
					content: `Browse short dramas from ${label} on HouseDrama. Explore series details, synopses, and available episodes.`
				},
				{
					name: "robots",
					content: "index,follow"
				},
				{
					property: "og:title",
					content: `${label} Short Dramas — HouseDrama`
				},
				{
					property: "og:description",
					content: `Explore ${label} short dramas, synopses, and available episodes on HouseDrama.`
				},
				{
					property: "og:url",
					content: canonical
				}
			],
			links: [{
				rel: "canonical",
				href: canonical
			}]
		};
	},
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("../_seriesId-CRf1uezE.mjs");
var Route$1 = createFileRoute("/drama/$provider/$seriesId")({
	loader: ({ params }) => {
		if (!isProviderId(params.provider)) throw new Error("Unknown provider");
		return getDetailData({ data: {
			provider: params.provider,
			seriesId: params.seriesId,
			lang: "en"
		} });
	},
	pendingComponent: PageSkeleton,
	head: ({ loaderData, params }) => {
		const drama = loaderData?.drama;
		const dramaTitle = (drama?.displayTitle || drama?.title || "Drama China").replace(/\s+/g, " ").trim();
		const title = drama ? `${dramaTitle} — Synopsis & Episodes | HouseDrama` : "Drama Unavailable — HouseDrama";
		const sourceDescription = (drama?.displayDescription || drama?.description || "").replace(/\s+/g, " ").trim();
		const description = (drama ? `${sourceDescription ? `${sourceDescription} ` : `Watch ${dramaTitle} on HouseDrama. `}Explore the synopsis, series information, and available episodes.` : "This drama is temporarily unavailable on HouseDrama.").slice(0, 300);
		const canonical = `https://house-drama.web.id/drama/${encodeURIComponent(params.provider)}/${encodeURIComponent(params.seriesId)}`;
		let image = drama?.posterUrl || "https://house-drama.web.id/og.jpg";
		try {
			const parsedImage = new URL(image);
			if (parsedImage.hostname === "wsrv.nl" || parsedImage.hostname === "images.weserv.nl") {
				const original = parsedImage.searchParams.get("url");
				if (original && /^https?:\/\//i.test(original)) image = original;
			}
		} catch {
			image = "https://house-drama.web.id/og.jpg";
		}
		return {
			meta: [
				{ title },
				{
					name: "description",
					content: description
				},
				{
					name: "robots",
					content: drama && (drama.displayTitle || drama.title) ? "index,follow,max-image-preview:large" : "noindex,follow"
				},
				{
					name: "googlebot",
					content: drama ? "index,follow,max-image-preview:large" : "noindex,follow"
				},
				{
					property: "og:type",
					content: "video.tv_show"
				},
				{
					property: "og:locale",
					content: "id_ID"
				},
				{
					property: "og:site_name",
					content: "HouseDrama"
				},
				{
					property: "og:title",
					content: title
				},
				{
					property: "og:description",
					content: description
				},
				{
					property: "og:url",
					content: canonical
				},
				{
					property: "og:image",
					content: image
				},
				{
					name: "twitter:card",
					content: "summary_large_image"
				},
				{
					name: "twitter:title",
					content: title
				},
				{
					name: "twitter:description",
					content: description
				},
				{
					name: "twitter:image",
					content: image
				},
				...drama?.originalTitle && drama.originalTitle !== drama.title ? [{
					name: "keywords",
					content: `${drama.originalTitle}, ${drama.displayTitle || drama.title}, Chinese short drama`
				}] : [{
					name: "keywords",
					content: `${drama?.displayTitle || drama?.title || "drama China"}, Chinese short drama`
				}]
			],
			links: [{
				rel: "canonical",
				href: canonical
			}]
		};
	},
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("../_episodeId-DK1gcCoz.mjs");
var Route = createFileRoute("/watch/$provider/$seriesId/$episodeId")({
	validateSearch: (search) => ({
		...search.auto === 1 || search.auto === "1" || search.auto === true ? { auto: true } : {},
		...typeof search.lang === "string" ? { lang: search.lang } : {}
	}),
	loader: async ({ params }) => {
		if (!isProviderId(params.provider)) throw new Error("Unknown provider");
		return getWatchData({ data: {
			provider: params.provider,
			seriesId: params.seriesId,
			episodeId: params.episodeId,
			lang: "en"
		} });
	},
	staleTime: 6e4,
	pendingMs: 0,
	pendingMinMs: 300,
	pendingComponent: WatchPending,
	head: ({ loaderData, params }) => ({ meta: [
		{ title: loaderData?.detail.drama ? `Tonton ${loaderData.detail.drama.displayTitle || loaderData.detail.drama.title} — HouseDrama` : "Tonton Drama — HouseDrama" },
		{
			name: "robots",
			content: "noindex,follow"
		},
		{
			name: "description",
			content: `Tonton episode ${params.episodeId} di HouseDrama. Buka halaman detail drama untuk melihat informasi dan daftar episode.`
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
function WatchPending() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid h-dvh place-items-center bg-player text-player-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid place-items-center gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative grid size-20 place-items-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 rounded-full border border-white/15" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#ff4d6d] border-r-[#ffb3c1]" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/logo.png?v=4",
						alt: "",
						className: "h-9 w-auto"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium text-white/80",
				children: "Memuat video…"
			})]
		})
	});
}
var rootRouteChildren = {
	IndexRoute: Route$18.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$19
	}),
	AboutRoute: Route$17.update({
		id: "/about",
		path: "/about",
		getParentRoute: () => Route$19
	}),
	AdminRoute: Route$16.update({
		id: "/admin",
		path: "/admin",
		getParentRoute: () => Route$19
	}),
	CategoriesRoute: Route$15.update({
		id: "/categories",
		path: "/categories",
		getParentRoute: () => Route$19
	}),
	DiscoverRoute: Route$14.update({
		id: "/discover",
		path: "/discover",
		getParentRoute: () => Route$19
	}),
	HistoryRoute: Route$13.update({
		id: "/history",
		path: "/history",
		getParentRoute: () => Route$19
	}),
	LatestRoute: Route$12.update({
		id: "/latest",
		path: "/latest",
		getParentRoute: () => Route$19
	}),
	PrivacyRoute: Route$11.update({
		id: "/privacy",
		path: "/privacy",
		getParentRoute: () => Route$19
	}),
	SearchRoute: Route$10.update({
		id: "/search",
		path: "/search",
		getParentRoute: () => Route$19
	}),
	ShortsRoute: Route$9.update({
		id: "/shorts",
		path: "/shorts",
		getParentRoute: () => Route$19
	}),
	SitemapDotxmlRoute: Route$8.update({
		id: "/sitemap.xml",
		path: "/sitemap.xml",
		getParentRoute: () => Route$19
	}),
	TermsRoute: Route$7.update({
		id: "/terms",
		path: "/terms",
		getParentRoute: () => Route$19
	}),
	TrendingRoute: Route$6.update({
		id: "/trending",
		path: "/trending",
		getParentRoute: () => Route$19
	}),
	WatchlistRoute: Route$5.update({
		id: "/watchlist",
		path: "/watchlist",
		getParentRoute: () => Route$19
	}),
	ApiMediaRoute: Route$4.update({
		id: "/api/media",
		path: "/api/media",
		getParentRoute: () => Route$19
	}),
	ApiVisitorCountRoute: Route$3.update({
		id: "/api/visitor-count",
		path: "/api/visitor-count",
		getParentRoute: () => Route$19
	}),
	ProviderProviderRoute: Route$2.update({
		id: "/provider/$provider",
		path: "/provider/$provider",
		getParentRoute: () => Route$19
	}),
	DramaProviderSeriesIdRoute: Route$1.update({
		id: "/drama/$provider/$seriesId",
		path: "/drama/$provider/$seriesId",
		getParentRoute: () => Route$19
	}),
	WatchProviderSeriesIdEpisodeIdRoute: Route.update({
		id: "/watch/$provider/$seriesId/$episodeId",
		path: "/watch/$provider/$seriesId/$episodeId",
		getParentRoute: () => Route$19
	})
};
var routeTree = Route$19._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		rewrite: previewPathRewrite(),
		defaultErrorComponent: AppErrorComponent,
		scrollRestoration: true
	});
}
//#endregion
export { getWatchData as C, updateAdminSettings as E, getStreamData as S, testFreeReelsApi as T, getBrowseData as _, Route$6 as a, getSearchData as b, Route$12 as c, Route$18 as d, previewPathPrefix as f, getAdminData as g, createSsrRpc as h, Route$2 as i, Route$14 as l, api_exports as m, Route as n, Route$9 as o, adminLogin as p, Route$1 as r, Route$10 as s, router_exports as t, Route$15 as u, getDetailData as v, reportPlayback as w, getShortsData as x, getHomeData as y };
