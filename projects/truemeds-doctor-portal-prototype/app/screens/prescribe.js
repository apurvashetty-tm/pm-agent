// Prescribe one medicine (plan v3.2 step 4): a full-screen view over the case page, inside the frame. Markup and classes
// lifted from ui-screens/case/case.html (#prescribe-screen: edit header with ✕ / name + form / Disable, the pinned
// "On prescription" band, the cards, the pinned Prescribe bar, the Disable and Discard sheets); styles in prescribe.css.
// Rules: app-logic §8 (dose by form, How often, SOS, duration, food, instructions, the two checks, printed line, disabled
// medicine, ✕ with changes, Disable reasons) and §9 keyboard rule. Every word through MSG(); the medicine is mock data.
import { MSG } from "../core/msg.js";
import { h } from "../core/dom.js";
import { icon, paint, btn, sheet, option, notice, focusSheet, revealAboveKeyboard } from "./parts.js";
import { mockTextKeyboard, mockDecimalKeyboard } from "../shell/mock-keyboard.js";

const ONGOING_PERIOD = { n: 6, unit: "m" };   // the backend's default for Ongoing [MOCK ASSUMPTION, app-logic §8]
// Dose choices by form (app-logic §8 table; D-54: injection 1 · 2 · 3 + Other; D-81: capsules without ½).
const FORM = {
  tablet:    { slot: [0, 0.5, 1, 2], each: [0.5, 1, 2], one: "tablet", many: "tablets", bare: true },
  capsule:   { slot: [0, 1, 2], each: [1, 2], one: "capsule", many: "capsules", bare: true },
  syrup:     { slot: [0, 2.5, 5, 10], each: [2.5, 5, 10], one: "ml", many: "ml", other: "ml", showUnit: true },
  drops:     { slot: [0, 1, 2, 3], each: [1, 2, 3], one: "drop", many: "drops" },
  inhaler:   { slot: [0, 1, 2], each: [1, 2], one: "puff", many: "puffs", showUnit: true },
  injection: { slot: [0, 1, 2, 3], each: [1, 2, 3], one: "dose", many: "doses", other: "units" },
  cream:     { slot: [0, 1], each: [1], one: "time", many: "times", apply: true },
};
const INTERVALS = [["daily", "prescribe.daily"], ["every_x_hours", "prescribe.everyXHours"], ["alt_days", "prescribe.altDays"], ["weekly", "prescribe.weekly"], ["monthly", "prescribe.monthly"], ["sos", "prescribe.sosOnly"]];
const HOURS = [4, 6, 8, 12], SOS_MAX = [1, 2, 3, 4], DUR_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 10, 14, 15];
const DUR_UNITS = [["d", "prescribe.days"], ["w", "prescribe.weeks"], ["m", "prescribe.months"]];
const FOODS = [["after_food", "prescribe.afterFood"], ["before_food", "prescribe.beforeFood"], ["empty_stomach", "prescribe.emptyStomach"]];
const SLOTS = [["m", "prescribe.keyMorning", "prescribe.morning"], ["a", "prescribe.keyAfternoon", "prescribe.afternoon"], ["n", "prescribe.keyNight", "prescribe.night"]];
const REASONS = [["prescribe.reasonRemote", "prescribe.reasonRemoteDesc"], ["prescribe.reasonContra", "prescribe.reasonContraDesc"], ["prescribe.reasonDuplicate", "prescribe.reasonDuplicateDesc"], ["prescribe.reasonDeclined", "prescribe.reasonDeclinedDesc"], ["prescribe.reasonStrength", "prescribe.reasonStrengthDesc"]];
const fd = (f) => FORM[f] || FORM.tablet;
const num = (v) => (v === 0.5 ? "½" : String(v));
const unit = (key) => MSG(`print.unit.${key}`);

