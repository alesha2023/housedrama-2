import type { DramaCard, Episode, StreamCandidate } from "../types";
import {
  absoluteUrl,
  asArray,
  asRecord,
  dbLang,
  enc,
  guessFormat,
  num,
  providerFetch,
  str,
  tagList,
  upgradeHttps,
} from "./http";

function mapCard(raw: unknown): DramaCard | null {
  const record = asRecord(raw);
  if (!record) return null;
  const seriesId = str(record.bookId) || str(record.id);
  const title = str(record.bookName) || str(record.name);
  if (!seriesId || !title) return null;
  const tags = tagList(record.tagV3s);
  const plainTags = tagList(record.tags);
  const corner = asRecord(record.corner);
  return {
    provider: "dramabox",
    seriesId,
    title,
    posterUrl: absoluteUrl(record.coverWap) || absoluteUrl(record.bookCover) || absoluteUrl(record.cover),
    bannerUrl: absoluteUrl(record.bookCover) || absoluteUrl(record.coverWap) || absoluteUrl(record.cover),
    description: str(record.introduction) || str(record.desc),
    tags: tags.length ? tags : plainTags,
    language: str(record.language),
    episodeCount: num(record.chapterCount) ?? num(record.totalEpisodes),
    completed: record.bookStatus === 1 ? true : record.bookStatus === 0 ? false : null,
    scoreLabel: str(record.rate),
    playCount: str(record.playCount),
    badge: str(corner?.name) || str(record.cornerMark),
    firstEpisodeId: null,
  };
}

function mapCards(list: unknown) {
  const cards: DramaCard[] = [];
  for (const item of asArray(list)) {
    const record = asRecord(item);
    const nested = asArray(asRecord(record?.tagCardVo)?.tagBooks);
    if (nested.length) {
      for (const book of nested) {
        const card = mapCard(book);
        if (card) cards.push(card);
      }
      continue;
    }
    const card = mapCard(item);
    if (card) cards.push(card);
  }
  return cards;
}

function langQuery(lang: string) {
  return `lang=${enc(dbLang(lang))}`;
}

export async function dramaboxHome(lang: string) {
  const payload = await providerFetch<Record<string, unknown>>(
    "dramabox",
    `/get-home?${langQuery(lang)}`,
    { cacheTtl: 90_000, cacheKey: `db-home:${lang}` },
  );
  const columns = asArray(payload.columnVoList).map((column) => {
    const record = asRecord(column);
    return {
      name: str(record?.title) || "DramaBox",
      items: mapCards(record?.bookList),
    };
  });
  return {
    columns,
    recommend: mapCards(asRecord(payload.recommendList)?.records),
    banners: mapCards(payload.bannerList),
  };
}

export async function dramaboxLatest(lang: string) {
  const payload = await providerFetch<Record<string, unknown>>(
    "dramabox",
    `/get-latest?${langQuery(lang)}`,
    { cacheTtl: 60_000, cacheKey: `db-latest:${lang}` },
  );
  return mapCards(asRecord(payload.newTheaterList)?.records);
}

export async function dramaboxRank(lang: string) {
  const payload = await providerFetch<Record<string, unknown>>(
    "dramabox",
    `/get-rank?${langQuery(lang)}`,
    { cacheTtl: 90_000, cacheKey: `db-rank:${lang}` },
  );
  return {
    items: mapCards(payload.rankList),
    tabs: asArray(payload.rankTypeVoList).flatMap((tab) => {
      const name = str(asRecord(tab)?.rankName);
      return name ? [name] : [];
    }),
  };
}

export async function dramaboxSearch(keyword: string, lang: string) {
  const payload = await providerFetch<Record<string, unknown>>(
    "dramabox",
    `/search/${enc(keyword)}?${langQuery(lang)}`,
    { cacheTtl: 45_000, cacheKey: `db-search:${lang}:${keyword}` },
  );
  return mapCards(payload.suggestList);
}

function alternateBookId(bookId: string): string | null {
  // Some imported DramaBox links contain one extra zero after the 420000 prefix.
  // Keep the public HouseDrama URL unchanged; use this only as an upstream fallback.
  if (/^4200000\d+$/.test(bookId)) return bookId.replace(/^4200000/, "420000");
  return null;
}

async function fetchDramaBoxDetail(bookId: string, lang: string) {
  return providerFetch<Record<string, unknown>>(
    "dramabox",
    `/get-detail/${enc(bookId)}?${langQuery(lang)}`,
    { cacheTtl: 120_000, cacheKey: `db-detail:${lang}:${bookId}` },
  );
}

