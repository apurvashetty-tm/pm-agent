# Report — re-render `a-confirm-failed` (Callback removed)

Date: 2026-11-06 · Brief: `BRIEF.md` (backlog bug 2026-11-05) · Runner: Claude Code (terminal)

## Bug and fix
- `ui-screens/case/a-confirm-failed` (390 and 360) showed **Callback** under Confirm prescription. After a valid call only the confirm button shows (D-83 CW-C3).
- The recipe fix was already in `ui-screens/case/case.html` (line for `'a-confirm-failed'`: hides `ab-secondary`, same pattern as `t08c`). I did not change `case.html`.

## Files changed
- `ui-screens/case/a-confirm-failed_w390.png` — replaced with the new render.
- `ui-screens/case/a-confirm-failed_w360.png` — replaced with the new render.
- `ui-screens/case/contact-case.png` — rebuilt by `build-contact-sheets.py` (it shows the 390 picture above, so it has to match).
- `docs/reviews/2026-11-05-plan-v3-review/build-map/index.md`, `step-3.png`, `step-6.png` — rebuilt by `build-map.py` (see note below).
- New folders: `docs/renders/2026-11-06-confirm-failed-fix/before/` (old pair), `after/` (new pair, `capture-log.json`, `spinners.json`), this `REPORT.md`.

Not changed, by design: `case.html` (already fixed before this task), backlog, decision log, commits.

Reverted: `build-contact-sheets.py` also rewrote six contact sheets for folders I did not touch (`sign-in`, `otp`, `home`, `prescribe`, `returning-unlock`, `faster-signin-offer`). I restored them with `git checkout`.

## Render
- Method: `docs/renders/2026-11-03-calling-round/capture-method-cap.py` with `case/a-confirm-failed$`. Rendered 2 pictures, 0 page errors.
- The script needs Playwright. The system Python does not have it, so I ran it from a scratch venv (outside the repo) with Playwright and Chromium installed there. No repo dependency added.

## Check of the new pictures (opened both, 390 and 360)
- No Callback. Only Confirm prescription in the bar.
- Red band "Couldn't confirm. Nothing was lost." sits inside the bar, above Confirm prescription.
- Medicines rows, View Rx, header and notes unchanged in look.

## Before / after
- Difference starts at the bottom edge of the Medicines card (2x y≈1233) and runs down through the bar. Rows below the bar are identical (24 rows from the bottom match).
- Expected, not a stray change: the bar lost the Callback row, so the scroll area above it is taller. The Notes card now shows a little more above the band.

## Guards
| Guard | Result |
|---|---|
| `ui-screens/feedback/check-locked-specs.py` | PASS — 0 failures over 149 states × 3 viewports; small-phone pass 149 states at 360×640 |
| `node ui-screens/feedback/check-sources.mjs` | PASS — 660 strings, 85 registry IDs |
| `docs/layout_check.py` | ALL PASS (includes `no page errors`) |
| `brand/check_lockup.py` | lockup OK |

## Review-aid rebuild
- `build-contact-sheets.py`: ran. Kept `contact-case.png`; reverted the six unrelated sheets (see above).
- `build-map.py`: ran. Output rebuilt, but it now reports a plan-text problem, not a picture problem:
  - Unmatched tokens: `t16b-…`, `t16c-…` (plan step 6 now uses an ellipsis form the parser doesn't expand) and `rx.load-failed` (plan step 3, a behaviour-only state with no picture).
  - Result: 147 of 149 pictures placed; `t16b` and `t16c` missing from the step 6 image.
  - `d-rx-failed` now named in plan step 4 as well as step 3. Shown at step 3.
  - Fix belongs in the parser or plan wording; I did not change either. Flag for the main thread.

## Open items for the main thread
- Backlog tick and decision log: not touched (per brief).
- Commit and push: not done (per brief).
- build-map gap above.
