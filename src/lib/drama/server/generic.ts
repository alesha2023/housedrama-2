import type { DramaCard, Episode, ProviderId, StreamCandidate } from "../types";
import { homeCandidates } from "../providers";
import { absoluteUrl, asArray, asRecord, enc, guessFormat, num, providerFetch, str, tagList, upgradeHttps } from "./http";

const TITLE_KEYS = [
  "book_title",
  "shortPlayName",
  "series_title",
  "seriesTitle",
  "bookTitle",
  "drama_title",
  "short_play_name",
  "seriesName",
  "series_name",
  "dramaName",
  "drama_name",
  "playletName",
  "playlet_name",
  "bookName",
  "book_name",
  "videoName",
  "programName",
  "showName",
  "title",
  "name",
];

const ID_KEYS = [
  "book_id",
  "bookId",
  "series_id",
  "seriesId",
  "dramaId",
  "drama_id",
  "shortPlayId",
  "short_play_id",
  "playletId",
  "playlet_id",
  "programId",
  "program_id",
  "videoId",
  "video_id",
  "movieId",
  "movie_id",
  "theaterId",
  "theater_id",
  "showId",
  "show_id",
  "compilations_id",
  "cid",
];

const IMAGE_KEYS = [
  "book_pic",
  "shortPlayCover",
  "cover_url",
  "cover",
  "cover_image",
  "cover_image_url",
  "series_cover",
  "series_cover_url",
  "cover_uri",
  "compress_cover_url",
  "coverImageUrl",
  "coverUrl",
  "posterUrl",
  "poster",
  "cover",
  "thumbnailExpanded",
  "thumbnail",
  "bannerImage",
  "bannerUrl",
  "banner",
  "highImage",
  "image",
  "pic",
];

const URL_KEYS = ["video_url", "videoUrl", "playUrl", "play_url", "m3u8_url", "m3u8", "streamUrl", "stream_url", "proxy_url", "proxyUrl", "play_url_proxy", "url"];

const homePath = new Map<string, string>();

function withLang(path: string, lang: string) {
  const code = lang === "id" ? "in" : lang || "en";
  return `${path}${path.includes("?") ? "&" : "?"}lang=${enc(code)}`;
}

function imageOf(record: Record<string, unknown>) {
  for (const key of IMAGE_KEYS) {
    const url = absoluteUrl(record[key]);
    if (url && !/\.(m3u8|mp4)(\?|$)/i.test(url)) return url;
  }
  return null;
}

function descriptionOf(record: Record<string, unknown>) {
  return (
    str(record.description) ||
    str(record.abstract) ||
    str(record.introduction) ||
    str(record.synopsis) ||
    str(record.logLine) ||
    str(record.desc) ||
    str(record.brief) ||
    null
  );
}

function tagsOf(record: Record<string, unknown>) {
  const direct = tagList(record.tags ?? record.content_tag ?? record.labelArray ?? record.shortPlayLabels ?? record.categories);
  if (direct.length) return direct;
  if (typeof record.categories === "string" && record.categories.trim()) {
    const categories = record.categories.split(/[,，、]/).map((item) => item.trim()).filter(Boolean);
    if (categories.length) return [...new Set(categories)].slice(0, 8);
  }
  const genres = asArray(record.genres)
    .map((item) => str(item) || str(asRecord(item)?.title) || str(asRecord(item)?.name))
    .filter((item): item is string => Boolean(item));
  if (genres.length) return [...new Set(genres)].slice(0, 6);
  const category = str(record.category) || str(record.subCategory);
  return category ? [category] : [];
}

function usableTitle(value: string | null) {
  if (!value || value.length < 2 || value.length > 140) return null;
  if (/^episode\s*\d+/i.test(value) || /^\d+(\.mp4)?$/i.test(value)) return null;
  return value;
}

function isEpisodeRow(record: Record<string, unknown>) {
  if (record.episode_price != null && record.index != null && record.duration != null) return true;
  if ((record.m3u8_url != null || record.external_audio_h264_m3u8) && record.duration != null) return true;
  if (record.seq != null && record.episodeId != null && record.dramaId == null && record.bookId == null && record.seriesId == null) return true;
  return false;
}

