import type { ProviderId } from "./types";

export type SavedDrama = {
  provider: ProviderId;
  seriesId: string;
  title: string;
  originalTitle?: string;
  posterUrl: string | null;
  episodeCount: number | null;
  savedAt: number;
};

export type HistoryEntry = {
  provider: ProviderId;
  seriesId: string;
  episodeId: string;
  episodeLabel: string;
  title: string;
  originalTitle?: string;
  posterUrl: string | null;
  positionSec: number;
  durationSec: number | null;
  updatedAt: number;
};

const WATCHLIST = "dramaluma.watchlist";
const HISTORY = "dramaluma.history";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("dramaluma-library"));
}

export function readWatchlist() {
  return read<SavedDrama[]>(WATCHLIST, []);
}

export function toggleWatchlist(item: SavedDrama) {
  const current = readWatchlist();
  const exists = current.some((entry) => entry.provider === item.provider && entry.seriesId === item.seriesId);
  const next = exists
    ? current.filter((entry) => !(entry.provider === item.provider && entry.seriesId === item.seriesId))
    : [item, ...current].slice(0, 80);
  write(WATCHLIST, next);
  return next;
}

export function readHistory() {
  return read<HistoryEntry[]>(HISTORY, []).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function upsertHistory(entry: HistoryEntry) {
  const current = readHistory().filter(
    (item) => !(item.provider === entry.provider && item.seriesId === entry.seriesId),
  );
  const next = [entry, ...current].slice(0, 60);
  write(HISTORY, next);
  return next;
}

export function progressKey(provider: string, seriesId: string, episodeId: string) {
  return `dramaluma.pos.${provider}.${seriesId}.${episodeId}`;
}

export function readProgress(provider: string, seriesId: string, episodeId: string) {
  if (typeof window === "undefined") return 0;
  const value = Number(localStorage.getItem(progressKey(provider, seriesId, episodeId)) || 0);
  return Number.isFinite(value) ? value : 0;
}

export function writeProgress(provider: string, seriesId: string, episodeId: string, seconds: number) {
  localStorage.setItem(progressKey(provider, seriesId, episodeId), String(Math.floor(seconds)));
}
