// Step 1 journey tests — sign-in and OTP (session 2), faster sign-in offer and returning unlock (session 3). Run: cd tests && node entry-journeys.mjs
// Unit: app/core/auth.js (rules of app-logic §2, test numbers and codes §11). Browser: every ?s= state renders the built screen,
// and the journeys behave (validation, every test number and code, wrong-code count and lock, resend waits and caps,
// expiry on the clock, limits surviving a restart, Change / phone Back, placeholder links, story changes mid-journey).
import { chromium } from "playwright";
import http from "http";
import fs from "fs";
import path from "path";
import url from "url";

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const PROJECT = path.resolve(HERE, "..");
const APP = path.join(PROJECT, "app");
const PORT = 8767;
const BASE = `http://localhost:${PORT}/`;
const results = [];
const check = (id, name, ok, detail = "") => { results.push({ id, ok: !!ok }); console.log(`${ok ? "PASS" : "FAIL"} ${id} ${name}${detail && !ok ? "  [" + detail + "]" : ""}`); };

// ---------------- unit: auth.js ----------------
const auth = await import(path.join(APP, "core/auth.js"));
const { value } = await import(path.join(APP, "core/settings.js"));
function fakeCtx(story = {}, offline = false) {
  let t = Date.UTC(2026, 10, 9, 4, 0);
  const mem = new Map();
  return {
    now: () => t, tick: (ms) => { t += ms; }, value: (k) => value(k, "review"),
    db: { get: (k) => (mem.has(k) ? JSON.parse(mem.get(k)) : null), set: (k, v) => mem.set(k, JSON.stringify(v)) },
    story: { signIn: "sent", otp: "correct", ...story }, offline,
  };
}
const MIN = 60000, SEC = 1000;
check("A1", "cleaning: +91 / 0 / spaces / dashes removed; 10 digits max",
  auth.cleanNumber("+91 98765-43210") === "9876543210" && auth.cleanNumber("098765 43210") === "9876543210" &&
  auth.cleanNumber("98765") === "98765" && auth.cleanNumber("987654321099") === "9876543210" && auth.cleanNumber("abc") === "");
check("A2", "number checks: empty and short only on submit; first digit at once",
  auth.checkNumber("", {}) === null && auth.checkNumber("", { submit: true }) === "signin.empty" && auth.checkNumber("1") === "signin.prefix" &&
  auth.checkNumber("98765") === null && auth.checkNumber("98765", { submit: true }) === "signin.short" && auth.checkNumber("9876543210", { submit: true }) === null);
{
  const c = fakeCtx();
  const o = (n) => auth.requestCode(n, c).outcome;
  check("A3", "test numbers: …01 not registered, …02 inactive, …03 too many, …04 couldn't send, …05 locked, other sent",
    o("9000000001") === "not-registered" && o("9000000002") === "inactive" && o("9000000003") === "too-many-tries" &&
    o("9000000004") === "couldnt-send" && o("9000000005") === "locked" && o("7012345678") === "sent", "");
}
{
  const c = fakeCtx(); const n = "7012345678";
  auth.requestCode(n, c);
  const seq = [1, 2, 3, 4].map(() => { const r = auth.verifyCode(n, "5555", c); return r.key + (r.values?.count ? r.values.count : ""); });
  const fifth = auth.verifyCode(n, "5555", c);
  check("A4", "wrong codes: Wrong code. ×2, then 2 tries left, then 1 try left, 5th locks the number",
    JSON.stringify(seq) === JSON.stringify(["otp.wrong", "otp.wrong", "otp.triesLeft2", "otp.triesLeftOne"]) && fifth.outcome === "locked", JSON.stringify(seq));
  const lockedVerify = auth.verifyCode(n, "1234", c).outcome;
  const lockedSend = auth.requestCode(n, c).outcome;
  c.tick(value("otpLock", "review"));
  const after = auth.verifyCode(n, "1234", c).outcome;
  check("A5", "lock: even 1234 refused while locked; sign-in on the number goes to locked; lock ends on the clock (15 min mock)",
    lockedVerify === "locked" && lockedSend === "locked" && after === "correct");
}
{
  const c = fakeCtx(); const n = "7012345679";
  const r0 = auth.requestCode(n, c);
  const w0 = r0.resendAt - c.now();
  c.tick(w0); const r1 = auth.resendCode(n, c); const w1 = r1.resendAt - c.now();
  c.tick(w1); const r2 = auth.resendCode(n, c); const w2 = r2.resendAt - c.now();
  c.tick(w2); const r3 = auth.resendCode(n, c);
  const r4 = auth.resendCode(n, c);
  const again = auth.requestCode(n, c).outcome;   // restarting sign-in does not reset the window (D-35)
  check("A6", "resend waits 30 / 60 / 120 s; 4 codes per window (4th → used up, 5th refused); restart does not reset",
    w0 === 30 * SEC && w1 === 60 * SEC && w2 === 120 * SEC && r3.outcome === "sent-last" && r4.outcome === "too-many" && again === "too-many-tries",
    `${w0} ${w1} ${w2} ${r3.outcome} ${r4.outcome} ${again}`);
  check("A7", "expired code with codes used up → expired and resend limited", auth.verifyCode(n, "0000", c).outcome === "expired-limited");
  c.tick(value("otpWindow", "review"));
  check("A8", "the window frees on the clock (10 min mock): a new code can be sent", auth.requestCode(n, c).outcome === "sent");
}
{
  const c = fakeCtx(); const n = "7012345680"; auth.requestCode(n, c);
  check("A9", "codes: 0000 expired, 9999 couldn't verify (not counted), 1234 signs in",
    auth.verifyCode(n, "0000", c).outcome === "expired" && auth.verifyCode(n, "9999", c).outcome === "couldnt-verify" && auth.status(n, c).wrong === 0 &&
    auth.verifyCode(n, "1234", c).outcome === "correct");
  const f = fakeCtx({ otp: "two-tries-left" }); auth.requestCode(n, f);
  const tl = auth.verifyCode(n, "1234", f);
  const g = fakeCtx({ signIn: "couldnt-send", otp: "resend-failed" });
  check("A10", "story overrides: two tries left, forced sign-in answer, resend failed; offline answers offline",
    tl.key === "otp.triesLeft" && tl.values.count === 2 && auth.requestCode("7012345681", g).outcome === "couldnt-send" &&
    auth.resendCode("7012345681", g).outcome === "failed" && auth.requestCode("7012345682", fakeCtx({}, true)).outcome === "offline");
}

{
  const c = fakeCtx(); const n = "7012345683";
  auth.requestCode(n, c);
  const early = auth.resendCode(n, c);
  const exp = auth.verifyCode(n, "0000", c);
  c.tick(30 * SEC); const ok = auth.resendCode(n, c);
  c.tick(60 * SEC); auth.resendCode(n, c); c.tick(120 * SEC); const last = auth.resendCode(n, c);
  check("A11", "the server enforces the resend wait (also after an expired code); the last code returns the window end",
    early.outcome === "cooldown" && early.resendAt === c.now() - 210 * SEC + 30 * SEC && exp.outcome === "expired" && exp.resendAt > c.now() - 210 * SEC &&
    ok.outcome === "sent" && last.outcome === "sent-last" && last.until > c.now(), JSON.stringify({ early, exp, ok, last }));
}

