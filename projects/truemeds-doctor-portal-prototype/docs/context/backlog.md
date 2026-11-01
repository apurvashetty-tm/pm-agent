# Backlog — agreed, not yet applied

What this file is: changes Apurva has agreed but that are not on the screens or in the build yet. Decisions live in `decision_log.md`, undecided points in `open_questions.md`. An item leaves this list when it is applied and checked; tick it and add the date.

Order = the order we work in.

## 1. Calling screens — close the work
- [ ] **D-62 / D-63 on the calling screens** — C5 cards, T3 action bar, grey neutral card, 7b question as plain text; new state 15b "End the call to get your next case." (also on B3). Render the changed states myself (7b, 7f, 9, 10a, 10b, 14, 15, 15b, B3), self-audit, Apurva reviews.
- [x] **B3 colour: amber, like 15** — decided 2026-10-26 (D-62 point 7).
- [x] Round 7 done (2026-10-26): 60 renders, audit, Codex; N1–N3 answered (D-64).
- [ ] **8c Confirm blocked** (D-64) — copy key + recipe added; render, then add to the storyboard.
- [ ] **Terminal round — full calling storyboard** at 390 and 360 with the audit. Brief: `docs/renders/2026-10-22-calling/TERMINAL-BRIEF.md` (update for D-62/D-63 first).
- [ ] **Apurva's final approval** → promote the calling screens into `ui-screens/case/`, update the `ui-screens` README, publish.

## 2. Approved screens — full pass (rules first)
- [ ] **Checklist first**, agreed with Apurva: standards checklist + D-61 + D-62.
- [ ] **D-61 items:**
  - [ ] Logo on every screen except the case page and task overlays (sign-in, OTP all states, returning unlock, faster sign-in offer, Home).
  - [ ] OTP: no header Back; check OTP with the keyboard open at 360 (code boxes, error line, Verify visible) — if not, back to Apurva.
  - [ ] Returning unlock: "Use OTP instead" as a quiet button; order Unlock (primary) · Use OTP instead · Not you? Switch account.
  - [ ] Faster sign-in offer: **screen-lock variant** (D-64: no fingerprint/face → screen lock; no screen lock → skip the offer).
  - [ ] Faster sign-in offer: missing states — enabling failed, prompt cancelled, no fingerprint/face set up (agree the treatment), offline; hero icon placed as on returning unlock.
- [ ] **D-65 copy** on every approved screen that shows a shortened message (sign-in, OTP, Home, case) and the calling states 3, 4, 6, 12 — re-render.
- [ ] **D-62 on approved closed screens (`e-*`)**: tinted status cards (C5), T3 action bar on every screen with a bottom bar.
- [x] Round 1 done (2026-10-26); answers in D-66.
- [ ] **Round 2 fix** (D-66): unlock-unavailable primary, two copy lines, outcome card under Order details, availability-ended green, re-render affected screens.
- [ ] Findings to Apurva before any render → **terminal round** re-renders only the affected screens.

## 2b. Page margin 16 (D-67) — before promotion
- [x] Design system: `--tm-space-page` (16), action bar 16 all sides, sheets 16 (2026-10-26).
- [ ] Terminal round: margin 16 on every working copy, re-render all families + calling storyboard (`docs/renders/2026-10-26-margin-16/TERMINAL-BRIEF.md`).
- [ ] Main-thread check, then Apurva's final approval of calling + entry + Home + case.

## 2b2. Final audit (agreed 2026-10-27)
- [ ] Terminal audit (6 points) — `docs/renders/2026-10-27-final-audit/TERMINAL-BRIEF.md`; gaps to Apurva; fix; then promotion.
- [ ] Folders on promotion: `case/` (case page, calling, sheets, closed, stress) and **`prescribe/`** (all `d-*`), Apurva 2026-10-27.

## 2c. Promotion (after approval)
- [ ] Move calling + entry + Home + case working copies into `ui-screens/`; replace old calling (`b-*`, `c-*`) and duplicate closed states (`e-prescription-confirmed`, `e-transferred`, `e-forwarded`, `e-patient-unavailable` → calling 10a, 14, 10b, 9).
- [ ] Remove `case.callEndedEarly` and the retired recipes (`b-*`, old `c-*`, duplicate `e-*`) at the same time (D-69).
- [ ] Update `ui-screens/README.md`; update the guards for D-61/62/65/66/67 and re-run them on the promoted files.
- [ ] Freeze: mark approved in the decision log; new PR for Apurva to merge.

