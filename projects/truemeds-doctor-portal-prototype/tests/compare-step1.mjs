// Picture compare harness, step 1 (plan v3 B15, checklist 2.1 / 2.2; step 1 recovery brief §1 "Compare harness").
// Captures every step-1 state (sign-in, OTP, faster sign-in offer, returning unlock: 42 states) from the built app at 390 and 360,
// 2×, fixed clock, frozen animations, capture mode — the same settings as docs/renders/2026-11-03-calling-round/capture-method-cap.py —
// and diffs each against its approved picture in ui-screens/.
//
// Region-aware: changed pixels are grouped into regions; every region must be explained, or the run fails:
//   · spinner  — the busy spinner box, masked identically on both sides (rect from the built page and from the approved source)
//   · listed   — a region in tests/compare-allow.json "regions" (state, width, box, reason)
//   · anti-aliasing — only where compare-allow.json "antiAliasing" names the state's picture (pictures rendered on the old Mac),
//     and only when, inside the region, the built app is identical (no pixel over the threshold) to the approved source file
//     re-rendered on this Mac with the same settings — so the whole difference is old Mac vs this Mac, not the build — and the
//     region is not a shifted row / moved box (a 1–4 px shift of the built picture does not make it match better) and stays inside
//     the entry's channel and pixel limits. Colour bands and moved boxes never pass.
// Output: docs/renders/2026-11-09-step1-recovery/compare/  — <state>_w<w>.png (approved | built | heatmap with regions boxed),
// results.json, results.md, sheet-390.png. Exit 1 on any unexplained region or a page error.
// Usage: cd tests && node compare-step1.mjs [regex]      (Chrome: $CHROME, else Playwright's own Chromium)
import { chromium } from "playwright";
import { PNG } from "pngjs";
import http from "http"; import fs from "fs"; import path from "path"; import url from "url";

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const PROJECT = path.resolve(HERE, "..");
const APP = path.join(PROJECT, "app");
const UI = path.join(PROJECT, "ui-screens");
// PICTURES / OUT: optional overrides (D-94 preview: compare against session-6/new/ before it replaces ui-screens/).
const PICS = process.env.PICTURES ? path.resolve(process.env.PICTURES) : UI;
const OUT = process.env.OUT ? path.resolve(process.env.OUT) : path.join(PROJECT, "docs/renders/2026-11-09-step1-recovery/compare");
const ALLOW = JSON.parse(fs.readFileSync(path.join(HERE, "compare-allow.json"), "utf8"));
const FLT = process.argv[2] ? new RegExp(process.argv[2]) : null;
const PORT = 8798;
const FOLDER = { "sign-in": "sign-in", otp: "otp", offer: "faster-signin-offer", unlock: "returning-unlock" };
const SOURCE = { "sign-in": "sign-in/sign-in.html", otp: "otp/otp.html", offer: "faster-signin-offer/faster-signin-offer.html", unlock: "returning-unlock/returning-unlock.html" };
const THRESH = 8;          // a pixel "differs" when any channel differs by more than 8/255 (session 4 notes: the measured noise floor)
const CELL = 6;            // region grouping: changed pixels within ~2 cells join one region
const FREEZE = "*,*::before,*::after{animation:none !important;transition:none !important;caret-color:transparent !important}";

