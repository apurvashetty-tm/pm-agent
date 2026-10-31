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
5. **New sheet + state `s7d-unavailable-sheet`:** from 7d, Unavailable opens the sheet — `.tm-sheet`, title "Mark patient unavailable", label "Select reason", three `.tm-option` rows (title · desc): "Didn't answer" · "Rang with no answer, or the line was busy"; "Not reachable" · "Phone switched off or out of coverage"; "Wrong number" · "Invalid or not the patient's number". Same markup as the Disable sheet; choosing a reason → `t09-patient-unavailable`. Copy typed like the other sheets (rebuild item).
6. Re-render the changed states (390/360, fixed clock), add the new one to `case/` pictures, contact sheets, the calling storyboard (new tile after 7d) and `REVIEW.html`; pixel-compare everything else (identical); four guards 0 failures.
7. Append "Round 2" to this folder's REPORT.md. Stop. No commits.

---

## Round 3 — stale case states found in the main thread's visual pass (2026-10-31) — after Round 2, work in `ui-screens/`, then stop

Six approved `a-*` states were promoted unchanged from before D-58. Their recipes use the old `app.js` helpers (`startCall`, `passGate`, the old pre-call card), so they show things later decisions removed. **Rebuild each recipe from the calling helpers** (`calling`, `showScript`/hide, `setBar`, `busy`, `MSG`), so it matches the calling set. These are bug fixes against existing decisions — no new design.

| State | What's wrong now | Should show (decision) |
|---|---|---|
| `a-back-blocked` | Red **End call** button; old script "I'm confirming your order now…" | No End call (D-58). The attempted-call state = Calling: status line "Calling {name}…" + Callback (D-74), Cat4 script (`call.scriptCat4`, D-58 pt 21), **no header Back** (D-58: never after an attempted call); the phone-back toast as today. |
| `a-confirm-busy` | Old script shown; old copy | State 8a after the call (script hidden on 8a/8b, D-58 pt 24) with **"Confirming…" busy button** (short wait — stays a busy button, D-74) and Callback disabled. |
| `a-confirm-failed` | Old script shown; old copy | 8a, no script, red line `case.confirmFailed` above Confirm prescription, Callback as on 8a. |
| `a-scrolled` | End-of-call script card **before Call** | Ready state scrolled — no script card before Call (D-58 pt 18, D-71); same as `t01-ready` otherwise. |
| `a-long-content` | Script card before Call (below the notes) | Ready state with long content — no script card (D-58 pt 18). |
| `a-releasing` | **Old Home design** ("Good afternoon… Get next order", "0 orders closed") | The leave sheet (`s7e` look) with **"Releasing…"** busy on Release case (short wait after a tap). After release the doctor lands on the approved Home — not a separate picture. |

**Note:** the script card probably exists below the fold in every Ready state (`t01-ready`, `a-top`, `a-offline`, `a-notes-typing`, `s-*` …) and only shows when scrolled. Hide it in the Ready state itself (one place), not per recipe, and DOM-check that no Ready state has a visible script card anywhere on the page.

Also check every other `a-*`, `c-*`, `e-*`, `s-*` recipe for the same old helpers or old copy ("order" for case, "I'm confirming your order", "Get next order", End call) and list any you find; fix only those that clearly break a decision, list the rest.

**View Rx (D-76):** the outlined button on every case state, including all closed states (`e-*`, `t09`, `t10a`, `t10b`, `t14`, `t15`, `t15b`, `g3b`, `s7f`) — same look as on open cases.

Re-render the changed states (390/360, fixed clock), contact sheets and `REVIEW.html`; pixel-compare everything else; guards 0 failures. Append "Round 3" to REPORT.md. Stop. No commits.
