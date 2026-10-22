import type { DramaCard, Episode, StreamCandidate } from "../types";
import {
  absoluteUrl,
  asArray,
  asRecord,
  enc,
  guessFormat,
  num,
  providerFetch,
  str,
  tagList,
  upgradeHttps,
} from "./http";

const POSTER_BASE = "https://anyoss.anyreel.app";

function mapCard(raw: unknown): DramaCard | null {
  const record = asRecord(raw);
  if (!record) return null;
  const seriesId = str(record.seriesId) || str(record.id);
  const title = str(record.name) || str(record.seriesName) || str(record.title);
  if (!seriesId || !title) return null;
  const episodes = asArray(record.episodes);
  const first = asRecord(episodes[0]);
  const firstEpisodeId = first
    ? str(first.episodeSort) || str(first.sort) || str(first.index) || str(first.id)
    : null;
  const completed =
    record.completionStatus === 1 ? true : record.completionStatus === 0 ? false : null;
  return {
    provider: "anyreel",
    seriesId,
    title,
    posterUrl: absoluteUrl(record.coverImageUrl) || absoluteUrl(record.coverImage, POSTER_BASE),
    bannerUrl:
      absoluteUrl(record.bannerImageUrl) ||
      absoluteUrl(record.livelyImageUrl) ||
      absoluteUrl(record.coverImageUrl) ||
      absoluteUrl(record.coverImage, POSTER_BASE),
    description: str(record.synopsis) || str(record.desc) || str(record.introduction),
    tags: tagList(record.tags ?? record.displayTags),
    language: str(record.language),
    episodeCount: num(record.totalEpisodes) ?? num(record.episodeCount),
    completed,
    scoreLabel: str(record.scoreStr),
    playCount: str(record.playCnt) || str(record.favoriteCnt) || str(record.playCount),
    badge: str(record.cornerMark),
    firstEpisodeId,
  };
}

export function mapAnyreelCards(list: unknown) {
  const cards: DramaCard[] = [];
  for (const item of asArray(list)) {
    const card = mapCard(item);
    if (card) cards.push(card);
  }
  return cards;
}

export async function anyreelHome() {
  const payload = await providerFetch<Record<string, unknown>>("anyreel", "/get-home", {
    cacheTtl: 90_000,
  });
  const data = asRecord(payload.data) ?? payload;
  const banners = asArray(data.banners);
  const sections = asArray(data.sectionConfigs).map((section) => {
    const record = asRecord(section);
    return {
      name: str(record?.name) || "Featured",
      items: mapAnyreelCards(record?.series),
    };
  });
  return { banners, sections };
}

export async function anyreelRank() {
  const payload = await providerFetch<Record<string, unknown>>("anyreel", "/get-rank", {
    cacheTtl: 90_000,
  });
  const data = asRecord(payload.data) ?? {};
  return mapAnyreelCards(data.list);
}

export async function anyreelSearchHome() {
  const payload = await providerFetch<Record<string, unknown>>("anyreel", "/get-search-home", {
    cacheTtl: 120_000,
  });
  const sections = asArray(payload.data).map((section) => {
    const record = asRecord(section);
    return { name: str(record?.name) || "Trending", items: mapAnyreelCards(record?.series) };
  });
  return sections;
}

export async function anyreelSearch(keyword: string, page: number) {
  const payload = await providerFetch<Record<string, unknown>>(
    "anyreel",
    `/search?keyword=${enc(keyword)}&page=${page}`,
    { cacheTtl: 45_000, cacheKey: `anyreel-search:${keyword}:${page}` },
  );
  const data = asRecord(payload.data) ?? {};
  return {
    items: mapAnyreelCards(data.data),
    hasMore: data.hasNextPages === true,
    page: num(data.pageIndex) ?? page,
  };
}

export async function anyreelShorts(page: number) {
  const payload = await providerFetch<Record<string, unknown>>("anyreel", `/get-shorts?page=${page}`, {
    cacheTtl: 60_000,
    cacheKey: `anyreel-shorts:${page}`,
  });
  const data = asRecord(payload.data) ?? {};
  return {
    items: mapAnyreelCards(data.data),
    hasMore: data.hasNextPages === true,
  };
}

export async function anyreelSimilar(seriesId: string) {
  try {
    const payload = await providerFetch<Record<string, unknown>>(
      "anyreel",
      `/get-similar?series_id=${enc(seriesId)}`,
      { cacheTtl: 120_000, cacheKey: `anyreel-similar:${seriesId}` },
    );
    const data = payload.data;
    return mapAnyreelCards(Array.isArray(data) ? data : asRecord(data)?.list);
  } catch {
    return [];
  }
}

export async function anyreelDetail(seriesId: string) {
  const payload = await providerFetch<Record<string, unknown>>("anyreel", `/get-detail/${enc(seriesId)}`, {
    cacheTtl: 120_000,
    cacheKey: `anyreel-detail:${seriesId}`,
  });
  const data = asRecord(payload.data);
  if (!data) throw new Error("AnyReel did not return drama details");
  const card = mapCard({ ...data, seriesId, name: data.seriesName || data.name, id: seriesId });
  const episodes: Episode[] = asArray(data.dramaEpisodes).flatMap((item, index) => {
    const record = asRecord(item);
    if (!record) return [];
    const episodeId = str(record.episodeSort) || str(record.sort) || String(index + 1);
    return [
      {
        episodeId,
        index: num(record.episodeSort) ?? index + 1,
        title: str(record.title) || `Episode ${num(record.episodeSort) ?? index + 1}`,
        coverUrl: absoluteUrl(record.coverImageUrl),
        durationSec: num(record.totalDuration) ?? num(record.duration),
        access: record.isCharged === true ? "limited" : "open",
      },
    ];
  });
  return { card, episodes };
}

export async function anyreelStream(seriesId: string, episodeSort: string): Promise<StreamCandidate[]> {
  const payload = await providerFetch<Record<string, unknown>>(
    "anyreel",
    `/get-stream/${enc(seriesId)}/${enc(episodeSort)}`,
    { cacheTtl: 20_000, cacheKey: `anyreel-stream:${seriesId}:${episodeSort}` },
  );
  const url = str(payload.video_url);
  if (!url || payload.locked === true) return [];
  return [{ url: upgradeHttps(url), format: guessFormat(url), quality: null, subtitles: [] }];
}
