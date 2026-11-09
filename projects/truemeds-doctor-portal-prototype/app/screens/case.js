// Case page (plan v3.2 step 3) and the host of Prescribe (step 4) and the Rx viewer. Markup and classes lifted from
// ui-screens/case/case.html as the approved pictures render it (compact header D-49, case tools card with Order details and
// View Rx, medicines card, notes card, pinned action bar with its notice band, leave sheet, Rx viewer); styles in case.css.
// Behaviour: app-logic §4 (stages, Back, leave / release, empty case), §8 (medicine rows), §9 (order details, View Rx, notes),
// §10 (loading, load failed, offline) and the case rows of docs/feedback-state-map.md. Every word through MSG().
// Calling (step 5, run A2) plugs into the same page: `stage` is ready → calling → valid → closed. This run builds the calling
// look the step-3 pictures show (a-back-blocked) and the closed card (case.closed); the call simulator is A2's.
import { MSG } from "../core/msg.js";
import { push, reset as resetNav, setScreenBack } from "../core/nav.js";
import { store } from "../core/store.js";
import { h } from "../core/dom.js";
import { clock } from "../core/clock.js";
import { value } from "../core/settings.js";
import { work, saveWork, currentCase, openCase, updateCase, updateMedicine, releaseCase, countConfirmed, availability } from "../core/session.js";
import { icon, paint, btn, busyBtn, notice, statusLine, actionBar, sheet, toast, caseHeader, medicineRow, focusSheet, revealAboveKeyboard, watchKeyboard } from "./parts.js";
import { newLife } from "./entry-ctx.js";
import { prescribeScreen } from "./prescribe.js";
import { rxViewer } from "./rx-viewer.js";
import { mockTextKeyboard } from "../shell/mock-keyboard.js";
import { TYPED } from "../data/cases.js";

const MIN = 60 * 1000;
// Picture moments (case.html fixtures). kind: the case variation; overlay: leave | rx; bar: the bar's result notice.
const CASE_FX = {
  "t01-ready": {}, "a-top": {}, "a-scrolled": { scroll: true }, "a-order-details": { expanded: true },
  "a-rx-viewer": { overlay: "rx" }, "d-rx-failed": { overlay: "rx", rxFailed: true },
  "a-notes-typing": { typing: "symptoms", symptoms: TYPED.symptoms },
  "a-leave-sheet": { overlay: "leave" }, "s7e-leave-sheet": { overlay: "leave" }, "a-releasing": { overlay: "leave", releasing: true },
  "a-release-failed": { bar: "release-failed" }, "a-loading": { loading: true }, "a-load-failed": { loadFailed: true },
  "a-offline": { offline: true }, "a-offline-action": { bar: "offline-action" },
  "a-no-medicines": { kind: "empty" }, "a-long-content": { kind: "long-names" }, "s-10-medicines": { kind: "ten-medicines" },
  "s-medicine-disabled": { disable: 2 }, "s-optional-empty": { noDetails: true },
  "a-back-blocked": { stage: "calling", toast: true },
  "a-confirm-busy": { stage: "valid", allRx: true, confirming: true }, "a-confirm-failed": { stage: "valid", allRx: true, bar: "confirm-failed" },
  "t10a-confirmed": { stage: "closed", allRx: true }, "e-availability-ended": { stage: "closed", allRx: true, availEnded: true },
};
// Prescribe moments (prescribe/d-*): which medicine, the backend's schedule for it, what the doctor has done on the screen.
const D_FX = {
  "d-default": { med: 1 }, "d-header-white": { med: 1 }, "d-scrolled": { med: 1, scroll: true },
  "d-error-dose": { med: 1, edit: { interval: "daily", m: 0, a: 0, n: 0 }, validate: true },
  "d-error-other": { med: 4, edit: { doseOther: true, doseOtherVal: "7..5" }, validate: true, kb: "decimal" },
  "d-sos-on": { med: 1, edit: { sos: true } }, "d-notes-keyboard": { med: 1, kb: "text" },
  "d-discard-sheet": { med: 1, edit: { note: TYPED.note }, sheet: "discard" }, "d-disable-sheet": { med: 1, sheet: "disable" },
  "d-injection-default": { med: 4 }, "d-syrup": { med: 5 },
  "d-drops": { scenario: "pilot_ha_free", med: 3 }, "d-cream": { scenario: "pilot_no_ha_free", med: 4 }, "d-inhaler": { scenario: "pilot_ha_skipped_customer", med: 3 },
  "d-every-x-hours": { med: 1, medPatch: { interval: "every_x_hours", hours: 6 } }, "d-sos-only": { med: 2, medPatch: { interval: "sos" } },
  "d-weekly": { med: 3, medPatch: { interval: "weekly" } }, "d-alt-days": { med: 1, medPatch: { interval: "alt_days" } }, "d-monthly": { med: 1, medPatch: { interval: "monthly" } },
  "d-duration-picker": { med: 1, edit: { durOpen: true }, scroll: "duration" }, "d-food-selected": { med: 1, edit: { food: "before_food" }, scroll: "food" },
  "d-disabled": { med: 1, medPatch: { status: "disabled", disableReason: "prescribe.reasonDeclined" } },
};
export const STATES = [...Object.keys(CASE_FX), ...Object.keys(D_FX)];

