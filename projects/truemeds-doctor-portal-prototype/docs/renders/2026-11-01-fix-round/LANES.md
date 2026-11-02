## Lane A — DONE

Owner: design system, copy, texts. Files changed: `design-system/src/components.css`, `design-system/truemeds.css` (rebuilt with `scripts/build.py`), `design-system/RULES.md`, `design-system/beyond-salt.md`, `ui-screens/feedback/messages.json`, `ui-screens/feedback/messages.js` and `ui-screens/native/messages.ts` (regenerated with `build-messages.mjs`), `ui-screens/app-logic.md`, `docs/feedback-state-map.md`, `ui-screens/README.md`. Date-only build changes in `native/tokens.json`, `native/tokens.ts`, `preview.html` reverted.

Done:
- Item 3 — notice band in the action bar: `.tm-actionbar > .tm-notice` (edge to edge, top corners follow the bar, 1px bottom edge in the tone colour, padding 12/16, 16 gap to the button). All three tones.
- Item 2 — notice placement rule written: RULES §9.5, feedback-state-map "Placement rules" (A-19).
- Item 7 texts — RULES §3 (every pinned main action in the bar; bar notice row), §5 (small-phone checkbox), §8.2–8.4 (cards stack at 16; cards/notices gaps; pinned bar), §8.13 (logo 166 px, top 16), §8.14 (small-phone rule, 360×640), §9.4 (sheet ✕ on the 16 margin; `.tm-sheet__label`), §9.5 (notice placement, balanced wrap, toast offset). app-logic §13 added and targeted lines updated (Home, offer, unlock, OTP, case empty card, Prescribe, keyboard, dose grids, duration). feedback-state-map Round 4 table. README Round 4 note (no state count change).
- A-08 — busy buttons: `.tm-btn--busy { gap: 0 }`, spinner→label gap 8 everywhere.
- A-22 / B-20 — notice text `text-wrap: balance`.
- B-07 (sheet part) — `.tm-sheet__close` glyph on the 16 margin.
- B-14 — `.tm-sheet__label` class defined (screens to adopt it: lane C).
- Round 4 item 1 hook — `.tm-toast` uses `--tm-toast-offset` (screens set it).
- A-06 — copy "Use your screen lock instead of an OTP." (one line).
- A-17 — non-breaking spaces in `otp.tooManyResends`, `otp.locked`, `otp.expiredAndLimited` ("call Doctor Ops" and "in {time}" stay together).
- Round 4 item 0 (icon sizes) — untouched; RULES §9.1 unchanged.

Left out / handed on (reason):
- Item 1 footers (Home, offer, unlock), item 4 OTP terms, A-03, A-05, A-09, A-10, A-11, A-12, A-13, A-14, A-15, A-16, A-20, A-21 — screen markup/CSS in lane B. Requests in LANE-REQUESTS.md.
- B-01, B-02, B-03, B-04, B-05, B-06, B-08 to B-13, B-15, B-16 to B-19, B-21, B-22, B-24 — case page / Prescribe markup (lane C). Wording and rules are in app-logic §4, §6, §8, §9; the central part is done (B-14 class, A-19 band).
- A-07 lockup — the size and offset are a rule (RULES §8.13, 166 px); the edit is in lane B files. **NEEDS-APURVA:** sign-in logo 174 → 166 px (Home is the limit at 360 wide: 360 − 32 − 146 − 16 = 166).
- B-07 header and Rx-viewer glyph positions (compact header and sheets already match; the viewer and edit headers have 8px padding) — left for lane C to measure, not changed centrally.
- Item 6 / item 10 small-phone renders and the layout guard — lane D.
- Checks, pictures, contact sheets, REVIEW.html — lane D (no rendering done here; nothing promoted to `ui-screens/`).

Verification: `scripts/build.py` ran clean (CSS braces balanced, 257/257); `build-messages.mjs` ran clean (placeholder and metadata checks passed); `git diff` in design-system limited to the five files above. No commits.

NEEDS-APURVA (Lane A):
- Logo size 174 → 166 px on sign-in (RULES §8.13). Before/after: sign-in lockup 174 px wide, 24 px top offset → 166 px, 16 px top, applied to all home-base screens.

## Lane B — DONE

