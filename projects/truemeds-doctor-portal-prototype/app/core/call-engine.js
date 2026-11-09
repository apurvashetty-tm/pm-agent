// Calling engine (plan v3.2 steps 5–6, B8–B10): the doctor's call stages for Cat4, Pilot HA skipped and Pilot Fallback B
// (app-logic §5 state table and "Fallback B", §6 final buttons and HA, §7 callback / unavailable). Pure: the case object, the
// app-clock time, settings and the simulator's choices come in; the stage goes out. Every time is worked out from time stamps
// (B8: tap time, the patient's answer, talk length, polling lag), never counted, so a reload or a fast-forward lands in the same place.
//
// Stages on c.stage: ready (1) · calling (2 / 7a; B0 on the Pilot route) · not-through (3) · doctor-missed (4) · result-wait (5, and
// 7c with a check time) · ended-early (6) · still-on-call (7b) · result-missing (7d) · valid (8a) · Fallback B: live (B1) ·
// checking-ha (B2) · transferring (13) · forwarded-live (B3 / 15, call still live) · transfer-missed (16) · skip-ha-wait (17) ·
// closed, with c.outcome = confirmed (10a) · submitted (7f) · unavailable (9) · callback (scheduled) · transferred (14) ·
// forwarded (10b) · forwarded-ended (B3 / 15 after the hang-up).
import { talkLength, holdPolicy, ringTime } from "./call-sim.js";

// Stages the partner's events can still change (a late result updates any of them).
const LIVE = ["calling", "result-wait", "still-on-call", "result-missing", "live", "forwarded-live", "skip-ha-wait"];
const MS_PER_MIN = 60 * 1000;   // unit conversion for the event log, not a setting

// Route (app-logic §6): Cat4 · Pilot with the HA skipped (customer, system, or the doctor's Skip HA) ends like Cat4 · Pilot with an
// HA call (Fallback B, the one launch Pilot flow: D-83 CW-F1, D-87).
export function route(c) {
  if (c.caseType !== "pilot") return "cat4";
  return String(c.ha || "").startsWith("skipped") ? "ha-skipped" : "pilot";
}
// Script while a call may be live (app-logic §4 End-of-call script): Pilot live call → neutral; B3 / 15 → forwardedTell (the
// patient is never told about HA capacity); everything else (Cat4, HA skipped, 17) → Cat4.
export const scriptKey = (c) => (c.stage === "forwarded-live" ? "call.forwardedTell" : route(c) === "pilot" ? "call.scriptNeutral" : "call.scriptCat4");
// B2's answer (simulator "HA"): free · none · request-failed · no-answer. The pilot_no_ha_free scenario means no HA is free, so
// there "free" reads as none [MOCK ASSUMPTION, review tool: the scenario names the capacity, the simulator the other answers].
export const haOutcome = (c, ch) => (c.scenario === "pilot_no_ha_free" && ch.ha === "free" ? "none" : ch.ha);

const secs = (ms) => Math.round(ms / 1000);
// What the partner will report for one attempt, from the simulator's choices (B9). a.pilot: the call was placed on the Pilot
// route, so a default "over the gate" call stays live past the gate (the doctor confirms while live).
function facts(a, ch, v) {
  const L = talkLength(ch, v("gate"), a.pilot ? v("pilotTalkAfterGate") : 1000);
  const lag = v("pollingInterval");   // the app sees a partner event at its next poll
  const answeredAt = a.at + ringTime(ch);   // leg 2 answered: the talk time counts from here, never from the tap (D-58)
  const endsAt = answeredAt + L;
  const late = ch.record === "delayed" || ch.recordDelay === "late";
  const resultAt = ch.record === "never" ? null : endsAt + (late ? v("callRecordWait") / 2 : lag);
  const known = ch.hangup === "reported" || (ch.partner === "knowlarity" && ch.callEndedEvent === "event");
  return { L, lag, answeredAt, endsAt, resultAt, known };
}
// Talk time on the case (D-58 pt 22): connected calls of at least the counted minimum, within the talk-time window, add up.
export function totalTalk(c, now, v) {
  return (c.call ? c.call.attempts : []).filter((a) => a.done && a.counted && a.endsAt >= now - v("talkWindow")).reduce((s, a) => s + a.reported, 0);
}
const priorTalk = (c, a, now, v) => c.call.attempts.filter((x) => x !== a && x.done && x.counted && x.endsAt >= now - v("talkWindow")).reduce((s, x) => s + x.reported, 0);

