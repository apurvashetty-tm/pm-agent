# Backlog — agreed, not yet applied

What this file is: changes Apurva has agreed but that are not on the screens or in the build yet. Decisions live in `decision_log.md`, undecided points in `open_questions.md`. An item leaves this list when it is applied and checked; tick it and add the date.

Order = the order we work in.

> **Status 2026-11-03:** §1 – §2j are done (screens frozen D-78 / D-82; calling D-83; copy D-84; 17 D-85; D-86; D-87) — unticked lines there are history. **Next: §2l prototype build.**

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
2. [x] (closed, D-88) Storyboard review with Apurva, journey by journey: entry → Home → case + Prescribe → calling (incl. her walkthrough misses; then regenerate `calling-flow.png`).
3. [ ] Per closed journey: PRD section → prototype engineering spec + test cases (agents). Spec's shared foundation may start early. Build plan → spec; rebuild checklist → test cases.
4. [ ] Prototype rebuild — **D-88:** from build plan v3 + rebuild checklist v3 (`docs/proposals/2026-11-05-prototype-build-plan-v3.md`, `docs/reviews/2026-11-05-rebuild-checklist-v3.md`); PRD / spec / test cases are not a gate.
5. [ ] Token inspector → widened to the **native hand-off kit (D-95)**. Pilot on Sign-in: `docs/renders/2026-11-09-handoff-kit/TERMINAL-BRIEF.md` (runs after step-1 recovery session 6). Then FE walkthrough with one engineer; then add each journey as the rebuild finishes it.
6. [ ] After the kit pilot is approved: mark `ui-screens/native/` (October TSX) and `ui-screens/home/NATIVE-HANDOFF.md` / `home.native.ts` "don't use — see `handoff/`" (D-95 pt 2).

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
- [x] OQ-033 — answered by D-83 (CW-D4): no record after a wait time → not confirmed, back through hold and retry; no Ops queue.
- [ ] Separate discussion: a late record that shows talk time under 50 s.

## 4b. Next design round (logged, not in this release)
- [ ] Profile redesign (today: a page with the ported content + faster sign-in toggle, D-69/D-70); User manual link.
- [ ] Help: what the "?" opens on Home and the case page.
- [ ] Notifications: what the bell opens on Home (D-75).
- [ ] App navigation for future features — bottom tab bar once a second destination is approved (D-69 point 7).
- [ ] Faster sign-in on Android: a "Set up on this phone" action that opens the phone's fingerprint set-up when the phone has none (native app only; iOS can't open that page). From D-93.

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
- [ ] **2026-11-02 (Apurva):** button icon size steps with button size: 56px buttons → 20px, 48px compact → 16px, on the 16/20/24 icon scale (design system `components.css`, RULES §9.1, beyond-salt) — replaces D-81 F27's pair-only rule; Profile earnings ₹20 per confirmed prescription (app-logic §11). Pictures re-rendered in fix-round Round 3; record with the freeze (D-78 update).

## 2h. Fix round — Round 4 (agreed Apurva, 2026-11-02) — record with the freeze (D-82)
Brief: `docs/renders/2026-11-01-fix-round/TERMINAL-BRIEF.md` "Round 4"; audit: `CONSISTENCY-AUDIT.md`; option renders: `docs/renders/2026-11-02-home-action-bar/`.
- [ ] **Pinned action bar** (`.tm-actionbar`) on Home (every state with bottom buttons), faster sign-in offer and returning unlock — one pinned-bar component app-wide; content above scrolls on short phones (timer and wheel were clipped at 360×640).
- [ ] **Notice placement rule:** action results sit inside the bar above their button; standing states sit at the top of the panel (unlock "isn't available").
- [ ] **Notice inside the bar = edge-to-edge band** on the bar's top edge (option 3; design system) — no longer looks like an extra button; tone colour kept. Rejected: toast outside the bar (persistent states, errors must not auto-dismiss, covers content); plain text without a box (warnings lose weight).
- [ ] **OTP terms line centred**, balanced wrap, "Terms & Conditions" kept together.
- [ ] **Consistency audit (52 findings):** all bugs + Claude's recommended answers to the 15 questions, incl. card gap 16 on case / Prescribe (was 12), one logo size and offset, busy states keep bar height (Transferring keeps a greyed secondary row), text keyboard for notes, notice 8 under inputs, group labels 16 semibold, callback / unavailable card icons = their buttons' icons. No change: A-18, B-23, B-25 + 5 recorded.
- [ ] **Small-phone check (360×640)** added for Home, Prescribe, key case states, offer, unlock — and to propose as a permanent guard.
- [ ] Earlier today (Round 3): button icons by button size (56 → 20, 48 → 16); Profile ₹20 per prescription (₹60).
- [ ] **Permanent small-phone guard (agreed 2026-11-02):** 360×640 pass in `docs/layout_check.py` for every state (clipped content with no scroll, bar covering the last content) — Round 4 item 10.
- [ ] **Design system out to its readers (agreed 2026-11-02), after Round 4 is verified:** (a) republish the Truemeds Design System artifact (`design-system/scripts/build_artifact.py`) with today's three changes — button icons by button size, the pinned action bar on every pinned main action, the notice band inside the bar (+ notice placement rule); (b) update the React Native hand-off notes (`ui-screens/*/NATIVE-HANDOFF.md`, `ui-screens/native/`, `design-system/native/` where components are described) so the app team builds the same rules.

