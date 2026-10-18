import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, S as useRouter, X as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as providerLabel } from "./catalog-DJ2VrmyW.mjs";
import { T as Clapperboard } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/display-DOUlx-ii.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var UI_LANGS = [
	{
		id: "en",
		label: "English"
	},
	{
		id: "id",
		label: "Indonesia"
	},
	{
		id: "hi",
		label: "हिन्दी (India)"
	},
	{
		id: "fil",
		label: "Filipino"
	}
];
var CONTENT_LANGS = [{
	id: "en",
	label: "English"
}, {
	id: "id",
	label: "Indonesia"
}];
var RAIL_TITLES_BASE = {
	en: {
		featured: "Featured Dramas",
		trending: "Trending Now",
		popular: "Most Popular",
		latest: "Latest Episodes",
		new: "New Releases",
		recommended: "Recommended for You",
		romance: "Romance",
		revenge: "Revenge",
		billionaire: "Billionaire Romance",
		ceo: "CEO Romance",
		historical: "Historical Drama",
		fantasy: "Fantasy",
		family: "Family Drama",
		comedy: "Comedy",
		completed: "Completed Dramas",
		anyreel: "From AnyReel",
		dramabox: "From DramaBox",
		freereels: "From FreeReels"
	},
	id: {
		featured: "Drama unggulan",
		trending: "Sedang tren",
		popular: "Populer",
		latest: "Terbaru",
		new: "Rilis baru",
		recommended: "Rekomendasi untukmu",
		romance: "Romantis",
		revenge: "Balas Dendam",
		billionaire: "Romansa miliarder",
		ceo: "Romansa CEO",
		historical: "Sejarah",
		fantasy: "Fantasi",
		family: "Drama keluarga",
		comedy: "Komedi",
		completed: "Tamat",
		anyreel: "Dari AnyReel",
		dramabox: "Dari DramaBox",
		freereels: "Dari FreeReels"
	}
};
var RAIL_TITLES = {
	...RAIL_TITLES_BASE,
	hi: RAIL_TITLES_BASE.en,
	fil: RAIL_TITLES_BASE.en
};
function railTitle(lang, id, fallback) {
	return RAIL_TITLES[lang][id] ?? fallback;
}
var COPY_BASE = {
	en: {
		home: "Home",
		discover: "Discover",
		latest: "Latest",
		trending: "Trending",
		categories: "Categories",
		search: "Search",
		watchlist: "Watchlist",
		history: "History",
		shorts: "Shorts",
		play: "Play now",
		details: "View details",
		viewAll: "View all",
		start: "Start watching",
		save: "Add to watchlist",
		saved: "In watchlist",
		episodes: "Episodes",
		similar: "Similar dramas",
		more: "More from this provider",
		also: "Also available on",
		continue: "Continue watching",
		recent: "Recently watched",
		empty: "Nothing here yet",
		retry: "Try again",
		loadMore: "Load more",
		providersDown: "Some catalogs are unavailable right now. The rest of HouseDrama is still open.",
		searchPlaceholder: "Search titles across AnyReel, DramaBox, and FreeReels",
		searchIntro: "Search by title to find your favorite dramas.",
		contentLang: "Catalog language",
		uiLang: "Interface",
		about: "About",
		privacy: "Privacy",
		terms: "Terms",
		next: "Next episode",
		prev: "Previous episode",
		autoplay: "Autoplay next",
		unavailable: "This episode does not have a free playable stream from this provider.",
		loading: "Loading",
		searching: "Searching…",
		retrying: "Retrying",
		close: "Close",
		footerNote: "A catalog of Chinese short dramas from many providers. Search, save, and watch episodes on HouseDrama.",
		noMatches: "No matches",
		noMatchesBody: "Try a shorter title, or another provider. One catalog being down does not hide the others.",
		allProviders: "All providers",
		providerLabel: "Provider",
		unknownProvider: "Unknown provider",
		unknownProviderBody: "Choose AnyReel, DramaBox, or FreeReels.",
		providerIntro: "This shelf only uses that provider's own IDs and endpoints.",
		providerEmpty: "This provider did not return a catalog.",
		discoverBody: "A mixed shelf from every connected catalog.",
		emptyBrowse: "Try another category or check back when a provider responds.",
		shortsBody: "Tall posters from the short-drama feeds. Open one to play the first available episode.",
		shortsEmpty: "The short feed did not return titles.",
		categoriesDesc: "Genres are grouped from real tags and titles. Empty genres stay hidden.",
		newEyebrow: "New",
		latestTitle: "Latest releases",
		latestBody: "New shelves from DramaBox and the other catalogs.",
		noNew: "No new titles",
		noNewBody: "The latest endpoints came back empty.",
		rankEyebrow: "Rankings",
		trendTitle: "Trending now",
		trendBody: "Pulled from the providers' live rank lists.",
		noRank: "No rankings yet",
		noRankBody: "The rank endpoints did not return titles.",
		historyBody: "Resume from the last position stored on this device.",
		historyEmpty: "Start an episode and it will show up here after a few seconds of playback.",
		watchlistBody: "Saved on this device only. No account required.",
		watchlistEmpty: "Open a drama and add it to your watchlist.",
		remove: "Remove",
		discoverCta: "Discover dramas",
		noSynopsis: "No synopsis was provided for this title.",
		episodeUnit: "episodes",
		completed: "Completed",
		ongoing: "Ongoing",
		plays: "plays",
		eps: "eps",
		shortDrama: "Short drama",
		limitedNote: "A dot means the provider marked the episode as limited. Playback is only offered when a real stream comes back.",
		noEpisodeList: "This provider did not include an episode list.",
		dramaUnavailable: "Drama unavailable",
		dramaMissing: "The provider did not return this title.",
		cantOpen: "Can't open this episode",
		missingDrama: "Missing drama details.",
		episodeLimited: "Provider marks this episode as limited",
		heroFallback: "A short drama from the live catalog.",
		catalogsEmpty: "The catalogs did not return any dramas. Check a provider page or try again.",
		aboutLead: "A bright, free catalog for Chinese short dramas.",
		about1: "HouseDrama lets you browse and play short dramas that AnyReel, DramaBox, and FreeReels already expose through their public APIs. There is no subscription, no coin wallet, and no VIP gate on this site.",
		about2: "The shows themselves belong to their creators and the platforms that distribute them. HouseDrama does not claim ownership, re-upload files, or bypass access controls. If a provider does not return a playable stream, the episode stays unavailable.",
		about3: "Choose English, Indonesian, Hindi, or Filipino for the interface. The catalog uses English or Indonesian where supported by each provider; some titles remain in their source language.",
		about4: "Watch history and your watchlist live in this browser only. Clearing site data removes them.",
		privacy1: "HouseDrama does not ask you to create an account to browse or watch publicly available episodes.",
		privacy2: "Saved dramas, watch history, playback position, volume, autoplay, and language choices are stored in local storage on your device. They are not sent to a HouseDrama account database.",
		privacy3: "Requests for catalogs and streams go to AnyReel, DramaBox, and FreeReels, or through HouseDrama’s server so the browser can reach hosts that do not allow cross-origin playback. Those providers may see a request for the title you opened.",
		privacy4: "The admin dashboard is separate and does not collect visitor profiles. Operational counters stay in server memory and reset when the server restarts.",
		termsTitle: "Terms of use",
		terms1: "HouseDrama is an unofficial viewing catalog. It is not AnyReel, DramaBox, or FreeReels, and it is not the producer of the dramas.",
		terms2: "Streams are shown only when a connected provider returns a URL. Availability, subtitles, languages, and region access can change without notice. An episode that fails to play is not unlocked.",
		terms3: "Do not use HouseDrama to download, copy, or redistribute dramas. If you are a rightsholder and want a title removed from this catalog view, contact the provider that serves it.",
		terms4: "The service is offered as-is, without a promise that every title in a provider’s app will play here."
	},
	id: {
		home: "Beranda",
		discover: "Jelajah",
		latest: "Terbaru",
		trending: "Trending",
		categories: "Kategori",
		search: "Cari",
		watchlist: "Daftar tonton",
		history: "Riwayat",
		shorts: "Shorts",
		play: "Putar",
		details: "Lihat detail",
		viewAll: "Lihat semua",
		start: "Mulai menonton",
		save: "Simpan",
		saved: "Tersimpan",
		episodes: "Episode",
		similar: "Drama serupa",
		more: "Lainnya dari penyedia ini",
		also: "Juga tersedia di",
		continue: "Lanjutkan menonton",
		recent: "Baru ditonton",
		empty: "Belum ada apa-apa",
		retry: "Coba lagi",
		loadMore: "Muat lagi",
		providersDown: "Sebagian sumber drama sedang tidak tersedia. Hasil dari sumber lain tetap ditampilkan.",
		searchPlaceholder: "Cari judul di AnyReel, DramaBox, dan FreeReels",
		searchIntro: "Search by title to find your favorite dramas.",
		contentLang: "Bahasa katalog",
		uiLang: "Antarmuka",
		about: "Tentang",
		privacy: "Privasi",
		terms: "Ketentuan",
		next: "Episode berikut",
		prev: "Episode sebelum",
		autoplay: "Putar otomatis",
		unavailable: "Episode ini belum punya stream gratis yang bisa diputar dari penyedia ini.",
		loading: "Memuat",
		searching: "Mencari…",
		retrying: "Mencoba lagi",
		close: "Tutup",
		footerNote: "Katalog drama pendek Tiongkok dari berbagai penyedia. Cari, simpan, dan tonton episodenya di HouseDrama.",
		noMatches: "Tidak ada hasil",
		noMatchesBody: "Coba judul yang lebih pendek, atau penyedia lain. Satu katalog yang mati tidak menyembunyikan yang lain.",
		allProviders: "Semua penyedia",
		providerLabel: "Sumber Drama",
		unknownProvider: "Penyedia tidak dikenal",
		unknownProviderBody: "Pilih AnyReel, DramaBox, atau FreeReels.",
		providerIntro: "Rak ini hanya memakai ID dan endpoint milik penyedia itu.",
		providerEmpty: "Penyedia ini tidak mengembalikan katalog.",
		discoverBody: "Campuran dari semua katalog yang terhubung.",
		emptyBrowse: "Coba kategori lain, atau kembali saat penyedia merespons.",
		shortsBody: "Poster vertikal dari umpan drama pendek. Buka satu untuk memutar episode yang tersedia.",
		shortsEmpty: "Umpan pendek tidak mengembalikan judul.",
		categoriesDesc: "Genre dikelompokkan dari tag dan judul asli. Genre kosong tetap disembunyikan.",
		newEyebrow: "Baru",
		latestTitle: "Rilis terbaru",
		latestBody: "Rak baru dari DramaBox dan katalog lain.",
		noNew: "Belum ada judul baru",
		noNewBody: "Endpoint terbaru kosong.",
		rankEyebrow: "Peringkat",
		trendTitle: "Sedang tren",
		trendBody: "Diambil dari daftar peringkat langsung penyedia.",
		noRank: "Belum ada peringkat",
		noRankBody: "Endpoint peringkat tidak mengembalikan judul.",
		historyBody: "Lanjutkan dari posisi terakhir yang tersimpan di perangkat ini.",
		historyEmpty: "Putar satu episode, lalu ia muncul di sini setelah beberapa detik.",
		watchlistBody: "Tersimpan hanya di perangkat ini. Tidak perlu akun.",
		watchlistEmpty: "Buka sebuah drama lalu simpan ke daftar tonton.",
		remove: "Hapus",
		discoverCta: "Jelajah drama",
		noSynopsis: "Sinopsis tidak tersedia untuk judul ini.",
		episodeUnit: "episode",
		completed: "Tamat",
		ongoing: "Sedang Tayang",
		plays: "tayangan",
		eps: "ep",
		shortDrama: "Drama pendek",
		limitedNote: "Titik berarti penyedia menandai episode itu terbatas. Pemutaran hanya ditawarkan jika stream asli kembali.",
		noEpisodeList: "Penyedia ini tidak menyertakan daftar episode.",
		dramaUnavailable: "Drama tidak tersedia",
		dramaMissing: "Penyedia tidak mengembalikan judul ini.",
		cantOpen: "Episode ini tidak bisa dibuka",
		missingDrama: "Detail drama tidak ada.",
		episodeLimited: "Penyedia menandai episode ini terbatas",
		heroFallback: "Drama pendek dari katalog langsung.",
		catalogsEmpty: "Katalog tidak mengembalikan drama. Cek halaman penyedia atau coba lagi.",
		aboutLead: "Katalog gratis dan terang untuk drama pendek Tiongkok.",
		about1: "HouseDrama memungkinkan Anda menelusuri dan memutar drama pendek yang sudah dibuka AnyReel, DramaBox, dan FreeReels lewat API publik mereka. Situs ini tidak punya langganan, dompet koin, atau gerbang VIP.",
		about2: "Acaranya milik kreator dan platform yang mendistribusikannya. HouseDrama tidak mengklaim kepemilikan, tidak mengunggah ulang berkas, dan tidak melewati kontrol akses. Jika penyedia tidak mengembalikan stream yang bisa diputar, episode tetap tidak tersedia.",
		about3: "Ganti antarmuka dan katalog antara Inggris dan Indonesia. Bahasa AnyReel mengikuti sesi penyedia itu. DramaBox dan FreeReels menerima bahasa katalog. Sebagian judul tetap dalam bahasa aslinya.",
		about4: "Riwayat tonton dan daftar tonton hanya ada di peramban ini. Menghapus data situs akan menghilangkannya.",
		privacy1: "HouseDrama tidak meminta Anda membuat akun untuk menelusuri atau menonton episode yang tersedia untuk umum.",
		privacy2: "Drama tersimpan, riwayat tonton, posisi putar, volume, putar otomatis, dan pilihan bahasa disimpan di penyimpanan lokal perangkat Anda. Itu tidak dikirim ke basis data akun HouseDrama.",
		privacy3: "Permintaan katalog dan stream pergi ke AnyReel, DramaBox, dan FreeReels, atau lewat server HouseDrama agar peramban bisa menjangkau host yang menolak pemutaran lintas asal. Penyedia itu bisa melihat permintaan judul yang Anda buka.",
		privacy4: "Dasbor admin terpisah dan tidak mengumpulkan profil pengunjung. Penghitung operasional ada di memori server dan reset saat server dimulai ulang.",
		termsTitle: "Ketentuan penggunaan",
		terms1: "HouseDrama adalah katalog tontonan tidak resmi. Ini bukan AnyReel, DramaBox, atau FreeReels, dan bukan produsen dramanya.",
		terms2: "Stream hanya ditampilkan saat penyedia yang terhubung mengembalikan URL. Ketersediaan, subtitle, bahasa, dan akses wilayah bisa berubah tanpa pemberitahuan. Episode yang gagal diputar bukan berarti terbuka.",
		terms3: "Jangan gunakan HouseDrama untuk mengunduh, menyalin, atau menyebarluaskan drama. Jika Anda pemegang hak dan ingin judul dihapus dari tampilan katalog ini, hubungi penyedia yang menyajikannya.",
		terms4: "Layanan ditawarkan apa adanya, tanpa janji bahwa setiap judul di aplikasi penyedia akan bisa diputar di sini."
	}
};
var COPY = {
	...COPY_BASE,
	hi: {
		...COPY_BASE.en,
		home: "होम",
		discover: "खोजें",
		latest: "नवीनतम",
		trending: "ट्रेंडिंग",
		categories: "श्रेणियाँ",
		search: "खोजें",
		watchlist: "वॉचलिस्ट",
		history: "इतिहास",
		shorts: "शॉर्ट्स",
		play: "अभी देखें",
		details: "विवरण देखें",
		viewAll: "सभी देखें",
		start: "देखना शुरू करें",
		save: "वॉचलिस्ट में जोड़ें",
		saved: "वॉचलिस्ट में है",
		episodes: "एपिसोड",
		similar: "इसी तरह के ड्रामा",
		more: "इस प्रदाता से और",
		also: "यहाँ भी उपलब्ध",
		continue: "देखना जारी रखें",
		recent: "हाल ही में देखा",
		empty: "अभी यहाँ कुछ नहीं",
		retry: "फिर कोशिश करें",
		loadMore: "और लोड करें",
		searchPlaceholder: "AnyReel, DramaBox और FreeReels पर शीर्षक खोजें",
		searchIntro: "शीर्षक खोजकर अपना पसंदीदा ड्रामा ढूँढें।",
		contentLang: "कैटलॉग भाषा",
		uiLang: "इंटरफ़ेस",
		about: "हमारे बारे में",
		privacy: "गोपनीयता",
		terms: "नियम",
		next: "अगला एपिसोड",
		prev: "पिछला एपिसोड",
		autoplay: "अगला अपने आप चलाएँ",
		loading: "लोड हो रहा है",
		searching: "खोज रहे हैं…",
		close: "बंद करें",
		footerNote: "कई प्रदाताओं के चीनी शॉर्ट ड्रामा का कैटलॉग। HouseDrama पर खोजें, सेव करें और एपिसोड देखें।",
		noMatches: "कोई परिणाम नहीं",
		allProviders: "सभी प्रदाता",
		providerLabel: "प्रदाता",
		unknownProvider: "अज्ञात प्रदाता",
		discoverBody: "सभी जुड़े कैटलॉग से चुने गए ड्रामा।",
		latestTitle: "नवीनतम रिलीज़",
		latestBody: "DramaBox और अन्य कैटलॉग से नए ड्रामा।",
		remove: "हटाएँ",
		discoverCta: "ड्रामा खोजें",
		noSynopsis: "इस शीर्षक का सारांश उपलब्ध नहीं है।",
		episodeUnit: "एपिसोड",
		completed: "पूरा",
		ongoing: "जारी",
		plays: "व्यू",
		eps: "एपि.",
		shortDrama: "शॉर्ट ड्रामा",
		dramaUnavailable: "ड्रामा उपलब्ध नहीं",
		missingDrama: "ड्रामा विवरण उपलब्ध नहीं है।",
		heroFallback: "लाइव कैटलॉग से शॉर्ट ड्रामा।",
		catalogsEmpty: "कैटलॉग से ड्रामा नहीं मिले। बाद में फिर कोशिश करें।",
		aboutLead: "चीनी शॉर्ट ड्रामा के लिए मुफ़्त कैटलॉग।",
		termsTitle: "उपयोग की शर्तें"
	},
	fil: {
		...COPY_BASE.en,
		home: "Home",
		discover: "Tuklasin",
		latest: "Pinakabago",
		trending: "Trending",
		categories: "Mga Kategorya",
		search: "Maghanap",
		watchlist: "Watchlist",
		history: "Kasaysayan",
		shorts: "Shorts",
		play: "I-play ngayon",
		details: "Tingnan ang detalye",
		viewAll: "Tingnan lahat",
		start: "Simulang manood",
		save: "Idagdag sa watchlist",
		saved: "Nasa watchlist",
		episodes: "Mga episode",
		similar: "Mga katulad na drama",
		more: "Higit pa mula sa provider na ito",
		also: "Available din sa",
		continue: "Ituloy ang panonood",
		recent: "Kamakailang pinanood",
		empty: "Wala pa rito",
		retry: "Subukan muli",
		loadMore: "Mag-load pa",
		searchPlaceholder: "Maghanap sa AnyReel, DramaBox, at FreeReels",
		searchIntro: "Hanapin ang paborito mong drama sa pamamagitan ng pamagat.",
		contentLang: "Wika ng katalogo",
		uiLang: "Interface",
		about: "Tungkol",
		privacy: "Privacy",
		terms: "Mga tuntunin",
		next: "Susunod na episode",
		prev: "Nakaraang episode",
		autoplay: "Awtomatikong i-play ang susunod",
		loading: "Naglo-load",
		searching: "Naghahanap…",
		close: "Isara",
		footerNote: "Katalogo ng Chinese short dramas mula sa iba’t ibang provider. Maghanap, mag-save, at manood sa HouseDrama.",
		noMatches: "Walang tugma",
		allProviders: "Lahat ng provider",
		providerLabel: "Provider",
		unknownProvider: "Hindi kilalang provider",
		discoverBody: "Pinagsamang katalogo mula sa lahat ng konektadong provider.",
		latestTitle: "Mga bagong release",
		latestBody: "Mga bagong drama mula sa DramaBox at iba pang katalogo.",
		remove: "Alisin",
		discoverCta: "Tuklasin ang mga drama",
		noSynopsis: "Walang buod para sa pamagat na ito.",
		episodeUnit: "episode",
		completed: "Tapos na",
		ongoing: "Kasalukuyan",
		plays: "panonood",
		eps: "ep.",
		shortDrama: "Maikling drama",
		dramaUnavailable: "Hindi available ang drama",
		missingDrama: "Walang detalye ng drama.",
		heroFallback: "Maiikling drama mula sa live na katalogo.",
		catalogsEmpty: "Walang drama na ibinalik ang katalogo. Subukan muli mamaya.",
		aboutLead: "Libreng katalogo ng Chinese short dramas.",
		termsTitle: "Mga tuntunin sa paggamit"
	}
};
var PrefsContext = (0, import_react.createContext)(null);
function isUiLang(value) {
	return value === "en" || value === "id" || value === "hi" || value === "fil";
}
function writeLangCookie(lang, manual) {
	if (typeof document === "undefined") return;
	document.cookie = `hd_lang=${lang}; path=/; max-age=31536000; samesite=lax`;
	document.cookie = manual ? "hd_manual=1; path=/; max-age=31536000; samesite=lax" : "hd_manual=; path=/; max-age=0; samesite=lax";
}
function PrefsProvider({ initialLang = "id", children }) {
	const router = useRouter();
	const [uiLang, setUiLangState] = (0, import_react.useState)(initialLang);
	const [contentLang, setContentLangState] = (0, import_react.useState)(initialLang);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		if (localStorage.getItem("dramaluma.ui.manual") === "1") {
			const ui = localStorage.getItem("dramaluma.ui");
			const content = localStorage.getItem("dramaluma.content");
			const lang = isUiLang(ui) ? ui : content === "en" ? "en" : "id";
			setUiLangState(lang);
			setContentLangState(content === "en" || content === "id" ? content : lang === "id" ? "id" : "en");
			writeLangCookie(lang, true);
			return () => {
				cancelled = true;
			};
		}
		writeLangCookie(initialLang, false);
		const applyAutoLanguage = (lang) => {
			if (cancelled || localStorage.getItem("dramaluma.ui.manual") === "1" || lang === initialLang) return;
			setUiLangState(lang);
			const catalogLang = lang === "id" ? "id" : "en";
			setContentLangState(catalogLang);
			localStorage.setItem("dramaluma.ui", lang);
			localStorage.setItem("dramaluma.content", catalogLang);
			writeLangCookie(lang, false);
			router.invalidate();
		};
		fetch("https://ipapi.co/json/", { headers: { Accept: "application/json" } }).then((response) => {
			if (!response.ok) throw new Error("IP language lookup failed");
			return response.json();
		}).then((data) => {
			const country = data.country_code?.toUpperCase();
			applyAutoLanguage(country === "ID" ? "id" : country === "IN" ? "hi" : country === "PH" ? "fil" : "en");
		}).catch(() => {});
		return () => {
			cancelled = true;
		};
	}, [initialLang, router]);
	(0, import_react.useEffect)(() => {
		document.documentElement.lang = uiLang;
	}, [uiLang]);
	const value = (0, import_react.useMemo)(() => ({
		uiLang,
		contentLang,
		t: COPY[uiLang],
		setUiLang: (lang) => {
			const catalogLang = lang === "id" ? "id" : "en";
			setUiLangState(lang);
			setContentLangState(catalogLang);
			localStorage.setItem("dramaluma.ui", lang);
			localStorage.setItem("dramaluma.content", catalogLang);
			localStorage.setItem("dramaluma.ui.manual", "1");
			writeLangCookie(lang, true);
			router.invalidate();
		},
		setContentLang: (lang) => {
			const next = lang === "id" ? "id" : "en";
			setContentLangState(next);
			localStorage.setItem("dramaluma.content", next);
			localStorage.setItem("dramaluma.ui.manual", "1");
			writeLangCookie(uiLang, true);
			router.invalidate();
		}
	}), [
		uiLang,
		contentLang,
		router
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrefsContext.Provider, {
		value,
		children
	});
}
function usePrefs() {
	const ctx = (0, import_react.useContext)(PrefsContext);
	if (!ctx) throw new Error("Prefs missing");
	return ctx;
}
function pickTitle(item, _lang) {
	return item.originalTitle || item.title;
}
function pickDescription(item, lang) {
	if (lang === "en") return item.originalDescription ?? item.description ?? null;
	return item.displayDescription ?? item.description ?? null;
}
function useDisplayTitles(_titles, _lang) {
	return (title, originalTitle) => originalTitle || title;
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/cards-Dd_haNas.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function directPosterSource(value) {
	if (!value) return null;
	try {
		const parsed = new URL(value);
		if (parsed.hostname === "wsrv.nl" || parsed.hostname === "images.weserv.nl") {
			const original = parsed.searchParams.get("url");
			if (original && /^https?:\/\//i.test(original)) return original;
		}
	} catch {
		return value;
	}
	return value;
}
function ProviderBadge({ provider, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("rounded-full bg-ink/75 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white backdrop-blur", className),
		children: providerLabel(provider)
	});
}
function Poster({ src, alt, className, priority = false }) {
	const [activeSrc, setActiveSrc] = (0, import_react.useState)(directPosterSource(src));
	const [failed, setFailed] = (0, import_react.useState)(!src);
	(0, import_react.useEffect)(() => {
		setActiveSrc(directPosterSource(src));
		setFailed(!src);
	}, [src]);
	function handleImageError() {
		if (activeSrc && !activeSrc.includes("wsrv.nl") && !activeSrc.includes("images.weserv.nl")) {
			setActiveSrc(`https://images.weserv.nl/?url=${encodeURIComponent(activeSrc)}`);
			return;
		}
		setFailed(true);
	}
	if (!activeSrc || failed) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("grid place-items-center bg-surface text-muted", className),
		role: "img",
		"aria-label": alt,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, {
			className: "size-8",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: alt
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: activeSrc,
		alt,
		loading: priority ? "eager" : "lazy",
		fetchPriority: priority ? "high" : "auto",
		decoding: "async",
		referrerPolicy: "no-referrer",
		onError: handleImageError,
		className: cn("h-full w-full object-cover", className)
	});
}
function DramaCardView({ item, className }) {
	const { t, contentLang } = usePrefs();
	const title = pickTitle(item, contentLang);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/drama/$provider/$seriesId",
		params: {
			provider: item.provider,
			seriesId: item.seriesId
		},
		className: cn("drama-card group block w-36 shrink-0 snap-start sm:w-44", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "drama-card__poster rise relative overflow-hidden rounded-2xl bg-surface ring-1 ring-black/5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "drama-card__image aspect-poster",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Poster, {
						src: item.posterUrl,
						alt: title
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute left-2 top-2 flex max-w-[90%] flex-wrap gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderBadge, { provider: item.provider }), item.badge ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-bg/90 px-2 py-0.5 text-xs font-semibold text-ink",
						children: item.badge
					}) : null]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "drama-card__title mt-2 line-clamp-2 text-sm font-semibold leading-snug text-ink group-hover:text-primary",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "drama-card__meta mt-1 text-xs text-muted",
				children: [item.episodeCount ? `${item.episodeCount} ${t.eps}` : null, item.completed ? t.completed : null].filter(Boolean).join(" · ") || t.shortDrama
			}),
			item.tags.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagPills, { tags: item.tags }) : null
		]
	});
}
function TagPills({ tags }) {
	const clean = [...new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 1))].slice(0, 2);
	if (!clean.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1.5 flex flex-wrap gap-1",
		children: clean.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "max-w-full rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold leading-snug break-words text-primary",
			children: tag
		}, tag))
	});
}
function popularity(item) {
	const match = (item.playCount ?? "").replace(/,/g, "").trim().toLowerCase().match(/([\d.]+)\s*(k|m|b|jt|rb)?/);
	if (!match) return 0;
	const value = Number(match[1]);
	if (!Number.isFinite(value)) return 0;
	const unit = match[2] ?? "";
	return value * (unit === "b" ? 1e9 : unit === "m" || unit === "jt" ? 1e6 : unit === "k" || unit === "rb" ? 1e3 : 1);
}
function byPopularity(items) {
	return [...items].sort((a, b) => popularity(b) - popularity(a));
}
function DramaGrid({ items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-6 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DramaCardView, {
			item,
			className: "w-auto"
		}, `${item.provider}-${item.seriesId}`))
	});
}
function Rail({ title, action, items, more }) {
	const ordered = byPopularity(items);
	if (!ordered.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold tracking-tight text-ink",
				children: title
			}), more ?? (action ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-semibold text-primary",
				children: action
			}) : null)]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x sm:mx-0 sm:px-0",
			children: ordered.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DramaCardView, { item }, `${item.provider}-${item.seriesId}`))
		})]
	});
}
function PageIntro({ eyebrow, title, description }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "max-w-2xl",
		children: [
			eyebrow ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold text-primary",
				children: eyebrow
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 text-4xl text-ink sm:text-5xl",
				children: title
			}),
			description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-base text-muted",
				children: description
			}) : null
		]
	});
}
function EmptyState({ title, body, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8 rounded-card border border-line bg-surface px-6 py-12 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-bg text-primary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, {
					className: "size-7",
					"aria-hidden": "true"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl text-ink",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mx-auto mt-2 max-w-md text-sm text-muted",
				children: body
			}),
			action ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5",
				children: action
			}) : null
		]
	});
}
function ErrorNote({ message, onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-card border border-coral/30 bg-coral/8 px-4 py-3 text-sm text-ink",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: message }), onRetry ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onRetry,
			className: "mt-2 font-semibold text-primary",
			children: "Try again"
		}) : null]
	});
}
function SkeletonRail() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "skeleton mb-3 h-8 w-48 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-3 overflow-hidden",
			children: Array.from({ length: 6 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-36 shrink-0 sm:w-44",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "skeleton aspect-poster rounded-card" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "skeleton mt-2 h-4 rounded-full" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "skeleton mt-2 h-3 w-2/3 rounded-full" })
				]
			}, index))
		})]
	});
}
function PageSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "skeleton h-72 rounded-card sm:h-96" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonRail, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonRail, {})
	] });
}
//#endregion
export { railTitle as _, PageSkeleton as a, Rail as c, cn as d, CONTENT_LANGS as f, pickTitle as g, pickDescription as h, PageIntro as i, TagPills as l, UI_LANGS as m, EmptyState as n, Poster as o, PrefsProvider as p, ErrorNote as r, ProviderBadge as s, DramaGrid as t, byPopularity as u, useDisplayTitles as v, usePrefs as y };
