# Session 3 — response to Codex critique 1

Critique: `codex-critique-1.md` — 0 blockers, 2 should-fix, 1 nice-to-have. No blockers, so no re-run (brief: re-run only if it raised blockers).

| # | Point | Done |
|---|---|---|
| S1 | Returning unlock prefers the stored enrolment method over what the phone can do now | **Adopted.** `app/core/faster-signin.js` `unlockState()` now follows the phone's current capability (D-64): fingerprint / face, else screen lock, else unavailable. The method turned on is kept only as a record. Root cause of the original shortcut: the review story reset on reload, so the "phone" forgot what it had. Fixed in `app/core/boot.js`: in review mode the story (the simulated phone and server) is kept in the review storage and restored on reopen; Reset clears it. New test **F6c** (fingerprint on → phone becomes screen lock only → unlock asks for screen lock; no screen lock → unavailable; panel shows the kept story). |
| S2 | `[OPEN DECISION]` for the phone answering "unavailable" on the offer is only in code | **Reported, not written.** The brief forbids session writes to `docs/context/` (except the OQ-021 note). Listed under NEEDS-APURVA / main thread in `SESSION-STATUS.md` with the placeholder (handled as a failed turn-on: "Couldn't turn on faster sign-in." · Try again · Not now) and the source gap (app-logic §2 lists turn-on outcomes enabled / cancelled / failed / offline only). |
| N1 | F8 comment says "demo always succeeds" but tests review only | **Adopted** — comment narrowed to review mode. Demo's always-success is in `core/unlock.js` `promptAnswer()` / `deviceOf()` (mode check). |

After the fixes: `entry-journeys.mjs` 55/55, `run-checks.mjs` 65/65, `scan.mjs`, `check-sources.mjs`, `check-locked-specs.py`, `layout_check.py` and `--app`, `check_lockup.py` all pass.
