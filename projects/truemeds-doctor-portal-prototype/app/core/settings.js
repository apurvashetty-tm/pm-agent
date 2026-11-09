// Settings — the only place these values live (plan v3 B10, checklist 3.2). Nothing else in app/ hard-codes them.
// `source` is either "rule" (agreed in the decision log) or "MOCK ASSUMPTION" (stand-in until Engineering / Ops decide).
// `time: true` values are scaled by the demo factor in demo mode (one factor for every time value).
// Units: milliseconds for time, plain numbers otherwise.

const MIN = 60 * 1000, SEC = 1000;

export const DEMO_TIME_FACTOR = 0.15; // demo: an 8 s call still passes a 7.5 s gate (B10, checklist 5.2)

export const SETTINGS = {
  // Call gate and talk time
  gate:                 { value: 50 * SEC, time: true, source: "rule", ref: "D-58 pt 14, OQ-001" },
  minCountedCall:       { value: 10 * SEC, time: true, source: "rule", ref: "D-58 pt 22 (~10 s)" },
  talkWindow:           { value: 30 * MIN, time: true, source: "rule", ref: "D-58 pt 22 (~30 min)" },
  // No result and hang-up
  noResultTimeout:      { value: 3 * MIN, time: true, source: "rule", ref: "D-58 pt 20" },
  stillOnCallRepeat:    { value: 3 * MIN, time: true, source: "rule", ref: "D-83 CW-D1" },
  callRecordWait:       { value: 30 * MIN, time: true, source: "MOCK ASSUMPTION", ref: "D-73 (30 min); OQ-033 wait time to agree" },
  // Patient-side holds (B9, D-83 pt 6)
  holdRetryGap:         { value: 15 * MIN, time: true, source: "MOCK ASSUMPTION", ref: "gap between retries; Engineering to agree" },
  holdRetryAttempts:    { value: 3, source: "MOCK ASSUMPTION", ref: "attempts before plain hold" },
  // Server polling (B7)
  pollingInterval:      { value: 3 * SEC, time: true, source: "MOCK ASSUMPTION", ref: "inside D-58 pt 14 (about 5 s)" },
  // Sign-in and OTP (app-logic §2, OQ-017)
  otpWindow:            { value: 10 * MIN, time: true, source: "MOCK ASSUMPTION", ref: "OQ-017" },
  otpLock:              { value: 15 * MIN, time: true, source: "MOCK ASSUMPTION", ref: "OQ-017" },
  resendWaits:          { value: [30 * SEC, 60 * SEC, 120 * SEC], time: true, source: "MOCK ASSUMPTION", ref: "OQ-017" },
  nearExpiryWarning:    { value: 5 * MIN, time: true, source: "MOCK ASSUMPTION", ref: "app-logic §3 near-expiry" },
  otpWrongLimit:        { value: 5, source: "rule", ref: "D-34: the 5th server-confirmed wrong code locks the number" },
  otpCodesPerWindow:    { value: 4, source: "rule", ref: "D-35: first code + 3 resends per number per window" },
  otpTriesLeftFrom:     { value: 2, source: "rule", ref: "D-81 F1: the wrong-code line counts from 2 tries left" },
  tooManyTriesWait:     { value: 10 * MIN, time: true, source: "MOCK ASSUMPTION", ref: "test number 9000000003: sign-in countdown; OQ-017" },
  returningUnlockFallbackAfter: { value: 3, source: "MOCK ASSUMPTION", ref: "3 failed tries → OTP (checklist 4.3)" },
  // Availability (checklist 4.4)
  availabilityMinimum:  { value: 15 * MIN, time: true, source: "rule", ref: "app-logic §3" },
  availabilityStep:     { value: 15 * MIN, time: true, source: "rule", ref: "app-logic §3 (15-min wheel)" },
  attemptGap:           { value: 60 * SEC, time: true, source: "MOCK ASSUMPTION", ref: "review tool: gap between scheduled call attempts" },
  // Review tool only (not a product rule): how long the simulated server takes to answer (sign-in, OTP, resend)
  mockServerDelay:      { value: 1200, time: true, source: "review tool", ref: "simulated server answer time" },
  reconcileDelay:       { value: 800, time: true, source: "review tool", ref: "simulated cooldown check when the app comes back" },
  // Review tool only (not a product rule): size of one fast-forward step in the review panel
  fastForwardStep:      { value: 60 * SEC, time: true, source: "review tool", ref: "panel button" },
  // Earnings (app-logic §11, D-81 F10)
  earningsPerConfirmedRx: { value: 20, source: "rule", ref: "D-81 F10, Apurva 2026-11-02" },
};

// Value for the current mode. Demo scales every time value by one factor; review, capture and play use real values.
export function value(key, mode = "review") {
  const s = SETTINGS[key];
  if (!s) throw new Error(`settings: unknown key ${key}`);
  if (!s.time || mode !== "demo") return s.value;
  return Array.isArray(s.value) ? s.value.map((v) => Math.round(v * DEMO_TIME_FACTOR)) : Math.round(s.value * DEMO_TIME_FACTOR);
}

// Every value with its source label, for the review panel's settings view (B10: real rules vs stand-ins visible).
export function listSettings() {
  return Object.entries(SETTINGS).map(([key, s]) => ({ key, value: s.value, time: !!s.time, source: s.source, ref: s.ref }));
}
