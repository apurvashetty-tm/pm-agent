# Full audit — phases A–D (final renders, 2026-10-15)

Done by Claude, screen by screen at full size, 360 and 390 side by side, all 104 states (A 29 · B 10 · C 19 · D 46), against the standards checklist and decisions D-42 to D-53 plus today's locks. Renders audited: `docs/renders/2026-10-15-standards/{A,B,C,D}/final/`. Evidence: `docs/renders/2026-10-15-standards/D/options-case-bar/audit-evidence.png`.

Locked today (Apurva): case bar after the HA question = primary + 📅 **Callback** | ⏭ **Skip HA** side by side with icons; the same 📅 Callback replaces "Schedule callback" in the on-call and call-ended-early bars (sheet title stays "Schedule callback"). Medicine rows on the case page: line 1 name (full width), line 2 **Qty** (14px semibold) left + status tag right; no dose or duration on the case page. Injection dose: 1 · 2 · 3 · Other.

## 1. Shared faults — fix once in the design system, every screen gets it

| # | Fault | Where | Rule broken |
|---|---|---|---|
| 1.1 | **Focus ring regression.** Today's central focus rule outlines inputs and focused sheets: a blue rectangle around the OTP boxes; a blue line along the top of every bottom sheet; a square blue ring inside focused text fields | All 17 OTP states; every sheet (Leave case, Releasing, Add availability, End availability…); notes, additional instructions, dose in units | D-44 "no blue focus box" on wrong code; D-51 "stray blue outline on bottom sheets removed" |
| 1.2 | Medicine rows squeezed: name gets ~75px at 360, rows run 5–7 lines | Every case-page and closed-case state | Fixed by today's row lock |
| 1.3 | Side-by-side buttons spill at 390 ("Schedule callback" touches the edges) | Post-gate transfer and forward | Fixed by today's bar lock |
| 1.4 | Chip groups indented from their label | Injection dose, SOS dose, Max extra doses | Alignment, 24px margin |
| 1.5 | Confirmation sheets use four different button patterns: Leave case = primary + quiet · End availability = red outline + quiet · Discard changes = secondary + red outline · Missed call = primary + red outline | C, D sheets | One sheet template (D-52) — needs one confirm rule |
| 1.6 | Offline shown two ways: yellow warning on sign-in, OTP, Home; grey neutral on the case page | A, C, D | One message per cause, consistent pattern |
| 1.7 | Error copy: "Please try again." (sign-in couldn't send, OTP resend failed, Home request failed) vs "Try again." everywhere else | A, C | Copy consistency (needs Apurva — approved copy) |
| 1.8 | Busy labels: "Verifying" and "Sending OTP" have no "…"; every other busy label does | A | Copy consistency |

## 2. Screen faults

| # | Phase | State | Fault |
|---|---|---|---|
| 2.1 | A | Sign-in, all states, 360 only | Logo, title and subtitle sit at 16px from the edge; the field below sits at 24 (390 is correct) |
| 2.2 | B | Offer (fingerprint), 360 | Subtitle and first reassurance leave "OTP." alone on the last line |
| 2.3 | C | Expired-pending | "Time remaining 0:00" under "Your availability has ended" — same redundancy D-47 removed from stop-pending (needs Apurva) |
| 2.4 | D | Back blocked, 360 | Toast wraps to two lines and runs edge to edge (rule: one line) |
| 2.5 | D | Confirm busy | Help icon greyed out — D-48: Help available at every stage |
| 2.6 | D | Callback sheet, nothing picked | "Pick a date and a time." is bare red text with the icon touching it; the failure in the same sheet uses a notice. One style |
| 2.7 | D | Prescribe, Other dose invalid | "On prescription" line shows "— units once a month" |
| 2.8 | D | Rx viewer | Paper says "1 injection once a month"; the case says "1 dose once a month" (mock data) |
| 2.9 | D | Closed case | Order details / View Rx card is taller than on the live case |
| 2.10 | D | No order details (s-optional-empty) | View Rx sits alone on the left of an empty card |
| 2.11 | D | Call ended early | Why the call ended is only in the Call card further down; nothing above the fold says it (needs Apurva) |
| 2.12 | D | Prescribe SOS on, 360 | "On prescription" line leaves "months" alone on line 2 |
| 2.13 | D | b-unavailable-sheet | File shows the Patient unavailable ending, not a sheet (rename) |

## 3. Not rendered at all (coverage gaps)
- Profile / Logout sheet (D-52 lists it on the sheet template).
- Prescribe for other forms: syrup (ml), drops, inhaler, cream (Apply / —); Every X hours, SOS only, Weekly controls; Duration picker open; food chip selected.

## 4. Housekeeping
- Three folders of phase D screens look final (`2026-10-14-layout-v2/D/final`, `concepts/…/v2/full`, `2026-10-15-standards/D/final`). Only the last is current; move the others to `_superseded/` (needs Apurva's OK).

## Checked and passing
OTP locked specs (56×56 boxes, 24px digits, centred helper), consent and resend lines per D-44, locked and expired-limited treatment, titles balanced with no full stops, home-base vs task headers (D-42), no Back on offer and unlock, unlock notice neutral, Home wheel band (D-40), 1:00:00 timer, stop-pending without time row and "Ending…" without spinner, compact case header with Back by stage, End call solid red, confirm-failed and offline notices in the bar, status cards and titles, Back to Home primary only when availability ended, closed rows read-only, sheet titles, Disable sheet title, Rx viewer tools on their own row.
