import { createFileRoute } from "@tanstack/react-router";
import { isBlockedProxyHost } from "@/lib/drama/proxy-guard";

const ALLOWED = [
  /(^|\.)videoint\.anyreel\.app$/i,
  /(^|\.)anyreel\.app$/i,
  /(^|\.)mydramawave\.com$/i,
  /(^|\.)dramabox-stream\.narto-drama\.com$/i,
  /(^|\.)dramaboxdb\.com$/i,
];

function blockedHost(hostname: string) {
  return isBlockedProxyHost(hostname);
}

function looksLikeMedia(url: URL) {
  const path = `${url.pathname}${url.search}`;
  return /\.(m3u8|mpd|mp4|m4s|ts|m4a|aac|vtt|webvtt|key)(\?|$)/i.test(url.pathname) || /m3u8|mpegurl|video|stream|playlist|\.ts\b/i.test(path);
}

function allowed(url: URL) {
  if (url.username || url.password) return false;
  if (url.port && url.port !== "443" && url.port !== "80") return false;
  if (blockedHost(url.hostname)) return false;
  if (ALLOWED.some((pattern) => pattern.test(url.hostname))) return true;
  // Melolo's playable edge is melolo2.narto-drama.com and the path is an opaque token, not a .mp4 name.
  if (/(^|\.)narto-drama\.com$/i.test(url.hostname)) return true;
  // Playback falls back to this proxy when a CDN omits CORS. Only media-shaped URLs are accepted.
  return looksLikeMedia(url);
}

async function fetchChecked(start: URL, headers: Headers) {
  let current = start;
  for (let hop = 0; hop < 4; hop += 1) {
    if (!allowed(current)) return { error: 403 as const };
    const upstream = await fetch(current.toString().replace(/^http:\/\//i, "https://"), {
      headers,
      redirect: "manual",
      signal: AbortSignal.timeout(20000),
    });
    if (upstream.status >= 300 && upstream.status < 400) {
      const location = upstream.headers.get("location");
      if (!location) return { error: 502 as const };
      current = new URL(location, current);
      continue;
    }
    return { upstream, finalUrl: upstream.url || current.toString() };
  }
  return { error: 502 as const };
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

  let fetched: Awaited<ReturnType<typeof fetchChecked>>;
  try {
    fetched = await fetchChecked(parsed, headers);
  } catch {
    return new Response("Media host did not respond", { status: 502 });
  }
  if ("error" in fetched) {
    return new Response(fetched.error === 403 ? "Host is not allowed" : "Media host did not respond", { status: fetched.error });
  }
  const upstream = fetched.upstream;
  const finalUrl = fetched.finalUrl;
  const contentType = upstream.headers.get("content-type") || "";
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
