#!/usr/bin/env node
// Approved reference for the case page and Prescribe (ui-screens/case/case.html): the built app's own DOM for every state (capture
// mode), drawn with the app's own CSS, so the reference and the app can't drift (same principle as ui-screens/home since r2-build).
// Generated: run after any change to the case page, Prescribe, their sheets or the Rx viewer.
//   node scripts/build-case-reference.mjs           (CHROME=... if Playwright's own Chromium isn't installed)
//   node scripts/build-case-reference.mjs --check   exits 1 if the committed reference is out of date
import { chromium } from "../tests/node_modules/playwright/index.mjs";
import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const P = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const APP = path.join(P, "app"), OUT = path.join(P, "ui-screens/case/case.html");
const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json", ".png": "image/png" };
const srv = http.createServer((q, r) => {
  const p = path.join(APP, decodeURIComponent(new URL(q.url, "http://x").pathname).replace(/\/$/, "/index.html"));
  if (!p.startsWith(APP) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { "Content-Type": T[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r);
});
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
globalThis.window = {};
await import(url.pathToFileURL(path.join(APP, "state-map.js")).href);
const ids = window.TM_STATE_MAP.pictures.map((r) => r.id).filter((id) => !/^(sign-in|otp|offer|unlock|home)_/.test(id));
const b = await chromium.launch({ executablePath: process.env.CHROME || undefined });
const states = {};
const VERSION_A = ["t08b-valid-forward", "t11-calling-transfer", "t12-transfer-ready"];   // later release, not built in the app: composed below from built states
const SIZES = [[390, 844], [360, 640], [360, 844]];
for (const id of ids.filter((i) => !VERSION_A.includes(i))) {
  const page = await b.newPage({ viewport: { width: 390, height: 844 } });
  await page.clock.setFixedTime(new Date("2026-10-28T15:00:00"));
  await page.goto(`http://127.0.0.1:${srv.address().port}/?capture=1&s=${id}`); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(600);
  states[id] = await page.evaluate(() => {
    const s = document.querySelector("#screen");
    const scroll = [...s.querySelectorAll("*")].filter((e) => e.scrollTop > 0 && e.id).map((e) => [e.id, Math.round(e.scrollTop)]);
    const focus = s.contains(document.activeElement) && document.activeElement.id || null;
    s.querySelectorAll("textarea").forEach((t) => { t.textContent = t.value; });
    s.querySelectorAll("input").forEach((i) => { if (i.type === "checkbox") i.toggleAttribute("checked", i.checked); else i.setAttribute("value", i.value); });
    return { html: s.innerHTML.replace(/\b(sh|opt)-[a-z0-9]+(-[td])?\b(?=")/g, (m) => m), scroll, focus };
  });
  // random ids of one draw → stable ids, so a rebuild without a change writes the same file
  const seen = new Map();
  states[id].html = states[id].html.replace(/\bsh-[a-z0-9]{3,6}\b/g, (m) => { if (!seen.has(m)) seen.set(m, `sh-${seen.size + 1}`); return seen.get(m); });
  // the scroll position follows the size (a picture moment scrolls to a part of the screen)
  if (states[id].scroll.length || /^(d-|a-scrolled|a-notes)/.test(id)) {
    states[id].scroll = {};
    for (const [w, h] of SIZES) {
      const pg = await b.newPage({ viewport: { width: w, height: h } });
      await pg.clock.setFixedTime(new Date("2026-10-28T15:00:00"));
      await pg.goto(`http://127.0.0.1:${srv.address().port}/?capture=1&s=${id}&w=${w}`); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(600);
      states[id].scroll[`${w}x${h}`] = await pg.evaluate(() => [...document.querySelectorAll("#screen *")].filter((e) => e.scrollTop > 0 && e.id).map((e) => [e.id, Math.round(e.scrollTop)]));
      await pg.close();
    }
  } else states[id].scroll = {};
  await page.close();
}
// Version A (a later release): the same parts as the built states, with that version's words and buttons.
{
  const M = JSON.parse(fs.readFileSync(path.join(P, "ui-screens/feedback/messages.json"), "utf8"));
  const page = await b.newPage();
  const made = await page.evaluate(({ g0, g1, cream, t10b, M }) => {
    const dom = (html) => { const d = document.createElement("div"); d.innerHTML = html; return d; };
    const script = (d) => { d.querySelector("#pcb-text").textContent = M["SCRIPT_A"]; };
    const t11 = dom(g0); script(t11);
    const t12 = dom(g1); script(t12); t12.querySelector("#main-cta-btn").textContent = "Confirm & transfer";
    const t08b = dom(cream); t08b.querySelector("#prescribe-screen").remove();
    t08b.querySelector("#case-head").replaceWith(dom(t10b).querySelector("#case-head"));
    t08b.querySelector("#case-actionbar").replaceWith(dom(g1).querySelector("#case-actionbar"));
    t08b.querySelector("#main-cta-btn").textContent = M["case.confirmForward"];
    t08b.querySelectorAll(".medicine-item .tm-tag").forEach((t) => { t.className = t.className.replace(/tm-tag--(warning|neutral)/, "tm-tag--success"); t.textContent = M["case.statusPrescribed"]; });
    return { "t08b-valid-forward": t08b.innerHTML, "t11-calling-transfer": t11.innerHTML, "t12-transfer-ready": t12.innerHTML };
  }, { g0: states["g0-calling-pilot"].html, g1: states["g1-generic-confirm"].html, cream: states["d-cream"].html, t10b: states["t10b-forwarded"].html,
    M: { ...M, SCRIPT_A: Object.values(M).find((v) => /stay on the line/.test(v)) } });
  for (const [k, html] of Object.entries(made)) states[k] = { html, scroll: {}, focus: null };
  for (const id of ids) { const v = states[id]; delete states[id]; states[id] = v; }   // the state map's order
}
await b.close(); srv.close();
const CSS = ["../../../../design-system/truemeds.css", "../../app/shell/shell.css", "../../app/shell/mock-keyboard.css", "../../app/screens/case.css", "../../app/screens/prescribe.css", "../../app/screens/task-gaps.css", "../../app/screens/rx-paper.css"];
const out = `<!doctype html>
<!-- Generated by scripts/build-case-reference.mjs from the built app. Do not edit. -->
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Case page and Prescribe — approved reference</title>
${CSS.map((c) => `<link rel="stylesheet" href="${c}">`).join("\n")}
<style>.review{position:fixed;right:8px;bottom:8px;z-index:9999}</style></head>
<body class="tm picture-only" data-mode="capture">
<div id="stage"><section id="frame" class="shell-frame"><main id="main-scroll-frame" class="shell-main"><div id="mobile-column" class="shell-screen"></div></main></section></div>
<div class="review"><select id="state" aria-label="Reference state"></select></div>
<script src="../../../../design-system/src/sheet-scroll.js"></script>
<script>
const STATES = {
${Object.entries(states).map(([k, v]) => `'${k}': ${JSON.stringify(v).replace(/<\/script/g, "<\\/script")}`).join(",\n")}
};
const q = new URLSearchParams(location.search), sel = document.getElementById('state'), host = document.getElementById('mobile-column');
sel.innerHTML = Object.keys(STATES).map((k) => '<option>' + k + '</option>').join('');
if (q.get('w') === '360' && innerWidth > 360) document.getElementById('frame').style.right = (innerWidth - 360) + 'px';
if (q.has('capture')) document.querySelector('.review').hidden = true;
function show(id) { const s = STATES[id] || STATES['t01-ready']; host.innerHTML = s.html;
  const at = () => (s.scroll[innerWidth + 'x' + innerHeight] || s.scroll[(innerWidth < 380 ? '360x640' : '390x844')] || []).forEach(([i, t]) => { const e = document.getElementById(i); if (e) e.scrollTop = t; });
  at(); document.fonts.ready.then(at);
  const f = s.focus && document.getElementById(s.focus); if (f) f.focus({ preventScroll: true });
  const sheet = !f && host.querySelector('.tm-sheet'); if (sheet) sheet.focus({ preventScroll: true }); }   // as the live app: an open sheet takes the focus
sel.value = STATES[q.get('s')] ? q.get('s') : 't01-ready'; sel.onchange = () => show(sel.value); show(sel.value); document.body.dataset.ready = '1';
</script>
</body></html>
`;
if (process.argv.includes("--check")) { const same = fs.existsSync(OUT) && fs.readFileSync(OUT, "utf8") === out; console.log(same ? "case.html is up to date" : "case.html is OUT OF DATE: run node scripts/build-case-reference.mjs"); process.exit(same ? 0 : 1); }
fs.writeFileSync(OUT, out); console.log(`case.html written: ${ids.length} states, ${(out.length / 1024).toFixed(0)} KB`);
