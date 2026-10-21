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
  "reelbuzz",
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
  "goodshort",
  "microdrama",
  "moviebox",
  "dramanova",
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
  const visible = PROVIDERS.filter((id) => !HIDDEN_PROVIDERS.has(id));
  const rank = new Map(PICKER_ORDER.map((id, index) => [id, index]));
  return [...visible].sort((a, b) => (rank.get(a) ?? 80) - (rank.get(b) ?? 80));
}

/**
 * Picker order from the 2026-10-21 catalog probe.
 * Working, widely used catalogs stay first. Proven failures stay last and
 * remain selectable so they can recover without a code change.
 */
const PICKER_ORDER: ProviderId[] = [
  "dramabox",
  "freereels",
  "anyreel",
  "reelshort",
  "netshort",
  "shortmax",
  "vigloo",
  "melolo",
  "dramawave",
  "flickreels",
  "joyreels",
  "flextv",
  "velolo",
  "happyshort",
  "reelbuzz",
  "reelala",
  "bibishort",
  "cubetv",
  "candyjar",
  "idrama",
  "myrelle",
  "pinedrama",
  "reelife",
  "shortical",
  "starshort",
  "vyntage",
  "moboreels",
  "sarostv",
  "kalostv",
  "mydrama",
  "playlet",
  "stardusttv",
];

export function isCoreProvider(id: ProviderId) {
  return id === "anyreel" || id === "dramabox" || id === "freereels";
}

export function providerOrigin(id: ProviderId) {
  const envKey = `${id.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_API_URL`;
  const env = process.env[envKey];
  if (env) return env.replace(/\/$/, "");
  const host = `https://${id}.narto-drama.com`;
  return API_PREFIX.has(id) ? `${host}/api` : host;
}

export function homeCandidates(id: ProviderId) {
  if (id === "reelbuzz") return ["/get-tabs", "/get-categories"];
  if (id === "mydrama") return ["/get-home", "/get-foryou"];
  if (id === "sarostv") return ["/get-foryou", "/get-home"];
  if (id === "starshort") return ["/get-foryou", "/get-home"];
  if (id === "stardusttv") return ["/get-hot"];
  if (id === "vigloo") return ["/get-discover", "/get-rank"];
  if (id === "dramawave") return ["/get-foryou", "/get-channels"];
  if (id === "flickreels") return ["/get-home-channels"];
  if (id === "goodshort") return ["/get-home-channels/id", "/get-home-channels/en"];
  if (id === "happyshort") return ["/get-channels", "/get-ranking"];
  if (id === "flextv") return ["/get-hot", "/get-foryou", "/get-home", "/get-list"];
  if (id === "velolo") return ["/get-list", "/get-hot", "/get-home"];
  if (id === "shortmax") return ["/get-home", "/get-hot"];
  if (id === "kalostv") return ["/get-foryou", "/get-discover"];
  if (id === "netshort") return ["/get-home", "/get-foryou", "/get-charts"];
  return ["/get-home", "/get-foryou", "/get-discover", "/get-list", "/get-hot"];
}
