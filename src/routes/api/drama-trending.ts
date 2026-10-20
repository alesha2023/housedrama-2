import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { PROVIDERS, type DramaCard, type ProviderId } from "@/lib/drama/types";

let tableReady: ReturnType<typeof ensureTrendingTableInternal> | undefined;
async function ensureTrendingTableInternal() {

  const sql = await getSql();
  await sql.query(`
    CREATE TABLE IF NOT EXISTS housedrama_drama_views (
      provider TEXT NOT NULL,
      series_id TEXT NOT NULL,
      title TEXT NOT NULL,
      poster_url TEXT,
      view_count BIGINT NOT NULL DEFAULT 0,
      last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (provider, series_id)
    )
  `);
  return sql;
}
async function ensureTable() {
  if (!tableReady) {
    tableReady = ensureTrendingTableInternal().catch((error) => { tableReady = undefined; throw error; });
  }
  return tableReady;
}
async function handleGet() {
  try {
    const sql = await ensureTable();
    const rows = await sql.query<{
      provider: string; series_id: string; title: string; poster_url: string | null; view_count: number | string;
    }>(`SELECT provider, series_id, title, poster_url, view_count
        FROM housedrama_drama_views ORDER BY view_count DESC, last_viewed_at DESC LIMIT 12`);
    const items: DramaCard[] = rows
      .filter((row) => (PROVIDERS as readonly string[]).includes(row.provider))
      .map((row) => ({
        provider: row.provider as ProviderId,
        seriesId: row.series_id,
        title: row.title,
        posterUrl: row.poster_url,
        bannerUrl: null,
        description: null,
        tags: [],
        language: null,
        episodeCount: null,
        completed: null,
        scoreLabel: null,
        playCount: `${Number(row.view_count).toLocaleString("en-US")} ditonton di HouseDrama`,
        badge: "Trending di HouseDrama",
        firstEpisodeId: null,
      }));
    return Response.json({ items }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("[drama-trending] read failed:", error);
    return Response.json({ items: [] }, { headers: { "cache-control": "no-store" } });
  }
}

async function handlePost({ request }: { request: Request }) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const provider = typeof body.provider === "string" ? body.provider : "";
    const seriesId = typeof body.seriesId === "string" ? body.seriesId.trim() : "";
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 240) : "";
    const posterUrl = typeof body.posterUrl === "string" ? body.posterUrl.slice(0, 2000) : "";
    if (!(PROVIDERS as readonly string[]).includes(provider) || !seriesId || seriesId.length > 180 || !title) {
      return Response.json({ error: "Invalid drama view" }, { status: 400 });
    }
    if (posterUrl) {
      try {
        const parsed = new URL(posterUrl);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("invalid protocol");
      } catch {
        return Response.json({ error: "Invalid poster URL" }, { status: 400 });
      }
    }
    const sql = await ensureTable();
    await sql.query(
      `INSERT INTO housedrama_drama_views (provider, series_id, title, poster_url, view_count, last_viewed_at)
       VALUES ($1, $2, $3, $4, 1, NOW())
       ON CONFLICT (provider, series_id) DO UPDATE SET
         title = EXCLUDED.title,
         poster_url = COALESCE(NULLIF(EXCLUDED.poster_url, ''), housedrama_drama_views.poster_url),
         view_count = housedrama_drama_views.view_count + 1,
         last_viewed_at = NOW()`,
      [provider, seriesId, title, posterUrl],
    );
    return Response.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("[drama-trending] write failed:", error);
    return Response.json({ error: "Could not record drama view" }, { status: 503 });
  }
}

export const Route = createFileRoute("/api/drama-trending")({
  server: { handlers: { GET: handleGet, POST: handlePost } },
});
