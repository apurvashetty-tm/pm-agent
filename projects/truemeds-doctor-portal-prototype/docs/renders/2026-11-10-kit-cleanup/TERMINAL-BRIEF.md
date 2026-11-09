# Brief — kit viewer redesign (D-103), follow-up to the all-journeys kit run

Folder: the project folder (project branch). Evidence: this folder. **Aim: an hour or two.**

1. Read `docs/runs/RULINGS.md` — the 2026-11-10 00:46 entry is the spec. Read `docs/proposals/2026-11-10-kit-viewer-cleanup.md` (agreed, D-103) and the reference preview `docs/renders/2026-11-10-kit-cleanup/preview/viewer/`.
2. **If `handoff/viewer/` already matches D-103** (screen tabs, "When this shows", "Where it's used", downloads, no internal labels — check with the headless pass in the ruling): write `REPORT.md` saying so, append `DONE kit-redesign — already applied by handoff-kit-all`, publish, stop.
3. **Otherwise** apply D-103 in `scripts/build-handoff.mjs` (VIEWER_JS / VIEWER_HTML / data; downloads built by the script; "When this shows" lines for every state of every journey in the generator's config, plain words, from app-logic / feedback-state-map), regenerate `handoff/`, `--check` passes, all `tests/codex/handoff/` pass (a test that only checked a removed card → `test-disputes.md`, don't edit it), the headless pass from the ruling is clean on every tab / screen / state.
4. You may write only `scripts/build-handoff.*`, `handoff/`, this folder. One Codex review (correctness vs D-103 + the proposal's "Done when"), one fix pass.
5. `REPORT.md` (short). Append `DONE kit-redesign` or `STOPPED kit-redesign: <reason>` to `docs/runs/STATUS.md`, publish with `bash ../../scripts/publish.sh -m "..." <files>`, stop. No deploys.
