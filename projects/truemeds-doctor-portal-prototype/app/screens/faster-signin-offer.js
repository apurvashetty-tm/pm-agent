// Faster sign-in offer (entry journey, step 1). Markup and classes lifted from ui-screens/faster-signin-offer/faster-signin-offer.html;
// styles in faster-signin-offer.css. Every word through MSG().
// Behaviour: app-logic §2 "Faster sign-in", feedback-state-map "Faster sign-in offer", D-45, D-47, D-61, D-64, D-65, D-66, A-19.
//   Shown once (plan B12: "offered" is remembered per number) · Turn on → phone prompt (mock unlock, B14) → Home ·
//   cancelled → back to the offer as it was, no message · failed → "Couldn't turn on…" in the bar above Try again ·
//   Try again = Turn on · offline → "You're offline…" · Not now → Home · phone Back = Not now (no Back control, D-47).
//   [OPEN DECISION] the prompt answering "unavailable" here is not in app-logic §2: handled as a failed turn-on (safe placeholder).
// A state opened directly (?s=offer_<state>) shows the approved picture's moment, then behaves live from there.
import { MSG } from "../core/msg.js";
import { push, setScreenBack, reset as resetNav } from "../core/nav.js";
import { h } from "../core/dom.js";
import { signedIn } from "../core/auth.js";
import { promptAnswer } from "../core/unlock.js";
import { markOffered, setEnabled, HOME_STUB } from "../core/faster-signin.js";
import { PICTURE_NUMBER } from "../data/test-numbers.js";
import { authCtx, newLife } from "./entry-ctx.js";

// Wording follows the phone (D-45, D-64); never suggests Truemeds stores biometric data.
const VARIANT = {
  fingerprint:   { icon: "fingerprint", sub: "offer.fingerprintSub", line: "offer.fingerprintLine", trust: "offer.fingerprintTrust" },
  "face-id":     { icon: "face-id", sub: "offer.faceIdSub", line: "offer.faceIdLine", trust: "offer.faceIdTrust" },
  "screen-lock": { icon: "lock", sub: "offer.screenLockSub", line: "offer.screenLockLine", trust: "offer.screenLockTrust" },
};
const NOTICE = {
  failed:  { cls: "tm-notice--error", icon: "alert-circle", key: "offer.enableFailed" },
  offline: { cls: "tm-notice--warning", icon: "alert-triangle", key: "offer.offline" },
};
// Picture moments (same table as the approved file).
const FIXTURES = {
  fingerprint:     { variant: "fingerprint" },
  "face-id":       { variant: "face-id" },
  "screen-lock":   { variant: "screen-lock" },
  enabling:        { variant: "fingerprint", busy: true },
  "enable-failed": { variant: "fingerprint", notice: "failed", retry: true },
  offline:         { variant: "fingerprint", notice: "offline" },
};
export const STATES = Object.keys(FIXTURES).map((k) => `offer_${k}`);

export function render(host, id, { mode, params = {} }) {
  const fx = FIXTURES[id.replace(/^offer_/, "")];
  if (!fx) return null;
  const life = newLife(host, mode);
  const ctx = () => authCtx(mode);
  const live = !!params.live;
  const number = params.number || (signedIn(ctx()) || {}).number || PICTURE_NUMBER;
  const m = { variant: fx.variant, busy: !live && !!fx.busy, notice: live ? null : fx.notice || null, retry: !live && !!fx.retry };
  // Offered once (D-45): shown live after a first OTP sign-in → remembered, so it is not shown again on this phone.
  if (live) markOffered(number, ctx());

  // ---- markup (approved hierarchy: .screen > .top (logo, h1, .sub) · .panel (hero, points) · .tm-actionbar.footer) ----
  const v = () => VARIANT[m.variant];
  const heroIcon = h("span", { class: "tm-icon", "data-icon": v().icon });
  const noticeIcon = h("span", { class: "tm-icon", "data-icon": "alert-circle", "aria-hidden": "true" });
  const noticeText = h("span", {});
  const notice = h("div", { class: "tm-notice notice-slot", id: "offer-notice", role: "status", hidden: true }, noticeIcon, noticeText);
  const turnOnLabel = h("span", { id: "turn-on-label" });
  const turnOn = h("button", { class: "tm-btn tm-btn--primary tm-btn--lg tm-btn--block", id: "turn-on", type: "button", onclick: onTurnOn }, turnOnLabel);
  const notNow = h("button", { class: "tm-btn tm-btn--quiet tm-btn--lg tm-btn--block", id: "not-now", type: "button", onclick: onNotNow, text: MSG("offer.notNow") });
  const point = (icon, title, line) => h("li", {}, h("span", { class: "tm-icon", "data-icon": icon, "aria-hidden": "true" }),
    h("div", {}, h("p", { class: "pt-t", text: title }), h("p", { class: "pt-d", text: line })));
  const root = h("section", { class: "offer-screen tm", "aria-labelledby": "offer-title" },
    h("div", { class: "top" },
      h("img", { class: "login-logo", src: "brand/truemeds-for-doctors.svg", alt: "truemeds for doctors" }),
      h("h1", { class: "tm-text-title-lg", id: "offer-title", text: MSG("offer.title") }),
      h("p", { class: "sub", text: MSG(v().sub) })),
    h("div", { class: "panel" },
      h("div", { class: "hero-wrap" }, h("div", { class: "hero-ic", "aria-hidden": "true" }, heroIcon)),
      h("ul", { class: "points" },
        point("circle-check", MSG("offer.pointNoWait"), MSG(v().line)),
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
      : [MSG(m.retry ? "offer.retry" : "offer.submit")]));
    notNow.disabled = m.busy;
    if (window.TMIcons) window.TMIcons.render(root);
  }

  // ---- behaviour ----
  // Turn on and Try again both open the phone prompt (one request at a time).
  function onTurnOn() {
    if (m.busy) return;
    if (ctx().offline) { m.notice = "offline"; paint(); return; }   // D-66: needs the server; the prompt does not open
    const before = { notice: m.notice, retry: m.retry };
    m.busy = true; m.notice = null; paint();
    life.later(() => {
      m.busy = false;
      const answer = promptAnswer("enable", ctx().story, mode);
      if (answer === "enabled") { setEnabled(number, ctx(), true); toHome(); return; }   // offer.enabled: no toast (Profile shows it)
      if (answer === "cancelled") Object.assign(m, before);                             // offer.cancelled: as it was, no message
      else Object.assign(m, { notice: "failed", retry: true });                          // failed (and [OPEN DECISION] unavailable)
      paint();
    }, "phonePromptDelay");
  }
  function onNotNow() {
    if (m.busy) return;
    markOffered(number, ctx());   // offer.not-now: re-offer timing is OQ-023 (safe placeholder: never; Profile has the switch)
    toHome();
  }
  // Signed in: the entry journey is not in history any more (Back never returns to the offer).
  function toHome() { resetNav(); push(null, { s: HOME_STUB, live: true }); }

  // No Back control (D-47). The phone's back gesture = Not now; while the prompt is open it does nothing.
  setScreenBack(() => { if (!m.busy) onNotNow(); });
  paint();
  return { journey: "offer" };
}
