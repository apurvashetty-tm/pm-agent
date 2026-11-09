Found **3 blockers and 2 should-fix gaps** within A2 scope. Read-only review; no files changed. Passing-test status is user-provided; I inspected the assertions without rerunning the browser suite.

| Severity | File / line | Correctness gap | Spec |
|---|---|---|---|
| **Blocker** | [case.js:361](app/screens/case.js:361) | **Unclear confirmation never reconciles.** `confirm-busy` returns with `ui.confirming` set, but no subsequent check can resolve it. Changing the simulator to saved/failed also leaves it stuck. Confirmation state is local UI state, so leaving through Help or reloading loses the busy guard and permits another submission. | [app-logic.md:191](ui-screens/app-logic.md:191): check the unclear result, then show success/failure; never a second submit. |
| **Blocker** | [case.js:252](app/screens/case.js:252), [case.js:380](app/screens/case.js:380) | **7d confirmation leaves Callback and Unavailable active.** While Confirming, either can still close the case. The pending confirmation callback then runs against that changed case and can overwrite its outcome as confirmed. | [app-logic.md:191](ui-screens/app-logic.md:191): everything else disabled during confirmation. |
| **Blocker** | [case.js:432](app/screens/case.js:432), [case.js:392](app/screens/case.js:392) | **Late results do not revoke ineligible sheets.** Open Callback or Unavailable on 7d, then receive a valid result: the sheet remains because polling dismisses it only when the case closes. Callback can still schedule, and Unavailable can still close, from the now-valid stage. Neither handler checks stage eligibility. | [app-logic.md:145](ui-screens/app-logic.md:145), [205](ui-screens/app-logic.md:205), [209](ui-screens/app-logic.md:209): valid state has Confirm only; Callback only on 6/7d; doctor Unavailable only on 7d. |
| **Should-fix** | [call-engine.js:54](app/core/call-engine.js:54), [call-engine.js:126](app/core/call-engine.js:126) | **Hold/retry is only log text.** Automatic unavailable and unproven submissions record no retry deadline/count or scheduled transition. Advancing through the configured gap cannot exercise retries or their limit. | [app-logic.md:123](ui-screens/app-logic.md:123), [144](ui-screens/app-logic.md:144), [208](ui-screens/app-logic.md:208); [REVIEW-CHECKS.md:24](tests/codex/run-A/REVIEW-CHECKS.md:24). |
| **Should-fix** | [call-engine.js:27](app/core/call-engine.js:27), [call-engine.js:41](app/core/call-engine.js:41) | **The simulator cannot verify answer-anchored talk time.** Attempts store only tap time; end/result timing derives from that timestamp. There is no distinct patient-answer timestamp or ringing interval. `R16-b` merely clamps a long call’s reported duration below the gate; it does not simulate its claimed “long ring before the answer.” | [app-logic.md:114](ui-screens/app-logic.md:114), [118–121](ui-screens/app-logic.md:118); [REVIEW-CHECKS.md:22](tests/codex/run-A/REVIEW-CHECKS.md:22). |

**Step 5 scenarios without passing-test evidence**

No missing executable `CASES.md` scenario identified, given the supplied all-passing status. However, its linked supplemental acceptance checks remain partially uncovered:

- **A-R16:** distinct patient-answer anchoring; equivalent real-time/fast-forward execution. `R16-b` does not establish anchoring.
- **A-R17:** vendor/end-event combinations, especially HA-skipped Pilot.
- **A-R18:** actual scheduled retries and attempt exhaustion. `R18-d` asserts only the policy’s log sentence.
- **A-R20:** unclear-confirm reconciliation and duplicate prevention across reopen; disabling 7d secondary actions during confirmation. `A-F03` checks that busy persists, not that reconciliation completes.
- **A-R15:** saved/printed note payload semantics; clearing callback/unavailable notes alone does not prove these.

The late-result sheet race also has no regression test in the inspected suites.