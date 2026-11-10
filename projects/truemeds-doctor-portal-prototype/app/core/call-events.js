// Reviewer event-log lines for the case page (plan §4: the event log names hold / retry / mismatch / confirm-completed events;
// D-50: the confirm outcomes are separate events). Review tooling, never shown to the doctor, so not registry copy.
// The four outcomes (app-logic §6 analytics) are told apart by route and HA status, never by the button text:
// Cat4 · HA skipped (customer / system / doctor) · transfer · forward.
const OUTCOME = (route, ha, transfer) => route === "cat4" ? "Cat4 — prescription confirmed"
  : route === "pilot" ? (transfer ? "transfer — transferred to Health Advisor" : "forward — forwarded to Health Advisor")
  : `HA skipped (${String(ha).replace("skipped-", "")}) — prescription confirmed`;
export const EV = {
  released: () => "case released (back to the queue)",
  callRequested: (n, route) => `call ${n} requested (${route})`,
  callEnded: () => "doctor: call ended → checking the call record (7c)",
  saved: () => "prescription saved, waiting for the call record (7f)",
  confirmFailed: () => "confirm failed: nothing lost",
  confirmed: (route, ha, transfer = false) => `confirm completed: ${OUTCOME(route, ha, transfer)}`,
  callbackRefused: () => "callback refused: the patient wasn't reached",
  callbackFailed: () => "callback save failed: choices kept",
  callbackScheduled: (day, time) => `callback scheduled: ${day} ${time} (case goes to the callback pool)`,
  skipHa: (reason) => `Skip HA: reason saved with the case: ${reason}`,
  confirmLive: () => "B1 Confirm prescription on the live call → checking for a Health Advisor (B2)",
  forwardSaved: () => "Confirm & forward after the call: forwarded (10b); confirmed on the partner's result (CW-F2)",
};
