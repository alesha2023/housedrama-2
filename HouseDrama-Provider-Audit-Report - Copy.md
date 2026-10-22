# HouseDrama provider audit — 21 October 2026

Probe target: `https://{id}.narto-drama.com` (and `/api` when that host mounts routes there). Timeout 7–12s. One catalog request is not treated as a dead provider. Playback was not marked successful unless a playable URL was actually returned; this pass verified catalog and, where noted, search. Full play in a browser was **NOT RUN**.

No provider ID, drama URL, or episode URL was changed. Hidden providers stay in the registry.

## Picker order

Working catalogs that answered with drama payloads are listed first. This is an availability order from this probe, not visitor-count popularity. There is no usage table that ranks providers by plays.

1. DramaBox, FreeReels, AnyReel
2. ReelShort, NetShort, Shortmax, Vigloo, Melolo, DramaWave, FlickReels, JoyReels
3. FlexTV, Velolo, HappyShort, ReelBuzz, and the other catalogs that returned HTTP 200
4. SarosTV (works, slow)
5. KaloTV, MyDrama, Playlet, StardustTV (failed this probe, still selectable)

## What changed in code

- FlexTV catalog now tries `/get-hot` first. That route returned `hot_series` with covers. `/get-foryou` timed out and `/get-home` is a 404 on the upstream.
- Velolo catalog now tries `/get-list` first. That route returned videos. `/get-home` and `/get-foryou` are upstream 404s.
- Shortmax also tries `/get-hot` after `/get-home`. Both returned dramas on this probe. Search `/search/love` returned titles.
- MyDrama no longer calls `/get-list` first. That call hung past 12s. `/get-home` and `/get-foryou` still return upstream 404, so it stays at the bottom.
- KaloTV tries the fast 404 routes instead of a hanging `/get-home`.
- Homepage popular mix no longer waits on GoodShort or StardustTV.
- Poster parser prefers `highImage` and full cover fields before `compress_cover_url` and thumbnails.
- HEIC posters converted for the browser use JPEG width 720 instead of 480. Existing JPEG/WebP URLs are not re-encoded.
- Dark theme tokens: background `#09090D`, surface `#14141B`, pink `#FF2D8D`, light pink `#FF5CAB`, text `#F7F7FA`. Glow opacity was kept low. Genre tags under episode counts stay the softer blush from the previous pass.

## Provider results

