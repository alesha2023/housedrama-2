DramaLuma VAST playback stabilization patch

Changes:
- Consolidated VAST fallback playback so `playContent()` is invoked once after the ad request resolves.
- Prevented concurrent/repeated Play handlers while an ad request or play request is in progress.
- If IMA SDK is not ready or the VAST request fails, the player reports the error and allows the drama to play without marking the ad as completed.
- Fixed pre-existing syntax corruption in `src/lib/drama/server/generic.ts` around the Melolo category/browse functions, which previously prevented TypeScript parsing.

Important:
- The archive was inspected and the previously broken TypeScript syntax was corrected.
- A full typecheck/build could not be completed in this environment because dependencies/type definitions (`@types/node`, `vite/client`) are not installed.
- This patch does not guarantee HilltopAds will serve an ad; the VAST endpoint must return a valid ad response.
