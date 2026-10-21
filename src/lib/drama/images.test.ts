import assert from "node:assert/strict";
import test from "node:test";
import { normalizeImageUrl, browserPosterUrl } from "./images.ts";

test("keeps a valid signed poster URL unchanged", () => {
  const url = "https://p16-common-sign.tiktokcdn.com/tos-alisg/abc~tplv/image.jpg?x-expires=1&x-signature=ab%2Bcd";
  assert.equal(normalizeImageUrl(url), url);
});

test("encodes spaces and raw unicode in poster paths", () => {
  const cubetv = "https://static-aka.cubetv.cc/drama-auto-import/54/I Didn't Know.jpg";
  const fixed = normalizeImageUrl(cubetv);
  assert.ok(fixed);
  assert.equal(fixed?.includes(" "), false);
  assert.equal(fixed?.includes(" "), false);
  assert.match(fixed ?? "", /\/I%20Didn/);
  assert.match(fixed ?? "", /Know\.jpg$/);

  const velolo = "https://res.velolo.tv/indonesiaPlay/1/POSTER ID.jpg?x-oss-process=image/resize,w_540";
  const veloloFixed = normalizeImageUrl(velolo);
  assert.ok(veloloFixed);
  assert.match(veloloFixed ?? "", /POSTER%20ID\.jpg/);
  assert.match(veloloFixed ?? "", /x-oss-process=image\/resize,w_540/);
});

test("converts a raw HEIC poster to a JPEG converter URL", () => {
  const heic = "https://cdn.example.com/covers/poster.heic?x-signature=ab";
  const fixed = browserPosterUrl(heic);
  assert.ok(fixed?.startsWith("https://wsrv.nl/?url="));
  assert.match(fixed ?? "", /output=jpg/);
  assert.match(fixed ?? "", /poster\.heic/);
});

test("keeps Melolo JPEG converter when the source poster is HEIC", () => {
  const heic = "https://p16-novel-sign.fizzopic.org/novel-images-apsoutheast/cover.heic?rk3s=1&x-signature=ab";
  const wrapped = `https://wsrv.nl/?url=${encodeURIComponent(heic)}&output=jpg&q=90`;
  assert.equal(browserPosterUrl(wrapped), wrapped);
  const jpeg = "https://cdn.example.com/poster.jpg";
  const wrappedJpeg = `https://wsrv.nl/?url=${encodeURIComponent(jpeg)}&output=jpg`;
  assert.equal(browserPosterUrl(wrappedJpeg), jpeg);
});
test("upgrades http and protocol-relative URLs without doubling the host", () => {
  assert.equal(normalizeImageUrl("http://cdn.example.com/a.jpg"), "https://cdn.example.com/a.jpg");
  assert.equal(normalizeImageUrl("//cdn.example.com/a.jpg"), "https://cdn.example.com/a.jpg");
  assert.equal(normalizeImageUrl("/covers/a.jpg", "https://cdn.example.com/base/"), "https://cdn.example.com/covers/a.jpg");
  assert.equal(normalizeImageUrl("/covers/a.jpg"), null);
  assert.equal(normalizeImageUrl("javascript:alert(1)"), null);
  assert.equal(normalizeImageUrl(""), null);
});
