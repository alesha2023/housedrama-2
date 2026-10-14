import type {
  BrowsePayload,
  CatalogSection,
  DetailPayload,
  DramaCard,
  HomePayload,
  ProviderId,
  ProviderStatus,
  SearchPayload,
  StreamPayload,
} from "../types";
import { PROVIDERS, dramaKey, isProviderId } from "../types";
import { anyreelDetail, anyreelHome, anyreelRank, anyreelSearch, anyreelSearchHome, anyreelShorts, anyreelSimilar, anyreelStream } from "./anyreel";
import { dramaboxDetail, dramaboxHome, dramaboxLatest, dramaboxRank, dramaboxSearch, dramaboxStream } from "./dramabox";
import { freereelsChannel, freereelsChannels, freereelsDetail, freereelsForYou, freereelsSearch, freereelsStream } from "./freereels";
import { providerFetch, withFetchBudget } from "./http";
import { providerEnabled, sectionEnabled } from "./metrics";
import { englishQueriesFor, localizeCards, localizeEpisodes, localizeTexts } from "./localize";
import { genericBrowse, genericDetail, genericSearch, genericStream } from "./generic";
import { isCoreProvider, isProviderHidden, providerLabel, visibleProviders } from "../providers";

const GENRES: { id: string; title: string; test: RegExp }[] = [
  { id: "romance", title: "Romance", test: /romance|cinta|love|asmara|爱情|恋爱/i },
  { id: "revenge", title: "Revenge", test: /revenge|dendam|balas|复仇|报复|counterattack|serangan/i },
  { id: "billionaire", title: "Billionaire Romance", test: /billionaire|miliarder|tycoon|taipan|富豪|亿万|heir|pewaris/i },
  { id: "ceo", title: "CEO Romance", test: /\bceo\b|总裁|konglomerat|boss/i },
  { id: "historical", title: "Historical Drama", test: /historical|palace|dynasty|kerajaan|古装|宫廷|emperor|kaisar/i },
  { id: "fantasy", title: "Fantasy", test: /fantasy|werewolf|lycan|vampire|naga|奇幻|仙侠|magic|supernatural/i },
  { id: "family", title: "Family Drama", test: /family|keluarga|家庭|ibu|parent/i },
  { id: "comedy", title: "Comedy", test: /comedy|komedi|喜剧|funny|humor/i },
];

// Mix popular catalogues from several providers so the Popular rail is not
// dominated by a single source. The core providers are fetched separately.
const POPULAR_PROVIDER_IDS: ProviderId[] = [
  "goodshort",
  "netshort",
  "reelshort",
  "shortmax",
  "flextv",
  "dramawave",
  "melolo",
  "joyreels",
  "flickreels",
  "vigloo",
  "stardusttv",
  "shortical",
];

function mixSources(groups: DramaCard[][], limit: number, start = 0) {
  const lists = groups.map((items) => dedupe(items));
  const mixed: DramaCard[] = [];
  const seen = new Set<string>();
  const max = Math.max(0, ...lists.map((items) => items.length));
  for (let index = 0; index < max && mixed.length < limit; index += 1) {
    for (let offset = 0; offset < lists.length && mixed.length < limit; offset += 1) {
      const card = lists[(start + offset) % lists.length]?.[index];
      if (!card) continue;
      const key = dramaKey(card);
      if (seen.has(key)) continue;
      seen.add(key);
      mixed.push(card);
    }
  }
  return mixed;
}

function settledStatus(id: ProviderId, result: PromiseSettledResult<unknown>): ProviderStatus {
  if (!providerEnabled(id)) return { id, ok: false, error: "Disabled in admin" };
  if (result.status === "fulfilled") return { id, ok: true, error: null };
  const reason = result.reason;
  return { id, ok: false, error: reason instanceof Error ? reason.message : "Unavailable" };
}

