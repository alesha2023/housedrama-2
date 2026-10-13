const MONETAG_DIRECT_LINK = "https://uplcm.com/4/12017844";

/** Open Monetag from a real user click when a viewer starts a drama/video. */
export function openMonetagAd() {
  if (typeof window === "undefined") return;
  window.open(MONETAG_DIRECT_LINK, "_blank", "noopener,noreferrer");
}

/** Backward-compatible helper for existing catalog entry buttons. */
export function maybeOpenMonetagAd() {
  openMonetagAd();
  return true;
}

/** Kept for compatibility with any existing imports; episode cadence is handled separately. */
export function recordMonetagWatchAction() {
  return false;
}

/** Load Adsterra Popunder once and resolve only after the provider script has loaded.
 * This does not guarantee that Adsterra will serve an ad: that remains provider/browser controlled.
 */
let adsterraLoadPromise: Promise<boolean> | null = null;
export function loadAdsterraPopunder(): Promise<boolean> {
  if (typeof document === "undefined") return Promise.resolve(false);
  if (adsterraLoadPromise) return adsterraLoadPromise;

  adsterraLoadPromise = new Promise<boolean>((resolve) => {
    const id = "housedrama-adsterra-popunder";
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing?.dataset.loaded === "true") {
      resolve(true);
      return;
    }
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
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve(true);
    }, { once: true });
    script.addEventListener("error", () => {
      adsterraLoadPromise = null;
      resolve(false);
    }, { once: true });
    document.body.appendChild(script);
  });
  return adsterraLoadPromise;
}
