// F-04 (swipe wheel) and F-05 (keyboard never covers the field or the main button) — the smallest test per change.
// Run: cd tests && node wheel-keyboard.mjs        (Chrome: $CHROME, else Playwright's own Chromium)
// Wheel: a real touch swipe (Chrome's synthesized scroll gesture, with momentum), a mouse drag and a mouse wheel on each column
// snap and set the value; tapping the row below / above still moves one step; arrow keys; busy blocks it; the value set is the
// one Set availability / Add uses. Keyboard: a phone-sized page whose visual viewport shrinks as a keyboard would (stubbed
// window.visualViewport) keeps the focused field and the screen's main button fully inside it.
import { chromium } from "playwright";
import http from "http"; import fs from "fs"; import path from "path"; import url from "url";

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const APP = path.join(path.resolve(HERE, ".."), "app");
const registry = JSON.parse(fs.readFileSync(path.join(APP, "../ui-screens/feedback/messages.json"), "utf8"));
const addCopy = (duration) => { const e = registry["home.addConfirm"]; return (typeof e === "string" ? e : e.text).replace("{duration}", duration); };
const PORT = 8773, BASE = `http://localhost:${PORT}/`;
const results = [];
const check = (id, name, ok, detail = "") => { results.push(!!ok); console.log(`${ok ? "PASS" : "FAIL"} ${id} ${name}${detail && !ok ? "  [" + detail + "]" : ""}`); };

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json", ".webmanifest": "application/manifest+json" };
const srv = http.createServer((q, r) => {
  const p = path.join(APP, decodeURIComponent(new URL(q.url, BASE).pathname).replace(/\/$/, "/index.html"));
  if (!p.startsWith(APP) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r);
});
await new Promise((r) => srv.listen(PORT, r));
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ["--hide-scrollbars"] });
const errors = [];
async function page(qs, { w = 390, h = 844, touch = false, init = null } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errors.push(e.message)); p.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  if (init) await p.addInitScript(init);
  await p.goto(BASE + qs); await p.waitForTimeout(400);
  return p;
}
const sel = (p, col) => p.evaluate((c) => {
  const w = document.querySelector(`.wheel[data-col="${c}"]`); const s = w.querySelector(".wheel-item.is-selected");
  const rowH = w.querySelector(".wheel-item:not(.wheel-item--empty)").offsetHeight;
  return { v: s && Number(s.textContent), aligned: Math.abs(w.scrollTop / rowH - Math.round(w.scrollTop / rowH)) < 0.05, n: w.querySelectorAll('[aria-selected="true"]').length,
    tab: w.querySelector('[tabindex="0"]')?.textContent };
}, col);
const centre = (p, col) => p.evaluate((c) => { const r = document.querySelector(`.wheel[data-col="${c}"]`).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, top: r.top, h: r.height }; }, col);
async function swipe(p, col, dy) {   // a real touch swipe (finger moves up by dy → later values), Chrome's own momentum and snap
  const c = await centre(p, col);
  const cdp = await p.context().newCDPSession(p);
  await cdp.send("Input.synthesizeScrollGesture", { x: Math.round(c.x), y: Math.round(c.y), yDistance: -dy, gestureSourceType: "touch", speed: 600 });
  await p.waitForTimeout(900);
}

