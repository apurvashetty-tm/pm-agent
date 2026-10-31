# Status line (D-74) and affordance audit — 2026-10-30

Folder: `pm-agent/.work/truemeds-doctor-portal-prototype` (branch `project/truemeds-doctor-portal-prototype`).
No commits, no publishing, no PRs. Git used for `git status` only. Decision log, backlog, open questions, project truth, design system and `messages.json` not edited.

## Part 1 — apply D-74 (long waits are status text) — PASS

**What changed**

- `ui-screens/case/case.html`: a `statusLine(label)` helper (`.tm-status-line`, role=status, spinner + label). Used for the calling wait in t02-calling, s7a-calling, t11-calling-transfer (through `calling`), t05-result-wait, t17-skip-ha-wait, s7c-checking, g2-checking-ha.
- Busy buttons stay on the short waits; the calling states above no longer use one.
- Promoted pictures for the seven states replaced at 390 and 360 (14 files in `ui-screens/case/`).
- Storyboard rebuilt from the promoted pictures (`docs/renders/2026-10-22-calling/storyboard-final.png`), `ui-screens/case/contact-call.png` refreshed.
- `ui-screens/REVIEW.html` regenerated (143 states).

**Pixel comparison (fixed clock 2026-10-28 15:00 IST, 390 and 360, animations frozen for case/prescribe)**

- 158 case and prescribe renders compared with the copy taken before this round.
- 144 identical.
- 7 changed, all intended: `t02-calling`, `s7a-calling`, `t11-calling-transfer`, `t05-result-wait`, `t17-skip-ha-wait`, `s7c-checking`, `g2-checking-ha`.
- 0 page errors.
- A second render was identical to the first.

**Guards** (`ui-screens/feedback/` and `docs/layout_check.py`): locked specs PASS (0 failures), sources PASS, layout ALL PASS, lockup OK. No guard change was needed.

**Environment note:** the scratch Playwright venv was rebuilt (`scratchpad/venv`). Chromium was already cached.

**Not changed (intentional):** `s7e-leave-sheet`, `c-callback`, `c-callback-error`, `c-callback-failed` still use a busy button over the calling wait. See finding B6.

## Part 2 — affordance audit (report only, nothing changed)

**Method, and its limits.** This pass was automated, not a full visual review:

- A browser probe checked every visible control in 83 pages (57 case states, 6 sign-in / OTP / unlock / offer pages, 11 Home states, plus Profile) for a click handler. It returned 130 flags.
- Each flag was traced to source. Confirmed cases are listed below; the rest are marked not confirmed.
- A tap-target scan (all controls under 48px, inline links excluded) covered 56 pages.
- Medicine rows were checked in live pages for listeners and `pointer-events`.
- **Not done:** a full-size visual pass over all 143 states (checks 2 and 5 below are therefore not covered), and the four sign-in / OTP / unlock / offer flags, whose handlers were not traced.

**Findings**

Format: id · bug/question · screen · element · what is wrong · rule · one-line fix.

**1. Looks tappable but isn't (check 1)**

