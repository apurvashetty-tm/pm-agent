# Fix round D-80 + D-81 — report

Folder: `docs/renders/2026-11-01-fix-round/`. Brief: `TERMINAL-BRIEF.md`. Checklist: `CHECKLIST.md`.
Branch `project/truemeds-doctor-portal-prototype`. Nothing committed, pushed or PR'd. Git used for `git status` / `git diff` only.

## Capture method (both rounds)

- Script: `scratchpad/cap/capture.py` (session scratchpad, outside the repo). Playwright Chromium, 390×844 and 360×844 viewport, DPR 2 (pictures are 780×1688 and 720×1688, as in `ui-screens/`).
- Fixed clock: 2026-10-28 15:00 IST. Waits: 2000 ms on case and Prescribe, 700 ms on the family pages (as the approved set).
- Infinite animations (spinners) paused at frame 0 so two renders of the same code are identical. Sheet transitions are not touched.
- Check: rendering the unchanged code reproduces the approved pictures exactly for 12 of 14 sampled states; `case/s7a-calling` differs only in the spinner box (expected from the frame pause).
- Baseline: `before/` = all 144 states at 390 and 360 = 288 pictures, taken from the unedited code, 0 page errors.

## Expected list (written before any fix was applied)

Derived from CHECKLIST §1 and probes on the unedited code (`scratchpad/cap/probe_before.json`, `probe2`). "Expected" = the picture must change; the list is the minimum, and anything else that changes is an unexpected difference.

| Fix | Expected to change (state ids, both widths unless noted) |
|---|---|
| F1 | `otp_wrong-code`, `otp_two-tries-left` |
| F2 | none (`t08c` shows the plural: count is 4, measured) |
| F3 | 27 states showing one of the 14 keys (measured in the probe): `sign-in_couldnt-send`, `otp_resend-failed`, `home_request-failed`, `a-back-blocked`, `a-releasing`, `c-callback`, `c-callback-error`, `c-callback-failed`, `c-skip-ha`, `g1-generic-confirm`, `g2-checking-ha`, `g3b-forwarded`, `s7a-calling`, `s7b-still-on-call`, `s7d-result-missing`, `s7d-unavailable-sheet`, `s7e-leave-sheet`, `t02-calling`, `t03-not-through`, `t04-doctor-missed`, `t11-calling-transfer`, `t12-transfer-ready`, `t13-connecting-ha`, `t15-ha-no-join`, `t15b-end-call-first`, `t16-transfer-missed`, `t17-skip-ha-wait` |
| F4 | `g3b-forwarded` (B3 card text becomes the 15 text). `call.noHaFree` is removed |
| F5 | `otp_verifying`, `otp_cooldown-reconciling` |
| F6 | none (locked-number routing is documentation only) |
| F7 | `otp_cooldown-reconciling` |
| F8 | `unlock_*` (7) and `offer_*` (6) if their header spacing moves to the OTP value; `otp_*` unchanged (the OTP spacing is the reference) |
| F9 | `home_adding`, `home_setting` |
| F10 | `home_added` (35:00). `home_profile*`: unchanged, see NEEDS-APURVA (earnings value not settled) |
| F11 | `home_logout-confirm` |
| F12 | pinned Set availability: `home_setup-wheel`, `home_setup-failed`, `home_idle-expired`, `home_manually-ended`, `home_setting` (only where the footer y moves; measured) |
| F13 | `home_offline` |
| F14 | `d-inhaler` (8 puffs), `d-sos-only` (1 tablet), `d-sos-on` (1 tablet) |
| F15 | `d-weekly` (Capsule form, dose chips without ½) |
| F16 | `d-error-dose` (error text under the M/A/N grid, no tinted box) |
| F17 | new `d-disabled` (390 and 360) |
| F18 | `d-duration-picker` |
| F19 | every Prescribe picture where the field shows: `d-default`, `d-syrup`, `d-drops`, `d-injection-default`, `d-cream`, `d-inhaler`, `d-every-x-hours`, `d-alt-days`, `d-monthly`, `d-sos-only`, `d-sos-on`, `d-weekly`, `d-error-dose`, `d-error-other`, `d-duration-picker`, `d-food-selected`, `d-notes-keyboard`, `d-scrolled`, `d-header-white`, `d-disable-sheet`, `d-discard-sheet` (sheets: only if the field is outside the sheet; confirm by diff). Not `d-rx-failed` (Rx overlay) |
| F20 | `d-notes-keyboard`, `d-food-selected`, `a-notes-typing` |
| F21 | `t02-calling`, `s7a-calling`, `s7b-still-on-call`, `t11-calling-transfer`, `c-callback`, `c-callback-error`, `c-callback-failed` (no header Back) |
| F22 | `s7e-leave-sheet`, `a-releasing`, `a-release-failed` (sheet over Ready) |
| F23 | `a-no-medicines` |
| F24 | `a-confirm-busy`, `t13-connecting-ha` |
| F25 | `a-confirm-busy` |
| F26 | `t15b-end-call-first` |
| F27 | the 8 bar states with 16 px icons (measured): `a-confirm-busy`, `a-confirm-failed`, `c-skip-ha`, `g1-generic-confirm`, `t08a-valid-cat4`, `t08b-valid-forward`, `t08c-confirm-blocked`, `t12-transfer-ready`. Target size 20 px (the default `.tm-icon`) |
| F28 | `a-loading` |
| T5 | contact sheets for every folder that changes, `REVIEW.html`, `case/contact-call.png` (rebuilt, not pixel-compared) |

