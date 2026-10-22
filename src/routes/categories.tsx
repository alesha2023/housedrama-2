import { createFileRoute, Link } from "@tanstack/react-router";
import { DramaGrid, PageIntro, PageSkeleton } from "@/components/drama/cards";
import { SeoItemList } from "@/components/drama/seo-item-list";
import { getBrowseData } from "@/lib/drama/api";
import { railTitle, usePrefs } from "@/lib/drama/i18n";

const GENRES = ["romance", "revenge", "billionaire", "ceo", "historical", "fantasy", "family", "comedy", "completed"];

export const Route = createFileRoute("/categories")({
  loader: () => getBrowseData({ data: { lang: "en", provider: "all", page: 1, rail: null } }),
  pendingComponent: PageSkeleton,
  head: () => ({
    meta: [
      { title: "Chinese Short Drama Genres: Romance, CEO & Revenge — HouseDrama" },
      { name: "description", content: "Browse Chinese and Asian short dramas by genre: romance, CEO, revenge, fantasy, family, comedy, and completed series on HouseDrama." },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:title", content: "Chinese Short Drama Categories — HouseDrama" },
      { property: "og:description", content: "Find short dramas by genre, including romance, revenge, fantasy, and CEO stories." },
      { property: "og:url", content: "https://house-drama.xyz/categories" },
    ],
    links: [{ rel: "canonical", href: "https://house-drama.xyz/categories" }],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const data = Route.useLoaderData();
  const { t, uiLang } = usePrefs();
  const counts = new Map<string, number>();
  for (const item of data.items) {
    for (const tag of item.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  const tags = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 24);
  return (
    <div>
      <PageIntro title={t.categories} description={t.categoriesDesc} />
      <SeoItemList items={data.items} name="Chinese and Asian Short Drama Genres" />
      <section className="mt-4 rounded-2xl border border-line bg-surface/70 p-4" aria-label="Explore short dramas">
        <h2 className="text-base font-bold">Explore Chinese &amp; Asian Short Dramas</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Browse romance, CEO, revenge, fantasy, historical, family, and comedy short dramas. Discover popular series, newly added stories, and more titles from different drama providers.
        </p>
        <nav className="mt-3 flex flex-wrap gap-3 text-sm font-semibold" aria-label="More drama collections">
          <Link to="/trending" className="text-primary underline underline-offset-4">Trending short dramas</Link>
          <Link to="/latest" className="text-primary underline underline-offset-4">Latest short dramas</Link>
          <Link to="/discover" search={{ rail: "all" }} className="text-primary underline underline-offset-4">Discover all dramas</Link>
        </nav>
      </section>
      <div className="mt-5 flex flex-wrap gap-2">
        {GENRES.map((genre) => (
          <Link key={genre} to="/discover" search={{ rail: genre }} className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-ink">
            {railTitle(uiLang, genre, genre)}
          </Link>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map(([tag, count]) => (
          <Link key={tag} to="/search" search={{ q: tag, provider: "all" }} className="rounded-full border border-line px-3 py-2 text-sm">
            {tag}
            <span className="ml-2 text-muted">{count}</span>
          </Link>
        ))}
      </div>
      <DramaGrid items={data.items.slice(0, 10)} />
    </div>
  );
}