- B1 · **bug** · all 57 case states · header Help (`#ch-help`) · no handler; only Back is wired (`case.html:791–793`) · brief check 1 (header help icon with no action) · wire to Help, or hide until Help is designed.
- B2 · **bug** · all Home states · header Notifications and Help · no handler (`home-reference.js:117`; Profile is wired at `:137`) · check 1 · same fix as B1.
- B3 · **bug** · 7a, t02, t05, t11, t17, t06, s7e, c-callback* · Callback secondary button · built by `callbackRow()` with no handler (`case.html:1067`) · check 1 · `openSheet('sheet-callback')`.
- B4 · **bug** · Home main view · End availability · the `data-secondary` button has no handler outside a sheet; the `end-confirmation` sheet cannot be reached (`home-reference.js:52, 56, 139`) · check 1 · open `end-confirmation` on tap.
- Q1 · **question** · case states using `btn()` (Call again, Confirm & forward, Skip HA, Yes / No still talking, No call ended, Unavailable, Confirm prescription) · `btn()` never attaches a handler (`case.html:1051`) · the reference is picture-only, or the buttons should go to the flow · ask Apurva.
- Q2 · **question** · Home Profile · User manual row · no link (`home-reference.js:89`) · already on the open-items list · ask.
- NC-sign-in · **bug** · sign-in · Send OTP and Call Doctor Ops share an unwired button (`sign-in.html:82, 151`). Codex: the script only renders states.
- NC-OTP · **bug** · OTP · Resend code has no handler (`otp.html:130, 162, 172`).
- NC-unlock · **bug** · returning-unlock · Unlock with fingerprint, Use OTP instead, Switch account have no handlers (`returning-unlock.html:42–44, 55`).
- NC-offer · **bug** · faster-signin-offer · Turn on faster sign-in and Not now have no handlers (`faster-signin-offer.html:56–57`). Escape also calls the same inert Not now (`:93`).
- Scope: these handlers are in the page scripts, not the case or Home files. Codex checked them.
- M1 · **bug** · case load-failed and Rx-failed screens · Try again buttons have no handler (`case.html:1023, 1098, 1117`).
- M3 · **bug** · Home stop-pending · the Ending… button is enabled and has no handler while the request resolves (`home-reference.js:52, 56`).
- M4 · **bug** (D-74) · Home unknown-result · the reconciliation wait stays a busy Checking… button instead of status text (`home-reference.js:47, 54`; `docs/feedback-state-map.md:113`).

**2. Tappable but doesn't look it (check 2)** — not covered. No visual pass.

**3. Read-only that looks active (check 3)**

- Q5 · **question** (D-51) · t10a-confirmed, t14-transferred picture · the medicine rows are tappable in the picture, because the recipe does not set the consultation state. Codex (ac97…) found the live flow does set `completed` on confirm and transfer, so rows are blocked there (`case.html:833, 903`). The picture and the live flow disagree · ask whether the picture should show read-only rows, and set the state in the recipe if so.
- OK · e-callback-scheduled, e-availability-ended · medicine rows are `pointer-events:none` via `tm-row--readonly`.
- Not checked · notes field and View Rx in closed states. View Rx is wired (`case.html:267`); whether it looks active in closed states needs the visual pass.

**4. Busy buttons longer than a moment (check 4)**

- B6 · **bug** (D-74) · s7e-leave-sheet, c-callback, c-callback-error, c-callback-failed · `busy('Calling…')` is a busy button over the call wait (`case.html:1153, 1156–1160`) · the same wait is a status line on 7a after Part 1 · use `statusLine`.

**5. Same action, different look (check 5)** — not covered. No visual pass.

**6. Destructive without confirmation (check 6)**

- M2 · **bug** · Home Profile · Log out confirm sheet · its primary **Log out** button is dead. The Profile branch returns (`home-reference.js:113`) before the `[data-confirm]` handler is attached (`:140`). Codex verified. Fix: attach the confirm handler in the Profile branch too.
- Q3 · **question** · s7d-result-missing · Unavailable is a destructive button with no confirm. Codex: it is not wired, so it cannot fire; once wired it would apply directly, which D-58/D-59 approve for direct Unavailable · ask whether to add a confirm.
- Q4 · **question** · Skip HA reason sheet · the reason applies on tap, no confirm. Codex: approved option-row rule (D-70). Confirm intended.
- OK · Release has a leave sheet (`a-leave-sheet`), per the state list (not re-read).

**7. Tap targets under 48px (check 7)** — no finding. All controls are 48px or taller. The two 20px labels (notes, symptoms) are wrappers around fields. The Faster sign-in checkbox is 20px inside a full-width label row, which is the tap target.

## Codex second reader

Codex was given the findings list (`scratchpad/affordance_findings.md`) as one read-only batch, cap 1. Its verdicts are below.

Codex (read-only, one batch) verdicts. Its citations were not all re-checked by me; M2 and B5 were re-checked, and the rest were checked by reading the cited lines only where noted.

