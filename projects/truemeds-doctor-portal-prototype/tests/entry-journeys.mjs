// Step 1 journey tests — sign-in and OTP (session 2). Run: cd tests && node entry-journeys.mjs
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

await browser.close();
srv.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) { console.log("FAILED: " + failed.map((f) => f.id).join(", ")); process.exit(1); }
