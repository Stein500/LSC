import { chromium } from "/usr/local/lib/node_modules/playwright/index.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readdir, mkdir } from "node:fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SAMPLES = path.join(ROOT, "samples");
const OUT = path.join(ROOT, "samples", "png");
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome",
});
const ctx = await browser.newContext({
  viewport: { width: 720, height: 1400 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

const files = (await readdir(SAMPLES)).filter((f) => f.endsWith(".html") && f.startsWith("mail_"));
console.log(`📸 ${files.length} pages à snapshoter`);

for (const f of files) {
  const url = "file://" + path.join(SAMPLES, f);
  await page.goto(url, { waitUntil: "networkidle" });
  // Petite pause pour laisser Google Fonts (Caveat) charger
  await page.waitForTimeout(800);
  const out = path.join(OUT, f.replace(".html", ".png"));
  await page.screenshot({ path: out, fullPage: true });
  console.log(`  ✅ ${f} -> ${path.basename(out)}`);
}

await browser.close();
console.log("✨ Terminé");
