import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PROVIDERS } from "./types";

const providerSchema = z.enum(["all", ...PROVIDERS]);

export const getLocalizedHomeData = createServerFn({ method: "GET" })
  .validator(z.object({ lang: z.enum(["en", "id"]) }))
  .handler(async ({ data }) => {
    const { loadHome } = await import("./server/catalog");
    // Explicit /en and /id SEO landing pages must remain stable regardless of visitor IP.
    return loadHome(data.lang, "all");
  });

export const getHomeData = createServerFn({ method: "GET" })
  .validator(
    z.object({
      lang: z.string().min(2).max(12).default("id"),
      provider: z.enum(["all", ...PROVIDERS]).default("all"),
    }),
  )
  .handler(async ({ data }) => {
    const { loadHome } = await import("./server/catalog");
    const { resolveCatalogLang } = await import("./server/locale");
    return loadHome(await resolveCatalogLang(data.lang), data.provider);
  });

export const getBrowseData = createServerFn({ method: "GET" })
  .validator(
    z.object({
      lang: z.string().min(2).max(12).default("id"),
      provider: providerSchema.default("all"),
      page: z.number().int().min(1).max(20).default(1),
      rail: z.string().max(40).nullable().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { loadBrowse } = await import("./server/catalog");
    const { resolveCatalogLang } = await import("./server/locale");
    return loadBrowse({
      lang: await resolveCatalogLang(data.lang),
      provider: data.provider,
      page: data.page,
      rail: data.rail ?? null,
    });
  });

export const getSearchData = createServerFn({ method: "GET" })
  .validator(
    z.object({
      q: z.string().max(80).default(""),
      lang: z.string().min(2).max(12).default("id"),
      provider: providerSchema.default("all"),
      page: z.number().int().min(1).max(20).default(1),
    }),
  )
  .handler(async ({ data }) => {
    const { loadSearch } = await import("./server/catalog");
    const { resolveCatalogLang } = await import("./server/locale");
    return loadSearch({ ...data, lang: await resolveCatalogLang(data.lang) });
  });

export const getShortsData = createServerFn({ method: "GET" })
  .validator(
    z.object({
      lang: z.string().min(2).max(12).default("id"),
      page: z.number().int().min(1).max(20).default(1),
    }),
  )
  .handler(async ({ data }) => {
    const { loadShorts } = await import("./server/catalog");
    const { resolveCatalogLang } = await import("./server/locale");
    return loadShorts(data.page, await resolveCatalogLang(data.lang));
  });

export const getDetailData = createServerFn({ method: "GET" })
  .validator(
    z.object({
      provider: z.enum(PROVIDERS),
      seriesId: z.string().min(1).max(80),
      lang: z.string().min(2).max(12).default("id"),
    }),
  )
  .handler(async ({ data }) => {
    const { loadDetail } = await import("./server/catalog");
    const { resolveCatalogLang } = await import("./server/locale");
    return loadDetail(data.provider, data.seriesId, await resolveCatalogLang(data.lang));
  });

export const getWatchData = createServerFn({ method: "GET" })
  .validator(
    z.object({
      provider: z.enum(PROVIDERS),
      seriesId: z.string().min(1).max(80),
      episodeId: z.string().min(1).max(80),
      lang: z.string().min(2).max(12).default("id"),
    }),
  )
  .handler(async ({ data }) => {
    const { loadPlayback } = await import("./server/catalog");
    const { resolveCatalogLang } = await import("./server/locale");
    return loadPlayback(data.provider, data.seriesId, data.episodeId, await resolveCatalogLang(data.lang));
  });

export const getStreamData = createServerFn({ method: "GET" })
  .validator(
    z.object({
      provider: z.enum(PROVIDERS),
      seriesId: z.string().min(1).max(80),
      episodeId: z.string().min(1).max(80),
      lang: z.string().min(2).max(12).default("id"),
    }),
  )
  .handler(async ({ data }) => {
    const { loadStream } = await import("./server/catalog");
    const { resolveCatalogLang } = await import("./server/locale");
    return loadStream(data.provider, data.seriesId, data.episodeId, await resolveCatalogLang(data.lang));
  });

export const lookupDisplays = createServerFn({ method: "POST" })
  .validator(z.object({ lang: z.string().min(2).max(12), titles: z.array(z.string().max(180)).max(40) }))
  .handler(async ({ data }) => {
    const { displayFromCache } = await import("./server/localize");
    return displayFromCache(data.titles, data.lang);
  });

export const reportPlayback = createServerFn({ method: "POST" })
  .validator(z.object({ provider: z.enum(PROVIDERS), ok: z.boolean() }))
  .handler(async ({ data }) => {
    const { recordPlayback } = await import("./server/metrics");
    recordPlayback(data.provider, data.ok);
    return { ok: true };
  });

export const adminLogin = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1).max(80) }))
  .handler(async ({ data }) => {
    const { loginAdmin } = await import("./server/metrics");
    const token = loginAdmin(data.password);
    return token ? { ok: true as const, token } : { ok: false as const, token: null };
  });

