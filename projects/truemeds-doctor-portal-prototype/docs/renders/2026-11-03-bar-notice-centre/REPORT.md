# REPORT — Bar notice centred (D-86)

Brief: `BRIEF.md` in this folder. Branch `project/truemeds-doctor-portal-prototype`, work folder `~/src/pm-agent/.work/truemeds-doctor-portal-prototype`. No commits, pushes or PRs.

## Step 1 — Expected list (written before any change)

Before-render: `before/` (all 149 states rendered at 390 and 360 by `../2026-11-03-calling-round/capture-method-cap.py`; 298 pictures, 0 page errors, `capture-log.json`).

DOM probe: `probe-band.py` → `band-probe.json`. It looks for a visible `.tm-actionbar > .tm-notice` in every state of `ui-screens/feedback/check-locked-specs.py` `EXPECTED`, at 390 and 360.

Result: **28 states showing a band, at both widths = 56 pictures expected to change.** Every one is listed below; file names are in `expected-files.txt`.

Expected pictures (the band is the only change; band heights are before, in px):

| # | State (390 + 360) | Band text (390) | Band height 390 / 360 (px) |
|---|---|---|---|
| 1 | `case/a-confirm-failed` | Couldn’t confirm. Nothing was lost. | 45 / 45 |
| 2 | `case/a-offline` | You’re offline. Reconnect to call or confirm. | 45 / 45 |
| 3 | `case/a-offline-action` | No connection. Nothing was lost. | 45 / 45 |
| 4 | `case/a-release-failed` | Couldn’t release this case. You’re still on it. | 45 / 45 |
| 5 | `case/c-callback` | Call too short to write a prescription. | 45 / 45 |
| 6 | `case/c-callback-error` | Call too short to write a prescription. | 45 / 45 |
| 7 | `case/c-callback-failed` | Call too short to write a prescription. | 45 / 45 |
| 8 | `case/c-callback-refused` | Call too short to write a prescription. | 45 / 45 |
| 9 | `case/s7b-still-on-call` | Are you still on the call? | 45 / 45 |
| 10 | `case/s7c-checking` | Are you still on the call? | 45 / 45 |
| 11 | `case/s7d-result-missing` | Couldn’t get the call result. | 45 / 45 |
| 12 | `case/s7d-result-missing-pilot` | Couldn’t get the call result. | 45 / 45 |
| 13 | `case/s7d-unavailable-sheet` | Couldn’t get the call result. | 45 / 45 |
| 14 | `case/t03-not-through` | Call didn’t go through. | 45 / 45 |
| 15 | `case/t04-doctor-missed` | You didn’t answer the call. | 45 / 45 |
| 16 | `case/t06-ended-early` | Call too short to write a prescription. | 45 / 45 |
| 17 | `case/t08c-confirm-blocked` | Prescribe or disable 4 medicines first. | 45 / 45 |
| 18 | `case/t16-transfer-missed` | You ended the call before the transfer. Next time, stay on the line until the He | 85 / 85 |
| 19 | `case/t16b-transfer-missed-patient` | The patient ended the call before the transfer. The Health Advisor will call the | 65 / 65 |
| 20 | `case/t16c-transfer-missed-unknown` | The call ended before the transfer. The Health Advisor will call the patient bac | 65 / 65 |
| 21 | `case/t17-skip-ha-wait` | Health Advisor call will be skipped. End the call when you’re done. | 65 / 65 |
| 22 | `home/near-expiry` | Availability ends soon. You can still request a case. | 45 / 65 |
| 23 | `home/no-cases` | No cases right now. Try again in a minute. | 45 / 45 |
| 24 | `home/offline` | You’re offline. Reconnect to request a case. | 45 / 45 |
| 25 | `home/request-failed` | Couldn’t request a case. | 45 / 45 |
| 26 | `home/setup-failed` | Couldn’t set availability. Your selection is saved. | 45 / 65 |
| 27 | `offer/enable-failed` | Couldn’t turn on faster sign-in. | 45 / 45 |
| 28 | `offer/offline` | You’re offline. Check your connection. | 45 / 45 |

Not on the list (no band, so must stay pixel-identical): every top-of-page notice, every notice inside a sheet, every in-content notice, and every other state.

## Step 2 — Central change

- `design-system/src/components.css`: on `.tm-actionbar > .tm-notice` set `display: block; text-align: center` (inline flow, not flex). Added `.tm-actionbar > .tm-notice .tm-icon { display: inline-block; vertical-align: middle; margin-right: var(--tm-space-sm) }`. `text-wrap: balance` kept.
- First try was `justify-content: center` on the flex row. Rejected after render: on a 3-line band the icon sat at the far left, detached from the text. Inline flow puts the icon beside line 1 and centres each line.
- `build.py` run; `truemeds.css` gets the one-line rule change. Date-only changes in `native/tokens.json`, `native/tokens.ts`, `preview.html` reverted (`git checkout`).
- An unrelated `docs/renders/2026-10-22-calling/storyboard-final.png` was modified by the review-aid script and reverted.
- No per-screen CSS, no new token values.