function dedupe(items: DramaCard[]) {
  const seen = new Set<string>();
  const out: DramaCard[] = [];
  for (const item of items) {
    const key = dramaKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

async function localizeHome(payload: HomePayload, lang: string): Promise<HomePayload> {
  const heroKeys = new Set(payload.hero.map((item) => dramaKey(item)));
  const all = dedupe([...payload.hero, ...payload.sections.flatMap((item) => item.items)]);
  const localized = await localizeCards(all, lang, heroKeys);
  const byKey = new Map(localized.map((item) => [dramaKey(item), item]));
  return {
    ...payload,
    hero: payload.hero.map((card) => byKey.get(dramaKey(card)) ?? card),
    sections: payload.sections.map((item) => ({
      ...item,
      items: item.items.map((card) => byKey.get(dramaKey(card)) ?? card),
    })),
  };
}

async function searchProviders(
  q: string,
  lang: string,
  page: number,
  want: (id: ProviderId) => boolean,
) {
  const [ar, db, fr] = await Promise.all([
    want("anyreel") ? safe("anyreel", () => anyreelSearch(q, page), null) : Promise.resolve({ status: "fulfilled" as const, value: null }),
    want("dramabox") && page === 1 ? safe("dramabox", () => dramaboxSearch(q, lang), []) : Promise.resolve({ status: "fulfilled" as const, value: [] as DramaCard[] }),
    want("freereels") ? safe("freereels", () => freereelsSearch(q, lang, (page - 1) * 20), null) : Promise.resolve({ status: "fulfilled" as const, value: null }),
  ]);
  const extras = PROVIDERS.filter((id) => !isCoreProvider(id) && !isProviderHidden(id) && want(id));
  const extraResults = await Promise.all(extras.map((id) => safe(id, () => genericSearch(id, q, lang), [] as DramaCard[])));
  const items = dedupe([
    ...(ar.status === "fulfilled" && ar.value ? ar.value.items : []),
    ...(db.status === "fulfilled" ? db.value : []),
    ...(fr.status === "fulfilled" && fr.value ? fr.value.items : []),
    ...extraResults.flatMap((result) => (result.status === "fulfilled" ? result.value : [])),
  ]);
  const hasMore = Boolean(
    (ar.status === "fulfilled" && ar.value?.hasMore) || (fr.status === "fulfilled" && fr.value?.hasMore),
  );
  return {
    items,
    hasMore,
    providers: [
      settledStatus("anyreel", want("anyreel") ? ar : { status: "fulfilled", value: true }),
      settledStatus("dramabox", want("dramabox") ? db : { status: "fulfilled", value: true }),
      settledStatus("freereels", want("freereels") ? fr : { status: "fulfilled", value: true }),
      ...extras.map((id, index) => settledStatus(id, extraResults[index] ?? { status: "fulfilled", value: [] })),
    ].filter((item) => want(item.id)),
  };
}

function section(id: string, title: string, items: DramaCard[], limit = 18): CatalogSection | null {
  if (!sectionEnabled(id)) return null;
  const unique = dedupe(items).slice(0, limit);
  if (!unique.length) return null;
  return { id, title, items: unique };
}

async function fillHeroEpisodes(cards: DramaCard[], lang: string): Promise<DramaCard[]> {
  return Promise.all(
    cards.map(async (card) => {
      if (card.firstEpisodeId) return card;
      try {
        const detail = isCoreProvider(card.provider)
          ? card.provider === "anyreel"
            ? await anyreelDetail(card.seriesId)
            : card.provider === "dramabox"
              ? await dramaboxDetail(card.seriesId, lang)
              : await freereelsDetail(card.seriesId, lang)
          : await genericDetail(card.provider, card.seriesId, lang);
        const episodeId = detail.card?.firstEpisodeId ?? detail.episodes[0]?.episodeId ?? null;
        return episodeId ? { ...card, firstEpisodeId: episodeId } : card;
      } catch {
        return card;
      }
    }),
  );
}

function feedRank(name: string) {
  const label = name.toLowerCase();
  if (/dub|sulih|alih/.test(label)) return 0;
  if (/populer|popular|hot|tren|rank/.test(label)) return 1;
  if (/\bnew\b|baru|terbaru|latest/.test(label)) return 2;
  return 10;
}

function preferFeedChannels(channels: { key: string; name: string }[]) {
  const ranked = [...channels].sort((a, b) => feedRank(a.name) - feedRank(b.name));
  const picked = ranked.filter((channel) => feedRank(channel.name) < 10).slice(0, 3);
  return picked.length ? picked : channels.slice(0, 3);
}

function cardsFromChannel(result: PromiseSettledResult<{ name: string; items: DramaCard[] }[]>) {
  if (result.status !== "fulfilled") return [];
  return result.value.flatMap((block) => block.items);
}

function genreRails(items: DramaCard[]) {
  const rails: CatalogSection[] = [];
  for (const genre of GENRES) {
    const matched = items.filter((item) => {
      const haystack = `${item.title} ${item.tags.join(" ")} ${item.description ?? ""}`;
      return genre.test.test(haystack);
    });
    const rail = section(genre.id, genre.title, matched);
    if (rail && rail.items.length >= 4) rails.push(rail);
  }
  return rails;
}

function normTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/sulih suara|dubbed|dub\b/gi, " ")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .trim();
}

async function safe<T>(id: ProviderId, run: () => Promise<T>, fallback: T): Promise<PromiseSettledResult<T>> {
  if (!providerEnabled(id)) return { status: "rejected", reason: new Error("Disabled in admin") };
  try {
    return { status: "fulfilled", value: await run() };
  } catch (reason) {
    return { status: "rejected", reason };
  }
}

