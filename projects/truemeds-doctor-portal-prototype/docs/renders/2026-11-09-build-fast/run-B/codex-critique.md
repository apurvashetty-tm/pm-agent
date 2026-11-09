Found **one blocker and two should-fix gaps**. Review was read-only; no files changed.

1. **Blocker — an ended call can complete as Transferred and earn a confirmation.**  
   `app/core/call-engine.js:99,164–177` sends B2/13 directly through `stepHa()`, which never checks whether the patient call ended before the HA handoff. A read-only engine probe reproduced: Confirm at the gate → patient hangs up during B2 → 13 → 14 → `onTransferred()` counts the confirmation.  
   **Spec:** `ui-screens/app-logic.md:158,190`: an ended-before-transfer call follows 16; transfer means handing the patient to an HA **on the same call**. Reconcile the call’s live state before accepting the HA transition; add a test for hang-up during B2/13.

2. **Should-fix — reopening a story started at Case or Home can overwrite the remembered case.**  
   `app/core/boot.js:121–125` returns a fresh fixture for `story.start === "case"` or `"home"` before checking the remembered open case. For Case, `app/screens/case.js:169` consequently calls `applyFixture()`, replacing medicines, notes and call stage. The existing reopen test uses the default story start and misses this branch.  
   **Spec:** plan v3.2 `:64` (B12), `ui-screens/app-logic.md:101`: reopening restores the open case. Apply restoration before story-start fixture selection when opening an existing session.

3. **Should-fix — state 17 retains the end-of-call script after a reported hang-up.**  
   `app/core/call-engine.js:141–143` handles a known hang-up only when `c.stage === "calling"`; `skip-ha-wait` keeps its stage until the result or timeout. `app/screens/case.js:197` therefore keeps the script visible after the app knows the call ended. A read-only probe reproduced this with a delayed record.  
   **Spec:** `ui-screens/app-logic.md:103,138,141`: hide the script once the call has ended; a reported Pilot hang-up waits for the result without a script. Preserve the HA-skipped route while reconciling that hang-up.

The supplied `tests-step6/run-B-all.log` records **94/99 passing**. These CASES.md scenarios have no passing result under their original IDs:

- `B-play-cat4`
- `B-play-pilot_ha_free`
- `B-play-pilot_no_ha_free`
- `B-play-pilot_ha_skipped_customer`
- `B-play-pilot_ha_skipped_system`

The dispute is supported: `journeys.mjs:88` reads `innerText()` from the folded phone row. `b-play-textcontent.log` records passing equivalents for all five. This is an adapter failure, not demonstrated app failure. However, both versions stop at eligible CTAs (`journeys.mjs:95–97`); **desktop/phone parity through final endings remains unproved** against plan B15 and B-R11.

Other supplemental checks still lack complete passing evidence: all invalid/missing-record forward variants (B-R03/B-R06), every availability-ending outcome (B-R07), background reconciliation across all deadlines and duplicate events (B-R09), and reset/logout/storage isolation (B-R10). The installed-phone checks remain walkthrough items under the rulings.