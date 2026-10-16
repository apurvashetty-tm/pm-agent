# Round 17 report (docs/reviews/2026-10-15-round-17-fixes.md)

Status: **Reviewed — yet to be approved by Apurva.** Nothing promoted; `index.html`, `design-system/`, `RULES.md`, the decision log and `ui-screens/native/` not edited; no git; no deletes.

Captures: **round 17, Phase D** (all 56 states at 390 and 360, reviewed; 430 by guard). The full guard ran on all phases.
Full guard, round 17: **0 failures** across A, B, C, D (114 states × 390 / 360 / 430). Coverage (8.1) passes.

| # | Fix | Result | Proof |
|---|---|---|---|
| R17-1 | Call card: moves above the medicines only while the call is live (`connected`) or after the HA question (`gate_passed`); hidden when it has nothing visible besides its title | **PASS** | `round-17-proofs/proofs.json` → `R17-1 b-ended-early` (display none, no empty card), `R17-1 b-ended-early bar notice` ("Call ended before 50 seconds."), `R17-1 b-on-call`, `R17-1 b-post-gate-cat4 / -forward / -transfer` (script card first), `R17-1 a-top` (original order, script shown). Pictures: `D/round-17/contact-call.png`, `b-ended-early_w360.png` |
| R17-2 | Duration units as a wrapping `.tm-chip-group`; numbers in a 4-column grid at the shared chip size, from the label edge; guard 5.3 and 5.4 clear at 360 / 390 / 430 | **PASS** | `R17-2 d-duration-picker 360 / 390`: units Days · Weeks · Months · Ongoing (`flexWrap: wrap`), numbers 4 columns, chip 55px at 360 and 63px at 390 (same as the other option grids on the screen), no clipped chips. Guard: 0 failures at all three widths. Picture: `d-duration-picker_w360.png` |
| R17-3 | Open picker scrolled into view before capture | **PASS** | `R17-3 d-duration-picker 360 / 390 in view`: panel 309–585px, inside the 844px viewport. Picture: `d-duration-picker_w360.png` shows number grid and unit chips |
| R17-4 | Local time-chip padding rule removed; central grid chip (8px sides) used | **PASS** | `R17-4 local padding rule present` → 8px (central value; the local rule is gone from the concept). `R17-4 c-callback 360 / 390 time chips`: all time labels 48px high, one line, none clipped ("10:00 AM", "12:00 PM" included). Guard 5.3 clear |

## Stale finals
- `D/final/b-unavailable-sheet_*` already moved to `docs/_superseded/2026-10-15-stale-finals/` (done before this round). `D/final/` now holds only round-17 renders (56 states at 390 and 360) with contact sheets; guard copy in `D/final/guard.json`.

## Still open (not in this round)
- Native copy (`ui-screens/native/messages.ts`): owned by the native team (D-55 #6).
