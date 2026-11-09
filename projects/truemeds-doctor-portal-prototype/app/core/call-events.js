// Reviewer event-log lines for the case page (plan §4: the event log names hold / retry / mismatch / confirm-completed events;
// D-50: the confirm outcomes are separate events). Review tooling, never shown to the doctor, so not registry copy.
export const EV = {
  released: () => "case released (back to the queue)",
  callRequested: (n, route) => `call ${n} requested (${route})`,
  callEnded: () => "doctor: call ended → checking the call record (7c)",
  saved: () => "prescription saved, waiting for the call record (7f)",
  confirmFailed: () => "confirm failed: nothing lost",
  confirmed: (route, ha) => `confirm completed: ${route === "cat4" ? "Cat4" : "HA skipped (" + String(ha).replace("skipped-", "") + ")"} — prescription confirmed`,
  callbackRefused: () => "callback refused: the patient wasn't reached",
  callbackFailed: () => "callback save failed: choices kept",
  callbackScheduled: (day, time) => `callback scheduled: ${day} ${time} (case goes to the callback pool)`,
};
