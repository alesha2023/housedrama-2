import { r as __exportAll } from "../_runtime.mjs";
import { t as PROVIDERS } from "./types-B7znlJsu.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { createHmac, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/metrics-CZxc3Ids.js
var metrics_CZxc3Ids_exports = /* @__PURE__ */ __exportAll({
	a: () => sectionEnabled,
	c: () => setSectionEnabled,
	i: () => recordSuccess,
	l: () => snapshot,
	n: () => providerEnabled,
	o: () => setCacheEntries,
	r: () => recordFailure,
	s: () => setProviderEnabled,
	t: () => metrics_exports,
	u: () => verifyAdminToken
});
var metrics_exports = /* @__PURE__ */ __exportAll$1({
	SECTION_IDS: () => SECTION_IDS,
	loginAdmin: () => loginAdmin,
	providerEnabled: () => providerEnabled,
	recordFailure: () => recordFailure,
	recordPlayback: () => recordPlayback,
	recordSuccess: () => recordSuccess,
	sectionEnabled: () => sectionEnabled,
	setCacheEntries: () => setCacheEntries,
	setProviderEnabled: () => setProviderEnabled,
	setSectionEnabled: () => setSectionEnabled,
	snapshot: () => snapshot,
	verifyAdminToken: () => verifyAdminToken
});
var SECTION_IDS = [
	"featured",
	"trending",
	"popular",
	"latest",
	"new",
	"recommended",
	"romance",
	"revenge",
	"billionaire",
	"ceo",
	"historical",
	"fantasy",
	"family",
	"comedy",
	"completed",
	"anyreel",
	"dramabox",
	"freereels"
];
var g = globalThis;
function emptyBucket() {
	return {
		ok: 0,
		fail: 0,
		totalMs: 0,
		lastOkAt: null,
		lastError: null,
		lastMs: null,
		playbackOk: 0,
		playbackFail: 0
	};
}
function state() {
	if (!g.__dramalumaMetrics) {
		const buckets = {};
		const enabled = {};
		for (const id of PROVIDERS) {
			buckets[id] = emptyBucket();
			enabled[id] = true;
		}
		const sections = {};
		for (const id of SECTION_IDS) sections[id] = true;
		g.__dramalumaMetrics = {
			buckets,
			enabled,
			sections,
			cacheEntries: 0
		};
	}
	return g.__dramalumaMetrics;
}
function bucketFor(id) {
	const current = state();
	if (!current.buckets[id]) current.buckets[id] = emptyBucket();
	if (current.enabled[id] === void 0) current.enabled[id] = true;
	return current.buckets[id];
}
function providerEnabled(id) {
	const current = state();
	if (current.enabled[id] === void 0) current.enabled[id] = true;
	return current.enabled[id] !== false;
}
function sectionEnabled(id) {
	return state().sections[id] !== false;
}
function recordSuccess(id, ms) {
	const bucket = bucketFor(id);
	bucket.ok += 1;
	bucket.totalMs += ms;
	bucket.lastMs = ms;
	bucket.lastOkAt = Date.now();
	bucket.lastError = null;
}
function recordFailure(id, error) {
	const bucket = bucketFor(id);
	bucket.fail += 1;
	bucket.lastError = error instanceof Error ? error.message : "Request failed";
}
function recordPlayback(id, ok) {
	const bucket = bucketFor(id);
	if (ok) bucket.playbackOk += 1;
	else bucket.playbackFail += 1;
}
function setCacheEntries(count) {
	state().cacheEntries = count;
}
function snapshot() {
	const current = state();
	return {
		providers: PROVIDERS.map((id) => {
			const bucket = current.buckets[id] ?? emptyBucket();
			return {
				id,
				enabled: current.enabled[id] !== false,
				okCount: bucket.ok,
				failCount: bucket.fail,
				avgMs: bucket.ok ? Math.round(bucket.totalMs / bucket.ok) : null,
				lastMs: bucket.lastMs,
				lastOkAt: bucket.lastOkAt,
				lastError: bucket.lastError,
				playbackOk: bucket.playbackOk,
				playbackFail: bucket.playbackFail
			};
		}),
		cacheEntries: current.cacheEntries,
		sections: SECTION_IDS.map((id) => ({
			id,
			enabled: current.sections[id] !== false
		})),
		generatedAt: Date.now()
	};
}
function setProviderEnabled(id, enabled) {
	state().enabled[id] = enabled;
}
function setSectionEnabled(id, enabled) {
	if (SECTION_IDS.includes(id)) state().sections[id] = enabled;
}
function adminPassword() {
	const configured = process.env.DRAMA_ADMIN_PASSWORD;
	if (configured) return configured;
	return "171093Lt$";
}
function adminSecret() {
	const configured = process.env.DRAMA_ADMIN_SECRET;
	if (configured) return configured;
	return "dramaluma-session";
}
function safeEqual(a, b) {
	const left = Buffer.from(a);
	const right = Buffer.from(b);
	if (left.length !== right.length) return false;
	return timingSafeEqual(left, right);
}
function loginAdmin(password) {
	const configuredPassword = adminPassword();
	const secret = adminSecret();
	const given = password.trim();
	if (!configuredPassword || !secret || !safeEqual(given, configuredPassword)) return null;
	const exp = Date.now() + 432e5;
	const payload = String(exp);
	return `${payload}.${createHmac("sha256", secret).update(payload).digest("hex")}`;
}
function verifyAdminToken(token) {
	if (!token) return false;
	const [payload, sig] = token.split(".");
	if (!payload || !sig) return false;
	const secret = adminSecret();
	if (!secret) return false;
	if (!safeEqual(sig, createHmac("sha256", secret).update(payload).digest("hex"))) return false;
	return Number(payload) > Date.now();
}
//#endregion
export { sectionEnabled as a, setSectionEnabled as c, recordSuccess as i, snapshot as l, providerEnabled as n, setCacheEntries as o, recordFailure as r, setProviderEnabled as s, metrics_CZxc3Ids_exports as t, verifyAdminToken as u };