{ // A12 (codex session 5): sending again from sign-in obeys the running resend wait (no new code, same wait); the window's last
  // code sent from sign-in says so (last + window end)
  const c = fakeCtx(); const n = "7012345684";
  const first = auth.requestCode(n, c);
  c.tick(10 * SEC); const again = auth.requestCode(n, c); const left = auth.status(n, c).codesLeft;
  c.tick(20 * SEC); auth.resendCode(n, c); c.tick(60 * SEC); auth.resendCode(n, c); c.tick(120 * SEC);
  const lastViaSignIn = auth.requestCode(n, c);
  check("A12", "sign-in during the resend wait: no new code, OTP on the running wait (codes left unchanged); the 4th code sent from sign-in returns last + window end",
    first.outcome === "sent" && !first.last && again.outcome === "sent" && again.reused && again.resendAt === first.resendAt && left === 3 &&
    lastViaSignIn.outcome === "sent" && lastViaSignIn.last === true && lastViaSignIn.until > c.now(), JSON.stringify({ first, again, left, lastViaSignIn }));
}

// ---------------- browser ----------------
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2", ".ttf": "font/ttf" };
const srv = http.createServer((req, res) => {
  const p = path.join(APP, decodeURIComponent(new URL(req.url, BASE).pathname).replace(/\/$/, "/index.html"));
  if (!p.startsWith(APP) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => srv.listen(PORT, r));
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
const ANSWER = value("mockServerDelay", "review") + 300;
async function open(qs = "", { w = 390, h = 844 } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  p.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });
  await p.goto(BASE + qs); await p.waitForTimeout(300);
  return { p, ctx, errors };
}
const text = (p, sel) => p.evaluate((s) => document.querySelector(s)?.textContent.replace(/\u00a0/g, " ").trim() ?? null, sel);
const visible = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden"; }, sel);
const ff = (p, ms) => p.evaluate((x) => window.__tm.clock.fastForward(x), ms);
const setStory = (p, patch) => p.evaluate((x) => { const s = { ...window.__tm.store.get().story, ...x }; window.__tm.store.set({ story: s, offline: s.offline }); }, patch);
// Panel rows fold (Part A item 2): open the row that holds a control before using it, as a reviewer would.
async function choose(p, field, v) {
  await p.evaluate((f) => { const el = document.getElementById("rp-" + f); const d = el && el.closest("details"); if (d) d.open = true; }, field);
  await p.selectOption("#rp-" + field, v);
}
async function typeNumber(p, n) { await p.fill("#tm-login-mobile", ""); await p.type("#tm-login-mobile", n); }
async function send(p, n) { await typeNumber(p, n); await p.click(".login-submit"); await p.waitForTimeout(ANSWER); }
async function enterCode(p, code) { await p.focus("#c"); for (const d of code) await p.keyboard.press(d); }
async function verify(p, code) { if (code !== null) await enterCode(p, code); await p.click("#b"); await p.waitForTimeout(ANSWER); }
const helper = (p) => text(p, "#h");
const notice = (p) => text(p, "#n.show #nt");
const signInNotice = (p) => p.evaluate(() => [...document.querySelectorAll(".login-notice")].filter((n) => !n.hidden).map((n) => n.textContent.trim())[0] || null);

{ // B1: every sign-in / OTP state opened by ?s= renders the built screen, from the registry, with no inline styles
  const ids = (await (await open("")).p.evaluate(() => window.TM_STATE_MAP.pictures.map((r) => r.id).filter((i) => /^(sign-in|otp)_/.test(i))));
  let bad = [];
  for (const id of ids) {
    const r = await open(`?capture=1&s=${id}`);
    const info = await r.p.evaluate(() => ({
      built: !!document.querySelector("#screen .signin-screen, #screen .otp-screen"), img: !!document.querySelector("#screen img.shell-picture, #screen figure"),
      inline: document.querySelectorAll("#screen [style]").length, missing: document.getElementById("screen").textContent.includes("[missing:"),
    }));
    if (!info.built || info.img || info.inline || info.missing || r.errors.length) bad.push(`${id} ${JSON.stringify(info)} ${r.errors.join("|")}`);
    await r.ctx.close();
  }
  check("B1", `all ${ids.length} sign-in / OTP states render the built screen (registry copy, no inline styles, 0 console errors)`, ids.length === 29 && !bad.length, bad.join(" ; "));
}

{ // B2: sign-in validation (app-logic §2)
  const r = await open("");
  const p = r.p;
  const onSignIn = await visible(p, ".signin-screen");
  await p.click(".login-submit"); const empty = await helper(p).catch(() => null) ?? await text(p, "#tm-login-helper");
  await typeNumber(p, "1"); const prefix = await text(p, "#tm-login-helper");
  await typeNumber(p, "98765"); const okWhileTyping = await text(p, "#tm-login-helper");
  await p.click(".login-submit"); const short = await text(p, "#tm-login-helper");
  await p.type("#tm-login-mobile", "4"); const recheck = await text(p, "#tm-login-helper");
  await p.type("#tm-login-mobile", "3210"); const cleared = await text(p, "#tm-login-helper");
  const errCls = await p.evaluate(() => document.querySelector(".signin-screen").classList.contains("has-error"));
  await p.fill("#tm-login-mobile", ""); await p.evaluate(() => { const i = document.getElementById("tm-login-mobile"); i.value = "+91 98765-43210"; i.dispatchEvent(new Event("input", { bubbles: true })); });
  const pasted = await p.inputValue("#tm-login-mobile");
  check("B2", "sign-in checks: empty on Send, first digit at once, too short on Send, re-checks while typing, clears when valid, paste cleaned",
    onSignIn && empty === "Enter your mobile number." && prefix === "Mobile numbers start with 6, 7, 8 or 9." && okWhileTyping === "We’ll send you a verification code by SMS." &&
    short === "Enter all 10 digits." && recheck === "Enter all 10 digits." && cleared === "We’ll send you a verification code by SMS." && !errCls && pasted === "9876543210",
    JSON.stringify({ empty, prefix, okWhileTyping, short, recheck, cleared, pasted }));
  check("B2b", "sign-in: 0 console errors", r.errors.length === 0, r.errors.join("|"));
  await r.ctx.close();
}

{ // B3: every test number
  const r = await open(""); const p = r.p;
  await send(p, "9000000001"); const nr = await signInNotice(p);
  await send(p, "9000000004"); const cs = await signInNotice(p);
  await send(p, "9000000003"); const tm = await signInNotice(p); const btn = await text(p, ".login-submit-label"); const dis = await p.isDisabled(".login-submit");
  await ff(p, value("tooManyTriesWait", "review")); await p.waitForTimeout(400); const after = await text(p, ".login-submit-label");
  await send(p, "9000000002"); const ia = await signInNotice(p); const iaBtn = await text(p, ".login-submit-label");
  await p.click(".login-submit"); await p.waitForTimeout(200); const ph = await text(p, ".placeholder-page__text");
  await p.goBack(); await p.waitForTimeout(300); const backNum = await p.inputValue("#tm-login-mobile").catch(() => null);
  await setStory(p, { offline: "yes" }); await send(p, "7012345678"); const off = await signInNotice(p); await setStory(p, { offline: "no" });
  check("B3", "test numbers: not registered, couldn't send, too many (countdown, ends on the clock), inactive → Call Doctor Ops placeholder, offline",
    nr?.startsWith("Number not registered") && cs === "Couldn’t send the code." && tm === "Too many attempts on this number." && /^Try again in 10:00$/.test(btn) && dis &&
    after === "Send OTP" && ia === "This account is inactive." && iaBtn === "Call Doctor Ops" && ph === "This would call Doctor Ops" && backNum === "9000000002" &&
    off === "You’re offline. Check your connection.", JSON.stringify({ nr, cs, tm, btn, after, ia, iaBtn, ph, backNum, off }));
  await send(p, "9000000005");
  const locked = await p.evaluate(() => ({ otp: !!document.querySelector(".otp-screen"), disabled: document.getElementById("b").disabled, field: document.getElementById("c").disabled, note: document.getElementById("nt").textContent.replace(/\u00a0/g, " "), change: !!document.querySelector("a.lk") }));
  check("B3b", "9000000005: straight to OTP locked (field and Verify off, lock time, call Doctor Ops, Change kept)",
    locked.otp && locked.disabled && locked.field && /^Too many wrong tries\. Try again in 1[45]:\d\d, or call Doctor Ops\.$/.test(locked.note) && locked.change, JSON.stringify(locked));
  check("B3c", "test numbers: 0 console errors", r.errors.length === 0, r.errors.join("|"));
  await r.ctx.close();
}

