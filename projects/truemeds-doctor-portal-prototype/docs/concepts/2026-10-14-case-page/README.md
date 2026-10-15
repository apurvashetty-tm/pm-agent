> **REJECTED — invented content; see v2/.** The first round invented sections (Allergies, Previous visits, Patient details) and an in-call Prescribe button, and dropped the real medicines controls, Call card, script, Schedule Callback and Skip HA. Do not build from it.

# Case page — concepts (D-48, D-49, D-50)

Status: **CONCEPT — Reviewed — yet to be approved by Apurva.** Not wired to `index.html` or any consultation logic. Build only after approval (D-49 process). Mock content is labelled `[MOCK ASSUMPTION]`.

Source: `concept.html` (`?s=<state>`, `&w=360` for the 360-wide check). Renders: 390×844 @2x and 360 wide, one PNG per state. Contact sheet: `contact-sheet.png` (390 only). Metrics: `metrics.json`.

## States
| ID | File (390) | What it shows | Decision |
|---|---|---|---|
| a | `case-top` | Compact tinted sticky header: Back, patient name 20/28, meta line "54 · Female · Order 12345 · ₹1,240", Help. Content on white. | D-49 |
| b | `case-scrolled` | Same header, content scrolled. Header height unchanged, D-07 strip gone. | D-49 (no-jump) |
| c | `case-leave-sheet` | "Leave this case?" · "It goes back to the queue for another doctor." · Release case · Stay on this case. Back before the first attempted call. | D-48 |
| d | `case-releasing` | Release case busy: brand fill, white label and spinner (L2). Stay disabled. | D-48, L2 |
| e | `case-on-call` | Call under way: Back hidden, Help kept, "On call" row. | D-48 |
| f | `case-back-blocked` | Back gesture during a call: calm neutral notice "Finish this case first. Then you can go back to Home." Not an error style. | D-48 |
| g | `case-post-gate` | Final CTA, transfer journey: Confirm & transfer + Skip HA call. | D-50 |
| g2 | `case-post-gate-cat4` | Final CTA, Cat4 / HA skipped: Confirm prescription. | D-50 |
| g3 | `case-post-gate-forward` | Final CTA, forward journey: Confirm & forward + Skip HA call. | D-50 |
| h | `case-closed` | Case closed: Request next case (primary) + Back to Home (secondary). Back visible. | D-48 |
| i | `case-closed-availability-ended` | Availability ended during the case: only Back to Home. | D-48 |

## Checks
- Metrics: no contrast failures on non-disabled text, no overflow, no console errors (390 and 360).
- Codex (one check, read-only): **BLOCKERS: none.**

## Open points for Apurva
1. **"Prescribe" during a call** (`case-on-call`, `case-back-blocked`) can read like the final action. Codex suggests a clearer label for the in-call action. This is a consultation CTA, so I have not changed it. Options: keep "Prescribe", or rename it in the in-call phase only (needs a decision before any CTA change).
2. **Phone back gesture after closing** (`case-closed`, `case-closed-availability-ended`): assumed to go straight to Home, same as the header Back. Confirm for native.
3. **Mock content**: medicines, notes, call line, "Call patient" and Help are placeholders. The real case content comes from `index.html` when built.
4. **Final CTA routing**: the three final labels are shown for the three journeys. Which one a case gets is the routing matrix in `project_truth.md` §5, unchanged.
5. **Release backend** (OQ-024) and restoring an open case after reopening (OQ-025) are not represented in the UI; the concept assumes both.
