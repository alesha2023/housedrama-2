import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PROVIDERS } from "./types";

const providerSchema = z.enum(["all", ...PROVIDERS]);

export const getHomeData = createServerFn({ method: "GET" })
  .validator(
    z.object({
      lang: z.string().min(2).max(12).default("id"),
      provider: z.enum(["all", ...PROVIDERS]).default("all"),
    }),
  )
  .handler(async ({ data }) => {
    const { loadHome } = await import("./server/catalog");
    return loadHome(data.lang, data.provider);
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
    return loadBrowse({
      lang: data.lang,
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
    return loadSearch(data);
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
    return loadShorts(data.page, data.lang);
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
    return loadDetail(data.provider, data.seriesId, data.lang);
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
    return loadPlayback(data.provider, data.seriesId, data.episodeId, data.lang);
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
    return loadStream(data.provider, data.seriesId, data.episodeId, data.lang);
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
