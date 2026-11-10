// Mark patient unavailable sheet (app-logic §7, D-75; picture s7d-unavailable-sheet). Opened only from 7d Result not received.
// Same markup as the Disable sheet: choosing a reason closes the case at once (it is the confirmation); ✕ backs out, no change.
// The chosen reason is saved with the case for Ops monitoring (D-73).
import { MSG } from "../core/msg.js";
import { h } from "../core/dom.js";
import { option, sheet } from "./parts.js";

export const UNAVAILABLE_REASONS = [
  ["unavailable.noAnswer", "unavailable.noAnswerDesc"],
  ["unavailable.notReachable", "unavailable.notReachableDesc"],
  ["unavailable.wrongNumber", "unavailable.wrongNumberDesc"],
];
export function unavailableSheet({ onReason, onClose }) {
  return sheet({ title: MSG("unavailable.title"), label: MSG("unavailable.selectReason"), onClose, id: "sheet-mark-unavailable",
    body: [h("div", { class: "reason-list" }, UNAVAILABLE_REASONS.map(([t, d]) => option(MSG(t), MSG(d), () => onReason(MSG(t)))))] });
}
