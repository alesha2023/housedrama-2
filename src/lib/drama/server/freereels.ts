import type { DramaCard, Episode, StreamCandidate, SubtitleTrack } from "../types";
import {
  absoluteUrl,
  asArray,
  asRecord,
  enc,
  frLang,
  guessFormat,
  num,
  providerFetch,
  str,
  tagList,
  upgradeHttps,
} from "./http";

/** FreeReels has used both wrapped and flat response shapes across endpoints. */
function payloadRecord(payload: unknown): Record<string, unknown> {
  const root = asRecord(payload) ?? {};
  const data = asRecord(root.data);
  const result = asRecord(root.result);
  return data ?? result ?? root;
}

function payloadArray(payload: unknown, ...keys: string[]): unknown[] {
  if (Array.isArray(payload)) return payload;
  const root = asRecord(payload) ?? {};
  for (const candidate of [root.data, root.result, root.items, root.list, root.channels, root.episodes, root.books]) {
    if (Array.isArray(candidate)) return candidate;
    const nested = asRecord(candidate);
    if (nested) {
      for (const key of [...keys, "items", "list", "channels", "episodes", "results", "records"]) {
        if (Array.isArray(nested[key])) return nested[key] as unknown[];
      }
    }
  }
  const data = payloadRecord(payload);
  for (const key of [...keys, "items", "list", "channels", "episodes", "results", "records"]) {
    if (Array.isArray(data[key])) return data[key] as unknown[];
  }
  return [];
}

function mapCard(raw: unknown): DramaCard | null {
  const record = asRecord(raw);
  if (!record) return null;
  const seriesId = str(record.series_id) || str(record.seriesId) || str(record.series_key) || str(record.book_id) || str(record.key) || str(record.id);
  const title = str(record.title) || str(record.name) || str(record.series_name) || str(record.book_name);
  if (!seriesId || !title) return null;
  const tags = [...tagList(record.content_tags), ...tagList(record.tag), ...tagList(record.series_tag)];
  const finish = num(record.finish_status);
  const nested = asRecord(record.episode_info) ?? asRecord(asRecord(record.container)?.episode_info);
  return {
    provider: "freereels",
    seriesId,
    title,
    posterUrl: absoluteUrl(record.cover) || absoluteUrl(record.cover_url) || absoluteUrl(record.poster) || absoluteUrl(record.poster_url),
    bannerUrl: absoluteUrl(record.cover) || absoluteUrl(record.cover_url) || absoluteUrl(record.poster) || absoluteUrl(record.poster_url),
    description: str(record.desc) || str(record.description) || str(record.intro),
    tags: [...new Set(tags)].slice(0, 8),
    language: str(record.language) || str(record.original_audio),
    episodeCount: num(record.episode_count) ?? num(record.episodeCount) ?? num(record.total_episodes) ?? num(record.totalEpisodes),
    completed: finish === 2 ? true : finish === 1 ? false : null,
    scoreLabel: str(record.hot_score),
    playCount: str(record.view_count) || str(record.follow_count),
    badge: record.free === true ? "Free" : null,
    firstEpisodeId: str(nested?.id),
  };
}

function mapCards(list: unknown) {
  const cards: DramaCard[] = [];
  for (const item of asArray(list)) {
    const card = mapCard(item);
    if (card) cards.push(card);
  }
  return cards;
}

function mapEpisodes(list: unknown): Episode[] {
  return asArray(list).flatMap((item, index) => {
    const record = asRecord(item);
    if (!record) return [];
    const episodeId = str(record.episode_key) || str(record.episode_id) || str(record.episodeId) || str(record.key) || str(record.id);
    if (!episodeId) return [];
    const hasStream = Boolean(str(record.h264_m3u8) || str(record.h265_m3u8));
    const locked = record.unlock === false || (record.video_type && record.video_type !== "free" && !hasStream);
    return [
      {
        episodeId,
        index: num(record.index) ?? index + 1,
        title: str(record.name) || str(record.title) || str(record.episode_name) || `Episode ${num(record.index) ?? num(record.episode_no) ?? index + 1}`,
        coverUrl: absoluteUrl(record.cover) || absoluteUrl(record.cover_url),
        durationSec: num(record.duration) ?? num(record.duration_sec),
        access: locked ? "limited" : "open",
      },
    ];
  });
}

