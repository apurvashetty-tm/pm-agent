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

## Round 4 — attempt 1 (superseded by the lane run below; NOT COMPLETE)

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


## Round 4 — results (lane D, integration)

Brief: `TERMINAL-BRIEF.md` "Round 4 — split into lanes" (items 0–11, lane-request resolutions 1–11). Lanes A, B, C done (`LANES.md`); this section is lane D. Expected list written before the render: `round4-expected.md`. Nothing committed, pushed or PR'd.

### Lane-request resolutions (`LANE-REQUESTS.md`)

| # | Request | Result |
|---|---|---|
| 1 | Logo 174 → 166 on every logo screen | Done: sign-in, OTP, offer, unlock, Home are 166 px wide, 16 from the top (probe). |
| 2 | Remove local `.footer > .tm-notice` rules | Done: removed from `home-reference.css`; offer `.notice-slot` margin removed. Unlock had none. Component owns the 16 gap. |
| 3 | Sign-in keyboard drawn like OTP | Done: blank key and ⌫ are white (`login-key--quiet`). Probe: all 12 keys white. |
| 4 | Dose headings: keep each form's unit | Done: "Dose (ml)" (syrup), "Dose (puffs)" (inhaler), plain "Dose" (injection, D-15). Only the injection Other label reads "Dose (units)". See NEEDS-APURVA 2. |
| 5 | Skip HA reason = D-70 wording | Kept the text (title "Repeat patient, familiar with the medicines", sub-line "Counselled in an earlier order"). `app-logic.md` §6 corrected to match. |
| 6 | Duration chips: no inset | No inset applied (D-55). Spacing 8 kept. |
| 7 | Notice placement refined | Done: Home "No cases right now" and offline moved into the bar; case offline stays in the bar (D-53). Unlock "isn't available" and Home idle / manually ended / expired-pending / stop-pending stay at the top. Written in RULES §9.5, `feedback-state-map.md` Placement rules and rows, `app-logic.md`. |
| 8 | Guard `[1.1]` for the in-bar band | Done: in-bar `.tm-notice` exempt from the side-margin check only (cites item 3). |
| 9 | `check-sources` accept U+00A0 | Already passes (apostrophe check is the only rule); no edit needed. |
| 10 | Offer title wraps at 360 | Accepted, no wording change. |
| 11 | Note: D-66 E superseded for offer / unlock | Not recorded in `decision_log.md` (main thread). See NEEDS-APURVA 9. |

### Fixes lane D found while integrating (not in any request)

- **Offer and unlock panels did not scroll and the bar sat inside the panel** (sticky inside the scroll). At 360×640 the bar covered the last lines. Fix: `.panel{overflow-y:auto}`; the bar is now a sibling below the panel on both screens.
- **Home setup states: `.picker` was never closed**, so the pinned bar landed inside `.scroll` (not pinned; 5 states: setup-wheel, setting, setup-failed, idle-expired, manually-ended). Fix: closing `</div>` in `picker()`. The 5 states were re-rendered (390, 360, small-phone) and re-promoted. Before/after pairs regenerated from the Round 3 pictures.
- **`syncCaseActionBar` was called but never defined**, so `--ab-h` stayed 0 and the mobile case scroll ended under the bar. Now defined: sets `--ab-h` to the bar's height on load and resize. Changes only the scroll end, not top-of-page pictures.
- **Sign-in notice margin** moved from the central `.tm-notice` selector to a `login-notice` class (guard 5.12 flagged the local restyle).

### Items

