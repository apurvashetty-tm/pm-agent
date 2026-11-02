# Fix round — D-80 + D-81 on the frozen screens · checklist

**Done means:** every row in §1 passes, every gate in §2 passes, nothing in §3 is touched. Then an independent QA check, then Apurva approves → screens frozen again (D-78 updated).
**Scope:** only the fixes agreed in D-80 and D-81 (backlog §2f, §2g). Source of truth for each fix: the decision entry.
**Where:** `pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype` (branch `project/truemeds-doctor-portal-prototype`). Pictures at 390 and 360, fixed clock date, animations frozen — same capture settings as the promotion round.

---

## 1. Fixes — what "fixed" looks like

### Copy (`ui-screens/feedback/messages.json`, then `build-messages.mjs`)
| # | Fix | Pass when | Pictures |
|---|---|---|---|
| F1 | OTP wrong code → "Wrong code." · "Wrong code. {count} tries left." · new singular key "Wrong code. 1 try left." | Picture shows "Wrong code. 2 tries left."; the app uses the singular key at 1 | `otp_wrong-code`, `otp_two-tries-left` |
| F2 | Singular "Prescribe or disable 1 medicine first." (new key; plural kept for {n} ≥ 2) | Key exists; reference uses it at 1 | none (8c shows the plural) |
| F3 | Every apostrophe in `messages.json` is curly ’ | `check-sources` fails on a straight ' (new check) and passes | every picture showing one of the 14 keys listed in the brief — **list them before rendering** |
| F4 | 15 and B3 use one wording: `call.transferFailed`; `call.noHaFree` removed | B3 card text = 15 card text | `g3b-forwarded` |

### Entry (`sign-in/`, `otp/`, `faster-signin-offer/`, `returning-unlock/`)
| # | Fix | Pass when | Pictures |
|---|---|---|---|
| F5 | Terms line stays during **Verifying…** and **Checking…** | Verify & sign in sits at the same y in `otp_default`, `otp_verifying`, `otp_cooldown-reconciling` (±1 px) | `otp_verifying`, `otp_cooldown-reconciling` |
| F6 | Sign-in on a locked number → OTP in the locked state | Written in app-logic §2 + state map; no new picture | — |
| F7 | Cooldown line reads "Checking…" alone (no "Didn't receive it?"); boxes stay focused | As stated | `otp_cooldown-reconciling` |
| F8 | One header spacing for OTP, offer and unlock; fingerprint tile in the same place | Logo→title gap equal on the three screens; tile top equal on `offer_fingerprint` and `unlock_fingerprint` (±1 px) | `unlock_*` (and `offer_*` only if needed) |

### Home (`home/`)
| # | Fix | Pass when | Pictures |
|---|---|---|---|
| F9 | While Adding… / Setting…, Cancel, ×, chips and wheel are disabled | They render in the disabled style | `home_adding`, `home_setting` |
| F10 | Mock values match: 5:00 + 30 min = 35:00; Profile earnings match prescriptions today | As stated | `home_added`, `home_profile`, `home_profile-case-open`, `home_logout-confirm` |
| F11 | "Stay signed in" is quiet text (like "Keep available") | As stated | `home_logout-confirm` |
| F12 | Set availability pinned to the bottom in every state | Same y with and without a notice (±1 px) | setup states incl. `home_setup-wheel`, `home_setup-failed`, `home_idle-expired`, `home_manually-ended`, `home_setting` |
| F13 | End availability greyed out offline | As stated | `home_offline` |

### Prescribe (`d-*`, source in `case/case.html`)
| # | Fix | Pass when | Pictures |
|---|---|---|---|
| F14 | SOS limit prints the daily total in the medicine's unit: "2 puffs as needed (max 8 puffs/day)"; tablets "(max 2 tablets/day)"; cream "Apply as needed (max 3 times/day)"; singular when the total is 1 | Every SOS band shows the total with its unit | `d-inhaler`, `d-sos-only`, `d-sos-on` (+ any other with SOS) |
| F15 | Dose by form: tablets ½ · 1 · 2, capsules 1 · 2 | Capsule shows no ½ | `d-weekly` |
| F16 | Error on Prescribe → page scrolls to the first error; error text under its field; the 0-0-0 error is field text under the M/A/N grid (no tinted box) | Reference scrolls; picture shows field-text error | `d-error-dose` |
| F17 | New state `d-disabled`: "Disabled: {reason}. Prescribing it will enable it again." (new key) | New picture at 390 + 360; in README, state map, guards | new `d-disabled` |
| F18 | Duration picker: number and unit chips share one inner edge | Left edges equal (±1 px) | `d-duration-picker` |
| F19 | "Additional instructions (optional)" + helper "Printed on the prescription." | As stated | every picture where the field shows (incl. `d-scrolled`, `d-notes-keyboard`) |
| F20 | **Keyboard rule:** typing field scrolls into view above the keyboard with label + helper; the pinned action bar hides while the keyboard is open | `d-notes-keyboard` draws the keyboard (same style as OTP), field visible, no Prescribe bar; `d-food-selected` shows the Food chips | `d-notes-keyboard`, `d-food-selected`, `a-notes-typing` |

