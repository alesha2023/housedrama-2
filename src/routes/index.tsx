import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { useEffect, useState } from "react";
import { ErrorNote, PageSkeleton, Poster, ProviderBadge, Rail, TagPills, byPopularity } from "@/components/drama/cards";
import { SeoItemList } from "@/components/drama/seo-item-list";
import { ProviderPicker } from "@/components/drama/provider-picker";
import { getHomeData } from "@/lib/drama/api";
import { railTitle, usePrefs } from "@/lib/drama/i18n";
import { pickDescription, pickTitle, useDisplayTitles } from "@/lib/drama/display";
import { readHistory } from "@/lib/drama/storage";
import { isProviderId, type HomePayload, type ProviderId } from "@/lib/drama/types";
import { maybeOpenMonetagAd } from "@/lib/drama/monetag";
import { absoluteSiteUrl, pageSeo } from "@/lib/drama/site";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { provider?: ProviderId } => ({
    ...(typeof search.provider === "string" && isProviderId(search.provider) ? { provider: search.provider } : {}),
  }),
  loaderDeps: ({ search }): { provider: "all" | ProviderId } => ({ provider: search.provider ?? "all" }),
  loader: ({ deps }) => getHomeData({ data: { lang: "en", provider: deps.provider } }),
  pendingComponent: PageSkeleton,
  head: ({ match }) => pageSeo({
    title: "HouseDrama — Watch Chinese & Asian Short Dramas Online",
    description: "Watch Chinese and Asian short dramas online on HouseDrama. Discover trending romance, CEO, revenge, fantasy, and new episodes from multiple drama providers.",
    path: "/",
    robots: match.search.provider ? "noindex,follow" : "index,follow,max-image-preview:large",
    extraLinks: [
      { rel: "alternate", hrefLang: "en", href: absoluteSiteUrl("/") },
      { rel: "alternate", hrefLang: "id", href: absoluteSiteUrl("/id") },
      { rel: "alternate", hrefLang: "x-default", href: absoluteSiteUrl("/") },
    ],
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
  const [houseTrending, setHouseTrending] = useState<import("@/lib/drama/types").DramaCard[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/drama-trending", { headers: { accept: "application/json" }, cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Trending unavailable")))
      .then((payload: { items?: import("@/lib/drama/types").DramaCard[] }) => {
        if (active && Array.isArray(payload.items)) setHouseTrending(payload.items);
      })
      .catch(() => { if (active) setHouseTrending([]); });
    return () => { active = false; };
  }, []);

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
  const seoItems = [...data.hero, ...data.sections.flatMap((section) => section.items)];

  return (
    <div>
      <SeoItemList items={seoItems} name="Chinese and Asian Short Dramas on HouseDrama" />
      {down.length ? <ErrorNote message={`${t.providersDown} (${down.map((item) => item.id).join(", ")})`} /> : null}
      <div className="mb-4">
        <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
          <span className="h-4 w-1 rounded-full bg-coral" aria-hidden="true" />
          {t.providerLabel}
        </p>
        <ProviderPicker
          value={search.provider ?? "all"}
          onChange={(value) => {
            void navigate({ to: "/", search: value === "all" ? {} : { provider: value } });
          }}
          className="w-full max-w-md"
        />
      </div>
      {current ? (
        <section className="hd-hero relative -mx-4 overflow-hidden bg-[#07080b] shadow-[0_24px_70px_rgb(0_0_0_/_0.35)] sm:mx-0 sm:rounded-[1.75rem]">
          <div className="grid lg:grid-cols-[1.3fr_0.7fr]">
            <div className="relative aspect-[4/5] overflow-hidden min-[480px]:aspect-[16/10] lg:aspect-auto lg:min-h-[32rem]">
              <div
                className="flex h-full transition-transform duration-700 ease-out"
                style={{ width: `${hero.length * 100}%`, transform: `translateX(-${(slide % Math.max(hero.length, 1)) * (100 / Math.max(hero.length, 1))}%)` }}
              >
                {hero.map((item, index) => (
                  <div key={`${item.provider}-${item.seriesId}`} className="relative h-full shrink-0" style={{ width: `${100 / Math.max(hero.length, 1)}%` }}>
                    <Poster src={item.bannerUrl || item.posterUrl} alt={pickTitle(item, contentLang)} priority className="absolute inset-0 h-full w-full" />
                    <div className="hd-hero__shade absolute inset-0" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-5 pb-8 text-white sm:p-8 lg:p-10">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <ProviderBadge provider={item.provider} />
                        {item.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full bg-white/15 px-2 py-0.5 text-xs">{tag}</span>
                        ))}
                      </div>
                      <p className="hd-kicker mb-2 text-xs font-semibold tracking-[0.18em] text-white/75 uppercase">{uiLang === "id" ? "Unggulan" : uiLang === "ms" ? "Pilihan" : uiLang === "th" ? "แนะนำ" : "Featured"}</p>
                      {index === slide ? (
                        <h1 className="hd-hero__title max-w-2xl text-[1.85rem] leading-[1.08] sm:text-5xl">{pickTitle(item, contentLang)}</h1>
                      ) : (
                        <p className="hd-hero__title max-w-2xl text-[1.85rem] leading-[1.08] sm:text-5xl">{pickTitle(item, contentLang)}</p>
                      )}
                      <p className="mt-3 line-clamp-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-[15px]">{pickDescription(item, contentLang) || t.heroFallback}</p>
                      <div className="pointer-events-auto mt-5 flex flex-wrap gap-2">
                        {item.firstEpisodeId ? (
                          <Link
                            to="/watch/$provider/$seriesId/$episodeId"
                            params={{ provider: item.provider, seriesId: item.seriesId, episodeId: item.firstEpisodeId }}
                            onClick={() => maybeOpenMonetagAd()}
                            search={{ auto: true }}
                            className="inline-flex h-12 min-h-12 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-ink shadow-[0_10px_24px_rgb(255_45_141_/_0.22)]"
                          >
                            <Play className="size-4 fill-current" />
                            {t.play}
                          </Link>
                        ) : (
                          <Link
                            to="/drama/$provider/$seriesId"
                            params={{ provider: item.provider, seriesId: item.seriesId }}
                            className="inline-flex h-12 min-h-12 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-ink shadow-[0_10px_24px_rgb(255_45_141_/_0.22)]"
                          >
                            <Play className="size-4 fill-current" />
                            {t.play}
                          </Link>
                        )}
                        <Link
                          to="/drama/$provider/$seriesId"
                          params={{ provider: item.provider, seriesId: item.seriesId }}
                          className="inline-flex h-12 min-h-12 items-center rounded-full border border-white/25 bg-white/10 px-5 font-semibold text-white backdrop-blur-sm"
                        >
                          {t.details}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hd-hero__rail hidden flex-col gap-1.5 p-4 text-white lg:flex">
              {hero.map((item, index) => (
                <button
                  key={`${item.provider}-${item.seriesId}`}
                  type="button"
                  onClick={() => setSlide(index)}
                  className={`hd-hero__pick flex min-h-11 items-center gap-3 rounded-2xl p-2 text-left ${index === slide ? "is-active" : ""}`}
                >
                  <span className="h-16 w-12 overflow-hidden rounded-lg">
                    <Poster src={item.posterUrl} alt={pickTitle(item, contentLang)} />
                  </span>
                  <span>
                    <span className="block line-clamp-2 text-sm font-semibold text-white">{pickTitle(item, contentLang)}</span>
                    <span className="text-xs text-white/60">{item.tags[0] || item.provider}</span>
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

      <div className="hd-chips no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1">
        {(["romance", "revenge", "billionaire", "ceo", "fantasy", "historical", "completed"] as const).map((id) => (
          <Link
            key={id}
            to="/discover"
            search={{ rail: id }}
            className="hd-chip shrink-0 rounded-full px-3.5 py-2 text-sm font-medium"
          >
            {railTitle(uiLang, id, id)}
          </Link>
        ))}
      </div>

      {history.length ? (
        <section className="hd-rail mt-8">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-semibold tracking-tight">{t.continue}</h2>
            <Link to="/history" className="text-sm font-semibold text-primary">
              {t.viewAll}
            </Link>
          </div>
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
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
                className="drama-card shrink-0 snap-start"
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

      {houseTrending.length ? <Rail title={({ en: "Trending on HouseDrama · Most watched", id: "Trending di HouseDrama · Paling banyak ditonton", hi: "HouseDrama पर ट्रेंडिंग · सबसे ज़्यादा देखे गए", fil: "Trending sa HouseDrama · Pinakamaraming pinanood", ms: "Trending di HouseDrama · Paling banyak ditonton", th: "กำลังมาแรงบน HouseDrama · รับชมมากที่สุด" } as const)[uiLang]} items={houseTrending} more={<Link to="/trending" className="text-sm font-semibold text-primary">{t.viewAll}</Link>} /> : null}
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
