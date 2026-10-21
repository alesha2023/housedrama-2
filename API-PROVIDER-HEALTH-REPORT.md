# API provider health

Final spot check: 2026-10-21, about 13:41 UTC, from this environment, 8–12 second timeout, against `https://{id}.narto-drama.com`.

A PASS means the route used by this source returned HTTP 200 and a body larger than 400 bytes that contains an `http` URL. It does **not** mean every episode plays, and it does **not** mean the provider will stay up.

Hidden providers were not all called again. Their earlier FAIL or NOT RETESTED status stands.

## Visible providers, this probe

| Provider | Status | Route checked | Notes |
| --- | --- | --- | --- |
| anyreel | PASS | `/api/get-home` | 61254 bytes. |
| bibishort | PASS | `/api/get-home` | Body larger than 80 KB (read capped). |
| candyjar | PASS | `/api/get-home` | First try timed out. Retry HTTP 200. |
| cubetv | PASS | `/api/get-home` | 79017 bytes. |
| dramabox | PASS | `/api/get-home` | 25224 bytes. |
| dramawave | PASS | `/api/get-foryou` | Body capped at 80 KB. |
| flextv | PASS | `/api/get-foryou` | 55060 bytes. |
| flickreels | PARTIAL | `/api/get-home-channels` | HTTP 200, only 650 bytes. That route is a channel index. The catalog follows a channel id. Episode playback NOT TESTED. |
| freereels | PASS | `/api/get-foryou?lang=en&offset=0` | `/api/get-home` is HTTP 404. The app does not use that path. |
| happyshort | PASS | `/get-channels` | Body capped at 80 KB. |
| idrama | PASS | `/get-home` | Body capped at 80 KB. |
| joyreels | PASS | `/api/get-home` | 23432 bytes. |
| kalostv | PASS | `/api/get-home` | First try timed out. Retry HTTP 200. |
| melolo | PARTIAL | `/api/get-channels` | HTTP 200, 750 bytes. `/api/get-home` is HTTP 404. Posters come from channel content. HEIC wrapping remains in `browserPosterUrl`. A full poster download was NOT TESTED this pass. |
| moboreels | FAIL | `/api/get-home` | HTTP 502. Still visible. One failure does not stop the homepage. |
| mydrama | PASS | `/api/get-list` | First try timed out. Retry HTTP 200. |
| myrelle | PASS | `/api/get-home` | 64561 bytes. |
| netshort | PASS | `/api/get-home` | 14337 bytes. |
| pinedrama | PASS | `/get-home` | 7861 bytes. |
| playlet | FAIL | `/api/get-home` | HTTP 502 on this probe. Previously flaky (200 then 502). Still visible. |
| reelala | PASS | `/api/get-home` | 41108 bytes. |
| reelbuzz | PASS | `/api/get-tabs` | 40151 bytes. Root paths stay 403; the client uses `/api`. |
| reelife | PASS | `/api/get-home` | 18186 bytes. |
| reelshort | PASS | `/get-home` | Body capped at 80 KB. |
| sarostv | PASS | `/api/get-foryou` | First try timed out. Retry HTTP 200, 9306 bytes. |
| shortical | PASS | `/api/get-home` | 26160 bytes. |
| shortmax | PASS | `/api/get-home` | First try timed out. Retry HTTP 200. |
| stardusttv | PASS | `/api/get-hot` | 49635 bytes. Do not add `lang=en`; that query is empty. Detail HTTP 502 is still skipped in favor of the episode list. |
| starshort | PASS | `/api/get-foryou` | 12851 bytes. |
| velolo | FAIL | `/api/get-home` | HTTP 500. Still visible. |
| vigloo | PASS | `/api/get-discover` | 62730 bytes. |
| vyntage | PASS | `/get-home` | Body capped at 80 KB. |

## Still failing or hidden

These IDs stay in the provider list. Hidden ones are removed from the picker only.

| Provider | Status | Note |
| --- | --- | --- |
| velolo | FAIL | HTTP 500 this pass. |
| moboreels | FAIL | HTTP 502 this pass. |
| playlet | FAIL | HTTP 502 this pass. Upstream has also returned 200 before. |
| goodshort | FAIL | Earlier pass. Channel index only, content routes 404. Hidden. |
| moviebox | FAIL | Earlier pass. Catalog 404. Hidden. |
| microdrama | FAIL | Earlier pass. HTTP 500. Hidden. |
| dramanova | FAIL | Earlier pass. HTTP 502. Hidden. |
| bonustv, dotdrama, dramabite-funorbit, dramabite-miniepisode, dramahub, dramashorts, dramatv, dreameshort, firedrama, flareflow, freedrama, fundrama, minidrama, minishorts, minutedrama, ohmytv, onedrama, rapidtv, raptdrama, serealplus, sixthshort, soonshot, storeel, storyreel, topdrama, vibeshort | NOT RETESTED | Still hidden from the earlier DNS, 404, or 502 results. |

## App APIs

| Route | Result |
| --- | --- |
| `GET /api/visitor-count` | PASS on the local server. Counts returned. Production Neon NOT TESTED. |
| `GET /api/poster?u=https://127.0.0.1/a.jpg` | PASS. HTTP 403. |
| `GET /api/drama-trending` | NOT TESTED as HTTP this pass. |
| Episode stream playback | NOT TESTED this pass. |
