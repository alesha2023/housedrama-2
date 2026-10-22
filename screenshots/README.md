# HouseDrama

A free Chinese short-drama catalog that plays publicly available titles from AnyReel, DramaBox, and FreeReels. HouseDrama does not sell coins, VIP, or episodes, and it does not claim ownership of the shows.

## Catalogs

Provider base URLs default to the public endpoints and can be overridden on the server:

- `ANYREEL_API_URL` (default `https://anyreel.narto-drama.com/api`)
- `DRAMABOX_API_URL` (default `https://dramabox.narto-drama.com/api`)
- `FREEREELS_API_URL` (default `https://freereels.narto-drama.com/api`)

Requests are made on the server so the browser does not have to talk to those hosts directly. Catalog JSON is cached for about a minute. Playback URLs are cached for only a few seconds because some of them expire.

## Playback notes

- AnyReel returns HLS (`.m3u8`). HTTP URLs are upgraded to HTTPS. Episode  paths use the provider’s episode sort number.
- DramaBox playback prefers `/get-all-streams-proxy`, then `/get-all-streams`, then `/get-stream`. Files are MP4. `/get-hls` was not available for the titles tested (HTTP 404), so it is only a fallback.
- FreeReels returns HLS. Its CDN does not send CORS headers, so Chrome plays those playlists through `/api/media`, which only proxies the provider CDNs. The stream call sends `unlock=0` and does not try to bypass locks.
- If a provider does not return a URL, the player shows that error. It never invents a stream.

AnyReel’s own status note says its catalog language is fixed when the guest session is created, so the language menu changes DramaBox (`lang`) and FreeReels (`lang`) only.

`/get-feed` and `/get-nodes` on AnyReel returned HTTP 502 during integration. The app does not depend on them. `/flush-cache`, `/pool-stats`, and `/gaid-deaths` are never called from the site.

## Saved on this device

Watchlist, history, resume position, volume, and language live in `localStorage`. There is no viewer account.

## Admin

`/admin` asks for a password checked on the server.

- `DRAMA_ADMIN_PASSWORD` (required in production)
- `DRAMA_ADMIN_SECRET` (required in production; signs the session token)

Production admin login is disabled unless both variables are set. Local development keeps the convenience defaults.

Provider on/off switches and homepage section toggles stay in process memory and reset on restart. They are not a public control.

## Routes

`/`, `/discover`, `/trending`, `/latest`, `/search`, `/shorts`, `/categories`, `/provider/anyreel`, `/provider/dramabox`, `/provider/freereels`, `/drama/$provider/$seriesId`, `/watch/$provider/$seriesId/$episodeId`, `/watchlist`, `/history`, `/about`, `/privacy`, `/terms`, `/admin`, `/sitemap.xml`.
