# Terminal brief — entry screens (D-61, D-64) + design-system pass on approved screens

Owner: main Claude thread (records decisions) · Worker: terminal session (renders, checks, Codex loop, reports) · Date: 2026-10-26

## Read first
1. `projects/truemeds-doctor-portal-prototype/CLAUDE.md`
2. `docs/context/decision_log.md` — **D-61** (entry screens), **D-62** points 1–8 (status cards, action bar), **D-64** point 4 (faster sign-in without biometrics), **D-65** (messages don't repeat buttons; offer copy). D-42, D-44, D-45 for history.
3. `docs/context/backlog.md` section 2 — this job.
4. `design-system/RULES.md` (§9.1 icons, §9.3 status card, action bar row) and `beyond-salt.md`.
5. `docs/feedback-rules.md`, `ui-screens/feedback/messages.json`.
6. Approved screens and their contact sheets in `ui-screens/<screen>/`.

## Where to work
- Folder `pm-agent/.work/truemeds-doctor-portal-prototype`, branch `project/truemeds-doctor-portal-prototype`. Never the main pm-agent folder.
- **Working copies** of the approved HTML go in `docs/renders/2026-10-26-entry-ds-pass/src/` (paths adjusted). **Do not edit `ui-screens/`** — promotion happens only after Apurva approves.
- Renders: `docs/renders/2026-10-26-entry-ds-pass/round-1/`, 390 and 360 wide, 2×.
- Out of scope: the calling states (`b-*`, `c-*` in `ui-screens/case/`) — they are being replaced by the calling set in `docs/renders/2026-10-22-calling/`.

## Checklist (pass / fail per screen — this is "done")
### A. Entry screens (D-61, D-64)
1. **Logo** on sign-in, OTP (every state), returning unlock (every state), faster sign-in offer (every state) and Home (every state). **Not** on the case page, Prescribe, bottom sheets, Rx viewer or other full-screen task overlays.
2. **OTP: no header Back** (no arrow, no "Back" text). "Change" next to the number stays. **Keyboard check:** OTP with the keyboard open at 360 still shows the code boxes, the error line and Verify. If not → stop and report (NEEDS-APURVA), don't redesign.
3. **Returning unlock:** order = Unlock with fingerprint / Face ID / screen lock (primary) · **Use OTP instead (quiet button)** · Not you? Switch account. Same quiet style as the offer's "Not now".
4. **Faster sign-in offer — hero icon** in the same tile and place as returning unlock.
5. **Faster sign-in offer — states** (render each):
   - `offer_fingerprint`, `offer_face-id` (exist), **`offer_screen-lock` (new, D-64)** — lock icon, copy below.
   - `offer_enabling` (exists).
   - **`offer_enable-failed` (new)** — notice in the footer, Try again (primary) · Not now. Stays on the offer. D-61 replaces D-45's "failed → Home with no error" for this case only.
   - **`offer_offline` (new)** — Turn on stays tappable; on tap, the offline notice in the bar (same pattern as sign-in offline).
   - Cancelled (doctor closes the phone prompt): back to the offer (not Home), no message — no new render needed; note it in the report.
   - No fingerprint, face or screen lock on the phone: **the offer is skipped** — no render; note it.
6. **Back-arrow inventory (report only):** list every approved screen that shows a header Back, with the screen id. Don't change any except OTP (item 2). Apurva decides the rest.

### B. Design system on every approved screen (D-62)
7. **Status / outcome cards** (closed case `e-*`): tinted by outcome with a 1px edge in the tone, **no drop shadow** — success: `e-prescription-confirmed`, `e-transferred`, `e-forwarded`; neutral (grey-100 fill): `e-patient-unavailable`, `e-callback-scheduled`, `e-availability-ended`. If a card's tone isn't obvious from this list → NEEDS-APURVA.
8. **Action bar** on every screen that has one (sign-in, OTP, unlock, offer, Home, case `a-*`, `d-*`, `s-*`, `e-*`): white, hairline top edge + upward shadow (`0 -8px 24px` 10%). It comes from `design-system/truemeds.css`; verify by DOM probe and at full size; if a screen overrides it, report the override.
9. **Questions above buttons** are plain text, not a boxed notice (as calling 7b) — report any screen where a question sits in a box.

### C. Copy (D-65)
10a. Every approved screen that shows one of the 17 shortened messages (list in D-65; keys marked `D-65` in `metadata.json`) is re-rendered with the new copy: sign-in, OTP, Home, case (`a-confirm-failed`, `a-release-failed`, `c-callback-failed`, `a-offline` and any other). Screens whose copy comes from `messages.js` pick it up automatically; where an approved HTML has the text typed in, change it in the working copy only and note it.
10b. Calling states that show changed copy — `t03-not-through`, `t04-doctor-missed`, `t06-ended-early`, `t12-transfer-ready` — re-render from `docs/renders/2026-10-22-calling/src/case.html` into `docs/renders/2026-10-22-calling/round-8/` (no other change), plus `t08c-confirm-blocked` (new, D-64), and refresh `storyboard-final.png` with 8c added to group C.
10c. Read every message on every rendered screen: none repeats a button that is on the same screen (D-65 rule, `docs/feedback-rules.md` §4). List any you find as NEEDS-APURVA, don't rewrite.

### D. Always
11. Copy only from `messages.json` via the screen's message helper — no invented copy. The new keys below are the only additions.
12. Icon rule §9.1; primary on top; labels on one line at 360.
13. Run `ui-screens/feedback/check-locked-specs.py`, `check-sources.mjs`, `docs/layout_check.py`, `brand/check_lockup.py`. Some guards will fail **because** the approved look changed (logo, Back, unlock order, card look, shortened copy) — list each as "expected (D-61 / D-62 / D-65)" with the guard name; anything else is a real fail. Never write "passed" without running.

## New copy (approved by Apurva 2026-10-26, keys already in `messages.json`)
- `offer.screenLockSub` — "Use your phone’s screen lock instead of waiting for an OTP."
- `offer.screenLockLine` — "Unlock the app with your PIN or pattern, not an OTP."
- `offer.screenLockTrust` — "Your screen lock stays on your phone"
- `offer.enableFailed` — "Couldn’t turn on faster sign-in."
- `offer.offline` — "You’re offline. Reconnect to turn on faster sign-in."

## Codex loop (as in earlier rounds)
Send renders to Codex in batches, read-only. Fix only blockers that break this checklist or a recorded decision; DOM-verify and re-render that screen. **Cap: 2 rounds.** Codex has no project context: anything that conflicts with a decision or is a taste call → NEEDS-APURVA, not applied. Rebuild items (backlog §3) are noted as "rebuild item", not fails.

## Report back (do not decide)
`docs/renders/2026-10-26-entry-ds-pass/round-1/REPORT.md`: screens rendered; checklist table (item × screens × pass/fail); guard results (pass / expected / fail / not run + reason); back-arrow inventory; Codex findings and what you did with each; **NEEDS-APURVA** list; one contact sheet per screen folder. Then stop.

## Never
- Write to `decision_log.md`, `open_questions.md`, `project_truth.md`, `backlog.md`, or record approvals.
- Edit `ui-screens/`, the design system or `messages.json`; promote, publish, open or merge pull requests.
- Invent states, copy or rules.
- Run git commands other than `git status`.