## 2c-done. Screens frozen 2026-10-31 (D-78)
- [x] Promotion, close-out, status line (D-74), audit fixes (D-75–D-77), guards over all 144 states, PR #16.
- [ ] **Logic review before the build:** Apurva's misses from the walkthrough page → fix `app-logic.md` → regenerate `calling-flow.png`.
  - Applied, not committed (2026-10-31): three internal contradictions fixed — §4 stage table (Calling / Transfer ready / Call not valid / Valid rows), §5 Dependency, §6 failed transfer → state 15, §7 Unavailable reason sheet.
  - Applied, not committed (2026-10-31): §11 test numbers and OTP codes (agreed).
- [x] Recorded as D-79 (P3, P8, test numbers, new order of work, three documents).

## 2e. New order of work (D-79, 2026-10-31) — replaces 2d's order
1. [ ] Five-lens audit of the frozen screens (separate agent) → Apurva sorts findings.
2. [ ] Storyboard review with Apurva, journey by journey: entry → Home → case + Prescribe → calling (incl. her walkthrough misses; then regenerate `calling-flow.png`).
3. [ ] Per closed journey: PRD section → prototype engineering spec + test cases (agents). Spec's shared foundation may start early. Build plan → spec; rebuild checklist → test cases.
4. [ ] Prototype rebuild from the spec, checked against the test cases (P3/P8 per D-79).
5. [ ] Token inspector.

## 2f. Screen audit — Part A answers (Apurva, 2026-11-01) — recorded as D-80; apply in the journey passes
- [ ] **C-01:** Back whenever the screen offers a call button (Call patient / Call again: states 1, 3, 4); gone while a call is in progress and never back once the patient was reached; hidden from the tap on Call patient for every case type. Back stays on Ready (doctor took a case and has to leave = Release); not removed. **Backend guard:** Release refused once our call request is accepted by the telecom partner, unless the result is 3 or 4 (→ OQ-024). Fixes C-02. Re-capture t02, s7a, s7b, s7e, a-releasing, a-release-failed. Changes D-58 pt 20.
- [ ] Back is not Hold: Release = "not me" (back to queue); Patient unavailable = today's 216 on hold; Callback = later. All three kept, one job each.
- [ ] **Ops:** track release rate per doctor (with Engineering and Ops, alongside §4).
- [ ] **P-01:** SOS limit prints the daily total in the medicine's unit — "2 puffs as needed (max 8 puffs/day)"; cream "Apply as needed (max 3 times/day)". app-logic §8 printed line + D-16; re-capture d-inhaler, d-sos-only, d-sos-on.
- [ ] **C-06:** empty case → no Call patient; "There's nothing to prescribe on this order. Release it — Ops will check it." + Release case; released empty cases go to Ops (OQ-035). Re-capture a-no-medicines.
- [ ] **PRD must include** the full medicine-type table: form · dose unit · dose options · printed-line examples (regular, SOS only, + SOS with daily total). Settle P-02 (capsules no ½) and P-03 (injection units) in the Prescribe review first.

## 2d. After promotion — order agreed 2026-10-29 (Apurva) — superseded by 2e
1. [ ] **Prototype rebuild** from the frozen `ui-screens/` (D-56, D-72): build plan + rebuild checklist first; covers all order types and states; the phone demo alone is Cat4 happy path; new Netlify link alongside the current one; then journey by journey, checked against the pictures. Installable from the Netlify link (opens full screen from the home screen, no review controls); demo mode with one order type and the happy path.
2. [ ] **Token inspector** page generated from the screens (which tokens each element uses) for engineering. Figma snapshot only if the design team asks.
3. [ ] **PRD** page by page, engineering hand-off pack, then the rest of this backlog.

## 3. Rebuild items (for the build, not the renders)
- [ ] All button labels through `MSG()` (some are typed inline in the render recipes).
- [ ] After-confirm and closed states: View Rx, medicine rows and notes read-only and muted; no overlay (D-62).
- [ ] Request next case on 15 / B3 checks the call has ended (D-63).

## 4. With Engineering and Ops
- [ ] OQ-030 — polling interval, maximum call length, result wait, who ended the call.
- [ ] OQ-031 — mobile data during a normal call.
- [ ] OQ-032 — Health Advisor reservation and allocation.
- [ ] OQ-033 — ops review queue for submitted cases whose record never arrives.
- [ ] Separate discussion: a late record that shows talk time under 50 s.

