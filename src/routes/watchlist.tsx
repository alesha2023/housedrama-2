import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EmptyState, PageIntro, Poster, ProviderBadge } from "@/components/drama/cards";
import { usePrefs } from "@/lib/drama/i18n";
import { useDisplayTitles } from "@/lib/drama/display";
import { readWatchlist, toggleWatchlist, type SavedDrama } from "@/lib/drama/storage";

export const Route = createFileRoute("/watchlist")({
  head: () => ({
    meta: [
      { title: "Watchlist — HouseDrama" },
      { name: "description", content: "Dramas you saved in this browser." },
    ],
  }),
  component: WatchlistPage,
});

function WatchlistPage() {
  const { t, contentLang } = usePrefs();
  const [items, setItems] = useState<SavedDrama[]>([]);
  useEffect(() => {
    const load = () => setItems(readWatchlist());
    load();
    window.addEventListener("dramaluma-library", load);
    return () => window.removeEventListener("dramaluma-library", load);
  }, []);

  const showTitle = useDisplayTitles(
    items.map((item) => item.originalTitle || item.title),
    contentLang,
  );

  return (
    <div>
      <PageIntro title={t.watchlist} description={t.watchlistBody} />
      {items.length ? (
        <div className="mt-6 grid gap-3">
          {items.map((item) => (
            <div key={`${item.provider}-${item.seriesId}`} className="flex items-center gap-3 rounded-card border border-line p-2">
              <Link to="/drama/$provider/$seriesId" params={{ provider: item.provider, seriesId: item.seriesId }} className="flex min-w-0 flex-1 items-center gap-3">
                <div className="h-20 w-14 overflow-hidden rounded-xl">
                  <Poster src={item.posterUrl} alt="" />
                </div>
                <span className="min-w-0">
                  <ProviderBadge provider={item.provider} />
                  <span className="mt-1 block truncate font-semibold">{showTitle(item.title, item.originalTitle)}</span>
                </span>
              </Link>
              <button
                type="button"
                className="h-11 px-3 text-sm font-semibold text-coral"
                onClick={() => setItems(toggleWatchlist({ ...item, savedAt: Date.now() }))}
              >
                {t.remove}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title={t.empty} body={t.watchlistEmpty} action={<Link to="/discover" className="font-semibold text-primary">{t.discoverCta}</Link>} />
      )}
    </div>
  );
}
