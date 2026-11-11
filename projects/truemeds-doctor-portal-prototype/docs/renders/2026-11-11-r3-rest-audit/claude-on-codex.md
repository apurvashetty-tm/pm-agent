# Claude on Codex's review (codex-review.md), point by point

Context: Codex reviewed the first facts.md. Two measurement gaps were closed after it (tall layout in the record; medicines / notes sections measured inside), which added Notes field → "Doctor notes" 17.6 (46 states) and section title → content 18.5 / 20. Codex's G-numbers refer to the old file.

| Codex | Verdict | Reason |
|---|---|---|
| C1 Order details 8 → 16 | **Partly** | Measured 8 (a-order-details). The details are the disclosure's own content, so 8 is defensible under "joins parts of one thing"; I also lean 16 for legibility. Stays **needs Apurva** (my K7). |
| C2 header name → meta 8 | **Agree** | 17.1 measured on every case state; title → first meta joins at 8 (same as title → subtitle). Meta → meta 6.5 is line spacing of one block, no change. Header component, central fix. |
| C3 status tags 12 → 14 | **Partly** | RULES §8.1 contradicts itself here (tags 12 allowed; status the doctor acts on ≥ 14). Approved 12 since D-54. That's Apurva's call, not a drift fix → **needs Apurva**. |
| C4 script heading → script 8 | **Disagree on value** | Agree the checker's 32 is wrong (the script box is the card's body). But "Medicines to prescribe" → rows (18.5) and "Notes & symptoms" → first label (20) are the same relation; all three should share one value, and a title → its group's content is 16 (items in one group), not 8 (8 joins a label to its single control). Disputed. |
| C5 bars 30.7 → 16, 26.5 → 8 | **Agree** | s7b and g2, both widths. |
| C6 toast medium + 8 above the bar | **Partly** | Offset: **agree, verified** — `case.css:56` puts `.case-toast` at bar top + 8 (`--tm-space-sm`), §9.5 says bar height + 16; and its side inset is `--tm-space-xl`, not the 16 page margin. Drift fix. Weight 500: it's the shared `.tm-toast`, so if it changes it changes centrally for Home too; no case-page fix. |
| C7 availability ended needs a reason | **Agree** | e-availability-ended shows only Back to Home. Needs Apurva (copy). |
| C8 field groups 29.6 / 24.9 → 32 | **Agree** | |
| C9 helpers → 8 (SOS 27.6, Every-X 13.6, Printed on the prescription 13.6) | **Agree** | The last is on 20 Prescribe states (seen only in the tall record). |
| C10 errors: dose 9.6 ok, other 13.6 → 8, disabled notice 16 → 32 | **Agree** | Also d-disabled header 3.7 (real). |
| C11 duration anatomy | **Agree** | Same numbers (0 left inset, 12.9, 8 between groups). Codex reads "Default" 1.6 under the value as drift → 8. I read value + "Default" as one two-line value (14/20 + 14/20 stacked, no gap by design). Minor; disputed. |
| C12 callback Date → Time 32, error 8, failed notice into actions | **Agree** | All three. |
| C13 subtitles fine; callback busy needs "…" | **Agree** | `busyBtn(MSG("callback.confirm"))` — label unchanged while busy. New string needed. |
| C14 callback 3 columns | **Agree** | Needs Apurva (listed anatomy). |
| C15 Rx viewer: 34.1 → 8, hint 4.9 → 8, title 16 → 20 | **Partly** | Hint → paper: agree (drift fix). Title row → tools row 34.1 is the viewer header's two-row anatomy, not stacked buttons; no change. Title size: needs Apurva. |
| C16 Profile lacks the count | **Agree** | Needs Apurva. |
| C17 earnings 7 → 4; rows → Log out 32 | **Agree** | |
| C18 calling-flow page needs its own standard | **Disagree** | It is an internal desktop reference diagram, never shown to doctors; giving it a standard is work with no doctor-visible gain. No change; keep it out of the fix run. |
| C19 "Counselled in an earlier order" → "earlier case" | **Disagree** | "Earlier order" is the customer's earlier order (counselling happened when they last ordered), explicitly approved wording (RULINGS 2026-11-10 07:58, H23). No change. |
| Artefacts | **Agree** | Title/subtitle beside a taller unit, −0.4 beside Disable, toggle inside a 48 label. |
| Duration: p1, Weeks add 12, Months 9 instead of 4 | **Partly** | Agree p1. Weeks 12 ≈ 3 months (redundant with Months 3); Months 9 is rare; Months 4 is rare too. Compromise to put to Apurva: Weeks 1 · 2 · 3 · 4 / 6 · 8, Months 1 · 2 · 3 · 6 / 12 (5). |

## Codex points I missed
- Toast offset / side inset (C6) — added as a drift fix.
- Callback busy label (C13) — already in my K24.

## Still disputed (for the final pass)
1. Section title → its content: 16 (Claude) vs 8 (Codex), applied to script, medicines and notes alike.
2. Duration value → "Default"/"Changed" line: one two-line value (Claude) vs 8 apart (Codex).
3. Duration sets for Weeks / Months (above).
4. Calling-flow page: no change (Claude) vs its own standard (Codex).
5. "Counselled in an earlier order": approved (Claude) vs "earlier case" (Codex).
6. Rx viewer header title → tools 34.1: anatomy (Claude) vs drift to 8 (Codex).
