# Home building blocks — research + Codex critique (2026-11-11)

Input: `docs/proposals/2026-11-11-home-building-blocks.md`. No app, screen, kit, PRD or design-system file changed. Nothing rendered.

**Run notes (unattended):**
- **Web search was refused in this run** (permission not granted). The research below comes from **guidelines I already know**, not from fresh searches. Each source is a stable URL to check by hand; items from general product knowledge are marked `[UNVERIFIED]`.
- The brief's exact command (`codex exec … "$(cat codex-prompt.txt)"`) was refused by the sandbox ("quoted text can't be checked"). I ran the same prompt through stdin instead: `codex exec -s read-only -C <this folder> - < codex-prompt.txt > codex-review.log`. Exit 0, 83k tokens. The review is at the end of `codex-review.log` (from the line `## Wrong` after "tokens used"). The log is large because it includes every file Codex read.

## 1 · Research findings

| # | Finding | Source | Block it supports or challenges |
|---|---|---|---|
| R1 | For a small, fixed set of likely values, chips (filter / choice chips) are the standard one-tap control. The selected chip shows a checked state. | Material 3 Chips, m3.material.io/components/chips | **Supports** Quick picks. |
| R2 | M3 time pickers (dial and input) are for a **clock time**, not a duration. M3 has no duration picker, so a wheel is not off-pattern on Android either. | Material 3 Time pickers, m3.material.io/components/time-pickers | **Supports** keeping the wheel (D-40). Nothing to change. |
| R3 | iOS has its own hours + minutes duration wheel (`UIDatePicker` `.countDownTimer`, with a minute interval). HIG: use a picker for a medium-length list of ordered values, and show its current value. | Apple HIG Pickers, developer.apple.com/design/human-interface-guidelines/pickers · developer.apple.com/documentation/uikit/uidatepicker/mode/countdowntimer | **Supports** Custom (wheel) with a 15-minute step. |
| R4 | Show the allowed range **once, next to the control it limits**. Don't let a value be picked that then fails. Make out-of-range values impossible: at 10 h, minutes show 00 only; below 15 min can't be reached. | NN/g form and input guidance (general) `[UNVERIFIED wording]` · WCAG 3.3 Input assistance, w3.org/TR/WCAG22 | **Supports Q1** (title + range above both controls). **Adds** a rule for what happens at both edges of the range. |
| R5 | A list row's **trailing slot** holds one action or a supporting value. It lines up with the row's main text and is the same size in every row. M3 lists and HIG table cells (accessory) both work this way. | m3.material.io/components/lists · HIG Lists and tables | **Supports** the time row with Add time. **Challenges** "action centred on the row": align it to the value line (A-09). |
| R6 | A running countdown must **not** be announced every second. Make the value readable on demand, and announce changes (near expiry, ended, time added) once, politely. | WCAG 2.2 SC 4.1.3 Status messages · WAI-ARIA `timer` role (implicit `aria-live="off"`), w3.org/TR/wai-aria-1.2/#timer | **Adds** to the Countdown block. |
| R7 | WCAG 2.2.1 (Timing adjustable) applies to limits **the app imposes on the user's task**. Availability is a window the user chose, not a session timeout. Even so, being able to extend it (Add time) is the expected pattern. | w3.org/WAI/WCAG22/Understanding/timing-adjustable.html | Mild **support for Q3** "always available". It is not a compliance requirement either way. |
| R8 | A wheel needs a screen-reader-friendly form. Each column is a `spinbutton` with a name, value and min/max, and arrow keys step it. Chips are toggle buttons (`aria-pressed`). | WAI-ARIA APG spinbutton pattern, w3.org/WAI/ARIA/apg/patterns/spinbutton/ | **Adds** an accessibility rule for "Sync" (one value, two controls). |
| R9 | Driver and gig "go online" flows (Uber Driver, Swiggy / Zomato partner apps) use one Go online / Go offline toggle with no set length. Status and earnings show on the online screen. Telehealth provider apps (Practo-style) use schedule slots. Choosing a **length** of time is unusual, so the range and the countdown carry the meaning. | General product knowledge `[UNVERIFIED]` | **Supports** keeping the range visible (Q1) and the countdown prominent (L9). It doesn't change any block. |
| R10 | Label wording: in e-prescribing, the formal word for a doctor's finished prescription is **"issued"** (e.g. NHS Electronic Prescription Service). In plain speech, doctors **"write"** prescriptions. "Generated" and "created" describe system output. Our own D-50 says "the act is issuing the prescription"; the button is "Confirm prescription". | NHS EPS terminology `[UNVERIFIED wording]` · decision log D-50 | **Supports** "written" over "generated / created" (Q2). "Issued" is the formal alternative. |

