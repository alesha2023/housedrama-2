//#region node_modules/.nitro/vite/services/ssr/assets/storage-CrxvcQ_E.js
var WATCHLIST = "dramaluma.watchlist";
var HISTORY = "dramaluma.history";
function read(key, fallback) {
	if (typeof window === "undefined") return fallback;
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
}
function write(key, value) {
	localStorage.setItem(key, JSON.stringify(value));
	window.dispatchEvent(new Event("dramaluma-library"));
}
function readWatchlist() {
	return read(WATCHLIST, []);
}
function toggleWatchlist(item) {
	const current = readWatchlist();
	const next = current.some((entry) => entry.provider === item.provider && entry.seriesId === item.seriesId) ? current.filter((entry) => !(entry.provider === item.provider && entry.seriesId === item.seriesId)) : [item, ...current].slice(0, 80);
	write(WATCHLIST, next);
	return next;
}
function readHistory() {
	return read(HISTORY, []).sort((a, b) => b.updatedAt - a.updatedAt);
}
function upsertHistory(entry) {
	const next = [entry, ...readHistory().filter((item) => !(item.provider === entry.provider && item.seriesId === entry.seriesId))].slice(0, 60);
	write(HISTORY, next);
	return next;
}
function progressKey(provider, seriesId, episodeId) {
	return `dramaluma.pos.${provider}.${seriesId}.${episodeId}`;
}
function readProgress(provider, seriesId, episodeId) {
	if (typeof window === "undefined") return 0;
	const value = Number(localStorage.getItem(progressKey(provider, seriesId, episodeId)) || 0);
	return Number.isFinite(value) ? value : 0;
}
function writeProgress(provider, seriesId, episodeId, seconds) {
	localStorage.setItem(progressKey(provider, seriesId, episodeId), String(Math.floor(seconds)));
}
//#endregion
export { upsertHistory as a, toggleWatchlist as i, readProgress as n, writeProgress as o, readWatchlist as r, readHistory as t };
