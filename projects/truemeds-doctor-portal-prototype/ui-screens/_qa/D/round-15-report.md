# Round 15 report (D-54 fixes, from docs/reviews/2026-10-15-round-15-fixes.md)

Status: **Reviewed — yet to be approved by Apurva.** Nothing promoted; `index.html`, `design-system/`, `RULES.md`, the decision log and `ui-screens/native/` not edited; no git; no deletes.

## Proof files
- Guard: `guard-round-15.json` (all phases, 390 / 360 / 430). Failures: 94 (B R3 ×72, C R3 ×15, D 5.4 ×6, D 5.3 ×1). A: 0.
- Measured proofs: `round-15-proofs/proofs.json` (produced by `round-15-proofs/proofs.py`).
- Renders: `{A,B,C,D}/round-15/<state>_w390.png` and `_w360.png` (reviewed), 430 checked by guard only.
- Final contact sheets: `{A,B,C,D}/final/contact-*.png` (round 15), e.g. `D/final/contact-case-page.png`, `D/final/contact-call.png`, `D/final/contact-sheets.png`, `D/final/contact-prescribe.png`, `D/final/contact-endings.png`, `D/final/contact-new-states.png`, `D/final/contact-stress.png`, `A/final/contact-sign-in.png`, `A/final/contact-otp.png`, `B/final/contact-offer.png`, `B/final/contact-unlock.png`, `C/final/contact-home.png`.

## Phase D — fixes D1–D16

| # | Item | Result | Proof |
|---|---|---|---|
| D1 | Case bar labels and icons; stacking rule and 4px padding removed | **PASS** | proofs `D1 …` (Callback 152 / Skip HA 152 at 360, 167 / 167 at 390, both 56px with icons; lone Callback 312 / 342 full width); guard R5 pass; `D/final/contact-call.png` |
| D2 | Medicine rows: name, then Qty + status tag; no dose text; chevron on live rows | **PASS** | proofs `D2 a-long-content 360` (longest row 86px = 3 lines), `D2 a-top 390 tag right edges` (all 322px), `D2 … dose text` (absent), `D2 e-* 360 rows` (≤3 lines, tag right 307px, no chevron when closed); `D/final/contact-case-page.png` |
| D3 | Call outcome as warning notice in the bar | **PASS** | proofs `D3 b-ended-early`, `D3 b-didnt-connect`, `D3 a-offline` (notice above the first button at 360 and 390, in viewport); `D/final/contact-call.png` |
| D4 | Call card above medicines from connected until closed | **PASS** | proofs `D4 b-on-call` (case-tools, action-zone, medicines), `D4 b-post-gate-cat4`, `D4 a-top` (medicines before action-zone) |
| D5 | Injection doses 1 · 2 · 3 · Other; daily slots 0–3 | **PASS** | proofs `D5 d-injection-default 360/390`, `D5 d-error-other 360/390` (1, 2, 3, Other), `D5 injection daily slots` (M, A, N each 0–3; probe sets interval to daily, as the mock is monthly) |
| D6 | Indent rule only on the M/A/N dose grid | **PASS on the rule, FAIL on 5.4 (conflict)** | proofs `D6 d-sos-on grids` (Dose and Max extra doses start at label edge 54 = 54; M/A/N grid unchanged: label 40, grid 76, chip 63). Guard 5.4 fails because section chips are 68 and the M/A/N chips 63 → NEEDS-APURVA §1 |
| D7 | Discard on top (red outline), Keep editing quiet | **PASS** | proofs `D7 discard buttons` (Discard top 700, Keep editing 764) |
| D8 | Case offline = warning | **PASS** | proofs `D8 a-offline notice` (`tm-notice--warning`, yellow rgb(255,237,188), alert-triangle); `D/final/contact-new-states.png` |
| D9 | Phone-back toast central, ≥24px from edges, ≤2 lines | **PASS** | proofs `D9 toast 360/390` (48px from both edges, 2 lines); guard R2 pass |
| D10 | Help stays enabled while confirming | **PASS** | proofs `D10 a-confirm-busy` (Help enabled, Order details enabled, View Rx disabled, bar actions disabled); guard R4 pass |
| D11 | Callback error as field error, 8px under the Time grid, no icon | **PASS** | proofs `D11 c-callback-error` (red rgb(214,18,18), 14/20, no icon, gap 8); `D/final/contact-sheets.png` |
| D12 | No placeholder dash in On prescription line | **PASS** | proofs `D12 print line` ("Once a month · 3 months"); guard R7 pass |
| D13 | Vitamin B12 Rx line matches Prescribe band | **PASS** | proofs `D13 Rx line` ("1 dose once a month · Qty 4"); `D/final/contact-case-page.png` (a-rx-viewer) |
| D14 | Closed order-details card same height as live | **PASS** | proofs `D14/D15 a-top` and `D14/D15 e-prescription-confirmed` (both 80px) |
| D15 | View Rx at the right edge with no order details | **PASS** | proofs `D14/D15 s-optional-empty` (View Rx right 350 = a-top 350) |
| D16 | Rename b-unavailable-sheet → b-patient-unavailable | **PASS** | no `b-unavailable-sheet` files in round 15; guard list and matrix use the new name |

