// Step 0 checks (plan v3 B15, checklist 1.x, 3.2, 5.x). Run: cd tests && node run-checks.mjs
// Needs: a Chrome for Testing (CHROME env, or the Playwright cache path below). Starts its own static server on app/.
import { chromium } from "playwright";
import { execFileSync } from "child_process";
import http from "http";
import fs from "fs";
import path from "path";
import url from "url";
import assert from "assert/strict";

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const PROJECT = path.resolve(HERE, "..");
const APP = path.join(PROJECT, "app");
const SHOTS = path.join(PROJECT, "docs/renders/2026-11-06-step0");
const PORT = 8766;
const BASE = `http://localhost:${PORT}/`;
const CHROME = process.env.CHROME;

const results = [];
const check = (id, name, ok, detail = "") => { results.push({ id, name, ok: !!ok, detail }); console.log(`${ok ? "PASS" : "FAIL"} ${id} ${name}${detail ? "  [" + detail + "]" : ""}`); };
const fs2 = (p) => fs.readFileSync(p, "utf8");

// ---------- unit (Node) ----------
const { resolveMode } = await import(path.join(APP, "core/modes.js"));
const { value, SETTINGS } = await import(path.join(APP, "core/settings.js"));
const { encodeStory, decodeStory, defaultStory } = await import(path.join(APP, "core/play-link.js"));
const { timeline, CALL_CHOICES } = await import(path.join(APP, "core/call-sim.js"));
const { createServer, createPoller } = await import(path.join(APP, "core/mock-server.js"));
const { STORY_FIELDS } = await import(path.join(APP, "data/story-schema.js"));
const { CALL_CHOICES: CC } = await import(path.join(APP, "core/call-sim.js"));

check("U1", "modes: bare=review, ?demo=1=demo, ?capture=1=capture, ?play=x=play, standalone always demo",
  resolveMode("").mode === "review" && resolveMode("?demo=1").mode === "demo" && resolveMode("?capture=1&s=t01-ready").mode === "capture" &&
  resolveMode("?play=abc").mode === "play" && resolveMode("?capture=1", { standalone: true }).mode === "demo" && resolveMode("?s=t01-ready&w=360").w === 360);
check("U2", "settings: demo scales time values by one factor; non-time values unchanged",
  value("gate", "demo") < value("gate", "review") && value("gate", "demo") === Math.round(50000 * 0.15) && value("earningsPerConfirmedRx", "demo") === 20);
check("U3", "settings: every value has a source (rule or MOCK ASSUMPTION or review tool)",
  Object.values(SETTINGS).every((s) => ["rule", "MOCK ASSUMPTION", "review tool"].includes(s.source)));
let rnd = 7; const pick = (arr) => { rnd = (rnd * 1103515245 + 12345) & 0x7fffffff; return arr[rnd % arr.length]; };
let roundTrip = true;
for (let i = 0; i < 300; i++) {
  const story = { v: 2 };
  for (const [k, opts] of Object.entries(STORY_FIELDS)) story[k] = pick(opts);
  story.calls = Array.from({ length: 1 + (i % 3) }, () => Object.fromEntries(Object.entries(CC).map(([k, o]) => [k, pick(o)])));
  const d = decodeStory(encodeStory(story));
  if (!d || JSON.stringify(d) !== JSON.stringify({ ...story, v: 2 })) { roundTrip = false; break; }
}
check("U4", "play link: 300 random stories (every journey's answers) round-trip exactly", roundTrip);
check("U5", "play link: unreadable or unknown values decode to null", decodeStory("!!!") === null && decodeStory(encodeStory(defaultStory()).slice(0, -6)) === null &&
  decodeStory(Buffer.from(JSON.stringify({ v: 2, start: "nowhere" })).toString("base64url")) === null);
{
  const cs = { ...Object.fromEntries(Object.entries(CALL_CHOICES).map(([k, o]) => [k, o[0]])) };
  const ok = timeline({ ...cs, connected: "over-gate", ha: "free", record: "over-gate" }, "demo").some((e) => e.ev === "leg2-answered") &&
    timeline({ ...cs, doctorFailure: "3" }, "review")[0].ev === "doctor-failed" &&
    timeline({ ...cs, patientFailure: "busy" }, "review")[0].data.retry === "by-cause" &&
    timeline({ ...cs, patientFailure: "invalid-number" }, "review")[0].data.retry === "not-retried-flagged" &&
    timeline({ ...cs, patientFailure: "unknown" }, "review")[0].data.retry === "plain-hold";
  check("U6", "call simulator: doctor failure, patient failure by cause, connected path produce the B9 events", ok);
  check("U7", "demo: the scaled gate is at most 8 s, so an 8 s demo call passes (checklist 5.2)", value("gate", "demo") <= 8000, `gate demo ${value("gate", "demo")} ms`);
}
{
  const server = createServer();
  const got = [];
  const p = createPoller({ server, caseId: "A", apply: (e) => got.push(e.ev) });
  server.emit("A", 0, "one"); server.emit("B", 0, "other-case"); p.tick();
  server.emit("A", 0, "two"); p.tick(); p.tick();
  check("U8", "poller: applies events in order once; a late answer for another case never updates the open case", JSON.stringify(got) === JSON.stringify(["one", "two"]), JSON.stringify(got));
  // Monotonic: a repeated tick never re-applies, and nothing older than the last applied sequence is ever applied
  const srv2 = createServer(); const got2 = [];
  const p2 = createPoller({ server: srv2, caseId: "C", apply: (e) => got2.push(e.ev) });
  srv2.emit("C", 0, "first"); srv2.emit("C", 0, "second");
  p2.tick(); p2.tick(); p2.tick();
  srv2.emit("C", 0, "third"); p2.tick();
  check("U9", "poller: monotonic — no re-apply on repeated ticks; order kept", JSON.stringify(got2) === JSON.stringify(["first", "second", "third"]), JSON.stringify(got2));
}