export function toCard(record: Record<string, unknown> | null, provider: ProviderId): DramaCard | null {
  if (!record || isEpisodeRow(record)) return null;
  let title: string | null = null;
  for (const key of TITLE_KEYS) {
    title = usableTitle(str(record[key]));
    if (title) break;
  }
  if (!title) return null;
  let seriesId: string | null = null;
  for (const key of ID_KEYS) {
    const value = str(record[key]);
    if (value && value.length < 80 && !value.startsWith("section_")) {
      seriesId = value;
      break;
    }
  }
  if (!seriesId) {
    const id = str(record.id);
    if (id && imageOf(record) && !id.startsWith("section_") && id.length < 48) seriesId = id;
  }
  if (!seriesId) return null;
  const posterUrl = imageOf(record);
  const description = descriptionOf(record);
  if (!posterUrl && !description && title.length < 12) return null;
  const progress = asRecord(record.read_progress_episode);
  return {
    provider,
    seriesId,
    title,
    posterUrl,
    bannerUrl: absoluteUrl(record.bannerImage) || absoluteUrl(record.bannerUrl) || posterUrl,
    description,
    tags: tagsOf(record),
    language: str(record.language) || str(record.lang),
    episodeCount:
      num(record.episodeTotal) ??
      num(record.total_episodes) ??
      num(record.totalEpisodes) ??
      num(record.episodeCount) ??
      num(record.chapter_count) ??
      num(record.chapterCount) ??
      num(record.current_count) ??
      num(record.totalEpisode),
    completed: record.completed === true ? true : record.status === 2 ? true : null,
    scoreLabel: str(record.score) || str(record.scoreLabel),
    playCount: str(record.playCount) || str(record.views) || str(record.view_count) || str(record.read_count) || str(record.collect_count),
    badge: str(record.badge) || str(record.cornerMark) || str(record.rank_level),
    firstEpisodeId:
      str(record.firstEpisodeId) ||
      str(record.first_chapter_id) ||
      str(record.firstChapterId) ||
      str(progress?.episode_order) ||
      str(progress?.episode_id),
  };
}

export function extractCards(root: unknown, provider: ProviderId) {
  const found: DramaCard[] = [];
  const seen = new Set<string>();
  const visit = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    const record = asRecord(node);
    if (!record) return;
    const card = toCard(record, provider);
    if (card && !seen.has(card.seriesId)) {
      seen.add(card.seriesId);
      found.push(card);
    }
    for (const value of Object.values(record)) {
      if (value && typeof value === "object") visit(value);
    }
  };
  visit(root);
  return found.slice(0, 80);
}

function channelIds(root: unknown) {
  const ids: string[] = [];
  const visit = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    const record = asRecord(node);
    if (!record) return;
    const id = str(record.channelId) || str(record.navigationTagId) || str(record.tab_id) || str(record.tabId) || str(record.nav_id);
    if (id && (record.channelId || record.tab_name || record.tab_id || record.navigationTagId || record.isHome != null)) ids.push(id);
    for (const value of Object.values(record)) {
      if (value && typeof value === "object") visit(value);
    }
  };
  visit(root);
  return [...new Set(ids)].slice(0, 2);
}

async function read(provider: ProviderId, path: string, lang: string) {
  const data = await providerFetch<unknown>(provider, withLang(path, lang), {
    cacheTtl: 180_000,
    timeout: 5000,
    cacheKey: `${provider}:${lang}:${path}`,
  });
  return data;
}

function meloloLangCodes(lang: string) {
  if (lang === "id") return ["id", "in", "Indonesian"];
  if (lang === "en") return ["en", "English"];
  if (lang === "zh") return ["zh", "Chinese"];
  return [lang || "en"];
}

async function meloloRead(path: string, cacheTtl = 90_000) {
  return providerFetch<unknown>("melolo", path, {
    cacheTtl,
    timeout: 6500,
    retries: 1,
    cacheKey: `melolo:${path}`,
  });
}

