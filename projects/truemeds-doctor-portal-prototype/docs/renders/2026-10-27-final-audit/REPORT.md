# Final audit before promotion (2026-10-27)

Audit only. Nothing fixed, nothing promoted. `ui-screens/`, working copies, design system, `messages.json`, decision log, open questions, project truth, backlog: untouched. The only files added are the two late renders and this folder's inputs.

Candidate set audited:
- Calling: `docs/renders/2026-10-22-calling/src/case.html` + `docs/renders/2026-10-26-margin-16/round-1/calling/` (31 state ids with pictures).
- Entry, Home, case, Prescribe: `docs/renders/2026-10-26-entry-ds-pass/src/` + `docs/renders/2026-10-26-margin-16/round-1/<family>/` (case: 43 state ids).
- Late: `s-medicine-disabled` rendered into `round-1/late/` (360, 390). 7f copy checked (stale, see GAP G2).
- Approved baseline: `ui-screens/`.

Note on counts: the brief says the calling set is 32 states incl. 8c. The folder holds 31 state ids (8c included). I found no 32nd id.

---

## Summary

| Item | Result |
|---|---|
| 1. Flow coverage | 9 GAPs (Prescribe Alt days, Monthly, Inhaler; callback sheet ×3; Skip HA reason sheet; Profile sheet; Help). Every call state covered |
| 2. Edge cases | Large text 1.3× on 11 main states: no horizontal overflow, no clipping found by probe; one wrap issue (OTP "Change"). Long names, 10 medicines, offline, busy, error covered by approved-style states |
| 3. Decisions D-56 → D-68 | 3 FAILs (D-58 pt 17 card copy conflict; D-68 7f copy stale; D-68 disabled-name contrast). Rest pass or not visible |
| 4. Copy | 5 unused keys; `case.callEndedEarly` says "50 seconds" (rule breach, used only by retired b-ended-early). "HA" appears only on Skip HA button in mobile renders (desktop demo panel excluded) |
| 5. Visual rules | 16 margin ✓; action bar ✓; status tones and no-shadow ✓; icon rule ✓ (per D-66 B); **contrast FAIL** on disabled name (~2.2:1); tap targets: 2 inline text links below 48px (confirm exemption) |
| 6. Old vs new | 56 approved case-family states + 12 + 7 + 3 + 19 + 17 + ... accounted (table below). 4 approved c-* states have no new picture |

---

## 1. Flow coverage

Source: `ui-screens/app-logic.md` (all sections). Full state → render list: `round-1/inputs/state-table.md`.

### 1a. Call states (§5, §4, §6; D-58, D-63, D-64)

| app-logic state | Render id(s) | Result |
|---|---|---|
| 1 call.ready | t01-ready | covered |
| 2 call.calling (= 7a) | t02-calling, s7a-calling | covered |
| 3 not-through | t03-not-through | covered |
| 4 doctor-missed | t04-doctor-missed | covered |
| 5 result-wait | t05-result-wait | covered |
| 6 ended-early | t06-ended-early | covered |
| 7b still-on-call | s7b-still-on-call | covered |
| 7c checking | s7c-checking | covered |
| 7d result-missing | s7d-result-missing | covered |
| 7e leave sheet | s7e-leave-sheet | covered |
| 7f submitted | s7f-submitted | covered — **picture has old copy** (G2) |
| 8a valid Cat4 | t08a-valid-cat4 | covered |
| 8b valid forward | t08b-valid-forward | covered |
| 8c confirm blocked (D-64) | t08c-confirm-blocked | covered |
| 9 patient-unavailable | t09-patient-unavailable | covered |
| 10a / 10b confirmed / forwarded | t10a-confirmed, t10b-forwarded | covered |
| 11 calling-transfer | t11-calling-transfer | covered |
| 12 transfer-ready | t12-transfer-ready | covered |
| 13 transferring | t13-connecting-ha | covered (no Callback, D-64/25 exception) |
| 14 transferred | t14-transferred | covered |
| 15 transfer-failed | t15-ha-no-join | covered |
| 15b end-call-first (also B3, D-63/D-64) | t15b-end-call-first | covered |
| 16 transfer-missed doctor / patient / unknown | t16, t16b, t16c | covered |
| 17 skip-ha-wait | t17-skip-ha-wait | covered |
| Fallback B | g1-generic-confirm, g2-checking-ha, g3b-forwarded | covered |
| §6 `call.ha-no-join` (shown before 15) | — | **GAP G8** (key exists, unused; no separate render) |
| §4 call.calling-you, call.connecting, call.on-call, call.on-call-transfer | retired by D-58 pt 14 | ORPHAN-free (retired) |

