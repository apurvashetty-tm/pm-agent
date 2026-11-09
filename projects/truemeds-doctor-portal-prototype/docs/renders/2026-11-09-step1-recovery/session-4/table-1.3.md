# Checklist 1.3 by eye — calling transitions vs app-logic (session 4, 2026-11-09)

Every transition in `docs/state-map.md` (generated from `calling-flow/data.js`) compared with `ui-screens/app-logic.md` §5 / §6 / §14 and decisions D-83 → D-89. "Fixed" = the generator gave the arrow the wrong route (it tagged an arrow with the type of the box it starts from); fixed in `scripts/build-state-map.mjs` (`ROUTE_FIX`, `screen` column), map regenerated, drift check 0. `calling-flow/data.js` is unchanged.

| Transition | Route in the map | Verdict | Source |
|---|---|---|---|
| R1 → CALL (Call patient), R1 → LEAVE (Back) | every (was cat4) | **fixed** — Ready is the same on every route | app-logic §5 row 1 |
| CALL → C0 / B0 / A11 / A2 (trunk) | split | matches (A11, A2 = version A, later) | D-87 pt 1–2, §6 Launch B |
| CALL → E3 (doctor's leg failed) | every (was cat4) | **fixed** | §5 rows 3–4, D-83 pt 5 (CW-B1) |
| CALL → P9 (patient's side failed, any time) | every (was cat4) | **fixed** | §5 rules, §14, D-83 pt 5–6 (CW-B1, CW-B2) |
| E3 → CALL (Call again), E3 → LEAVE (Back) | every (was cat4) | **fixed** | §5 rows 3–4, 7e |
| C0 → RES, Cat4 | cat4 (Knowlarity) · no screen, stays on `t02-calling` | **fixed** (was one arrow "via 5") | §5 row 5 "Cat4 never reaches 5", §14, D-83 pt 7 (CW-C2) |
| C0 → RES, HA skipped | ha-skipped (Ozonetel) · screen 5 `t05-result-wait` | **fixed** (new arrow) | same |
| C0 → C7b (3 min, end not known) | cat4 | matches — only Knowlarity can't know the end | §5 row 7b, D-83 pt 7 (CW-D1) |
| C0 → C7c (3 min, hang-up reported) | ha-skipped (Ozonetel) (was cat4) | **fixed** — only Ozonetel reports the hang-up | §5 rules "No call result", CW-D1 |
| C6 → C0 (Call again), C6 → CB (Callback) | shared | matches | §5 row 6, D-58 pt 23, CW-A1 |
| C6 → B0 (Call again, Pilot context kept) | pilot | matches (plan B4 normalising step) | plan v3.2 B4 |
| C7b → C0 / B0 (Still talking), C7b → C7c (Call ended) | shared / pilot | matches | §5 row 7b, 7c |
| C7c → C7d (nothing found), C7c → RES (found) | shared · screen `t05-result-wait` | matches (7c = 5, D-91) | §5 row 7c, D-91 |
| C7d → C7f (Confirm), → CB, → P9 (Unavailable + reason) | shared | matches | §5 row 7d, D-83 pt 8 (CW-D2), D-75 |
| C7f → E10a (record over the gate) | cat4 / ha-skipped (was shared) | **fixed** — the Pilot 7d ending is 10b | §5 row 7f, D-89 pt 1 |
| C7f → E10b (record over the gate, Pilot) | pilot | matches | D-89 pt 1 |
| C7f → HOLD (under the gate / none in time) | shared | matches | D-83 pt 9 (CW-D3, CW-D4) |
| RES → C6 (too short), RES → C8 (over the gate) | shared | matches | §5 rows 6, 8a |
| C8 → E10a (Confirm prescription) | shared | matches (Cat4, HA skipped, and 17's result path) | §5 row 8a, D-85 pt 2 |
| CB → ECB (time chosen) | shared | matches | §7 |
| B0 → B1 (gate passed, call live) | pilot | matches | §5 Launch B, D-83 pt 1 |
| B0 → RES (ended before the gate) | pilot · screen 5 `t05-result-wait` | matches (Ozonetel, known hang-up) | §5 rules, CW-C2 |
| B0 → B7d (no result: 7c, nothing) | pilot | matches | §5 row 7d Pilot, CW-D2 |
| B1 → B2 (Confirm prescription) | pilot | matches | §6 Launch B |
| B1 → T16 (ended after the gate, no Confirm) | pilot | matches | §5 Fallback B line, CW-F3 |
| B1 → T17 (Skip HA + reason) | pilot | matches | D-85 pt 1 |
| B2 → T13 (HA free), B2 → B3 (no HA free) | pilot | matches | §6 Launch B, D-87 pt 1 |
| B3 → EB3 (hang-up), EB3 → HOLD (result under the gate) | pilot | matches | CW-E3, CW-F2 |
| B7d → C7f (Confirm & forward), → CB, → P9 | pilot | matches | CW-D2, D-89 |
| T13 → E14 (HA rung: joins or doesn't pick up) | every (was pilot) | **fixed** — every route that transfers (B now, A later) | §5 Transfer, CW-E1 |
| T13 → T15 (couldn't start) | pilot | matches | §5 row 15, CW-E1 |
| T15 → E15 (hang-up), E15 → HOLD | pilot | matches | CW-E3, CW-F2 |
| T16 → E10a (Skip HA → Confirm prescription), T16 → E10b (Confirm & forward) | pilot | matches | D-58 pt 24, D-85 pt 3 |
| T17 → RES (result) | pilot · its own "Getting call result…" line (`t17-skip-ha-wait`) | matches | D-85 pt 1–2 |
| A11 → A12 → T13 / T16 / T17, A2 → A5 → A8b → E10b | A | matches (version A, not in the first build) | §6 version A table, D-87 pt 2 |

## Doubts for the main thread (not changed)

1. **Knowlarity call-ended event** — if Engineering finds Knowlarity does send a call-ended event (D-83 Engineering backlog), the hang-up would be known on Cat4 too. CW-C2 says Cat4 stays on Calling regardless; the simulator's "Call-ended event" switch only schedules the event. Confirm that Cat4 never shows 5 even with the event.
2. **Partner for Pilot HA-skipped** — the map assumes HA-skipped cases run on Ozonetel (app-logic §11 launch scenarios: "Cat4-style ending, Ozonetel"). The partner for Pilot Non-Value Meds is still open with Engineering (D-83). If an HA-skipped case can run on Knowlarity, its C0 → RES arrow would be the Cat4 one (no screen 5).
