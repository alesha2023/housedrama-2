import { createFileRoute, Link } from "@tanstack/react-router";
import { DramaGrid, EmptyState, PageIntro, PageSkeleton } from "@/components/drama/cards";
import { SeoItemList } from "@/components/drama/seo-item-list";
import { getLocalizedHomeData } from "@/lib/drama/api";

export const Route = createFileRoute("/id")({
  loader: () => getLocalizedHomeData({ data: { lang: "id" } }),
  pendingComponent: PageSkeleton,
  head: () => ({
    meta: [
      { title: "Nonton Drama China Pendek Online | HouseDrama" },
      { name: "description", content: "Jelajahi drama China dan Asia pendek di HouseDrama. Temukan kisah romantis, CEO, balas dendam, fantasi, dan episode terbaru dari berbagai penyedia." },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Nonton Drama China Pendek Online | HouseDrama" },
      { property: "og:description", content: "Temukan drama China dan Asia pendek, kisah romantis, CEO, balas dendam, fantasi, dan episode terbaru." },
      { property: "og:url", content: "https://house-drama.xyz/id" },
      { property: "og:image", content: "https://house-drama.xyz/og-v2.jpg" },
    ],
    links: [
      { rel: "canonical", href: "https://house-drama.xyz/id" },
      { rel: "alternate", hrefLang: "en", href: "https://house-drama.xyz/en" },
      { rel: "alternate", hrefLang: "id", href: "https://house-drama.xyz/id" },
      { rel: "alternate", hrefLang: "x-default", href: "https://house-drama.xyz/" },
    ],
  }),
  component: IndonesianLandingPage,
});

function IndonesianLandingPage() {
  const data = Route.useLoaderData();
  const items = [
    ...data.hero,
    ...data.sections.flatMap((section) => section.items),
  ].filter((item, index, all) => all.findIndex((candidate) => candidate.provider === item.provider && candidate.seriesId === item.seriesId) === index).slice(0, 30);

  return (
    <div>
      <PageIntro
        eyebrow="HouseDrama · Indonesia"
        title="Nonton Drama China dan Asia Pendek Online"
        description="Jelajahi drama pendek romantis, kisah cinta CEO, balas dendam, fantasi, dan episode terbaru dari berbagai penyedia drama. Buka halaman drama untuk melihat episode yang tersedia."
      />
      <nav className="mt-4 flex flex-wrap gap-3 text-sm" aria-label="Pilihan bahasa">
        <span className="font-semibold text-ink">Bahasa Indonesia</span>
        <Link to="/en" className="font-semibold text-primary underline">English</Link>
        <Link to="/trending" className="font-semibold text-primary underline">Drama trending</Link>
        <Link to="/latest" className="font-semibold text-primary underline">Episode terbaru</Link>
      </nav>
      <SeoItemList items={items} name="Drama China dan Asia Pendek di HouseDrama" />
      {items.length ? <DramaGrid items={items} /> : <EmptyState title="Drama belum tersedia saat ini" body="Coba lagi nanti atau jelajahi katalog terbaru." />}
    </div>
  );
}
