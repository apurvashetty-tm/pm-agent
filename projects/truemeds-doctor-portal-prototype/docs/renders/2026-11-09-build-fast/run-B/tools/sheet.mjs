// Run B sheet (brief: one sheet per run, the demo path at 390, one picture per screen), played live in review mode at 390:
// row 1 — Pilot, HA free: Calling (B0) → B1 at the gate → B2 → Transferring… (13) → Transferred (14) → the next case;
// row 2 — Pilot, no HA free: B3 live → B3 after the hang-up → next case ended before the transfer (16) → Skip HA sheet →
// Confirm prescription (8a) → Prescription confirmed (10a). The simulator is set through the review panel's own controls.
//   bash docs/renders/2026-11-09-build-fast/run-codex.sh docs/renders/2026-11-09-build-fast/run-B/tools/sheet.mjs <log>
import { chromium } from "../../../../../tests/node_modules/playwright/index.mjs";
import { PNG } from "../../../../../tests/node_modules/pngjs/lib/png.js";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const HERE = path.dirname(new URL(import.meta.url).pathname);
const APP = path.resolve(HERE, "../../../../../app");
const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const srv = http.createServer((q, r) => { const p = path.join(APP, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/\/$/, "/index.html")); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404).end(); return; } r.writeHead(200, { "Content-Type": T[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r); });
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const b = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto(`http://127.0.0.1:${srv.address().port}/`); await p.waitForFunction(() => !!window.__tm);
const rows = [[], []]; let row = 0;
const snap = async () => { await p.waitForTimeout(350); rows[row].push(PNG.sync.read(await p.locator("#frame").screenshot())); };
const btn = (name) => p.locator("#screen").getByRole("button", { name, exact: true }).filter({ visible: true });
const ff = (ms) => p.evaluate((t) => window.__tm.clock.fastForward(t), ms);
// The panel's controls (the phone drawer is closed at 390): set a select and fire its change, as a reviewer's choice does.
const choose = (field, v) => p.evaluate(([f, x]) => { const s = document.getElementById("rp-" + f); s.value = x; s.dispatchEvent(new Event("change", { bubbles: true })); }, [field, v]);
const restart = () => p.evaluate(() => document.getElementById("rp-restart").click());
async function prescribeAll() {
  for (let i = 0; i < 10; i++) { const r = p.locator("#medicines-list .tm-row").filter({ hasText: "Pending" }); if (!(await r.count())) break; await r.first().click(); await btn("Prescribe").click(); await p.waitForTimeout(300); }
}
// Row 1: Pilot, HA free
await choose("start", "case"); await choose("scenario", "pilot_ha_free"); await restart(); await p.waitForTimeout(400);
await prescribeAll();
await btn("Call patient").click(); await snap();                 // B0: Calling, neutral script, no Back
await ff(53000); await snap();                                    // B1: gate passed on the live call
await btn("Confirm prescription").click(); await snap();          // B2: Checking for a Health Advisor…, Skip HA greyed
await p.waitForTimeout(1300); await snap();                       // 13: Transferring…
await p.waitForTimeout(2600); await snap();                       // 14: Transferred to Health Advisor
await btn("Request next case").click(); await p.waitForTimeout(1600); await snap();   // the next case
// Row 2: Pilot, no HA free
row = 1;
await choose("scenario", "pilot_no_ha_free"); await restart(); await p.waitForTimeout(400);
await prescribeAll(); await btn("Call patient").click(); await ff(53000);
await btn("Confirm prescription").click(); await p.waitForTimeout(1400); await snap();   // B3: forwarded, script, waiting for the call to end
await choose("hangup", "reported"); await ff(70000); await snap();                     // B3 after the hang-up: title only, next case
await btn("Request next case").click(); await p.waitForTimeout(1600);
await prescribeAll(); await btn("Call patient").click(); await ff(53000); await ff(70000); await snap();   // 16: ended before the transfer
await btn("Skip HA").click(); await snap();                                            // Skip HA sheet over 16
await p.locator("#screen").getByRole("button", { name: "Clinically not required" }).click(); await snap();   // 8a: Confirm prescription
await btn("Confirm prescription").click(); await p.waitForTimeout(1600); await snap();  // 10a: Prescription confirmed
const W = 390, H = 844, gap = 16, n = Math.max(...rows.map((r) => r.length));
const out = new PNG({ width: n * (W + gap) - gap, height: 2 * H + gap }); out.data.fill(255);
rows.forEach((r, y) => r.forEach((s, i) => PNG.bitblt(s, out, 0, 0, Math.min(W, s.width), Math.min(H, s.height), i * (W + gap), y * (H + gap))));
fs.writeFileSync(path.join(HERE, "..", "sheet.png"), PNG.sync.write(out));
console.log(`sheet: ${rows[0].length} + ${rows[1].length} screens`);
await b.close(); srv.close();
