# Promote phases A–D to `ui-screens/` (approved by Apurva, 2026-10-15)

Execute exactly this, in order. **No git. No deletes** (moves only). Do not edit `design-system/`, `RULES.md`, the decision log, `app.js`, `index.html` or `ui-screens/native/`. Anything that can't be done as written → stop on that step and report it under NEEDS-APURVA.

## Facts to rely on
- The A–C screen files in `ui-screens/` (`sign-in/sign-in.html`, `otp/otp.html`, `faster-signin-offer/faster-signin-offer.html`, `returning-unlock/returning-unlock.html`, `home/*.html|css|js`) **are the final screens**: they were fixed in place. Keep them where they are.
- `ui-screens/feedback/` (copy registry, checks) and `ui-screens/native/` stay as they are.
- Phase D lives in `docs/concepts/2026-10-14-case-page/v2/` (`concept.html`, `concept-styles.css`). Its links are relative: `../../../../../../design-system/…` (2), `../../../../brand/…` (4 logos), `../../../../ui-screens/feedback/messages.js`, `../../../../app.js`.
- Approved pictures: `docs/renders/2026-10-15-standards/{A,B,C,D}/final/` (round 17, guard 0).

## Step 0 — Baseline (before anything moves)
Copy (not move) all `*/final/*_w360.png` and `*_w390.png` to `docs/renders/2026-10-15-standards/promotion-baseline/{A,B,C,D}/`. This is what the new captures must match.

## Step 1 — Move old material out of `ui-screens/`
Move to `docs/_superseded/ui-screens-2026-10-13/` keeping sub-folders:
- every `*.png` in `ui-screens/sign-in/`, `otp/`, `returning-unlock/`, `home/` (30 files, 9–13 Oct);
- `ui-screens/home/AUDIT-2026-10-13.md` and `SOURCE-PARITY-2026-10-13.md`.
Add `docs/_superseded/ui-screens-2026-10-13/README.md`: "Screenshots and reviews before the 2026-10-15 standards pass. Superseded by `ui-screens/`. `home/availability_wheel.png` was the D-40/D-47 wheel reference; the approved wheel is now in `ui-screens/home/` finals."
Do not move `ui-screens/feedback/__pycache__` (report it; Claude handles it at commit).

## Step 2 — Phase D into `ui-screens/case/`
- **Move** `concept.html` → `ui-screens/case/case.html` and `concept-styles.css` → `ui-screens/case/case-styles.css`.
- Fix every relative link for the new location: design system `../../../../design-system/…`, logos `../../brand/…`, messages `../feedback/messages.js`, app `../../app.js`, stylesheet `case-styles.css`. Then grep the file: no remaining `../../../../../../` and no `concept-styles`.
- Update the comment at the top of the file: "Phase D case page — approved 2026-10-15 (D-48–D-55). Moved from docs/concepts/2026-10-14-case-page/v2/concept.html."
- Leave in `docs/concepts/2026-10-14-case-page/v2/` a `MOVED.md`: "Promoted to `ui-screens/case/case.html` on 2026-10-15." (keep `README.md`, `_sheet.html`, `metrics.json` there as history).
- Update `docs/renders/2026-10-15-standards/capture.py` (and any helper it uses) so phase D captures from `ui-screens/case/case.html`.

## Step 3 — Pictures: one copy only
**Move** each `docs/renders/2026-10-15-standards/{X}/final/` content (360 and 390 PNGs, contact sheets, guard.json, checklist-results, NEEDS-APURVA, changes) into the matching `ui-screens/` folder:
- A → `ui-screens/sign-in/` (sign-in_*) and `ui-screens/otp/` (otp_*) + `contact-sign-in.png` / `contact-otp.png` with them;
- B → `ui-screens/faster-signin-offer/` (offer_*) and `ui-screens/returning-unlock/` (unlock_*);
- C → `ui-screens/home/` (home_*);
- D → `ui-screens/case/` (all D states and its contact sheets);
- phase-level text files (guard.json, checklist-results.md, NEEDS-APURVA.md, changes.md) → `ui-screens/_qa/{A,B,C,D}/`.
Then leave in each emptied `final/` a `MOVED.md`: "Approved pictures moved to `ui-screens/` on 2026-10-15."
430 PNGs (if any) are not promoted.

## Step 4 — QA: prove the move broke nothing
1. Re-capture **every** A–D state from the new locations at 390×844@2x and 360 (plus 430 for the guard) into `docs/renders/2026-10-15-standards/promotion-check/`.
2. Compare each 360 and 390 capture pixel by pixel with `promotion-baseline/`. **Pass = identical.** Any difference: write the state, width, % of pixels changed and a diff image (`*_diff.png`) — do not "fix" anything.
3. Run the full guard (`check-locked-specs.py`) and `check-sources.mjs`: 0 failures expected.
4. Check: no console errors, no failed file loads (logos, fonts, icons, messages, app.js) on any state.
5. Check: no `*.png` left in `ui-screens/` older than today's finals; every state in the coverage matrix has a 360 and a 390 picture in `ui-screens/` (count per phase: A 29 · B 10 · C 19 · D 56).

## Step 5 — `ui-screens/README.md`
Rewrite it as the handover index (plain, short):
- One line on what the folder is (approved Doctor Portal screens, 2026-10-15; design system: `design-system/`, rules `RULES.md` §8–9).
- Table per phase: screen file → pictures folder → number of states → decisions (A: D-42–D-47 · B: D-45, D-47 · C: D-36, D-40, D-47, D-53 · D: D-48–D-55).
- How to open a state (URL parameters as used by `capture.py`).
- Open items: native copy regeneration (`ui-screens/native/messages.ts`, native team); Profile / Logout sheet (with the `index.html` rebuild); keyboard behaviour checked on a device; `index.html` rebuild from `ui-screens/case/case.html` (next stage).
Also update `docs/context/session_handoff.md` with one entry: "2026-10-15 — A–D promoted to ui-screens/ (single copy of pictures; old material in docs/_superseded/)".

## Output
`docs/renders/2026-10-15-standards/promotion-report.md`: each step → DONE / FAIL; step 4 results (identical count per phase out of total, guard, sources check, load errors, coverage counts); full list of moved files (from → to); NEEDS-APURVA if any. Then stop. Claude checks before the git push.