### Case and calling (`case/case.html`)
| # | Fix | Pass when | Pictures |
|---|---|---|---|
| F21 | **Back only where a call button shows** (Ready 1, 3, 4). Hidden from the tap on Call patient / Call again, every case type, incl. 7a, 7b, 11 and behind the callback sheets | No header Back on any calling state; leave sheet only over Ready | `t02-calling`, `s7a-calling`, `s7b-still-on-call`, `t11-calling-transfer`, `c-callback`, `c-callback-error`, `c-callback-failed` |
| F22 | Leave sheet, Releasing… and Release failed sit over **Ready** (not Calling) | Behind the sheet = `t01-ready`; release failed returns to Ready | `s7e-leave-sheet`, `a-releasing`, `a-release-failed` |
| F23 | Empty case: no Call patient; message "There's nothing to prescribe on this order. Release it — Ops will check it."; **Release case** is the main button and releases directly (Releasing…), header Back does the same | As stated | `a-no-medicines` |
| F24 | During Confirming… / Transferring… medicine rows and notes are read-only and muted, no arrows | As stated | `a-confirm-busy`, `t13-connecting-ha` |
| F25 | View Rx stays the outlined button during Confirming… (D-76) | As stated | `a-confirm-busy` |
| F26 | "End the call to get your next case." is an amber warning | As stated | `t15b-end-call-first` |
| F27 | One icon size for secondary bar buttons (Callback, Skip HA, Unavailable), set centrally in `design-system/src/components.css` | Same size in every bar | every bar with those buttons — **list before rendering** |
| F28 | Loading skeleton shaped like the loaded page (Order details row, Medicines, Notes) | First block top = first card top on `t01-ready` (±2 px) | `a-loading` |

### Text to update (no pictures)
| # | File | Change |
|---|---|---|
| T1 | `ui-screens/app-logic.md` | §2 wrong-code copy + locked number on sign-in (F1, F6); §4/§5 Back rule, 7e trigger "Back on 1, 3, 4", state rows 2 / 7b / 11 without Back, backend release guard (F21, F22); §4/§8 empty case (F23); §8 printed line + SOS total, dose by form, `d-disabled`, scroll-to-error (F14–F17); §8/§9 keyboard rule (F20); §6/§9 busy read-only + View Rx (F24, F25) |
| T2 | `docs/feedback-state-map.md` | Matching rows: case.back-before-call / releasing / release-failed, case.no-medicines, signin locked, otp cooldown, prescribe disabled, keyboard |
| T3 | `design-system/RULES.md` | §9: one icon size for secondary bar buttons; keyboard rule; "stay" option quiet text (confirm wording) |
| T4 | `ui-screens/README.md` | `d-disabled` listed; counts updated |
| T5 | Contact sheets, `ui-screens/REVIEW.html`, calling storyboard | Rebuilt with the `_qa/` scripts |

---

## 2. Gates

| # | Gate | Pass when |
|---|---|---|
| G1 | Every fix F1–F28 and T1–T5 | Its "pass when" holds, checked at full size at 390 **and** 360 |
| G2 | Pixel comparison against the pictures before this round | Only pictures on the **expected list** differ (expected list written before rendering, from §1 + the derived lists for F3 and F27); every other picture identical. Any unexpected difference = failure until explained and accepted by Apurva |
| G3 | Four guards: `check-locked-specs.py`, `check-sources.mjs`, `docs/layout_check.py`, `brand/check_lockup.py` | 0 failures; guards cover the new state; report how many states each guard checks |
| G4 | Copy | No straight apostrophe in `messages.json`; singular keys present and used; `messages.js` and native copy regenerated |
| G5 | Determinism | A second render is identical to the first; 0 page errors |
| G7 | Regression — every round, against everything agreed (added 2026-11-02) | Four guards 0 failures over every state (RULES L1–L9, §9, layout, copy, logo); every changed state checked against its decisions as they stand now (latest wins; replaced, superseded or reverted ones don't count; per README), app-logic, feedback rules and state map; all earlier fix-round items still pass; unchanged screens pixel-identical. Conflict → the standing rule wins, change left out, listed for Apurva |
| G6 | Out of scope untouched (§3) | `git diff --stat` shows only files named in §1 / the brief |

## 3. Out of scope — do not touch
Part C items (E-03 to E-15, H-02/04/07/10, P-03/07/09/11/12, C-04 to C-08, C-14 to C-17, C-19) · Apurva's calling walkthrough misses · `decision_log.md`, `backlog.md`, `open_questions.md`, `project_truth.md` · old `index.html` / `app.js` / `styles.css` · any commit, push or PR.

## 4. Review loop
1. Terminal applies the round → writes `REPORT.md` (fix-by-fix pass/fail, expected list vs actual diff, guards, determinism) → stops.
2. Main Claude thread checks the report and the changed pictures at full size against §1 (independent of the terminal) → writes the next round into `TERMINAL-BRIEF.md` for anything that fails.
3. Repeat until every row and gate passes with 0 failures.
4. Apurva reviews the before/after sheet → approves → Claude records the freeze, commits and opens the PR.
