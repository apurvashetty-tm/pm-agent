// Call simulator (plan B9). Pure: choices in, a timed list of partner / backend events out. The mock server plays the events
// (B7). Every D-83 branch the simulator can reach is listed in CALL_CHOICES; the review panel sets them.
import { value } from "./settings.js";

export const CALL_CHOICES = {
  connected:      ["none", "under-gate", "just-under-gate", "at-gate", "over-gate"], // patient answered; talk length vs the gate (boundaries included)
  doctorFailure:  ["none", "3", "4"],                           // doctor-side failure (3 / 4)
  // patient-side failure by cause (CW-B1, CW-B2): retried by cause · unknown → plain hold · invalid number → not retried, flagged
  patientFailure: ["none", "busy", "no-answer", "switched-off", "network", "unknown", "invalid-number", "rejected", "unreachable"],
  partner:        ["ozonetel", "knowlarity"],
  callEndedEvent: ["no-event", "event"],                        // Knowlarity call-ended event: open (Engineering), simulator switch
  hangup:         ["reported", "not-reported"],                 // the partner reports the hang-up while the app polls, or not
  whoEnded:       ["doctor", "patient", "unknown"],             // → 16 / 16b / 16c
  ha:             ["free", "none", "request-failed", "no-answer"], // B2 outcomes
  // the partner's call result / call record: over or under the gate, the patient never answered, never arrives, late
  record:         ["over-gate", "under-gate", "no-answer", "never", "delayed"],
  callback:       ["accepted", "refused", "failed"],            // refused: leg 2 never answered (CW-A1, K3) · failed: save failure
  releaseRefused: ["accepted", "refused"],
  recordDelay:    ["prompt", "late"],                           // late: the record arrives after half the call-record wait
  // per-call talk length in seconds (B9 "length"); "auto" = the length the "Patient answers" choice implies
  length:         ["auto", ...Array.from({ length: 120 }, (_, i) => String(i + 1)), "150", "180", "240", "300", "600"],
};
const RETRIED = ["busy", "no-answer", "switched-off", "network", "rejected", "unreachable"];
export const holdPolicy = (cause) => (RETRIED.includes(cause) ? "by-cause" : cause === "invalid-number" ? "not-retried-flagged" : "plain-hold");

// Default attempt = the happy path (D-97 item 4): the patient answers and the call passes the gate (record over the gate), so the
// default story plays through to Prescription confirmed. The hang-up is not reported by default (the app learns the end from the
// result), so a missing result asks "Are you still on the call?" (CW-D1). Every other value: the first in its list.
export const DEFAULT_CHOICES = { ...Object.fromEntries(Object.entries(CALL_CHOICES).map(([k, o]) => [k, o[0]])), connected: "over-gate", hangup: "not-reported" };

// Talk length of one attempt in ms: the length control in seconds, else the "Patient answers" choice around the gate.
export function talkLength(c, gate) {
  if (c.length && c.length !== "auto") return Number(c.length) * 1000;
  return { "over-gate": gate + 1000, "at-gate": gate, "just-under-gate": gate - 1000, "under-gate": Math.round(gate / 2) }[c.connected] ?? 0;
}

// Returns [{ at (ms from call start), ev, data }]. Times come from settings (demo scales them). Deterministic.
export function timeline(choices, mode = "review") {
  const c = { ...DEFAULT_CHOICES, ...choices };
  const gate = value("gate", mode), pollingLag = value("pollingInterval", mode);
  const out = [];
  const push = (at, ev, data = {}) => out.push({ at, ev, data });
  if (c.doctorFailure !== "none") { push(0, "doctor-failed", { code: c.doctorFailure }); return out; }
  if (c.patientFailure !== "none") {
    push(0, "patient-failed", { cause: c.patientFailure, retry: holdPolicy(c.patientFailure) });
    return out;
  }
  if (c.connected === "none") { push(0, "no-answer-doctor-leg"); return out; }
  const talk = talkLength(c, gate);
  push(0, "leg2-answered", { partner: c.partner, callId: c.callId });
  push(talk, "hangup-reported-by-partner-" + (c.hangup === "reported" ? "yes" : "no"), { ended: c.whoEnded });
  if (c.callEndedEvent === "event" && c.hangup === "reported") push(talk + pollingLag, "call-ended-event", {});
  push(talk + pollingLag * 2, "talk-time", { seconds: Math.round(talk / 1000), counted: talk >= value("minCountedCall", mode) });
  if (c.record !== "never" && c.record !== "no-answer") {
    const delay = c.record === "delayed" || c.recordDelay === "late" ? value("callRecordWait", mode) / 2 : pollingLag * 4;
    push(talk + delay, "call-record", { kind: c.record });
  }
  if (c.record === "no-answer") push(0, "patient-never-answered-record", {});
  push(talk + pollingLag * 3, "ha-result", { ha: c.ha, callbackRefused: c.callback === "refused", releaseRefused: c.releaseRefused === "refused" });
  return out.sort((a, b) => a.at - b.at);
}
