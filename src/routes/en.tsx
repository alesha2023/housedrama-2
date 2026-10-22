import { createFileRoute, Link } from "@tanstack/react-router";
import { DramaGrid, EmptyState, PageIntro, PageSkeleton } from "@/components/drama/cards";
import { SeoItemList } from "@/components/drama/seo-item-list";
import { getLocalizedHomeData } from "@/lib/drama/api";

export const Route = createFileRoute("/en")({
  loader: () => getLocalizedHomeData({ data: { lang: "en" } }),
  pendingComponent: PageSkeleton,
  head: () => ({
    meta: [
      { title: "Watch Chinese & Asian Short Dramas Online | HouseDrama" },
      { name: "description", content: "Discover Chinese and Asian short dramas online on HouseDrama. Explore romance, CEO, revenge, fantasy, and new episodes from multiple drama providers." },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Watch Chinese & Asian Short Dramas Online | HouseDrama" },
      { property: "og:description", content: "Discover romance, CEO, revenge, fantasy, and new Asian short dramas on HouseDrama." },
      { property: "og:url", content: "https://house-drama.web.id/en" },
      { property: "og:image", content: "https://house-drama.web.id/og-v2.jpg" },
    ],
    links: [
      { rel: "canonical", href: "https://house-drama.web.id/en" },
      { rel: "alternate", hrefLang: "en", href: "https://house-drama.web.id/en" },
      { rel: "alternate", hrefLang: "id", href: "https://house-drama.web.id/id" },
      { rel: "alternate", hrefLang: "x-default", href: "https://house-drama.web.id/" },
    ],
  }),
  component: EnglishLandingPage,
});

function EnglishLandingPage() {
  const data = Route.useLoaderData();
  const items = [
    ...data.hero,
    ...data.sections.flatMap((section) => section.items),
  ].filter((item, index, all) => all.findIndex((candidate) => candidate.provider === item.provider && candidate.seriesId === item.seriesId) === index).slice(0, 30);

  return (
    <div>
      <PageIntro
        eyebrow="HouseDrama · English"
        title="Watch Chinese & Asian Short Dramas Online"
        description="Discover short romance dramas, CEO love stories, revenge plots, fantasy, and new episodes from multiple drama providers. Browse the catalog and open a drama to see available episodes."
      />
      <nav className="mt-4 flex flex-wrap gap-3 text-sm" aria-label="Language versions">
        <span className="font-semibold text-ink">English</span>
        <Link to="/id" className="font-semibold text-primary underline">Bahasa Indonesia</Link>
        <Link to="/trending" className="font-semibold text-primary underline">Trending dramas</Link>
        <Link to="/latest" className="font-semibold text-primary underline">Latest episodes</Link>
      </nav>
      <SeoItemList items={items} name="Chinese and Asian Short Dramas on HouseDrama" />
      {items.length ? <DramaGrid items={items} /> : <EmptyState title="No dramas available right now" body="Please try again later or explore the latest catalog." />}
    </div>
  );
}
