# Claude review — r3-rest-audit (independent of codex-review.md)

Evidence: `facts.md` (85 gap groups: 43 real, 27 list-row anatomy, 15 checker artefacts), `visible-gaps/` (172 captures, 86 states × 390 × 844 and 360 × 640), `duration/`. Checked against RULES §8.3, "Entry and home screens", §9, D-106–D-109. Tags: **drift fix** (rule is clear, the screen is off) · **needs Apurva** (rule unclear or a product/copy choice) · **no change**.

Measurement notes (for whoever reruns this): (1) Prescribe's body sits in an `overflow: hidden` ancestor, so below-the-fold content is clipped at the real viewport; the record is the union of the real and the tall (same width, full height) layouts. (2) The medicines and notes sections are painted blocks without `.tm-card`; they are measured as cards. (3) Inside a card, D-108's "cards stacked 16" pair would match every pair (each element's `closest('.tm-card')` is the card), so it is dropped there.

## Case page (incl. calling, outcomes, closed)

**K1 · Notes: two fields only 17.6 apart (G2 / G24, 46 states).** Chief complaints field → "Doctor notes" label is 17.6 visible. D-108: field group → next thing **32**. **Drift fix.** (Adds ~14 px to a section that already scrolls; still worth it, the two fields read as one block today.)

**K2 · Section title → first content is 18.5 / 20 / 14.5 (G5 / G1 / G10, ~60 states).** "Medicines to prescribe" → first row 18.5; "Notes & symptoms" → first label 20; "End-of-call script" → script box 14.5. A card title and its content are one thing in one group: one value everywhere. I read it as **16** (items in one group; Home's card has no title to compare). The checker's "32 to a notice" for the script is the wrong pair — the script box is the section's body, not a message. **Drift fix** to one value (16; trim the 16/24 title's half-leading as r2 did).

**K3 · Medicine list rows: 0 / 12 (27 groups) — no change.** Each row paints its hairline, so rows touch; it is RULES card-row anatomy (padding 16 + hairline). Row title → "Qty" line (8.5) and → tag (2.9) are checker artefacts (tag beside the line).

**K4 · Bar: "Are you still on the call?" → Still talking / Call ended 30.7 (G39, s7b).** Bar notice → its buttons is **16** anatomy. **Drift fix.** It is a question to answer, so it should look like the bar notice band (as on Home), centred, 16 above the pair.

**K5 · Bar: "Checking for a Health Advisor…" → Skip HA 26.5 (G40, g2).** A status line in the bar is a caption: **8** above its button. The excess comes from the status slot reserving a button height. **Drift fix.**

**K6 · Header: name → "54 · Male" 17.1, meta → meta 6.5 (all case states, passes).** The compact task header is not the band, so the band spec does not apply (say so in RULES). Still, title → its first meta line should join at **8** (as title → subtitle everywhere else, incl. the sheet header D-109); meta → meta is two lines of one block (6.5 ≈ line spacing) — fine. **Drift fix** (header component, central).

**K7 · Order details expanded: tools row → details 8 (a-order-details).** The details are the disclosure's own content (the row opens them) — a part of one thing, so 8 is defensible. But they read as new rows inside the card. **Needs Apurva** (8 = "part of the Order details row" vs 16 = "rows in a group"); I lean 16 for legibility.

**K8 · Status tags 12/600 (Prescribed / Pending / Disabled, all case states).** RULES §8.1 allows 12 for tags *and* says status the doctor acts on is ≥ 14. The two lines conflict for exactly this tag. Approved since D-54. **Needs Apurva** (keep 12 as tag anatomy, or 14).

**K9 · Back-blocked toast 14/500 (a-back-blocked).** The toast is a design-system component (also used on Home). "Medium is not used below the band" is an entry/Home standard; the toast spec says 14/20, no weight. **No change in this round** — if the weight changes it changes centrally for every toast. Note for the design-system list.

**K10 · Availability ended mid-case (e-availability-ended).** The closed case shows only "Back to Home" (app-logic: Request next case is dropped). Nothing tells the doctor why. Home now always offers Add time (D-106), so the fix is a reason, not a control: a bar caption "Your availability has ended." 8 above Back to Home. **Needs Apurva** (copy + yes/no).

## Prescribe (all medicine forms)

**K11 · Field → its helper 13.6 (G45, 20 states; G53 "Use numbers only" 13.6).** "Printed on the prescription." and the Other-dose error sit 13.6 under their field; D-108 field ↔ helper **8**. The same `.tm-field__helper` was trimmed on sign-in in r2; extending that trim app-wide fixes both. **Drift fix** (mechanical).

**K12 · Field groups inside the schedule card 29.6 (G47 / G54 / G57 / G58 / G60 / G62; G59 24.9).** How often → Dose / Every; dose → Max doses; SOS helper → its dose settings. These are different field groups: **32**. 29.6 is just outside ±2 (half-leading again). **Drift fix**; low visibility.

**K13 · SOS toggle → its helper 27.6 (G46, 18 states).** The helper explains the toggle — one thing: **8**. Today it floats halfway between. **Drift fix**, visible.

**K14 · "Every X hours" chips → "4 times a day, round the clock" 13.6 (G55).** A read-out of the chosen chip = its helper: **8**. **Drift fix.**

**K15 · Disabled notice → schedule card 16 (G51, d-disabled).** A whole-screen notice → next thing **32**. **Drift fix.** Also d-disabled header title → form 3.7 (G50, real, other forms 7.1): **drift fix** to the edit-header's own value (8).

**K16 · Edit header −0.4 / 7.1 (G48–G61, G81–G84).** Checker artefacts: long names wrap beside the Disable button, and the subtitle reads as overlapping the button's row. No change.

**K17 · Dose error 9.6 under the grid (d-error-dose).** A field error under its control: 8 — passes. No change.

**K18 · Duration picker (Apurva: "margins are non-existent").** Measured today (`duration/today_*.png`, measure.json): the open panel's chips sit **0 px from the field's left border** (B-09 inset pulls the grid 12 left; the right side keeps ~12–40), value → first chip row **12.9**, numbers → units **8** (two different groups joined like one), units wrap so "Ongoing" sits alone on a row at both widths. **Drift fix:** chips start on the value text's edge (12 inside the border), value → chips 16, numbers ↔ units 16. Options: see Duration proposal.

**K19 · SOS toggle 36 × 20 and Other-dose inputs 46 tall.** The toggle's label row is the 48 target (passes); the 46 inputs sit inside a 48+ control. No change.

## Sheets

**K20 · Header → content: 33.1 without a subtitle, ~15–17 with one.** Callback, Disable, Mark unavailable, Skip HA (no subtitle): title → first label 33.1 visible. Leave / Discard (subtitle) and Home's sheets: subtitle → content ~17. RULES says header → content 16 (box). Measured visibly, the no-subtitle sheets look twice as loose. **Drift fix** to 16 visible on every sheet (needs the sheet header's bottom padding trimmed centrally); flag to Apurva only if the box reading was meant.

