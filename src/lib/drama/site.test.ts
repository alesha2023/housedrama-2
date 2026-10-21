import assert from "node:assert/strict";
import test from "node:test";
import { absoluteSiteUrl, jsonLdScript, pageSeo, productionHostRedirect, SITE_ORIGIN } from "./site.ts";

test("canonical origin is the production apex, not the request host", () => {
  assert.equal(SITE_ORIGIN, "https://house-drama.xyz");
  assert.equal(absoluteSiteUrl("/drama/freereels/LSjOzwuyTG"), "https://house-drama.xyz/drama/freereels/LSjOzwuyTG");
  assert.equal(absoluteSiteUrl("/"), "https://house-drama.xyz/");
  const seo = pageSeo({ title: "Discover", description: "Catalog", path: "/discover" });
  const canonical = seo.links.find((link) => link.rel === "canonical");
  assert.equal(canonical?.href, "https://house-drama.xyz/discover");
  const ogUrl = seo.meta.find((meta) => "property" in meta && meta.property === "og:url");
  assert.equal(ogUrl && "content" in ogUrl ? ogUrl.content : "", "https://house-drama.xyz/discover");
  assert.equal(JSON.stringify(seo).includes("house-drama.web.id"), false);
});

test("host redirect keeps path and query and does not loop", () => {
  assert.equal(
    productionHostRedirect("https://house-drama.web.id/watch/dramabox/42000026343/1?auto=true"),
    "https://house-drama.xyz/watch/dramabox/42000026343/1?auto=true",
  );
  assert.equal(
    productionHostRedirect("http://www.house-drama.web.id/id?x=1#top"),
    "https://house-drama.xyz/id?x=1#top",
  );
  assert.equal(
    productionHostRedirect("https://www.house-drama.xyz/drama/freereels/LSjOzwuyTG"),
    "https://house-drama.xyz/drama/freereels/LSjOzwuyTG",
  );
  assert.equal(productionHostRedirect("https://house-drama.xyz/drama/freereels/LSjOzwuyTG"), null);
  assert.equal(productionHostRedirect("https://house-drama.xyz/"), null);
  assert.equal(productionHostRedirect("https://preview.example.com/drama/a/b"), null);
  assert.equal(productionHostRedirect("https://evil.example/?url=https://house-drama.web.id/"), null);
});

test("json-ld escapes markup and does not invent ratings", () => {
  const raw = jsonLdScript({ "@type": "TVSeries", name: "</script><script>alert(1)", aggregateRating: undefined });
  assert.equal(raw.includes("</script>"), false);
  assert.equal(raw.includes("aggregateRating"), false);
});
