# Run B — tests-first cases

Scope: plan v3.2 steps 6–8. Source of rules: approved `ui-screens/app-logic.md`, `ui-screens/README.md`, `docs/feedback-state-map.md`, reference HTML and state map. No app implementation is the oracle. See [driver and limitations](../README.md).

## Pass/fail checklist

- [ ] **auto** Executable cases below pass with no browser errors and no undisputed failures.
- [ ] **auto** Every launch edge is represented; version A remains outside launch scope.
- [ ] **auto** All scoped picture and behavior IDs open real app content via `?s=` at both approved widths.
- [ ] **eye/automation gap** [Supplemental acceptance checks](REVIEW-CHECKS.md) are reviewed, executed or explicitly reported incomplete; these are not covered by the state smoke loop.
- [ ] **eye** Main thread resolves any spec disagreement using source lines, without silently changing the oracle.

**Status:** authored, statically validated, browser not run (`listen EPERM` in this sandbox). These unchecked boxes are intentional. The run is not declared done.

Executable inventory: 99 cases, counted from [INVENTORY.tsv](INVENTORY.tsv). Display-only states get the address loop; they do not get duplicate pixel tests.

| Case | Scenario / expected assertion | Source |
|---|---|---|
| B-gate-pilot_ha_free | before gate: neutral script, no finals, callback or back | ui-screens/app-logic.md:119-121,160,176 |
| B-live-pilot_ha_free | live gate CTA independent of HA capacity | ui-screens/app-logic.md:160,176 |
| B-gate-pilot_no_ha_free | before gate: neutral script, no finals, callback or back | ui-screens/app-logic.md:119-121,160,176 |
| B-live-pilot_no_ha_free | live gate CTA independent of HA capacity | ui-screens/app-logic.md:160,176 |
| B-busy-g2-checking-ha | busy stage disables Skip HA and has no Callback | ui-screens/app-logic.md:152,160,173,176 |
| B-busy-t13-connecting-ha | busy stage disables Skip HA and has no Callback | ui-screens/app-logic.md:152,160,173,176 |
| B-wait-g3b-forwarded | forward while live waits; no next-case actions | ui-screens/app-logic.md:123,154-160,189 |
| B-wait-t15-ha-no-join | forward while live waits; no next-case actions | ui-screens/app-logic.md:123,154-160,189 |
| B-ended-g3b-after-hangup | forward after hang-up removes script and allows next case | ui-screens/app-logic.md:155,160 |
| B-ended-t15-after-hangup | forward after hang-up removes script and allows next case | ui-screens/app-logic.md:155,160 |
| B-missed-t16-transfer-missed | ended-before-confirm names correct party | ui-screens/app-logic.md:157,176,185 |
| B-missed-t16b-transfer-missed-patient | ended-before-confirm names correct party | ui-screens/app-logic.md:157,176,185 |
| B-missed-t16c-transfer-missed-unknown | ended-before-confirm names correct party | ui-screens/app-logic.md:157,176,185 |
| B-skip-g1-generic-confirm-Patient declined the Health Advisor call | Skip HA immediate reason: Patient declined the Health Advisor call | ui-screens/app-logic.md:158,176,185-188 |
| B-skip-g1-generic-confirm-Clinically not required | Skip HA immediate reason: Clinically not required | ui-screens/app-logic.md:158,176,185-188 |
| B-skip-g1-generic-confirm-Repeat patient, familiar with the medicines | Skip HA immediate reason: Repeat patient, familiar with the medicines | ui-screens/app-logic.md:158,176,185-188 |
| B-skip-t16-transfer-missed-Patient declined the Health Advisor call | Skip HA immediate reason: Patient declined the Health Advisor call | ui-screens/app-logic.md:158,176,185-188 |
| B-skip-t16-transfer-missed-Clinically not required | Skip HA immediate reason: Clinically not required | ui-screens/app-logic.md:158,176,185-188 |
| B-skip-t16-transfer-missed-Repeat patient, familiar with the medicines | Skip HA immediate reason: Repeat patient, familiar with the medicines | ui-screens/app-logic.md:158,176,185-188 |
| B-skip-cancel | Skip HA close preserves live B1 and eligibility | ui-screens/app-logic.md:187 |
| B-7d | Pilot missing result forwards, callback and unavailable; no Skip HA | ui-screens/app-logic.md:141,143,185 |
| B-pending | Pilot Pending gate also blocks live generic confirm | ui-screens/app-logic.md:194 |
| B-expiry | availability ending mid-case never interrupts; ending allows only Home | ui-screens/app-logic.md:69-70,94 |
| B-reopen | reload restores open case, medicine changes and typed notes | ui-screens/app-logic.md:77,100,262; plan v3.2 B12 |
| B-open-profile | Profile forbids logout while case open | ui-screens/app-logic.md:75,77 |
| B-background | clock survives background/reload during a call; no OTP overlay | ui-screens/app-logic.md:77,119; plan v3.2 B8,B12 |
| B-late-earlier | late record for previous case cannot replace next case | ui-screens/app-logic.md:143; plan v3.2 B7, step 7 |
| B-demo | demo goes sign-in through prescribing and valid call to next case | ui-screens/app-logic.md:274-297; plan v3.2 step 5 |
| B-play-cat4 | desktop and phone play-link route parity | ui-screens/app-logic.md:297; plan v3.2 B15 |
| B-play-pilot_ha_free | desktop and phone play-link route parity | ui-screens/app-logic.md:297; plan v3.2 B15 |
| B-play-pilot_no_ha_free | desktop and phone play-link route parity | ui-screens/app-logic.md:297; plan v3.2 B15 |
| B-play-pilot_ha_skipped_customer | desktop and phone play-link route parity | ui-screens/app-logic.md:297; plan v3.2 B15 |
| B-play-pilot_ha_skipped_system | desktop and phone play-link route parity | ui-screens/app-logic.md:297; plan v3.2 B15 |
| S-360-c-skip-ha | ?s=c-skip-ha opens built content | app/state-map.js:1511; plan v3.2 B4 |
| S-360-g0-calling-pilot | ?s=g0-calling-pilot opens built content | app/state-map.js:1524; plan v3.2 B4 |
| S-360-g1-generic-confirm | ?s=g1-generic-confirm opens built content | app/state-map.js:1538; plan v3.2 B4 |
| S-360-g2-checking-ha | ?s=g2-checking-ha opens built content | app/state-map.js:1551; plan v3.2 B4 |
| S-360-g3b-after-hangup | ?s=g3b-after-hangup opens built content | app/state-map.js:1564; plan v3.2 B4 |
| S-360-g3b-forwarded | ?s=g3b-forwarded opens built content | app/state-map.js:1577; plan v3.2 B4 |
| S-360-s7d-result-missing-pilot | ?s=s7d-result-missing-pilot opens built content | app/state-map.js:1590; plan v3.2 B4 |
| S-360-t10b-forwarded | ?s=t10b-forwarded opens built content | app/state-map.js:1603; plan v3.2 B4 |
| S-360-t13-connecting-ha | ?s=t13-connecting-ha opens built content | app/state-map.js:1616; plan v3.2 B4 |
| S-360-t14-transferred | ?s=t14-transferred opens built content | app/state-map.js:1629; plan v3.2 B4 |
| S-360-t15-after-hangup | ?s=t15-after-hangup opens built content | app/state-map.js:1642; plan v3.2 B4 |
| S-360-t15-ha-no-join | ?s=t15-ha-no-join opens built content | app/state-map.js:1655; plan v3.2 B4 |
| S-360-t16-transfer-missed | ?s=t16-transfer-missed opens built content | app/state-map.js:1668; plan v3.2 B4 |
| S-360-t16b-transfer-missed-patient | ?s=t16b-transfer-missed-patient opens built content | app/state-map.js:1681; plan v3.2 B4 |
| S-360-t16c-transfer-missed-unknown | ?s=t16c-transfer-missed-unknown opens built content | app/state-map.js:1694; plan v3.2 B4 |
| S-360-t17-skip-ha-wait | ?s=t17-skip-ha-wait opens built content | app/state-map.js:1707; plan v3.2 B4 |
| S-360-call.mismatch-logged | ?s=call.mismatch-logged opens built content | app/state-map.js:1870; plan v3.2 B4 |
| S-360-call.skipHa | ?s=call.skipHa opens built content | app/state-map.js:1877; plan v3.2 B4 |
| S-360-call.transfer-failed | ?s=call.transfer-failed opens built content | app/state-map.js:1884; plan v3.2 B4 |
| S-360-call.waiting-for-hangup | ?s=call.waiting-for-hangup opens built content | app/state-map.js:1891; plan v3.2 B4 |
| S-360-case.reopened | ?s=case.reopened opens built content | app/state-map.js:1898; plan v3.2 B4 |
| S-390-c-skip-ha | ?s=c-skip-ha opens built content | app/state-map.js:1511; plan v3.2 B4 |
| S-390-g0-calling-pilot | ?s=g0-calling-pilot opens built content | app/state-map.js:1524; plan v3.2 B4 |
| S-390-g1-generic-confirm | ?s=g1-generic-confirm opens built content | app/state-map.js:1538; plan v3.2 B4 |
| S-390-g2-checking-ha | ?s=g2-checking-ha opens built content | app/state-map.js:1551; plan v3.2 B4 |
| S-390-g3b-after-hangup | ?s=g3b-after-hangup opens built content | app/state-map.js:1564; plan v3.2 B4 |
| S-390-g3b-forwarded | ?s=g3b-forwarded opens built content | app/state-map.js:1577; plan v3.2 B4 |
| S-390-s7d-result-missing-pilot | ?s=s7d-result-missing-pilot opens built content | app/state-map.js:1590; plan v3.2 B4 |
| S-390-t10b-forwarded | ?s=t10b-forwarded opens built content | app/state-map.js:1603; plan v3.2 B4 |
| S-390-t13-connecting-ha | ?s=t13-connecting-ha opens built content | app/state-map.js:1616; plan v3.2 B4 |
| S-390-t14-transferred | ?s=t14-transferred opens built content | app/state-map.js:1629; plan v3.2 B4 |
| S-390-t15-after-hangup | ?s=t15-after-hangup opens built content | app/state-map.js:1642; plan v3.2 B4 |
| S-390-t15-ha-no-join | ?s=t15-ha-no-join opens built content | app/state-map.js:1655; plan v3.2 B4 |
| S-390-t16-transfer-missed | ?s=t16-transfer-missed opens built content | app/state-map.js:1668; plan v3.2 B4 |
| S-390-t16b-transfer-missed-patient | ?s=t16b-transfer-missed-patient opens built content | app/state-map.js:1681; plan v3.2 B4 |
| S-390-t16c-transfer-missed-unknown | ?s=t16c-transfer-missed-unknown opens built content | app/state-map.js:1694; plan v3.2 B4 |
| S-390-t17-skip-ha-wait | ?s=t17-skip-ha-wait opens built content | app/state-map.js:1707; plan v3.2 B4 |
| S-390-call.mismatch-logged | ?s=call.mismatch-logged opens built content | app/state-map.js:1870; plan v3.2 B4 |
| S-390-call.skipHa | ?s=call.skipHa opens built content | app/state-map.js:1877; plan v3.2 B4 |
| S-390-call.transfer-failed | ?s=call.transfer-failed opens built content | app/state-map.js:1884; plan v3.2 B4 |
| S-390-call.waiting-for-hangup | ?s=call.waiting-for-hangup opens built content | app/state-map.js:1891; plan v3.2 B4 |
| S-390-case.reopened | ?s=case.reopened opens built content | app/state-map.js:1898; plan v3.2 B4 |
| B-EDGE-1 | B0>B1:gate passed, call live | app/state-map.js edge B0>B1:gate passed, call live; ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-2 | B0>B7d:no result: 7c, nothing | app/state-map.js edge B0>B7d:no result: 7c, nothing; ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-3 | B0>RES:ended before the gate | app/state-map.js edge B0>RES:ended before the gate; ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-4 | B1>B2:Confirm prescription | app/state-map.js edge B1>B2:Confirm prescription; ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-5 | B1>T16:ended after gate, no Confirm | app/state-map.js edge B1>T16:ended after gate, no Confirm; ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-6 | B1>T17:Skip HA + reason | app/state-map.js edge B1>T17:Skip HA + reason; ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-7 | B2>B3:no HA free | app/state-map.js edge B2>B3:no HA free; ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-8 | B2>T13:HA free | app/state-map.js edge B2>T13:HA free; ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-9 | B3>EB3:hang-up | app/state-map.js edge B3>EB3:hang-up; ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-10 | B7d>C7f:Confirm & forward | app/state-map.js edge B7d>C7f:Confirm & forward; ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-11 | B7d>CB:Callback | app/state-map.js edge B7d>CB:Callback; ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-12 | B7d>P9:Unavailable + reason | app/state-map.js edge B7d>P9:Unavailable + reason; ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-13 | C6>B0:Call again (Pilot context kept) | app/state-map.js edge C6>B0:Call again (Pilot context kept); ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-14 | C7b>B0:Still talking (Pilot context kept) | app/state-map.js edge C7b>B0:Still talking (Pilot context kept); ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-15 | C7f>E10b:record over the gate (Pilot) | app/state-map.js edge C7f>E10b:record over the gate (Pilot); ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-16 | CALL>B0:Pilot | app/state-map.js edge CALL>B0:Pilot; ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-17 | E15>HOLD:result under the gate (background) | app/state-map.js edge E15>HOLD:result under the gate (background); ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-18 | EB3>HOLD:result under the gate (background) | app/state-map.js edge EB3>HOLD:result under the gate (background); ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-19 | T13>E14:HA rung (joins or doesn't pick up) | app/state-map.js edge T13>E14:HA rung (joins or doesn't pick up); ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-20 | T13>T15:couldn't start | app/state-map.js edge T13>T15:couldn't start; ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-21 | T15>E15:hang-up | app/state-map.js edge T15>E15:hang-up; ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-22 | T16>E10a:Skip HA + reason → Confirm prescription | app/state-map.js edge T16>E10a:Skip HA + reason → Confirm prescription; ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-23 | T16>E10b:Confirm & forward | app/state-map.js edge T16>E10b:Confirm & forward; ui-screens/app-logic.md:133-160,176-190 |
| B-EDGE-24 | T17>RES:result | app/state-map.js edge T17>RES:result; ui-screens/app-logic.md:133-160,176-190 |

Each edge case opens its source stage, performs the action or advances the public simulator/clock, and asserts destination copy/actions. A separately opened destination picture is never accepted as transition proof. Backend-only outcomes require public reviewer log evidence; see supplemental checks for limits of that evidence.

## Source precedence and assumptions

Project decisions and app-logic govern product behavior; the registry governs final notice wording (for example `call.resultMissing`, not stale prose quoted in older tables). Settings supply durations and their rule/mock provenance. Source line ranges are from the files read for this test-authoring run. `REVIEW-CHECKS.md` source paths are relative to `ui-screens/` unless prefixed by `docs/`, `calling-flow/`, or plan/brief titles.

No new product behavior is inferred for open questions. Simulator enum names, lifted markup IDs and fixture continuation are test adapter assumptions listed in the shared README. Report adapter mismatches separately from a demonstrated flow-rule failure. No production data, real phone calls or message sending is needed.
