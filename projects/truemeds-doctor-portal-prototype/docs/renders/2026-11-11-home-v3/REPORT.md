# Home v3 (setup + available): Codex UX/UI critique loop (2026-11-11)

**Scope kept:** only this folder changed. No app, kit, PRD, decision-log or design-system file was touched.

**Files:**
- `home-v3.html` + `home-v3.css`: the styles moved out of the HTML so the token guard can check them. Guard: **pass**.
- `tools/capture.py`: the home-render capture settings (installed Chrome, D-94 flags, fixed clock, DPR 2), plus gap/type/target measurements.
- Round 0 = the start version re-captured (`home-v3-r0.png`, `-measure.json`). Round 1 = the fixed version (`home-v3-r1.png`, `-measure.json`, `shots/home-v3-r1_*`).
- `codex-prompt.txt` / `codex-review.log` (round 1) and `codex-prompt-r2.txt` / `codex-review-r2.log` (round 2). Both ran read-only with the prompt through stdin and the pictures attached with `-i`, and both exited 0. Round 1 also had the approved case page, OTP, unlock and Home pictures attached.
- **Final:** `home-v3-final.png` has 5 frames: setup 390, available 390, setup 360×640, available 360×640, and setup 360×640 scrolled to the end.

**Unattended readings:**
- "The project's capture script": I took this to mean the home-render capture method. I copied it into `tools/` rather than editing the original.
- I added a fifth frame (setup 360×640 scrolled to the end). It shows the §8.14 end clearance now that the content scrolls.

## 1 · What Codex found (round 1), judged
| # | Codex point | Verdict | Action |
|---|---|---|---|
| 1 | Add time uses `tm-btn--sm`: 14/16 label and a smaller radius. View Rx is the default compact button (48, 16/24). | **agree.** I checked `case.html`: View Rx is `tm-btn tm-btn--secondary` with no size class. | **Fixed:** the `--sm` class is dropped. |
| 2 | End availability is 48 / 16. Bar actions must be 56 / 18 (§9.1). | **agree.** The approved Home uses `tm-btn--quiet tm-btn--lg tm-btn--block`. | **Fixed.** |
| 3 | The Profile icon is `user`; the approved Home uses `user-circle`. | **agree** | **Fixed.** All three header buttons also have accessible names (Notifications / Help / Profile). |
| 4 | Raw values in the inline styles. | **agree in part.** The guard only reads `.css`, so the inline styles were never checked. | **Fixed:** the styles moved to `home-v3.css`. Wheel sizes now use `--tm-target-min`. The remaining raw values carry `raw-ok` reasons: capture frame, logo 166 (§8.13), header overhang (B-07), 2 px icon nudge, 50 % centre line. Guard passes. |
| 5 | Column heads → wheel is 4. | **disagree** | This is the approved wheel's own anatomy (D-40, `home-reference.css .cols`). §8.1 lets a component keep its spec. The home-render run ruled the same way. |
| 6 | Row label → value is 4. | **disagree** | This matches the approved Home value display (`home-reference.css .time` margin xs) and is component anatomy. **Needs Apurva only if he wants 8:** the rows would grow by 4. |
| 7 | Small setup at 360×640 clips: content runs 1 px under the bar, and the wheel was cut to 2 rows with the selected row on top. Blocker. | **agree** | **Fixed:** the wheel keeps 3 rows on every phone. The content scrolls (65 px at 360×640) with the wheel's edge showing as the scroll cue, and sits 16 clear of the bar at the end. |
| 8 | Add time sits 14 px above the timer's centre. | **agree** | **Fixed:** Add time is on the value line, centred on the timer (both centres measure 273). The timer row is now 108 high and the count row 101: the value line takes the 48 button height. |
| 9 | The chevron is top-aligned with the label. | **agree** | **Fixed:** it is centred on the whole row. |
| 10 | Accessibility: the header buttons have no names, the prescriptions row is a plain `div`, and the wheel values are spans. | **agree** | **Fixed:** the prescriptions row is one full-row link with a focus ring, the wheel columns are `role="spinbutton"` with min/max/now, and the timer has `aria-live="off"`. Keyboard stepping is the build's job (`app/screens/wheel.js` already does it). |
| 11 | Thumb reach is good. Static pictures can't prove interaction. | **agree** | Feel goes to the phone walkthrough. |

