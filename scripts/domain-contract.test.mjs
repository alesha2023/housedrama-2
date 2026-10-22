import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

function files(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "routeTree.gen.ts") continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) files(path, out);
    else if (/\.(ts|tsx|txt|css|json|webmanifest)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(path);
  }
  return out;
}

test("production pages use house-drama.xyz and do not canonicalise the old host", () => {
  const offenders = [];
  for (const path of files("src")) {
    const text = readFileSync(path, "utf8");
    if (path.endsWith("src/lib/drama/site.ts")) {
      assert.match(text, /SITE_ORIGIN = "https:\/\/house-drama\.xyz"/);
      continue;
    }
    if (text.includes("house-drama.xyz")) offenders.push(path);
  }
  assert.deepEqual(offenders, []);
  const robots = readFileSync("public/robots.txt", "utf8");
  assert.match(robots, /Sitemap: https:\/\/house-drama\.xyz\/sitemap\.xml/);
  assert.equal(robots.includes("house-drama.xyz"), false);
});
