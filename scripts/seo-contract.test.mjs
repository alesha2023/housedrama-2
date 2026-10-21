import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { legacyRedirectLocation } from "../workers/legacy-domain-redirect.js";

const sitemap = readFileSync("src/routes/sitemap[.]xml.ts", "utf8");
const robots = readFileSync("public/robots.txt", "utf8");
const drama = readFileSync("src/routes/drama/$provider/$seriesId.tsx", "utf8");
const watch = readFileSync("src/routes/watch/$provider/$seriesId/$episodeId.tsx", "utf8");
const provider = readFileSync("src/routes/provider/$provider.tsx", "utf8");
const english = readFileSync("src/routes/en.tsx", "utf8");
const root = readFileSync("src/routes/__root.tsx", "utf8");

test("legacy worker redirects only the old host and keeps path plus query", () => {
  assert.equal(
    legacyRedirectLocation("https://house-drama.web.id/drama/freereels/LSjOzwuyTG?ref=g"),
    "https://house-drama.xyz/drama/freereels/LSjOzwuyTG?ref=g",
  );
  assert.equal(
    legacyRedirectLocation("https://www.house-drama.web.id/sitemap.xml"),
    "https://house-drama.xyz/sitemap.xml",
  );
  assert.equal(legacyRedirectLocation("https://house-drama.xyz/drama/freereels/LSjOzwuyTG"), null);
  assert.equal(legacyRedirectLocation("https://www.house-drama.xyz/"), null);
});

test("sitemap lists the production origin and omits non-indexable routes", () => {
  assert.match(sitemap, /const SITE_ORIGIN = "https:\/\/house-drama\.xyz"/);
  assert.equal(sitemap.includes("house-drama.web.id"), false);
  assert.equal(sitemap.includes('"/en"'), false);
  assert.equal(sitemap.includes('"/history"'), false);
  assert.equal(sitemap.includes('"/watchlist"'), false);
  assert.equal(sitemap.includes('"/search"'), false);
  assert.equal(sitemap.includes('"/admin"'), false);
  assert.equal(sitemap.includes("/watch/"), false);
  assert.match(sitemap, /"\/"/);
  assert.match(sitemap, /"\/id"/);
  assert.match(sitemap, /"\/drama\/freereels\/LSjOzwuyTG"/);
});

test("robots.txt points at the new sitemap and blocks private routes", () => {
  assert.match(robots, /Sitemap: https:\/\/house-drama\.xyz\/sitemap\.xml/);
  assert.match(robots, /Disallow: \/admin/);
  assert.match(robots, /Disallow: \/api\//);
  assert.match(robots, /Disallow: \/history/);
  assert.match(robots, /Disallow: \/watchlist/);
  assert.match(robots, /Disallow: \/search/);
  assert.equal(robots.includes("house-drama.web.id"), false);
});

test("drama and watch metadata stay on the fixed origin", () => {
  assert.match(drama, /throw notFound\(\)/);
  assert.match(drama, /applyHttpStatus\(503\)/);
  assert.match(drama, /absoluteSiteUrl\(`/);
  assert.equal(drama.includes("aggregateRating"), false);
  assert.equal(drama.includes("house-drama.web.id"), false);
  assert.match(watch, /noindex,follow/);
  assert.match(watch, /absoluteSiteUrl\(`\/drama\//);
  assert.match(watch, /throw notFound\(\)/);
  assert.match(provider, /isProviderHidden/);
  assert.match(provider, /throw notFound\(\)/);
  assert.match(english, /statusCode: 301/);
  assert.match(english, /href: "\/"/);
  assert.match(root, /getProductionRedirect/);
  assert.match(root, /"@type": "WebSite"/);
  assert.match(root, /"@type": "Organization"/);
  assert.equal(root.includes("aggregateRating"), false);
});
