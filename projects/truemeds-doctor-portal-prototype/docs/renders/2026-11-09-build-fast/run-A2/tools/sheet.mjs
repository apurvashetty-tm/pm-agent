// Run A2 sheet (brief: one sheet per run, the demo path at 390, one picture per screen): plays the default story (happy path)
// live in play mode from sign-in to the next case — the calling half of the demo: case (all reviewed) → Calling → Valid call →
// Confirming… → Prescription confirmed → next case. Earlier screens are on run-A1/sheet.png.
//   bash docs/renders/2026-11-09-build-fast/run-codex.sh docs/renders/2026-11-09-build-fast/run-A2/tools/sheet.mjs <log>
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
await p.goto(`http://127.0.0.1:${srv.address().port}/?play=3`); await p.waitForTimeout(500);
const shots = []; const snap = async () => { await p.waitForTimeout(300); shots.push(PNG.sync.read(await p.locator("#frame").screenshot())); };
const btn = (name) => p.locator("#screen").getByRole("button", { name, exact: true }).filter({ visible: true });
const wait = () => p.waitForTimeout(1600);
const ff = (ms) => p.evaluate((t) => window.__tm.clock.fastForward(t), ms);
await p.fill("#tm-login-mobile", "9876543210"); await btn("Send OTP").click(); await wait();
await p.locator("#screen input").first().fill("1234"); await btn("Verify & sign in").click(); await wait();
await btn("Not now").click(); await wait(); await btn("Set availability").click(); await wait(); await btn("Request a case").click(); await wait();
for (let i = 0; i < 10; i++) { const r = p.locator("#medicines-list .tm-row").filter({ hasText: "Pending" }); if (!(await r.count())) break; await r.first().click(); await btn("Prescribe").click(); await p.waitForTimeout(300); }
await snap();                                         // 1 Ready, every medicine reviewed
await btn("Call patient").click(); await snap();      // 2 Calling: status line, script, no Back
await ff(60000); await snap();                        // 8a Valid call: Confirm prescription
await btn("Confirm prescription").click(); await snap();   // Confirming…
await wait(); await snap();                           // 10a Prescription confirmed
await btn("Request next case").click(); await wait(); await snap();   // the next case
const W = 390, H = 844, gap = 16, out = new PNG({ width: shots.length * (W + gap) - gap, height: H }); out.data.fill(255);
shots.forEach((s, i) => PNG.bitblt(s, out, 0, 0, Math.min(W, s.width), Math.min(H, s.height), i * (W + gap), 0));
fs.writeFileSync(path.join(HERE, "..", "sheet.png"), PNG.sync.write(out));
console.log(`sheet: ${shots.length} screens`);
await b.close(); srv.close();
