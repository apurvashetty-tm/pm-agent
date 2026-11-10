# Merge triage Round 1

| Finding | Severity | Verdict | Reason | Source checked |
|---------|----------|---------|--------|-----------------|
| §2: Cat4/Pilot unexplained | P2 | ADOPT | Readers outside team cannot distinguish case types at first mention; adding context in §2 helps without repeating §3 | PRD §2, §3 |
| §3: Rules repeated in body | P1 | REJECT | Agreed plan allows brief summary repetition; §3 scope and calling sections legitimately restate because they're rule homes | TRACE §3b, PRD-PLAN |
| §5.7 P0a: Confirm before gate contradicts no-result path | P0 | NEEDS-APURVA | The PRD rule forbids Confirm before gate; table allows it in no-result. The frozen flow confirms this is intentional (call-again recover path). Needs explicit statement in rule text, not just table mention. This affects app build authority | decision_log D-83, calling-flow/data.js:141/150/241 |
| §5.7 P0b: Gate authority contradiction (live Pilot vs post-call) | P0 | NEEDS-APURVA | PRD suggests partner duration proves gate; frozen sources say live Pilot gate uses patient-answer timestamp. Critical for button timing. Needs explicit distinction | ui-screens/app-logic.md:119, calling-flow/data.js:171 |
| §5.7: Callback/Unavailable both available in both cases | P1 | ADOPT | PRD text "Callback or Unavailable when too short or no result" implies both routes in both cases. §5.9 is correct. Fix wording to narrow. | PRD §5.7:280, §5.9 exact |
| §5.10: Prescribing controls (schedule, duration, food timing) missing | P1 | OUT-OF-SCOPE | These are existing app-logic rules (AL §8 rows 240–243). They belong in Engineering spec and test cases, not PRD which already links to app-logic. PRD correctly defers to app-logic table. | app-logic §8, PRD scope |
| §6: Help described as escape route but is blank | P1 | ADOPT | Help is promised in §6 as Doctor Ops reach when failures persist but is a blank placeholder (D-88). Text should say "Help is a placeholder in this release." | PRD §6:413, §9:460, decision_log D-88 pt 4 |
| §7: OTP mock values presented as launch defaults | P1 | ADOPT | Lock/window/resend values are marked MOCK in app-logic §2; TRACE cites no decision promoting them to production. Remove or mark `[MOCK]` and clarify these come from app-logic pending final values. | PRD §7:432–434, app-logic §2:41–43, TRACE L85 |
| §7: Settings owners unconfirmed but stated as agreed | P1 | NEEDS-APURVA | TRACE §1 L85 explicitly says owners are proposed and need approval. PRD wording "set by its owner" treats this as locked. Needs Apurva confirmation. | TRACE:85, PRD §7:418 |
| §9: Old PRD product constraints not accounted for (masking, recording, Super Doctor) | P1 | NEEDS-APURVA | Old PRD R1/R6 clinical and security items have no disposition: kept, dropped, or raised. Codex doubts whether they're properly "out" or just missing. Clarify scope explicitly with Apurva. | old_prd §11.2 R1–R3/R6, PRD §9 |
| §10: Late-record gate question already answered | P1 | ADOPT | PRD leaves open "What if record shows time < gate?" This is decided: no confirm/payment, retry, log mismatch (D-83 CW-D3/D4). Move from open to decided or remove question. | PRD §10:493, decision_log D-83 CW-D3/D4, calling-flow:154 |
| §11: Metrics denominators and definitions unclear | P1 | NEEDS-APURVA | Release rate, patient-unavailable rate, time-to-outcome all have ambiguous denominators. Proposed measures are acceptable even as [NEED]; definitions should be tighter. | PRD §11:528–532 |

## Summary by verdict

| Verdict | Count | Notes |
|---------|-------|-------|
| ADOPT | 5 | P2 case types clarity; P1 callback/unavailable wording; P1 Help placeholder; P1 mock values flag; P1 late-record answered |
| REJECT | 1 | P1 repeated rules (agreed structure) |
| NEEDS-APURVA | 5 | 2× P0 calling-gate rules; settings owners; old-PRD product constraints; metrics definitions |
| OUT-OF-SCOPE | 1 | Prescribing controls (belong in eng spec) |

**Proceed:** Run pre-check; adopt 5 findings; re-check; bump to v0.2; report NEEDS-APURVA items for Apurva's decision before final approval.

