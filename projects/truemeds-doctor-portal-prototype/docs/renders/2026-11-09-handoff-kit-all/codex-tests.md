Added H15–H24 and source-linked acceptance cases under `tests/codex/handoff/`. Retained H01–H14, removing prohibited app-code reads.

The suite checks journey/state coverage, picture bytes, element contracts, tokens/copy, raw values, components, decisions, leakage, viewer structure and isolated source freshness. Visual completeness remains an explicit review check.

Validation: 27 tests ran in under one second; 14 passed, 13 failed against the current incomplete/stale kit. Only the permitted test folder changed.