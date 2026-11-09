# Merge triage Round 2 (Codex confirmation round on v0.4)

Codex report: `codex-round-2.md` (P0 0 · P1 2 · P2 0). Facts checked here against the frozen sources before each verdict.

| Finding | Severity | Verdict | Reason | Source checked |
|---|---|---|---|---|
| §5.7: "on a live Pilot call" also covers Pilot cases with the HA call already skipped, which must wait for the partner result | P1 | ADOPT | Verified: HA-skipped Pilot runs the Cat4 path (C0 "Next actions unlock only when the partner's call result arrives"; T17 "No confirm on the live call after Skip HA"). The round-1 sentence was too broad; narrowed to "a live Pilot call that still has a Health Advisor call to come", and "every other call" now names Cat4 and HA-skipped Pilot. New evidence, not a re-raise | `ui-screens/app-logic.md:120–121`; `calling-flow/data.js` C0, RES, T17 |
| §7: talk-time adding rule ("at least about 10 s, within about 30 min") has no exact boundary or window anchor | P1 | ADOPT (as an open item) | Verified: the sources themselves are approximate (AL §5 "each at least ~10 s, within ~30 min"; data.js RES the same). The PRD can't invent the exact rule, so §7 stays as is and §10 gets one open question with an owner [Product + Engineering]. Not a launch blocker: §7 values are starting values | `ui-screens/app-logic.md:117`; `calling-flow/data.js` RES rules |
| rule-tests.md: 69 rules, 2 UNCLEAR | — | Noted | The two UNCLEAR rules are exactly the two findings above. After v0.5, RT-05 is clear (PRD wording now matches the sources); RT-54 stays parametrised until the §10 question is answered | `rule-tests.md` RT-05, RT-54 |

## Summary by verdict

| Verdict | Count |
|---|---|
| ADOPT | 2 (both P1) |
| REJECT | 0 |
| NEEDS-APURVA | 0 |
| OUT-OF-SCOPE | 0 (Codex's own out-of-scope list: boundary tests and device telephony tests → Engineering / QA) |
