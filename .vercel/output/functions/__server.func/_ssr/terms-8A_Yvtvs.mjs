import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as PageIntro, y as usePrefs } from "./cards-Dd_haNas.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/terms-8A_Yvtvs.js
var import_jsx_runtime = require_jsx_runtime();
function TermsPage() {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-2xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, { title: t.termsTitle }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 space-y-4 text-sm leading-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t.terms1 }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t.terms2 }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t.terms3 }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t.terms4 })
			]
		})]
	});
}
//#endregion
export { TermsPage as component };
