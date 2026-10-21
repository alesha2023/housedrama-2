import assert from "node:assert/strict";
import test from "node:test";
import { fillDaily, jakartaDates } from "./audience-dates.ts";

test("daily series keeps every Jakarta day and does not invent missing counts", () => {
  assert.deepEqual(jakartaDates(3, "2026-10-21"), ["2026-10-19", "2026-10-20", "2026-10-21"]);
  assert.deepEqual(fillDaily(["2026-10-19", "2026-10-20"], [{ date: "2026-10-20", visitors: 4 }]), [
    { date: "2026-10-19", visitors: 0 },
    { date: "2026-10-20", visitors: 4 },
  ]);
});