export async function freereelsChannels(lang: string) {
  const payload = await providerFetch<unknown>(
    "freereels",
    `/get-channels?lang=${enc(frLang(lang))}`,
    { cacheTtl: 180_000, cacheKey: `fr-channels:${lang}` },
  );
  return payloadArray(payload, "channels", "tabs", "data").flatMap((item) => {
    const record = asRecord(item);
    const key = str(record?.id) || str(record?.tab_key) || str(record?.channel_id) || str(record?.key);
    const name = str(record?.name) || str(record?.title) || str(record?.channel_name);
    return key && name ? [{ key, name }] : [];
  });
}

export async function freereelsChannel(tabKey: string, lang: string) {
  let payload: Record<string, unknown>;
  try {
    payload = await providerFetch<Record<string, unknown>>(
      "freereels",
      `/get-channel-content?channel_id=${enc(tabKey)}&lang=${enc(frLang(lang))}`,
      { cacheTtl: 90_000, cacheKey: `fr-channel:${lang}:${tabKey}` },
    );
  } catch {
    payload = await providerFetch<Record<string, unknown>>(
      "freereels",
      `/get-channel-content?tab_key=${enc(tabKey)}&lang=${enc(frLang(lang))}`,
      { cacheTtl: 90_000, cacheKey: `fr-channel-tab:${lang}:${tabKey}` },
    );
  }
  const data = payloadRecord(payload);
  const modules = payloadArray(data, "items", "modules", "sections", "content");
  if (modules.length) {
    return modules.map((mod) => {
      const record = asRecord(mod);
      return {
        name: str(record?.module_name) || str(record?.show_title) || str(record?.name) || "FreeReels",
        items: mapCards(payloadArray(record, "items", "list", "books", "series")),
      };
    }).filter((item) => item.items.length > 0);
  }
  const cards = mapCards(payloadArray(data, "items", "list", "books", "series", "content"));
  return cards.length ? [{ name: str(data.name) || "FreeReels", items: cards }] : [];
}

export async function freereelsForYou(lang: string, offset = 0) {
  const payload = await providerFetch<Record<string, unknown>>(
    "freereels",
    `/get-foryou?lang=${enc(frLang(lang))}&offset=${offset}`,
    { cacheTtl: 60_000, cacheKey: `fr-foryou:${lang}:${offset}` },
  );
  const data = payloadRecord(payload);
  const page = asRecord(data.page_info) ?? asRecord(data.pagination);
  return {
    items: mapCards(payloadArray(data, "items", "list", "books", "series", "results")),
    hasMore: page?.has_more === true || page?.hasMore === true,
    next: str(page?.next) || str(page?.next_offset),
  };
}

export async function freereelsSearch(keyword: string, lang: string, offset = 0) {
  let payload: Record<string, unknown>;
  try {
    payload = await providerFetch<Record<string, unknown>>(
      "freereels",
      `/search?keyword=${enc(keyword)}&lang=${enc(frLang(lang))}&offset=${offset}&page_size=20`,
      { cacheTtl: 45_000, cacheKey: `fr-search-keyword:${lang}:${keyword}:${offset}` },
    );
  } catch {
    payload = {};
  }
  let data = payloadRecord(payload);
  let items = mapCards(payloadArray(data, "items", "list", "books", "series", "results"));
  // Some deployments name the query parameter q instead of keyword.
  if (!items.length) {
    try {
      const fallback = await providerFetch<Record<string, unknown>>(
        "freereels",
        `/search?q=${enc(keyword)}&lang=${enc(frLang(lang))}&offset=${offset}&page_size=20`,
        { cacheTtl: 45_000, cacheKey: `fr-search:${lang}:${keyword}:${offset}` },
      );
      data = payloadRecord(fallback);
      items = mapCards(payloadArray(data, "items", "list", "books", "series", "results"));
    } catch {
      // Preserve an empty search result when both compatible query formats fail.
    }
  }
  const page = asRecord(data.page_info) ?? asRecord(data.pagination);
  return { items, hasMore: page?.has_more === true || page?.hasMore === true };
}

