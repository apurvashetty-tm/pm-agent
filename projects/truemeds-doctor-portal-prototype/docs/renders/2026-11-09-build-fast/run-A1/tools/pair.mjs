// Build aid (run A1): captures app states (?capture=1&s=<id>, 390 wide, 1x) and writes approved | built side by side into
// tools/pairs/<id>.png, plus the changed-pixel share. Not the compare report (that is tests/compare-step1.mjs). Not a test.
//   node pair.mjs <id> [id ...]
import { chromium } from "../../../../../tests/node_modules/playwright/index.mjs";
import { PNG } from "../../../../../tests/node_modules/pngjs/lib/png.js";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const HERE = path.dirname(new URL(import.meta.url).pathname);
const PROJECT = path.resolve(HERE, "../../../../.."), APP = path.join(PROJECT, "app"), OUT = path.join(HERE, "pairs");
fs.mkdirSync(OUT, { recursive: true });
const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const srv = http.createServer((q, r) => { const p = path.join(APP, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/\/$/, "/index.html")); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404).end(); return; } r.writeHead(200, { "Content-Type": T[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r); });
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
globalThis.window = {}; await import(path.join(APP, "state-map.js"));
const b = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--font-render-hinting=none", "--disable-gpu", "--disable-lcd-text", "--force-color-profile=srgb", "--hide-scrollbars"] });
for (const id of process.argv.slice(2)) {
  const row = window.TM_STATE_MAP.pictures.find((r) => r.id === id);
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  await p.clock.setFixedTime(new Date("2026-10-28T15:00:00"));
  await p.goto(`http://127.0.0.1:${srv.address().port}/?capture=1&s=${id}`);
  await p.addStyleTag({ content: "*,*::before,*::after{animation:none !important;transition:none !important;caret-color:transparent !important}" });
  await p.waitForTimeout(450);
  const built = PNG.sync.read(await p.screenshot()); await p.close();
  const apath = row && path.join(PROJECT, "ui-screens", row.picture.split("/")[0], row.picture.split("/")[1] + "_w390.png");
  const appr = apath && fs.existsSync(apath) ? PNG.sync.read(fs.readFileSync(apath)) : new PNG({ width: built.width, height: built.height });
  const W = appr.width + built.width + 20, H = Math.max(appr.height, built.height);
  const out = new PNG({ width: W, height: H }); out.data.fill(255);
  PNG.bitblt(appr, out, 0, 0, appr.width, appr.height, 0, 0); PNG.bitblt(built, out, 0, 0, built.width, built.height, appr.width + 20, 0);
  let diff = 0; const n = Math.min(appr.width, built.width) * Math.min(appr.height, built.height);
  for (let y = 0; y < Math.min(appr.height, built.height); y++) for (let x = 0; x < Math.min(appr.width, built.width); x++) {
    const i = (y * appr.width + x) * 4, j = (y * built.width + x) * 4;
    if (Math.max(Math.abs(appr.data[i] - built.data[j]), Math.abs(appr.data[i + 1] - built.data[j + 1]), Math.abs(appr.data[i + 2] - built.data[j + 2])) > 8) diff++;
  }
  fs.writeFileSync(path.join(OUT, id + ".png"), PNG.sync.write(out));
  console.log(`${id}: changed ${(100 * diff / n).toFixed(2)}%${errs.length ? "  ERRORS: " + errs.join(" | ") : ""}`);
}
await b.close(); srv.close();
