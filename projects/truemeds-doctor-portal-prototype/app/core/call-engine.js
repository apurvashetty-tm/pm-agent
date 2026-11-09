// Calling engine (plan v3.2 step 5, B8–B10): the doctor's call stages for Cat4 and Pilot HA skipped (app-logic §5 state table,
// §7 callback / unavailable). Pure: the case object, the app-clock time, settings and the simulator's choices come in; the
// stage goes out. Every time is worked out from time stamps (B8: tap time, talk length, polling lag), never counted, so a
// reload or a fast-forward lands in the same place. Run B adds the Pilot (Fallback B) live-gate stages on the same model.
//
// Stages on c.stage: ready (1) · calling (2 / 7a) · not-through (3) · doctor-missed (4) · result-wait (5, and 7c with a check
// time) · ended-early (6) · still-on-call (7b) · result-missing (7d) · valid (8a) · closed, with c.outcome = confirmed (10a) ·
// submitted (7f) · unavailable (9) · callback (scheduled).
import { talkLength, holdPolicy } from "./call-sim.js";

const LIVE = ["calling", "result-wait", "still-on-call", "result-missing"];
const MS_PER_MIN = 60 * 1000;   // unit conversion for the event log, not a setting

// Route (app-logic §6): Cat4 · Pilot with the HA skipped (customer or system) ends like Cat4 · Pilot with an HA call (run B).
export function route(c) {
  if (c.caseType !== "pilot") return "cat4";
  return String(c.ha || "").startsWith("skipped") ? "ha-skipped" : "pilot";
}
// Script while a call may be live (app-logic §4 End-of-call script): Pilot live call → neutral; everything else → Cat4.
export const scriptKey = (c) => (route(c) === "pilot" ? "call.scriptNeutral" : "call.scriptCat4");

const secs = (ms) => Math.round(ms / 1000);
// What the partner will report for one attempt, from the simulator's choices (B9).
function facts(a, ch, v) {
  const L = talkLength(ch, v("gate"));
  const lag = v("pollingInterval");   // the app sees a partner event at its next poll
  const endsAt = a.at + L;
  const late = ch.record === "delayed" || ch.recordDelay === "late";
  const resultAt = ch.record === "never" ? null : endsAt + (late ? v("callRecordWait") / 2 : lag);
  const known = ch.hangup === "reported" || (ch.partner === "knowlarity" && ch.callEndedEvent === "event");
  return { L, lag, endsAt, resultAt, known };
}
// Talk time on the case (D-58 pt 22): connected calls of at least the counted minimum, within the talk-time window, add up.
export function totalTalk(c, now, v) {
  return (c.call ? c.call.attempts : []).filter((a) => a.done && a.counted && a.endsAt >= now - v("talkWindow")).reduce((s, a) => s + a.reported, 0);
}

// Doctor taps Call patient / Call again: a new attempt; the script shows; Back is hidden from the tap (D-81 F21).
export function startAttempt(c, now, v) {
  if (!c.call) c.call = { attempts: [] };
  c.call.attempts.push({ at: now, done: false });
  c.call.askAt = now + v("noResultTimeout");
  c.call.checkAt = null;
  c.stage = "calling";
}
// 7b → Still talking: back to Calling; the question comes again after the repeat time (CW-D1).
export function stillTalking(c, now, v) { c.stage = "calling"; c.call.askAt = now + v("stillOnCallRepeat"); }
// 7b → Call ended (7c): the app asks the backend for the call record; found → result path, nothing → 7d (D-91: screen of 5).
export function callEnded(c, now, v) { c.stage = "result-wait"; c.call.checkAt = now + v("mockServerDelay"); }
// 7d → Confirm: saved, not confirmed until the call record proves the call (D-68, CW-D3, CW-D4): 7f.
export function submitConfirm(c, now) { c.stage = "closed"; c.outcome = "submitted"; c.call.submit = { at: now, done: false }; }

// Patient side failed (leg 2), whenever detected: the case closes as Patient unavailable by itself and goes on hold (CW-B1, CW-B2).
export function closeUnavailable(c, cause, { event, v, by = "auto" }) {
  c.stage = "closed"; c.outcome = "unavailable"; c.unavailable = { by, cause };
  c.notes = { symptoms: "", doctor: "" };   // consultation notes are saved only on confirm (D-59)
  if (by === "doctor") { event(`patient unavailable, reason saved with the case: ${cause}`); return; }   // D-73, D-75
  const p = holdPolicy(cause);
  const gapMin = Math.round(v("holdRetryGap") / MS_PER_MIN);
  event(`patient unavailable (${cause}): case on hold — ` + (p === "by-cause" ? `retry by cause, every ${gapMin} min, up to ${v("holdRetryAttempts")} times`
    : p === "not-retried-flagged" ? "invalid number: not retried, flagged" : "plain hold, no retry by cause"));
}