Files changed (Lane B only): `ui-screens/home/home-reference.js`, `ui-screens/home/home-reference.css`, `ui-screens/faster-signin-offer/faster-signin-offer.html`, `ui-screens/returning-unlock/returning-unlock.html`, `ui-screens/sign-in/sign-in.html`, `ui-screens/otp/otp.html`. Nothing rendered into `ui-screens/`, nothing promoted, no commits. Self-check renders in `docs/renders/2026-11-01-fix-round/lane-b-preview/` (390 and 360, 844 tall; 360×640 under `small-640/`), 256 pictures, 0 page errors.

Done:
- Item 1: Home (all bar states), offer and unlock footers are `.tm-actionbar`, edge to edge; panel scrolls above it; toasts above the bar. Action-result notices (Home near-expiry, setup-failed, request-failed, offer enable-failed/offline, unknown-result status line) sit inside the bar. Standing notices (Home offline, no-cases, stop-pending, expired-pending, idle-expired, manually-ended; unlock unavailable) sit at the top of the panel.
- Item 4 / A-01, A-02, A-03: OTP terms centred, balanced, "Terms & Conditions" nowrap; resend row 48 tall in both wait and link states.
- A-04 OTP subtitle 14/20. A-05 header-to-panel 32 on sign-in, OTP, offer, unlock, Home (probed). A-07 logo 174, top 16 everywhere (probed; Home logo 149→174, sign-in top 24→16). A-09 timer row fixed 48 (Add time no longer moves timer). A-10 Home "Prescriptions today" 14 grey. A-11 Checking… line centred. A-12 add-time error 16 above/below. A-13 Profile gaps 16/16. A-14 notices 8 under field (sign-in and OTP). A-16 normal word space before links. A-20 Profile label 16 semibold. A-21 no icon on "New code sent."

Left out / not done here:
- A-15 number pad — see LANE-REQUESTS (needs decision on the reference drawing).
- A-06 offer subtitle — copy, Lane A (messages.json).
- A-08, A-22, central notice/spinner tokens — Lane A.
- B-18 (keyboard), B-items — Lane C / not in these files.

Decision note for the main thread (not edited here): D-66 E ("entry screens keep their panel footer") is superseded for offer and unlock by Round 4 item 1 (2026-11-02); Home was never covered by it. Record in decision_log.

NEEDS-APURVA for the main thread:
- Offer title at 360 wraps to two lines ("Skip the OTP next time"), pushing the offer tile 40 px below the unlock tile at 360 (390 matches at 206.7). Pre-existing; not changed. Decide title wording/size or accept.
- Classification of Home notices (action result vs standing) is my reading of item 2; offline and idle/manual states went to the top of the panel. Confirm.
- Bar notice to button gap set to 16 (A-12/A-19), per audit; confirm vs band design from Lane A.
## Lane C — DONE

Scope: `ui-screens/case/case.html`, `ui-screens/case/case-styles.css` only. No promotion into `ui-screens/`, no commits. Self-check renders: `lane-c-preview/` (81 states × 390/360, `index.json`; 0 page errors).

