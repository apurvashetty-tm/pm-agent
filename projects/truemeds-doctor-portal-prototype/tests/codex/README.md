# Codex tests first — runs A and B

Scope: TERMINAL-BRIEF.md, “Codex in each run”, step 1 only. No app implementation was read to derive expectations. Allowed inputs: app-logic, approved screen references, feedback state map, plan, generated state map, copy registry, settings and synthetic data. Existing entry-journeys/run-checks were read for the public test driver contract. tm-chotu v0.4.3 (2026-08-25), Rx cadence, was consulted for orientation; project decisions govern these prototype tests.

Run from the project directory (dependencies already live in tests/node_modules):

```sh
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/codex/run-A/all.mjs
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/codex/run-B/all.mjs
```

Use `--list` for the inventory without a browser/server. `CODEX_FILTER=A-GATE` selects tests by ID/name. `CODEX_BASE_URL=http://localhost:8000/app/` uses an already prepared server. With no URL the harness serves app/ on an ephemeral loopback port. Run A and B sequentially. Any failed assertion exits nonzero; no skip/expected-failure masks. No screenshots, generated app files, dependencies, server state or reports are written by the runner. Browser storage is isolated per case.

Validation here: syntax checks and inventory generation only. Browser execution is **not validated**: the sandbox refused listening on loopback (`listen EPERM`). The implementation runs belong to the build thread. No claim that the current app passes.

## Definition of done for these test artifacts

- [auto] Both run inventories import without loading any screen/core implementation (settings is the explicit allowed exception).
- [auto] Every launch calling-flow edge has an executable test recipe; version A edges remain excluded.
- [auto] Each test identifies a spec source; state-address tests carry exact generated-map lines.
- [eye] CASES.md covers all scoped rules, including manual/device checks and any automation limits.
- [auto] Only tests/codex/ files are written; no commit or shared context update.
- [eye] Main thread reviews test assumptions/disputes against the spec before using failures to require an app change.

The user's explicit tests-first instruction authorizes this work against the already approved v3.2 plan/D-95. No new product decisions or approvals are recorded.

## Driver contract and limits — review before interpreting failures

The public shell controls `#rp-<field>`, `#rp-jump-go`, `#rp-restart`, `#rp-add-attempt`, `#rp-link`, and `window.__tm.clock.fastForward()` match the existing tests. App locators use accessible button names and the approved reference IDs; no private store/server mutation, core imports, or screen implementation inspection is used. Assertions of registry-owned notices resolve messages.json dynamically, including updated copy. Labels not yet in the registry are the approved screen labels. Registry keys must exist; there is no fallback copy.

These are **test adapter assumptions to verify during the build**, not new UI/product requirements:

- Reference IDs survive the markup lift (`#medicines-list`, `#doctor-notes-input`, `#symptoms-input`, `#ps-note`, `#ps-prints-text`, `#ch-name`). Equivalent accessible locators can be proposed as adapter corrections.
- The simulator accepts the B9 semantic choices used by these tests: connected under/over gate; doctorFailure 3/4; patientFailure causes; record over/under gate, never, no-answer; hangup reported; ha free/none/request-failed. Only some raw values are demonstrated in existing tests. If enum spelling differs, record the mismatch, then map the semantic value in the driver; do not change the expected behavior.
- `rules.mjs` exact-duration tests need a visible per-call length input (`rp-length`, `rp-callLength`, or `rp-duration`) in seconds. If the current simulator only offers categorical lengths, these boundary tests cannot run unchanged. Expose/configure the existing B9 length through its review controls, or report a testability gap. Do not claim gate-boundary coverage from an over/under category alone.
- The late-record scenario uses a semantic `recordDelay=late` choice. Its actual enum/field needs verification against the reviewer UI, without reading screen logic into the oracle.
- Fixtures entered by `?s=` / review jump must include the backend/call stage needed to continue the flow. A picture-only fixture is insufficient for transition tests. Some event recipes change the story mid-stage; verify that the public simulator applies these to the active attempt. If it only snapshots at Call, configure the attempt before starting the journey and walk to the same source stage instead. This is an adapter repair, not evidence of a product bug.
- Backend hold/retry, saved reasons, mismatch and exactly-once completion are asserted through the public reviewer event log. Log parsing is intentionally separate from private state. Event names are Engineering's choice: propose equivalent semantic patterns if necessary. Exact earnings arithmetic and actual hold retry scheduling still need the checks marked eye in CASES.md; seeing a “retry” log alone does not prove either.

Do not automatically fix the app for an adapter mismatch. Per brief, list any contradiction with spec evidence for the main thread in its test-disputes report. This session only writes under tests/codex/.

State-address checks run at both approved widths. They require nonempty real content, no shell-picture/figure stand-in, no missing registry tokens, and no JS exceptions. They are smoke checks, not pixel assertions. Normal flowing UI is tested separately; address coverage alone never proves behavior. The edge suite takes identities from the map but uses independently written actions/assertions; unknown edges fail rather than silently disappear.
