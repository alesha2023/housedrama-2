/**
 * Turn provider image fields into a browser-loadable https URL.
 * Signed CDN URLs are returned untouched. Only raw spaces, raw Unicode,
 * protocol-relative URLs, and http links are rewritten.
 */
export function normalizeImageUrl(value: unknown, fallbackBase?: string): string | null {
  if (typeof value !== "string") return null;
  let raw = value.trim().replace(/^['"]+|['"]+$/g, "");
  if (!raw || raw === "null" || raw === "undefined") return null;
  raw = raw.replace(/\\u0026/gi, "&").replace(/\\\//g, "/");
  if (raw.startsWith("//")) raw = `https:${raw}`;
  else if (/^http:\/\//i.test(raw)) raw = `https://${raw.slice(7)}`;
  else if (!/^https:\/\//i.test(raw)) {
    if (!fallbackBase) return null;
    try {
      const resolved = new URL(raw, fallbackBase.endsWith("/") ? fallbackBase : `${fallbackBase}/`);
      if (resolved.protocol !== "https:" && resolved.protocol !== "http:") return null;
      raw = resolved.toString().replace(/^http:\/\//i, "https://");
    } catch {
      return null;
    }
  }
  if (!/^https:\/\//i.test(raw)) return null;
  if (hasUnsafeUrlChars(raw)) return encodeUnsafeHttpUrl(raw);
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return raw;
  } catch {
    return null;
  }
}

function hasUnsafeUrlChars(raw: string) {
  if (/[\s<>]/.test(raw)) return true;
  for (let index = 0; index < raw.length; index += 1) {
    const code = raw.charCodeAt(index);
    if (code < 0x20 || code > 0x7e) return true;
  }
  return false;
}

function encodeUnsafeHttpUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    url.pathname = url.pathname
      .split("/")
      .map((part) => {
        if (!part || !(/[\s]|[^\x20-\x7E]/.test(part))) return part;
        try {
          return encodeURIComponent(decodeURIComponent(part.replace(/ /g, "%20")));
        } catch {
          return encodeURIComponent(part);
        }
      })
      .join("/");
    if (/[\s]|[^\x20-\x7E]/.test(url.search)) {
      url.search = url.search.replace(/ /g, "%20");
    }
    return url.toString();
  } catch {
    return null;
  }
}

const POSTER_PROXY_HOSTS = new Set(["wsrv.nl", "images.weserv.nl"]);

function unwrapConvertedPoster(normalized: string): string | null {
  try {
    const parsed = new URL(normalized);
    if (!POSTER_PROXY_HOSTS.has(parsed.hostname)) return normalized;
    const original = parsed.searchParams.get("url");
    if (!original) return normalized;
    const decoded = normalizeImageUrl(original);
    // Melolo covers are HEIC. Chrome cannot paint them; the wrapper response is JPEG.
    if (!decoded || /\.hei[cf](?:$|[?#])/i.test(decoded)) return normalized;
    return decoded;
  } catch {
    return normalized;
  }
}

/** URL safe for an img tag. Convert raw HEIC posters to JPEG; keep an existing converter URL. */
export function browserPosterUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = normalizeImageUrl(value) ?? (value.startsWith("/") ? value : null);
  if (!normalized || normalized.startsWith("/")) return normalized;
  try {
    const parsed = new URL(normalized);
    if (/\.hei[cf](?:$|[?#])/i.test(parsed.pathname) && !POSTER_PROXY_HOSTS.has(parsed.hostname)) {
      return `https://wsrv.nl/?url=${encodeURIComponent(normalized)}&output=jpg&q=82&w=720`;
    }
  } catch {
    return normalized;
  }
  return unwrapConvertedPoster(normalized);
}