{ // B4: OTP — arrival, recipient, empty / short, wrong count, replace on first keystroke, lock, lock survives a restart, expiry
  const r = await open(""); const p = r.p;
  await send(p, "7012345678");
  const arrival = await p.evaluate(() => ({ focused: document.activeElement?.id === "c", current: document.querySelectorAll(".tm-otp-slots__slot")[0].classList.contains("is-current"),
    number: document.querySelector(".head b").textContent, weight: getComputedStyle(document.querySelector(".head b")).fontWeight, rs: document.getElementById("rs").textContent }));
  check("B4", "OTP arrival: field focused, first box current (blue), recipient = typed number, Resend in 0:30",
    arrival.focused && arrival.current && arrival.number === "+91 70123 45678" && arrival.rs === "Didn’t receive it? Resend in 0:30", JSON.stringify(arrival));
  await p.click("#b"); const empty = await helper(p);
  await enterCode(p, "12"); await p.click("#b"); const short = await helper(p);
  await p.fill("#c", "");
  const seq = [];
  await verify(p, "5555"); seq.push(await helper(p));
  await p.focus("#c"); await p.keyboard.press("6");
  const replaced = await p.evaluate(() => ({ code: document.getElementById("c").value, err: document.getElementById("f").classList.contains("tm-field--error") }));
  for (let i = 0; i < 3; i++) { await p.keyboard.press("6"); }
  await p.click("#b"); await p.waitForTimeout(ANSWER); seq.push(await helper(p));
  await verify(p, "5557"); seq.push(await helper(p));
  await verify(p, "5558"); seq.push(await helper(p));
  check("B4b", "OTP: empty and short checks; wrong-code count (Wrong code. ×2, 2 tries left, 1 try left); first keystroke replaces the code and clears the error",
    empty === "Enter the 4-digit code." && short === "Enter all 4 digits." && replaced.code === "6" && !replaced.err &&
    JSON.stringify(seq) === JSON.stringify(["Wrong code.", "Wrong code.", "Wrong code. 2 tries left.", "Wrong code. 1 try left."]), JSON.stringify({ empty, short, replaced, seq }));
  await verify(p, "5559");
  const lockedNote = await notice(p);
  const lockState = await p.evaluate(() => ({ dis: document.getElementById("b").disabled, rsHidden: document.getElementById("rs").hidden, kb: document.querySelector(".mock-kbd").hidden }));
  // restart the story: the lock stays (same session); sign in again on the same number → locked
  await ff(p, 5 * 60 * 1000); await p.waitForTimeout(400);
  await p.evaluate(() => document.getElementById("rp-restart").click()); await p.waitForTimeout(300);
  await send(p, "7012345678");
  const stillLocked = await p.evaluate(() => !!document.querySelector(".otp-screen") && document.getElementById("b").disabled &&
    /Try again in\u00a0(10:00|9:5\d)/.test(document.getElementById("nt").textContent));   // 5 min of 15 used before the restart
  await ff(p, value("otpLock", "review") - 5 * 60 * 1000); await p.waitForTimeout(500);
  const unlocked = await p.evaluate(() => ({ dis: document.getElementById("c").disabled, rs: document.getElementById("rs").textContent }));
  check("B4c", "5th wrong code locks the number (notice with time, Verify off, keyboard closed, resend hidden); lock survives a story restart with its remaining time; ends on the clock",
    /^Too many wrong tries\. Try again in 1[45]:\d\d, or call Doctor Ops\.$/.test(lockedNote) && lockState.dis && lockState.rsHidden && lockState.kb && stillLocked && !unlocked.dis && /Resend code/.test(unlocked.rs),
    JSON.stringify({ lockedNote, lockState, stillLocked, unlocked }));
  await verify(p, "1234");
  const signedIn = await p.evaluate(() => ({ s: window.__tm.store.get().s, auth: localStorage.getItem("tm-doctor-app:review:auth") }));
  await p.goBack(); await p.waitForTimeout(300);
  const afterBack = await p.evaluate(() => !!document.querySelector(".otp-screen"));
  check("B4d", "1234 signs in (session remembered) → faster sign-in offer; phone Back never returns to OTP",
    signedIn.s === "offer_fingerprint" && !!signedIn.auth && !afterBack, JSON.stringify({ signedIn, afterBack }));
  check("B4e", "OTP journey: 0 console errors", r.errors.length === 0, r.errors.join("|"));
  await r.ctx.close();
}

