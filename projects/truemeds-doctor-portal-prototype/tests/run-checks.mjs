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
const SHOTS = process.env.SHOTS ? path.resolve(process.env.SHOTS) : path.join(PROJECT, "docs/renders/2026-11-09-step1-recovery/session-4/panel");   // SHOTS=<folder> per run (fast build); default: step 1 evidence folder
fs.mkdirSync(SHOTS, { recursive: true });
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
  check("S1", "state map: 149 pictures, one owner each, calling rows match data.js, no drift", /PASS/.test(out), out.split("\n").slice(-2).join(" "));
  const scan = execFileSync("node", [path.join(HERE, "scan.mjs")], { encoding: "utf8" });
  check("S2", "scan: no hard-coded time values, hex colours, emoji or phone-number patterns in app/", /PASS/.test(scan));
  // D-99 / D-100: token guard over components.css and app/screens/*.css (raw-ok markers honoured)
  let tok = { status: 0, out: "" };
  try { tok.out = execFileSync("python3", [path.join(PROJECT, "../../design-system/scripts/check_tokens.py")], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
  catch (e) { tok = { status: e.status, out: String(e.stdout || "") + String(e.stderr || "") }; }
  check("S3", "token guard: no raw design values in components.css or app/screens/*.css (check_tokens.py)", tok.status === 0, tok.status ? tok.out.trim().split("\n").slice(-3).join(" ") : "");
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
  check("D6", "F-02: viewport resizes the page for the phone keyboard (interactive-widget=resizes-content)", /<meta name="viewport"[^>]*interactive-widget=resizes-content/.test(fs2(path.join(APP, "index.html"))));
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
// Panel rows fold (Part A item 2): open the row that holds a control before using it, as a reviewer would.
async function choose(p, field, v) {
  await p.evaluate((f) => { const el = document.getElementById("rp-" + f); const d = el && el.closest("details"); if (d) d.open = true; }, field);
  await p.selectOption("#rp-" + field, v);
}
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

  const c = await open("?capture=1&s=t10b-forwarded");   // a state still shown as its picture (step 6)
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
      if (/^(sign-in|otp|offer|unlock|home)_|^(a|s|d)-|^t0[1-9]-|^s7[a-f]-|^c-callback|^e-/.test(id)) { // built in steps 1–5 (step 5 calling, run A2): the screen itself, no picture and no "not built yet" label
        const built = await r.p.evaluate(() => !!document.querySelector("#screen .signin-screen, #screen .otp-screen, #screen .offer-screen, #screen .unlock-screen, #screen .home-screen, #screen .case-screen") && !document.querySelector("#screen .shell-picture, .shell-label"));
        check(`R-${id}-${w}`, `?s=${id} at ${w}: built screen shown (steps 1–5)`, built && r.errors.length === 0, r.errors.join(" | "));
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
  await choose(r.p, "start", "case").catch(() => {});
  await choose(r.p, "scenario", "pilot_ha_free");
  await choose(r.p, "caseKind", "long-names");
  await choose(r.p, "record", "over-gate");
  await choose(r.p, "prescribe", "pending-blocks-confirm");
  await r.p.waitForTimeout(200);   // no "Make QR" button: the QR follows every change (Part A item 3)
  const qrOk = await r.p.evaluate(() => { const b = document.getElementById("rp-qr"); return !b.hidden && b.querySelector("svg") !== null; });
  check("Q1", "Test on phone: QR code drawn from the vendored library, current without a button", qrOk && !(await r.p.$("#rp-make-qr")));
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
  await choose(r.p, "jump", "t10b-forwarded");
  await r.p.click("#rp-jump-go"); await r.p.waitForTimeout(200);
  const j = await r.p.evaluate(() => ({ img: document.querySelector("#screen img")?.getAttribute("src") || "", picOnly: document.body.classList.contains("picture-only") }));
  check("N1", "panel Jump opens the chosen state through navigation, picture layout set", j.img.includes("t10b-forwarded") && j.picOnly, JSON.stringify(j));
  await r.p.click("#rp-restart"); await r.p.waitForTimeout(200);
  const rs = await r.p.evaluate(() => ({ img: !!document.querySelector("#screen figure img"), signIn: !!document.querySelector("#screen .signin-screen") }));
  check("N2", "Restart story returns to the story's start screen (sign-in, built in step 1), no picture left", !rs.img && rs.signIn, JSON.stringify(rs));
  await choose(r.p, "attempt", "0");
  await r.p.click("#rp-add-attempt"); await r.p.waitForTimeout(200);
  const attempts = await r.p.evaluate(() => document.querySelectorAll("#rp-attempt option").length);
  check("N3", "call attempts: add an attempt gives a second attempt in the story", attempts === 2, `attempts ${attempts}`);
  await r.ctx.close();
}

{ // Part A (step 1 recovery session 4): plain words, two-card layout at 1280 x 800, QR always current and scannable, drawer
  const { VALUE_LABEL } = await import(path.join(APP, "review/labels.js"));
  const { STATE_NAME } = await import(path.join(APP, "review/state-names.js"));
  const { encodeShort } = await import(path.join(APP, "core/play-link.js"));
  const missingVal = [];
  for (const [k, o] of [...Object.entries(STORY_FIELDS), ...Object.entries(CC)]) for (const v of o) if (!VALUE_LABEL[k] || !VALUE_LABEL[k][v]) missingVal.push(`${k}=${v}`);
  check("P1", "every story and call value has plain words (no codes shown)", missingVal.length === 0, missingVal.join(", "));
  globalThis.window = {}; await import(path.join(APP, "state-map.js") + "?p2"); const map = globalThis.window.TM_STATE_MAP;
  const ids = [...map.pictures, ...map.others].map((r) => r.id);
  // mechanical = an id fragment left in (underscore, two-hyphen token like enable-failed-x, a dotted id) or a word with its
  // apostrophe dropped by a generator ("Couldnt verify")
  const noName = ids.filter((id) => { const n = STATE_NAME[id]; return !n || n === id || /_|\b[a-z]+-[a-z]+-[a-z]+|\b[a-z]+\.[a-z]/.test(n) || /\b(couldnt|didnt|isnt|cant|wont|wasnt)\b/i.test(n); });
  check("P2", `every state id (${ids.length}) has a plain jump-list name`, noName.length === 0, noName.join(", "));
  const typical = { ...defaultStory(), scenario: "pilot_ha_free", calls: [{ ...defaultStory().calls[0], connected: "over-gate", whoEnded: "patient" }] };
  const link = "https://truemeds-doctor-app-preview.netlify.app/?play=" + encodeShort(typical);
  check("P3", "short play link: default story is '3', typical story link ≤ 100 characters, both decode back",
    encodeShort(defaultStory()) === "3" && link.length <= 100 && JSON.stringify(decodeStory(encodeShort(typical))) === JSON.stringify({ ...typical, v: 2 }) && JSON.stringify(decodeStory("3")) === JSON.stringify(defaultStory()),
    `${link.length} chars: ${link}`);
  const r = await open("?s=sign-in_default", { w: 1280, h: 800 });
  const texts = await r.p.evaluate(() => [...document.querySelectorAll("#review-panel option")].map((o) => o.textContent));
  const codeLike = texts.filter((t) => /^[a-z0-9]+([-_][a-z0-9]+)+$/.test(t) || /^\d+ · /.test(t));
  check("P4", "panel options read as words (no ids like over-gate, 1 · offer_enable-failed)", codeLike.length === 0, codeLike.slice(0, 5).join(", "));
  const jump = await r.p.evaluate(() => [...document.querySelectorAll("#rp-jump option")].map((o) => [o.value, o.textContent]));
  check("P2b", `Jump to a state lists every picture and behaviour-only state (${ids.length}) by its plain name, grouped by journey`,
    jump.length === ids.length && jump.every(([v, t]) => STATE_NAME[v] === t) && (await r.p.evaluate(() => document.querySelectorAll("#rp-jump optgroup").length)) >= 8, `${jump.length} options`);
  // behaviour-only step-1 states open the screen where the behaviour shows, with that journey's drawer controls
  const jumpTo = async (id) => { await choose(r.p, "jump", id); await r.p.click("#rp-jump-go"); await r.p.waitForTimeout(250);
    return r.p.evaluate(() => ({ s: window.__tm.store.get().s, j: window.__tm.store.get().journey, card: !!document.querySelector(".shell-picture--card") })); };
  const bc = await jumpTo("offer.cancelled"), bl = await jumpTo("signin.locked-number"), bn = await jumpTo("offer.not-now");
  check("P2c", "Jump to a behaviour-only step-1 state opens its screen (offer.cancelled → offer, signin.locked-number → OTP locked, offer.not-now → Home), not a card",
    bc.s === "offer_fingerprint" && bc.j === "offer" && !bc.card && bl.s === "otp_locked" && bl.j === "otp" && bn.s === "home_setup-wheel", JSON.stringify({ bc, bl, bn }));
  await jumpTo("sign-in_default");
  // a busy event log (60 events) must not push the panel past the screen (bounded list, RULES §7)
  await r.p.evaluate(async () => { const m = await import("./review/panel.js"); for (let i = 0; i < 60; i++) m.logLine(document.getElementById("review-panel"), `event ${i} with some detail {"partner":"ozonetel","callId":"call-${i}"}`); });
  const geo = [];
  for (const row of ["phone", "story", "jump", "entry", "work", "call", "settings", "log"]) {
    await r.p.evaluate((k) => { const d = document.querySelector(`details[data-row=${k}]`); d.open = true; }, row); await r.p.waitForTimeout(80);
    geo.push(await r.p.evaluate((k) => { const g = (id) => document.getElementById(id).getBoundingClientRect(); const a = g("rp-review"), f = g("frame");
      return { k, open: [...document.querySelectorAll("details.rp-row[open]")].length, reviewOn: a.bottom <= innerHeight && a.left >= f.right && a.right <= innerWidth,
        bar: g("rp-restart").bottom <= innerHeight, noScroll: document.documentElement.scrollHeight <= innerHeight + 1, card: !document.getElementById("rp-phone") }; }, row));
  }
  check("P5", "1280 x 800 (D-97): opening any row (Test on phone first … Event log) keeps one row open and the whole panel, Restart story included, on screen; no page scroll; no left-gutter card",
    geo.every((g) => g.open === 1 && g.reviewOn && g.bar && g.noScroll && g.card), JSON.stringify(geo.filter((g) => !(g.open === 1 && g.reviewOn && g.bar && g.noScroll && g.card))));
  await r.p.evaluate(() => { document.querySelector("details[data-row=phone]").open = true; });
  const before = await r.p.evaluate(() => document.getElementById("rp-link").textContent);
  await choose(r.p, "scenario", "pilot_ha_free");
  const after = await r.p.evaluate(() => ({ link: document.getElementById("rp-link").textContent, steps: [...document.querySelectorAll("#rp-steps li")].map((l) => l.textContent), value: document.querySelector("[data-value=story]").textContent }));
  check("P6", "QR, link, steps and the row's value follow a change at once (3–7 plain steps; OTP and offer answers in the default steps)",
    after.link !== before && after.steps.length >= 3 && after.steps.length <= 7 && after.steps.some((t) => t.startsWith("OTP")) && after.steps.some((t) => t.startsWith("Faster sign-in")) && after.value.includes("Pilot · HA free"), JSON.stringify(after));
  // Decode the QR back from a 160 px screenshot (the size on screen) — a phone-camera stand-in.
  const { default: jsQR } = await import("jsqr"); const { PNG } = await import("pngjs");
  await r.p.evaluate(() => { document.querySelector("details[data-row=phone]").open = true; });
  const qrBox = await r.p.$("#rp-qr");
  const shot = PNG.sync.read(await qrBox.screenshot({ path: path.join(SHOTS, "qr-160.png") }));
  const decoded = jsQR(new Uint8ClampedArray(shot.data), shot.width, shot.height);
  const qrSize = await r.p.evaluate(() => Math.round(document.getElementById("rp-qr").getBoundingClientRect().width));
  check("P7", "QR at 160 px decodes back to the link shown, and that link plays the same story", qrSize === 160 && decoded && decoded.data === after.link && decodeStory(new URL(decoded.data).searchParams.get("play"))?.scenario === "pilot_ha_free",
    decoded ? decoded.data : "not decoded");
  await r.p.evaluate(() => { document.querySelector("details[data-row=story]").open = true; });
  await r.p.screenshot({ path: path.join(SHOTS, "panel-1280-story.png") });
  await r.p.evaluate(() => { document.querySelector("details[data-row=call]").open = true; });
  await r.p.screenshot({ path: path.join(SHOTS, "panel-1280-call.png") });
  check("P8", "panel at 1280: 0 console errors", r.errors.length === 0, r.errors.join(" | "));
  // width change while open: desktop → phone filters the drawer to the current screen; back to desktop shows every row again
  await r.p.setViewportSize({ width: 390, height: 844 }); await r.p.waitForTimeout(250);
  const narrowRows = await r.p.evaluate(() => [...document.querySelectorAll("#rp-review > details")].filter((d) => !d.hidden).map((d) => d.dataset.row));
  await r.p.setViewportSize({ width: 1280, height: 800 }); await r.p.waitForTimeout(250);
  const wideRows = await r.p.evaluate(() => [...document.querySelectorAll("#rp-review > details")].filter((d) => !d.hidden).map((d) => d.dataset.row));
  check("P8b", "resize: drawer filtering follows the width (390: sign-in controls, Jump, Story; 1280: all 8 rows, Test on phone first)",
    narrowRows.join(",") === "entry,jump,story" && wideRows.length === 8 && wideRows[0] === "phone", JSON.stringify({ narrowRows, wideRows }));
  await r.ctx.close();
  // Phone drawer: handle centred vertically (not in the top 200 px); current screen's controls first, then Jump, Story, Restart;
  // the drawer follows a transition.
  const d = await open("?s=sign-in_default", { w: 390, h: 844 });
  const hd = await d.p.evaluate(() => { const b = document.getElementById("drawer-handle").getBoundingClientRect(); return { top: b.top, mid: (b.top + b.bottom) / 2 }; });
  const order = async () => d.p.evaluate(() => [...document.querySelectorAll("#rp-review > details, #rp-review > .rp-bar")].filter((x) => !x.hidden)
    .map((x) => (x.dataset.row || "bar") + ":" + [...x.querySelectorAll("label")].filter((l) => !l.hidden).map((l) => l.querySelector("select").id.slice(3)).join("+")));
  const o1 = await order();
  await d.p.click("#drawer-handle"); await d.p.waitForTimeout(300);
  await d.p.screenshot({ path: path.join(SHOTS, "drawer-390-sign-in.png") });
  await d.p.mouse.click(200, 30); await d.p.waitForTimeout(300);
  await d.p.evaluate(() => { document.getElementById("tm-login-mobile").value = ""; });
  await d.p.fill("#tm-login-mobile", "9876543210"); await d.p.click(".login-submit"); await d.p.waitForTimeout(1800);
  const o2 = await order();
  await d.p.click("#drawer-handle"); await d.p.waitForTimeout(300);
  await d.p.screenshot({ path: path.join(SHOTS, "drawer-390-otp.png") });
  const testCard = await d.p.evaluate(() => getComputedStyle(document.querySelector("details[data-row=phone]")).display);
  check("P9", "drawer (390): handle vertically centred; current screen's controls first, then Jump, Story, Restart; follows sign-in → OTP; no QR card on the phone",
    hd.top > 200 && Math.abs(hd.mid - 422) < 2 && o1[0] === "entry:signIn" && o1.slice(1).map((x) => x.split(":")[0]).join(",") === "jump,story,bar" && o2[0] === "entry:otp" && testCard === "none",
    JSON.stringify({ hd, o1, o2, testCard }));
  check("P10", "drawer: 0 console errors", d.errors.length === 0, d.errors.join(" | "));
  await d.ctx.close();
}

// ---------- Run A0 (D-97): frame 390 : 844, one right-hand column, phone row, Wi-Fi link, happy path, wrapping, test numbers, timings ----------
{
  const { SIGN_IN_NUMBERS, OTP_CODES } = await import(path.join(APP, "data/test-numbers.js"));
  const { encodeShort } = await import(path.join(APP, "core/play-link.js"));
  const { SETTING_NAME, settingTag } = await import(path.join(APP, "review/labels.js"));
  // P11 frame and column at three desktop sizes
  const geo = [];
  for (const [w, h] of [[1280, 800], [1440, 900], [1920, 1080]]) {
    const r = await open("?s=sign-in_default", { w, h });
    geo.push(await r.p.evaluate(([w, h]) => { const f = document.getElementById("frame").getBoundingClientRect(), a = document.getElementById("rp-review").getBoundingClientRect();
      return { w, h, fw: +f.width.toFixed(1), fh: +f.height.toFixed(1), ratio: +(f.width / f.height).toFixed(4), panelTop: a.top - f.top, right: a.left >= f.right, phoneFirst: document.querySelector("#rp-review details.rp-row").dataset.row,
        phoneOpen: document.querySelector("details[data-row=phone]").open, gutter: !!document.getElementById("rp-phone") }; }, [w, h]));
    await r.p.screenshot({ path: path.join(SHOTS, `a0-${w}x${h}.png`) });
    await r.ctx.close();
  }
  check("P11", "D-97 frame 390 : 844 (exactly 390 x 844 at 1440 x 900 and 1920 x 1080, scaled evenly at 1280 x 800); panel in one right-hand column, top edge = frame top; Test on phone the first row, open by default; no left-gutter card",
    geo.every((g) => Math.abs(g.ratio - 390 / 844) < 0.003 && Math.abs(g.panelTop) <= 1 && g.right && g.phoneFirst === "phone" && g.phoneOpen && !g.gutter) &&
    geo.slice(1).every((g) => g.fw === 390 && g.fh === 844), JSON.stringify(geo));
  // P12 panel order and Advanced group; summaries wrap (not clipped); timings in plain words with Rule / Stand-in
  const r = await open("?s=sign-in_default", { w: 1280, h: 800 });
  const pan = await r.p.evaluate(() => {
    const card = document.getElementById("rp-review");
    const order = [...card.children].filter((e) => e.matches("details.rp-row, [data-group]")).map((e) => e.dataset.row || e.dataset.group);
    const titles = [...card.querySelectorAll("details.rp-row > summary .rp-row__title")].map((t) => t.textContent);
    const values = [...card.querySelectorAll(".rp-row__value")].map((v) => ({ t: v.textContent, clipped: v.scrollHeight > v.clientHeight + 1 || v.scrollWidth > v.clientWidth + 1, lines: Math.round(v.getBoundingClientRect().height / parseFloat(getComputedStyle(v).lineHeight)) }));
    const items = [...card.querySelectorAll(".rp-timings [data-setting]")].map((d) => ({ k: d.dataset.setting, name: d.querySelector(".rp-timings__name").textContent, val: d.querySelector(".rp-timings__val").textContent, tag: d.querySelector(".rp-tag").textContent, ref: d.title }));
    const tool = [...card.querySelectorAll(".rp-timings__tool [data-setting]")].map((x) => x.dataset.setting);
    return { order, titles, values, items, tool };
  });
  check("P12", "panel order: Test on phone · Story · Jump to a state · Sign-in answers · Home and case answers · Call simulator · Advanced (Timings and limits, Event log)",
    pan.order.join(",") === "phone,story,jump,entry,work,call,advanced,settings,log" && pan.titles.join("|") === "Test on phone|Story|Jump to a state|Sign-in answers|Home and case answers|Call simulator|Timings and limits|Event log", JSON.stringify(pan.order));
  // long summary: make the sign-in answers the longest words, then check the summary wraps instead of being cut off
  await choose(r.p, "signIn", "too-many-tries"); await choose(r.p, "otp", "two-tries-left"); await choose(r.p, "offer", "enable-failed"); await choose(r.p, "unlock", "unavailable");
  const wrap = await r.p.evaluate(() => [...document.querySelectorAll(".rp-row__value")].map((v) => ({ k: v.dataset.value, t: v.textContent, clipped: v.scrollHeight > v.clientHeight + 1, lines: Math.round(v.getBoundingClientRect().height / parseFloat(getComputedStyle(v).lineHeight)) })));
  const entry = wrap.find((x) => x.k === "entry");
  check("P13", "summaries wrap to two lines instead of being cut off (none clipped; the long Sign-in answers summary shows in full on 2 lines)",
    wrap.every((x) => !x.clipped) && entry.lines === 2 && entry.t.includes("Not available"), JSON.stringify(wrap.filter((x) => x.clipped || x.k === "entry")));
  const keys = Object.keys(SETTINGS);
  const named = keys.every((k) => SETTING_NAME[k] && !/[A-Z][a-z]+[A-Z]/.test(SETTING_NAME[k]));
  const shown = [...pan.items.map((i) => i.k), ...pan.tool];
  const tagsOk = pan.items.every((i) => i.tag === settingTag(SETTINGS[i.k].source) && ["Rule", "Stand-in"].includes(i.tag) && i.ref.length > 0 && /\d/.test(i.val));
  const units = pan.items.filter((i) => SETTINGS[i.k].time).every((i) => /^\d+(\.\d)? (s|min)(, \d+(\.\d)? (s|min))*$/.test(i.val));
  check("P14", "Timings and limits: every setting shown once under a plain name (no key names), time values in s / min, a Rule or Stand-in tag from its source, reference on hover / tap",
    named && shown.length === keys.length && new Set(shown).size === keys.length && tagsOk && units && pan.items.find((i) => i.k === "gate").name === "Valid-call minimum" && pan.items.find((i) => i.k === "gate").val === "50 s",
    JSON.stringify(pan.items.filter((i) => !(i.tag === settingTag(SETTINGS[i.k].source))).slice(0, 3)));
  // P15 test numbers and codes, from the mock server's data; tap fills the running app
  const list = await r.p.evaluate(() => [...document.querySelectorAll("#rp-review button[data-fill]")].map((b) => [b.dataset.fill, b.dataset.fillValue, b.textContent]));
  const want = [...Object.keys(SIGN_IN_NUMBERS).map((n) => ["number", n]), ...Object.keys(OTP_CODES).map((c) => ["code", c])];
  const sameData = list.length === want.length && want.every(([f, v]) => list.some((l) => l[0] === f && l[1] === v && l[2].length > v.length + 3));
  await choose(r.p, "signIn", "sent"); await choose(r.p, "otp", "correct");   // back to the default answers (P13 changed them)
  await r.p.evaluate(() => { document.querySelector("details[data-row=entry]").open = true; });
  await r.p.click('#rp-review button[data-fill-value="9000000001"]'); await r.p.waitForTimeout(150);
  const filled = await r.p.evaluate(() => document.getElementById("tm-login-mobile").value.replace(/\D/g, ""));
  await r.p.click(".login-submit"); await r.p.waitForTimeout(value("mockServerDelay", "review") + 400);
  const afterSend = await r.p.evaluate(() => [...document.querySelectorAll(".login-notice")].filter((n) => !n.hidden).map((n) => n.textContent.trim())[0] || null);
  // a code on the OTP screen
  await r.p.evaluate(() => { document.getElementById("tm-login-mobile") && (document.getElementById("tm-login-mobile").value = ""); });
  const r2 = await open("", { w: 1280, h: 800 });
  await r2.p.fill("#tm-login-mobile", "9876543210"); await r2.p.click(".login-submit"); await r2.p.waitForTimeout(value("mockServerDelay", "review") + 400);
  await r2.p.evaluate(() => { document.querySelector("details[data-row=entry]").open = true; });
  await r2.p.click('#rp-review button[data-fill-value="1234"]'); await r2.p.waitForTimeout(150);
  const code = await r2.p.evaluate(() => document.getElementById("c").value);
  check("P15", "Sign-in answers lists every test number and code from app/data/test-numbers.js with its result in words; tapping fills the running sign-in field (9000000001 → Not registered) and the OTP field (1234)",
    sameData && filled === "9000000001" && afterSend === JSON.parse(fs2(path.join(PROJECT, "ui-screens/feedback/messages.json")))["signin.notRegistered"] && code === "1234", JSON.stringify({ n: list.length, filled, afterSend, code }));
  // every listed number on sign-in and every code on OTP fills the field exactly (desktop)
  const every = [];
  for (const [state, field, sel, vals] of [["sign-in_default", "number", "#tm-login-mobile", Object.keys(SIGN_IN_NUMBERS)], ["otp_default", "code", "#c", Object.keys(OTP_CODES)]]) {
    const e = await open(`?s=${state}`, { w: 1440, h: 900 });
    await e.p.evaluate(() => { document.querySelector("details[data-row=entry]").open = true; });
    for (const v of vals) { await e.p.click(`#rp-review button[data-fill="${field}"][data-fill-value="${v}"]`); await e.p.waitForTimeout(60); every.push([v, (await e.p.inputValue(sel)).replace(/\D/g, "") === v]); }
    await e.ctx.close();
  }
  check("P15c", "every test number fills the sign-in field and every test code fills the OTP field (desktop)", every.length === want.length && every.every(([, ok]) => ok), JSON.stringify(every.filter(([, ok]) => !ok)));
  check("P15b", "A0 panel: 0 console errors", r.errors.length === 0 && r2.errors.length === 0, [...r.errors, ...r2.errors].join(" | "));
  await r.ctx.close(); await r2.ctx.close();
  // P16 phone drawer shows the list on sign-in (numbers) and OTP (codes) only
  const d = await open("?s=sign-in_default", { w: 390, h: 844 });
  const vis = async () => d.p.evaluate(() => [...document.querySelectorAll(".rp-tests")].filter((u) => !u.hidden && !u.closest("[hidden]")).map((u) => u.dataset.for));
  const onSign = await vis();
  const jump = (id) => d.p.evaluate((id) => { document.getElementById("rp-jump").value = id; document.getElementById("rp-jump-go").click(); }, id);
  await jump("otp_default"); await d.p.waitForTimeout(300);
  const onOtp = await vis();
  await jump("offer_fingerprint"); await d.p.waitForTimeout(300);
  const onOffer = await vis();
  // through the visible drawer: open it, tap a number on sign-in and a code on OTP
  const tapIn = async (state, field, sel, v) => { const t = await open(`?s=${state}`, { w: 390, h: 844 }); await t.p.click("#drawer-handle"); await t.p.waitForTimeout(300);
    await t.p.locator(`#rp-review button[data-fill="${field}"][data-fill-value="${v}"]`).click(); await t.p.waitForTimeout(100);
    const got = (await t.p.inputValue(sel)).replace(/\D/g, ""); await t.ctx.close(); return got === v; };
  const drawerFill = [];
  for (const v of Object.keys(SIGN_IN_NUMBERS)) drawerFill.push(await tapIn("sign-in_default", "number", "#tm-login-mobile", v));
  for (const v of Object.keys(OTP_CODES)) drawerFill.push(await tapIn("otp_default", "code", "#c", v));
  check("P16b", "phone drawer (390): every test number taps into the sign-in field and every code into the OTP field through the opened drawer", drawerFill.every(Boolean), JSON.stringify(drawerFill));
  check("P16", "phone drawer: the test numbers and codes list on sign-in and on OTP, none on other screens", onSign.join() === "signIn otp,signIn otp" && onOtp.join() === "signIn otp,signIn otp" && onOffer.length === 0, JSON.stringify({ onSign, onOtp, onOffer }));
  await d.ctx.close();
  // P17 the link a phone can open: served from localhost with the Mac's address configured → that host; the Wi-Fi line shows
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } }); const p = await ctx.newPage();
  // the page as scripts/serve.sh sends it: the Mac's network address in a meta tag
  await p.route((u) => new URL(u).pathname === "/", async (rt) => { const res = await rt.fetch(); const body = (await res.text()).replace("</head>", '<meta name="tm-network-origin" content="http://192.168.1.50:8080">\n</head>'); await rt.fulfill({ response: res, body }); });
  await p.goto(BASE + "?s=sign-in_default"); await p.waitForTimeout(500);
  const lan = await p.evaluate(() => ({ link: document.getElementById("rp-link").textContent, wifi: document.getElementById("rp-wifi").textContent }));
  const { default: jsQR } = await import("jsqr"); const { PNG } = await import("pngjs");
  const shot = PNG.sync.read(await (await p.$("#rp-qr")).screenshot());
  const dec = jsQR(new Uint8ClampedArray(shot.data), shot.width, shot.height);
  const host = dec ? new URL(dec.data) : null;
  await ctx.close();
  const plain = await open("?s=sign-in_default", { w: 1280, h: 800 });
  const noLan = await plain.p.evaluate(() => ({ link: document.getElementById("rp-link").textContent, wifi: document.getElementById("rp-wifi").textContent }));
  await plain.ctx.close();
  check("P17", "QR / play link from localhost with a configured address decodes to that network host (not localhost), path and story kept, with the line \"Phone and Mac on the same Wi-Fi\"; without an address it says how to get one",
    host && host.hostname === "192.168.1.50" && host.port === "8080" && decodeStory(host.searchParams.get("play")) && lan.wifi === "Phone and Mac on the same Wi-Fi" && dec.data === lan.link &&
    /localhost/.test(noLan.link) && /serve\.sh/.test(noLan.wifi), JSON.stringify({ lan, decoded: dec && dec.data, noLan }));
  // P19 the real scripts/serve.sh: it writes the Mac's address into the page; from localhost and 127.0.0.1 the link, QR and Copy link
  // all give that address with the serving port; the advertised URL opens the app. Skipped (reported) when the Mac has no network address.
  {
    const { spawn, execSync } = await import("child_process");
    const port = 8790 + Math.floor(Math.random() * 100);
    const sv = spawn("sh", [path.join(PROJECT, "scripts/serve.sh"), String(port)], { stdio: ["ignore", "pipe", "pipe"], detached: true });
    let out = ""; sv.stdout.on("data", (d) => { out += d; });
    for (let i = 0; i < 40 && !/On this Mac/.test(out); i++) await new Promise((r) => setTimeout(r, 250));
    await new Promise((r) => setTimeout(r, 800));
    const lanUrl = (out.match(/On the phone:\s+(\S+)/) || [])[1];
    const res = [];
    if (lanUrl) {
      for (const h of ["localhost", "127.0.0.1"]) {
        const c = await browser.newContext({ viewport: { width: 1280, height: 800 }, permissions: ["clipboard-read", "clipboard-write"] }); const pg = await c.newPage();
        await pg.goto(`http://${h}:${port}/?s=sign-in_default`); await pg.waitForTimeout(500);
        const link = await pg.evaluate(() => document.getElementById("rp-link").textContent);
        const shotQ = PNG.sync.read(await (await pg.$("#rp-qr")).screenshot());
        const dq = jsQR(new Uint8ClampedArray(shotQ.data), shotQ.width, shotQ.height);
        await pg.click("#rp-copy"); await pg.waitForTimeout(150);
        const clip = await pg.evaluate(() => navigator.clipboard.readText().catch(() => ""));
        res.push({ h, link, ok: new URL(link).origin === new URL(lanUrl).origin && dq && dq.data === link && clip === link });
        await c.close();
      }
      const c = await browser.newContext({ viewport: { width: 390, height: 844 } }); const pg = await c.newPage();
      await pg.goto(res[0].link); await pg.waitForTimeout(500);
      res.push({ opened: await pg.evaluate(() => document.body.dataset.mode + ":" + window.__tm.store.get().s), ok: (await pg.evaluate(() => document.body.dataset.mode)) === "play" });
      await c.close();
    }
    try { process.kill(-sv.pid); } catch (e) { sv.kill(); }
    check("P19", "scripts/serve.sh: page carries the Mac's address; from localhost and 127.0.0.1 the link, the decoded QR and Copy link are that address and port; the advertised play link opens the app (play mode)",
      !lanUrl || (res.length === 3 && res.every((x) => x.ok)), lanUrl ? JSON.stringify(res) : "SKIPPED: no network address on this Mac");
  }
  // P18 default story = happy path
  const def = decodeStory("3");
  const { storySteps } = await import(path.join(APP, "review/panel.js"));
  check("P18", "default story = happy path: Cat4, sign-in, patient answers, call over the gate, record over the gate, prescription saves; the default QR steps end on Prescription confirmed → next case",
    def.scenario === "cat4" && def.start === "sign-in" && def.calls.length === 1 && def.calls[0].connected === "over-gate" && def.calls[0].record === "over-gate" &&
    def.calls[0].doctorFailure === "none" && def.calls[0].patientFailure === "none" && def.prescribe === "saved" && encodeShort(defaultStory()) === "3" &&
    decodeStory("3~A0").calls[0].connected === "none" && /Prescription confirmed → next case/.test(storySteps(def).at(-1)), JSON.stringify(def.calls[0]));
}

await browser.close();
srv.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) { console.log("FAILED: " + failed.map((f) => f.id).join(", ")); process.exit(1); }
