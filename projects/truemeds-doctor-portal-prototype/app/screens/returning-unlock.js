// Returning unlock (entry journey, step 1). Markup and classes lifted from ui-screens/returning-unlock/returning-unlock.html;
// styles in returning-unlock.css. Every word through MSG(); the doctor's name comes from mock profile data (D-92), never typed here.
// Behaviour: app-logic §2 "Faster sign-in", feedback-state-map "Returning unlock", D-45, D-47, D-64, D-66 A1, A-19; plan B12, B14.
//   The prompt opens when the doctor taps Unlock (no automatic prompt) · success → Home (the open case from step 2 on) ·
//   cancelled → the screen returns unchanged, not counted · failed → the phone owns the retry (screen unchanged); after 3 failed
//   tries (setting, [MOCK]) → OTP · unavailable → standing neutral notice at the top of the panel, Use OTP instead is the primary ·
//   Use OTP instead → OTP · "Not you? Switch account" → sign-in · phone Back stays (first screen when the app opens, D-47).
//   [MOCK ASSUMPTION] Use OTP instead sends a code to the remembered number at the tap and opens OTP (no picture for a busy state);
//   if the server refuses (too many, offline, …) sign-in opens with the number and that answer.
import { MSG } from "../core/msg.js";
import { push, setScreenBack, saveCurrent, reset as resetNav } from "../core/nav.js";
import { h } from "../core/dom.js";
import { signedIn, signIn, requestCode } from "../core/auth.js";
import { promptAnswer } from "../core/unlock.js";
import { HOME_STUB } from "../core/faster-signin.js";
import { doctorFor } from "../data/doctor.js";
import { authCtx, newLife } from "./entry-ctx.js";

const VARIANT = {
  fingerprint:   { icon: "fingerprint", label: "unlock.submitFingerprint" },
  face:          { icon: "face-id", label: "unlock.submitFace" },
  "screen-lock": { icon: "lock", label: "unlock.submitScreenLock" },
};
// Picture moments (same table as the approved file). cancelled / platform-retry look like the fingerprint screen: the phone owns
// the retry guidance, the app shows nothing new (feedback-state-map: "do not invent OS mock").
const FIXTURES = {
  fingerprint:      { variant: "fingerprint" },
  face:             { variant: "face" },
  "screen-lock":    { variant: "screen-lock" },
  pending:          { variant: "fingerprint", busy: true },
  cancelled:        { variant: "fingerprint" },
  "platform-retry": { variant: "fingerprint" },
  unavailable:      { variant: "fingerprint", unavailable: true },
};
export const STATES = Object.keys(FIXTURES).map((k) => `unlock_${k}`);