Expected but not changing (must stay identical): every `case/` and `prescribe/` state not listed above, every `sign-in_*`, `otp_*` not listed, `returning-unlock`, and the other `home_*`.

## Round 1 — results

Pictures: `before/` (288, unedited code) and `after/` (290 = 288 + `prescribe/d-disabled`). Promoted to `ui-screens/`: 128 changed + 2 new (130 files). Unchanged pictures were not copied, so `ui-screens/` keeps the approved files for them.

### F1–F28 and T1–T5

| Fix | Result | Evidence |
|---|---|---|
| F1 | PASS | `otp_wrong-code`, `otp_two-tries-left` changed; copy "Wrong code." / "Wrong code. {count} tries left." / singular key. The 1-try singular is in the messages registry and the reference selects it by count; no picture at 1 try (none in the set). |
| F2 | PASS | `case.confirmBlockedOne` in messages.json; `t08c` picks it at n=1. Measured count is 4, so the picture keeps the plural, as expected. |
| F3 | PASS | `check-sources.mjs` now fails on any straight apostrophe in messages.json: PASS, 84 IDs. 27 pictures show the 14 keys; all changed as listed. `s7d-unavailable-sheet` covers its text, so it did not change. |
| F4 | PASS | `g3b-forwarded` uses `call.transferFailed`; `call.noHaFree` removed from messages and metadata. |
| F5 | PASS | Probe: `Verify & sign in` top y = 407 in `default`, `verifying` and `cooldown-reconciling`. |
| F6 | PASS (doc) | app-logic §2 and state map row `signin.locked-number`. No picture, as specified. |
| F7 | PASS | Probe: cooldown line text = "Checking…" alone. `otp_cooldown-reconciling` changed. |
| F8 | PASS | Probe: logo→title gap 16 on OTP, offer and unlock; fingerprint tile top 199 on offer and unlock. Unlock: `.head` margin 0 and panel top padding xl. `unlock_*` (7) changed; `offer_*` and `otp_*` unchanged. |
| F9 | PASS | Probe: chips, Cancel and × disabled in `home_adding`; wheel items disabled. `home_setting`, `home_adding` changed. |
| F10 | PARTIAL | 5:00 + 30 min shows 35:00 (probe; `home_added` changed). Profile earnings **not changed**: no rule for the value, see NEEDS-APURVA. |
| F11 | PASS | `home_logout-confirm`: Stay signed in is `tm-btn--quiet`. Changed. |
| F12 | PASS | Probe: footer top 740 in setup-wheel, setup-failed, idle-expired, setting (was 657 / 739). Cause: `picker()` in the setup screen never closed its div. The setup branch now closes it; the Add-availability sheet markup is unchanged (an earlier version changed `home_add-failed`; reverted). |
| F13 | PASS | Probe: End availability `disabled` in `home_offline`. Changed. |
| F14 | PASS | `d-inhaler` "(max 8 puffs/day)", `d-sos-only` and `d-sos-on` "(max 1 tablet/day)". Changed. |
| F15 | PASS | `d-weekly` (Capsule): dose chips 0 · 1 · 2 and 1 · 2, no ½. Changed. |
| F16 | PASS | `d-error-dose`: error is field text under the M/A/N grid, no tinted box. Scroll on error: existing `confirmMedEdit` scroll kept (not re-measured). |
| F17 | PASS | New `prescribe/d-disabled` (390, 360): "Disabled: Patient declined. Prescribing it will enable it again." Guard lists it. |
| F18 | PASS | Probe: number and unit chips left edge both 33 px (were 33 / 45). `d-duration-picker` changed. |
| F19 | PASS | Label "Additional instructions (optional)" and helper "Printed on the prescription." from messages.json. Changed where the field is in view (`d-scrolled`, `d-notes-keyboard`, `d-food-selected`, `d-error-other`, `d-sos-*`, `d-inhaler`, `d-weekly`, `d-error-dose`, `d-duration-picker`). Not changed in pictures where the field is below the fold (`d-default`, `d-syrup`, `d-drops`, `d-cream`, `d-injection-default`, `d-every-x-hours`, `d-alt-days`, `d-monthly`, `d-header-white`), and the two sheets (field behind the sheet). |
| F20 | PASS | `d-notes-keyboard`, `a-notes-typing`: keyboard drawn, field and label visible, bar hidden (probe: `kb-open`). `d-food-selected`: Food chips visible (scrolled). |
| F21 | PASS | Probe: `#ch-back` hidden in `t02`, `s7a`, `s7b`, `t11`, `c-callback`, `c-callback-error`, `c-callback-failed`, `a-back-blocked`, `t06`. Visible on `t01`, `t03`, `t04`. |
| F22 | PARTIAL | `s7e-leave-sheet` and `a-releasing` now sit over Ready (probe: bar = Call patient; changed). `a-release-failed` already was over Ready: **unchanged, as the expected list allowed**. |
| F23 | PASS | Probe: `a-no-medicines`: bar = "Release case" only, rows 0. Changed. Header Back releases directly (code path). |
| F24 | PASS | Probe: `a-confirm-busy` 5 of 5 rows read-only; `t13-connecting-ha` 3 of 3. Changed. |
| F25 | PASS | `a-confirm-busy`: View Rx no longer disabled (code). Changed (with F24). |
| F26 | PASS | `t15b-end-call-first`: amber `warning` notice. Changed. |
| F27 | PASS | `components.css` rule for `.tm-btn-pair > .tm-btn--secondary/--destructive > .tm-icon` at 20 px. Eight bars changed (16 px → 20 px). `truemeds.css` regenerated; diff is that rule plus the build date. |
| F28 | PASS | `a-loading`: skeleton top 116 = order-details card top 116 (`t01-ready`). Changed. |
| T1 | PASS | app-logic.md: §2 wrong-code, terms line, cooldown, locked-number sign-in; §3 Home; §4 Back, Release, empty case, F26; §6 busy read-only; §8 SOS, capsule, dose error, disabled, notes label; §9 keyboard; §10 skeleton. |
| T2 | PASS | feedback-state-map.md: OTP rows, `signin.locked-number`, case exits, `case.no-medicines`, `case.end-call-first`, new Prescribe section, Home note. |
| T3 | PASS | design-system/RULES.md: §9.1 icon size; §9.4 quiet "stay"; §9.5 keyboard rule (cites §8 point 9). Wording to confirm (NEEDS-APURVA). |
| T4 | PASS | ui-screens/README.md: `d-disabled` listed, Prescribe count 22 → 23, fix-round section. |
| T5 | PASS | Contact sheets (7 folders) rebuilt with `_qa/build-contact-sheets.py`; storyboard with `build-storyboard.py` (`docs/renders/2026-10-22-calling/storyboard-final.png`, copied to `case/contact-call.png`); `REVIEW.html` rebuilt with `build-review.py` (145 states). |

