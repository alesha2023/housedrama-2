import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";

export const UI_LANGS = [
  { id: "en", label: "English" },
  { id: "id", label: "Indonesia" },
] as const;

export const CONTENT_LANGS = [
  { id: "en", label: "English" },
  { id: "id", label: "Indonesia" },
] as const;

const RAIL_TITLES = {
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
    freereels: "From FreeReels",
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
    freereels: "Dari FreeReels",
  },
} as const;

export function railTitle(lang: keyof typeof RAIL_TITLES, id: string, fallback: string) {
  const table = RAIL_TITLES[lang] as Record<string, string>;
  return table[id] ?? fallback;
}

const COPY = {
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
    searchIntro: "Temukan drama favoritmu dengan mencari judulnya.",
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
    about1:
      "HouseDrama lets you browse and play short dramas that AnyReel, DramaBox, and FreeReels already expose through their public APIs. There is no subscription, no coin wallet, and no VIP gate on this site.",
    about2:
      "The shows themselves belong to their creators and the platforms that distribute them. HouseDrama does not claim ownership, re-upload files, or bypass access controls. If a provider does not return a playable stream, the episode stays unavailable.",
    about3:
      "Switch the interface and catalog between English and Indonesian. AnyReel’s language follows that provider’s session. DramaBox and FreeReels accept the catalog language. Some titles stay in their original language anyway.",
    about4: "Watch history and your watchlist live in this browser only. Clearing site data removes them.",
    privacy1: "HouseDrama does not ask you to create an account to browse or watch publicly available episodes.",
    privacy2:
      "Saved dramas, watch history, playback position, volume, autoplay, and language choices are stored in local storage on your device. They are not sent to a HouseDrama account database.",
    privacy3:
      "Requests for catalogs and streams go to AnyReel, DramaBox, and FreeReels, or through HouseDrama’s server so the browser can reach hosts that do not allow cross-origin playback. Those providers may see a request for the title you opened.",
    privacy4: "The admin dashboard is separate and does not collect visitor profiles. Operational counters stay in server memory and reset when the server restarts.",
    termsTitle: "Terms of use",
    terms1: "HouseDrama is an unofficial viewing catalog. It is not AnyReel, DramaBox, or FreeReels, and it is not the producer of the dramas.",
    terms2:
      "Streams are shown only when a connected provider returns a URL. Availability, subtitles, languages, and region access can change without notice. An episode that fails to play is not unlocked.",
    terms3:
      "Do not use HouseDrama to download, copy, or redistribute dramas. If you are a rightsholder and want a title removed from this catalog view, contact the provider that serves it.",
    terms4: "The service is offered as-is, without a promise that every title in a provider’s app will play here.",
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
    searchIntro: "Temukan drama favoritmu dengan mencari judulnya.",
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
    providerLabel: "Penyedia",
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
    about1:
      "HouseDrama memungkinkan Anda menelusuri dan memutar drama pendek yang sudah dibuka AnyReel, DramaBox, dan FreeReels lewat API publik mereka. Situs ini tidak punya langganan, dompet koin, atau gerbang VIP.",
    about2:
      "Acaranya milik kreator dan platform yang mendistribusikannya. HouseDrama tidak mengklaim kepemilikan, tidak mengunggah ulang berkas, dan tidak melewati kontrol akses. Jika penyedia tidak mengembalikan stream yang bisa diputar, episode tetap tidak tersedia.",
    about3:
      "Ganti antarmuka dan katalog antara Inggris dan Indonesia. Bahasa AnyReel mengikuti sesi penyedia itu. DramaBox dan FreeReels menerima bahasa katalog. Sebagian judul tetap dalam bahasa aslinya.",
    about4: "Riwayat tonton dan daftar tonton hanya ada di peramban ini. Menghapus data situs akan menghilangkannya.",
    privacy1: "HouseDrama tidak meminta Anda membuat akun untuk menelusuri atau menonton episode yang tersedia untuk umum.",
    privacy2:
      "Drama tersimpan, riwayat tonton, posisi putar, volume, putar otomatis, dan pilihan bahasa disimpan di penyimpanan lokal perangkat Anda. Itu tidak dikirim ke basis data akun HouseDrama.",
    privacy3:
      "Permintaan katalog dan stream pergi ke AnyReel, DramaBox, dan FreeReels, atau lewat server HouseDrama agar peramban bisa menjangkau host yang menolak pemutaran lintas asal. Penyedia itu bisa melihat permintaan judul yang Anda buka.",
    privacy4: "Dasbor admin terpisah dan tidak mengumpulkan profil pengunjung. Penghitung operasional ada di memori server dan reset saat server dimulai ulang.",
    termsTitle: "Ketentuan penggunaan",
    terms1: "HouseDrama adalah katalog tontonan tidak resmi. Ini bukan AnyReel, DramaBox, atau FreeReels, dan bukan produsen dramanya.",
    terms2:
      "Stream hanya ditampilkan saat penyedia yang terhubung mengembalikan URL. Ketersediaan, subtitle, bahasa, dan akses wilayah bisa berubah tanpa pemberitahuan. Episode yang gagal diputar bukan berarti terbuka.",
    terms3:
      "Jangan gunakan HouseDrama untuk mengunduh, menyalin, atau menyebarluaskan drama. Jika Anda pemegang hak dan ingin judul dihapus dari tampilan katalog ini, hubungi penyedia yang menyajikannya.",
    terms4: "Layanan ditawarkan apa adanya, tanpa janji bahwa setiap judul di aplikasi penyedia akan bisa diputar di sini.",
  },
} as const;

