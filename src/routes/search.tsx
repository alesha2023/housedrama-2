import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRight, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { DramaGrid, EmptyState, ErrorNote, PageIntro } from "@/components/drama/cards";
import { ProviderPicker } from "@/components/drama/provider-picker";
import { getSearchData } from "@/lib/drama/api";
import { usePrefs } from "@/lib/drama/i18n";
import type { ProviderId, SearchPayload } from "@/lib/drama/types";
import { PROVIDERS } from "@/lib/drama/types";

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
        lang: "id",
        provider: (["all", ...PROVIDERS] as string[]).includes(deps.provider ?? "all")
          ? ((deps.provider ?? "all") as "all" | ProviderId)
          : "all",
        page: 1,
      },
    }),
  head: () => ({
    meta: [
      { title: "Cari Drama China — HouseDrama" },
      { name: "description", content: "Cari judul drama China pendek di katalog HouseDrama." },
      { name: "robots", content: "noindex,follow" },
    ],
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
      const next = await getSearchData({ data: { q, lang: "id", provider, page: 1 } });
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
      const next = await getSearchData({ data: { q: query, lang: "id", provider, page: nextPage } });
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
            className="h-12 min-w-0 flex-1 rounded-full border border-line bg-white px-5"
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
      {!query && data.suggestions.length ? (
        <div className="relative z-10 mt-4 flex flex-col gap-2">
          {data.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => void searchFor(suggestion)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 text-left text-sm font-semibold active:bg-ink active:text-player-ink"
            >
              <span>{suggestion}</span>
              <ChevronRight className="size-4 shrink-0 text-muted" />
            </button>
          ))}
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
