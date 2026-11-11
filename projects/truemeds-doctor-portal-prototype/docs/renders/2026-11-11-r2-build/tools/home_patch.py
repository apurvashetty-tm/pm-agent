"""P6–P8: Home v3 body in app/screens/home.js (one-off patch, kept for the record). Run from the project folder."""
import pathlib
p = pathlib.Path('app/screens/home.js'); s = p.read_text()


def rep(a, b):
    global s
    assert a in s, a[:90]
    s = s.replace(a, b)


rep('''import { wheelColumn, syncWheels, commitWheels } from "./wheel.js";''', '''import { wheelColumn, syncWheels, commitWheels } from "./wheel.js";
import { band } from "./band.js";
import { parts } from "../core/dom.js";''')

rep('''const presetLabel = (n) => n < 60 ? MSG("home.presetMinutes", { n }) : n === 60 ? MSG("home.presetHour") : MSG("home.presetHours", { n: n / 60 });''',
    '''const presetLabel = (n) => n < 60 ? MSG("home.presetMinutes", { n }) : n === 60 ? MSG("home.presetHour") : MSG("home.presetHours", { n: n / 60 });
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
const clampLen = (n, max) => Math.max(MIN_LEN, Math.min(Math.floor(max / STEP) * STEP, n));''')

rep('''    duration: 30, addDuration: 30, hourRange: 24,''', '''    duration: 30, addDuration: 30,''')

rep('''  function picker(target, withMinimum) {
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
  function pickWheel(col, val, focus) {
    if (ui.busy === "setting" || ui.busy === "adding") return;
    const d = ui[pickTarget];
    let hh = Math.floor(d / 60), mm = d % 60;
    if (col === "h") hh = val; else mm = val;
    if (hh >= ui.hourRange - 2) ui.hourRange += 24;
    ui[pickTarget] = Math.max(v("availabilityMinimum") / MIN, hh * 60 + mm);   // minimum 15 minutes (app-logic §3)
    draw(focus ? col : null);
  }''', '''  // The top of the wheel (D-106): setup 10 h; Add time what is left of the 10 hours in total, on the 15-minute step.
  function maxFor(target) {
    if (target === "duration") return CAP;
    return Math.max(0, Math.floor((CAP * MIN - availability().left) / (STEP * MIN)) * STEP);
  }
  // One duration picker (D-106, RULES "Entry and home screens"): "Quick picks" (6 chips) → 32 → "Custom" → column heads 4 → wheel.
  // No range text; the add-time sheet has the hint "Up to 10 hours in total" on the Custom line.
  function picker(target) {
    const max = maxFor(target);
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
    const max = maxFor(pickTarget);
    const d = ui[pickTarget];
    let hh = Math.floor(d / 60), mm = d % 60;
    if (col === "h") hh = val; else mm = val;
    // Moving the hours keeps the minutes where the new hour allows them (0 h: from 15; the top hour: up to the limit).
    const mins = minutesFor(hh, max);
    if (!mins.includes(mm)) mm = mm > mins[mins.length - 1] ? mins[mins.length - 1] : mins[0];
    ui[pickTarget] = clampLen(hh * 60 + mm, max);
    draw(focus ? col : null);
  }''')

rep('''    else if (setup) primary = btn(MSG("home.setAvailability"), `tm-btn--primary ${lg}`, onSet, { "data-confirm": "" });''',
    '''    else if (setup) primary = btn(MSG("home.setAvailability"), `tm-btn--primary ${lg}`, onSet, { "data-confirm": "" });
    // Setup: "Available until {time}", 8 above Set availability (D-106; bar caption, RULES "Entry and home screens").
    const until = setup ? h("p", { class: "until", id: "home-until" }, parts("home.availableUntil", { time: h("b", { text: clockTime(clock.now() + ui.duration * MIN) }) }, MSG)) : null;''')
rep('''    return actionBar([primary, secondary, t], { notice: barNotice(a), cls: "footer" });''',
    '''    return actionBar([until, primary, secondary, t], { notice: barNotice(a), cls: "footer" });''')