const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json" };
const srv = http.createServer((q, r) => {
  const p = path.join(APP, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/\/$/, "/index.html"));
  if (!p.startsWith(APP) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { "Content-Type": T[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r);
});
await new Promise((r) => srv.listen(PORT, r));

globalThis.window = {};
await import(path.join(APP, "state-map.js"));
const ids = window.TM_STATE_MAP.pictures.filter((r) => r.step === 1).map((r) => r.id).filter((id) => !FLT || FLT.test(id));
fs.mkdirSync(OUT, { recursive: true });

// D-94: repeatable capture — the same fixed rasterisation flags as capture-method-cap.py (no GPU, no LCD / sub-pixel text,
// no hinting, sRGB; DPR 2 from the page, never --force-device-scale-factor). The same page captured twice gives identical pixels, so a picture is captured once (no retries).
const FLAGS = ["--font-render-hinting=none", "--disable-gpu", "--disable-lcd-text", "--force-color-profile=srgb",
  "--disable-font-subpixel-positioning", "--disable-partial-raster", "--disable-skia-runtime-opts", "--hide-scrollbars"];
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: FLAGS });
// Only spinners that are drawn: laid out, not hidden, visibility visible, opacity above 0 on the spinner and its ancestors.
const SPIN_JS = "() => [...document.querySelectorAll('.tm-spinner')].filter(e => e.getClientRects().length && !e.hidden && e.checkVisibility({ opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true })).map(e => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })";
async function shoot(target, w, { capture, source = false }) {
  const pg = await browser.newPage({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2 });
  const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message)); pg.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  await pg.clock.setFixedTime(new Date("2026-10-28T15:00:00"));
  await pg.goto(target);
  await pg.addStyleTag({ content: (source ? ".review,.review-controls,#demo-bar{display:none !important}" : "") + FREEZE });
  await pg.evaluate(() => document.fonts && document.fonts.ready);
  await pg.waitForTimeout(350);
  await pg.evaluate(() => document.fonts.ready.then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))));
  const spin = await pg.evaluate(`(${SPIN_JS})()`);
  const buf = capture ? await pg.screenshot() : null;
  await pg.close();
  return { png: buf ? PNG.sync.read(buf) : null, spin, errs };
}

// ---- pixel helpers ----
const px = (img, x, y) => { const i = (y * img.width + x) * 4; return [img.data[i], img.data[i + 1], img.data[i + 2]]; };
const delta = (a, b, x, y, dx = 0, dy = 0) => {
  const xb = x + dx, yb = y + dy;
  if (xb < 0 || yb < 0 || xb >= b.width || yb >= b.height) return 255;
  const p = px(a, x, y), q = px(b, xb, yb);
  return Math.max(Math.abs(p[0] - q[0]), Math.abs(p[1] - q[1]), Math.abs(p[2] - q[2]));
};
function regionsOf(A, B, masks) {
  const W = A.width, H = A.height, gw = Math.ceil(W / CELL), gh = Math.ceil(H / CELL);
  const grid = new Uint8Array(gw * gh);
  const masked = (x, y) => masks.some(([x0, y0, x1, y1]) => x >= x0 && x < x1 && y >= y0 && y < y1);
  let total = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (delta(A, B, x, y) > THRESH && !masked(x, y)) { grid[Math.floor(y / CELL) * gw + Math.floor(x / CELL)] = 1; total++; }
  }
  // connected cells (8-neighbour, with a 1-cell gap allowed) → regions
  const seen = new Uint8Array(gw * gh); const regions = [];
  for (let c = 0; c < gw * gh; c++) {
    if (!grid[c] || seen[c]) continue;
    const stack = [c]; seen[c] = 1; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    while (stack.length) {
      const k = stack.pop(); const cx = k % gw, cy = Math.floor(k / gw);
      x0 = Math.min(x0, cx); y0 = Math.min(y0, cy); x1 = Math.max(x1, cx); y1 = Math.max(y1, cy);
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
        const n = ny * gw + nx; if (grid[n] && !seen[n]) { seen[n] = 1; stack.push(n); }
      }
    }
    regions.push({ box: [x0 * CELL, y0 * CELL, Math.min(W, (x1 + 1) * CELL), Math.min(H, (y1 + 1) * CELL)] });
  }
  for (const r of regions) {
    const [x0, y0, x1, y1] = r.box; let n = 0, max = 0, sum = 0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { if (masked(x, y)) continue; const d = delta(A, B, x, y); if (d > THRESH) { n++; sum += d; } if (d > max) max = d; }
    r.px = n; r.maxDelta = max;
    // shifted row / moved box: does moving the built picture by 1–4 px make this region match clearly better?
    let best = sum, bestShift = [0, 0];
    for (const [dx, dy] of [[0, 1], [0, -1], [0, 2], [0, -2], [0, 3], [0, -3], [0, 4], [0, -4], [1, 0], [-1, 0], [2, 0], [-2, 0], [3, 0], [-3, 0]]) {
      let s = 0;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { if (masked(x, y)) continue; const d = delta(A, B, x, y, dx, dy); if (d > THRESH) s += d; }
      if (s < best) { best = s; bestShift = [dx, dy]; }
    }
    r.shifted = sum > 2000 && best < sum * 0.5;   // a real move: half the difference vanishes when shifted
    r.shift = r.shifted ? bestShift : null;
  }
  return { regions, total };
}
const inside = (r, box) => r.box[0] >= box[0] && r.box[1] >= box[1] && r.box[2] <= box[2] && r.box[3] <= box[3];

