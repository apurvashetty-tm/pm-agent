# Run A1 — response to the Codex critique

First critique: `codex-critique.md` (2 blockers, 3 should-fix). All adopted; second critique `codex-critique-2.md`: **no blockers left**.

| Finding | Response |
|---|---|
| Blocker: `home_added` outside capture used `v()` before it was defined (fell back to the picture) | Adopted: `v` defined before the screen state. `home_added` now opens built in review (its toast shows ~4 s). |
| Blocker: Set availability and Add time always succeeded, also offline | Adopted: the mock server can't be reached offline, so Setting… ends in `home.setupFailed` (selection kept) and Adding… in `home.addFailed` (sheet and selection kept, deadline unchanged). There is no story value for a server-side failure of these two (the story schema has none); offline is the failure path. |
| Should-fix: phone Back didn't close Home sheets first | Adopted: Back closes Add time / End availability / Log out first, then Profile goes back; Home itself is a root. |
| Should-fix: offline picture moments stayed offline after reconnect | Adopted (Home and case): any change of the reviewer's offline switch replaces the picture moment, so reconnect recovers (`case.offlineAction` clears). |
| Should-fix: bar hid on focus, not on the keyboard | Adopted: `parts.js watchKeyboard` hides the bar while a text field has focus **and** the visual viewport is clearly shorter (the phone keyboard took it); it returns when the keyboard closes even if the field keeps focus. Capture keeps the drawn keyboard of the pictures. The real-phone check stays an eye check (REVIEW-CHECKS A-R14). |
| "Scenarios without a passing test" | A-C01, A-P07, A-OPTIONS-d-every-x-hours, a-loading: disputed with spec lines (`test-disputes.md`). The behaviour-only ids now open built screens (mapped in `core/boot.js`). A-R03 / A-R04 and the cheap REVIEW-CHECKS items are tests in `tests/build-fast-a1.mjs` (14/14). |
