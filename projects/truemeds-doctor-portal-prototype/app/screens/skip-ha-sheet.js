// Skip the Health Advisor call sheet (app-logic §6, D-59, D-70 item 3; picture c-skip-ha; markup lifted from case.html
// #sheet-skip-ha). Opened from Skip HA on B1 (live call) and 16 (ended before the transfer). Same pattern as the Unavailable
// sheet: choosing a reason applies it at once (it is the confirmation); ✕ backs out with no change. Eligibility comes from the
// backend [OPEN DECISION OQ-008]; the prototype offers it wherever the approved screens show the button.
import { MSG } from "../core/msg.js";
import { h } from "../core/dom.js";
import { option, sheet } from "./parts.js";

export const SKIP_HA_REASONS = [
  ["skipHa.declined", "skipHa.declinedDesc"],
  ["skipHa.notRequired", "skipHa.notRequiredDesc"],
  ["skipHa.repeat", "skipHa.repeatDesc"],
];
export function skipHaSheet({ onReason, onClose }) {
  return sheet({ title: MSG("skipHa.title"), label: MSG("skipHa.selectReason"), onClose, id: "sheet-skip-ha",
    body: [h("div", { class: "reason-list" }, SKIP_HA_REASONS.map(([t, d]) => option(MSG(t), MSG(d), () => onReason(MSG(t)))))] });
}
