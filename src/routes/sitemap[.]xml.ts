import { createFileRoute } from "@tanstack/react-router";
import { getRequestUrl } from "@tanstack/react-start/server";
import { loadHome } from "@/lib/drama/server/catalog";

const PATHS = [
  "/",
  "/discover",
  "/trending",
  "/latest",
  "/shorts",
  "/categories",
  "/provider/anyreel",
  "/provider/dramabox",
  "/provider/freereels",
  "/provider/melolo",
  "/about",
  "/privacy",
  "/terms",
  "/drama/melolo/7690840565335723061",
];

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const origin = new URL(getRequestUrl()).origin;
        const urls = new Set(PATHS.map((path) => `${origin}${path}`));

        // Include drama detail pages found in the same live catalog used by the site.
        // Keep static routes available even if one or more drama providers are offline.
        try {
          const home = await loadHome("id");
          const cards = [...home.hero, ...home.sections.flatMap((section) => section.items)];
          for (const card of cards) {
            if (!card.provider || !card.seriesId) continue;
            const provider = encodeURIComponent(card.provider);
            const seriesId = encodeURIComponent(card.seriesId);
            urls.add(`${origin}/drama/${provider}/${seriesId}`);
          }
        } catch {
          // Return the core sitemap if live catalog discovery is temporarily unavailable.
        }

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...urls].map((url) => `  <url><loc>${xmlEscape(url)}</loc></url>`).join("\n")}
</urlset>`;

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
