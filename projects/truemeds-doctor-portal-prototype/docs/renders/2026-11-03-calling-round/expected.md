# Expected picture list — calling round (written before the after-render)

Baseline: `before/` = current `ui-screens/` (scratch render reproduces all 290 approved pictures byte-for-pixel, see REPORT.md).
Widths: each state at 390 and 360 (2 pictures per state).

## Expected to DIFFER (changed states, 19 states = 38 pictures)

| State | Item | Why |
|---|---|---|
| `t02-calling` | K1 | Callback removed; bar = status line "Calling {name}…" only |
| `s7a-calling` | K1 | same as t02 |
| `a-back-blocked` | K1 | same as t02 (status line only; header Back still hidden) |
| `t11-calling-transfer` | K1 | status line only |
| `t05-result-wait` | K1 | status line "Getting call result…" only |
| `t12-transfer-ready` | K1 | Skip HA added full width under Confirm & transfer |
| `t08b-valid-forward` | K1 | Skip HA added full width under Confirm & forward |
| `t08c-confirm-blocked` | K1 | Callback removed (no Callback except 6 and 7d); Confirm prescription stays |
| `t17-skip-ha-wait` | K1, K7 | Callback removed; status line "Calling {name}…" (not "Getting call result…") |
| `c-callback` | K2 | sheet now over 6 Call too short (not Calling) |
| `c-callback-error` | K2 | same |
| `c-callback-failed` | K2 | same |
| `c-skip-ha` | K1 | the sheet sits over 12; the bar behind it gains Skip HA (may be hidden by the sheet — if so it is listed under "expected but unchanged") |
| `g1-generic-confirm` | K11 | Skip HA added full width under Confirm prescription; no Callback |
| `g2-checking-ha` | K13 | greyed row = Skip HA only, full width, disabled |
| `t13-connecting-ha` | K13 | greyed row = Skip HA only, full width, disabled |
| `g3b-forwarded` | K9 | bar = "Waiting for the call to end…" only (live) |
| `t15-ha-no-join` | K8 | bar = "Waiting for the call to end…" only (live); card unchanged |
| `a-no-medicines` | K4 | amber notice at top of the panel; new text; plain text in medicines card removed; Release case only |

Not in the picture set but in the render: `messages.json` text change on `case.noMedicines` (only a-no-medicines shows it).

## Expected NEW pictures (5 new states = 10 pictures)

| New state | Item |
|---|---|
| `t15-after-hangup` | K8 — same card as t15; bar Request next case · Back to Home |
| `g3b-after-hangup` | K9 — same card as g3b; bar Request next case · Back to Home |
| `g0-calling-pilot` | K12 — Pilot live call before the gate; neutral script; bar status line "Calling {name}…" only |
| `s7d-result-missing-pilot` | K6 — Pilot 7d; bar Confirm & forward · Callback + Unavailable |
| `c-callback-refused` | K3 — callback sheet over 6 with the `callback.notReached` error |

## Expected to be REMOVED (2 pictures)

- `t15b-end-call-first` (K10), `_w390` and `_w360`.

## Expected UNCHANGED (everything else, 125 states = 250 pictures)

Named explicitly because they are on the walk-through and must stay identical:
- `t08a-valid-cat4` (already Confirm prescription alone; K1 pass-when holds without change)
- `t06-ended-early` (keeps Call again · Callback — allowed state 6)
- `s7d-result-missing`, `s7d-unavailable-sheet` (7d keeps Callback + Unavailable)
- `t16-transfer-missed`, `t16b-…`, `t16c-…` (no Callback already; K1 holds)
- `t09`, `t10a`, `t10b`, `t14`, `s7f`, `e-*`, `t01`, `t03`, `t04`, `s7b`, `s7c`, `s7e`, `a-leave-sheet`, `a-releasing`, `a-release-failed`, `t08b` is listed above (changed)
- Every sign-in, OTP, offer, unlock, Home and Prescribe (`d-*`) picture.

Total expected after render: 290 − 2 (t15b) + 10 (new) = 298 pictures across 149 states (145 − 1 + 5); of the 144 surviving existing states, 19 differ.

## Main-check 1 addendum (written before the re-render)

| State | Fix | Expected picture change |
|---|---|---|
| `t15-after-hangup` | M1: script card hidden; card text = `call.forwardedAfterHangup`; Medicines card moves up | differs (script card removed, text changed, content moves up) |
| `g3b-after-hangup` | M1: same | differs (same) |
| `t05-result-wait` | M2: Pilot fixture (Sunita) instead of Cat4 (Ramesh) | differs (header name and medicines/notes data) |
| all others | none | identical to the previous after-render (`after/`) |
| `t15-ha-no-join`, `g3b-forwarded` | unchanged (live states keep the script and the transfer-failed card text) | identical to `after/` |