// ---- sheet: approved | built | heatmap with regions boxed (1× scale) ----
function sheet(A, B, regions, file) {
  const s = 2, w = Math.floor(A.width / s), h = Math.floor(A.height / s), gap = 12;
  const outp = new PNG({ width: w * 3 + gap * 2, height: h }); outp.data.fill(255);
  const put = (img, ox, fn) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = fn ? fn(x * s, y * s) : px(img, x * s, y * s); const i = (y * outp.width + ox + x) * 4; outp.data[i] = c[0]; outp.data[i + 1] = c[1]; outp.data[i + 2] = c[2]; outp.data[i + 3] = 255; } };
  put(A, 0); put(B, w + gap);
  put(null, (w + gap) * 2, (x, y) => { let d = 0; for (let yy = y; yy < y + s; yy++) for (let xx = x; xx < x + s; xx++) d = Math.max(d, delta(A, B, xx, yy)); const g = px(A, x, y).map((v) => 200 + v / 255 * 55); return d > THRESH ? [220, 30, 30] : g; });
  const COL = { spinner: [120, 120, 120], listed: [30, 110, 220], "anti-aliasing": [240, 160, 0], unexplained: [200, 0, 160] };
  for (const r of regions) {
    const c = COL[r.why] || COL.unexplained; const [x0, y0, x1, y1] = r.box.map((v) => Math.floor(v / s));
    for (let x = x0; x <= x1; x++) for (const y of [y0, y1]) for (let t = 0; t < 2; t++) { const yy = Math.min(h - 1, y + t), xx = (w + gap) * 2 + Math.min(w - 1, x), i = (yy * outp.width + xx) * 4; outp.data.set([...c, 255], i); }
    for (let y = y0; y <= y1; y++) for (const x of [x0, x1]) for (let t = 0; t < 2; t++) { const xx = (w + gap) * 2 + Math.min(w - 1, x + t), i = (Math.min(h - 1, y) * outp.width + xx) * 4; outp.data.set([...c, 255], i); }
  }
  fs.writeFileSync(file, PNG.sync.write(outp));
}

