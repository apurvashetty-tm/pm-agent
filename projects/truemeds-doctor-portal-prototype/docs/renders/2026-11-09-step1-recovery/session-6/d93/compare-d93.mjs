// D-93 (revised, session 6a): built app state offer_unavailable vs the new picture rendered from the approved source (this folder), at 390 and 360.
// Same capture settings as tests/compare-step1.mjs (2x, fixed clock, frozen animations, capture mode). Writes
// pair_offer_unavailable_w<w>.png (picture | built | diff) and compare-d93.json here. Run from the project folder.
import { createRequire } from "module";
import http from "http"; import fs from "fs"; import path from "path"; import url from "url";
const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const PROJECT = path.resolve(HERE, "../../../../..");
const require = createRequire(path.join(PROJECT, "tests/package.json"));
const { chromium } = require("playwright"); const { PNG } = require("pngjs");
const APP = path.join(PROJECT, "app");
const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json" };
const srv = http.createServer((q, r) => {
  const p = path.join(APP, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/\/$/, "/index.html"));
  if (!p.startsWith(APP) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { "Content-Type": T[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r);
});
await new Promise((r) => srv.listen(8799, r));
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ["--font-render-hinting=none", "--disable-gpu", "--disable-lcd-text", "--force-color-profile=srgb", "--disable-font-subpixel-positioning", "--disable-partial-raster", "--disable-skia-runtime-opts", "--hide-scrollbars"] });
const out = {};
for (const w of [390, 360]) {
  const pg = await browser.newPage({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; pg.on("pageerror", (e) => errs.push(e.message)); pg.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  await pg.clock.setFixedTime(new Date("2026-10-28T15:00:00"));
  await pg.goto(`http://localhost:8799/?capture=1&s=offer_unavailable&w=${w}`);
  await pg.addStyleTag({ content: "*,*::before,*::after{animation:none !important;transition:none !important;caret-color:transparent !important}" });
  await pg.evaluate(() => document.fonts && document.fonts.ready); await pg.waitForTimeout(350);
  await pg.evaluate(() => document.fonts.ready.then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))));
  const built = PNG.sync.read(await pg.screenshot()); await pg.close();
  const pic = PNG.sync.read(fs.readFileSync(path.join(HERE, `offer_unavailable_w${w}.png`)));
  let n = 0, max = 0; const W = pic.width, H = pic.height;
  const sheet = new PNG({ width: W * 3 + 40, height: H }); sheet.data.fill(255);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4; let d = 0;
    for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(pic.data[i + c] - (built.data[i + c] ?? 0)));
    if (d > 0) n++; max = Math.max(max, d);
    for (const [k, img] of [[0, pic], [1, built]]) { const j = (y * sheet.width + x + k * (W + 20)) * 4; for (let c = 0; c < 4; c++) sheet.data[j + c] = img.data[i + c]; }
    const j = (y * sheet.width + x + 2 * (W + 20)) * 4; const g = 255 - Math.round((255 - pic.data[i]) * 0.15);
    sheet.data[j] = d ? 255 : g; sheet.data[j + 1] = d ? 0 : g; sheet.data[j + 2] = d ? 0 : g; sheet.data[j + 3] = 255;
  }
  fs.writeFileSync(path.join(HERE, `pair_offer_unavailable_w${w}.png`), PNG.sync.write(sheet));
  out[`offer_unavailable_w${w}`] = { sameSize: built.width === W && built.height === H, changedPx: n, maxChannel: max, errors: errs };
}
await browser.close(); srv.close();
fs.writeFileSync(path.join(HERE, "compare-d93.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out));