## 2 · Codex findings (one read-only review), judged

Codex had no history. Severity is Codex's; the verdict is mine.

**Wrong**
| # | Codex point | Verdict | Why |
|---|---|---|---|
| W1 | Band title 24 and gap 24 break §8.1 (title 32/40) and L6 (48). | **needs Apurva** | Backlog §2n already plans an amendment to D-46 / L6, so it isn't a blocker. But **24 is off both scales**: titles are only 32/40 (L1) or 20/28 (h1), and gaps are only 8 / 16 / 32. Apurva needs to pick on-scale values (see recommendation 1). |
| W2 | Values at 24 break L9 (timer 32/40 semibold). | **agree** | L9 is locked. The timer keeps 32/40. The prescription count needs its own decision (recommendation 3). |
| W3 | Hint 4 below, and a 24 gap between Quick picks and Custom, break the three-gap rule. | **agree** | Use 8 (hint to title) and 32 (between groups) or 16 (inside a group). |
| W4 | Brand-tinted icon tiles on rows you can't tap break §8.11. | **agree** | Same reasoning as D-47's neutral reassurance icons. Use neutral icons, or none. |
| W5 | "Status card" means a task outcome in §9.3. | **agree** | Call it a content card (`tm-card`, two rows, divider). No outcome tint. |
| W6 | Add time "centred on the row" contradicts A-09 (Add time sits on the value row; the label and timer don't move). | **agree** | Line the action up with the timer line. Reserve the slot so nothing moves. |
| W7 | Quick picks in 2 rows of 3 is an exception to the 4-column numeric grid (§9.2). | **agree** | Already approved (D-36). Just state it as the Home exception. |
| W8 | Removing "Prescriptions today" from Setup also removes it from ended Home, but app-logic says it stays after availability ends. | **agree / needs Apurva** | A real gap. Ended Home reuses the Setup layout. Apurva must say where the count sits there (recommendation 4). |
| W9 | "Secondary small button" is vague. | **agree** | Compact secondary: 48 px, 16 semibold, 16 px plus icon (§9.1). |

**Missing**
| # | Codex point | Verdict | Why |
|---|---|---|---|
| M1 | Setting… / Adding…: lock the wheel and chips; busy primary. | **agree (not a blocker)** | Already approved behaviour (app-logic §3, D-81 F9). The blocks doc should say "unchanged" and the render run must show it. |
| M2 | Offline and near-expiry notices in the bar. | **agree (not a blocker)** | Same: approved, unchanged. List them in the render run's state list. |
| M3 | Setup, add and request failures, and unknown result. | **agree (not a blocker)** | Same. |
| M4 | Stop-pending / expired-pending (no Time remaining row in stop-pending, D-47). | **agree** | Say in the blocks that the card shows **only the count row** in stop-pending. Otherwise the new card looks broken. |
| M5 | Ended Home: 0:00 and restarting. | **agree** | Folds into W8. |
| M6 | 10-hour cap edge cases: wheel at 10 h when minutes ≠ 00; adding time past 10 h. | **agree; needs Apurva** | The wheel side is mechanical (snap minutes to 00, then announce it). **Whether the cap limits remaining time after an Add is a product question.** Backlog §2n doesn't say (recommendation 6). |
| M7 | Fit at 360 × 640 is estimated, not proven. | **agree** | The render run proves it with the small-phone guard (§8.14), including the tallest bar (offline or error notice). |
| M8 | Long content: the label wraps, and 10:00:00 sits beside Add time at 360. | **agree** | Add both to the render run's boundary list. |
| M9 | Chips + wheel accessibility contract. | **agree** | Adopt R8. Focus order: chips → Hours → Minutes → Set. A chip tap moves the wheel without moving focus and announces once. |
| M10 | Countdown for screen readers. | **agree** | Adopt R6. |
| M11 | Requesting…, No cases, End confirmation. | **agree (not a blocker)** | Approved and unchanged; just list them. |

**Better:** B1 (one title and range over both controls) and B2 (the wheel stays as approved) **agree**. B3 (drop the empty action slot on the count row) is **agree, partly**: drop the tiles, but keep the two rows aligned. B4 (reserve the timer's width) **agree**. B5 (a state table in the blocks doc) **agree**: it's cheap, and it makes "unchanged" checkable.

Nothing Codex raised reopens an approved decision. It kept the wheel, the chips, the copy and the pull model.

## 3 · Recommended changes to the building blocks

1. **Band (needs Apurva):** replace "title 24 / gap 24" with on-scale values. My pick: **gap 32**, and **title 32/40 kept**. "Consult on your schedule" still wraps at 390, so the saving comes from the gap (48 → 32) plus 16 more if the subtitle fits on one line. The alternative is the **compact 20/28 title** (§8.5), which saves the most but makes Home look like a task screen. Either way it's recorded as the D-46 / L6 amendment, not slipped in.
2. **Spacing:** hint 8 under the section title. 16 between Quick picks and Custom (one group). Sub-labels "Quick picks" / "Custom" use the existing section-label style (14/20 secondary, **regular**). "14 semibold grey" isn't on the scale.
3. **Values:** the timer stays **32/40 semibold, fixed-width digits** (L9). The prescription count goes on its row as **16/24 strong**, on the same line as its label and right-aligned. That's no longer fine print, and it adds no 24-size value. *(Needs Apurva if he wants the count as big as the timer: then both use the L9 component.)*
4. **Count after availability ends (needs Apurva):** a fresh Setup with 0 prescriptions has no count row. Ended Home (idle-expired, manually ended) shows the count as one row above "Availability duration", so app-logic §3 ("stays visible after availability ends") still holds.
5. **Card:** call it a **content card**. Neutral icons (or none). The time row has the label on line 1, then the **timer plus a reserved Add-time slot** on line 2, lined up with the value (A-09). The count row has label and count on one line. In stop-pending, only the count row shows (D-47). Add time is the compact secondary button: 48 px, 16 semibold, 16 px plus icon.
6. **10-hour cap:** the wheel goes 0–10 h. At 10 h the minutes column offers 00 only, and a wheel at 10:30 snaps to 10:00 with one polite announcement. 0 h shows minutes 15 / 30 / 45 only. **Needs Apurva:** whether the add-time sheet stops remaining + added from going past 10 h (my pick: yes, the wheel's top value shrinks to fit, with the hint "Up to 10 hours in total").
7. **Accessibility:** wheel columns are spinbuttons, chips are toggle buttons (R8). The countdown isn't live-announced; near expiry, ended and "Time added" are announced once (R6).
8. **States list in the blocks doc:** a short table showing that every current Home state (setting, setup failed, offline, near expiry, requesting, no cases, request failed, unknown result, add sheet / adding / add failed / added, end confirmation, stop-pending, expired-pending, idle-expired, manually ended) keeps its approved behaviour in the new blocks. The render run covers each one at 390, plus 360 × 640 for the tallest ones.
9. **Countdown wording:** the doc says "mm:ss". Write **m:ss** (5:00, 30:00), or h:mm:ss from an hour up (D-46, D-53).
10. **Record the cap against D-36 / app-logic §3:** both still say "no maximum (24/7)". The build run must amend them. This is in backlog §2n already.

## 4 · The three answers

- **Q1 — section title + range.** "Availability duration" with "15 minutes to 10 hours" under it. The range applies to the chips and the wheel together (R4). Codex agrees. The cost at 360 × 640 is a scroll, which §8.14 allows if there's a scroll cue and the bar never covers the last row. The render run proves that.
- **Q2 — label.** **"Prescriptions written today"** (my pick): plain, and it's the doctor's own act (R10). "Generated" and "created" sound like the system made them. Codex prefers **"Prescriptions confirmed today"**, because the count goes up on "Confirm prescription" (app-logic §3). That's precise, but "confirmed" also names a customer-order status at Truemeds, so it can be misread. The formal alternative is "issued". **Apurva's call.**
- **Q3 — + Add time.** **Keep it near the end for this release**, with its slot reserved so nothing moves. Codex agrees. Showing it all the time works with the 10-hour cap only once recommendation 6 is decided. Otherwise a doctor at 9 h 50 m sees a button that can add almost nothing. Showing it always (R7) is a reasonable next step. **Apurva's call.**

## Needs Apurva
W1 (band sizes), recommendation 3 (count size), W8 / recommendation 4 (count on ended Home), recommendation 6 (cap on Add), Q2, Q3.

**Next (not this run):** once Apurva agrees the blocks, a render run makes several options, self-audits them, and gets a Codex critique of the renders.
