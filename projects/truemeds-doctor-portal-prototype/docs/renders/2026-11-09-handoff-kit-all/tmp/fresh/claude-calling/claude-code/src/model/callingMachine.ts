// The case page's calling state machine (DECIDED case-31 … case-58, Launch = Fallback B case-64).
// Pure: no timers, no network. The controller (useCaseCalling) feeds it events.
//
// State ids in comments are the kit's picture ids (screens/case.json states[].id).
import type { CallStatus } from './types';

export type Phase =
  | 'ready' // 1 · t01-ready
  | 'calling' // 2 / 7a · t02-calling, s7a-calling, g0-calling-pilot
  | 'notThrough' // 3 · t03-not-through
  | 'doctorMissed' // 4 · t04-doctor-missed
  | 'resultWait' // 5 and 7c (same screen, D-91) · t05-result-wait
  | 'endedEarly' // 6 · t06-ended-early
  | 'stillOnCall' // 7b · s7b-still-on-call
  | 'resultMissing' // 7d · s7d-result-missing, s7d-result-missing-pilot
  | 'valid' // 8a · t08a-valid-cat4 (also after Skip HA on a call with a result)
  | 'liveConfirm' // B1 · g1-generic-confirm
  | 'checkingHa' // B2 · g2-checking-ha
  | 'transferring' // 13 · t13-connecting-ha
  | 'forwardedLive' // 15 / B3 while live · t15-ha-no-join, g3b-forwarded
  | 'skipHaWait' // 17 · t17-skip-ha-wait
  | 'transferMissed' // 16 · t16-transfer-missed (+ b patient, c unknown)
  | 'closed';

export type ClosedKind =
  | 'confirmed' // 10a · t10a-confirmed
  | 'forwarded' // 10b · t10b-forwarded
  | 'transferred' // 14 · t14-transferred
  | 'forwardedAfterHangup' // 15 / B3 after the hang-up · t15-after-hangup, g3b-after-hangup
  | 'patientUnavailable' // 9 · t09-patient-unavailable (automatic or by the doctor's reason)
  | 'callbackScheduled' // e-callback-scheduled
  | 'submitted'; // 7f · s7f-submitted

export type SheetKind = 'leave' | 'callback' | 'skipHa' | 'unavailable';
export type ActionNotice =
  | { kind: 'confirmFailed' }
  | { kind: 'confirmBlocked'; n: number }
  | { kind: 'offlineAction' }
  | { kind: 'releaseFailed' };

export interface CallbackDraft {
  day?: 'today' | 'tomorrow';
  slotId?: string;
  error?: 'pickBoth' | 'pickDate' | 'pickTime';
  notice?: 'failed' | 'notReached';
  saving: boolean;
}

export interface CallingState {
  phase: Phase;
  closed?: ClosedKind;
  scheduledFor?: { day: 'today' | 'tomorrow'; time: string };
  /** 7f: which ending the record will turn into (10a Cat4 / 10b Pilot, D-89). */
  submittedAs?: 'confirmed' | 'forwarded';
  /** Backend field from the case: an HA call follows (not skipped by customer / system). */
  haCallFollows: boolean;
  /** The doctor chose Skip HA on this case. */
  haSkippedByDoctor: boolean;
  callId?: string;
  /** "Attempted call" = leg 2 answered (case-21). Once true, header Back never returns (case-11). */
  patientAnsweredEver: boolean;
  patientAnsweredAt?: number;
  hangup?: { endedBy: 'doctor' | 'patient' | 'unknown' };
  /** 7c: asking the backend for the call record (screen = 5). */
  checkingRecord: boolean;
  confirmBusy: boolean;
  actionNotice: ActionNotice | null;
  sheet: SheetKind | null;
  releasing: boolean;
  toast: 'backBlocked' | null;
  availabilityEnded: boolean;
  callback: CallbackDraft;
}