const homePayloadCache = new Map<string, { exp: number; data: HomePayload }>();

export async function loadHome(lang: string, provider: "all" | ProviderId = "all"): Promise<HomePayload> {
  const key = `${lang}:${provider}`;
  const hit = homePayloadCache.get(key);
  if (hit && hit.exp > Date.now()) return hit.data;
  // Stay under the preview gateway timeout. A slow catalog used to be cut off as a 502.
  const data = await withFetchBudget(4000, () => loadHomeWithinBudget(lang, provider));
  if (data.hero.length || data.sections.length) {
    homePayloadCache.set(key, { exp: Date.now() + 45_000, data });
  }
  return data;
}

async function loadHomeWithinBudget(lang: string, provider: "all" | ProviderId = "all"): Promise<HomePayload> {
  if (provider !== "all") {
    const browse = await loadBrowse({ lang, provider, page: 1 });
    const heroes = browse.items.slice(0, 4);
    const rail = section(provider, providerLabel(provider), browse.items);
    return {
      hero: heroes,
      sections: rail ? [rail] : [],
      providers: browse.providers,
      generatedAt: Date.now(),
    };
  }
  const popularProviderPromise = Promise.all(
    POPULAR_PROVIDER_IDS.map((id) => safe(id, () => genericBrowse(id, lang), [] as DramaCard[])),
  );
  const [arHome, arRank, arSearch, dbHome, dbLatest, dbRank, frChannels, frYou] = await Promise.all([
    safe("anyreel", () => anyreelHome(), null),
    safe("anyreel", () => anyreelRank(), []),
    safe("anyreel", () => anyreelSearchHome(), []),
    safe("dramabox", () => dramaboxHome(lang), null),
    safe("dramabox", () => dramaboxLatest(lang), []),
    safe("dramabox", () => dramaboxRank(lang), null),
    safe("freereels", () => freereelsChannels(lang), []),
    safe("freereels", () => freereelsForYou(lang, 0), null),
  ]);

  const channelPlan = frChannels.status === "fulfilled" ? preferFeedChannels(frChannels.value) : [];
  const channelResults = await Promise.all(
    channelPlan.map((channel) => safe("freereels", () => freereelsChannel(channel.key, lang), [])),
  );
  const popularProviderResults = await popularProviderPromise;

  const anyreelCards: DramaCard[] = [];
  const hero: DramaCard[] = [];
  if (arHome.status === "fulfilled" && arHome.value) {
    const byId = new Map<string, DramaCard>();
    for (const block of arHome.value.sections) {
      for (const item of block.items) byId.set(item.seriesId, item);
      anyreelCards.push(...block.items);
    }
    for (const banner of arHome.value.banners) {
      const record = banner as { seriesId?: unknown; coverImageUrl?: unknown; cornerMark?: unknown };
      const seriesId = typeof record.seriesId === "string" ? record.seriesId : "";
      const known = seriesId ? byId.get(seriesId) : undefined;
      if (known) {
        hero.push({
          ...known,
          bannerUrl: typeof record.coverImageUrl === "string" ? record.coverImageUrl : known.bannerUrl,
          badge: typeof record.cornerMark === "string" ? record.cornerMark : known.badge,
        });
      }
    }
  }
  if (arRank.status === "fulfilled") anyreelCards.push(...arRank.value);
  if (arSearch.status === "fulfilled") {
    for (const block of arSearch.value) anyreelCards.push(...block.items);
  }

  const dramaboxCards: DramaCard[] = [];
  if (dbHome.status === "fulfilled" && dbHome.value) {
    for (const column of dbHome.value.columns) dramaboxCards.push(...column.items);
    dramaboxCards.push(...dbHome.value.recommend);
    hero.push(...dbHome.value.banners);
  }
  if (dbLatest.status === "fulfilled") dramaboxCards.push(...dbLatest.value);
  if (dbRank.status === "fulfilled" && dbRank.value) dramaboxCards.push(...dbRank.value.items);

  const freereelsCards: DramaCard[] = [];
  const dubbedCards: DramaCard[] = [];
  const freshCards: DramaCard[] = [];
  const hotCards: DramaCard[] = [];
  channelPlan.forEach((channel, index) => {
    const cards = cardsFromChannel(channelResults[index]);
    freereelsCards.push(...cards);
    const rank = feedRank(channel.name);
    if (rank === 0) dubbedCards.push(...cards);
    else if (rank === 2) freshCards.push(...cards);
    else hotCards.push(...cards);
  });
  if (frYou.status === "fulfilled" && frYou.value) freereelsCards.push(...frYou.value.items);

  const missingHero = (arHome.status === "fulfilled" ? arHome.value?.banners.length ?? 0 : 0) - hero.filter((item) => item.provider === "anyreel").length;
  if (missingHero > 0 && arHome.status === "fulfilled" && arHome.value) {
    const known = new Set(hero.map((item) => item.seriesId));
    const lookups = arHome.value.banners
      .map((banner) => {
        const seriesId = typeof (banner as { seriesId?: unknown }).seriesId === "string"
          ? (banner as { seriesId: string }).seriesId
          : "";
        return seriesId;
      })
      .filter((id) => id && !known.has(id))
      .slice(0, 4);
    const details = await Promise.all(
      lookups.map((id) => safe("anyreel", () => anyreelDetail(id), null)),
    );
    details.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value?.card) {
        const banner = arHome.value?.banners.find((item) => (item as { seriesId?: string }).seriesId === lookups[index]);
        const cover = banner && typeof (banner as { coverImageUrl?: unknown }).coverImageUrl === "string"
          ? (banner as { coverImageUrl: string }).coverImageUrl
          : result.value.card.bannerUrl;
        hero.push({ ...result.value.card, bannerUrl: cover });
      }
    });
  }

  if (!hero.length) hero.push(...dedupe([...anyreelCards, ...dramaboxCards, ...freereelsCards]).slice(0, 5));

  const named = (name: string) => {
    if (arHome.status !== "fulfilled" || !arHome.value) return [];
    return arHome.value.sections.find((section) => section.name.toLowerCase().includes(name))?.items ?? [];
  };

  const meloloIndex = POPULAR_PROVIDER_IDS.indexOf("melolo");
  const meloloCards = meloloIndex >= 0 && popularProviderResults[meloloIndex]?.status === "fulfilled"
    ? popularProviderResults[meloloIndex].value
    : [];
  const forYou = frYou.status === "fulfilled" && frYou.value ? frYou.value.items : [];
  const trendingChina = dedupe([
    ...(arRank.status === "fulfilled" ? arRank.value : []),
    ...(dbRank.status === "fulfilled" && dbRank.value ? dbRank.value.items : []),
  ]);
  const latestChina = dedupe([
    ...(dbLatest.status === "fulfilled" ? dbLatest.value : []),
    ...named("new"),
  ]);
  const trendingFr = dedupe([...hotCards, ...forYou]);
  const latestFr = dedupe(freshCards);
  const latestKeys = new Set([...latestChina, ...latestFr].map((item) => dramaKey(item)));
  const notNew = (items: DramaCard[]) => items.filter((item) => !latestKeys.has(dramaKey(item)));
  const heroSeed = dedupe(hero);
  const heroes = await fillHeroEpisodes(
    mixSources([
      heroSeed.length ? heroSeed : trendingChina,
      notNew(meloloCards),
      notNew(trendingFr),
    ], 6),
    lang,
  );

  const sections = [
    section("featured", "Featured Dramas", heroes.length ? heroes : mixSources([trendingChina, notNew(meloloCards), notNew(trendingFr)], 12)),
    section("trending", "Trending Now", mixSources([notNew(trendingChina), notNew(trendingFr), notNew(meloloCards)], 48), 48),
    section("popular", "Most Popular", mixSources([notNew(meloloCards), notNew(hotCards), notNew(dubbedCards), notNew(trendingChina)], 48, 1), 48),
    section("latest", "Latest Episodes", mixSources([latestChina, latestFr], 48), 48),
    section("recommended", "Recommended for You", mixSources([
      dbHome.status === "fulfilled" && dbHome.value ? dbHome.value.recommend : [],
      notNew(forYou),
      notNew(meloloCards),
    ], 24)),
    ...genreRails(dedupe([...trendingChina, ...latestChina, ...meloloCards, ...freereelsCards])),
    section(
      "completed",
      "Completed Dramas",
      mixSources([
        trendingChina.filter((item) => item.completed === true),
        freereelsCards.filter((item) => item.completed === true),
        meloloCards.filter((item) => item.completed === true),
      ], 24),
    ),
  ].filter((item): item is CatalogSection => Boolean(item));

  return localizeHome(
    {
      hero: heroes,
      sections,
      providers: [
        settledStatus("anyreel", arHome.status === "fulfilled" || arRank.status === "fulfilled" ? { status: "fulfilled", value: true } : arHome),
        settledStatus("dramabox", dbHome.status === "fulfilled" || dbRank.status === "fulfilled" ? { status: "fulfilled", value: true } : dbHome),
        settledStatus(
          "freereels",
          frYou.status === "fulfilled" || channelResults.some((item) => item.status === "fulfilled")
            ? { status: "fulfilled", value: true }
            : frYou,
        ),
        ...POPULAR_PROVIDER_IDS.map((id, index) =>
          settledStatus(id, popularProviderResults[index] ?? { status: "fulfilled", value: [] }),
        ),
      ],
      generatedAt: Date.now(),
    },
    lang,
  );
}

