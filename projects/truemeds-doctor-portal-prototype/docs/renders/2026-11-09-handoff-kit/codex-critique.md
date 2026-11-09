The kit is **not ready for acceptance**. Token names and copy keys pass the automated checks, but the viewer has an inspection defect and the required fresh-AI proof is absent. No files were written.

**Blockers**

- **Inspector hotspots drift vertically.** [viewer.js:59](handoff/viewer/viewer.js:59) positions hotspots as percentages of `.shot`, but that figure contains both the image and its caption ([viewer.js:52](handoff/viewer/viewer.js:52)). Its height exceeds the measured screen height, so lower hotspots shift and stretch. Position overlays inside an image-only wrapper. Fix the generator at [build-handoff.mjs:1016](scripts/build-handoff.mjs:1016).
- **Fresh-AI acceptance proof is missing.** The evidence folder contains no `fresh-ai/` transcripts or scores. Proposal §6 requires this pass; [brief:122](docs/renders/2026-11-09-handoff-kit/TERMINAL-BRIEF.md:122) requires both tools, retained transcripts and question/code scoring. This remains an acceptance blocker, even if the kit itself builds.

**Should-fix**

- **Freshness checks omit capture dependencies.** [build-handoff.mjs:758](scripts/build-handoff.mjs:758) hashes selected files, while capture loads the whole app ([line 332](scripts/build-handoff.mjs:332)). Changes to shell layout, capture routing, keyboard implementation or browser fonts can change generated pictures and measurements without invalidating `--check`. Hash the dependencies actually used by capture.
- **Internal decision history leaked into the kit.** [DECIDED.md:163](handoff/DECIDED.md:163) exports “Rejected” options and an approval-history parenthetical. The brief requires the decision itself, not the debate. Export the positive rule: keyboard starts closed; the main button stays inline. The automated leakage scan passes because it does not catch this wording.
- **The mock-assumption completeness guard is incomplete.** [build-handoff.mjs:581](scripts/build-handoff.mjs:581) claims unmapped assumptions fail the build, but [line 591](scripts/build-handoff.mjs:591) only verifies that a fixed list still matches. New `[MOCK ASSUMPTION]` entries are not enumerated or rejected. Scan relevant sources and require every discovered assumption to map to OPEN.
- **Final evidence is incomplete.** No `sheet.png` or `REPORT.md` exists in the evidence folder. These are required by [brief:149](docs/renders/2026-11-09-handoff-kit/TERMINAL-BRIEF.md:149), including checklist evidence and protected-folder change attribution.

**Nice-to-have**

- [viewer.js:86](handoff/viewer/viewer.js:86) repeats the identical state-filter condition. Remove the duplicate.
- [OPEN.md:90](handoff/OPEN.md:90) provides only the Terms/Privacy assumption for a question also asking about support links. Explicitly point to the resolved support and onboarding answers in DECIDED.

**Validation and uncovered checks**

Executed read-only: **H01–H04 and H06–H08 pass**. Native references resolve against canonical tokens; copy keys resolve against canonical messages; copied token/message exports match. The textual leakage scan passes, subject to the finding above. Baseline `--check` passes.

Every CASES check without a passing automated result:

- **H05** — fails on unflagged `sign-in.html:51`, `margin: 0`. The scaffolding exemption is documented in [test-disputes.md:5](docs/renders/2026-11-09-handoff-kit/test-disputes.md:5). I consider excluding review/capture scaffolding reasonable; this failure alone is not a screen-token blocker. It still needs explicit dispute disposition.
- **H09** — not executed: it writes a temporary replica, contrary to this review’s read-only instruction. Baseline freshness passing does not prove mutation detection.
- **E01, E02, E03, E04, E05, E06, E07, E08, E09, E10, E11, E12, E13, E14, E15, E16, E17, E18** — all are explicitly manual evidence checks, with no passing automated test for their full conditions. They are listed individually in [CASES.md:72](tests/codex/handoff/CASES.md:72). E18 is intentionally deferred until after Apurva’s review.

Browser interaction, binary/image leakage inspection, device font setup and protected-folder change attribution were not verified in this review.