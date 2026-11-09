# Response to the Codex critique (`codex-critique.md`)

| # | Finding | Verdict | What changed |
|---|---|---|---|
| B1 | Inspector hotspots drift: % positions measured against a figure that also holds the caption | **Valid, fixed** | Hotspots now sit in an image-only wrapper (`.frame`) in the generated `viewer/viewer.js`. |
| B2 | Fresh-AI proof missing | Valid at the time (the critique ran in parallel with round 1) | Run per brief §9; transcripts and scores in `fresh-ai/`, summary in `REPORT.md`. |
| S1 | `--check` doesn't hash what the capture loads | **Valid, fixed** | `FILES.capture` (shell, routing, keyboard drawing, core modules the screen imports, fonts, brand) now in the source hashes: 45 → 67 files. Trade-off: other tabs' edits to the shell make the kit read as stale, which is correct (the measurements may move). |
| S2 | "Rejected" debate wording in DECIDED d13 | **Valid, fixed** | Rewritten to the positive rule at generation time: "On sign-in the keyboard does not open by itself, and the main button is not pinned to the bottom." (D-43). |
| S3 | MOCK guard only checks a fixed list | **Valid, fixed** | The build now scans the sign-in build files for `[MOCK ASSUMPTION]` and the mock settings the sign-in rules read; any unmapped one fails the build. |
| S4 | No `sheet.png` / `REPORT.md` | Valid at the time | Written at §11. |
| N1 | Duplicate filter condition in viewer | Fixed | — |
| N2 | OPEN o11 doesn't point to the answered links | Fixed | o11 now says sign-up URL and Doctor Ops number are answered (d11, d12); only Terms / Privacy open. |
| H05 | Fails on reference-page scaffolding | Not adopted (dispute) | See `test-disputes.md`. Codex itself calls the exemption reasonable; needs the main thread's ruling. |
| H09 | Not executed by the critic (read-only) | — | Runs green in the suite; extra mutation checks run by hand: sign-in CSS edit → out of date; quoted decision changed → out of date; unrelated decision-log edit → still up to date. |


## Second pass (`codex-critique-2.md`, re-run because the first raised blockers)

Verified fixed by Codex: B1, S2, N1, N2. Remaining:

| # | Finding | Verdict | What changed |
|---|---|---|---|
| R1 | Scoring counts the constants-file sizes and the two literals (`+91`, logo name) as clean; brief §9 says tokens / messages only | **Valid** | (Resolved later by D-98: tokens and message keys added — see third pass.) At the time not fixable inside the job: no token exists for border width (1), logo width (166), icon (20) or spinner (16) sizes, and no message key for `+91` or the logo's accessible name; `design-system/` and `ui-screens/` are read-only here. SCORES and REPORT now mark code as **conditional**; NEEDS-APURVA asks for the tokens / keys or an explicit exception. |
| R2 | No completed pass recorded | Timing (round 3 was running) | Round 3 scored in `fresh-ai/SCORES.md`. |
| R3 | S1 partial: `state-map.js`, `icons.js`, other global stylesheets not hashed | **Valid, fixed** | Added (67 → 72 source files). |
| R4 | S3: one blanket keyboard regex; ids never checked | **Valid, fixed** | Each MOCK entry matches its own line; the build fails if a MOCK maps to an id missing from OPEN.md. |
| R5 | REPORT.md missing | Timing | Written at §11. |
| R6 | Font source deviation | Valid — recorded | `google/fonts` ships only the variable TTF; static files are the upstream files at the commit Google Fonts pins (FONTS.md). Listed in NEEDS-APURVA for explicit acceptance. |

No third pass (brief: re-run once).

## Third pass (`codex-critique-3.md`, fix brief D-98)

Verified by Codex: tokens and keys resolve, zero unexplained red, scaffolding excluded, PNG logo exports + source hash, o06/o13/o14/o20 in DECIDED, font source recorded, `--check` passes, all 86 baseline / after compare pairs pixel-identical (80 exact, 6 accepted, 0 failed).

| # | Finding | Verdict | What changed |
|---|---|---|---|
| T1 | Round 4 fails strict code: logo `220 / 54` (both tools), spinner timing (both) | **Valid** | Logo: the kit's own AGENTS.md told them to type the ratio — fixed (take it from the PNG). Spinner timing: no motion token exists and D-98 doesn't add one — OPEN o24, raised to the main thread. Not re-run (one round in the fix brief). |
| T2 | `0.8s` labelled as a layout value | **Valid, fixed** | Durations are now `timing: true` with "no motion token yet, don't type it (OPEN o24)". |
| T3 | REPORT-2 missing; SCORES / response stale | Valid | SCORES round 4 + verdict, this section, REPORT-2 written. |
| T4 | `B3b` id used twice | **Valid, fixed** | Countdown-end journey is now `B3d`; 61/61 pass. |
