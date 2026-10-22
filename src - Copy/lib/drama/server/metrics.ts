import { createHmac, timingSafeEqual } from "node:crypto";
import type { AdminProviderStat, AdminSnapshot, ProviderId } from "../types";
import { PROVIDERS } from "../types";

export const SECTION_IDS = [
  "featured",
  "trending",
  "popular",
  "latest",
  "new",
  "recommended",
  "romance",
  "revenge",
  "billionaire",
  "ceo",
  "historical",
  "fantasy",
  "family",
  "comedy",
  "completed",
  "anyreel",
  "dramabox",
  "freereels",
] as const;

type Bucket = {
  ok: number;
  fail: number;
  totalMs: number;
  lastOkAt: number | null;
  lastError: string | null;
  lastMs: number | null;
  playbackOk: number;
  playbackFail: number;
};

type State = {
  buckets: Record<ProviderId, Bucket>;
  enabled: Record<ProviderId, boolean>;
  sections: Record<string, boolean>;
  cacheEntries: number;
};

const g = globalThis as typeof globalThis & { __dramalumaMetrics?: State };

function emptyBucket(): Bucket {
  return {
    ok: 0,
    fail: 0,
    totalMs: 0,
    lastOkAt: null,
    lastError: null,
    lastMs: null,
    playbackOk: 0,
    playbackFail: 0,
  };
}

function state(): State {
  if (!g.__dramalumaMetrics) {
    const buckets = {} as Record<ProviderId, Bucket>;
    const enabled = {} as Record<ProviderId, boolean>;
    for (const id of PROVIDERS) {
      buckets[id] = emptyBucket();
      enabled[id] = true;
    }
    const sections: Record<string, boolean> = {};
    for (const id of SECTION_IDS) sections[id] = true;
    g.__dramalumaMetrics = { buckets, enabled, sections, cacheEntries: 0 };
  }
  return g.__dramalumaMetrics;
}

function bucketFor(id: ProviderId) {
  const current = state();
  if (!current.buckets[id]) current.buckets[id] = emptyBucket();
  if (current.enabled[id] === undefined) current.enabled[id] = true;
  return current.buckets[id];
}

export function providerEnabled(id: ProviderId) {
  const current = state();
  if (current.enabled[id] === undefined) current.enabled[id] = true;
  return current.enabled[id] !== false;
}

export function sectionEnabled(id: string) {
  return state().sections[id] !== false;
}

export function recordSuccess(id: ProviderId, ms: number) {
  const bucket = bucketFor(id);
  bucket.ok += 1;
  bucket.totalMs += ms;
  bucket.lastMs = ms;
  bucket.lastOkAt = Date.now();
  bucket.lastError = null;
}

export function recordFailure(id: ProviderId, error: unknown) {
  const bucket = bucketFor(id);
  bucket.fail += 1;
  bucket.lastError = error instanceof Error ? error.message : "Request failed";
}

export function recordPlayback(id: ProviderId, ok: boolean) {
  const bucket = bucketFor(id);
  if (ok) bucket.playbackOk += 1;
  else bucket.playbackFail += 1;
}

export function setCacheEntries(count: number) {
  state().cacheEntries = count;
}

export function snapshot(): AdminSnapshot {
  const current = state();
  const providers: AdminProviderStat[] = PROVIDERS.map((id) => {
    const bucket = current.buckets[id] ?? emptyBucket();
    return {
      id,
      enabled: current.enabled[id] !== false,
      okCount: bucket.ok,
      failCount: bucket.fail,
      avgMs: bucket.ok ? Math.round(bucket.totalMs / bucket.ok) : null,
      lastMs: bucket.lastMs,
      lastOkAt: bucket.lastOkAt,
      lastError: bucket.lastError,
      playbackOk: bucket.playbackOk,
      playbackFail: bucket.playbackFail,
    };
  });
  return {
    providers,
    cacheEntries: current.cacheEntries,
    sections: SECTION_IDS.map((id) => ({ id, enabled: current.sections[id] !== false })),
    generatedAt: Date.now(),
  };
}

export function setProviderEnabled(id: ProviderId, enabled: boolean) {
  state().enabled[id] = enabled;
}

export function setSectionEnabled(id: string, enabled: boolean) {
  if ((SECTION_IDS as readonly string[]).includes(id)) state().sections[id] = enabled;
}

function adminPassword() {
  const configured = process.env.DRAMA_ADMIN_PASSWORD;
  if (configured) return configured;
  return "171093Lt$";
}

function adminSecret() {
  const configured = process.env.DRAMA_ADMIN_SECRET;
  if (configured) return configured;
  return "dramaluma-session";
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function loginAdmin(password: string) {
  const configuredPassword = adminPassword();
  const secret = adminSecret();
  const given = password.trim();
  if (!configuredPassword || !secret || !safeEqual(given, configuredPassword)) return null;
  const exp = Date.now() + 1000 * 60 * 60 * 12;
  const payload = String(exp);
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token: string | null | undefined) {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const secret = adminSecret();
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  if (!safeEqual(sig, expected)) return false;
  return Number(payload) > Date.now();
}
