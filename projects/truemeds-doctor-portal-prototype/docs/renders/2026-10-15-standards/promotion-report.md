# Promotion report: A–D to `ui-screens/` (2026-10-15)

Steps 0–5 in order, as in `docs/reviews/2026-10-15-promote-to-ui-screens.md`. Moves only; no git, no deletes. Not edited: `design-system/`, `RULES.md`, the decision log, `app.js`, `index.html`, `ui-screens/native/`.

| Step | Result | Notes |
|---|---|---|
| 0 Baseline | **DONE** | `promotion-baseline/{A,B,C,D}/`: copies of every approved 360 and 390 picture (A 58 files, B 20, C 38, D 112). |
| 1 Old material out of `ui-screens/` | **DONE** | 30 PNGs (sign-in 12, otp 12, returning-unlock 3, home 3) and `home/AUDIT-2026-10-13.md`, `home/SOURCE-PARITY-2026-10-13.md` moved to `docs/_superseded/ui-screens-2026-10-13/` (sub-folders kept) with its README. `ui-screens/feedback/__pycache__` kept (report only: Claude handles it at commit). |
| 2 Phase D into `ui-screens/case/` | **DONE** | `concept.html` → `ui-screens/case/case.html`; `concept-styles.css` → `case-styles.css`. Links: design system `../../../../design-system/` (icons, truemeds.css), logos `../../brand/`, messages `../feedback/messages.js`, app `../../app.js`, stylesheet `case-styles.css`. Grep: no `../../../../../../` left, no `concept-styles` left. Header comment added. `MOVED.md` left in the concept folder (README, `_sheet.html`, `metrics.json` kept there). `capture.py`, the guard (`check-locked-specs.py`) and the proof scripts now use `ui-screens/case/case.html`. |
| 3 Pictures: one copy | **DONE** | Moved (not copied) from each `<phase>/final/`: 263 files, list in `promotion-moves.json`. A → `sign-in/`, `otp/`; B → `faster-signin-offer/`, `returning-unlock/`; C → `home/`; D → `case/`. Phase text (`guard.json`, `checklist-results.md`, `NEEDS-APURVA.md`, `changes.md`, `metrics.json`, round reports) → `ui-screens/_qa/{A,B,C,D}/`. `MOVED.md` left in each emptied `final/`. No 430 pictures were in the finals. |
| 4 QA | **FAIL on 6 pictures (spinner frames); rest PASS** | See below. |
| 5 `ui-screens/README.md` and handoff | **DONE** | README rewritten as the handover index; handoff entry added. |

## Step 4 results

1. **Re-capture from the new locations:** all 114 states × 390, 360 (and 430 by guard) into `promotion-check/`: A 29 · B 10 · C 19 · D 56 at each reviewed width. Done.
2. **Pixel comparison with `promotion-baseline/`:** **222 of 228** pictures identical (A 56/58, B 19/20, C 37/38, D 110/112 files, counting both widths). The 6 that differ, all inside the spinner's bounding box and nothing else:

| Phase | State | Width | Pixels changed | % of picture | Bounding box (x0,y0,x1,y1) | Diff image |
|---|---|---|---|---|---|---|
| A | otp · verifying | 360 | 13 | 0.0011 | 237,732,269,739 | `promotion-check/diffs/A/otp_verifying_w360_diff.png` |
| A | otp · verifying | 390 | 349 | 0.0265 | 267,719,300,750 | `promotion-check/diffs/A/otp_verifying_w390_diff.png` |
| B | unlock · pending | 390 | 22 | 0.0017 | 265,1300,297,1321 | `promotion-check/diffs/B/unlock_pending_w390_diff.png` |
| C | home · adding | 390 | 328 | 0.0249 | 281,1439,314,1469 | `promotion-check/diffs/C/home_adding_w390_diff.png` |
| D | a-releasing | 360 | 329 | 0.0271 | 229,1439,262,1469 | `promotion-check/diffs/D/a-releasing_w360_diff.png` |
| D | a-releasing | 390 | 328 | 0.0249 | 259,1439,292,1469 | `promotion-check/diffs/D/a-releasing_w390_diff.png` |

   These are the animated spinner in busy buttons (`tm-spinner`), caught at a different rotation frame. The code and layout are the same. Not "fixed", per the spec. **Pass criterion (identical) is not met for these 6; decision for Apurva:** accept, or freeze the spinner at a fixed frame for captures. Numbers: `promotion-check/pixel-compare.json`.
3. **Full guard (`check-locked-specs.py`):** 0 failures across 114 states × 390 / 360 / 430 (`promotion-check/guard.json`). Coverage 8.1: 0. Console/page/missing-file 8.2: 0.
4. **`check-sources.mjs`:** PASS (12 sign-in, 12 OTP states, 45 registry IDs, local assets).
5. **Load errors and console:** 228 captures, 0 console errors (`promotion-check/*/metrics.json`). Failed file loads (logos, fonts, icons, messages, app.js): 0, as the guard's request check reports.
6. **Coverage in `ui-screens/`:** every state has both widths: sign-in 12 and OTP 17 (A 29), offer 3 and unlock 7 (B 10), home 19 (C 19), case 56 (D 56). No PNG older than a day in `ui-screens/` (240 PNGs: 228 pictures + 12 contact sheets).

## Moved files
- Step 1: `ui-screens/{sign-in,otp,returning-unlock,home}/*.png` (30) and `ui-screens/home/*-2026-10-13.md` (2) → `docs/_superseded/ui-screens-2026-10-13/…`.
- Step 2: `docs/concepts/2026-10-14-case-page/v2/concept.html` → `ui-screens/case/case.html`; `concept-styles.css` → `ui-screens/case/case-styles.css`.
- Step 3: 263 files → `ui-screens/` (full list `docs/renders/2026-10-15-standards/promotion-moves.json`).

## NEEDS-APURVA
1. **Spinner frames (step 4):** 6 pictures differ from the baseline inside the spinner only. Accept, or pin the spinner frame for captures.
2. **Open items carried over** (listed in `ui-screens/README.md`): native `messages.ts` regeneration (native team); Profile / Logout sheet (with the `index.html` rebuild); keyboard check on a device; `index.html` rebuild from `case/case.html`.
3. **`ui-screens/feedback/__pycache__`:** not moved (per the spec); Claude handles it at commit.
4. **`ui-screens/home/manifest.json`:** lists the old 13 Oct PNGs by name. Those files are now in `docs/_superseded/`. Not edited (it is an approval record); update or retire it with the next home change.