// ---- the printed line (app-logic §8 "Printed line", D-80 pt 3, D-81 F14) ----
// "Other" picked with no valid number leaves the dose out (D-54 D12). Only plain positive numbers: 7, 7.5, .5.
export function parseDose(s) { const t = String(s ?? "").trim(); if (!/^(\d+(\.\d+)?|\.\d+)$/.test(t)) return NaN; const v = Number(t); return v > 0 ? v : NaN; }
function doseOf(x) { return x.doseOther ? parseDose(x.doseOtherVal) : x.dose; }
function amount(form, v, other) {   // "1 tablet", "½ tablet", "5 ml", "2 puffs", "7.5 units"
  const f = fd(form);
  if (other) return MSG("print.amount", { n: v, unit: unit(f.other) });
  return MSG("print.amount", { n: num(v), unit: unit(v > 1 ? f.many : f.one) });
}
function total(form, v, max, other) {   // the SOS daily limit in the medicine's unit; a total of 1 is singular
  const f = fd(form), t = Math.round(v * max * 100) / 100;
  if (f.apply) return MSG("print.amount", { n: t, unit: unit(t === 1 ? "time" : "times") });
  if (other) return MSG("print.amount", { n: t, unit: unit(f.other) });
  return MSG("print.amount", { n: num(t), unit: unit(t === 1 ? f.one : f.many) });
}
const man = (x) => `${num(x.m)}-${num(x.a)}-${num(x.n)}`;
function schedule(x) {
  const f = fd(x.form), d = doseOf(x), ok = isFinite(d);
  const dose = ok ? (f.apply ? MSG("prescribe.apply") : amount(x.form, d, x.doseOther)) : "";
  let t;
  switch (x.interval) {
    case "daily": t = f.apply ? MSG("print.applyMAN", { man: man(x) }) : f.bare ? man(x) : `${man(x)} ${unit(f.many)}`; break;
    case "every_x_hours": t = MSG("print.everyHours", { dose, n: x.hours }); break;
    case "alt_days": t = MSG("print.altDays", { dose }); break;
    case "weekly": t = MSG("print.weekly", { dose }); break;
    case "monthly": t = MSG("print.monthly", { dose }); break;
    case "sos": return f.apply ? MSG("print.applyAsNeeded", { max: total(x.form, 1, x.sosMax) }) : MSG("print.asNeeded", { dose, max: ok ? total(x.form, d, x.sosMax, x.doseOther) : "" });
    default: t = "";
  }
  if (!x.sos) return t;
  return MSG("print.plusSos", { schedule: t, dose: f.apply ? MSG("prescribe.apply") : amount(x.form, x.sosDose), max: total(x.form, f.apply ? 1 : x.sosDose, x.sosMax) });
}
function durationWords(code) {
  const n = code === "ongoing" ? ONGOING_PERIOD.n : parseInt(code, 10), u = code === "ongoing" ? ONGOING_PERIOD.unit : code.slice(-1);
  const word = { d: n === 1 ? "day" : "days", w: n === 1 ? "week" : "weeks", m: n === 1 ? "month" : "months" }[u];
  return MSG("print.duration", { n, unit: MSG(`print.${word}`) });
}
export function printLine(x) {
  const food = FOODS.find(([k]) => k === x.food);
  let line = [schedule(x), durationWords(x.duration), food ? MSG(food[1]) : "", (x.note || "").trim()].filter(Boolean).join(MSG("print.sep")).trim();
  return line.charAt(0).toUpperCase() + line.slice(1);
}
// B-12: a number stays with its unit ("6 months" never splits): each "number unit" pair is one no-wrap span.
function printNodes(line) {
  const out = []; let last = 0;
  for (const m of line.matchAll(/(\d+(?:\.\d+)?|\.\d+|½) ([A-Za-z]+)/g)) {
    if (m.index > last) out.push(document.createTextNode(line.slice(last, m.index)));
    out.push(h("span", { class: "ps-keep", text: m[0] })); last = m.index + m[0].length;
  }
  if (last < line.length) out.push(document.createTextNode(line.slice(last)));
  return out;
}

