import type { DramaCard } from "@/lib/drama/types";

/** Structured data for public catalog landing pages; does not alter the visible UI. */
export function SeoItemList({ items, name }: { items: DramaCard[]; name: string }) {
  const visible = items.filter((item) => item.title?.trim() && item.provider && item.seriesId).slice(0, 30);
  if (!visible.length) return null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: visible.length,
    itemListElement: visible.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://house-drama.web.id/drama/${encodeURIComponent(item.provider)}/${encodeURIComponent(item.seriesId)}`,
      name: (item.displayTitle || item.title).slice(0, 180),
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />;
}