function meloloCategories(root: unknown): string[] {
  const found: string[] = [];
  const seen = new Set<string>();
  const visit = (node: unknown, depth = 0) => {
    if (depth > 7 || node == null) return;
    if (Array.isArray(node)) {
      node.forEach((item) => visit(item, depth + 1));
      return;
    }
    const rec = asRecord(node);
    if (!rec) return;
    const name = str(rec.category) || str(rec.category_name) || str(rec.channel_name) || str(rec.channelName) || str(rec.name) || str(rec.title) || str(rec.label);
    const id = str(rec.category_id) || str(rec.channel_id) || str(rec.id);
    // Only take labels from likely channel objects; avoid interpreting drama titles as categories.
    if (name && (rec.category != null || rec.category_name != null || rec.channel_name != null || rec.channelName != null || rec.channel_id != null || rec.category_id != null || (id && rec.series_id == null && rec.seriesId == null && rec.book_id == null && rec.bookId == null && rec.episode_id == null && rec.vid == null))) {
      const key = name.toLowerCase();
      if (!seen.has(key) && name.length < 70) { seen.add(key); found.push(name); }
    }
    for (const [key, value] of Object.entries(rec)) {
      if (value && typeof value === "object") visit(value, depth + 1);
      // Some APIs return channel names as plain strings in named arrays.
      if (/channels?|categories|tabs|data/i.test(key) && Array.isArray(value)) {
        for (const item of value) if (typeof item === "string" && item.trim() && item.length < 70) {
          const label = item.trim(); const k = label.toLowerCase(); if (!seen.has(k)) { seen.add(k); found.push(label); }
        }
      }
    }
  };
  visit(root);
  return found.slice(0, 20);
}

async function meloloBrowse(lang: string): Promise<DramaCard[]> {
  // Confirmed working route: /get-channel-content?category=Popular&lang=en
  const languageCodes = [...new Set(["en", ...meloloLangCodes(lang)])];
  const categories = ["Popular"];
  try {
    const channelPayload = await meloloRead("/get-channels", 120_000);
    const discovered = meloloCategories(channelPayload);
    for (const item of discovered) {
      if (item.toLowerCase() !== "popular" && categories.length < 6) categories.push(item);
    }
  } catch {
    // Keep using the known working Popular category.
  }

  const allCards: DramaCard[] = [];
  for (const category of categories) {
    let categoryFound = false;
    for (const code of languageCodes) {
      try {
        const payload = await meloloRead(
          `/get-channel-content?category=${enc(category)}&lang=${enc(code)}`,
          120_000,
        );
        const record = asRecord(payload);
        const directData = asArray(record?.data);
        const directCards = directData
          .map((item) => asRecord(item))
          .filter((item): item is Record<string, unknown> => Boolean(item))
          .map((item) => {
            const title = usableTitle(str(item.title) || str(item.series_title) || str(item.name));
            const seriesId = str(item.series_id) || str(item.seriesId) || str(item.id);
            const posterUrl = imageOf(item);
            if (!title || !seriesId || (!posterUrl && !descriptionOf(item))) return null;
            return toCard({
              ...item,
              title,
              series_id: seriesId,
              cover: posterUrl || item.cover,
              abstract: descriptionOf(item) || item.abstract,
              episodeCount: item.episodes ?? item.episode_count ?? item.episodeCount,
            }, "melolo");
          })
          .filter((item): item is DramaCard => Boolean(item));
        const extracted = directCards.length ? directCards : extractCards(payload, "melolo");
        if (extracted.length) {
          allCards.push(...extracted);
          categoryFound = true;
          break;
        }
      } catch {
        // Try another language or category.
      }
    }
    if (categoryFound && allCards.length >= 20) break;
  }

  const cards = dedupeCards(allCards);
  if (cards.length) return cards;

  for (const path of ["/suggest", "/search?keyword=love", "/search?keyword=romance"]) {
    for (const code of languageCodes) {
      try {
        const separator = path.includes("?") ? "&" : "?";
        const data = await meloloRead(`${path}${separator}lang=${enc(code)}`, 60_000);
        const result = extractCards(data, "melolo");
        if (result.length) return result;
      } catch {
        // Continue fallback.
      }
    }
  }
  return [];
}

function dedupeCards(cards: DramaCard[]) {
  const seen = new Set<string>();
  return cards.filter((card) => {
    if (seen.has(card.seriesId)) return false;
    seen.add(card.seriesId);
    return true;
  }).slice(0, 80);
}

