const MONETAG_DIRECT_LINK = "https://uplcm.com/4/12017844";
const ADSTERRA_POPUNDER_SCRIPT = "https://aarems.org/1/c3385b36514c59f43edafef236388eff";
const WATCH_COUNT_KEY = "housedrama.adsterra.episode-count.v1";
let lastEpisodeCountAt = 0;

/** Open Monetag directly from a user action. */
export function openMonetagAd() {
  if (typeof window === "undefined") return;
  window.open(MONETAG_DIRECT_LINK, "_blank", "noopener,noreferrer");
}

/**
 * Load Adsterra Popunder on every third episode transition.
 * Browser popup policies and Adsterra frequency caps can affect whether an ad
 * is actually displayed; this only requests the official Adsterra script.
 */
export function maybeOpenAdsterraEveryThreeEpisodes() {
  if (typeof window === "undefined" || typeof document === "undefined") return false;

  // Guard against duplicate handler calls from the same tap/navigation.
  const now = Date.now();
  if (now - lastEpisodeCountAt < 800) return false;
  lastEpisodeCountAt = now;

  let count = 0;
  try {
    count = Number(window.localStorage.getItem(WATCH_COUNT_KEY) || "0");
    if (!Number.isFinite(count) || count < 0) count = 0;
    count += 1;
    window.localStorage.setItem(WATCH_COUNT_KEY, String(count));
  } catch {
    // If storage is blocked, do not repeatedly request an ad on every action.
    return false;
  }

  if (count % 3 !== 0) return false;

  const script = document.createElement("script");
  script.async = true;
  script.dataset.housedramaAdsterra = "popunder";
  script.setAttribute("data-cfasync", "false");
  script.src = ADSTERRA_POPUNDER_SCRIPT;
  (document.body || document.head).appendChild(script);
  return true;
}

/** Keep the existing helper name for links outside the episode player. */
export function maybeOpenMonetagAd() {
  openMonetagAd();
  return true;
}
