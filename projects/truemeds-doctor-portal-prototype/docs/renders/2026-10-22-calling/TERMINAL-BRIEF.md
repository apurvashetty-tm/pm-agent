# Terminal brief — calling states, final render and audit

Owner: main Claude thread (records decisions) · Worker: terminal session (renders, checks, reports) · Date: 2026-10-24

## Read first (in this order)
1. `projects/truemeds-doctor-portal-prototype/CLAUDE.md`
2. `ui-screens/app-logic.md` §4 and **§5 state table** — the source of truth for every state, trigger and bar.
3. `docs/context/decision_log.md` — D-58 points 14–22, D-59, D-60 (reverted).
4. `design-system/RULES.md` §8–§9 (incl. the 2026-10-24 icon rule in §9.1).
5. `docs/feedback-rules.md`, `ui-screens/feedback/messages.json`.
6. This folder's `README.md`, `storyboard-final-draft.png` (main thread's pre-check render) and the round-1/2/3 storyboards (review history).

## Where to work
- Folder: `pm-agent/.work/truemeds-doctor-portal-prototype` (branch `project/truemeds-doctor-portal-prototype`). Never the main pm-agent folder.
- Source: `docs/renders/2026-10-22-calling/src/case.html` (working copy; render ids = recipe names). **Do not edit `ui-screens/`** — the approved screens stay untouched until Apurva approves.
- All text from `messages.json` via `MSG()`. No hard-coded copy, no "50" in copy.

## What to do
1. **State 16 has three variants** — render all: `t16-transfer-missed` (doctor ended), `t16b-transfer-missed-patient`, `t16c-transfer-missed-unknown`.
   **"Yes, still talking" (7b)** is a transition, not a state: the bar returns to 7a (`s7a-calling`), the question comes back after 3 min. No extra screen.
   **7d** = Confirm prescription · Callback · Unavailable (D-58 point 20). **State 6** = Call again · Callback (D-58 point 23). **13** busy label = "Transferring…". **Skip HA** keeps "HA" (button fit at 360) — the only place "HA" is shown.
1. **Render** every state in the §5 state table (20 states + fallback B: `g1-generic-confirm`, `g2-checking-ha`, `g3b-forwarded`) at **360 and 390** wide, 2×, into `docs/renders/2026-10-22-calling/round-4/`. Remove the superseded recipe `t07-result-missing` from the render list (replaced by 7b–7f).
2. **Check copy**: every state uses the approved script for its case (`call.scriptCat4 / scriptTransfer / scriptForward / scriptNeutral / forwardedTell`), and `call.endedEarly` = "Call too short to write a prescription. Call again to continue."
3. **Run the checks** that apply (`ui-screens/feedback/check-locked-specs.py`, `check-sources.mjs`, `docs/layout_check.py`). If a check cannot run against the working copy, write **"not run" with the reason** — never "passed" without running it.
4. **Full-size audit — per decision, not per screen** (learning 2026-10-16): for each line below, open every state it touches at full size, both widths. Never sign off from contact sheets.
   - No End call anywhere. Callback in every live call. Script under Order details during every call; outcome card in the same slot after closing.
   - **No script once the call has ended** (e.g. 16 Hung up before transfer) — nobody to read it to. Script shows only while a call may be live, and after a failed transfer (15) where the doctor is still on the line.
   - Order details always first. Script card has one title ("End-of-call script").
   - Bar order: primary on top, secondaries below (two side by side, labels on one line at 360). Unavailable = destructive (red outline, phone-off icon).
   - Confirm never appears before the backend says the call is valid, except 7d. Skip HA only with a final button.
   - Back (header) only in 1, 2/7a, 3, 4, 7b, 11; never after an attempted call is known or once the case is closed.
   - Icon rule §9.1: icons on call / callback / view / skip / direction; none on confirm, finalise, release, or answers.
   - Amber only for: call too short, result not received, doctor didn't answer, hung up before transfer, HA unavailable card. Red only for "didn't go through" and Unavailable.
   - Medicines all Prescribed in any state where a confirm button is tapped or the case is closed by confirming (fixture rule, D-56).
   - Secondary buttons as built (grey border, subtle SALT shadow) — D-60 reverted.
5. **Storyboard**: one board grouped as in `storyboard-all-states.png` + the state-7 row, saved as `docs/renders/2026-10-22-calling/storyboard-final.png`.

## Report back (do not decide)
Write `docs/renders/2026-10-22-calling/round-4/REPORT.md`: states rendered, check results (pass / fail / not run + reason), audit table (decision × states × pass/fail), and a **NEEDS-APURVA** list for anything unclear or conflicting. Then stop.

## Never
- Write to `decision_log.md`, `open_questions.md`, `project_truth.md` or record approvals — the main thread does that after Apurva agrees.
- Promote anything into `ui-screens/`, publish, open or merge pull requests.
- Change the design system. If a component looks wrong, report it.
- Invent states, copy or rules. If the state table doesn't cover it, list it under NEEDS-APURVA.
- Run git commands other than `git status`; one git command at a time in this folder.
