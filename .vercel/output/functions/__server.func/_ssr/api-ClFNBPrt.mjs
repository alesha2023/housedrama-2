import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
import { t as PROVIDERS } from "./types-B7znlJsu.mjs";
import { a as number, n as array, o as object, r as boolean, s as string, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-ClFNBPrt.js
var providerSchema = _enum(["all", ...PROVIDERS]);
var getHomeData_createServerFn_handler = createServerRpc({
	id: "786a73520a51aa0595381e5450138fde7c5d93428966ca6cac3c523504159d4f",
	name: "getHomeData",
	filename: "src/lib/drama/api.ts"
}, (opts) => getHomeData.__executeServer(opts));
var getHomeData = createServerFn({ method: "GET" }).validator(object({
	lang: string().min(2).max(12).default("id"),
	provider: _enum(["all", ...PROVIDERS]).default("all")
})).handler(getHomeData_createServerFn_handler, async ({ data }) => {
	const { loadHome } = await import("./catalog-DJ2VrmyW.mjs").then((n) => n.t);
	const { resolveCatalogLang } = await import("./locale-D7o8iBvg.mjs");
	return loadHome(await resolveCatalogLang(data.lang), data.provider);
});
var getBrowseData_createServerFn_handler = createServerRpc({
	id: "c05b815f71d2f077ba3d559eeec639219e867eb3f2d3228aa552a7d3ef48994d",
	name: "getBrowseData",
	filename: "src/lib/drama/api.ts"
}, (opts) => getBrowseData.__executeServer(opts));
var getBrowseData = createServerFn({ method: "GET" }).validator(object({
	lang: string().min(2).max(12).default("id"),
	provider: providerSchema.default("all"),
	page: number().int().min(1).max(20).default(1),
	rail: string().max(40).nullable().optional()
})).handler(getBrowseData_createServerFn_handler, async ({ data }) => {
	const { loadBrowse } = await import("./catalog-DJ2VrmyW.mjs").then((n) => n.t);
	const { resolveCatalogLang } = await import("./locale-D7o8iBvg.mjs");
	return loadBrowse({
		lang: await resolveCatalogLang(data.lang),
		provider: data.provider,
		page: data.page,
		rail: data.rail ?? null
	});
});
var getSearchData_createServerFn_handler = createServerRpc({
	id: "61f81ff5feeefeaa94d83a92a007a168d8e11982c92d0802004ccf0bd154630c",
	name: "getSearchData",
	filename: "src/lib/drama/api.ts"
}, (opts) => getSearchData.__executeServer(opts));
var getSearchData = createServerFn({ method: "GET" }).validator(object({
	q: string().max(80).default(""),
	lang: string().min(2).max(12).default("id"),
	provider: providerSchema.default("all"),
	page: number().int().min(1).max(20).default(1)
})).handler(getSearchData_createServerFn_handler, async ({ data }) => {
	const { loadSearch } = await import("./catalog-DJ2VrmyW.mjs").then((n) => n.t);
	const { resolveCatalogLang } = await import("./locale-D7o8iBvg.mjs");
	return loadSearch({
		...data,
		lang: await resolveCatalogLang(data.lang)
	});
});
var getShortsData_createServerFn_handler = createServerRpc({
	id: "1aa2564cf941911a0abbd3150139a112143d1e3d8cba60adb4775233066f6487",
	name: "getShortsData",
	filename: "src/lib/drama/api.ts"
}, (opts) => getShortsData.__executeServer(opts));
var getShortsData = createServerFn({ method: "GET" }).validator(object({
	lang: string().min(2).max(12).default("id"),
	page: number().int().min(1).max(20).default(1)
})).handler(getShortsData_createServerFn_handler, async ({ data }) => {
	const { loadShorts } = await import("./catalog-DJ2VrmyW.mjs").then((n) => n.t);
	const { resolveCatalogLang } = await import("./locale-D7o8iBvg.mjs");
	return loadShorts(data.page, await resolveCatalogLang(data.lang));
});
var getDetailData_createServerFn_handler = createServerRpc({
	id: "e2fe3ac46f4e37203c38161be7f17fdacc8b512a59328b0a6efc4941fe55a752",
	name: "getDetailData",
	filename: "src/lib/drama/api.ts"
}, (opts) => getDetailData.__executeServer(opts));
var getDetailData = createServerFn({ method: "GET" }).validator(object({
	provider: _enum(PROVIDERS),
	seriesId: string().min(1).max(80),
	lang: string().min(2).max(12).default("id")
})).handler(getDetailData_createServerFn_handler, async ({ data }) => {
	const { loadDetail } = await import("./catalog-DJ2VrmyW.mjs").then((n) => n.t);
	const { resolveCatalogLang } = await import("./locale-D7o8iBvg.mjs");
	return loadDetail(data.provider, data.seriesId, await resolveCatalogLang(data.lang));
});
var getWatchData_createServerFn_handler = createServerRpc({
	id: "44c47f8fedf0a2b952567b206dee2e8f209465e7794578b84bd7f10cc4242714",
	name: "getWatchData",
	filename: "src/lib/drama/api.ts"
}, (opts) => getWatchData.__executeServer(opts));
var getWatchData = createServerFn({ method: "GET" }).validator(object({
	provider: _enum(PROVIDERS),
	seriesId: string().min(1).max(80),
	episodeId: string().min(1).max(80),
	lang: string().min(2).max(12).default("id")
})).handler(getWatchData_createServerFn_handler, async ({ data }) => {
	const { loadPlayback } = await import("./catalog-DJ2VrmyW.mjs").then((n) => n.t);
	const { resolveCatalogLang } = await import("./locale-D7o8iBvg.mjs");
	return loadPlayback(data.provider, data.seriesId, data.episodeId, await resolveCatalogLang(data.lang));
});
var getStreamData_createServerFn_handler = createServerRpc({
	id: "a9e1ff885b50c69cb9c13e0321ceb6dc7af4a8355d4ef23233133b2d13ced664",
	name: "getStreamData",
	filename: "src/lib/drama/api.ts"
}, (opts) => getStreamData.__executeServer(opts));
var getStreamData = createServerFn({ method: "GET" }).validator(object({
	provider: _enum(PROVIDERS),
	seriesId: string().min(1).max(80),
	episodeId: string().min(1).max(80),
	lang: string().min(2).max(12).default("id")
})).handler(getStreamData_createServerFn_handler, async ({ data }) => {
	const { loadStream } = await import("./catalog-DJ2VrmyW.mjs").then((n) => n.t);
	const { resolveCatalogLang } = await import("./locale-D7o8iBvg.mjs");
	return loadStream(data.provider, data.seriesId, data.episodeId, await resolveCatalogLang(data.lang));
});
var lookupDisplays_createServerFn_handler = createServerRpc({
	id: "075dc0356bf3ddb9948a198caba9f9e112022a456432ce7fc082b570b7a11300",
	name: "lookupDisplays",
	filename: "src/lib/drama/api.ts"
}, (opts) => lookupDisplays.__executeServer(opts));
var lookupDisplays = createServerFn({ method: "POST" }).validator(object({
	lang: string().min(2).max(12),
	titles: array(string().max(180)).max(40)
})).handler(lookupDisplays_createServerFn_handler, async ({ data }) => {
	const { displayFromCache } = await import("./localize-C5id3HgY.mjs").then((n) => n.a).then((n) => n.a);
	return displayFromCache(data.titles, data.lang);
});
var reportPlayback_createServerFn_handler = createServerRpc({
	id: "712f09fba6e5b71b305eaa19dd917574602ec92068645d7cf7b77145c07e5889",
	name: "reportPlayback",
	filename: "src/lib/drama/api.ts"
}, (opts) => reportPlayback.__executeServer(opts));
var reportPlayback = createServerFn({ method: "POST" }).validator(object({
	provider: _enum(PROVIDERS),
	ok: boolean()
})).handler(reportPlayback_createServerFn_handler, async ({ data }) => {
	const { recordPlayback } = await import("./metrics-CZxc3Ids.mjs").then((n) => n.t).then((n) => n.t);
	recordPlayback(data.provider, data.ok);
	return { ok: true };
});
var adminLogin_createServerFn_handler = createServerRpc({
	id: "feb57e7b65f276d4b52a46c4dd1d36056d3c202498ee7741cbdbdceed8707d0d",
	name: "adminLogin",
	filename: "src/lib/drama/api.ts"
}, (opts) => adminLogin.__executeServer(opts));
var adminLogin = createServerFn({ method: "POST" }).validator(object({ password: string().min(1).max(80) })).handler(adminLogin_createServerFn_handler, async ({ data }) => {
	const { loginAdmin } = await import("./metrics-CZxc3Ids.mjs").then((n) => n.t).then((n) => n.t);
	const token = loginAdmin(data.password);
	return token ? {
		ok: true,
		token
	} : {
		ok: false,
		token: null
	};
});
var getAdminData_createServerFn_handler = createServerRpc({
	id: "62256143c9983dfaa89fc56a2fb28a1b36aaa30213630a3d313d6c6a51ff369e",
	name: "getAdminData",
	filename: "src/lib/drama/api.ts"
}, (opts) => getAdminData.__executeServer(opts));
var getAdminData = createServerFn({ method: "POST" }).validator(object({ token: string().min(8) })).handler(getAdminData_createServerFn_handler, async ({ data }) => {
	const { snapshot, verifyAdminToken, pingSafe } = await import("./admin-DS-cfRPd.mjs");
	if (!verifyAdminToken(data.token)) return {
		ok: false,
		snapshot: null
	};
	return {
		ok: true,
		snapshot: await snapshot(pingSafe)
	};
});
var updateAdminSettings_createServerFn_handler = createServerRpc({
	id: "c70d75d2cec19cede1bf35cda2337598f5b89fb558401ea97850b33270af6164",
	name: "updateAdminSettings",
	filename: "src/lib/drama/api.ts"
}, (opts) => updateAdminSettings.__executeServer(opts));
var updateAdminSettings = createServerFn({ method: "POST" }).validator(object({
	token: string().min(8),
	provider: _enum(PROVIDERS).optional(),
	enabled: boolean().optional(),
	section: string().max(40).optional(),
	sectionEnabled: boolean().optional()
})).handler(updateAdminSettings_createServerFn_handler, async ({ data }) => {
	const { applySettings } = await import("./admin-DS-cfRPd.mjs");
	return applySettings(data);
});
var testFreeReelsApi_createServerFn_handler = createServerRpc({
	id: "013928a25cbaf1cade96ee2987ca9397b72ed762fe2924ad3cd0826149c22122",
	name: "testFreeReelsApi",
	filename: "src/lib/drama/api.ts"
}, (opts) => testFreeReelsApi.__executeServer(opts));
var testFreeReelsApi = createServerFn({ method: "POST" }).validator(object({
	token: string().min(8),
	baseUrl: string().url().max(300).default("https://freereels.narto-drama.com/api")
})).handler(testFreeReelsApi_createServerFn_handler, async ({ data }) => {
	const { verifyAdminToken } = await import("./admin-DS-cfRPd.mjs");
	if (!verifyAdminToken(data.token)) return {
		ok: false,
		error: "Sesi admin berakhir. Login kembali."
	};
	let parsed;
	try {
		parsed = new URL(data.baseUrl);
	} catch {
		return {
			ok: false,
			error: "URL API tidak valid.",
			checks: []
		};
	}
	if (parsed.protocol !== "https:" || parsed.hostname !== "freereels.narto-drama.com") return {
		ok: false,
		error: "Demi keamanan, pemeriksaan hanya diizinkan untuk freereels.narto-drama.com melalui HTTPS.",
		checks: []
	};
	const base = `${parsed.origin}${parsed.pathname.replace(/\/+$/, "")}`;
	const checks = await Promise.all([
		{
			path: "/health",
			label: "Health"
		},
		{
			path: "/get-languages",
			label: "Bahasa"
		},
		{
			path: "/get-channels",
			label: "Channel"
		},
		{
			path: "/get-foryou",
			label: "For You"
		},
		{
			path: "/search?keyword=love",
			label: "Search"
		}
	].map(async ({ path, label }) => {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), 9e3);
		const started = Date.now();
		try {
			const response = await fetch(`${base}${path}`, {
				method: "GET",
				headers: { accept: "application/json" },
				signal: controller.signal,
				cache: "no-store"
			});
			const text = await response.text();
			let json = null;
			try {
				json = JSON.parse(text);
			} catch {}
			const jsonOk = json !== null && (typeof json === "object" || Array.isArray(json));
			return {
				label,
				path,
				status: response.status,
				ok: response.ok && jsonOk,
				ms: Date.now() - started,
				detail: !response.ok ? `HTTP ${response.status}` : jsonOk ? "Respons JSON diterima" : "Respons bukan JSON"
			};
		} catch (error) {
			return {
				label,
				path,
				status: 0,
				ok: false,
				ms: Date.now() - started,
				detail: error instanceof Error && error.name === "AbortError" ? "Timeout 9 detik" : error instanceof Error ? error.message : "Request gagal"
			};
		} finally {
			clearTimeout(timer);
		}
	}));
	return {
		ok: checks.some((item) => item.ok),
		baseUrl: base,
		checks
	};
});
//#endregion
export { adminLogin_createServerFn_handler, getAdminData_createServerFn_handler, getBrowseData_createServerFn_handler, getDetailData_createServerFn_handler, getHomeData_createServerFn_handler, getSearchData_createServerFn_handler, getShortsData_createServerFn_handler, getStreamData_createServerFn_handler, getWatchData_createServerFn_handler, lookupDisplays_createServerFn_handler, reportPlayback_createServerFn_handler, testFreeReelsApi_createServerFn_handler, updateAdminSettings_createServerFn_handler };
