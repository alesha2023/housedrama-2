import { createFileRoute, Link } from "@tanstack/react-router";
import { DramaGrid, PageIntro, PageSkeleton } from "@/components/drama/cards";
import { SeoItemList } from "@/components/drama/seo-item-list";
import { getBrowseData } from "@/lib/drama/api";
import { railTitle, usePrefs } from "@/lib/drama/i18n";

const GENRES = ["romance", "revenge", "billionaire", "ceo", "historical", "fantasy", "family", "comedy", "completed"];

export const Route = createFileRoute("/categories")({
  loader: () => getBrowseData({ data: { lang: "id", provider: "all", page: 1, rail: null } }),
  pendingComponent: PageSkeleton,
  head: () => ({
    meta: [
      { title: "Kategori Drama China: Romantis, CEO, Balas Dendam — HouseDrama" },
      { name: "description", content: "Cari drama China pendek berdasarkan genre dan tema: romantis, CEO, balas dendam, fantasi, keluarga, komedi, dan drama tamat. Tonton dengan subtitle Indonesia di HouseDrama." },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:title", content: "Kategori Drama China — HouseDrama" },
      { property: "og:description", content: "Pilih genre drama favorit dan temukan cerita yang ingin kamu tonton." },
      { property: "og:url", content: "https://house-drama.web.id/categories" },
    ],
    links: [{ rel: "canonical", href: "https://house-drama.web.id/categories" }],
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
      <SeoItemList items={data.items} name="Kategori Drama China Pendek" />
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
