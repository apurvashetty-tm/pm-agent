# Run 1 of 2 — Shared rules + visible-gap checker (checklist rows S1–S7)

Folder: the project folder (project branch). Evidence: this folder. **Aim: about an hour.** Read `docs/runs/RULINGS.md`, then **D-106–D-109** in `docs/context/decision_log.md`, `docs/proposals/2026-11-11-release-checklist-2.md` (rows S1–S7 are this run), `docs/renders/2026-11-11-band-audit/CONCLUSION.md` and `docs/renders/2026-11-11-screens-audit/CONCLUSION.md` §1 (D-108's visible values replace its box values where they differ).

## Do
- **S1–S3** `design-system/RULES.md`: write D-108 (visible-edge spacing: 8 join / 16 group / 32 different things; tap areas and reserved lines add no visible space; notice placement) in place of the old §8.3 gap rule; L6 and §8.13 per D-107; one new section "Entry and home screens" with the band spec (D-107) and the screen standard. Plain words, short, with the exact token for each value. Update `check-locked-specs.py` for L6.
- **S4** `.tm-sheet__subtitle` 8 under the title inside the header; list every sheet that uses it.
- **S5** an inline-link class with a 48 hit area that adds no line height (`::after`), focus ring.
- **S6** the visible-gap checker in `design-system/scripts/` (Node + Playwright, the project's capture settings): for each block, measure **visible** edges (text: the glyph ink box from Range rects trimmed to cap height / descender, not the line box; filled or bordered shapes: their painted box; images/icons: their painted bounds), compute the vertical gap to the visible block above, and fail any gap not allowed by S1 (8 / 16 / 32, or a component's own listed anatomy with a tolerance of ±2 px for font rounding). Output a JSON report and a picture with the visible gaps drawn. **Unit tests** (Codex writes them first): a page with a 48 link around 14 text, a reserved empty message line, a bordered notice, a 32-gap pass and a 20-gap fail.
- **S7** `beyond-salt.md` for S4 and S5. Token guard on every CSS change.
- **Dry run:** run the checker on today's approved sign-in, OTP, offer, unlock and Home v3 (`docs/renders/2026-11-11-home-v3/home-v3.html`) and save the report here. It **should** fail where D-108 says the screens are wrong (e.g. sign-in helper → Send OTP 16, OTP boxes → locked notice 8) and pass where they're right. If it doesn't, the checker is wrong — fix the checker, not the expectation.

## Codex
Tests first (above), then one read-only review of the rules text and the checker against D-107 / D-108; one fix pass.

## Commits
Publish the `design-system/` changes **in their own commit**, separate from the project files (they go to `main` later on one `shared/` PR, before the release). Don't touch app screens in this run.

## End
`REPORT.md` here: rows S1–S7 each ✅ with evidence, the dry-run table (screen / gap / visible px / expected / pass-fail). Append `DONE r1-rules` (or `STOPPED r1-rules: …`) to `docs/runs/STATUS.md`, publish, stop. Run 2 starts automatically after you.
