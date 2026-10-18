import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as PageIntro } from "./cards-Dd_haNas.mjs";
import { E as updateAdminSettings, T as testFreeReelsApi, g as getAdminData, p as adminLogin } from "./router-02Yj-4nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-C0EnA7Ff.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminPage() {
	const [password, setPassword] = (0, import_react.useState)("");
	const [token, setToken] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [data, setData] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [apiBaseUrl, setApiBaseUrl] = (0, import_react.useState)("https://freereels.narto-drama.com/api");
	const [apiBusy, setApiBusy] = (0, import_react.useState)(false);
	const [apiResult, setApiResult] = (0, import_react.useState)(null);
	async function enter(event) {
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
	async function checkFreeReelsApi(event) {
		event.preventDefault();
		if (!token) return;
		setApiBusy(true);
		setApiResult(await testFreeReelsApi({ data: {
			token,
			baseUrl: apiBaseUrl
		} }));
		setApiBusy(false);
	}
	async function toggleProvider(id, enabled) {
		if (!token) return;
		await updateAdminSettings({ data: {
			token,
			provider: id,
			enabled
		} });
		await refresh();
	}
	async function toggleSection(section, sectionEnabled) {
		if (!token) return;
		await updateAdminSettings({ data: {
			token,
			section,
			sectionEnabled
		} });
		await refresh();
	}
	const snapshot = data?.ok ? data.snapshot : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-3xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			title: "Catalog admin",
			description: "Provider health, cache, and homepage sections. Not linked from the mobile bar."
		}), !token ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: (event) => void enter(event),
			className: "mt-6 max-w-sm space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm font-semibold",
					children: ["Password", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "password",
						value: password,
						onChange: (event) => setPassword(event.target.value),
						className: "mt-1 h-12 w-full rounded-xl border border-line bg-surface px-3",
						autoComplete: "current-password"
					})]
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-coral",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					disabled: busy,
					className: "h-12 rounded-full bg-ink px-5 font-semibold text-player-ink",
					children: busy ? "Checking" : "Enter"
				})
			]
		}) : snapshot ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => void refresh(),
					className: "h-11 rounded-full border border-line px-4 text-sm font-semibold",
					children: "Refresh health"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto rounded-card border border-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[36rem] text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-surface text-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3 font-medium",
									children: "Provider"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3 font-medium",
									children: "Health"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3 font-medium",
									children: "Last ok"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3 font-medium",
									children: "Avg"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3 font-medium",
									children: "Errors"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3 font-medium",
									children: "Playback"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3 font-medium",
									children: "Enabled"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: snapshot.providers.map((provider) => {
							const health = snapshot.health.find((item) => item.id === provider.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-line",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-3 font-semibold",
										children: provider.id
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-3",
										children: health ? health.ok ? "Up" : health.error : "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-3",
										children: provider.lastOkAt ? new Date(provider.lastOkAt).toLocaleTimeString() : "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-3",
										children: provider.avgMs ? `${provider.avgMs} ms` : "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "p-3",
										children: [provider.failCount, provider.lastError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-1 block text-xs text-muted",
											children: provider.lastError
										}) : null]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "p-3",
										children: [
											provider.playbackOk,
											" ok / ",
											provider.playbackFail,
											" fail"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "font-semibold text-primary",
											onClick: () => void toggleProvider(provider.id, !provider.enabled),
											children: provider.enabled ? "On" : "Off"
										})
									})
								]
							}, provider.id);
						}) })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-card border border-line p-4 sm:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl font-semibold",
							children: "Periksa API FreeReels"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Tes koneksi API dan endpoint utama dari server HouseDrama. Ini membantu mengetahui endpoint mana yang gagal sebelum mengubah konfigurasi."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: (event) => void checkFreeReelsApi(event),
							className: "mt-4 space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block text-sm font-semibold",
								children: ["Alamat dasar API", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: apiBaseUrl,
									onChange: (event) => setApiBaseUrl(event.target.value),
									className: "mt-1 h-12 w-full rounded-xl border border-line bg-surface px-3 font-normal",
									placeholder: "https://freereels.narto-drama.com/api",
									inputMode: "url"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: apiBusy,
								className: "h-11 rounded-full bg-primary px-5 font-semibold text-ink disabled:opacity-60",
								children: apiBusy ? "Memeriksa endpoint…" : "Tes & Diagnosis API"
							})]
						}),
						apiResult ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-3",
							"aria-live": "polite",
							children: [
								"error" in apiResult && apiResult.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "rounded-xl bg-coral/10 p-3 text-sm",
									children: apiResult.error
								}) : null,
								"checks" in apiResult && apiResult.checks ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "overflow-x-auto rounded-xl border border-line",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
										className: "w-full min-w-[28rem] text-left text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
											className: "bg-surface text-muted",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "p-3",
													children: "Endpoint"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "p-3",
													children: "Status"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "p-3",
													children: "Waktu"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "p-3",
													children: "Hasil"
												})
											] })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: apiResult.checks.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "border-t border-line",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "p-3 font-mono text-xs",
													children: item.path
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "p-3",
													children: item.status || "Gagal"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "p-3",
													children: [item.ms, " ms"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: `p-3 ${item.ok ? "text-green-700" : "text-coral"}`,
													children: item.detail
												})
											]
										}, item.path)) })]
									})
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted",
									children: [
										"Jika endpoint gagal, hasil tes ini hanya mendiagnosis masalah. Untuk mengganti alamat API yang dipakai seluruh website secara permanen, ubah variabel ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "FREEREELS_API_URL" }),
										" di Vercel menjadi alamat yang benar, lalu redeploy."
									]
								})
							]
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						"Cached catalog entries: ",
						snapshot.cacheEntries,
						". Stream URLs are cached for well under a minute."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl",
					children: "Homepage sections"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: snapshot.sections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void toggleSection(section.id, !section.enabled),
						className: `rounded-full px-3 py-2 text-sm font-semibold ${section.enabled ? "bg-primary/15 text-ink" : "bg-line text-muted"}`,
						children: section.id
					}, section.id))
				})] })
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-6 text-sm",
			children: "The session was rejected."
		})]
	});
}
//#endregion
export { AdminPage as component };
