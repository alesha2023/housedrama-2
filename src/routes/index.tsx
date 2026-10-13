import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { useEffect, useState } from "react";
import { ErrorNote, PageSkeleton, Poster, ProviderBadge, Rail, TagPills, byPopularity } from "@/components/drama/cards";
import { ProviderPicker } from "@/components/drama/provider-picker";
import { getHomeData } from "@/lib/drama/api";
import { railTitle, usePrefs } from "@/lib/drama/i18n";
import { pickDescription, pickTitle, useDisplayTitles } from "@/lib/drama/display";
import { readHistory } from "@/lib/drama/storage";
import { isProviderId, type HomePayload, type ProviderId } from "@/lib/drama/types";
import { maybeOpenMonetagAd } from "@/lib/drama/monetag";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { provider?: ProviderId } => ({
    ...(typeof search.provider === "string" && isProviderId(search.provider) ? { provider: search.provider } : {}),
  }),
  loaderDeps: ({ search }): { provider: "all" | ProviderId } => ({ provider: search.provider ?? "all" }),
  loader: ({ deps }) => getHomeData({ data: { lang: "id", provider: deps.provider } }),
  pendingComponent: PageSkeleton,
  head: () => ({
    meta: [
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { title: "HouseDrama — Nonton Drama China Pendek Subtitle Indonesia" },
      {
        name: "description",
        content:
          "Nonton drama China pendek subtitle Indonesia di HouseDrama. Jelajahi drama romantis, kisah CEO, drama terbaru, dan episode favoritmu.",
      },
      { property: "og:title", content: "HouseDrama — Nonton Drama China Pendek Subtitle Indonesia" },
      { property: "og:description", content: "Jelajahi drama China pendek subtitle Indonesia, kisah romantis, dan drama CEO di HouseDrama." },
      { property: "og:url", content: "https://house-drama.web.id/" },
      { property: "og:image", content: "https://house-drama.web.id/og.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://house-drama.web.id/" }],
  }),
  component: HomePage,
});

function HomePage() {
  const initial = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { t, contentLang, uiLang } = usePrefs();
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

  const hero = byPopularity(data.hero);
  const current = hero[slide] ?? hero[0];

  useEffect(() => {
    if (hero.length < 2) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setSlide((value) => (value + 1) % hero.length);
    }, 4000);
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
      <div className="mb-3">
        <p className="mb-2 text-sm font-semibold">{t.providerLabel}</p>
        <ProviderPicker
          value={search.provider ?? "all"}
          onChange={(value) => {
            void navigate({ to: "/", search: value === "all" ? {} : { provider: value } });
          }}
          className="max-w-xs"
        />
      </div>
      {current ? (
        <section className="relative overflow-hidden rounded-3xl bg-ink shadow-[0_16px_40px_rgb(17_18_22_/_0.12)]">
          <div className="grid lg:grid-cols-[1.3fr_0.7fr]">
            <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[16/9] lg:aspect-auto lg:min-h-[28rem]">
              <div
                className="flex h-full transition-transform duration-700 ease-out"
                style={{ width: `${hero.length * 100}%`, transform: `translateX(-${(slide % Math.max(hero.length, 1)) * (100 / Math.max(hero.length, 1))}%)` }}
              >
                {hero.map((item) => (
                  <div key={`${item.provider}-${item.seriesId}`} className="relative h-full shrink-0" style={{ width: `${100 / Math.max(hero.length, 1)}%` }}>
                    <Poster src={item.bannerUrl || item.posterUrl} alt="" priority className="absolute inset-0 h-full w-full" />
                    <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/45 to-ink/10" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-5 pb-8 text-white sm:p-8">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <ProviderBadge provider={item.provider} />
                        {item.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full bg-white/15 px-2 py-0.5 text-xs">{tag}</span>
                        ))}
                      </div>
                      <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-white/80 uppercase">{uiLang === "id" ? "Unggulan" : "Featured"}</p>
                      <h1 className="max-w-xl text-3xl sm:text-5xl">{pickTitle(item, contentLang)}</h1>
                      <p className="mt-3 max-w-xl line-clamp-3 text-sm text-white/85">{pickDescription(item, contentLang) || t.heroFallback}</p>
                      <div className="pointer-events-auto mt-5 flex flex-wrap gap-2">
                        {item.firstEpisodeId ? (
                          <Link
                            to="/watch/$provider/$seriesId/$episodeId"
                            params={{ provider: item.provider, seriesId: item.seriesId, episodeId: item.firstEpisodeId }}
                            onClick={() => maybeOpenMonetagAd()}
                            search={{ auto: true }}
                            className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-ink"
                          >
                            <Play className="size-4 fill-current" />
                            {t.play}
                          </Link>
                        ) : (
                          <Link
                            to="/drama/$provider/$seriesId"
                            params={{ provider: item.provider, seriesId: item.seriesId }}
                            className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-ink"
                          >
                            <Play className="size-4 fill-current" />
                            {t.play}
                          </Link>
                        )}
                        <Link
                          to="/drama/$provider/$seriesId"
                          params={{ provider: item.provider, seriesId: item.seriesId }}
                          className="inline-flex h-12 items-center rounded-full bg-white px-5 font-semibold text-ink"
                        >
                          {t.details}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden flex-col gap-2 bg-surface p-4 text-ink lg:flex">
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

      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
        {(["romance", "revenge", "billionaire", "ceo", "fantasy", "historical", "completed"] as const).map((id) => (
          <Link
            key={id}
            to="/discover"
            search={{ rail: id }}
            className="shrink-0 rounded-full bg-surface px-3.5 py-1.5 text-sm font-medium text-ink ring-1 ring-line"
          >
            {railTitle(uiLang, id, id)}
          </Link>
        ))}
      </div>

      {history.length ? (
        <section className="mt-8">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-semibold tracking-tight">{t.continue}</h2>
            <Link to="/history" className="text-sm font-semibold text-primary">
              {t.viewAll}
            </Link>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
            {history.slice(0, 12).map((item) => {
              const known = [...data.hero, ...data.sections.flatMap((section) => section.items)].find(
                (card) => card.provider === item.provider && card.seriesId === item.seriesId,
              );
              const tags = (item.tags?.length ? item.tags : known?.tags ?? []).slice(0, 2);
              return (
              <Link
                key={`${item.provider}-${item.seriesId}`}
                to="/watch/$provider/$seriesId/$episodeId"
                params={{ provider: item.provider, seriesId: item.seriesId, episodeId: item.episodeId }}
                onClick={() => maybeOpenMonetagAd()}
                search={{ auto: true }}
                className="w-36 shrink-0 sm:w-44"
              >
                <div className="relative aspect-poster overflow-hidden rounded-card">
                  <Poster src={item.posterUrl} alt={item.title} />
                  {item.durationSec ? (
                    <span className="absolute inset-x-0 bottom-0 h-1 bg-black/35">
                      <span
                        className="block h-full bg-primary"
                        style={{ width: `${Math.min(100, Math.max(4, (item.positionSec / item.durationSec) * 100))}%` }}
                      />
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-2 line-clamp-2 text-sm font-semibold">{showTitle(item.title, item.originalTitle)}</h3>
                <p className="text-xs text-muted">{item.episodeLabel}</p>
                <TagPills tags={tags} />
              </Link>
              );
            })}
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
