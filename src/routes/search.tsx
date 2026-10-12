import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DramaGrid, EmptyState, ErrorNote, PageIntro } from "@/components/drama/cards";
import { getSearchData } from "@/lib/drama/api";
import { usePrefs } from "@/lib/drama/i18n";
import type { ProviderId, SearchPayload } from "@/lib/drama/types";
import { PROVIDERS } from "@/lib/drama/types";
import { providerLabel } from "@/lib/drama/providers";

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
      { title: "Search short dramas — HouseDrama" },
      { name: "description", content: "Search AnyReel, DramaBox, and FreeReels at the same time." },
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

  async function more() {
    const nextPage = page + 1;
    setLoading(true);
    const next = await getSearchData({ data: { q: query, lang: "id", provider, page: nextPage } });
    setData((current) => ({
      ...next,
      items: [...current.items, ...next.items],
      suggestions: current.suggestions,
    }));
    setPage(nextPage);
    setLoading(false);
  }

  return (
    <div>
      <PageIntro title={t.search} description={t.searchIntro} />
      <form
        className="mt-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void navigate({ to: "/search", search: { q: draft.trim(), provider } });
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t.searchPlaceholder}
          className="h-12 flex-1 rounded-full border border-line bg-surface px-5"
          aria-label={t.search}
        />
        <select
          value={provider}
          onChange={(event) => void navigate({ to: "/search", search: { q: query, provider: event.target.value } })}
          className="h-12 rounded-full border border-line bg-bg px-4"
          aria-label={t.providerLabel}
        >
          <option value="all">{t.allProviders}</option>
          {PROVIDERS.map((id) => (
            <option key={id} value={id}>
              {providerLabel(id)}
            </option>
          ))}
        </select>
      </form>
      <div className="mt-4">{data.providers.some((item) => !item.ok) ? <ErrorNote message={t.providersDown} /> : null}</div>
      {!query && data.suggestions.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {data.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => void navigate({ to: "/search", search: { q: suggestion, provider } })}
              className="rounded-full bg-surface px-3 py-2 text-sm font-medium"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
      {loading && !data.items.length ? <p className="mt-6 text-sm text-muted">{t.searching}</p> : null}
      {data.items.length ? (
        <DramaGrid items={data.items} />
      ) : query ? (
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
