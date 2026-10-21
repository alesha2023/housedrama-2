import { createFileRoute } from "@tanstack/react-router";
import { loadBrowse } from "@/lib/drama/server/catalog";
import { visibleProviders } from "@/lib/drama/providers";
import type { DramaCard, ProviderId } from "@/lib/drama/types";

const SITE_ORIGIN = "https://house-drama.xyz";
const CACHE_MS = 30 * 60 * 1000;
const MAX_SITEMAP_URLS = 50000;

// Curated drama URLs confirmed by the site owner. Keep these in the sitemap
// even when a provider's page-1 catalog does not return them.
// Only include drama URLs returned by current provider catalogs; never guess IDs.
const FEATURED_DRAMA_PATHS: string[] = [];

// Only include public, indexable pages. User-specific history/watchlist pages
// are intentionally omitted from the sitemap.
const PATHS = [
  "/",
  "/id",
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
  const withItems = new Set<string>();
  // Include the first browse catalog for every visible provider. AnyReel and
  // FreeReels support pagination in loadBrowse(), so crawl additional pages
  // to discover more real detail URLs. Do not synthesize IDs from trend titles.
  const requests = providers.flatMap((provider) => {
    // Only paginate providers whose adapters expose pages; generic providers expose one catalog response.
    const pages = provider === "anyreel" || provider === "freereels" ? Array.from({ length: 8 }, (_, index) => index + 1) : [1];
    return pages.map((page) => ({ provider, page }));
  });

  // Limit concurrency so one sitemap request doesn't overwhelm providers or
  // exceed the serverless function's execution budget.
  const batchSize = 6;
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(({ provider, page }) => loadBrowse({ lang: "en", provider, page })),
    );
    for (const result of results) {
      if (result.status !== "fulfilled") continue;
      for (const card of result.value.items) {
        const url = detailUrl(card);
        if (url) {
          urls.add(url);
          withItems.add(card.provider);
        }
      }
    }
  }
  return { urls, withItems };
}

async function buildSitemap() {
  const urls = new Set([...PATHS, ...FEATURED_DRAMA_PATHS].map((path) => `${SITE_ORIGIN}${path}`));
  try {
    // Build detail URLs from each visible provider's own browse catalog instead
    // of only the homepage rails, which are intentionally limited.
    const providers = visibleProviders();
    const collected = await collectProviderCards(providers);
    // Include only real IDs returned by the current provider catalogs, up to the
    // 50,000-URL per-file sitemap limit supported by Google. Static pages and curated known URLs stay first.
    for (const url of collected.urls) {
      if (urls.size >= MAX_SITEMAP_URLS) break;
      urls.add(url);
    }
    for (const id of collected.withItems) {
      if (!providers.includes(id as ProviderId)) continue;
      urls.add(`${SITE_ORIGIN}/provider/${encodeURIComponent(id)}`);
    }
  } catch {
    // Keep core public URLs available if catalog providers are temporarily down.
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls].slice(0, MAX_SITEMAP_URLS)
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