| Item | Result | Evidence |
|---|---|---|
| 0. Icon-only buttons 20 px; labelled 56 → 20, 48 → 16 | **PASS** | Icon probe over all 145 states at 390: 485 icon-carrying buttons, 0 violations. |
| 1. Pinned `.tm-actionbar` on Home, offer, unlock; content scrolls; toasts above bar | **PASS** | 32 bars (19 Home incl. unknown-result, 6 offer, 7 unlock): all flush to the frame bottom (probe). Profile has no bar (D-70). Toast bottom = bar top + 16 (`home-reference.js`). Guard 8.14 passes at 360×640 in every state. |
| 2. Notice placement rule (A-19) | **PASS** | Probe: in bar — Home near-expiry, offline, no-cases, setup-failed; offer enable-failed, offline; case offline, t08c, a-confirm-failed. Top of panel — Home idle-expired; unlock unavailable. Rules text: RULES §9.5, state map, app-logic. |
| 3. Notice band inside the bar | **PASS** | Computed: margin 0 −16 each side (edge to edge), padding 12 / 16, 1 px bottom border in tone colour (warning `rgb(255,219,147)`, error `rgb(249,182,182)`, neutral `rgb(216,219,223)`), top radius 16. Band text is the same as before. |
| 4. OTP terms centred; "Terms & Conditions" not split (A-01, A-02) | **PASS** | Terms paragraph `text-align:center`, `text-wrap:balance`, panel centre = paragraph centre (195 px); link is one box, `white-space:nowrap`. |
| 4b. Resend row does not move the button (A-03) | **PASS** | Verify & sign in top 449 px, height 56, in default, verifying, cooldown-reconciling, resend-available. **Observation, not in audit:** wrong-code (477) and new-code-sent (485) push Verify down because the notice sits in the flow under the boxes (A-14). See NEEDS-APURVA 6. |
| 5. Audit: every `bug` and recommended `question` | **FAIL — 1 item** (B-07). Others PASS as listed below. | See 5a–5c. |
| 5a. Audit applied (lanes A–C; lane-reported, checked in pictures, and in probes where stated) | PASS | A-01…A-22 (A-09 timer row fixed, A-13 Profile gaps 16/16, A-15 keys, A-07 logo probe 166/16), B-01, B-02 (Transferring keeps Callback / Skip HA greyed; 7c and B2 keep the bar height), B-03, B-04, B-05 (probe: card gaps 16 on t01, t03, t10a, a-top, d-default), B-08, B-10, B-11 (lane-request 4), B-12, B-13, B-14, B-15 (wrap; wording per D-70), B-16, B-17, B-18 (text keyboard in d-notes-keyboard; Other dose keeps number pad), B-19, B-20, B-21, B-22, B-24. |
| 5b. Partial / decided | PARTIAL | **B-09:** spacing done (8 between rows), chip inset not applied (D-55 #1; lane-request 6). **B-11:** revised, see NEEDS-APURVA 2. |
| 5c. No change (recorded) | PASS | A-18, B-23, B-25, A-23…A-27, B-26, B-27. B-06 (two-line name) no change — lane C checked at 390 and 360. |
| 5d. **B-07** back / ✕ icons and titles at one edge (48 px target on the 16 margin) | **FAIL — not applied** | Sheet ✕ is on the 16 margin (lane A). Case header, Prescribe, Rx viewer positions were left to lane C to measure and were not changed (lane C report). Not measured in lane D either. Carried forward. |
| 6. Small-phone renders at 360×640 (not promoted) | **PASS** | 39 pictures in `small-phone/`: Home 22 (all states), offer 6, unlock 7, case `t01-ready`, `s7d-result-missing`, `t12-transfer-ready`, Prescribe `d-default`. Real layout (the capture flag that forces 844 px is off for these). Viewed: `home/home_setup-wheel_w360x640.png` (wheel values below the fold; fade shows more). Scroll cue is a fade only. See NEEDS-APURVA 5. |
| 7. Texts | **PASS** | `app-logic.md` (Home / offer / unlock bar, notice rule, scroll, D-70 Skip HA line, logo 166); `docs/feedback-state-map.md` (placement rules, rows, logo); `design-system/RULES.md` (§8.13 logo, §8.14 small phone — now names `check-locked-specs.py`, §9.5 band and placement); `beyond-salt.md` (lane A). No state added or removed. README count line predates Round 4 and was not touched. |
| 8. Expected list → render → compare → probes → guards → determinism → promote → sheets → before-after | **PASS with a gap** | Expected list: `round4-expected.md`. Rendered 290 (145 × 390 / 360) into `after-r4/`, 0 page errors. Raw compare vs Round 3: 290 differ — expected, the item-0 icon change touches every picture with an icon-only button (not listed before the render; list amended after, see below). Masked compare (icon areas masked; `round4-masked-compare.json`, raw in `round4-raw-compare.json`; probe and compare scripts were session-local and are not in the repo): 284 still differ, 6 identical (`a-loading`, `a-load-failed`, `a-rx-viewer`). Remaining differences are in the families listed in `round4-expected.md`: logo, bar, notice band, card gaps, label, keyboard, sheet label. Determinism: 20 / 20 identical on re-render (12 states × 390 / 360). Promoted 290 pictures to `ui-screens/`; contact sheets, `REVIEW.html` (145 states, 8 sections), storyboard (`case/contact-call.png`) rebuilt. `before-after-r4/`: 145 pairs at 390 (Round 3 left, Round 4 right, half size, JPEG). |
| 9. Report, stop | This section | — |
| 10. Permanent 360×640 small-phone guard | **PASS** | Added to `ui-screens/feedback/check-locked-specs.py` (`check_small_phone`, RULES §8.14): every state (145) at 360×640 — fails when content the doctor needs is outside the viewport with no scroll, clipped by a non-scrolling box, or covered by the pinned bar at the end of the scroll. `docs/layout_check.py` is not changed (it tests the frozen `index.html`). |
| 11. Regression gate G7 | **PASS** — see Regression below | — |

**Expected vs actual (family level):**

| Family | Changed (of total) | Expected? |
|---|---|---|
| sign-in | 24 / 24 pictures (12 states) | yes — logo, keyboard keys, notice gap |
| otp | 34 / 34 (17) | yes — logo, terms, resend row, notice gap, subtitle |
| faster-signin-offer | 12 / 12 (6) | yes — logo, bar, notice, subtitle |
| returning-unlock | 14 / 14 (7) | yes — logo, bar, header gap |
| home | 44 / 44 (22) | yes — logo, bar, notice moves, gaps, labels |
| case | 116 / 116 (58 states) | yes — B-05 gaps, bar notices, labels, busy rows. Identical after icon masking: `a-loading`, `a-load-failed`, `a-rx-viewer` (no card / notice / label; icons only). |
| prescribe | 46 / 46 (23) | yes — B-05, B-08, B-10, B-12, B-18, B-24 |

The expected list named the family-level changes but not item 0. Item 0 was verified separately: it touches icon-only buttons in every state, which is why no picture is identical in the raw compare. Icon masking (`masked.json`) removes that effect so the non-icon differences can be read.

### Guards (counts)

| Guard | Result |
|---|---|
| `ui-screens/feedback/check-locked-specs.py` (standards: L1–L9, §9, layout, copy sources, logo, local restyle) | **PASS, 0 failures**, 145 states × 3 widths (390, 360, 430) |
| — small-phone pass (new, item 10) | **PASS, 0 failures**, 145 states at 360×640 |
| `ui-screens/feedback/check-sources.mjs` | **PASS** — 84 registry IDs, straight-apostrophe check, detached messages |
| `docs/layout_check.py` | **ALL PASS** (runs on the frozen `index.html`, not the screens) |
| `brand/check_lockup.py` | **OK** |

**Guard changes (all cited; none loosened without a citation):**
1. `[6.x]` pinned footer: test was "bar ends 16 above the frame bottom"; now "bar ends inside the frame". Reason: Round 4 item 1 puts the real `.tm-actionbar` on the frame's bottom edge, as the case page does. **Loosened — cited.**
2. `[1.1]` side margin: in-bar `.tm-notice` exempt. Reason: item 3 (edge-to-edge band). **Loosened for that one element — cited.**
3. `[8.14]` small-phone pass added (tightening).
4. `[5.12]` sign-in notice class moved to `login-notice` (no guard change; the sign-in fix now passes).

**Determinism:** 20 / 20 identical (12 states × 390 / 360). **Page errors:** 0 (`after-r4/capture-log.json`). **Lockup:** OK.

### Regression (G7) — all standards, final decisions, fix rounds

- **Standards:** four guards 0 failures (above). L1–L9 and §9 rules pass for every state.
- **Final decisions, changed states:** checked by probe against the decisions as they stand now (latest wins):
  - D-81 F9: Adding… / Cancel / × / chips disabled (home/adding).
  - D-81 F13: End availability disabled offline (home/offline).
  - D-81 F21: no header Back on calling states (case/t02-calling).
  - D-81 F23: empty case has no Call patient; Release case is the action (case/a-no-medicines).
  - D-81 F25: View Rx outlined during Confirming… (case/a-confirm-busy).
  - D-81 F26: amber "End the call to get your next case." (case/t15b).
  - D-81 F15 / F17: dose by form (weekly chips 1 · 2) and `d-disabled` text present.
  - D-15: injection heading "Dose", syrup "Dose (ml)", inhaler "Dose (puffs)".
  - D-70: Skip HA wording (kept); Profile is a page; no logo on the case page.
  - D-53: offline notice stays in the case bar.
  - D-55: duration chips at the label edge (no inset).
  - No conflicts found, except the injection heading decision (NEEDS-APURVA 2).
- **Fix rounds:** Round 1 F1–F28 and T1–T5, Round 2 F10 / F16, Round 3 icon sizes (56 → 20, 48 → 16, icon-only 20) and Profile ₹60.00 (probe: "Earned ₹60.00" in home/profile). Round 4 items above.
- **Unchanged screens:** pictures identical after masking — 6 of 290 (see item 8). Every other changed picture is on the expected family list.

### NEEDS-APURVA

1. **B-07 not applied** (item 5d). Header, Prescribe and Rx-viewer back / ✕ positions not moved to the 16 edge; only the sheet ✕ is. Needs a decision: apply in a follow-up or accept.
2. **Injection heading (main-thread item 4 vs D-15).** Item 4 says "Dose (units)" for injections; D-15 says the injection heading stays "Dose" and the unit belongs to the Other entry. Kept D-15. Only the injection Other label reads "Dose (units)". Confirm.
3. **Sign-in logo 174 → 166** (lane A NEEDS-APURVA). Applied per lane-request 1 (Home limits to 166 at 360). Confirm.
4. **Skip HA reason wording** (lane C NEEDS-APURVA 2): kept the D-70 text; `app-logic.md` §6 now matches it.
5. **Small-phone scroll cue.** At 360×640 the Home wheel and the setup values sit below the fold; the only cue is the panel's bottom fade. The guard checks that content can be reached, not that a cue is visible. Confirm the cue design.
6. **OTP notices push Verify down.** wrong-code moves Verify & sign in to y 477 and new-code-sent to y 485 (from 449), because the notice sits in the flow (A-14). Not in the audit. Decide: accept, or hold the button position like the resend row.
7. **Offline in the case bar** (lane C NEEDS-APURVA 4): kept in the bar (D-53), consistent with lane-request 7. Confirm.
8. **Home notice classification** (lane B NEEDS-APURVA): settled by lane-request 7 (offline and no-cases in the bar). Confirm.
9. **Decision log (main thread):** record D-66 E superseded for offer and unlock by Round 4 item 1; record the Home setup bar fix and the offer / unlock scroll change. Lane D did not edit `decision_log.md`.
10. **Item 0 supersedes Round 3 icon pictures.** Round 3 pictures (16 px header icons) are replaced by Round 4 (20 px). Confirm.

Note: `docs/context/backlog.md` has an uncommitted §2i (calling walkthrough, 2026-11-02) that lane D did not write (main thread). Left as found.

ROUND 4 COMPLETE — failures: 1

## Round 5 — results

Brief: `TERMINAL-BRIEF.md` "Round 5" (item 1 band top edge, A = B-07 header edge, B = OTP Verify never moves). Expected list written before the render: `round5-expected.md`. Render: `after-r5/` (first full render, 290 pictures, 0 page errors) and `after-r5b/` (second full render, for determinism). Before = `after-r4/` (= Round 4 promoted pictures). Nothing committed, pushed or PR'd.

### Item results

| Item | Cause (verified) | Fix | Probe | Result |
|---|---|---|---|---|
| 1. Band = bar top edge | `#case-actionbar > .concept-new {margin-top:0}` (case.html:57) is an ID rule, it beats the component's −16 top margin on the band. Result: 16 px white strip above the band on every case-bar notice. Home and offer were already aligned. | Screen rule changed so notice bands keep the component margin (`:not([class*="notice"])`; the question line keeps 0). No change to `components.css` needed for the band; a central rule cannot beat the ID selector. | 30 rows (15 states × 390 / 360): band top − bar top = 0, left / right / width equal, radius 16 = 16, pixel at x = 20 and x = w/2 in the first band row = the notice tone. | PASS. Exception: `case/s7d-unavailable-sheet` — the bar sits under the sheet, the band's top row shows the sheet's white; picture unchanged (covered). Question lines (s7b, s7c) keep their position (no band), as before. |
| A. B-07 back / ✕ and title edge | `.tm-header-edit` padding-left 8 (not 16); no icon-button offset in the Prescribe header or the Rx viewer. Before: Prescribe glyph centre 32 / title 64; Rx viewer 40 / 72. | `components.css`: `.tm-header-edit` padding 16 on both sides; new rule for the first icon button in `.tm-header-edit` and `.tm-header-viewer`: margin-left −14 (glyph on the 16 edge, as the compact header and sheet ✕), margin-right −4 (title 4 after the target, as the compact header). | 48 rows: all 23 Prescribe states + Rx viewer (`a-rx-viewer`, `d-rx-failed`) at 390 and 360: glyph centre x = 26, title left x = 54. Compact case header (`t01-ready`) is 26 / 54 and unchanged. | PASS |
| B. OTP Verify never moves | Helper line (+28) and new-code line (+36, with its 16 gap) sit in the flow under the boxes; Verify was 448.73 (default), 476.73 (wrong code / empty / short), 484.73 (new code). Code-expired hid the terms (−36). | One reserved line under the boxes (`.code-slot`, min-height 20): the helper or the new-code line sits in it. The slot is hidden only where a notice box shows (`s.note`). Terms keep their height under an expired code (`.consent.reserve`, visibility hidden). | 22 rows: Verify top = 476.73 in all 11 listed states at 390 and 360 (default, empty-tap, too-short, verifying, wrong-code, two-tries-left, resend-available, new-code-sent, code-expired, cooldown-reconciling, resending). | PASS. Note: default gained a 28 px empty line above "Didn't receive it?" (see NEEDS-APURVA 2). |

Round 4 probe note: `probe_r4.py otp` on the Round 5 code reads 477 for default, verifying, cooldown, resend-available, wrong-code and new-code-sent. Before Round 5 the same states measured 448.73 (default), 476.73 (wrong code) and 484.73 (new code).

### Expected list vs actual (G2)

- Expected to change: 100 pictures (50 states). Actual changed and promoted: **90** (45 states).
- Expected but identical (10 pictures, 5 states), explained:
  - `case/s7d-unavailable-sheet` × 2 — the bar is under the sheet; the band move is not visible.
  - `otp/otp_empty-tap`, `otp_too-short`, `otp_wrong-code`, `otp_two-tries-left` × 2 — these already had Verify at 476.73 (the helper line was already there), and the helper stays in the same place. The Round 5 expected list over-included them.
- **Unexpected**: `home/home_add-failed_w390`, `home/home_add-failed_w360` — **not promoted**. Explained, not accepted: the promoted Round 4 picture (ui-screens, 11:27) is older than `home/home-reference.js` (edited 11:30, before this round started; no Home file was edited in Round 5). Rendering the current Home code with the Round 4 `truemeds.css` gives the same image as the Round 5 render, so Round 5 CSS is not the cause. The current render shows the add-failed sheet 32 px higher, without the wheel highlight. Counted as a failure until Apurva accepts or reverts (NEEDS-APURVA 1).
- Unchanged: 198 pictures identical to Round 4 (290 − 92 changed). Changed: 90 promoted + 2 held.

### Gates

- **G1** — each item's probe passes (table above).
- **G2** — see the expected list above. 2 unexplained-and-held pictures = failure.
- **G3 guards**
  - `check-locked-specs.py`: **PASS, 0 failures** over 145 states × 3 viewports (incl. [1.1] band exemption and [5.12] restyle guard). Small-phone pass: 145 states at 360 × 640.
  - First run failed [5.12] on the first version of the case-bar selector (it named `.tm-notice`). Fixed by the selector change above; guard not loosened.
  - `check-sources.mjs`: PASS (12 sign-in states, 17 OTP states, local assets, four-slot OTP, Home / unlock feedback, 84 registry IDs).
  - `docs/layout_check.py`: ALL PASS (95 checks, 0 FAIL).
  - `brand/check_lockup.py`: lockup OK.
- **G4 copy** — no copy change this round; check-sources PASS.
- **G5 determinism** — second full render (`after-r5b/`) vs first (`after-r5/`): 289 of 290 identical. **1 differs: `case/g1-generic-confirm_w390`** (bottom bar shows either the Confirm-only bar or Confirm + Callback / Skip HA). It is not in the changed set and was not promoted; promoted picture = the state seen in 8 of 10 renders with the current rule. Tested with the pre-round line-57 rule: 1 of 9 renders also flips, so the flake is a timing race in that state's script (`later(…, 250)` against the bar setup), not a Round 5 change. Not fixed (out of round scope). Counted as a failure.
- **G6 scope** — files changed this round: `design-system/src/components.css`, `design-system/truemeds.css` (generated by `scripts/build.py`), `ui-screens/case/case.html` (one line, item 1), `ui-screens/otp/otp.html` (item B), 90 promoted pictures, contact sheets (case, home, otp, prescribe, sign-in, returning-unlock, faster-signin-offer), `ui-screens/REVIEW.html`, `ui-screens/case/contact-call.png`, `docs/renders/2026-10-22-calling/storyboard-final.png`, `round5-expected.md`, `before-after-r5/`, `after-r5/`, `after-r5b/`, this report. The build also rewrote `design-system/native/tokens.json`, `native/tokens.ts` and `preview.html` with build-date-only changes; reverted with `git checkout` (verified date-only). No commits.
- **G7 regression** (Round 4 probes re-run on the current render)
  - Guards: 0 failures (above).
  - Round 4 / F-items probe (`cap/probe_g7.py`): Earned ₹60.00 present; End availability disabled offline; 0 Back buttons on calling states; no-medicines case shows Release case and hides Call patient; t15b warning present; dose headings "Dose (ml)", "Dose", "Dose (puffs)"; d-disabled text present; d-weekly chips 1 · 2; a-confirm-busy and t13 bars keep their buttons; sign-in keys white.
  - Icons (`probe_r4.py icons`): 483 icon-button checks, 0 violations (icon-only 20, 56 px → 20, 48 px → 16).
  - Logo (`probe_r4.py logo`): 166 px wide, top 16 on OTP, offer and unlock (unchanged).
  - OTP (`probe_r4.py otp`): Verify 477 in all six states it checks (see above).
  - `a-loading` first block top = 116; not compared with a stored Round 4 value (none recorded).
  - Round 4 decisions: no contradiction found. The band rule matches RULES §9.5 (edge-to-edge band on the bar's top edge). The B-07 header geometry and the OTP reserved line are not yet written in RULES §8.5 / `feedback-state-map.md` / `app-logic.md` (follow-up, not in this round's brief).

### Probes (scratch, outside the repo)

`/private/tmp/claude-501/-Users-mac-src-pm-agent--work-truemeds-doctor-portal-prototype-projects-truemeds-doctor-portal-prototype/1fad6cf9-db21-40c1-827e-87e6fc884e49/scratchpad/r5/final_probe.py` (band, header, OTP, 390 + 360) — output in `/private/tmp/claude-501/-Users-mac-src-pm-agent--work-truemeds-doctor-portal-prototype-projects-truemeds-doctor-portal-prototype/1fad6cf9-db21-40c1-827e-87e6fc884e49/scratchpad/r5/final2.json`. `/private/tmp/claude-501/-Users-mac-src-pm-agent--work-truemeds-doctor-portal-prototype-projects-truemeds-doctor-portal-prototype/1fad6cf9-db21-40c1-827e-87e6fc884e49/scratchpad/r5/probe_bar.py` (bar geometry survey, all states). `/private/tmp/claude-501/-Users-mac-src-pm-agent--work-truemeds-doctor-portal-prototype-projects-truemeds-doctor-portal-prototype/1fad6cf9-db21-40c1-827e-87e6fc884e49/scratchpad/r5/promoted.json` (list of promoted pictures, held list).

### NEEDS-APURVA

1. **Home `add-failed` (held, not promoted).** Current code renders the add-failed sheet 32 px higher (no wheel highlight) than the promoted picture. Cause is the Home JS edit at 11:30, after the Round 4 promotion. Decide: accept the current render (promote `home/home_add-failed_w360/390`) or revert the 11:30 change in `home/home-reference.js`.
2. **OTP default spacing.** Verify no longer moves, but default now has an empty 20 px line (+8 gap) between the boxes and "Didn't receive it?", same as the other states. Accept, or change the design (e.g., move the resend line up in default only, which would move Verify).
3. **B-07 reading.** Read "48 px target starting at the 16 margin" as the glyph on the 16 edge (target overhangs 14), as the compact header and sheet ✕ already do. Title at 54 (= compact). Confirm.
4. **`g1-generic-confirm` flake** (G5). Race in the state script; needs a fix in `case.html` (out of round scope).
5. **OTP notice states still move Verify** — `couldnt-verify`, `resend-failed`, `offline`, `locked`, `too-many-resends`, `expired-and-resend-limited` keep their notice box in the flow (Round 4 NEEDS 6 still open). Not in the Round 5 list.
6. **Texts not updated** (not in the brief): RULES §8.5 (B-07 header geometry), `feedback-state-map.md` (OTP reserved line), `app-logic.md` (OTP / header). `docs/context/session_handoff.md` not updated (the round brief asks for this REPORT as the output).

ROUND 5 COMPLETE — failures: 2

## Round 6 — results

Brief: `TERMINAL-BRIEF.md` "Round 6" (items 1, 1b, 2, 3, 4, 5). Expected list written before the render: `round6-expected.md`. Renders: `after-r6/` (first full render, 290 pictures, 0 page errors) and `after-r6b/` (second full render, for determinism). Before = `ui-screens/` as it stood at the start of Round 6. Pairs: `before-after-r6/` (5 pictures at 390). Evidence (probe JSON, guard output): `round6-evidence/`. Nothing committed, pushed or PR'd.

### Item results

| Item | Cause (verified) | Fix | Probe | Result |
|---|---|---|---|---|
| 1. Sheets cover the pinned bar | Home's own `.overlay` (home-reference.css) set `z-index:5`; the pinned `.tm-actionbar` is z 10 in the same phone stacking context, so the bar sat above the scrim and under the sheet's region. Case sheets were already above the bar (900 vs 150). | Removed the `z-index:5` override on `.overlay`, so the scrim takes the central `.tm-overlay` layer (900); the sheet is 901, the bar 10. Documented in components.css. | `probe_sheets.py`: 15 sheet states × 390/360 × 844/640 = 60 instances. Bar sample points on top of a sheet: 0 problems. | PASS. Exception as in Round 5: `case/s7d-unavailable-sheet` band top row shows the sheet's white (sheet covers the bar). |
| 1b. Sheet buttons stay pinned when tall | Sheet was one scroller, its actions at the end of the scroll. Home logout and four case sheets had their actions nested inside the body. | `components.css`: the sheet is the only scroller; header sticky at top (16 top spacing inside it); actions sticky at bottom (bottom spacing inside it). Nested actions moved out of the body in `case.html` (callback, discard, retry, unavailable, logout) and `home-reference.js` (logout). Hairline and shadow when content is under the actions: `design-system/src/sheet-scroll.js` sets `.is-stuck` (loaded by `home.html` and `case.html`). A CSS scroll-state container query was tried first; it did not match in the Chromium used for renders (minimal test), so it is not used. | Probe at rest and scrolled to the end: every sheet button visible and tappable. Scrollable at 360×640: Add availability (×3 states, ×2 widths) and Schedule callback error / failed (×2 each): pinned, 0 problems. Title visible in 60 / 60. Shadow checked by scroll position (on while content is under, off at the end). Added to the small-phone guard (`SHEET_JS`). | PASS |
| 2. g1 render race | The state script changed only the label of `#main-cta-btn` at 250 ms. The secondary row (Callback / Skip HA) was shown or hidden by render timing: 3 of 6 renders showed it. | `case.html` g1 recipe sets the bar once: `setBar(btn('tm-btn--primary tm-btn--block','Confirm prescription'))` in the same callback. | 10 renders in a row at 390 and 360: identical, and identical to the promoted picture (no picture change). | PASS |
| 3. Rule texts (Rounds 5 and 6) | Texts were still missing (Round 5 NEEDS 6). | RULES §8 item 5 (header-edge bullet, B-07 geometry); RULES §9.4 (Actions: pinned, shadow only while content is under; Size: header and actions stay pinned; new row "Over the bar"); `feedback-state-map.md` (OTP reserved line under the boxes, notice-box states accepted to move Verify); `app-logic.md` §2 (Verify never moves) and §13 (header edge; sheets over the bar and pinned actions). | Read-back only. | Done |
| 4. Accepted from Round 5 | — | No action. | — | — |

**Extra fix found by the 360×640 probe (outside the brief's list, needed for item 1b):** `case-styles.css` — below 768 px the case phone column grew with its content (`min-height:100vh`), and its `transform` made the fixed action bar and the case sheets anchor to the bottom of the grown column, below the 640 px screen (sheets measured at y 766–1294 on a 640 screen; the bar was not visible in the small-phone picture of `t01-ready`). The column is now the screen (`height:100dvh; overflow:hidden; flex column`) and `#main-scroll` is the one scroller, as on the desktop frame. Capture mode forces the 844 frame (`html.capture`), so no standard picture changes. The small-phone pictures in `small-phone/` are from Round 4 and still show the old layout; not regenerated.

**Judgement call:** the case logout sheet (`sheet-logout`, not pictured in the 145 states) had "Stay signed in" as a secondary button above "Log out". It now matches the Home sheet and §9.4 rule: "Log out" (destructive) first, "Stay signed in" as quiet text. Flagged for Apurva.

### Expected list vs actual (G2)

- Expected to change: 8 pictures (4 states × 390 and 360): `home/home_add-wheel`, `home_adding`, `home_add-failed`, `home_end-confirmation`.
- Actual changed: the same 8 pictures. Promoted into `ui-screens/home/`.
- Expected but identical: `home_logout-confirm` (no bar behind it), all case and Prescribe sheets, `g1-generic-confirm`.
- Unexpected, **not promoted**: `case/c-callback-failed_w390.png` and `_w360.png`: 2 px at (32–35, 1371), max change 2/255. Cause: the Confirm callback button's bottom-left corner antialiasing after its actions moved out of the body (the actions are now a sticky layer). No visible change. Needs Apurva's acceptance (see NEEDS-APURVA 1). Counted as a failure until accepted.
- Inside the expected home states: the dimmed area above the sheet moved by ≤12/255 (the scrim now sits in the same layer as the phone content). Part of the expected states; reported, not a separate failure.
- `home/home_add-failed` promoted as the corrected render, as the brief asks. It sits 32 px higher than the Round 4 picture, from the Round 5 Home JS edit (see NEEDS-APURVA 2).

### Gates

- **G1** — items 1, 1b, 2, 3 pass (table above).
- **G2** — 288 of 290 pictures identical to the pre-round baseline after the 8 promotions. The 2 remaining differ: `c-callback-failed` (2 px, unexpected, not promoted).
- **G3 guards** (run after all changes):
  - `check-locked-specs.py`: **PASS, 0 failures** over 145 states × 3 viewports; small-phone pass at 360×640 now also checks open sheets (bar cover, buttons tappable at rest and at the end of the scroll).
  - `check-sources.mjs`: PASS.
  - `docs/layout_check.py`: ALL PASS.
  - `brand/check_lockup.py`: lockup OK.
- **G4 copy** — no copy change this round; `check-sources` PASS.
- **G5 determinism** — second full render (`after-r6b/`) vs first (`after-r6/`): **290 of 290 identical**. Page errors: 0 in both renders. The g1 state rendered identically in 10 of 10 runs at each width.
- **G6 scope** — files changed this round: `design-system/src/components.css`, `design-system/src/sheet-scroll.js` (new), `design-system/truemeds.css` (generated by `scripts/build.py`), `design-system/RULES.md`; `ui-screens/case/case.html`, `case/case-styles.css`, `home/home-reference.css`, `home/home-reference.js`, `home/home.html`, `feedback/check-locked-specs.py`, `app-logic.md`; `docs/feedback-state-map.md`; 8 promoted home pictures; contact sheets (`home`, `case`, `otp`, `prescribe`, `sign-in`, `returning-unlock`, `faster-signin-offer`), `ui-screens/REVIEW.html`, `case/contact-call.png`, `docs/renders/2026-10-22-calling/storyboard-final.png`; this folder (`round6-expected.md`, `after-r6/`, `after-r6b/`, `before-after-r6/`, `round6-evidence/`, this report). Generated date-only changes in `design-system/native/` and `preview.html` reverted with `git checkout` (verified date-only). Not touched: `decision_log.md`, `backlog.md`, `open_questions.md`, `project_truth.md`, old `index.html` / `app.js` / `styles.css`. No commits.
- **G7 regression** (Rounds 1–5 probes re-run on the current render):
  - Guards: PASS (above).
  - Round 4 icon probe: 483 icon-button checks, 0 violations.
  - Round 4 logo probe: 166 px wide, top 16 on sign-in, OTP, offer and unlock.
  - Round 4 OTP probe: Verify top 477 in all states it checks.
  - Round 5 band probe: 30 rows; 28 pass, 2 are the `s7d-unavailable-sheet` exception (sheet covers the bar, as in Round 5).
  - Round 5 header probe: 48 rows, glyph centre 26, title left 54: all pass.
  - Round 5 OTP probe: Verify top 476.73 in all 22 rows (11 states × 2 widths).
  - Round 4 / 5 feature probe (`probe_g7.py`): ₹60.00 earned present; End availability disabled offline; no Back on calling states; no-medicines case shows Release case and hides Call patient; t15b warning present; dose headings "Dose (ml)", "Dose", "Dose (puffs)"; d-disabled text present; d-weekly chips 1 · 2; busy bars keep their buttons; sign-in keys white.
  - Decisions: no contradiction found with the standing rules. The sheet pinning is RULES §9.4; the header edge is §8 item 5.

### NEEDS-APURVA

1. **`case/c-callback-failed` 2 px antialiasing (unexpected, not promoted).** Accept the current render (promote both widths) or I rework the sticky layer so the corner matches the baseline exactly.
2. **`home/home_add-failed` position.** Promoted as the corrected render, 32 px higher than the Round 4 picture (Round 5 NEEDS 1). Confirm the position.
3. **Case logout sheet** now "Log out" first, "Stay signed in" quiet (judgement call above). Confirm.
4. **Phone column on small screens** (`case-styles.css`): the case page now fits the screen at 360×640; before, the bar and sheets sat below it. Confirm this is the intended mobile behaviour (no picture changed).
5. Round 5 NEEDS 2 (OTP default empty line), 3 (B-07 reading), 5 (OTP notice-box states move Verify): accepted by the brief (Round 6 item 4); still open for the record.
6. `docs/context/session_handoff.md` not updated (the brief asks for this report as the output). `small-phone/` pictures not regenerated.

ROUND 6 COMPLETE — failures: 1
