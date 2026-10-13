import { createFileRoute } from "@tanstack/react-router";

const ALLOWED = [
  /(^|\.)videoint\.anyreel\.app$/i,
  /(^|\.)anyreel\.app$/i,
  /(^|\.)mydramawave\.com$/i,
  /(^|\.)dramabox-stream\.narto-drama\.com$/i,
  /(^|\.)dramaboxdb\.com$/i,
];

function blockedHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/\.+$/, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return true;
  if (host === "metadata.google.internal" || host === "169.254.169.254") return true;
  const ipv4 = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4) {
    const a = Number(ipv4[1]);
    const b = Number(ipv4[2]);
    if (a === 10 || a === 127 || a === 0 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31) || (a === 169 && b === 254)) {
      return true;
    }
  }
  return false;
}

function looksLikeMedia(url: URL) {
  const path = `${url.pathname}${url.search}`;
  return /\.(m3u8|mpd|mp4|m4s|ts|m4a|aac|vtt|webvtt|key)(\?|$)/i.test(url.pathname) || /m3u8|mpegurl|video|stream|playlist|\.ts\b/i.test(path);
}

function allowed(url: URL) {
  if (blockedHost(url.hostname)) return false;
  if (ALLOWED.some((pattern) => pattern.test(url.hostname))) return true;
  // Melolo's playable edge is melolo2.narto-drama.com and the path is an opaque token, not a .mp4 name.
  if (/(^|\.)narto-drama\.com$/i.test(url.hostname)) return true;
  // Playback falls back to this proxy when a CDN omits CORS. Only media-shaped URLs are accepted.
  return looksLikeMedia(url);
}

function isPlaylist(contentType: string, pathname: string) {
  return /mpegurl|m3u8/i.test(contentType) || pathname.endsWith(".m3u8");
}

function rewritePlaylist(text: string, baseUrl: string) {
  const base = new URL(baseUrl);
  const wrap = (raw: string) => {
    const absolute = new URL(raw, base).toString();
    return `media?u=${encodeURIComponent(absolute)}`;
  };
  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;
      if (trimmed.startsWith("#")) {
        return line.replace(/URI="([^"]+)"/g, (_match, uri: string) => `URI="${wrap(uri)}"`);
      }
      return wrap(trimmed);
    })
    .join("\n");
}

async function handle({ request }: { request: Request }) {
  const incoming = new URL(request.url);
  const target = incoming.searchParams.get("u");
  if (!target) return new Response("Missing media url", { status: 400 });
  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new Response("Invalid media url", { status: 400 });
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return new Response("Unsupported protocol", { status: 400 });
  }
  if (!allowed(parsed)) return new Response("Host is not allowed", { status: 403 });

  const headers = new Headers({ "user-agent": "HouseDrama/1.0", accept: "*/*" });
  const range = request.headers.get("range");
  if (range) headers.set("range", range);

  let upstream: Response;
  try {
    upstream = await fetch(parsed.toString().replace(/^http:\/\//i, "https://"), {
      headers,
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    return new Response("Media host did not respond", { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") || "";
  const finalUrl = upstream.url || parsed.toString();
  if (isPlaylist(contentType, new URL(finalUrl).pathname)) {
    const text = await upstream.text();
    return new Response(rewritePlaylist(text, finalUrl), {
      status: 200,
      headers: {
        "content-type": "application/vnd.apple.mpegurl; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }

  const responseHeaders = new Headers();
  for (const name of ["content-type", "content-length", "content-range", "accept-ranges"]) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  if (!responseHeaders.get("content-type")) responseHeaders.set("content-type", "application/octet-stream");
  responseHeaders.set("cache-control", "private, max-age=60");
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

export const Route = createFileRoute("/api/media")({
  server: { handlers: { GET: handle, HEAD: handle } },
});
