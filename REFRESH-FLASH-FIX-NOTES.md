# Refresh flash fix

Small targeted fix in `src/components/drama/shell.tsx` (`SocialGlyph`): Facebook/Instagram/TikTok/YouTube inline SVGs now declare explicit 20x20 dimensions and inline display sizing. Without explicit SVG dimensions, the browser's default replaced-element size can appear briefly before the Tailwind stylesheet is applied on a hard refresh, matching the oversized Facebook glyph seen in the user's recording.

No database schema/data, visitor counting, Trending logic, routes, provider IDs, or drama URLs were changed.

Validation: ZIP integrity checked after packaging. This is a targeted source correction; production behavior still needs confirmation after deploying and hard-refreshing `/trending`.
