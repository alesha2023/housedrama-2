import { getRequest } from "@tanstack/react-start/server";

export type CatalogLang = "id" | "en";

function cookieValue(cookie: string, name: string) {
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Respect explicit language choice; otherwise use the request country when the host supplies it. */
export async function resolveCatalogLang(requested?: string | null): Promise<CatalogLang> {
  const headers = getRequest()?.headers;
  const cookie = headers?.get("cookie") ?? "";
  const saved = cookieValue(cookie, "hd_lang");
  const manual = cookieValue(cookie, "hd_manual") === "1";
  if (manual && (saved === "id" || saved === "en")) return saved;
  if (manual && (requested === "id" || requested === "en")) return requested;

  // Vercel and Cloudflare commonly provide a country code. Unknown countries default to English.
  const country = (headers?.get("x-vercel-ip-country") || headers?.get("cf-ipcountry") || "").toUpperCase();
  return country === "ID" ? "id" : "en";
}
