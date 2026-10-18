import { c as setSectionEnabled, l as snapshot$1, s as setProviderEnabled, u as verifyAdminToken } from "./metrics-CZxc3Ids.mjs";
import { r as pingProviders } from "./catalog-DJ2VrmyW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-DS-cfRPd.js
async function pingSafe() {
	try {
		return await pingProviders();
	} catch {
		return [];
	}
}
async function snapshot(_health) {
	const health = await _health();
	return {
		...snapshot$1(),
		health
	};
}
function applySettings(input) {
	if (!verifyAdminToken(input.token)) return { ok: false };
	if (input.provider && typeof input.enabled === "boolean") setProviderEnabled(input.provider, input.enabled);
	if (input.section && typeof input.sectionEnabled === "boolean") setSectionEnabled(input.section, input.sectionEnabled);
	return {
		ok: true,
		snapshot: snapshot$1()
	};
}
//#endregion
export { applySettings, pingSafe, snapshot, verifyAdminToken };