rep('''  function timeBlock(a) {
    if (a.state === "stopping") return null;   // no time row while ending (D-47)
    const near = a.state === "near";
    return [h("div", { class: "timer-row" }, h("span", { class: "timer-label", text: MSG("home.timeRemaining") }),
      near && !ui.sheet || near && ui.sheet === "add" ? h("button", { id: "add", class: "tm-btn tm-btn--secondary add-link", type: "button", onclick: () => openSheet("add") }, MSG("home.addTime")) : null),
      h("p", { class: `tm-value-display time${near ? " time--warning" : ""}`, id: "home-time", text: formatLeft(a.left) })];
  }''', '''  // Prescriptions written today: one card row that opens Profile (D-106). On ended Home it shows above the picker when above 0.
  function rxRow() {
    return h("button", { class: "srow srow--link", id: "home-rx", type: "button", onclick: toProfile },
      icon("prescription", "srow__icon"),
      h("span", { class: "srow__txt" }, h("span", { class: "srow__label", text: MSG("home.rxToday") }),
        h("span", { class: "srow__line" }, h("span", { class: "tm-value-display srow__value", text: String(work().rxToday) }))),
      icon("chevron-right", "srow__chev"));
  }
  // Available: one tm-card, two rows of one anatomy (grey icon · 16/24 label · L9 value) — Time remaining with + Add time on the
  // value line, always shown (greyed offline; also greyed when less than 15 minutes fit under the cap), and Prescriptions written
  // today → Profile. Ending (stop-pending) and ended with a request open show no time row (D-47).
  function statusCard(a) {
    const timed = a.state === "active" || a.state === "near";
    const canAdd = maxFor("addDuration") >= MIN_LEN;
    return h("div", { class: "tm-card home-card" },
      timed ? h("div", { class: "srow" }, icon("clock", "srow__icon"),
        h("div", { class: "srow__txt" }, h("p", { class: "srow__label", text: MSG("home.timeRemaining") }),
          h("div", { class: "srow__line" },
            h("p", { class: "tm-value-display srow__value time", id: "home-time", "aria-live": "off", text: formatLeft(a.left) }),
            h("button", { id: "add", class: "tm-btn tm-btn--secondary add-time", type: "button", disabled: offline() || !canAdd, onclick: () => openSheet("add") },
              icon("plus", "tm-icon--16"), MSG("home.addTime"))))) : null,
      rxRow());
  }''')

rep('''      body: [picker("addDuration", false), ui.addFailed ? notice("error", MSG("home.addFailed"), { cls: "sheet-feedback" }) : null],
      actions: [busy ? busyBtn(MSG("home.adding"), "tm-btn--primary tm-btn--lg tm-btn--block")
        : btn(MSG("home.addConfirm", { n: ui.addDuration }), "tm-btn--primary tm-btn--lg tm-btn--block", onAdd, { "data-confirm": "" }),''',
    '''      body: [picker("addDuration")],
      // D-106: the error sits in the pinned actions, 16 above Add (visible on arrival at 360 × 640).
      actions: [ui.addFailed ? notice("error", MSG("home.addFailed"), { cls: "sheet-feedback" }) : null,
        busy ? busyBtn(MSG("home.adding"), "tm-btn--primary tm-btn--lg tm-btn--block")
        : btn(MSG("home.addConfirm", { duration: durationLabel(ui.addDuration) }), "tm-btn--primary tm-btn--lg tm-btn--block", onAdd, { "data-confirm": "" }),''')

rep('''    const rx = work().rxToday;
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
        footer(a)));''', '''    const rx = work().rxToday;
    const actions = [["bell", "home.notifications", toPlaceholder], ["help-circle", "common.help", toPlaceholder], ["user-circle", "home.profile", toProfile]]
      .map(([ic, label, fn]) => h("button", { class: "tm-btn tm-btn--quiet tm-btn--icon", type: "button", "aria-label": MSG(label), onclick: fn }, icon(ic)));
    // The one band (D-107; Home header actions = variant 1) · panel: standing notice → 32 → content (D-108) · the pinned bar.
    return h("div", { class: "home-bg", inert: ui.sheet ? "" : null },
      band({ title: MSG(title), subtitle: MSG(sub), actions, tag: "div" }),
      h("div", { class: "entry-panel panel" }, topNotice(a),
        h("div", { class: "scroll" },
          setup ? [work().ended && rx > 0 ? h("div", { class: "tm-card home-card" }, rxRow()) : null, picker("duration")] : statusCard(a)),
        footer(a)));''')
p.write_text(s)
print('ok')
