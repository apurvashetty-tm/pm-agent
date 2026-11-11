# Brief — Joint audit of every "logo + title + subtitle" screen: Claude and Codex review, cross-critique, conclude

Folder: the project folder (project branch). Evidence: this folder. **Aim: about an hour. Pictures and reports only — change no app, kit, PRD, decision-log or design-system file.**

## Why
Apurva doesn't want the screens that open with the blue band (logo, title, subtitle) to look different from each other. Today they do: sign-in and Home use a 48 logo→title gap, OTP / returning unlock / faster sign-in offer use 16, and the agreed Home v3 (`docs/renders/2026-11-11-home-v3/`) moves Home to 16. Find every difference and agree **one band spec** for all of them.

## Screens in scope
Every approved screen with the logo lockup and a title in the blue band, all their states: `ui-screens/sign-in/`, `ui-screens/otp/`, `ui-screens/returning-unlock/`, `ui-screens/faster-signin-offer/`, `ui-screens/home/` (today's approved states), and the Home v3 setup + available (`docs/renders/2026-11-11-home-v3/home-v3.html`). Profile, case page, Prescribe and sheets use task headers — out of scope, except to confirm they don't need to match.

Home v3 title for the available screen: Apurva wants the story to read **"Start taking cases" → "You can take cases now"**. Measured: "You can take cases now" is 362 px at 32/40, the line is 358 at 390 wide, so it wraps by 4 px (more at 360). Include this in the review: propose the closest one-line wording that keeps his story (e.g. "You can take cases", with "now" carried by the subtitle) and the matching subtitle.

## Measure first (shared facts for both reviewers)
Capture every in-scope state at 390 × 844 and 360 × 640 with the project's capture method (copy `docs/renders/2026-11-11-home-v3/tools/capture.py` here). For each band measure: logo top offset and width, header icons, logo → title gap, title size / line height / weight / lines, title → subtitle gap, subtitle size / colour / lines, band → panel (or band → first content) gap, band height as % of the screen, panel radius and top padding. Write `measure.json` and one comparison sheet `bands.png` (all bands side by side, same scale, with the numbers under each).

## Round 1 — two independent reviews (neither reads the other first)
1. **Claude review** (you): `claude-review.md`. Using the measurements, `design-system/RULES.md` (§8.1 type, §8.3 gaps incl. L6, §8.5 headers, §8.13 logo), D-42, D-46, D-61, D-81 F8, A-05, A-07: list every difference, say for each whether it is a **deliberate rule** (with the decision behind it) or **drift**, and propose one band spec (and any allowed variants, each with its reason). Include the titles/subtitles: is each one on one line, does each pair of screens read as a story (sign-in → OTP → offer → Home; unlock → Home; setup → available)?
2. **Codex review** (read-only, prompt through stdin, `bands.png` and the per-screen shots attached with `-i`): the same task, written to `codex-review.md` (copy its answer out of the log). Give Codex the measurements and rules, **not** your review.

## Round 2 — cross-critique
3. Give Codex your `claude-review.md` and ask it to critique it point by point (agree / disagree / missing, why) → `codex-on-claude.md`.
4. You critique `codex-review.md` the same way → `claude-on-codex.md`. Be honest where Codex is right and you were wrong.

## Round 3 — conclude
5. One more Codex pass with both critiques: "where do we still disagree, and what would settle it?" → `codex-final.md`.
6. Write `CONCLUSION.md`: **the one band spec** (numbers and tokens), allowed variants with reasons, a per-screen table (what changes on each screen to meet the spec, or "no change"), the agreed title + subtitle for every in-scope screen (including the Home available title), the points where the two reviewers still disagree (both views, one line each) and **what needs Apurva** — as few, plain questions as possible.
7. **Show it:** render the bands of every in-scope screen with the spec applied (`after.png`, same layout as `bands.png`) so before/after can be compared at a glance. Token guard on any CSS you write.

## End
Append `DONE band-audit` (or `STOPPED band-audit: …`) to `docs/runs/STATUS.md`, publish this folder and STATUS with `bash ../../scripts/publish.sh -m "..." <files>`, stop.
