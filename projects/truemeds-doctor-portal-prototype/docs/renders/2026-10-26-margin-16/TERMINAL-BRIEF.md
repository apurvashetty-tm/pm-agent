# Terminal brief — page margin 16 on every screen (D-67)

Owner: main Claude thread · Worker: terminal session · Date: 2026-10-26
Type: **mechanical re-render.** One spacing value changes everywhere; no layout, copy or behaviour decisions.

## Read first
1. `docs/context/decision_log.md` — **D-67** (and D-62 for the action bar, D-66 for the latest entry fixes).
2. `design-system/RULES.md` §8 item 2 (side margin), §9.4 (sheets), action-bar row; `design-system/beyond-salt.md` ("Page margin 16").
3. `design-system/src/components.css` top: new token **`--tm-space-page` (16)**. `.tm-actionbar` and `.tm-sheet` already use it (main thread built the design system).

## Where to work
- Folder `pm-agent/.work/truemeds-doctor-portal-prototype`, branch `project/truemeds-doctor-portal-prototype`.
- **Two working sets, one stylesheet:**
  - Entry, Home and case screens: `docs/renders/2026-10-26-entry-ds-pass/src/` (latest after round 2).
  - Calling: `docs/renders/2026-10-22-calling/src/case.html`. It currently links `ui-screens/case/case-styles.css`; **point it to `../../2026-10-26-entry-ds-pass/src/case-styles.css`** so both sets share one working stylesheet. Check nothing else in the calling renders changes because of that switch (compare with round 8 except the margins).
- **Do not edit `ui-screens/` or the design system.**
- Renders: `docs/renders/2026-10-26-margin-16/round-1/<family>/` for sign-in, otp, returning-unlock, faster-signin-offer, home, case, calling. 390 and 360, 2×. One contact sheet per family; rebuild the calling storyboard into `docs/renders/2026-10-22-calling/storyboard-final.png` (all 31 states incl. 8c).

## What to change (working copies only)
1. Every **mobile side margin** that is 24 (`--tm-space-xl`, `24px`, or a calc of it) for a screen, header, panel, sheet or action bar → `var(--tm-space-page)`. Typical places: `case-styles.css` (main scroll, header `#ps-top`, sheets, auth panels/tops), `sign-in.html`, `otp.html`, `returning-unlock.html`, `faster-signin-offer.html`, `home-reference.css`, and any inline style in the calling `case.html`.
2. **Do not change:** card inner padding (16), gaps between blocks, vertical spacing, the OTP code group (centred, L1), toast, desktop/web layer, the desktop review frame around the phone.
3. **Header:** patient name, Back and help icons align to the 16 edge (today the name starts at 20).
4. **Action bar:** 16 on top, left, right and bottom (+ safe area) — from the design system; remove any working-copy override that fights it.
5. If a 24 is not clearly a side margin, leave it and list it in the report.

## Checklist (pass / fail — this is "done")
1. Left edge of header text, every card, notice, field and button = **16** at 390 and 360 (DOM probe on every state; full-size view of at least one state per family at each width).
2. Action bar padding = 16/16/16 (+ safe area) on every state that has one; buttons line up with the cards above.
3. Sheets: side padding 16 (leave sheet, callback sheet, disable sheet, Add time sheet, any other).
4. Nothing else moved: vertical spacing, card padding, OTP group, icons, copy and colours match the previous round (pixel/DOM diff apart from horizontal offsets).
5. No text clipped; button labels and two-button pairs on one line at 360.
6. Entry screens: panel and footer inset 16; logo and title start at 16.
7. Run `ui-screens/feedback/check-locked-specs.py`, `check-sources.mjs`, `docs/layout_check.py`, `brand/check_lockup.py`. Guards that lock the old 24 margin will fail — list them as **"expected (D-67)"** with the guard and line; anything else is a real fail. Never write "passed" without running.

## Codex loop
Batches, read-only, **cap 2 rounds**. Ask Codex specifically about alignment (left edges, header vs cards, action bar vs cards) and clipping at 360. Fix only breaks of this checklist; DOM-verify and re-render. Taste calls or conflicts with decisions → NEEDS-APURVA. If a batch is blocked or hits a limit, review it yourself at full size and say so in the report.

## Report back (do not decide)
`docs/renders/2026-10-26-margin-16/round-1/REPORT.md`: files changed; every 24 you changed and every 24 you left (with reason); checklist table (item × family × pass/fail); guard results (pass / expected / fail / not run + reason); Codex findings and disposition; NEEDS-APURVA. Then stop.

## Never
- Write to the decision log, open questions, project truth or backlog; record approvals.
- Edit `ui-screens/`, the design system or `messages.json`; promote, publish, open or merge pull requests.
- Change anything except side margins and the action bar / header insets listed above.
- Run git commands other than `git status`.