**K21 · Callback: Date chips → "Time" 21.6 (G68, 4 states).** Two field groups: **32**. **Drift fix.**

**K22 · Callback: failed / refused notice 24 under the grid, in the content (G69).** A result notice belongs in the pinned actions, 16 above Confirm (§9.4, §9.5, and how Home's add-time error was moved in r2). **Drift fix.**

**K23 · Callback: "Pick a date and a time." 13.6 under the grid (G70).** Field error → 8. **Drift fix.**

**K24 · Callback busy button keeps "Confirm callback" + spinner.** §9.1: busy labels end with "…". Needs a new string ("Scheduling…"). **Drift fix**, copy for Apurva to see.

**K25 · Callback time slots on 3 columns.** §9.2 says numeric grids are 4 columns; "10:00 AM" does not fit 4 columns at 360 with 8 side padding. Keep 3 as listed anatomy. **Needs Apurva** (one line in RULES).

**K26 · Sheet subtitles (D-109).** Leave this case / Discard changes use the header subtitle; "Select reason" in Disable / Unavailable / Skip HA is a body label (8 → options, passes). No change.

## Rx viewer

**K27 · Hint → paper 4.9 (G67).** Two different things nearly touching: **16** (or 8). **Drift fix.**
**K28 · Viewer header: title row → tools row 34.1 (G66).** The viewer header is a two-row component (title, then tools) — anatomy, not the band; the checker's "buttons 8" pair does not apply. **No change**, but list it as anatomy in RULES. Title is 16/24 while every other task title is 20/28 — **needs Apurva** (low).

## Profile

**K29 · D-106 indirect: Home's "Prescriptions written today" opens Profile, which doesn't show that count.** Profile shows Today's earnings (Earned ₹60.00 · Incentive ₹0.00) only. The tap lands on a different number. **Needs Apurva:** add "Prescriptions written today" to the earnings card (same row anatomy as Home: grey icon · 16/24 label · L9 value), or change Home's chevron target.
**K30 · Earnings label → amount 7 (G63).** Value label → value is 4 anatomy (RULES); 7 matches neither. If the card stays, **drift fix** to 4; if it becomes Home rows (K29), it goes away.
**K31 · Rows card → Log out 16, → blocked notice 16 (G64 / G65).** Different thing → button / notice: **32**. **Drift fix.**
**K32 · Profile header.** Tinted task header, title 20/28, Back — consistent with the case header (compact, no meta). No change.

## Vocabulary (D-109; messages.json strings used on these screens)
- **"Couldn't schedule the callback. Your time is kept."** — D-109 makes "time" the *length* of availability; here it means the chosen slot. **Needs Apurva:** "Your chosen time is kept."
- "Counselled in an earlier order", "No medicines on this order", "track your order", "Order details", order ID line — the customer's order (approved, RULINGS 2026-11-10 H23). No change.
- "Request next case" (case) vs "Request a case" (Home) — both "case"; locked CTA labels. No change.
- "Faster sign-in" on Profile — matches. No "code", "shift", "session", "slot" or "receive" anywhere. "Skip HA" is the locked D-50 label.

## Task headers
Case (compact, tinted, Back / ?), Profile (tinted, Back), Prescribe (edit header, white, ✕, subtitle, Disable), Rx (viewer, dark, ✕, tools) are each their RULES §8.5 type; the band spec applies to none of them. Only gaps: K6 (title → meta 8) and K28 (viewer title size).

## Calling-flow page
Desktop reference diagram (`calling-flow/`), not a doctor-facing screen; mobile rules don't apply. Its wording follows app-logic. **No change** (keep it out of the fix run).

## Duration proposal (Prescribe)
Doctors write durations as a number + unit; the numbers that matter differ by unit. Acute courses in India: 3 / 5 / 7 days (antibiotics, analgesics, antihistamines), 10 / 14 days (H. pylori, longer antibiotic courses), **15 days** (very common for PPIs, vitamins, "review after 15 days"); 1 / 2 days for single-dose or fever cover. Weeks: 1 / 2 / 3 / 4 / 6 / 8 (steroid tapers, short trials, 6–8-week PPI or iron courses). Months: 1 / 2 / 3 / 6 / 12 (chronic refills; 6 months is today's Ongoing default; 12 for annual review). Ongoing stays.

**Recommended — P1, unit first, numbers by unit (≤ 8 per unit = two rows of 4, 8 gaps, §9.2):**
- Days: 1 · 2 · 3 · 5 / 7 · 10 · 14 · 15
- Weeks: 1 · 2 · 3 · 4 / 6 · 8
- Months: 1 · 2 · 3 · 4 / 6 · 12
- Ongoing (6 months) — unchanged.

Twelve distinct numbers in all, never more than 8 on screen (today: 10 numbers in 3 rows + 4 units). Rendered: `duration/p1-days|weeks|months_w*.png`, compared in `duration/duration-proposal_w360.png` / `_w390.png`, with K18's inset and gaps applied. Alternative P2 (one fixed list 1 · 2 · 3 · 5 / 7 · 10 · 14 · 15, units after) is simpler but loses 4 / 6 / 12 for weeks and months — 6 months is the default, so P2 doesn't work as drawn.
Behaviour to decide with it: switching unit keeps the number if it exists in the new set, otherwise clears it.

## Needs Apurva (yes / no)
1. Duration: approve P1 (unit first, numbers by unit as above)?
2. Profile: add "Prescriptions written today" to Profile so Home's row lands on its own number?
3. Closed case after availability ended: add "Your availability has ended." above Back to Home?
4. Status tags stay 12 (tag anatomy), not 14?
5. Order details content 16 below its row (not 8)?
6. Callback times stay 3 columns (listed anatomy)?
7. Callback copy: "Your chosen time is kept." and busy "Scheduling…"?
8. Rx viewer title stays 16 (viewer header anatomy)?