{ // B5: expired, couldn't verify, resend waits / new code / cap, resend failed, offline, story change mid-journey
  const r = await open(""); const p = r.p;
  await send(p, "7012345690");
  await verify(p, "0000");
  const expWait = await text(p, "#rs");
  await ff(p, 30 * 1000); await p.waitForTimeout(400);
  const exp = await p.evaluate(() => ({ h: document.getElementById("h").textContent, dis: document.getElementById("b").disabled, rs: document.getElementById("rs").textContent, consent: document.getElementById("consent").className }));
  await p.focus("#c"); await p.keyboard.press("9"); await p.keyboard.press("9"); await p.keyboard.press("9"); await p.keyboard.press("9");
  await verify(p, null); const cv = await notice(p);
  check("B5", "0000 expired (Verify off, terms keep their height); Resend obeys the running wait, then shows; 9999 couldn't check the code",
    /^Didn’t receive it\? Resend in 0:\d\d$/.test(expWait) && exp.h === "This code has expired." && exp.dis && /Resend code/.test(exp.rs) && /reserve/.test(exp.consent) && cv === "Couldn’t check the code.", JSON.stringify({ expWait, exp, cv }));
  // resend: countdown ticks, then Resend code → New code sent, 1:00 → 2:00 → 4th code used up
  await p.click("#rs button"); await p.waitForTimeout(ANSWER);
  const n1 = await p.evaluate(() => ({ s1: document.getElementById("s1").textContent, icon: !!document.querySelector("#s1 .tm-icon"), rs: document.getElementById("rs").textContent }));
  await ff(p, 20 * 1000); await p.waitForTimeout(400); const ticking = await text(p, "#rs .timer");
  await ff(p, 40 * 1000); await p.waitForTimeout(400);
  await p.click("#rs button"); await p.waitForTimeout(ANSWER); const n2 = await text(p, "#rs .timer");
  await ff(p, 120 * 1000); await p.waitForTimeout(400);
  await p.click("#rs button"); await p.waitForTimeout(ANSWER);
  const capped = await p.evaluate(() => ({ note: document.getElementById("nt").textContent.replace(/\u00a0/g, " "), rsHidden: document.getElementById("rs").hidden, link: !!document.querySelector("#nt a") }));
  await ff(p, value("otpWindow", "review")); await p.waitForTimeout(500);
  const windowBack = await p.evaluate(() => ({ rs: document.getElementById("rs").hidden ? null : document.getElementById("rs").textContent, note: document.getElementById("n").classList.contains("show") }));
  check("B5e", "after the last code, the cap ends with the window on the clock: notice gone, Resend code back", windowBack.rs === "Didn’t receive it? Resend code" && !windowBack.note, JSON.stringify(windowBack));
  await p.click("#rs button"); await p.waitForTimeout(ANSWER);
  // overlap: Verify is ignored while a resend is in flight
  await ff(p, 30 * 1000); await p.waitForTimeout(400);
  await enterCode(p, "5551"); await p.click("#rs button"); await p.evaluate(() => document.getElementById("b").click()); await p.waitForTimeout(ANSWER);
  const overlap = await p.evaluate(() => ({ h: document.getElementById("h").hidden, ht: document.getElementById("h").textContent, s1: document.getElementById("s1").textContent }));
  check("B5f", "one server action at a time: Verify during a resend is ignored (no wrong try counted)", overlap.h && overlap.s1 === "New code sent", JSON.stringify(overlap));
  await p.evaluate(() => window.__tm.store.get());
  await p.click("a.lk"); await p.waitForTimeout(300); await send(p, "7012345693");
  await ff(p, 30 * 1000); await p.waitForTimeout(400);
  await p.click("#rs button"); await p.waitForTimeout(ANSWER); await ff(p, 60 * 1000); await p.waitForTimeout(400);
  await p.click("#rs button"); await p.waitForTimeout(ANSWER); await ff(p, 120 * 1000); await p.waitForTimeout(400);
  await p.click("#rs button"); await p.waitForTimeout(ANSWER);
  await p.click("#nt a"); await p.waitForTimeout(200); const opsPage = await text(p, ".placeholder-page__text");
  await p.goBack(); await p.waitForTimeout(300);
  const restored = await p.evaluate(() => ({ note: document.getElementById("n").classList.contains("show"), rsHidden: document.getElementById("rs").hidden }));
  await enterCode(p, "12");
  await p.click("#consent a"); await p.waitForTimeout(200); await p.goBack(); await p.waitForTimeout(300);
  const digits = await p.inputValue("#c");
  check("B5g", "Back from a placeholder restores OTP as it was (cap notice, resend hidden, typed digits)", restored.note && restored.rsHidden && digits === "12", JSON.stringify({ restored, digits }));
  // a late server answer never acts on a screen the doctor has left
  await p.fill("#c", ""); await enterCode(p, "1234"); await p.click("#b");
  await p.evaluate(() => document.querySelector("#consent a").click()); await p.waitForTimeout(ANSWER + 300);
  const stayed = await text(p, ".placeholder-page__text");
  check("B5h", "Verify answer arriving after leaving for a placeholder does not navigate (screen life ends on every transition)", stayed === "Link pending", String(stayed));
  await p.goBack(); await p.waitForTimeout(300);
  check("B5b", "resend: green \"New code sent\" with no icon; countdown ticks; waits 60 s then 120 s; 4th code → too many codes (resend hidden, Doctor Ops link → placeholder)",
    n1.s1 === "New code sent" && !n1.icon && /Resend in 1:00/.test(n1.rs) && ticking === "0:40" && n2 === "2:00" &&
    capped.note === "You’ve asked for too many codes. Use the last one, or call Doctor Ops." && capped.rsHidden && capped.link && opsPage === "This would call Doctor Ops",
    JSON.stringify({ n1, ticking, n2, capped, opsPage }));
  // second journey: resend failed and offline from the panel story, applied to the running journey
  await p.click("a.lk"); await p.waitForTimeout(300);
  await send(p, "7012345691");
  await ff(p, 30 * 1000); await p.waitForTimeout(400);
  await setStory(p, { otp: "resend-failed" });
  await p.click("#rs button"); await p.waitForTimeout(ANSWER); const rf = await notice(p);
  await setStory(p, { otp: "couldnt-verify" }); await verify(p, "1234"); const forced = await notice(p);
  await setStory(p, { otp: "correct", offline: "yes" }); await verify(p, null); const off = await notice(p);
  await setStory(p, { offline: "no" });
  check("B5c", "story changes apply to the running journey: resend failed, couldn't verify (even for 1234), offline",
    rf === "Couldn’t send a new code." && forced === "Couldn’t check the code." && off === "You’re offline. Check your connection.", JSON.stringify({ rf, forced, off }));
  check("B5d", "OTP states: 0 console errors", r.errors.length === 0, r.errors.join("|"));
  await r.ctx.close();
}

{ // B6: Change and phone Back keep the typed number; links
  const r = await open(""); const p = r.p;
  const signup = await p.evaluate(() => { const a = document.querySelector(".login-signup-label"); return { href: a.href, target: a.target }; });
  await send(p, "7012345692");
  await p.click("a.lk"); await p.waitForTimeout(300);
  const change = await p.evaluate(() => ({ signIn: !!document.querySelector(".signin-screen"), n: document.getElementById("tm-login-mobile").value }));
  await p.focus("#tm-login-mobile"); await p.keyboard.press("8");
  const replacedNum = await p.inputValue("#tm-login-mobile");
  await p.fill("#tm-login-mobile", "7012345692");
  await p.click(".login-submit"); await p.waitForTimeout(ANSWER);
  await p.goBack(); await p.waitForTimeout(300);
  const back = await p.evaluate(() => ({ signIn: !!document.querySelector(".signin-screen"), n: document.getElementById("tm-login-mobile")?.value }));
  await p.goBack(); await p.waitForTimeout(300);
  const root = await p.evaluate(() => !!document.querySelector(".signin-screen"));
  await p.click(".login-submit"); await p.waitForTimeout(ANSWER);
  await p.click("#consent a"); await p.waitForTimeout(200); const terms = await text(p, ".placeholder-page__text");
  check("B6", "Sign up opens the onboarding page in a new tab; Change and phone Back on OTP return to sign-in with the number kept (first digit typed replaces it); Back at sign-in stays in the app; Terms → Link pending",
    signup.href === "https://pwa-doctor.truemeds.in/onboarding" && signup.target === "_blank" && change.signIn && change.n === "7012345692" && replacedNum === "8" && back.signIn && back.n === "7012345692" && root && terms === "Link pending",
    JSON.stringify({ signup, change, replacedNum, back, root, terms }));
  check("B6b", "navigation: 0 console errors", r.errors.length === 0, r.errors.join("|"));
  await r.ctx.close();
}

{ // B6c (codex session 5): Send OTP → Change → Send OTP again during the wait → OTP keeps counting down (no new code);
  // after the waits, the 4th code sent from sign-in opens OTP with codes used up (Resend hidden, too-many notice)
  const r = await open(""); const p = r.p; const n = "7012345693";
  await send(p, n);
  await ff(p, 10 * 1000);
  await p.click("a.lk"); await p.waitForTimeout(300); await p.click(".login-submit"); await p.waitForTimeout(ANSWER);
  const rs1 = await text(p, "#rs");
  const t = (x) => { const m = /(\d+):(\d\d)$/.exec(x || ""); return m ? Number(m[1]) * 60 + Number(m[2]) : null; };
  for (const w of [30, 60, 120]) {   // remaining wait, then a resend from sign-in after it (each is a real new code)
    await ff(p, w * 1000); await p.waitForTimeout(300);
    await p.click("a.lk"); await p.waitForTimeout(300); await p.click(".login-submit"); await p.waitForTimeout(ANSWER);
  }
  const lastState = await p.evaluate(() => ({ s: window.__tm.store.get().s, rsHidden: document.getElementById("rs").hidden, note: document.getElementById("nt").textContent.replace(/\u00a0/g, " ") }));
  check("B6c", "Change → Send OTP during the resend wait sends no new code (Resend in keeps counting, under 0:30); the window's last code sent from sign-in → Resend hidden, too-many-codes notice",
    t(rs1) !== null && t(rs1) <= 21 && lastState.s === "otp_default" && lastState.rsHidden && /call Doctor Ops/.test(lastState.note) && r.errors.length === 0,
    JSON.stringify({ rs1, lastState, e: r.errors }));
  await r.ctx.close();
}