### 1b. Case page, closed cases, sheets, Prescribe

| Branch | Render id(s) | Result |
|---|---|---|
| Ready, loading, load failed, offline, busy, release, release failed | a-top, a-loading, a-load-failed, a-offline, a-releasing, a-release-failed | covered |
| Confirm busy / failed | a-confirm-busy, a-confirm-failed | covered |
| Leave sheet (Back, Release decided D-58 pt 20) | a-leave-sheet | covered |
| Back blocked after attempt | a-back-blocked | covered |
| Order details, Rx viewer, Rx failed | a-order-details, a-rx-viewer, d-rx-failed | covered |
| Notes typing, long content, no medicines, scrolled | a-notes-typing, a-long-content, a-no-medicines, a-scrolled | covered |
| Closed: prescription confirmed / transferred / forwarded / patient unavailable | e-prescription-confirmed, e-transferred, e-forwarded, e-patient-unavailable | covered (→ 10a, 14, 10b, 9 per promotion map) |
| Closed: callback scheduled, availability ended | e-callback-scheduled, e-availability-ended | covered |
| Stress: 10 medicines, optional empty | s-10-medicines, s-optional-empty | covered |
| Medicine disabled (D-68 pt 3) | s-medicine-disabled (late) | covered |
| Prescribe: tablet/capsule daily | d-default | covered |
| Prescribe: syrup, drops, injection, cream | d-syrup, d-drops, d-injection-default, d-cream | covered |
| Prescribe: Every X hours, SOS only, SOS on, weekly | d-every-x-hours, d-sos-only, d-sos-on, d-weekly | covered |
| Prescribe: food selected, header white, scrolled, notes keyboard | d-food-selected, d-header-white, d-scrolled, d-notes-keyboard | covered |
| Prescribe: duration picker, error dose, error other | d-duration-picker, d-error-dose, d-error-other | covered |
| Prescribe: discard sheet, disable sheet | d-discard-sheet, d-disable-sheet | covered |
| Prescribe: **Alt days** (schedule) | — | **GAP G3** |
| Prescribe: **Monthly** (schedule) | — | **GAP G4** |
| Prescribe: **Inhaler** (form) | — | **GAP G5** |
| Callback sheet (§7): choose, errors, confirm, save failure | c-callback, c-callback-error, c-callback-failed (approved recipes only) | **GAP G1** — not in new set |
| Skip HA reason sheet (§6) | c-skip-ha (approved recipe only) | **GAP G1** |

### 1c. Entry and Home

