import { i as getRequest } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/locale-D7o8iBvg.js
var countryCache = /* @__PURE__ */ new Map();
function cookieValue(cookie, name) {
	const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
	return match ? decodeURIComponent(match[1]) : null;
}
function isPublicIp(ip) {
	if (ip === "::1" || ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) return false;
	const v4 = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
	if (!v4) return ip.includes(":");
	const a = Number(v4[1]);
	const b = Number(v4[2]);
	if (a === 10 || a === 127 || a === 0 || a === 192 && b === 168 || a === 172 && b >= 16 && b <= 31) return false;
	return true;
}
function clientIp(headers) {
	const forwarded = headers.get("x-forwarded-for")?.split(",").map((item) => item.trim()) ?? [];
	return [
		headers.get("cf-connecting-ip"),
		headers.get("x-real-ip"),
		...forwarded
	].find((ip) => ip && isPublicIp(ip)) ?? null;
}
async function countryFromIp(ip) {
	const hit = countryCache.get(ip);
	if (hit && hit.exp > Date.now()) return hit.country;
	let country = null;
	try {
		const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=success,country_code`, {
			signal: AbortSignal.timeout(700),
			headers: { accept: "application/json" }
		});
		if (response.ok) {
			const data = await response.json();
			if (data.success !== false && data.country_code) country = data.country_code.toUpperCase();
		}
	} catch {
		country = null;
	}
	countryCache.set(ip, {
		exp: Date.now() + 36e5,
		country
	});
	return country;
}
function langFromCountry(country) {
	if (!country || country === "XX" || country === "T1") return null;
	return country.toUpperCase() === "ID" ? "id" : "en";
}
/** Indonesia gets Indonesian dubs and UI. Anywhere else gets English, unless the visitor chose a language. */
async function resolveCatalogLang(requested) {
	const headers = getRequest()?.headers;
	const cookie = headers?.get("cookie") ?? "";
	const saved = cookieValue(cookie, "hd_lang");
	const manual = cookieValue(cookie, "hd_manual") === "1";
	if (manual && (saved === "id" || saved === "en" || saved === "hi" || saved === "fil")) return saved === "id" ? "id" : "en";
	if (manual && (requested === "id" || requested === "en")) return requested;
	const fromHeader = langFromCountry(headers?.get("cf-ipcountry") || headers?.get("x-vercel-ip-country") || headers?.get("cloudfront-viewer-country"));
	if (fromHeader) return fromHeader;
	const ip = headers ? clientIp(headers) : null;
	if (ip) {
		const fromIp = langFromCountry(await countryFromIp(ip));
		if (fromIp) return fromIp;
	}
	if (saved === "id" || saved === "en") return saved;
	return (headers?.get("accept-language")?.toLowerCase() ?? "").startsWith("id") ? "id" : "en";
}
//#endregion
export { resolveCatalogLang };
