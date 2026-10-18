import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as cn, y as usePrefs } from "./cards-Dd_haNas.mjs";
import { a as visibleProviders, i as providerLabel } from "./catalog-DJ2VrmyW.mjs";
import { O as ChevronDown, _ as Layers, d as Search, k as Check } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/provider-picker-BVwbhLFx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProviderPicker({ value, onChange, className, label }) {
	const { t } = usePrefs();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [query, setQuery] = (0, import_react.useState)("");
	const current = value === "all" ? t.allProviders : providerLabel(value);
	const filteredProviders = visibleProviders().filter((id) => providerLabel(id).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			"aria-expanded": open,
			"aria-haspopup": "listbox",
			"aria-label": label,
			onClick: () => {
				setOpen((currentOpen) => {
					if (currentOpen) setQuery("");
					return !currentOpen;
				});
			},
			className: "group flex h-[54px] w-full items-center justify-between gap-3 rounded-2xl border border-line/80 bg-surface px-3.5 text-left shadow-sm transition-colors hover:border-coral/50 hover:bg-surface/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/40",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex min-w-0 items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-9 shrink-0 items-center justify-center rounded-xl bg-coral/10 text-coral",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, {
						className: "size-[18px]",
						"aria-hidden": "true"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate text-[15px] font-semibold tracking-[-0.01em]",
					children: current
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("size-[18px] shrink-0 text-muted transition-transform group-hover:text-coral", open && "rotate-180") })]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": t.close,
			className: "fixed inset-0 z-40",
			onClick: () => {
				setOpen(false);
				setQuery("");
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-line bg-bg shadow-xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-b border-line p-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
						className: "size-4 shrink-0 text-muted",
						"aria-hidden": "true"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "search",
						value: query,
						onChange: (event) => setQuery(event.target.value),
						onKeyDown: (event) => {
							if (event.key === "Escape") {
								setOpen(false);
								setQuery("");
							}
						},
						placeholder: "Cari nama penyedia...",
						"aria-label": "Cari nama penyedia",
						className: "min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "listbox",
				className: "max-h-64 overflow-y-auto p-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PickerOption, {
						active: value === "all",
						onClick: () => {
							onChange("all");
							setOpen(false);
							setQuery("");
						},
						children: t.allProviders
					}),
					filteredProviders.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PickerOption, {
						active: value === id,
						onClick: () => {
							onChange(id);
							setOpen(false);
							setQuery("");
						},
						children: providerLabel(id)
					}, id)),
					!filteredProviders.length && query.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-3 py-4 text-center text-sm text-muted",
						children: "Tidak ada penyedia yang cocok."
					}) : null
				]
			})]
		})] }) : null]
	});
}
function PickerOption({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		role: "option",
		"aria-selected": active,
		onClick,
		className: cn("flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors", active ? "bg-coral/10 text-ink" : "hover:bg-surface"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children }), active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
			className: "size-4 shrink-0 text-coral",
			"aria-hidden": "true"
		}) : null]
	});
}
//#endregion
export { ProviderPicker as t };