export type UiLang = keyof typeof COPY;
export type Copy = { [K in keyof (typeof COPY)["en"]]: string };

type Prefs = {
  uiLang: UiLang;
  contentLang: string;
  t: Copy;
  setUiLang: (lang: UiLang) => void;
  setContentLang: (lang: string) => void;
};

const PrefsContext = createContext<Prefs | null>(null);

function isUiLang(value: string | null): value is UiLang {
  return value === "en" || value === "id";
}

function writeLangCookie(lang: UiLang, manual: boolean) {
  if (typeof document === "undefined") return;
  document.cookie = `hd_lang=${lang}; path=/; max-age=31536000; samesite=lax`;
  document.cookie = manual
    ? "hd_manual=1; path=/; max-age=31536000; samesite=lax"
    : "hd_manual=; path=/; max-age=0; samesite=lax";
}

export function PrefsProvider({ initialLang = "id", children }: { initialLang?: UiLang; children: ReactNode }) {
  const router = useRouter();
  const [uiLang, setUiLangState] = useState<UiLang>(initialLang);
  const [contentLang, setContentLangState] = useState(initialLang);

  useEffect(() => {
    let cancelled = false;
    const manualChoice = localStorage.getItem("dramaluma.ui.manual") === "1";
    if (manualChoice) {
      const ui = localStorage.getItem("dramaluma.ui");
      const content = localStorage.getItem("dramaluma.content");
      const lang: UiLang = isUiLang(ui) ? ui : content === "en" ? "en" : "id";
      setUiLangState(lang);
      setContentLangState(content === "en" || content === "id" ? content : lang);
      writeLangCookie(lang, true);
      return () => { cancelled = true; };
    }

    writeLangCookie(initialLang, false);
    const applyAutoLanguage = (lang: UiLang) => {
      if (cancelled || localStorage.getItem("dramaluma.ui.manual") === "1" || lang === initialLang) return;
      setUiLangState(lang);
      setContentLangState(lang);
      localStorage.setItem("dramaluma.ui", lang);
      localStorage.setItem("dramaluma.content", lang);
      writeLangCookie(lang, false);
      void router.invalidate();
    };

    fetch("https://ipapi.co/json/", { headers: { Accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error("IP language lookup failed");
        return response.json() as Promise<{ country_code?: string }>;
      })
      .then((data) => applyAutoLanguage(data.country_code?.toUpperCase() === "ID" ? "id" : "en"))
      .catch(() => {
        // The server already chose a language from the request IP when it could.
      });

    return () => { cancelled = true; };
  }, [initialLang, router]);

  useEffect(() => {
    document.documentElement.lang = uiLang;
  }, [uiLang]);

  const value = useMemo<Prefs>(
    () => ({
      uiLang,
      contentLang,
      t: COPY[uiLang],
      setUiLang: (lang) => {
        setUiLangState(lang);
        setContentLangState(lang);
        localStorage.setItem("dramaluma.ui", lang);
        localStorage.setItem("dramaluma.content", lang);
        localStorage.setItem("dramaluma.ui.manual", "1");
        writeLangCookie(lang, true);
        void router.invalidate();
      },
      setContentLang: (lang) => {
        const next = lang === "id" ? "id" : "en";
        setContentLangState(next);
        setUiLangState(next);
        localStorage.setItem("dramaluma.ui", next);
        localStorage.setItem("dramaluma.content", next);
        localStorage.setItem("dramaluma.ui.manual", "1");
        writeLangCookie(next, true);
        void router.invalidate();
      },
    }),
    [uiLang, contentLang, router],
  );

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("Prefs missing");
  return ctx;
}