{ // B7: drawn keyboard: review and capture only; demo uses the phone's keyboard; keys type into the field
  const r = await open("?s=otp_default"); const p = r.p;
  await p.dispatchEvent(".mock-kbd__key:nth-child(1)", "pointerdown"); await p.dispatchEvent(".mock-kbd__key:nth-child(2)", "pointerdown");
  const typed = await p.inputValue("#c");
  const d = await open("?demo=1");
  const demoKbd = await d.p.evaluate(() => document.querySelectorAll(".mock-kbd").length);
  const demoSignIn = await d.p.evaluate(() => !!document.querySelector(".signin-screen"));
  check("B7", "drawn keyboard types in review; demo starts on sign-in with no drawn keyboard [MOCK ASSUMPTION]", typed === "12" && demoKbd === 0 && demoSignIn, `${typed} ${demoKbd} ${demoSignIn}`);
  await r.ctx.close(); await d.ctx.close();
}

{ // B8: frame — the screens fill the app frame at 360, 390, 430 and the desktop frame (no nested phone, no page scroll)
  const bad = [];
  for (const [w, h] of [[360, 780], [390, 844], [430, 932], [1280, 800]]) for (const s of ["sign-in_default", "otp_default"]) {
    const r = await open(`?s=${s}`, { w, h });
    const g = await r.p.evaluate(() => { const fe = document.getElementById("frame"); const f = fe.getBoundingClientRect(); const sc = document.querySelector(".signin-screen, .otp-screen").getBoundingClientRect();
      return { fw: fe.clientWidth, sw: sc.width, dx: Math.abs(f.left + fe.clientLeft - sc.left), pageScroll: document.documentElement.scrollWidth > innerWidth }; }); // inside the frame border
    if (Math.abs(g.fw - g.sw) > 1 || g.dx > 1 || g.pageScroll) bad.push(`${s}@${w} ${JSON.stringify(g)}`);
    await r.ctx.close();
  }
  check("B8", "frame: sign-in and OTP fill the frame at 360 / 390 / 430 / desktop; no horizontal page scroll", !bad.length, bad.join(" ; "));
}

// ---------------- session 3: faster sign-in offer and returning unlock ----------------
{ // F1 unit: core/faster-signin.js (offered once, enabled, device, app open)
  const fs = await import(path.join(APP, "core/faster-signin.js"));
  const mk = (story = {}) => { const c = fakeCtx(story); c.mode = "review"; return c; };
  const c = mk({ device: "fingerprint" }); const n = "7012345601";
  const first = fs.afterSignIn(n, c); fs.markOffered(n, c); const second = fs.afterSignIn(n, c);
  const open0 = fs.onOpen(c); c.db.set("auth", { number: n }); const open1 = fs.onOpen(c);
  fs.setEnabled(n, c, true); const open2 = fs.onOpen(c);
  const dev = (d) => fs.afterSignIn("7012345602", mk({ device: d }));
  const un = fs.unlockState(mk({ device: "fingerprint", unlock: "unavailable" }));
  check("F1", "offer once per number (then Home); device picks fingerprint / Face ID / screen lock, none skips; app open: nobody → sign-in, signed in → Home, faster sign-in on → unlock",
    first === "offer_fingerprint" && second === "home_setup-wheel" && open0 === null && open1 === "home_setup-wheel" && open2 === "unlock_fingerprint" &&
    dev("face") === "offer_face-id" && dev("screen-lock") === "offer_screen-lock" && dev("none") === "home_setup-wheel" && un === "unlock_unavailable" &&
    fs.unlockState(mk({ device: "screen-lock" })) === "unlock_screen-lock" && fs.unlockState(mk({ device: "face" })) === "unlock_face",
    JSON.stringify({ first, second, open0, open1, open2 }));
}
const sNow = (p) => p.evaluate(() => window.__tm.store.get().s);
const PROMPT = value("phonePromptDelay", "review") + 300;
async function signInFull(p, n) { await send(p, n); await verify(p, "1234"); }

{ // F2: every offer / unlock state opened by ?s= renders the built screen, from the registry, no inline styles, 0 errors
  const ids = (await (await open("")).p.evaluate(() => window.TM_STATE_MAP.pictures.map((r) => r.id).filter((i) => /^(offer|unlock)_/.test(i))));
  const bad = [];
  for (const id of ids) {
    const r = await open(`?capture=1&s=${id}`);
    const info = await r.p.evaluate(() => ({
      built: !!document.querySelector("#screen .offer-screen, #screen .unlock-screen"), img: !!document.querySelector("#screen figure"),
      inline: document.querySelectorAll("#screen [style]").length, missing: document.getElementById("screen").textContent.includes("[missing:"),
    }));
    if (!info.built || info.img || info.inline || info.missing || r.errors.length) bad.push(`${id} ${JSON.stringify(info)} ${r.errors.join("|")}`);
    await r.ctx.close();
  }
  check("F2", `all ${ids.length} offer / unlock states render the built screen (registry copy, no inline styles, 0 console errors)`, ids.length === 14 && !bad.length, bad.join(" ; "));
}

{ // F3: full chain sign-in → OTP → offer → Turn on → Home; Back never returns; app restart → unlock (Dr. Kunal) → Home
  const r = await open(""); const p = r.p;
  await signInFull(p, "7012345610");
  const offer = await p.evaluate(() => ({ s: window.__tm.store.get().s, title: document.querySelector(".offer-screen h1")?.textContent, btn: document.getElementById("turn-on")?.textContent, back: !!document.querySelector(".offer-screen .back") }));
  await p.click("#turn-on"); await p.waitForTimeout(100);
  const busy = await p.evaluate(() => ({ t: document.getElementById("turn-on").textContent, spin: !!document.querySelector("#turn-on .tm-spinner"), nn: document.getElementById("not-now").disabled }));
  await p.waitForTimeout(PROMPT);
  const home = await sNow(p);
  const stored = await p.evaluate(() => JSON.parse(localStorage.getItem("tm-doctor-app:review:faster:7012345610")));
  await p.goBack(); await p.waitForTimeout(300); const afterBack = await sNow(p);
  check("F3", "sign-in → OTP 1234 → offer (fingerprint, no Back) → Turn on: Turning on… with spinner, Not now off → Home; enabled remembered; phone Back stays on Home",
    offer.s === "offer_fingerprint" && offer.title === "Skip the OTP next time" && offer.btn === "Turn on faster sign-in" && !offer.back &&
    busy.t === "Turning on…" && busy.spin && busy.nn && home === "home_setup-wheel" && stored?.enabled === true && stored?.offered === true && afterBack === "home_setup-wheel",
    JSON.stringify({ offer, busy, home, stored, afterBack }));
  await p.reload(); await p.waitForTimeout(400);
  const unlock = await p.evaluate(() => ({ s: window.__tm.store.get().s, h1: document.querySelector(".unlock-screen h1")?.textContent, btn: document.getElementById("unlock-label")?.textContent }));
  await p.click("#unlock-action"); await p.waitForTimeout(100);
  const ub = await p.evaluate(() => ({ t: document.getElementById("unlock-action").textContent, spin: !!document.querySelector("#unlock-action .tm-spinner") }));
  await p.waitForTimeout(PROMPT); const home2 = await sNow(p);
  check("F3b", "app restart with faster sign-in on → returning unlock \"Hello, Dr. Kunal\" (name from mock profile data) → Unlocking… → Home",
    unlock.s === "unlock_fingerprint" && unlock.h1 === "Hello, Dr. Kunal" && unlock.btn === "Unlock with fingerprint" && ub.t === "Unlocking…" && ub.spin && home2 === "home_setup-wheel",
    JSON.stringify({ unlock, ub, home2 }));
  check("F3c", "chain: 0 console errors", r.errors.length === 0, r.errors.join("|"));
  await r.ctx.close();
}