export async function loadBrowse(input: {
  lang: string;
  provider: "all" | ProviderId;
  page: number;
  rail?: string | null;
}): Promise<BrowsePayload> {
  const page = Math.max(1, input.page || 1);
  const provider = input.provider;
  const tasks: Promise<DramaCard[]>[] = [];
  const statuses: Promise<ProviderStatus>[] = [];

  const track = async (id: ProviderId, run: () => Promise<DramaCard[]>) => {
    const result = await safe(id, run, [] as DramaCard[]);
    statuses.push(Promise.resolve(settledStatus(id, result)));
    return result.status === "fulfilled" ? result.value : [];
  };

  if (provider === "all" || provider === "anyreel") {
    tasks.push(
      track("anyreel", async () => {
        if (page === 1) {
          const [home, rank] = await Promise.all([anyreelHome(), anyreelRank()]);
          return dedupe([...home.sections.flatMap((item) => item.items), ...rank]);
        }
        const shorts = await anyreelShorts(page - 1);
        return shorts.items;
      }),
    );
  }
  if (provider === "all" || provider === "dramabox") {
    tasks.push(
      track("dramabox", async () => {
        if (page > 1) return [];
        const [home, latest, rank] = await Promise.all([
          dramaboxHome(input.lang),
          dramaboxLatest(input.lang),
          dramaboxRank(input.lang),
        ]);
        return dedupe([...home.columns.flatMap((item) => item.items), ...home.recommend, ...latest, ...rank.items]);
      }),
    );
  }
  if (provider === "all" || provider === "freereels") {
    tasks.push(
      track("freereels", async () => {
        if (page === 1) {
          const channels = await freereelsChannels(input.lang);
          const blocks = await Promise.all(channels.slice(0, 4).map((channel) => freereelsChannel(channel.key, input.lang)));
          const you = await freereelsForYou(input.lang, 0);
          return dedupe([...blocks.flatMap((block) => block.flatMap((item) => item.items)), ...you.items]);
        }
        const you = await freereelsForYou(input.lang, (page - 1) * 10);
        return you.items;
      }),
    );
  }
  if (provider !== "all" && !isCoreProvider(provider)) {
    tasks.push(track(provider, () => genericBrowse(provider, input.lang)));
  }

  const groups = await Promise.all(tasks);
  let items = provider === "all"
    ? mixSources(groups, 60)
    : dedupe(groups.flat());
  if (input.rail) {
    const genre = GENRES.find((item) => item.id === input.rail);
    if (genre) items = items.filter((item) => genre.test.test(`${item.title} ${item.tags.join(" ")} ${item.description ?? ""}`));
    if (input.rail === "completed") items = items.filter((item) => item.completed === true);
    if (isProviderId(input.rail)) items = items.filter((item) => item.provider === input.rail);
  }
  const providers = await Promise.all(statuses);
  const generic = provider !== "all" && !isCoreProvider(provider);
  const hasMore = generic ? false : provider === "dramabox" ? false : items.length > 0 && page < 8;
  const title = provider === "all" ? "Discover" : providerLabel(provider);
  return { title, items: await localizeCards(items, input.lang, false), providers, page, hasMore };
}