## 4b. Next design round (logged, not in this release)
- [ ] Profile redesign (today: a page with the ported content + faster sign-in toggle, D-69/D-70); User manual link.
- [ ] Help: what the "?" opens on Home and the case page.
- [ ] Notifications: what the bell opens on Home (D-75).
- [ ] App navigation for future features — bottom tab bar once a second destination is approved (D-69 point 7).

## 4c. Hosting (found in the build-plan review, 2026-10-29)
- [ ] **Current site publishes the whole project folder** — `docs/` (decision log, open questions, handoffs) is reachable on the live doctor-portal link. Apurva to decide: accept, or publish a clean folder. The new preview site publishes only `app/`.

## 5. After the final render
- [ ] Page-by-page PRD (job to be done, use cases, screenshots, decision logic).

## 2g. Screen audit — Part B answers (Apurva, 2026-11-01) — recorded as D-81; applied in one fix round before the storyboard review
- [ ] **Group 1 — copy:** B1 OTP wrong code → "Wrong code." / "Wrong code. {n} tries left." / "Wrong code. 1 try left." (replaces D-44/D-53 copy; no next-step wording, per D-53 pt 2); "Prescribe or disable 1 medicine first." singular. B2 all apostrophes curly + copy-guard check. B3 one wording for 15 and B3 (`call.transferFailed`; retire `call.noHaFree`). Re-capture otp_wrong-code, otp_two-tries-left, g3b.
- [ ] **Group 2 — entry:** E-01 keep the terms line during Verifying / Checking (button never moves; amends D-44 "consent only when Verify is possible" for these two states). E-02 sign-in on a locked number → OTP in the locked state (`otp_locked`, Change + Doctor Ops); add the row to app-logic §2 + state map. E-09 cooldown line shows "Checking…" alone (no "Didn't receive it?"); boxes stay focused (typing a received code is fine). E-11 one shared header spacing for OTP, offer and unlock so the tile sits in the same place (D-61 pt 4). Re-capture otp_verifying, otp_cooldown-reconciling, offer_*, unlock_*.
- [ ] **Group 3 — Home:** H-01 disable Cancel, ×, chips and wheel while Adding… / Setting…. H-03 re-capture home_added with matching values (5:00 + 30 min = 35:00). H-06 "Stay signed in" becomes quiet text (RULES §9.4, like "Keep available"). H-08 Set availability pinned to the bottom in every state (D-43). H-09 Profile mock earnings match prescriptions today. H-11 End availability greyed out offline (offline notice explains). Re-capture home_adding, home_setting, home_added, home_logout-confirm, home_setup-*, home_idle-expired, home_manually-ended, home_profile*, home_offline.
- [ ] **Group 4 — Prescribe:** P-02 dose by form: tablets ½·1·2, capsules 1·2 (feeds the PRD medicine table). P-04 Prescribe with an error scrolls to the first error; error text stays under its field; no line in the bar (one shared "scroll to first error" helper with 8c). P-05 0-0-0 error becomes field text under the M/A/N grid (no tinted box). P-06 add state `d-disabled` + copy "Disabled: {reason}. Prescribing it will enable it again." (D-20). P-08 duration picker: number and unit chips share one inner edge. P-10 re-capture d-food-selected (Food chips visible) and d-notes-keyboard (keyboard drawn). P-13 "Additional instructions (optional)" + helper "Printed on the prescription.". Re-capture d-weekly, d-error-dose, d-duration-picker, d-food-selected, d-notes-keyboard, d-scrolled, new d-disabled.
- [ ] **Keyboard rule (new, Apurva 2026-11-01):** on Prescribe (Other dose, Additional instructions) and the case page (Chief complaints, Doctor notes) the focused field scrolls into view above the keyboard with its label and helper; the pinned action bar hides while the keyboard is open and returns when it closes (same reason as D-43). Add to app-logic §8/§9 + RULES; d-notes-keyboard re-captured showing it (P-10).
- [ ] **Group 5 — case and calling:** C-02 solved by D-80. C-03 during Confirming… / Transferring… rows and notes read-only and muted, no arrows. C-09 View Rx stays the outlined button during Confirming… (D-76). C-10 "End the call to get your next case." becomes an amber warning (RULES §9.5). C-13 one icon size for secondary bar buttons, set centrally. C-18 loading skeleton shaped like the loaded page (Order details row, Medicines, Notes). Re-capture a-confirm-busy, t13-connecting-ha, t15b-end-call-first, a-loading + bars with secondary icons.
