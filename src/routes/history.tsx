import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EmptyState, PageIntro, Poster, ProviderBadge } from "@/components/drama/cards";
import { usePrefs } from "@/lib/drama/i18n";
import { useDisplayTitles } from "@/lib/drama/display";
import { readHistory, type HistoryEntry } from "@/lib/drama/storage";
import { maybeOpenMonetagAd } from "@/lib/drama/monetag";
import { absoluteSiteUrl } from "@/lib/drama/site";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Watch History — HouseDrama" },
      { name: "description", content: "Your HouseDrama watch history is stored in this browser and is not a public catalog page." },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: absoluteSiteUrl("/history") }],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { t, contentLang } = usePrefs();
  const [items, setItems] = useState<HistoryEntry[]>([]);
  useEffect(() => {
    const load = () => setItems(readHistory());
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
      <PageIntro title={t.history} description={t.historyBody} />
      {items.length ? (
        <div className="mt-6 grid gap-3">
          {items.map((item) => {
            const ratio = item.durationSec ? Math.min(100, Math.round((item.positionSec / item.durationSec) * 100)) : 0;
            return (
              <Link
                key={`${item.provider}-${item.seriesId}-${item.episodeId}`}
                to="/watch/$provider/$seriesId/$episodeId"
                params={{ provider: item.provider, seriesId: item.seriesId, episodeId: item.episodeId }}
                onClick={() => maybeOpenMonetagAd()}
                className="flex items-center gap-3 rounded-card border border-line p-2"
              >
                <div className="h-20 w-14 overflow-hidden rounded-xl">
                  <Poster src={item.posterUrl} alt="" />
                </div>
                <span className="min-w-0 flex-1">
                  <ProviderBadge provider={item.provider} />
                  <span className="mt-1 block truncate font-semibold">{showTitle(item.title, item.originalTitle)}</span>
                  <span className="text-sm text-muted">{item.episodeLabel}</span>
                  <span className="mt-2 block h-1 overflow-hidden rounded-full bg-line">
                    <span className="block h-full bg-primary" style={{ width: `${ratio}%` }} />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState title={t.empty} body={t.historyEmpty} />
      )}
    </div>
  );
}
