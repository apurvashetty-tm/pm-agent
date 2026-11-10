// OTP (entry journey, step 1). Markup and classes lifted from ui-screens/otp/otp.html; styles in otp.css.
// Behaviour: app-logic §2 (4 digits, no auto-verify, wrong-code count, 5th wrong locks the number, 4 codes per window,
// resend waits, expired code, locked number, Verify never moves), test codes §11, D-44, D-81 F1/F5/F6/F7, A-01–A-21.
// Limits come from app/core/auth.js (the simulated server) and survive a journey restart within the session.
// A state opened directly (?s=otp_<state>) shows the approved picture's moment, then behaves live from there.
import { MSG } from "../core/msg.js";
import { push, backTo, setScreenBack, saveCurrent, reset as resetNav } from "../core/nav.js";
import { store } from "../core/store.js";
import { clock } from "../core/clock.js";
import { h, parts, linkPhrase } from "../core/dom.js";
import { checkCode, verifyCode, resendCode, status, formatNumber, formatWait, signIn } from "../core/auth.js";
import { OTP_LENGTH, PICTURE_NUMBER, PICTURE_CODE } from "../data/test-numbers.js";
import { PLACEHOLDER, TERMS_URL, PRIVACY_URL } from "../data/links.js";
import { mockKeyboard, drawsKeyboard } from "../shell/mock-keyboard.js";
import { afterSignIn } from "../core/faster-signin.js";
import { authCtx, newLife } from "./entry-ctx.js";

const C = PICTURE_CODE;
const sec = (m, s) => (m * 60 + s) * 1000;
const NOTE = {
  couldntVerify: { k: "error", i: "alert-circle", t: "otp.couldntVerify" },
  tooManyResends: { k: "warning", i: "clock", ops: true, t: "otp.tooManyResends" },
  locked: { k: "warning", i: "clock", ops: true, t: "otp.locked", timed: true },
  resendFailed: { k: "error", i: "alert-circle", t: "otp.resendFailed" },
  offline: { k: "warning", i: "alert-triangle", t: "signin.offline" },
  expiredLimited: { k: "warning", i: "clock", ops: true, t: "otp.expiredAndLimited", timed: true },
};
// Picture moments (same table as the approved file). wait: resend countdown shown; until: time in a timed notice.
const FIXTURES = {
  default:                      { code: "", kb: true, rs: "wait", consent: true },
  "empty-tap":                  { code: "", kb: true, err: { key: "otp.empty" }, rs: "wait", consent: true },
  "too-short":                  { code: C.slice(0, 2), kb: true, err: { key: "otp.short" }, rs: "wait", consent: true },
  verifying:                    { code: C, kb: true, busy: true, rs: "wait", consent: true },
  "wrong-code":                 { code: C, kb: true, err: { key: "otp.wrong" }, replace: true, rs: "wait", consent: true },
  "two-tries-left":             { code: C, kb: true, err: { key: "otp.triesLeft", values: { count: 2 } }, replace: true, rs: "wait", consent: true },
  "resend-available":           { code: "", kb: true, rs: "available", consent: true },
  "new-code-sent":              { code: "", kb: true, s1: true, rs: "wait", waitMs: sec(1, 0), consent: true },
  "code-expired":               { code: C, kb: true, expired: true, err: { key: "otp.expired" }, replace: true, rs: "available" },
  "couldnt-verify":             { code: C, kb: true, note: NOTE.couldntVerify, rs: "wait", consent: true },
  "too-many-resends":           { code: "", kb: true, note: NOTE.tooManyResends, rs: "hidden", consent: true },
  locked:                       { code: "", locked: true, note: NOTE.locked, untilMs: sec(14, 52), rs: "hidden" },
  resending:                    { code: C, kb: true, rs: "sending", consent: true },
  "resend-failed":              { code: C, kb: true, note: NOTE.resendFailed, rs: "available", consent: true },
  offline:                      { code: C, kb: true, note: NOTE.offline, rs: "available", consent: true },
  "cooldown-reconciling":       { code: "", kb: true, rs: "checking", hold: true, consent: true },
  "expired-and-resend-limited": { code: "", locked: true, note: NOTE.expiredLimited, untilMs: sec(9, 42), rs: "hidden" },
};
export const STATES = Object.keys(FIXTURES).map((k) => `otp_${k}`);

