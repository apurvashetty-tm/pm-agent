# Round 4 — expected list (written before the after-r4 render)

Baseline = `ui-screens/` (Round 3 promoted pictures). Render = `after-r4/` at 390 and 360, same capture settings as Round 3. Any picture not on this list that differs = unexpected, explained or failed.

## Expected to change — by family

| Family | Pictures (states) | Why (item / lane request / audit id) |
|---|---|---|
| `sign-in/` (12) | all | Logo 174 → 166 (A-07, lane-request 1); keyboard blank and ⌫ keys white in keyboard states (A-15, lane-request 3); notice 8 under field (A-14) in notice states |
| `otp/` (17) | all | Logo 174 → 166 (A-07); terms line centred and "Terms & Conditions" kept together (item 4, A-01, A-02); resend row 48 px in wait / link states (A-03); subtitle 14/20 (A-04); notice 8 under boxes (A-14); non-breaking spaces in three messages (A-17) |
| `faster-signin-offer/` (6) | all | Logo 166 (A-07); pinned `.tm-actionbar` footer, panel scrolls above it (item 1); "Couldn't turn on…" and offline notices inside the bar (item 2 / lane-request 7, A-19); screen-lock subtitle one line (A-06); header-to-panel 32 (A-05) |
| `returning-unlock/` (7) | all | Logo 166 (A-07); pinned action bar (item 1); "isn't available" stays at the top of the panel (item 2); header-to-panel 32 (A-05) |
| `home/` (22) | all | Logo 166 (A-07); pinned `.tm-actionbar` on every state with bottom buttons (item 1); offline and no-cases notices moved into the bar (lane-request 7); toast above the bar; "Prescriptions today" 14 grey (A-10); Profile gaps 16 and label 16 semibold (A-13, A-20); add-time sheet error gaps (A-12); notice band (item 3); busy spinner gap (A-08) |
| `case/` (case page, 59 incl. sheets) | expected: every state with a stacked card (B-05 gap 16, B-03/B-04 script and outcome card padding); every state with a bar notice (A-19, item 3 band); every busy state (B-01, B-02 keep the bar row; A-08 spinner gap); sheets with labels (B-14); empty case (B-16, B-17); Rx-failed notice (B-19); back-blocked toast (B-21); callback / unavailable cards (B-22); Other-dose error (B-18); medicine titles (B-13) | Audit B and A items above; `syncCaseActionBar` now reserves the bar height on mobile (scroll end only, no top-of-page change) |
| `prescribe/` (23 `d-*`) | expected: every state with a card stack (B-05); dose grids (B-08 single-row grids at M/A/N width, B-24 letters on label edge); "(optional)" grey regular (B-10); "On prescription" number+unit kept together (B-12); `d-notes-keyboard` and `d-error-other` (B-18: text keyboard for notes, number pad with decimal key for Other); Rx-failed notice 16 (B-19) | Audit B items; lane-request 4 reverts "(ml)" / "(puffs)" / plain "Dose" headings to Round 3 wording, so `d-syrup`, `d-inhaler`, `d-injection-default` headings are expected to match Round 3 |

## Expected unchanged (predicted)

- `prescribe/` syrup and inhaler headings (lane-request 4 reverted them; Round 3 wording).
- Any `case/` or `prescribe/` picture where no card, notice, label, grid or keyboard is on screen (none predicted; checked in the compare).

## Probes required for each item

Probe results are in `REPORT.md` under Round 4 (scratchpad probes; numbers quoted there).

## Not changed on purpose (recorded in the audit)

A-18, B-23, B-25, A-23 … A-25, B-26, B-27: no picture change. B-09 duration chip inset: not applied (lane-request 6, D-55 #1). B-06 header: no change (lane C).
