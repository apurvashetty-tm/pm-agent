// Controller: wires the pure state machine to the backend, timers and the phone's back gesture.
import { useCallback, useEffect, useReducer, useRef } from 'react';
import { BackHandler } from 'react-native';
import { CaseCallingApi, ConfirmResponse } from './api';
import { callingReducer, haFollows, initialCallingState, LIVE_PHASES } from './callingMachine';
import { ActionId, deriveCaseView } from './caseView';
import type { CallingSettings } from './settings';
import type { CaseData, ConfirmKind, ConfirmOutcome, SkipHaReason, UnavailableReason } from './types';

export interface CaseCallingDeps {
  caseData: CaseData;
  api: CaseCallingApi;
  settings: CallingSettings;
  /** From the app's connectivity source (e.g. NetInfo). */
  online: boolean;
  /** From Home's availability timer: the case is never interrupted, the ending offers only Back to Home. */
  availabilityEnded: boolean;
  notes: { symptoms: string; doctorNotes: string };
  /** Pending medicines are counted from the case (Flag 5, case-75). */
  onScrollToFirstPending: () => void;
  navigation: { goHome: () => void; requestNextCase: () => void };
}

export function useCaseCalling(d: CaseCallingDeps) {
  const [state, dispatch] = useReducer(callingReducer, d.caseData.haCallFollows, initialCallingState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const { api, settings, caseData } = d;
  const caseId = caseData.caseId;

  useEffect(() => {
    if (d.availabilityEnded) dispatch({ type: 'AVAILABILITY_ENDED' });
  }, [d.availabilityEnded]);

  // ── Polling the call status (D-58 pt 19) ─────────────────────────────────────────────
  useEffect(() => {
    if (!state.callId || !LIVE_PHASES.includes(state.phase)) return;
    const callId = state.callId;
    const id = setInterval(async () => {
      try {
        const status = await api.pollCallStatus(caseId, callId);
        dispatch({ type: 'STATUS', status, now: Date.now() });
      } catch {
        /* next poll retries; offline is shown from `online` */
      }
    }, settings.pollingIntervalMs);
    return () => clearInterval(id);
  }, [api, caseId, state.callId, state.phase, settings.pollingIntervalMs]);

  // ── B1: our own count from the moment the patient answered (case-22) ─────────────────
  useEffect(() => {
    if (state.phase !== 'calling' || !haFollows(state) || !state.patientAnsweredAt || state.hangup) return;
    const due = state.patientAnsweredAt + settings.gateSeconds * 1000 - Date.now();
    const t = setTimeout(() => dispatch({ type: 'LIVE_GATE_REACHED' }), Math.max(0, due));
    return () => clearTimeout(t);
  }, [state, settings.gateSeconds]);

  // ── 7b: no result after the timeout; repeats after "Still talking" ──────────────────
  const stillTalkingAt = useRef<number | null>(null);
  useEffect(() => {
    const waiting = state.phase === 'calling' || (state.phase === 'resultWait' && !state.checkingRecord);
    if (!waiting) return;
    const wait = stillTalkingAt.current ? settings.stillOnCallRepeatMs : settings.noResultTimeoutMs;
    const t = setTimeout(() => dispatch({ type: 'NO_RESULT_TIMEOUT' }), wait);
    return () => clearTimeout(t);
  }, [state.phase, state.callId, settings.noResultTimeoutMs, settings.stillOnCallRepeatMs]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 7c: ask for the call record ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!state.checkingRecord || !state.callId) return;
    let live = true;
    api
      .checkCallRecord(caseId, state.callId)
      .then((status) => live && dispatch({ type: 'RECORD_CHECKED', status, now: Date.now() }))
      .catch(() => live && dispatch({ type: 'RECORD_CHECKED', status: null, now: Date.now() }));
    return () => {
      live = false;
    };
  }, [api, caseId, state.checkingRecord, state.callId]);

  // ── 7f: a late record turns the card into 10a / 10b by itself ──────────────────────
  useEffect(() => {
    if (state.closed !== 'submitted') return;
    const id = setInterval(async () => {
      const r = await api.submittedRecordStatus(caseId).catch(() => null);
      if (r !== null) dispatch({ type: 'RECORD_ARRIVED', confirmed: r });
    }, settings.pollingIntervalMs);
    return () => clearInterval(id);
  }, [api, caseId, state.closed, settings.pollingIntervalMs]);

  // ── Actions ─────────────────────────────────────────────────────────────────────────
  const offlineGuard = useCallback(() => {
    if (d.online) return false;
    dispatch({ type: 'OFFLINE_ACTION' }); // one error notice, nothing lost (case-105)
    return true;
  }, [d.online]);

  const startCall = useCallback(async () => {
    if (offlineGuard()) return;
    stillTalkingAt.current = null;
    dispatch({ type: 'CALL_TAPPED' });
    try {
      const { callId } = await api.startCall(caseId);
      dispatch({ type: 'CALL_STARTED', callId });
    } catch {
      dispatch({ type: 'STATUS', status: { callId: '', notThrough: true }, now: Date.now() }); // 3
    }
  }, [api, caseId, offlineGuard]);

  const outcomeFor = (kind: ConfirmKind): ConfirmOutcome =>
    kind === 'confirmForward'
      ? 'forwardedToHa'
      : stateRef.current.haSkippedByDoctor || (caseData.route === 'pilot' && !caseData.haCallFollows)
        ? 'prescriptionHaSkipped'
        : 'prescriptionCat4';

  const settleConfirm = useCallback(
    async (kind: ConfirmKind, first: ConfirmResponse) => {
      let r = first;
      // Unclear: stay on "Confirming…" and reconcile; never a second submit (D-69).
      while (r.kind === 'unclear') {
        await new Promise((res) => setTimeout(res, settings.pollingIntervalMs));
        r = await api.confirmStatus(caseId).catch(() => ({ kind: 'unclear' as const }));
      }
      if (r.kind === 'failed') return dispatch({ type: 'CONFIRM_FAILED' });
      if (r.kind === 'submitted')
        return dispatch({ type: 'CONFIRM_DONE', result: 'submitted', submittedAs: kind === 'confirmForward' ? 'forwarded' : 'confirmed' });
      api.analytics(outcomeFor(kind));
      dispatch({ type: 'CONFIRM_DONE', result: r.kind });
    },
    [api, caseId, settings.pollingIntervalMs], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const confirm = useCallback(
    async (kind: ConfirmKind) => {
      const pending = caseData.medicines.filter((m) => m.status === 'pending').length;
      if (pending > 0) {
        dispatch({ type: 'CONFIRM_BLOCKED', n: pending }); // Flag 5: button stays tappable
        d.onScrollToFirstPending();
        return;
      }
      if (offlineGuard()) return;
      const s = stateRef.current;
      if (s.confirmBusy) return;
      if (kind === 'confirmLive') {
        // Fallback B: Confirm prescription (B1) → check for an HA (B2) → 13/14 or B3.
        dispatch({ type: 'CONFIRM_STARTED', live: true });
        try {
          const r = await api.confirm(caseId, 'confirmLive', d.notes);
          if (r.kind === 'failed') return dispatch({ type: 'CONFIRM_FAILED' });
          const { free } = await api.checkHealthAdvisor(caseId);
          dispatch({ type: 'HA_CHECKED', free });
          if (!free) return;
          const t = await api.transferToHealthAdvisor(caseId);
          if (t.ok) api.analytics('transferredToHa');
          dispatch({ type: 'TRANSFER_DONE', ok: t.ok });
        } catch {
          dispatch({ type: 'CONFIRM_FAILED' });
        }
        return;
      }
      dispatch({ type: 'CONFIRM_STARTED', live: false });
      try {
        await settleConfirm(kind, await api.confirm(caseId, kind, d.notes));
      } catch {
        await settleConfirm(kind, { kind: 'unclear' });
      }
    },
    [api, caseId, caseData.medicines, d, offlineGuard, settleConfirm],
  );

  const onAction = useCallback(
    (a: ActionId) => {
      switch (a) {
        case 'callPatient':
        case 'callAgain':
          return startCall();
        case 'stillTalking':
          stillTalkingAt.current = Date.now();
          return dispatch({ type: 'STILL_TALKING' });
        case 'callEnded':
          return dispatch({ type: 'CALL_ENDED_TAPPED' });
        case 'callback':
          return dispatch({ type: 'OPEN_SHEET', sheet: 'callback' });
        case 'unavailable':
          return dispatch({ type: 'OPEN_SHEET', sheet: 'unavailable' });
        case 'skipHa':
          return dispatch({ type: 'OPEN_SHEET', sheet: 'skipHa' });
        case 'confirmPrescription':
          return confirm('confirmPrescription');
        case 'confirmForward':
          return confirm('confirmForward');
        case 'confirmLive':
          return confirm('confirmLive');
        case 'requestNext':
          return d.navigation.requestNextCase();
        case 'backToHome':
          return d.navigation.goHome();
      }
    },
    [confirm, d.navigation, startCall],
  );

  // ── Sheets ─────────────────────────────────────────────────────────────────────────
  const release = useCallback(async () => {
    if (offlineGuard()) return;
    dispatch({ type: 'RELEASE_STARTED' });
    const r = await api.releaseCase(caseId).catch(() => 'failed' as const);
    if (r === 'ok') d.navigation.goHome();
    else dispatch({ type: 'RELEASE_FAILED' }); // refused (patient answered just before) or failed
  }, [api, caseId, d.navigation, offlineGuard]);

  const chooseSkipHa = useCallback(
    async (reason: SkipHaReason) => {
      if (offlineGuard()) return dispatch({ type: 'CLOSE_SHEET' });
      // Choosing a reason applies it at once (case-70). QUESTION (report): no busy / failure state in the kit.
      await api.skipHa(caseId, reason);
      dispatch({ type: 'SKIP_HA_APPLIED' });
    },
    [api, caseId, offlineGuard],
  );

  const chooseUnavailable = useCallback(
    async (reason: UnavailableReason) => {
      if (offlineGuard()) return dispatch({ type: 'CLOSE_SHEET' });
      // Choosing a reason closes the case at once; the reason is saved with the case (D-73, D-75).
      // QUESTION (report): no busy / failure state in the kit.
      await api.markUnavailable(caseId, reason);
      dispatch({ type: 'UNAVAILABLE_DONE' });
    },
    [api, caseId, offlineGuard],
  );

  const confirmCallback = useCallback(
    async (slotLabel: (id: string) => string) => {
      const cb = stateRef.current.callback;
      if (!cb.day && !cb.slotId) return dispatch({ type: 'CALLBACK_INVALID', error: 'pickBoth' });
      if (!cb.day) return dispatch({ type: 'CALLBACK_INVALID', error: 'pickDate' });
      if (!cb.slotId) return dispatch({ type: 'CALLBACK_INVALID', error: 'pickTime' });
      if (!d.online) return dispatch({ type: 'CALLBACK_FAILED', reason: 'failed' });
      dispatch({ type: 'CALLBACK_SAVING' });
      const r = await api.scheduleCallback(caseId, cb.day, cb.slotId).catch(() => 'failed' as const);
      if (r === 'ok') dispatch({ type: 'CALLBACK_DONE', day: cb.day, time: slotLabel(cb.slotId) });
      else dispatch({ type: 'CALLBACK_FAILED', reason: r });
    },
    [api, caseId, d.online],
  );

  // ── Back: header Back only on 1 / 3 / 4 before the patient was ever reached ─────────
  const view = deriveCaseView(state, caseData, d.online);
  const onHeaderBack = useCallback(() => dispatch({ type: 'OPEN_SHEET', sheet: 'leave' }), []);
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const s = stateRef.current;
      if (s.sheet) {
        if (!s.releasing && !s.callback.saving) dispatch({ type: 'CLOSE_SHEET' });
        return true;
      }
      if (view.phoneBack === 'leaveSheet') dispatch({ type: 'OPEN_SHEET', sheet: 'leave' });
      else if (view.phoneBack === 'home') d.navigation.goHome();
      else dispatch({ type: 'BACK_BLOCKED' }); // toast: "Finish this case first…"
      return true;
    });
    return () => sub.remove();
  }, [view.phoneBack, d.navigation]);

  return { state, view, dispatch, onAction, onHeaderBack, release, chooseSkipHa, chooseUnavailable, confirmCallback };
}