export async function loadSearch(input: {
  q: string;
  lang: string;
  provider: "all" | ProviderId;
  page: number;
}): Promise<SearchPayload> {
  const q = input.q.trim();
  const page = Math.max(1, input.page || 1);
  if (!q) {
    const home = await safe("anyreel", () => anyreelSearchHome(), []);
    const suggestions =
      home.status === "fulfilled"
        ? await localizeTexts(home.value.flatMap((section) => section.items.map((item) => item.title)).slice(0, 10), input.lang)
        : [];
    return {
      items: home.status === "fulfilled" ? await localizeCards(dedupe(home.value.flatMap((section) => section.items)).slice(0, 18), input.lang, false) : [],
      suggestions,
      providers: [settledStatus("anyreel", home)],
      page: 1,
      hasMore: false,
    };
  }

  const want = (id: ProviderId) => (input.provider === "all" ? isCoreProvider(id) : input.provider === id);
  const queries = [q, ...englishQueriesFor(q).filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, 2);
  const pages = await Promise.all(queries.map((query, index) => searchProviders(query, input.lang, index === 0 ? page : 1, want)));
  const items = dedupe(pages.flatMap((result) => result.items));
  const localizedItems = await localizeCards(items, input.lang, false);
  // Provider search endpoints can sometimes return trending/recommended items unrelated to the query.
  // Keep only titles with meaningful overlap so unrelated dramas are not presented as search matches.
  const normalizedQuery = normTitle(q);
  const queryTokens = [...new Set(normalizedQuery.split(/\s+/).filter((token) => token.length >= 2))];

  // Accept partial title matches such as "cara agar" for
  // "Cara Agar Tidak Jatuh Cinta", including small word-prefix differences.
  // Keep unrelated trending recommendations out of search results.
  const scoredItems = localizedItems.flatMap((item) => {
    const titleVariants = [...new Set([
      normTitle(item.originalTitle || ""),
      normTitle(item.title || ""),
      normTitle(item.displayTitle || ""),
      normTitle(item.description || ""),
      normTitle(item.originalDescription || ""),
      normTitle(item.displayDescription || ""),
    ].filter(Boolean))];
    if (!titleVariants.length || !normalizedQuery) return [];
    let bestScore = 0;
    let bestMatches = 0;
    for (const title of titleVariants) {
      if (title.includes(normalizedQuery) || normalizedQuery.includes(title)) {
        bestScore = Math.max(bestScore, 100 + normalizedQuery.length);
        bestMatches = queryTokens.length;
        continue;
      }
      const titleTokens = title.split(/\s+/).filter((token) => token.length >= 2);
      const matches = queryTokens.filter((queryToken) =>
        titleTokens.some((titleToken) =>
          titleToken === queryToken ||
          (queryToken.length >= 3 && titleToken.startsWith(queryToken)) ||
          (titleToken.length >= 3 && queryToken.startsWith(titleToken)),
        ),
      ).length;
      const score = matches * 10 + (matches / Math.max(1, queryTokens.length));
      if (score > bestScore) {
        bestScore = score;
        bestMatches = matches;
      }
    }
    const minimumMatches = queryTokens.length <= 2 ? 1 : Math.max(2, Math.ceil(queryTokens.length * 0.35));
    return bestMatches >= minimumMatches ? [{ item, score: bestScore }] : [];
  });
  let matchedItems = scoredItems
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);

  // Search endpoints can miss titles that are already present in a provider's
  // browse catalogue. When endpoint matching returns nothing, search the
  // selected provider catalogue as a fallback instead of immediately showing
  // an empty state.
  if (!matchedItems.length && page === 1) {
    try {
      const browse = await loadBrowse({ lang: input.lang, provider: input.provider, page: 1 });
      const fallbackCards = await localizeCards(dedupe(browse.items), input.lang, false);
      const fallbackMatches = fallbackCards.flatMap((item) => {
        const variants = [...new Set([
          normTitle(item.originalTitle || ""),
          normTitle(item.title || ""),
          normTitle(item.displayTitle || ""),
          normTitle(item.description || ""),
          normTitle(item.originalDescription || ""),
          normTitle(item.displayDescription || ""),
        ].filter(Boolean))];
        let score = 0;
        let count = 0;
        for (const title of variants) {
          if (!title || !normalizedQuery) continue;
          if (title.includes(normalizedQuery) || normalizedQuery.includes(title)) {
            score = Math.max(score, 100 + normalizedQuery.length);
            count = queryTokens.length;
            continue;
          }
          const tokens = title.split(/\s+/).filter((token) => token.length >= 2);
          const matches = queryTokens.filter((qt) => tokens.some((tt) =>
            tt === qt || (qt.length >= 3 && tt.startsWith(qt)) || (tt.length >= 3 && qt.startsWith(tt)),
          )).length;
          if (matches > count) {
            count = matches;
            score = matches * 10 + matches / Math.max(1, queryTokens.length);
          }
        }
        const minimum = queryTokens.length <= 2 ? 1 : Math.max(2, Math.ceil(queryTokens.length * 0.35));
        return count >= minimum ? [{ item, score }] : [];
      });
      matchedItems = fallbackMatches.sort((a, b) => b.score - a.score).map(({ item }) => item);
    } catch {
      // Preserve normal search behavior if catalogue fallback is unavailable.
    }
  }
  const hasMore = pages.some((result) => result.hasMore) && matchedItems.length > 0;
  // Return title suggestions for the autocomplete UI as well as full results.
  // Suggestions are drawn only from matched catalog results, not invented titles.
  const suggestions = page === 1
    ? [...new Set(matchedItems.slice(0, 8).map((item) => (item.displayTitle || item.title || "").trim()).filter(Boolean))]
    : [];
  return {
    items: matchedItems,
    suggestions,
    providers: pages[0]?.providers ?? [],
    page,
    hasMore,
  };
}

