# Terminal brief — status line (D-74) + affordance audit

Owner: main Claude thread · Worker: terminal session · Date: 2026-10-30
Work in `ui-screens/` (promoted, published 2026-10-29). Read **D-74** first. The design system already has `.tm-status-line` (main thread built it).

## Part 1 — apply D-74 (change)
1. In `ui-screens/case/case.html`, the long waits become a **status line** instead of a busy button: `<div class="tm-status-line" role="status"><span class="tm-spinner" aria-hidden="true"></span>{text}</div>`, same text, same place in the bar; Callback stays the only button below where it is today.
   States: `t02-calling`, `s7a-calling`, `t11-calling-transfer`, `t05-result-wait`, `t17-skip-ha-wait`, `s7c-checking`, `g2-checking-ha`.
2. **Don't change** the short busy buttons (Confirming…, Transferring… `t13`, Releasing…, Sending OTP…, Verifying…, Unlocking…, Turning on…, Adding…, Requesting…).
3. Re-render those 7 states at 390 and 360 (fixed clock), replace their pictures, refresh `case/contact-call.png`, `docs/renders/2026-10-22-calling/storyboard-final.png` and `ui-screens/REVIEW.html`. Everything else must stay pixel-identical (compare all case states).
4. Run the four guards: 0 failures. If a guard locks the old busy button on these states, update it citing D-74.

## Part 2 — affordance audit (report only, change nothing)
Open every state in `ui-screens/` at full size (390; 360 where layout is tight). For each finding give: screen id, element, what's wrong, which rule, one-line suggested fix.
1. **Looks tappable, isn't:** button shapes or fills with no action; tinted or bordered boxes that look like cards/fields; chips that can't be selected; rows with a chevron and no destination; header icons with no action defined (bell, help); "User manual" with no link.
2. **Tappable, doesn't look it:** text actions not in brand blue; rows without a chevron or other cue; small icon-only controls that aren't back / close / help.
3. **Read-only that looks active:** closed and after-confirm states where notes, View Rx or medicine rows still look editable (known rebuild item — list every place).
4. **Busy buttons that stay longer than a moment** beyond the D-74 list.
5. **Same action, different look** across screens (e.g. Callback as a button vs a link; close × vs Back for the same kind of screen).
6. **Destructive or irreversible actions** without a confirmation (Log out, Release, Unavailable, Disable, Skip HA).
7. **Tap targets under 48px** (inline links in sentences are exempt, D-69).
Codex as a second reader on the findings list (one batch, read-only). If blocked, say so.

## Report
`docs/renders/2026-10-30-status-line/REPORT.md`: Part 1 pass/fail + pixel compare + guards; Part 2 findings table grouped by the 7 checks, each marked **bug** (breaks a rule or decision) or **question** (needs Apurva). Then stop. No commits.

## Never
Change anything beyond Part 1; edit decisions, backlog, design system or `messages.json`; publish or open PRs; git other than `git status`.
