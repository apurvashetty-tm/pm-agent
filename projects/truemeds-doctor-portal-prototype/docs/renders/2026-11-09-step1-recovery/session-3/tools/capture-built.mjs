// Session 3 evidence (copied from session 2): captures each built entry state at 390 (and 360) in capture mode — 2×, fixed clock, frozen
// animations, same as docs/renders/2026-11-03-calling-round/capture-method-cap.py — and writes approved | built pairs.
// Usage: node capture-built.mjs <outDir> [regex]     (Chrome: $CHROME, or Playwright's own Chromium)
import { createRequire } from "module";
import http from "http"; import fs from "fs"; import path from "path"; import url from "url";
const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const PROJECT = path.resolve(HERE, "../../../../..");
const require = createRequire(path.join(PROJECT, "tests/package.json"));
const { chromium } = require("playwright");
const APP = path.join(PROJECT, "app");
const out = path.resolve(process.argv[2] || path.join(HERE, "..", "built"));
const flt = process.argv[3] ? new RegExp(process.argv[3]) : null;
const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".ttf": "font/ttf" };
const srv = http.createServer((q, r) => {
  const p = path.join(APP, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/\/$/, "/index.html"));
  if (!p.startsWith(APP) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { "Content-Type": T[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r);
});
await new Promise((r) => srv.listen(8797, r));
const map = fs.readFileSync(path.join(APP, "state-map.js"), "utf8");
const ids = [...map.matchAll(/"id":\s*"((?:sign-in|otp|offer|unlock)_[^"]+)"/g)].map((m) => m[1]).filter((v, i, a) => a.indexOf(v) === i && (!flt || flt.test(v)));
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
fs.mkdirSync(out, { recursive: true });
const errors = {};
for (const id of ids) for (const w of [390, 360]) {
  const pg = await browser.newPage({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2 });
  const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message)); pg.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  await pg.clock.setFixedTime(new Date("2026-10-28T15:00:00"));
  await pg.goto(`http://localhost:8797/?capture=1&s=${id}&w=${w}`);
  await pg.evaluate(() => document.fonts && document.fonts.ready);
  await pg.waitForTimeout(350);
  await pg.screenshot({ path: path.join(out, `${id}_w${w}.png`) });
  errors[`${id}_w${w}`] = errs;
  await pg.close();
}
await browser.close(); srv.close();
fs.writeFileSync(path.join(out, "capture-log.json"), JSON.stringify({ count: ids.length * 2, errors }, null, 1));
console.log(`captured ${ids.length} states × 2 widths; console errors: ${Object.values(errors).flat().length}`);
