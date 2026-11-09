// Review-only labels (panel, drawer, notices). These are not product copy: product words come from MSG() (checklist 3.1).
export const REVIEW_TEXT = {
  title: "Review panel",
  start: "Start the story at",
  scenario: "Case scenario",
  offline: "Offline",
  settingsHeading: "Timings and limits",
  advanced: "Advanced",
  sameWifi: "Phone and Mac on the same Wi-Fi",
  serveHint: "A phone can't open localhost: start the app with scripts/serve.sh to get a link for the phone.",
  journeysHeading: "Journey answers",
  call: "Call simulator",
  unlock: "Phone unlock (faster sign-in)",
  jump: "Jump to a state",
  jumpGo: "Open state",
  restart: "Restart story",
  fastForward: "Fast-forward",
  runCall: "Run call",
  reset: "Reset review",
  log: "Event log",
  phone: "Test on phone",
  makeQr: "Make QR and link",
  copy: "Copy link",
  qrNote: "Scan to play this story on your phone. The phone shows only the app.",
  notReady: "Not built yet",
  pictureLabel: "Not built yet — approved picture (step {step}). Review only.",
  behaviourOnly: "Behaviour only — no picture. Built in step {step}.",
  shellOnly: "Step 0 shell. No journey screens yet. Pick a state in the panel, or open ?s=<state id>.",
  demoShell: "Demo. Journey screens arrive in later build steps.",
  unknownState: "Unknown state: {id}",
  playUnreadable: "This play link can't be read. Opened review instead.",
  width: "Width",
  drawerRestartHint: "Restart story starts the story again at its start point.",
};

// Plain words for every story value the panel and drawer offer (Part A item 1). The value stays the code in the link;
// people only see these. tests/run-checks.mjs (P1) fails when a value has no words here.
export const VALUE_LABEL = {
  start: { "sign-in": "Sign-in", unlock: "Returning unlock", home: "Home", case: "Case page" },
  scenario: { cat4: "Cat4", pilot_ha_free: "Pilot · HA free", pilot_no_ha_free: "Pilot · no HA free",
    pilot_ha_skipped_customer: "Pilot · HA skipped by customer", pilot_ha_skipped_system: "Pilot · HA skipped by system", stress: "Stress case" },
  offline: { no: "Online", yes: "Offline" },
  signIn: { sent: "Code sent", "not-registered": "Not registered", inactive: "Account inactive", "too-many-tries": "Too many codes",
    "couldnt-send": "Couldn't send", "locked-number": "Number locked" },
  otp: { correct: "Correct code", wrong: "Wrong code", "two-tries-left": "Wrong, 2 tries left", expired: "Code expired",
    "couldnt-verify": "Couldn't check", locked: "Number locked", "resend-ok": "New code sent", "resend-failed": "New code fails" },
  device: { fingerprint: "Fingerprint", face: "Face", "screen-lock": "Screen lock only", none: "No screen lock" },
  offer: { enabled: "Turns on", cancelled: "Prompt cancelled", "enable-failed": "Couldn't turn on", unavailable: "Not available" },
  unlock: { success: "Unlocks", cancelled: "Prompt cancelled", failed: "Fails once", unavailable: "Not available" },
  availability: { normal: "Normal", "near-expiry": "Ending soon", ending: "Ending", "ended-with-request": "Ended, request open" },
  request: { accepted: "Case arrives", failed: "Request fails", "no-cases": "No cases" },
  caseKind: { normal: "Normal", "ten-medicines": "10 medicines", "long-names": "Long names", empty: "No medicines",
    "rx-failed": "Rx won't load", "release-refused": "Release refused" },
  prescribe: { saved: "Saves", "pending-blocks-confirm": "Pending blocks confirm", "confirm-busy": "Confirming…",
    "confirm-failed": "Confirm fails", "dose-error": "Dose error", disabled: "Medicine disabled" },
  connected: { none: "Patient didn't answer", "under-gate": "Under the gate", "just-under-gate": "Just under the gate",
    "at-gate": "At the gate", "over-gate": "Over the gate" },
  doctorFailure: { none: "None", 3: "Didn't go through", 4: "You didn't answer" },
  patientFailure: { none: "None", busy: "Busy", "no-answer": "No answer", "switched-off": "Switched off", network: "Network",
    unknown: "Unknown", "invalid-number": "Invalid number" },
  partner: { ozonetel: "Ozonetel", knowlarity: "Knowlarity" },
  callEndedEvent: { "no-event": "No call-ended event", event: "Call-ended event" },
  hangupReported: { reported: "Hang-up reported", "not-reported": "Hang-up not reported" },
  whoEnded: { doctor: "Doctor ended the call", patient: "Patient ended the call", unknown: "Not known who ended" },
  ha: { free: "Health Advisor free", none: "No Health Advisor free", "transfer-failed": "Transfer fails", "no-answer": "Health Advisor doesn't answer" },
  record: { "over-gate": "Record: over the gate", "under-gate": "Record: under the gate", "never-answered": "Record: never answered",
    never: "No record", delayed: "Record late" },
  callbackRefused: { accepted: "Callback accepted", refused: "Callback refused" },
  releaseRefused: { accepted: "Release accepted", refused: "Release refused" },
};
export const valueLabel = (field, v) => (VALUE_LABEL[field] && VALUE_LABEL[field][v]) || String(v);

// Timings and limits (D-97 item 5c): one plain name per settings key. tests/run-checks.mjs (P11) fails when a key has none.
export const SETTING_NAME = {
  gate: "Valid-call minimum", minCountedCall: "Shortest call that counts", talkWindow: "Talk-time window",
  noResultTimeout: "No call result after", stillOnCallRepeat: "\u201cStill on the call?\u201d repeats every", callRecordWait: "Call record wait",
  holdRetryGap: "Hold: gap between retries", holdRetryAttempts: "Hold: retries before plain hold", pollingInterval: "Server check every",
  otpWindow: "OTP code window", otpLock: "OTP lock", resendWaits: "Resend waits", nearExpiryWarning: "Availability ending warning",
  otpWrongLimit: "Wrong codes before lock", otpCodesPerWindow: "Codes per number per window", otpTriesLeftFrom: "Tries-left line from",
  tooManyTriesWait: "Too-many-codes wait", returningUnlockFallbackAfter: "Failed unlocks before OTP",
  availabilityMinimum: "Shortest availability", availabilityStep: "Availability step", attemptGap: "Gap between simulated calls",
  mockServerDelay: "Simulated server answer", reconcileDelay: "Simulated cooldown check", phonePromptDelay: "Simulated phone prompt",
  fastForwardStep: "Fast-forward step", earningsPerConfirmedRx: "Earnings per confirmed prescription",
};
// Value in plain units: whole minutes as "min", anything shorter in seconds; counts as plain numbers; money in rupees.
const MS_PER_MIN = 60 * 1000;   // unit conversion for display, not a setting
const dur = (ms) => (ms >= MS_PER_MIN && ms % MS_PER_MIN === 0 ? `${ms / MS_PER_MIN} min` : `${Math.round(ms / 100) / 10} s`);
export function settingValue({ key, value, time }) {
  if (key === "earningsPerConfirmedRx") return `\u20b9${value}`;
  if (!time) return String(value);
  return Array.isArray(value) ? value.map(dur).join(", ") : dur(value);
}
// "rule" = agreed in the decision log; everything else (MOCK ASSUMPTION, review tool) is a stand-in until decided.
export const settingTag = (source) => (source === "rule" ? "Rule" : "Stand-in");
