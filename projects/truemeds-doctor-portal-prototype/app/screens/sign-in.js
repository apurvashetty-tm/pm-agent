// Sign-in (entry journey, step 1). Markup and classes lifted from ui-screens/sign-in/sign-in.html; styles in sign-in.css.
// Behaviour: app-logic §2 (cleaning, live checks, server answers as notices), test numbers §11 (app/data/test-numbers.js),
// feedback-state-map rows for sign-in. Every word through MSG().
// A state opened directly (?s=sign-in_<state>) shows the approved picture's moment, then behaves live from there.
import { MSG } from "../core/msg.js";
import { push, setScreenBack, saveCurrent } from "../core/nav.js";
import { store } from "../core/store.js";
import { clock } from "../core/clock.js";
import { h } from "../core/dom.js";
import { cleanNumber, checkNumber, requestCode, formatWait } from "../core/auth.js";
import { PICTURE_NUMBER } from "../data/test-numbers.js";
import { SIGN_UP_URL, PLACEHOLDER } from "../data/links.js";
import { mockKeyboard, drawsKeyboard } from "../shell/mock-keyboard.js";
import { authCtx, newLife } from "./entry-ctx.js";

// Picture moments (same table as the approved file). number: what the field shows; error: helper key shown as an error.
const P = PICTURE_NUMBER;
const FIXTURES = {
  default:             { number: "", kb: false, focused: false },
  "keyboard-open":     { number: P.slice(0, 5), kb: true, focused: true },
  "empty-tap":         { number: "", kb: true, error: "signin.empty" },
  "too-short":         { number: P.slice(0, 8), kb: true, error: "signin.short" },
  "wrong-first-digit": { number: "1234567890", kb: true, error: "signin.prefix" },
  "pasted-cleaned":    { number: P, kb: true, focused: true },
  sending:             { number: P, kb: true, focused: true, button: "sending" },
  "not-registered":    { number: P, notice: "not-registered" },
  offline:             { number: P, notice: "offline" },
  "couldnt-send":      { number: P, notice: "couldnt-send" },
  "too-many-tries":    { number: P, notice: "too-many-tries", button: "wait", waitMs: (9 * 60 + 42) * 1000 },
  inactive:            { number: P, notice: "inactive", button: "inactive" },
};
const NOTICES = {
  "not-registered": { cls: "tm-notice--neutral", icon: "info-circle", key: "signin.notRegistered", role: "status" },
  offline:          { cls: "tm-notice--warning", icon: "alert-triangle", key: "signin.offline", role: "alert" },
  "couldnt-send":   { cls: "tm-notice--error", icon: "alert-circle", key: "signin.couldntSend", role: "alert" },
  "too-many-tries": { cls: "tm-notice--warning", icon: "clock", key: "signin.tooMany", role: "alert" },
  inactive:         { cls: "tm-notice--error", icon: "alert-circle", key: "signin.inactive", role: "alert" },
};
export const STATES = Object.keys(FIXTURES).map((k) => `sign-in_${k}`);

