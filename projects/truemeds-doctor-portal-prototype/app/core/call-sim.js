// Call simulator (plan B9). Pure: choices in, a timed list of partner / backend events out. The mock server plays the events
// (B7). Every D-83 branch the simulator can reach is listed in CALL_CHOICES; the review panel sets them.
import { value } from "./settings.js";

export const CALL_CHOICES = {
  connected:      ["none", "under-gate", "just-under-gate", "at-gate", "over-gate"], // patient answered; talk length vs the gate (boundaries included)
  doctorFailure:  ["none", "3", "4"],                           // doctor-side failure (3 / 4)
  patientFailure: ["none", "busy", "no-answer", "switched-off", "network", "unknown", "invalid-number"],
  partner:        ["ozonetel", "knowlarity"],
  callEndedEvent: ["no-event", "event"],                        // Knowlarity call-ended event: open (Engineering), simulator switch
  hangupReported: ["reported", "not-reported"],
  whoEnded:       ["doctor", "patient", "unknown"],             // → 16 / 16b / 16c
  ha:             ["free", "none", "transfer-failed", "no-answer"], // B2 outcomes
  record:         ["over-gate", "under-gate", "never-answered", "never", "delayed"],
  callbackRefused: ["accepted", "refused"],
  releaseRefused:  ["accepted", "refused"],
};

export const DEFAULT_CHOICES = Object.fromEntries(Object.entries(CALL_CHOICES).map(([k, o]) => [k, o[0]]));

// Returns [{ at (ms from call start), ev, data }]. Times come from settings (demo scales them). Deterministic.
export function timeline(choices, mode = "review") {
  const c = { ...DEFAULT_CHOICES, ...choices };
  const gate = value("gate", mode), pollingLag = value("pollingInterval", mode);
  const out = [];
  const push = (at, ev, data = {}) => out.push({ at, ev, data });
  if (c.doctorFailure !== "none") { push(0, "doctor-failed", { code: c.doctorFailure }); return out; }
  if (c.patientFailure !== "none") {
    push(0, "patient-failed", { cause: c.patientFailure, retry: ["busy", "no-answer", "switched-off", "network"].includes(c.patientFailure) ? "by-cause" : c.patientFailure === "invalid-number" ? "not-retried-flagged" : "plain-hold" });
    return out;
  }
  if (c.connected === "none") { push(0, "no-answer-doctor-leg"); return out; }
  const talk = { "over-gate": Math.round(gate * 1.2), "at-gate": gate, "just-under-gate": gate - 1000, "under-gate": Math.round(gate * 0.5) }[c.connected];
  push(0, "leg2-answered", { partner: c.partner, callId: c.callId });
  push(talk, "hangup-reported-by-partner-" + (c.hangupReported === "reported" ? "yes" : "no"), { ended: c.whoEnded });
  if (c.callEndedEvent === "event" && c.hangupReported === "reported") push(talk + pollingLag, "call-ended-event", {});
  push(talk + pollingLag * 2, "talk-time", { seconds: Math.round(talk / 1000), counted: talk >= value("minCountedCall", mode) });
  if (c.record !== "never" && c.record !== "never-answered") {
    const delay = c.record === "delayed" ? value("callRecordWait", mode) / 2 : pollingLag * 4;
    push(talk + delay, "call-record", { kind: c.record });
  }
  if (c.record === "never-answered") push(0, "patient-never-answered-record", {});
  push(talk + pollingLag * 3, "ha-result", { ha: c.ha, callbackRefused: c.callbackRefused === "refused", releaseRefused: c.releaseRefused === "refused" });
  return out.sort((a, b) => a.at - b.at);
}
