// Case page (plan v3.2 step 3) and the host of Prescribe (step 4), the Rx viewer and calling (step 5). Markup and classes lifted
// from ui-screens/case/case.html as the approved pictures render it (compact header D-49, case tools card with Order details and
// View Rx, outcome card, end-of-call script, medicines card, notes card, pinned action bar with its notice band, leave / callback /
// unavailable sheets, Rx viewer); styles in case.css. Every word through MSG().
// Behaviour: app-logic §4 (stages, Back, leave / release, empty case), §5 (calls, the gate, the state table), §6 (final buttons),
// §7 (callback, patient unavailable), §8 (medicine rows), §9 (order details, View Rx, notes), §10 (loading, failures, offline).
// Calling stages come from the calling engine (core/call-engine.js), polled on the app clock; this file only draws them.
import { MSG } from "../core/msg.js";
import { push, reset as resetNav, setScreenBack, saveCurrent } from "../core/nav.js";
import { store } from "../core/store.js";
import { h } from "../core/dom.js";
import { clock } from "../core/clock.js";
import { value } from "../core/settings.js";
import { event } from "../core/events.js";
import { EV } from "../core/call-events.js";
import { work, saveWork, currentCase, openCase, updateMedicine, releaseCase, countConfirmed, availability, keepRecord, addHold } from "../core/session.js";
import { route, scriptKey, startAttempt, stillTalking, callEnded, submitConfirm, closeUnavailable, stepCall } from "../core/call-engine.js";
import { defaultAttempt } from "../data/story-schema.js";
import { icon, paint, btn, busyBtn, notice, statusLine, actionBar, sheet, toast, caseHeader, medicineRow, focusSheet, revealAboveKeyboard, watchKeyboard } from "./parts.js";
import { newLife } from "./entry-ctx.js";
import { prescribeScreen } from "./prescribe.js";
import { rxViewer } from "./rx-viewer.js";
import { callbackSheet } from "./callback-sheet.js";
import { unavailableSheet } from "./unavailable-sheet.js";
import { slotLabel } from "../data/callback-slots.js";
import { mockTextKeyboard } from "../shell/mock-keyboard.js";
import { TYPED } from "../data/cases.js";

const MIN = 60 * 1000;
const CB15 = { day: "today", time: "15:00" };   // the pictures' callback choice (Today, 3:00 PM)
// Picture moments (case.html fixtures). kind: the case variation; overlay: leave | rx | callback | unavailable; bar: the bar's
// result notice; stage / outcome: the calling stage (call-engine.js); fxCall: the simulator answer the picture implies, kept until
// the reviewer changes the Call simulator; scenario: the picture's case (capture only — review keeps the story's case).
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
  // step 5 (calling, Cat4 and Pilot HA skipped)
  "t02-calling": { stage: "calling" }, "s7a-calling": { stage: "calling" },
  "t03-not-through": { stage: "not-through" }, "t04-doctor-missed": { stage: "doctor-missed" },
  "t05-result-wait": { stage: "result-wait", fxCall: { record: "never" }, scenario: "pilot_ha_free" },
  "t06-ended-early": { stage: "ended-early" },
  "s7b-still-on-call": { stage: "still-on-call", fxCall: { record: "never" } },
  "s7d-result-missing": { stage: "result-missing", allRx: true, fxCall: { record: "never" } },
  "s7d-unavailable-sheet": { stage: "result-missing", allRx: true, fxCall: { record: "never" }, overlay: "unavailable" },
  "s7f-submitted": { stage: "closed", outcome: "submitted", allRx: true, fxCall: { record: "never" } },
  "t08a-valid-cat4": { stage: "valid", allRx: true }, "t08c-confirm-blocked": { stage: "valid", bar: "confirm-blocked" },
  "t09-patient-unavailable": { stage: "closed", outcome: "unavailable" },
  "e-callback-scheduled": { stage: "closed", outcome: "callback" },
  "c-callback": { stage: "ended-early", overlay: "callback" },
  "c-callback-error": { stage: "ended-early", overlay: "callback", cb: { error: "case.callbackPickBoth" } },
  "c-callback-failed": { stage: "ended-early", overlay: "callback", cb: { ...CB15, notice: "case.callbackFailed" } },
  "c-callback-refused": { stage: "ended-early", overlay: "callback", cb: { ...CB15, notice: "callback.notReached" } },
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