export function render(host, id, { mode, params = {} }) {
  const key = id.replace(/^sign-in_/, "");
  const fx = FIXTURES[key];
  if (!fx) return null;
  const life = newLife(host, mode);
  const kbDrawn = drawsKeyboard(mode);

  // Model. A live return (Change on OTP, phone Back) keeps the number the doctor typed; never a fixture over typed input.
  const typed = params.live ? (params.number ?? store.get().entryNumber ?? "") : null;
  const m = {
    number: typed ?? fx.number,
    error: params.live ? null : fx.error || null,
    notice: params.live ? null : fx.notice || null,
    button: params.live ? "default" : fx.button || "default",
    until: fx.waitMs ? clock.now() + fx.waitMs : 0,
    kb: params.live ? false : !!fx.kb,
    focused: params.live ? false : !!fx.focused,
    // A pasted or pre-filled number (pasted picture, back from OTP Change) is replaced by the first typed digit (recovery §1).
    replace: params.live ? !!typed : key === "pasted-cleaned",
  };
  // Back from a placeholder page (Call Doctor Ops): restore the screen as it was.
  if (params.saved) Object.assign(m, params.saved, { button: params.saved.button === "sending" ? "default" : params.saved.button });

  // ---- markup (approved hierarchy: .login-phone > logo, .login-content > h1, p, .login-fields; .login-signup; keyboard) ----
  const input = h("input", { id: "tm-login-mobile", type: "tel", inputmode: "tel", autocomplete: "tel-national",
    placeholder: MSG("signin.phonePlaceholder"), "aria-describedby": "tm-login-helper" });
  const helper = h("div", { id: "tm-login-helper", class: "tm-field__helper" });
  const notices = Object.fromEntries(Object.entries(NOTICES).map(([k, n]) => [k,
    h("div", { id: `tm-login-${k}-notice`, class: `tm-notice login-notice ${n.cls}`, role: n.role, hidden: true },
      h("span", { class: "tm-icon", "data-icon": n.icon, "aria-hidden": "true" }), h("span", { text: MSG(n.key) }))]));
  const spinner = h("span", { class: "tm-spinner", "aria-hidden": "true", hidden: true });
  const submitLabel = h("span", { class: "login-submit-label" });
  const submit = h("button", { class: "tm-btn tm-btn--primary tm-btn--lg tm-btn--block login-submit", type: "button", onclick: onSubmit }, spinner, submitLabel);
  const field = h("div", { class: "tm-field" },
    h("label", { class: "tm-field__label", for: "tm-login-mobile", text: MSG("signin.phoneLabel") }),
    h("div", { class: "tm-field__control" }, h("span", { class: "login-prefix", text: MSG("signin.phonePrefix") }), input),
    helper, Object.values(notices));
  const signupLink = h("a", { class: "login-signup-label", href: SIGN_UP_URL, target: "_blank", rel: "noopener", text: MSG("signin.signupLink") });
  const signup = h("div", { class: "login-signup", id: "tm-signup-option" }, `${MSG("signin.signup")} `, signupLink);
  const keyboard = kbDrawn ? mockKeyboard(typeKey) : null;
  const root = h("section", { class: "signin-screen tm", "aria-labelledby": "tm-login-title" },
    h("img", { class: "login-logo", src: "brand/truemeds-for-doctors.svg", alt: MSG("signin.logoAlt") }),
    h("main", { class: "login-content" },
      h("h1", { id: "tm-login-title", text: MSG("signin.welcome") }),
      h("p", { text: MSG("signin.subtitle") }),
      h("div", { class: "login-fields" }, field, submit)),
    signup, keyboard);
  host.replaceChildren(root);

  // ---- paint: the DOM always follows the model ----
  function paint() {
    input.value = m.number;
    const busy = m.button === "sending";
    input.readOnly = busy;
    root.classList.toggle("has-error", !!m.error);
    root.classList.toggle("is-focused", m.focused && !m.error);
    root.dataset.keyboard = String(kbDrawn && m.kb);
    if (keyboard) keyboard.hidden = !m.kb;
    field.classList.toggle("tm-field--error", !!m.error);
    input.setAttribute("aria-invalid", String(!!m.error));
    helper.hidden = !!m.notice;
    helper.textContent = m.error ? MSG(m.error) : MSG("signin.smsHelper");
    if (m.error) helper.setAttribute("role", "alert"); else helper.removeAttribute("role");
    Object.entries(notices).forEach(([k, el]) => { el.hidden = m.notice !== k; });
    input.setAttribute("aria-describedby", m.notice ? `tm-login-${m.notice}-notice` : "tm-login-helper");
    submitLabel.textContent = busy ? MSG("signin.submitSending")
      : m.button === "wait" ? MSG("signin.submitWait", { time: formatWait(m.until - clock.now()) })
      : m.button === "inactive" ? MSG("signin.submitInactive") : MSG("signin.submitDefault");
    submit.classList.toggle("tm-btn--busy", busy);
    submit.setAttribute("aria-busy", String(busy));
    spinner.hidden = !busy;
    const off = busy || m.button === "wait";
    submit.disabled = off;
    submit.setAttribute("aria-disabled", String(off));
  }

  // ---- behaviour ----
  function setNumber(raw) {
    const cleaned = cleanNumber(raw);
    const changed = cleaned !== m.number;
    m.number = cleaned;
    store.set({ entryNumber: cleaned });
    // once an error shows it re-checks on every keystroke; the first-digit rule shows as soon as it is typed
    // (an "empty" / "too short" error keeps the Send-level check; a first-digit error re-checks with the typing rules)
    m.error = checkNumber(cleaned, { submit: m.error === "signin.empty" || m.error === "signin.short" });
    if (changed && m.notice) { m.notice = null; m.button = "default"; }   // a server answer belongs to the number it was for
    paint();
  }
  function typeKey(k) {
    if (m.button === "sending") return;
    input.focus();
    const replacing = m.replace; m.replace = false;
    setNumber(k === "back" ? m.number.slice(0, -1) : replacing ? k : m.number + k);
  }
  let pasting = false;
  input.addEventListener("paste", () => { pasting = true; });
  input.addEventListener("keydown", (e) => {
    if (!m.replace || input.readOnly) return;
    if (/^\d$/.test(e.key)) { e.preventDefault(); m.replace = false; setNumber(e.key); }
    else if (e.key === "Backspace" || e.key === "Delete") m.replace = false;   // editing keeps the number
  });
  input.addEventListener("input", () => {
    const replacing = m.replace && !pasting; m.replace = false;
    setNumber(replacing ? input.value.replace(/\D/g, "").slice(-1) : input.value);
    if (pasting) { m.replace = true; pasting = false; }
  });
  input.addEventListener("focus", () => { m.focused = true; m.kb = true; paint(); });
  input.addEventListener("blur", () => { m.focused = false; if (!kbDrawn) m.kb = false; paint(); });

  function onSubmit() {
    if (m.button === "sending" || m.button === "wait") return;
    if (m.button === "inactive") { saveCurrent({ saved: { ...m } }); push(null, { s: "placeholder", text: PLACEHOLDER.callOps }); return; }
    const err = checkNumber(m.number, { submit: true });
    if (err) { m.error = err; m.kb = true; paint(); input.focus(); return; }
    m.button = "sending"; m.notice = null; paint();
    life.later(() => answer(requestCode(m.number, authCtx(mode))));
  }
  function answer(r) {
    const number = m.number;
    if (r.outcome === "sent" || r.outcome === "locked") {
      m.button = "default"; m.kb = false; m.focused = false;
      // The window's last code (D-35): OTP opens with codes used up — Resend hidden, "too many codes" until the window ends.
      push(null, { s: r.outcome === "sent" ? "otp_default" : "otp_locked", live: true, number, resendAt: r.resendAt, until: r.until, lastCode: !!r.last });
      return;
    }
    m.notice = r.outcome;
    m.button = r.outcome === "too-many-tries" ? "wait" : r.outcome === "inactive" ? "inactive" : "default";
    m.until = r.until || 0;
    m.kb = false; m.focused = false;
    input.blur();
    paint();
  }
  // Countdown on "Try again in m:ss". When it ends, the "Too many attempts" notice goes away and Send OTP works again
  // (D-98, app-logic §2).
  life.every(() => {
    if (m.button !== "wait") return;
    if (clock.now() >= m.until) { m.button = "default"; m.notice = null; }
    paint();
  });

  setScreenBack(null); // root of the entry journey: phone back stays in the app
  paint();
  if (window.TMIcons) window.TMIcons.render(root);
  if (m.focused && mode !== "capture") input.focus();
  return { journey: "signIn" };
}