export type CallingEvent =
  | { type: 'CALL_TAPPED' }
  | { type: 'CALL_STARTED'; callId: string }
  | { type: 'STATUS'; status: CallStatus; now: number }
  | { type: 'LIVE_GATE_REACHED' }
  | { type: 'NO_RESULT_TIMEOUT' }
  | { type: 'STILL_TALKING' }
  | { type: 'CALL_ENDED_TAPPED' }
  | { type: 'RECORD_CHECKED'; status: CallStatus | null; now: number }
  | { type: 'CONFIRM_BLOCKED'; n: number }
  | { type: 'CONFIRM_STARTED'; live: boolean }
  | { type: 'CONFIRM_DONE'; result: 'confirmed' | 'forwarded' | 'submitted'; submittedAs?: 'confirmed' | 'forwarded' }
  | { type: 'CONFIRM_FAILED' }
  | { type: 'HA_CHECKED'; free: boolean }
  | { type: 'TRANSFER_DONE'; ok: boolean }
  | { type: 'RECORD_ARRIVED'; confirmed: boolean }
  | { type: 'OPEN_SHEET'; sheet: SheetKind }
  | { type: 'CLOSE_SHEET' }
  | { type: 'SKIP_HA_APPLIED' }
  | { type: 'CALLBACK_DAY'; day: 'today' | 'tomorrow' }
  | { type: 'CALLBACK_SLOT'; slotId: string }
  | { type: 'CALLBACK_INVALID'; error: 'pickBoth' | 'pickDate' | 'pickTime' }
  | { type: 'CALLBACK_SAVING' }
  | { type: 'CALLBACK_FAILED'; reason: 'failed' | 'notReached' }
  | { type: 'CALLBACK_DONE'; day: 'today' | 'tomorrow'; time: string }
  | { type: 'UNAVAILABLE_DONE' }
  | { type: 'RELEASE_STARTED' }
  | { type: 'RELEASE_FAILED' }
  | { type: 'OFFLINE_ACTION' }
  | { type: 'BACK_BLOCKED' }
  | { type: 'TOAST_DONE' }
  | { type: 'AVAILABILITY_ENDED' };

export function initialCallingState(haCallFollows: boolean): CallingState {
  return {
    phase: 'ready',
    haCallFollows,
    haSkippedByDoctor: false,
    patientAnsweredEver: false,
    checkingRecord: false,
    confirmBusy: false,
    actionNotice: null,
    sheet: null,
    releasing: false,
    toast: null,
    availabilityEnded: false,
    callback: { saving: false },
  };
}

/** An HA call still follows this doctor call (backend field, minus the doctor's own Skip HA). */
export const haFollows = (s: CallingState) => s.haCallFollows && !s.haSkippedByDoctor;

/** Phases in which the app polls the backend for call status (D-58 pt 19). */
export const LIVE_PHASES: Phase[] = ['calling', 'stillOnCall', 'resultWait', 'liveConfirm', 'skipHaWait', 'forwardedLive', 'resultMissing'];

const close = (s: CallingState, closed: ClosedKind, extra: Partial<CallingState> = {}): CallingState => ({
  ...s,
  phase: 'closed',
  closed,
  confirmBusy: false,
  actionNotice: null,
  sheet: null,
  checkingRecord: false,
  ...extra,
});

function applyStatus(s: CallingState, st: CallStatus, now: number): CallingState {
  if (s.phase === 'closed') return s;
  let next = { ...s };

  // Patient-side failure, whenever detected → closes as Patient unavailable, on hold (case-25).
  if (st.patientLegFailed) return close(next, 'patientUnavailable');

  if (st.patientAnswered && !next.patientAnsweredEver) {
    next.patientAnsweredEver = true;
    next.patientAnsweredAt = now;
  }

  // Doctor-side failures stay on 3 / 4, only while the patient was never reached on this call.
  if (next.phase === 'calling' && !st.patientAnswered) {
    if (st.notThrough) return { ...next, phase: 'notThrough' };
    if (st.doctorMissed) return { ...next, phase: 'doctorMissed' };
  }

  if (st.hangup && !next.hangup) {
    next.hangup = st.hangup;
    if (next.phase === 'forwardedLive') return close(next, 'forwardedAfterHangup'); // 15 / B3 after the hang-up
    // Pilot: the partner reported the hang-up, result not in yet → 5 (Cat4 never reaches 5, case-36).
    if ((next.phase === 'calling' || next.phase === 'liveConfirm' || next.phase === 'stillOnCall') && haFollows(next)) {
      next.phase = 'resultWait';
    }
  }

  const resultPhases: Phase[] = ['calling', 'stillOnCall', 'resultWait', 'liveConfirm', 'skipHaWait', 'resultMissing'];
  if (st.result && resultPhases.includes(next.phase)) {
    next.checkingRecord = false;
    if (st.result.verdict === 'tooShort') return { ...next, phase: 'endedEarly' }; // 6
    // Valid: an HA call still to follow and the call has ended before Confirm → 16; otherwise 8a.
    return { ...next, phase: haFollows(next) ? 'transferMissed' : 'valid' };
  }
  return next;
}