## Phase D — new states (on the existing templates)

| State | Result | Proof |
|---|---|---|
| Prescribe syrup (ml) | **PASS** rendered, guard clean | `D/round-15/d-syrup_w390.png` |
| Prescribe drops | **PASS** rendered, guard clean | `d-drops_w390.png` |
| Prescribe cream (Apply) | **PASS** rendered, guard clean | `d-cream_w390.png` |
| Every X hours | **PASS** rendered, guard clean | `d-every-x-hours_w390.png` |
| SOS only | **PASS** rendered, guard clean | `d-sos-only_w390.png` |
| Weekly | **PASS** rendered, guard clean | `d-weekly_w390.png` |
| Duration picker open | **FAIL** — 5.3 "Ongoing" clipped at 360; 5.4 chip widths differ | `d-duration-picker_w360.png`; guard `guard-round-15.json` (5.3, 5.4) → NEEDS-APURVA §2 |
| Food chip selected | **PASS** rendered, guard clean | `d-food-selected_w390.png` |
| Injection default (1 · 2 · 3 · Other) | **PASS** | `d-injection-default_w390.png`, proofs `D5` |
| Call did not connect (b-didnt-connect) | **PASS** rendered; reason and question open | `b-didnt-connect_w390.png`, proofs `D3`; NEEDS-APURVA §4 |
| Profile / Logout sheet | **NOT BUILT** — it is not in the Home screen files (`ui-screens/home/`) | NEEDS-APURVA §3 |
| Inhaler form | Not needed as a new render: Salbutamol inhaler exists in `pilot_ha_skipped_customer` (not in the list) | — |

## Phase A — fixes A1–A3

| # | Item | Result | Proof |
|---|---|---|---|
| A1 | Sign-in hero margin 24px at 360 and 390 | **PASS** | proofs `A1 sign-in 360/390` (logo, title, subtitle, field, button all 24px); guard R3 A: 0 |
| A2 | Exact copy and busy labels | **PASS** | proofs `A2` entries: "We couldn't send the code. Try again." · "Sending OTP…" · "We couldn't send a new code. Try again." · "Verifying…" · "Couldn't request a case. Try again." (straight apostrophes, as written in the list) |
| A3 | Focus: no outline on inputs, textareas, script-focused sheets | **PASS** | probes in this round: OTP input `c` outline none; notes textarea none; sheet `sheet-callback` none; guard R1 zero failures A–D |

## Phase B and C — new checks applied (R1–R7)
Phase A passes all new checks. B and C fail R3 only (see check 3).

## New automatic checks

| # | Check | Result |
|---|---|---|
| 1 | Focused input, textarea, script-focused element has no outline | **PASS** (R1: 0 failures) |
| 2 | Toast ≤2 lines and ≥24px from both edges | **PASS** (R2: 0) |
| 3 | Side margin 24px on every top-level heading, paragraph, field, notice, button at 360 and 390 | **FAIL** — 87 failures: B offer points (text after an icon starts at 60px), B unlock greeting (centred, starts at 103–138px), C wheel helper (right-aligned, starts at 205–275px) → NEEDS-APURVA §3 |
| 4 | Help never disabled on the case page | **PASS** (R4: 0) |
| 5 | Side-by-side label + icon + 32px ≤ button width | **PASS** (R5: 0) |
| 6 | Busy labels end with "…" | **PASS** (R6: 0) |
| 7 | No placeholder dash in Prescribe "On prescription" line | **PASS** (R7: 0) |

## Not done (not in the list, or blocked)
- `docs/_superseded/` move of old phase D renders (D-54 #10): not in the fix list, so not done.
- Codex read-only check: optional, not run.
- Native copy: `ui-screens/native/messages.ts` is not regenerated. `build-messages.mjs` writes it, so it was restored byte-for-byte. The new keys (`case.callEndedEarly`, `case.noPickup`, `case.didntConnect`) and the changed copy (A2) are not in the native file → NEEDS-APURVA §5.
