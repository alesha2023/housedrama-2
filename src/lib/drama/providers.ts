import type { ProviderId } from "./types";

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
  if (id === "vigloo") return ["/get-discover", "/get-rank"];
  if (id === "dramawave") return ["/get-foryou", "/get-channels"];
  if (id === "flickreels") return ["/get-home-channels"];
  if (id === "goodshort") return ["/get-home-channels/id", "/get-home-channels/en"];
  if (id === "happyshort") return ["/get-channels", "/get-ranking"];
  if (id === "netshort") return ["/get-home", "/get-foryou", "/get-charts"];
  return ["/get-home", "/get-foryou", "/get-discover", "/get-list", "/get-hot"];
}
