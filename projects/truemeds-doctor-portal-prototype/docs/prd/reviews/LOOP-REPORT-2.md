# Loop report 2: Codex confirmation round on PRD v0.4 → v0.5

9 Nov 2026. Brief: `TERMINAL-BRIEF-2.md`. Codex run once (`codex exec -s workspace-write`, so it could create `rule-tests.md`); report in `codex-round-2.md`, triage in `merge-round-2.md`.

## Found

| Severity | Count | What |
|---|---|---|
| P0 | 0 | — |
| P1 | 2 | §5.7 validity rule too broad (HA-skipped Pilot); §7 talk-time adding rule has no exact boundary |
| P2 | 0 | — |

Codex checked the diff since v0.1, the whole of §5.7–§5.9 against app-logic §4–§7 and `data.js`, and §5.3 against D-93: no other issues. §5.3 agrees with D-93.

## What changed (v0.4 → v0.5)

1. **§5.7** "Who decides the call is valid": own count only "on a live Pilot call that still has a Health Advisor call to come"; "every other call (Cat4, and Pilot with the Health Advisor call skipped)" waits for the partner's result.
2. **§10** (Cases): new open question, "Which calls add up to the gate, exactly: the shortest call that counts and what the 30-minute window is measured from" [Product + Engineering].
3. Header bumped to v0.5; `CHECKLIST.md` status line; two `TRACE.md` rows.

Growth: 43,757 → 44,042 bytes (+0.65%).

## Rejected points

None. No earlier-judged points were re-raised.

## NEEDS-APURVA

- Not blocking: the exact talk-time adding rule (shortest call that counts, what the 30-minute window counts from) is now an open item in §10 with owner Product + Engineering. The sources only give approximate values, so the PRD doesn't guess them. Answer it whenever convenient; §7 keeps the approximate starting values until then.

## Checks

`node docs/prd/check-prd.mjs`: 17/17 PASS before and after the fix.

## rule-tests.md

69 rules from §5.7–§5.9 and §7, 69 given / when / then tests, each with its source line. 2 flagged UNCLEAR, and both match the P1s above:
- RT-05 (validity authority): resolved by the v0.5 wording.
- RT-54 (which calls add up): stays parametrised until the §10 question is answered.

No P0 remained, so there was no second Codex run.

## Files

Written only in `docs/prd/`: `PRD.md`, `TRACE.md`, `CHECKLIST.md`, `reviews/codex-round-2.md`, `reviews/rule-tests.md` (by Codex), `reviews/merge-round-2.md`, `reviews/LOOP-REPORT-2.md`. No commits, nothing in the decision log.