### Expected list vs actual

- **Matched:** all changed pictures listed in the expected list changed. The 128 changed (both widths) are listed in `promoted`. Groups: F1 2, F3 27, F4 1, F5/F7 1, F8 unlock 7, F9 2, F10 1, F11 1, F12 5, F13 1, F14 3, F15 1, F16 1, F18 1, F19 (visible field) 13, F20 3, F21 7, F22 2, F23 1, F24 2, F25 1, F26 1, F27 8, F28 1. Some states are in more than one group.
- **Unexpected difference (found and fixed during this round):** `home_add-failed` changed after the first picker fix (the Add sheet's markup moved). Reverted for the sheet by closing `.picker` only in the setup branch. After the fix, `home_add-failed` is identical to before.
- **Unexpected difference (found and fixed):** a stray comment text ("// D-81 F12 …") rendered into the Home timer. Fixed; Home re-rendered; a probe over all states finds no "D-80/D-81" text.
- **Expected but unchanged:** `case/a-release-failed` (F22, already over Ready); `prescribe/d-default`, `d-syrup`, `d-drops`, `d-cream`, `d-injection-default`, `d-every-x-hours`, `d-alt-days`, `d-monthly`, `d-header-white` (F19, field below the fold); `case/s7d-unavailable-sheet` (F3, text behind the sheet); `home/home_profile*` (F10 earnings not changed); `offer_*` (F8, offer header already matched).
- **Unexpected difference, cause accepted:** `home_setup-wheel`, `setting`, `idle-expired`, `manually-ended`, `setup-failed` changed as the F12 footer moved to y 740 — these are in the expected list.

### Guards

| Guard | Result |
|---|---|
| `ui-screens/feedback/check-locked-specs.py` | PASS, 0 failures across 145 states × 3 widths (390, 360, 430). Changes: `d-disabled` added to the Prescribe list. |
| `ui-screens/feedback/check-sources.mjs` | PASS, 84 registry IDs; straight-apostrophe check added. |
| `docs/layout_check.py` | ALL PASS (run after the last CSS change). |
| `brand/check_lockup.py` | OK. |

Guard fixes during the round: (1) the keyboard digit font was a raw 23 px, not on the type scale, so it now uses `--tm-font-size-title-md`; (2) a local rule restyled `.tm-chip-group` (guard 5.12), so the duration unit group now sits in a local wrapper `.ps-dur-units`; (3) the wheel's selected value greyed when disabled (guard 6.x), so it keeps brand text.

### Determinism and page errors

- Second full render of all 290 pictures against the first: **290 of 290 identical.**
- Page errors and console errors: **0** in the baseline, the post-fix run and the determinism run.

### DOM probes (read-only)

`scratchpad/cap/verify.py` over every state: no "D-80/D-81" text; calling-state Back hidden; empty case bar = Release case; busy rows read-only; keyboard `kb-open` with bar hidden.

### Visual check at full size (honest scope)

Opened at full size at 390 (and 360 where noted): `prescribe/d-notes-keyboard`, `prescribe/d-food-selected`, `prescribe/d-error-dose`, `case/a-no-medicines`, `case/a-notes-typing`, `case/a-loading`, `home/home_add-failed`, `home/home_active`, `returning-unlock` (via the probe, not opened). **Not** opened individually: the rest of the 128 changed pictures. Their change is pixel-compared and each one's fix was verified by DOM probe or by the expected-list match. 360 pictures were not opened.

### NEEDS-APURVA (left as they were, or decided and flagged)

1. **F10 Profile earnings.** Checklist says "match prescriptions today", but no decision sets an amount per prescription or an incentive rule. Left at ₹0.00 / ₹0.00 while Home shows 3 prescriptions. Needs the rule or a value.
2. **Wheel selected value while disabled.** Kept brand-coloured (guard 6.x) while the other values grey. Confirm.
3. **Unlock panel top padding 32 → 24** (F8). Chosen to put the fingerprint tile at the offer's position with the header unchanged. Confirm, or pick another way.
4. **Icon size 20 px** for secondary bar buttons (F27). Chosen as the default `tm-icon` size. Confirm.
5. **RULES wording (T3):** the quiet "stay" rule (§9.4), the keyboard rule (§9.5, cites §8 point 9), and the icon-size rule (§9.1). Written by me; confirm wording.
6. **Back after the Call-again tap, state 6 (`t06`):** D-80 says Back is hidden from the Call-again tap. `t06` offers Call again after a call, so Back is hidden there too. Confirm it matches intent (the brief's F21 list does not include `t06`, which is consistent).
7. **`d-disabled` reason** is the mock value "Patient declined".
8. **F6** is documentation only, as the checklist specifies; there is no picture for the locked-number route.
9. **Storyboard file** `docs/renders/2026-10-22-calling/storyboard-final.png` is rebuilt (T5); it lives outside this round's folder and is in the diff.

### Diff scope (G6)

`git diff --stat`: 65 files, all in the named scope or generated from a named source: `design-system/RULES.md`, `src/components.css`, `truemeds.css` (generated from components); `docs/feedback-state-map.md`; `ui-screens/app-logic.md`, `README.md`, `REVIEW.html`, `case/case.html`, `feedback/*` (messages.json, messages.js, metadata.json, check-sources.mjs, check-locked-specs.py), `native/messages.ts` (generated), `home/home-reference.js` and `.css`, `otp/otp.html`, `returning-unlock/returning-unlock.html`; the promoted PNGs; contact sheets; storyboard. `design-system/preview.html` and `native/tokens.*` were reverted (date-only changes from the build). Nothing committed, pushed or PR'd.

### Gate summary

| Gate | Result |
|---|---|
| G1 | PASS for all fixes; PARTIAL for F10 (earnings) — see NEEDS-APURVA 1 |
| G2 | PASS: every change is on the expected list; the two unexpected differences found were fixed or explained |
| G3 | PASS: four guards, 0 failures |
| G4 | PASS: no straight apostrophe; singular keys present and used; `messages.js` and `native/messages.ts` regenerated |
| G5 | PASS: 290 of 290 identical on re-render; 0 page errors |
| G6 | PASS: diff in named scope (above) |

ROUND 1 COMPLETE — failures: 1

## Round 2 — results

Brief: `TERMINAL-BRIEF.md`, "Round 2". Main thread accepted NEEDS-APURVA 2–9 from Round 1 (no action).

| Item | Result | Evidence |
|---|---|---|
| F10 Profile earnings | PASS (mock) | `[MOCK ASSUMPTION]` ₹150 per confirmed prescription; Earned = count × 150, count as Home (3 today; 0 in the setup states). Probe: `home_profile` shows **₹450.00 · ₹0.00**. Written in `app-logic.md` §11 as illustrative; real amounts from the backend (D-73). Changed pictures: `home_profile`, `home_profile-case-open`, `home_logout-confirm` (both widths); the other 38 Home pictures identical to Round 1 output (38 of 44). |
| F16 scroll to first error | PASS, no change needed | Probe (`scratchpad/cap/f16.py`): tablet, dose 0-0-0, Prescribe screen scrolled to the bottom (`ps-body` scrollTop 426 = max), tap Prescribe. After the tap: `ps-body` scrollTop **0**; dose error line at **y 510–530**; pinned band bottom 130; action bar top 756. Error inside the visible area at 390 and 360. The existing `confirmMedEdit` scroll kept (the render resets scroll, then the target is shown). `d-error-dose` and `d-scrolled` re-rendered: **identical to Round 1** (4 of 4 pictures). |

### Pixel compare against Round 1 output (`after/`)

- Home: 38 of 44 identical; the 6 differing pictures are the three Profile states at 390 and 360 (`home_profile`, `home_profile-case-open`, `home_logout-confirm`). Nothing else changed.
- Prescribe: `d-error-dose`, `d-scrolled` identical (F16 no picture change).

### Promotion

Round 2 Profile pictures copied to `ui-screens/home/` (6 files). `contact-home.png` and `REVIEW.html` rebuilt with `_qa/` scripts (145 states).

### Guards

| Guard | Result |
|---|---|
| `check-locked-specs.py` | PASS, 0 failures across 145 states × 3 widths |
| `check-sources.mjs` | PASS, 84 registry IDs |
| `docs/layout_check.py` | ALL PASS |
| `brand/check_lockup.py` | OK |

### Determinism

Second render of the three re-rendered Profile states: **6 of 6 identical** (both widths).

### Page errors

0 in the Round 2 renders.

ROUND 2 COMPLETE — failures: 0

## Round 3 — results

Brief: `TERMINAL-BRIEF.md`, "Round 3" (2026-11-02). Done in the same session (no new session was started).

| Item | Result | Evidence |
|---|---|---|
| 1. Icon size steps with button size | PASS | Design-system rule (main thread, `components.css`): `.tm-btn > .tm-icon` 16 px, `.tm-btn.tm-btn--lg > .tm-icon` 20 px. Probe over all 145 states at 390 and 360: every icon inside a `tm-btn--lg` (56 px) button is 20×20; every icon inside a compact `tm-btn` (48 px) is 16×16. **0 mismatches at 390, 0 at 360.** No markup change was needed: every 56 px button already carried `tm-btn--lg`. View Rx stays 16 px. Non-`.tm-btn` icons (Order details toggle, User manual row, duration toggle) unchanged. |
| 2. Profile earnings ₹20 per prescription | PASS | `home-reference.js` now `rxToday × 20`; with 3 prescriptions Earned = ₹60.00 (Incentive ₹0.00). The three Profile states changed and are promoted. app-logic §11 updated by the main thread. |
| 3. Expected list before rendering | PASS | See "Expected list" below. Derived from the rendered DOM and from pixel attribution. |
| 4. Re-render all into `after-r3/`, compare with `ui-screens/` | PASS | 290 pictures rendered, 0 page errors. 80 of 290 identical; 105 states (210 pictures) differ, all listed below. Attribution: 204 of 210 changed pictures fall entirely inside button-icon rectangles (old and new icon sizes), 6 are the Profile earnings text. No unexplained change. |
| 4a. Promote changed pictures; rebuild sheets, REVIEW, storyboard | PASS | 210 pictures copied to `ui-screens/`; `_qa/build-contact-sheets.py`, `build-storyboard.py` (copied to `case/contact-call.png`), `build-review.py` (145 states). |
| 4b. Four guards | PASS | `check-locked-specs.py`: 0 failures, 145 states × 3 widths. `check-sources.mjs`: PASS, 84 registry IDs. `docs/layout_check.py`: ALL PASS. `brand/check_lockup.py`: OK. |
| 4c. Determinism | PASS | Second full render of all 290 pictures against the first: **290 of 290 identical.** |
| 4d. Page errors | PASS | 0 in every render. |
| 4e. `git diff --stat` in scope | PASS | Working tree: the design-system files (RULES.md, components.css, truemeds.css), the feedback and app files, `app-logic.md`, `feedback-state-map.md`, `README.md`, `REVIEW.html`, `ui-screens/**/*.png`, `native/messages.ts`, `case.html`, `home-reference.*`, `otp.html`, `returning-unlock.html`, `check-*.{py,mjs}`, and the storyboard. Nothing committed. |

### Expected list (written from the DOM before promotion)

The changed pictures are the states with a button icon in a 48 px compact button (20 → 16 px), or a 56 px button icon that changed in the old set. In practice: every state with a header back, help, bell, profile or close icon button (compact 48 px), plus the states whose bar or sheet buttons changed size. The 105 states:

Case page (58 states): `a-back-blocked`, `a-confirm-busy`, `a-confirm-failed`, `a-leave-sheet`, `a-load-failed`, `a-loading`, `a-long-content`, `a-no-medicines`, `a-notes-typing`, `a-offline`, `a-offline-action`, `a-order-details`, `a-release-failed`, `a-releasing`, `a-rx-viewer`, `a-scrolled`, `a-top`, `c-callback`, `c-callback-error`, `c-callback-failed`, `c-skip-ha`, `e-availability-ended`, `e-callback-scheduled`, `g1-generic-confirm`, `g2-checking-ha`, `g3b-forwarded`, `s-10-medicines`, `s-medicine-disabled`, `s-optional-empty`, `s7a-calling`, `s7b-still-on-call`, `s7c-checking`, `s7d-result-missing`, `s7d-unavailable-sheet`, `s7e-leave-sheet`, `s7f-submitted`, `t01-ready`, `t02-calling`, `t03-not-through`, `t04-doctor-missed`, `t05-result-wait`, `t06-ended-early`, `t08a-valid-cat4`, `t08b-valid-forward`, `t08c-confirm-blocked`, `t09-patient-unavailable`, `t10a-confirmed`, `t10b-forwarded`, `t11-calling-transfer`, `t12-transfer-ready`, `t13-connecting-ha`, `t14-transferred`, `t15-ha-no-join`, `t15b-end-call-first`, `t16-transfer-missed`, `t16b-transfer-missed-patient`, `t16c-transfer-missed-unknown`, `t17-skip-ha-wait`.

Home (22 states, incl. Profile ×3): `home_active`, `home_add-failed`, `home_add-wheel`, `home_added`, `home_adding`, `home_end-confirmation`, `home_expired-pending`, `home_idle-expired`, `home_logout-confirm` (Profile), `home_manually-ended`, `home_near-expiry`, `home_no-cases`, `home_offline`, `home_profile` (earnings text), `home_profile-case-open` (earnings text), `home_request-failed`, `home_requesting`, `home_setting`, `home_setup-failed`, `home_setup-wheel`, `home_stop-pending`, `home_unknown-result`.

Prescribe (23 states): `d-alt-days`, `d-cream`, `d-default`, `d-disable-sheet`, `d-disabled`, `d-discard-sheet`, `d-drops`, `d-duration-picker`, `d-error-dose`, `d-error-other`, `d-every-x-hours`, `d-food-selected`, `d-header-white`, `d-inhaler`, `d-injection-default`, `d-monthly`, `d-notes-keyboard`, `d-rx-failed`, `d-scrolled`, `d-sos-on`, `d-sos-only`, `d-syrup`, `d-weekly`.

Other: `sign-in_sending` (spinner frame, in a busy button), `offer_enabling` (spinner frame, in a busy button).

### Expected but unchanged

- Every picture not listed above is identical to `ui-screens/` (80 of 290 identical). Sign-in and OTP pictures are unchanged except `sign-in_sending` (spinner frame).

### Notes for review

- The **header icon buttons** (back, help, bell, profile, close ×) are compact 48 px buttons, so under the new rule their icons go from 20 px to 16 px. This follows from the rule; the brief's wording only named the 56 px buttons and the compact-button rule. Flagged for NEEDS-APURVA.
- **Renderer clock fix (tooling, not design):** Playwright 1.64 reads an integer `set_fixed_time` as seconds, so the Rx prescription date rendered as "10 Aug 58793". `capture.py` now passes a `datetime` (28 Oct 2026, 15:00 IST), which reproduces the approved pictures. The first Round 3 render used the integer clock; it was discarded and re-rendered before comparison.

### Small-phone

Not part of Round 3.

ROUND 3 COMPLETE — failures: 0

## Round 4 — results (NOT COMPLETE)

Brief: `TERMINAL-BRIEF.md`, "Round 4" (items 0–11). Re-read before rendering, including items 0, 10 and 11. Round 4 was started and is **not complete**. Nothing was rendered into `after-r4/`, nothing was promoted, and no gate was run for Round 4. The status below is what was actually done and verified.

| Item | Status | Evidence |
|---|---|---|
| 0. Icon-only buttons back to 20 px (main thread, design system) | **PASS** | Probe over all 145 states at 390 (`scratchpad/icon_r4_390.json`): 228 icon-only buttons (`tm-btn--icon`) render their icon at 20 px; 80 labelled 48 px buttons at 16 px; 77 labelled 56 px buttons at 20 px. Round 3 sizes unchanged. |
| 1. Pinned `.tm-actionbar` on Home, offer and unlock; scrolling content; toasts above bar | NOT DONE | No code change. |
| 2. Notice placement rule (A-19) — RULES §9.5, `feedback-state-map.md` | NOT DONE | No text change. |
| 3. Notice inside the bar = edge-to-edge band (`.tm-actionbar > .tm-notice`), design system | NOT DONE | `components.css` untouched in Round 4. |
| 4. OTP terms line centred, balanced, "Terms & Conditions" not split (A-01, A-02) | **Applied and measured, then reverted** | Edits measured in the browser: terms line centred (text-align centre, balance wrap, link nowrap); Verify button top 435 px in default, resend-available, verifying and cooldown states (A-03 satisfied by a 48 px resend row). **Reverted** (`ui-screens/otp/otp.html` restored to the approved source) because nothing was rendered or promoted; to be re-applied with the Round 4 render. |
| 5. Consistency audit: all bugs and recommended questions (A-03 … B-25, incl. A-07 logo, B-05 gap 16, B-01/02 busy bars, B-18 keyboard) | NOT DONE | Only A-03, A-01, A-02 touched (item 4). Remaining audit items not started. |
| 6. Small-phone 360×640 renders into `small-phone/` (Home all states, `d-default`, `t01-ready`, `s7d-result-missing`, `t12-transfer-ready`, offer, unlock) | NOT DONE | No renders. |
| 7. Texts (app-logic, state map, RULES §8/§9.5, `beyond-salt.md`, README counts) | NOT DONE | None. |
| 8. Expected list, `after-r4/` render, compare, probes, guards, determinism, promotion, sheets, `before-after-r4/` | NOT DONE | No expected list was written for Round 4; no Round 4 render exists. |
| 9. Report and stop | This section | — |
| 10. Permanent 360×640 small-phone guard (`docs/layout_check.py` or locked-specs) | NOT DONE | Not implemented; no state count to report. |
| 11. Regression gate G7 across all standards, final decisions and fix rounds | NOT DONE | Not run. The four guards were last run for Round 3 (0 failures, 145 states × 3 widths) and are **not** a Round 4 regression result. |

### Expected vs actual

No Round 4 expected list exists, so no comparison is possible. Round 3 state is unchanged: `ui-screens/` holds the Round 3 pictures (210 promoted), and the working tree's only Round 4 change is the reverted OTP edit (none remain in `otp.html`).

### Guards

Not re-run for Round 4. Last result (Round 3): locked-specs PASS (0 failures, 145 states × 3 widths), sources PASS (84 IDs), layout ALL PASS, lockup OK.

### Small phone

Not run.

### NEEDS-APURVA

1. Round 4 is too large to finish in one session (items 1–3, 5–8, 10–11 remain). Decide whether to continue in a fresh round or split it.
2. Carried from Round 3: header icon buttons (back, help, bell, profile, close) now sit at 16 px under the compact-button rule, but item 0 says icon-only buttons are 20 px. Item 0 is verified at 20 px in the render; confirm that the Round 3 pictures (which had 16 px on these) are superseded by Round 4.
3. Carried from Round 1/2: profile earnings ₹20 per prescription (Round 3) replaced the ₹150 mock; app-logic §11 records the current value.

### Gate

Round 4 gates were **not run**. Status: **INCOMPLETE**.

ROUND 4 INCOMPLETE — failures: 10 (items 1, 2, 3, 4-unrendered, 5, 6, 7, 8, 10, 11; item 0 passes)
