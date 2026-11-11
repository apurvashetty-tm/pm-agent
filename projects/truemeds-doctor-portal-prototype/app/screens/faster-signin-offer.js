// Faster sign-in offer (entry journey, step 1). Markup and classes lifted from ui-screens/faster-signin-offer/faster-signin-offer.html;
// styles in faster-signin-offer.css. Every word through MSG().
// Behaviour: app-logic §2 "Faster sign-in", feedback-state-map "Faster sign-in offer", D-45, D-47, D-61, D-64, D-65, D-66, A-19.
//   Shown at each OTP sign-in until turned on, at most fasterOfferMax times (D-104; the count is remembered per number) · Turn on → phone prompt (mock unlock, B14) → Home ·
//   cancelled → back to the offer as it was, no message · failed → "Couldn't turn on…" in the bar above Try again ·
//   Try again = Turn on · offline → "You're offline…" · Not now → Home · phone Back = Not now (no Back control, D-47).
//   unavailable (D-93, revised) → screen unchanged; warning notice in the bar (`unlock.unavailable`, same slot as offline / failed),
//   the primary reads Continue (`offer.continue`) → Home, Not now hidden; not enabled; counted as shown (D-104).
// A state opened directly (?s=offer_<state>) shows the approved picture's moment, then behaves live from there.
import { MSG } from "../core/msg.js";
import { push, setScreenBack, reset as resetNav, saveCurrent } from "../core/nav.js";
import { h } from "../core/dom.js";
import { signedIn } from "../core/auth.js";
import { promptAnswer } from "../core/unlock.js";
import { markOffered, setEnabled, HOME_STUB } from "../core/faster-signin.js";
import { PICTURE_NUMBER } from "../data/test-numbers.js";
import { authCtx, newLife } from "./entry-ctx.js";
import { band } from "./band.js";

// Wording follows the phone (D-45, D-64); never suggests Truemeds stores biometric data.
const VARIANT = {
  fingerprint:   { icon: "fingerprint", sub: "offer.fingerprintSub", point: "offer.fingerprintPoint", trust: "offer.fingerprintTrust" },
  "face-id":     { icon: "face-id", sub: "offer.faceIdSub", point: "offer.faceIdPoint", trust: "offer.faceIdTrust" },
  "screen-lock": { icon: "lock", sub: "offer.screenLockSub", point: "offer.screenLockPoint", trust: "offer.screenLockTrust" },
};
const NOTICE = {
  failed:  { cls: "tm-notice--error", icon: "alert-circle", key: "offer.enableFailed" },
  offline: { cls: "tm-notice--warning", icon: "alert-triangle", key: "offer.offline" },
  unavailable: { cls: "tm-notice--warning", icon: "alert-triangle", key: "unlock.unavailable" },   // D-93: the phone blocks it (warning, not error)
};
// Picture moments (same table as the approved file).
const FIXTURES = {
  fingerprint:     { variant: "fingerprint" },
  "face-id":       { variant: "face-id" },
  "screen-lock":   { variant: "screen-lock" },
  enabling:        { variant: "fingerprint", busy: true },
  "enable-failed": { variant: "fingerprint", notice: "failed", retry: true },
  offline:         { variant: "fingerprint", notice: "offline" },
  unavailable:     { variant: "fingerprint", notice: "unavailable", unavailable: true },   // D-93 (approved; picture joins ui-screens/ at D-94 step 5)
};
export const STATES = Object.keys(FIXTURES).map((k) => `offer_${k}`);

