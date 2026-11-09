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
