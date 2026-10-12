import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { dramaKey, type DramaCard, type Episode, type TranslationStatus } from "../types";
import seed from "./id-cache.json";

type CacheEntry = { text: string; status: Exclude<TranslationStatus, "original"> };

const memory = new Map<string, CacheEntry>();
const cachePath = join(process.cwd(), "src/lib/drama/server/id-cache.json");
const runtimePath = join("/tmp", "dramaluma-id-cache.json");
const MAX_SHORT = 8;
const MAX_LONG = 3;
const LONG_TEXT = 180;
const MAX_CALLS_PER_PASS = 4;
const MAX_CALLS_PER_MINUTE = 8;
const GLOSSARY: Record<string, string> = {
  romance: "Romantis",
  revenge: "Balas Dendam",
  historical: "Sejarah",
  history: "Sejarah",
  fantasy: "Fantasi",
  comedy: "Komedi",
  family: "Keluarga",
  billionaire: "Miliarder",
  ceo: "CEO",
  completed: "Tamat",
  ongoing: "Sedang Tayang",
  popular: "Populer",
  hot: "Populer",
  new: "Terbaru",
  latest: "Terbaru",
  episodes: "Episode",
  episode: "Episode",
};

const ID_WORD =
  /^(yang|dan|dari|untuk|dengan|tidak|ini|itu|sang|cinta|hati|kembali|pewaris|raja|ratu|suami|istri|dendam|rahasia|jatuh|para|seorang|akan|telah|namun|tetapi|karena|saat|ketika|ayah|ibu|kakak|adik|putri|pangeran|di|ke|pada|oleh|dalam|setelah|sebelum|sebuah|sangat|bisa|harus|aku|kamu|mereka|kami|kita|tak|sudah|adalah|juga|atau|sebagai)$/i;
const EN_WORD =
  /^(the|of|my|your|his|her|for|with|and|to|a|an|from|into|how|not|fall|fallen|returns|return|secret|boss|heiress|marriage|dragon|colonel|brother|please|undercover|double|sexy|best|friend|dad|true|wrath|queen|underworld|love|when|who|what|this|that|was|were|are|is|in|on|at|by|after|before)$/i;

let loaded = false;
let writing = false;
let calls = 0;
let windowStart = 0;

function loadCache() {
  if (loaded) return;
  loaded = true;
  const sources = [seed as Record<string, CacheEntry>];
  for (const path of [cachePath, runtimePath]) {
    try {
      sources.push(JSON.parse(readFileSync(path, "utf8")) as Record<string, CacheEntry>);
    } catch {
      // The bundled seed still applies when a cache file is not on disk.
    }
  }
  for (const parsed of sources) {
    for (const [key, value] of Object.entries(parsed)) {
      if (value && typeof value.text === "string" && value.text.trim()) memory.set(key, value);
    }
  }
}

function persist() {
  if (writing) return;
  writing = true;
  try {
    const data: Record<string, CacheEntry> = {};
    for (const [key, value] of memory) data[key] = value;
    // Runtime file only. Writing the imported seed makes the dev server reload mid-request.
    writeFileSync(runtimePath, JSON.stringify(data));
  } catch {
    // Deployed filesystem can be read-only. Memory cache still serves this process.
  } finally {
    writing = false;
  }
}