// The call history a calling picture implies (B8: time stamps, never counters). Earlier calls sit 10 min back, inside the
// talk-time window; a 7b picture is one no-result timeout after the tap.
function fixtureCall(c, fx, now, v) {
  const st = fx.stage;
  if (!st || st === "ready") return;
  const gate = v("gate");
  const past = now - 10 * MIN;
  const done = (talk) => ({ at: past, polled: true, done: true, counted: talk >= v("minCountedCall"), reported: talk, endsAt: past + talk });
  let a;
  if (st === "calling") a = { at: now, done: false };
  else if (st === "still-on-call") a = { at: now - v("noResultTimeout"), polled: true, done: false };
  else if (st === "result-wait" || st === "result-missing" || (st === "closed" && fx.outcome === "submitted")) a = { at: past, polled: true, done: false };
  else if (st === "not-through" || st === "doctor-missed") a = { at: past, polled: true, done: true };
  else if (st === "ended-early") a = done(Math.round(gate / 2));
  else a = done(gate + 1000);
  c.call = { attempts: [a], askAt: a.at + v("noResultTimeout"), checkAt: st === "result-wait" ? now + v("mockServerDelay") : null,
    fx: fx.fxCall || null, fxEdits: store.get().callEdits || 0 };
  if (fx.outcome === "submitted") c.call.submit = { at: now, done: false };
}

