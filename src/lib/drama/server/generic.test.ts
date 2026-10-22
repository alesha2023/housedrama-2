import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const providers = readFileSync(new URL("../providers.ts", import.meta.url), "utf8");
const generic = readFileSync(new URL("./generic.ts", import.meta.url), "utf8");

test("catalog routes point at payloads that contain dramas", () => {
  assert.match(providers, /reelbuzz",\s*\n\s*"reelife"/);
  assert.match(providers, /if \(id === "reelbuzz"\) return \["\/get-tabs", "\/get-categories"\]/);
  assert.match(providers, /if \(id === "stardusttv"\) return \["\/get-hot"\]/);
  assert.match(providers, /if \(id === "mydrama"\) return \["\/get-home", "\/get-foryou"\]/);
  assert.match(providers, /if \(id === "flextv"\) return \["\/get-hot"/);
  assert.match(providers, /if \(id === "velolo"\) return \["\/get-list"/);
  assert.match(providers, /if \(id === "sarostv"\) return \["\/get-foryou"/);
  assert.match(providers, /if \(id === "starshort"\) return \["\/get-foryou"/);
  assert.match(providers, /"goodshort"/);
  assert.match(providers, /"moviebox"/);
  assert.match(providers, /"dramanova"/);
});

test("parser accepts Stardust cover fields and does not require a failing detail call", () => {
  assert.match(generic, /"cover_path"/);
  assert.match(generic, /"alioss_cover"/);
  assert.match(generic, /provider === "stardusttv" && path\.startsWith\("\/get-hot"\)/);
  assert.match(generic, /read\(provider, `\/get-detail\/\$\{enc\(seriesId\)\}`, lang\)\.catch\(\(\) => null\)/);
});