// ---------------- F-04 wheel ----------------
{ // W1 touch swipe on each column snaps and sets the value; Set availability uses it
  const p = await page("?s=home_setup-wheel", { touch: true });
  const before = { h: await sel(p, "h"), m: await sel(p, "m") };
  await swipe(p, "h", 96);   // two rows
  const h1 = await sel(p, "h");
  await swipe(p, "m", 48);
  const m1 = await sel(p, "m");
  const pressed = await p.evaluate(() => [...document.querySelectorAll(".presets [aria-pressed=true]")].map((b) => b.textContent));
  await p.click("[data-confirm]"); await p.waitForTimeout(2500);
  const time = await p.evaluate(() => document.getElementById("home-time")?.textContent);
  const expect = (h1.v * 60 + m1.v);
  const shown = time && time.split(":").map(Number);
  const mins = shown && (shown.length === 3 ? shown[0] * 60 + shown[1] + (shown[2] ? 1 : 0) : shown[0] + (shown[1] ? 1 : 0));
  check("W1", "touch swipe: hours and minutes columns each snap to one row (in the band) and set the value; Set availability starts that duration",
    before.h.v === 0 && before.m.v === 30 && h1.v >= 1 && h1.aligned && h1.n === 1 && h1.tab === String(h1.v) && [0, 15, 30, 45].includes(m1.v) && m1.v !== 30 && m1.aligned &&
    pressed.length === 0 === (![15, 30, 45, 60, 120, 180].includes(expect)) && mins === expect,
    JSON.stringify({ before, h1, m1, pressed, time, expect }));
  await p.close();
}
{ // W2 mouse drag and mouse wheel (desktop review) snap too
  const p = await page("?s=home_setup-wheel");
  const c = await centre(p, "h");
  await p.mouse.move(c.x, c.y); await p.mouse.down(); await p.mouse.move(c.x, c.y - 60, { steps: 6 }); await p.mouse.move(c.x, c.y - 100, { steps: 4 }); await p.mouse.up();
  await p.waitForTimeout(1200);
  const drag = await sel(p, "h");
  const m = await centre(p, "m");
  await p.mouse.move(m.x, m.y); await p.mouse.wheel(0, 60); await p.waitForTimeout(900);
  const wheel = await sel(p, "m");
  check("W2", "mouse drag (hours) and mouse wheel (minutes) move the wheel and snap to one row",
    drag.v >= 2 && drag.aligned && drag.n === 1 && wheel.v === 45 && wheel.aligned, JSON.stringify({ drag, wheel }));
  await p.close();
}
{ // W3 tap the row below / above = one step; arrow keys = one step and keep the focus
  const p = await page("?s=home_setup-wheel");
  const c = await centre(p, "h");
  await p.mouse.click(c.x, c.top + c.h * 5 / 6); await p.waitForTimeout(400);
  const down = await sel(p, "h");
  await p.mouse.click(c.x, c.top + c.h / 6); await p.waitForTimeout(400);
  const up = await sel(p, "h");
  await p.focus('.wheel[data-col="m"] .wheel-item.is-selected');
  await p.keyboard.press("ArrowDown"); await p.waitForTimeout(300);
  const key = await sel(p, "m");
  const focus = await p.evaluate(() => ({ col: document.activeElement.closest(".wheel")?.dataset.col, sel: document.activeElement.getAttribute("aria-selected"), txt: document.activeElement.textContent }));
  await p.keyboard.press("ArrowUp"); await p.keyboard.press("ArrowUp"); await p.waitForTimeout(300);
  const key2 = await sel(p, "m");
  check("W3", "tap the row below → +1 step, the row above → −1 step; ArrowDown / ArrowUp step the focused column and keep the focus on the selected row; minimum 15 min holds",
    down.v === 1 && up.v === 0 && key.v === 45 && focus.col === "m" && focus.sel === "true" && focus.txt === "45" && key2.v === 15, JSON.stringify({ down, up, key, focus, key2 }));
  await p.close();
}
{ // W4 busy (Setting…) blocks the wheel
  const p = await page("?s=home_setting", { touch: true });
  const b0 = await sel(p, "h");
  const busy = await p.evaluate(() => [...document.querySelectorAll(".wheel")].map((w) => w.classList.contains("is-busy") && getComputedStyle(w).overflowY === "hidden" && [...w.querySelectorAll("button")].every((b) => b.disabled)));
  await swipe(p, "h", 96);
  await p.keyboard.press("ArrowDown");
  const b1 = await sel(p, "h");
  check("W4", "busy (Setting…): both columns blocked (no scroll, rows disabled); a swipe changes nothing",
    busy.length === 2 && busy.every(Boolean) && b0.v === b1.v, JSON.stringify({ busy, b0, b1 }));
  await p.close();
}
{ // W5 the Add sheet: the swiped value is what Add uses
  const p = await page("?s=home_add-wheel", { touch: true });
  const t0 = await p.evaluate(() => document.getElementById("home-time")?.textContent);
  await swipe(p, "h", 48);
  const h1 = await sel(p, "h"), m1 = await sel(p, "m");
  const label = await p.textContent(".tm-sheet [data-confirm]").catch(() => p.textContent("[data-confirm]"));
  const n = h1.v * 60 + m1.v;
  check("W5", "Add time sheet: swipe sets the value, the Add button carries it", h1.v === 1 && h1.aligned && label.trim() === addCopy(`${Math.floor(n / 60)} h${n % 60 ? ` ${n % 60} min` : ""}`), JSON.stringify({ h1, m1, label, t0 }));
  await p.close();
}

