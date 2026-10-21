import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PageIntro } from "@/components/drama/cards";
import { adminLogin, getAdminData, testFreeReelsApi, updateAdminSettings } from "@/lib/drama/api";
import type { ProviderId } from "@/lib/drama/types";

type Snapshot = Awaited<ReturnType<typeof getAdminData>>;

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — HouseDrama" },
      { name: "description", content: "Private HouseDrama admin console." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

type AudienceView = {
  generatedAt: string;
  totalVisitors: number;
  visitedToday: number;
  online: number;
  uniqueLast7Days: number;
  uniqueLast30Days: number;
  firstRecordedDay: string | null;
  daily: { date: string; visitors: number }[];
  topDramas: { provider: string; seriesId: string; title: string; views: number }[];
  pageViews: null;
};

function AudiencePanel({ audience }: { audience: AudienceView | null }) {
  if (!audience) {
    return <p className="rounded-card border border-line p-4 text-sm">Visitor history is unavailable. The public counters are unchanged.</p>;
  }
  const peak = Math.max(1, ...audience.daily.map((day) => day.visitors));
  return (
    <section className="rounded-card border border-line p-4 sm:p-5">
      <h2 className="text-xl font-semibold">Visitors</h2>
      <p className="mt-1 text-sm text-muted">Updated {new Date(audience.generatedAt).toLocaleString("en-GB", { hour12: false, timeZone: "Asia/Jakarta" })} WIB. These are database counts, not sample numbers.</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Unique visitors" value={audience.totalVisitors} note="One row per browser id, all stored history." />
        <Stat label="Visited today" value={audience.visitedToday} note="Ids whose latest visit date is today in Jakarta." />
        <Stat label="Online" value={audience.online} note="Seen in the last 90 seconds." />
        <Stat label="Unique, 7 days" value={audience.uniqueLast7Days} note="Distinct ids in the daily log." />
        <Stat label="Unique, 30 days" value={audience.uniqueLast30Days} note="Distinct ids in the daily log." />
        <Stat label="Page views" value="Not stored" note="HTTP requests are not counted as page views." />
      </dl>
      <p className="mt-4 text-sm text-muted">
        {audience.firstRecordedDay
          ? `Daily log starts ${audience.firstRecordedDay}. Earlier days were not stored, so a zero bar is not proof that nobody visited.`
          : "The daily log has no rows yet. Totals above still come from the existing visitor table."}
      </p>
      <div className="mt-3 flex h-28 items-end gap-1" aria-label="Daily unique visitors, last 30 Jakarta days">
        {audience.daily.map((day) => (
          <div key={day.date} className="flex h-full min-w-0 flex-1 items-end" title={`${day.date}: ${day.visitors}`}>
            <div className="w-full rounded-sm bg-primary" style={{ height: `${Math.max(day.visitors ? 8 : 0, (day.visitors / peak) * 100)}%` }} />
          </div>
        ))}
      </div>
      <h3 className="mt-5 text-base font-semibold">Most watched on HouseDrama</h3>
      <p className="mt-1 text-sm text-muted">Each watch-page open adds one. This is not unique viewers, and it does not replace the catalog trending feed.</p>
      {audience.topDramas.length ? (
        <ol className="mt-3 space-y-2 text-sm">
          {audience.topDramas.map((drama) => (
            <li key={`${drama.provider}-${drama.seriesId}`} className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate">{drama.title}</span>
              <span className="shrink-0 tabular-nums text-muted">{drama.views.toLocaleString("en-US")}</span>
            </li>
          ))}
        </ol>
      ) : <p className="mt-3 text-sm text-muted">No watch counts stored yet.</p>}
    </section>
  );
}

function Stat({ label, value, note }: { label: string; value: number | string; note: string }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums">{typeof value === "number" ? value.toLocaleString("en-US") : value}</dd>
      <p className="mt-1 text-xs leading-snug text-muted">{note}</p>
    </div>
  );
}

