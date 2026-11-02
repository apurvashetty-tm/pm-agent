# Round 6 — expected list (written before the full render)

Baseline = `ui-screens/` as it stood at the start of Round 6 (Round 5 promoted pictures; `home/home_add-failed_*` still the Round 4 picture, held in Round 5).
Anything outside this list must be pixel-identical to the baseline. Any other difference = failure until explained.

## Expected to change (8 pictures = 4 states × 390 and 360)

### Item 1 — sheets cover the pinned bar (Home scrim `.overlay` no longer sits under the bar's z-index)
Home sheet states with a pinned bar behind the scrim (the scrim was at z 5, the bar at z 10):
- home/home_add-wheel_w390, home/home_add-wheel_w360
- home/home_adding_w390, home/home_adding_w360
- home/home_add-failed_w390, home/home_add-failed_w360 (also the Round 5 held picture: promoted corrected, per the Round 6 brief)
- home/home_end-confirmation_w390, home/home_end-confirmation_w360

## Expected identical (no picture change)
- home/home_logout-confirm (no pinned bar behind it).
- All case sheets: case/a-leave-sheet, a-releasing, c-callback, c-callback-error, c-callback-failed, c-skip-ha, s7d-unavailable-sheet, s7e-leave-sheet; prescribe/d-disable-sheet, d-discard-sheet. Their markup changed (sheet header / actions / spacing moved into the pinned parts) but the layout at rest is the same; Confirm callback, Discard and Keep editing keep their places.
- case/g1-generic-confirm (state script fixed; 10 renders in a row identical, and identical to the promoted picture).
- Item 1b (tall sheets pinned): no standard picture is taller than its space at 390×844 or 360×844; the pinned behaviour is probed at 390×844 and 360×640 instead.
- Mobile column fix (case-styles, phone column is the screen): capture mode forces the 844 frame, so no picture changes.
- Sign-in, OTP, offer, unlock, all other Home and case states, all Prescribe states.

## Expected count
- 8 changed pictures (4 states × 2). Everything else identical to the baseline.
