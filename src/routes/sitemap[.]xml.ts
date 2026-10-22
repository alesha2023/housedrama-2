import { createFileRoute } from "@tanstack/react-router";

const SITE_ORIGIN = "https://house-drama.xyz";
const CACHE_MS = 30 * 60 * 1000;
const MAX_SITEMAP_URLS = 50000;
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
  // Current trending titles verified against HouseDrama's live catalog (Oct 2026).
  // Only real provider IDs copied from live catalog links; no IDs are inferred from titles.
  "/drama/freereels/5na1FgP377", // The Goddess Returned: Rise of the White Queen
  "/drama/melolo/7646772069891312693", // My Trial Marriage
  "/drama/freereels/2gCQBFCwPd", // No Forgiveness, Only Revenge
  "/drama/melolo/7635476299183574021", // Her Cure Was Love
  "/drama/freereels/77hAc6kCOE", // Marry the Hidden Pirate King
  "/drama/melolo/7636698880377097269", // Capital Wedding Frenzy
  "/drama/freereels/but18YxLsA", // That Beggar Girl Reigns
  "/drama/melolo/7512710469950376976", // Sworn Enemies in Love
  "/drama/freereels/oylHxZfNuZ", // The Goddess Awakens: My Daughter's Revenge
  "/drama/melolo/7535278226612947984", // Mute Husband, My Love Amplifier
  "/drama/melolo/7622861073141468213", // Married to the CEO Overnight
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
  "/en",
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

function renderSitemap(urls: Set<string>) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls].slice(0, MAX_SITEMAP_URLS)
    .map((url) => `  <url><loc>${xmlEscape(url)}</loc></url>`)
    .join("\n")}\n</urlset>`;
}

function buildSitemap() {
  // Keep sitemap retrieval deterministic and independent of upstream provider APIs.
  // Google must be able to fetch a valid XML response even when provider APIs are slow.
  const urls = new Set([...PATHS, ...FEATURED_DRAMA_PATHS].map((path) => `${SITE_ORIGIN}${path}`));
  return renderSitemap(urls);
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let body: string;
        if (cachedXml && cachedXml.expiresAt > Date.now()) {
          body = cachedXml.body;
        } else {
          body = buildSitemap();
          cachedXml = { body, expiresAt: Date.now() + CACHE_MS };
        }

        return new Response(body, {
          status: 200,
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=1800, stale-while-revalidate=86400",
            "x-content-type-options": "nosniff",
          },
        });
      },
    },
  },
});