// ---------- drift and deploy gate ----------
{
  const out = execFileSync("node", [path.join(PROJECT, "scripts/check-state-map.mjs")], { encoding: "utf8" });
  check("S1", "state map: 148 pictures, one owner each, calling rows match data.js, no drift", /PASS/.test(out), out.split("\n").slice(-2).join(" "));
  const scan = execFileSync("node", [path.join(HERE, "scan.mjs")], { encoding: "utf8" });
  check("S2", "scan: no hard-coded time values, hex colours, emoji or phone-number patterns in app/", /PASS/.test(scan));
}
{
  // Deploy gate (plan §4, checklist 5.10): the same ignore rule as the root netlify.toml, tested both ways in a throwaway repo.
  const tmp = fs.mkdtempSync(path.join(process.env.TMPDIR || "/private/tmp", "gate-"));
  const ignore = "git log -1 --pretty=%B | grep -qF '[deploy]' && exit 1 || exit 0";
  const run = (msg) => {
    execFileSync("git", ["init", "-q"], { cwd: tmp });
    execFileSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "--allow-empty", "-m", msg], { cwd: tmp });
    try { execFileSync("sh", ["-c", ignore], { cwd: tmp, stdio: "ignore" }); return "skip"; } catch (e) { return "build"; }
  };
  const unmarked = run("step 0 shell");
  fs.rmSync(path.join(tmp, ".git"), { recursive: true, force: true });
  const marked = run("step 0 shell [deploy]");
  check("D1", "deploy gate: commit without [deploy] → build skipped; with [deploy] → built", unmarked === "skip" && marked === "build", `${unmarked} / ${marked}`);
  fs.rmSync(tmp, { recursive: true, force: true });
  const toml = fs2(path.join(APP, "netlify.toml"));
  check("D2", "app netlify.toml: publish is app/ only, copy step, same ignore rule", /publish = "\."/.test(toml) && /copy-shared\.sh/.test(toml) && toml.includes("[deploy]"));
  const manifest = JSON.parse(fs2(path.join(APP, "manifest.webmanifest")));
  const iconsOk = ["icon-180.png", "icon-192.png", "icon-512.png"].every((f) => fs.existsSync(path.join(APP, "icons", f)));
  check("D3", "manifest: name, short name, standalone, portrait, demo start, icons 180/192/512", manifest.name === "truemeds for doctors" && manifest.short_name && manifest.display === "standalone" &&
    manifest.orientation === "portrait" && manifest.start_url.includes("demo=1") && iconsOk);
  check("D4", "QR library is vendored (no CDN reference in app/)", !/https?:\/\/(cdn|unpkg|jsdelivr|cdnjs)/.test(fs2(path.join(APP, "index.html"))) && fs.existsSync(path.join(APP, "review/vendor/qrcode-generator.js")));
  check("D5", "robots: hidden from search engines (meta + robots.txt)", /noindex/.test(fs2(path.join(APP, "index.html"))) && /Disallow: \//.test(fs2(path.join(APP, "robots.txt"))));
}

// ---------- browser ----------
// Static server on app/ (threaded, so parallel page loads don't reset connections)
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json", ".txt": "text/plain" };
const srv = http.createServer((req, res) => {
  const p = path.join(APP, decodeURIComponent(new URL(req.url, BASE).pathname).replace(/\/$/, "/index.html"));
  if (!p.startsWith(APP) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => srv.listen(PORT, r));
const browser = await chromium.launch({ executablePath: CHROME });
fs.mkdirSync(SHOTS, { recursive: true });
async function open(qs, { w = 1280, h = 800 } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  p.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });
  await p.goto(BASE + qs); await p.waitForTimeout(400);
  return { p, ctx, errors };
}