export function render(host, id, { mode, params = {} }) {
  const fx = FIXTURES[id.replace(/^unlock_/, "")];
  if (!fx) return null;
  const life = newLife(host, mode);
  const ctx = () => authCtx(mode);
  const live = !!params.live;
  const auth = signedIn(ctx());
  const number = auth ? auth.number : null;
  const m = { variant: fx.variant, busy: !live && !!fx.busy, unavailable: !!fx.unavailable, fails: 0 };
  if (params.saved) Object.assign(m, params.saved, { busy: false });   // back from sign-in: as it was (a pending prompt is dropped)

  // ---- markup (approved hierarchy: .screen > header.intro (logo, .head) · section.panel (notice, .prompt) · .tm-actionbar.footer) ----
  const icon = h("span", { class: "tm-icon", id: "variant-icon", "data-icon": "fingerprint" });
  const prompt = h("div", { class: "prompt" }, h("div", { class: "prompt-icon", "aria-hidden": "true" }, icon), h("h2", { id: "ready", text: MSG("unlock.ready") }));
  const notice = h("div", { class: "tm-notice tm-notice--neutral unlock-notice", id: "unlock-notice", role: "status", hidden: true },
    h("span", { class: "tm-icon", "data-icon": "info-circle", "aria-hidden": "true" }), h("span", { id: "unlock-error", text: MSG("unlock.unavailable") }));
  const label = h("span", { id: "unlock-label" });
  const action = h("button", { class: "tm-btn tm-btn--primary tm-btn--lg tm-btn--block", id: "unlock-action", type: "button", onclick: onUnlock }, label);
  const fallback = h("button", { class: "tm-btn tm-btn--quiet tm-btn--lg tm-btn--block", id: "fallback", type: "button", onclick: onUseOtp, text: MSG("unlock.useOtp") });
  const account = h("button", { class: "tm-btn tm-btn--quiet account", id: "switch-account", type: "button", onclick: onSwitch },
    `${MSG("unlock.notYou")} `, h("strong", { text: MSG("unlock.switchAccount") }));
  const root = h("main", { class: "unlock-screen tm", "aria-label": MSG("unlock.greeting", { name: doctorFor(number).firstName }) },
    h("header", { class: "intro" },
      h("img", { class: "login-logo", src: "brand/truemeds-for-doctors.svg", alt: "truemeds for doctors" }),
      h("div", { class: "head" },
        h("h1", { class: "tm-text-title-lg", text: MSG("unlock.greeting", { name: doctorFor(number).firstName }) }),
        h("p", { text: MSG("unlock.subtitle") }))),
    h("section", { class: "panel", "aria-labelledby": "ready" }, notice, prompt),
    h("div", { class: "tm-actionbar footer" }, action, fallback, account));
  host.replaceChildren(root);

  // ---- paint ----
  function paint() {
    const v = VARIANT[m.variant];
    icon.setAttribute("data-icon", v.icon);
    action.classList.toggle("tm-btn--busy", m.busy);
    action.disabled = m.busy;
    action.setAttribute("aria-busy", String(m.busy));
    label.replaceChildren(...(m.busy ? [h("span", { class: "tm-spinner", "aria-hidden": "true" }), MSG("unlock.submitBusy")] : [MSG(v.label)]));
    // Unavailable (F2 → N1 neutral, D-47): only the notice speaks; "Use OTP instead" is the one way forward, so primary (D-66 A1).
    notice.hidden = !m.unavailable;
    prompt.hidden = m.unavailable;
    action.hidden = m.unavailable;
    fallback.classList.toggle("tm-btn--primary", m.unavailable);
    fallback.classList.toggle("tm-btn--quiet", !m.unavailable);
    if (window.TMIcons) window.TMIcons.render(root);
  }

  // ---- behaviour ----
  function onUnlock() {
    if (m.busy || m.unavailable) return;   // one prompt at a time
    m.busy = true; paint();
    life.later(() => {
      m.busy = false;
      const answer = promptAnswer("unlock", ctx().story, mode);
      if (answer === "success") {
        if (number) signIn(number, ctx());
        resetNav(); push(null, { s: HOME_STUB, live: true });   // Home; the open case once step 2 builds it (D-48)
        return;
      }
      if (answer === "unavailable") m.unavailable = true;
      if (answer === "failed") {
        m.fails += 1;   // the phone shows its own retry guidance; cancelled is not a failure
        if (m.fails >= ctx().value("returningUnlockFallbackAfter")) { m.fails = 0; paint(); toOtp(); return; }
      }
      paint();
    }, "phonePromptDelay");
  }
  function onUseOtp() { if (!m.busy) toOtp(); }
  function toOtp() {
    saveCurrent({ saved: { ...m } });
    if (!number) { push(null, { s: "sign-in_default", live: true, number: "" }); return; }
    const r = requestCode(number, ctx());
    if (r.outcome === "sent" || r.outcome === "locked") {
      push(null, { s: r.outcome === "sent" ? "otp_default" : "otp_locked", live: true, number, resendAt: r.resendAt, until: r.until });
      return;
    }
    const button = r.outcome === "too-many-tries" ? "wait" : r.outcome === "inactive" ? "inactive" : "default";
    push(null, { s: "sign-in_default", live: true, number,
      saved: { number, notice: r.outcome, button, until: r.until || 0, error: null, kb: false, focused: false, replace: false } });
  }
  function onSwitch() {
    if (m.busy) return;
    saveCurrent({ saved: { ...m } });
    push(null, { s: "sign-in_default", live: true, number: "" });   // another doctor signs in from an empty number
  }

  // First screen when the app opens: no Back control, and the phone's back gesture stays here (D-47).
  setScreenBack(() => {});
  paint();
  return { journey: "unlock" };
}
