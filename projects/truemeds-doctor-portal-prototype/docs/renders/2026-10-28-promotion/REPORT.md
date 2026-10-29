# Promotion into ui-screens/ — stopped at step 1 (2026-10-28)

**Status: stopped.** The brief says: if something doesn't match the approved pictures, stop and report. Step 1 (one merged case page) does not match. `ui-screens/` is **unchanged** (restored to the approved backup after a test). Steps 2–8 were not started. Nothing published, committed or merged.

## What was done

- **Backup** of the whole `ui-screens/` folder before any change (scratch, `backup-ui/`), restored after the test.
- **Inventory:** entry case file 61 recipes, calling case file 99 recipes; 56 shared. Calling file adds 18 helpers; three shared helpers differ (`MSG`, `TITLE`, `closeCase`).
- **Merge (candidate):** base = entry-pass `case.html`; `MSG`, `TITLE` and `closeCase` taken from the calling file (variable-argument `MSG`, "Health Advisor" spelled out, `closeCase` with `allRx()`); 18 calling helpers added; 35 calling recipes added (t01–t17 incl. t08c, t15b; s7a–s7f; g1, g2, g3b; c-callback, c-callback-error, c-callback-failed, c-skip-ha over the calling screens). Removed: all `b-*`, the old `c-*`, `e-prescription-confirmed`, `e-transferred`, `e-forwarded`, `e-patient-unavailable`. Not added (not in the promotion map): `n1`, `n2`, `n2b`, `n2c`, `n3*`, `a1`, `a1f`, `s2`, `s4`, `g3a`, `t07`. Result: 79 recipe ids, syntax checked (`node --check` OK), relative paths rewritten for the `ui-screens/case/` location (8 refs).
- **Pixel-compare** of all 79 ids at 390 and 360 against the newest picture per id (order: fix-round round-2 → round-1 → margin-16): **116 of 158 identical.**

Candidate files (for review, not promoted): `docs/renders/2026-10-28-promotion/candidate/` — merged file, variant test, comparison JSON, and the merge/compare scripts (they use scratch paths).

## Pixel-compare result

| Group | Ids | Result |
|---|---|---|
| `a-*` (except below) | 13 | identical |
| `a-confirm-busy`, `a-releasing`, `a-rx-viewer` | 3 | differ in small regions (spinner / busy text). **Not investigated** — likely animation timing; unverified |
| `d-*` (all 19 incl. `d-alt-days`, `d-monthly`, `d-inhaler`) | 22 | identical |
| `e-availability-ended`, `e-callback-scheduled` | 2 | identical |
| `s-*` (incl. `s-medicine-disabled`, `s-10-medicines`, `s-optional-empty`) | 3 | identical |
| `a-offline-action` | 1 | identical |
| `c-callback`, `c-callback-error`, `c-callback-failed`, `c-skip-ha` | 4 | **differ over the whole frame** — see stop item 2 |
| Calling `t*`, `s7*`, `g*` | 31 | **differ** (8px horizontal offset from x=8 at the action card, down to the bar) — see stop item 1 |

## Stop items (need a decision)

1. **Calling pictures vs entry case page: two different card markups.** The calling file (which made the approved calling pictures) and the entry-pass file (which made the approved `a-*`, `d-*`, `e-*`, `s-*` pictures) differ in:
   - the live-call card heading: calling `<h2>` reads **"End-of-call script"**; entry reads **"Call"** (`case.html` markup, card above the medicines);
   - calling CSS hides the label inside the script box (`#pcb-label { display:none }`) plus the 7b question and status-card rules.
   A mechanical merge cannot satisfy both. I tested adding the calling CSS to the merged page: the calling pictures still differ, and the approved `a-*`/`d-*`/`e-*` pictures change too (**110 of 158** identical, down from 116). **Decision needed:** which heading and label behaviour is approved for the live call card, and for the ready state. Option: keep two files (case page for `a-*`/`d-*`/`e-*`/`s-*`; calling page for `t*`/`s7*`/`g*`/`c-*`), or make one page with a per-state heading.
2. **`c-*` sheets (D-70 point 4).** The round-2 pictures show the old background (the call card). D-70 point 4 says the callback sheet opens over 7a (Calling) and the Skip HA sheet over 12 (Confirm & transfer), with the old call card no longer behind them. The new render shows the sheet over the calling screen, as D-70 says. So the round-2 pictures are out of date for D-70. **Decision needed:** confirm that the round-2 `c-*` pictures are replaced by the new renders (this is the one difference I believe is intended).
3. **The 8px horizontal offset** in the calling pictures starts at the action card (y ≈ 230 css px) and runs to the bar. I have not isolated its cause; it is part of stop item 1 (same card markup/CSS).
4. **Unverified:** the three small `a-*` differences (item above). Needs a look before promotion.

## Not done (blocked by stop items)

- Step 2: copying the other screens into `ui-screens/` (sign-in, OTP, unlock, offer, home, case-styles). Not copied.
- Step 3: pictures into `ui-screens/` folders; `prescribe/` folder and README. Not done.
- Step 4: retire old pictures and recipes; remove `case.callEndedEarly` from `messages.json` + `metadata.json` and rebuild. **Not done.** The key is still in `messages.json` (the decision says removal happens at promotion, so this must wait).
- Step 5: contact sheets. Not done.
- Step 6: guards update and run. Not done (no guard change made).
- Step 7: `ui-screens/README.md`. Not done.
- Step 8: review page. Not done.

## Other notes for the decision

- The merge kept `e-callback-scheduled` and `e-availability-ended` from the entry file (both identical).
- `g3a-connecting-ha` is in the calling file but not in app-logic's fallback B list (`g1`, `g2`, `g3b`). I left it out. Confirm.
- `t07-result-missing` is superseded by 7b–7f (brief) and left out.

## Files

- Added: `docs/renders/2026-10-28-promotion/REPORT.md`, `candidate/` (merged candidate, variant test, pixel-compare JSON, scripts).
- Changed in `ui-screens/`: **none** (restored to approved).
- Not touched: design system, decision log, backlog, open questions, project truth, `messages.json`.