// ---- the screen ----
// opts: mode, fixture (the d-* picture moment or null), later (timer bound to the screen's life), onSave(patch), onDisable(reason), onClose().
export function prescribeScreen(med, opts) {
  const f = fd(med.form), fx = opts.fixture || {};
  const durCode = med.duration || "ongoing";
  const x = {
    form: med.form, interval: med.interval || "daily", m: med.m ?? 0, a: med.a ?? 0, n: med.n ?? 0, hours: med.hours || 8,
    dose: med.dose ?? f.each[Math.min(1, f.each.length - 1)], doseOther: !!med.doseOther, doseOtherVal: med.doseOther ? String(med.dose) : "",
    sos: !!med.sos, sosDose: med.sosDose ?? (f.each.includes(1) ? 1 : f.each[0]), sosMax: med.sosMax || 1,
    durOngoing: durCode === "ongoing", durN: durCode === "ongoing" ? 1 : parseInt(durCode, 10), durU: durCode === "ongoing" ? "d" : durCode.slice(-1),
    food: med.food || null, note: med.note || "",
  };
  const ui = { err: null, durOpen: false, sheet: null, kb: null };
  Object.assign(x, Object.fromEntries(Object.entries(fx.edit || {}).filter(([k]) => k !== "durOpen")));
  if (fx.edit && fx.edit.durOpen) ui.durOpen = true;
  const durationCode = () => (x.durOngoing ? "ongoing" : `${x.durN}${x.durU}`);
  const model = () => ({ ...x, duration: durationCode() });
  const changed = () => JSON.stringify(model()) !== JSON.stringify(prescribeScreen.baselineOf(med));   // ✕ asks first only after a change

  const screen = h("div", { id: "prescribe-screen", role: "dialog", "aria-modal": "true", "aria-labelledby": "ps-title", tabindex: "-1", class: "open" });
  const printEl = h("div", { id: "ps-prints-text", "aria-live": "polite", "aria-labelledby": "ps-rx-label" });
  const note = h("textarea", { id: "ps-note", rows: "3", placeholder: MSG("prescribe.notesPlaceholder") });
  note.value = x.note;
  note.addEventListener("input", () => { x.note = note.value; setPrint(); });
  note.addEventListener("focus", () => { if (opts.mode === "capture") showKb("text"); });
  note.addEventListener("blur", () => hideKb());
  const dynamic = h("div", { id: "ps-dynamic" });
  const body = h("div", { id: "ps-body" });
  const disabled = med.status === "disabled";
  const top = h("div", { id: "ps-top" },
    h("div", { id: "ps-bar", class: "tm-header-edit" },
      h("button", { class: "tm-btn tm-btn--quiet tm-btn--icon", type: "button", "aria-label": MSG("common.close"), onclick: requestClose }, icon("x")),
      h("div", { id: "ps-heading", class: "tm-header-edit__text" }, h("h2", { id: "ps-title", class: "tm-header-edit__title", text: `${med.name} ${med.strength}` }), h("p", { id: "ps-form", class: "tm-header-edit__subtitle", text: MSG(`form.${med.form}`) })),
      disabled ? null : h("button", { id: "ps-disable-btn", class: "tm-btn tm-btn--destructive", type: "button", onclick: () => openSheet("disable") }, MSG("prescribe.disable"))),
    h("div", { id: "ps-rx" }, h("div", { class: "ps-rx-label", id: "ps-rx-label" }, icon("prescription", "tm-icon--16"), MSG("prescribe.onPrescription")), printEl));
  const noteCard = h("div", { class: "tm-card ps-card" }, h("div", { class: "tm-field ps-section" },
    h("label", { class: "tm-field__label", for: "ps-note", id: "ps-note-label" }, MSG("prescribe.notesLabel").replace(/\s*\(.*\)$/, ""), " ", h("span", { class: "tm-muted", text: MSG("prescribe.optional") })),
    h("div", { class: "tm-field__control" }, note), h("div", { class: "tm-field__helper", id: "ps-note-helper", text: MSG("prescribe.notesHelper") })));
  body.append(disabled ? h("div", { id: "ps-disabled-note", class: "tm-notice tm-notice--warning", role: "status" }, icon("alert-triangle"), h("span", { id: "ps-disabled-text", text: MSG("case.disabledMedicine", { reason: med.disableReason || "" }) })) : "", dynamic, noteCard);
  const prescribeBtn = btn(MSG("prescribe.prescribe"), "tm-btn--lg tm-btn--primary tm-btn--block", onPrescribe, { id: "ps-prescribe" });
  const barEl = h("div", { id: "ps-actionbar", class: "tm-actionbar" }, prescribeBtn);
  const sheetSlot = h("div", { class: "ps-sheet-slot" });
  const kbSlot = h("div", { class: "ps-kb-slot" });
  screen.append(top, body, barEl, sheetSlot, kbSlot);

  // ---- builders ----
  let gid = 0;
  const chip = (label, pressed, onclick, aria) => h("button", { type: "button", class: "tm-chip tm-chip--lg", "aria-pressed": String(!!pressed), "aria-label": aria, onclick }, label);
  function group(labelKey, chips, { cls = "ps-chips", hint = "", id } = {}) {
    const lid = `psl-${++gid}`;
    return h("div", { class: "ps-section", id }, h("div", { class: "tm-field__label ps-label", id: lid }, MSG(labelKey), hint ? [" ", h("span", { class: "tm-muted", text: hint })] : null),
      h("div", { class: cls, role: "group", "aria-labelledby": lid }, chips));
  }
  const hint = () => (f.showUnit ? MSG("prescribe.unitHint", { unit: unit(f.many) }) : "");
  const slotLabel = (v) => (f.apply ? (v ? MSG("prescribe.apply") : MSG("prescribe.slotNone")) : num(v));
  function draw() {
    gid = 0;
    const set = (fn) => () => { fn(); draw(); };
    const cards = [];
    const sched = [group("prescribe.howOften", INTERVALS.map(([k, l]) => chip(MSG(l), x.interval === k, set(() => { x.interval = k; if (k === "sos") x.sos = false; if (k !== "daily" && ui.err === "dose") ui.err = null; }))))];
    if (x.interval === "daily") {
      const rows = SLOTS.map(([k, key, name]) => h("div", { class: "ps-slot" }, h("span", { class: "ps-slot-key", "aria-hidden": "true", text: MSG(key) }),
        h("div", { class: "ps-grid", role: "group", "aria-label": MSG(name) }, f.slot.map((val) => chip(slotLabel(val), x[k] === val, set(() => { x[k] = val; if (ui.err === "dose") ui.err = null; }),
          MSG("prescribe.slotAria", { slot: MSG(name), dose: val === 0 ? MSG("prescribe.none") : f.apply ? MSG("prescribe.apply") : amount(x.form, val) }))))));
      sched.push(h("div", { class: "ps-section", id: "ps-dose-section" }, h("div", { class: "tm-field__label ps-label" }, MSG("prescribe.dose"), " ", h("span", { class: "tm-muted", text: hint() })),
        h("div", { class: "ps-slots" }, rows),
        ui.err === "dose" ? h("p", { class: "tm-field__helper ps-dose-error", role: "alert", text: MSG("prescribe.doseError") }) : null));   // D-81 F16: field text, not a box
    } else {
      if (x.interval === "every_x_hours") sched.push(h("div", { class: "ps-section" }, h("div", { class: "tm-field__label ps-label", id: "psl-every", text: MSG("prescribe.every") }),
        h("div", { class: "ps-grid", role: "group", "aria-labelledby": "psl-every" }, HOURS.map((hh) => chip(MSG("prescribe.hoursChip", { n: hh }), x.hours === hh, set(() => { x.hours = hh; }), MSG("prescribe.hoursAria", { n: hh })))),
        h("div", { class: "ps-helper", text: MSG("prescribe.timesADay", { n: 24 / x.hours }) })));
      const opts2 = f.each.map((val) => chip(slotLabel(val), !x.doseOther && x.dose === val, set(() => { x.doseOther = false; x.dose = val; if (ui.err === "other") ui.err = null; })));
      if (f.other) opts2.push(chip(MSG("prescribe.other"), x.doseOther, () => { x.doseOther = true; draw(); const o = screen.querySelector("#ps-other"); if (o) o.focus(); }));
      let other = null;
      if (x.doseOther) {
        const input = h("input", { id: "ps-other", type: "text", inputmode: "decimal", placeholder: MSG("prescribe.otherPlaceholder") });
        input.value = x.doseOtherVal;
        input.addEventListener("input", () => { x.doseOtherVal = input.value; if (ui.err === "other" && parseDose(input.value) > 0) { ui.err = null; const fe = screen.querySelector("#ps-other-field"); fe.classList.remove("tm-field--error"); const hp = fe.querySelector(".tm-field__helper"); if (hp) hp.remove(); } setPrint(); });
        input.addEventListener("focus", () => { if (opts.mode === "capture") showKb("decimal"); });
        input.addEventListener("blur", () => hideKb());
        other = h("div", { class: `tm-field ps-gap${ui.err === "other" ? " tm-field--error" : ""}`, id: "ps-other-field" },
          h("label", { class: "tm-field__label", for: "ps-other", text: x.form === "injection" ? MSG("prescribe.doseUnits") : MSG("prescribe.doseIn", { unit: unit(f.other) }) }),   // B-11
          h("div", { class: "tm-field__control" }, input, h("span", { class: "ps-unit", text: unit(f.other) })),
          ui.err === "other" ? h("div", { class: "tm-field__helper", role: "alert", text: String(x.doseOtherVal).trim() ? MSG("prescribe.otherInvalid", { unit: unit(f.other) }) : MSG("prescribe.otherEmpty", { unit: unit(f.other) }) }) : null);
      }
      sched.push(h("div", { class: "ps-section", id: "ps-dose-section" }, h("div", { class: "tm-field__label ps-label" }, MSG("prescribe.dose"), " ", h("span", { class: "tm-muted", text: hint() })),
        h("div", { class: "ps-grid", role: "group" }, opts2), other));
      if (x.interval === "sos") sched.push(group("prescribe.maxDoses", SOS_MAX.map((mx) => chip(String(mx), x.sosMax === mx, set(() => { x.sosMax = mx; }))), { cls: "ps-grid" }));
    }
    cards.push(h("div", { class: "tm-card ps-card", id: "ps-card-schedule" }, sched));
    if (x.interval !== "sos") {
      const tg = h("input", { type: "checkbox", class: "tm-toggle", id: "ps-sos", "aria-describedby": "ps-sos-help" });
      tg.checked = x.sos;
      tg.addEventListener("change", () => { x.sos = tg.checked; draw(); const t2 = screen.querySelector("#ps-sos"); if (t2) t2.focus({ preventScroll: true }); });
      const sosCard = h("div", { class: "ps-section tm-card ps-card" }, h("div", {}, h("label", { class: "tm-check" }, tg, " ", MSG("prescribe.alsoSos")), h("div", { class: "ps-helper", id: "ps-sos-help", text: MSG("prescribe.sosHelp") })));
      if (x.sos) sosCard.append(h("div", { class: "ps-sub" },
        group("prescribe.dose", f.each.map((val) => chip(slotLabel(val), x.sosDose === val, set(() => { x.sosDose = val; }))), { cls: "ps-grid", hint: hint() }),
        h("div", { class: "ps-section ps-gap" }, h("div", { class: "tm-field__label ps-label", id: "psl-max-extra", text: MSG("prescribe.maxExtra") }),
          h("div", { class: "ps-grid", role: "group", "aria-labelledby": "psl-max-extra" }, SOS_MAX.map((mx) => chip(String(mx), x.sosMax === mx, set(() => { x.sosMax = mx; })))))));
      cards.push(sosCard);
    }
    // Duration: a dropdown-style field that opens the picker in place (D-55); "Default" or "Changed from default".
    const code = durationCode();
    const valueText = x.durOngoing ? MSG("prescribe.ongoingValue", { period: durationWords("ongoing") }) : durationWords(code);
    const dur = h("div", { class: `ps-dur-field${ui.durOpen ? " is-open" : ""}` },
      h("button", { type: "button", class: "ps-dur-toggle", "aria-expanded": String(ui.durOpen), "aria-controls": "ps-dur-panel", "aria-labelledby": "psl-duration ps-dur-value", onclick: set(() => { ui.durOpen = !ui.durOpen; }) },
        h("span", { class: "ps-dur-val", id: "ps-dur-value" }, valueText, h("span", { text: MSG(code !== (med.defaultDuration || durCode) ? "prescribe.changed" : "prescribe.default") })),
        icon(ui.durOpen ? "chevron-up" : "chevron-down", "tm-icon--24")),
      ui.durOpen ? h("div", { class: "ps-dur-panel", id: "ps-dur-panel" },
        h("div", { class: "ps-grid", role: "group", "aria-label": MSG("prescribe.durationNumber") }, DUR_NUMBERS.map((nn) => chip(String(nn), !x.durOngoing && x.durN === nn, set(() => { x.durN = nn; x.durOngoing = false; })))),
        h("div", { class: "ps-dur-units" }, h("div", { class: "tm-chip-group", role: "group", "aria-label": MSG("prescribe.durationUnit") },
          DUR_UNITS.map(([u, l]) => chip(MSG(l), !x.durOngoing && x.durU === u, set(() => { x.durU = u; x.durOngoing = false; }))),
          chip(MSG("prescribe.ongoing"), x.durOngoing, set(() => { x.durOngoing = true; }))))) : null);
    cards.push(h("div", { class: "tm-card ps-card", id: "ps-card-duration" }, h("div", { class: "ps-section" }, h("div", { class: "tm-field__label ps-label", id: "psl-duration", text: MSG("prescribe.duration") }), dur)));
    cards.push(h("div", { class: "tm-card ps-card", id: "ps-card-food" }, group("prescribe.food", FOODS.map(([k, l]) => chip(MSG(l), x.food === k, set(() => { x.food = x.food === k ? null : k; }))), { cls: "ps-chips ps-chips-fill", hint: MSG("prescribe.optional") })));   // tap again to clear
    const focusKey = document.activeElement && screen.contains(document.activeElement) && document.activeElement.closest(".ps-section") ? document.activeElement.textContent : null;
    dynamic.replaceChildren(...cards);
    paint(screen);
    setPrint();
    if (focusKey) { const again = [...dynamic.querySelectorAll("button")].find((b) => b.textContent === focusKey); if (again) again.focus({ preventScroll: true }); }
  }
  function setPrint() { printEl.replaceChildren(...printNodes(printLine(model()))); }

  // ---- checks and actions ----
  function validate() {   // the only two invalid states (app-logic §8 "Checks before Prescribe")
    if (x.interval === "daily" && x.m + x.a + x.n === 0) return "dose";
    if (x.interval !== "daily" && x.doseOther && !(parseDose(x.doseOtherVal) > 0)) return "other";
    return null;
  }
  function onPrescribe() {
    const err = validate();
    if (err) {
      ui.err = err; draw();
      const toError = () => { const target = screen.querySelector(err === "dose" ? "#ps-dose-section" : "#ps-other-field");   // scrolls to the first error (D-81 F16)
        if (target) body.scrollBy({ top: target.getBoundingClientRect().top - body.getBoundingClientRect().top - body.clientHeight / 3 }); };
      if (screen.isConnected) toError(); else requestAnimationFrame(toError);   // a d-* moment validates before the screen is shown
      if (err === "other" && opts.mode !== "capture") { const o = screen.querySelector("#ps-other"); if (o) o.focus({ preventScroll: true }); }
      return;
    }
    const m2 = model();
    opts.onSave({ interval: m2.interval, m: m2.m, a: m2.a, n: m2.n, hours: m2.hours, dose: m2.doseOther ? parseDose(m2.doseOtherVal) : m2.dose, doseOther: m2.doseOther,
      sos: m2.interval === "sos" ? false : m2.sos, sosDose: m2.sosDose, sosMax: m2.sosMax, duration: m2.duration, food: m2.food, note: m2.note.trim() });
  }
  function requestClose() { if (changed()) openSheet("discard"); else opts.onClose(); }   // ✕ with changes asks first (D-54)
  function openSheet(which) {
    ui.sheet = which;
    const o = which === "discard"
      ? sheet({ title: MSG("prescribe.discardTitle"), subtitle: MSG("prescribe.discardSub"), onClose: closeSheet,
        actions: [btn(MSG("prescribe.discard"), "tm-btn--destructive tm-btn--lg tm-btn--block", () => opts.onClose()), btn(MSG("prescribe.keepEditing"), "tm-btn--quiet tm-btn--lg tm-btn--block", closeSheet)] })
      : sheet({ title: MSG("prescribe.disableTitle", { name: `${med.name} ${med.strength}` }), label: MSG("prescribe.disableSub"), onClose: closeSheet, cls: "ps-reason-sheet",
        body: [h("div", { class: "reason-list" }, REASONS.map(([t, dsc]) => option(MSG(t), MSG(dsc), () => opts.onDisable(MSG(t)))))] });   // a reason disables it at once (D-59)
    sheetSlot.replaceChildren(o); paint(o); screen.classList.add("has-sheet");
    if (opts.mode !== "capture") focusSheet(o);
  }
  function closeSheet() { ui.sheet = null; sheetSlot.replaceChildren(); screen.classList.remove("has-sheet"); }
  function showKb(kind) { kbSlot.replaceChildren(kind === "decimal" ? mockDecimalKeyboard() : mockTextKeyboard()); screen.classList.add("kb-open"); }
  function hideKb() { if (opts.mode === "capture") return; kbSlot.replaceChildren(); screen.classList.remove("kb-open"); }
  screen.requestClose = () => { if (ui.sheet) closeSheet(); else requestClose(); };
  screen.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.preventDefault(); screen.requestClose(); } });

  draw();
  // Picture moments: the check result, an open sheet, the drawn keyboard, a scroll position (d-* fixtures).
  if (fx.validate) onPrescribe();
  if (fx.sheet) openSheet(fx.sheet);
  if (fx.kb === "text" && opts.mode === "capture") { showKb("text"); requestAnimationFrame(() => { note.focus({ preventScroll: true }); revealAboveKeyboard(body, note.closest(".tm-field"), kbSlot.firstChild); }); }
  if (fx.kb === "decimal" && opts.mode === "capture") requestAnimationFrame(() => showKb("decimal"));   // after the check scrolled to the error, as in the picture
  if (fx.scroll) requestAnimationFrame(() => {
    const target = fx.scroll === "duration" ? screen.querySelector("#ps-dur-panel") : fx.scroll === "food" ? screen.querySelector("#ps-card-food") : null;
    if (target) target.scrollIntoView({ block: "center" }); else body.scrollTop = 420;   // d-scrolled: case.html scrolls 420
  });
  return screen;
}
// The medicine's schedule as the screen first shows it (for "changed?"), so a d-* moment with edits counts as changed.
prescribeScreen.baselineOf = (med) => {
  const f = fd(med.form), durCode = med.duration || "ongoing";
  return { form: med.form, interval: med.interval || "daily", m: med.m ?? 0, a: med.a ?? 0, n: med.n ?? 0, hours: med.hours || 8,
    dose: med.dose ?? f.each[Math.min(1, f.each.length - 1)], doseOther: !!med.doseOther, doseOtherVal: med.doseOther ? String(med.dose) : "",
    sos: !!med.sos, sosDose: med.sosDose ?? (f.each.includes(1) ? 1 : f.each[0]), sosMax: med.sosMax || 1,
    durOngoing: durCode === "ongoing", durN: durCode === "ongoing" ? 1 : parseInt(durCode, 10), durU: durCode === "ongoing" ? "d" : durCode.slice(-1),
    food: med.food || null, note: med.note || "", duration: durCode };
};
