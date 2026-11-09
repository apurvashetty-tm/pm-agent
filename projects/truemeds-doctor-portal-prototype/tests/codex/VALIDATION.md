# Validation evidence

- `node tests/codex/validate.mjs`: PASS. Verifies unique case IDs, spec references, executable functions, fixture IDs present in generated state map, and every launch edge assigned exactly once. Counts are printed from the declarations, not manually maintained.
- `node --check` passed for every authored runner/driver/suite module.
- `node tests/codex/run-A/all.mjs --list` and run B equivalent: PASS; inventories checked in alongside CASES.md.
- Browser/server execution: NOT RUN. A local-server probe failed with `Error: listen EPERM: operation not permitted 127.0.0.1`. No permission escalation attempted; approval policy disallows it.
- Behavioral pass/fail: UNKNOWN. Driver adapter assumptions (simulator enum spellings, exact length, delay field, continuation of state fixtures, log format) are explicitly documented in README.md. Supplemental REVIEW-CHECKS.md files list stronger assertions/device checks still needed; they are not represented as passing tests.
- Only tests/codex/ authored. No application changes, shared-record changes, commit, push or deployment.
