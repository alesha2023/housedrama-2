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


const ADSTERRA_POPUNDER_SRC = "https://aarems.org/1/c3385b36514c59f43edafef236388eff";
const ADSTERRA_EPISODE_COUNT_KEY = "housedrama.adsterra.episode-count.v1";

/** Count episode transitions and request Adsterra on every third transition. */
export function recordAdsterraEpisodeAction() {
  if (typeof window === "undefined") return false;
  let count = 0;
  try {
    count = Number(window.localStorage.getItem(ADSTERRA_EPISODE_COUNT_KEY) || "0");
    if (!Number.isFinite(count) || count < 0) count = 0;
    count += 1;
    window.localStorage.setItem(ADSTERRA_EPISODE_COUNT_KEY, String(count));
  } catch {
    return false;
  }
  return count % 3 === 0;
}

/** Load the publisher-provided Popunder script after an explicit user tap. */
export function requestAdsterraPopunder() {
  if (typeof window === "undefined") return;
  const existing = document.querySelector(`script[src="${ADSTERRA_POPUNDER_SRC}"]`);
  if (existing) return;
  const script = document.createElement("script");
  script.async = true;
  script.dataset.cfasync = "false";
  script.src = ADSTERRA_POPUNDER_SRC;
  document.body.appendChild(script);
}
