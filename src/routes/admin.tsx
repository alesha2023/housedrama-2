import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PageIntro } from "@/components/drama/cards";
import { adminLogin, getAdminData, updateAdminSettings } from "@/lib/drama/api";
import type { ProviderId } from "@/lib/drama/types";

type Snapshot = Awaited<ReturnType<typeof getAdminData>>;

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — HouseDrama" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState(false);

  async function enter(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    const result = await adminLogin({ data: { password } });
    if (!result.ok || !result.token) {
      setError("That password was not accepted.");
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