export function cacheKey(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function wantsIndonesian(lang: string) {
  return lang === "id" || lang.toLowerCase().startsWith("id");
}

function glossary(value: string) {
  return GLOSSARY[cacheKey(value).toLowerCase()] ?? null;
}

function isEpisodeLabel(value: string) {
  return /^(episode|ep|eps|bab|chapter)\s*\d+([.:]\d+)?$/i.test(value) || /^第\s*\d+\s*集$/.test(value);
}

function looksIndonesian(value: string) {
  if (/[\u4e00-\u9fff]/.test(value)) return false;
  const words = value.split(/[^a-zA-Z]+/).filter(Boolean);
  let id = 0;
  let en = 0;
  for (const word of words) {
    if (ID_WORD.test(word)) id += 1;
    if (EN_WORD.test(word)) en += 1;
  }
  return id >= 2 || (id >= 1 && en === 0 && words.length >= 2);
}

function remember(original: string, text: string, status: CacheEntry["status"]) {
  const key = cacheKey(original);
  if (!key) return;
  memory.set(key, { text, status });
}

function resolve(original: string): { text: string; status: TranslationStatus } {
  loadCache();
  const key = cacheKey(original);
  if (!key) return { text: original, status: "original" };
  const gloss = glossary(key);
  if (gloss) return { text: gloss, status: "translated" };
  if (isEpisodeLabel(key)) return { text: key, status: "provider" };
  if (looksIndonesian(key)) return { text: key, status: "provider" };
  const hit = memory.get(key);
  if (hit) return hit;
  return { text: key, status: "original" };
}

function echoedEnglish(original: string, next: string) {
  if (cacheKey(original).toLowerCase() !== cacheKey(next).toLowerCase()) return false;
  if (looksIndonesian(original) || glossary(original) || isEpisodeLabel(original)) return false;
  const words = cacheKey(original).split(/[^A-Za-z]+/).filter(Boolean);
  return words.some((word) => EN_WORD.test(word));
}

const skipped = new Set<string>();

function needsModel(value: string) {
  loadCache();
  const key = cacheKey(value);
  if (!key || skipped.has(key) || memory.has(key) || glossary(key) || isEpisodeLabel(key) || looksIndonesian(key)) return false;
  if (key.length < 4 && !/[\u4e00-\u9fff]/.test(key)) return false;
  return true;
}

function canCall() {
  const now = Date.now();
  if (now - windowStart > 60_000) {
    windowStart = now;
    calls = 0;
  }
  return calls < MAX_CALLS_PER_MINUTE;
}

async function translateChunk(texts: string[], strict = false) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey || !texts.length) return;
  calls += 1;
  const long = texts.some((text) => text.length > LONG_TEXT);
  const rules = strict
    ? "These are short-drama titles. Translate every English title into natural Indonesian. Do not return the English wording unchanged unless the entire string is only a personal name."
    : "Translate short-drama titles, descriptions, genres, and labels into natural Indonesian. Do not leave an English title or sentence unchanged. Keep personal names, place names, and brand names. Keep numbers. If a string is already natural Indonesian, return it unchanged.";
  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(long ? 25_000 : 22_000),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0,
        reasoning_effort: "low",
        max_tokens: long ? 4096 : 1800,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `${rules} Return JSON {"items": string[]} with exactly the same length and order as the input. No commentary.`,
          },
          { role: "user", content: JSON.stringify({ items: texts }) },
        ],
      }),
    });
    if (!response.ok) return;
    const body = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const content = body.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(content) as { items?: unknown };
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    if (items.length !== texts.length) return;
    const retry: string[] = [];
    texts.forEach((original, index) => {
      const next = items[index];
      if (typeof next !== "string" || !next.trim()) return;
      if (echoedEnglish(original, next)) {
        if (strict) skipped.add(cacheKey(original));
        else retry.push(original);
        return;
      }
      remember(original, cacheKey(next), "translated");
    });
    persist();
    if (!strict && retry.length) await translateChunk(retry, true);
  } catch {
    // Leave the batch untranslated so a later visit can retry.
  }
}

const pending = new Map<string, number>();
let draining: Promise<void> | null = null;

function enqueue(values: string[], rank: number) {
  for (const value of values) {
    const key = cacheKey(value);
    if (!needsModel(key)) continue;
    const current = pending.get(key);
    if (current == null || rank < current) pending.set(key, rank);
  }
}

function takeChunk(preferLong: boolean) {
  for (const key of [...pending.keys()]) {
    if (!needsModel(key)) pending.delete(key);
  }
  const entries = [...pending.entries()];
  const shorts = entries
    .filter(([text]) => text.length <= LONG_TEXT)
    .sort((a, b) => a[1] - b[1] || a[0].length - b[0].length);
  const longs = entries.filter(([text]) => text.length > LONG_TEXT).sort((a, b) => a[1] - b[1]);
  const source = preferLong && longs.length ? longs : shorts.length ? shorts : longs;
  const chunk = source.slice(0, source === longs ? MAX_LONG : MAX_SHORT).map(([text]) => text);
  for (const text of chunk) pending.delete(text);
  return chunk;
}

function kick() {
  if (draining) return draining;
  draining = (async () => {
    try {
      await Promise.resolve();
      let used = 0;
      while (used < MAX_CALLS_PER_PASS && canCall()) {
        const chunk = takeChunk(used > 0);
        if (!chunk.length) break;
        used += 1;
        await translateChunk(chunk);
      }
    } finally {
      draining = null;
    }
  })();
  return draining;
}

async function ensureTranslated(values: string[], rank = 0) {
  loadCache();
  const mine = [...new Set(values.map(cacheKey).filter((value) => needsModel(value)))];
  enqueue(mine, rank);
  if (!pending.size) return;
  const job = kick();
  const deadline = Date.now() + 1_200;
  while (Date.now() < deadline) {
    if (mine.length && mine.every((value) => !needsModel(value))) return;
    if (!draining) return;
    await Promise.race([job, new Promise((resolve) => setTimeout(resolve, 200))]);
  }
}