{ // F4: offered once; Not now → Home; phone Back on the offer = Not now; restart → sign-in again → no offer
  const r = await open(""); const p = r.p;
  await signInFull(p, "7012345611");
  const shown = await sNow(p);
  await p.click("#not-now"); await p.waitForTimeout(200); const nn = await sNow(p);
  await p.evaluate(() => document.getElementById("rp-restart").click()); await p.waitForTimeout(300);
  await signInFull(p, "7012345611"); const again = await sNow(p);
  await p.reload(); await p.waitForTimeout(400); const reopened = await sNow(p);   // signed in, faster sign-in off → Home
  check("F4", "offer shown once: Not now → Home; signing in again (story restarted) skips the offer; reopening the app (faster sign-in off) → Home",
    shown === "offer_fingerprint" && nn === "home_setup-wheel" && again === "home_setup-wheel" && reopened === "home_setup-wheel", JSON.stringify({ shown, nn, again, reopened }));
  const r2 = await open(""); const p2 = r2.p;
  await signInFull(p2, "7012345612");
  await p2.goBack(); await p2.waitForTimeout(300); const viaBack = await sNow(p2);
  const st = await p2.evaluate(() => JSON.parse(localStorage.getItem("tm-doctor-app:review:faster:7012345612")));
  check("F4b", "phone Back on the offer = Not now (→ Home, offered, not enabled)", viaBack === "home_setup-wheel" && st.offered && !st.enabled, JSON.stringify({ viaBack, st }));
  check("F4c", "offer once / Back: 0 console errors", r.errors.length + r2.errors.length === 0, [...r.errors, ...r2.errors].join("|"));
  await r.ctx.close(); await r2.ctx.close();
}

{ // F5: failed → notice in the bar + Try again; Try again re-runs the prompt; cancelled → as it was; offline; unavailable → offer_unavailable (D-93, bar notice; F5d)
  const r = await open(""); const p = r.p;
  await setStory(p, { offer: "enable-failed" });
  await signInFull(p, "7012345613");
  await p.click("#turn-on"); await p.waitForTimeout(PROMPT);
  const failed = await p.evaluate(() => ({ s: window.__tm.store.get().s, n: document.querySelector("#offer-notice:not([hidden])")?.textContent, inBar: !!document.querySelector(".tm-actionbar > #offer-notice:not([hidden])"), err: document.getElementById("offer-notice").classList.contains("tm-notice--error"), btn: document.getElementById("turn-on").textContent }));
  await setStory(p, { offer: "cancelled" });
  await p.click("#turn-on"); await p.waitForTimeout(100);
  const retryBusy = await p.evaluate(() => ({ t: document.getElementById("turn-on").textContent, notice: !document.getElementById("offer-notice").hidden }));
  await p.waitForTimeout(PROMPT);
  const cancelled = await p.evaluate(() => ({ s: window.__tm.store.get().s, n: document.querySelector("#offer-notice:not([hidden])")?.textContent ?? null, btn: document.getElementById("turn-on").textContent, nn: document.getElementById("not-now").disabled }));
  await setStory(p, { offline: "yes", offer: "enabled" });
  await p.click("#turn-on"); await p.waitForTimeout(100);
  const off = await p.evaluate(() => ({ n: document.querySelector("#offer-notice:not([hidden])")?.textContent, warn: document.getElementById("offer-notice").classList.contains("tm-notice--warning"), busy: document.getElementById("turn-on").disabled }));
  await setStory(p, { offline: "no" });
  await p.click("#turn-on"); await p.waitForTimeout(PROMPT); const done = await sNow(p);
  check("F5", "failed: \"Couldn't turn on faster sign-in.\" in the bar (error) above Try again; Try again re-runs the prompt (Turning on…, notice cleared); cancelled → back as it was, no new message; offline notice (warning, no prompt); then Turn on → Home",
    failed.s === "offer_fingerprint" && failed.n === "Couldn’t turn on faster sign-in." && failed.inBar && failed.err && failed.btn === "Try again" &&
    retryBusy.t === "Turning on…" && !retryBusy.notice && cancelled.s === "offer_fingerprint" && cancelled.btn === "Try again" && cancelled.n === "Couldn’t turn on faster sign-in." && !cancelled.nn &&
    off.n === "You’re offline. Check your connection." && off.warn && !off.busy && done === "home_setup-wheel",
    JSON.stringify({ failed, retryBusy, cancelled, off, done }));
  // a first-time cancel: plain offer, no message
  const r2 = await open(""); const p2 = r2.p;
  await setStory(p2, { offer: "cancelled" }); await signInFull(p2, "7012345614");
  await p2.click("#turn-on"); await p2.waitForTimeout(PROMPT);
  const c1 = await p2.evaluate(() => ({ s: window.__tm.store.get().s, notice: !document.getElementById("offer-notice").hidden, btn: document.getElementById("turn-on").textContent }));
  check("F5b", "cancelled prompt → back to the offer, no message (offer.cancelled)", c1.s === "offer_fingerprint" && !c1.notice && c1.btn === "Turn on faster sign-in", JSON.stringify(c1));
  check("F5c", "offer outcomes: 0 console errors", r.errors.length + r2.errors.length === 0, [...r.errors, ...r2.errors].join("|"));
  await r.ctx.close(); await r2.ctx.close();
}