export async function dramaboxDetail(bookId: string, lang: string) {
  let payload: Record<string, unknown> | null = null;
  try {
    payload = await fetchDramaBoxDetail(bookId, lang);
  } catch {
    // The alternate ID is tried below only for the known numeric ID pattern.
  }
  if (!payload || !mapCard(payload)) {
    const alternate = alternateBookId(bookId);
    if (!alternate) {
      if (!payload) throw new Error("DramaBox could not load this drama");
    } else {
      payload = await fetchDramaBoxDetail(alternate, lang);
    }
  }
  if (!payload) throw new Error("DramaBox could not load this drama");
  const card = mapCard(payload);
  if (card) card.seriesId = bookId; // preserve the existing public URL and canonical
  const episodes: Episode[] = asArray(payload.episodes).flatMap((item, index) => {
    const record = asRecord(item);
    if (!record) return [];
    const episodeId = str(record.chapterId);
    if (!episodeId) return [];
    const charged = record.isCharge === 1 || record.isPay === 1 || record.isCharge === true;
    return [
      {
        episodeId,
        index: (num(record.chapterIndex) ?? index) + 1,
        title: str(record.chapterName) || `Episode ${(num(record.chapterIndex) ?? index) + 1}`,
        coverUrl: null,
        durationSec: null,
        access: charged ? "limited" : "open",
      },
    ];
  });
  if (card && episodes[0] && !card.firstEpisodeId) card.firstEpisodeId = episodes[0].episodeId;
  return { card, episodes };
}

function pushCandidate(list: StreamCandidate[], url: unknown, quality: string | null) {
  const value = str(url);
  if (!value) return;
  const safe = upgradeHttps(value);
  if (list.some((item) => item.url === safe)) return;
  list.push({ url: safe, format: guessFormat(safe), quality, subtitles: [] });
}

export async function dramaboxStream(
  bookId: string,
  chapterId: string,
  lang: string,
): Promise<StreamCandidate[]> {
  const query = langQuery(lang);
  async function fetchStreams(id: string): Promise<Record<string, unknown>> {
    try {
      return await providerFetch<Record<string, unknown>>(
        "dramabox",
        `/get-all-streams-proxy/${enc(id)}?${query}`,
        { cacheTtl: 40_000, cacheKey: `db-proxy:${lang}:${id}` },
      );
    } catch {
      try {
        return await providerFetch<Record<string, unknown>>(
          "dramabox",
          `/get-all-streams/${enc(id)}?${query}`,
          { cacheTtl: 20_000, cacheKey: `db-all:${lang}:${id}` },
        );
      } catch {
        return providerFetch<Record<string, unknown>>(
          "dramabox",
          `/get-stream/${enc(id)}?${query}`,
          { cacheTtl: 15_000, cacheKey: `db-stream:${lang}:${id}` },
        );
      }
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = await fetchStreams(bookId);
  } catch (error) {
    const alternate = alternateBookId(bookId);
    if (!alternate) throw error;
    payload = await fetchStreams(alternate);
  }
  const episodes = asArray(payload?.episodes);
  const match =
    episodes.find((item) => str(asRecord(item)?.chapterId) === chapterId) ||
    episodes.find((item) => String((num(asRecord(item)?.chapterIndex) ?? -1) + 1) === chapterId);
  const record = asRecord(match);
  const candidates: StreamCandidate[] = [];
  const playUrls = asRecord(record?.playUrls) ?? {};
  for (const quality of ["720", "540", "1080"]) pushCandidate(candidates, playUrls[quality], quality);
  for (const rendition of asArray(record?.renditions)) {
    const item = asRecord(rendition);
    pushCandidate(candidates, item?.url, str(item?.quality));
  }
  if (!candidates.length) {
    try {
      const hls = await providerFetch<Record<string, unknown>>(
        "dramabox",
        `/get-hls/${enc(bookId)}/${enc(chapterId)}?${query}`,
        { cacheTtl: 15_000, cacheKey: `db-hls:${bookId}:${chapterId}` },
      );
      const direct = str(hls.url) || str(hls.hlsUrl) || str(hls.m3u8) || str(asRecord(hls.data)?.url);
      pushCandidate(candidates, direct, "hls");
      for (const item of asArray(hls.episodes ?? asRecord(hls.data)?.episodes)) {
        const episode = asRecord(item);
        if (str(episode?.chapterId) !== chapterId) continue;
        pushCandidate(candidates, episode?.url ?? episode?.hlsUrl, "hls");
      }
    } catch {
      /* HLS is optional; many titles return 404. */
    }
  }
  return candidates;
}