export async function genericBrowse(provider: ProviderId, lang: string) {
  if (provider === "melolo") return meloloBrowse(lang);
  const cached = homePath.get(`${provider}:${lang}`);
  const paths = cached ? [cached, ...homeCandidates(provider).filter((item) => item !== cached)] : homeCandidates(provider);
  let last: unknown = null;
  for (const path of paths) {
    try {
      last = await read(provider, path, lang);
      const cards = extractCards(last, provider);
      if (cards.length > 0) {
        homePath.set(`${provider}:${lang}`, path);
        return cards;
      }
    } catch {
      /* try the next catalog route */
    }
  }
  for (const id of channelIds(last)) {
    for (const path of [`/get-home/${enc(id)}`, `/get-channel/${enc(id)}`, `/get-tab/${enc(id)}`]) {
      try {
        const data = await read(provider, path, lang);
        const cards = extractCards(data, provider);
        if (cards.length >= 4) return cards;
      } catch {
        /* channel route differs per provider */
      }
    }
  }
  return extractCards(last, provider);
}

export async function genericSearch(provider: ProviderId, query: string, lang: string) {
  const q = enc(query);
  if (provider === "melolo") {
    for (const code of meloloLangCodes(lang)) {
      for (const path of [`/search?keyword=${q}&language=${enc(code)}`, `/search?keyword=${q}&lang=${enc(code)}`, `/search?keyword=${q}`]) {
        try { const data = await meloloRead(path, 45_000); const cards = extractCards(data, "melolo"); if (cards.length) return cards; } catch { /* try next documented query shape */ }
      }
    }
    return [];
  }
  const paths = [`/search/${q}`, `/search?keyword=${q}`, `/search?q=${q}`, `/search?query=${q}`];
  for (const path of paths) {
    try {
      const data = await read(provider, path, lang);
      const cards = extractCards(data, provider);
      if (cards.length) return cards;
    } catch {
      /* next search shape */
    }
  }
  return [];
}

export function extractEpisodes(root: unknown): Episode[] {
  const found: Episode[] = [];
  const seen = new Set<string>();
  const visit = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    const record = asRecord(node);
    if (!record) return;
    const seq = num(record.seq) ?? num(record.episodeSort) ?? num(record.episode_order) ?? num(record.sort) ?? num(record.order) ?? num(record.index) ?? num(record.episode_number) ?? num(record.episodeNumber);
    const episodeId =
      str(record.vid) ||
      str(record.video_id) ||
      str(record.videoId) ||
      str(record.vid_id) ||
      str(record.seq) ||
      str(record.episodeSort) ||
      str(record.chapterId) ||
      str(record.chapter_id) ||
      str(record.episodeId) ||
      str(record.episode_id) ||
      (seq != null ? String(seq) : null);
    const episodeLike = record.seq != null || record.episodeId != null || record.chapterId != null || record.episode_order != null || record.episodeSort != null || record.vid != null || record.video_id != null || record.videoId != null || record.vid_id != null;
    if (episodeId && episodeLike && !seen.has(episodeId)) {
      seen.add(episodeId);
      const locked = record.unlock === false || record.isCharge === 1 || record.isCharged === true || record.locked === true;
      found.push({
        episodeId,
        index: seq ?? found.length + 1,
        title: usableTitle(str(record.title) || str(record.chapterName) || str(record.name)) || `Episode ${seq ?? found.length + 1}`,
        coverUrl: imageOf(record),
        durationSec: num(record.duration) ?? num(record.durationSec) ?? num(record.totalDuration),
        access: locked ? "limited" : "open",
      });
    }
    for (const value of Object.values(record)) {
      if (value && typeof value === "object") visit(value);
    }
  };
  visit(root);
  return found.slice(0, 200);
}

