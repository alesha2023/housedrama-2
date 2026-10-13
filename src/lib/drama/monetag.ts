const MONETAG_DIRECT_LINK = "https://uplcm.com/4/12017844";
const WATCH_COUNT_KEY = "housedrama.monetag.watch-count.v1";

/** Open the sponsor link on the first watch action, then once every five actions.
 * Must be called directly from a user click so mobile browsers allow the new tab.
 */
export function maybeOpenMonetagAd() {
  if (typeof window === "undefined") return;

  let count = 0;
  try {
    count = Number(window.localStorage.getItem(WATCH_COUNT_KEY) || "0");
    if (!Number.isFinite(count) || count < 0) count = 0;
    count += 1;
    window.localStorage.setItem(WATCH_COUNT_KEY, String(count));
  } catch {
    // If storage is unavailable, still show the sponsor on this click.
    count = 1;
  }

  // Show on watch #1, then #6, #11, #16... (one initial ad, then every 5 episodes).
  if (count === 1 || (count - 1) % 5 === 0) {
    window.open(MONETAG_DIRECT_LINK, "_blank", "noopener,noreferrer");
  }
}