export async function loadShorts(page: number, lang: string): Promise<BrowsePayload> {
  const ids = visibleProviders().filter((id) => providerEnabled(id));
  const groups = await Promise.all(
    ids.map(async (id) => {
      const cards = await Promise.race<DramaCard[]>([
        shortsFrom(id, page, lang).catch(() => []),
        new Promise<DramaCard[]>((resolve) => setTimeout(() => resolve([]), 4500)),
      ]);
      return dedupe(cards).slice(0, 4);
    }),
  );
  const items = mixSources(groups, 72);
  return {
    title: "Shorts",
    items: await localizeCards(items, lang, false),
    providers: ids.map((id) => ({ id, ok: groups[ids.indexOf(id)]?.length > 0, error: null })),
    page,
    hasMore: page < 4,
  };
}

async function shortsFrom(id: ProviderId, page: number, lang: string): Promise<DramaCard[]> {
  if (id === "anyreel") {
    const shorts = await anyreelShorts(page);
    return shorts.items;
  }
  if (id === "freereels") {
    const you = await freereelsForYou(lang, Math.max(0, page - 1));
    return you.items;
  }
  if (id === "dramabox") {
    if (page > 1) return [];
    const home = await dramaboxHome(lang);
    return [...home.columns.flatMap((item) => item.items), ...home.recommend];
  }
  if (page > 1) return [];
  return genericBrowse(id, lang);
}

