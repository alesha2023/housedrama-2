import assert from "node:assert/strict";
import test from "node:test";
import { isBlockedProxyHost } from "./proxy-guard.ts";

test("blocks private, loopback, and raw IP proxy targets", () => {
  assert.equal(isBlockedProxyHost("localhost"), true);
  assert.equal(isBlockedProxyHost("127.0.0.1"), true);
  assert.equal(isBlockedProxyHost("127.1"), true);
  assert.equal(isBlockedProxyHost("10.1.2.3"), true);
  assert.equal(isBlockedProxyHost("169.254.169.254"), true);
  assert.equal(isBlockedProxyHost("2130706433"), true);
  assert.equal(isBlockedProxyHost("::1"), true);
  assert.equal(isBlockedProxyHost("metadata.google.internal"), true);
  assert.equal(isBlockedProxyHost("cdn.example.com"), false);
  assert.equal(isBlockedProxyHost("img.shortolol.com"), false);
});
