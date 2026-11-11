// What the case page needs from the backend. Engineering implements it; the screen never talks to
// the telecom partner directly. Server enforces every rule (gate, refusals); the app shows results.
import type { CallbackSlot, CallStatus, ConfirmKind, ConfirmOutcome, SkipHaReason, UnavailableReason } from './types';

export type ConfirmResponse =
  | { kind: 'confirmed' } // 10a
  | { kind: 'forwarded' } // 10b
  | { kind: 'submitted' } // 7f: saved, waiting for the call record (D-68)
  | { kind: 'failed' }
  | { kind: 'unclear' }; // no answer from the server → check before any retry (D-69)

export interface CaseCallingApi {
  /** Click-to-call: rings the doctor (leg 1), then the patient (leg 2). */
  startCall(caseId: string): Promise<{ callId: string }>;
  /** Polled every settings.pollingIntervalMs while a call may be live or a result is due. */
  pollCallStatus(caseId: string, callId: string): Promise<CallStatus>;
  /** 7c: ask for the call record after "Call ended" or the timeout. null = nothing found → 7d. */
  checkCallRecord(caseId: string, callId: string): Promise<CallStatus | null>;

  confirm(caseId: string, kind: ConfirmKind, notes: { symptoms: string; doctorNotes: string }): Promise<ConfirmResponse>;
  /** Reconcile an unclear confirm (never submit twice). */
  confirmStatus(caseId: string): Promise<ConfirmResponse>;
  /** 7f: has the record arrived? true = confirmed, false = not confirmed (hold + retry, backend), null = still waiting. */
  submittedRecordStatus(caseId: string): Promise<boolean | null>;

  /** B2 (Fallback B): after Confirm prescription on the live Pilot call — is a Health Advisor free? */
  checkHealthAdvisor(caseId: string): Promise<{ free: boolean }>;
  /** 13 → 14 / 15. */
  transferToHealthAdvisor(caseId: string): Promise<{ ok: boolean }>;

  skipHa(caseId: string, reason: SkipHaReason): Promise<void>;
  callbackSlots(caseId: string, day: 'today' | 'tomorrow'): Promise<CallbackSlot[]>;
  /** Refused unless leg 2 answered → 'notReached' (case-29). */
  scheduleCallback(caseId: string, day: 'today' | 'tomorrow', slotId: string): Promise<'ok' | 'failed' | 'notReached'>;
  markUnavailable(caseId: string, reason: UnavailableReason): Promise<void>;
  /** Refused once the call request is accepted, unless the result is 3 or 4 (D-80). */
  releaseCase(caseId: string): Promise<'ok' | 'refused' | 'failed'>;

  analytics(outcome: ConfirmOutcome): void;
}