**Passed in round 1, unchanged:**
- **Gaps:** logo 16 from the top; logo → title 16; title → subtitle 8; band → panel 32; panel → content 32; label → control 8; chips 8 / 8; groups 32; card padding 16; row padding 16 / 16; "until" → button 8.
- **Type:** titles 32/40 semibold on one line at both sizes; subtitles L3; group headings 16/24 semibold; values L9 32/40 semibold tabular.
- **Hierarchy:** title → choices → button on setup; title → timer → Request a case on available.

**Round 2** (blockers and rule breaks only, on the fixed pictures): **none and none**. All seven round-1 fixes were verified as fixed.

## 2 · Title and subtitle options (Codex's, with my pick)
| Screen | Title | Subtitle |
|---|---|---|
| Setup: **ship** | **Start taking cases** | **You can add time or stop anytime.** |
| Setup | Ready to take cases? | Choose how long you're available. |
| Setup | Take cases today | Set aside time for consultations. |
| Available: **ship** | **You're available** | **Request a case whenever you have a moment.** |
| Available | You're taking cases | Request a case when you're ready. |
| Available | Ready for a case | Request one whenever you're ready. |

**My pick: the baselines.** Codex picks them too.
- **"Start taking cases"** tells a new doctor what starts here. Its subtitle reassures a returning doctor that the time isn't a commitment.
- **"You're available"** says what the timed window means. The subtitle says how work arrives.
- **"Ready for a case"** undersells the timed window. **"Ready to take cases?"** asks a question where the screen wants an action.

## 3 · Label style on the available card
**Keep "Time remaining" and "Prescriptions written today" at 16/24 regular.** Codex agrees.
- "Quick picks" and "Custom" head groups of controls.
- The card labels name a value, and the 32 semibold value carries the emphasis.
- Making both bold would give the row two competing weights. The case page also keeps row text lighter than its section headings.

## 4 · The two screens as a pair
| Option | Setup → Available | Buttons |
|---|---|---|
| **A: ship** | Start taking cases → You're available | Set availability · End availability · + Add time |
| B | Start taking cases → You're taking cases | Set availability · End availability · + Add time |
| C | Start taking cases → You're taking cases | Start taking cases · Stop taking cases · + Add time |

**Pick A** (Codex agrees).
- D-36 names the *state* "Taking cases"; it doesn't require the same words on every surface.
- "Available" plus "Request a case" separates "I'm open for work" from "give me work now".
- "You're taking cases" (B) can read as if a case is already under way.
- C's "Start taking cases" button loses the meaning "set a duration".
- If Apurva wants the exact D-36 echo, B is the safe swap: it changes only the title, and the buttons stay.

## 5 · Needs Apurva
1. **Pair vocabulary:** A (recommended) or B (§4).
2. **Row label → value gap:** keep 4, the approved value-display anatomy (recommended), or 8 (§1 #6).
3. **Row heights:** with Add time on the timer line, the timer row is 108 and the count row 101. Codex didn't flag it, and it follows from aligning the button with the value. OK?
4. **Small-phone setup:** at 360×640 the setup content scrolls 65 px, with the wheel partly under the scroll edge until scrolled. This meets §8.14 (edge cue, 16 clear at the end). OK, or tighten?

## 6 · Final pictures
`home-v3-final.png` (= `home-v3-r1.png`). Per-frame shots are in `shots/home-v3-r1_*.png`, and measurements in `home-v3-r1-measure.json`. There were no console errors.
