import { createFileRoute } from "@tanstack/react-router";
import { loadBrowse } from "@/lib/drama/server/catalog";
import { visibleProviders } from "@/lib/drama/providers";
import type { DramaCard, ProviderId } from "@/lib/drama/types";

const SITE_ORIGIN = "https://house-drama.web.id";
const CACHE_MS = 30 * 60 * 1000;

// Curated drama URLs confirmed by the site owner. Keep these in the sitemap
// even when a provider's page-1 catalog does not return them.
const FEATURED_DRAMA_PATHS = [
  "/drama/freereels/LSjOzwuyTG",
  "/drama/freereels/CtuX3LVyry",
  "/drama/freereels/E8PxLvaL3J",
  "/drama/freereels/ZLM2f8JJEQ",
  "/drama/dramabox/42000026343",
  "/drama/dramabox/42000029045",
  // Additional trending dramas confirmed by the site owner.
  "/drama/freereels/JJYPIFhFmD",
  "/drama/freereels/vyCsDHzEN9",
  "/drama/freereels/hMVo9oiMlB",
  "/drama/freereels/aAHtGDqOPG",
  "/drama/freereels/dqoMUlYLBQ",
  "/drama/dramabox/42000028298",
  "/drama/dramabox/42000028283",
  "/drama/dramabox/42000021480",
  "/drama/dramabox/42000023896",
  // Priority drama URLs observed in Google Search Console.
  "/drama/dramabox/420000030309",
  "/drama/dramabox/42000030762",
  "/drama/anyreel/678a7bcc8f3d553db1998228",
  "/drama/dramabox/420000030502",
  "/drama/dramabox/420000029973",
  "/drama/dramabox/420000027254",
  "/drama/dramabox/420000030511",
  "/drama/dramabox/420000028173",
  "/drama/dramabox/420000029949",
  "/drama/dramabox/420000025978",
  "/drama/dramabox/420000030437",
];

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
  // Include the first browse catalog for every visible provider. AnyReel and
  // FreeReels support pagination in loadBrowse(), so crawl additional pages
  // to discover more real detail URLs. Do not synthesize IDs from trend titles.
  const requests = providers.flatMap((provider) => {
    const pages = provider === "anyreel" || provider === "freereels" ? [1, 2, 3, 4, 5] : [1];
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
        if (url) urls.add(url);
      }
    }
  }
  return urls;
}

async function buildSitemap() {
  const urls = new Set([...PATHS, ...FEATURED_DRAMA_PATHS].map((path) => `${SITE_ORIGIN}${path}`));
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
