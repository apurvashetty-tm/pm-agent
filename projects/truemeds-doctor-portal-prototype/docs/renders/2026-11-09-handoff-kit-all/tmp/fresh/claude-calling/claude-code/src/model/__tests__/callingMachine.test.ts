// Walks the machine through the kit's calling states (screens/case.json ids) and checks what the bar shows.
import { messages } from '../../kit';
import { callingReducer, CallingEvent, CallingState, initialCallingState } from '../callingMachine';
import { deriveCaseView } from '../caseView';
import { sampleCase } from '../../mock/prototypeFixtures';

const run = (haCallFollows: boolean, events: CallingEvent[]): CallingState =>
  events.reduce(callingReducer, initialCallingState(haCallFollows));
const cat4 = sampleCase;
const pilot = { ...sampleCase, route: 'pilot' as const, haCallFollows: true };
const labels = (s: CallingState, c = cat4, online = true) =>
  deriveCaseView(s, c, online).bar.rows.flatMap((r) => (r.type === 'pair' ? r.buttons.map((b) => b.label) : r.type === 'button' ? [r.label] : [r.text]));
const st = (status: object): CallingEvent => ({ type: 'STATUS', status: { callId: 'c', ...status }, now: 0 });

test('t01-ready: Call patient, header Back', () => {
  const s = run(false, []);
  expect(labels(s)).toEqual([messages['case.callPatient']]);
  expect(deriveCaseView(s, cat4, true).headerBack).toBe(true);
});

test('t02-calling: status line only, Cat4 script, no Back', () => {
  const s = run(false, [{ type: 'CALL_TAPPED' }]);
  const v = deriveCaseView(s, cat4, true);
  expect(v.headerBack).toBe(false);
  expect(v.script).toBe(messages['call.scriptCat4']);
  expect(labels(s)).toEqual(['Calling Ramesh Gupta…']);
});

test('t03 / t04: doctor-side failures keep Back', () => {
  expect(run(false, [{ type: 'CALL_TAPPED' }, st({ notThrough: true })]).phase).toBe('notThrough');
  const s = run(false, [{ type: 'CALL_TAPPED' }, st({ doctorMissed: true })]);
  expect(s.phase).toBe('doctorMissed');
  expect(deriveCaseView(s, cat4, true).headerBack).toBe(true);
});

test('Back never returns once the patient answered (case-11)', () => {
  const s = run(false, [{ type: 'CALL_TAPPED' }, st({ patientAnswered: true }), { type: 'CALL_TAPPED' }, st({ doctorMissed: true })]);
  expect(s.phase).toBe('doctorMissed');
  expect(deriveCaseView(s, cat4, true).headerBack).toBe(false);
});

test('t06-ended-early: Call again · Callback, no Unavailable', () => {
  const s = run(false, [{ type: 'CALL_TAPPED' }, st({ patientAnswered: true, result: { verdict: 'tooShort' } })]);
  expect(labels(s)).toEqual([messages['case.callAgain'], messages['case.callback']]);
});

test('t08a-valid-cat4 → confirm → t10a', () => {
  let s = run(false, [{ type: 'CALL_TAPPED' }, st({ patientAnswered: true, result: { verdict: 'valid' } })]);
  expect(labels(s)).toEqual([messages['case.confirmPrescription']]);
  s = callingReducer(s, { type: 'CONFIRM_STARTED', live: false });
  expect(labels(s)).toEqual([messages['case.confirming']]);
  s = callingReducer(s, { type: 'CONFIRM_DONE', result: 'confirmed' });
  expect(deriveCaseView(s, cat4, true).statusCard?.title).toBe(messages['case.confirmedTitle']);
});

test('s7b → Call ended → 7c (= t05) → nothing found → s7d', () => {
  let s = run(false, [{ type: 'CALL_TAPPED' }, { type: 'NO_RESULT_TIMEOUT' }]);
  expect(s.phase).toBe('stillOnCall');
  s = callingReducer(s, { type: 'CALL_ENDED_TAPPED' });
  expect(labels(s)).toEqual([messages['call.resultWait']]);
  s = callingReducer(s, { type: 'RECORD_CHECKED', status: null, now: 0 });
  expect(labels(s)).toEqual([messages['case.confirmPrescription'], messages['case.callback'], messages['case.unavailable']]);
});