// ---- run ----
const results = [];
for (const id of ids) {
  const sub = id.split("_")[0], state = id.slice(sub.length + 1);
  for (const w of [390, 360]) {
   let row;
   do {   // one capture per picture (D-94: repeatable capture, no retries)
    const approvedFile = path.join(PICS, FOLDER[sub], `${id}_w${w}.png`);
    const A = PNG.sync.read(fs.readFileSync(approvedFile));
    const built = await shoot(`http://localhost:${PORT}/?capture=1&s=${id}&w=${w}`, w, { capture: true });
    const src = await shoot(url.pathToFileURL(path.join(UI, SOURCE[sub])).href + `?capture=${state}`, w, { capture: true, source: true });
    const B = built.png;
    row = { id, w, size: [A.width, A.height], builtSize: [B.width, B.height], errors: built.errs, regions: [] };
    if (A.width !== B.width || A.height !== B.height) { row.result = "failed"; row.reason = "size differs"; break; }
    // spinner: union of the built rect and the approved source rect, both sides, in picture px (+2 px margin)
    const masks = [...built.spin, ...src.spin].map(([x, y, ww, hh]) => [Math.floor((x - 2) * 2), Math.floor((y - 2) * 2), Math.ceil((x + ww + 2) * 2), Math.ceil((y + hh + 2) * 2)]);
    // The mask hides only the spinner's drawing: both sides must show a spinner, the same number, in the same box (1 css px).
    const spinOk = built.spin.length === src.spin.length && built.spin.every((b, i) => b.every((v, k) => Math.abs(v - src.spin[i][k]) <= 1));
    const eff = spinOk ? masks : [];
    const { regions, total } = regionsOf(A, B, eff);
    row.changedPx = total;
    const S = src.png;   // the approved source file rendered on this Mac
    const sameSize = S && S.width === B.width && S.height === B.height;
    const builtVsSource = (box) => { if (!sameSize) return Infinity; let n = 0; const [x0, y0, x1, y1] = box;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (!eff.some(([a, b, c, d]) => x >= a && x < c && y >= b && y < d) && delta(S, B, x, y) > THRESH) n++; return n; };
    if (sameSize) { let n = 0, m = 0; for (let y = 0; y < A.height; y++) for (let x = 0; x < A.width; x++) { const d = delta(A, S, x, y); if (d > THRESH) n++; if (d > m) m = d; } row.macDiff = { px: n, maxDelta: m }; }
    const aa = process.env.NO_AA ? null : (ALLOW.antiAliasing || []).find((e) => new RegExp(e.match).test(id));   // NO_AA=1: preview without the rule (D-94)
    let aaPx = 0;
    for (const r of regions) {
      r.builtVsSource = builtVsSource(r.box);
      const listed = ALLOW.regions.find((e) => new RegExp(e.state).test(id) && (!e.w || e.w === w) && inside(r, e.box));
      if (listed && !r.shifted) { r.why = "listed"; r.reason = listed.reason; }
      else if (aa && !r.shifted && r.builtVsSource === 0 && r.maxDelta <= aa.maxDelta) { r.why = "anti-aliasing"; r.reason = aa.reason; aaPx += r.px; }
      else { r.why = "unexplained"; r.reason = r.shifted ? `shifted by ${r.shift.join(",")} px` : r.builtVsSource ? `built differs from the approved source here (${r.builtVsSource} px)` : `max channel difference ${r.maxDelta}`; }
    }
    if (aa && aaPx > aa.maxPx) for (const r of regions) if (r.why === "anti-aliasing") { r.why = "unexplained"; r.reason = `anti-aliasing total ${aaPx} px over the ${aa.maxPx} px limit`; }
    if (spinOk) for (const m of masks) regions.push({ box: m, why: "spinner", reason: "busy spinner masked on both sides", px: 0, maxDelta: 0 });
    else regions.push({ box: masks[0] || [0, 0, 0, 0], why: "unexplained", reason: `spinner missing or moved (built ${JSON.stringify(built.spin)}, approved source ${JSON.stringify(src.spin)})`, px: 0, maxDelta: 0 });
    row.regions = regions;
    const bad = regions.filter((r) => r.why === "unexplained");
    row.result = built.errs.length ? "failed" : bad.length ? "failed" : total === 0 ? "exact" : "accepted";
    sheet(A, B, regions, path.join(OUT, `${id}_w${w}.png`));
   } while (false);
    results.push(row);
    const { regions, changedPx: total } = row;
    console.log(`${row.result.padEnd(9)} ${id} @${w}  changed ${total} px  regions ${regions.map((r) => `${r.why}${r.why === "unexplained" ? "(" + r.reason + " " + r.box + ")" : ""}`).join(", ") || "none"}`);
  }
}
await browser.close(); srv.close();

const count = (k) => results.filter((r) => r.result === k).length;
fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify({ thresholdPerChannel: THRESH, states: ids.length, pictures: results.length, exact: count("exact"), accepted: count("accepted"), failed: count("failed"), results }, null, 1));
const md = ["# Step 1 compare — approved picture vs built app", "", `Generated by \`tests/compare-step1.mjs\` (threshold: any channel > ${THRESH}/255). Allow list: \`tests/compare-allow.json\`.`, "",
  `States ${ids.length} · pictures ${results.length} · **exact ${count("exact")} · accepted ${count("accepted")} · failed ${count("failed")}**`, "",
  "| State | Width | Result |  Changed px | Old Mac vs this Mac (same source) | Regions (why) |", "|---|---|---|---|---|---|",
  ...results.map((r) => `| \`${r.id}\` | ${r.w} | ${r.result} | ${r.changedPx ?? "—"} | ${r.macDiff ? `${r.macDiff.px} px, max ${r.macDiff.maxDelta}` : "—"} | ${r.regions.map((g) => `${g.why}${g.why === "listed" || g.why === "unexplained" ? ": " + g.reason : ""} [${g.box.join(",")}]${g.px ? ` ${g.px} px, max ${g.maxDelta}` : ""}`).join("<br>") || (r.reason || "—")} |`)];
fs.writeFileSync(path.join(OUT, "results.md"), md.join("\n") + "\n");
console.log(`\n${ids.length} states, ${results.length} pictures: exact ${count("exact")}, accepted ${count("accepted")}, failed ${count("failed")}`);
process.exit(count("failed") ? 1 : 0);