// Doctor taps Call patient / Call again: a new attempt; the script shows; Back is hidden from the tap (D-81 F21).
export function startAttempt(c, now, v) {
  if (!c.call) c.call = { attempts: [] };
  c.call.attempts.push({ at: now, done: false, pilot: route(c) === "pilot" });
  c.call.askAt = now + v("noResultTimeout");
  c.call.checkAt = null;
  c.call.resume = null;
  c.stage = "calling";
}
// 7b → Still talking: back to the live stage it asked from (Calling, or 17); the question comes again after the repeat time (CW-D1).
// On the Pilot route Calling re-checks the live gate at once (B1 again when it has passed).
export function stillTalking(c, now, v) { c.stage = c.call.resume || "calling"; c.call.askAt = now + v("stillOnCallRepeat"); }
// 7b → Call ended (7c): the app asks the backend for the call record; found → result path, nothing → 7d (D-91: screen of 5).
export function callEnded(c, now, v) { c.stage = "result-wait"; c.call.checkAt = now + v("mockServerDelay"); }
// 7d → Confirm (Cat4: Confirm prescription; Pilot: Confirm & forward): saved, not confirmed until the call record proves the call
// (D-68, CW-D3, CW-D4): 7f. On the Pilot route a proven record ends as 10b (D-89, Q-A).
export function submitConfirm(c, now) { c.stage = "closed"; c.outcome = "submitted"; c.call.submit = { at: now, done: false }; }
// 16 → Confirm & forward: 10b; the forward is confirmed only on the partner's result (CW-F2), settled in the background.
export function submitForward(c, now) { c.stage = "closed"; c.outcome = "forwarded"; c.call.submit = { at: now, done: false }; }
// B1 → Confirm prescription: B2 checks for a Health Advisor (Fallback B, app-logic §6).
export function confirmLive(c, now) { c.stage = "checking-ha"; c.call.haAt = now; }
// Skip HA + reason (D-59, D-70): applied at once. On the live call (B1) → 17, the case waits for the call result (CW-E2); after a
// missed transfer (16) → Confirm prescription (8a). The case is HA-skipped from now on (a retry stays HA-skipped, no HA controls).
export function skipHa(c, reason) {
  c.ha = "skipped-doctor"; c.haSkipReason = reason;
  if (c.stage === "live") { c.stage = "skip-ha-wait"; c.call.resume = "skip-ha-wait"; }
  else if (c.stage === "transfer-missed") c.stage = "valid";
}

// Patient side failed (leg 2), whenever detected: the case closes as Patient unavailable by itself and goes on hold (CW-B1, CW-B2).
export function closeUnavailable(c, cause, { event, v, by = "auto", hold }) {
  c.stage = "closed"; c.outcome = "unavailable"; c.unavailable = { by, cause };
  c.notes = { symptoms: "", doctor: "" };   // consultation notes are saved only on confirm (D-59)
  if (by === "doctor") { event(`patient unavailable, reason saved with the case: ${cause}`); return; }   // D-73, D-75
  const p = holdPolicy(cause);
  const gapMin = Math.round(v("holdRetryGap") / MS_PER_MIN);
  event(`patient unavailable (${cause}): case on hold — ` + (p === "by-cause" ? `retry by cause, every ${gapMin} min, up to ${v("holdRetryAttempts")} times`
    : p === "not-retried-flagged" ? "invalid number: not retried, flagged" : "plain hold, no retry by cause"));
  if (hold) hold(c, cause, p);   // the backend runs the retries (B9: gap and attempts from settings)
}

