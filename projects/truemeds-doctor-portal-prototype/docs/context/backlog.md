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

## 2c. Promotion (after approval)
- [ ] Move calling + entry + Home + case working copies into `ui-screens/`; replace old calling (`b-*`, `c-*`) and duplicate closed states (`e-prescription-confirmed`, `e-transferred`, `e-forwarded`, `e-patient-unavailable` → calling 10a, 14, 10b, 9).
- [ ] Update `ui-screens/README.md`; update the guards for D-61/62/65/66/67 and re-run them on the promoted files.
- [ ] Freeze: mark approved in the decision log; new PR for Apurva to merge.

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

## 5. After the final render
- [ ] Page-by-page PRD (job to be done, use cases, screenshots, decision logic).
