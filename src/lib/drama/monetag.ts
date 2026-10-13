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

/** Load the approved Adsterra Popunder script once, only when an episode gate is shown. */
export function loadAdsterraPopunder() {
  if (typeof document === "undefined") return;
  const id = "housedrama-adsterra-popunder";
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.setAttribute("data-cfasync", "false");
  script.src = "https://aarems.org/1/c3385b36514c59f43edafef236388eff";
  script.async = true;
  document.body.appendChild(script);
}
