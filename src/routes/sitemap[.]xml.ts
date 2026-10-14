import { createFileRoute } from "@tanstack/react-router";
import { loadBrowse } from "@/lib/drama/server/catalog";
import { visibleProviders } from "@/lib/drama/providers";
import type { DramaCard, ProviderId } from "@/lib/drama/types";

const SITE_ORIGIN = "https://house-drama.web.id";
const CACHE_MS = 30 * 60 * 1000;

// Only include public, indexable pages. User-specific history/watchlist pages
// are intentionally omitted from the sitemap.
const PATHS = [
  "/",
  "/discover",
  "/trending",
  "/latest",
  "/categories",
  "/provider/anyreel",
  "/provider/dramabox",
  "/provider/freereels",
  "/provider/melolo",
  "/shorts",
  "/about",
  "/privacy",
  "/terms",
];

let cachedXml: { expiresAt: number; body: string } | null = null;

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function detailUrl(card: DramaCard) {
  if (!card.provider || !card.seriesId || !card.title?.trim()) return null;
  return `${SITE_ORIGIN}/drama/${encodeURIComponent(card.provider)}/${encodeURIComponent(card.seriesId)}`;
}

async function collectProviderCards(providers: ProviderId[]) {
  const urls = new Set<string>();
  // Limit concurrency so one sitemap request doesn't overwhelm providers or
  // exceed the serverless function's execution budget.
  const batchSize = 6;
  for (let i = 0; i < providers.length; i += batchSize) {
    const batch = providers.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((provider) => loadBrowse({ lang: "id", provider, page: 1 })),
    );
    for (const result of results) {
      if (result.status !== "fulfilled") continue;
      for (const card of result.value.items) {
        const url = detailUrl(card);
        if (url) urls.add(url);
      }
    }
  }
  return urls;
}

async function buildSitemap() {
  const urls = new Set(PATHS.map((path) => `${SITE_ORIGIN}${path}`));
  try {
    // Build detail URLs from each visible provider's own browse catalog instead
    // of only the homepage rails, which are intentionally limited.
    const providers = visibleProviders();
    const dramaUrls = await collectProviderCards(providers);
    for (const url of dramaUrls) urls.add(url);
  } catch {
    // Keep core public URLs available if catalog providers are temporarily down.
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls]
    .map((url) => `  <url><loc>${xmlEscape(url)}</loc></url>`)
    .join("\n")}\n</urlset>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let body: string;
        if (cachedXml && cachedXml.expiresAt > Date.now()) {
          body = cachedXml.body;
        } else {
          body = await buildSitemap();
          cachedXml = { body, expiresAt: Date.now() + CACHE_MS };
        }

        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=1800, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});