{ // modes and capture/demo storage
  const a = await open("");
  const panel = await a.p.evaluate(() => !document.getElementById("review-panel").hidden);
  check("B1", "bare link opens review with the panel", panel && (await a.p.evaluate(() => document.body.dataset.mode)) === "review");
  await a.p.screenshot({ path: path.join(SHOTS, "review-desktop-1280.png") });
  await a.ctx.close();

  const d = await open("?demo=1");
  const dinfo = await d.p.evaluate(() => ({ panel: !document.getElementById("review-panel").hidden, handle: !document.getElementById("drawer-handle").hidden }));
  check("B2", "?demo=1: no review panel, no drawer handle", !dinfo.panel && !dinfo.handle);
  check("B3", "demo: 0 console errors", d.errors.length === 0, d.errors.join(" | "));
  await d.ctx.close();

  const c = await open("?capture=1&s=t01-ready");
  const cinfo = await c.p.evaluate(() => ({ panel: !document.getElementById("review-panel").hidden, label: !!document.querySelector(".shell-label") && getComputedStyle(document.querySelector(".shell-label")).display !== "none" }));
  check("B4", "?capture=1: no panel, no label, picture shown", !cinfo.panel && !cinfo.label && (await c.p.$("#screen img")) !== null);
  check("B5", "capture: 0 console errors", c.errors.length === 0, c.errors.join(" | "));
  await c.ctx.close();
}

{ // every mode with a link: storage separation and capture writes nothing
  const c2 = await open("?capture=1&s=t01-ready");
  const n = await c2.p.evaluate(() => localStorage.length);
  check("B6", "capture writes nothing to storage", n === 0, `localStorage keys ${n}`);
  await c2.ctx.close();
}

{ // ?s= for 10 states across journeys at 390, 360 and 1280 wide
  const states = ["sign-in_default", "offer_fingerprint", "unlock_face", "home_active", "t01-ready", "s7f-submitted", "t10b-forwarded", "g1-generic-confirm", "d-default", "a-no-medicines"];
  for (const w of [390, 360, 1280]) {
    for (const id of states) {
      const r = await open(`?s=${id}`, { w, h: w === 1280 ? 800 : 844 });
      if (/^(sign-in|otp)_/.test(id)) { // built in step 1: the screen itself, no picture and no "not built yet" label
        const built = await r.p.evaluate(() => !!document.querySelector("#screen .signin-screen, #screen .otp-screen") && !document.querySelector("#screen img.shell-picture, .shell-label"));
        check(`R-${id}-${w}`, `?s=${id} at ${w}: built screen shown (step 1)`, built && r.errors.length === 0, r.errors.join(" | "));
        await r.ctx.close(); continue;
      }
      const shown = await r.p.evaluate(() => { const i = document.querySelector("#screen img"); return !!i && i.complete && i.naturalWidth > 0; });
      check(`R-${id}-${w}`, `?s=${id} at ${w}: picture loads, label says not built yet`, shown && (await r.p.evaluate(() => document.querySelector(".shell-label")?.textContent.includes("Not built yet"))) && r.errors.length === 0, r.errors.join(" | "));
      await r.ctx.close();
    }
  }
}

{ // phone drawer, 390: handle, open, backdrop closes; no control covers header or notice
  const r = await open("", { w: 390, h: 844 });
  const h1 = await r.p.evaluate(() => !document.getElementById("drawer-handle").hidden);
  check("H1", "phone (390): drawer handle shown in review", h1);
  await r.p.screenshot({ path: path.join(SHOTS, "phone-390-drawer-closed.png") });
  await r.p.click("#drawer-handle"); await r.p.waitForTimeout(350);
  const open1 = await r.p.evaluate(() => document.body.classList.contains("drawer-open"));
  check("H2", "phone: handle opens the drawer with the controls", open1);
  const visibleSections = await r.p.evaluate(() => [...document.querySelectorAll("#review-panel details")].filter((d) => !d.hidden).length);
  await r.p.screenshot({ path: path.join(SHOTS, "phone-390-drawer-open.png") });
  await r.p.mouse.click(200, 30); await r.p.waitForTimeout(350); // above the panel, on the backdrop
  check("H3", "phone: tapping outside closes the drawer", !(await r.p.evaluate(() => document.body.classList.contains("drawer-open"))), `sections ${visibleSections}`);
  check("H4", "phone: 0 console errors (review)", r.errors.length === 0, r.errors.join(" | "));
  await r.ctx.close();
}

