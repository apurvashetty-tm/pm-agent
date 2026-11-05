# Brief — step 0 follow-ups + prototype build step 1 (entry journeys)

Owner: main Claude thread · Runner: Claude Code (terminal), Codex as critic · 2026-11-06
Folder: `~/src/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype` (project branch; step 0 is committed).
Definition of done: plan v3.2 (`docs/proposals/2026-11-05-prototype-build-plan-v3.md`) and checklist v3.2 (`docs/reviews/2026-11-05-rebuild-checklist-v3.md`) — every line whose Step column includes **1**, plus the Part A items below. Read the step 0 report (`docs/renders/2026-11-06-step0/REPORT.md`) first.

---

## Part A — step 0 follow-ups (main-thread review)

The shell works; the review panel is hard to use. Fix before building screens:

1. **Plain words, no codes.** Every label and option in the panel and drawer reads as a person would say it: "Cat4", "Pilot · HA free", "Over the gate", "Patient ended the call", "Sign-in · Not registered" — never `cat4`, `over-gate`, `1 · offer_enable-failed`. Jump-to-state lists states grouped by journey, each with a short description from `ui-screens/README.md` / app-logic.
2. **Desktop panel layout** as the concept `docs/renders/2026-11-06-phone-testing-concept/desktop-review-qr.png`: a "Review panel" card with Story (start point, scenario) open; every other section folded into one row that shows its current choice ("Call simulator · Connected · 62 s · Ozonetel ⌄") and opens on tap; a separate "Test on phone" card. At 1280 × 800 the panel fits beside the frame with no page scroll and is never a scroll container (RULES §7); the tallest open section may push others closed (one open at a time).
3. **QR always current and easy to scan.** Updates on every change (no "Make QR" button). The link carries only what differs from the defaults, in short keys, so the QR stays low-density — target ≤ 100 characters for a typical story; scannable at 160 px. Beside it: the story as 3–6 plain steps; Copy link button.
4. **Drawer handle** at the right edge, vertically centred (not in the top 200 px, where the case header sits). Drawer shows the sections for the current screen first (from this step on: sign-in, OTP, offer, unlock), then Jump to a state and Restart story.
5. **Checklist 1.3 by eye:** compare every calling transition in `docs/state-map.md` with app-logic §5 / §6 / §14 and D-83 → D-89; report a table (transition · matches / doubt · source line). Fix the map only where the generator is wrong; anything else is a doubt for the main thread.

## Part B — step 1: sign-in, OTP, faster sign-in offer, returning unlock

Plan §5 step 1. Build the four journeys in `app/screens/` from the approved files (`ui-screens/sign-in/sign-in.html`, `otp/otp.html`, `faster-signin-offer/…`, `returning-unlock/…`) — lift their markup; only `--tm-*` / `.tm-*`; every word through `MSG()`. Behaviour: app-logic §2, test numbers and codes §11 (read from `app/data/test-numbers.js`), `docs/feedback-state-map.md` rows for these journeys, D-42 → D-47, D-61, D-64, D-65. Story / panel switches drive every server answer and the mock unlock. "→ Home" goes to a stub until step 2.

**Also build in this step (deferred from step 0):**
- **Picture compare harness** (plan B15, checklist 2.1 / 2.2): capture each built state at 390 and 360, 2×, fixed clock, frozen animations, spinner mask (same settings as `docs/renders/2026-11-03-calling-round/capture-method-cap.py`), pixel-diff against the approved picture; report per state; accepted-difference list per step (region + reason).
- **Copy check on `app/`** (checklist 3.7): `check-sources.mjs` copy rules run on the built screens.

**Done when:** all 42 step-1 pictures match (or each difference is listed with a reason) · every checklist line with Step 1 passes (4.1, 4.2, 4.3, 2.x, 3.x, 1.5, 1.6, 6.x, 7.x; 5.8 device = pending Apurva) · journey tests: every test number and OTP code from §11, offer once / cancelled / failed / not now / screen-lock fallback, unlock success / cancelled / 3 failures → OTP / Switch account · `layout_check.py --app` ALL PASS · 0 console errors · old `index.html` / `app.js` / `styles.css` unchanged.

## Codex critique

After your checks pass: `codex exec --sandbox read-only --output-last-message docs/renders/2026-11-06-step1/codex-critique.md "Read docs/renders/2026-11-06-step1/BRIEF.md. You are the critic. Check Part A and the step 1 build against the brief, plan v3.2 and checklist v3.2 lines with Step 1, and the approved pictures. Report blockers, should-fix, nice-to-have with file, line and checklist line. Read-only; write no files."`
Fix valid points; say why for any not adopted; **re-run Codex once** after the fixes if it raised blockers.

## Report and stop

`docs/renders/2026-11-06-step1/REPORT.md`: Part A results (with before / after screenshots of the panel at 1280 and the drawer at 390, and one QR scanned by a phone-camera simulation or decoded back), the 1.3 table, picture-compare table (state × width × diff), checklist Step-1 table, Codex points adopted / not, known gaps, NEEDS-APURVA (only real product questions). Screenshots in `docs/renders/2026-11-06-step1/`. Then tell Apurva and stop.

**Don't:** commit or push, write the decision log or backlog, change approved pictures, deploy, or start step 2.
