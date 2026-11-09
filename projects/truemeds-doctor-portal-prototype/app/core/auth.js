// Sign-in and OTP rules (app-logic §2, test numbers and codes §11). Pure logic: the clock, the settings and the storage are
// passed in, so the same code runs in Node tests and in the browser. In the real app the server enforces every limit and the
// app only shows them; here this file plays the server.
//
// ctx = { now: () => ms, value: (settingKey) => setting value for the current mode, db: { get(k), set(k, v) },
//         story: the review story (panel / play link), offline: boolean }
// The first value of each story field means "answer by the number / code typed"; any other value forces that answer, so a
// panel change applies to the running journey at the next server answer.
import { SIGN_IN_NUMBERS, OTP_CODES, OTP_LENGTH, MOBILE_LENGTH } from "../data/test-numbers.js";

// ---- mobile number -------------------------------------------------------------------------------------------------
// Typing and pasting are cleaned: "+91 98765-43210", "098765 43210" → the same 10 digits. A leading 0 or 91 is dropped.
export function cleanNumber(raw) {
  let d = String(raw || "").replace(/\D/g, "");
  if (d.length > MOBILE_LENGTH && d.startsWith("91")) d = d.slice(2);
  d = d.replace(/^0+/, "");
  return d.slice(0, MOBILE_LENGTH);
}
// Checks, most basic first. `submit` = on Send OTP, or an error is already showing (it then re-checks on every keystroke).
// The first-digit check shows as soon as the digit is typed. Returns a message key or null.
export function checkNumber(d, { submit = false } = {}) {
  if (!d) return submit ? "signin.empty" : null;
  if (!/^[6-9]/.test(d)) return "signin.prefix";
  if (d.length < MOBILE_LENGTH) return submit ? "signin.short" : null;
  return null;
}
export function checkCode(code) {
  if (!code) return "otp.empty";
  if (code.length < OTP_LENGTH) return "otp.short";
  return null;
}
// "+91 98765 43210"
export function formatNumber(d) { return d && d.length === MOBILE_LENGTH ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : `+91 ${d || ""}`.trim(); }
// m:ss for a countdown, rounded up so it never shows 0:00 while still waiting
export function formatWait(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// ---- per-number limits (kept in storage so a journey restart within the session does not reset them, D-35) -----------
const key = (n) => `otp:${n}`;
function load(n, ctx) {
  const now = ctx.now();
  const r = { sent: [], wrong: 0, lockedUntil: 0, tooManyUntil: 0, ...(ctx.db.get(key(n)) || {}) };
  const windowMs = ctx.value("otpWindow");
  r.sent = r.sent.filter((t) => now - t < windowMs);
  if (r.lockedUntil && r.lockedUntil <= now) { r.lockedUntil = 0; r.wrong = 0; }   // lock over: tries start again
  if (r.tooManyUntil && r.tooManyUntil <= now) r.tooManyUntil = 0;
  return r;
}
const save = (n, r, ctx) => ctx.db.set(key(n), r);
function waitAfter(r, ctx) {
  const waits = ctx.value("resendWaits");
  return waits[Math.min(Math.max(r.sent.length - 1, 0), waits.length - 1)];
}

// Everything a screen needs to show the number's limits.
export function status(n, ctx) {
  const r = load(n, ctx);
  const cap = ctx.value("otpCodesPerWindow");
  const last = r.sent.length ? r.sent[r.sent.length - 1] : 0;
  return {
    wrong: r.wrong,
    lockedUntil: r.lockedUntil,
    codesLeft: Math.max(0, cap - r.sent.length),
    resendAt: last ? last + waitAfter(r, ctx) : 0,
    windowFreeAt: r.sent.length ? r.sent[0] + ctx.value("otpWindow") : 0,
  };
}

const forced = (field, ctx, byDefault) => {
  const v = ctx.story && ctx.story[field];
  return v && v !== byDefault ? v : null;
};

// Send OTP from sign-in. Outcomes: sent · locked · not-registered · inactive · too-many-tries · couldnt-send · offline
export function requestCode(n, ctx) {
  if (ctx.offline) return { outcome: "offline" };
  const now = ctx.now();
  const r = load(n, ctx);
  const answer = forced("signIn", ctx, "sent") || SIGN_IN_NUMBERS[n] || "sent";
  if (answer === "locked-number" && !r.lockedUntil) r.lockedUntil = now + ctx.value("otpLock");
  if (r.lockedUntil) { save(n, r, ctx); return { outcome: "locked", until: r.lockedUntil }; }   // D-81 F6: straight to otp_locked
  if (answer === "not-registered" || answer === "inactive" || answer === "couldnt-send") return { outcome: answer };
  if (answer === "too-many-tries" && !r.tooManyUntil) r.tooManyUntil = now + ctx.value("tooManyTriesWait");
  const cap = ctx.value("otpCodesPerWindow");
  if (!r.tooManyUntil && r.sent.length >= cap) r.tooManyUntil = r.sent[0] + ctx.value("otpWindow");   // codes used up (D-35)
  if (r.tooManyUntil) { save(n, r, ctx); return { outcome: "too-many-tries", until: r.tooManyUntil }; }
  r.sent.push(now);
  save(n, r, ctx);
  return { outcome: "sent", resendAt: now + waitAfter(r, ctx) };
}

// Verify & sign in. Outcomes: correct · wrong (with message) · expired · couldnt-verify · locked · offline
export function verifyCode(n, code, ctx) {
  if (ctx.offline) return { outcome: "offline" };
  const now = ctx.now();
  const r = load(n, ctx);
  if (r.lockedUntil) return { outcome: "locked", until: r.lockedUntil };
  const f = forced("otp", ctx, "correct");
  const limit = ctx.value("otpWrongLimit");
  let answer = OTP_CODES[code] || "wrong";
  if (f === "wrong" || f === "expired" || f === "couldnt-verify") answer = f;
  if (f === "two-tries-left") { answer = "wrong"; r.wrong = Math.max(r.wrong, limit - ctx.value("otpTriesLeftFrom") - 1); }
  if (f === "locked") { r.lockedUntil = now + ctx.value("otpLock"); save(n, r, ctx); return { outcome: "locked", until: r.lockedUntil }; }
  if (answer === "correct") { save(n, { ...r, wrong: 0, sent: r.sent }, ctx); return { outcome: "correct" }; }
  if (answer === "expired") {   // Resend at once unless the resend wait is still running (it obeys the cooldown)
    const s = status(n, ctx);
    return s.codesLeft > 0 ? { outcome: "expired", resendAt: s.resendAt } : { outcome: "expired-limited", until: s.windowFreeAt };
  }
  if (answer === "couldnt-verify") return { outcome: "couldnt-verify" };
  r.wrong += 1;
  if (r.wrong >= limit) { r.lockedUntil = now + ctx.value("otpLock"); save(n, r, ctx); return { outcome: "locked", until: r.lockedUntil }; }
  save(n, r, ctx);
  return { outcome: "wrong", ...wrongMessage(limit - r.wrong, ctx) };
}
// "Wrong code." · from 2 tries left "Wrong code. 2 tries left." · at 1 "Wrong code. 1 try left." (D-81 F1)
export function wrongMessage(left, ctx) {
  if (left === 1) return { key: "otp.triesLeftOne", values: {} };
  if (left <= ctx.value("otpTriesLeftFrom")) return { key: "otp.triesLeft", values: { count: left } };
  return { key: "otp.wrong", values: {} };
}

// Resend code. Outcomes: sent · sent-last (codes used up after this one; until = window end) · cooldown (wait not over) · failed ·
// too-many · locked · offline
export function resendCode(n, ctx) {
  if (ctx.offline) return { outcome: "offline" };
  const now = ctx.now();
  const r = load(n, ctx);
  if (r.lockedUntil) return { outcome: "locked", until: r.lockedUntil };
  if (forced("otp", ctx, "correct") === "resend-failed") return { outcome: "failed" };
  const cap = ctx.value("otpCodesPerWindow");
  if (r.sent.length >= cap) return { outcome: "too-many", until: r.sent[0] + ctx.value("otpWindow") };
  const last = r.sent.length ? r.sent[r.sent.length - 1] : 0;
  if (last && now < last + waitAfter(r, ctx)) return { outcome: "cooldown", resendAt: last + waitAfter(r, ctx) };   // the wait is the server's
  r.sent.push(now);
  save(n, r, ctx);
  return { outcome: r.sent.length >= cap ? "sent-last" : "sent", resendAt: now + waitAfter(r, ctx), until: r.sent[0] + ctx.value("otpWindow") };
}

// Successful sign-in: remembered for the session (plan B12). Faster sign-in state is added in session 3.
export function signIn(n, ctx) { ctx.db.set("auth", { number: n, at: ctx.now() }); }
export function signedIn(ctx) { return ctx.db.get("auth"); }