// One poll of the backend (B7) for the open case. ctx: { now, v, choices(i), event, onProven(c), onTransferred(c), hold }.
// Returns true when the screen changes.
export function stepCall(c, ctx) {
  const { now, v, choices, event } = ctx;
  const call = c.call;
  if (!call || !call.attempts.length) return false;
  if (c.stage === "closed") return call.submit && !call.submit.done ? settleSubmitted(c, ctx) : false;
  const i = call.attempts.length - 1, a = call.attempts[i];
  const ch = choices(i);
  if (c.stage === "checking-ha" || c.stage === "transferring") {
    // A transfer hands the patient over on the same call (D-57): if the call ends (hang-up reported, or the result arrives)
    // before B2 / 13 finish, nothing was transferred → 16, ended before the transfer (app-logic §5 state 16, CW-F3).
    const f = facts(a, ch, v);
    const endAt = Math.min(f.known ? f.endsAt + f.lag : Infinity, f.resultAt ?? Infinity);
    const dueAt = call.haAt + (c.stage === "checking-ha" ? 1 : 2) * v("mockServerDelay");
    if (now >= endAt && endAt < dueAt) {
      a.done = true; a.endsAt = f.endsAt;
      if (f.resultAt !== null && now >= f.resultAt) noteResult(a, ch, f, v);
      const during = c.stage === "checking-ha" ? "check" : "transfer";
      c.stage = "transfer-missed"; call.endedBy = ch.whoEnded;
      event(`call ended during the Health Advisor ${during} (ended by ${ch.whoEnded}) → ended before the transfer (16)`);
      return true;
    }
    return stepHa(c, a, ch, ctx);
  }
  if (!LIVE.includes(c.stage) || a.done) return false;
  const f = facts(a, ch, v);
  if (now < a.at + f.lag) return false;   // nothing reported yet
  if (c.stage === "calling" && !a.polled) {
    if (ch.doctorFailure !== "none") {   // doctor side (3 / 4): stays on the case; Back again only if the patient was never reached
      a.polled = true; a.done = true; c.stage = ch.doctorFailure === "3" ? "not-through" : "doctor-missed";
      event(ch.doctorFailure === "3" ? "call request refused / leg 1 error → didn't go through" : "leg 1 not answered → you didn't answer"); return true;
    }
    const cause = ch.patientFailure !== "none" ? ch.patientFailure : ch.connected === "none" ? "no-answer" : null;
    if (cause) { a.polled = true; a.done = true; closeUnavailable(c, cause, ctx); return true; }
    if (now < f.answeredAt + f.lag) return false;   // still ringing: the patient hasn't answered yet
    a.polled = true;
    if (!c.attempted) event("leg 2 answered: attempted call");
    c.attempted = true;   // leg 2 answered (D-58): leaving is blocked until the case is closed
  }
  // Launch B, Pilot live call (app-logic §5): our app counts from the patient's answer while the call is live (talk time on the
  // case adds up, D-58 pt 22); at the gate Confirm prescription appears on the live call (B1). The partner's duration is for
  // reporting only. Checked before the result, so a jump in time passes B1 first when the gate came while the call was live.
  if (c.stage === "calling" && route(c) === "pilot") {
    const gateAt = f.answeredAt + Math.max(0, v("gate") - priorTalk(c, a, now, v));
    if (now >= gateAt && gateAt <= f.endsAt) { c.stage = "live"; event(`live gate: ${secs(v("gate"))} s since the patient answered, call live → Confirm prescription (B1)`); return true; }
  }
  const resultIn = f.resultAt !== null && now >= f.resultAt;
  // B1 / B3 / 15: the call ends (hang-up reported, or the result arrives) → 16 (no Confirm yet) or B3 / 15 after the hang-up.
  if (c.stage === "live" || c.stage === "forwarded-live") {
    if ((f.known && now >= f.endsAt + f.lag) || resultIn) {
      a.done = true; a.endsAt = f.endsAt;
      if (resultIn) noteResult(a, ch, f, v);
      if (c.stage === "live") {
        c.stage = "transfer-missed"; call.endedBy = ch.whoEnded;
        event(`call ended after the gate, before Confirm (ended by ${ch.whoEnded}) → ended before the transfer (16)`);
      } else {
        c.stage = "closed"; c.outcome = "forwarded-ended"; call.submit = { at: now, done: false };   // CW-F2: confirmed only on the partner's result
        event("hang-up → forwarded, call ended (Request next case); the forward is confirmed on the partner's result");
      }
      return true;
    }
    if (c.stage === "live" && timedOut(call, a, f, now)) return askOrCheck(c, f, ctx, "calling");
    return false;   // B3 / 15 wait for the hang-up only (CW-E3)
  }
  if (resultIn) { applyResult(c, a, ch, f, ctx); return true; }   // a late result updates any stage
  if (c.stage === "calling" || c.stage === "skip-ha-wait") {
    // 5: Pilot only (CW-C2); also 17 (HA skipped on the live call): once the hang-up is known the script goes (D-58 pt 24)
    if (f.known && now >= f.endsAt + f.lag && route(c) !== "cat4") { c.stage = "result-wait"; event("hang-up reported → getting call result"); return true; }
    if (timedOut(call, a, f, now)) return askOrCheck(c, f, ctx, c.stage === "skip-ha-wait" ? "skip-ha-wait" : "calling");
    return false;
  }
  if (c.stage === "result-wait") {
    if (!call.checkAt && now >= call.askAt) { call.checkAt = now + v("mockServerDelay"); return true; }
    if (call.checkAt && now >= call.checkAt) { c.stage = "result-missing"; event("call record check: nothing found (7d)"); return true; }
  }
  return false;
}
// The app learns "still no result" at its next poll after the timeout (polls every pollingInterval from the tap, B7).
const timedOut = (call, a, f, now) => now >= a.at + Math.ceil((call.askAt - a.at) / f.lag) * f.lag;
function askOrCheck(c, f, { now, v, event }, resume) {
  c.call.resume = resume;
  if (f.known && now >= f.endsAt) { callEnded(c, now, v); event("no result after the timeout, hang-up known → checking the call record (7c)"); }   // CW-D1
  else { c.stage = "still-on-call"; event("no result after the timeout → asking: still on the call?"); }
  return true;
}

