# Round 15b — answers to round 15 NEEDS-APURVA (decided by Claude under D-54; Apurva informed)

Execute exactly this, then re-capture and report as before. No git, no deletes. Do not edit `design-system/`, `RULES.md` or the decision log.

## Central changes already made by Claude (verify only)
- `.tm-chip-grid > .tm-chip`: 8px side padding, centred, no wrap — the column sets the size.
- RULES §9.2: one chip size per screen; grids without row labels use the M/A/N column width and start at their label's edge, extra space on the right; **words are free chips, numbers are grid chips**.

## Answers

| # | Your open item | Answer — do this |
|---|---|---|
| 1 | Grid chip sizes vs indent (D6 vs 5.4) | Neither (a) nor (b). Every option grid on Prescribe uses the **same column width as the M/A/N grid** (same chip size, 63px at 360) **and starts at its label's left edge**; the unused width stays empty on the right. In practice: keep the reduced `width` from the local `.ps-section > .ps-grid` rule for every grid, and drop the `margin-left` for grids without row labels. Applies to injection Dose, SOS Dose, Max extra doses, Duration numbers. Check 5.4 then passes as written. |
| 2 | Duration picker clips "Ongoing" | Duration **units** (Days · Weeks · Months · Ongoing) become **free chips** (`.tm-chip-group`, hug the label, wrap) — they are words. Duration **numbers** stay grid chips at the shared size (4 columns, drop `--cols:5`). |
| 7 | Time chips at 360 | Remove the local 8px padding rule on `#callback-time-chips`; the central grid-chip padding now covers it. Pass: "10:00 AM" and "12:00 PM" on one line at 360 with no clipping. |
| 3 | Profile / Logout sheet | Skip this round. It will be rendered when `index.html` is rebuilt (logged as open). Remove it from this round's coverage list. |
| 4 | "Call didn't connect" | Use the existing app path for a call that doesn't connect: `simWebhook('hold')` (app.js treats `hold` like a missed call: the case stays open). Re-render `b-didnt-connect` on that path: missed-call sheet as for no pickup, and the warning notice "Call didn't connect." in the bar behind it. Do not use `switched_off`. |
| 5 | Native copy | Stays open for the native owner. No action. |
| 6 | Old renders | Already moved by Claude to `docs/_superseded/` (README there). No action. |
| R3 | Side-margin check: 87 failures in B and C | The check is too strict, not the screens. Measure the **left edge of the block's container** (row, card, notice, field, button), not where text starts inside it. Exempt text inside a row that starts with an icon (offer reassurances), centred text (unlock "Ready when you are") and right-aligned text (wheel "Minimum 15 minutes"). Re-run; the remaining failures, if any, are real — report them. |

## Output
- Round 16: re-capture only the affected states (all Prescribe states, c-callback*, b-didnt-connect) at 390 / 360 (+430 checks), and run the full guard on all phases.
- Refresh `final/` and contact sheets when the guard is clean.
- Append a "Round 15b" section to `round-15-report.md`: each answer above → PASS / FAIL + proof. NEEDS-APURVA only for something that truly needs a product decision.