{ // F5d (D-93, revised): Turn on → phone answers unavailable → screen unchanged (hero + three points), warning notice in the bar
  // (same slot as offline / failed), the primary reads Continue → Home, Not now hidden; not enabled; the offer is not shown again
  const r = await open(""); const p = r.p;
  await setStory(p, { offer: "unavailable" });
  await signInFull(p, "7012345619");
  await p.click("#turn-on"); await p.waitForTimeout(PROMPT);
  const u = await p.evaluate(() => {
    const vis = (id) => { const e = document.getElementById(id); return !!e && !e.hidden && e.getClientRects().length > 0; };
    const n = document.getElementById("offer-notice");
    const btns = [...document.querySelectorAll(".offer-screen .tm-actionbar button")].filter((b) => !b.hidden && b.getClientRects().length);
    return { s: window.__tm.store.get().s, n: vis("offer-notice") ? n.textContent : null, warn: n.classList.contains("tm-notice--warning"),
      icon: n.querySelector(".tm-icon").getAttribute("data-icon"), inBar: !!document.querySelector(".tm-actionbar > #offer-notice:not([hidden])"),
      topNotice: !!document.querySelector(".offer-screen .panel .tm-notice"),
      hero: !!document.querySelector(".offer-screen .hero-wrap") && document.querySelector(".offer-screen .hero-wrap").getClientRects().length > 0,
      points: document.querySelectorAll(".offer-screen .points li").length, notNow: vis("not-now"),
      btns: btns.map((b) => [b.id, b.textContent, b.classList.contains("tm-btn--primary")]) };
  });
  await p.goBack(); await p.waitForTimeout(300); const viaBack = await sNow(p);   // phone Back = the only action (Continue)
  const st = await p.evaluate(() => JSON.parse(localStorage.getItem("tm-doctor-app:review:faster:7012345619")));
  await p.evaluate(() => document.getElementById("rp-restart").click()); await p.waitForTimeout(300);
  await setStory(p, { offer: "enabled" });
  await signInFull(p, "7012345619"); const again = await sNow(p);
  await p.reload(); await p.waitForTimeout(400); const reopened = await sNow(p);
  // Continue tapped (second run, fresh number); it never re-opens the prompt
  const r2 = await open(""); const p2 = r2.p;
  await setStory(p2, { offer: "unavailable" }); await signInFull(p2, "7012345620");
  await p2.click("#turn-on"); await p2.waitForTimeout(PROMPT);
  await setStory(p2, { offer: "enabled" });
  await p2.click("#turn-on"); await p2.waitForTimeout(200); const cont = await sNow(p2);
  const st2 = await p2.evaluate(() => JSON.parse(localStorage.getItem("tm-doctor-app:review:faster:7012345620")));
  // Jump to the behaviour row opens the built state
  const r3 = await open("?s=offer.unavailable"); const j = await r3.p.evaluate(() => ({ s: window.__tm.store.get().s,
    n: document.getElementById("offer-notice")?.hidden === false ? document.getElementById("offer-notice").textContent : null, btn: document.getElementById("turn-on").textContent }));
  check("F5d", "D-93 revised: Turn on → unavailable → screen unchanged (tile + 3 points), \"Faster sign-in isn't available on this phone right now.\" (warning, alert-triangle) in the bar, primary reads Continue, Not now hidden, no top notice → Home; not enabled, offered; phone Back = Continue; the offer is not shown again; Jump offer.unavailable opens it",
    u.s === "offer_fingerprint" && u.n === "Faster sign-in isn’t available on this phone right now." && u.warn && u.icon === "alert-triangle" && u.inBar && !u.topNotice && u.hero && u.points === 3 && !u.notNow &&
    JSON.stringify(u.btns) === JSON.stringify([["turn-on", "Continue", true]]) && viaBack === "home_setup-wheel" && st.offered && !st.enabled &&
    again === "home_setup-wheel" && reopened === "home_setup-wheel" && cont === "home_setup-wheel" && st2.offered && !st2.enabled &&
    j.s === "offer_unavailable" && j.n === "Faster sign-in isn’t available on this phone right now." && j.btn === "Continue",
    JSON.stringify({ u, viaBack, st, again, reopened, cont, st2, j }));
  check("F5e", "offer unavailable: 0 console errors", r.errors.length + r2.errors.length + r3.errors.length === 0, [...r.errors, ...r2.errors, ...r3.errors].join("|"));
  for (const x of [r, r2, r3]) await x.ctx.close();
}

{ // F6: the phone decides the offer (D-64): Face ID, screen lock only (fallback reachable end to end), no screen lock → skipped
  const look = async (device, n) => {
    const r = await open(""); const p = r.p; await setStory(p, { device }); await signInFull(p, n);
    const v = await p.evaluate(() => ({ s: window.__tm.store.get().s, sub: document.querySelector(".offer-screen .sub")?.textContent, icon: document.querySelector(".hero-ic .tm-icon")?.dataset.icon, trust: document.querySelectorAll(".pt-t")[1]?.textContent }));
    return { r, p, v };
  };
  const face = await look("face", "7012345615");
  const none = await look("none", "7012345616");
  const sl = await look("screen-lock", "7012345617");
  await sl.p.click("#turn-on"); await sl.p.waitForTimeout(PROMPT); const slHome = await sNow(sl.p);
  await sl.p.reload(); await sl.p.waitForTimeout(400);
  const slUnlock = await sl.p.evaluate(() => ({ s: window.__tm.store.get().s, btn: document.getElementById("unlock-label").textContent, icon: document.getElementById("variant-icon").dataset.icon }));
  await sl.p.click("#unlock-action"); await sl.p.waitForTimeout(PROMPT); const slDone = await sNow(sl.p);
  check("F6", "device: Face ID wording; no screen lock → offer skipped (Home); screen lock only → offer \"Use your screen lock instead of an OTP.\" → Turn on → restart → \"Unlock with screen lock\" → Home",
    face.v.s === "offer_face-id" && face.v.sub === "Use Face ID instead of waiting for an OTP." && face.v.trust === "Your Face ID stays on your phone" && none.v.s === "home_setup-wheel" &&
    sl.v.s === "offer_screen-lock" && sl.v.sub === "Use your screen lock instead of an OTP." && sl.v.icon === "lock" && slHome === "home_setup-wheel" &&
    slUnlock.s === "unlock_screen-lock" && slUnlock.btn === "Unlock with screen lock" && slUnlock.icon === "lock" && slDone === "home_setup-wheel",
    JSON.stringify({ face: face.v, none: none.v, sl: sl.v, slHome, slUnlock, slDone }));
  const errs = [...face.r.errors, ...none.r.errors, ...sl.r.errors];
  check("F6b", "device variants: 0 console errors", errs.length === 0, errs.join("|"));
  for (const x of [face, none, sl]) await x.r.ctx.close();
}

{ // F6c: returning unlock follows what the phone can do now (D-64): fingerprint turned on, phone now screen lock only → screen lock;
  // no screen lock any more → unavailable. The review story (the simulated phone) survives reopening the app.
  const r = await open(""); const p = r.p;
  await signInFull(p, "7012345618"); await p.click("#turn-on"); await p.waitForTimeout(PROMPT);
  await setStory(p, { device: "screen-lock" }); await p.reload(); await p.waitForTimeout(400);
  const sl = await p.evaluate(() => ({ s: window.__tm.store.get().s, panel: document.getElementById("rp-device").value }));
  await setStory(p, { device: "none" }); await p.reload(); await p.waitForTimeout(400);
  const none = await sNow(p);
  check("F6c", "fingerprint turned on, phone changed to screen lock only → unlock asks for the screen lock; no screen lock → unavailable; panel story kept across reopen",
    sl.s === "unlock_screen-lock" && sl.panel === "screen-lock" && none === "unlock_unavailable" && r.errors.length === 0, JSON.stringify({ sl, none, e: r.errors }));
  await r.ctx.close();
}

{ // F7f (codex session 5, 2nd run): Use OTP instead on unlock sends a code; when that is the window's last code, OTP opens with
  // codes used up (Resend hidden, too-many-codes notice), as from sign-in
  const r = await open("", { w: 1280, h: 800 }); const p = r.p; const n = "7012345621";   // desktop review: every panel row
  await signInFull(p, n); await p.click("#turn-on"); await p.waitForTimeout(PROMPT);   // code 1, faster sign-in on
  await choose(p, "start", "unlock");   // Restart then opens the returning unlock for the remembered doctor
  const seen = [];
  for (const w of [30, 60, 120]) {
    await ff(p, w * 1000); await p.evaluate(() => document.getElementById("rp-restart").click()); await p.waitForTimeout(400);   // restart keeps the app clock
    const at = await sNow(p);
    await p.click("#fallback"); await p.waitForTimeout(ANSWER);
    seen.push([at, await p.evaluate(() => ({ s: window.__tm.store.get().s, rsHidden: document.getElementById("rs")?.hidden, note: document.getElementById("nt")?.textContent.replace(/\u00a0/g, " ") }))]);
  }
  const [, last] = seen[2];
  check("F7f", "unlock → Use OTP instead (codes 2–4): the 4th code (window's last) opens OTP with Resend hidden and the too-many-codes notice; earlier ones show Resend",
    seen.every(([at]) => at === "unlock_fingerprint") && !seen[0][1].rsHidden && !seen[1][1].rsHidden && last.s === "otp_default" && last.rsHidden && /call Doctor Ops/.test(last.note) && r.errors.length === 0,
    JSON.stringify({ seen, e: r.errors }));
  await r.ctx.close();
}