// One poll of the backend (B7) for the open case. ctx: { now, v, choices(i), event, onProven(c) }. Returns true when the screen changes.
export function stepCall(c, ctx) {
  const { now, v, choices, event } = ctx;
  const call = c.call;
  if (!call || !call.attempts.length) return false;
  if (c.stage === "closed" && c.outcome === "submitted") return settleSubmitted(c, ctx);
  const a = call.attempts[call.attempts.length - 1];
  if (!LIVE.includes(c.stage) || a.done) return false;
  const ch = choices(call.attempts.length - 1);
  const f = facts(a, ch, v);
  if (now < a.at + f.lag) return false;   // nothing reported yet
  if (c.stage === "calling" && !a.polled) {
    a.polled = true;
    if (ch.doctorFailure !== "none") {   // doctor side (3 / 4): stays on the case; Back again only if the patient was never reached
      a.done = true; c.stage = ch.doctorFailure === "3" ? "not-through" : "doctor-missed";
      event(ch.doctorFailure === "3" ? "call request refused / leg 1 error → didn't go through" : "leg 1 not answered → you didn't answer"); return true;
    }
    const cause = ch.patientFailure !== "none" ? ch.patientFailure : ch.connected === "none" ? "no-answer" : null;
    if (cause) { a.done = true; closeUnavailable(c, cause, ctx); return true; }
    if (!c.attempted) event("leg 2 answered: attempted call");
    c.attempted = true;   // leg 2 answered (D-58): leaving is blocked until the case is closed
  }
  if (f.resultAt !== null && now >= f.resultAt) { applyResult(c, a, ch, f, ctx); return true; }   // a late result updates any stage
  if (c.stage === "calling") {
    if (f.known && now >= f.endsAt + f.lag && route(c) !== "cat4") { c.stage = "result-wait"; event("hang-up reported → getting call result"); return true; }   // 5: Pilot only (CW-C2)
    // The app learns "still no result" at its next poll after the timeout (polls every pollingInterval from the tap, B7).
    if (now >= a.at + Math.ceil((call.askAt - a.at) / f.lag) * f.lag) {
      if (f.known && now >= f.endsAt) { callEnded(c, now, v); event("no result after the timeout, hang-up known → checking the call record (7c)"); }   // CW-D1
      else { c.stage = "still-on-call"; event("no result after the timeout → asking: still on the call?"); }
      return true;
    }
    return false;
  }
  if (c.stage === "result-wait") {
    if (!call.checkAt && now >= call.askAt) { call.checkAt = now + v("mockServerDelay"); return true; }
    if (call.checkAt && now >= call.checkAt) { c.stage = "result-missing"; event("call record check: nothing found (7d)"); return true; }
  }
  return false;
}

// The partner's result for the attempt: talk time vs the gate, added up across counted calls (D-58 pt 22). The doctor never sees the count.
function applyResult(c, a, ch, f, ctx) {
  const { now, v, event } = ctx;
  a.done = true; a.endsAt = f.endsAt;
  if (ch.record === "no-answer") { closeUnavailable(c, "no-answer", ctx); return; }   // the record says leg 2 never answered
  a.reported = ch.record === "under-gate" ? Math.min(f.L, v("gate") - 1000) : f.L;
  a.counted = a.reported >= v("minCountedCall");
  const total = totalTalk(c, now, v);
  const valid = total >= v("gate");
  c.stage = valid ? "valid" : "ended-early";
  event(`call result: ${secs(a.reported)} s talk${a.counted ? "" : " (not counted)"}, ${secs(total)} s on the case → ${valid ? "valid call (8a)" : "too short (6)"}`);
}

// 7f: the record arrives over the gate → confirmed; under the gate, never answered, or none after the wait → not confirmed: hold
// and retry, mismatch logged; no Ops queue, no earnings (CW-D3, CW-D4).
function settleSubmitted(c, ctx) {
  const { now, v, choices, event } = ctx;
  const s = c.call.submit;
  if (!s || s.done) return false;
  const i = c.call.attempts.length - 1, a = c.call.attempts[i];
  const r = recordOutcome(a, choices(i), c, now, v, s.at);
  if (!r) return false;
  s.done = true;
  if (r === "proven") { c.outcome = "confirmed"; ctx.onProven(c); return true; }
  event(`call record ${r}: prescription not confirmed (mismatch) → case on hold, retry`);
  return false;
}
// "proven" · "under the gate" · "says the patient never answered" · "missing after the wait" · null (still waiting).
export function recordOutcome(a, ch, c, now, v, submittedAt) {
  const f = facts(a, ch, v);
  if (f.resultAt !== null && now >= f.resultAt) {
    if (ch.record === "no-answer") return "says the patient never answered";
    const reported = ch.record === "under-gate" ? Math.min(f.L, v("gate") - 1000) : f.L;
    const before = (c.call.attempts || []).filter((x) => x !== a && x.done && x.counted && x.endsAt >= now - v("talkWindow")).reduce((s, x) => s + x.reported, 0);
    return before + (reported >= v("minCountedCall") ? reported : 0) >= v("gate") ? "proven" : "under the gate";
  }
  return now >= submittedAt + v("callRecordWait") ? "missing after the wait" : null;
}
