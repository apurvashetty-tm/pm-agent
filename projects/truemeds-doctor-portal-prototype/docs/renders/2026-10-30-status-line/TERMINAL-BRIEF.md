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


---

## Round 2 — audit fixes (2026-10-31, D-75) — work in `ui-screens/`, then stop

1. **D-74 behind sheets:** `s7e-leave-sheet`, `c-callback`, `c-callback-error`, `c-callback-failed` — the Calling bar behind the sheet shows the status line, not the busy button.
2. **Home `unknown-result`:** one status line (`.tm-status-line`) with `home.unknownResult` in place of both the notice and the "Checking…" busy button. Other Home busy labels unchanged.
3. **Closed cases read-only rows:** on `e-*`, `t09`, `t10a`, `t10b`, `t14`, `t15`, `t15b`, `g3b`, `s7f` the medicine rows have no chevron and no tap (app-logic §8). Prescribed/Pending tags stay.
4. **Log out confirm** (`home-reference.js`): wire the Log out and Stay signed in buttons on the Profile-page branch (reference only).
5. **New sheet + state `s7d-unavailable-sheet`:** from 7d, Unavailable opens the sheet — `.tm-sheet`, title "Mark patient unavailable", label "Select reason", three `.tm-option` rows (title · desc): "Didn't answer" · "Rang with no answer"; "Busy or switched off" · "Number busy or phone off"; "Wrong number" · "Invalid or not the patient's number". Same markup as the Disable sheet; choosing a reason → `t09-patient-unavailable`. Copy typed like the other sheets (rebuild item).
6. Re-render the changed states (390/360, fixed clock), add the new one to `case/` pictures, contact sheets, the calling storyboard (new tile after 7d) and `REVIEW.html`; pixel-compare everything else (identical); four guards 0 failures.
7. Append "Round 2" to this folder's REPORT.md. Stop. No commits.