**Done (CONSISTENCY-AUDIT ids):**
- B-01 Transferring… keeps the Callback + Skip HA row, greyed (bar 152 px, same as the state before). Confirming… already kept its greyed row.
- B-02 7c "Checking call result…" and g2 "Checking for HA" take the buttons' row; bar height unchanged (7b 149 → 7c 149; g1 152 → g2 152). In 7c the question notice stays in layout with `visibility:hidden`.
- B-03 empty phase-1 holder removed: the script card bottom is 16 during a call and after (was 28 during a call).
- B-04 outcome card 16 above and 16 below (was 12 / 20).
- B-05 16 between cards on the case page and on Prescribe (`#main-scroll`, `#ps-body`, `#ps-dynamic` gaps).
- B-08 single-row option grids take the M/A/N chip width (66.5 at 390, 59 at 360; SOS maximum grids compensate for their 14 px narrower parent).
- B-09 spacing part: 8 between the duration number rows and the unit chips. Inset part held (see NEEDS-APURVA).
- B-10 "(optional)" grey regular on "Additional instructions" (as on Food).
- B-11 "Dose (units)" for the dose heading and the Other entry (done in the driver's `renderPrescribe` wrapper).
- B-12 number and unit kept together in the On-prescription band (no-break space).
- B-13 balanced wrap for medicine names, Prescribe title, Rx medicine names.
- B-15 wrap balanced on the Skip HA reasons. Wording kept (D-58 point 23). See NEEDS-APURVA.
- B-16 with Order details hidden, View Rx sits at the left edge of its card.
- B-17 empty case: message left-aligned, regular 14 px. Local class `case-empty-text`, no central `.tm-empty` restyle.
- B-18 notes fields draw a text keyboard (QWERTY, same key style); Other dose keeps the number pad with a decimal key in the blank slot; its error example is `7..5` (a typo the pad really allows), not `abc`.
- B-19 Rx-failed notice 16 under the viewer header (was 5).
- B-21 back-blocked toast breaks between the two sentences (the approved text is unchanged).
- B-22 callback card shows the calendar icon, unavailable card shows phone-off (not ⓘ).
- B-24 M / A / N letters left-aligned on the Dose label edge.
- A-19 (case part) "Release failed" notice moved from the content into the pinned bar, above Call patient.
- B-06 header: checked at 390 and 360 with a three-line name. The header grows and no gap squeezes, so no change was made. Confirm if Apurva saw something different.

**Left out (reason):**
- B-09 chip inset: the audit wants the duration chips inset like the field text. D-55 item 1 says option grids start at their label's left edge, and the label edge is the field's outer edge. Conflict → D-55 kept. See NEEDS-APURVA.
- B-14, B-20, B-07 and other shared-component items: Lane A / Lane B files.
- No Round-4 item conflicts with G7 except the two listed under NEEDS-APURVA.

**Files changed:**
- `ui-screens/case/case-styles.css`: new block "FIX ROUND 4, LANE C" at the end.
- `ui-screens/case/case.html`: driver and markup for B-01, B-02, B-10, B-11, B-12, B-16, B-17, B-18, B-19, B-21, B-22, B-24, A-19 (case), the `#az-phase1` rule, and the Other-dose error value.

**For Lane D:**
- Guard `check-locked-specs.py` (run for self-check, not promoted): 14 `[1.1]` failures, all bar notices with 0 side margin (t08c, t16 × 3, t17, t03, t04, t06, s7b, s7d × 2, a-offline, a-offline-action, a-confirm-failed). They come from the in-bar notice band (Lane A item 3). Lane D should update the guard with a citation to Round 4 item 3, not loosen it.
- No other case-page guard failures from lane C. `[5.12]` in sign-in and home-reference css and `[6.x]` home pinned footer are Lane A/B files.

**NEEDS-APURVA (C):**
1. B-09 duration chips: inset to the field text (audit) vs chips starting at the label edge (D-55 #1). Left as is, spacing done.
2. B-15 Skip HA reason text: decision log D-58 pt 23 reads "Repeat patient, familiar with the medicines"; `ui-screens/app-logic.md` line 178 reads "Repeat patient — familiar with medicines". Kept the D-58 text; app-logic and the decision disagree.
3. B-11 "Dose (units)" also replaces "(ml)" and "(puffs)" in the dose heading and the Other label. The unit word is gone from the heading for syrups and inhalers. Done as the audit asked; confirm.
4. A-19 offline (`a-offline`, `a-offline-action`): the offline notice is a standing state, so the rule would put it at the top of the panel. D-53 (offline pattern in the case bar) keeps it in the bar. Kept D-53; needs a decision.

**Addendum (Lane C, after A's request):** B-14 done: the Date / Time labels and the three "Select reason" labels use `.tm-sheet__label` (sheet-section spacing kept as a local class). The callback-failed notice sits inside its sheet above Confirm callback, not in the bar. That is the sheet's own action, so A-19 is met as written. B-15 wording is not changed (see NEEDS-APURVA 2); the balanced wrap is applied.

## Lane D — DONE (integration, 2026-11-02)
Files changed outside the lanes' own: `ui-screens/feedback/check-locked-specs.py` (small-phone pass, [6.x] and [1.1] changes cited), `ui-screens/home/home-reference.js` (in-bar notice states; `.picker` closed), `ui-screens/case/case.html` (dose label rule; `syncCaseActionBar` defined), `ui-screens/faster-signin-offer/faster-signin-offer.html` and `ui-screens/returning-unlock/returning-unlock.html` (bar moved out of the scroll panel), `ui-screens/sign-in/sign-in.html` (login-notice class), `ui-screens/app-logic.md` (§6, placement, logo text), `docs/feedback-state-map.md`, `design-system/RULES.md` (§8.14 guard name, §9.5 placement). Rendered `after-r4/` and `small-phone/`, promoted, rebuilt sheets and REVIEW, built `before-after-r4/`. Report: REPORT.md "Round 4 — results (lane D)". Result: one item failed (B-07, not applied). No commits.