{ // W6 (Codex blocker 1) both columns moving at once: the one that rests first doesn't throw away the other's swipe
  const p = await page("?s=home_setup-wheel");
  await p.evaluate(async () => {
    const h = document.querySelector('.wheel[data-col="h"]'), m = document.querySelector('.wheel[data-col="m"]'); const r = h.querySelector("button").offsetHeight;
    m.dispatchEvent(new Event("touchstart"));                              // a finger is on minutes…
    h.scrollTop = 2 * r;                                                   // …while hours lands and rests (well past its settle time)
    await new Promise((x) => setTimeout(x, 500));
    m.scrollTop = 3 * r; m.dispatchEvent(new Event("touchend"));           // then minutes is let go                                                  // minutes lands on 45 (row 3 of 15 / 30 / 45 / … when hours is 0; 0 / 15 / 30 / 45 when ≥ 1)
  });
  await p.waitForTimeout(800);
  const h = await sel(p, "h"), m = await sel(p, "m");
  check("W6", "both columns moving together: hours rests first, minutes later — both band values are kept (2 h 45 min; the old build kept 30)",
    h.v === 2 && m.v === 45 && m.aligned && h.aligned, JSON.stringify({ h, m }));
  await p.close();
}
{ // W7 (Codex blocker 2) Set availability tapped before the wheel has come to rest: the value in the band is the one set
  const p = await page("?s=home_setup-wheel");
  await p.evaluate(() => { const h = document.querySelector('.wheel[data-col="h"]'); h.scrollTop = 3 * h.querySelector("button").offsetHeight; document.querySelector("[data-confirm]").click(); });
  await p.waitForTimeout(2500);
  const time = await p.evaluate(() => document.getElementById("home-time")?.textContent);
  check("W7", "Set availability tapped while the wheel still moves: sets the band's value (3 h 30 min → 3:30:00 / 3:29:5x)", /^3:(30:00|29:5\d)$/.test(time || ""), time);
  await p.close();
}

