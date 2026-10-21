import { getRequest } from "@tanstack/react-start/server";

export type CatalogLang = "id" | "en";

function cookieValue(cookie: string, name: string) {
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * English is the international default so Google sees one stable language on each URL.
 * `/id` stays Indonesian. A visitor's manual choice is kept. IP and Accept-Language are ignored.
 */
export async function resolveCatalogLang(requested?: string | null): Promise<CatalogLang> {
  const request = getRequest();
  const requestPath = request?.url ? new URL(request.url).pathname : "";
  if (requestPath === "/id" || requestPath.startsWith("/id/")) return "id";
  if (requestPath === "/en" || requestPath.startsWith("/en/")) return "en";

  const cookie = request?.headers?.get("cookie") ?? "";
  const manual = cookieValue(cookie, "hd_manual") === "1";
  const saved = cookieValue(cookie, "hd_lang");
  if (manual && saved === "id") return "id";
  if (manual && (saved === "en" || saved === "hi" || saved === "fil" || saved === "ms" || saved === "th")) return "en";
  if (requested === "id" || requested === "en") return requested;
  return "en";
}