function applyFixture(fx, d) {
  const st = store.get();
  const scenario = (d && d.scenario) || (fx.kind || d ? "cat4" : st.scenario || "cat4");
  // A case only arrives while the doctor is available: a fixture keeps the session's availability, or starts 30 min [MOCK ASSUMPTION].
  if (!work().avail || availability().state === "none") saveWork({ avail: fx.availEnded ? null : { endsAt: clock.now() + 30 * MIN }, ended: fx.availEnded ? "idle" : null, stopping: false });
  if (fx.availEnded) saveWork({ avail: null, ended: "idle" });
  if (work().rxToday === 0) saveWork({ rxToday: 3 });
  const kind = fx.kind || (!d && (st.story || {}).caseKind) || "normal";
  const c = openCase(scenario, kind === "rx-failed" || kind === "release-refused" ? "normal" : kind);
  c.fxKind = kind;
  if (fx.disable) Object.assign(c.medicines[fx.disable - 1], { status: "disabled", disableReason: MSG("prescribe.reasonDeclined") });
  if (fx.allRx) c.medicines.forEach((m) => { m.status = "prescribed"; });
  if (fx.noDetails) { c.created = ""; c.delivery = ""; c.payment = ""; }
  if (fx.symptoms) c.notes.symptoms = fx.symptoms;
  if (d && d.medPatch) Object.assign(c.medicines.find((m) => m.id === d.med), d.medPatch, d.medPatch.disableReason ? { disableReason: MSG(d.medPatch.disableReason) } : {});
  c.stage = fx.stage || "ready";
  if (fx.stage && fx.stage !== "ready") c.attempted = true;
  saveWork();
  return c;
}