function applyFixture(fx, d, mode) {
  const st = store.get();
  const v = (k) => value(k, mode);
  const scenario = (d && d.scenario) || (mode === "capture" && fx.scenario) || (fx.kind || d ? "cat4" : st.scenario || "cat4");
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
  if (c.stage === "closed") c.outcome = fx.outcome || "confirmed";
  if (c.outcome === "callback") c.callback = { ...CB15 };
  if (c.outcome === "unavailable") c.unavailable = { by: "auto", cause: "no-answer" };
  c.attempted = !["ready", "not-through", "doctor-missed"].includes(c.stage);   // 3 / 4 pictures: the patient was never reached (Back shows)
  fixtureCall(c, fx, clock.now(), v);
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
  let c = live && currentCase() ? currentCase() : applyFixture(fx, d, mode);
  if (!c) { resetNav(); push(null, { s: "home_active", live: true }); return { journey: "home" }; }
  if (!capture) saveCurrent({ live: true });   // Back to this step (from Help) comes back to the case as it is, not to the picture
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
    cb: { day: null, time: null, error: null, notice: null, busy: false, ...(live ? {} : fx.cb || {}) },   // callback sheet state (kept on failure)
  };
  const offline = () => ui.offlineFx || store.get().offline === "yes";
  const first = () => c.patient.split(" ")[0];
  const closed = () => c.stage === "closed";
  const empty = () => c.medicines.length === 0;
  // Header Back on 1, 3 and 4 only, while the patient has never been reached (D-80 pt 1, D-81 F21)
  const backAllowed = () => ["ready", "not-through", "doctor-missed"].includes(c.stage) && !c.attempted && !ui.loading;
  const callbackAllowed = () => ["ended-early", "result-missing"].includes(c.stage) && !ui.confirming;   // only on 6 and 7d (CW-A1, CW-C3)
  const unavailableAllowed = () => c.stage === "result-missing" && !ui.confirming;   // the doctor marks unavailable only on 7d (D-58 pt 23)
  const scriptShown = () => ["calling", "still-on-call"].includes(c.stage);   // from the tap while a call may be live; hidden once it has ended (D-58 pt 24)

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
  function scriptCard() {   // end-of-call script (D-58 pts 18, 21): Cat4 / HA skipped, or the neutral Pilot line
    return h("div", { id: "action-zone", class: "tm-card" }, h("h2", { class: "tm-section-title section-title--inline", text: MSG("case.scriptTitle") }),
      h("div", { id: "pre-call-brief", class: "tm-notice", role: "status" }, h("div", { class: "pcb-body" }, h("div", { class: "pcb-text", id: "pcb-text", text: MSG(scriptKey(c)) }))));
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
    symptoms.disabled = !!ui.confirming; doctorNotes.disabled = !!ui.confirming;   // Confirming…: everything else disabled (app-logic §6)
    if (document.activeElement !== symptoms) symptoms.value = c.notes.symptoms;
    if (document.activeElement !== doctorNotes) doctorNotes.value = c.notes.doctor;
    const field = (lbl, forId, ta) => h("div", { class: `tm-field${ro ? " tm-field--readonly" : ""}` }, h("label", { class: "tm-field__label", for: forId, text: MSG(lbl) }), h("div", { class: "tm-field__control" }, ta));
    return h("div", { id: "notes-section" }, h("h2", { class: "tm-section-title", text: MSG("case.notesTitle") }),
      field("case.symptomsLabel", "symptoms-input", symptoms), field("case.doctorNotesLabel", "doctor-notes-input", doctorNotes));
  }
  // Outcome card under Order details (D-58 pt 16): tinted (D-62); the icon says what happened (B-22).
  const OUTCOME = {
    confirmed: () => ["success", "circle-check", MSG("case.confirmedTitle"), null],
    submitted: () => ["neutral", "clock", MSG("call.submittedTitle"), MSG("call.submittedText")],
    unavailable: () => ["neutral", "phone-off", MSG("case.unavailableTitle"), null],
    callback: () => ["neutral", "calendar", MSG("callback.scheduled", { day: MSG(c.callback.day === "today" ? "callback.dayToday" : "callback.dayTomorrow"), time: slotLabel(c.callback.time) }), null],
  };
  function closedCard() {
    const [tone, ic, title, text] = (OUTCOME[c.outcome] || OUTCOME.confirmed)();
    return h("div", { id: "success-toast", class: `tm-status-card tm-status-card--${tone}${text ? " concept-has-text" : ""}`, role: "status" },
      h("div", { class: "tm-status-card__icon" }, icon(ic, "tm-icon--24")),
      h("div", { class: "tm-status-card__body" }, h("div", { class: "tm-status-card__title", text: title }), text ? h("div", { class: "tm-status-card__text", text }) : null));
  }
  const pending = () => c.medicines.filter((m) => m.status === "pending").length;
  const BAR = {
    "release-failed": () => notice("error", MSG("case.releaseFailed")),
    "offline-action": () => notice("error", MSG("case.offlineAction")),
    "confirm-failed": () => notice("error", MSG("case.confirmFailed")),
    "confirm-blocked": () => notice("error", pending() === 1 ? MSG("case.confirmBlockedOne") : MSG("case.confirmBlocked", { n: pending() })),
  };
  // The bar's own notice per calling stage (app-logic §5 state table, D-54 #4: the reason sits in the pinned bar).
  const STAGE_NOTICE = {
    "not-through": () => notice("error", MSG("call.notThrough")),
    "doctor-missed": () => notice("warning", MSG("call.doctorMissed"), { iconName: "phone-off" }),
    "ended-early": () => notice("warning", MSG("call.endedEarly"), { iconName: "phone-off" }),
    "result-missing": () => notice("warning", MSG("call.resultMissing")),
    "still-on-call": () => notice("neutral", MSG("call.stillOnCall"), { iconName: "phone", cls: "tm-notice--question" }),
  };
  function bar() {
    const lg = "tm-btn--lg tm-btn--block";
    const t = Date.now() < ui.toastUntil ? h("div", { class: "case-toast" }, toast(blockedText())) : null;
    let band = ui.bar && BAR[ui.bar] ? BAR[ui.bar]() : null;
    if (!band && STAGE_NOTICE[c.stage] && !ui.loadFailed) band = STAGE_NOTICE[c.stage]();
    if (offline() && !closed() && !ui.bar) band = notice("warning", MSG("case.offline"));   // D-54: offline blocks the main action
    const callAgain = () => btn([icon("phone"), MSG("case.callAgain")], `tm-btn--primary ${lg}`, onCall, { id: "call-initiate-btn" });
    const callbackBtn = () => btn([icon("calendar", "tm-icon--16"), MSG("case.callback")], "tm-btn--secondary tm-btn--lg", () => openOverlay("callback"), { id: "schedule-callback-btn", disabled: !!ui.confirming });   // Confirming…: everything else disabled
    const confirmBtn = () => (ui.confirming ? busyBtn(MSG("case.confirming"), `tm-btn--primary ${lg}`) : btn(MSG("case.confirmPrescription"), `tm-btn--primary ${lg}`, onConfirm, { id: "main-cta-btn" }));
    let kids;
    if (ui.loadFailed) kids = [btn(MSG("common.tryAgain"), `tm-btn--primary ${lg}`, onRetryLoad)];
    else if (closed()) {
      const ended = availability().state === "none";
      kids = ended ? [btn(MSG("case.backToHome"), `tm-btn--primary ${lg}`, () => toHome(), { id: "concept-back-home" })]
        : [btn([MSG("case.requestNext"), " ", icon("arrow-right")], `tm-btn--primary ${lg}`, () => toHome(true), { id: "next-order-btn" }), btn(MSG("case.backToHome"), `tm-btn--quiet ${lg}`, () => toHome(), { id: "concept-back-home" })];
    } else if (c.stage === "calling") kids = [statusLine(MSG("call.calling", { name: first() }))];   // D-74: no Callback, no End call on a live call (CW-A1)
    else if (c.stage === "result-wait") kids = [statusLine(MSG("call.resultWait"))];   // 5 and 7c (D-91)
    else if (c.stage === "still-on-call") kids = [h("div", { class: "tm-btn-pair" }, btn(MSG("case.stillTalking"), "tm-btn--secondary tm-btn--lg", onStillTalking), btn(MSG("case.callEnded"), "tm-btn--secondary tm-btn--lg", onCallEnded))];
    else if (c.stage === "not-through" || c.stage === "doctor-missed") kids = [callAgain()];
    else if (c.stage === "ended-early") kids = [callAgain(), h("div", { class: "tm-btn-pair case-pair--single" }, callbackBtn())];   // Call again · Callback, no Unavailable (D-58 pt 23)
    else if (c.stage === "result-missing") kids = [confirmBtn(), h("div", { class: "tm-btn-pair" }, callbackBtn(),   // CW-D2: Cat4 / HA skipped → Confirm prescription
      btn([icon("phone-off", "tm-icon--16"), MSG("case.unavailable")], "tm-btn--destructive tm-btn--lg", () => openOverlay("unavailable"), { id: "az-unavail-btn", disabled: !!ui.confirming }))];
    else if (c.stage === "valid") kids = [confirmBtn()];   // 8a: Confirm prescription only (CW-C3)
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
  function overlayEl() {
    if (ui.overlay === "leave") return leaveSheet();
    if (ui.overlay === "rx") return rxViewer(c, { mode, failed: ui.rxFailed, onClose: closeOverlay, onRetry: onRxRetry, later: life.later });
    if (ui.overlay === "callback") return callbackSheet(ui.cb, { onDay: (x) => pickCb({ day: x }), onTime: (x) => pickCb({ time: x }), onConfirm: onCallbackConfirm, onClose: closeOverlay });
    if (ui.overlay === "unavailable") return unavailableSheet({ onReason: onUnavailableReason, onClose: closeOverlay });
    return null;
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
      tools(), closed() ? closedCard() : null, scriptShown() ? scriptCard() : null, medicines(), notes()];
    const top = scroller.scrollTop;
    scroller.replaceChildren(...content.filter(Boolean));
    scroller.scrollTop = top;
    const overlay = overlayEl();
    if (ui.overlay !== "prescribe") prescribeEl = null;
    const kb = ui.typing ? mockTextKeyboard() : null;
    root.replaceChildren(head, scroller, ui.loading ? "" : bar(), overlay || "", ui.overlay === "prescribe" ? prescribeEl || (prescribeEl = makePrescribe()) : "", kb || "");
    root.classList.toggle("is-closed", closed());
    root.classList.toggle("kb-open", !!kb);
    root.classList.toggle("is-loading", ui.loading);
    paint(root);
    if (focused) focused.focus({ preventScroll: true });
    if (overlay && ["leave", "callback", "unavailable"].includes(ui.overlay) && !capture && overlay !== lastSheet) focusSheet(overlay);
    lastSheet = overlay;
  }
  let lastSheet = null;
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
    if ((which === "callback" && !callbackAllowed()) || (which === "unavailable" && !unavailableAllowed())) return;
    if (which === "callback") ui.cb = { day: null, time: null, error: null, notice: null, busy: false };
    ui.overlay = which; ui.medId = medId ?? ui.medId; ui.rxFailed = which === "rx" && c.fxKind === "rx-failed"; draw();
  }
  function closeOverlay() { if (ui.releasing || ui.cb.busy) return; ui.overlay = null; draw(); }
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
      event(EV.released());
      releaseCase(); toHome();
    });
  }
  // Call patient / Call again: the partner rings the doctor first, then the patient (app-logic §5). No retry limit (D-58 pt 23).
  function onCall() {
    if (offline()) { ui.bar = "offline-action"; draw(); return; }   // one error notice replaces the offline notice; nothing lost
    ui.bar = null; startAttempt(c, clock.now(), v);
    event(EV.callRequested(c.call.attempts.length, route(c)));
    saveWork(); draw();
  }
  function onStillTalking() { stillTalking(c, clock.now(), v); saveWork(); draw(); }
  function onCallEnded() { callEnded(c, clock.now(), v); event(EV.callEnded()); saveWork(); draw(); }
  // Confirm prescription (8a / 7d): Flag 5 first; one submit; unclear result stays Confirming… (D-69); failure keeps everything.
  function onConfirm() {
    if (ui.confirming || c.confirmPending) return;
    if (offline()) { ui.bar = "offline-action"; draw(); return; }
    if (pending()) { ui.bar = "confirm-blocked"; draw(); scrollToFirstPending(); return; }
    ui.bar = null; ui.confirming = true; c.confirmPending = true; saveWork(); draw();   // kept with the case: a reopen keeps checking, never resubmits
    life.later(checkConfirm);
  }
  // The server's answer to the one submit. Unclear (no answer): stay on Confirming… and check again after the reconcile time; the
  // result is then the confirmed card or the failure notice, never a second submit (D-69, app-logic §6).
  function checkConfirm() {
    const r = mode === "demo" ? "saved" : story().prescribe;
    if (r === "confirm-busy") { life.later(checkConfirm, "reconcileDelay"); return; }
    ui.confirming = false; c.confirmPending = false;
    if (r === "confirm-failed") { ui.bar = "confirm-failed"; event(EV.confirmFailed()); saveWork(); draw(); return; }
    if (c.stage === "result-missing") { submitConfirm(c, clock.now()); event(EV.saved()); }   // D-68
    else if (c.stage === "valid") { c.stage = "closed"; c.outcome = "confirmed"; proven(c); }
    saveWork(); draw();
  }
  // A proven confirm counts once (app-logic §3) and is one analytics event per outcome, never from the button text (D-50).
  function proven(x) {
    if (x.confirmLogged) return;
    x.confirmLogged = true; countConfirmed();
    event(EV.confirmed(route(x), x.ha));
  }
  function pickCb(patch) {   // a choice clears the field error; the failure notice stays until the next try
    Object.assign(ui.cb, patch);
    if (ui.cb.error) ui.cb.error = !ui.cb.day && !ui.cb.time ? "case.callbackPickBoth" : !ui.cb.day ? "case.callbackPickDate" : !ui.cb.time ? "case.callbackPickTime" : null;
    draw();
  }
  function onCallbackConfirm() {
    const cb = ui.cb;
    if (cb.busy) return;
    cb.error = !cb.day && !cb.time ? "case.callbackPickBoth" : !cb.day ? "case.callbackPickDate" : !cb.time ? "case.callbackPickTime" : null;
    if (cb.error) { draw(); return; }
    if (offline()) { cb.notice = "case.offlineAction"; draw(); return; }
    cb.notice = null; cb.busy = true; draw();
    life.later(() => {
      cb.busy = false;
      if (!callbackAllowed()) { ui.overlay = null; draw(); return; }   // a late result changed the stage meanwhile
      const i = c.call ? c.call.attempts.length - 1 : 0;
      const answer = mode === "demo" ? "accepted" : choicesFor(i).callback;
      // The backend refuses a callback unless the patient answered (leg 2) (CW-A1, K3); a save failure keeps the choices.
      if (answer === "refused" || !c.attempted) { cb.notice = "callback.notReached"; event(EV.callbackRefused()); draw(); return; }
      if (answer === "failed") { cb.notice = "case.callbackFailed"; event(EV.callbackFailed()); draw(); return; }
      c.stage = "closed"; c.outcome = "callback"; c.callback = { day: cb.day, time: cb.time }; c.notes = { symptoms: "", doctor: "" };
      event(EV.callbackScheduled(cb.day, cb.time));
      ui.overlay = null; saveWork(); draw();
    });
  }
  function onUnavailableReason(reason) {   // choosing a reason is the confirmation (D-75); the reason is saved with the case (D-73)
    if (!unavailableAllowed()) { ui.overlay = null; draw(); return; }
    if (offline()) { ui.overlay = null; ui.bar = "offline-action"; draw(); return; }
    closeUnavailable(c, reason, { event, v, by: "doctor" });
    ui.overlay = null; saveWork(); draw();
  }
  function scrollToFirstPending() { const row = scroller.querySelector(".medicine-item .tm-tag--warning"); if (row) row.closest(".medicine-item").scrollIntoView({ block: "center" }); }
  function onRetryLoad() { ui.loadFailed = false; ui.loading = true; draw(); life.later(() => { ui.loading = false; draw(); }); }
  function toHome(next = false) {
    if (closed() && c.outcome === "submitted" && c.call && c.call.submit && !c.call.submit.done) {   // the record still settles it after the doctor leaves
      const i = c.call.attempts.length - 1;
      keepRecord({ order: c.order, route: route(c), ha: c.ha, attempts: c.call.attempts, choices: choicesFor(i), submittedAt: c.call.submit.at });
    }
    if (closed() || !currentCase()) releaseCase();
    resetNav(); push(null, { s: "home_active", live: true, request: next });
  }
  function toHelp() { push(null, { s: "placeholder", text: "placeholder.linkPending" }); }   // Help: blank page [OPEN DECISION] (D-88)

  // The simulator's answer for attempt i (B9): the story's attempt (the last one repeats), or the picture's implied answer until
  // the reviewer changes the Call simulator. Demo and the installed app play the default story (the happy path).
  function choicesFor(i) {
    const calls = (story().calls && story().calls.length) ? story().calls : [defaultAttempt()];
    const base = { ...defaultAttempt(), ...calls[Math.min(i, calls.length - 1)] };
    if (c.call && c.call.fx && (store.get().callEdits || 0) !== c.call.fxEdits) c.call.fx = null;   // the reviewer's choices take over
    return c.call && c.call.fx ? { ...base, ...c.call.fx } : base;
  }
  // One poll (B7): offline pauses it; a stage change redraws (Prescribe stays on top; the case redraws when it closes).
  function poll() {
    if (!c.call || offline() || ui.confirming) return;
    const before = c.stage;
    let changed = false;
    const ctx = { now: clock.now(), v, choices: choicesFor, event, onProven: proven,
      hold: (x, cause, policy) => addHold({ order: x.order, cause, policy, at: clock.now() }) };
    for (let i = 0; i < 6 && stepCall(c, ctx); i++) changed = true;   // a jump in time may pass several steps
    if (!changed) return;
    if (c.stage !== before) ui.bar = null;   // a result notice belongs to the stage it came from
    // A late result can change the stage under an open sheet: a sheet the new stage doesn't offer closes (Callback on 6 / 7d,
    // Unavailable on 7d only). A callback save in flight checks again when it answers.
    if (!ui.cb.busy && ((ui.overlay === "callback" && !callbackAllowed()) || (ui.overlay === "unavailable" && !unavailableAllowed()))) ui.overlay = null;
    saveWork();
    if (ui.overlay !== "prescribe") draw();
  }

  // Phone back (plan B13): closes an overlay first; Ready / 3 / 4 → the leave sheet; during a call → the toast; closed → Home.
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
  if (!capture) {
    life.every(poll, 250);   // reads the app clock each time (B8); the simulated partner lag is in the engine
    const off = clock.onJump(() => { if (!life.alive()) { off(); return; } poll(); });   // a fast-forward polls straight away
  }
  if (ui.releasing && !capture) { ui.releasing = false; onRelease(false); }   // a-releasing opened live: the request is in flight
  if (c.confirmPending && !capture) { ui.confirming = true; life.later(checkConfirm, "reconcileDelay"); }   // reopened mid-confirm: check, don't resubmit
  else if (ui.confirming && !capture) { ui.confirming = false; onConfirm(); }

  watchKeyboard(root, life.alive);
  draw();
  if (!live && fx.scroll) requestAnimationFrame(() => { scroller.scrollTop = 420; });   // a-scrolled: the picture's scroll position (case.html: 420)
  if (ui.typing === "symptoms") { symptoms.focus({ preventScroll: true }); requestAnimationFrame(() => revealAboveKeyboard(scroller, symptoms.closest(".tm-field"), root.querySelector(".mock-kbd"))); }
  return { journey: d ? "prescribe" : ["ready", "loading"].includes(c.stage) || closed() ? "caseView" : "call" };
}
