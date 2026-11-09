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
import { work, saveWork, resetWork, availability, setAvailability, addTime, endAvailability, startRequest, clearRequest, openCase } from "../core/session.js";
import { SAMPLE_DOCTOR } from "../data/doctor.js";
import { PICTURE_NUMBER } from "../data/test-numbers.js";
import { icon, paint as paintIcons, btn, busyBtn, notice, statusLine, actionBar, sheet, toast, focusSheet } from "./parts.js";
import { newLife } from "./entry-ctx.js";

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
  "expired-pending": { left: 0, request: true },
  "idle-expired": { setup: true, ended: "idle" },
  "manually-ended": { setup: true, ended: "manual" },
  "unknown-result": { left: 30, request: true, unknown: true },
  profile: { left: 30, page: "profile" },
  "profile-case-open": { left: 30, page: "profile", caseOpen: true },
  "logout-confirm": { left: 30, page: "profile", sheet: "logout" },
};
export const STATES = Object.keys(FIXTURES).map((k) => `home_${k}`);
const PRESETS = [15, 30, 45, 60, 120, 180];
const presetLabel = (n) => n < 60 ? MSG("home.presetMinutes", { n }) : n === 60 ? MSG("home.presetHour") : MSG("home.presetHours", { n: n / 60 });
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
  const ui = {
    page: fx.page || "home",
    sheet: live ? null : fx.sheet || null,
    busy: live ? (work().request ? "requesting" : null) : fx.busy || null,
    bar: live ? null : fx.bar || null,
    unknown: !live && !!fx.unknown,
    offlineFx: !live && !!fx.offline,
    addFailed: !live && !!fx.addFailed,
    duration: 30, addDuration: 30, hourRange: 24,
    toastUntil: !live && fx.toast ? (capture ? Number.MAX_SAFE_INTEGER : Date.now() + v("toastDuration")) : 0,
    profileError: null, fasterBusy: false,
    ...(params.saved || {}),
  };
  const offline = () => ui.offlineFx || store.get().offline === "yes";
  const v = (k) => value(k, mode);

  const root = h("div", { class: "home-screen tm" });
  host.replaceChildren(root);

  // ---------- pieces ----------
  function wheel(name, values, current, col) {
    const i = Math.max(0, values.indexOf(current));
    const rows = [i - 1, i, i + 1].map((j) => (j >= 0 && j < values.length ? values[j] : null));
    const busy = ui.busy === "setting" || ui.busy === "adding";
    return h("div", { class: "wheel", role: "listbox", "aria-label": name },
      rows.map((val, k) => val === null ? h("span", { class: "wheel-item wheel-item--empty" })
        : h("button", { type: "button", class: `wheel-item${k === 1 ? " is-selected" : ""}`, role: "option", "aria-selected": String(k === 1), disabled: busy,
          onclick: () => pickWheel(col, val) }, String(val))));
  }
  function picker(target, withMinimum) {
    const d = ui[target], hours = Math.floor(d / 60), minutes = d % 60;
    const busy = ui.busy === "setting" || ui.busy === "adding";
    const minuteValues = hours === 0 ? [15, 30, 45] : [0, 15, 30, 45];
    const hourValues = Array.from({ length: Math.max(ui.hourRange + 1, hours + 12) }, (_, n) => n);
    pickTarget = target;
    return h("div", { class: "picker" },
      h("div", { class: "presets" }, PRESETS.map((n) => h("button", { type: "button", class: "tm-chip tm-chip--lg", "aria-pressed": String(d === n), disabled: busy,
        onclick: () => { ui[target] = n; draw(); } }, presetLabel(n)))),
      h("div", { class: "adjust-row" }, h("p", { class: "adjust", text: MSG("home.adjust") }), withMinimum ? h("p", { class: "helper", text: MSG("home.minimum") }) : null),
      h("div", { class: "col-heads" }, h("span", { text: MSG("home.hours") }), h("span", { text: MSG("home.minutes") })),
      h("div", { class: "columns" }, h("div", { class: "wheel-band", "aria-hidden": "true" }),
        wheel(MSG("home.hours"), hourValues, hours, "h"), wheel(MSG("home.minutes"), minuteValues, minutes, "m")));
  }
  let pickTarget = "duration";
  function pickWheel(col, val) {
    const d = ui[pickTarget];
    let hh = Math.floor(d / 60), mm = d % 60;
    if (col === "h") hh = val; else mm = val;
    if (hh >= ui.hourRange - 2) ui.hourRange += 24;
    ui[pickTarget] = Math.max(v("availabilityMinimum") / MIN, hh * 60 + mm);   // minimum 15 minutes (app-logic §3)
    draw();
  }
  const NOTE = {
    "setup-failed": () => notice("error", MSG("home.setupFailed"), { cls: "status" }),
    "request-failed": () => notice("error", MSG("home.requestFailed"), { cls: "status" }),
    "no-cases": () => notice("neutral", MSG("home.noCases"), { cls: "status" }),
  };
  // Bar notice (A-19, lane-request 7): offline and the result of the bar's own action sit in the bar; near expiry too.
  function barNotice(a) {
    if (offline() && a.state !== "none") return notice("warning", MSG("home.offline"), { cls: "status" });
    if (ui.bar && NOTE[ui.bar]) return NOTE[ui.bar]();
    if (a.state === "near" && !ui.sheet) return notice("warning", MSG("home.endingSoon"), { iconName: "clock", cls: "status" });
    return null;
  }
  // Standing notice at the top of the panel: ended (idle / by the doctor), ending after the open request, expired with it.
  function topNotice(a) {
    const w = work();
    if (a.state === "stopping") return notice("neutral", MSG("home.stopPending"), { cls: "status" });
    if (a.state === "expired-pending") return notice("neutral", MSG("home.expiredPending"), { cls: "status" });
    if (a.state === "none" && w.ended === "idle") return notice("neutral", MSG("home.idleExpired"), { cls: "status" });
    if (a.state === "none" && w.ended === "manual") return notice("neutral", MSG("home.manuallyEnded"), { cls: "status" });
    return null;
  }
  function footer(a) {
    const lg = "tm-btn--lg tm-btn--block";
    const t = Date.now() < ui.toastUntil ? toast(MSG("home.added"), "home-toast") : null;
    if (ui.unknown) return actionBar([statusLine(MSG("home.unknownResult")), t], { cls: "footer" });
    const setup = a.state === "none";
    const busyLabel = { setting: "home.setting", requesting: "home.requesting", adding: "home.adding" }[ui.busy];
    let primary;
    if (busyLabel && ui.busy !== "adding") primary = busyBtn(MSG(busyLabel), `tm-btn--primary ${lg}`);
    else if (setup) primary = btn(MSG("home.setAvailability"), `tm-btn--primary ${lg}`, onSet, { "data-confirm": "" });
    else primary = btn(MSG("home.requestCase"), `tm-btn--primary ${lg}`, onRequest, { "data-confirm": "", disabled: offline() || a.state === "stopping" || a.state === "expired-pending" || !!ui.busy });
    let secondary = null;
    if (!setup && !ui.sheet && a.state !== "expired-pending") {
      secondary = a.state === "stopping" ? btn(MSG("home.ending"), `tm-btn--quiet ${lg}`, null, { "data-secondary": "" })
        : btn(MSG("home.endAvailability"), `tm-btn--quiet ${lg}`, () => openSheet("end"), { "data-secondary": "", disabled: offline() });   // D-81 F13
    }
    return actionBar([primary, secondary, t], { notice: barNotice(a), cls: "footer" });
  }
  function timeBlock(a) {
    if (a.state === "stopping") return null;   // no time row while ending (D-47)
    const near = a.state === "near";
    return [h("div", { class: "timer-row" }, h("span", { class: "timer-label", text: MSG("home.timeRemaining") }),
      near && !ui.sheet || near && ui.sheet === "add" ? h("button", { id: "add", class: "tm-btn tm-btn--secondary add-link", type: "button", onclick: () => openSheet("add") }, MSG("home.addTime")) : null),
      h("p", { class: `tm-value-display time${near ? " time--warning" : ""}`, id: "home-time", text: formatLeft(a.left) })];
  }
  function addSheet() {
    const busy = ui.busy === "adding";
    return sheet({
      title: MSG("home.addTitle"), subtitle: MSG("home.addSub"), closeDisabled: busy, onClose: closeSheet,
      body: [picker("addDuration", false), ui.addFailed ? notice("error", MSG("home.addFailed"), { cls: "sheet-feedback" }) : null],
      actions: [busy ? busyBtn(MSG("home.adding"), "tm-btn--primary tm-btn--lg tm-btn--block")
        : btn(MSG("home.addConfirm", { n: ui.addDuration }), "tm-btn--primary tm-btn--lg tm-btn--block", onAdd, { "data-confirm": "" }),
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
    const title = setup ? "home.titleSetup" : a.state === "expired-pending" ? "home.titleEnded" : a.state === "stopping" ? "home.titleStopping" : "home.titleActive";
    const sub = setup ? "home.subSetup" : a.state === "expired-pending" || a.state === "stopping" ? "home.subNoNewCases" : "home.subActive";
    const rx = work().rxToday;
    return h("div", { class: "home-bg", inert: ui.sheet ? "" : null },
      h("header", { class: "header" }, h("img", { class: "logo", src: "brand/truemeds-for-doctors.svg", alt: MSG("signin.logoAlt") }),
        h("div", { class: "header-actions" },
          [["bell", "home.notifications", toPlaceholder], ["help-circle", "common.help", toPlaceholder], ["user-circle", "home.profile", toProfile]]
            .map(([ic, label, fn]) => h("button", { class: "tm-btn tm-btn--quiet tm-btn--icon", type: "button", "aria-label": MSG(label), onclick: fn }, icon(ic))))),
      h("section", { class: "band" }, h("h1", { class: "tm-text-title-lg", text: MSG(title) }), h("p", { class: "sub", text: MSG(sub) })),
      h("div", { class: "panel" }, topNotice(a),
        h("div", { class: "scroll" },
          h("div", { class: "rx" }, h("span", { text: MSG("home.rxToday") }), h("strong", { text: String(rx) })),
          setup ? picker("duration", true) : timeBlock(a)),
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
  function draw() {
    const a = availability();
    lastKey = drawKey(a);
    const page = ui.page === "profile" ? profilePage() : homePage(a);
    const overlay = ui.sheet === "add" ? addSheet() : ui.sheet === "end" ? endSheet() : ui.sheet === "logout" ? logoutSheet() : null;
    root.replaceChildren(page, overlay || "");
    root.classList.toggle("is-profile", ui.page === "profile");
    paintIcons(root);
    if (overlay && !capture) focusSheet(overlay);
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
    ui.busy = "setting"; ui.bar = null; draw();
    life.later(() => { ui.busy = null; setAvailability(ui.duration * MIN); draw(); });
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
      clearRequest();
      ui.bar = r === "failed" ? "request-failed" : "no-cases";   // no cases: no auto re-check (OQ-019)
      draw();
    });
  }
  function onAdd() {
    if (ui.busy) return;
    ui.busy = "adding"; ui.addFailed = false; draw();
    life.later(() => {
      ui.busy = null; addTime(ui.addDuration * MIN); ui.sheet = null;
      ui.toastUntil = Date.now() + v("toastDuration");   // about 4 s (RULES §9.5 toast)
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
  function profileBack() { if (depth() > 1) navBack(); else { resetNav(); push(null, { s: "home_active", live: true }); } }

  // A request in flight (opened on Requesting…, Ending…, expired-pending, Checking…) gets its answer.
  if (work().request && !ui.busy && !fx.page && !ui.unknown && ["active", "near"].includes(availability().state)) ui.busy = "requesting";
  if (work().request && !fx.page) resolveRequest();
  // The clock: the timer reads it; when the window ends the screen changes (idle-expired, expired-pending, stop-pending → ended).
  if (!capture) life.every(() => {
    const a = availability();
    const t = root.querySelector("#home-time");
    if (drawKey(a) !== lastKey) draw(); else if (t) t.textContent = formatLeft(a.left);
  }, 250);
  const unsub = store.subscribe(() => { if (!life.alive()) { unsub(); return; } if (drawKey(availability()) !== lastKey) draw(); });

  setScreenBack(ui.page === "profile" ? profileBack : null);   // Home is a root: phone back stays in the app; Profile goes back
  draw();
  return { journey: "home" };
}