export function render(host, id, { mode, params = {} }) {
  const key = id.replace(/^otp_/, "");
  const fx = FIXTURES[key];
  if (!fx) return null;
  const life = newLife(host, mode);
  const kbDrawn = drawsKeyboard(mode);
  const now = clock.now();
  // The number is the one submitted on sign-in; the picture's sample number only when the state is opened directly.
  const number = params.number || PICTURE_NUMBER;
  const live = !!params.live;
  const m = {
    code: live ? "" : fx.code,
    kb: !!fx.kb, err: live ? null : fx.err || null, replace: !live && !!fx.replace, s1: !live && !!fx.s1,
    note: fx.note || null, rs: fx.rs, consent: fx.consent ? "show" : fx.expired ? "reserve" : "hide",
    locked: !!fx.locked, busy: !live && !!fx.busy, expired: !live && !!fx.expired, hold: !!fx.hold,
    resendAt: params.resendAt || now + (fx.waitMs || authCtx(mode).value("resendWaits")[0]),
    until: params.until || (fx.untilMs ? now + fx.untilMs : 0),
  };
  // Back from a placeholder page: restore the screen as it was (a pending server answer is dropped; its action can be retried).
  // Sign-in used the window's last code: same as a resend that used it (sent-last) — Resend hidden, the too-many notice until the window ends.
  if (live && params.lastCode) Object.assign(m, { note: NOTE.tooManyResends, rs: "hidden", until: params.until });
  if (params.saved) Object.assign(m, params.saved, { busy: false, rs: params.saved.rs === "sending" ? "available" : params.saved.rs });
  const leave = (to) => { saveCurrent({ saved: { ...m } }); push(null, to); };

  // ---- markup (approved hierarchy: .screen > .top (logo, .head) · .panel > .grp (field, notice, resend) · .grp (consent, button)) ----
  const change = h("a", { class: "lk", href: "#", onclick: (e) => { e.preventDefault(); goChange(); }, text: MSG("otp.change") });
  const code = h("input", { class: "tm-otp-slots__input", id: "c", type: "text", inputmode: "numeric", pattern: "[0-9]*",
    maxlength: String(OTP_LENGTH), autocomplete: "one-time-code", "aria-label": MSG("otp.codeLabel"), "aria-describedby": "h", "aria-invalid": "false" });
  const slots = Array.from({ length: OTP_LENGTH }, () => h("span", { class: "tm-otp-slots__slot", "aria-hidden": "true" }));
  const slotsBox = h("div", { class: "tm-otp-slots", id: "slots" }, code, slots);
  const helper = h("div", { class: "tm-field__helper", id: "h", hidden: true });
  const s1 = h("p", { class: "s1", id: "s1", role: "status" }, h("span", { id: "s1t" }));
  const codeSlot = h("div", { class: "code-slot", id: "slot" }, helper, s1);
  const field = h("div", { class: "tm-field code", id: "f" }, slotsBox, codeSlot);
  const noteIcon = h("span", { class: "tm-icon", id: "ni", "data-icon": "info-circle", "aria-hidden": "true" });
  const noteText = h("div", { id: "nt" });
  const note = h("div", { class: "tm-notice note", id: "n", role: "status", "aria-live": "polite" }, noteIcon, noteText);
  const rsLead = h("span", { id: "rp", text: `${MSG("otp.didntReceive")} ` });
  const rsBody = h("span", { id: "rr" });
  const rs = h("p", { class: "rs", id: "rs" }, rsLead, rsBody);
  // Terms and Privacy open the configured pages in a new tab (D-101 o11); the OTP screen stays as it is.
  const legalLink = (text, href) => h("a", { href, target: "_blank", rel: "noopener", text });
  const consent = h("p", { class: "consent tm-text-body-sm", id: "consent" },
    parts("otp.consent", { terms: legalLink(MSG("otp.terms"), TERMS_URL), privacy: legalLink(MSG("otp.privacy"), PRIVACY_URL) }, MSG));
  const btn = h("button", { class: "tm-btn tm-btn--lg tm-btn--primary tm-btn--block", id: "b", type: "button", onclick: onVerify });
  const keyboard = kbDrawn ? mockKeyboard(typeKey) : null;
  const root = h("section", { class: "otp-screen tm", "aria-labelledby": "otp-title" },
    h("div", { class: "top" },
      h("img", { class: "login-logo", src: "brand/truemeds-for-doctors.svg", alt: "truemeds for doctors" }),
      h("div", { class: "head" },
        h("h1", { class: "tm-text-title-lg", id: "otp-title", text: MSG("otp.title") }),
        h("p", {}, parts("otp.sentTo", { number: h("b", { text: formatNumber(number) }) }, MSG), " · ", change))),
    h("div", { class: "panel" },
      h("div", { class: "grp" }, field, note, rs),
      h("div", { class: "grp" }, consent, btn)),
    keyboard);
  host.replaceChildren(root);

  // ---- paint ----
  function paintSlots() {
    const v = m.code;
    const err = !!m.err;
    slots.forEach((s, i) => {
      s.textContent = v[i] || "";
      s.classList.toggle("is-current", m.kb && !err && !m.locked && i === Math.min(v.length, OTP_LENGTH - 1));
    });
  }
  function paintNote() {
    note.classList.remove("show", "tm-notice--error", "tm-notice--warning", "tm-notice--neutral");
    noteText.replaceChildren();
    if (!m.note) return;
    note.classList.add("show", `tm-notice--${m.note.k}`);
    noteIcon.setAttribute("data-icon", m.note.i);
    const text = MSG(m.note.t, m.note.timed ? { time: formatWait(m.until - clock.now()) } : {});
    if (m.note.ops) {
      noteText.append(...linkPhrase(text, MSG("otp.callOps"), (p) => h("a", { href: "#", text: p,
        onclick: (e) => { e.preventDefault(); leave({ s: "placeholder", text: PLACEHOLDER.callOps }); } })));
    } else noteText.textContent = text;
  }
  function paintResend() {
    rs.hidden = m.rs === "hidden";
    rsLead.hidden = m.rs === "checking";   // D-81 F7: "Checking…" alone
    if (m.rs === "wait") rsBody.replaceChildren(...parts("otp.resendIn", { time: h("span", { class: "timer", text: formatWait(m.resendAt - clock.now()) }) }, MSG));
    if (m.rs === "available") rsBody.replaceChildren(h("button", { type: "button", onclick: onResend, text: MSG("otp.resendCode") }));
    if (m.rs === "sending") rsBody.textContent = MSG("otp.resending");
    if (m.rs === "checking") rsBody.textContent = MSG("otp.checking");
  }
  function paint() {
    code.value = m.code;
    code.disabled = m.locked;
    code.readOnly = m.busy;
    field.classList.toggle("tm-field--disabled", m.locked);
    field.classList.toggle("tm-field--error", !!m.err);
    code.setAttribute("aria-invalid", String(!!m.err));
    helper.hidden = !m.err;
    helper.textContent = m.err ? MSG(m.err.key, m.err.values || {}) : "";
    if (m.err) helper.setAttribute("role", "alert"); else helper.removeAttribute("role");
    paintNote();
    codeSlot.classList.toggle("off", !!m.note);
    s1.classList.toggle("show", m.s1);
    s1.firstChild.textContent = m.s1 ? MSG("otp.newSent") : "";
    paintResend();
    consent.classList.toggle("show", m.consent === "show" && !m.locked);
    consent.classList.toggle("reserve", m.consent === "reserve");
    const off = m.locked || m.busy || m.expired || m.hold;
    btn.disabled = off;
    btn.classList.toggle("tm-btn--busy", m.busy);
    btn.setAttribute("aria-busy", String(m.busy));
    btn.replaceChildren(...(m.busy ? [h("span", { class: "tm-spinner", "aria-hidden": "true" }), MSG("otp.submitBusy")] : [MSG("otp.submit")]));
    root.classList.toggle("kb", kbDrawn && m.kb && !m.locked);
    if (keyboard) keyboard.hidden = !(m.kb && !m.locked);
    paintSlots();
    if (window.TMIcons) window.TMIcons.render(root);
  }

  // ---- typing (real keyboard, paste, or the drawn keyboard) ----
  function clearError() { m.err = null; m.replace = false; }
  function setCode(next) {
    if (m.locked || m.busy) return;
    m.code = next.replace(/\D/g, "").slice(0, OTP_LENGTH);
    clearError();
    m.s1 = false;
    if (m.note && !m.note.ops) m.note = null;       // one-off notices (couldn't check, resend failed, offline) clear on edit
    if (m.expired) { m.expired = false; m.consent = "show"; } // a new code after an expiry re-enables Verify (approved file)
    paint();
  }
  // D-44: after a wrong or expired code, the first new keystroke replaces the whole code
  code.addEventListener("keydown", (e) => { if (m.replace && /^\d$/.test(e.key)) { e.preventDefault(); setCode(e.key); } });
  code.addEventListener("input", () => setCode(m.replace ? code.value.replace(/\D/g, "").slice(-1) : code.value));
  code.addEventListener("focus", paintSlots);
  code.addEventListener("blur", paintSlots);
  slotsBox.addEventListener("click", () => { if (!m.locked) code.focus(); });
  function typeKey(k) {
    if (m.locked) return;
    code.focus();
    if (k === "back") setCode(m.replace ? "" : m.code.slice(0, -1));
    else setCode(m.replace ? k : m.code + k);
  }

  // ---- server actions ----
  const ctx = () => authCtx(mode);
  function onVerify() {
    if (btn.disabled || m.rs === "sending") return;   // one server action at a time: a tap while a resend is in flight is ignored (Verify keeps its look, as the resending picture)
    const err = checkCode(m.code);
    if (err) { m.err = { key: err }; m.replace = false; paint(); code.focus(); return; }
    if (m.note && !m.note.ops) m.note = null;
    const submitted = m.code;                        // the code as submitted, not as the field reads later
    m.busy = true; paint();                          // L3: keyboard stays open while verifying; terms stay (D-81 F5)
    life.later(() => { m.busy = false; verified(verifyCode(number, submitted, ctx())); });
  }
  function verified(r) {
    if (r.outcome === "correct") {
      signIn(number, ctx());
      store.set({ entryNumber: number });
      // Signed in: the entry journey leaves history (Back never returns to OTP). The faster sign-in offer at each OTP sign-in, at most
      // fasterOfferMax (3) times, on a phone with a screen lock and faster sign-in off; else Home (D-45, D-64, D-104).
      resetNav();
      push(null, { s: afterSignIn(number, ctx()), live: true, number });
      return;
    }
    if (r.outcome === "wrong") { m.err = { key: r.key, values: r.values }; m.replace = true; }
    if (r.outcome === "expired") {
      Object.assign(m, { expired: true, err: { key: "otp.expired" }, replace: true, consent: "reserve" });
      if (clock.now() < r.resendAt) Object.assign(m, { rs: "wait", resendAt: r.resendAt }); else m.rs = "available";
    }
    if (r.outcome === "expired-limited") lockLike(NOTE.expiredLimited, r.until);
    if (r.outcome === "locked") lockLike(NOTE.locked, r.until);
    if (r.outcome === "couldnt-verify") m.note = NOTE.couldntVerify;
    if (r.outcome === "offline") m.note = NOTE.offline;
    paint();
    if (!m.locked) code.focus();
  }
  function lockLike(n, until) {
    Object.assign(m, { locked: true, note: n, until, code: "", err: null, replace: false, s1: false, rs: "hidden", consent: "hide", kb: false, expired: false });
    code.blur();
  }
  function onResend() {
    if (m.rs !== "available" || m.busy) return;      // one server action at a time (verifying)
    if (m.note && !m.note.ops) m.note = null;
    m.rs = "sending"; paint();
    life.later(() => resent(resendCode(number, ctx())));
  }
  function resent(r) {
    m.rs = "available";
    if (r.outcome === "sent") Object.assign(m, { code: "", err: null, replace: false, expired: false, s1: true, rs: "wait", resendAt: r.resendAt, consent: "show" });
    if (r.outcome === "sent-last") Object.assign(m, { code: "", err: null, replace: false, expired: false, s1: false, note: NOTE.tooManyResends, rs: "hidden", consent: "show", until: r.until });
    if (r.outcome === "cooldown") Object.assign(m, { rs: "wait", resendAt: r.resendAt });
    if (r.outcome === "too-many") { if (m.expired) lockLike(NOTE.expiredLimited, r.until); else Object.assign(m, { note: NOTE.tooManyResends, rs: "hidden", until: r.until }); }
    if (r.outcome === "failed") m.note = NOTE.resendFailed;
    if (r.outcome === "offline") m.note = NOTE.offline;
    if (r.outcome === "locked") lockLike(NOTE.locked, r.until);
    paint();
    if (!m.locked) code.focus();
  }

  // ---- clock: countdowns and lock / window expiry (on the app clock, demo-scaled through settings) ----
  life.every(() => {
    const t = clock.now();
    if (m.rs === "wait" && t >= m.resendAt) { m.rs = "available"; paint(); return; }
    if (m.note && m.note.timed && t >= m.until) {
      // lock or window over: a fresh start on this number (Resend code available, field on)
      Object.assign(m, { locked: false, note: null, rs: "available", consent: "show", kb: true, expired: false });
      paint(); code.focus(); return;
    }
    if (m.note === NOTE.tooManyResends && m.until && t >= m.until) { m.note = null; m.rs = "available"; paint(); return; }
    if (m.rs === "wait" || (m.note && m.note.timed)) paint();
  }, 250);

  // Coming back to the app: the cooldown is checked with the server first ("Checking…", Verify held; D-81 F7).
  if (live) {
    const onVisible = () => {
      if (!life.alive()) { document.removeEventListener("visibilitychange", onVisible); return; }
      if (document.hidden || m.locked || m.rs !== "wait") return;
      Object.assign(m, { rs: "checking", hold: true }); paint();
      life.later(() => {
        const s = status(number, ctx());
        Object.assign(m, { hold: false, rs: s.codesLeft > 0 ? (clock.now() < s.resendAt ? "wait" : "available") : "hidden", resendAt: s.resendAt });
        paint();
      }, "reconcileDelay");
    };
    document.addEventListener("visibilitychange", onVisible);
  }

  // ---- Change and phone Back: back to sign-in with the number kept (OTP has no Back control; D-61, app-logic §2) ----
  function goChange() { backTo((e) => String(e.params.s || "").startsWith("sign-in"), { s: "sign-in_default", live: true, number }); }
  setScreenBack(goChange);

  paint();
  if (m.kb && !m.locked) code.focus();               // keyboard opens on load: field focused with the blue current box
  return { journey: "otp" };
}
