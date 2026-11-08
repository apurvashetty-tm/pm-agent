# Brief — step 1 recovery (rebuild rounds 1–3 lost with the old Mac)

Owner: main Claude thread · Runner: Claude Code (terminal), Codex as critic · 2026-11-09
Folder: `~/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype` (project branch). **New Mac, new path:** the repo is now `~/pm-agent` (was `~/src/pm-agent`); older briefs still say the old path — read them with the new one.

## What happened

Step 1 ran three rounds on 6 Nov (round 1 build, round 2 Codex blockers, round 3 compare fixes). None of it was committed; the old Mac died and it is gone: the `app/` step 1 code, the compare harness, 21+ tests, `REPORT.md`, Codex critiques, and the D-92 re-renders. **Step 0 is committed and intact** (`docs/renders/2026-11-06-step0/`).
The main thread has already restored (don't redo): D-92 in the decision log, the Profile-photo backlog item, and three `calling-flow/data.js` labels (`C0 → C7b`, `T13 → E14`, `RES` text).

## Definition of done (unchanged)

Plan v3.2 (`docs/proposals/2026-11-05-prototype-build-plan-v3.md`), checklist v3.2 (`docs/reviews/2026-11-05-rebuild-checklist-v3.md`) — every line whose Step column includes **1** — and the "Done when" line of the original step 1 brief (`docs/renders/2026-11-06-step1/BRIEF.md`). That brief is the scope: Part A0, Part A (panel follow-ups 1–5) and Part B (four entry journeys + compare harness + copy check on `app/`). This brief adds everything the three lost rounds learned, so build it right the first time.

## 0 · Set up this Mac (first)

1. `cd tests && npm install && npx playwright install chromium` (tests have their own `package.json`; `node_modules` is git-ignored).
2. `tests/run-checks.mjs` line 17 hard-codes `/Users/mac/...` for Chrome. Make it find Playwright's own Chromium (or `$CHROME` if set) with no user path in the file. Same for any other script with `/Users/mac` or `src/pm-agent` in code (not in old dated briefs/reports — leave those).
3. Python: the guards and `capture-method-cap.py` need Pillow (`pip3 install --user pillow` if missing).
4. Run Part A0's four guards and `node tests/run-checks.mjs` on the committed state. Report the baseline.

## 1 · Build step 1 — with the lessons from rounds 1–3 built in

Everything in the original brief, plus these, all of which Codex or the compare found last time:

**Sign-in / OTP behaviour:** no crash on same-number resend; typed input never replaced by fixtures; first keystroke replaces a pasted / pre-filled value as the pictures show; errors clear on edit; OTP field focused on arrival (with the approved blue focus border); live sign-in validation per app-logic §2; wrong-code copy shows remaining tries only from the approved threshold; the countdown ticks and Resend appears when it ends; locks and per-window caps expire on the clock (settings, demo-scaled) and survive a journey restart within the session; expired-code resend obeys the cooldown.
**OTP number style:** "+91 98765 43210" in "Sent to … · Change" is **semibold** (lift from `ui-screens/otp/otp.html`). Missing it failed all 34 OTP compares last time.
**Story ↔ journey:** a panel or drawer change applies to the running journey (next server answer), not only new ones; every OTP choice (wrong, two tries left, resend failed) has its server path; the drawer shows the current screen's controls and updates on every transition.
**Faster sign-in:** "offered once" and "enabled" persist (plan B12); **Try again** after an enable failure re-runs the phone prompt (same as Turn on); screen-lock fallback reachable from a journey (mock unlock "no biometrics, screen lock only"); enable "unavailable" handled as app-logic §2 says — if it doesn't say, mark `[OPEN DECISION]` and list it.
**Phone Back:** every entry screen and sheet pushes a navigation entry; Back follows app-logic §2 (OTP has no Back → sign-in via Change; offer Back = Not now; unlock Back stays). Test each.
**Links (OQ-021 answered by the main thread):** Sign up → `https://pwa-doctor.truemeds.in/onboarding` in a new tab. Call Doctor Ops / Message support / Terms / Privacy → a small placeholder page ("This would call Doctor Ops" / "This would open WhatsApp support" / "Link pending"), never a real `tel:` or `wa.me`. Same blank-placeholder pattern as Help (D-88). Add a `[MOCK ASSUMPTION]` note under OQ-021 in `open_questions.md`.
**Registry:** adding approved picture labels to `messages.json` is what plan B6 asks for — keep them.
**Frame:** the four screens fill the app frame — no nested phone, no stage padding, no fixed inner size; RULES §7 frame is the only frame. Check at 360, 390, 430 and in the desktop frame.
**Busy states** (`sign-in_sending`, `offer_enabling`, `unlock_pending`): the built button shows the spinner; the harness masks the spinner box **identically on both sides**, never hides it on one side.
**Compare harness:** region-aware — each difference region listed with a reason; the run fails on any unexplained region; side-by-side sheets (approved | built | diff heatmap) per state in `docs/renders/2026-11-09-step1-recovery/compare/`. Anti-aliasing-only differences may go in `compare-allow.json` with region + reason and the heatmap as evidence.
**App-level guards:** `check-sources.mjs` copy rules and the locked-spec checks run on the built `app/` screens; `layout_check.py --app` covers the four entry screens at every width.
**Panel polish:** plain jump-list names for every id (README / feedback-state-map names, no mechanical "Couldnt verify"); default QR steps include OTP and offer outcomes; Story row folds; opening any row never pushes the Test-on-phone card off screen at 1280 × 800.
**Checklist 1.3 table** (Part A item 5): `C0 → RES` shows screen 5 (`t05-result-wait`) only on the Ozonetel route (Pilot, HA skipped); on Cat4 there's no screen (doctor stays on Calling). `T13 → E14` and the doctor / patient failure edges apply to every route. Fix the generator to match.

## 2 · D-92 — sample doctor name (approved pictures change; this is allowed)

"Hello, Dr. Kunal" replaces "Hello, Dr. Apurva" in `ui-screens/returning-unlock/returning-unlock.html`; Profile shows "Dr. Kunal Wani", initials "KW", in `ui-screens/home/home-reference.js` (also `case.html` `unlock-name` / `home-name` / `profile-doctor-name`, and the `native/README.md` example). Re-render the 7 returning-unlock states and the 3 Home Profile states at 390 and 360 with `docs/renders/2026-11-03-calling-round/capture-method-cap.py`; check the only difference is the name / initials; copy into `ui-screens/`; rebuild the two contact sheets; regenerate `visible-strings.json`. The built app takes the name from mock data / the registry, never typed in a screen. All guards pass after.

## 3 · Checkpoints — commit as you go (new rule after the loss)

After each of these passes its checks, publish **only your own files**, named explicitly:
`scripts/publish.sh -m "Doctor portal: step 1 recovery — <part>" <files>`
Checkpoints: (a) set-up fixes, (b) Part A panel, (c) the four journeys + tests, (d) compare harness + results, (e) D-92 pictures, (f) Codex fixes + report.
This pushes the project branch only. **No pull request, no `[deploy]`, never `main`.** Never `git add -A`. Leave `docs/prd/`, `docs/context/`, `calling-flow/data.js` and anything else you didn't change alone. If `publish.sh` refuses, stop and report why — don't work around it.

## 4 · Codex

When the checks pass: `codex exec --sandbox read-only --output-last-message docs/renders/2026-11-09-step1-recovery/codex-critique.md "Read docs/renders/2026-11-09-step1-recovery/TERMINAL-BRIEF.md and docs/renders/2026-11-06-step1/BRIEF.md. You are the critic. Check the step 1 build against both, plan v3.2 and checklist v3.2 lines with Step 1, and the approved pictures. Report blockers, should-fix, nice-to-have with file, line and checklist line. Read-only; write no files."`
Fix valid points (say why for any not adopted); re-run Codex once (`codex-critique-2.md`) if it raised blockers. Stop after that and list what remains.

If the session runs long, finish the item in hand, commit at the nearest checkpoint, write in the report exactly where you stopped, and stop — the next session continues from there.

## Report and stop

`docs/renders/2026-11-09-step1-recovery/REPORT.md`: set-up baseline, Part A results (panel at 1280, drawer at 390, one QR decoded back), the 1.3 table, compare numbers (exact / accepted with reason / failed), guard and test results, D-92 re-render check, checklist Step-1 table, Codex points adopted / not, the commits you pushed, known gaps, NEEDS-APURVA (only real product questions — expect none). Screenshots in the same folder. Then tell Apurva and stop.

**Don't:** deploy, open or merge pull requests, write the decision log or backlog, change approved pictures beyond D-92, or start step 2.