export async function genericDetail(provider: ProviderId, seriesId: string, lang: string) {
  if (provider === "melolo") {
    let detail: unknown = null;
    for (const code of meloloLangCodes(lang)) {
      try { detail = await meloloRead(`/get-detail/${enc(seriesId)}?language=${enc(code)}`, 90_000); break; } catch { /* next language alias */ }
    }
    if (!detail) detail = await meloloRead(`/get-detail/${enc(seriesId)}`, 90_000);
    let episodePayload: unknown = null;
    try { episodePayload = await meloloRead(`/get-episodes/${enc(seriesId)}`, 90_000); } catch { /* detail may include episodes */ }
    let episodes = extractEpisodes(episodePayload ?? detail);
    if (!episodes.length) episodes = extractEpisodes(detail);
    const cards = extractCards(detail, provider);
    const card = cards.find((item) => item.seriesId === seriesId) ?? cards[0] ?? null;
    if (card && !card.firstEpisodeId && episodes[0]) card.firstEpisodeId = episodes[0].episodeId;
    if (card && episodes.length && !card.episodeCount) card.episodeCount = episodes.length;
    return { card, episodes };
  }
  const detail = await read(provider, `/get-detail/${enc(seriesId)}`, lang);
  let episodes = extractEpisodes(detail);
  if (!episodes.length) {
    try {
      episodes = extractEpisodes(await read(provider, `/get-episodes/${enc(seriesId)}`, lang));
    } catch {
      episodes = [];
    }
  }
  const cards = extractCards(detail, provider);
  const card = cards.find((item) => item.seriesId === seriesId) ?? cards[0] ?? null;
  if (card && !card.firstEpisodeId && episodes[0]) card.firstEpisodeId = episodes[0].episodeId;
  if (card && episodes.length && !card.episodeCount) card.episodeCount = episodes.length;
  return { card, episodes };
}

export function extractStreams(root: unknown): StreamCandidate[] {
  const found: StreamCandidate[] = [];
  const seen = new Set<string>();
  const push = (value: unknown, loose: boolean) => {
    const raw = str(value);
    if (!raw || !/^https?:\/\//i.test(raw)) return;
    if (/\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(raw)) return;
    const url = upgradeHttps(raw);
    if (seen.has(url)) return;
    if (!loose && !/\.(m3u8|mp4)(\?|$)/i.test(url) && !/m3u8|video|stream|playlist/i.test(url)) return;
    seen.add(url);
    found.push({ url, format: guessFormat(url), quality: null, subtitles: [] });
  };
  const visit = (node: unknown) => {
    if (typeof node === "string") {
      push(node, false);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    const record = asRecord(node);
    if (!record) return;
    for (const key of URL_KEYS) push(record[key], true);
    for (const value of Object.values(record)) {
      if (value && typeof value === "object") visit(value);
    }
  };
  visit(root);
  return found.slice(0, 6);
}

export async function genericStream(provider: ProviderId, seriesId: string, episodeId: string, lang: string) {
  if (provider === "melolo") {
    const paths = [
      `/get-streams-proxy/${enc(episodeId)}`,
      `/get-stream/${enc(episodeId)}`,
      `/get-streams-proxy/${enc(seriesId)}?vid=${enc(episodeId)}`,
    ];
    for (const path of paths) {
      try {
        const data = await meloloRead(path, 0);
        const streams = extractStreams(data);
        if (streams.length) return streams;
      } catch { /* try the next supported stream endpoint */ }
    }
    try {
      const data = await providerFetch<unknown>("melolo", "/get-all-streams-proxy/" + enc(seriesId), { timeout: 8000, retries: 0, cacheTtl: 0 });
      const all = extractStreams(data);
      if (all.length) return all;
    } catch { /* no proxy stream available */ }
    return [];
  }
  const paths = [`/get-stream/${enc(seriesId)}/${enc(episodeId)}`, `/get-stream/${enc(episodeId)}?seriesId=${enc(seriesId)}`];
  // Stream endpoints are often the slowest part of playback. Probe both known
  // route shapes concurrently with a short timeout instead of waiting through
  // multiple 5-second retries on the first route before trying the second.
  const attempts = paths.map(async (path) => {
    const data = await providerFetch<unknown>(provider, withLang(path, lang), {
      timeout: 4500,
      retries: 0,
      cacheTtl: 0,
    });
    const streams = extractStreams(data);
    if (!streams.length) throw new Error("No stream in this route shape");
    return streams;
  });
  try {
    // Return as soon as either endpoint yields a playable source.
    return await Promise.any(attempts);
  } catch {
    return [];
  }
}