export function render(host, id, { mode, params = {} }) {
  const fx = CASE_FX[id] || (D_FX[id] ? {} : null);
  if (!fx) return null;
  const d = D_FX[id] || null;
  const life = newLife(host, mode);
  const live = !!params.live;
  const capture = mode === "capture";
  let c = live && currentCase() ? currentCase() : applyFixture(fx, d);
  if (!c) { resetNav(); push(null, { s: "home_active", live: true }); return { journey: "home" }; }
  const story = () => store.get().story || {};
  const v = (k) => value(k, mode);

  const ui = {
    overlay: live ? null : fx.overlay || (d ? "prescribe" : null),
    releasing: !live && !!fx.releasing, bar: live ? null : fx.bar || null,
    loading: !live && !!fx.loading, loadFailed: !live && !!fx.loadFailed,
    offlineFx: !live && !!fx.offline, expanded: !live && !!fx.expanded,
    rxFailed: !live && (!!fx.rxFailed || c.fxKind === "rx-failed"), confirming: !live && !!fx.confirming,
    toastUntil: !live && fx.toast ? (capture ? Number.MAX_SAFE_INTEGER : Date.now() + v("toastDuration")) : 0,
    typing: !live && capture ? fx.typing || null : null,
    medId: d ? d.med : null,
  };
  const offline = () => ui.offlineFx || store.get().offline === "yes";
  const first = () => c.patient.split(" ")[0];
  const closed = () => c.stage === "closed";
  const empty = () => c.medicines.length === 0;
  const backAllowed = () => c.stage === "ready" && !c.attempted && !ui.loading;   // header Back on 1, 3 and 4 only, never once the patient answered (D-80 pt 1)

  const root = h("div", { class: "case-screen tm" });
  host.replaceChildren(root);
  const symptoms = h("textarea", { id: "symptoms-input", placeholder: MSG("case.symptomsPlaceholder"), rows: "3" });
  const doctorNotes = h("textarea", { id: "doctor-notes-input", placeholder: MSG("case.doctorNotesPlaceholder"), rows: "3" });
  // Notes are editable until Confirm and kept if the connection drops (app-logic §9); saved with the case only on confirm.
  symptoms.addEventListener("input", () => { c.notes.symptoms = symptoms.value; saveWork(); });
  doctorNotes.addEventListener("input", () => { c.notes.doctor = doctorNotes.value; saveWork(); });
  const scroller = h("div", { class: "case-scroll", id: "case-scroll" });

  // ---------- pieces ----------
  function tools() {
    const details = !!(c.created || c.delivery || c.payment);   // hidden when the order has none of these (app-logic §9)
    const readonly = closed() || ui.confirming;
    const card = h("div", { id: "case-tools", class: `tm-card${readonly ? " tm-readonly" : ""}${details ? "" : " ct--no-details"}` },
      h("div", { class: "ct-row" },
        details ? h("button", { class: "ct-details", id: "ct-details", type: "button", "aria-expanded": String(ui.expanded), onclick: () => { ui.expanded = !ui.expanded; draw(); } },
          h("span", { text: MSG("case.orderDetails") }), icon("info-circle")) : null,
        h("span", { id: "ct-actions" }, h("button", { id: "pdb-view-rx-btn", class: "tm-btn tm-btn--secondary", type: "button", onclick: () => { if (!ui.confirming) openOverlay("rx"); } },   // keeps its outlined look while confirming (D-81 F24–F25), takes no tap (app-logic §9)
          icon("clipboard-text", "tm-icon--16"), MSG("case.viewRx")))));
    if (details && ui.expanded) card.append(h("div", { id: "pdb-order-expand" },
      [["case.orderCreated", c.created, "display-order-created"], ["case.expectedDelivery", c.delivery, "display-order-delivery"], ["case.payment", c.payment, "display-payment-mode"]]
        .filter(([, val]) => val).map(([k, val, idv]) => h("div", { class: "pdb-expand-item" }, h("span", { class: "pdb-expand-label", text: MSG(k) }), h("span", { class: "pdb-expand-value", id: idv, text: val })))));
    return card;
  }
  function scriptCard() {   // end-of-call script, from the tap on Call while a call may be live (D-58 pt 18); Cat4 / HA skipped copy
    return h("div", { id: "action-zone", class: "tm-card" }, h("h2", { class: "tm-section-title section-title--inline", text: MSG("case.scriptTitle") }),
      h("div", { id: "pre-call-brief", class: "tm-notice", role: "status" }, h("div", { class: "pcb-body" }, h("div", { class: "pcb-text", id: "pcb-text", text: MSG("call.scriptCat4") }))));
  }
  function medicines() {
    const readonly = closed() || ui.confirming;
    const n = c.medicines.length;
    return h("div", { id: "medicines-section" },
      h("div", { id: "medicines-header", class: readonly ? "tm-readonly" : null },
        h("h2", { class: "tm-section-title section-title--inline", text: MSG(closed() ? "case.medicinesTitleClosed" : "case.medicinesTitle") }),
        empty() ? null : h("span", { id: "medicines-count", text: n === 1 ? MSG("case.medicinesCountOne") : MSG("case.medicinesCount", { n }) })),
      h("div", { id: "medicines-list", class: readonly ? "tm-readonly" : null }, c.medicines.map((m) => medicineRow(m, { readonly, onOpen: (mid) => openOverlay("prescribe", mid) }))));
  }
  function notes() {
    const ro = closed() || ui.confirming;
    symptoms.readOnly = ro; doctorNotes.readOnly = ro;
    if (document.activeElement !== symptoms) symptoms.value = c.notes.symptoms;
    if (document.activeElement !== doctorNotes) doctorNotes.value = c.notes.doctor;
    const field = (lbl, forId, ta) => h("div", { class: `tm-field${ro ? " tm-field--readonly" : ""}` }, h("label", { class: "tm-field__label", for: forId, text: MSG(lbl) }), h("div", { class: "tm-field__control" }, ta));
    return h("div", { id: "notes-section" }, h("h2", { class: "tm-section-title", text: MSG("case.notesTitle") }),
      field("case.symptomsLabel", "symptoms-input", symptoms), field("case.doctorNotesLabel", "doctor-notes-input", doctorNotes));
  }
  function closedCard() {
    return h("div", { id: "success-toast", class: "tm-status-card tm-status-card--success", role: "status" },
      h("div", { class: "tm-status-card__icon" }, icon("circle-check", "tm-icon--24")),
      h("div", { class: "tm-status-card__body" }, h("div", { class: "tm-status-card__title", text: MSG("case.confirmedTitle") })));
  }
  const BAR = {
    "release-failed": () => notice("error", MSG("case.releaseFailed")),
    "offline-action": () => notice("error", MSG("case.offlineAction")),
    "confirm-failed": () => notice("error", MSG("case.confirmFailed")),
    "confirm-blocked": () => notice("warning", c.medicines.filter((m) => m.status === "pending").length === 1 ? MSG("case.confirmBlockedOne") : MSG("case.confirmBlocked", { n: c.medicines.filter((m) => m.status === "pending").length })),
  };
  function bar() {
    const lg = "tm-btn--lg tm-btn--block";
    const t = Date.now() < ui.toastUntil ? h("div", { class: "case-toast" }, toast(blockedText())) : null;
    let band = ui.bar && BAR[ui.bar] ? BAR[ui.bar]() : null;
    if (!band && offline() && !closed()) band = notice("warning", MSG("case.offline"));   // D-54: offline blocks the main action
    let kids;
    if (ui.loadFailed) kids = [btn(MSG("common.tryAgain"), `tm-btn--primary ${lg}`, onRetryLoad)];
    else if (closed()) {
      const ended = availability().state === "none";
      kids = ended ? [btn(MSG("case.backToHome"), `tm-btn--primary ${lg}`, toHome, { id: "concept-back-home" })]
        : [btn([MSG("case.requestNext"), " ", icon("arrow-right")], `tm-btn--primary ${lg}`, () => toHome(true), { id: "next-order-btn" }), btn(MSG("case.backToHome"), `tm-btn--quiet ${lg}`, () => toHome(), { id: "concept-back-home" })];
    } else if (c.stage === "calling") kids = [statusLine(MSG("call.calling", { name: first() }))];
    else if (c.stage === "valid") kids = [ui.confirming ? busyBtn(MSG("case.confirming"), `tm-btn--primary ${lg}`) : btn(MSG("case.confirmPrescription"), `tm-btn--primary ${lg}`, onConfirm, { id: "main-cta-btn" })];
    else if (empty()) kids = [ui.releasing ? busyBtn(MSG("case.releasing"), `tm-btn--primary ${lg}`) : btn(MSG("case.releaseCase"), `tm-btn--primary ${lg}`, () => onRelease(true))];
    else kids = [btn([icon("phone"), MSG("case.callPatient")], `tm-btn--primary ${lg}`, onCall, { id: "call-initiate-btn" })];
    return actionBar([...kids, t], { notice: band, cls: "case-bar", id: "case-actionbar" });
  }
  function blockedText() {   // the toast breaks between its two sentences (B-21)
    const text = MSG("case.backBlocked"), at = text.indexOf(". ");
    return at < 0 ? text : [text.slice(0, at + 1) + " ", h("br"), text.slice(at + 2)];
  }
  function leaveSheet() {
    const busy = ui.releasing;
    return sheet({ title: MSG("case.leaveTitle"), subtitle: MSG("case.leaveSub"), closeDisabled: busy, onClose: closeOverlay, id: "cl-sheet",
      actions: [busy ? busyBtn(MSG("case.releasing"), "tm-btn--primary tm-btn--lg tm-btn--block") : btn(MSG("case.releaseCase"), "tm-btn--primary tm-btn--lg tm-btn--block", () => onRelease(false), { id: "cl-release" }),
        btn(MSG("case.stay"), "tm-btn--quiet tm-btn--lg tm-btn--block", closeOverlay, { id: "cl-stay", disabled: busy })] });
  }
  function skeleton() {   // D-81 F28: an Order details row, Medicines and Notes blocks, in the same places; no text, no actions
    return h("div", { class: "case-skeleton", role: "status", "aria-label": MSG("case.loadingLabel") },
      h("div", { class: "case-skel case-skel--details" }), h("div", { class: "case-skel case-skel--medicines" }), h("div", { class: "case-skel case-skel--notes" }));
  }

  // ---------- draw ----------
  let prescribeEl = null;
  function draw() {
    const focused = document.activeElement === symptoms ? symptoms : document.activeElement === doctorNotes ? doctorNotes : null;
    const head = caseHeader(c, { back: backAllowed() && !closed(), onBack: onBack, onHelp: toHelp, loading: ui.loading });
    let content;
    if (ui.loading) content = [skeleton()];
    else if (ui.loadFailed) content = [h("div", { class: "tm-card" }, notice("error", MSG("case.loadFailed")))];
    else content = [empty() && !closed() ? h("div", { class: "tm-card case-empty" }, notice("warning", MSG("case.noMedicines"))) : null,
      tools(), closed() ? closedCard() : null, c.stage === "calling" ? scriptCard() : null, medicines(), notes()];
    scroller.replaceChildren(...content.filter(Boolean));
    const overlay = ui.overlay === "leave" ? leaveSheet() : ui.overlay === "rx" ? rxViewer(c, { mode, failed: ui.rxFailed, onClose: closeOverlay, onRetry: onRxRetry, later: life.later }) : null;
    if (ui.overlay !== "prescribe") prescribeEl = null;
    const kb = ui.typing ? mockTextKeyboard() : null;
    root.replaceChildren(head, scroller, ui.loading ? "" : bar(), overlay || "", ui.overlay === "prescribe" ? prescribeEl || (prescribeEl = makePrescribe()) : "", kb || "");
    root.classList.toggle("is-closed", closed());
    root.classList.toggle("kb-open", !!kb);
    root.classList.toggle("is-loading", ui.loading);
    paint(root);
    if (focused) focused.focus({ preventScroll: true });
    if (overlay && ui.overlay === "leave" && !capture) focusSheet(overlay);
  }
  function makePrescribe() {
    const med = c.medicines.find((m) => m.id === ui.medId);
    if (!med) { ui.overlay = null; return ""; }
    return prescribeScreen(med, {
      mode, fixture: live ? null : d, later: life.later,
      onSave(patch) { updateMedicine(med.id, { ...patch, status: "prescribed", disableReason: null }); closeOverlay(); },   // re-enables a disabled medicine (D-20)
      onDisable(reason) { updateMedicine(med.id, { status: "disabled", disableReason: reason }); closeOverlay(); },   // removed from the order (D-59)
      onClose: closeOverlay,
    });
  }

  // ---------- behaviour ----------
  function openOverlay(which, medId) {
    if (closed() && which === "prescribe") return;
    ui.overlay = which; ui.medId = medId ?? ui.medId; ui.rxFailed = which === "rx" && c.fxKind === "rx-failed"; draw();
  }
  function closeOverlay() { if (ui.releasing) return; ui.overlay = null; draw(); }
  function onRxRetry() { ui.rxFailed = c.fxKind === "rx-failed" && story().caseKind === "rx-failed"; draw(); }   // retry follows the story: still failing, or loads
  function onBack() {
    if (!backAllowed()) return;
    if (empty()) { onRelease(true); return; }   // empty case: Back releases directly, no sheet (D-83 CW-A6)
    ui.bar = null; ui.overlay = "leave"; draw();
  }
  // Release (OQ-024 backend): one request; refused when our call request was accepted (D-80) — the story's "release refused".
  function onRelease(direct) {
    if (ui.releasing) return;
    if (offline()) { ui.overlay = null; ui.bar = "offline-action"; draw(); return; }
    ui.releasing = true; draw();
    life.later(() => {
      ui.releasing = false;
      const refused = mode !== "demo" && (story().caseKind === "release-refused" || c.fxKind === "release-refused");
      if (refused) { ui.overlay = null; ui.bar = "release-failed"; draw(); return; }   // sheet closes over Ready; Back works again (D-81 F22)
      releaseCase(); toHome();
    });
  }
  function onCall() {
    if (offline()) { ui.bar = "offline-action"; draw(); return; }   // one error notice replaces the offline notice; nothing lost
    ui.bar = null; c.stage = "calling"; c.attempted = true; c.calledAt = clock.now(); saveWork(); draw();   // step 5 (A2) drives the call from here
  }
  function onConfirm() {
    if (ui.confirming) return;
    if (offline()) { ui.bar = "offline-action"; draw(); return; }
    if (c.medicines.some((m) => m.status === "pending")) { ui.bar = "confirm-blocked"; draw(); scrollToFirstPending(); return; }   // Flag 5
    ui.bar = null; ui.confirming = true; draw();
    life.later(() => {
      const r = mode === "demo" ? "saved" : story().prescribe;
      if (r === "confirm-busy") return;   // unclear result: stays on Confirming… while the app checks (D-69); never a second submit
      ui.confirming = false;
      if (r === "confirm-failed") { ui.bar = "confirm-failed"; draw(); return; }
      c.stage = "closed"; countConfirmed(); saveWork(); draw();
    });
  }
  function scrollToFirstPending() { const row = scroller.querySelector(".medicine-item .tm-tag--warning"); if (row) row.closest(".medicine-item").scrollIntoView({ block: "center" }); }
  function onRetryLoad() { ui.loadFailed = false; ui.loading = true; draw(); life.later(() => { ui.loading = false; draw(); }); }
  function toHome(next = false) {
    if (closed() || !currentCase()) releaseCase();
    resetNav(); push(null, { s: "home_active", live: true, request: next });
  }
  function toHelp() { push(null, { s: "placeholder", text: "placeholder.linkPending" }); }   // Help: blank page [OPEN DECISION] (D-88)

  // Phone back (plan B13): closes an overlay first; Ready → the leave sheet; during a call → the toast; closed → Home.
  setScreenBack(() => {
    if (ui.overlay === "prescribe" && prescribeEl && prescribeEl.requestClose) { prescribeEl.requestClose(); return; }
    if (ui.overlay) { closeOverlay(); return; }
    if (closed()) { toHome(); return; }
    if (backAllowed()) { onBack(); return; }
    ui.toastUntil = Date.now() + v("toastDuration"); draw();
  });
  let lastSwitch = store.get().offline;
  const unsub = store.subscribe((st) => {
    if (!life.alive()) { unsub(); return; }
    if (st.offline !== lastSwitch) { lastSwitch = st.offline; ui.offlineFx = false; }   // the reviewer's switch replaces the picture moment
    const off = offline();
    if (off !== lastOffline) { lastOffline = off; if (!off && ui.bar === "offline-action") ui.bar = null; if (ui.overlay !== "prescribe") draw(); }
  });
  let lastOffline = offline();
  if (!capture) life.every(() => { if (ui.toastUntil && Date.now() >= ui.toastUntil) { ui.toastUntil = 0; if (ui.overlay !== "prescribe") draw(); } }, 250);
  if (ui.releasing && !capture) { ui.releasing = false; onRelease(false); }   // a-releasing opened live: the request is in flight
  if (ui.confirming && !capture) { ui.confirming = false; onConfirm(); }

  watchKeyboard(root, life.alive);
  draw();
  if (!live && fx.scroll) requestAnimationFrame(() => { scroller.scrollTop = 420; });   // a-scrolled: the picture's scroll position (case.html: 420)
  if (ui.typing === "symptoms") { symptoms.focus({ preventScroll: true }); requestAnimationFrame(() => revealAboveKeyboard(scroller, symptoms.closest(".tm-field"), root.querySelector(".mock-kbd"))); }
  return { journey: d ? "prescribe" : c.stage === "calling" ? "call" : "caseView" };
}
