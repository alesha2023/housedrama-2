import type { ProviderId } from "../types";
import { providerOrigin } from "../providers";
import { providerEnabled, recordFailure, recordSuccess, setCacheEntries } from "./metrics";

type CacheEntry = { exp: number; data: unknown };

const g = globalThis as typeof globalThis & {
  __dramalumaCache?: Map<string, CacheEntry>;
  __dramalumaInflight?: Map<string, Promise<unknown>>;
};

function cache() {
  g.__dramalumaCache ??= new Map();
  return g.__dramalumaCache;
}

function inflight() {
  g.__dramalumaInflight ??= new Map();
  return g.__dramalumaInflight;
}

export function providerBase(id: ProviderId) {
  if (id === "anyreel" && process.env.ANYREEL_API_URL) return process.env.ANYREEL_API_URL.replace(/\/$/, "");
  if (id === "dramabox" && process.env.DRAMABOX_API_URL) return process.env.DRAMABOX_API_URL.replace(/\/$/, "");
  if (id === "freereels" && process.env.FREEREELS_API_URL) return process.env.FREEREELS_API_URL.replace(/\/$/, "");
  return providerOrigin(id);
}

export class ProviderDisabledError extends Error {
  constructor(id: ProviderId) {
    super(`${id} is disabled`);
    this.name = "ProviderDisabledError";
  }
}

function prune() {
  const now = Date.now();
  const store = cache();
  for (const [key, entry] of store) {
    if (entry.exp <= now) store.delete(key);
  }
  setCacheEntries(store.size);
}

export async function providerFetch<T>(
  id: ProviderId,
  path: string,
  opts?: { timeout?: number; cacheTtl?: number; cacheKey?: string; retries?: number },
): Promise<T> {
  if (!providerEnabled(id)) throw new ProviderDisabledError(id);
  const url = `${providerBase(id)}${path.startsWith("/") ? path : `/${path}`}`;
  const key = opts?.cacheKey ?? url;
  const ttl = opts?.cacheTtl ?? 0;
  if (ttl > 0) {
    const hit = cache().get(key);
    if (hit && hit.exp > Date.now()) return hit.data as T;
  }
  const pending = inflight().get(key);
  if (pending) return pending as Promise<T>;

  const job = (async () => {
    let lastError: unknown;
    const retries = Math.max(0, Math.min(2, opts?.retries ?? 1));
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const started = Date.now();
      try {
        const response = await fetch(url, {
          headers: { accept: "application/json", "user-agent": "HouseDrama/1.0" },
          signal: AbortSignal.timeout(opts?.timeout ?? 5500),
        });
        if (!response.ok) throw new Error(`${id} HTTP ${response.status}`);
        const data = (await response.json()) as T;
        recordSuccess(id, Date.now() - started);
        if (ttl > 0) {
          cache().set(key, { exp: Date.now() + ttl, data });
          prune();
        }
        return data;
      } catch (error) {
        lastError = error;
        if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
    recordFailure(id, lastError);
    throw lastError instanceof Error ? lastError : new Error("Provider request failed");
  })();

  inflight().set(key, job);
  try {
    return await job;
  } finally {
    inflight().delete(key);
  }
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function str(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

export function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

export function tagList(value: unknown): string[] {
  const out: string[] = [];
  for (const item of asArray(value)) {
    if (typeof item === "string" && item.trim()) {
      out.push(item.trim());
      continue;
    }
    const record = asRecord(item);
    const name = str(record?.tagName) || str(record?.tagEnName) || str(record?.nameEn) || str(record?.name) || str(record?.nameCn);
    if (name) out.push(name);
  }
  return [...new Set(out)].slice(0, 8);
}

export function absoluteUrl(value: unknown, fallbackBase?: string): string | null {
  const raw = str(value);
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw.replace(/^http:\/\//i, "https://");
  if (raw.startsWith("//")) return `https:${raw}`;
  if (fallbackBase && !raw.includes(" ")) return `${fallbackBase.replace(/\/$/, "")}/${raw.replace(/^\//, "")}`;
  return null;
}

export function enc(value: string) {
  return encodeURIComponent(value);
}

export function dbLang(lang: string) {
  if (lang === "id") return "in";
  if (lang === "zh") return "zh-Hant";
  return lang || "en";
}

export function frLang(lang: string) {
  if (lang === "id") return "id-ID";
  if (lang === "en") return "en-US";
  if (lang === "zh") return "zh-TW";
  return lang.includes("-") ? lang : "en-US";
}

export function guessFormat(url: string): "hls" | "mp4" {
  return /\.m3u8(\?|$)/i.test(url) || /mpegurl/i.test(url) ? "hls" : "mp4";
}

export function upgradeHttps(url: string) {
  return url.replace(/^http:\/\//i, "https://");
}