function AdminPage() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState("https://freereels.narto-drama.com/api");
  const [apiBusy, setApiBusy] = useState(false);
  const [apiResult, setApiResult] = useState<Awaited<ReturnType<typeof testFreeReelsApi>> | null>(null);

  async function enter(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    const result = await adminLogin({ data: { password } });
    if (!result.ok || !result.token) {
      setError("Sandi tidak diterima.");
      setBusy(false);
      return;
    }
    sessionStorage.setItem("dramaluma.admin", result.token);
    setToken(result.token);
    setError(null);
    const snapshot = await getAdminData({ data: { token: result.token } });
    setData(snapshot);
    setBusy(false);
  }

  async function refresh(current = token) {
    if (!current) return;
    const snapshot = await getAdminData({ data: { token: current } });
    setData(snapshot);
    if (!snapshot.ok) {
      setToken(null);
      sessionStorage.removeItem("dramaluma.admin");
    }
  }

  async function checkFreeReelsApi(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setApiBusy(true);
    setApiResult(await testFreeReelsApi({ data: { token, baseUrl: apiBaseUrl } }));
    setApiBusy(false);
  }

  async function toggleProvider(id: ProviderId, enabled: boolean) {
    if (!token) return;
    await updateAdminSettings({ data: { token, provider: id, enabled } });
    await refresh();
  }

  async function toggleSection(section: string, sectionEnabled: boolean) {
    if (!token) return;
    await updateAdminSettings({ data: { token, section, sectionEnabled } });
    await refresh();
  }

  const snapshot = data?.ok ? data.snapshot : null;

  return (
    <div className="max-w-3xl">
      <PageIntro title="Catalog admin" description="Provider health, cache, and homepage sections. Not linked from the mobile bar." />
      {!token ? (
        <form onSubmit={(event) => void enter(event)} className="mt-6 max-w-sm space-y-3">
          <label className="block text-sm font-semibold">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 h-12 w-full rounded-xl border border-line bg-surface px-3"
              autoComplete="current-password"
            />
          </label>
          {error ? <p className="text-sm text-coral">{error}</p> : null}
          <button type="submit" disabled={busy} className="h-12 rounded-full bg-ink px-5 font-semibold text-player-ink">
            {busy ? "Checking" : "Enter"}
          </button>
        </form>
      ) : snapshot ? (
        <div className="mt-6 space-y-6">
          <button type="button" onClick={() => void refresh()} className="h-11 rounded-full border border-line px-4 text-sm font-semibold">
            Refresh health
          </button>
          <AudiencePanel audience={snapshot.audience} />
          <div className="overflow-x-auto rounded-card border border-line">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-surface text-muted">
                <tr>
                  <th className="p-3 font-medium">Provider</th>
                  <th className="p-3 font-medium">Health</th>
                  <th className="p-3 font-medium">Last ok</th>
                  <th className="p-3 font-medium">Avg</th>
                  <th className="p-3 font-medium">Errors</th>
                  <th className="p-3 font-medium">Playback</th>
                  <th className="p-3 font-medium">Enabled</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.providers.map((provider) => {
                  const health = snapshot.health.find((item) => item.id === provider.id);
                  return (
                    <tr key={provider.id} className="border-t border-line">
                      <td className="p-3 font-semibold">{provider.id}</td>
                      <td className="p-3">{health ? (health.ok ? "Up" : health.error) : "—"}</td>
                      <td className="p-3">{provider.lastOkAt ? new Date(provider.lastOkAt).toLocaleTimeString() : "—"}</td>
                      <td className="p-3">{provider.avgMs ? `${provider.avgMs} ms` : "—"}</td>
                      <td className="p-3">
                        {provider.failCount}
                        {provider.lastError ? <span className="mt-1 block text-xs text-muted">{provider.lastError}</span> : null}
                      </td>
                      <td className="p-3">
                        {provider.playbackOk} ok / {provider.playbackFail} fail
                      </td>
                      <td className="p-3">
                        <button type="button" className="font-semibold text-primary" onClick={() => void toggleProvider(provider.id, !provider.enabled)}>
                          {provider.enabled ? "On" : "Off"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <section className="rounded-card border border-line p-4 sm:p-5">
            <h2 className="text-xl font-semibold">Periksa API FreeReels</h2>
            <p className="mt-1 text-sm text-muted">Tes koneksi API dan endpoint utama dari server HouseDrama. Ini membantu mengetahui endpoint mana yang gagal sebelum mengubah konfigurasi.</p>
            <form onSubmit={(event) => void checkFreeReelsApi(event)} className="mt-4 space-y-3">
              <label className="block text-sm font-semibold">Alamat dasar API
                <input value={apiBaseUrl} onChange={(event) => setApiBaseUrl(event.target.value)} className="mt-1 h-12 w-full rounded-xl border border-line bg-surface px-3 font-normal" placeholder="https://freereels.narto-drama.com/api" inputMode="url" />
              </label>
              <button type="submit" disabled={apiBusy} className="h-11 rounded-full bg-primary px-5 font-semibold text-ink disabled:opacity-60">{apiBusy ? "Memeriksa endpoint…" : "Tes & Diagnosis API"}</button>
            </form>
            {apiResult ? (
              <div className="mt-4 space-y-3" aria-live="polite">
                {"error" in apiResult && apiResult.error ? <p className="rounded-xl bg-coral/10 p-3 text-sm">{apiResult.error}</p> : null}
                {"checks" in apiResult && apiResult.checks ? (
                  <div className="overflow-x-auto rounded-xl border border-line">
                    <table className="w-full min-w-[28rem] text-left text-sm">
                      <thead className="bg-surface text-muted"><tr><th className="p-3">Endpoint</th><th className="p-3">Status</th><th className="p-3">Waktu</th><th className="p-3">Hasil</th></tr></thead>
                      <tbody>{apiResult.checks.map((item) => <tr key={item.path} className="border-t border-line"><td className="p-3 font-mono text-xs">{item.path}</td><td className="p-3">{item.status || "Gagal"}</td><td className="p-3">{item.ms} ms</td><td className={`p-3 ${item.ok ? "text-green-700" : "text-coral"}`}>{item.detail}</td></tr>)}</tbody>
                    </table>
                  </div>
                ) : null}
                <p className="text-sm text-muted">Jika endpoint gagal, hasil tes ini hanya mendiagnosis masalah. Untuk mengganti alamat API yang dipakai seluruh website secara permanen, ubah variabel <code>FREEREELS_API_URL</code> di Vercel menjadi alamat yang benar, lalu redeploy.</p>
              </div>
            ) : null}
          </section>
          <p className="text-sm text-muted">Cached catalog entries: {snapshot.cacheEntries}. Stream URLs are cached for well under a minute.</p>
          <div>
            <h2 className="text-2xl">Homepage sections</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {snapshot.sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => void toggleSection(section.id, !section.enabled)}
                  className={`rounded-full px-3 py-2 text-sm font-semibold ${section.enabled ? "bg-primary/15 text-ink" : "bg-line text-muted"}`}
                >
                  {section.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm">The session was rejected.</p>
      )}
    </div>
  );
}
