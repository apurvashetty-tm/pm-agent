# Run r2-build: report (2026-11-11)

**Scope:** release checklist 2 rows P, R, U, T, K, D, F1 (D-106 Home v3, D-107 one band, D-108 visible-gap spacing, D-109 copy / sheet subtitle / unlock prompt), within RULINGS 2026-11-11 10:32 (only the affected screens; the shared sheet subtitle re-rendered on the case page; the checker report-only elsewhere) and 11:32 (trim, don't excuse; unlock tile → caption 8).
**Gate:** STATUS ended `DONE r1-rules`; the checker's unit tests passed 10 / 10 before the run started.
**Not done:** no deploy, no Confluence push, no merge. Session handoff left to the main thread, as in earlier runs.

## At a glance
- **Tests first:** Codex wrote `tests/codex/r2/r2.test.mjs` (24 checks, T2–T4) and edited the superseded old tests (`tests/codex/r2/CASES.md`). **24 / 24 pass**; the restart added R2-K3–K5 (message with the keyboard open): **27 / 27**.
- **Every in-scope state passes the visible-gap checker** at 390 × 844 and 360 × 640: **126 / 126** (`visible-gaps/summary.md`).
- **The approved reference pages now render the app's pixels:** they draw the app's DOM with the app's own CSS. App vs reference: **130 / 130 identical** (`logs/ref-diff.log`).
- **Pictures re-rendered:** 65 states × 2 in real-size frames (360 × 640), plus 4 case-page subtitle sheets × 2 at their own sizes. Compare: step 1 **86 / 86 exact**; steps 2–4 **132, 0 over 1 %**, and every case / Prescribe picture other than the 4 sheets is unchanged from the last run.
- **For Apurva:** `all-screens.png` (F1, every in-scope state at 390, flow order) and `before-after/` (committed | new, per screen, 390 and 360).

## Rows

**Restart (RULINGS 2026-11-11 13:45).** The first session finished the build but lost Wi-Fi before this table and the commits. The restart kept every change and did only: (1) the verify-moves fix: `app/shell/keyboard.js` now also watches the focused field's blocks and scroll areas with a ResizeObserver, so the keyboard step runs again when a message shows or goes while the keyboard is open. New tests R2-K3 (OTP wrong code, 360 × 640: **failed before the fix**, Verify ended 4.5 px under the keyboard; passes after), R2-K4 (sign-in error with the keyboard open) and R2-K5 ("Couldn't send the OTP.": the app closes the keyboard on that answer, so the test taps the field again and checks Send OTP is 16 clear; reading 14). app-logic §2 has one line on it. (2) Every check once more (`tools/final-checks.sh`, all 29 exit 0, `logs/final-checks.txt`). (3) This table, two commits.

**Final checks (restart, all exit 0):** token guard · checker unit 10 / 10 · r2 tests **27 / 27** · entry journeys 61 / 61 · run-checks 95 / 95 · wheel-keyboard 15 / 15 · signin-d101 10 / 10 · f03 Profile back 3 / 3 · build-fast A1 15 / 15, A2 26 / 26, B 23 / 23 · run-A 303 / 303 · run-B 99 / 99 · A0 happy path · check-sources · state map 0 drift · lockup · locked specs 0 failures (149 states × 3 sizes) · visible gaps 126 / 126 · reference vs app 130 / 130 identical · compare step 1 86 / 86 exact, steps 2–4 132 / 0 over 1 % · kit build + `--check` up to date · kit tests 38 / 38 · PRD 17 / 17 · layout `--app` and reference ALL PASS. Logs: `logs/<name>.log`.

| Row | | Evidence |
|---|---|---|
| P1 Band | ✅ | `app/screens/band.js` + `band.css` used by all five screens; R2-B1; visible gaps 126 / 126 |
| P2 Sign-in | ✅ | `app/screens/sign-in.*`; R2-S1–S4, R2-K1, R2-K4, R2-K5; signin-d101 10 / 10; `before-after/before-after-sign-in-*.png` |
| P3 OTP | ✅ | `app/screens/otp.*`; R2-O1–O3, R2-K2, **R2-K3** (restart fix); entry journeys 61 / 61; reading 1; `before-after-otp-*.png` |
| P4 Offer | ✅ | `app/screens/faster-signin-offer.*`; R2-B1; `before-after-offer-*.png` |
| P5 Unlock | ✅ (tile → caption **8**, per RULINGS 11:32, not the checklist's 16; reading 13) | `app/screens/returning-unlock.*`; R2-U1–U4; `before-after-unlock-*.png` |
| P6 Home setup | ✅ | `app/screens/home.*`; R2-H1, H2, H8; `before-after-home-setup-*.png` |
| P7 Home available | ✅ | R2-H3, H4, H7, H9; build-fast A1/A2/B; `before-after-home-available-*.png` |
| P8 Add-time sheet | ✅ | R2-H5, H6; wheel-keyboard 15 / 15; readings 2–4 |
| P9 End / log-out sheets | ✅ | R2-H10 (subtitle in header, 8); `app/screens/parts.js` sheet heading; `before-after-case-sheets-*.png` |
| P10 Review state names | ✅ | `app/review/state-names.js`, `labels.js`; check-sources pass |
| R1 app-logic | ✅ | `ui-screens/app-logic.md` §1–3 (+ restart line in §2) |
| R2 feedback-state-map → state maps | ✅ | `docs/feedback-state-map.md`, `app/state-map.js`, `docs/state-map.md`; state map 0 drift |
| R3 messages registry | ✅ | `ui-screens/feedback/messages.json`, `metadata.json`, `visible-strings.json` → generated `messages.js` ×2, `messages.ts`; check-sources (956 strings) |
| R4 backlog §2n | ✅ | `docs/context/backlog.md` §2n: Home redesign and 10-hour cap ticked; 7 AM–11 PM left open |
| U1 Reference HTML | ✅ | `ui-screens/sign-in/`, `otp/`, `faster-signin-offer/`, `returning-unlock/`, `home/`; reference vs app 130 / 130 identical (`logs/ref-diff.log`) |
| U2 Re-render | ✅ | 65 states × 2 (360 in a 640 frame, 390) + 4 case sheets × 2; `before-after/` (14 sheets) |
| U3 README / review sheets | ✅ | `ui-screens/README.md` counts; contact sheets + `REVIEW.html` rebuilt |
| U4 Old native / old prototype | ✅ left alone | no change to `ui-screens/native/`, `index.html`, `app.js` |
| T1 Visible gaps | ✅ | 126 / 126 at 360 × 640 and 390 × 844 (`visible-gaps/summary.md`); other screens report only (below) |
| T2 Entry journeys | ✅ | R2-U1–U4, R2-S*, R2-O*; entry journeys 61 / 61 |
| T3 Home | ✅ | R2-H1–H10; build-fast A1/A2/B; run-A 303 / 303 |
| T4 Keyboard at 360 | ✅ | R2-K1–K5 (K3–K5 added at the restart) |
| T5 Guards | ✅ | run-checks 95 / 95, check-sources, layout `--app`, locked specs (L6 = 16), token guard, state map, PRD 17 / 17 |
| T6 Picture compare | ✅ | step 1 86 / 86 exact; steps 2–4 132, 0 over 1 % (`compare/`) |
| T7 Codex | ✅ | tests first (`codex-tests.log`), one review 0 blockers / 3 should-fix, all fixed (`codex-review.log`, below) |
| K1 Kit regenerate | ✅ | `node scripts/build-handoff.mjs` (7 screens, 149 states, 0 raw values), `--check` up to date, kit tests 38 / 38 |
| K2 Kit notes | ✅ | `handoff/DECIDED.md` (D-107 band, D-108 spacing), `handoff/screens/otp.json` (SMS auto-fill), `handoff/screens/returning-unlock.json` (auto-prompt) |
| D1 PRD | ✅ | `docs/prd/PRD.md` §5.2–5.5 + `PRD.confluence.md`; check-prd 17 / 17; no Confluence push |
| F1 Side-by-side sheet | ✅ | `all-screens.png` |
| F2 Phone check | ⏳ Apurva | Needs Apurva 2 |
| F3 / F4 | ⏳ main thread | not part of this run |

## Visible-gap check (T1)
- **Checker:** the shared `design-system/scripts/check-visible-gaps.mjs`, run on the **built app** in capture mode by `tools/visible-gaps.mjs` (every sign-in, OTP, offer, unlock and Home state plus their sheets; the two Profile pages are out of scope; the log-out sheet is in).
- **Result: 126 / 126 captures pass, 0 failing gaps.** JSON: `visible-gaps/visible-gaps.json`; table: `visible-gaps/summary.md`.
- **How the screens meet D-108:** text blocks below the band are trimmed to their ink with `text-box: trim-both cap text` (Chrome 157 supports it), so a box gap is the visible gap (measured: cap top = box top; descender 0.4–1.0 above the box bottom, inside ±2). This is RULINGS 11:32 "trim, don't excuse", with `text` instead of `alphabetic` at the bottom, because the checker measures to the descender, not the baseline. No gap is ruled anatomy.
- **Measurement adapters in the runner (not in the shared checker), each with a reason:**
  1. Scroll areas are set back to the top before measuring (a drawn keyboard scrolls OTP / sign-in up, F-05); the wheel columns keep their position, since it is the value shown.
  2. The wheel columns are marked overflow hidden while measuring: they show three rows and clip the rest, but the checker reads scroll areas as unclipped.
  3. A sheet's pinned actions are their own region, so content scrolled under them at 360 × 640 doesn't count as overlap.
  4. The toast floats over the bar (a layer, not part of its flow), so it is ignored.
  5. Project roles: `.consent` legal, `.rs` link line, `.hero-ic` / `.prompt-icon` tile, `#ready` caption, `.lbl` group label, `.pt-t` / `.pt-d` points, `.s1` message line; rule: column heads → wheel 4 (box, component anatomy D-40).

### Next round (not fixed) — other screens, report only (RULINGS 10:32)
`tools/visible-gaps.mjs` with `CONFIG=other` over the case page, Prescribe and calling states (`visible-gaps-other/`, 168 captures).
- **Most of the 254 failing gaps are measurement artefacts, not spacing:** the sticky compact case header overlaps the scrolled content, and Prescribe is drawn over the case page, so the checker reports "overlap". r3 (rest audit) needs per-screen regions (the case scroll area, Prescribe's own root, the sticky header as its own region) before its numbers mean anything.
- **Real candidates (18 gaps):**
  - Callback sheet: "Today | Tomorrow" chips → "Time" label **21.6** (not on the scale; 8 × 4 states × 2 widths).
  - Callback sheet errors: time chips → field error 13.6 (16); time chips → "Couldn't schedule the callback…" 24 (32) on `c-callback-failed`, `c-callback-refused`.
  - 7b bar: "Are you still on the call?" → Still talking / Call ended **30.7** (bar caption → button 8 or notice → button 16?).
  - g2 bar: spinner + "Checking for a Health Advisor…" → Skip HA **26.5** (8).

## Codex
1. **Tests first** (`codex-tests-prompt.txt` → `codex-tests.log`, workspace-write, exit 0): 24 checks in `tests/codex/r2/r2.test.mjs`, sources in `CASES.md`; superseded old tests edited and listed there (entry journeys F3/F6/F7/F8 now cancel or observe the automatic unlock prompt; wheel W5; run-A Rx label).
   - **4 of 24 failed on the first build run, all adapter / selector items, fixed in the build, none disputed:** S3 (the sign-up line's 32 lead-in sat in its own padding → moved to a wrapper), B1 (sign-in panel lacked the shared `.panel` class), H3 (`.band` / `.sub` aliases from the locator contract), K2 (Verify landed 0.1 px short of 16 clear → the keyboard reveal now scrolls whole pixels).
2. **One review** (`codex-review-prompt.txt` → `codex-review.log`, read-only, exit 0): **0 blockers, 3 should-fix.** It could not run the browser tests (sandbox), so it read the code and the saved evidence.

| Codex point | Ruling | What changed |
|---|---|---|
| S1: unlock tile → caption is 16; D-108 (corrected) and RULINGS 11:32 say 8; the shared checker's default also says 16 | **Agree** (the 11:32 ruling arrived during the run) | App `.prompt` gap 8; app-logic §2; `design-system/RULES.md` "Entry and home screens" hero-tile row; the shared checker rule `@tile → @caption` 8. Unlock pictures re-rendered. |
| S2: the band's 16 top padding ignores the safe area (`viewport-fit=cover`) | **Agree** | `band.css`: `calc(16 + env(safe-area-inset-top))` (0 in pictures, so no pixel change). |
| S3: the kit still documents the removed 31ch subtitle cap (exception list and OPEN o19) | **Agree** | Exception list emptied; o19 wording no longer names it. Kit regenerated. |

No second review: no blocker was left (D-100).

## Unattended readings (for the main thread to check)
1. **Reserved message lines (D-108 vs Round 5 B "Verify never moves").** D-108 says reserved lines add no visible space, so the OTP message line now takes no room when empty: a one-line message (wrong code, "New code sent.") moves the resend line, legal line and Verify down by one line. An expired code hides the legal line without keeping its height. app-logic §2 and the state map say so.
2. **Add time "always shown":** greyed offline (D-106) and also greyed when less than 15 min fits under the 10-hour total `[MOCK ASSUMPTION]`. On "Availability ended" (ran out with a request open) the time row shows 0:00 (D-53) without Add time, since the window has ended.
3. **10 hours in total** = time remaining + time added ≤ 10 h; the add wheel tops out at that, rounded down to 15 min (near-expiry 5:00 → 9 h 45 min, the D-106 example). Setting `availabilityMaximum` (Rule). Presets above the limit are greyed.
4. **"Add 1 h"** for whole hours (D-106 gives "Add 9 h 45 min" and "hours and minutes from 60 min up"; whole hours drop "0 min").
5. **Unlock auto-prompt** fires only on a live arrival (the app opening on unlock), once per arrival; re-renders, Back from sign-in, `?s=` jumps and pictures never prompt. The automatic prompt counts as a failed try when it fails (3 → sign-in, prefilled).
6. **The ended count row** is one card row (the same anatomy as on the available card), 32 above the picker.
7. **Real-size frames:** only the in-scope screens' 360 pictures are 360 × 640; the case page and Prescribe keep 360 × 844 (unchanged pictures). `tests/compare-step1.mjs` picks the frame height per screen.
8. **Drawn keyboard in pictures** behaves like the phone's (F-05): at 360 × 640, sign-in and OTP pictures with the keyboard are scrolled so the main button sits 16 above it.
9. **`sheet-scroll.js` was never loaded by the app**, so the pinned sheet actions' hairline (RULES §9.4) didn't show when content scrolled under them (Add time at 360 × 640). Now loaded in `app/index.html`. No case / calling picture changed (steps 2–6 compare).
10. **Shared sheet template:** a sheet whose only text is the subtitle has no body any more (header → actions 24, the actions' own margin).
11. **Reference pages** link `app/screens/band.css` and the screen's CSS and draw the app's DOM, so they can't drift (U1). Their old hooks are kept where checks read them (`#doctor-login-preview`, `.login-content`, `.kbd`, `.phone`).
12. **Kit:** the Sign-in kit claims the band elements; `band.js` is scanned for message keys (the logo's accessible name moved there); CSS `text-box` shows as "text trim (to the ink)" (the viewer test bans the word "box"); the sign-in drawn-keyboard padding moved into `app/shell/mock-keyboard.css` (prototype-only file, like the drawing).
13. **Checklist P5 still says "tile → 16 → caption"** (the proposal file is the main thread's); built as 8 per the 11:32 ruling.
14. **"Couldn't send the OTP." with the keyboard (restart):** the app closes the keyboard when that answer arrives (unchanged), so there is no open keyboard to clear at that moment. R2-K5 checks the next moment instead: the doctor taps the field again with the notice showing, and Send OTP is 16 clear. The case the ruling worried about (a message appearing while the keyboard stays open) is R2-K3 (OTP) and R2-K4 (sign-in error).

## Test and check edits (superseded behaviour, not disputes)
- Codex: `tests/codex/r2/CASES.md` → "Superseded test edits".
- Mine: `tests/entry-journeys.mjs` B4 / B5 / F-band selectors (`.head b` → `.entry-band__sub b`) and B5 "terms keep their height" → hidden with no height (D-108); `tests/build-fast-a1/a2/b.mjs` Rx count selector, "+ Add time" → "Add time"; `tests/codex/run-A/journeys.mjs` A-H05 label; `tests/codex/handoff/handoff.test.mjs` fixture model (new notice ids, the app's keyboard keys, frame line); `ui-screens/feedback/check-locked-specs.py` (a `.tm-link`'s 48 hit area counts as its tap target; "OTPs" is an acronym, not Title Case); `ui-screens/feedback/check-sources.mjs` (Home reference fixture table); `tests/compare-step1.mjs` (360 × 640 frames); `scripts/build-handoff.mjs` RULES §8.3 regex (renamed by r1).

## Needs Apurva
1. **Approve the new pictures:** `all-screens.png`, `before-after/` (sign-in, OTP, offer, unlock, Home setup, Home available, case sheets; 390 and 360).
2. **Phone check (F2):** band, sign-in / OTP spacing (incl. the OTP lines moving by one line when a message shows, reading 1), the unlock prompt on arrival, Home setup + available, the wheel to 10 h, Add time and its cap, the keyboard.
3. **Add time greyed when less than 15 minutes fits** (reading 2), and no Add time on "Availability ended".

## Needs the main thread
1. **Shared PR:** `design-system/RULES.md` (unlock tile → caption 8) and `scripts/check-visible-gaps.mjs` (`@tile → @caption` 8) are in their own commit.
2. **`text-box` in the design system:** the in-scope screens trim text to the ink per screen CSS. A shared text-style trim (or tokens for it) would let r3 and native builds do the same.
3. **r3:** use the "Next round" list above and give the checker per-screen regions on the case page and Prescribe first.
4. Checklist P5 wording (reading 13).

## Files
- **design-system (commit 1):** `RULES.md`, `scripts/check-visible-gaps.mjs`.
- **Project (commit 2):** `app/` (band.js / band.css new; sign-in, OTP, offer, unlock, Home, parts, settings, labels, state names, index.html, keyboard.js, mock-keyboard.css, state-map.js), `ui-screens/` (5 reference pages + Home reference, case.html sheets, copy registry + generated files, app-logic, README, contact sheets, REVIEW.html, 140 pictures), `docs/` (feedback-state-map, state-map, PRD + Confluence copy, backlog §2n), `scripts/` (kit generators + manifest), `handoff/` (regenerated), `tests/` (r2 tests, edits above), this folder (REPORT, prompts, Codex logs, tools, logs, compare results, visible-gap JSON, all-screens.png, before-after/), `docs/runs/STATUS.md`.