| Item | Codex | Note |
|---|---|---|
| B1 Help (case) | confirmed | |
| B2 Home Notifications / Help | confirmed | |
| B3 Callback | confirmed | |
| B4 End availability | confirmed | Codex: reachable only through the review selector |
| B5 closed rows | **rejected** | Moved to Q5: live flow blocks taps; picture does not |
| B6 busy Calling | confirmed | also cites `decision_log.md:813` |
| Q1 generated buttons | confirmed | main CTA at `:478` stays wired |
| Q2 User manual | confirmed | accepted backlog item, not a new decision |
| Q3 s7d Unavailable | rejected | not wired, so it cannot fire |
| Q4 Skip HA reason | rejected | approved option-row rule |
| NC sign-in / OTP / unlock / offer | confirmed | bugs, see above |
| M1–M4 | missed by me, added | M2 re-checked and confirmed |
| Checks 2 and 5 | not covered | no visual pass; Codex agrees |
| Check 7 tap targets | confirmed from source | rendered measurement not done |

Codex did not report any destructive action without a confirm beyond M2 (where the confirm itself is dead).

## Stop

Part 1 done and verified. Part 2 done as an automated audit plus Codex's read-only second read, with the limits above. No file in `ui-screens/` changed in Part 2.

Bugs found, not fixed (fix is a one-liner each): B1, B2, B3, B4, B6, M1, M2, M3, M4, NC-sign-in, NC-OTP, NC-unlock, NC-offer.
Questions for Apurva: Q1, Q2, Q3, Q4, Q5.

---

## Round 2 — audit fixes (D-75, 2026-10-31)

Brief: `TERMINAL-BRIEF.md`, "Round 2". Work in `ui-screens/`. No commits, no publishing. Decision log, backlog, open questions, project truth, design system, `messages.json`, and `README.md` not edited.

### Items

1. **D-74 behind sheets — done.** `s7e-leave-sheet`, `c-callback`, `c-callback-error`, `c-callback-failed`: the Calling bar now uses `statusLine` (was `busy`). The sheet covers the bar at 390 and 360, so the pictures are pixel-identical. Verified in the DOM: the visible bar behind each sheet is the status line. `setBar` hides old children rather than removing them, so a hidden busy button stays in the DOM (`display:none`, not visible).
2. **Home `unknown-result` — done.** `statusNotice()` returns one `.tm-status-line` (spinner + `home.unknownResult`). `footer()` returns nothing for this state: no notice and no "Checking…" button. Other busy labels unchanged. Verified: 1 status line, 0 busy buttons, no footer. Pictures replaced: `home/home_unknown-result_w390.png`, `_w360.png`.
3. **Closed-case read-only rows — checked, no change needed.** On `e-callback-scheduled`, `e-availability-ended`, `t09`, `t10a`, `t10b`, `t14`, `t15`, `t15b`, `g3b`, `s7f`, every medicine row has `pointer-events:none` and no visible chevron. Prescribed and Pending tags stay. My earlier "tappable" reading (Round 1 audit, B5) came from a capture at 500 ms, before the close timer (1.1 s) had run; at picture timing (2.2 s) the rows are read-only. Codex's B5 rejection was right for the pictures.
   - **Still open:** the live flow has a 1.1 s window after Confirm or Transfer in which the rows are tappable (`closeCase`, `case.html`, `setTimeout` 1100 ms before `syncConcept`). Not changed in this round; it is a timing issue for the live reference.
4. **Log out confirm — done.** `home-reference.js`: the Profile branch now wires `[data-confirm]` (Log out) to the reference status message. Stay signed in already worked. Verified by click: Log out opens the sheet, the confirm sets the message, Stay signed in returns to Profile.
5. **New sheet and state `s7d-unavailable-sheet` — done.**
   - `#sheet-mark-unavailable` (in `case.html`, same markup as the Disable sheet): title "Mark patient unavailable", "Select reason", three `.tm-option` rows with the approved copy.
   - The 7d Unavailable button (`s7dBar`, `unavailableBtn`) opens it. The 7d recipe is now a shared helper (`s7dBar`), so the bar is defined once.
   - **Choosing a reason goes to `t09-patient-unavailable`.** Deviation: the rows navigate to the t09 URL rather than changing state in place. In-place testing (`switchScenario`, `initiateCall`, `markCustomerUnavailable`) left the 7d bar and Prescribed tags on screen, so it did not reach the t09 picture. Navigation is exact: the click result equals the t09 picture at 390 and 360.
   - The reasons are not recorded (no field in the spec; mock). Copy typed like the other sheets (rebuild item).
   - The legacy `#sheet-unavailable` (redirected to a toast by the case-page override) is unchanged.
