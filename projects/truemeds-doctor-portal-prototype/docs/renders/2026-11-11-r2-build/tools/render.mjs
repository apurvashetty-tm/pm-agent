// U2: re-render the approved pictures from the approved reference pages (ui-screens/), same settings as every earlier render
// (D-94 flags, DPR 2, fixed clock 2026-10-28 15:00, frozen animations, review controls hidden).
//   · sign-in, OTP, offer, unlock, Home: every state at 390 × 844 and 360 × 640 (real-size frames, checklist U2)
//   · case page / Prescribe: only the sheets whose subtitle moved into the header (RULINGS 2026-11-11 10:32), at their own
//     sizes (390 × 844, 360 × 844), so nothing else on the case page moves.
//   node docs/renders/2026-11-11-r2-build/tools/render.mjs [regex] [--out <dir>]   (default: in place, into ui-screens/)
import { chromium } from "../../../../tests/node_modules/playwright/index.mjs";
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const PROJECT = path.resolve(HERE, "../../../.."), UI = path.join(PROJECT, "ui-screens");
const args = process.argv.slice(2);
const OUT = args.includes("--out") ? path.resolve(args[args.indexOf("--out") + 1]) : null;
const flt = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--out");
globalThis.window = {};
await import(url.pathToFileURL(path.join(PROJECT, "app/state-map.js")).href);
const FOLDER = { "sign-in": "sign-in", otp: "otp", offer: "faster-signin-offer", unlock: "returning-unlock", home: "home" };
const SOURCE = { "sign-in": "sign-in/sign-in.html", otp: "otp/otp.html", offer: "faster-signin-offer/faster-signin-offer.html", unlock: "returning-unlock/returning-unlock.html", home: "home/home.html" };
export const CASE_SHEETS = { "a-leave-sheet": "case", "s7e-leave-sheet": "case", "a-releasing": "case", "d-discard-sheet": "prescribe" };
const ids = window.TM_STATE_MAP.pictures.map((r) => r.id).filter((id) => (FOLDER[id.split("_")[0]] || CASE_SHEETS[id]) && (!flt || new RegExp(flt).test(id)));
const FLAGS = ["--font-render-hinting=none", "--disable-gpu", "--disable-lcd-text", "--force-color-profile=srgb",
  "--disable-font-subpixel-positioning", "--disable-partial-raster", "--disable-skia-runtime-opts", "--hide-scrollbars"];
const HIDE = ".review,.review-controls,#demo-bar{display:none !important} *,*::before,*::after{animation:none !important;transition:none !important;caret-color:transparent !important}";
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: FLAGS });
const errs = {};
let n = 0;
for (const id of ids) {
  const sub = id.split("_")[0], state = id.slice(sub.length + 1);
  const isCase = !!CASE_SHEETS[id];
  for (const w of [390, 360]) {
    const h = isCase ? 844 : w === 360 ? 640 : 844;
    const pg = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    const e = []; pg.on("pageerror", (x) => e.push(x.message)); pg.on("console", (m) => { if (m.type() === "error") e.push(m.text()); });
    await pg.clock.setFixedTime(new Date("2026-10-28T15:00:00"));
    const target = isCase ? url.pathToFileURL(path.join(UI, "case/case.html")).href + `?s=${id}&start=case${w === 360 ? "&w=360" : ""}&capture=1`
      : url.pathToFileURL(path.join(UI, SOURCE[sub])).href + (sub === "home" ? `?capture=1&state=${state}` : `?capture=${state}`);
    await pg.goto(target);
    await pg.addStyleTag({ content: HIDE });
    await pg.evaluate(() => document.fonts && document.fonts.ready);
    await pg.waitForTimeout(350);
    await pg.evaluate(() => document.fonts.ready.then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))));
    const dir = OUT || path.join(UI, isCase ? CASE_SHEETS[id] : FOLDER[sub]);
    fs.mkdirSync(dir, { recursive: true });
    await pg.screenshot({ path: path.join(dir, `${id}_w${w}.png`) }); await pg.close(); n++;
    if (e.length) errs[`${id}_w${w}`] = e;
  }
}
await browser.close();
console.log(`${n} pictures${OUT ? " → " + OUT : " (in place)"}; console errors: ${Object.keys(errs).length ? JSON.stringify(errs) : "none"}`);
