# Run A — tests-first cases

Scope: plan v3.2 steps 2–5. Source of rules: approved `ui-screens/app-logic.md`, `ui-screens/README.md`, `docs/feedback-state-map.md`, reference HTML and state map. No app implementation is the oracle. See [driver and limitations](../README.md).

## Pass/fail checklist

- [ ] **auto** Executable cases below pass with no browser errors and no undisputed failures.
- [ ] **auto** Every launch edge is represented; version A remains outside launch scope.
- [ ] **auto** All scoped picture and behavior IDs open real app content via `?s=` at both approved widths.
- [ ] **eye/automation gap** [Supplemental acceptance checks](REVIEW-CHECKS.md) are reviewed, executed or explicitly reported incomplete; these are not covered by the state smoke loop.
- [ ] **eye** Main thread resolves any spec disagreement using source lines, without silently changing the oracle.

**Status:** authored, statically validated, browser not run (`listen EPERM` in this sandbox). These unchecked boxes are intentional. The run is not declared done.

Executable inventory: 303 cases, counted from [INVENTORY.tsv](INVENTORY.tsv). Display-only states get the address loop; they do not get duplicate pixel tests.

| Case | Scenario / expected assertion | Source |
|---|---|---|
| A-H01 | availability starts only on confirmation, then requests a case | ui-screens/app-logic.md:64-66 |
| A-H02 | request failure stays on Home and retry succeeds | ui-screens/app-logic.md:66-73 |
| A-H03 | no cases preserves availability and allows manual retry | ui-screens/app-logic.md:66-73 |
| A-H04 | Home offline blocks request and End availability | ui-screens/app-logic.md:60,66,270 |
| A-H05 | near expiry adds selected time and dismisses sheet | ui-screens/app-logic.md:65-67 |
| A-H06 | failed add retains duration; closing does not add time | ui-screens/app-logic.md:67; docs/feedback-state-map.md:123 |
| A-H07 | cancel end keeps availability; confirm end returns to setup | ui-screens/app-logic.md:68 |
| A-H08 | pending request honoured after availability ends | ui-screens/app-logic.md:66,68-69 |
| A-H09 | idle timer expiry keeps prescription count and setup | ui-screens/app-logic.md:65,69-70 |
| A-H10 | Profile logout cancelled then confirmed returns to sign-in | ui-screens/app-logic.md:75 |
| A-C01 | ready Back opens leave; stay and close preserve case | ui-screens/app-logic.md:89,100 |
| A-C02 | release returns to Home | ui-screens/app-logic.md:100 |
| A-C03 | release refused leaves doctor on Ready with notes retained | ui-screens/app-logic.md:100,262 |
| A-C04-Release case | empty case releases directly: Release case | ui-screens/app-logic.md:96 |
| A-C04-Back | empty case releases directly: Back | ui-screens/app-logic.md:96 |
| A-C05 | Rx failed retry and close remain usable | ui-screens/app-logic.md:261; docs/feedback-state-map.md:155 |
| A-C06 | offline action keeps notes, reconnect recovers | ui-screens/app-logic.md:256-262,270 |
| A-P01 | zero daily dose blocks prescribe and focuses first error | ui-screens/app-logic.md:244-246 |
| A-P02 | save prescription marks medicine Prescribed | ui-screens/app-logic.md:246 |
| A-P03-Can’t prescribe remotely | disable immediately: Can’t prescribe remotely | ui-screens/app-logic.md:249 |
| A-P03-Contraindicated for patient | disable immediately: Contraindicated for patient | ui-screens/app-logic.md:249 |
| A-P03-Duplicate medication | disable immediately: Duplicate medication | ui-screens/app-logic.md:249 |
| A-P03-Patient declined | disable immediately: Patient declined | ui-screens/app-logic.md:249 |
| A-P03-Wrong strength | disable immediately: Wrong strength | ui-screens/app-logic.md:249 |
| A-P04 | prescribing disabled medicine enables it again | ui-screens/app-logic.md:246-247 |
| A-P05 | changed Prescribe closes through discard and Keep editing | ui-screens/app-logic.md:248 |
| A-P06 | unchanged Prescribe closes without discard | ui-screens/app-logic.md:248 |
| A-P07 | Other accepts only positive decimal numbers | ui-screens/app-logic.md:244 |
| A-P08 | instructions appear in live printed line; food toggles clear | ui-screens/app-logic.md:243,251 |
| A-F01 | Pending medicines block confirm and allow medicine review | ui-screens/app-logic.md:146,194 |
| A-F02 | confirm failure restores CTA without losing work | ui-screens/app-logic.md:190 |
| A-F03 | uncertain confirm stays busy and refuses duplicate submission | ui-screens/app-logic.md:173,190 |
| A-CTA-t02-calling | forbidden finals/callback while waiting: t02-calling | ui-screens/app-logic.md:90,120-121,134-140 |
| A-CTA-s7a-calling | forbidden finals/callback while waiting: s7a-calling | ui-screens/app-logic.md:90,120-121,134-140 |
| A-CTA-t05-result-wait | forbidden finals/callback while waiting: t05-result-wait | ui-screens/app-logic.md:90,120-121,134-140 |
| A-CTA-s7b-still-on-call | forbidden finals/callback while waiting: s7b-still-on-call | ui-screens/app-logic.md:90,120-121,134-140 |
| A-CTA-t03-not-through | CTA permissions: t03-not-through | ui-screens/app-logic.md:133-148,185,204 |
| A-CTA-t04-doctor-missed | CTA permissions: t04-doctor-missed | ui-screens/app-logic.md:133-148,185,204 |
| A-CTA-t06-ended-early | CTA permissions: t06-ended-early | ui-screens/app-logic.md:133-148,185,204 |
| A-CTA-s7d-result-missing | CTA permissions: s7d-result-missing | ui-screens/app-logic.md:133-148,185,204 |
| A-CTA-t08a-valid-cat4 | CTA permissions: t08a-valid-cat4 | ui-screens/app-logic.md:133-148,185,204 |
| A-CTA-t10a-confirmed | CTA permissions: t10a-confirmed | ui-screens/app-logic.md:133-148,185,204 |
| A-CTA-e-availability-ended | CTA permissions: e-availability-ended | ui-screens/app-logic.md:133-148,185,204 |
| A-N01 | phone Back during call shows blocked toast | ui-screens/app-logic.md:90,100 |
| A-N02 | phone Back on closed case goes Home | ui-screens/app-logic.md:94 |
| A-CALL-3 | doctor-side failure allows retry and release | ui-screens/app-logic.md:118,122,135-136 |
| A-CALL-4 | doctor-side failure allows retry and release | ui-screens/app-logic.md:118,122,135-136 |
| A-HOLD-no-answer | patient failure closes and applies hold policy: no-answer | ui-screens/app-logic.md:122,207 |
| A-HOLD-busy | patient failure closes and applies hold policy: busy | ui-screens/app-logic.md:122,207 |
| A-HOLD-rejected | patient failure closes and applies hold policy: rejected | ui-screens/app-logic.md:122,207 |
| A-HOLD-switched-off | patient failure closes and applies hold policy: switched-off | ui-screens/app-logic.md:122,207 |
| A-HOLD-unreachable | patient failure closes and applies hold policy: unreachable | ui-screens/app-logic.md:122,207 |
| A-HOLD-invalid-number | patient failure closes and applies hold policy: invalid-number | ui-screens/app-logic.md:122,207 |
| A-HOLD-unknown | patient failure closes and applies hold policy: unknown | ui-screens/app-logic.md:122,207 |
| A-CB-t06-ended-early | callback validates both fields then schedules | ui-screens/app-logic.md:201-204 |
| A-CB-s7d-result-missing | callback validates both fields then schedules | ui-screens/app-logic.md:201-204 |
| A-CB-refused | callback backend refusal keeps choices and case open | ui-screens/app-logic.md:126,204 |
| A-CB-failed | callback save failure keeps selected date and time | ui-screens/app-logic.md:203 |
| A-U-Didn’t answer | Unavailable reason immediately closes: Didn’t answer | ui-screens/app-logic.md:208-209 |
| A-U-Not reachable | Unavailable reason immediately closes: Not reachable | ui-screens/app-logic.md:208-209 |
| A-U-Wrong number | Unavailable reason immediately closes: Wrong number | ui-screens/app-logic.md:208-209 |
| A-U-cancel | Unavailable close leaves case unchanged | ui-screens/app-logic.md:208 |
| S-360-home_active | ?s=home_active opens built content | app/state-map.js:467; plan v3.2 B4 |
| S-360-home_add-failed | ?s=home_add-failed opens built content | app/state-map.js:478; plan v3.2 B4 |
| S-360-home_add-wheel | ?s=home_add-wheel opens built content | app/state-map.js:489; plan v3.2 B4 |
| S-360-home_added | ?s=home_added opens built content | app/state-map.js:500; plan v3.2 B4 |
| S-360-home_adding | ?s=home_adding opens built content | app/state-map.js:511; plan v3.2 B4 |
| S-360-home_end-confirmation | ?s=home_end-confirmation opens built content | app/state-map.js:522; plan v3.2 B4 |
| S-360-home_expired-pending | ?s=home_expired-pending opens built content | app/state-map.js:533; plan v3.2 B4 |
| S-360-home_idle-expired | ?s=home_idle-expired opens built content | app/state-map.js:544; plan v3.2 B4 |
| S-360-home_logout-confirm | ?s=home_logout-confirm opens built content | app/state-map.js:555; plan v3.2 B4 |
| S-360-home_manually-ended | ?s=home_manually-ended opens built content | app/state-map.js:566; plan v3.2 B4 |
| S-360-home_near-expiry | ?s=home_near-expiry opens built content | app/state-map.js:577; plan v3.2 B4 |
| S-360-home_no-cases | ?s=home_no-cases opens built content | app/state-map.js:588; plan v3.2 B4 |
| S-360-home_offline | ?s=home_offline opens built content | app/state-map.js:599; plan v3.2 B4 |
| S-360-home_profile | ?s=home_profile opens built content | app/state-map.js:610; plan v3.2 B4 |
| S-360-home_profile-case-open | ?s=home_profile-case-open opens built content | app/state-map.js:621; plan v3.2 B4 |
| S-360-home_request-failed | ?s=home_request-failed opens built content | app/state-map.js:634; plan v3.2 B4 |
| S-360-home_requesting | ?s=home_requesting opens built content | app/state-map.js:645; plan v3.2 B4 |
| S-360-home_setting | ?s=home_setting opens built content | app/state-map.js:656; plan v3.2 B4 |
| S-360-home_setup-failed | ?s=home_setup-failed opens built content | app/state-map.js:667; plan v3.2 B4 |
| S-360-home_setup-wheel | ?s=home_setup-wheel opens built content | app/state-map.js:678; plan v3.2 B4 |
| S-360-home_stop-pending | ?s=home_stop-pending opens built content | app/state-map.js:689; plan v3.2 B4 |
| S-360-home_unknown-result | ?s=home_unknown-result opens built content | app/state-map.js:700; plan v3.2 B4 |
| S-360-a-back-blocked | ?s=a-back-blocked opens built content | app/state-map.js:711; plan v3.2 B4 |
| S-360-a-confirm-busy | ?s=a-confirm-busy opens built content | app/state-map.js:727; plan v3.2 B4 |
| S-360-a-confirm-failed | ?s=a-confirm-failed opens built content | app/state-map.js:743; plan v3.2 B4 |
| S-360-a-leave-sheet | ?s=a-leave-sheet opens built content | app/state-map.js:759; plan v3.2 B4 |
| S-360-a-load-failed | ?s=a-load-failed opens built content | app/state-map.js:772; plan v3.2 B4 |
| S-360-a-loading | ?s=a-loading opens built content | app/state-map.js:786; plan v3.2 B4 |
| S-360-a-long-content | ?s=a-long-content opens built content | app/state-map.js:800; plan v3.2 B4 |
| S-360-a-no-medicines | ?s=a-no-medicines opens built content | app/state-map.js:811; plan v3.2 B4 |
| S-360-a-notes-typing | ?s=a-notes-typing opens built content | app/state-map.js:824; plan v3.2 B4 |
| S-360-a-offline | ?s=a-offline opens built content | app/state-map.js:835; plan v3.2 B4 |
| S-360-a-offline-action | ?s=a-offline-action opens built content | app/state-map.js:848; plan v3.2 B4 |
| S-360-a-order-details | ?s=a-order-details opens built content | app/state-map.js:861; plan v3.2 B4 |
| S-360-a-release-failed | ?s=a-release-failed opens built content | app/state-map.js:872; plan v3.2 B4 |
| S-360-a-releasing | ?s=a-releasing opens built content | app/state-map.js:886; plan v3.2 B4 |
| S-360-a-rx-viewer | ?s=a-rx-viewer opens built content | app/state-map.js:899; plan v3.2 B4 |
| S-360-a-scrolled | ?s=a-scrolled opens built content | app/state-map.js:910; plan v3.2 B4 |
| S-360-a-top | ?s=a-top opens built content | app/state-map.js:921; plan v3.2 B4 |
| S-360-d-rx-failed | ?s=d-rx-failed opens built content | app/state-map.js:932; plan v3.2 B4 |
| S-360-s-10-medicines | ?s=s-10-medicines opens built content | app/state-map.js:943; plan v3.2 B4 |
| S-360-s-medicine-disabled | ?s=s-medicine-disabled opens built content | app/state-map.js:954; plan v3.2 B4 |
| S-360-s-optional-empty | ?s=s-optional-empty opens built content | app/state-map.js:967; plan v3.2 B4 |
| S-360-s7e-leave-sheet | ?s=s7e-leave-sheet opens built content | app/state-map.js:978; plan v3.2 B4 |
| S-360-d-alt-days | ?s=d-alt-days opens built content | app/state-map.js:991; plan v3.2 B4 |
| S-360-d-cream | ?s=d-cream opens built content | app/state-map.js:1002; plan v3.2 B4 |
| S-360-d-default | ?s=d-default opens built content | app/state-map.js:1013; plan v3.2 B4 |
| S-360-d-disable-sheet | ?s=d-disable-sheet opens built content | app/state-map.js:1024; plan v3.2 B4 |
| S-360-d-disabled | ?s=d-disabled opens built content | app/state-map.js:1035; plan v3.2 B4 |
| S-360-d-discard-sheet | ?s=d-discard-sheet opens built content | app/state-map.js:1046; plan v3.2 B4 |
| S-360-d-drops | ?s=d-drops opens built content | app/state-map.js:1057; plan v3.2 B4 |
| S-360-d-duration-picker | ?s=d-duration-picker opens built content | app/state-map.js:1068; plan v3.2 B4 |
| S-360-d-error-dose | ?s=d-error-dose opens built content | app/state-map.js:1079; plan v3.2 B4 |
| S-360-d-error-other | ?s=d-error-other opens built content | app/state-map.js:1090; plan v3.2 B4 |
| S-360-d-every-x-hours | ?s=d-every-x-hours opens built content | app/state-map.js:1101; plan v3.2 B4 |
| S-360-d-food-selected | ?s=d-food-selected opens built content | app/state-map.js:1112; plan v3.2 B4 |
| S-360-d-header-white | ?s=d-header-white opens built content | app/state-map.js:1123; plan v3.2 B4 |
| S-360-d-inhaler | ?s=d-inhaler opens built content | app/state-map.js:1134; plan v3.2 B4 |
| S-360-d-injection-default | ?s=d-injection-default opens built content | app/state-map.js:1145; plan v3.2 B4 |
| S-360-d-monthly | ?s=d-monthly opens built content | app/state-map.js:1156; plan v3.2 B4 |
| S-360-d-notes-keyboard | ?s=d-notes-keyboard opens built content | app/state-map.js:1167; plan v3.2 B4 |
| S-360-d-scrolled | ?s=d-scrolled opens built content | app/state-map.js:1178; plan v3.2 B4 |
| S-360-d-sos-on | ?s=d-sos-on opens built content | app/state-map.js:1189; plan v3.2 B4 |
| S-360-d-sos-only | ?s=d-sos-only opens built content | app/state-map.js:1200; plan v3.2 B4 |
| S-360-d-syrup | ?s=d-syrup opens built content | app/state-map.js:1211; plan v3.2 B4 |
| S-360-d-weekly | ?s=d-weekly opens built content | app/state-map.js:1222; plan v3.2 B4 |
| S-360-c-callback | ?s=c-callback opens built content | app/state-map.js:1233; plan v3.2 B4 |
| S-360-c-callback-error | ?s=c-callback-error opens built content | app/state-map.js:1246; plan v3.2 B4 |
| S-360-c-callback-failed | ?s=c-callback-failed opens built content | app/state-map.js:1259; plan v3.2 B4 |
| S-360-c-callback-refused | ?s=c-callback-refused opens built content | app/state-map.js:1272; plan v3.2 B4 |
| S-360-e-availability-ended | ?s=e-availability-ended opens built content | app/state-map.js:1285; plan v3.2 B4 |
| S-360-e-callback-scheduled | ?s=e-callback-scheduled opens built content | app/state-map.js:1298; plan v3.2 B4 |
| S-360-s7a-calling | ?s=s7a-calling opens built content | app/state-map.js:1311; plan v3.2 B4 |
| S-360-s7b-still-on-call | ?s=s7b-still-on-call opens built content | app/state-map.js:1324; plan v3.2 B4 |
| S-360-s7d-result-missing | ?s=s7d-result-missing opens built content | app/state-map.js:1339; plan v3.2 B4 |
| S-360-s7d-unavailable-sheet | ?s=s7d-unavailable-sheet opens built content | app/state-map.js:1352; plan v3.2 B4 |
| S-360-s7f-submitted | ?s=s7f-submitted opens built content | app/state-map.js:1365; plan v3.2 B4 |
| S-360-t01-ready | ?s=t01-ready opens built content | app/state-map.js:1378; plan v3.2 B4 |
| S-360-t02-calling | ?s=t02-calling opens built content | app/state-map.js:1391; plan v3.2 B4 |
| S-360-t03-not-through | ?s=t03-not-through opens built content | app/state-map.js:1404; plan v3.2 B4 |
| S-360-t04-doctor-missed | ?s=t04-doctor-missed opens built content | app/state-map.js:1417; plan v3.2 B4 |
| S-360-t05-result-wait | ?s=t05-result-wait opens built content | app/state-map.js:1430; plan v3.2 B4 |
| S-360-t06-ended-early | ?s=t06-ended-early opens built content | app/state-map.js:1444; plan v3.2 B4 |
| S-360-t08a-valid-cat4 | ?s=t08a-valid-cat4 opens built content | app/state-map.js:1459; plan v3.2 B4 |
| S-360-t08c-confirm-blocked | ?s=t08c-confirm-blocked opens built content | app/state-map.js:1472; plan v3.2 B4 |
| S-360-t09-patient-unavailable | ?s=t09-patient-unavailable opens built content | app/state-map.js:1485; plan v3.2 B4 |
| S-360-t10a-confirmed | ?s=t10a-confirmed opens built content | app/state-map.js:1498; plan v3.2 B4 |
| S-360-home.add-open | ?s=home.add-open opens built content | app/state-map.js:1804; plan v3.2 B4 |
| S-360-home.setup | ?s=home.setup opens built content | app/state-map.js:1811; plan v3.2 B4 |
| S-360-case.back-before-call | ?s=case.back-before-call opens built content | app/state-map.js:1818; plan v3.2 B4 |
| S-360-case.closed | ?s=case.closed opens built content | app/state-map.js:1825; plan v3.2 B4 |
| S-360-case.closed-availability-ended | ?s=case.closed-availability-ended opens built content | app/state-map.js:1832; plan v3.2 B4 |
| S-360-rx.load-failed | ?s=rx.load-failed opens built content | app/state-map.js:1839; plan v3.2 B4 |
| S-360-prescribe.dose-error | ?s=prescribe.dose-error opens built content | app/state-map.js:1846; plan v3.2 B4 |
| S-360-call.hold | ?s=call.hold opens built content | app/state-map.js:1853; plan v3.2 B4 |
| S-360-flow.HOLD | ?s=flow.HOLD opens built content | app/state-map.js:1860; plan v3.2 B4 |
| S-390-home_active | ?s=home_active opens built content | app/state-map.js:467; plan v3.2 B4 |
| S-390-home_add-failed | ?s=home_add-failed opens built content | app/state-map.js:478; plan v3.2 B4 |
| S-390-home_add-wheel | ?s=home_add-wheel opens built content | app/state-map.js:489; plan v3.2 B4 |
| S-390-home_added | ?s=home_added opens built content | app/state-map.js:500; plan v3.2 B4 |
| S-390-home_adding | ?s=home_adding opens built content | app/state-map.js:511; plan v3.2 B4 |
| S-390-home_end-confirmation | ?s=home_end-confirmation opens built content | app/state-map.js:522; plan v3.2 B4 |
| S-390-home_expired-pending | ?s=home_expired-pending opens built content | app/state-map.js:533; plan v3.2 B4 |
| S-390-home_idle-expired | ?s=home_idle-expired opens built content | app/state-map.js:544; plan v3.2 B4 |
| S-390-home_logout-confirm | ?s=home_logout-confirm opens built content | app/state-map.js:555; plan v3.2 B4 |
| S-390-home_manually-ended | ?s=home_manually-ended opens built content | app/state-map.js:566; plan v3.2 B4 |
| S-390-home_near-expiry | ?s=home_near-expiry opens built content | app/state-map.js:577; plan v3.2 B4 |
| S-390-home_no-cases | ?s=home_no-cases opens built content | app/state-map.js:588; plan v3.2 B4 |
| S-390-home_offline | ?s=home_offline opens built content | app/state-map.js:599; plan v3.2 B4 |
| S-390-home_profile | ?s=home_profile opens built content | app/state-map.js:610; plan v3.2 B4 |
| S-390-home_profile-case-open | ?s=home_profile-case-open opens built content | app/state-map.js:621; plan v3.2 B4 |
| S-390-home_request-failed | ?s=home_request-failed opens built content | app/state-map.js:634; plan v3.2 B4 |
| S-390-home_requesting | ?s=home_requesting opens built content | app/state-map.js:645; plan v3.2 B4 |
| S-390-home_setting | ?s=home_setting opens built content | app/state-map.js:656; plan v3.2 B4 |
| S-390-home_setup-failed | ?s=home_setup-failed opens built content | app/state-map.js:667; plan v3.2 B4 |
| S-390-home_setup-wheel | ?s=home_setup-wheel opens built content | app/state-map.js:678; plan v3.2 B4 |
| S-390-home_stop-pending | ?s=home_stop-pending opens built content | app/state-map.js:689; plan v3.2 B4 |
| S-390-home_unknown-result | ?s=home_unknown-result opens built content | app/state-map.js:700; plan v3.2 B4 |
| S-390-a-back-blocked | ?s=a-back-blocked opens built content | app/state-map.js:711; plan v3.2 B4 |
| S-390-a-confirm-busy | ?s=a-confirm-busy opens built content | app/state-map.js:727; plan v3.2 B4 |
| S-390-a-confirm-failed | ?s=a-confirm-failed opens built content | app/state-map.js:743; plan v3.2 B4 |
| S-390-a-leave-sheet | ?s=a-leave-sheet opens built content | app/state-map.js:759; plan v3.2 B4 |
| S-390-a-load-failed | ?s=a-load-failed opens built content | app/state-map.js:772; plan v3.2 B4 |
| S-390-a-loading | ?s=a-loading opens built content | app/state-map.js:786; plan v3.2 B4 |
| S-390-a-long-content | ?s=a-long-content opens built content | app/state-map.js:800; plan v3.2 B4 |
| S-390-a-no-medicines | ?s=a-no-medicines opens built content | app/state-map.js:811; plan v3.2 B4 |
| S-390-a-notes-typing | ?s=a-notes-typing opens built content | app/state-map.js:824; plan v3.2 B4 |
| S-390-a-offline | ?s=a-offline opens built content | app/state-map.js:835; plan v3.2 B4 |
| S-390-a-offline-action | ?s=a-offline-action opens built content | app/state-map.js:848; plan v3.2 B4 |
| S-390-a-order-details | ?s=a-order-details opens built content | app/state-map.js:861; plan v3.2 B4 |
| S-390-a-release-failed | ?s=a-release-failed opens built content | app/state-map.js:872; plan v3.2 B4 |
| S-390-a-releasing | ?s=a-releasing opens built content | app/state-map.js:886; plan v3.2 B4 |
| S-390-a-rx-viewer | ?s=a-rx-viewer opens built content | app/state-map.js:899; plan v3.2 B4 |
| S-390-a-scrolled | ?s=a-scrolled opens built content | app/state-map.js:910; plan v3.2 B4 |
| S-390-a-top | ?s=a-top opens built content | app/state-map.js:921; plan v3.2 B4 |
| S-390-d-rx-failed | ?s=d-rx-failed opens built content | app/state-map.js:932; plan v3.2 B4 |
| S-390-s-10-medicines | ?s=s-10-medicines opens built content | app/state-map.js:943; plan v3.2 B4 |
| S-390-s-medicine-disabled | ?s=s-medicine-disabled opens built content | app/state-map.js:954; plan v3.2 B4 |
| S-390-s-optional-empty | ?s=s-optional-empty opens built content | app/state-map.js:967; plan v3.2 B4 |
| S-390-s7e-leave-sheet | ?s=s7e-leave-sheet opens built content | app/state-map.js:978; plan v3.2 B4 |
| S-390-d-alt-days | ?s=d-alt-days opens built content | app/state-map.js:991; plan v3.2 B4 |
| S-390-d-cream | ?s=d-cream opens built content | app/state-map.js:1002; plan v3.2 B4 |
| S-390-d-default | ?s=d-default opens built content | app/state-map.js:1013; plan v3.2 B4 |
| S-390-d-disable-sheet | ?s=d-disable-sheet opens built content | app/state-map.js:1024; plan v3.2 B4 |
| S-390-d-disabled | ?s=d-disabled opens built content | app/state-map.js:1035; plan v3.2 B4 |
| S-390-d-discard-sheet | ?s=d-discard-sheet opens built content | app/state-map.js:1046; plan v3.2 B4 |
| S-390-d-drops | ?s=d-drops opens built content | app/state-map.js:1057; plan v3.2 B4 |
| S-390-d-duration-picker | ?s=d-duration-picker opens built content | app/state-map.js:1068; plan v3.2 B4 |
| S-390-d-error-dose | ?s=d-error-dose opens built content | app/state-map.js:1079; plan v3.2 B4 |
| S-390-d-error-other | ?s=d-error-other opens built content | app/state-map.js:1090; plan v3.2 B4 |
| S-390-d-every-x-hours | ?s=d-every-x-hours opens built content | app/state-map.js:1101; plan v3.2 B4 |
| S-390-d-food-selected | ?s=d-food-selected opens built content | app/state-map.js:1112; plan v3.2 B4 |
| S-390-d-header-white | ?s=d-header-white opens built content | app/state-map.js:1123; plan v3.2 B4 |
| S-390-d-inhaler | ?s=d-inhaler opens built content | app/state-map.js:1134; plan v3.2 B4 |
| S-390-d-injection-default | ?s=d-injection-default opens built content | app/state-map.js:1145; plan v3.2 B4 |
| S-390-d-monthly | ?s=d-monthly opens built content | app/state-map.js:1156; plan v3.2 B4 |
| S-390-d-notes-keyboard | ?s=d-notes-keyboard opens built content | app/state-map.js:1167; plan v3.2 B4 |
| S-390-d-scrolled | ?s=d-scrolled opens built content | app/state-map.js:1178; plan v3.2 B4 |
| S-390-d-sos-on | ?s=d-sos-on opens built content | app/state-map.js:1189; plan v3.2 B4 |
| S-390-d-sos-only | ?s=d-sos-only opens built content | app/state-map.js:1200; plan v3.2 B4 |
| S-390-d-syrup | ?s=d-syrup opens built content | app/state-map.js:1211; plan v3.2 B4 |
| S-390-d-weekly | ?s=d-weekly opens built content | app/state-map.js:1222; plan v3.2 B4 |
| S-390-c-callback | ?s=c-callback opens built content | app/state-map.js:1233; plan v3.2 B4 |
| S-390-c-callback-error | ?s=c-callback-error opens built content | app/state-map.js:1246; plan v3.2 B4 |
| S-390-c-callback-failed | ?s=c-callback-failed opens built content | app/state-map.js:1259; plan v3.2 B4 |
| S-390-c-callback-refused | ?s=c-callback-refused opens built content | app/state-map.js:1272; plan v3.2 B4 |
| S-390-e-availability-ended | ?s=e-availability-ended opens built content | app/state-map.js:1285; plan v3.2 B4 |
| S-390-e-callback-scheduled | ?s=e-callback-scheduled opens built content | app/state-map.js:1298; plan v3.2 B4 |
| S-390-s7a-calling | ?s=s7a-calling opens built content | app/state-map.js:1311; plan v3.2 B4 |
| S-390-s7b-still-on-call | ?s=s7b-still-on-call opens built content | app/state-map.js:1324; plan v3.2 B4 |
| S-390-s7d-result-missing | ?s=s7d-result-missing opens built content | app/state-map.js:1339; plan v3.2 B4 |
| S-390-s7d-unavailable-sheet | ?s=s7d-unavailable-sheet opens built content | app/state-map.js:1352; plan v3.2 B4 |
| S-390-s7f-submitted | ?s=s7f-submitted opens built content | app/state-map.js:1365; plan v3.2 B4 |
| S-390-t01-ready | ?s=t01-ready opens built content | app/state-map.js:1378; plan v3.2 B4 |
| S-390-t02-calling | ?s=t02-calling opens built content | app/state-map.js:1391; plan v3.2 B4 |
| S-390-t03-not-through | ?s=t03-not-through opens built content | app/state-map.js:1404; plan v3.2 B4 |
| S-390-t04-doctor-missed | ?s=t04-doctor-missed opens built content | app/state-map.js:1417; plan v3.2 B4 |
| S-390-t05-result-wait | ?s=t05-result-wait opens built content | app/state-map.js:1430; plan v3.2 B4 |
| S-390-t06-ended-early | ?s=t06-ended-early opens built content | app/state-map.js:1444; plan v3.2 B4 |
| S-390-t08a-valid-cat4 | ?s=t08a-valid-cat4 opens built content | app/state-map.js:1459; plan v3.2 B4 |
| S-390-t08c-confirm-blocked | ?s=t08c-confirm-blocked opens built content | app/state-map.js:1472; plan v3.2 B4 |
| S-390-t09-patient-unavailable | ?s=t09-patient-unavailable opens built content | app/state-map.js:1485; plan v3.2 B4 |
| S-390-t10a-confirmed | ?s=t10a-confirmed opens built content | app/state-map.js:1498; plan v3.2 B4 |
| S-390-home.add-open | ?s=home.add-open opens built content | app/state-map.js:1804; plan v3.2 B4 |
| S-390-home.setup | ?s=home.setup opens built content | app/state-map.js:1811; plan v3.2 B4 |
| S-390-case.back-before-call | ?s=case.back-before-call opens built content | app/state-map.js:1818; plan v3.2 B4 |
| S-390-case.closed | ?s=case.closed opens built content | app/state-map.js:1825; plan v3.2 B4 |
| S-390-case.closed-availability-ended | ?s=case.closed-availability-ended opens built content | app/state-map.js:1832; plan v3.2 B4 |
| S-390-rx.load-failed | ?s=rx.load-failed opens built content | app/state-map.js:1839; plan v3.2 B4 |
| S-390-prescribe.dose-error | ?s=prescribe.dose-error opens built content | app/state-map.js:1846; plan v3.2 B4 |
| S-390-call.hold | ?s=call.hold opens built content | app/state-map.js:1853; plan v3.2 B4 |
| S-390-flow.HOLD | ?s=flow.HOLD opens built content | app/state-map.js:1860; plan v3.2 B4 |
| A-EDGE-1 | C0>C7b:3 min, no result, end not known | app/state-map.js edge C0>C7b:3 min, no result, end not known; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-2 | C0>C7c:3 min, no result, hang-up reported | app/state-map.js edge C0>C7c:3 min, no result, hang-up reported; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-3 | C0>RES:hang-up reported → 5 Getting call result → result | app/state-map.js edge C0>RES:hang-up reported → 5 Getting call result → result; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-4 | C0>RES:result (no screen: stays on Calling) | app/state-map.js edge C0>RES:result (no screen: stays on Calling); ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-5 | C6>C0:Call again | app/state-map.js edge C6>C0:Call again; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-6 | C6>CB:Callback | app/state-map.js edge C6>CB:Callback; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-7 | C7b>C0:Still talking | app/state-map.js edge C7b>C0:Still talking; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-8 | C7b>C7c:Call ended | app/state-map.js edge C7b>C7c:Call ended; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-9 | C7c>C7d:nothing found | app/state-map.js edge C7c>C7d:nothing found; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-10 | C7c>RES:result found | app/state-map.js edge C7c>RES:result found; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-11 | C7d>C7f:Confirm | app/state-map.js edge C7d>C7f:Confirm; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-12 | C7d>CB:Callback | app/state-map.js edge C7d>CB:Callback; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-13 | C7d>P9:Unavailable + reason | app/state-map.js edge C7d>P9:Unavailable + reason; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-14 | C7f>E10a:record over the gate | app/state-map.js edge C7f>E10a:record over the gate; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-15 | C7f>HOLD:record under the gate or none in time | app/state-map.js edge C7f>HOLD:record under the gate or none in time; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-16 | C8>E10a:Confirm prescription | app/state-map.js edge C8>E10a:Confirm prescription; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-17 | CALL>C0:Cat4 / HA skipped | app/state-map.js edge CALL>C0:Cat4 / HA skipped; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-18 | CALL>E3:doctor's leg failed | app/state-map.js edge CALL>E3:doctor's leg failed; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-19 | CALL>P9:patient's side failed (any time) | app/state-map.js edge CALL>P9:patient's side failed (any time); ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-20 | CB>ECB:time chosen | app/state-map.js edge CB>ECB:time chosen; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-21 | E3>CALL:Call again | app/state-map.js edge E3>CALL:Call again; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-22 | E3>LEAVE:Back | app/state-map.js edge E3>LEAVE:Back; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-23 | R1>CALL:Call patient | app/state-map.js edge R1>CALL:Call patient; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-24 | R1>LEAVE:Back | app/state-map.js edge R1>LEAVE:Back; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-25 | RES>C6:too short | app/state-map.js edge RES>C6:too short; ui-screens/app-logic.md:133-160,176-190 |
| A-EDGE-26 | RES>C8:over the gate | app/state-map.js edge RES>C8:over the gate; ui-screens/app-logic.md:133-160,176-190 |
| A-GATE--1 | partner result at gate minus 1 second | ui-screens/app-logic.md:116-125,143,190-194; plan v3.2 B8-B12 |
| A-GATE-0 | partner result at gate plus 0 second | ui-screens/app-logic.md:116-125,143,190-194; plan v3.2 B8-B12 |
| A-GATE-1 | partner result at gate plus 1 second | ui-screens/app-logic.md:116-125,143,190-194; plan v3.2 B8-B12 |
| A-GATE-live-cat4 | Cat4 cannot unlock from local live time alone | ui-screens/app-logic.md:116-125,143,190-194; plan v3.2 B8-B12 |
| A-GATE-sum | counted talk time adds across calls on same case | ui-screens/app-logic.md:116-125,143,190-194; plan v3.2 B8-B12 |
| A-GATE-min | sub-minimum call is excluded from accumulated talk time | ui-screens/app-logic.md:116-125,143,190-194; plan v3.2 B8-B12 |
| A-GATE-window | old talk time outside window cannot unlock next short call | ui-screens/app-logic.md:116-125,143,190-194; plan v3.2 B8-B12 |
| A-GATE-retry | short calls have no doctor retry cap | ui-screens/app-logic.md:116-125,143,190-194; plan v3.2 B8-B12 |
| A-RECORD-under-gate | submitted prescription unproven: under-gate | ui-screens/app-logic.md:125,143; calling-flow/data.js:158-161 |
| A-RECORD-never | submitted prescription unproven: never | ui-screens/app-logic.md:125,143; calling-flow/data.js:158-161 |
| A-RECORD-no-answer | submitted prescription unproven: no-answer | ui-screens/app-logic.md:125,143; calling-flow/data.js:158-161 |
| A-ROUTE-cat4 | Cat4-style route: cat4 | ui-screens/app-logic.md:116-125,143,190-194; plan v3.2 B8-B12 |
| A-ROUTE-pilot_ha_skipped_customer | Cat4-style route: pilot_ha_skipped_customer | ui-screens/app-logic.md:116-125,143,190-194; plan v3.2 B8-B12 |
| A-ROUTE-pilot_ha_skipped_system | Cat4-style route: pilot_ha_skipped_system | ui-screens/app-logic.md:116-125,143,190-194; plan v3.2 B8-B12 |
| A-COUNT-once | one successful confirm logs exactly once after reload | ui-screens/app-logic.md:116-125,143,190-194; plan v3.2 B8-B12 |
| A-OPTIONS-d-default | approved schedule/duration choices: d-default | ui-screens/app-logic.md:223,240-243 |
| A-OPTIONS-d-every-x-hours | approved schedule/duration choices: d-every-x-hours | ui-screens/app-logic.md:223,240-243 |
| A-OPTIONS-d-duration-picker | approved schedule/duration choices: d-duration-picker | ui-screens/app-logic.md:223,240-243 |
| A-SOS-d-sos-only | SOS total dose and unit: tablet | ui-screens/app-logic.md:241,251 |
| A-SOS-d-inhaler | SOS total dose and unit: puffs | ui-screens/app-logic.md:241,251 |
| A-SOS-d-cream | SOS total dose and unit: times | ui-screens/app-logic.md:241,251 |
| A-PROFILE-cancelled | Profile faster sign-in on: cancelled | ui-screens/app-logic.md:75-76 |
| A-PROFILE-enable-failed | Profile faster sign-in on: enable-failed | ui-screens/app-logic.md:75-76 |

Each edge case opens its source stage, performs the action or advances the public simulator/clock, and asserts destination copy/actions. A separately opened destination picture is never accepted as transition proof. Backend-only outcomes require public reviewer log evidence; see supplemental checks for limits of that evidence.

## Source precedence and assumptions

Project decisions and app-logic govern product behavior; the registry governs final notice wording (for example `call.resultMissing`, not stale prose quoted in older tables). Settings supply durations and their rule/mock provenance. Source line ranges are from the files read for this test-authoring run. `REVIEW-CHECKS.md` source paths are relative to `ui-screens/` unless prefixed by `docs/`, `calling-flow/`, or plan/brief titles.

No new product behavior is inferred for open questions. Simulator enum names, lifted markup IDs and fixture continuation are test adapter assumptions listed in the shared README. Report adapter mismatches separately from a demonstrated flow-rule failure. No production data, real phone calls or message sending is needed.