## 2i. Calling walkthrough review (Apurva, 2026-11-02) — decisions in `docs/reviews/2026-11-02-calling-walkthrough/README.md`; apply in one pass after Round 4 is merged
- [ ] **Path A closed** (CW-A1–A6): Callback only after the call (removed from 2 / 7a, 11, 12, 17; backend refuses a callback without leg 2 answered); 7d unchanged; Release → Home; empty case = amber notice at the top, Release case without a sheet. Apply list at the end of path A in the review file.
- [ ] **Open product point:** where a released empty case goes (OQ-035) — "our Ops team will check it" is a placeholder.
- [ ] **Path B closed** (CW-B1–B3): 3 / 4 only for the doctor's side, anything patient-side → 9; Patient unavailable = hold, retried by the system by hangup cause (invalid number not retried; doctor-case retry values are settings) — Engineering.
- [ ] **Path C closed** (CW-C1–C3): no Callback on 5; 5 only where the partner sends a call-ended event (Ozonetel yes, Knowlarity no); after a valid call only the confirm button (+ Skip HA) — Callback only on 6 and 7d. Engineering: Knowlarity call-ended event?; partner for Pilot Non-Value Meds.
- [ ] **Next version (CW-C4):** Call again after a valid call (8a / 8b / 16) for a call that drops after the gate — decide with call-log data on drops shortly after the gate.
- [ ] **Path D closed** (CW-D1–D3): 7b skipped when the call is known ended (→ 7c); 7d bar by route (Pilot: Confirm & forward · Callback + Unavailable); record under the gate / no answer → not confirmed, back through hold and retry, no ₹20, nothing to Ops. Engineering: mismatch analytics table (doctor action vs call record).
- [ ] **CW-D4 (answers OQ-033):** no call record after a wait time (setting) → prescription not confirmed, back through hold and retry; nothing to Ops.
- [ ] **Next version:** doctor trust score + warnings built from the mismatch table.
- [ ] **Path E closed** (CW-E1–E3): 15 = transfer couldn't start (HA not picking up is 14); 17 shows "Calling…" until the hang-up, then waits for the result; 15 shows "Waiting for the call to end…" and its buttons only after the hang-up — 15b retired.
- [ ] **Path F closed** (CW-F1–F3): **B ships first, A later** (rebuild / PRD / tests build B first); a forward (15, B3) is confirmed only on the partner's result; B1 call ending after the gate → 16 (copy check for B).
- [ ] **All paths closed 2026-11-03.** Apply in one pass after the fix round is merged (summary at the end of the review file); then the final audit against a checklist built from CW-A1…F3.
- [ ] **Fix round Round 5 (Apurva, 2026-11-02):** notice band = top edge of the action bar (nothing of the bar above it; Round 4 left a white strip); B-07 back / ✕ icons and titles on one edge in case header, Prescribe, Rx viewer; OTP Verify at the same y in every state (reserved line under the boxes). Accepted from Round 4: logo 166, injection heading "Dose" (D-15), small-phone fade cue, offline in the bar, Home notice placement, 20px header icons, Skip HA wording D-70.

## 2j. Fix round closed — recorded as D-82 (2026-11-03)
- [x] Rounds 1–6 accepted; §2f, §2g, §2h and the Round 5 / 6 items are done (D-82).
- [x] Republish the Truemeds Design System artifact — done 2026-11-03 with D-82–D-85 (see below).
- [x] React Native: status note `ui-screens/native/NATIVE-STATUS.md` (2026-11-03); the full refresh comes from the built prototype.
- [x] Calling walkthrough decided (paths A–F) and recorded as **D-83**.
- [x] **Calling round** — D-83 applied (149 states, guards 0), 2026-11-03.
- [x] **Copy standard** — copy rules v2 approved (D-84), `docs/reviews/2026-11-03-copy-audit/COPY-RULES.md`.
- [x] **Copy round done (2026-11-03):** audit run 2 on v2, fixes applied and re-rendered (main round + MAIN-CHECK 1 + 2), copy checks in `check-sources.mjs`, D-85 (17) applied. Guards 0, 149 states. Record: `COPY-ANNEX.md` (goes to the PRD as the copy annex), report `docs/renders/2026-11-03-copy-round/REPORT.md`.
- [x] Then: DS artifact republish and React Native notes (2026-11-03).
- [ ] **Engineering (from D-83):** backend refuses a callback without leg 2 answered · hangup-cause mapping (patient-side → 9) and hold / retry settings for doctor cases · does Knowlarity send a call-ended event? · partner for Pilot Non-Value Meds · mismatch analytics table (doctor action vs call record).
- [x] Storyboard review (Part C) — **closed** (Apurva, 2026-11-05, D-88): every journey was walked through; only calling needed the long review (D-83).
- [ ] **Prototype build — accessibility and fit items from the copy round (D-84; not visible in the frozen pictures):** live regions for progress / result messages (F24); medicine-row accessible names (F25); non-breaking "4 h" style units (F26); dose and date field errors tied to their fields (F28); two-up button rows stack at large text (CA-20). Plus: Engineering to confirm "Truemeds never sees or stores it." (faster sign-in) before launch.
- [x] **Design System artifact republished (2026-11-03)** with D-82–D-85 (RULES, beyond-salt, bundle.css, tokens, component guides for Button, Action bar, Notice, Bottom sheet, Status card, App bar, List row). Live version 1793690601-476a. Component guide text now lives in `design-system/scripts/build_artifact.py`.
- [ ] **React Native refresh — after the prototype build:** `ui-screens/native/NATIVE-STATUS.md` lists the gaps since 2026-10-15 (entry screens, Home, notices, buttons, sheets, Profile) and the screens not yet in native (case, calling, Prescribe). Rewrite the components from the built prototype in one pass.

