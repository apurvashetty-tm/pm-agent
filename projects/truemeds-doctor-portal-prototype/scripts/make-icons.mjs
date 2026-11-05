// Makes the home-screen icons (plan v3 §4): design-system/logo/truemeds-icon.svg, unchanged, on white with safe padding.
// Run:  node scripts/make-icons.mjs   (uses the Playwright in tests/; set CHROME to a Chrome path if the default is missing)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "../tests/node_modules/playwright/index.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "../../design-system/logo/truemeds-icon.svg");
const OUT = path.join(ROOT, "app/icons");
const SIZES = [180, 192, 512];
const MARK = 0.6; // mark fills 60% of the square: safe padding for maskable crops

fs.mkdirSync(OUT, { recursive: true });
const svg = fs.readFileSync(SRC, "utf8");
const b64 = Buffer.from(svg).toString("base64");
const exe = process.env.CHROME || undefined;
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
try {
  for (const n of SIZES) {
    const page = await browser.newPage({ viewport: { width: n, height: n }, deviceScaleFactor: 1 });
    const side = Math.round(n * MARK);
    await page.setContent(`<html><body style="margin:0;background:#fff;width:${n}px;height:${n}px;display:flex;align-items:center;justify-content:center">
      <img src="data:image/svg+xml;base64,${b64}" style="width:${side}px;height:${side}px"></body></html>`);
    await page.waitForLoadState("load");
    await page.screenshot({ path: path.join(OUT, `icon-${n}.png`), omitBackground: false, clip: { x: 0, y: 0, width: n, height: n } });
    await page.close();
    console.log(`icon-${n}.png`);
  }
} finally {
  await browser.close();
}