// B2 and 13 (Fallback B): the backend checks for a Health Advisor, then rings them. free / HA doesn't pick up → 14 for the doctor
// (CW-E1); none → B3; the transfer couldn't start → 15. Times: B2 is one simulated server answer (the HA check); 13 is two
// (the transfer request, then the HA's answer).
function stepHa(c, a, ch, ctx) {
  const { now, v, event } = ctx;
  const call = c.call, ha = haOutcome(c, ch);
  if (c.stage === "checking-ha" && now >= call.haAt + v("mockServerDelay")) {
    call.haAt += v("mockServerDelay");
    if (ha === "none") { c.stage = "forwarded-live"; event("no Health Advisor free → forwarded (B3), waiting for the call to end"); }
    else { c.stage = "transferring"; event("Health Advisor check: transfer requested → transferring (13)"); }
    return true;
  }
  if (c.stage === "transferring" && now >= call.haAt + 2 * v("mockServerDelay")) {
    if (ha === "request-failed") { c.stage = "forwarded-live"; event("transfer couldn't start → forwarded (15), waiting for the call to end"); return true; }
    c.stage = "closed"; c.outcome = "transferred"; a.done = true;
    event(ha === "no-answer" ? "Health Advisor rang, didn't pick up → transferred for the doctor (14, CW-E1)" : "Health Advisor joined → transferred (14)");
    ctx.onTransferred(c);
    return true;
  }
  return false;
}

function noteResult(a, ch, f, v) {
  a.reported = ch.record === "under-gate" ? Math.min(f.L, v("gate") - 1000) : ch.record === "no-answer" ? 0 : f.L;
  a.counted = a.reported >= v("minCountedCall");
}
// The partner's result for the attempt: talk time vs the gate, added up across counted calls (D-58 pt 22). The doctor never sees
// the count. On the Pilot route a valid call that ended before Confirm is 16 (CW-F3: Confirm & forward · Skip HA).
function applyResult(c, a, ch, f, ctx) {
  const { now, v, event } = ctx;
  a.done = true; a.endsAt = f.endsAt;
  if (ch.record === "no-answer") { closeUnavailable(c, "no-answer", ctx); return; }   // the record says leg 2 never answered
  noteResult(a, ch, f, v);
  const total = totalTalk(c, now, v);
  const valid = total >= v("gate");
  const pilot = route(c) === "pilot";
  c.stage = valid ? (pilot ? "transfer-missed" : "valid") : "ended-early";
  if (valid && pilot) c.call.endedBy = ch.whoEnded;
  event(`call result: ${secs(a.reported)} s talk${a.counted ? "" : " (not counted)"}, ${secs(total)} s on the case → ${valid ? (pilot ? "ended before the transfer (16)" : "valid call (8a)") : "too short (6)"}`);
}

// 7f and forwards: the record arrives over the gate → confirmed (7f: 10a, or 10b on the Pilot route); under the gate, never
// answered, or none after the wait → not confirmed: hold and retry, mismatch logged; no Ops queue, no earnings (CW-D3, CW-D4, CW-F2).
function settleSubmitted(c, ctx) {
  const { now, v, choices, event } = ctx;
  const s = c.call.submit;
  if (!s || s.done) return false;
  const i = c.call.attempts.length - 1, a = c.call.attempts[i];
  const r = recordOutcome(a, choices(i), c, now, v, s.at);
  if (!r) return false;
  s.done = true;
  if (r === "proven") {
    if (c.outcome === "submitted") c.outcome = route(c) === "pilot" ? "forwarded" : "confirmed";
    ctx.onProven(c); return true;
  }
  event(`call record ${r}: ${c.outcome === "submitted" ? "prescription" : "forward"} not confirmed (mismatch) → case on hold, retry`);
  if (ctx.hold) ctx.hold(c, "unproven confirm", "by-cause");
  return true;
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
