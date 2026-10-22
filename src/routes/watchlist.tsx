import { createFileRoute, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState, PageIntro, Poster, ProviderBadge } from "@/components/drama/cards";
import { usePrefs } from "@/lib/drama/i18n";
import { useDisplayTitles } from "@/lib/drama/display";
import { readWatchlist, toggleWatchlist, type SavedDrama } from "@/lib/drama/storage";

export const Route = createFileRoute("/watchlist")({
  head: () => ({
    meta: [
      { title: "Daftar Tontonan — HouseDrama" },
      { name: "robots", content: "noindex,follow" },
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
            <div key={`${item.provider}-${item.seriesId}`} className="flex items-center gap-3 rounded-3xl border border-line bg-surface p-3">
              <Link
                to="/drama/$provider/$seriesId"
                params={{ provider: item.provider, seriesId: item.seriesId }}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <div className="h-24 w-16 shrink-0 overflow-hidden rounded-2xl">
                  <Poster src={item.posterUrl} alt="" />
                </div>
                <span className="min-w-0">
                  <ProviderBadge provider={item.provider} />
                  <span className="mt-1.5 block text-base font-semibold leading-snug break-words">{showTitle(item.title, item.originalTitle)}</span>
                  {item.episodeCount ? <span className="mt-1 block text-xs text-muted">{item.episodeCount} {t.eps}</span> : null}
                </span>
              </Link>
              <button
                type="button"
                aria-label={t.remove}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-bg text-muted"
                onClick={() => setItems(toggleWatchlist({ ...item, savedAt: Date.now() }))}
              >
                <X className="size-4" />
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