## 2k. app-logic drift found by the calling-flow audit (2026-11-03) — fix in the next app-logic pass
- [x] (fixed 2026-11-03) §4 stage table, row "Calling": says header Back works "until the backend reports the patient answered" — D-80 / D-81 F21 hide it from the tap on Call patient (the "Leaving a case" paragraph in §4 already says so). Fix the table row.
- [x] (fixed 2026-11-03) §5 state-table lead-in: "Callback is offered in every call" — D-83 CW-A1: Callback only on 6 and 7d. Fix the sentence.
- [x] (recorded as D-87) D-85 entry said "Non-Value Meds in B" was still open — Apurva settled it (2026-11-03): B is the one Pilot flow, Non-Value Meds go through the HA check too. Record when the decision log is next edited.
- [x] (fixed 2026-11-03) app-logic §6 and §11: launch (Fallback B) flow and scenarios added above the version-A tables.

## 2l. Prototype build — next (new thread)
- [ ] Start from `docs/proposals/2026-11-03-prototype-build-readiness.md` §11; answer Q1, Q3, Q4, Q5.
- [ ] Build plan + rebuild checklist **v3** (Fallback B first, A-only screens later, calling-flow page as the calling reference) → Apurva approves → step 0.
- [ ] Calling-flow live page: **deploy with the next approved merge of this branch** (Apurva, 2026-11-05 — wait until the build plan v3 is approved, then put `[deploy]` in that PR title). The live copy is still the 3 Nov version (no happy path, old zoom).
- [x] Calling-flow page navigation (Apurva, 2026-11-05): scroll / swipe moves, pinch or ⌘ + scroll zooms, opens at 100 %, zoom % with 50 % / 100 % / Fit, jump-to-lane buttons.
- [ ] **Later (logged, not built):** calling-flow page mini-map (where you are in the whole flow) and a "Find a state" box (type "17" or "Transferring" to jump there).
- [x] **Fixed 2026-11-06** (recipe hides `ab-secondary`; two pictures re-rendered, guards 0; `docs/renders/2026-11-06-confirm-failed-fix/REPORT.md`). **Bug (Apurva, 2026-11-05):** `ui-screens/case/a-confirm-failed` (390 + 360) still shows **Callback** under Confirm prescription — after a valid call only the confirm button (D-83 CW-C3). Cause: the recipe in `case.html` uses `passGate(CAT4)`, whose old bar keeps Callback (`a-confirm-busy` hides it, so it is fine). Fix the recipe, re-render the two pictures only; the calling-flow page picks them up by itself.
- [ ] **Next version — live remote for phone tests (D-89):** the desktop review panel drives the phone in real time (paired by a short code). Needs a message relay (Netlify function — credits — or a third-party service). Only if live demos for Engineering / Ops need it.
- [ ] **Deploy the calling-flow page** with the next approved merge (`[deploy]` in that PR title) — the live copy is the 3 Nov version (Apurva, 2026-11-06).
- [ ] **Next version — calling-flow page:** mini-map (where you are on the big diagram) and a "Find a state" box (Apurva, 2026-11-06).
- [ ] **After step 1 — Profile photo (Apurva, 2026-11-06):** use Dr. Kunal Wani's photo as the Profile avatar (he agreed, 2026-11-06). Design change: avatar with photo + initials fallback for doctors without one; render Profile for approval before building. The photo file was lost with the old Mac (2026-11-09) — Apurva to re-share it; save to `docs/renders/2026-11-06-profile-photo/source/kunal-wani.png`. Production question for later: where doctor photos come from (onboarding upload / Truemeds records / Profile).
