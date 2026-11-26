// Home, availability and Profile (plan v3.2 step 2). Markup and classes lifted from ui-screens/home/home-reference.js
// (header, band, panel, wheel picker, action bar footer, add / end sheets, Profile page, Log out sheet); styles in home.css.
// Behaviour: app-logic §3 (pull model, availability window, add / end, Prescriptions today, Profile, Log out) and the Home rows
// of docs/feedback-state-map.md. Every word through MSG(). A state opened directly (?s=home_<state>) shows the picture's
// moment, then behaves live (requests resolve, the clock runs) — except capture, which stays on the picture's moment.
import { MSG } from "../core/msg.js";
import { push, replace, reset as resetNav, back as navBack, depth, setScreenBack, saveCurrent } from "../core/nav.js";
import { store } from "../core/store.js";
import { clock } from "../core/clock.js";
import { h } from "../core/dom.js";
import { value } from "../core/settings.js";
import { storageFor } from "../core/storage.js";
import { promptAnswer, deviceOf } from "../core/unlock.js";
import { fasterState, setEnabled } from "../core/faster-signin.js";
import { work, saveWork, resetWork, availability, setAvailability, addTime, endAvailability, startRequest, clearRequest, openCase, shiftNow } from "../core/session.js";
import { SAMPLE_DOCTOR } from "../data/doctor.js";
import { PICTURE_NUMBER } from "../data/test-numbers.js";
import { icon, paint as paintIcons, btn, busyBtn, notice, statusLine, actionBar, sheet, toast, focusSheet } from "./parts.js";
import { newLife } from "./entry-ctx.js";
import { wheelColumn, syncWheels, commitWheels } from "./wheel.js";
import { band } from "./band.js";
import { parts } from "../core/dom.js";

const MIN = 60 * 1000;
// Picture moments (home-reference.js STATES). left: minutes remaining; rx: Prescriptions today; bar: the bar result notice.
const FIXTURES = {
  "setup-wheel": { setup: true, rx: 0 },
  setting: { setup: true, rx: 0, busy: "setting" },
  "setup-failed": { setup: true, rx: 0, bar: "setup-failed" },
  active: { left: 30 },
  requesting: { left: 30, request: true, busy: "requesting" },
  "no-cases": { left: 30, bar: "no-cases" },
  "request-failed": { left: 30, bar: "request-failed" },
  offline: { left: 30, offline: true },
  "near-expiry": { left: 5 },
  "add-wheel": { left: 5, sheet: "add" },
  adding: { left: 5, sheet: "add", busy: "adding" },
  "add-failed": { left: 5, sheet: "add", addFailed: true },
  added: { left: 35, toast: true },
  "end-confirmation": { left: 30, sheet: "end" },
  "stop-pending": { left: 30, request: true, stopping: true },
  "idle-expired": { setup: true, ended: "idle" },
  "manually-ended": { setup: true, ended: "manual" },
  "unknown-result": { left: 30, request: true, unknown: true },
  "limit-reached": { left: 590, bar: "limit", limit: { key: "home.capReached" } },   // D-115: Add time tapped at the 10-hour limit
  "outside-shift": { setup: true, rx: 0, bar: "limit", limit: { key: "home.shiftStarts", shift: "10pm-6am" } },   // D-115: Set availability outside shift hours
  profile: { left: 30, page: "profile" },
  "profile-case-open": { left: 30, page: "profile", caseOpen: true },
  "logout-confirm": { left: 30, page: "profile", sheet: "logout" },
};
export const STATES = Object.keys(FIXTURES).map((k) => `home_${k}`);
const PRESETS = [15, 30, 45, 60, 120, 180];
const presetLabel = (n) => n < 60 ? MSG("home.presetMinutes", { n }) : n === 60 ? MSG("home.presetHour") : MSG("home.presetHours", { n: n / 60 });
// "Add 9 h 45 min": minutes under an hour, hours and minutes from 60 min up (D-106).
export const durationLabel = (n) => n < 60 ? MSG("home.durMinutes", { m: n }) : n % 60 ? MSG("home.durHoursMinutes", { h: Math.floor(n / 60), m: n % 60 }) : MSG("home.durHours", { h: n / 60 });
// "7:45 PM": the end of the window on the setup caption ("Available until {time}").
const clockTime = (t) => new Date(t).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
// The 10-hour cap (D-106) and the 15-minute minimum and step, in minutes. The wheel is in real minutes in every mode.
const CAP = value("availabilityMaximum", "review") / MIN, MIN_LEN = value("availabilityMinimum", "review") / MIN, STEP = value("availabilityStep", "review") / MIN;
// Wheel values for a top limit in minutes: hours 0 … top; at 0 h the minutes start at 15; at the top hour they stop at the limit.
const hoursFor = (max) => Array.from({ length: Math.floor(max / 60) + 1 }, (_, n) => n);
const minutesFor = (hh, max) => [0, 15, 30, 45].filter((m) => (hh > 0 || m >= MIN_LEN) && hh * 60 + m <= max);
// Snaps a wanted length onto the wheel: at least 15 min, at most the limit, on the 15-minute step.
const clampLen = (n, max) => Math.max(MIN_LEN, Math.min(Math.floor(max / STEP) * STEP, n));
// Timer: m:ss below an hour, h:mm:ss from one hour up (D-53).
export function formatLeft(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000)), hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60;
  const p = (n) => String(n).padStart(2, "0");
  return hh ? `${hh}:${p(mm)}:${p(ss)}` : `${mm}:${p(ss)}`;
}

