# Session 4 — response to Codex critique 1 (`codex-critique.md`)

| # | Codex point | Verdict | What changed |
|---|---|---|---|
| B1 | Event log can overflow the desktop page (50 entries, no height limit) | Adopted | `app/review/panel.js`: the log keeps the newest 10 entries (`LOG_SHOWN`); the row still shows the total count. Test P5 now fills the log with 60 long events before opening every row at 1280 × 800. |
| B2 | Spinner mask hides a missing or moved spinner | Adopted | `tests/compare-step1.mjs`: the mask applies only when the built page and the approved source both show the same number of spinners in the same box (1 css px). Otherwise the picture fails with "spinner missing or moved". |
| S1 | 1.3 audit table missing | Adopted | `session-4/table-1.3.md`: every transition with route, verdict (matches / fixed) and source line; two doubts for the main thread. The table was written alongside the critique run. |
| S2 | Jump omits behaviour-only states | Adopted | `app/core/boot.js` passes pictures and behaviour-only states; the jump list shows all 168 by plain name, grouped by journey. New test P2b checks the rendered options. |
| S3 | Drawer filtering stale after a width change | Adopted | `panel.js` re-applies the filtering on the 767 px breakpoint change, for the screen on show. New test P8b (1280 → 390 → 1280). |
| N1 | "Pictures (149, …)" heading hard-coded | Adopted | `scripts/build-state-map.mjs` prints the count; `docs/state-map.md` regenerated (148). |

Critique 1 raised blockers, so Codex was re-run once after these fixes (`codex-critique-2.md`).

## Critique 2 (`codex-critique-2.md`) — 1 blocker, 1 should-fix

| # | Codex point | Verdict | What changed |
|---|---|---|---|
| B1 | A spinner hidden by `visibility` or `opacity` still counts as present, so its mask could hide a missing drawing | Adopted | `tests/compare-step1.mjs`: a spinner counts only when `checkVisibility({ opacityProperty, visibilityProperty })` is true (spinner and ancestors). |
| S1 | Behaviour-only Jump entries open a raw-id card | Adopted for step 1 | `app/core/boot.js` `BEHAVIOUR_SCREEN`: `offer.shown` / `offer.cancelled` → the offer, `offer.enabled` / `offer.not-now` / `offer.unsupported` → Home (stub), `signin.locked-number` → OTP locked. New test P2c. Behaviour-only states of later steps (Home, case, calling) keep their card until their step builds the screen. |

Brief allows one re-run only; these fixes were verified by the checks (run-checks 78/78, compare 0 failed), not by a third Codex pass. Session 5's whole-step critique covers them.
