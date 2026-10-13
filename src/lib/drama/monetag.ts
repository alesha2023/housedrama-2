const MONETAG_DIRECT_LINK = "https://uplcm.com/4/12017844";
const WATCH_COUNT_KEY = "housedrama.monetag.watch-count.v3";
let lastCountAt = 0;

/** Count a watch/episode action. Show on #1, then #6, #11, #16, ... */
export function recordMonetagWatchAction() {
  if (typeof window === "undefined") return false;
  // A single user action can bubble through multiple controls during navigation.
  // Ignore duplicate invocations in a short window so the schedule does not drift.
  const now = Date.now();
  if (now - lastCountAt < 800) return false;
  lastCountAt = now;
  let count = 0;
  try {
    count = Number(window.localStorage.getItem(WATCH_COUNT_KEY) || "0");
    if (!Number.isFinite(count) || count < 0) count = 0;
    count += 1;
    window.localStorage.setItem(WATCH_COUNT_KEY, String(count));
  } catch {
    // If storage is blocked, still request an ad for this action.
    count = 1;
  }
  return count === 1 || (count - 1) % 5 === 0;
}

/** Call from a real user click so mobile browsers allow the new tab. */
export function openMonetagAd() {
  if (typeof window === "undefined") return;
  window.open(MONETAG_DIRECT_LINK, "_blank", "noopener,noreferrer");
}

/** Count an action and open the sponsor link when this action is due. */
export function maybeOpenMonetagAd() {
  const due = recordMonetagWatchAction();
  if (due) openMonetagAd();
  return due;
}
