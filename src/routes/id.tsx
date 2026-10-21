import { createFileRoute, Link } from "@tanstack/react-router";
import { DramaGrid, EmptyState, PageIntro, PageSkeleton } from "@/components/drama/cards";
import { SeoItemList } from "@/components/drama/seo-item-list";
import { getLocalizedHomeData } from "@/lib/drama/api";
import { absoluteSiteUrl, pageSeo } from "@/lib/drama/site";

export const Route = createFileRoute("/id")({
  loader: () => getLocalizedHomeData({ data: { lang: "id" } }),
  pendingComponent: PageSkeleton,
  head: () => pageSeo({
    title: "Nonton Drama China Pendek Online | HouseDrama",
    description: "Jelajahi drama China dan Asia pendek di HouseDrama. Temukan kisah romantis, CEO, balas dendam, fantasi, dan episode terbaru dari berbagai penyedia.",
    path: "/id",
    locale: "id_ID",
    extraLinks: [
      { rel: "alternate", hrefLang: "en", href: absoluteSiteUrl("/") },
      { rel: "alternate", hrefLang: "id", href: absoluteSiteUrl("/id") },
      { rel: "alternate", hrefLang: "x-default", href: absoluteSiteUrl("/") },
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
        <Link to="/" className="font-semibold text-primary underline">English</Link>
        <Link to="/trending" className="font-semibold text-primary underline">Drama trending</Link>
        <Link to="/latest" className="font-semibold text-primary underline">Episode terbaru</Link>
      </nav>
      <SeoItemList items={items} name="Drama China dan Asia Pendek di HouseDrama" />
      {items.length ? <DramaGrid items={items} /> : <EmptyState title="Drama belum tersedia saat ini" body="Coba lagi nanti atau jelajahi katalog terbaru." />}
    </div>
  );
}