export function render(host, id, { mode, params = {} }) {
  const fx = FIXTURES[id.replace(/^offer_/, "")];
  if (!fx) return null;
  const life = newLife(host, mode);
  const ctx = () => authCtx(mode);
  const live = !!params.live;
  const number = params.number || (signedIn(ctx()) || {}).number || PICTURE_NUMBER;
  const m = { variant: fx.variant, busy: !live && !!fx.busy, notice: live && !fx.unavailable ? null : fx.notice || null, retry: !live && !!fx.retry, unavailable: !!fx.unavailable };
  // D-104: each live showing after an OTP sign-in counts once toward fasterOfferMax (a re-render of the same step doesn't count again).
  if (live && !params.counted) { markOffered(number, ctx()); saveCurrent({ counted: true }); }

  // ---- markup (approved hierarchy: .screen > .top (logo, h1, .sub) · .panel (hero, points) · .tm-actionbar.footer) ----
  const v = () => VARIANT[m.variant];
  const heroIcon = h("span", { class: "tm-icon", "data-icon": v().icon });
  const noticeIcon = h("span", { class: "tm-icon", "data-icon": "alert-circle", "aria-hidden": "true" });
  const noticeText = h("span", {});
  const notice = h("div", { class: "tm-notice notice-slot", id: "offer-notice", role: "status", hidden: true }, noticeIcon, noticeText);
  const heroWrap = h("div", { class: "hero-wrap" }, h("div", { class: "hero-ic", "aria-hidden": "true" }, heroIcon));
  const turnOnLabel = h("span", { id: "turn-on-label" });
  const turnOn = h("button", { class: "tm-btn tm-btn--primary tm-btn--lg tm-btn--block", id: "turn-on", type: "button", onclick: onTurnOn }, turnOnLabel);
  const notNow = h("button", { class: "tm-btn tm-btn--quiet tm-btn--lg tm-btn--block", id: "not-now", type: "button", onclick: onNotNow, text: MSG("offer.notNow") });
  const point = (icon, title, line) => h("li", {}, h("span", { class: "tm-icon", "data-icon": icon, "aria-hidden": "true" }),
    h("div", { class: "pt-txt" }, h("p", { class: "pt-t", text: title }), h("p", { class: "pt-d", text: line })));
  // The one band (D-107) · panel: hero tile → 32 → points, 16 apart (D-108) · the pinned bar.
  const root = h("section", { class: "offer-screen tm", "aria-labelledby": "offer-title" },
    band({ title: MSG("offer.title"), titleId: "offer-title", subtitle: MSG(v().sub) }),
    h("div", { class: "entry-panel panel" },
      heroWrap,
      h("ul", { class: "points" },
        point("circle-check", MSG(v().point), MSG("offer.pointNoWait")),
        point("lock", MSG(v().trust), MSG("offer.pointStored")),
        point("settings", MSG("offer.pointChange"), MSG("offer.pointChangeLine")))),
    h("div", { class: "tm-actionbar footer" }, notice, turnOn, notNow));
  host.replaceChildren(root);

  // ---- paint ----
  function paint() {
    const n = m.notice ? NOTICE[m.notice] : null;
    notice.hidden = !n;
    notice.className = `tm-notice notice-slot${n ? " " + n.cls : ""}`;
    noticeIcon.setAttribute("data-icon", n ? n.icon : "alert-circle");
    noticeText.textContent = n ? MSG(n.key) : "";
    // L2: loading primary = brand fill, white label and spinner (central .tm-btn--busy); Not now waits for the prompt
    turnOn.classList.toggle("tm-btn--busy", m.busy);
    turnOn.disabled = m.busy;
    turnOn.setAttribute("aria-busy", String(m.busy));
    turnOnLabel.replaceChildren(...(m.busy ? [h("span", { class: "tm-spinner", "aria-hidden": "true" }), MSG("offer.submitBusy")]
      : [MSG(m.unavailable ? "offer.continue" : m.retry ? "offer.retry" : "offer.submit")]));
    notNow.disabled = m.busy;
    // D-93: one action left — the primary reads Continue, Not now is hidden (one primary per context).
    notNow.hidden = m.unavailable;
    if (window.TMIcons) window.TMIcons.render(root);
  }

  // ---- behaviour ----
  // Turn on and Try again both open the phone prompt (one request at a time).
  function onTurnOn() {
    if (m.busy) return;
    if (m.unavailable) { onContinue(); return; }   // D-93: the primary is Continue
    if (ctx().offline) { m.notice = "offline"; paint(); return; }   // D-66: needs the server; the prompt does not open
    const before = { notice: m.notice, retry: m.retry };
    m.busy = true; m.notice = null; paint();
    life.later(() => {
      m.busy = false;
      const answer = promptAnswer("enable", ctx().story, mode);
      if (answer === "enabled") { setEnabled(number, ctx(), true); toHome(); return; }   // offer.enabled: no toast (Profile shows it)
      if (answer === "cancelled") Object.assign(m, before);                             // offer.cancelled: as it was, no message
      else if (answer === "unavailable") Object.assign(m, { unavailable: true, notice: "unavailable", retry: false });   // D-93: not enabled
      else Object.assign(m, { notice: "failed", retry: true });                          // failed
      paint();
    }, "phonePromptDelay");
  }
  // D-93: Continue → Home. Faster sign-in stays off (Profile can turn it on later); this showing is already counted (D-104).
  function onContinue() { toHome(); }
  function onNotNow() {
    if (m.busy) return;
    // offer.not-now: this showing is already counted; offered again at the next OTP sign-in, up to fasterOfferMax (D-104)
    toHome();
  }
  // Signed in: the entry journey is not in history any more (Back never returns to the offer).
  function toHome() { resetNav(); push(null, { s: HOME_STUB, live: true }); }

  // No Back control (D-47). The phone's back gesture = Not now; while the prompt is open it does nothing.
  setScreenBack(() => { if (m.busy) return; if (m.unavailable) onContinue(); else onNotNow(); });   // D-93: Back = the only action
  paint();
  return { journey: "offer" };
}
