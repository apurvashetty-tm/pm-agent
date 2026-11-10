# Run d105 — report (unattended, 2026-11-10)

D-105 (returning unlock: two buttons; Use OTP instead opens Sign-in with the number filled in), plus the D-104 / wheel leftovers. Not deployed; nothing sent to Confluence.

## Checklist (`docs/proposals/2026-11-10-release-checklist.md`)

| # | Touchpoint | Status |
|---|---|---|
| C1 | Decision log D-105 | ✅ already recorded before the run (not touched) |
| C2 | `app-logic.md` §2 unlock line | ✅ two buttons; Use OTP and the 3-failure fallback → Sign-in prefilled, no SMS until Send OTP; normal Sign-in rules, no special back |
| C3 | `feedback-state-map.md` + generated `app/state-map.js`, `docs/state-map.md` | ✅ unlock intro + rows; new row `unlock.sign-in-prefilled`; regenerated, `check-state-map` 0 drift |
| C4 | Copy: `unlock.notYou`, `unlock.switchAccount` removed | ✅ `messages.json`, `metadata.json`; `messages.js` + `native/messages.ts` regenerated (app copy via `copy-shared.sh`, git-ignored); `visible-strings.json` re-extracted (only those two strings dropped); kit `messages.ts` regenerated |
| C5 | Approved screen `returning-unlock.html` | ✅ Switch account row and its two CSS rules removed; nothing else |
| C6 | Re-render 7 states × 360 / 390 | ✅ 14 pictures in `ui-screens/returning-unlock/`; contact sheet + `REVIEW.html` rebuilt; README row updated. **For Apurva's approval:** `before-after-390.png`, `before-after-360.png` (this folder) |
| C7 | Prototype `returning-unlock.js` (+ css) and `sign-in.js` | ✅ |
| C8 | Tests + picture compare | ✅ entry-journeys F7, F7b–F7f rewritten for D-105; step-1 compare against the new pictures |
| C9 | Kit | ✅ regenerated (`when` lines for fingerprint / platform-retry / unavailable updated), `--check` up to date, `tests/codex/handoff/` 38 / 38 |
| C10 | PRD §5.4 (`PRD.md` + `PRD.confluence.md`) | ✅ "What the doctor can do" + rules; `check-prd` 17 / 17; not pushed to Confluence |
| C11 / C12 | `native/UnlockScreen.tsx`, `index.html` / `app.js` | left alone, as briefed |
| A6 | State map "Shown once…" | ✅ D-104 wording (intro, `offer.shown`, and `offer.not-now` too) |
| A7 | `state-names.js` "Offer shown once…" | ✅ "Offer at each OTP sign-in until turned on, at most 3 times" (+ a name for the new behaviour row) |
| A8 | `otp.js` comment | ✅ D-104 wording |
| B5 | `app-logic.md` §3 wheel behaviour | ✅ one line: swipe, momentum, snap to one row (15-minute steps), tap ±1, value set at rest, Set / Add use the band value |

## What the prototype does now
- Unlock: two buttons, **Unlock** and **Use OTP instead**. No "Not you? Switch account" anywhere.
- **Use OTP instead**, and 3 failed unlocks (`returningUnlockFallbackAfter`), open `sign-in_default` with the remembered number filled in. No code is requested. The first focus puts the cursor at the end. Send OTP is enabled, as on any Sign-in.
- **Unavailable:** Use OTP instead stays the primary button and opens the same Sign-in.
- **Editing the number there:** Send OTP goes to OTP for the new number.
- **Back:** that Sign-in starts a fresh history (it is the root, like any Sign-in). The phone's back gesture doesn't return to unlock; reopening the app shows unlock.
- **Removed:** the old `[MOCK ASSUMPTION]` that Use OTP sends a code at the tap.

## Checks (logs in `logs/` and `checks/`)
- entry-journeys **61 / 61** (new F7: two buttons, 3rd failure → prefilled sign-in, no SMS; F7b: Send OTP → OTP → Home; F7c: unavailable → prefilled sign-in, no SMS, back doesn't return to unlock, reopen → unlock; F7d: cursor at end, edited number → OTP for the new number, old number sent nothing; F7f: code limits through unlock → sign-in → Send OTP)
- run-checks **95 / 95**
- step-1 compare: **exact 80, accepted 6, failed 0** (unlock against the new pictures)
- passing guards:
  - `layout_check.py` and `--app`: ALL PASS
  - `check-locked-specs.py`: 0 failures (149 states)
  - `check-sources.mjs`: PASS
  - token check: clean
  - `scan.mjs`: PASS
  - `check_lockup.py`: OK
  - `check-state-map`: 0 drift
- kit: `--check` up to date; handoff tests **38 / 38**
- PRD: **17 / 17**
- old `index.html` / `app.js` / `styles.css`: unchanged

## Pictures: how they were made
- **Script:** `tools/capture-unlock.py`. It uses the same settings as `capture-method-cap.py` / `compare-step1.mjs`: DPR 2, fixed clock, frozen animations, and the D-94 rasterisation flags.
- **Method proof:** the committed (old) source, rendered with this script, is pixel-identical to the committed pictures.
- **New vs old:** the new pictures differ only in the bar rows (2× rows 1270–1625; unavailable 1398–1655).
- **First attempt didn't count:** I first rendered without the flags (copied from the D-93 script), and those pictures failed the compare on anti-aliasing. They were replaced; only the flagged render is committed.

## Notes and readings (unattended)
- **Cursor at the end:** Sign-in from unlock opens like `sign-in_default` (keyboard closed, field not focused). The cursor goes to the end on the first focus. I did not auto-open the keyboard, because the brief didn't ask for it and the picture is the default one.
- **"Phone back leaves the app":** the prototype shows this the way every root does, by staying on Sign-in (a browser can't close the app).
- **Pictures in `ui-screens/`:** they are replaced in place, so the compare and the kit use them. Apurva still has to approve them: the README row says so. To revert, use git.
- **`REVIEW.html` was stale:** it still showed `s7c-checking` (retired, D-91) and lacked `offer_unavailable` (D-93). Rebuilding it now shows the true 149 states.
- **Codex review** (`codex-review.log`): **0 blockers, 0 should-fix**. It ran before the pictures were re-rendered with the flags. That changed only pixels, no code or rules, so no second review was needed.
- **Left in place:**
  - `ui-screens/case/case.html:349`: an old hidden unlock block with "Switch account". It is legacy and not an unlock picture source, and editing it would touch the frozen case file.
  - `ui-screens/native/UnlockScreen.tsx` still uses `unlock.notYou` / `unlock.switchAccount`, which are no longer in `native/messages.ts` (left alone per the brief; the kit supersedes it).
  - `app/core/faster-signin.js:14` "shown once" describes the stored record before D-104, which is correct history.
  - `build-map.py` "shown once" is unrelated QA wording.

## NEEDS-APURVA
1. Approve the 14 new unlock pictures (`before-after-390.png`, `before-after-360.png`).
2. Phone check: unlock → Use OTP instead → the number is filled in, no SMS arrives until Send OTP.
