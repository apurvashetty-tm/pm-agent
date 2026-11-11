// [MOCK] Prototype stand-ins, kept in ONE place so they are easy to replace with the backend.
// Values copied from DECIDED.md (case-118 … case-130). Not production promises.
import type { CallbackSlot, CaseData } from '../model/types';
import type { CallingSettings } from '../model/settings';

const SECOND = 1000;
const MINUTE = 60 * SECOND;

export const prototypeSettings: CallingSettings = {
  gateSeconds: 50, // case-118 (agreed rule)
  noResultTimeoutMs: 3 * MINUTE, // case-121 (agreed rule)
  stillOnCallRepeatMs: 3 * MINUTE, // case-122 (agreed rule)
  pollingIntervalMs: 3 * SECOND, // case-126 [MOCK]
  callRecordWaitMs: 30 * MINUTE, // case-123 [MOCK]
  toastDurationMs: 4 * SECOND, // toast.json rule "about 4 seconds" — no token; QUESTION in report
};

/** case-77 / case-130 [MOCK]: real slots come from the backend. */
export const prototypeCallbackSlots: CallbackSlot[] = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM',
].map((label, i) => ({ id: String(i), label }));

/** Sample case (case.json sample data: Ramesh Gupta, 5 medicines). */
export const sampleCase: CaseData = {
  caseId: 'case-1',
  patient: { fullName: 'Ramesh Gupta', age: '54', gender: 'Male' },
  order: { id: 'TM-ORD-20240812', total: '₹1,240' },
  route: 'cat4',
  haCallFollows: false,
  medicines: [
    { id: 'm1', name: 'Metformin 500mg', qty: 60, form: 'tablet', status: 'prescribed' },
    { id: 'm2', name: 'Amlodipine 5mg', qty: 30, form: 'tablet', status: 'pending' },
    { id: 'm3', name: 'Atorvastatin 10mg', qty: 30, form: 'capsule', status: 'pending' },
    { id: 'm4', name: 'Vitamin B12 1000mcg', qty: 4, form: 'injection', status: 'pending' },
    { id: 'm5', name: 'Antacid Suspension 10ml', qty: 1, form: 'syrup', status: 'pending' },
  ],
};