export const getAdminData = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string().min(8) }))
  .handler(async ({ data }) => {
    const { snapshot, verifyAdminToken, pingSafe } = await import("./server/admin");
    if (!verifyAdminToken(data.token)) return { ok: false as const, snapshot: null };
    return { ok: true as const, snapshot: await snapshot(pingSafe) };
  });

export const updateAdminSettings = createServerFn({ method: "POST" })
  .validator(
    z.object({
      token: z.string().min(8),
      provider: z.enum(PROVIDERS).optional(),
      enabled: z.boolean().optional(),
      section: z.string().max(40).optional(),
      sectionEnabled: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { applySettings } = await import("./server/admin");
    return applySettings(data);
  });


export const testFreeReelsApi = createServerFn({ method: "POST" })
  .validator(z.object({
    token: z.string().min(8),
    baseUrl: z.string().url().max(300).default("https://freereels.narto-drama.com/api"),
  }))
  .handler(async ({ data }) => {
    const { verifyAdminToken } = await import("./server/admin");
    if (!verifyAdminToken(data.token)) return { ok: false as const, error: "Sesi admin berakhir. Login kembali." };

    let parsed: URL;
    try { parsed = new URL(data.baseUrl); } catch {
      return { ok: false as const, error: "URL API tidak valid.", checks: [] };
    }
    if (parsed.protocol !== "https:" || parsed.hostname !== "freereels.narto-drama.com") {
      return { ok: false as const, error: "Demi keamanan, pemeriksaan hanya diizinkan untuk freereels.narto-drama.com melalui HTTPS.", checks: [] };
    }
    const base = `${parsed.origin}${parsed.pathname.replace(/\/+$/, "")}`;
    const endpoints = [
      { path: "/health", label: "Health" },
      { path: "/get-languages", label: "Bahasa" },
      { path: "/get-channels", label: "Channel" },
      { path: "/get-foryou", label: "For You" },
      { path: "/search?keyword=love", label: "Search" },
    ];
    const checks = await Promise.all(endpoints.map(async ({ path, label }) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 9000);
      const started = Date.now();
      try {
        const response = await fetch(`${base}${path}`, {
          method: "GET",
          headers: { accept: "application/json" },
          signal: controller.signal,
          cache: "no-store",
        });
        const text = await response.text();
        let json: unknown = null;
        try { json = JSON.parse(text); } catch { /* Report non-JSON responses below. */ }
        const jsonOk = json !== null && (typeof json === "object" || Array.isArray(json));
        return { label, path, status: response.status, ok: response.ok && jsonOk, ms: Date.now() - started, detail: !response.ok ? `HTTP ${response.status}` : jsonOk ? "Respons JSON diterima" : "Respons bukan JSON" };
      } catch (error) {
        return { label, path, status: 0, ok: false, ms: Date.now() - started, detail: error instanceof Error && error.name === "AbortError" ? "Timeout 9 detik" : error instanceof Error ? error.message : "Request gagal" };
      } finally {
        clearTimeout(timer);
      }
    }));
    return { ok: checks.some((item) => item.ok), baseUrl: base, checks };
  });
