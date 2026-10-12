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

function mapCard(raw: unknown): DramaCard | null {
  const record = asRecord(raw);
  if (!record) return null;
  const seriesId = str(record.key) || str(record.id) || str(record.series_key);
  const title = str(record.title) || str(record.name);
  if (!seriesId || !title) return null;
  const tags = [...tagList(record.content_tags), ...tagList(record.tag), ...tagList(record.series_tag)];
  const finish = num(record.finish_status);
  return {
    provider: "freereels",
    seriesId,
    title,
    posterUrl: absoluteUrl(record.cover),
    bannerUrl: absoluteUrl(record.cover),
    description: str(record.desc),
    tags: [...new Set(tags)].slice(0, 8),
    language: str(record.language) || str(record.original_audio),
    episodeCount: num(record.episode_count),
    completed: finish === 2 ? true : finish === 1 ? false : null,
    scoreLabel: str(record.hot_score),
    playCount: str(record.view_count) || str(record.follow_count),
    badge: record.free === true ? "Free" : null,
    firstEpisodeId: null,
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
    const episodeId = str(record.id) || str(record.episode_key);
    if (!episodeId) return [];
    const hasStream = Boolean(str(record.h264_m3u8) || str(record.h265_m3u8));
    const locked = record.unlock === false || (record.video_type && record.video_type !== "free" && !hasStream);
    return [
      {
        episodeId,
        index: num(record.index) ?? index + 1,
        title: str(record.name) || `Episode ${num(record.index) ?? index + 1}`,
        coverUrl: absoluteUrl(record.cover),
        durationSec: num(record.duration),
        access: locked ? "limited" : "open",
      },
    ];
  });
}

export async function freereelsChannels(lang: string) {
  const payload = await providerFetch<Record<string, unknown>>(
    "freereels",
    `/get-channels?lang=${enc(frLang(lang))}`,
    { cacheTtl: 180_000, cacheKey: `fr-channels:${lang}` },
  );
  return asArray(payload.data).flatMap((item) => {
    const record = asRecord(item);
    const key = str(record?.tab_key);
    const name = str(record?.name);
    return key && name ? [{ key, name }] : [];
  });
}

export async function freereelsChannel(tabKey: string, lang: string) {
  const payload = await providerFetch<Record<string, unknown>>(
    "freereels",
    `/get-channel-content?tab_key=${enc(tabKey)}&lang=${enc(frLang(lang))}`,
    { cacheTtl: 90_000, cacheKey: `fr-channel:${lang}:${tabKey}` },
  );
  const modules = asArray(asRecord(payload.data)?.items);
  return modules.map((mod) => {
    const record = asRecord(mod);
    return {
      name: str(record?.module_name) || str(record?.show_title) || "FreeReels",
      items: mapCards(record?.items),
    };
  });
}

export async function freereelsForYou(lang: string, offset = 0) {
  const payload = await providerFetch<Record<string, unknown>>(
    "freereels",
    `/get-foryou?lang=${enc(frLang(lang))}&offset=${offset}`,
    { cacheTtl: 60_000, cacheKey: `fr-foryou:${lang}:${offset}` },
  );
  const data = asRecord(payload.data) ?? {};
  const page = asRecord(data.page_info);
  return {
    items: mapCards(data.items),
    hasMore: page?.has_more === true,
    next: str(page?.next),
  };
}

export async function freereelsSearch(keyword: string, lang: string, offset = 0) {
  const payload = await providerFetch<Record<string, unknown>>(
    "freereels",
    `/search?q=${enc(keyword)}&lang=${enc(frLang(lang))}&offset=${offset}&page_size=20`,
    { cacheTtl: 45_000, cacheKey: `fr-search:${lang}:${keyword}:${offset}` },
  );
  const page = asRecord(payload.page_info);
  return {
    items: mapCards(payload.items),
    hasMore: page?.has_more === true,
  };
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
  const data = asRecord(payload.data) ?? payload;
  const card = mapCard({ ...data, id: seriesId });
  let episodes = mapEpisodes(data.episodes);
  if (!episodes.length) {
    const extra = await providerFetch<Record<string, unknown>>(
      "freereels",
      `/get-episodes/${enc(seriesId)}?lang=${enc(frLang(lang))}`,
      { cacheTtl: 120_000, cacheKey: `fr-eps:${lang}:${seriesId}` },
    );
    const extraData = asRecord(extra.data) ?? extra;
    episodes = mapEpisodes(extraData.episodes);
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
    `/get-stream/${enc(seriesId)}/${enc(episodeKey)}?lang=${enc(frLang(lang))}&proxy=1&unlock=0`,
    { cacheTtl: 20_000, cacheKey: `fr-stream:${lang}:${seriesId}:${episodeKey}` },
  );
  const data = asRecord(payload.data) ?? payload;
  const subs = subtitlesOf(data.subtitles);
  const candidates: StreamCandidate[] = [];
  const h264 = str(data.h264_m3u8);
  const h265 = str(data.h265_m3u8);
  if (h264) candidates.push({ url: upgradeHttps(h264), format: guessFormat(h264), quality: "h264", subtitles: subs });
  if (h265) candidates.push({ url: upgradeHttps(h265), format: guessFormat(h265), quality: "h265", subtitles: subs });
  const blocked = data.unlock === false && candidates.length === 0;
  return { candidates, blocked };
}
