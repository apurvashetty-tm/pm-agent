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
| R1 | Scoring counts the constants-file sizes and the two literals (`+91`, logo name) as clean; brief §9 says tokens / messages only | **Valid** | Not fixable inside this job: no token exists for border width (1), logo width (166), icon (20) or spinner (16) sizes, and no message key for `+91` or the logo's accessible name; `design-system/` and `ui-screens/` are read-only here. SCORES and REPORT now mark code as **conditional**; NEEDS-APURVA asks for the tokens / keys or an explicit exception. |
| R2 | No completed pass recorded | Timing (round 3 was running) | Round 3 scored in `fresh-ai/SCORES.md`. |
| R3 | S1 partial: `state-map.js`, `icons.js`, other global stylesheets not hashed | **Valid, fixed** | Added (67 → 72 source files). |
| R4 | S3: one blanket keyboard regex; ids never checked | **Valid, fixed** | Each MOCK entry matches its own line; the build fails if a MOCK maps to an id missing from OPEN.md. |
| R5 | REPORT.md missing | Timing | Written at §11. |
| R6 | Font source deviation | Valid — recorded | `google/fonts` ships only the variable TTF; static files are the upstream files at the commit Google Fonts pins (FONTS.md). Listed in NEEDS-APURVA for explicit acceptance. |

No third pass (brief: re-run once).
