import { createFileRoute } from "@tanstack/react-router";

const ALLOWED = [
  /(^|\.)videoint\.anyreel\.app$/i,
  /(^|\.)anyreel\.app$/i,
  /(^|\.)mydramawave\.com$/i,
  /(^|\.)dramabox-stream\.narto-drama\.com$/i,
  /(^|\.)dramaboxdb\.com$/i,
];

function allowed(hostname: string) {
  return ALLOWED.some((pattern) => pattern.test(hostname));
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
  if (!allowed(parsed.hostname)) return new Response("Host is not allowed", { status: 403 });

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