6. **Re-render and compare — done.** Method: fixed clock 2026-10-28 15:00 IST; case/prescribe frozen at 2000 ms; family and Home unfrozen at 700 ms (as the approved pictures). Compared with the pre-round copy at `scratchpad/pre-round2/ui-screens`.
   - **case: 114 of 114 identical** (includes all four D-74 sheets and `s7d-result-missing`). New state rendered at 390 and 360.
   - **prescribe: 44 of 44 identical.**
   - **home: 40 of 44 identical.** `unknown-result` (390, 360): changed, intended, replaced. `adding_w390`, `adding_w360`: spinner frame. Two runs of the same code differ at the spinner position, so this is noise.
   - **family: 83 of 84 identical.** `offer_enabling_w390`: spinner frame at the same position; the page was not touched, and reruns agree with each other.
   - Storyboard rebuilt with the new tile after 7d (`docs/renders/2026-10-22-calling/storyboard-final.png`); `ui-screens/case/contact-call.png` refreshed.
   - `case/contact-case.png` and `home/contact-home.png` rebuilt on a 9-column grid. The earlier generator was not saved, so the layout is new; each sheet lists every 390 picture in its folder.
   - `ui-screens/REVIEW.html`: new figure after 7d; calling count 31 → 32; header adds "audit fixes 2026-10-31". Edited directly (the generator was not saved).
   - Harness bug found and fixed in this round: the Home state slice was off by four characters, so the first Home runs rendered the wrong states. All Home numbers above come from the fixed run.

### Guards

- `check-locked-specs.py`: **PASS, 0 failures** (114 states × 3 widths). One change, cited in a comment as D-75: the Home footer check is null-safe and skipped where there is no footer. Before the change the guard crashed on `unknown-result`. The footer rule otherwise unchanged.
- `check-sources.mjs`: **PASS** (80 registry IDs).
- `docs/layout_check.py`: **ALL PASS**.
- `brand/check_lockup.py`: **OK**.
- **Gap, not fixed:** `D_STATES` in `check-locked-specs.py` still names retired ids (`b-*`, `e-prescription-confirmed`, etc.). The guard passes but does not cover the calling states (`t*`, `s7*`) or the new `s7d-unavailable-sheet`.

### Files changed in Round 2

- `ui-screens/case/case.html`: busy → status line (4 recipes); `statusLine` for D-74; `s7dBar`, `unavailableBtn`; `chooseUnavailableReason`; `#sheet-mark-unavailable`; recipe `s7d-unavailable-sheet`.
- `ui-screens/home/home-reference.js`: `unknown-result` status line and no footer; Log out confirm wired on the Profile branch.
- `ui-screens/feedback/check-locked-specs.py`: Home footer check null-safe for `unknown-result` (D-75).
- `ui-screens/case/s7d-unavailable-sheet_w390.png`, `_w360.png` (new).
- `ui-screens/home/home_unknown-result_w390.png`, `_w360.png` (replaced).
- `ui-screens/case/contact-case.png`, `ui-screens/home/contact-home.png` (rebuilt).
- `ui-screens/case/contact-call.png`, `docs/renders/2026-10-22-calling/storyboard-final.png` (rebuilt).
- `ui-screens/REVIEW.html` (new figure, count, header).
- This file.

Not changed: decision log, backlog, open questions, project truth, `messages.json`, design system, `ui-screens/README.md` (its calling table does not yet list `s7d-unavailable-sheet`; a follow-up).

### Git note

No commits. `git status` shows changes from earlier rounds that are still uncommitted (for example the D-74 pictures) and paths this round did not touch: `design-system/native/tokens.{json,ts}`, `design-system/preview.html`, `docs/proposals/`, `docs/reviews/`, `docs/renders/2026-10-28-promotion/candidate/`. Left as they are.

### Decisions for Apurva

- Should the chosen reason be recorded, and where? It is currently not stored.
- Copy for the Mark patient unavailable sheet is typed (rebuild item).
- Accept the 1.1 s live window in which closed rows are tappable, or fix the timer? (Reference only.)
- Should `ui-screens/README.md` list the new state (a follow-up, outside this brief)?

## Stop

Round 2 done. Nothing committed or published.

---

## Round 3 — stale case states (2026-10-31)

