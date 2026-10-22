const MONETAG_DIRECT_LINKS = [
  "https://uplcm.com/4/12095251",
  "https://uplcm.com/4/12095249",
  "https://uplcm.com/4/12056282",
  "https://uplcm.com/4/12095247",
  "https://uplcm.com/4/1209524",
  "https://uplcm.com/4/12095259",
  "https://uplcm.com/4/12095268",
  "https://uplcm.com/4/12095269",
  "https://uplcm.com/4/12095271",
  "https://uplcm.com/4/12095272",
];

/** Open one of the configured Monetag direct links from an explicit user click. */
export function openMonetagAd() {
  if (typeof window === "undefined") return;
  const link = MONETAG_DIRECT_LINKS[Math.floor(Math.random() * MONETAG_DIRECT_LINKS.length)];
  window.open(link, "_blank", "noopener,noreferrer");
}

/** Backward-compatible helper for existing catalog entry buttons. */
export function maybeOpenMonetagAd() {
  openMonetagAd();
  return true;
}

/** Kept for compatibility with existing imports. */
export function recordMonetagWatchAction() {
  return false;
}

/** Load Adsterra Popunder once if another existing feature explicitly requests it. */
let adsterraLoadPromise: Promise<boolean> | null = null;
export function loadAdsterraPopunder(): Promise<boolean> {
  if (typeof document === "undefined") return Promise.resolve(false);
  if (adsterraLoadPromise) return adsterraLoadPromise;

  adsterraLoadPromise = new Promise<boolean>((resolve) => {
    const id = "housedrama-adsterra-popunder";
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing?.dataset.loaded === "true") { resolve(true); return; }
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.setAttribute("data-cfasync", "false");
    script.src = "https://aarems.org/1/c3385b36514c59f43edafef236388eff";
    script.async = true;
    script.addEventListener("load", () => { script.dataset.loaded = "true"; resolve(true); }, { once: true });
    script.addEventListener("error", () => { adsterraLoadPromise = null; resolve(false); }, { once: true });
    document.body.appendChild(script);
  });
  return adsterraLoadPromise;
}
