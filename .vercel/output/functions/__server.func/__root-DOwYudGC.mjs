import { t as createServerFn } from "./_ssr/ssr.mjs";
import { t as createServerRpc } from "./_ssr/createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/__root-DOwYudGC.js
var getInitialCatalogLang_createServerFn_handler = createServerRpc({
	id: "83a1fcf8ff0201d6d5955be7fba162e9bad02581b5361d07b30f5fce22cced54",
	name: "getInitialCatalogLang",
	filename: "src/routes/__root.tsx"
}, (opts) => getInitialCatalogLang.__executeServer(opts));
var getInitialCatalogLang = createServerFn({ method: "GET" }).handler(getInitialCatalogLang_createServerFn_handler, async () => {
	const { resolveCatalogLang } = await import("./_ssr/locale-D7o8iBvg.mjs");
	return resolveCatalogLang();
});
//#endregion
export { getInitialCatalogLang_createServerFn_handler };