Brief: `TERMINAL-BRIEF.md`, "Round 3", with the "Also in this round" items. Work in `ui-screens/`. No commits, no publishing. Decision log, backlog, open questions, project truth, design system and `messages.json` not edited.

**Result: one guard failure remains (R5, s7b at 360, a copy-fit question for Apurva). Everything else in the brief is done.**

### 1. The six stale `a-*` states (rebuilt from the calling helpers)

| State | Now shows | Checked |
|---|---|---|
| `a-back-blocked` | Calling bar (status line "Calling Ramesh…" + Callback), Cat4 script, no header Back, phone-back toast | DOM: Back hidden, toast visible, no End call |
| `a-confirm-busy` | 8a after the call (script hidden), "Confirming…" busy button, Callback disabled | DOM: busy text, Callback disabled |
| `a-confirm-failed` | 8a, no script, red "Couldn't confirm. Nothing was lost." above Confirm prescription, Callback | DOM: no script, Confirm prescription |
| `a-scrolled` | Ready state scrolled, no script card before Call | DOM: no card; picture changed (card removed) |
| `a-long-content` | Ready state with long content, no script card | DOM: no card. Picture unchanged: the card was below the fold |
| `a-releasing` | s7e look (leave sheet, calling bar behind) with "Releasing…" busy on Release case | DOM: busy, sheet open, **no navigation** (the old recipe clicked Release, which goes to Home) |

Helpers added: `releasingBusy()`. Recipes `a-back-blocked`, `a-confirm-busy`, `a-confirm-failed`, `a-releasing` rewritten; `a-confirm-*` now run `allRx()` and hide the action zone as on 8a.

### 2. Ready-state script card (one place)

- `syncConcept()`: in the Ready state (`assigned`, not attempted) the script card and its zone are hidden. This runs on every render, so no recipe needs changing.
- `initiateCall()` shows the action zone and card again for an attempted call. Needed because app.js's "shown" check hides the zone for good once it is hidden, so an attempted call must re-open it. Found when `g1-generic-confirm` and `g2-checking-ha` lost their card; both now match their earlier pictures again.
- DOM check across all 58 case states: the card is visible only in calling, outcome and transfer states (`t02`, `t05`, `t11`, `t12`, `t13`, `t15`, `t15b`, `t17`, `g1`, `g2`, `g3b`, `a-back-blocked`, `a-releasing`, `c-*`, `s7a`, `s7b`, `s7e`). No Ready state shows it.

### 3. Sweep of `a-*`, `c-*`, `e-*`, `s-*` (old helpers and old copy)

- DOM sweep, all 58 case states: no visible "End call", "confirming your order", "Get next order", "Good afternoon" or "orders closed"; no navigation; no page errors.
- Wording still on screen, **listed, not changed**:
  - "No medicines on this order." (`a-no-medicines`, registry key `case.noMedicines`): breaks the case-wording rule. Fixing it means editing `messages.json`, so it is a question.
  - "Counselled in an earlier order" (`c-skip-ha` reason option, typed sheet copy): same rule, sheet copy, question.
  - "…track your order in the Truemeds app." (Cat4 script, `call.scriptCat4`, approved D-58 pt 21): refers to the patient's order. Left.
  - "Order details", "Order created", "Order TM-…": the customer's order, sanctioned.
- Old helpers still called by `e-callback-scheduled` (`passGate`), `c-skip-ha` (`passGate` + `allRx`). Both are closed or approved states with no visible break. Not changed.

### 4. View Rx (D-76, with D-51)

- Before: closed cases switched View Rx to `tm-btn--quiet` (case.html toggle), and it sat inside `.tm-readonly` (design system: `pointer-events:none`), so it could not be tapped.
- Now: the same outlined secondary button on every case. `#pdb-view-rx-btn{pointer-events:auto}` keeps it tappable after close (D-51 keeps View Rx in the live card). Verified on `a-top`, `t09`, `t10a`, `e-callback-scheduled`, `s7f`.
- This corrects my Round 2 reading (Codex B5 and my earlier note that closed content "intentionally blocks" View Rx): View Rx is meant to stay live.
- Pictures that changed for View Rx: `e-availability-ended`, `e-callback-scheduled`, `g3b`, `s7f`, `t09`, `t10a`, `t10b`, `t14`, `t15`, `t15b`.
- Kept: `a-confirm-busy` greys View Rx while confirming (existing busy behaviour, app-logic §6).