export async function loadDetail(provider: ProviderId, seriesId: string, lang: string): Promise<DetailPayload> {
  if (!isCoreProvider(provider)) {
    try {
      const raw = await genericDetail(provider, seriesId, lang);
      if (!raw.card) {
        return { ok: false, error: "This drama could not be found.", drama: null, episodes: [], similar: [], more: [], alsoOn: [] };
      }
      const [dramaList, episodes, relatedResult] = await Promise.all([
        localizeCards([raw.card], lang, true),
        localizeEpisodes(raw.episodes, lang),
        genericBrowse(provider, lang).catch(() => [] as DramaCard[]),
      ]);
      const current = dramaList[0] ?? null;
      const currentTags = new Set((current?.tags ?? []).map((tag) => normTitle(tag)).filter(Boolean));
      const related = dedupe(relatedResult)
        .filter((item) => dramaKey(item) !== dramaKey(raw.card!))
        .map((item) => ({
          item,
          score: (item.tags ?? []).reduce((score, tag) => score + (currentTags.has(normTitle(tag)) ? 2 : 0), 0)
            + (normTitle(item.title).split(/\s+/).some((word) => normTitle(current?.title ?? "").includes(word) && word.length > 3) ? 1 : 0),
        }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 12)
        .map((entry) => entry.item);
      return { ok: true, error: null, drama: current, episodes, similar: await localizeCards(related, lang, false), more: [], alsoOn: [] };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "The provider did not return this drama.",
        drama: null,
        episodes: [],
        similar: [],
        more: [],
        alsoOn: [],
      };
    }
  }
  try {
    const detail =
      provider === "anyreel"
        ? await anyreelDetail(seriesId)
        : provider === "dramabox"
          ? await dramaboxDetail(seriesId, lang)
          : await freereelsDetail(seriesId, lang);
    if (!detail.card) {
      return { ok: false, error: "This drama could not be found.", drama: null, episodes: [], similar: [], more: [], alsoOn: [] };
    }
    const dramaPromise = localizeCards([detail.card], lang, true);
    const episodePromise = localizeEpisodes(detail.episodes, lang);
    const [similar, more, also, dramaList, episodes] = await Promise.all([
      provider === "anyreel" ? anyreelSimilar(seriesId).catch(() => [] as DramaCard[]) : Promise.resolve([] as DramaCard[]),
      loadBrowse({ lang, provider, page: 1 })
        .then((browse) => browse.items.filter((item) => item.seriesId !== seriesId).slice(0, 12))
        .catch(() => [] as DramaCard[]),
      findAlsoOn(detail.card, lang),
      dramaPromise,
      episodePromise,
    ]);
    const [similarLocalized, alsoLocalized] = await Promise.all([
      localizeCards(
        similar.filter((item) => item.seriesId !== seriesId).slice(0, 12),
        lang,
        false,
      ),
      localizeCards(also, lang, false),
    ]);
    return {
      ok: true,
      error: null,
      drama: dramaList[0] ?? null,
      episodes,
      similar: similarLocalized,
      more,
      alsoOn: alsoLocalized,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "The provider did not return this drama.",
      drama: null,
      episodes: [],
      similar: [],
      more: [],
      alsoOn: [],
    };
  }
}

