import { n as dramaKey, r as isProviderId, t as PROVIDERS } from "./types-B7znlJsu.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { a as sectionEnabled, i as recordSuccess, n as providerEnabled, o as setCacheEntries, r as recordFailure } from "./metrics-CZxc3Ids.mjs";
import { i as localizeTexts, n as localizeCards, r as localizeEpisodes, t as englishQueriesFor } from "./localize-C5id3HgY.mjs";
import { AsyncLocalStorage } from "node:async_hooks";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-DJ2VrmyW.js
var LABELS = {
	anyreel: "AnyReel",
	bibishort: "BibiShort",
	bonustv: "BonusTV",
	candyjar: "CandyJar",
	cubetv: "CubeTV",
	dotdrama: "DotDrama",
	"dramabite-funorbit": "DramaBite",
	"dramabite-miniepisode": "MiniEpisode",
	dramabox: "DramaBox",
	dramahub: "DramaHub",
	dramanova: "DramaNova",
	dramashorts: "DramaShorts",
	dramatv: "DramaTV",
	dramawave: "DramaWave",
	dreameshort: "DreameShort",
	firedrama: "FireDrama",
	flareflow: "Flareflow",
	flextv: "FlexTV",
	flickreels: "FlickReels",
	freedrama: "FreeDrama",
	freereels: "FreeReels",
	fundrama: "FunDrama",
	goodshort: "GoodShort",
	happyshort: "HappyShort",
	idrama: "iDrama",
	joyreels: "JoyReels",
	kalostv: "KaloTV",
	melolo: "Melolo",
	microdrama: "MicroDrama",
	minidrama: "MiniDrama",
	minishorts: "MiniShorts",
	minutedrama: "MinuteDrama",
	moboreels: "MoboReels",
	moviebox: "MovieBox",
	mydrama: "MyDrama",
	myrelle: "MyRelle",
	netshort: "NetShort",
	ohmytv: "OhMyTV",
	onedrama: "OneDrama",
	pinedrama: "PineDrama",
	playlet: "Playlet",
	rapidtv: "RapidTV",
	raptdrama: "RaptDrama",
	reelala: "Reelala",
	reelbuzz: "ReelBuzz",
	reelife: "Reelife",
	reelshort: "ReelShort",
	sarostv: "SarosTV",
	serealplus: "SerealPlus",
	shortical: "Shortical",
	shortmax: "Shortmax",
	sixthshort: "SixthShort",
	soonshot: "Soonshot",
	stardusttv: "StardustTV",
	starshort: "StarShort",
	storeel: "Storeel",
	storyreel: "StoryReel",
	topdrama: "TopDrama",
	velolo: "Velolo",
	vibeshort: "VibeShort",
	vigloo: "Vigloo",
	vyntage: "Vyntage"
};
/** Hosts whose public routes live under /api. The rest are mounted at the domain root. */
var API_PREFIX = /* @__PURE__ */ new Set([
	"anyreel",
	"bibishort",
	"candyjar",
	"cubetv",
	"dramabox",
	"flextv",
	"flickreels",
	"freereels",
	"joyreels",
	"kalostv",
	"melolo",
	"microdrama",
	"moviebox",
	"mydrama",
	"myrelle",
	"playlet",
	"reelala",
	"reelife",
	"sarostv",
	"shortical",
	"shortmax",
	"stardusttv",
	"starshort",
	"velolo",
	"vigloo"
]);
function providerLabel(id) {
	return LABELS[id];
}
/** Hosts that failed the last health check. Hidden from the picker, not deleted. */
var HIDDEN_PROVIDERS = /* @__PURE__ */ new Set([
	"bonustv",
	"dotdrama",
	"dramabite-funorbit",
	"dramabite-miniepisode",
	"dramahub",
	"dramashorts",
	"dramatv",
	"dreameshort",
	"firedrama",
	"flareflow",
	"freedrama",
	"fundrama",
	"minidrama",
	"minishorts",
	"minutedrama",
	"ohmytv",
	"onedrama",
	"rapidtv",
	"raptdrama",
	"serealplus",
	"sixthshort",
	"soonshot",
	"storeel",
	"storyreel",
	"topdrama",
	"vibeshort"
]);
function isProviderHidden(id) {
	return HIDDEN_PROVIDERS.has(id);
}
function visibleProviders() {
	return PROVIDERS.filter((id) => !HIDDEN_PROVIDERS.has(id));
}
function isCoreProvider(id) {
	return id === "anyreel" || id === "dramabox" || id === "freereels";
}
function providerOrigin(id) {
	const envKey = `${id.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_API_URL`;
	const env = process.env[envKey];
	if (env) return env.replace(/\/$/, "");
	const host = `https://${id}.narto-drama.com`;
	return API_PREFIX.has(id) ? `${host}/api` : host;
}
function homeCandidates(id) {
	if (id === "vigloo") return ["/get-discover", "/get-rank"];
	if (id === "dramawave") return ["/get-foryou", "/get-channels"];
	if (id === "flickreels") return ["/get-home-channels"];
	if (id === "goodshort") return ["/get-home-channels/id", "/get-home-channels/en"];
	if (id === "happyshort") return ["/get-channels", "/get-ranking"];
	if (id === "netshort") return [
		"/get-home",
		"/get-foryou",
		"/get-charts"
	];
	return [
		"/get-home",
		"/get-foryou",
		"/get-discover",
		"/get-list",
		"/get-hot"
	];
}
var g = globalThis;
var fetchDeadlines = new AsyncLocalStorage();
/** Stop starting new provider calls once the budget is gone, so one slow catalog cannot hang the page. */
function withFetchBudget(ms, run) {
	if (fetchDeadlines.getStore()) return run();
	return fetchDeadlines.run(Date.now() + ms, run);
}
function cache() {
	g.__dramalumaCache ??= /* @__PURE__ */ new Map();
	return g.__dramalumaCache;
}
function inflight() {
	g.__dramalumaInflight ??= /* @__PURE__ */ new Map();
	return g.__dramalumaInflight;
}
function providerBase(id) {
	if (id === "anyreel" && process.env.ANYREEL_API_URL) return process.env.ANYREEL_API_URL.replace(/\/$/, "");
	if (id === "dramabox" && process.env.DRAMABOX_API_URL) return process.env.DRAMABOX_API_URL.replace(/\/$/, "");
	if (id === "freereels" && process.env.FREEREELS_API_URL) return process.env.FREEREELS_API_URL.replace(/\/$/, "");
	return providerOrigin(id);
}
var ProviderDisabledError = class extends Error {
	constructor(id) {
		super(`${id} is disabled`);
		this.name = "ProviderDisabledError";
	}
};
function prune() {
	const now = Date.now();
	const store = cache();
	for (const [key, entry] of store) if (entry.exp <= now) store.delete(key);
	setCacheEntries(store.size);
}
async function providerFetch(id, path, opts) {
	if (!providerEnabled(id)) throw new ProviderDisabledError(id);
	const url = `${providerBase(id)}${path.startsWith("/") ? path : `/${path}`}`;
	const key = opts?.cacheKey ?? url;
	const ttl = opts?.cacheTtl ?? 0;
	if (ttl > 0) {
		const hit = cache().get(key);
		if (hit && hit.exp > Date.now()) return hit.data;
	}
	const pending = inflight().get(key);
	if (pending) return pending;
	const job = (async () => {
		let lastError;
		const deadline = fetchDeadlines.getStore();
		let retries = Math.max(0, Math.min(2, opts?.retries ?? 1));
		let timeout = opts?.timeout ?? 5500;
		if (deadline) {
			const budget = deadline - Date.now();
			if (budget < 400) throw new Error(`${id} timed out`);
			timeout = Math.min(timeout, budget);
			retries = 0;
		}
		for (let attempt = 0; attempt <= retries; attempt += 1) {
			const started = Date.now();
			try {
				const response = await fetch(url, {
					headers: {
						accept: "application/json",
						"user-agent": "HouseDrama/1.0"
					},
					signal: AbortSignal.timeout(timeout)
				});
				if (!response.ok) throw new Error(`${id} HTTP ${response.status}`);
				const data = await response.json();
				recordSuccess(id, Date.now() - started);
				if (ttl > 0) {
					cache().set(key, {
						exp: Date.now() + ttl,
						data
					});
					prune();
				}
				return data;
			} catch (error) {
				lastError = error;
				if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, 200));
			}
		}
		recordFailure(id, lastError);
		throw lastError instanceof Error ? lastError : /* @__PURE__ */ new Error("Provider request failed");
	})();
	inflight().set(key, job);
	try {
		return await job;
	} finally {
		inflight().delete(key);
	}
}
function asRecord(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function asArray(value) {
	return Array.isArray(value) ? value : [];
}
function str(value) {
	if (typeof value === "string" && value.trim()) return value.trim();
	if (typeof value === "number" && Number.isFinite(value)) return String(value);
	return null;
}
function num(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
	return null;
}
function tagList(value) {
	const out = [];
	for (const item of asArray(value)) {
		if (typeof item === "string" && item.trim()) {
			out.push(item.trim());
			continue;
		}
		const record = asRecord(item);
		const name = str(record?.tagName) || str(record?.tagEnName) || str(record?.nameEn) || str(record?.name) || str(record?.nameCn);
		if (name) out.push(name);
	}
	return [...new Set(out)].slice(0, 8);
}
function absoluteUrl(value, fallbackBase) {
	const raw = str(value);
	if (!raw) return null;
	if (/^https?:\/\//i.test(raw)) return raw.replace(/^http:\/\//i, "https://");
	if (raw.startsWith("//")) return `https:${raw}`;
	if (fallbackBase && !raw.includes(" ")) return `${fallbackBase.replace(/\/$/, "")}/${raw.replace(/^\//, "")}`;
	return null;
}
function enc(value) {
	return encodeURIComponent(value);
}
function dbLang(lang) {
	if (lang === "id") return "in";
	if (lang === "zh") return "zh-Hant";
	return lang || "en";
}
function frLang(lang) {
	if (lang === "id") return "id-ID";
	if (lang === "en") return "en-US";
	if (lang === "zh") return "zh-TW";
	return lang.includes("-") ? lang : "en-US";
}
function guessFormat(url) {
	return /\.m3u8(\?|$)/i.test(url) || /mpegurl/i.test(url) ? "hls" : "mp4";
}
function upgradeHttps(url) {
	return url.replace(/^http:\/\//i, "https://");
}
var POSTER_BASE = "https://anyoss.anyreel.app";
function mapCard$2(raw) {
	const record = asRecord(raw);
	if (!record) return null;
	const seriesId = str(record.seriesId) || str(record.id);
	const title = str(record.name) || str(record.seriesName) || str(record.title);
	if (!seriesId || !title) return null;
	const first = asRecord(asArray(record.episodes)[0]);
	const firstEpisodeId = first ? str(first.episodeSort) || str(first.sort) || str(first.index) || str(first.id) : null;
	const completed = record.completionStatus === 1 ? true : record.completionStatus === 0 ? false : null;
	return {
		provider: "anyreel",
		seriesId,
		title,
		posterUrl: absoluteUrl(record.coverImageUrl) || absoluteUrl(record.coverImage, POSTER_BASE),
		bannerUrl: absoluteUrl(record.bannerImageUrl) || absoluteUrl(record.livelyImageUrl) || absoluteUrl(record.coverImageUrl) || absoluteUrl(record.coverImage, POSTER_BASE),
		description: str(record.synopsis) || str(record.desc) || str(record.introduction),
		tags: tagList(record.tags ?? record.displayTags),
		language: str(record.language),
		episodeCount: num(record.totalEpisodes) ?? num(record.episodeCount),
		completed,
		scoreLabel: str(record.scoreStr),
		playCount: str(record.playCnt) || str(record.favoriteCnt) || str(record.playCount),
		badge: str(record.cornerMark),
		firstEpisodeId
	};
}
function mapAnyreelCards(list) {
	const cards = [];
	for (const item of asArray(list)) {
		const card = mapCard$2(item);
		if (card) cards.push(card);
	}
	return cards;
}
async function anyreelHome() {
	const payload = await providerFetch("anyreel", "/get-home", { cacheTtl: 9e4 });
	const data = asRecord(payload.data) ?? payload;
	return {
		banners: asArray(data.banners),
		sections: asArray(data.sectionConfigs).map((section) => {
			const record = asRecord(section);
			return {
				name: str(record?.name) || "Featured",
				items: mapAnyreelCards(record?.series)
			};
		})
	};
}
async function anyreelRank() {
	return mapAnyreelCards((asRecord((await providerFetch("anyreel", "/get-rank", { cacheTtl: 9e4 })).data) ?? {}).list);
}
async function anyreelSearchHome() {
	return asArray((await providerFetch("anyreel", "/get-search-home", { cacheTtl: 12e4 })).data).map((section) => {
		const record = asRecord(section);
		return {
			name: str(record?.name) || "Trending",
			items: mapAnyreelCards(record?.series)
		};
	});
}
async function anyreelSearch(keyword, page) {
	const data = asRecord((await providerFetch("anyreel", `/search?keyword=${enc(keyword)}&page=${page}`, {
		cacheTtl: 45e3,
		cacheKey: `anyreel-search:${keyword}:${page}`
	})).data) ?? {};
	return {
		items: mapAnyreelCards(data.data),
		hasMore: data.hasNextPages === true,
		page: num(data.pageIndex) ?? page
	};
}
async function anyreelShorts(page) {
	const data = asRecord((await providerFetch("anyreel", `/get-shorts?page=${page}`, {
		cacheTtl: 6e4,
		cacheKey: `anyreel-shorts:${page}`
	})).data) ?? {};
	return {
		items: mapAnyreelCards(data.data),
		hasMore: data.hasNextPages === true
	};
}
async function anyreelSimilar(seriesId) {
	try {
		const data = (await providerFetch("anyreel", `/get-similar?series_id=${enc(seriesId)}`, {
			cacheTtl: 12e4,
			cacheKey: `anyreel-similar:${seriesId}`
		})).data;
		return mapAnyreelCards(Array.isArray(data) ? data : asRecord(data)?.list);
	} catch {
		return [];
	}
}
async function anyreelDetail(seriesId) {
	const data = asRecord((await providerFetch("anyreel", `/get-detail/${enc(seriesId)}`, {
		cacheTtl: 12e4,
		cacheKey: `anyreel-detail:${seriesId}`
	})).data);
	if (!data) throw new Error("AnyReel did not return drama details");
	return {
		card: mapCard$2({
			...data,
			seriesId,
			name: data.seriesName || data.name,
			id: seriesId
		}),
		episodes: asArray(data.dramaEpisodes).flatMap((item, index) => {
			const record = asRecord(item);
			if (!record) return [];
			return [{
				episodeId: str(record.episodeSort) || str(record.sort) || String(index + 1),
				index: num(record.episodeSort) ?? index + 1,
				title: str(record.title) || `Episode ${num(record.episodeSort) ?? index + 1}`,
				coverUrl: absoluteUrl(record.coverImageUrl),
				durationSec: num(record.totalDuration) ?? num(record.duration),
				access: record.isCharged === true ? "limited" : "open"
			}];
		})
	};
}
async function anyreelStream(seriesId, episodeSort) {
	const payload = await providerFetch("anyreel", `/get-stream/${enc(seriesId)}/${enc(episodeSort)}`, {
		cacheTtl: 2e4,
		cacheKey: `anyreel-stream:${seriesId}:${episodeSort}`
	});
	const url = str(payload.video_url);
	if (!url || payload.locked === true) return [];
	return [{
		url: upgradeHttps(url),
		format: guessFormat(url),
		quality: null,
		subtitles: []
	}];
}
function mapCard$1(raw) {
	const record = asRecord(raw);
	if (!record) return null;
	const seriesId = str(record.bookId) || str(record.id);
	const title = str(record.bookName) || str(record.name);
	if (!seriesId || !title) return null;
	const tags = tagList(record.tagV3s);
	const plainTags = tagList(record.tags);
	const corner = asRecord(record.corner);
	return {
		provider: "dramabox",
		seriesId,
		title,
		posterUrl: absoluteUrl(record.coverWap) || absoluteUrl(record.bookCover) || absoluteUrl(record.cover),
		bannerUrl: absoluteUrl(record.bookCover) || absoluteUrl(record.coverWap) || absoluteUrl(record.cover),
		description: str(record.introduction) || str(record.desc),
		tags: tags.length ? tags : plainTags,
		language: str(record.language),
		episodeCount: num(record.chapterCount) ?? num(record.totalEpisodes),
		completed: record.bookStatus === 1 ? true : record.bookStatus === 0 ? false : null,
		scoreLabel: str(record.rate),
		playCount: str(record.playCount),
		badge: str(corner?.name) || str(record.cornerMark),
		firstEpisodeId: null
	};
}
function mapCards$1(list) {
	const cards = [];
	for (const item of asArray(list)) {
		const nested = asArray(asRecord(asRecord(item)?.tagCardVo)?.tagBooks);
		if (nested.length) {
			for (const book of nested) {
				const card = mapCard$1(book);
				if (card) cards.push(card);
			}
			continue;
		}
		const card = mapCard$1(item);
		if (card) cards.push(card);
	}
	return cards;
}
function langQuery(lang) {
	return `lang=${enc(dbLang(lang))}`;
}
async function dramaboxHome(lang) {
	const payload = await providerFetch("dramabox", `/get-home?${langQuery(lang)}`, {
		cacheTtl: 9e4,
		cacheKey: `db-home:${lang}`
	});
	return {
		columns: asArray(payload.columnVoList).map((column) => {
			const record = asRecord(column);
			return {
				name: str(record?.title) || "DramaBox",
				items: mapCards$1(record?.bookList)
			};
		}),
		recommend: mapCards$1(asRecord(payload.recommendList)?.records),
		banners: mapCards$1(payload.bannerList)
	};
}
async function dramaboxLatest(lang) {
	return mapCards$1(asRecord((await providerFetch("dramabox", `/get-latest?${langQuery(lang)}`, {
		cacheTtl: 6e4,
		cacheKey: `db-latest:${lang}`
	})).newTheaterList)?.records);
}
async function dramaboxRank(lang) {
	const payload = await providerFetch("dramabox", `/get-rank?${langQuery(lang)}`, {
		cacheTtl: 9e4,
		cacheKey: `db-rank:${lang}`
	});
	return {
		items: mapCards$1(payload.rankList),
		tabs: asArray(payload.rankTypeVoList).flatMap((tab) => {
			const name = str(asRecord(tab)?.rankName);
			return name ? [name] : [];
		})
	};
}
async function dramaboxSearch(keyword, lang) {
	return mapCards$1((await providerFetch("dramabox", `/search/${enc(keyword)}?${langQuery(lang)}`, {
		cacheTtl: 45e3,
		cacheKey: `db-search:${lang}:${keyword}`
	})).suggestList);
}
async function dramaboxDetail(bookId, lang) {
	const payload = await providerFetch("dramabox", `/get-detail/${enc(bookId)}?${langQuery(lang)}`, {
		cacheTtl: 12e4,
		cacheKey: `db-detail:${lang}:${bookId}`
	});
	const card = mapCard$1(payload);
	const episodes = asArray(payload.episodes).flatMap((item, index) => {
		const record = asRecord(item);
		if (!record) return [];
		const episodeId = str(record.chapterId);
		if (!episodeId) return [];
		const charged = record.isCharge === 1 || record.isPay === 1 || record.isCharge === true;
		return [{
			episodeId,
			index: (num(record.chapterIndex) ?? index) + 1,
			title: str(record.chapterName) || `Episode ${(num(record.chapterIndex) ?? index) + 1}`,
			coverUrl: null,
			durationSec: null,
			access: charged ? "limited" : "open"
		}];
	});
	if (card && episodes[0] && !card.firstEpisodeId) card.firstEpisodeId = episodes[0].episodeId;
	return {
		card,
		episodes
	};
}
function pushCandidate(list, url, quality) {
	const value = str(url);
	if (!value) return;
	const safe = upgradeHttps(value);
	if (list.some((item) => item.url === safe)) return;
	list.push({
		url: safe,
		format: guessFormat(safe),
		quality,
		subtitles: []
	});
}
async function dramaboxStream(bookId, chapterId, lang) {
	const query = langQuery(lang);
	let payload = null;
	try {
		payload = await providerFetch("dramabox", `/get-all-streams-proxy/${enc(bookId)}?${query}`, {
			cacheTtl: 4e4,
			cacheKey: `db-proxy:${lang}:${bookId}`
		});
	} catch {
		try {
			payload = await providerFetch("dramabox", `/get-all-streams/${enc(bookId)}?${query}`, {
				cacheTtl: 2e4,
				cacheKey: `db-all:${lang}:${bookId}`
			});
		} catch {
			payload = await providerFetch("dramabox", `/get-stream/${enc(bookId)}?${query}`, {
				cacheTtl: 15e3,
				cacheKey: `db-stream:${lang}:${bookId}`
			});
		}
	}
	const episodes = asArray(payload?.episodes);
	const record = asRecord(episodes.find((item) => str(asRecord(item)?.chapterId) === chapterId) || episodes.find((item) => String((num(asRecord(item)?.chapterIndex) ?? -1) + 1) === chapterId));
	const candidates = [];
	const playUrls = asRecord(record?.playUrls) ?? {};
	for (const quality of [
		"720",
		"540",
		"1080"
	]) pushCandidate(candidates, playUrls[quality], quality);
	for (const rendition of asArray(record?.renditions)) {
		const item = asRecord(rendition);
		pushCandidate(candidates, item?.url, str(item?.quality));
	}
	if (!candidates.length) try {
		const hls = await providerFetch("dramabox", `/get-hls/${enc(bookId)}/${enc(chapterId)}?${query}`, {
			cacheTtl: 15e3,
			cacheKey: `db-hls:${bookId}:${chapterId}`
		});
		pushCandidate(candidates, str(hls.url) || str(hls.hlsUrl) || str(hls.m3u8) || str(asRecord(hls.data)?.url), "hls");
		for (const item of asArray(hls.episodes ?? asRecord(hls.data)?.episodes)) {
			const episode = asRecord(item);
			if (str(episode?.chapterId) !== chapterId) continue;
			pushCandidate(candidates, episode?.url ?? episode?.hlsUrl, "hls");
		}
	} catch {}
	return candidates;
}
function mapCard(raw) {
	const record = asRecord(raw);
	if (!record) return null;
	const seriesId = str(record.key) || str(record.id) || str(record.series_key);
	const title = str(record.title) || str(record.name);
	if (!seriesId || !title) return null;
	const tags = [
		...tagList(record.content_tags),
		...tagList(record.tag),
		...tagList(record.series_tag)
	];
	const finish = num(record.finish_status);
	const nested = asRecord(record.episode_info) ?? asRecord(asRecord(record.container)?.episode_info);
	return {
		provider: "freereels",
		seriesId,
		title,
		posterUrl: absoluteUrl(record.cover),
		bannerUrl: absoluteUrl(record.cover),
		description: str(record.desc),
		tags: [...new Set(tags)].slice(0, 8),
		language: str(record.language) || str(record.original_audio),
		episodeCount: num(record.episode_count),
		completed: finish === 2 ? true : finish === 1 ? false : null,
		scoreLabel: str(record.hot_score),
		playCount: str(record.view_count) || str(record.follow_count),
		badge: record.free === true ? "Free" : null,
		firstEpisodeId: str(nested?.id)
	};
}
function mapCards(list) {
	const cards = [];
	for (const item of asArray(list)) {
		const card = mapCard(item);
		if (card) cards.push(card);
	}
	return cards;
}
function mapEpisodes(list) {
	return asArray(list).flatMap((item, index) => {
		const record = asRecord(item);
		if (!record) return [];
		const episodeId = str(record.id) || str(record.episode_key);
		if (!episodeId) return [];
		const hasStream = Boolean(str(record.h264_m3u8) || str(record.h265_m3u8));
		const locked = record.unlock === false || record.video_type && record.video_type !== "free" && !hasStream;
		return [{
			episodeId,
			index: num(record.index) ?? index + 1,
			title: str(record.name) || `Episode ${num(record.index) ?? index + 1}`,
			coverUrl: absoluteUrl(record.cover),
			durationSec: num(record.duration),
			access: locked ? "limited" : "open"
		}];
	});
}
async function freereelsChannels(lang) {
	return asArray((await providerFetch("freereels", `/get-channels?lang=${enc(frLang(lang))}`, {
		cacheTtl: 18e4,
		cacheKey: `fr-channels:${lang}`
	})).data).flatMap((item) => {
		const record = asRecord(item);
		const key = str(record?.tab_key);
		const name = str(record?.name);
		return key && name ? [{
			key,
			name
		}] : [];
	});
}
async function freereelsChannel(tabKey, lang) {
	return asArray(asRecord((await providerFetch("freereels", `/get-channel-content?tab_key=${enc(tabKey)}&lang=${enc(frLang(lang))}`, {
		cacheTtl: 9e4,
		cacheKey: `fr-channel:${lang}:${tabKey}`
	})).data)?.items).map((mod) => {
		const record = asRecord(mod);
		return {
			name: str(record?.module_name) || str(record?.show_title) || "FreeReels",
			items: mapCards(record?.items)
		};
	});
}
async function freereelsForYou(lang, offset = 0) {
	const data = asRecord((await providerFetch("freereels", `/get-foryou?lang=${enc(frLang(lang))}&offset=${offset}`, {
		cacheTtl: 6e4,
		cacheKey: `fr-foryou:${lang}:${offset}`
	})).data) ?? {};
	const page = asRecord(data.page_info);
	return {
		items: mapCards(data.items),
		hasMore: page?.has_more === true,
		next: str(page?.next)
	};
}
async function freereelsSearch(keyword, lang, offset = 0) {
	const payload = await providerFetch("freereels", `/search?q=${enc(keyword)}&lang=${enc(frLang(lang))}&offset=${offset}&page_size=20`, {
		cacheTtl: 45e3,
		cacheKey: `fr-search:${lang}:${keyword}:${offset}`
	});
	const page = asRecord(payload.page_info);
	return {
		items: mapCards(payload.items),
		hasMore: page?.has_more === true
	};
}
async function freereelsDetail(seriesId, lang) {
	const payload = await providerFetch("freereels", `/get-detail/${enc(seriesId)}?lang=${enc(frLang(lang))}`, {
		cacheTtl: 12e4,
		cacheKey: `fr-detail:${lang}:${seriesId}`
	});
	const data = asRecord(payload.data) ?? payload;
	const card = mapCard({
		...data,
		id: seriesId
	});
	let episodes = mapEpisodes(data.episodes);
	if (!episodes.length) {
		const extra = await providerFetch("freereels", `/get-episodes/${enc(seriesId)}?lang=${enc(frLang(lang))}`, {
			cacheTtl: 12e4,
			cacheKey: `fr-eps:${lang}:${seriesId}`
		});
		const extraData = asRecord(extra.data) ?? extra;
		episodes = mapEpisodes(extraData.episodes);
		if (!card) return {
			card: mapCard({
				...extraData,
				id: seriesId
			}),
			episodes
		};
	}
	if (card && episodes[0]) card.firstEpisodeId = episodes[0].episodeId;
	return {
		card,
		episodes
	};
}
function subtitlesOf(value) {
	const tracks = [];
	for (const item of asArray(value)) {
		const record = asRecord(item);
		const url = str(record?.vtt) || str(record?.srt);
		const lang = str(record?.language);
		if (!url || !lang) continue;
		tracks.push({
			lang,
			label: str(record?.display_name) || lang,
			url: upgradeHttps(url)
		});
	}
	return tracks.slice(0, 12);
}
async function freereelsStream(seriesId, episodeKey, lang) {
	const payload = await providerFetch("freereels", `/get-stream/${enc(seriesId)}/${enc(episodeKey)}?lang=${enc(frLang(lang))}`, {
		cacheTtl: 2e4,
		cacheKey: `fr-stream:${lang}:${seriesId}:${episodeKey}`
	});
	const data = asRecord(payload.data) ?? payload;
	const subs = subtitlesOf(data.subtitles);
	const candidates = [];
	const h264 = str(data.h264_m3u8) || str(data.external_audio_h264_m3u8);
	const h265 = str(data.h265_m3u8) || str(data.external_audio_h265_m3u8);
	if (h264) candidates.push({
		url: upgradeHttps(h264),
		format: guessFormat(h264),
		quality: "h264",
		subtitles: subs
	});
	if (h265) candidates.push({
		url: upgradeHttps(h265),
		format: guessFormat(h265),
		quality: "h265",
		subtitles: subs
	});
	return {
		candidates,
		blocked: data.unlock === false && candidates.length === 0
	};
}
var TITLE_KEYS = [
	"book_title",
	"shortPlayName",
	"series_title",
	"seriesTitle",
	"bookTitle",
	"drama_title",
	"short_play_name",
	"seriesName",
	"series_name",
	"dramaName",
	"drama_name",
	"playletName",
	"playlet_name",
	"bookName",
	"book_name",
	"videoName",
	"programName",
	"showName",
	"title",
	"name"
];
var ID_KEYS = [
	"book_id",
	"bookId",
	"series_id",
	"seriesId",
	"dramaId",
	"drama_id",
	"shortPlayId",
	"short_play_id",
	"playletId",
	"playlet_id",
	"programId",
	"program_id",
	"videoId",
	"video_id",
	"movieId",
	"movie_id",
	"theaterId",
	"theater_id",
	"showId",
	"show_id",
	"compilations_id",
	"cid"
];
var IMAGE_KEYS = [
	"book_pic",
	"shortPlayCover",
	"cover_url",
	"cover",
	"cover_image",
	"cover_image_url",
	"series_cover",
	"series_cover_url",
	"cover_uri",
	"compress_cover_url",
	"coverImageUrl",
	"coverUrl",
	"posterUrl",
	"poster",
	"cover",
	"thumbnailExpanded",
	"thumbnail",
	"bannerImage",
	"bannerUrl",
	"banner",
	"highImage",
	"image",
	"pic"
];
var URL_KEYS = [
	"video_url",
	"videoUrl",
	"playUrl",
	"play_url",
	"m3u8_url",
	"m3u8",
	"streamUrl",
	"stream_url",
	"proxy_url",
	"proxyUrl",
	"play_url_proxy",
	"url"
];
var homePath = /* @__PURE__ */ new Map();
function withLang(path, lang) {
	const code = lang === "id" ? "in" : lang || "en";
	return `${path}${path.includes("?") ? "&" : "?"}lang=${enc(code)}`;
}
function imageOf(record) {
	const nestedImageKeys = [
		"book_pic",
		"bookPic",
		"shortPlayCover",
		"cover",
		"coverInfo",
		"cover_info",
		"imageInfo",
		"image_info",
		"posterInfo",
		"poster_info",
		"thumb",
		"thumbnail",
		"images",
		"image",
		"pic",
		"coverUrlInfo"
	];
	const seen = /* @__PURE__ */ new Set();
	const queue = [record];
	while (queue.length) {
		const current = queue.shift();
		if (!current || typeof current !== "object" || seen.has(current)) continue;
		seen.add(current);
		if (Array.isArray(current)) {
			queue.push(...current.slice(0, 12));
			continue;
		}
		const item = current;
		for (const key of IMAGE_KEYS) {
			const raw = item[key];
			const candidates = Array.isArray(raw) ? raw : [raw];
			for (const candidate of candidates) {
				const url = absoluteUrl(candidate && typeof candidate === "object" ? str(candidate.url) || str(candidate.uri) || str(candidate.src) || str(candidate.url_list) : candidate);
				if (url && !/\.(m3u8|mp4)(\?|$)/i.test(url)) return upgradeHttps(url);
			}
		}
		for (const key of nestedImageKeys) {
			const nested = item[key];
			if (nested && typeof nested === "object") queue.push(nested);
			else if (typeof nested === "string" && /https?:|^\/\//i.test(nested)) {
				const url = absoluteUrl(nested);
				if (url && !/\.(m3u8|mp4)(\?|$)/i.test(url)) return upgradeHttps(url);
			}
		}
	}
	return null;
}
function descriptionOf(record) {
	return str(record.description) || str(record.abstract) || str(record.intro) || str(record.introduction) || str(record.synopsis) || str(record.logLine) || str(record.desc) || str(record.brief) || null;
}
function tagsOf(record) {
	const direct = tagList(record.tags ?? record.content_tag ?? record.labelArray ?? record.shortPlayLabels ?? record.categories);
	if (direct.length) return direct;
	if (typeof record.categories === "string" && record.categories.trim()) {
		const categories = record.categories.split(/[,，、]/).map((item) => item.trim()).filter(Boolean);
		if (categories.length) return [...new Set(categories)].slice(0, 8);
	}
	const genres = asArray(record.genres).map((item) => str(item) || str(asRecord(item)?.title) || str(asRecord(item)?.name)).filter((item) => Boolean(item));
	if (genres.length) return [...new Set(genres)].slice(0, 6);
	const category = str(record.category) || str(record.subCategory);
	return category ? [category] : [];
}
function usableTitle(value) {
	if (!value || value.length < 2 || value.length > 140) return null;
	if (/^episode\s*\d+/i.test(value) || /^\d+(\.mp4)?$/i.test(value)) return null;
	return value;
}
function isEpisodeRow(record) {
	if (record.episode_price != null && record.index != null && record.duration != null) return true;
	if ((record.m3u8_url != null || record.external_audio_h264_m3u8) && record.duration != null) return true;
	if (record.seq != null && record.episodeId != null && record.dramaId == null && record.bookId == null && record.seriesId == null) return true;
	return false;
}
function toCard(record, provider) {
	if (!record || isEpisodeRow(record)) return null;
	let title = null;
	for (const key of TITLE_KEYS) {
		title = usableTitle(str(record[key]));
		if (title) break;
	}
	if (!title) return null;
	let seriesId = null;
	for (const key of ID_KEYS) {
		const value = str(record[key]);
		if (value && value.length < 80 && !value.startsWith("section_")) {
			seriesId = value;
			break;
		}
	}
	if (!seriesId) {
		const id = str(record.id);
		if (id && imageOf(record) && !id.startsWith("section_") && id.length < 48) seriesId = id;
	}
	if (!seriesId) return null;
	const posterUrl = imageOf(record);
	const description = descriptionOf(record);
	if (!posterUrl && !description && title.length < 12) return null;
	const progress = asRecord(record.read_progress_episode);
	return {
		provider,
		seriesId,
		title,
		posterUrl,
		bannerUrl: absoluteUrl(record.bannerImage) || absoluteUrl(record.bannerUrl) || posterUrl,
		description,
		tags: tagsOf(record),
		language: str(record.language) || str(record.lang),
		episodeCount: num(record.episode_cnt) ?? num(record.episodes) ?? num(record.episodeTotal) ?? num(record.total_episodes) ?? num(record.totalEpisodes) ?? num(record.episodeCount) ?? num(record.chapter_count) ?? num(record.chapterCount) ?? num(record.current_count) ?? num(record.totalEpisode),
		completed: record.completed === true ? true : record.status === 2 ? true : null,
		scoreLabel: str(record.score) || str(record.scoreLabel),
		playCount: str(record.playCount) || str(record.views) || str(record.view_count) || str(record.read_count) || str(record.collect_count),
		badge: str(record.badge) || str(record.cornerMark) || str(record.rank_level),
		firstEpisodeId: str(record.firstEpisodeId) || str(record.first_chapter_id) || str(record.firstChapterId) || str(progress?.episode_order) || str(progress?.episode_id)
	};
}
function extractCards(root, provider) {
	const found = [];
	const seen = /* @__PURE__ */ new Set();
	const visit = (node) => {
		if (Array.isArray(node)) {
			node.forEach(visit);
			return;
		}
		const record = asRecord(node);
		if (!record) return;
		const card = toCard(record, provider);
		if (card && !seen.has(card.seriesId)) {
			seen.add(card.seriesId);
			found.push(card);
		}
		for (const value of Object.values(record)) if (value && typeof value === "object") visit(value);
	};
	visit(root);
	return found.slice(0, 80);
}
function channelIds(root) {
	const ids = [];
	const visit = (node) => {
		if (Array.isArray(node)) {
			node.forEach(visit);
			return;
		}
		const record = asRecord(node);
		if (!record) return;
		const id = str(record.channelId) || str(record.navigationTagId) || str(record.tab_id) || str(record.tabId) || str(record.nav_id);
		if (id && (record.channelId || record.tab_name || record.tab_id || record.navigationTagId || record.isHome != null)) ids.push(id);
		for (const value of Object.values(record)) if (value && typeof value === "object") visit(value);
	};
	visit(root);
	return [...new Set(ids)].slice(0, 2);
}
async function read(provider, path, lang) {
	return await providerFetch(provider, withLang(path, lang), {
		cacheTtl: 18e4,
		timeout: 5e3,
		cacheKey: `${provider}:${lang}:${path}`
	});
}
var MELOLO_CHANNEL_LANGS = /* @__PURE__ */ new Set([
	"en",
	"id",
	"th",
	"es",
	"pt"
]);
function meloloLang(lang) {
	const code = (lang || "en").toLowerCase().split("-")[0];
	return MELOLO_CHANNEL_LANGS.has(code) ? code : "en";
}
async function meloloRead(path, cacheTtl = 9e4) {
	return providerFetch("melolo", path, {
		cacheTtl,
		timeout: 6500,
		retries: 0,
		cacheKey: `melolo:${path}`
	});
}
function meloloChannelNames(root) {
	const names = [];
	for (const tab of asArray(asRecord(root)?.data)) for (const category of asArray(asRecord(tab)?.categories)) {
		const name = str(asRecord(category)?.name);
		if (name && !names.includes(name)) names.push(name);
	}
	return names;
}
function meloloCards(root) {
	return asArray(asRecord(root)?.data).flatMap((item) => {
		const record = asRecord(item);
		if (!record) return [];
		const title = usableTitle(str(record.title) || str(record.name));
		const seriesId = str(record.series_id) || str(record.seriesId);
		const posterUrl = imageOf(record);
		if (!title || !seriesId || !posterUrl) return [];
		return [{
			provider: "melolo",
			seriesId,
			title,
			posterUrl,
			bannerUrl: posterUrl,
			description: descriptionOf(record),
			tags: tagsOf(record),
			language: str(record.language),
			episodeCount: num(record.episodes) ?? num(record.episode_cnt) ?? num(record.episode_count),
			completed: record.status === 2 ? true : null,
			scoreLabel: null,
			playCount: str(record.play_cnt),
			badge: null,
			firstEpisodeId: null
		}];
	});
}
function meloloEpisodeRows(root) {
	const data = asRecord(root)?.data ?? root;
	if (Array.isArray(data)) return data;
	const record = asRecord(data);
	return record && Array.isArray(record.episodes) ? record.episodes : [];
}
function meloloEpisodes(root) {
	return meloloEpisodeRows(root).flatMap((item, index) => {
		const record = asRecord(item);
		if (!record) return [];
		const episodeId = str(record.vid) || str(record.video_id);
		if (!episodeId) return [];
		const order = num(record.order) ?? num(record.index) ?? index + 1;
		return [{
			episodeId,
			index: order,
			title: `Episode ${order}`,
			coverUrl: imageOf(record),
			durationSec: num(record.duration),
			access: record.locked === true ? "limited" : "open"
		}];
	});
}
function meloloStreams(root) {
	const data = asRecord(asRecord(root)?.data) ?? asRecord(root);
	if (!data) return [];
	const lists = Array.isArray(data.qualities) ? [data.qualities] : [];
	if (!lists.length) for (const value of Object.values(data)) {
		const record = asRecord(value);
		if (record && Array.isArray(record.qualities)) lists.push(record.qualities);
	}
	const seen = /* @__PURE__ */ new Set();
	return lists.flatMap((list) => list.flatMap((item) => {
		const row = asRecord(item);
		const raw = str(row?.proxy_url);
		if (!row || !raw || !/^https?:\/\//i.test(raw)) return [];
		const url = upgradeHttps(raw);
		if (seen.has(url)) return [];
		seen.add(url);
		return [{
			url,
			format: guessFormat(url) === "hls" ? "hls" : "mp4",
			quality: num(row.height) ? `${num(row.height)}p` : null,
			height: num(row.height) ?? 0,
			subtitles: []
		}];
	})).sort((a, b) => b.height - a.height).slice(0, 4).map(({ height: _height, ...candidate }) => candidate);
}
async function meloloBrowse(lang) {
	const code = meloloLang(lang);
	let categories = ["Popular"];
	try {
		const discovered = meloloChannelNames(await meloloRead(`/get-channels?lang=${enc(code)}`, 12e4));
		if (discovered.length) categories = discovered;
	} catch {}
	const picked = categories.slice(0, 3);
	return dedupeCards((await Promise.all(picked.map(async (category) => {
		try {
			return meloloCards(await meloloRead(`/get-channel-content?category=${enc(category)}&lang=${enc(code)}`, 9e4));
		} catch {
			return [];
		}
	}))).flat());
}
function dedupeCards(cards) {
	const seen = /* @__PURE__ */ new Set();
	return cards.filter((card) => {
		if (seen.has(card.seriesId)) return false;
		seen.add(card.seriesId);
		return true;
	}).slice(0, 80);
}
async function genericBrowse(provider, lang) {
	return withFetchBudget(7e3, () => browseProvider(provider, lang));
}
/** Fetch a provider's explicitly configured For You feed for the Shorts viewer. */
async function genericShortsFeed(provider, lang) {
	const path = provider === "netshort" || provider === "dramawave" ? "/get-foryou" : null;
	if (!path) return [];
	return withFetchBudget(6500, async () => {
		return extractCards(await read(provider, path, lang), provider);
	});
}
async function browseProvider(provider, lang) {
	if (provider === "melolo") return meloloBrowse(lang);
	const cached = homePath.get(`${provider}:${lang}`);
	const paths = cached ? [cached, ...homeCandidates(provider).filter((item) => item !== cached)] : homeCandidates(provider);
	let last = null;
	for (const path of paths) try {
		last = await read(provider, path, lang);
		const cards = extractCards(last, provider);
		if (cards.length > 0) {
			homePath.set(`${provider}:${lang}`, path);
			return cards;
		}
	} catch {}
	for (const id of channelIds(last)) for (const path of [
		`/get-home/${enc(id)}`,
		`/get-channel/${enc(id)}`,
		`/get-tab/${enc(id)}`
	]) try {
		const cards = extractCards(await read(provider, path, lang), provider);
		if (cards.length >= 4) return cards;
	} catch {}
	return extractCards(last, provider);
}
async function genericSearch(provider, query, lang) {
	const q = enc(query);
	if (provider === "melolo") try {
		return meloloCards(await meloloRead(`/search?keyword=${q}&lang=${enc(meloloLang(lang))}`, 45e3));
	} catch {
		return [];
	}
	const paths = [
		`/search/${q}`,
		`/search?keyword=${q}`,
		`/search?q=${q}`,
		`/search?query=${q}`
	];
	for (const path of paths) try {
		const cards = extractCards(await read(provider, path, lang), provider);
		if (cards.length) return cards;
	} catch {}
	return [];
}
function extractEpisodes(root) {
	const found = [];
	const seen = /* @__PURE__ */ new Set();
	const visit = (node) => {
		if (Array.isArray(node)) {
			node.forEach(visit);
			return;
		}
		const record = asRecord(node);
		if (!record) return;
		const seq = num(record.seq) ?? num(record.episodeSort) ?? num(record.episode_order) ?? num(record.sort) ?? num(record.order) ?? num(record.index) ?? num(record.episode_number) ?? num(record.episodeNumber);
		const episodeId = str(record.vid) || str(record.video_id) || str(record.videoId) || str(record.vid_id) || str(record.seq) || str(record.episodeSort) || str(record.chapterId) || str(record.chapter_id) || str(record.episodeId) || str(record.episode_id) || (seq != null ? String(seq) : null);
		const episodeLike = record.seq != null || record.episodeId != null || record.chapterId != null || record.episode_order != null || record.episodeSort != null || record.vid != null || record.video_id != null || record.videoId != null || record.vid_id != null;
		if (episodeId && episodeLike && !seen.has(episodeId)) {
			seen.add(episodeId);
			const locked = record.unlock === false || record.isCharge === 1 || record.isCharged === true || record.locked === true;
			found.push({
				episodeId,
				index: seq ?? found.length + 1,
				title: usableTitle(str(record.title) || str(record.chapterName) || str(record.name)) || `Episode ${seq ?? found.length + 1}`,
				coverUrl: imageOf(record),
				durationSec: num(record.duration) ?? num(record.durationSec) ?? num(record.totalDuration),
				access: locked ? "limited" : "open"
			});
		}
		for (const value of Object.values(record)) if (value && typeof value === "object") visit(value);
	};
	visit(root);
	return found.slice(0, 200);
}
async function genericDetail(provider, seriesId, lang) {
	if (provider === "melolo") {
		const code = meloloLang(lang);
		const detail = await meloloRead(`/get-detail/${enc(seriesId)}?lang=${enc(code)}`, 9e4);
		let episodes = meloloEpisodes(detail);
		if (!episodes.length) try {
			episodes = meloloEpisodes(await meloloRead(`/get-episodes/${enc(seriesId)}`, 9e4));
		} catch {
			episodes = [];
		}
		const data = asRecord(asRecord(detail)?.data);
		const card = data ? meloloCards({ data: [{
			...data,
			series_id: str(data.series_id) || seriesId
		}] })[0] ?? null : null;
		if (card && episodes[0]) card.firstEpisodeId = episodes[0].episodeId;
		if (card && episodes.length && !card.episodeCount) card.episodeCount = episodes.length;
		return {
			card,
			episodes
		};
	}
	const detail = await read(provider, `/get-detail/${enc(seriesId)}`, lang);
	let episodes = extractEpisodes(detail);
	if (!episodes.length) try {
		episodes = extractEpisodes(await read(provider, `/get-episodes/${enc(seriesId)}`, lang));
	} catch {
		episodes = [];
	}
	const cards = extractCards(detail, provider);
	const card = cards.find((item) => item.seriesId === seriesId) ?? cards[0] ?? null;
	if (card && !card.firstEpisodeId && episodes[0]) card.firstEpisodeId = episodes[0].episodeId;
	if (card && episodes.length && !card.episodeCount) card.episodeCount = episodes.length;
	return {
		card,
		episodes
	};
}
function extractStreams(root) {
	const found = [];
	const seen = /* @__PURE__ */ new Set();
	const push = (value, loose) => {
		const raw = str(value);
		if (!raw || !/^https?:\/\//i.test(raw)) return;
		if (/\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(raw)) return;
		const url = upgradeHttps(raw);
		if (seen.has(url)) return;
		if (!loose && !/\.(m3u8|mp4)(\?|$)/i.test(url) && !/m3u8|video|stream|playlist/i.test(url)) return;
		seen.add(url);
		found.push({
			url,
			format: guessFormat(url),
			quality: null,
			subtitles: []
		});
	};
	const visit = (node) => {
		if (typeof node === "string") {
			push(node, false);
			return;
		}
		if (Array.isArray(node)) {
			node.forEach(visit);
			return;
		}
		const record = asRecord(node);
		if (!record) return;
		for (const key of URL_KEYS) push(record[key], true);
		for (const value of Object.values(record)) if (value && typeof value === "object") visit(value);
	};
	visit(root);
	return found.slice(0, 6);
}
async function genericStream(provider, seriesId, episodeId, lang) {
	if (provider === "melolo") try {
		return meloloStreams(await providerFetch("melolo", `/get-streams-proxy/${enc(episodeId)}`, {
			timeout: 8e3,
			retries: 0,
			cacheTtl: 15e3,
			cacheKey: `melolo:proxy:${episodeId}`
		}));
	} catch {
		return [];
	}
	const attempts = [`/get-stream/${enc(seriesId)}/${enc(episodeId)}`, `/get-stream/${enc(episodeId)}?seriesId=${enc(seriesId)}`].map(async (path) => {
		const streams = extractStreams(await providerFetch(provider, withLang(path, lang), {
			timeout: 4500,
			retries: 0,
			cacheTtl: 0
		}));
		if (!streams.length) throw new Error("No stream in this route shape");
		return streams;
	});
	try {
		return await Promise.any(attempts);
	} catch {
		return [];
	}
}
var catalog_exports = /* @__PURE__ */ __exportAll({
	loadBrowse: () => loadBrowse,
	loadDetail: () => loadDetail,
	loadHome: () => loadHome,
	loadPlayback: () => loadPlayback,
	loadSearch: () => loadSearch,
	loadShorts: () => loadShorts,
	loadStream: () => loadStream,
	pingProviders: () => pingProviders
});
var GENRES = [
	{
		id: "romance",
		title: "Romance",
		test: /romance|cinta|love|asmara|爱情|恋爱/i
	},
	{
		id: "revenge",
		title: "Revenge",
		test: /revenge|dendam|balas|复仇|报复|counterattack|serangan/i
	},
	{
		id: "billionaire",
		title: "Billionaire Romance",
		test: /billionaire|miliarder|tycoon|taipan|富豪|亿万|heir|pewaris/i
	},
	{
		id: "ceo",
		title: "CEO Romance",
		test: /\bceo\b|总裁|konglomerat|boss/i
	},
	{
		id: "historical",
		title: "Historical Drama",
		test: /historical|palace|dynasty|kerajaan|古装|宫廷|emperor|kaisar/i
	},
	{
		id: "fantasy",
		title: "Fantasy",
		test: /fantasy|werewolf|lycan|vampire|naga|奇幻|仙侠|magic|supernatural/i
	},
	{
		id: "family",
		title: "Family Drama",
		test: /family|keluarga|家庭|ibu|parent/i
	},
	{
		id: "comedy",
		title: "Comedy",
		test: /comedy|komedi|喜剧|funny|humor/i
	}
];
var POPULAR_PROVIDER_IDS = [
	"goodshort",
	"netshort",
	"reelshort",
	"shortmax",
	"flextv",
	"dramawave",
	"melolo",
	"joyreels",
	"flickreels",
	"vigloo",
	"stardusttv",
	"shortical"
];
function mixSources(groups, limit, start = 0) {
	const lists = groups.map((items) => dedupe(items));
	const mixed = [];
	const seen = /* @__PURE__ */ new Set();
	const max = Math.max(0, ...lists.map((items) => items.length));
	for (let index = 0; index < max && mixed.length < limit; index += 1) for (let offset = 0; offset < lists.length && mixed.length < limit; offset += 1) {
		const card = lists[(start + offset) % lists.length]?.[index];
		if (!card) continue;
		const key = dramaKey(card);
		if (seen.has(key)) continue;
		seen.add(key);
		mixed.push(card);
	}
	return mixed;
}
function settledStatus(id, result) {
	if (!providerEnabled(id)) return {
		id,
		ok: false,
		error: "Disabled in admin"
	};
	if (result.status === "fulfilled") return {
		id,
		ok: true,
		error: null
	};
	const reason = result.reason;
	return {
		id,
		ok: false,
		error: reason instanceof Error ? reason.message : "Unavailable"
	};
}
function dedupe(items) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const item of items) {
		const key = dramaKey(item);
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(item);
	}
	return out;
}
async function localizeHome(payload, lang) {
	const heroKeys = new Set(payload.hero.map((item) => dramaKey(item)));
	const all = dedupe([...payload.hero, ...payload.sections.flatMap((item) => item.items)]);
	const localized = await localizeCards(all, lang, heroKeys);
	const byKey = new Map(localized.map((item) => [dramaKey(item), item]));
	return {
		...payload,
		hero: payload.hero.map((card) => byKey.get(dramaKey(card)) ?? card),
		sections: payload.sections.map((item) => ({
			...item,
			items: item.items.map((card) => byKey.get(dramaKey(card)) ?? card)
		}))
	};
}
async function searchProviders(q, lang, page, want) {
	const [ar, db, fr] = await Promise.all([
		want("anyreel") ? safe("anyreel", () => anyreelSearch(q, page), null) : Promise.resolve({
			status: "fulfilled",
			value: null
		}),
		want("dramabox") && page === 1 ? safe("dramabox", () => dramaboxSearch(q, lang), []) : Promise.resolve({
			status: "fulfilled",
			value: []
		}),
		want("freereels") ? safe("freereels", () => freereelsSearch(q, lang, (page - 1) * 20), null) : Promise.resolve({
			status: "fulfilled",
			value: null
		})
	]);
	const extras = PROVIDERS.filter((id) => !isCoreProvider(id) && !isProviderHidden(id) && want(id));
	const extraResults = await Promise.all(extras.map((id) => safe(id, () => genericSearch(id, q, lang), [])));
	return {
		items: dedupe([
			...ar.status === "fulfilled" && ar.value ? ar.value.items : [],
			...db.status === "fulfilled" ? db.value : [],
			...fr.status === "fulfilled" && fr.value ? fr.value.items : [],
			...extraResults.flatMap((result) => result.status === "fulfilled" ? result.value : [])
		]),
		hasMore: Boolean(ar.status === "fulfilled" && ar.value?.hasMore || fr.status === "fulfilled" && fr.value?.hasMore),
		providers: [
			settledStatus("anyreel", want("anyreel") ? ar : {
				status: "fulfilled",
				value: true
			}),
			settledStatus("dramabox", want("dramabox") ? db : {
				status: "fulfilled",
				value: true
			}),
			settledStatus("freereels", want("freereels") ? fr : {
				status: "fulfilled",
				value: true
			}),
			...extras.map((id, index) => settledStatus(id, extraResults[index] ?? {
				status: "fulfilled",
				value: []
			}))
		].filter((item) => want(item.id))
	};
}
function section(id, title, items, limit = 18) {
	if (!sectionEnabled(id)) return null;
	const unique = dedupe(items).slice(0, limit);
	if (!unique.length) return null;
	return {
		id,
		title,
		items: unique
	};
}
async function fillHeroEpisodes(cards, lang) {
	return Promise.all(cards.map(async (card) => {
		if (card.firstEpisodeId) return card;
		try {
			const detail = isCoreProvider(card.provider) ? card.provider === "anyreel" ? await anyreelDetail(card.seriesId) : card.provider === "dramabox" ? await dramaboxDetail(card.seriesId, lang) : await freereelsDetail(card.seriesId, lang) : await genericDetail(card.provider, card.seriesId, lang);
			const episodeId = detail.card?.firstEpisodeId ?? detail.episodes[0]?.episodeId ?? null;
			return episodeId ? {
				...card,
				firstEpisodeId: episodeId
			} : card;
		} catch {
			return card;
		}
	}));
}
function feedRank(name) {
	const label = name.toLowerCase();
	if (/dub|sulih|alih/.test(label)) return 0;
	if (/populer|popular|hot|tren|rank/.test(label)) return 1;
	if (/\bnew\b|baru|terbaru|latest/.test(label)) return 2;
	return 10;
}
function preferFeedChannels(channels) {
	const picked = [...channels].sort((a, b) => feedRank(a.name) - feedRank(b.name)).filter((channel) => feedRank(channel.name) < 10).slice(0, 3);
	return picked.length ? picked : channels.slice(0, 3);
}
function cardsFromChannel(result) {
	if (result.status !== "fulfilled") return [];
	return result.value.flatMap((block) => block.items);
}
function genreRails(items) {
	const rails = [];
	for (const genre of GENRES) {
		const matched = items.filter((item) => {
			const haystack = `${item.title} ${item.tags.join(" ")} ${item.description ?? ""}`;
			return genre.test.test(haystack);
		});
		const rail = section(genre.id, genre.title, matched);
		if (rail && rail.items.length >= 4) rails.push(rail);
	}
	return rails;
}
function normTitle(title) {
	return title.toLowerCase().replace(/\(.*?\)/g, " ").replace(/sulih suara|dubbed|dub\b/gi, " ").replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ").trim();
}
async function safe(id, run, fallback) {
	if (!providerEnabled(id)) return {
		status: "rejected",
		reason: /* @__PURE__ */ new Error("Disabled in admin")
	};
	try {
		return {
			status: "fulfilled",
			value: await run()
		};
	} catch (reason) {
		return {
			status: "rejected",
			reason
		};
	}
}
var homePayloadCache = /* @__PURE__ */ new Map();
async function loadHome(lang, provider = "all") {
	const key = `${lang}:${provider}`;
	const hit = homePayloadCache.get(key);
	if (hit && hit.exp > Date.now()) return hit.data;
	const data = await withFetchBudget(4e3, () => loadHomeWithinBudget(lang, provider));
	if (data.hero.length || data.sections.length) homePayloadCache.set(key, {
		exp: Date.now() + 45e3,
		data
	});
	return data;
}
async function loadHomeWithinBudget(lang, provider = "all") {
	if (provider !== "all") {
		const browse = await loadBrowse({
			lang,
			provider,
			page: 1
		});
		const heroes = browse.items.slice(0, 4);
		const rail = section(provider, providerLabel(provider), browse.items);
		return {
			hero: heroes,
			sections: rail ? [rail] : [],
			providers: browse.providers,
			generatedAt: Date.now()
		};
	}
	const popularProviderPromise = Promise.all(POPULAR_PROVIDER_IDS.map((id) => safe(id, () => genericBrowse(id, lang), [])));
	const [arHome, arRank, arSearch, dbHome, dbLatest, dbRank, frChannels, frYou] = await Promise.all([
		safe("anyreel", () => anyreelHome(), null),
		safe("anyreel", () => anyreelRank(), []),
		safe("anyreel", () => anyreelSearchHome(), []),
		safe("dramabox", () => dramaboxHome(lang), null),
		safe("dramabox", () => dramaboxLatest(lang), []),
		safe("dramabox", () => dramaboxRank(lang), null),
		safe("freereels", () => freereelsChannels(lang), []),
		safe("freereels", () => freereelsForYou(lang, 0), null)
	]);
	const channelPlan = frChannels.status === "fulfilled" ? preferFeedChannels(frChannels.value) : [];
	const channelResults = await Promise.all(channelPlan.map((channel) => safe("freereels", () => freereelsChannel(channel.key, lang), [])));
	const popularProviderResults = await popularProviderPromise;
	const anyreelCards = [];
	const hero = [];
	if (arHome.status === "fulfilled" && arHome.value) {
		const byId = /* @__PURE__ */ new Map();
		for (const block of arHome.value.sections) {
			for (const item of block.items) byId.set(item.seriesId, item);
			anyreelCards.push(...block.items);
		}
		for (const banner of arHome.value.banners) {
			const record = banner;
			const seriesId = typeof record.seriesId === "string" ? record.seriesId : "";
			const known = seriesId ? byId.get(seriesId) : void 0;
			if (known) hero.push({
				...known,
				bannerUrl: typeof record.coverImageUrl === "string" ? record.coverImageUrl : known.bannerUrl,
				badge: typeof record.cornerMark === "string" ? record.cornerMark : known.badge
			});
		}
	}
	if (arRank.status === "fulfilled") anyreelCards.push(...arRank.value);
	if (arSearch.status === "fulfilled") for (const block of arSearch.value) anyreelCards.push(...block.items);
	const dramaboxCards = [];
	if (dbHome.status === "fulfilled" && dbHome.value) {
		for (const column of dbHome.value.columns) dramaboxCards.push(...column.items);
		dramaboxCards.push(...dbHome.value.recommend);
		hero.push(...dbHome.value.banners);
	}
	if (dbLatest.status === "fulfilled") dramaboxCards.push(...dbLatest.value);
	if (dbRank.status === "fulfilled" && dbRank.value) dramaboxCards.push(...dbRank.value.items);
	const freereelsCards = [];
	const dubbedCards = [];
	const freshCards = [];
	const hotCards = [];
	channelPlan.forEach((channel, index) => {
		const cards = cardsFromChannel(channelResults[index]);
		freereelsCards.push(...cards);
		const rank = feedRank(channel.name);
		if (rank === 0) dubbedCards.push(...cards);
		else if (rank === 2) freshCards.push(...cards);
		else hotCards.push(...cards);
	});
	if (frYou.status === "fulfilled" && frYou.value) freereelsCards.push(...frYou.value.items);
	if ((arHome.status === "fulfilled" ? arHome.value?.banners.length ?? 0 : 0) - hero.filter((item) => item.provider === "anyreel").length > 0 && arHome.status === "fulfilled" && arHome.value) {
		const known = new Set(hero.map((item) => item.seriesId));
		const lookups = arHome.value.banners.map((banner) => {
			return typeof banner.seriesId === "string" ? banner.seriesId : "";
		}).filter((id) => id && !known.has(id)).slice(0, 4);
		(await Promise.all(lookups.map((id) => safe("anyreel", () => anyreelDetail(id), null)))).forEach((result, index) => {
			if (result.status === "fulfilled" && result.value?.card) {
				const banner = arHome.value?.banners.find((item) => item.seriesId === lookups[index]);
				const cover = banner && typeof banner.coverImageUrl === "string" ? banner.coverImageUrl : result.value.card.bannerUrl;
				hero.push({
					...result.value.card,
					bannerUrl: cover
				});
			}
		});
	}
	if (!hero.length) hero.push(...dedupe([
		...anyreelCards,
		...dramaboxCards,
		...freereelsCards
	]).slice(0, 5));
	const named = (name) => {
		if (arHome.status !== "fulfilled" || !arHome.value) return [];
		return arHome.value.sections.find((section) => section.name.toLowerCase().includes(name))?.items ?? [];
	};
	const meloloIndex = POPULAR_PROVIDER_IDS.indexOf("melolo");
	const meloloCards = meloloIndex >= 0 && popularProviderResults[meloloIndex]?.status === "fulfilled" ? popularProviderResults[meloloIndex].value : [];
	const forYou = frYou.status === "fulfilled" && frYou.value ? frYou.value.items : [];
	const trendingChina = dedupe([...arRank.status === "fulfilled" ? arRank.value : [], ...dbRank.status === "fulfilled" && dbRank.value ? dbRank.value.items : []]);
	const latestChina = dedupe([...dbLatest.status === "fulfilled" ? dbLatest.value : [], ...named("new")]);
	const trendingFr = dedupe([...hotCards, ...forYou]);
	const latestFr = dedupe(freshCards);
	const latestKeys = new Set([...latestChina, ...latestFr].map((item) => dramaKey(item)));
	const notNew = (items) => items.filter((item) => !latestKeys.has(dramaKey(item)));
	const heroSeed = dedupe(hero);
	const heroes = await fillHeroEpisodes(mixSources([
		heroSeed.length ? heroSeed : trendingChina,
		notNew(meloloCards),
		notNew(trendingFr)
	], 6), lang);
	return localizeHome({
		hero: heroes,
		sections: [
			section("featured", "Featured Dramas", heroes.length ? heroes : mixSources([
				trendingChina,
				notNew(meloloCards),
				notNew(trendingFr)
			], 12)),
			section("trending", "Trending Now", mixSources([
				notNew(trendingChina),
				notNew(trendingFr),
				notNew(meloloCards)
			], 48), 48),
			section("popular", "Most Popular", mixSources([
				notNew(meloloCards),
				notNew(hotCards),
				notNew(dubbedCards),
				notNew(trendingChina)
			], 48, 1), 48),
			section("latest", "Latest Episodes", mixSources([latestChina, latestFr], 48), 48),
			section("recommended", "Recommended for You", mixSources([
				dbHome.status === "fulfilled" && dbHome.value ? dbHome.value.recommend : [],
				notNew(forYou),
				notNew(meloloCards)
			], 24)),
			...genreRails(dedupe([
				...trendingChina,
				...latestChina,
				...meloloCards,
				...freereelsCards
			])),
			section("completed", "Completed Dramas", mixSources([
				trendingChina.filter((item) => item.completed === true),
				freereelsCards.filter((item) => item.completed === true),
				meloloCards.filter((item) => item.completed === true)
			], 24))
		].filter((item) => Boolean(item)),
		providers: [
			settledStatus("anyreel", arHome.status === "fulfilled" || arRank.status === "fulfilled" ? {
				status: "fulfilled",
				value: true
			} : arHome),
			settledStatus("dramabox", dbHome.status === "fulfilled" || dbRank.status === "fulfilled" ? {
				status: "fulfilled",
				value: true
			} : dbHome),
			settledStatus("freereels", frYou.status === "fulfilled" || channelResults.some((item) => item.status === "fulfilled") ? {
				status: "fulfilled",
				value: true
			} : frYou),
			...POPULAR_PROVIDER_IDS.map((id, index) => settledStatus(id, popularProviderResults[index] ?? {
				status: "fulfilled",
				value: []
			}))
		],
		generatedAt: Date.now()
	}, lang);
}
async function loadBrowse(input) {
	const page = Math.max(1, input.page || 1);
	const provider = input.provider;
	const tasks = [];
	const statuses = [];
	const track = async (id, run) => {
		const result = await safe(id, run, []);
		statuses.push(Promise.resolve(settledStatus(id, result)));
		return result.status === "fulfilled" ? result.value : [];
	};
	if (provider === "all" || provider === "anyreel") tasks.push(track("anyreel", async () => {
		if (page === 1) {
			const [home, rank] = await Promise.all([anyreelHome(), anyreelRank()]);
			return dedupe([...home.sections.flatMap((item) => item.items), ...rank]);
		}
		return (await anyreelShorts(page - 1)).items;
	}));
	if (provider === "all" || provider === "dramabox") tasks.push(track("dramabox", async () => {
		if (page > 1) return [];
		const [home, latest, rank] = await Promise.all([
			dramaboxHome(input.lang),
			dramaboxLatest(input.lang),
			dramaboxRank(input.lang)
		]);
		return dedupe([
			...home.columns.flatMap((item) => item.items),
			...home.recommend,
			...latest,
			...rank.items
		]);
	}));
	if (provider === "all" || provider === "freereels") tasks.push(track("freereels", async () => {
		if (page === 1) {
			const channels = await freereelsChannels(input.lang);
			const blocks = await Promise.all(channels.slice(0, 4).map((channel) => freereelsChannel(channel.key, input.lang)));
			const you = await freereelsForYou(input.lang, 0);
			return dedupe([...blocks.flatMap((block) => block.flatMap((item) => item.items)), ...you.items]);
		}
		return (await freereelsForYou(input.lang, (page - 1) * 10)).items;
	}));
	if (provider !== "all" && !isCoreProvider(provider)) tasks.push(track(provider, () => genericBrowse(provider, input.lang)));
	const groups = await Promise.all(tasks);
	let items = provider === "all" ? mixSources(groups, 60) : dedupe(groups.flat());
	if (input.rail) {
		const genre = GENRES.find((item) => item.id === input.rail);
		if (genre) items = items.filter((item) => genre.test.test(`${item.title} ${item.tags.join(" ")} ${item.description ?? ""}`));
		if (input.rail === "completed") items = items.filter((item) => item.completed === true);
		if (isProviderId(input.rail)) items = items.filter((item) => item.provider === input.rail);
	}
	const providers = await Promise.all(statuses);
	const hasMore = provider !== "all" && !isCoreProvider(provider) ? false : provider === "dramabox" ? false : items.length > 0 && page < 8;
	return {
		title: provider === "all" ? "Discover" : providerLabel(provider),
		items: await localizeCards(items, input.lang, false),
		providers,
		page,
		hasMore
	};
}
async function loadSearch(input) {
	const q = input.q.trim();
	const page = Math.max(1, input.page || 1);
	if (!q) {
		const home = await safe("anyreel", () => anyreelSearchHome(), []);
		const suggestions = home.status === "fulfilled" ? await localizeTexts(home.value.flatMap((section) => section.items.map((item) => item.title)).slice(0, 10), input.lang) : [];
		return {
			items: home.status === "fulfilled" ? await localizeCards(dedupe(home.value.flatMap((section) => section.items)).slice(0, 18), input.lang, false) : [],
			suggestions,
			providers: [settledStatus("anyreel", home)],
			page: 1,
			hasMore: false
		};
	}
	const want = (id) => input.provider === "all" ? isCoreProvider(id) : input.provider === id;
	const queries = [q, ...englishQueriesFor(q).filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, 2);
	const pages = await Promise.all(queries.map((query, index) => searchProviders(query, input.lang, index === 0 ? page : 1, want)));
	const items = dedupe(pages.flatMap((result) => result.items));
	const localizedItems = await localizeCards(items, input.lang, false);
	const normalizedQuery = normTitle(q);
	const queryTokens = [...new Set(normalizedQuery.split(/\s+/).filter((token) => token.length >= 2))];
	let matchedItems = localizedItems.flatMap((item) => {
		const titleVariants = [...new Set([
			normTitle(item.originalTitle || ""),
			normTitle(item.title || ""),
			normTitle(item.displayTitle || ""),
			normTitle(item.description || ""),
			normTitle(item.originalDescription || ""),
			normTitle(item.displayDescription || "")
		].filter(Boolean))];
		if (!titleVariants.length || !normalizedQuery) return [];
		let bestScore = 0;
		let bestMatches = 0;
		for (const title of titleVariants) {
			if (title.includes(normalizedQuery) || normalizedQuery.includes(title)) {
				bestScore = Math.max(bestScore, 100 + normalizedQuery.length);
				bestMatches = queryTokens.length;
				continue;
			}
			const titleTokens = title.split(/\s+/).filter((token) => token.length >= 2);
			const matches = queryTokens.filter((queryToken) => titleTokens.some((titleToken) => titleToken === queryToken || queryToken.length >= 3 && titleToken.startsWith(queryToken) || titleToken.length >= 3 && queryToken.startsWith(titleToken))).length;
			const score = matches * 10 + matches / Math.max(1, queryTokens.length);
			if (score > bestScore) {
				bestScore = score;
				bestMatches = matches;
			}
		}
		const minimumMatches = queryTokens.length <= 2 ? 1 : Math.max(2, Math.ceil(queryTokens.length * .35));
		return bestMatches >= minimumMatches ? [{
			item,
			score: bestScore
		}] : [];
	}).sort((a, b) => b.score - a.score).map(({ item }) => item);
	if (!matchedItems.length && page === 1) try {
		const browse = await loadBrowse({
			lang: input.lang,
			provider: input.provider,
			page: 1
		});
		matchedItems = (await localizeCards(dedupe(browse.items), input.lang, false)).flatMap((item) => {
			const variants = [...new Set([
				normTitle(item.originalTitle || ""),
				normTitle(item.title || ""),
				normTitle(item.displayTitle || ""),
				normTitle(item.description || ""),
				normTitle(item.originalDescription || ""),
				normTitle(item.displayDescription || "")
			].filter(Boolean))];
			let score = 0;
			let count = 0;
			for (const title of variants) {
				if (!title || !normalizedQuery) continue;
				if (title.includes(normalizedQuery) || normalizedQuery.includes(title)) {
					score = Math.max(score, 100 + normalizedQuery.length);
					count = queryTokens.length;
					continue;
				}
				const tokens = title.split(/\s+/).filter((token) => token.length >= 2);
				const matches = queryTokens.filter((qt) => tokens.some((tt) => tt === qt || qt.length >= 3 && tt.startsWith(qt) || tt.length >= 3 && qt.startsWith(tt))).length;
				if (matches > count) {
					count = matches;
					score = matches * 10 + matches / Math.max(1, queryTokens.length);
				}
			}
			const minimum = queryTokens.length <= 2 ? 1 : Math.max(2, Math.ceil(queryTokens.length * .35));
			return count >= minimum ? [{
				item,
				score
			}] : [];
		}).sort((a, b) => b.score - a.score).map(({ item }) => item);
	} catch {}
	const hasMore = pages.some((result) => result.hasMore) && matchedItems.length > 0;
	const suggestions = page === 1 ? [...new Set(matchedItems.slice(0, 8).map((item) => (item.displayTitle || item.title || "").trim()).filter(Boolean))] : [];
	return {
		items: matchedItems,
		suggestions,
		providers: pages[0]?.providers ?? [],
		page,
		hasMore
	};
}
async function loadShorts(page, lang) {
	const ids = visibleProviders().filter((id) => providerEnabled(id));
	const results = await Promise.all(ids.map(async (id) => {
		try {
			const result = await Promise.race([shortsFrom(id, page, lang), new Promise((resolve) => setTimeout(() => resolve({
				items: [],
				hasMore: false
			}), 4500))]);
			return {
				id,
				items: dedupe(result.items).slice(0, 12),
				hasMore: result.hasMore,
				ok: result.items.length > 0
			};
		} catch {
			return {
				id,
				items: [],
				hasMore: false,
				ok: false
			};
		}
	}));
	const items = mixSources(results.map((result) => result.items), 72);
	return {
		title: "Shorts",
		items: await localizeCards(items, lang, false),
		providers: results.map(({ id, ok }) => ({
			id,
			ok,
			error: null
		})),
		page,
		hasMore: results.some((result) => result.hasMore)
	};
}
async function shortsFrom(id, page, lang) {
	if (id === "anyreel") {
		const shorts = await anyreelShorts(Math.max(0, page - 1));
		return {
			items: shorts.items,
			hasMore: shorts.hasMore
		};
	}
	if (id === "freereels") {
		const you = await freereelsForYou(lang, (page - 1) * 10);
		return {
			items: you.items,
			hasMore: you.hasMore
		};
	}
	if (id === "netshort" || id === "dramawave") {
		if (page > 1) return {
			items: [],
			hasMore: false
		};
		return {
			items: await genericShortsFeed(id, lang),
			hasMore: false
		};
	}
	if (id === "melolo") {
		if (page > 1) return {
			items: [],
			hasMore: false
		};
		return {
			items: await genericBrowse(id, lang),
			hasMore: false
		};
	}
	return {
		items: [],
		hasMore: false
	};
}
async function loadDetail(provider, seriesId, lang) {
	if (!isCoreProvider(provider)) try {
		const raw = await genericDetail(provider, seriesId, lang);
		if (!raw.card) return {
			ok: false,
			error: "This drama could not be found.",
			drama: null,
			episodes: [],
			similar: [],
			more: [],
			alsoOn: []
		};
		const [dramaList, episodes, relatedResult] = await Promise.all([
			localizeCards([raw.card], lang, true),
			localizeEpisodes(raw.episodes, lang),
			genericBrowse(provider, lang).catch(() => [])
		]);
		const current = dramaList[0] ?? null;
		const currentTags = new Set((current?.tags ?? []).map((tag) => normTitle(tag)).filter(Boolean));
		const related = dedupe(relatedResult).filter((item) => dramaKey(item) !== dramaKey(raw.card)).map((item) => ({
			item,
			score: (item.tags ?? []).reduce((score, tag) => score + (currentTags.has(normTitle(tag)) ? 2 : 0), 0) + (normTitle(item.title).split(/\s+/).some((word) => normTitle(current?.title ?? "").includes(word) && word.length > 3) ? 1 : 0)
		})).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score).slice(0, 12).map((entry) => entry.item);
		return {
			ok: true,
			error: null,
			drama: current,
			episodes,
			similar: await localizeCards(related, lang, false),
			more: [],
			alsoOn: []
		};
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : "The provider did not return this drama.",
			drama: null,
			episodes: [],
			similar: [],
			more: [],
			alsoOn: []
		};
	}
	try {
		const detail = provider === "anyreel" ? await anyreelDetail(seriesId) : provider === "dramabox" ? await dramaboxDetail(seriesId, lang) : await freereelsDetail(seriesId, lang);
		if (!detail.card) return {
			ok: false,
			error: "This drama could not be found.",
			drama: null,
			episodes: [],
			similar: [],
			more: [],
			alsoOn: []
		};
		const dramaPromise = localizeCards([detail.card], lang, true);
		const episodePromise = localizeEpisodes(detail.episodes, lang);
		const [similar, more, also, dramaList, episodes] = await Promise.all([
			provider === "anyreel" ? anyreelSimilar(seriesId).catch(() => []) : Promise.resolve([]),
			loadBrowse({
				lang,
				provider,
				page: 1
			}).then((browse) => browse.items.filter((item) => item.seriesId !== seriesId).slice(0, 12)).catch(() => []),
			findAlsoOn(detail.card, lang),
			dramaPromise,
			episodePromise
		]);
		const [similarLocalized, alsoLocalized] = await Promise.all([localizeCards(similar.filter((item) => item.seriesId !== seriesId).slice(0, 12), lang, false), localizeCards(also, lang, false)]);
		return {
			ok: true,
			error: null,
			drama: dramaList[0] ?? null,
			episodes,
			similar: similarLocalized,
			more,
			alsoOn: alsoLocalized
		};
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : "The provider did not return this drama.",
			drama: null,
			episodes: [],
			similar: [],
			more: [],
			alsoOn: []
		};
	}
}
async function findAlsoOn(card, lang) {
	const query = (card.originalTitle || card.title).replace(/\(.*?\)/g, " ").trim().slice(0, 48);
	if (query.length < 4) return [];
	const others = [
		"anyreel",
		"dramabox",
		"freereels"
	].filter((id) => id !== card.provider);
	const target = normTitle(card.originalTitle || card.title);
	return dedupe((await Promise.all(others.map(async (id) => {
		try {
			if (id === "anyreel") return (await anyreelSearch(query, 1)).items;
			if (id === "dramabox") return await dramaboxSearch(query, lang);
			return (await freereelsSearch(query, lang, 0)).items;
		} catch {
			return [];
		}
	}))).flat()).filter((item) => {
		const title = normTitle(item.title);
		if (!title || !target) return false;
		return title === target || title.includes(target) || target.includes(title);
	}).slice(0, 4);
}
async function loadPlayback(provider, seriesId, episodeId, lang) {
	const streamPromise = loadStream(provider, seriesId, episodeId, lang);
	try {
		const raw = isCoreProvider(provider) ? provider === "anyreel" ? await anyreelDetail(seriesId) : provider === "dramabox" ? await dramaboxDetail(seriesId, lang) : await freereelsDetail(seriesId, lang) : await genericDetail(provider, seriesId, lang);
		const [stream, dramaList, episodes] = await Promise.all([
			streamPromise,
			raw.card ? localizeCards([raw.card], lang, true) : Promise.resolve([]),
			localizeEpisodes(raw.episodes, lang)
		]);
		if (!raw.card) return {
			detail: {
				ok: false,
				error: "This drama could not be found.",
				drama: null,
				episodes: [],
				similar: [],
				more: [],
				alsoOn: []
			},
			stream
		};
		return {
			detail: {
				ok: true,
				error: null,
				drama: dramaList[0] ?? null,
				episodes,
				similar: [],
				more: [],
				alsoOn: []
			},
			stream
		};
	} catch (error) {
		return {
			detail: {
				ok: false,
				error: error instanceof Error ? error.message : "The provider did not return this drama.",
				drama: null,
				episodes: [],
				similar: [],
				more: [],
				alsoOn: []
			},
			stream: await streamPromise
		};
	}
}
async function loadStream(provider, seriesId, episodeId, lang) {
	try {
		if (provider === "anyreel") {
			const candidates = await anyreelStream(seriesId, episodeId);
			return {
				ok: candidates.length > 0,
				provider,
				seriesId,
				episodeId,
				candidates,
				message: candidates.length ? null : "AnyReel did not return a playable stream for this episode."
			};
		}
		if (provider === "dramabox") {
			const candidates = await dramaboxStream(seriesId, episodeId, lang);
			return {
				ok: candidates.length > 0,
				provider,
				seriesId,
				episodeId,
				candidates,
				message: candidates.length ? null : "DramaBox did not return a playable stream. The episode may require access this catalog cannot provide."
			};
		}
		if (provider === "freereels") {
			const result = await freereelsStream(seriesId, episodeId, lang);
			return {
				ok: result.candidates.length > 0,
				provider,
				seriesId,
				episodeId,
				candidates: result.candidates,
				message: result.candidates.length ? null : result.blocked ? "FreeReels did not unlock a stream for this episode." : "FreeReels did not return a playable stream for this episode."
			};
		}
		const candidates = await genericStream(provider, seriesId, episodeId, lang);
		return {
			ok: candidates.length > 0,
			provider,
			seriesId,
			episodeId,
			candidates,
			message: candidates.length ? null : "This provider did not return a playable stream for this episode."
		};
	} catch (error) {
		return {
			ok: false,
			provider,
			seriesId,
			episodeId,
			candidates: [],
			message: error instanceof Error ? error.message : "The stream request failed."
		};
	}
}
async function pingProviders() {
	return await Promise.all(PROVIDERS.filter((id) => !isProviderHidden(id)).map(async (id) => {
		const path = id === "freereels" ? "/health" : "/health";
		try {
			const body = await providerFetch(id, path, {
				cacheTtl: 15e3,
				timeout: 8e3
			});
			const ok = body.ok === true || body.success === true || body.status === "ok";
			return {
				id,
				ok,
				error: ok ? null : "Health check did not report ok"
			};
		} catch (error) {
			return {
				id,
				ok: false,
				error: error instanceof Error ? error.message : "Health check failed"
			};
		}
	}));
}
//#endregion
export { visibleProviders as a, providerLabel as i, loadBrowse as n, pingProviders as r, catalog_exports as t };
