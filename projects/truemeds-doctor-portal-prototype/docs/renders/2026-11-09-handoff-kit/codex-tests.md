Created only under `tests/codex/handoff/`:

- [CASES.md](tests/codex/handoff/CASES.md): source-cited automated and manual acceptance checks.
- [handoff.test.mjs](tests/codex/handoff/handoff.test.mjs): Node acceptance suite.

Syntax and source-oracle checks pass. Full acceptance currently fails against the incomplete kit; the builder also fails with `ModuleNotFoundError: No module named 'build'`, so stale-source detection remains unverified.

No `app/` code read or changed.