# Brief — Home v3 (setup + available): Codex UX/UI critique loop

Folder: the project folder (project branch). Evidence: this folder. **Aim: about 45 minutes. Change no app, kit, PRD, decision-log or design-system file — only this folder.**

Start: `home-v3.html` (both screens at 390 × 844 and 360 × 640; open it with the project's capture script) and `home-v3-start.png` (the same, already captured). Agreed with Apurva so far (2026-11-11):
- **Setup:** title "Start taking cases" · subtitle "You can add time or stop anytime." · "Quick picks" (6 chips) · "Custom" (approved wheel, hours 0–10) · "Available until 7:45 PM" above "Set availability". No range text (the wheel's limits enforce 15 min–10 h).
- **Available:** title "You're available" · approved subtitle · one `tm-card` (same as the case page's) with two rows of one anatomy: grey icon · 16 label · L9 value; "+ Add time" (secondary small, like View Rx) always shown on the time row; the prescriptions row taps through to Profile (chevron).
- **Band:** logo → title 16 (same as OTP / unlock / offer); title stays 32/40 (one line on both). Sign-in keeps 48.

Rules to judge against: `design-system/RULES.md` (§8 type scale, three gaps 8/16/32, §8.11 icons, §8.14 small phone, §9 components), `design-system/src/components.css`, the approved screens in `ui-screens/` (sign-in, OTP, returning unlock, faster sign-in offer, case page) for consistency, and `docs/renders/2026-11-11-home-blocks-review/REPORT.md` for what was already found.

## Loop (at most 2 rounds)
1. **Codex critique** (read-only, prompt through stdin, the pictures attached with `-i`, as the last runs did). Ask Codex, as a senior mobile UX/UI reviewer and UX writer, for both screens:
   - **Design system followed?** Every component, colour, icon treatment and radius — name any element that isn't the system's, or is used differently from the case page / entry screens.
   - **Gaps right?** Measure every vertical gap (logo → title, title → subtitle, band → panel, label → control, between chips, between groups, card padding, row padding, bar). Each must be 8 / 16 / 32 or a component's own spec; list any that isn't.
   - **Type right?** Every text: size / line height / weight / colour vs the four levels (and L9 values). Hierarchy: does the eye go title → choices → value → button?
   - **Title and subtitle options:** 3 options for each screen (title ≤ one line at 390, about 20 characters; subtitle one line), from the doctor's point of view (a new doctor opening the app the first time, and a doctor coming back for a second session the same day). Say which you'd ship and why; keep "Start taking cases" / "You're available" as the baseline to beat.
   - **Label style on the available card:** the setup group headings ("Quick picks", "Custom") are 16 semibold dark. Should "Time remaining" and "Prescriptions written today" match them, or stay 16 regular because they label a value (the 32 semibold value is the emphasis)? Judge by the design system's rules and the case page, and pick one.
   - **The two screens as a pair:** setup says "Start taking cases"; D-36 names the state "Taking cases" (not "Online"). Should the available title become "You're taking cases" so the pair reads Start taking cases → You're taking cases? And do the buttons ("Set availability", "End availability", "+ Add time") still fit that vocabulary, or should the words line up? Give the options as pairs (setup title + available title + buttons), not one screen at a time.
   - **Anything else** a reviewer would flag: thumb reach, tap targets, the Add time button's alignment with the timer, the chevron row, 360 × 640 fit, accessibility.
2. **Judge** each point: agree / disagree / needs Apurva, one line why. Don't adopt points that reopen agreed decisions unless they fix a real problem.
3. **Fix** the agreed points in `home-v3.html` (tokens only; run the token guard), re-capture to `home-v3-r<N>.png`. Round 2 = one more Codex pass on the fixed pictures, blockers and rule breaks only. Stop after round 2.

## End
Short `REPORT.md`: what Codex found (judged), what was fixed, the title/subtitle options for both screens with your pick, anything that needs Apurva, and the final pictures (`home-v3-final.png`, both screens at both sizes). Append `DONE home-v3-review` (or `STOPPED …`) to `docs/runs/STATUS.md`, publish this folder and STATUS with `bash ../../scripts/publish.sh -m "..." <files>`, stop.