export async function freereelsSuggest(keyword: string, lang: string) {
  if (!keyword.trim()) return [];
  try {
    const payload = await providerFetch<Record<string, unknown>>(
      "freereels",
      `/suggest?q=${enc(keyword)}&lang=${enc(frLang(lang))}`,
      { cacheTtl: 60_000, cacheKey: `fr-suggest:${lang}:${keyword}` },
    );
    const data = payload.data;
    if (Array.isArray(data)) {
      return data.flatMap((item) => {
        if (typeof item === "string") return [item];
        const name = str(asRecord(item)?.name) || str(asRecord(item)?.title) || str(asRecord(item)?.keyword);
        return name ? [name] : [];
      });
    }
    return [];
  } catch {
    return [];
  }
}

export async function freereelsDetail(seriesId: string, lang: string) {
  const payload = await providerFetch<Record<string, unknown>>(
    "freereels",
    `/get-detail/${enc(seriesId)}?lang=${enc(frLang(lang))}`,
    { cacheTtl: 120_000, cacheKey: `fr-detail:${lang}:${seriesId}` },
  );
  const data = payloadRecord(payload);
  const detailData = asRecord(data.series) ?? asRecord(data.detail) ?? asRecord(data.book) ?? data;
  const card = mapCard({ ...detailData, id: seriesId });
  let episodes = mapEpisodes(payloadArray(data, "episodes", "chapters", "episode_list"));
  if (!episodes.length) episodes = mapEpisodes(payloadArray(detailData, "episodes", "chapters", "episode_list"));
  if (!episodes.length) {
    const extra = await providerFetch<Record<string, unknown>>(
      "freereels",
      `/get-episodes/${enc(seriesId)}?lang=${enc(frLang(lang))}`,
      { cacheTtl: 120_000, cacheKey: `fr-eps:${lang}:${seriesId}` },
    );
    const extraData = payloadRecord(extra);
    episodes = mapEpisodes(payloadArray(extra, "episodes", "chapters", "episode_list", "items", "list"));
    if (!episodes.length) episodes = mapEpisodes(payloadArray(extraData, "episodes", "chapters", "episode_list", "items", "list"));
    if (!card) return { card: mapCard({ ...extraData, id: seriesId }), episodes };
  }
  if (card && episodes[0]) card.firstEpisodeId = episodes[0].episodeId;
  return { card, episodes };
}

function subtitlesOf(value: unknown): SubtitleTrack[] {
  const tracks: SubtitleTrack[] = [];
  for (const item of asArray(value)) {
    const record = asRecord(item);
    const url = str(record?.vtt) || str(record?.srt);
    const lang = str(record?.language);
    if (!url || !lang) continue;
    tracks.push({
      lang,
      label: str(record?.display_name) || lang,
      url: upgradeHttps(url),
    });
  }
  return tracks.slice(0, 12);
}

export async function freereelsStream(seriesId: string, episodeKey: string, lang: string) {
  const payload = await providerFetch<Record<string, unknown>>(
    "freereels",
    `/get-stream/${enc(seriesId)}/${enc(episodeKey)}?lang=${enc(frLang(lang))}`,
    { cacheTtl: 20_000, cacheKey: `fr-stream:${lang}:${seriesId}:${episodeKey}` },
  );
  const root = payloadRecord(payload);
  const data = asRecord(root.stream) ?? asRecord(root.playback) ?? asRecord(root.video) ?? root;
  const subs = subtitlesOf(data.subtitles || root.subtitles || data.subtitle_list);
  const candidates: StreamCandidate[] = [];
  const h264 = str(data.h264_m3u8) || str(data.external_audio_h264_m3u8) || str(data.hls_url) || str(data.stream_url) || str(data.play_url) || str(data.video_url) || str(data.url);
  const h265 = str(data.h265_m3u8) || str(data.external_audio_h265_m3u8);
  if (h264) candidates.push({ url: upgradeHttps(h264), format: guessFormat(h264), quality: "h264", subtitles: subs });
  if (h265) candidates.push({ url: upgradeHttps(h265), format: guessFormat(h265), quality: "h265", subtitles: subs });
  const blocked = (data.unlock === false || root.unlock === false) && candidates.length === 0;
  return { candidates, blocked };
}
