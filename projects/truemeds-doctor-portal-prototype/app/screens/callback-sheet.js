// Schedule callback sheet (app-logic §7; pictures c-callback, c-callback-error, c-callback-failed, c-callback-refused). Markup
// and classes lifted from ui-screens/case/case.html #sheet-callback. Offered only on 6 Call too short and 7d Result not received
// (CW-A1, CW-C3). Date Today · Tomorrow, time from the backend's slots; a missing choice is a field error under the grid; a save
// failure or the backend's refusal is a notice in the sheet with the choices kept. State lives in the case page (cb).
import { MSG } from "../core/msg.js";
import { h } from "../core/dom.js";
import { btn, busyBtn, notice, sheet } from "./parts.js";
import { CALLBACK_SLOTS } from "../data/callback-slots.js";

// cb: { day, time, error (message key), notice (message key), busy }
export function callbackSheet(cb, { onDay, onTime, onConfirm, onClose }) {
  const chip = (label, pressed, onclick, attrs) => h("button", { type: "button", class: "tm-chip tm-chip--lg", "aria-pressed": String(pressed), onclick, disabled: cb.busy, ...attrs }, label);
  const body = [
    h("div", { class: "tm-sheet__label sheet-section-label", text: MSG("callback.date") }),
    h("div", { class: "tm-chip-group", id: "callback-day-chips", role: "group", "aria-label": MSG("callback.date") },
      chip(MSG("callback.today"), cb.day === "today", () => onDay("today"), { "data-day": "today" }),
      chip(MSG("callback.tomorrow"), cb.day === "tomorrow", () => onDay("tomorrow"), { "data-day": "tomorrow" })),
    h("div", { class: "tm-sheet__label sheet-section-label", text: MSG("callback.time") }),
    h("div", { class: "tm-chip-grid tm-chip-grid--3", id: "callback-time-chips", role: "group", "aria-label": MSG("callback.time") },
      CALLBACK_SLOTS.map(([v, label]) => chip(label, cb.time === v, () => onTime(v), { "data-time": v }))),
    // the field-error slot is always there, 8 under the Time grid (D-54 D11); the helper shows only with an error
    h("div", { class: "tm-field tm-field--error", id: "callback-error-wrap" },
      h("div", { id: "callback-error", class: "tm-field__helper callback-error", role: "alert", hidden: !cb.error, text: cb.error ? MSG(cb.error) : "" })),
  ];
  const confirm = cb.busy ? busyBtn(MSG("callback.confirm"), "tm-btn--primary tm-btn--lg tm-btn--block")
    : btn(MSG("callback.confirm"), "tm-btn--primary tm-btn--lg tm-btn--block", onConfirm, { id: "callback-confirm" });
  return sheet({ title: MSG("callback.title"), body, actions: [confirm], onClose, closeDisabled: cb.busy, id: "sheet-callback",
    beforeActions: cb.notice ? h("div", { class: "callback-notice" }, notice("error", MSG(cb.notice))) : null });
}