### 5. Also in this round (from the Round 2 report)

- **Guard coverage.** Detail in the guard section below.
- **README.** `ui-screens/README.md`: case table 57 → 58 (D-48 to D-76); calling 31 → 32; new row for `s7d-unavailable-sheet`; new design rules (script card, View Rx); the stale guard 5.12 open item replaced with the D-73 resolution.
- **Reproducible pictures.** New `ui-screens/_qa/` builders (below). `REVIEW.html` and the contact sheets rebuilt with them.

### 6. Guards: states now checked

**check-locked-specs.py.** Before: 114 states. The `D_STATES` list named retired `b-*` and `e-prescription-confirmed` ids, and check 8.1 compared against the 2026-10-15 coverage matrix, so it passed without checking the current set. Now:

- **144 states × 3 viewports (390, 360, 430)**: sign-in 12, OTP 17, returning unlock 7, faster sign-in offer 6, Home and Profile 22, case 58, prescribe 22.
- Check 8.1 now confirms each state has a recipe in `case.html` (or a capture branch) and its 390 and 360 pictures. The historical matrix is no longer used.
- Lists changed: `D_STATES` rebuilt from the pictures; `HOME_STATES` + the three Profile states; `OFFER_STATES` 3 → 6 (every offer picture).
- Guard edits: D-75 footer check is null-safe and skipped where there is no footer (`unknown-result`); the logo-to-title gap is measured only where a logo exists (Profile is a task page with no logo, D-70).
- Fixes the guard found in the new states (real, not guard artefacts):
  - `home/logout-confirm`: focus did not move into the sheet. `home-reference.js` now focuses the sheet (guard 4.7).
  - `case/s-medicine-disabled`: the Disabled tag had no tone. The case page now adds `tm-tag--neutral` (guard 5.5, D-68). Picture unchanged.
  - `case/s7b-still-on-call` at 360: the two buttons were unequal (163 / 157 px). `pairOf` sets `minmax(0,1fr)` columns (D-53 equal halves). **`s7b_w360` changed**; `s7b_w390` unchanged.
- **Result: 1 failure.** `R5` on `case/s7b-still-on-call @360`: "Yes, still talking" plus its icon need 163 px, but each half of the pair is 160 px. The label does not fit a half at 360. I did not force it with a local gap or padding rule, because that is the restyle the guard exists to block. **Question for Apurva:** shorter label, or stack the two buttons at 360?

**check-sources.mjs.** The OTP list checked 12 of the 17 OTP states; now all 17. PASS: sign-in 12, OTP 17, 80 registry IDs.

**docs/layout_check.py.** ALL PASS (95 checks). It covers sign-in, OTP, unlock and Home at 390, not a per-state list.

**brand/check_lockup.py.** OK.

### 7. Pictures

Pixel compare against the pre-round-3 copy (fixed clock, same method as earlier rounds):

- **case: 116 renders, 83 identical, 33 changed.** The changed set is the rebuilt states (a-back-blocked, a-confirm-busy, a-confirm-failed, a-releasing, a-scrolled, a-no-medicines), the View Rx closed states (above), and `s7b_w360` (equal halves). All 33 copied into `ui-screens/case/`. `a-no-medicines` changed because the old card peeked out above the action bar under the notes; it is gone now.
- **prescribe: 44 of 44 identical.**
- **home: 44 of 44 identical** (the Round 2 unknown-result pictures are the baseline).
- **family: 81 of 84 identical.** The 3 differences (`otp_verifying` at 390 and 360, `offer_enabling` at 390) are confined to 34 px spinner boxes. Repeat renders of the same code differ at the same spot, so this is frame noise.

### 8. Reproducible builds (new: `ui-screens/_qa/`)

- `build-review.py`: rebuilds `ui-screens/REVIEW.html` from the folders. 144 states in 8 sections, counts computed. Its figure set matches the previous page exactly.
- `build-contact-sheets.py`: rebuilds the seven folder contact sheets (9 columns, every 390 picture in the folder), and copies the storyboard to `case/contact-call.png`.
- `build-storyboard.py`: rebuilds `docs/renders/2026-10-22-calling/storyboard-final.png` (run it before the contact sheets). Includes the new 7d tile.
- Run from the project folder: `python3 ui-screens/_qa/build-review.py` (and the other two). The contact sheets and storyboard need Pillow.

