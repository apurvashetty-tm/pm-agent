# Run wheel-keyboard — report (unattended, 2026-11-10)

Brief: `TERMINAL-BRIEF.md` (this folder). RULINGS read first: nothing in them is about this run.

## 1 · F-04 swipe wheel — done
- **New `app/screens/wheel.js`.** Each column (Home setup and the Add time sheet) is a scroll container with three rows visible and CSS scroll-snap.
  - **Touch swipe** is the phone's own scrolling, so it has momentum, and it snaps to one row. The row in the centre band is the value.
  - **Mouse drag** (desktop review) has a short momentum, then snaps. Mouse wheel and trackpad scroll the column natively.
  - **Tapping** the row above or below moves one step. **ArrowUp / ArrowDown** move one step (Home / End go to the first / last row) and keep the focus.
  - **Screen readers:** a listbox with options, `aria-selected` on the row in the band, one tab stop.
- **Committing the value.** It is set once the column is at rest: 120 ms with no scroll and no finger or mouse down. It goes through `pickWheel` in `home.js`, so the 15-minute minimum and the minute list (15 / 30 / 45 at 0 h) are unchanged.
- **After Codex review 1:**
  - When both columns move at once, the last one to stop sets both values.
  - Set availability or Add tapped before the wheel stops uses the value in the band (`commitWheels`).
- **Busy** (Setting… / Adding…): the column can't scroll, its rows are disabled and picks are ignored.
- **Same look:** `home.css` adds only the scroll and snap rules. The steps 2–4 compare: **132 pictures, 0 over 1 %**. All 22 Home states are at 0 %.

## 2 · F-05 keyboard — done
- **New `app/shell/keyboard.js`**, mounted once in `app/core/boot.js`. It works only on a phone (below 768 wide), not in capture mode, and only at normal zoom. On those phones:
  - The app frame is sized to `window.visualViewport`, which is the space above the keyboard. The CSS variables `--app-vh` / `--app-vt` are used in the phone media query of `shell.css`.
  - On focus, and on every viewport change while a field has focus, it scrolls two things into that space: the field (its `.tm-field` box, with label and helper) and the screen's main button (the first shown primary button after the field). The button sits at least 16 px clear of the keyboard (D-44).
  - The `interactive-widget` meta tag is kept.
- **OTP was the real bug.** Its header (logo + title, about 200 px) sits outside its scroll area. Once the keyboard took the space, the panel alone couldn't bring Verify & sign in up, and the test reproduced Apurva's report. Fix: while the real keyboard is open (`html.phone-kb`), the OTP screen scrolls as one (`otp.css`). This is never set on desktop or in pictures.
- **Desktop and capture are unchanged.** The phone frame with the drawn keyboard is unchanged (test K5). Pinch zoom doesn't resize or scroll anything (K6).
- **Apurva checks both on his phone through the local link (`scripts/serve.sh`)**, on Android Chrome and, if he can, iOS Safari. The headless tests emulate the keyboard with a stubbed `visualViewport`; a real keyboard needs one look. **Not deployed.**

## 3 · Kit rules — done
These are in the generator config (plain words):
- Home "Availability wheel": native-feel, swipe, momentum, snap to 15-minute steps, three rows; iOS native wheel; on Android a wheel component (the app team's choice of library).
- "Keyboard" on OTP, case and Prescribe (`build-handoff.journeys.mjs`), and Sign-in d30 (`build-handoff.mjs`): a keyboard-avoiding layout on every screen with a text field; the field and the main button above the keyboard, the button 16 px clear; D-81's bar-hides rule on case and Prescribe.

The kit was regenerated. Its changes: DECIDED and the screens' item lists, the wheel component's CSS, 8 wheel-state shots (sub-pixel), and the zip.

## Checks
| Check | Result |
|---|---|
| `tests/wheel-keyboard.mjs` (new) | 15 / 15 (W1–W7 wheel, K1–K6 keyboard, `logs/wheel-keyboard.log`) |
| `tests/entry-journeys.mjs` | 61 / 61 |
| `tests/run-checks.mjs` | 95 / 95 |
| Step-1 compare | exact 80, accepted 6, failed 0 |
| Steps 2–4 compare | 132 pictures, 0 over 1 % (`logs/compare-final.log`) |
| `layout_check.py` / `--app` | ALL PASS |
| `check-locked-specs.py` | PASS, 0 failures, 149 states × 3 viewports |
| `check-sources.mjs`, `check_lockup.py`, `scan.mjs`, `check-state-map.mjs` | PASS |
| Token check | clean |
| Kit `--check` | up to date (629 files) |
| `tests/codex/handoff/` | 38 / 38 |

All logs are in `logs/` and `tmp/checks-final/`, run with `docs/renders/2026-11-09-build-fast/run-checks.sh`.
- **The first steps 2–4 compare had one false alarm:** `d-scrolled` @360 at 17.6 %, while three heavy jobs ran at once. Run alone, it was 0 %, and the final full compare was also 0 %.

**Codex:**
- Review 1 (`codex-review.log`) found 2 blockers (both wheel-commit timing) and 1 should-fix (the pinch-zoom guard). All three were fixed in one pass, with tests W6, W7 and K6.
- Review 2, blockers only (`codex-review-2.log`): **No blockers.**

## Readings taken (nobody to ask)
- **D-81 vs the brief's "pinned bar button".** D-81 (approved) says the case page's and Prescribe's pinned bar **hides** while the keyboard is open. I kept that, so on those two screens only the field is kept in view. Codex agreed it is correct.
  - The kit rule says the same.
  - **NEEDS-APURVA (confirm only):** if he wants the bar visible above the keyboard there instead, that reverses D-81.
- **The main button is the first shown primary button after the field.** It doesn't have to be marked on each screen: Send OTP, Verify & sign in, Prescribe's button. A sheet's button would also count.
- **A tap on a row** sets the value at once, without an animation, the same as before.
- **Kit sources** read "Agreed fix (phone feedback, D-…)" rather than "F-04 / F-05", to keep internal codes out of the viewer.

## Not done
- No deploy, as the brief says. The tests don't cover a real device keyboard or real iOS Safari; that is the phone check.