export function callingReducer(s: CallingState, e: CallingEvent): CallingState {
  switch (e.type) {
    case 'CALL_TAPPED':
      return {
        ...s,
        phase: 'calling',
        callId: undefined,
        hangup: undefined,
        checkingRecord: false,
        actionNotice: null,
        callback: { saving: false },
      };
    case 'CALL_STARTED':
      return { ...s, callId: e.callId };
    case 'STATUS':
      return applyStatus(s, e.status, e.now);
    case 'LIVE_GATE_REACHED':
      // B1: Pilot live call, our count since the patient answered reached the gate (case-22).
      return s.phase === 'calling' && haFollows(s) && !s.hangup ? { ...s, phase: 'liveConfirm' } : s;
    case 'NO_RESULT_TIMEOUT':
      if (s.phase === 'resultWait' && !s.checkingRecord) return { ...s, checkingRecord: true }; // 5 → 7c (same screen)
      if (s.phase !== 'calling') return s;
      // When the partner already reported the hang-up, go straight to 7c (shown as 5); else ask (7b).
      return s.hangup ? { ...s, phase: 'resultWait', checkingRecord: true } : { ...s, phase: 'stillOnCall' };
    case 'STILL_TALKING':
      return s.phase === 'stillOnCall' ? { ...s, phase: 'calling' } : s;
    case 'CALL_ENDED_TAPPED':
      return s.phase === 'stillOnCall' ? { ...s, phase: 'resultWait', checkingRecord: true } : s;
    case 'RECORD_CHECKED':
      if (!s.checkingRecord) return s;
      if (!e.status) return { ...s, phase: 'resultMissing', checkingRecord: false }; // 7d
      return applyStatus({ ...s, phase: s.phase }, e.status, e.now);
    case 'CONFIRM_BLOCKED':
      return { ...s, actionNotice: { kind: 'confirmBlocked', n: e.n } };
    case 'CONFIRM_STARTED':
      return e.live
        ? { ...s, phase: 'checkingHa', actionNotice: null } // B2
        : { ...s, confirmBusy: true, actionNotice: null };
    case 'CONFIRM_DONE':
      if (e.result === 'submitted') return close(s, 'submitted', { submittedAs: e.submittedAs });
      return close(s, e.result);
    case 'CONFIRM_FAILED':
      return {
        ...s,
        phase: s.phase === 'checkingHa' ? 'liveConfirm' : s.phase,
        confirmBusy: false,
        actionNotice: { kind: 'confirmFailed' },
      };
    case 'HA_CHECKED':
      return e.free ? { ...s, phase: 'transferring' } : { ...s, phase: 'forwardedLive' }; // 13 / B3
    case 'TRANSFER_DONE':
      return e.ok ? close(s, 'transferred') : { ...s, phase: 'forwardedLive' }; // 14 / 15
    case 'RECORD_ARRIVED':
      if (s.closed !== 'submitted' || !e.confirmed) return s; // not confirmed → backend hold + retry, no Ops (case-42)
      return close(s, s.submittedAs ?? 'confirmed');
    case 'OPEN_SHEET':
      return { ...s, sheet: e.sheet, callback: e.sheet === 'callback' ? { saving: false } : s.callback };
    case 'CLOSE_SHEET':
      return s.releasing || s.callback.saving ? s : { ...s, sheet: null };
    case 'SKIP_HA_APPLIED': {
      const next = { ...s, haSkippedByDoctor: true, sheet: null, actionNotice: null };
      if (s.phase === 'liveConfirm') return { ...next, phase: 'skipHaWait' }; // 17
      if (s.phase === 'transferMissed') return { ...next, phase: 'valid' }; // final button becomes Confirm prescription
      return next;
    }
    case 'CALLBACK_DAY':
      return { ...s, callback: { ...s.callback, day: e.day, error: undefined } };
    case 'CALLBACK_SLOT':
      return { ...s, callback: { ...s.callback, slotId: e.slotId, error: undefined } };
    case 'CALLBACK_INVALID':
      return { ...s, callback: { ...s.callback, error: e.error, notice: undefined } };
    case 'CALLBACK_SAVING':
      return { ...s, callback: { ...s.callback, saving: true, notice: undefined } };
    case 'CALLBACK_FAILED':
      return { ...s, callback: { ...s.callback, saving: false, notice: e.reason } }; // choices kept
    case 'CALLBACK_DONE':
      return close(s, 'callbackScheduled', { scheduledFor: { day: e.day, time: e.time }, callback: { saving: false } });
    case 'UNAVAILABLE_DONE':
      return close(s, 'patientUnavailable');
    case 'RELEASE_STARTED':
      return { ...s, releasing: true, actionNotice: null };
    case 'RELEASE_FAILED':
      // Sheet closes over Ready; doctor stays on the case; Back works again (case-108, D-81 F22).
      return { ...s, releasing: false, sheet: null, phase: 'ready', actionNotice: { kind: 'releaseFailed' } };
    case 'OFFLINE_ACTION':
      return { ...s, actionNotice: { kind: 'offlineAction' } };
    case 'BACK_BLOCKED':
      return { ...s, toast: 'backBlocked' };
    case 'TOAST_DONE':
      return { ...s, toast: null };
    case 'AVAILABILITY_ENDED':
      return { ...s, availabilityEnded: true };
    default:
      return s;
  }
}
