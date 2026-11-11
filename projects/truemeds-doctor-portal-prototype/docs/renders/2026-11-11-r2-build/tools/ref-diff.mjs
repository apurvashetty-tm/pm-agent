// U1 proof: the approved reference page (ui-screens/) and the built app render the same pixels for every in-scope state.
// Same capture settings as tests/compare-step1.mjs (D-94 flags, DPR 2, frozen animations), at 390 × 844 and 360 × 640.
//   node docs/renders/2026-11-11-r2-build/tools/ref-diff.mjs [regex] [--save <dir>]
// Prints changed pixels per state and size (a pixel differs when a channel differs by more than 8/255). Exit 1 if any differ.
import { chromium } from "../../../../tests/node_modules/playwright/index.mjs";
import { PNG } from "../../../../tests/node_modules/pngjs/lib/png.js";
import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const PROJECT = path.resolve(HERE, "../../../..");
const APP = path.join(PROJECT, "app"), UI = path.join(PROJECT, "ui-screens");
const args = process.argv.slice(2);
const save = args.includes("--save") ? path.resolve(args[args.indexOf("--save") + 1]) : null;
const flt = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--save");
if (save) fs.mkdirSync(save, { recursive: true });
const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json" };
const srv = http.createServer((q, r) => {
  const p = path.join(APP, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/\/$/, "/index.html"));
  if (!p.startsWith(APP) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { "Content-Type": T[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r);
});
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${srv.address().port}/`;
globalThis.window = {};
await import(url.pathToFileURL(path.join(APP, "state-map.js")).href);
export const SOURCE = { "sign-in": "sign-in/sign-in.html", otp: "otp/otp.html", offer: "faster-signin-offer/faster-signin-offer.html",
  unlock: "returning-unlock/returning-unlock.html", home: "home/home.html" };
const ids = window.TM_STATE_MAP.pictures.map((r) => r.id).filter((id) => SOURCE[id.split("_")[0]] && (!flt || new RegExp(flt).test(id)));
const FLAGS = ["--font-render-hinting=none", "--disable-gpu", "--disable-lcd-text", "--force-color-profile=srgb",
  "--disable-font-subpixel-positioning", "--disable-partial-raster", "--disable-skia-runtime-opts", "--hide-scrollbars"];
const FREEZE = "*,*::before,*::after{animation:none !important;transition:none !important;caret-color:transparent !important}";
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: FLAGS });
export async function shoot(target, w, h, source) {
  const pg = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  const errs = []; pg.on("pageerror", (e) => errs.push(e.message)); pg.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  await pg.clock.setFixedTime(new Date("2026-10-28T15:00:00"));
  await pg.goto(target);
  await pg.addStyleTag({ content: (source ? ".review,.review-controls,#demo-bar{display:none !important}" : "") + FREEZE });
  await pg.evaluate(() => document.fonts && document.fonts.ready);
  await pg.waitForTimeout(350);
  await pg.evaluate(() => document.fonts.ready.then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))));
  const buf = await pg.screenshot(); await pg.close();
  return { png: PNG.sync.read(buf), buf, errs };
}
let bad = 0;
for (const id of ids) {
  const sub = id.split("_")[0], state = id.slice(sub.length + 1);
  for (const [w, h] of [[390, 844], [360, 640]]) {
    const a = await shoot(`${BASE}?capture=1&s=${id}&w=${w}`, w, h, false);
    const q = sub === "home" ? `?capture=1&state=${state}` : `?capture=${state}`;
    const b = await shoot(url.pathToFileURL(path.join(UI, SOURCE[sub])).href + q, w, h, true);
    let n = 0; const A = a.png, B = b.png;
    if (A.width !== B.width || A.height !== B.height) n = -1;
    else for (let i = 0; i < A.data.length; i += 4) if (Math.max(Math.abs(A.data[i] - B.data[i]), Math.abs(A.data[i + 1] - B.data[i + 1]), Math.abs(A.data[i + 2] - B.data[i + 2])) > 8) n++;
    if (n) bad++;
    console.log(`${n ? "DIFF" : "SAME"} ${id} ${w}x${h}${n ? " " + n + " px" : ""}${a.errs.length || b.errs.length ? " errors: " + [...a.errs, ...b.errs].join(" | ") : ""}`);
    if (save && n) { fs.writeFileSync(path.join(save, `${id}_w${w}_app.png`), a.buf); fs.writeFileSync(path.join(save, `${id}_w${w}_ref.png`), b.buf); }
  }
}
await browser.close(); srv.close();
console.log(`${ids.length * 2 - bad} / ${ids.length * 2} identical`);
process.exit(bad ? 1 : 0);
