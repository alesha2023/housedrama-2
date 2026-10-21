import { getSql } from "@/lib/db";
import { fillDaily, jakartaDates, type AudienceDay } from "./audience-dates";

export type { AudienceDay };
export type AudienceDrama = { provider: string; seriesId: string; title: string; views: number };
export type AudienceReport = {
  generatedAt: string;
  totalVisitors: number;
  visitedToday: number;
  online: number;
  uniqueLast7Days: number;
  uniqueLast30Days: number;
  firstRecordedDay: string | null;
  daily: AudienceDay[];
  topDramas: AudienceDrama[];
  pageViews: null;
};

let daysReady: Promise<void> | undefined;

async function ensureDays() {
  daysReady ??= (async () => {
    const sql = await getSql();
    await sql.query(`
      CREATE TABLE IF NOT EXISTS housedrama_visitor_days (
        visit_date DATE NOT NULL,
        visitor_id TEXT NOT NULL,
        PRIMARY KEY (visit_date, visitor_id)
      )
    `);
  })().catch((error) => {
    daysReady = undefined;
    throw error;
  });
  return daysReady;
}

/** One row per visitor per Jakarta calendar day. Does not touch the existing visitor table. */
export async function recordVisitorDay(visitorId: string) {
  await ensureDays();
  const sql = await getSql();
  await sql.query(
    `INSERT INTO housedrama_visitor_days (visit_date, visitor_id)
     VALUES (timezone('Asia/Jakarta', now())::date, $1)
     ON CONFLICT DO NOTHING`,
    [visitorId],
  );
}

export async function readAudience(): Promise<AudienceReport> {
  await ensureDays();
  const sql = await getSql();
  const [summary, first, dailyRows, week, month, dramas, todayRow] = await Promise.all([
    sql.query<{ total: number | string; today: number | string; online: number | string }>(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE last_visit_date = timezone('Asia/Jakarta', now())::date)::int AS today,
        COUNT(*) FILTER (WHERE last_seen >= NOW() - INTERVAL '90 seconds')::int AS online
      FROM housedrama_visitors
    `),
    sql.query<{ first_day: string | null }>(`SELECT MIN(visit_date)::text AS first_day FROM housedrama_visitor_days`),
    sql.query<{ day: string; visitors: number | string }>(`
      SELECT visit_date::text AS day, COUNT(*)::int AS visitors
      FROM housedrama_visitor_days
      WHERE visit_date >= timezone('Asia/Jakarta', now())::date - 29
      GROUP BY visit_date
      ORDER BY visit_date
    `),
    sql.query<{ visitors: number | string }>(`
      SELECT COUNT(DISTINCT visitor_id)::int AS visitors
      FROM housedrama_visitor_days
      WHERE visit_date >= timezone('Asia/Jakarta', now())::date - 6
    `),
    sql.query<{ visitors: number | string }>(`
      SELECT COUNT(DISTINCT visitor_id)::int AS visitors
      FROM housedrama_visitor_days
      WHERE visit_date >= timezone('Asia/Jakarta', now())::date - 29
    `),
    sql.query<{ provider: string; series_id: string; title: string; view_count: number | string }>(`
      SELECT provider, series_id, title, view_count
      FROM housedrama_drama_views
      ORDER BY view_count DESC, last_viewed_at DESC
      LIMIT 8
    `),
    sql.query<{ today: string }>(`SELECT timezone('Asia/Jakarta', now())::date::text AS today`),
  ]);
  const today = todayRow[0]?.today ?? new Date().toISOString().slice(0, 10);
  return {
    generatedAt: new Date().toISOString(),
    totalVisitors: Number(summary[0]?.total ?? 0),
    visitedToday: Number(summary[0]?.today ?? 0),
    online: Number(summary[0]?.online ?? 0),
    uniqueLast7Days: Number(week[0]?.visitors ?? 0),
    uniqueLast30Days: Number(month[0]?.visitors ?? 0),
    firstRecordedDay: first[0]?.first_day ?? null,
    daily: fillDaily(jakartaDates(30, today), dailyRows.map((row) => ({ date: row.day, visitors: Number(row.visitors) }))),
    topDramas: dramas.map((row) => ({
      provider: row.provider,
      seriesId: row.series_id,
      title: row.title,
      views: Number(row.view_count),
    })),
    pageViews: null,
  };
}
