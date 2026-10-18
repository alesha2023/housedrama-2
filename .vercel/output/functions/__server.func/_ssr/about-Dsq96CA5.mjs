import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as PageIntro, y as usePrefs } from "./cards-Dd_haNas.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/about-Dsq96CA5.js
var import_jsx_runtime = require_jsx_runtime();
function AboutPage() {
	const { t } = usePrefs();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-2xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			title: t.about,
			description: t.aboutLead
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 space-y-4 text-sm leading-6 text-ink",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t.about1 }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t.about2 }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t.about3 }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t.about4 })
			]
		})]
	});
}
//#endregion
export { AboutPage as component };
