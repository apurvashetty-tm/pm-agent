// D-20, D-25, D-30, D-110, D-111: overlays keep focus inside, focus returns to the medicine's row, the On prescription band flashes,
// the Rx viewer's ✕ keeps its 48 target, the SOS label keeps its target, Duration numbers are 1–12 for every unit.
import { chromium } from "playwright";
import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const APP = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "../app");
const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json", ".png": "image/png" };
const srv = http.createServer((q, r) => { const p = path.join(APP, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/\/$/, "/index.html"));
  if (!p.startsWith(APP) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { "Content-Type": T[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r); });
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const b = await chromium.launch({ executablePath: process.env.CHROME || undefined });
const base = `http://127.0.0.1:${srv.address().port}/`;
let pass = 0, n = 0; const ok = (name, v, d = "") => { n++; if (v) pass++; console.log(`${v ? "PASS" : "FAIL"} ${name} ${d}`); };
const open = async (q, w = 360, h = 640) => { const p = await b.newPage({ viewport: { width: w, height: h } }); await p.goto(base + q); await p.waitForTimeout(700); return p; };
{
  const p = await open("?s=t01-ready", 1280, 900);
  await p.locator('[data-med-id="2"]').click(); await p.waitForTimeout(200);
  ok("case behind Prescribe is inert", await p.evaluate(() => document.querySelector("#case-scroll").inert && document.querySelector("#case-head").inert && document.querySelector("#case-actionbar").inert));
  await p.locator("#ps-card-schedule").getByRole("button", { name: "Weekly" }).click();
  ok("On prescription band flashes on a change", await p.evaluate(() => document.querySelector("#ps-rx").classList.contains("is-changed")));
  await p.locator(".ps-dur-toggle").click();
  const nums = () => p.evaluate(() => [...document.querySelectorAll("#ps-dur-panel .ps-grid button")].map((x) => x.textContent).join(" "));
  for (const u of ["Days", "Weeks", "Months"]) { await p.locator("#ps-dur-panel").getByRole("button", { name: u, exact: true }).click(); ok(`Duration numbers ${u}`, (await nums()) === "1 2 3 4 5 6 7 8 9 10 11 12", await nums()); }
  await p.locator("#ps-disable-btn").click();
  ok("Prescribe behind its sheet is inert", await p.evaluate(() => document.querySelector("#ps-body").inert && !document.querySelector(".tm-sheet").closest("[inert]")));
  await p.locator(".tm-sheet__close").click();
  ok("closing the sheet frees Prescribe", await p.evaluate(() => !document.querySelector("#ps-body").inert));
  await p.locator("#ps-prescribe").click(); await p.waitForTimeout(200);
  ok("focus returns to the medicine's row", await p.evaluate(() => document.activeElement.dataset.medId === "2"), await p.evaluate(() => document.activeElement.outerHTML.slice(0, 80)));
  ok("case is usable again", await p.evaluate(() => !document.querySelector("#case-scroll").inert));
  await p.close();
}
for (const [w, h] of [[360, 640], [390, 844]]) {
  const p = await open(`?capture=1&s=a-rx-viewer&w=${w}`, w, h);
  ok(`Rx viewer ✕ keeps its 48 target (rounded corners excluded) @${w}`, await p.evaluate(() => { const c = document.querySelector("#rx-overlay-close"), r = c.getBoundingClientRect(); return r.height >= 47.5 && [[.5, .05], [.5, .5], [.5, .95], [.05, .5], [.95, .5]].every(([x, y]) => c.contains(document.elementFromPoint(r.left + r.width * x, r.top + r.height * y))); }));
  ok(`Rx viewer tools are tappable @${w}`, await p.evaluate(() => [...document.querySelectorAll(".rx-ctrl-btn")].every((c) => { const r = c.getBoundingClientRect(); return c.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)); })));
  await p.close();
  const q = await open(`?capture=1&s=a-long-content&w=${w}`, w, h);
  ok(`Help keeps its 48 target beside a two-line name @${w}`, await q.evaluate(() => { const c = document.querySelector("#ch-help"), r = c.getBoundingClientRect(); return [.05, .5, .95].every((y) => c.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height * y))); }));
  await q.close();
}
{
  const p = await open("?capture=1&s=e-availability-ended&w=360");
  ok("closed case says availability has ended", (await p.locator("#case-actionbar").innerText()).includes("Your availability has ended."));
  await p.close();
  const q = await open("?capture=1&s=d-error-other&w=360");
  ok("Other dose error is linked to its field", await q.evaluate(() => { const i = document.querySelector("#ps-other"); return i.getAttribute("aria-invalid") === "true" && !!document.getElementById(i.getAttribute("aria-describedby")); }));
  await q.close();
}
{ // D-112: a new OTP sign-in opens a fresh Home, never an old session's "availability ended"
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();
  await p.goto(base + "?s=home_idle-expired"); await p.waitForTimeout(700);
  const stale = await p.evaluate(() => document.body.textContent.includes("Your availability ended"));
  await p.goto(base); await p.waitForTimeout(700);
  await p.fill("#tm-login-mobile", "9876543210"); await p.click(".login-submit"); await p.waitForTimeout(2500);
  await p.focus("#c"); for (const d of "1234") await p.keyboard.press(d); await p.click("#b"); await p.waitForTimeout(2500);
  const nn = p.getByRole("button", { name: "Not now" }); if (await nn.count()) { await nn.first().click(); await p.waitForTimeout(800); }
  const home = await p.evaluate(() => { const t = document.querySelector("#screen").innerText; return { t, setup: t.includes("Start taking cases") }; });
  ok("new OTP sign-in opens a fresh Home (no old 'availability ended')", stale && home.setup && !home.t.includes("availability ended") && !home.t.includes("ended your availability"), JSON.stringify({ stale, setup: home.setup }));
  await ctx.close();
}
await b.close(); srv.close(); console.log(`${pass}/${n} passed`); process.exit(pass === n ? 0 : 1);
