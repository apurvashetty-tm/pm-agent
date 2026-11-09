# Run B — response to the Codex critique (`codex-critique.md`)

All three findings adopted.

| # | Finding | Fix | Test |
|---|---|---|---|
| 1 (blocker) | A call that ends during B2 / 13 could still complete as Transferred and count. | `app/core/call-engine.js`: before B2 / 13 advance, the engine checks the call: if the hang-up was reported or the result arrived before the HA step was due, nothing was transferred → **16** (names who ended it; Confirm & forward · Skip HA), nothing counted. Time order kept, so a jump in time still lands right. | `tests/build-fast-b.mjs` BR02-c |
| 2 (should-fix) | A story that starts at Home or Case replaced the remembered open case on reopen. | `app/core/boot.js` `startParams`: opening the app with a case open goes back into it first, whatever the story's start (plan B12, app-logic §4). Restart story is unchanged (it still starts the story). | BR08 |
| 3 (should-fix) | 17 kept the end-of-call script after a reported hang-up. | `call-engine.js`: on 17 a reported hang-up moves to **5 Getting call result…** (no script, no buttons), the case stays HA-skipped; the result then gives 8a or 6 as before. | BR05-c |

**Coverage notes from the critique:**
- B-play-* (5): disputed (`test-disputes.md` #1); the same cases pass with the link read via `textContent`.
- "Desktop / phone parity through the final endings": the Codex cases stop at the eligible CTAs by design; the endings themselves are covered per path by the edge tests and BR03 / BR05 / BR06 / BR12; the sheet plays both Pilot paths to their endings at 390. A parity test to the final card would be a new Codex test — left for the main thread.
- B-R07 (every ending type when availability ends), B-R09 (every deadline in the background), B-R10 (reset / logout storage isolation): partly covered (B-expiry, BR07, BR09, B-background, B-open-profile, run-checks B6 / storage checks); the rest are listed in REPORT.md as not automated.