### Files changed in Round 3

- `ui-screens/case/case.html`: the six `a-*` recipes; `releasingBusy`; `syncConcept` Ready rule; `initiateCall` restore; View Rx (CSS rule, toggle removed); Disabled tag tone; `pairOf` equal halves.
- `ui-screens/home/home-reference.js`: focus moves into the logout-confirm sheet.
- `ui-screens/feedback/check-locked-specs.py`: state lists, 8.1 rewritten, null-safe footer and logo gap.
- `ui-screens/feedback/check-sources.mjs`: 17 OTP states.
- `ui-screens/README.md`: counts, 7d row, design rules, 5.12 item.
- `ui-screens/REVIEW.html`: rebuilt by `_qa/build-review.py`.
- `ui-screens/_qa/build-review.py`, `build-contact-sheets.py`, `build-storyboard.py`: new.
- Contact sheets: all seven folders rebuilt. `case/contact-call.png` and `docs/renders/2026-10-22-calling/storyboard-final.png` rebuilt.
- 33 case pictures (listed in section 7).
- This file.

Not changed: `messages.json`, decision log, backlog, open questions, project truth, design system.

### Open questions for Apurva

1. **R5:** "Yes, still talking" does not fit a half-width button at 360. Shorter label, or stack the pair at 360?
2. "No medicines on this order." (case wording rule): change the registry key?
3. "Counselled in an earlier order" (Skip HA reason option): change the sheet copy?
4. Accepted from the brief, unchanged: the reason from the Mark patient unavailable sheet is not stored in the reference (the real app saves it, app-logic 7d); sheet copy typed (rebuild item); the 1.1 s window after Confirm in the reference (the real app disables everything while confirming, app-logic §6).

### Stop

Round 3 done except the R5 guard failure above. Nothing committed or published.



---

## D-77 — 7b answer labels (2026-10-31)

Brief: "Still talking" / "Call ended" (Apurva, 2026-10-31, D-77 point 1). Decision log entry D-77 already in place (`docs/context/decision_log.md`); not edited here.

- **Changed:** `ui-screens/case/case.html`, the 7b bar: "Yes, still talking" → **"Still talking"**, "No, call ended" → **"Call ended"**. Same secondary buttons, same pair (equal halves, `minmax(0,1fr)` from Round 3).
- **Re-rendered** `s7b-still-on-call` at 390 and 360 (fixed clock, same method); copied to `ui-screens/case/`. Checked visually at 360: both labels fit side by side under the question.
- **Resolves guard R5** (Round 3's one failure): the shorter labels fit a half-width button at 360. Round 3 stays as written; this entry closes its open question 1.
- **D-77 items 2 and 3 are already in place:** back-blocked stays a toast (`a-back-blocked`); "order" stays for the patient's order ("No medicines on this order.", "Counselled in an earlier order"). No change.
- **Rebuilt with `ui-screens/_qa/`:** `build-storyboard.py` → `docs/renders/2026-10-22-calling/storyboard-final.png` (and `ui-screens/case/contact-call.png`); `build-contact-sheets.py` → the seven folder contact sheets. `REVIEW.html` unchanged (labels only, no state added or removed).

**Guards (all four):**

| Guard | Result |
|---|---|
| `check-locked-specs.py` | **PASS, 0 failures**: 144 states × 3 viewports (390, 360, 430) |
| `check-sources.mjs` | **PASS**: 12 sign-in, 17 OTP states, 80 registry IDs |
| `docs/layout_check.py` | **ALL PASS** |
| `brand/check_lockup.py` | **OK** |

**Still stale, outside this brief (not changed):**
- `ui-screens/app-logic.md` lines 108 and 121 and `ui-screens/feedback/metadata.json` lines 565 and 572 still show "Yes, still talking" / "No, call ended". Brief scope was `case.html` only. The registry (`metadata.json`) and the app rules should follow D-77; say if you want them updated now.

Nothing committed or published. Stop.
