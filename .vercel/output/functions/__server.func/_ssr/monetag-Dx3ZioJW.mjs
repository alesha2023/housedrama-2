//#region node_modules/.nitro/vite/services/ssr/assets/monetag-Dx3ZioJW.js
var MONETAG_DIRECT_LINK = "https://uplcm.com/4/12017844";
/** Open Monetag from a real user click when a viewer starts a drama/video. */
function openMonetagAd() {
	if (typeof window === "undefined") return;
	window.open(MONETAG_DIRECT_LINK, "_blank", "noopener,noreferrer");
}
/** Backward-compatible helper for existing catalog entry buttons. */
function maybeOpenMonetagAd() {
	openMonetagAd();
	return true;
}
//#endregion
export { openMonetagAd as n, maybeOpenMonetagAd as t };
