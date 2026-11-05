# Build map - plan v3 section 5

Review aid for Apurva (approve from screens, not state names). Each image: approved 390-wide pictures in flow order, labelled `render id - what the doctor sees or does`. No new renders, no mock-ups. Built by `ui-screens/_qa/build-map.py` from plan v3 section 5.

| Step | Journey | Pictures | Flow | Image |
|---|---|---|---|---|
| 0 | Shell | none (no screens) | - | - |
| 1 | Sign-in, OTP, faster sign-in, returning unlock | 42 | Sign-in -> Send OTP -> OTP -> Verify & sign in -> faster sign-in offer (once) -> Home. | [step-1.png](step-1.png) |
| 2 | Home, availability, Profile, Log out, Help / bell placeholder | 22 | Home -> set availability -> Active -> Request a case -> Requesting. | [step-2.png](step-2.png) |
| 3 | Case page (incl. empty case, leave sheet, release failed, Rx failed) | 22 | Case opened -> Ready (Call patient starts step 5). | [step-3.png](step-3.png) |
| 4 | Prescribe and Disable | 22 | Case -> tap a medicine -> Prescribe (schedule, dose) -> Prescribed. | [step-4.png](step-4.png) |
| 5 | Calling - Cat4 and Pilot with HA skipped | 21 | Call patient -> Calling. | [step-5.png](step-5.png) |
| 6 | Pilot - Fallback B (launch) | 14 | Pilot: Calling (B1, before gate) -> gate -> Confirm prescription -> Checking for an HA -> free: Transferring -> Transferred; none: Forwarded (after hang-up: title only). | [step-6.png](step-6.png) |
| 9 (LATER) | LATER - Version A (not in the first build) | 3 | Calling (transfer case) -> Confirm & transfer -> Transferring -> Transferred. | [step-9.png](step-9.png) |
| 7 | Across journeys: availability ends mid-case, reopen into an open case, app backgrounded during a call | none (app-logic 3 - 4) | - | - |
| 8 | Final pass: copy parity with native, G7 over everything | all (no new picture) | - | - |

## Gaps

- Pictures in ui-screens/ that no step uses: 2 (case/t16b-transfer-missed-patient, case/t16c-transfer-missed-unknown)
- Plan section 5 tokens that match no picture: 3 ([(3, 'rx.load-failed'), (6, 't16b-…'), (6, 't16c-…')])
- Named twice in plan section 5 (shown once, at the step that names it exactly): `d-rx-failed` named in step 3 (exact), step 4 (range/wildcard), step 4 (exact); shown once, at step 3. `s7d-result-missing-pilot` named in step 5 (id/folder), step 6 (exact); shown once, at step 6.
- Behaviour-only states (in feedback-state-map, no picture, not on the map): `offer.cancelled` (step 1), `offer.not-now` (step 1), `offer.unsupported` (step 1), `offer.enabled` (step 1), `rx.load-failed` (step 3), `case.reopened` (step 7).
- Picture triggers that live in a later step (picture shown in step 3, trigger in steps 5-6): `case/a-back-blocked`, `case/a-confirm-busy`, `case/a-confirm-failed`. `home/home_profile-case-open` needs an open case.

## Self-check

- Every approved picture in this map appears once: 146 placed, 146 unique, pictures on disk 148.
- Labels: taken from ui-screens/README.md, calling-flow/data.js, app-logic.md and feedback-state-map.md. Readable at phone width: checked by eye only at the sizes built (see note below).
- No screen cropped: thumbnails are the full 390 x 844 picture scaled to 40 %.
- Note: the labels and flow lines were written from the sources above; if a source changes, rerun the script after editing LABELS / FLOW.

