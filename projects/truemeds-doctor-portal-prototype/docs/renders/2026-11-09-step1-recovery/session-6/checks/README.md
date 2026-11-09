# Session 6 checks (2026-11-09) — `run-all.sh`, one log per check

Last full run, after 6a and the D-94 capture changes. `ui-screens/` still holds the OLD pictures, because step 5 waits for the main thread.

| Check | Result |
|---|---|
| `tests/entry-journeys.mjs` | 60 / 60 (F5d rewritten for the bar notice) |
| `tests/run-checks.mjs` | 78 / 78 |
| `docs/layout_check.py` / `--app` | ALL PASS / ALL PASS |
| `ui-screens/feedback/check-locked-specs.py` | 0 failures, 148 states × 3 (incl. `case.html` with the `a-confirm-busy` race fix) |
| `ui-screens/feedback/check-sources.mjs` | PASS |
| `brand/check_lockup.py` | PASS |
| `tests/scan.mjs` | 0 failures |
| `scripts/check-state-map.mjs` | 0 drift (148 pictures; `offer_unavailable` is still a behaviour row until step 5) |
| `tests/compare-step1.mjs` against `ui-screens/` | **exact 0 · accepted 70 · failed 14**. This is expected until step 5. The 14 failures are the 7 returning-unlock states × 2 widths, the D-92 pictures rendered on this Mac with GPU raster. They have no anti-aliasing allowance (they were exact under the old capture), and the D-94 capture uses software raster. Every other picture is accepted under the existing old-Mac anti-aliasing rule. The `compare/` folder was restored to the committed session-5 evidence, not overwritten with this interim run. |
| `tests/compare-step1.mjs` against `session-6/new/`, anti-aliasing rule **off** (`NO_AA=1 PICTURES=… OUT=session-6/compare-preview`) | **exact 78 · accepted 6 · failed 0**: the 6 are the three listed "call Doctor Ops" regions × 2 widths. This is what step 5 should give (`compare-preview/results.md`). |
| old `index.html` / `app.js` / `styles.css` | unchanged |
