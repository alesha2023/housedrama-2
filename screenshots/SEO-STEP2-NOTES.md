# HouseDrama SEO — Step 2: Language landing pages

This step adds stable, crawlable language-specific landing pages:
- `/en` — English landing page with English title/description metadata.
- `/id` — Indonesian landing page with Indonesian title/description metadata.

It also adds reciprocal `hreflang` alternates (`en`, `id`, and `x-default`) for the home and language landing pages, adds `/en` and `/id` to the sitemap, and sets the document language based on explicit locale paths. The existing `/` URL and existing drama URLs are retained.

## Before production deployment

- Run `npm ci` and `npm run typecheck`.
- Run the production build in the project's normal deployment environment.
- Verify `/en`, `/id`, `/sitemap.xml`, canonical links, `hreflang`, and page language after deployment.
- Confirm the homepage's IP-based default behavior remains as intended.

Dependency installation did not complete in the current working environment, so a full typecheck/build could not be confirmed here.