async function findAlsoOn(card: DramaCard, lang: string) {
  const query = (card.originalTitle || card.title).replace(/\(.*?\)/g, " ").trim().slice(0, 48);
  if (query.length < 4) return [];
  const others = (["anyreel", "dramabox", "freereels"] as const).filter((id) => id !== card.provider);
  const target = normTitle(card.originalTitle || card.title);
  const results = await Promise.all(
    others.map(async (id) => {
      try {
        if (id === "anyreel") return (await anyreelSearch(query, 1)).items;
        if (id === "dramabox") return await dramaboxSearch(query, lang);
        return (await freereelsSearch(query, lang, 0)).items;
      } catch {
        return [];
      }
    }),
  );
  return dedupe(results.flat()).filter((item) => {
    const title = normTitle(item.title);
    if (!title || !target) return false;
    return title === target || title.includes(target) || target.includes(title);
  }).slice(0, 4);
}

export async function loadPlayback(
  provider: ProviderId,
  seriesId: string,
  episodeId: string,
  lang: string,
): Promise<{ detail: DetailPayload; stream: StreamPayload }> {
  const streamPromise = loadStream(provider, seriesId, episodeId, lang);
  try {
    const raw = isCoreProvider(provider)
      ? provider === "anyreel"
        ? await anyreelDetail(seriesId)
        : provider === "dramabox"
          ? await dramaboxDetail(seriesId, lang)
          : await freereelsDetail(seriesId, lang)
      : await genericDetail(provider, seriesId, lang);
    const [stream, dramaList, episodes] = await Promise.all([
      streamPromise,
      raw.card ? localizeCards([raw.card], lang, true) : Promise.resolve([]),
      localizeEpisodes(raw.episodes, lang),
    ]);
    if (!raw.card) {
      return {
        detail: { ok: false, error: "This drama could not be found.", drama: null, episodes: [], similar: [], more: [], alsoOn: [] },
        stream,
      };
    }
    return {
      detail: { ok: true, error: null, drama: dramaList[0] ?? null, episodes, similar: [], more: [], alsoOn: [] },
      stream,
    };
  } catch (error) {
    return {
      detail: {
        ok: false,
        error: error instanceof Error ? error.message : "The provider did not return this drama.",
        drama: null,
        episodes: [],
        similar: [],
        more: [],
        alsoOn: [],
      },
      stream: await streamPromise,
    };
  }
}

export async function loadStream(
  provider: ProviderId,
  seriesId: string,
  episodeId: string,
  lang: string,
): Promise<StreamPayload> {
  try {
    if (provider === "anyreel") {
      const candidates = await anyreelStream(seriesId, episodeId);
      return {
        ok: candidates.length > 0,
        provider,
        seriesId,
        episodeId,
        candidates,
        message: candidates.length ? null : "AnyReel did not return a playable stream for this episode.",
      };
    }
    if (provider === "dramabox") {
      const candidates = await dramaboxStream(seriesId, episodeId, lang);
      return {
        ok: candidates.length > 0,
        provider,
        seriesId,
        episodeId,
        candidates,
        message: candidates.length
          ? null
          : "DramaBox did not return a playable stream. The episode may require access this catalog cannot provide.",
      };
    }
    if (provider === "freereels") {
      const result = await freereelsStream(seriesId, episodeId, lang);
      return {
        ok: result.candidates.length > 0,
        provider,
        seriesId,
        episodeId,
        candidates: result.candidates,
        message: result.candidates.length
          ? null
          : result.blocked
            ? "FreeReels did not unlock a stream for this episode."
            : "FreeReels did not return a playable stream for this episode.",
      };
    }
    const candidates = await genericStream(provider, seriesId, episodeId, lang);
    return {
      ok: candidates.length > 0,
      provider,
      seriesId,
      episodeId,
      candidates,
      message: candidates.length ? null : "This provider did not return a playable stream for this episode.",
    };
  } catch (error) {
    return {
      ok: false,
      provider,
      seriesId,
      episodeId,
      candidates: [],
      message: error instanceof Error ? error.message : "The stream request failed.",
    };
  }
}

export async function pingProviders() {
  const checks = await Promise.all(
    PROVIDERS.filter((id) => !isProviderHidden(id)).map(async (id) => {
      const path = id === "freereels" ? "/health" : "/health";
      try {
        const body = await providerFetch<Record<string, unknown>>(id, path, { cacheTtl: 15_000, timeout: 8000 });
        const ok = body.ok === true || body.success === true || body.status === "ok";
        return { id, ok, error: ok ? null : "Health check did not report ok" };
      } catch (error) {
        return { id, ok: false, error: error instanceof Error ? error.message : "Health check failed" };
      }
    }),
  );
  return checks;
}