// Applies a picture moment to the session (fixtures are where a jump or ?s= starts; the session then plays on from there).
function applyFixture(fx, mode) {
  const now = clock.now();
  const rx = fx.rx ?? 3;
  const patch = { rxToday: rx, ended: fx.ended || null, stopping: !!fx.stopping, request: fx.request ? { at: now } : null, openCase: null };
  patch.avail = fx.setup ? null : { endsAt: now + fx.left * MIN };
  resetWork(patch);
  if (fx.caseOpen) openCase(store.get().scenario || "cat4", "normal");
}

export function render(host, id, { mode, params = {} }) {
  const key = id.replace(/^home_/, "");
  const fx = FIXTURES[key];
  if (!fx) return null;
  const life = newLife(host, mode);
  const live = !!params.live;
  const capture = mode === "capture";
  if (!live && !params.saved) applyFixture(fx, mode);
  // An open case comes first: Home (opened live) goes straight back into it (D-48, app-logic §4 "reopening goes back into the case").
  if (live && work().openCase && !fx.page) { queueMicrotask(() => replace(null, { s: "t01-ready", live: true })); return { journey: "caseView" }; }

  const story = () => store.get().story || {};
  const v = (k) => value(k, mode);
  const ui = {
    page: fx.page || "home",
    sheet: live ? null : fx.sheet || null,
    busy: live ? (work().request ? "requesting" : null) : fx.busy || null,
    bar: live ? null : fx.bar || null,
    fxShift: !live && fx.limit ? fx.limit.shift || null : null,
    limit: !live && fx.limit ? { key: fx.limit.key, at: fx.limit.shift ? shiftNow(fx.limit.shift).startsAt : null } : null,
    unknown: !live && !!fx.unknown,
    offlineFx: !live && !!fx.offline,
    addFailed: !live && !!fx.addFailed,
    duration: 30, addDuration: 30,
    toastUntil: !live && fx.toast ? (capture ? Number.MAX_SAFE_INTEGER : Date.now() + v("toastDuration")) : 0,
    profileError: null, fasterBusy: false,
    ...(params.saved || {}),
  };
  const offline = () => ui.offlineFx || store.get().offline === "yes";

  const root = h("div", { class: "home-screen tm" });
  host.replaceChildren(root);

  // ---------- pieces ----------
  // A real swipe wheel per column (F-04, D-40): wheel.js. Busy (Setting… / Adding…) blocks it.
  function wheel(name, values, current, col) {
    const busy = ui.busy === "setting" || ui.busy === "adding";
    return wheelColumn({ name, col, values, current, disabled: busy, onPick: (val, o) => pickWheel(col, val, o && o.focus) });
  }
  // The top of the wheel (D-106, D-115), on the 15-minute step: the smaller of the 10 hours in total and, only when the backend
  // sends shift hours, what is left of the shift (setup: from now; Add time: from the current end). Outside the shift: 0.
  const shiftKey = () => ui.fxShift || story().shift;   // a picture moment names its shift; live: the backend's (story)
  const pickMax = (t) => (maxFor(t) >= MIN_LEN ? maxFor(t) : capFor(t));   // outside the shift the wheel stays as usual; Set says why
  const snap = (m) => Math.max(0, Math.floor(m / STEP) * STEP);
  function capFor(target) { return target === "duration" ? CAP : snap(CAP - availability().left / MIN); }
  function shiftLeft(target) {
    const sh = shiftNow(shiftKey());
    if (!sh) return Infinity;
    if (!sh.inShift) return 0;
    return snap((sh.endsAt - clock.now() - (target === "duration" ? 0 : availability().left)) / MIN);
  }
  function maxFor(target) { return Math.min(capFor(target), shiftLeft(target)); }
  // Nothing (more) fits (D-115): Add time / Set availability stay tappable and say why, in the bar (result of the action, A-19).
  function limitNote(target) {
    const sh = shiftNow(shiftKey());
    if (sh && !sh.inShift) return { key: "home.shiftStarts", at: sh.startsAt };
    if (sh && shiftLeft(target) < capFor(target)) return target === "duration" ? { key: "home.shiftStarts", at: sh.startsAt + 24 * 3600000 } : { key: "home.shiftEnds", at: sh.endsAt };
    return { key: "home.capReached" };
  }
  function showLimit(target) { ui.limit = limitNote(target); ui.bar = "limit"; draw(); }
  // One duration picker (D-106, RULES "Entry and home screens"): "Quick picks" (6 chips) → 32 → "Custom" → column heads 4 → wheel.
  // No range text; the add-time sheet has the hint "Up to 10 hours in total" on the Custom line.
  function picker(target) {
    const max = pickMax(target);   // outside the shift the wheel still shows; Set availability says why (D-115)
    ui[target] = clampLen(ui[target], max);
    const d = ui[target], hours = Math.floor(d / 60), minutes = d % 60;
    const busy = ui.busy === "setting" || ui.busy === "adding";
    pickTarget = target;
    const qp = `qp-${target}`;
    return h("div", { class: "picker" },
      h("div", { class: "group" }, h("p", { class: "lbl", id: qp, text: MSG("home.quickPicks") }),
        h("div", { class: "presets", role: "group", "aria-labelledby": qp }, PRESETS.map((n) => h("button", { type: "button", class: "tm-chip tm-chip--lg", "aria-pressed": String(d === n), disabled: busy || n > max,
          onclick: () => { ui[target] = n; draw(); } }, presetLabel(n))))),
      h("div", { class: "group" },
        h("div", { class: "lbl-row" }, h("p", { class: "lbl", text: MSG("home.custom") }),
          target === "addDuration" ? h("p", { class: "hint", id: "add-hint", text: MSG("home.addHint") }) : null),
        h("div", { class: "col-heads", "aria-hidden": "true" }, h("span", { text: MSG("home.hours") }), h("span", { text: MSG("home.minutes") })),
        h("div", { class: "columns" }, h("div", { class: "wheel-band", "aria-hidden": "true" }),
          wheel(MSG("home.hours"), hoursFor(max), hours, "h"), wheel(MSG("home.minutes"), minutesFor(hours, max), minutes, "m"))));
  }
  let pickTarget = "duration";
  function pickWheel(col, val, focus) {
    if (ui.busy === "setting" || ui.busy === "adding") return;
    const max = pickMax(pickTarget);
    const d = ui[pickTarget];
    let hh = Math.floor(d / 60), mm = d % 60;
    if (col === "h") hh = val; else mm = val;
    // Moving the hours keeps the minutes where the new hour allows them (0 h: from 15; the top hour: up to the limit).
    const mins = minutesFor(hh, max);
    if (!mins.includes(mm)) mm = mm > mins[mins.length - 1] ? mins[mins.length - 1] : mins[0];
    ui[pickTarget] = clampLen(hh * 60 + mm, max);
    draw(focus ? col : null);
  }
  const NOTE = {
    "setup-failed": () => notice("error", MSG("home.setupFailed"), { cls: "status" }),
    "request-failed": () => notice("error", MSG("home.requestFailed"), { cls: "status" }),
    "no-cases": () => notice("neutral", MSG("home.noCases"), { cls: "status" }),
    limit: () => notice("neutral", MSG(ui.limit.key, ui.limit.at ? { time: clockTime(ui.limit.at) } : {}), { cls: "status" }),
  };
  // Bar notice (A-19, lane-request 7): offline and the result of the bar's own action sit in the bar; near expiry too.
  function barNotice(a) {
    if (offline() && a.state !== "none") return notice("warning", MSG("home.offline"), { cls: "status" });
    if (ui.bar && NOTE[ui.bar]) return NOTE[ui.bar]();
    if (a.state === "near" && !ui.sheet) return notice("warning", MSG("home.endingSoon"), { iconName: "clock", cls: "status" });
    return null;
  }
  // Standing notice at the top of the panel: ended (idle / by the doctor), ending after the open request.
  function topNotice(a) {
    const w = work();
    if (a.state === "stopping") return notice("neutral", MSG("home.stopPending"), { cls: "status" });
    if (a.state === "none" && w.ended === "idle") return notice("neutral", MSG("home.idleExpired"), { cls: "status" });
    if (a.state === "none" && w.ended === "manual") return notice("neutral", MSG("home.manuallyEnded"), { cls: "status" });
    return null;
  }
  function footer(a) {
    const lg = "tm-btn--lg tm-btn--block";
    const t = Date.now() < ui.toastUntil ? toast(MSG(ui.toastKey || "home.added"), "home-toast") : null;
    if (ui.unknown) return actionBar([statusLine(MSG("home.unknownResult")), t], { cls: "footer" });
    const setup = a.state === "none";
    const busyLabel = { setting: "home.setting", requesting: "home.requesting", adding: "home.adding" }[ui.busy];
    let primary;
    const waiting = a.state === "stopping";   // the open request is honoured; no new one (stop-pending picture: disabled)
    // Time ran out during Requesting… (D-114): the same Requesting… loader stays until the answer; no screen of its own.
    if (busyLabel && ui.busy !== "adding" && !waiting) primary = busyBtn(MSG(busyLabel), `tm-btn--primary ${lg}`);
    else if (setup) primary = btn(MSG("home.setAvailability"), `tm-btn--primary ${lg}`, onSet, { "data-confirm": "" });
    else primary = btn(MSG("home.requestCase"), `tm-btn--primary ${lg}`, onRequest, { "data-confirm": "", disabled: offline() || a.state === "stopping" || a.state === "expired-pending" || !!ui.busy });
    // Setup: "Available until {time}", 8 above Set availability (D-106; bar caption, RULES "Entry and home screens").
    // Outside the shift nothing can start, so no "Available until" (D-115).
    const until = setup && maxFor("duration") >= MIN_LEN ? h("p", { class: "until", id: "home-until" }, parts("home.availableUntil", { time: h("b", { text: clockTime(clock.now() + ui.duration * MIN) }) }, MSG)) : null;
    let secondary = null;
    if (!setup && !ui.sheet && a.state !== "expired-pending") {
      secondary = a.state === "stopping" ? btn(MSG("home.ending"), `tm-btn--quiet ${lg}`, null, { "data-secondary": "" })
        : btn(MSG("home.endAvailability"), `tm-btn--quiet ${lg}`, () => openSheet("end"), { "data-secondary": "", disabled: offline() });   // D-81 F13
    }
    return actionBar([until, primary, secondary, t], { notice: barNotice(a), cls: "footer" });
  }
  // Prescriptions written today: one card row that opens Profile (D-106). On ended Home it shows above the picker when above 0.
  function rxRow({ link = true, inline = false } = {}) {
    return h(link ? "button" : "div", { class: `srow${link ? " srow--link" : ""}${inline ? " srow--inline" : ""}`, id: link ? "home-rx" : "profile-rx", type: link ? "button" : null, onclick: link ? toProfile : null },
      icon("prescription", "srow__icon"),
      h("span", { class: "srow__txt" }, h("span", { class: "srow__label", text: MSG("home.rxToday") }),
        h("span", { class: "srow__line" }, h("span", { class: `${inline ? "" : "tm-value-display "}srow__value`, text: String(work().rxToday) }))),
      link ? icon("chevron-right", "srow__chev") : null);
  }
  // Available: one tm-card, two rows of one anatomy (grey icon · 16/24 label · L9 value) — Time remaining with + Add time on the
  // value line, always shown (greyed offline; also greyed when less than 15 minutes fit under the cap), and Prescriptions written
  // today → Profile. Ending (stop-pending) shows no time row (D-47); ran out with a request open shows no time row either
  // (D-113, Apurva: no "0:00"; replaces D-53's 0:00) and no Add time (the window has ended; Request a case is off).
  function statusCard(a) {
    const timed = a.state === "active" || a.state === "near";
    // Add time always works while available (D-115; greyed only offline): if nothing more fits, the tap says why.
    const addBtn = a.state === "expired-pending" ? null : h("button", { id: "add", class: "tm-btn tm-btn--secondary add-time", type: "button", disabled: offline(), onclick: () => (maxFor("addDuration") >= MIN_LEN ? openSheet("add") : showLimit("addDuration")) },
      icon("plus", "tm-icon--16"), MSG("home.addTime"));
    return h("div", { class: "tm-card home-card" },
      timed ? h("div", { class: "srow" }, icon("clock", "srow__icon"),
        h("div", { class: "srow__txt" }, h("p", { class: "srow__label", text: MSG("home.timeRemaining") }),
          h("div", { class: "srow__line" },
            h("p", { class: "tm-value-display srow__value time", id: "home-time", "aria-live": "off", text: formatLeft(a.left) }), addBtn))) : null,
      rxRow());
  }
  function addSheet() {
    const busy = ui.busy === "adding";
    return sheet({
      title: MSG("home.addTitle"), subtitle: MSG("home.addSub"), closeDisabled: busy, onClose: closeSheet,
      body: [picker("addDuration")],
      // D-106: the error sits in the pinned actions, 16 above Add (visible on arrival at 360 × 640).
      actions: [ui.addFailed ? notice("error", MSG("home.addFailed"), { cls: "sheet-feedback" }) : null,
        busy ? busyBtn(MSG("home.adding"), "tm-btn--primary tm-btn--lg tm-btn--block")
        : btn(MSG("home.addConfirm", { duration: durationLabel(ui.addDuration) }), "tm-btn--primary tm-btn--lg tm-btn--block", onAdd, { "data-confirm": "" }),
        btn(MSG("home.cancel"), "tm-btn--quiet tm-btn--lg tm-btn--block", closeSheet, { "data-secondary": "", disabled: busy })],
    });
  }
  function endSheet() {
    return sheet({ title: MSG("home.endTitle"), subtitle: MSG("home.endSub"), onClose: closeSheet,
      actions: [btn(MSG("home.endAvailability"), "tm-btn--destructive tm-btn--lg tm-btn--block", onEnd, { "data-confirm": "" }),
        btn(MSG("home.keepAvailable"), "tm-btn--quiet tm-btn--lg tm-btn--block", closeSheet, { "data-secondary": "" })] });
  }
  function logoutSheet() {
    return sheet({ title: MSG("profile.logoutTitle"), subtitle: MSG("profile.logoutConfirm"), onClose: closeSheet,
      actions: [btn(MSG("profile.logout"), "tm-btn--destructive tm-btn--lg tm-btn--block", onLogout, { "data-confirm": "" }),
        btn(MSG("profile.staySignedIn"), "tm-btn--quiet tm-btn--lg tm-btn--block", closeSheet, { "data-secondary": "" })] });
  }

  function homePage(a) {
    const setup = a.state === "none";
    const title = setup ? "home.titleSetup" : a.state === "stopping" ? "home.titleStopping" : "home.titleActive";
    const sub = setup ? "home.subSetup" : a.state === "stopping" ? "home.subNoNewCases" : "home.subActive";
    const rx = work().rxToday;
    const actions = [["bell", "home.notifications", toPlaceholder], ["help-circle", "common.help", toPlaceholder], ["user-circle", "home.profile", toProfile]]
      .map(([ic, label, fn]) => h("button", { class: "tm-btn tm-btn--quiet tm-btn--icon", type: "button", "aria-label": MSG(label), onclick: fn }, icon(ic)));
    // The one band (D-107; Home header actions = variant 1) · panel: standing notice → 32 → content (D-108) · the pinned bar.
    return h("div", { class: "home-bg", inert: ui.sheet ? "" : null },
      band({ title: MSG(title), subtitle: MSG(sub), actions, tag: "div" }),
      h("div", { class: "entry-panel panel" }, topNotice(a),
        h("div", { class: "scroll" },
          setup ? [work().ended && rx > 0 ? h("div", { class: "tm-card home-card" }, rxRow({ inline: true })) : null, picker("duration")] : statusCard(a)),
        footer(a)));
  }
  function profilePage() {
    const caseOpen = !!work().openCase;
    const auth = storageFor(mode).get("auth");
    const number = (auth && auth.number) || PICTURE_NUMBER;
    const enabled = live ? fasterState(number, { db: storageFor(mode) }).enabled : true;
    if (ui.fasterOn === undefined) ui.fasterOn = enabled;
    const earned = (work().rxToday * v("earningsPerConfirmedRx")).toFixed(2);   // D-81 F10: ₹20 per confirmed prescription
    const toggle = h("input", { class: "tm-toggle", type: "checkbox", role: "switch", "aria-checked": String(!!ui.fasterOn), "aria-label": MSG("profile.fasterSignIn"), disabled: ui.fasterBusy });
    toggle.checked = !!ui.fasterOn;
    toggle.addEventListener("change", () => onFaster(toggle.checked, number));
    const noLock = deviceOf(story(), mode) === "none";   // hidden if the phone has no screen lock at all (D-64)
    return h("div", { class: "profile-page", inert: ui.sheet ? "" : null },
      h("header", { class: "tm-header-task profile-header" }, h("div", { class: "tm-header-task__row" },
        h("button", { class: "tm-btn tm-btn--quiet tm-btn--icon", id: "profile-back", type: "button", "aria-label": MSG("common.back"), onclick: profileBack }, icon("arrow-left")),
        h("h1", { class: "tm-header-task__title", text: MSG("profile.title") }))),
      h("div", { class: "profile-body" },
        h("div", { class: "tm-card profile-identity" }, h("div", { class: "profile-avatar", "aria-hidden": "true", text: SAMPLE_DOCTOR.initials }),
          h("div", {}, h("p", { class: "pt-t", text: MSG("profile.doctorName", { name: SAMPLE_DOCTOR.fullName }) }), h("p", { class: "pt-d", text: SAMPLE_DOCTOR.role }))),
        h("div", { class: "tm-card home-card" }, rxRow({ link: false })),   // D-111: Home's row lands on its own number
        h("div", { class: "tm-card profile-earnings" }, h("p", { class: "profile-label", text: MSG("profile.earnings") }),
          h("div", { class: "profile-earnings-row" },
            h("div", {}, h("p", { class: "pt-d", text: MSG("profile.earned") }), h("p", { class: "pt-t", text: MSG("profile.amount", { amount: earned }) })),
            h("div", {}, h("p", { class: "pt-d", text: MSG("profile.incentive") }), h("p", { class: "pt-t", text: MSG("profile.amount", { amount: (0).toFixed(2) }) })))),
        h("div", { class: "tm-card profile-rows" },
          h("button", { class: "profile-row", type: "button", onclick: toPlaceholder }, h("span", { class: "profile-row-label" }, icon("book"), MSG("profile.userManual")), icon("chevron-right")),
          noLock ? null : h("label", { class: "profile-row" }, h("span", { class: "profile-row-label" }, icon("fingerprint"), MSG("profile.fasterSignIn")), toggle)),
        ui.profileError ? notice(ui.profileError === "unavailable" ? "warning" : "error", MSG(ui.profileError === "unavailable" ? "unlock.unavailable" : "offer.enableFailed")) : null,
        h("div", { class: "profile-logout" }, caseOpen ? notice("neutral", MSG("profile.logoutBlocked"))
          : btn(MSG("profile.logout"), "tm-btn--destructive tm-btn--lg tm-btn--block", () => openSheet("logout"), { "data-logout": "" }))));
  }

  // ---------- draw ----------
  let lastKey = "";
  function draw(wheelFocus) {
    const a = availability();
    lastKey = drawKey(a);
    const page = ui.page === "profile" ? profilePage() : homePage(a);
    const overlay = ui.sheet === "add" ? addSheet() : ui.sheet === "end" ? endSheet() : ui.sheet === "logout" ? logoutSheet() : null;
    root.replaceChildren(page, overlay || "");
    root.classList.toggle("is-profile", ui.page === "profile");
    paintIcons(root);
    syncWheels(root, wheelFocus);   // each wheel shows its value in the band
    if (overlay && !capture && !wheelFocus) focusSheet(overlay);
  }
  const drawKey = (a) => [a.state, ui.busy, ui.sheet, ui.bar, offline(), work().rxToday, Date.now() < ui.toastUntil].join("|");

  // ---------- behaviour ----------
  function openSheet(which) {
    if (which === "add") { ui.addDuration = 30; ui.addFailed = false; }
    ui.sheet = which; saveCurrent({ saved: snapshot() }); draw();
  }
  function closeSheet() { if (ui.busy === "adding") return; ui.sheet = null; ui.addFailed = false; draw(); }
  const snapshot = () => ({ duration: ui.duration, addDuration: ui.addDuration, page: ui.page });
  function onSet() {
    if (ui.busy) return;
    if (maxFor("duration") < MIN_LEN) { showLimit("duration"); return; }   // outside the shift (D-115): nothing starts
    commitWheels(root);   // tapped before the wheel came to rest: the value in the band is the one set
    ui.busy = "setting"; ui.bar = null; draw();
    life.later(() => {
      ui.busy = null;
      if (offline()) { ui.bar = "setup-failed"; draw(); return; }   // known failure: the selection is kept (feedback-state-map home.setup-failed)
      setAvailability(ui.duration * MIN); draw();
    });
  }
  function onRequest() {
    if (ui.busy || offline()) return;
    ui.bar = null; ui.busy = "requesting"; startRequest(); draw();
    resolveRequest();
  }
  // The server's answer to the open request. Review / play: the story's "request" answer; demo: a case.
  function resolveRequest() {
    if (capture) return;
    life.later(() => {
      if (!work().request) return;
      const r = mode === "demo" ? "accepted" : story().request || "accepted";
      ui.busy = null; ui.unknown = false;
      if (r === "accepted") {
        const s = store.get();
        openCase(mode === "demo" ? "cat4" : s.scenario || "cat4", mode === "demo" ? "normal" : story().caseKind || "normal");
        availability();   // a stop / expiry waiting on this request ends now (app-logic §3: honoured, then ends)
        resetNav(); push(null, { s: "t01-ready", live: true });
        return;
      }
      const ranOut = availability().state === "expired-pending";
      clearRequest();
      // Time ran out while Requesting… (D-114): no case → a short toast "No cases right now." and the ended Home (set it again).
      if (ranOut) { ui.bar = null; ui.toastKey = "home.noCasesEnded"; ui.toastUntil = Date.now() + v("toastDuration"); availability(); draw(); return; }
      ui.bar = r === "failed" ? "request-failed" : "no-cases";   // no cases: no auto re-check (OQ-019)
      draw();
    });
  }
  function onAdd() {
    if (ui.busy) return;
    commitWheels(root);   // as onSet: the value in the band is the one added
    ui.busy = "adding"; ui.addFailed = false; draw();
    life.later(() => {
      ui.busy = null;
      if (offline()) { ui.addFailed = true; draw(); return; }   // home.add-failed: sheet and selection kept, deadline unchanged
      addTime(ui.addDuration * MIN); ui.sheet = null;
      ui.toastKey = "home.added"; ui.toastUntil = Date.now() + v("toastDuration");   // about 4 s (RULES §9.5 toast)
      draw();
    });
  }
  function onEnd() { ui.sheet = null; endAvailability(); draw(); }
  function onLogout() {
    ui.sheet = null;
    const db = storageFor(mode);
    db.set("auth", null); resetWork();   // B12: Log out clears what the phone remembers about the session
    resetNav(); push(null, { s: "sign-in_default", live: true, number: "" });
  }
  function onFaster(on, number) {
    ui.profileError = null;
    if (!on) { ui.fasterOn = false; if (live) setEnabled(number, { db: storageFor(mode), story: story(), mode }, false); draw(); return; }   // off: no prompt (D-70)
    ui.fasterBusy = true; ui.fasterOn = false; draw();
    life.later(() => {
      ui.fasterBusy = false;
      const r = promptAnswer("enable", story(), mode);
      if (r === "enabled") { ui.fasterOn = true; setEnabled(number, { db: storageFor(mode), story: story(), mode }, true); }
      else if (r === "enable-failed" || r === "unavailable") ui.profileError = r;   // cancelled: stays off, no message
      draw();
    }, "phonePromptDelay");
  }
  function toProfile() { saveCurrent({ saved: snapshot() }); push(null, { s: work().openCase ? "home_profile-case-open" : "home_profile", live: true }); }
  function toPlaceholder() { saveCurrent({ saved: snapshot() }); push(null, { s: "placeholder", text: "placeholder.linkPending" }); }   // Help / bell / User manual: blank page [OPEN DECISION] (D-88)
  function profileBack() { if (depth() > 1) { setScreenBack(null); navBack(); } else { resetNav(); push(null, { s: "home_active", live: true }); } }

  // A request in flight (opened on Requesting…, Ending…, Checking…; still Requesting… if the time ran out meanwhile, D-114) gets its answer.
  if (work().request && !ui.busy && !fx.page && !ui.unknown && ["active", "near", "expired-pending"].includes(availability().state)) ui.busy = "requesting";
  if (work().request && !fx.page) resolveRequest();
  // The clock: the timer reads it; when the window ends the screen changes (idle-expired, stop-pending → ended; Requesting… stays until its answer, D-114).
  if (!capture) life.every(() => {
    const a = availability();
    const t = root.querySelector("#home-time");
    if (drawKey(a) !== lastKey) draw(); else if (t) t.textContent = formatLeft(a.left);
    const until = root.querySelector("#home-until b");   // the setup caption follows the clock without redrawing the wheel
    if (until) until.textContent = clockTime(clock.now() + ui.duration * MIN);
  }, 250);
  let lastOffline = store.get().offline;
  const unsub = store.subscribe((st) => {
    if (!life.alive()) { unsub(); return; }
    if (st.offline !== lastOffline) { lastOffline = st.offline; ui.offlineFx = false; }   // the reviewer's switch replaces the picture moment
    if (drawKey(availability()) !== lastKey) draw();
  });

  // Phone back (B13): an open sheet closes first; then Profile goes back; Home is a root (phone back stays in the app).
  setScreenBack(() => { if (ui.sheet) { closeSheet(); return; } if (ui.page === "profile") profileBack(); });
  draw();
  // "Request next case" on a closed case: Home asks for the next case straight away (app-logic §4 closed stage).
  if (live && params.request && !capture && ["active", "near"].includes(availability().state)) onRequest();
  return { journey: "home" };
}
