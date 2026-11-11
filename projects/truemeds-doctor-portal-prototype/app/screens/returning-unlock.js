// Returning unlock (entry journey, step 1). Markup and classes lifted from ui-screens/returning-unlock/returning-unlock.html;
// styles in returning-unlock.css. Every word through MSG(); the doctor's name comes from mock profile data (D-92), never typed here.
// Behaviour: app-logic §2 "Faster sign-in", feedback-state-map "Returning unlock", D-45, D-47, D-64, D-66 A1, A-19, D-105; plan B12, B14.
//   The phone's prompt opens by itself once when the app opens on this screen (D-109 §3); the Unlock button stays for a retry ·
//   success → Home (the open case from step 2 on) · cancelled → the screen as it is (today's screen), not counted, no new prompt · failed → the phone owns the retry (screen unchanged); after 3 failed
//   tries (setting, [MOCK]) → the same as Use OTP instead · unavailable → standing neutral notice at the top of the panel, Use OTP
//   instead is the primary · two buttons only, no Switch account (D-105) · phone Back stays (first screen when the app opens, D-47).
//   Use OTP instead (and the 3-failure fallback) opens Sign-in with the remembered number filled in; no SMS until Send OTP (D-105).
//   That Sign-in is the root, as any Sign-in: no Back, phone back leaves the app (D-101); reopening the app shows unlock again.
import { MSG } from "../core/msg.js";
import { push, setScreenBack, saveCurrent, reset as resetNav } from "../core/nav.js";
import { h } from "../core/dom.js";
import { signedIn, signIn } from "../core/auth.js";
import { promptAnswer } from "../core/unlock.js";
import { HOME_STUB } from "../core/faster-signin.js";
import { doctorFor } from "../data/doctor.js";
import { authCtx, newLife } from "./entry-ctx.js";
import { band } from "./band.js";

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
  // The one band (D-107; a title carrying a name may wrap, variant 2) · panel: tile → 16 → caption (D-108) · the pinned bar.
  const root = h("main", { class: "unlock-screen tm", "aria-label": MSG("unlock.greeting", { name: doctorFor(number).firstName }) },
    band({ title: MSG("unlock.greeting", { name: doctorFor(number).firstName }), subtitle: MSG("unlock.subtitle") }),
    h("section", { class: "entry-panel panel", "aria-labelledby": "ready" }, notice, prompt),
    h("div", { class: "tm-actionbar footer" }, action, fallback));
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
        if (m.fails >= ctx().value("returningUnlockFallbackAfter")) { m.fails = 0; paint(); toSignIn(); return; }
      }
      paint();
    }, "phonePromptDelay");
  }
  function onUseOtp() { if (!m.busy) toSignIn(); }
  // D-105: Sign-in with the remembered number filled in, nothing sent. It starts a fresh history (the root, like any Sign-in):
  // no Back, and the phone's back gesture does not return to unlock. Editing the number there signs in another doctor.
  function toSignIn() {
    resetNav();
    push(null, { s: "sign-in_default", live: true, number: number || "", prefilled: !!number });
  }

  // First screen when the app opens: no Back control, and the phone's back gesture stays here (D-47).
  setScreenBack(() => {});
  paint();
  // D-109 §3: arriving live (the app opened on unlock), the phone's prompt opens by itself, once. Back from Sign-in or a
  // re-render of the same step doesn't prompt again; a picture state (?s=, capture) never does.
  if (live && !params.saved && !params.prompted && mode !== "capture" && !m.unavailable) {
    saveCurrent({ prompted: true });
    onUnlock();
  }
  return { journey: "unlock" };
}