## Step 3 — Docs

- `design-system/RULES.md` §9.5 Placement row: one sentence, D-86 alignment rule.
- `design-system/beyond-salt.md`: new dated section, one row.
- `design-system/scripts/build_artifact.py`: "centred" added to the Notice and Action bar guide text (text only; the artifact was not rebuilt).

## Step 4 — Re-render

- Full re-render into `after/` (all 149 states, 390 + 360, `capture-method-cap.py`): 298 pictures, 0 page errors.
- `compare-before-vs-after.json` (sha256 per picture):
  - Identical: 252. Changed: 46.
  - **Changed set = expected set minus 10.** No unexpected picture changed (G2 holds).
  - The 10 expected-but-identical are the callback sheet states `case/c-callback`, `c-callback-error`, `c-callback-failed`, `c-callback-refused`, `s7d-unavailable-sheet` (390 + 360). A sheet covers the bar there, so the band is not visible and the picture is unchanged. Probe found the band in the DOM only.
  - Changed set includes `case/s7b-still-on-call` and `s7c-checking` (sheet covers the bar). Their pictures changed although the band is behind the sheet. Cause not checked. Both are on the expected list.
- The 46 changed pictures copied into `ui-screens/` (same file names). Nothing else in `ui-screens/` changed except the review aids below.
- Review aids rebuilt with `ui-screens/_qa/build-review.py`, `build-contact-sheets.py`, `build-storyboard.py`. (The storyboard script also rewrote an unrelated historical render; reverted.)
- Visual check at 360 and 390 of `case/t16-transfer-missed` (3-line band): icon beside line 1, lines centred, balanced. `case/a-offline` (1-line band): centred.

## Step 5 — Gates

- **G2** only expected pictures differ: PASS (46 changed, all on the expected list; 0 unexpected).
- **G3** four guards at 0:
  - `ui-screens/feedback/check-locked-specs.py`: STANDARDS GUARD PASS, 0 failures, 149 states × 3 viewports, small-phone 360×640 pass included.
  - `ui-screens/feedback/check-sources.mjs`: PASS (copy checks, 85 registry IDs).
  - `docs/layout_check.py`: ALL PASS.
  - `brand/check_lockup.py`: lockup OK.
- **G5** second full render vs first: 298/298 identical; 0 page errors.
- **G6** `git diff --stat` scope: `design-system/{RULES.md, beyond-salt.md, scripts/build_artifact.py, src/components.css, truemeds.css}`; `ui-screens/` 46 pictures plus the `_qa` contact sheets; this folder. `docs/context/decision_log.md` shows as modified but was already modified before this task (not touched here). `design-system/native/*` and `preview.html` are unchanged.
- **G7** every other state pixel-identical: PASS (252 identical; top-of-page, in-content and other sheet notices unchanged).
- Not done: `design-system/build/` artifact not rebuilt (brief names the text edit only). No session handoff or decision log entry written (brief says no decision log / backlog changes).

## Step 6 — Independent check

Fresh subagent given only `BRIEF.md`'s pass-when rules and `checker-pictures.txt` (46 changed pictures, 390 + 360). Round 1 of at most 2. No changes were made by the checker.

- Result: **FAILURES: 0.** 38 PASS, 8 PASS-HIDDEN (sheet covers the bar: `s7b-still-on-call` ×2, `s7c-checking` ×2, `t17-skip-ha-wait` ×2, and 2 more of the same type; band not visible, so not band evidence). Per-picture lines are in the checker's report.
- Checker notes, with my response:
  1. Centring judged by eye (about ±5 px), not measured. Accepted; the DOM probe confirmed the band element and heights.
  2. `offer/enable-failed` and `offer/offline` are bar notices by DOM (`.tm-actionbar > .tm-notice`). Treated as bar notices. Not a change.
  3. **`case/t06-ended-early` picture shows "Call too short to write a prescription."** The probe reports the same band text for this state, so the picture matches the code. The state name may not match its content. Not fixed here (out of scope). **Open for Apurva or whoever owns the state names.**
  4. Bands cover the Notes textarea below them. Expected: the band sits on top of the scroll area, as before.

Pass-criteria on the changed pictures: all bands centred, icon beside line 1, no orphan lines, no clipping, no overlap with the button.

## Step 7 — Finish

Final status: changes limited to the band rule and its docs, 46 pictures promoted into `ui-screens/`, guards at 0, determinism 298/298, checker 0 failures. Not committed, pushed or PR'd (per brief).

Open items for Apurva (NEEDS-APURVA):
1. `case/t06-ended-early` picture text does not match its name (see Step 6 note 3).
2. `design-system/build/` artifact not rebuilt (`build_artifact.py` text edited only).

BAR NOTICE CENTRE DONE — failures: 0