// ---------------- F-05 keyboard ----------------
// The phone's keyboard, emulated: window.visualViewport is replaced by a stub whose height drops (layout viewport unchanged, as
// on iOS Safari and on Android Chrome when resizes-content is not honoured), with a resize event, after the field has focus.
const { encodeStory, defaultStory } = await import(path.join(APP, "core/play-link.js"));
const PLAY = `?play=${encodeURIComponent(encodeStory(defaultStory()))}`;
const STUB = () => {
  const vv = new EventTarget(); let H = innerHeight, S = 1;
  for (const [k, f] of Object.entries({ height: () => H, width: () => innerWidth, offsetTop: () => 0, offsetLeft: () => 0, pageTop: () => scrollY, pageLeft: () => 0, scale: () => S }))
    Object.defineProperty(vv, k, { get: f });
  Object.defineProperty(window, "visualViewport", { configurable: true, get: () => vv });
  window.__kb = (h) => { H = h; vv.dispatchEvent(new Event("resize")); };
  window.__zoom = (s, h) => { S = s; H = h; vv.dispatchEvent(new Event("resize")); };
};
async function underKeyboard(qs, { w = 390, h = 844, kb = 336, field, type = null, action = null, before = null }) {
  const p = await page(PLAY + "&s=" + qs, { w, h, touch: true, init: STUB });
  if (before) await before(p);
  await p.focus(field);
  if (type) await p.keyboard.type(type);
  await p.evaluate((H) => window.__kb(H), h - kb);
  await p.waitForTimeout(900);
  const m = await p.evaluate(({ field, action, H }) => {
    const el = document.querySelector(field); const box = (el.closest(".tm-field") || el).getBoundingClientRect();
    const a = action ? document.querySelector(action) : null; const ar = a && a.getClientRects().length ? a.getBoundingClientRect() : null;
    const frame = document.getElementById("frame").getBoundingClientRect();
    const inside = (r) => !!r && r.top >= -0.5 && r.bottom <= H + 0.5;
    return { H, frameH: Math.round(frame.height), field: [Math.round(box.top), Math.round(box.bottom)], fieldIn: inside(box), focused: document.activeElement === el,
      action: ar && [Math.round(ar.top), Math.round(ar.bottom)], actionIn: inside(ar), actionText: a && a.textContent.trim(),
      barHidden: !!document.querySelector(".kb-real"), clear: ar ? Math.round(H - ar.bottom) : null };
  }, { field, action, H: h - kb });
  await p.close();
  return m;
}
for (const [w, h, kb] of [[390, 844, 336], [360, 640, 290]]) {
  const s = await underKeyboard("sign-in_default", { w, h, kb, field: "#tm-login-mobile", type: "98765", action: ".login-submit" });
  check(`K1-${w}`, `sign-in @${w}×${h}, keyboard ${kb}: the app fits above the keyboard; the number field and Send OTP fully inside it`,
    s.frameH === s.H && s.fieldIn && s.actionIn && s.focused && /OTP/.test(s.actionText), JSON.stringify(s));
  const o = await underKeyboard("otp_default", { w, h, kb, field: "#c", type: "1234", action: "#b" });
  check(`K2-${w}`, `OTP @${w}×${h}, keyboard ${kb}, code typed: the code boxes and Verify & sign in fully inside, at least 16 px above the keyboard (D-44)`,
    o.frameH === o.H && o.fieldIn && o.actionIn && o.focused && o.actionText === "Verify & sign in" && o.clear >= 16, JSON.stringify(o));
}
{
  const c1 = await underKeyboard("t01-ready", { field: "#symptoms-input", type: "Fever" });
  const c2 = await underKeyboard("t01-ready", { field: "#doctor-notes-input", type: "Rest" });
  check("K3", "case page: Chief complaints and Doctor notes each fully inside (label and helper), the pinned bar hidden while typing (D-81)",
    c1.fieldIn && c1.focused && c1.barHidden && c2.fieldIn && c2.focused && c2.barHidden && c1.frameH === c1.H, JSON.stringify({ c1, c2 }));
}
{
  const d1 = await underKeyboard("d-error-other", { field: "#ps-other", type: "2" });
  const d2 = await underKeyboard("d-error-other", { field: "#ps-note", type: "After food" });
  check("K4", "Prescribe: the Other dose field and Additional instructions each fully inside the space above the keyboard (bar hidden while typing, D-81)",
    d1.fieldIn && d1.focused && d2.fieldIn && d2.focused && d1.barHidden && d2.barHidden, JSON.stringify({ d1, d2 }));
}
{ // K6 (Codex should-fix 3) pinch zoom: nothing resizes or scrolls
  const p = await page(PLAY + "&s=otp_default", { touch: true, init: STUB });
  await p.focus("#c");
  await p.evaluate(() => window.__zoom(2, 422)); await p.waitForTimeout(900);
  const z = await p.evaluate(() => ({ vh: document.documentElement.style.getPropertyValue("--app-vh"), frameH: Math.round(document.getElementById("frame").getBoundingClientRect().height),
    scrolled: [...document.querySelectorAll("#frame *")].some((e) => e.scrollTop > 0), kb: document.documentElement.classList.contains("phone-kb") }));
  check("K6", "pinch zoom (scale 2, visual viewport halved): the app is not resized and nothing is scrolled", !z.vh && z.frameH === 844 && !z.scrolled && !z.kb, JSON.stringify(z));
  await p.close();
}
{ // Desktop: the phone frame with the drawn keyboard is unchanged
  const p = await page("?s=otp_default", { w: 1280, h: 800, init: STUB });
  const r0 = await p.evaluate(() => JSON.stringify(document.getElementById("frame").getBoundingClientRect()));
  await p.focus("#c"); await p.evaluate(() => window.__kb(500)); await p.waitForTimeout(700);
  const r1 = await p.evaluate(() => JSON.stringify(document.getElementById("frame").getBoundingClientRect()));
  const vars = await p.evaluate(() => document.documentElement.style.getPropertyValue("--app-vh"));
  check("K5", "desktop 1280×800: the phone frame does not move or resize when the viewport changes (drawn keyboard unchanged)", r0 === r1 && !vars, JSON.stringify({ r0, r1, vars }));
  await p.close();
}

await browser.close(); srv.close();
const ok = results.every(Boolean);
if (errors.length) console.log("page errors:", errors);
console.log(`\n${results.filter(Boolean).length} / ${results.length} passed${errors.length ? ", page errors " + errors.length : ""}`);
process.exit(ok && !errors.length ? 0 : 1);