{ // QR and play link: story from the panel, decoded in a second page, same story (plan "same end state")
  const r = await open("", { w: 1280, h: 800 });
  await r.p.selectOption("#rp-start", "case").catch(() => {});
  await r.p.selectOption("#rp-scenario", "pilot_ha_free");
  await r.p.selectOption("#rp-caseKind", "long-names");
  await r.p.selectOption("#rp-record", "over-gate");
  await r.p.selectOption("#rp-prescribe", "pending-blocks-confirm");
  await r.p.click("#rp-make-qr"); await r.p.waitForTimeout(200);
  const qrOk = await r.p.evaluate(() => { const b = document.getElementById("rp-qr"); return !b.hidden && b.querySelector("svg") !== null; });
  check("Q1", "Test on phone: QR code drawn from the vendored library", qrOk);
  const link = await r.p.evaluate(() => document.getElementById("rp-link").textContent);
  const panelStory = await r.p.evaluate(() => { const out = {}; document.querySelectorAll("#review-panel select[data-field]").forEach((s) => { out[s.dataset.field] = s.value; }); return out; });
  await r.p.screenshot({ path: path.join(SHOTS, "review-test-on-phone-qr.png"), fullPage: false });
  const phone = await open(new URL(link).search, { w: 390, h: 844 });
  await phone.p.waitForTimeout(300);
  const playStory = await phone.p.evaluate(() => { const out = {}; document.querySelectorAll("#review-panel select[data-field]").forEach((s) => { out[s.dataset.field] = s.value; }); return out; });
  const mode = await phone.p.evaluate(() => document.body.dataset.mode);
  check("Q2", "play link: opens in play mode and the phone story equals the desktop panel story (every journey field)",
    mode === "play" && Object.keys(panelStory).every((k) => panelStory[k] === playStory[k]), `mode ${mode}`);
  check("Q3", "play link: phone shows the drawer handle, not a panel over the app", await phone.p.evaluate(() => !document.getElementById("drawer-handle").hidden && document.body.classList.contains("drawer-open") === false));
  await phone.p.screenshot({ path: path.join(SHOTS, "play-link-390.png") });
  check("Q4", "play link: 0 console errors", phone.errors.length === 0, phone.errors.join(" | "));
  await phone.ctx.close();
  // unreadable code → review + notice
  const bad = await open("?play=not-a-code", { w: 390, h: 844 });
  const notice = await bad.p.evaluate(() => { const n = document.getElementById("notice-host"); return { shown: !n.hidden, text: n.textContent, mode: document.body.dataset.mode }; });
  check("Q5", "unreadable play code → review with a notice", notice.shown && notice.mode === "review" && notice.text.includes("can't be read"), JSON.stringify(notice));
  await bad.ctx.close();
  await r.ctx.close();
}

{ // demo and review keep separate storage: review writes its own namespace only
  const r = await open("");
  await r.p.evaluate(() => { localStorage.setItem("tm-doctor-app:review:probe", "1"); localStorage.setItem("tm-doctor-app:demo:probe", "1"); });
  await r.p.click("#rp-reset").catch(() => {});
  await r.p.waitForTimeout(300);
  const left = await r.p.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("tm-doctor-app:review:")).length);
  const demoLeft = await r.p.evaluate(() => localStorage.getItem("tm-doctor-app:demo:probe"));
  check("T1", "Reset clears review storage only; demo storage untouched", left === 0 && demoLeft === "1", `review keys ${left}, demo ${demoLeft}`);
  await r.ctx.close();
}

{ // jump goes through navigation and sets picture layout; restart resets the shell; both from the panel
  const r = await open("", { w: 1280, h: 800 });
  await r.p.selectOption("#rp-jump", "t10b-forwarded");
  await r.p.click("#rp-jump-go"); await r.p.waitForTimeout(200);
  const j = await r.p.evaluate(() => ({ img: document.querySelector("#screen img")?.getAttribute("src") || "", picOnly: document.body.classList.contains("picture-only") }));
  check("N1", "panel Jump opens the chosen state through navigation, picture layout set", j.img.includes("t10b-forwarded") && j.picOnly, JSON.stringify(j));
  await r.p.click("#rp-restart"); await r.p.waitForTimeout(200);
  const rs = await r.p.evaluate(() => ({ img: !!document.querySelector("#screen figure img"), signIn: !!document.querySelector("#screen .signin-screen") }));
  check("N2", "Restart story returns to the story's start screen (sign-in, built in step 1), no picture left", !rs.img && rs.signIn, JSON.stringify(rs));
  await r.p.selectOption("#rp-attempt", "0");
  await r.p.click("#rp-add-attempt"); await r.p.waitForTimeout(200);
  const attempts = await r.p.evaluate(() => document.querySelectorAll("#rp-attempt option").length);
  check("N3", "call attempts: add an attempt gives a second attempt in the story", attempts === 2, `attempts ${attempts}`);
  await r.ctx.close();
}

await browser.close();
srv.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) { console.log("FAILED: " + failed.map((f) => f.id).join(", ")); process.exit(1); }
