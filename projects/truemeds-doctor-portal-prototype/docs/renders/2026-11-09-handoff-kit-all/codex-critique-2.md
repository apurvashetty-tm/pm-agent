All six first-review findings are **fixed**. No new blockers found.

| First-review finding | Status and evidence |
|---|---|
| Missing Tablet, Capsule and Drops dose rules | **Fixed** — short table rows preserved in [build-handoff.journeys.mjs:350](scripts/build-handoff.journeys.mjs:350); dose options and provenance present in [DECIDED.md:2480](handoff/DECIDED.md:2480). |
| Skip HA incorrectly implies confirmation | **Fixed** — choosing a reason changes the button or waits for the call result; it does not confirm. [build-handoff.when.mjs:162](scripts/build-handoff.when.mjs:162), reflected in `handoff/screens/case.json:1`. |
| Resend waits truncated | **Fixed** — array parser corrected at [build-handoff.journeys.mjs:318](scripts/build-handoff.journeys.mjs:318); complete sequence in [DECIDED.md:784](handoff/DECIDED.md:784). |
| Conflicting OTP mock values | **Fixed** — generator uses the current mock at [build-handoff.mjs:716](scripts/build-handoff.mjs:716); [DECIDED.md:356](handoff/DECIDED.md:356) and [DECIDED.md:770](handoff/DECIDED.md:770) agree. |
| Internal review debates leaked | **Fixed** — original-flag history stripped at [build-handoff.journeys.mjs:349](scripts/build-handoff.journeys.mjs:349); final answers at [DECIDED.md:2016](handoff/DECIDED.md:2016) and [2086](handoff/DECIDED.md:2086). |
| Release failure allows Back after patient answered | **Fixed** — Back explicitly stays hidden after an answer. [build-handoff.when.mjs:124](scripts/build-handoff.when.mjs:124), reflected in `handoff/screens/case.json:1`. |

Both fresh-AI fixes also pass:

- **Placeholder-only copy keys:** no incorrect visible-text assignments across `handoff/screens/*.json`. Names and medicine names are data; the disabled note uses `case.disabledMedicine`. Matcher fix: [build-handoff.journeys.mjs:183](scripts/build-handoff.journeys.mjs:183).
- **Spinner speed:** [handoff/AGENTS.md:49](handoff/AGENTS.md:49) explicitly points to `tokens.duration.spinner`.

Read-only `node scripts/build-handoff.mjs --check` passed. No files written.