import { getRequest } from "@tanstack/react-start/server";

export type CatalogLang = "id" | "en";

function cookieValue(cookie: string, name: string) {
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** English is the default for the international site. Only an explicit saved language choice overrides it. */
export async function resolveCatalogLang(requested?: string | null): Promise<CatalogLang> {
  const headers = getRequest()?.headers;
  const cookie = headers?.get("cookie") ?? "";
  const saved = cookieValue(cookie, "hd_lang");
  const manual = cookieValue(cookie, "hd_manual") === "1";
  if (manual && (saved === "id" || saved === "en")) return saved;
  if (manual && (requested === "id" || requested === "en")) return requested;
  return "en";
}
