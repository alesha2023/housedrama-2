export const PROVIDERS = [
  "anyreel",
  "bibishort",
  "bonustv",
  "candyjar",
  "cubetv",
  "dotdrama",
  "dramabite-funorbit",
  "dramabite-miniepisode",
  "dramabox",
  "dramahub",
  "dramanova",
  "dramashorts",
  "dramatv",
  "dramawave",
  "dreameshort",
  "firedrama",
  "flareflow",
  "flextv",
  "flickreels",
  "freedrama",
  "freereels",
  "fundrama",
  "goodshort",
  "happyshort",
  "idrama",
  "joyreels",
  "kalostv",
  "melolo",
  "microdrama",
  "minidrama",
  "minishorts",
  "minutedrama",
  "moboreels",
  "moviebox",
  "mydrama",
  "myrelle",
  "netshort",
  "ohmytv",
  "onedrama",
  "pinedrama",
  "playlet",
  "rapidtv",
  "raptdrama",
  "reelala",
  "reelbuzz",
  "reelife",
  "reelshort",
  "sarostv",
  "serealplus",
  "shortical",
  "shortmax",
  "sixthshort",
  "soonshot",
  "stardusttv",
  "starshort",
  "storeel",
  "storyreel",
  "topdrama",
  "velolo",
  "vibeshort",
  "vigloo",
  "vyntage",
] as const;

export type ProviderId = (typeof PROVIDERS)[number];

export type EpisodeAccess = "open" | "limited";

export type TranslationStatus = "provider" | "translated" | "original";

export type DramaCard = {
  provider: ProviderId;
  seriesId: string;
  title: string;
  posterUrl: string | null;
  bannerUrl: string | null;
  description: string | null;
  tags: string[];
  language: string | null;
  episodeCount: number | null;
  completed: boolean | null;
  scoreLabel: string | null;
  playCount: string | null;
  badge: string | null;
  firstEpisodeId: string | null;
  originalTitle?: string;
  displayTitle?: string;
  originalDescription?: string | null;
  displayDescription?: string | null;
  translationStatus?: TranslationStatus;
};

export type Episode = {
  episodeId: string;
  index: number;
  title: string;
  coverUrl: string | null;
  durationSec: number | null;
  access: EpisodeAccess;
  originalTitle?: string;
  displayTitle?: string;
  translationStatus?: TranslationStatus;
};

export type SubtitleTrack = {
  lang: string;
  label: string;
  url: string;
};

export type StreamCandidate = {
  url: string;
  format: "hls" | "mp4";
  quality: string | null;
  subtitles: SubtitleTrack[];
};

export type ProviderStatus = {
  id: ProviderId;
  ok: boolean;
  error: string | null;
};

export type CatalogSection = {
  id: string;
  title: string;
  items: DramaCard[];
};

export type HomePayload = {
  hero: DramaCard[];
  sections: CatalogSection[];
  providers: ProviderStatus[];
  generatedAt: number;
};

export type DetailPayload = {
  ok: boolean;
  error: string | null;
  drama: DramaCard | null;
  episodes: Episode[];
  similar: DramaCard[];
  more: DramaCard[];
  alsoOn: DramaCard[];
};

export type StreamPayload = {
  ok: boolean;
  provider: ProviderId;
  seriesId: string;
  episodeId: string;
  candidates: StreamCandidate[];
  message: string | null;
};

export type SearchPayload = {
  items: DramaCard[];
  suggestions: string[];
  providers: ProviderStatus[];
  page: number;
  hasMore: boolean;
};

export type BrowsePayload = {
  title: string;
  items: DramaCard[];
  providers: ProviderStatus[];
  page: number;
  hasMore: boolean;
};

export type AdminProviderStat = {
  id: ProviderId;
  enabled: boolean;
  okCount: number;
  failCount: number;
  avgMs: number | null;
  lastMs: number | null;
  lastOkAt: number | null;
  lastError: string | null;
  playbackOk: number;
  playbackFail: number;
};

export type AdminSnapshot = {
  providers: AdminProviderStat[];
  cacheEntries: number;
  sections: { id: string; enabled: boolean }[];
  generatedAt: number;
};

export function isProviderId(value: string): value is ProviderId {
  return (PROVIDERS as readonly string[]).includes(value);
}

export function dramaKey(item: Pick<DramaCard, "provider" | "seriesId">) {
  return `${item.provider}:${item.seriesId}`;
}
