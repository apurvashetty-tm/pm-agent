# Release 2 browser cases

Oracle: decisions override older app-logic and audit wording. All product copy is resolved from `ui-screens/feedback/messages.json` (string or `{text}`); duration notation follows D-106. State enumeration comes from `app/state-map.js`, never screen implementation. Each id prints one independent result, including aggregate state/size checks.

R2-U1 → D-109 §3; release-checklist-2 P5, T2: automatic returning prompt once, then Home.
R2-U2 → D-109 §3; release-checklist-2 P5, T2: cancellation, no automatic retry, manual retry.
R2-U3 → D-105; D-109 §3; app-logic §2 Faster sign-in: automatic attempt counts toward three failures; prefilled sign-in, no SMS.
R2-U4 → D-109 §3 (app arrival); driver picture/capture contract: direct pictures remain still.
R2-S1 → D-109 §1; release-checklist-2 P2: SMS helper.
R2-S2 → D-109 §1; release-checklist-2 P2: couldn't-send notice.
R2-S3 → screens-audit/CONCLUSION.md §1 Links; design-system/RULES.md Entry and home screens / Links; release-checklist-2 P2: real Sign up link, 48px hit area without growing text line.
R2-S4 → app-logic §2 Mobile number; release-checklist-2 T2: empty, short, prefix validation.
R2-O1 → D-107; band-audit/CONCLUSION.md §1 variant 3; release-checklist-2 P3: Change link 48px hit area, 20px subtitle.
R2-O2 → D-109 §1; app-logic §2 OTP; release-checklist-2 P3: resend new-code line.
R2-O3 → release-checklist-2 P3, T2; app/state-map.js pictures otp_*: all OTP pictures render, no console errors or unresolved copy.
R2-B1 → D-107; band-audit/CONCLUSION.md §1; design-system/RULES.md Entry and home screens / The band; release-checklist-2 P1: band geometry on both sizes, all five screen families, setup and available Home.
R2-H1 → D-106 Setup / 10-hour cap; release-checklist-2 P6, T3: exact hour values, minute edges, ten-hour timer.
R2-H2 → D-106 Setup; release-checklist-2 P6: labels, no minimum/range text, changing Available until caption.
R2-H3 → D-106 Available; band-audit/CONCLUSION.md §3; release-checklist-2 P7: title, subtitle, one two-row card, Add visible while active.
R2-H4 → D-106 Available; release-checklist-2 P7, T3: offline Add visible and disabled.
R2-H5 → D-106 10-hour cap / Add-time sheet; release-checklist-2 P8, T3: hour/minute bounds, title, hint, minute/hour formats.
R2-H6 → D-106 10-hour cap; app-logic §3 Time added; release-checklist-2 T3: addition uses selected duration without exceeding cap.
R2-H7 → D-106 Available; release-checklist-2 P7, T3: Rx button to Profile, Back to available Home.
R2-H8 → D-106 Setup; release-checklist-2 P6, T3: nonzero ended count above picker; zero setup hides row.
R2-H9 → D-106–D-107; band-audit/CONCLUSION.md §3; release-checklist-2 P7, T3; app/state-map.js home_* excluding Profile/logout: title per state, valid copy, no console errors.
R2-H10 → D-109 §1–2; release-checklist-2 P9; screens-audit/CONCLUSION.md §1 Sheet: end subtitle wording and header placement, 8px box gap.
R2-K1 → design-system/RULES.md §8.9; screens-audit/CONCLUSION.md §1 Inline primary; release-checklist-2 T4: sign-in field and action clear keyboard by 16px at 360×640.
R2-K2 → app-logic §2 OTP; design-system/RULES.md §8.9; release-checklist-2 T4: code boxes and Verify clear keyboard by 16px at 360×640.

## Superseded test edits

- `tests/entry-journeys.mjs:14`: registry copy reader for replaced assertions (D-107/D-109).
- `tests/entry-journeys.mjs:180`: B2 helper expectations use signin.smsHelper (D-109).
- `tests/entry-journeys.mjs:198`: B3 couldn't-send expectation uses signin.couldntSend (D-109).
- `tests/entry-journeys.mjs:292`: B5f new-code expectation uses otp.newSent, including full stop (D-109).
- `tests/entry-journeys.mjs:313`: B5b new-code expectation uses otp.newSent (D-109).
- `tests/entry-journeys.mjs:454`: F3 offer title uses offer.title (D-107).
- `tests/entry-journeys.mjs:459`: F3b observes automatic unlock instead of tapping a busy button; removes idle-label assertion (D-109).
- `tests/entry-journeys.mjs:579`: F6 cancels automatic screen-lock prompt before testing its manual retry, then selects success (D-109).
- `tests/entry-journeys.mjs:596`: F6c cancels automatic prompt so device-capability test stays on unlock (D-109).
- `tests/entry-journeys.mjs:609`: F7f selects cancellation and waits for automatic prompt before testing OTP fallback / code limits (D-109).
- `tests/entry-journeys.mjs:630`: returning helper cancels and settles automatic arrival prompt before existing manual-retry tests (D-109); new R2-U3 independently tests automatic failure counting.
- `tests/entry-journeys.mjs:696`: F8 cancels and settles arrival prompt before changing the next manual prompt's answer (D-109).
- `tests/wheel-keyboard.mjs:12`: registry reader for home.addConfirm (D-106).
- `tests/wheel-keyboard.mjs:117`: W5 expects hour/minute duration format rather than Add {n} minutes (D-106).
- `tests/codex/run-A/journeys.mjs:42`: A-H09 Rx label uses home.rxToday (D-106).
- `tests/codex/run-A/journeys.mjs:44`: A-H09 ended Rx label uses home.rxToday (D-106).
- `tests/codex/run-A/journeys.mjs:142`: Profile Back journey Rx label uses home.rxToday (D-106).

Searched `tests/*.mjs` and `tests/codex/**/*.mjs` for all listed superseded expectations. A near-expiry addition journey and prose describing adding thirty minutes remain valid; neither asserts Add is absent while active. The wheel's 15-minute minimum behavior also remains valid; only its visible helper was removed by D-106.

Validation: `node --check` on the new script and all three edited scripts. Browser execution is deferred to the build; this task writes tests first and makes no product changes. The test owns an ephemeral loopback server and closes it and Chromium in finally. Run with `node tests/codex/r2/r2.test.mjs`; optionally set `CHROME` to a Chromium executable.
