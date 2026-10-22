import type { ProviderId } from "../types";
import { pingProviders } from "./catalog";
import {
  setProviderEnabled,
  setSectionEnabled,
  snapshot as readSnapshot,
  verifyAdminToken,
} from "./metrics";

export { verifyAdminToken };

export async function pingSafe() {
  try {
    return await pingProviders();
  } catch {
    return [];
  }
}

export async function snapshot(_health: typeof pingSafe) {
  const health = await _health();
  const base = readSnapshot();
  return { ...base, health };
}

export function applySettings(input: {
  token: string;
  provider?: ProviderId;
  enabled?: boolean;
  section?: string;
  sectionEnabled?: boolean;
}) {
  if (!verifyAdminToken(input.token)) return { ok: false as const };
  if (input.provider && typeof input.enabled === "boolean") setProviderEnabled(input.provider, input.enabled);
  if (input.section && typeof input.sectionEnabled === "boolean") {
    setSectionEnabled(input.section, input.sectionEnabled);
  }
  return { ok: true as const, snapshot: readSnapshot() };
}
