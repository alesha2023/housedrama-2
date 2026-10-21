import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRight, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { DramaGrid, EmptyState, ErrorNote, PageIntro } from "@/components/drama/cards";
import { ProviderPicker } from "@/components/drama/provider-picker";
import { getSearchData } from "@/lib/drama/api";
import { usePrefs } from "@/lib/drama/i18n";
import type { ProviderId, SearchPayload } from "@/lib/drama/types";
import { PROVIDERS } from "@/lib/drama/types";
import { absoluteSiteUrl } from "@/lib/drama/site";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): { q?: string; provider?: string } => ({
    ...(typeof search.q === "string" && search.q ? { q: search.q } : {}),
    ...(typeof search.provider === "string" && search.provider !== "all" ? { provider: search.provider } : {}),
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    getSearchData({
      data: {
        q: deps.q ?? "",
        lang: "en",
        provider: (["all", ...PROVIDERS] as string[]).includes(deps.provider ?? "all")
          ? ((deps.provider ?? "all") as "all" | ProviderId)
          : "all",
        page: 1,
      },
    }),
  head: () => ({
    meta: [
      { title: "Search Chinese Short Dramas — HouseDrama" },
      { name: "description", content: "Search the HouseDrama catalog for Chinese short-drama titles." },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: absoluteSiteUrl("/search") }],
  }),
  component: SearchPage,
});

function SearchPage() {
  const initial = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { t } = usePrefs();
  const query = search.q ?? "";
  const [draft, setDraft] = useState(query);
  const [data, setData] = useState<SearchPayload>(initial);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const provider = (["all", ...PROVIDERS] as string[]).includes(search.provider ?? "all")
    ? ((search.provider ?? "all") as "all" | ProviderId)
    : "all";

  useEffect(() => setDraft(query), [query]);
  useEffect(() => {
    setData(initial);
    setPage(1);
  }, [initial]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (draft.trim() === query) return;
      void navigate({ to: "/search", search: { q: draft.trim(), provider } });
    }, 350);
    return () => window.clearTimeout(handle);
  }, [draft, navigate, provider, query]);

  async function searchFor(nextQuery: string) {
    const q = nextQuery.trim();
    setDraft(q);
    setLoading(true);
    void navigate({
      to: "/search",
      search: { ...(q ? { q } : {}), ...(provider === "all" ? {} : { provider }) },
    });
    try {
      const next = await getSearchData({ data: { q, lang: "en", provider, page: 1 } });
      setData(next);
      setPage(1);
    } finally {
      setLoading(false);
    }
  }

  async function more() {
    const nextPage = page + 1;
    setLoading(true);
    try {
      const next = await getSearchData({ data: { q: query, lang: "en", provider, page: nextPage } });
      setData((current) => ({
        ...next,
        items: [...current.items, ...next.items],
        suggestions: current.suggestions,
      }));
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageIntro title={t.search} description={t.searchIntro} />
      <form
        className="mt-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void searchFor(draft);
        }}
      >
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t.searchPlaceholder}
            className="hd-search h-12 min-w-0 flex-1 rounded-full border border-line bg-surface px-5 text-ink"
            aria-label={t.search}
          />
          <button type="submit" disabled={loading} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-ink disabled:opacity-60" aria-busy={loading}>
            {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
            {loading ? t.searching : t.search}
          </button>
        </div>
        <ProviderPicker
          value={provider}
          onChange={(value) => void navigate({ to: "/search", search: { q: query, ...(value === "all" ? {} : { provider: value }) } })}
          className="w-full sm:w-56"
          label={t.providerLabel}
        />
      </form>
      <div className="mt-4">{data.providers.some((item) => !item.ok) ? <ErrorNote message={t.providersDown} /> : null}</div>
      {(draft.trim() && data.suggestions.length > 0) ? (
        <div className="relative z-30" aria-label="Saran pencarian">
          <div className="absolute left-0 right-0 top-2 max-h-[min(60vh,24rem)] overflow-y-auto rounded-2xl border border-line bg-surface shadow-xl">
            {data.suggestions
              .filter((suggestion) => {
                const typed = draft.trim().toLocaleLowerCase();
                const title = suggestion.toLocaleLowerCase();
                return title.includes(typed) || typed.split(/\\s+/).every((word) => title.includes(word));
              })
              .slice(0, 8)
              .map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => void searchFor(suggestion)}
                  className="flex min-h-12 w-full items-center justify-between gap-3 border-b border-line/70 px-4 py-3 text-left text-sm last:border-b-0 hover:bg-primary/5 focus-visible:bg-primary/5"
                >
                  <span className="min-w-0 flex-1">{suggestion}</span>
                  <ChevronRight className="size-4 shrink-0 text-muted" />
                </button>
              ))}
          </div>
        </div>
      ) : null}
      {loading && !data.items.length ? <p className="mt-6 text-sm text-muted">{t.searching}</p> : null}
      {data.items.length ? (
        <DramaGrid items={data.items} />
      ) : query && !loading ? (
        <EmptyState title={t.noMatches} body={t.noMatchesBody} />
      ) : null}
      {data.hasMore && query ? (
        <button type="button" onClick={() => void more()} className="mt-6 h-12 rounded-full bg-ink px-5 font-semibold text-player-ink">
          {t.loadMore}
        </button>
      ) : null}
    </div>
  );
}