test('s7d-result-missing-pilot: Confirm & forward, no Skip HA', () => {
  const s = run(true, [{ type: 'CALL_TAPPED' }, { type: 'NO_RESULT_TIMEOUT' }, { type: 'CALL_ENDED_TAPPED' }, { type: 'RECORD_CHECKED', status: null, now: 0 }]);
  expect(labels(s, pilot)).toEqual([messages['case.confirmForward'], messages['case.callback'], messages['case.unavailable']]);
});

test('Pilot Fallback B: g0 → g1 → g2 → t13 → t14', () => {
  let s = run(true, [{ type: 'CALL_TAPPED' }, st({ patientAnswered: true })]);
  expect(deriveCaseView(s, pilot, true).script).toBe(messages['call.scriptNeutral']);
  s = callingReducer(s, { type: 'LIVE_GATE_REACHED' });
  expect(labels(s, pilot)).toEqual([messages['case.confirmPrescription'], messages['case.skipHa']]);
  s = callingReducer(s, { type: 'CONFIRM_STARTED', live: true });
  expect(labels(s, pilot)).toEqual([messages['call.checkingHa'], messages['case.skipHa']]);
  s = callingReducer(s, { type: 'HA_CHECKED', free: true });
  expect(labels(s, pilot)).toEqual([messages['call.connectingHa'], messages['case.skipHa']]);
  s = callingReducer(s, { type: 'TRANSFER_DONE', ok: true });
  expect(deriveCaseView(s, pilot, true).statusCard?.title).toBe(messages['case.transferredTitle']);
});

test('B3 / 15: forwarded live waits for the hang-up, then title-only neutral card', () => {
  let s = run(true, [{ type: 'CALL_TAPPED' }, st({ patientAnswered: true }), { type: 'LIVE_GATE_REACHED' }, { type: 'CONFIRM_STARTED', live: true }, { type: 'HA_CHECKED', free: false }]);
  expect(labels(s, pilot)).toEqual([messages['call.waitingForHangup']]);
  expect(deriveCaseView(s, pilot, true).script).toBe(messages['call.forwardedTell']);
  s = callingReducer(s, st({ patientAnswered: true, hangup: { endedBy: 'doctor' } }));
  const v = deriveCaseView(s, pilot, true);
  expect(v.statusCard).toEqual({ tone: 'neutral', icon: 'info-circle', title: messages['case.forwardedTitle'] });
});

test('t16 variants name who ended the call; Skip HA → Confirm prescription', () => {
  let s = run(true, [{ type: 'CALL_TAPPED' }, st({ patientAnswered: true }), { type: 'LIVE_GATE_REACHED' }, st({ patientAnswered: true, hangup: { endedBy: 'patient' } }), st({ patientAnswered: true, result: { verdict: 'valid' } })]);
  expect(deriveCaseView(s, pilot, true).bar.notice?.text).toBe(messages['call.transferMissedPatient']);
  s = callingReducer(s, { type: 'SKIP_HA_APPLIED' });
  expect(labels(s, pilot)).toEqual([messages['case.confirmPrescription']]);
});

test('t17-skip-ha-wait: Skip HA on the live call', () => {
  const s = run(true, [{ type: 'CALL_TAPPED' }, st({ patientAnswered: true }), { type: 'LIVE_GATE_REACHED' }, { type: 'SKIP_HA_APPLIED' }]);
  const v = deriveCaseView(s, pilot, true);
  expect(v.script).toBe(messages['call.scriptCat4']);
  expect(v.bar.notice?.text).toBe(messages['call.skipHa']);
  expect(labels(s, pilot)).toEqual([messages['call.resultWait']]);
});

test('t09: patient-side failure closes the case automatically', () => {
  const s = run(false, [{ type: 'CALL_TAPPED' }, st({ patientLegFailed: true })]);
  expect(deriveCaseView(s, cat4, true).statusCard?.title).toBe(messages['case.unavailableTitle']);
  expect(labels(s)).toEqual([messages['case.requestNext'], messages['case.backToHome']]);
});

test('e-availability-ended: only Back to Home', () => {
  const s = run(false, [{ type: 'AVAILABILITY_ENDED' }, { type: 'CALL_TAPPED' }, st({ patientLegFailed: true })]);
  expect(labels(s)).toEqual([messages['case.backToHome']]);
});

test('t08c-confirm-blocked and a-offline notices in the bar', () => {
  const s = run(false, [{ type: 'CONFIRM_BLOCKED', n: 4 }]);
  expect(deriveCaseView(s, cat4, true).bar.notice?.text).toBe('Prescribe or disable 4 medicines first.');
  expect(deriveCaseView(run(false, []), cat4, false).bar.notice?.text).toBe(messages['case.offline']);
});
