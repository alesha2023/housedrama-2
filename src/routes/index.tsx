import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ErrorNote, PageSkeleton, Poster, ProviderBadge, Rail } from "@/components/drama/cards";
import { getHomeData } from "@/lib/drama/api";
import { railTitle, usePrefs } from "@/lib/drama/i18n";
import { pickDescription, pickTitle, useDisplayTitles } from "@/lib/drama/display";
import { providerLabel } from "@/lib/drama/providers";
import { readHistory } from "@/lib/drama/storage";
import { isProviderId, PROVIDERS, type HomePayload, type ProviderId } from "@/lib/drama/types";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { provider?: ProviderId } => ({
    ...(typeof search.provider === "string" && isProviderId(search.provider) ? { provider: search.provider } : {}),
  }),
  loaderDeps: ({ search }): { provider: "all" | ProviderId } => ({ provider: search.provider ?? "all" }),
  loader: ({ deps }) => getHomeData({ data: { lang: "id", provider: deps.provider } }),
  pendingComponent: PageSkeleton,
  head: () => ({
    meta: [
      { title: "HouseDrama — Watch Chinese short dramas" },
      {
        name: "description",
        content:
          "Browse trending, new, and completed Chinese short dramas from AnyReel, DramaBox, and FreeReels. No subscription or coins.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const initial = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { t, contentLang, uiLang } = usePrefs();
  const selected = search.provider;
  const [data, setData] = useState<HomePayload>(initial);
  const [history, setHistory] = useState<ReturnType<typeof readHistory>>([]);
  const [slide, setSlide] = useState(0);

  useEffect(() => setData(initial), [initial]);

  useEffect(() => {
    setHistory(readHistory());
    const on = () => setHistory(readHistory());
    window.addEventListener("dramaluma-library", on);
    return () => window.removeEventListener("dramaluma-library", on);
  }, []);

  const hero = data.hero;
  const current = hero[slide] ?? hero[0];

  useEffect(() => {
    if (hero.length < 2) return;
    const timer = window.setInterval(() => setSlide((value) => (value + 1) % hero.length), 6500);
    return () => window.clearInterval(timer);
  }, [hero.length]);

  const showTitle = useDisplayTitles(
    history.map((item) => item.originalTitle || item.title),
    contentLang,
  );
  const down = data.providers.filter((item) => !item.ok);

  return (
    <div>
      {down.length ? <ErrorNote message={`${t.providersDown} (${down.map((item) => item.id).join(", ")})`} /> : null}
      <div className="mt-3">
        <label className="mb-2 block text-sm font-semibold" htmlFor="home-provider">
          {t.providerLabel}
        </label>
        <select
          id="home-provider"
          value={selected ?? "all"}
          onChange={(event) => {
            const value = event.target.value;
            void navigate({ to: "/", search: value === "all" || !isProviderId(value) ? {} : { provider: value } });
          }}
          className="h-11 w-full rounded-full border border-line bg-surface px-4 font-semibold sm:max-w-xs"
        >
          <option value="all">{t.allProviders}</option>
          {PROVIDERS.map((id) => (
            <option key={id} value={id}>
              {providerLabel(id)}
            </option>
          ))}
        </select>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => void navigate({ to: "/", search: {} })}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ${selected ? "bg-surface" : "bg-ink text-player-ink"}`}
          >
            {t.allProviders}
          </button>
          {PROVIDERS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => void navigate({ to: "/", search: { provider: id } })}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ${selected === id ? "bg-ink text-player-ink" : "bg-surface"}`}
            >
              {providerLabel(id)}
            </button>
          ))}
        </div>
      </div>
      {current ? (
        <section className="relative mt-2 overflow-hidden rounded-card bg-surface">
          <div className="grid lg:grid-cols-[1.3fr_0.7fr]">
            <div className="relative min-h-80 sm:min-h-[28rem]">
              <Poster src={current.bannerUrl || current.posterUrl} alt="" priority className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/35 to-ink/5" />
              {current.firstEpisodeId ? (
                <Link
                  to="/watch/$provider/$seriesId/$episodeId"
                  params={{ provider: current.provider, seriesId: current.seriesId, episodeId: current.firstEpisodeId }}
                  aria-label={pickTitle(current, contentLang)}
                  className="absolute inset-0 z-10"
                />
              ) : (
                <Link
                  to="/drama/$provider/$seriesId"
                  params={{ provider: current.provider, seriesId: current.seriesId }}
                  aria-label={pickTitle(current, contentLang)}
                  className="absolute inset-0 z-10"
                />
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-5 text-player-ink sm:p-8">
                <div className="mb-3 flex flex-wrap gap-2">
                  <ProviderBadge provider={current.provider} />
                  {current.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-player-ink/15 px-2 py-0.5 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="max-w-xl text-4xl sm:text-5xl">{pickTitle(current, contentLang)}</h1>
                <p className="mt-3 max-w-xl text-sm text-player-ink/85 line-clamp-3">
                  {pickDescription(current, contentLang) || t.heroFallback}
                </p>
                <div className="pointer-events-auto mt-5 flex flex-wrap gap-2">
                  {current.firstEpisodeId ? (
                    <Link
                      to="/watch/$provider/$seriesId/$episodeId"
                      params={{ provider: current.provider, seriesId: current.seriesId, episodeId: current.firstEpisodeId }}
                      className="inline-flex h-12 items-center rounded-full bg-primary px-5 font-semibold text-primary-ink"
                    >
                      {t.play}
                    </Link>
                  ) : (
                    <Link
                      to="/drama/$provider/$seriesId"
                      params={{ provider: current.provider, seriesId: current.seriesId }}
                      className="inline-flex h-12 items-center rounded-full bg-primary px-5 font-semibold text-primary-ink"
                    >
                      {t.play}
                    </Link>
                  )}
                  <Link
                    to="/drama/$provider/$seriesId"
                    params={{ provider: current.provider, seriesId: current.seriesId }}
                    className="inline-flex h-12 items-center rounded-full bg-player-ink px-5 font-semibold text-ink"
                  >
                    {t.details}
                  </Link>
                </div>
              </div>
            </div>
            <div className="hidden flex-col gap-2 p-4 lg:flex">
              {hero.map((item, index) => (
                <button
                  key={`${item.provider}-${item.seriesId}`}
                  type="button"
                  onClick={() => setSlide(index)}
                  className={`flex items-center gap-3 rounded-2xl p-2 text-left ${index === slide ? "bg-bg" : "hover:bg-bg/70"}`}
                >
                  <span className="h-16 w-12 overflow-hidden rounded-lg">
                    <Poster src={item.posterUrl} alt="" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{pickTitle(item, contentLang)}</span>
                    <span className="text-xs text-muted">{item.tags[0] || item.provider}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-2 py-3 lg:hidden">
            {hero.map((item, index) => (
              <button
                key={`${item.provider}-${item.seriesId}-dot`}
                type="button"
                aria-label={`Show ${pickTitle(item, contentLang)}`}
                onClick={() => setSlide(index)}
                className={`h-2.5 rounded-full ${index === slide ? "w-6 bg-primary" : "w-2.5 bg-line"}`}
              />
            ))}
          </div>
        </section>
      ) : (
        <ErrorNote message={t.catalogsEmpty} />
      )}

      {history.length ? (
        <section className="mt-8">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-2xl">{t.continue}</h2>
            <Link to="/history" className="text-sm font-semibold text-primary">
              {t.viewAll}
            </Link>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
            {history.slice(0, 12).map((item) => (
              <Link
                key={`${item.provider}-${item.seriesId}`}
                to="/watch/$provider/$seriesId/$episodeId"
                params={{ provider: item.provider, seriesId: item.seriesId, episodeId: item.episodeId }}
                className="w-36 shrink-0 sm:w-44"
              >
                <div className="aspect-poster overflow-hidden rounded-card">
                  <Poster src={item.posterUrl} alt={item.title} />
                </div>
                <h3 className="mt-2 line-clamp-2 text-sm font-semibold">{showTitle(item.title, item.originalTitle)}</h3>
                <p className="text-xs text-muted">{item.episodeLabel}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {data.sections
        .filter((section) => section.id !== "featured")
        .map((section) => (
          <Rail key={section.id} title={railTitle(uiLang, section.id, section.title)} items={section.items} more={<SectionLink id={section.id} label={t.viewAll} />} />
        ))}
    </div>
  );
}

function SectionLink({ id, label }: { id: string; label: string }) {
  const className = "text-sm font-semibold text-primary";
  if (id === "trending") {
    return (
      <Link to="/trending" className={className}>
        {label}
      </Link>
    );
  }
  if (id === "latest" || id === "new") {
    return (
      <Link to="/latest" className={className}>
        {label}
      </Link>
    );
  }
  if (isProviderId(id)) {
    return (
      <Link to="/provider/$provider" params={{ provider: id }} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <Link to="/discover" search={{ rail: id }} className={className}>
      {label}
    </Link>
  );
}