| ID | Picker | Catalog probe | Search probe | Status | Notes |
|---|---|---|---|---|---|
| dramabox | 1 | PASS 200 `/get-home` | PASS 200 `/search/love` | AKTIF | Detail and playback NOT RUN this pass |
| freereels | 2 | PASS 200 `/get-foryou` | NOT RUN | AKTIF | Catalog only |
| anyreel | 3 | PASS 200 `/get-home` | NOT RUN | AKTIF | Catalog only |
| reelshort | 4 | PASS 200 `/get-home` | FAIL 404 on `/search/love`, `?keyword`, `?q` | SEBAGIAN AKTIF | Home works. No working search route found. Not invented. |
| netshort | 5 | PASS 200 `/get-home`, later 502 | FAIL 502 `/search?keyword=love` | SEBAGIAN AKTIF | Intermittent Cloudflare 502 |
| shortmax | 6 | PASS 200 `/get-home`, `/get-hot` | PASS 200 `/search/love` | AKTIF | Bare `/get-home` without `lang` timed out once |
| vigloo | 7 | PASS 200 `/get-discover` | NOT RUN | AKTIF | |
| melolo | 8 | PASS 200 `/get-channels` | PASS 200 `/search?keyword=love` | AKTIF | HEIC covers still converted to JPEG |
| dramawave | 9 | PASS 200 `/get-foryou` | NOT RUN | AKTIF | |
| flickreels | 10 | PASS 200 `/get-home-channels` | NOT RUN | AKTIF | |
| joyreels | 11 | PASS 200 `/get-home` | NOT RUN | AKTIF | |
| flextv | 12 | PASS 200 `/get-hot` | PASS 200 `/search?keyword=love` | AKTIF | Old `/get-foryou` and `/get-home` do not serve the catalog |
| velolo | 13 | PASS 200 `/get-list` | PASS 200 but `total: 0` for "love" | SEBAGIAN AKTIF | Catalog fixed. Search endpoint responds and can be empty |
| happyshort | 14 | PASS 200 `/get-channels`, `/get-ranking` | NOT RUN | AKTIF | `/get-home` is 404 and is no longer the first route |
| reelbuzz | 15 | PASS 200 `/get-tabs` | NOT RUN | AKTIF | |
| reelala | 16 | PASS 200 `/get-home` | NOT RUN | AKTIF | |
| bibishort | 17 | PASS 200 `/get-home` | NOT RUN | AKTIF | |
| cubetv | 18 | PASS 200 `/get-home` | NOT RUN | AKTIF | |
| candyjar | 19 | PASS 200 `/get-home` | NOT RUN | AKTIF | Slow, about 7s |
| idrama | 20 | PASS 200 `/get-home` | NOT RUN | AKTIF | |
| myrelle | 21 | PASS 200 `/get-home` | NOT RUN | AKTIF | |
| pinedrama | 22 | PASS 200 `/get-home` | NOT RUN | AKTIF | |
| reelife | 23 | PASS 200 `/get-home` | NOT RUN | AKTIF | |
| shortical | 24 | PASS 200 `/get-home` | NOT RUN | AKTIF | |
| starshort | 25 | PASS 200 `/get-home` | NOT RUN | AKTIF | |
| vyntage | 26 | PASS 200 `/get-home` | NOT RUN | AKTIF | |
| moboreels | 27 | PASS 200 `/get-foryou` | NOT RUN | AKTIF | Slow, about 7s |
| sarostv | 28 | PASS 200 `/get-foryou` in 10s | NOT RUN | SEBAGIAN AKTIF | Works, often slower than the 7s page budget |
| kalostv | 29 | FAIL | FAIL | GAGAL | Upstream 404 or timeout on every route tried |
| mydrama | 30 | FAIL | FAIL | GAGAL | `/get-list` hung. Other catalog routes are upstream 404 |
| playlet | 31 | FAIL 502 | NOT RUN | GAGAL | Cloudflare 502. Not a CORS miss |
| stardusttv | 32 | FAIL 502 `/get-hot` | FAIL | GAGAL | `/get-home` and `/get-foryou` are upstream 404 |

Hidden providers were probed and left hidden. They are not deleted.

| ID | Result | Why it stays hidden |
|---|---|---|
| goodshort | `/get-home-channels/en` returned 200 once, then 404 | Not stable. Payload was a channel list, not drama cards |
| microdrama, dramanova | HTTP 500 | Upstream error |
| moviebox, bonustv, dotdrama, dramabite-miniepisode, dramashorts, flareflow, rapidtv, raptdrama, serealplus, storyreel, topdrama, vibeshort | HTTP 404 | Route not on the host |
| dramabite-funorbit, dramahub, dramatv, dreameshort, firedrama, freedrama, fundrama, minidrama, minishorts, minutedrama, ohmytv, onedrama, sixthshort, soonshot, storeel | DNS or connection error | Host did not resolve |

## Tests

| Check | Status | Result |
|---|---|---|
| Provider catalog probe | PASS | 64 hosts contacted from this environment |
| DramaBox search | PASS | HTTP 200, titles returned |
| Melolo search | PASS | HTTP 200, titles returned |
| FlexTV `/get-hot` and search | PASS | HTTP 200 after the route change |
| Velolo `/get-list` | PASS | HTTP 200, videos returned |
| Shortmax home and search | PASS | HTTP 200 |
| Episode playback in a browser | NOT RUN | No stream URL was claimed |
| Subtitles | NOT RUN | Not exercised this pass |
| `node --test` drama image, generic, site, proxy | PASS | 11/11 |
| `tsc --noEmit` | PASS | no errors |
| `eslint` | NOT RUN | not executed this pass |
| Production build | NOT RUN | not executed this pass |
| Visitor stats / Neon | NOT RUN | no schema or query change |
| Live domain house-drama.xyz | NOT RUN | this environment did not deploy |

## Still open

- ReelShort has no search route that returned JSON.
- NetShort and Playlet hit Cloudflare 502 during the probe.
- SarosTV can exceed the homepage time budget.
- GoodShort flickered between 200 and 404 and is still hidden.
- Poster sharpness is limited by the file each provider sends. Only HEIC conversion width and field priority changed.
- A provider that failed here can move back up after a later probe. IDs were not removed.
