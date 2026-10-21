import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { recordVisitorDay } from "@/lib/drama/server/audience";

let tableReady: Promise<Awaited<ReturnType<typeof getSql>>> | undefined;

async function ensureTable() {
  tableReady ??= (async () => {
    const sql = await getSql();
    await sql.query(`
    CREATE TABLE IF NOT EXISTS housedrama_visitors (
      visitor_id TEXT PRIMARY KEY,
      first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_visit_date DATE NOT NULL DEFAULT (timezone('Asia/Jakarta', now())::date)
    )
    `);
    return sql;
  })().catch((error) => {
    tableReady = undefined;
    throw error;
  });
  return tableReady;
}

async function counts(sql: Awaited<ReturnType<typeof getSql>>) {
  const rows = await sql.query<{ total: string | number; today: string | number; online: string | number }>(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (
        WHERE last_visit_date = timezone('Asia/Jakarta', now())::date
      )::int AS today,
      COUNT(*) FILTER (WHERE last_seen >= NOW() - INTERVAL '90 seconds')::int AS online
    FROM housedrama_visitors
  `);
  return {
    total: Number(rows[0]?.total ?? 0),
    today: Number(rows[0]?.today ?? 0),
    online: Number(rows[0]?.online ?? 0),
  };
}

async function handleGet() {
  try {
    const sql = await ensureTable();
    return Response.json(await counts(sql), {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    console.error("[visitor-count] read failed:", error);
    return Response.json({ error: "Visitor count unavailable" }, { status: 503 });
  }
}

async function handlePost({ request }: { request: Request }) {
  try {
    const body = (await request.json()) as { visitorId?: unknown };
    const visitorId = typeof body.visitorId === "string" ? body.visitorId : "";
    if (!/^[a-zA-Z0-9-]{16,80}$/.test(visitorId)) {
      return Response.json({ error: "Invalid visitor id" }, { status: 400 });
    }
    const sql = await ensureTable();
    await sql.query(
      `INSERT INTO housedrama_visitors (visitor_id, last_visit_date)
       VALUES ($1, timezone('Asia/Jakarta', now())::date)
       ON CONFLICT (visitor_id) DO UPDATE
       SET last_seen = NOW(),
           last_visit_date = timezone('Asia/Jakarta', now())::date`,
      [visitorId],
    );
    try {
      await recordVisitorDay(visitorId);
    } catch (error) {
      console.error("[visitor-count] daily row failed:", error);
    }
    return Response.json(await counts(sql), {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    console.error("[visitor-count] update failed:", error);
    return Response.json({ error: "Visitor count unavailable" }, { status: 503 });
  }
}

export const Route = createFileRoute("/api/visitor-count")({
  server: { handlers: { GET: handleGet, POST: handlePost } },
});