function asOriginal(card: DramaCard): DramaCard {
  const originalTitle = card.originalTitle || card.title;
  const originalDescription = card.originalDescription ?? card.description;
  return {
    ...card,
    originalTitle,
    originalDescription,
    displayTitle: originalTitle,
    displayDescription: originalDescription,
    title: originalTitle,
    description: originalDescription,
    translationStatus: "original",
  };
}

function wantsDescription(card: DramaCard, withDescription: boolean | ReadonlySet<string>) {
  return typeof withDescription === "boolean" ? withDescription : withDescription.has(dramaKey(card));
}

export async function localizeCards(
  cards: DramaCard[],
  lang: string,
  withDescription: boolean | ReadonlySet<string> = false,
): Promise<DramaCard[]> {
  if (!wantsIndonesian(lang)) return cards.map(asOriginal);
  const titles: string[] = [];
  const labels: string[] = [];
  const descriptions: string[] = [];
  for (const card of cards) {
    titles.push(card.originalTitle || card.title);
    labels.push(...card.tags, ...(card.badge ? [card.badge] : []));
    const description = card.originalDescription ?? card.description;
    if (wantsDescription(card, withDescription) && description) descriptions.push(description.slice(0, 700));
  }
  enqueue(titles, 0);
  enqueue(descriptions, 1);
  enqueue(labels, 2);
  await ensureTranslated([]);
  return cards.map((card) => {
    const originalTitle = card.originalTitle || card.title;
    const originalDescription = card.originalDescription ?? card.description;
    const titleHit = resolve(originalTitle);
    const includeDescription = wantsDescription(card, withDescription);
    const descriptionSource = includeDescription && originalDescription ? originalDescription.slice(0, 700) : null;
    const descriptionHit = descriptionSource ? resolve(descriptionSource) : null;
    return {
      ...card,
      originalTitle,
      originalDescription,
      displayTitle: titleHit.text,
      displayDescription: descriptionHit?.text ?? originalDescription,
      title: titleHit.text,
      description: descriptionHit?.text ?? originalDescription,
      translationStatus: titleHit.status,
      tags: card.tags.map((tag) => resolve(tag).text),
      badge: card.badge ? resolve(card.badge).text : card.badge,
    };
  });
}

export async function localizeEpisodes(episodes: Episode[], lang: string): Promise<Episode[]> {
  if (!wantsIndonesian(lang)) {
    return episodes.map((episode) => ({
      ...episode,
      originalTitle: episode.originalTitle || episode.title,
      displayTitle: episode.originalTitle || episode.title,
      title: episode.originalTitle || episode.title,
      translationStatus: "original" as const,
    }));
  }
  await ensureTranslated(episodes.map((episode) => episode.originalTitle || episode.title));
  return episodes.map((episode) => {
    const originalTitle = episode.originalTitle || episode.title;
    const hit = resolve(originalTitle);
    return { ...episode, originalTitle, displayTitle: hit.text, title: hit.text, translationStatus: hit.status };
  });
}

export async function localizeTexts(values: string[], lang: string) {
  if (!wantsIndonesian(lang)) return values;
  await ensureTranslated(values);
  return values.map((value) => resolve(value).text);
}

export function englishQueriesFor(query: string) {
  loadCache();
  const needle = cacheKey(query).toLowerCase();
  if (needle.length < 4) return [];
  const exact: string[] = [];
  const partial: string[] = [];
  for (const [original, entry] of memory) {
    const translated = entry.text.toLowerCase();
    if (translated === needle) exact.push(original);
    else if (
      needle.length >= 8 &&
      translated.length >= 8 &&
      (translated.includes(needle) || needle.includes(translated))
    ) {
      partial.push(original);
    }
    if (exact.length >= 2) break;
  }
  return [...exact, ...partial].slice(0, 2);
}

export function displayFromCache(values: string[], lang: string) {
  loadCache();
  const out: Record<string, string> = {};
  for (const value of values) {
    const key = cacheKey(value);
    if (!wantsIndonesian(lang)) {
      let original = key;
      for (const [source, entry] of memory) {
        if (entry.text.toLowerCase() === key.toLowerCase()) {
          original = source;
          break;
        }
      }
      out[value] = original;
      continue;
    }
    out[value] = resolve(key).text;
  }
  return out;
}
