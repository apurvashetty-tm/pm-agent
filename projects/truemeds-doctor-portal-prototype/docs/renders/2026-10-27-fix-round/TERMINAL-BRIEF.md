# Terminal brief — fix round after the final audit

Owner: main Claude thread · Worker: terminal session · Date: 2026-10-27
Decisions: **D-69** (audit answers, Profile ported) and D-68. Gaps from `docs/renders/2026-10-27-final-audit/REPORT.md`.
Already done by the main thread (don't redo): `app-logic.md` §2/§3/§6 updated; copy keys removed (`call.haNoJoin`, `call.callingYou`, `call.connecting`, `call.stayOnLine`); new keys `profile.logoutBlocked`, `profile.logoutConfirm`; `case.callEndedEarly` stays until promotion.

## Where to work
- Working copies: `docs/renders/2026-10-26-entry-ds-pass/src/` (entry, Home, case, Prescribe; shared `case-styles.css`) and `docs/renders/2026-10-22-calling/src/case.html` (calling).
- Renders: `docs/renders/2026-10-27-fix-round/round-1/<family>/`, 390 and 360, 2×. Same margin-16 look as `docs/renders/2026-10-26-margin-16/round-1/`.
- Do not edit `ui-screens/`, the design system, `messages.json`, the decision log or the backlog.

## Fixes
1. **G1 — callback and Skip HA sheets.** Render `c-callback`, `c-callback-error`, `c-callback-failed`, `c-skip-ha` (recipes exist in the entry-pass `case.html`) at margin 16. Check sheet side padding 16, copy from `messages.json`, D-65 rule.
2. **G2 — 7f.** Re-render `s7f-submitted` (copy is already "Waiting for the call record…", D-68). Replace the 7f tile in `docs/renders/2026-10-22-calling/storyboard-final.png`.
3. **G3–G5 — Prescribe.** Add recipes and render: `d-alt-days` (How often = Alt days), `d-monthly` (Monthly), `d-inhaler` (form = Inhaler; the Salbutamol Inhaler fixture in `app.js` (around line 84) has one). `app.js` already supports all three (FREQ list, `FORM_DOSE.inhaler`). No new copy.
4. **G10 — Disabled medicine contrast.** In the working `case-styles.css`, the disabled row fades `.med-info` to 50%. Make the struck-through name and its Qty line reach **≥ 4.5:1** on white (e.g. no opacity on the text, `--tm-content-secondary` or darker, line-through kept); the icon tile may stay faded; the grey "Disabled" tag must also be ≥ 4.5:1. Measure and report the ratios. Re-render `s-medicine-disabled` and any other state that shows a Disabled row.
5. **G12 — Action tried offline.** New recipe `a-offline-action`: offline, the doctor taps Call patient → the passive offline notice is **replaced** by one error notice `case.offlineAction` ("No connection. Nothing was lost.") above the button (feedback-rules §4: one message per cause). Render.
6. **Profile (D-69, ported as is + design-system fixes).** Port `#sheet-profile` and `#sheet-logout` from `index.html` into the working Home (`src/home.html` + `home-reference.js/css`), opened by the profile icon in the Home header. Render three states:
   - `home_profile` — name and role · Today's earnings (Earned, Incentive) · User manual (row, chevron) · **Faster sign-in** row with a `.tm-toggle` (on) · **Log out** (destructive button).
   - `home_profile-case-open` — same, Log out replaced by the notice `profile.logoutBlocked`.
   - `home_logout-confirm` — "Log out?" · `profile.logoutConfirm` · Log out (destructive) · Stay signed in.
   Design-system fixes only: `.tm-sheet` template (title + close ×, no drag handle), 16 side margins, 48px targets, tokens only, icon rule §9.1 (if the Log out icon is unclear under the rule, list it as NEEDS-APURVA). Labels as in the current app; the two messages from `messages.json`. Don't redesign the layout.

## Checks
- Every new or changed render: 16 edges (DOM probe), labels on one line at 360, no clipping, D-65 rule, contrast AA, 48px targets.
- Nothing else moved: compare against `margin-16/round-1` for any state you re-render.
- Run the four guards; expected failures as in the margin round (D-67), list anything new.
- **Codex:** one batch, read-only, cap 1 — new renders only (sheets, Prescribe variants, disabled row, offline action, Profile). Taste calls → NEEDS-APURVA.

## Report
`docs/renders/2026-10-27-fix-round/round-1/REPORT.md`: each fix pass/fail with evidence (and the contrast ratios); files changed; Codex findings and disposition; NEEDS-APURVA. Add the new states to `docs/renders/2026-10-26-margin-16/REVIEW.html` (new section "Fix round") so Apurva can see them. Then stop.

## Never
Write to decisions, backlog, open questions, project truth; edit `ui-screens/`, the design system or `messages.json`; promote, publish, open or merge PRs; git other than `git status`; invent copy or states.
