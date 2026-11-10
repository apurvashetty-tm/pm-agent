// The phone's own number keyboard, drawn as in the approved pictures (sign-in, OTP). Shown in review and capture modes only;
// demo and play use the phone's real keyboard. [MOCK ASSUMPTION] — plan v3.2 is silent; step 1 recovery brief rule.
// Keys type into the field (desktop review has no on-screen keyboard). The drawing is not app UI: its colours live in
// mock-keyboard.css, the one file exempt from the token rule, like the mock Rx paper.
import { h } from "../core/dom.js";
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];
export function drawsKeyboard(mode) { return mode === "review" || mode === "capture"; }
export function mockKeyboard(onKey) {
  return h("div", { class: "mock-kbd", "aria-hidden": "true" },
    KEYS.map((k) => h("div", {
      class: "mock-kbd__key",
      onpointerdown: (e) => { e.preventDefault(); if (k) onKey(k === "⌫" ? "back" : k); }, // keeps focus in the field
    }, k)));
}
// The text keyboard (case notes, Additional instructions) and the number pad with a decimal key (Prescribe "Other" dose,
// B-18), as drawn in the approved case / Prescribe pictures (a-notes-typing, d-notes-keyboard, d-error-other). Capture only:
// on a desktop review the computer's keyboard types; on a phone its own keyboard appears.
const TEXT_ROWS = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", ["", "blank"], ["⇧"], "z", "x", "c", "v", "b", "n", "m", ["⌫", "w2"], ["123", "w2"], ["space", "w6"], ["return", "w2"]];
export function mockTextKeyboard() {
  return h("div", { class: "mock-kbd mock-kbd--case mock-kbd--text", "aria-hidden": "true" },
    TEXT_ROWS.map((k) => { const [label, mod] = Array.isArray(k) ? k : [k]; return h("div", { class: `mock-kbd__key${mod ? " mock-kbd__key--" + mod : ""}` }, label); }));
}
export function mockDecimalKeyboard() {
  return h("div", { class: "mock-kbd mock-kbd--case", "aria-hidden": "true" }, ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((k) => h("div", { class: "mock-kbd__key" }, k)));
}
