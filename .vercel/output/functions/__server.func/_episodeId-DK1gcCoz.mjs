import { o as __toESM } from "./_runtime.mjs";
import { C as require_jsx_runtime, X as require_react } from "./_libs/@tanstack/react-router+[...].mjs";
import { r as isProviderId } from "./_ssr/types-B7znlJsu.mjs";
import { n as EmptyState, y as usePrefs } from "./_ssr/cards-Dd_haNas.mjs";
import { n as Route } from "./_ssr/router-02Yj-4nf.mjs";
import { n as Player } from "./_ssr/player-s3WmOFTd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_episodeId-DK1gcCoz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function WatchPage() {
	const initial = Route.useLoaderData();
	const params = Route.useParams();
	const { auto } = Route.useSearch();
	const { t } = usePrefs();
	const [detail, setDetail] = (0, import_react.useState)(initial.detail);
	const [stream, setStream] = (0, import_react.useState)(initial.stream);
	(0, import_react.useEffect)(() => {
		setDetail(initial.detail);
		setStream(initial.stream);
	}, [initial]);
	if (!isProviderId(params.provider) || !detail.drama) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: t.cantOpen,
		body: detail.error || t.missingDrama
	});
	const episode = detail.episodes.find((item) => item.episodeId === params.episodeId) ?? {
		episodeId: params.episodeId,
		index: Number(params.episodeId) || 1,
		title: `Episode ${params.episodeId}`,
		coverUrl: detail.drama.posterUrl,
		durationSec: null,
		access: "open"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Player, {
		drama: detail.drama,
		episodes: detail.episodes.length ? detail.episodes : [episode],
		episode,
		initial: stream,
		alsoOn: detail.alsoOn,
		autoStart: auto !== false
	});
}
//#endregion
export { WatchPage as component };
