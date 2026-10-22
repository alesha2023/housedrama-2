import { createFileRoute } from "@tanstack/react-router";
import { isBlockedProxyHost } from "@/lib/drama/proxy-guard";

async function handle({ request }: { request: Request }) {
  const target = new URL(request.url).searchParams.get("u");
  if (!target) return new Response("Missing poster url", { status: 400 });
  let current: URL;
  try {
    current = new URL(target);
  } catch {
    return new Response("Invalid poster url", { status: 400 });
  }
  if (current.protocol !== "https:" || current.username || current.password) {
    return new Response("Unsupported poster url", { status: 400 });
  }

  let upstream: Response | null = null;
  try {
    for (let hop = 0; hop < 3; hop += 1) {
      if (isBlockedProxyHost(current.hostname) || (current.port && current.port !== "443")) {
        return new Response("Host is not allowed", { status: 403 });
      }
      upstream = await fetch(current.toString(), {
        headers: { accept: "image/avif,image/webp,image/*,*/*;q=0.8", "user-agent": "HouseDrama/1.0" },
        redirect: "manual",
        signal: AbortSignal.timeout(12000),
      });
      if (upstream.status >= 300 && upstream.status < 400) {
        const location = upstream.headers.get("location");
        if (!location) return new Response("Poster redirect was empty", { status: 502 });
        current = new URL(location, current);
        if (current.protocol !== "https:") return new Response("Unsupported poster url", { status: 400 });
        continue;
      }
      break;
    }
  } catch {
    return new Response("Poster host did not respond", { status: 502 });
  }
  if (!upstream || !upstream.ok) return new Response("Poster unavailable", { status: 502 });
  const contentType = upstream.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) return new Response("Not an image", { status: 415 });
  const bytes = new Uint8Array(await upstream.arrayBuffer());
  if (bytes.byteLength < 32 || bytes.byteLength > 4_500_000) return new Response("Poster rejected", { status: 502 });
  return new Response(bytes, {
    status: 200,
    headers: {
      "content-type": contentType.split(";")[0] || "image/jpeg",
      "cache-control": "public, max-age=86400",
      "x-content-type-options": "nosniff",
    },
  });
}

export const Route = createFileRoute("/api/poster")({
  server: { handlers: { GET: handle } },
});
