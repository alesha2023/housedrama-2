import { PROVIDERS, type ProviderId } from "./types";

const LABELS: Record<ProviderId, string> = {
  anyreel: "AnyReel",
  bibishort: "BibiShort",
  bonustv: "BonusTV",
  candyjar: "CandyJar",
  cubetv: "CubeTV",
  dotdrama: "DotDrama",
  "dramabite-funorbit": "DramaBite",
  "dramabite-miniepisode": "MiniEpisode",
  dramabox: "DramaBox",
  dramahub: "DramaHub",
  dramanova: "DramaNova",
  dramashorts: "DramaShorts",
  dramatv: "DramaTV",
  dramawave: "DramaWave",
  dreameshort: "DreameShort",
  firedrama: "FireDrama",
  flareflow: "Flareflow",
  flextv: "FlexTV",
  flickreels: "FlickReels",
  freedrama: "FreeDrama",
  freereels: "FreeReels",
  fundrama: "FunDrama",
  goodshort: "GoodShort",
  happyshort: "HappyShort",
  idrama: "iDrama",
  joyreels: "JoyReels",
  kalostv: "KaloTV",
  melolo: "Melolo",
  microdrama: "MicroDrama",
  minidrama: "MiniDrama",
  minishorts: "MiniShorts",
  minutedrama: "MinuteDrama",
  moboreels: "MoboReels",
  moviebox: "MovieBox",
  mydrama: "MyDrama",
  myrelle: "MyRelle",
  netshort: "NetShort",
  ohmytv: "OhMyTV",
  onedrama: "OneDrama",
  pinedrama: "PineDrama",
  playlet: "Playlet",
  rapidtv: "RapidTV",
  raptdrama: "RaptDrama",
  reelala: "Reelala",
  reelbuzz: "ReelBuzz",
  reelife: "Reelife",
  reelshort: "ReelShort",
  sarostv: "SarosTV",
  serealplus: "SerealPlus",
  shortical: "Shortical",
  shortmax: "Shortmax",
  sixthshort: "SixthShort",
  soonshot: "Soonshot",
  stardusttv: "StardustTV",
  starshort: "StarShort",
  storeel: "Storeel",
  storyreel: "StoryReel",
  topdrama: "TopDrama",
  velolo: "Velolo",
  vibeshort: "VibeShort",
  vigloo: "Vigloo",
  vyntage: "Vyntage",
};

/** Hosts whose public routes live under /api. The rest are mounted at the domain root. */
const API_PREFIX = new Set<ProviderId>([
  "anyreel",
  "bibishort",
  "candyjar",
  "cubetv",
  "dramabox",
  "flextv",
  "flickreels",
  "freereels",
  "joyreels",
  "kalostv",
  "melolo",
  "microdrama",
  "moviebox",
  "mydrama",
  "myrelle",
  "playlet",
  "reelala",
  "reelife",
  "sarostv",
  "shortical",
  "shortmax",
  "stardusttv",
  "starshort",
  "velolo",
  "vigloo",
]);

export function providerLabel(id: ProviderId) {
  return LABELS[id];
}

/** Hosts that failed the last health check. Hidden from the picker, not deleted. */
const HIDDEN_PROVIDERS = new Set<ProviderId>([
  "bonustv",
  "dotdrama",
  "dramabite-funorbit",
  "dramabite-miniepisode",
  "dramahub",
  "dramashorts",
  "dramatv",
  "dreameshort",
  "firedrama",
  "flareflow",
  "freedrama",
  "fundrama",
  "minidrama",
  "minishorts",
  "minutedrama",
  "ohmytv",
  "onedrama",
  "rapidtv",
  "raptdrama",
  "serealplus",
  "sixthshort",
  "soonshot",
  "storeel",
  "storyreel",
  "topdrama",
  "vibeshort",
]);

export function isProviderHidden(id: ProviderId) {
  return HIDDEN_PROVIDERS.has(id);
}

export function visibleProviders() {
  return PROVIDERS.filter((id) => !HIDDEN_PROVIDERS.has(id));
}

export function isCoreProvider(id: ProviderId) {
  return id === "anyreel" || id === "dramabox" || id === "freereels";
}

export function providerOrigin(id: ProviderId) {
  const envKey = `${id.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_API_URL`;
  const env = process.env[envKey];
  if (env) {
    const normalized = env.trim().replace(/\/+$/, "");
    // FreeReels routes are mounted under /api. Be tolerant of a Vercel env
    // value that contains only the host instead of the complete API base URL.
    if (id === "freereels") return /\/api$/i.test(normalized) ? normalized : `${normalized}/api`;
    return normalized;
  }
  const host = `https://${id}.narto-drama.com`;
  return API_PREFIX.has(id) ? `${host}/api` : host;
}

export function homeCandidates(id: ProviderId) {
  if (id === "vigloo") return ["/get-discover", "/get-rank"];
  if (id === "dramawave") return ["/get-foryou", "/get-channels"];
  if (id === "flickreels") return ["/get-home-channels"];
  if (id === "goodshort") return ["/get-home-channels/id", "/get-home-channels/en"];
  if (id === "happyshort") return ["/get-channels", "/get-ranking"];
  if (id === "netshort") return ["/get-home", "/get-foryou", "/get-charts"];
  return ["/get-home", "/get-foryou", "/get-discover", "/get-list", "/get-hot"];
}