// A returning doctor: faster sign-in on, app reopened on unlock.
async function returning(story = {}, n = "7012345620") {
  const r = await open(""); const p = r.p;
  await signInFull(p, n); await p.click("#turn-on"); await p.waitForTimeout(PROMPT);
  await p.reload(); await p.waitForTimeout(400);
  if (Object.keys(story).length) await setStory(p, story);
  return r;
}
{ // F7: returning unlock — cancelled unchanged; 3 failed tries → OTP; unavailable; Use OTP instead; Switch account; phone Back stays
  const r = await returning({ unlock: "cancelled" }); const p = r.p;
  const before = await p.evaluate(() => document.querySelector(".unlock-screen").innerHTML);
  await p.click("#unlock-action"); await p.waitForTimeout(PROMPT);
  const after = await p.evaluate(() => document.querySelector(".unlock-screen").innerHTML);
  await p.goBack(); await p.waitForTimeout(300); const backStays = await sNow(p);
  await setStory(p, { unlock: "failed" });
  const tries = [];
  for (let i = 0; i < 3; i++) { await p.click("#unlock-action"); await p.waitForTimeout(PROMPT); tries.push(await sNow(p)); }
  const otp = await p.evaluate(() => ({ num: document.querySelector(".otp-screen .head b")?.textContent, focused: document.activeElement?.id }));
  check("F7", "unlock: cancelled → unchanged, no message; phone Back stays on unlock; failed tries 1–2 stay (phone owns retry), the 3rd → OTP for the remembered number",
    before === after && backStays === "unlock_fingerprint" && tries[0] === "unlock_fingerprint" && tries[1] === "unlock_fingerprint" && tries[2] === "otp_default" && otp.num === "+91 70123 45620" && otp.focused === "c",
    JSON.stringify({ same: before === after, backStays, tries, otp }));
  await verify(p, "1234"); const signed = await sNow(p);
  check("F7b", "OTP after unlock fallback: 1234 → Home (faster sign-in already on, no offer)", signed === "home_setup-wheel", signed);
  await r.ctx.close();

  const u = await returning({ unlock: "unavailable" }, "7012345621"); const q = u.p;
  await q.click("#unlock-action");   // the story changed after the app opened: the prompt answers "unavailable" at the tap
  await q.waitForTimeout(PROMPT);
  const un = await q.evaluate(() => ({ n: document.querySelector("#unlock-notice:not([hidden])")?.textContent, neutral: document.getElementById("unlock-notice").classList.contains("tm-notice--neutral"),
    act: document.getElementById("unlock-action").hidden, prompt: document.querySelector(".prompt").hidden, primary: document.getElementById("fallback").classList.contains("tm-btn--primary") }));
  await q.reload(); await q.waitForTimeout(400);
  const opened = await q.evaluate(() => ({ s: window.__tm.store.get().s }));
  await q.click("#fallback"); await q.waitForTimeout(300); const useOtp = await sNow(q);
  await q.goBack(); await q.waitForTimeout(300); const otpBack = await sNow(q);   // OTP Back = Change → sign-in
  check("F7c", "unavailable: neutral notice at the top of the panel, prompt and Unlock hidden, Use OTP instead primary; Use OTP instead → OTP (Back = Change → sign-in)",
    un.n === "Faster sign-in isn’t available on this phone right now." && un.neutral && un.act && un.prompt && un.primary && useOtp === "otp_default" && otpBack === "sign-in_default",
    JSON.stringify({ un, opened, useOtp, otpBack }));
  await u.ctx.close();

  const w = await returning({}, "7012345622"); const s = w.p;
  await s.click("#switch-account"); await s.waitForTimeout(300);
  const sw = await s.evaluate(() => ({ s: window.__tm.store.get().s, n: document.getElementById("tm-login-mobile")?.value }));
  await s.goBack(); await s.waitForTimeout(300); const swBack = await sNow(s);
  check("F7d", "Not you? Switch account → sign-in with an empty number; phone Back returns to unlock", sw.s === "sign-in_default" && sw.n === "" && swBack === "unlock_fingerprint", JSON.stringify({ sw, swBack }));
  const errs = [...r.errors, ...u.errors, ...w.errors];
  check("F7e", "unlock journeys: 0 console errors", errs.length === 0, errs.join("|"));
  await w.ctx.close();
}

{ // F8: story start "unlock" and the panel applies to the running unlock (next prompt answer) — review mode
  const r = await open("", { w: 1280, h: 800 }); const p = r.p;   // desktop review: every panel row is there
  await choose(p, "start", "unlock"); await choose(p, "device", "face");
  await p.evaluate(() => document.getElementById("rp-restart").click()); await p.waitForTimeout(300);
  const st = await p.evaluate(() => ({ s: window.__tm.store.get().s, btn: document.getElementById("unlock-label").textContent }));
  await choose(p, "unlock", "unavailable");
  await p.click("#unlock-action"); await p.waitForTimeout(PROMPT);
  const un = await p.evaluate(() => !document.getElementById("unlock-notice").hidden);
  check("F8", "story start = returning unlock (Face ID phone); a panel change applies at the next prompt answer", st.s === "unlock_face" && st.btn === "Unlock with Face ID" && un, JSON.stringify({ st, un }));
  await r.ctx.close();
}

{ // F9: frame — offer and unlock fill the app frame at 360 / 390 / 430 / desktop; the bar is at the frame's bottom edge
  const bad = [];
  for (const [w, h] of [[360, 640], [360, 780], [390, 844], [430, 932], [1280, 800]]) for (const s of ["offer_screen-lock", "offer_enable-failed", "unlock_fingerprint", "unlock_unavailable"]) {
    const r = await open(`?s=${s}`, { w, h });
    const g = await r.p.evaluate(() => { const fe = document.getElementById("frame"); const f = fe.getBoundingClientRect(); const sc = document.querySelector(".offer-screen, .unlock-screen"); const b = sc.getBoundingClientRect(); const bar = sc.querySelector(".tm-actionbar").getBoundingClientRect();
      return { fw: fe.clientWidth, sw: b.width, dx: Math.abs(f.left + fe.clientLeft - b.left), barGap: Math.round(f.bottom - fe.clientTop - bar.bottom), pageScroll: document.documentElement.scrollWidth > innerWidth }; });
    if (Math.abs(g.fw - g.sw) > 1 || g.dx > 1 || Math.abs(g.barGap) > 1 || g.pageScroll) bad.push(`${s}@${w}x${h} ${JSON.stringify(g)}`);
    await r.ctx.close();
  }
  check("F9", "frame: offer and unlock fill the frame (360×640 / 360 / 390 / 430 / desktop), bar flush with the bottom, no page scroll", !bad.length, bad.join(" ; "));
}

await browser.close();
srv.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) { console.log("FAILED: " + failed.map((f) => f.id).join(", ")); process.exit(1); }
