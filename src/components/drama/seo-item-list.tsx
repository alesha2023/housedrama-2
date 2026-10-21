import type { DramaCard } from "@/lib/drama/types";
import { browserPosterUrl } from "@/lib/drama/images";
import { absoluteSiteUrl, jsonLdScript } from "@/lib/drama/site";

/** Structured data for public catalog landing pages; does not alter the visible UI. */
export function SeoItemList({ items, name }: { items: DramaCard[]; name: string }) {
  const seen = new Set<string>();
  const visible = items.filter((item) => {
    const key = `${item.provider}:${item.seriesId}`;
    if (!item.title?.trim() || !item.provider || !item.seriesId || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 12);
  if (!visible.length) return null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: visible.length,
    itemListElement: visible.map((item, index) => {
      const image = browserPosterUrl(item.posterUrl);
      return {
        "@type": "ListItem",
        position: index + 1,
        name: (item.displayTitle || item.title).slice(0, 180),
        url: absoluteSiteUrl(`/drama/${encodeURIComponent(item.provider)}/${encodeURIComponent(item.seriesId)}`),
        ...(image ? { image } : {}),
      };
    }),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />;
}