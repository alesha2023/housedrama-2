import { getRequest } from "@tanstack/react-start/server";

export type CatalogLang = "id" | "en";

const countryCache = new Map<string, { exp: number; country: string | null }>();

function cookieValue(cookie: string, name: string) {
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function isPublicIp(ip: string) {
  if (ip === "::1" || ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) return false;
  const v4 = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!v4) return ip.includes(":");
  const a = Number(v4[1]);
  const b = Number(v4[2]);
  if (a === 10 || a === 127 || a === 0 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31)) return false;
  return true;
}

function clientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for")?.split(",").map((item) => item.trim()) ?? [];
  const candidates = [headers.get("cf-connecting-ip"), headers.get("x-real-ip"), ...forwarded];
  return candidates.find((ip) => ip && isPublicIp(ip)) ?? null;
}

async function countryFromIp(ip: string) {
  const hit = countryCache.get(ip);
  if (hit && hit.exp > Date.now()) return hit.country;
  let country: string | null = null;
  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=success,country_code`, {
      signal: AbortSignal.timeout(700),
      headers: { accept: "application/json" },
    });
    if (response.ok) {
      const data = (await response.json()) as { success?: boolean; country_code?: string };
      if (data.success !== false && data.country_code) country = data.country_code.toUpperCase();
    }
  } catch {
    country = null;
  }
  countryCache.set(ip, { exp: Date.now() + 60 * 60 * 1000, country });
  return country;
}

function langFromCountry(country: string | null | undefined): CatalogLang | null {
  if (!country || country === "XX" || country === "T1") return null;
  return country.toUpperCase() === "ID" ? "id" : "en";
}

/** Indonesia gets Indonesian dubs and UI. Anywhere else gets English, unless the visitor chose a language. */
export async function resolveCatalogLang(requested?: string | null): Promise<CatalogLang> {
  const request = getRequest();
  const requestPath = request?.url ? new URL(request.url).pathname : "";
  // Locale-prefixed SEO landing pages are deterministic for Google and visitors worldwide.
  if (requestPath === "/id" || requestPath.startsWith("/id/")) return "id";
  if (requestPath === "/en" || requestPath.startsWith("/en/")) return "en";
  const headers = request?.headers;
  const cookie = headers?.get("cookie") ?? "";
  const saved = cookieValue(cookie, "hd_lang");
  const manual = cookieValue(cookie, "hd_manual") === "1";
  // UI language and catalog language are different: Hindi/Filipino interfaces
  // must use the English catalog unless a provider has a native translation.
  if (manual && (saved === "id" || saved === "en" || saved === "hi" || saved === "fil" || saved === "ms" || saved === "th")) {
    return saved === "id" ? "id" : "en";
  }
  if (manual && (requested === "id" || requested === "en")) return requested;

  const headerCountry =
    headers?.get("cf-ipcountry") ||
    headers?.get("x-vercel-ip-country") ||
    headers?.get("cloudfront-viewer-country");
  const fromHeader = langFromCountry(headerCountry);
  if (fromHeader) return fromHeader;

  const ip = headers ? clientIp(headers) : null;
  if (ip) {
    const fromIp = langFromCountry(await countryFromIp(ip));
    if (fromIp) return fromIp;
  }

  if (saved === "id" || saved === "en") return saved;
  const accept = headers?.get("accept-language")?.toLowerCase() ?? "";
  return accept.startsWith("id") ? "id" : "en";
}
