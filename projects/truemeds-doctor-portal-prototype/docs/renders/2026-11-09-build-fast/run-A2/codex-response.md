# Run A2 — response to the Codex critique (`codex-critique.md`)

All 3 blockers and both should-fix items adopted. Each has its own test in `tests/build-fast-a2.mjs`.

| # | Finding | Fix | Test |
|---|---|---|---|
| B1 | Unclear confirm never reconciles; a reopen loses the busy guard | The submit is kept with the case (`c.confirmPending`). An unclear answer stays on Confirming… and checks again every `reconcileDelay` (`checkConfirm` in `case.js`); it ends on the confirmed card or the failure notice. Reopening mid-confirm resumes the check, never resubmits (app-logic §6, D-69). | R20-c, R20-d |
| B2 | 7d Confirming… left Callback and Unavailable active | Both are disabled while confirming; the sheets can't open; a confirm answer only closes a case still on 8a / 7d. | R20-e |
| B3 | A late result didn't revoke an open Callback / Unavailable sheet | `callbackAllowed()` (6, 7d) and `unavailableAllowed()` (7d) gate opening, the poll closes a sheet the new stage doesn't offer, and the callback save / reason re-check the stage when they run. | R17-c |
| S1 | Hold / retry was log text only | `session.addHold` / `settleHolds`: a held case (patient side by cause, unproven 7f) is retried every `holdRetryGap` up to `holdRetryAttempts`, each retry logged, then plain hold. Plain hold and invalid numbers are not retried. | R18-e, R18-f |
| S2 | Talk time not anchored on the patient's answer | New simulator choice **Rings before the answer** (`ring`, 0 / 5 / 20 / 45 / 90 s, default 0). The attempt's answer time is tap + ring; talk counts from the answer, so 45 s ringing + 20 s talk is too short, and 45 s + 50 s unlocks only 50 s after the answer. | R16-b, R16-b2 |

Supplemental items Codex lists as partly uncovered, and where they stand:
- **A-R16 real-time vs fast-forward:** both read the same time stamps (the app clock; fast-forward moves its offset and polls at once). Demo scaling is the settings test U2/U7 in `run-checks.mjs`. No separate test added.
- **A-R17 vendor / end-event combinations:** Cat4 with a known hang-up (R17-a), HA-skipped Ozonetel (edge C0>C7c, C0>RES), Knowlarity + call-ended event uses the same "known" rule (`facts()` in `call-engine.js`); not every combination has its own test.
- **A-R15 notes payload:** callback / unavailable clear the notes (D-59); there is no saved-payload or printed-Rx output in the prototype yet, so the "printed / internal" split stays an eye check (listed in REPORT).
