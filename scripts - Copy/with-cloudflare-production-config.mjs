import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const generatedPath = resolve("dist/server/wrangler.json");
const productionPath = resolve("dist/server/wrangler.production.json");

const raw = await readFile(generatedPath, "utf8");
const config = JSON.parse(raw);

// Keep the generated Cloudflare Vite plugin entry point and asset paths.
// Only add production custom domains in this opt-in production config.
config.routes = [
  { pattern: "house-drama.xyz", custom_domain: true },
  { pattern: "www.house-drama.xyz", custom_domain: true },
];

await writeFile(productionPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
console.log(`Created ${productionPath}. Review domains and secrets before deploying.`);