| Branch | Render id(s) | Result |
|---|---|---|
| Sign-in: 12 states (empty, short, wrong first digit, pasted, sending, not registered, offline, couldn't send, too many, inactive, keyboard) | sign-in/* | covered |
| OTP: 17 states (default … expired and resend-limited) | otp/* | covered |
| Unlock: fingerprint, face, screen-lock, pending, cancelled, platform-retry, unavailable | returning-unlock/* | covered |
| Offer: fingerprint, face-id, enabling, screen-lock, enable-failed, offline | faster-signin-offer/* | covered |
| Offer: cancelled prompt → back to offer | — | behaviour only (D-65); no picture |
| Offer: no screen lock → offer skipped | — | behaviour only (D-64 pt 4) |
| Home: 19 states (setup, active, request, no cases, offline, add time, end, expired, unknown result …) | home/* | covered |
| Window ended during case → Back to Home | e-availability-ended | covered |
| Profile sheet (Wallet, faster sign-in toggle, Logout) | — | **GAP G6** (approved README: "not in these screens") |
| Help (§3 "Help on Home"; §4 "Help stays available at every stage") | — | **GAP G7** |
| Notifications bell | — | not specified as a screen; NEEDS-APURVA N4 |

---

## 2. Edge cases and large text

| Family | Loading | Empty | Error | Offline | Busy / double-tap | Long content | 360 | Large text 1.3× |
|---|---|---|---|---|---|---|---|---|
| Sign-in | — | — | couldn't send, not registered | offline | sending | — | all 12 at 360 | covered (probe) |
| OTP | resending | — | couldn't verify, resend failed | offline | verifying | — | all at 360 | covered (probe); "Change" wraps (minor) |
| Unlock | — | — | unavailable | — | pending | — | 7 at 360 | covered (probe) |
| Offer | — | — | enable-failed | offline | enabling | — | 6 at 360 | covered (probe) |
| Home | — | no-cases | request-failed, setup-failed, add-failed | offline | requesting, adding, stop-pending | — | 20 at 360 | covered (probe) |
| Case | a-loading | a-no-medicines | a-load-failed, a-release-failed, a-confirm-failed | a-offline | a-confirm-busy, a-releasing | a-long-content, s-10-medicines | 43 at 360 | covered (probe) |
| Calling | t05 (result wait) | — | t03, t04, s7d, g2 | — | t13, g2, t17 | — | 31 at 360 | covered (probe on t12 / t08c; others by render) |

Large text method: every visible text element at computed font size × 1.3 (inline `!important`). Checked: horizontal scroll, text clipped in its own box, elements past the right edge. Results on sign-in, OTP, unlock, offer, Home, case a-top, d-default, s-medicine-disabled, e-prescription-confirmed, calling t12, t08c at 390:
- No horizontal scroll, no clipping or right-edge overflow detected by probe.
- Visual check (OTP, d-default): the OTP "Sent to … · Change" line wraps "Change" onto its own line. Minor; no clipping.
- Limit: the probe checks clipping only where the element clips. Fixed-height boxes that overflow visibly are not caught. The screenshots are in `round-1/large-text/`.

Pictures: `docs/renders/2026-10-27-final-audit/round-1/large-text/`.

---

## 3. Decisions D-56 → D-68

Pass = shown in a render or checked by DOM. Logic = not visible in a render. FAIL = fails in a render.

| Decision | Point | Screens | Result |
|---|---|---|---|
| D-56 | 1 rebuild | — | logic |
| D-56 | 2 confirm blocked while Pending | t08c-confirm-blocked | PASS |
| D-56 | 3 phone off → Patient unavailable, no reason line | t09-patient-unavailable | PASS |
| D-56 | 4 no queue message | t09 (no line) | PASS (absence) |
| D-56 | 5 calling: no End call; doctor didn't answer | all calling; t04 | PASS |
| D-56 | 6 demo switch | prototype only | not visible (not promoted) |
| D-56 | 7 no Qty on Prescribe; Qty read-only on case rows | d-default, a-top | PASS |
| D-57 | transfer vs forward; failed transfer → forward | t12, t08b, t10b, t15 | PASS |
| D-58 | pt 1 no End call | calling | PASS |
| D-58 | pt 2 attempted call | — | logic |
| D-58 | pt 3 gate setting, no "50" in copy | t06 copy; `case.callEndedEarly` has "50" (G9) | **FAIL (copy key)** — key unused by new set |
| D-58 | pt 4 transfer counts from patient answer; other cases unlock after result | t12 vs t08a | PASS |
| D-58 | pt 5 leg 2 failed → Patient unavailable | t09 | PASS |
| D-58 | pt 6 invalid call → Call again · Callback · Unavailable | s7d (3 actions); t06 (no Unavailable, pt 23) | PASS |
| D-58 | pt 7 result not received → Confirm not shown | s7d shows Confirm | superseded by pt 20 (PASS per 20) |
| D-58 | pt 8 transfer edge cases | t16 family, t15, t17 | PASS for t16 and t17. **t15 card copy differs from pt 17** (N1) |
| D-58 | pt 9 Callback only on transfer calls | — | superseded by pt 18 |
| D-58 | pt 10 three actions pattern | t06, s7d | PASS |
| D-58 | pt 11 Release undecided | a-leave-sheet | superseded by pt 20 (PASS) |
| D-58 | pt 12 order categories | t08a, t08b, t12 | PASS (logic for HA-only) |
| D-58 | pt 13 misuse → ops | — | logic |
| D-58 | pt 14 simplified flow, no connecting/on-call states | t02, t11, t12 | PASS |
| D-58 | pt 15 final button for Pilot | t08a, t08b, t12, t10a, t10b | PASS |
| D-58 | pt 16 Order details first; one slot under it | all calling; a-top | PASS |
| D-58 | pt 17 outcome card **amber** "The HA couldn't join." | t15 shows "Health Advisor unavailable right now…" | **CONFLICT** — pt 21 changed card copy; call.haNoJoin unused. N1 |
| D-58 | pt 18 Callback in all cases; script from tap on Call | t02, t11 | PASS |
| D-58 | pt 19 polling | — | logic |
| D-58 | pt 20 no call result; Release decided | s7b, s7c, s7d, s7e, s7f | PASS (7f copy: FAIL, G2) |
| D-58 | pt 21 end-of-call scripts (copy) | t02, t11, t08b, t15 | PASS |
| D-58 | pt 22 talk time adds up; no number shown | t06 | PASS |
| D-58 | pt 23 (1) state 6 no Unavailable (2) HA spelled out (3) state 16 names who ended (4) 15/B3 end-call line | t06; mobile renders; t16/b/c; t15, g3b | PASS |
| D-58 | pt 24 (1) Callback every live call until confirm (2) no script on 8a/8b (3) Skip HA after missed transfer (4) 15/B3 unchanged | t08a/b, t16/b/c, t15/g3b | PASS |
| D-58 | pt 25 t17 keeps script; no Callback on 7b, 13, B2 | t17, s7b, t13, g2 | PASS |
| D-59 | notes (editable until confirm, locked after) | a-notes-typing, e-* | PASS (visible); lock logic |
| D-59 | Skip HA on both Pilot types, no other conditions | t08b, t12, t16b/c | PASS |
| D-59 | Skip HA reason sheet (Patient declined, Clinically not required, Repeat patient) | c-skip-ha not rendered | **GAP G1** |
| D-59 | disable removes medicine; no last-medicine warning | d-disable-sheet | PASS (sheet); removal logic |
| D-61 | logo on sign-in, OTP, unlock, offer, Home; not on case/sheets | all entry | PASS |
| D-61 | OTP no header Back; keyboard open keeps boxes, error, Verify | otp-kbd shots (entry pass round 1) | PASS |
| D-61 | unlock order: primary · Use OTP quiet · Not you | returning-unlock | PASS |
| D-61 | offer hero tile; missing states | faster-signin-offer | PASS (cancel and no-lock: behaviour only) |
| D-62 | outcome tints, 1px edge, no drop shadow (success/neutral/warning) | e-*, t10a, t10b, t14, t09, t15, g3b, s7f | PASS (DOM probe) |
| D-62 | 7b question plain text | s7b | PASS |
| D-62 | action bar: white, hairline, upward shadow | all bars | PASS (probe) |
| D-63 | 15b "End the call to get your next case." on 15 and B3; Request enabled | t15b; g3b (no line, per D-64 pt 2 covered by 15b) | PASS |
| D-64 | no Callback on 15, 15b, B3 | t15, t15b, g3b | PASS |
| D-64 | confirm blocked → 8c; "Prescribe or disable {n} medicines first." | t08c | PASS |
| D-64 | faster sign-in screen-lock variant | offer screen-lock | PASS |
| D-64 | no screen lock → skip offer | — | behaviour only |
| D-65 | 16 messages shortened | sign-in too-many, OTP, home, case | PASS |
| D-65 | no message repeats an on-screen button | case.offline, case.confirmFailed (kept by D-66 C); home no-cases "Try again" wording not checked against button | N2 |
| D-66 A | outcome card under Order details | e-* (round 2) | PASS |
| D-66 B | icon rule = labelled buttons; header/close/status icons out; "Add time" keeps plus | home, case, calling | PASS |
| D-66 C | copy offline "Check your connection", too many | offer offline; sign-in too-many | PASS |
| D-66 D | availability-ended = success | e-availability-ended | PASS |
| D-66 E | entry screens keep panel footer | entry | PASS |
| D-66 F | call.transferReady retired | not rendered | PASS |
| D-66 G | Back controls unchanged | a-top, d-default (close ×) | PASS |
| D-66 | unlock unavailable: Use OTP primary | returning-unlock/unavailable | PASS |
| D-67 | 16 page margin everywhere | margin round 1 | PASS (sheets guard expected) |
| D-67 | action bar 16 all sides | bars | PASS |
| D-68 pt 1 | button stays "Confirm prescription" | t08a, t12, g1 | PASS |
| D-68 pt 2 | 7f title "Waiting for the call record" + text | s7f shows "Prescription submitted" | **FAIL** — G2 |
| D-68 pt 3 | s-medicine-disabled (struck name, grey row, arrow kept) | s-medicine-disabled (late) | rendered; **contrast FAIL** — G10 |

---

## 4. Copy

Keys in `ui-screens/feedback/messages.json`: 80. Method: a key counts as used when the key name or its text appears in a source file that feeds the new renders (entry-pass and calling working copies, approved case and sign-in/OTP/unlock/offer/home sources, app.js).

Unused keys (5):

| Key | Text | Note |
|---|---|---|
| `case.offlineAction` | "No connection. Nothing was lost." | not referenced; check whether a state needs it (feedback-state-map) — N3 |
| `call.callingYou` | "Calling your phone…" | retired by D-58 pt 14 (connecting states removed) — remove key, or confirm (N3) |
| `call.connecting` | "Connecting to {name}…" | retired by D-58 pt 14 — same |
| `call.haNoJoin` | "The Health Advisor couldn't join. Read the script, then end the call." | the amber card copy in D-58 pt 17; t15 uses `call.transferFailed` instead — **conflict N1** |
| `call.stayOnLine` | "Tell the patient: …" | no state in app-logic names it — N3 ("not covered by any decision") |

Copy rules:
- "Health Advisor" spelled out in every mobile render. "HA" appears only on the **Skip HA** button. Desktop demo panel text ("HA call…") is outside the mobile set and not audited as copy.
- Hard-coded copy in recipes that differs from `messages.json`:
  - `s7f-submitted`: title "Prescription submitted" hard-coded; D-68 title is "Waiting for the call record" (G2).
  - Inline button labels in recipes (e.g. "Confirm prescription", "Callback", "Request next case"): rebuild item (backlog §3), not a fail.
- `case.callEndedEarly` = "Call ended before 50 seconds." — contains "50". Used only by approved `b-ended-early` (retired). G9.
- Repeated-button check (feedback-rules §4): D-66 C keeps `case.offline` and `case.confirmFailed` by decision. `home.noCases` ("Try again in a minute.") — not checked against the Home button labels in this audit (N2).

---

## 5. Visual rules

| Rule | Result | Evidence |
|---|---|---|
| 16 page margin (D-67) | PASS | margin round 1 DOM probe (left edges 16, sheets 16) |
| Action bar 16 all sides + edge (D-62/67) | PASS | bar padding 16/16/16/16 on all bar states; hairline + upward shadow |
| Status card tones and edge, no shadow (D-62/66) | PASS | DOM probe: success/neutral/warning tones; no box-shadow besides inset edge |
| Icon rule §9.1 (scope per D-66 B) | PASS | icons only on labelled call/callback/view/skip/direction and phone-off on Unavailable; header/close/status out of scope per D-66 |
| **Contrast AA** — struck-through Disabled medicine name | **FAIL** | effective colour rgb(173,176,183) on white (grey text at 50% opacity from the row), about **2.2 : 1**; needs 4.5 : 1 (G10). D-68 pt 3 says darken if it fails |
| Contrast — "Disabled" tag on tint | PASS | 5.4 : 1 |
| Contrast — other text on tints and notices | PASS by probe | probe run on 7 families × 4–7 states; no other failure. Probe ignores ancestor opacity, so it cannot see a faded row — the disabled name was checked by hand |
| 48px tap targets — icon buttons, ×, Back, chips, rows | PASS | probe over 7 families: every button, chip, option, row ≥ 48 except as listed below |
| 48px — "Terms & Conditions", "Privacy Policy" (sign-in consent, OTP) | 31px tall, **inline in prose** | not standing alone — likely exempt (N5) |
| 48px — "call Doctor Ops" (OTP locked notice) | 18px tall, **inline in prose** | same question (N5) |
| 48px — SOS toggle | PASS | label 48px tall (input itself 20px; label is the target) |

Probe method limits: contrast probe ignores ancestor opacity (the disabled row was missed by the probe and found by hand).

---

## 6. Old vs new — promotion map

Every approved state in `ui-screens/` today → KEEP / REPLACE (by which new render) / RETIRE (decision). Folder on promotion: `case/` for the case page, calling, sheets, closed cases and stress; `prescribe/` for all `d-*` (proposed by Apurva 2026-10-27; source stays `case/case.html`).

### 6a. Approved screens

| Approved folder | Approved states | Action | New render (folder on promotion) | Gap |
|---|---|---|---|---|
| sign-in | 12 | REPLACE (too-many copy changed; margin) | sign-in/ same ids | — |
| otp | 17 | REPLACE (no Back; logo; margin) | otp/ same ids | — |
| returning-unlock | 7 | REPLACE (unavailable primary; margin) | returning-unlock/ same ids | — |
| faster-signin-offer | 3 (fingerprint, face-id, enabling) | REPLACE | faster-signin-offer/ same ids | — |
| faster-signin-offer (new) | screen-lock, enable-failed, offline | NEW (D-64, D-61) | faster-signin-offer/ | — |
| home | 19 | REPLACE (margin; header icons edge) | home/ same ids | — |
| case a-* | 16 | REPLACE (margin, copy) | case/ same ids | — |
| case b-* | 9 | RETIRE → calling set (D-58 pt 14): b-calling → t02 ; b-ended-early → t06 ; b-patient-unavailable → t09 ; b-post-gate-cat4 → t08a ; b-post-gate-forward → t08b ; b-post-gate-transfer → t12 ; b-didnt-connect, b-missed-call → retired (D-58 "Retired"), b-on-call → retired (D-58 pt 14) | case/ calling set (31) | — |
| case c-* | 4 (c-callback, c-callback-error, c-callback-failed, c-skip-ha) | REPLACE — **no new picture** | case/ (sheets) | **G1** |
| case d-* | 19 | REPLACE (margin) | prescribe/ same ids | Alt days, Monthly, Inhaler not rendered (G3–G5) |
| case e-prescription-confirmed | 1 | RETIRE → 10a (t10a-confirmed) | case/ calling set | — |
| case e-transferred | 1 | RETIRE → 14 (t14-transferred) | case/ calling set | — |
| case e-forwarded | 1 | RETIRE → 10b (t10b-forwarded) | case/ calling set | — |
| case e-patient-unavailable | 1 | RETIRE → 9 (t09-patient-unavailable) | case/ calling set | — |
| case e-callback-scheduled | 1 | KEEP (REPLACE picture, margin) | case/ | — |
| case e-availability-ended | 1 | KEEP (REPLACE picture; success tone D-66 D) | case/ | — |
| case s-10-medicines, s-optional-empty | 2 | KEEP (REPLACE picture) | case/ | — |

### 6b. New renders (no approved picture)

| New render | Folder on promotion | Decision |
|---|---|---|
| calling set: t01-ready … t17-skip-ha-wait, s7a–s7f, g1, g2, g3b, t08c, t15b (31) | case/ | D-58, D-63, D-64 |
| s-medicine-disabled (late) | case/ (stress) | D-68 pt 3 |
| offer screen-lock, enable-failed, offline | faster-signin-offer/ | D-61, D-64, D-65 |

Count check (approved, excluding b- and e- retired): 12 + 17 + 7 + 3 + 19 + 16 + 4 + 19 + 2 + 2 (e-callback-scheduled, e-availability-ended) = 101 approved pictures kept or replaced. Retired: 9 b-* + 4 e-* = 13. c-* (4) have no replacement yet.

---

## GAPS

| # | What | Where | Rule / state | One-line fix |
|---|---|---|---|---|
| G1 | Callback sheet (3 states) and Skip HA reason sheet not in new set | approved c-callback, c-callback-error, c-callback-failed, c-skip-ha (recipes exist in `entry-ds-pass/src/case.html`) | app-logic §7, §6; D-59 pt 2 | render the 4 recipes at 360/390 into case/ |
| G2 | 7f picture shows old copy; recipe hard-codes title "Prescription submitted" | calling `s7f-submitted` (recipe in `2026-10-22-calling/src/case.html`) | D-68 pt 2; messages `call.submittedTitle` | change recipe to `MSG('call.submittedTitle')` and re-render (not done: audit only) |
| G3 | Prescribe schedule "Alt days" not rendered | app-logic §8 "How often" | §8 | add a d- recipe (alt days) and render |
| G4 | Prescribe schedule "Monthly" not rendered | app-logic §8 | §8 | add recipe and render |
| G5 | Prescribe form "Inhaler" not rendered | app-logic §8 dose table | §8 | add recipe and render |
| G6 | Profile sheet (Wallet "Coming soon", faster sign-in toggle, Logout) not rendered | app-logic §3 | §3 | NEEDS-APURVA N4 (approved README says not in these screens) |
| G7 | Help not rendered | app-logic §3, §4 ("Help stays available at every stage") | §3, §4 | NEEDS-APURVA N4 |
| G8 | `call.ha-no-join` state (shown before 15) not rendered | app-logic §6 | §6 | NEEDS-APURVA N1 (may be superseded by pt 21) |
| G9 | `case.callEndedEarly` = "Call ended before 50 seconds." (contains "50"); key used only by retired b-ended-early | `ui-screens/feedback/messages.json` | D-58 pt 3 | remove the key with b-ended-early, or rewrite without "50" (Apurva to decide; not edited) |
| G10 | Disabled medicine name contrast ~2.2:1 (50% opacity) | s-medicine-disabled, Prescribe rows | RULES item 7; D-68 pt 3 | darken the disabled name and/or keep row opacity so the name reaches 4.5:1 |

## NEEDS-APURVA

- **N1. Amber transfer-failed card copy (D-58 pt 17 vs pt 21 and t15).** Pt 17 says the amber outcome card reads "The HA couldn't join." Pt 21 and the render use "Forwarded to HA · Health Advisor unavailable right now. Read the script, then end the call." `call.haNoJoin` is unused. Which card text is approved? Pt 8's "Prescription confirmed. The HA will call the patient later." is superseded by pt 21 (not rendered).
- **N2. Repeated-button check on home no-cases.** "No cases right now. Try again in a minute." sits on a Home screen whose button is "Request a case". Does "Try again" repeat it under D-65 / feedback-rules §4? Not checked in the render this audit.
- **N3. Unused copy keys.** `case.offlineAction` (no state uses it — keep or remove?); `call.callingYou`, `call.connecting` (retired by D-58 pt 14 — remove?); `call.stayOnLine` (no state in app-logic — "not covered by any decision"; keep or remove?).
- **N4. Profile sheet and Help.** Not in the picture set (G6, G7). App-logic §3 names Profile (Wallet "Coming soon", faster sign-in, Logout) and Help. Promote without them, or render them first?
- **N5. Inline text links below 48px** (Terms & Conditions, Privacy Policy, call Doctor Ops). Inline in prose, not standing alone. Exempt, or make the tap area 48px?
- **N6. Cancelled faster-sign-in prompt and no-screen-lock skip** have no picture (behaviour only, D-45/D-64). Confirm that is acceptable for promotion.
- **N7. Calling set count.** The brief says 32 incl. 8c; the folder holds 31 ids. No 32nd id found. Confirm the set is complete.
- **N8. Disabled-name contrast fix (G10).** Darken the name (design choice) or keep the faded look and accept a lower ratio? D-68 says darken if it fails. Recommend darkening.

## Not covered by any decision (listed per the brief, not invented)

- `call.haNoJoin` vs pt 17 copy (N1).
- Notifications bell on Home: app-logic §3 mentions it, no state or copy defines it (N4).

## Codex (second reader, items 1, 2 and 6)

Codex read the state table, app-logic and the picture filenames (not the picture contents). One batch, read-only, cap 2 not needed. Its findings and my disposition:

1. **GAP — uncertain confirmation result** (app-logic §6, "an unclear result is checked before retrying"). No picture. `a-confirm-failed` covers a confirmed failure only. **Accepted → G11.**
2. **GAP — action attempted offline** (app-logic §10, "an action tried offline fails with one error notice, nothing lost"). `a-offline` shows the passive offline warning; no picture shows the attempted-action error. **Accepted → G12.**
3. **ORPHAN — offer enable-failed and offline** (app-logic §2 says failure goes to Home without error). **Rejected as a picture problem.** D-61 point 4 and D-65 (4) changed this: failure stays on the offer with a notice; offline is a notice. The pictures follow the decision. app-logic §2 is out of date → **N9**.
4. **ORPHAN — offer screen-lock and no-screen-lock skip** (app-logic §2 has no screen-lock rule). **Rejected as a picture problem.** D-64 point 4 authorises both. app-logic §2 is out of date → **N9**.
5. **UNACCOUNTED — c-callback, c-callback-error, c-callback-failed.** Disposition now explicit: **REPLACE** (approved sheets are the callback sheet required by app-logic §7; margin-16 pictures are not rendered yet → **G1**).
6. **UNACCOUNTED — c-skip-ha.** Disposition now explicit: **REPLACE** (Skip HA reason sheet, app-logic §6 and D-59 pt 2; not rendered yet → **G1**). `t17-skip-ha-wait` covers the aftermath only.

Codex's accounting of the rest matches mine: a-, d-, e-, s- and the entry/home pictures are REPLACE by identical name; b-calling → t02, b-ended-early → t06, b-patient-unavailable → t09, b-post-gate-cat4 → t08a, b-post-gate-forward → t08b, b-post-gate-transfer → t12 (REPLACE); b-didnt-connect and b-missed-call RETIRE (D-58); b-on-call RETIRE (D-58 pt 14). No KEEP is designated for any approved state. Codex found no wrong duplicate claims. It could not check within-screen branches (Rx transform, duration choices, form variants) from filenames.

New gaps and decisions from the Codex pass:
- **G11.** Uncertain confirmation result: no picture. Recipe: confirm sent, backend check pending, "Unclear result is checked before retrying" (app-logic §6). Render one state into case/.
- **G12.** Attempted action offline: no picture of the one error notice that replaces the passive warning (app-logic §10). Render into case/.
- **N9.** app-logic §2 (and §6 analytics) still describe the pre-D-61/D-64/D-65 faster sign-in behaviour (failure → Home with no error; no screen-lock variant). Decision: update app-logic §2 to D-61/D-64/D-65 before promotion. I have not edited app-logic.
