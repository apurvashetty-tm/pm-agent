# Step 1 recovery — report (sessions 1–5, 2026-11-09)

Terminal (Claude Code) built; Codex critiqued every session; main thread reviewed sessions 2–4. Scope: `TERMINAL-BRIEF.md` + `docs/renders/2026-11-06-step1/BRIEF.md` (Part A0, Part A panel follow-ups 1–5, Part B four entry journeys + compare harness + copy check on `app/`), plan v3.2, checklist v3.2 Step-1 lines. Per-session detail: `SESSION-STATUS.md`.

**Status: step 1 rebuilt and checked. Waiting for Apurva: one new picture (D-93 `offer_unavailable`) to approve. Session 6 (D-94 picture refresh) is next.**

## 1 · Set-up baseline (session 1, this Mac)

- Repo moved to `~/pm-agent`. `tests/run-checks.mjs` and the Python guards no longer hard-code `/Users/mac` or `src/pm-agent`; they read `CHROME` (Node) / `CHROMIUM` (Python) or use Playwright's own browser.
- Playwright's own browser download stalls on this Mac, so checks run on the installed Chrome (`CHROME=` / `CHROMIUM=` `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`). Codex runs with `< /dev/null`.
- Baseline on the committed step-0 state: state map rebuilt (148 pictures; drift 0), `run-checks.mjs` passing, `check-sources.mjs`, `check_lockup.py`, `scan.mjs` passing; Python browser guards passed once Chrome was wired in (session 2).
- `layout_check.py --app` needs the app served on `:8765` (`python3 -m http.server 8765 --directory app`); `session-5/checks/run-all.sh` starts and stops it.

## 2 · Part A — review panel (session 4)

Panel at 1280 (`session-4/panel/panel-1280-story.png`, `panel-1280-call.png`), drawer at 390 (`drawer-390-sign-in.png`, `drawer-390-otp.png`; follows every transition and width change), QR at 160 px decoded back with jsQR (test P7; `qr-160.png`). Plain words for every value and every Jump id (168 + `offer.unavailable` now), folding rows (one open at a time), live QR with short link and 3–6 plain steps, Test-on-phone card in the left gutter at ≥ 1024 px (main thread accepted), drawer handle at the right edge. Session 5 adds the D-93 behaviour row to Jump ("Offer · not available on this phone (D-93, picture pending approval)"), which opens the built state.

## 3 · Checklist 1.3 table

`session-4/table-1.3.md` — every calling transition with verdict and source; the generator (`scripts/build-state-map.mjs`) fixed, `calling-flow/data.js` unchanged. Main-thread answers (session 5, recorded here as **answered**):
- Knowlarity call-ended event: kept as built — app-logic §5 and D-83 CW-C2 say Cat4 never reaches screen 5. A confirmed call-ended event would be new information for a later round.
- Partner for HA-skipped Pilot: Ozonetel kept, `[MOCK ASSUMPTION]`, pointer to D-83's Engineering backlog ("partner for Pilot Non-Value Meds").
- Test-on-phone card in the left gutter at ≥ 1024 px: accepted.
- Approved OTP pictures show "call Doctor Ops" as plain text: pictures left unchanged; the link stays and is a listed region in the compare.

## 4 · Compare (approved picture vs built app)

`tests/compare-step1.mjs`, 42 step-1 states × 390 / 360 (2×, fixed clock, frozen animations, capture mode; region-aware; spinner masked identically on both sides only where both show a visible spinner in the same box). Last run (session 5, after all fixes):

| Result | Pictures | Reason |
|---|---|---|
| exact | 14 | all returning-unlock (re-rendered on this Mac for D-92) |
| accepted | 70 | old-Mac anti-aliasing, allowed only where the built app is pixel-identical to the approved source rendered on this Mac, unshifted, within 3,000 px / max channel 110; plus the listed "call Doctor Ops" link region in `otp_locked`, `otp_too-many-resends`, `otp_expired-and-resend-limited`; plus spinner masks on the three busy states |
| failed | 0 | — |

Sheets: `compare/<state>_w<width>.png` (approved | built | heatmap), `compare/results.md`. The anti-aliasing allowance goes away in session 6 (D-94).

**D-93 `offer_unavailable`** (not yet an approved picture, so not in the 42): built app vs the new picture — **0 changed pixels at 390 and 360** (`session-5/d93/compare-d93.json`, `pair_offer_unavailable_w*.png`).

## 5 · Guards and tests (session 5, final — logs in `session-5/checks/`, `run-all.sh`)

| Check | Result |
|---|---|
| `tests/entry-journeys.mjs` | **60 / 60** (was 55 after session 4; + F5d, F5e (D-93), A12, B6c, F7f (Codex)) |
| `tests/run-checks.mjs` | 78 / 78 |
| `docs/layout_check.py` | ALL PASS |
| `docs/layout_check.py --app` | ALL PASS (now also `offer_unavailable` at every width) |
| `ui-screens/feedback/check-locked-specs.py` | 0 failures, 148 states × 3 viewports; 360 × 640 pass |
| `ui-screens/feedback/check-sources.mjs` | PASS (app/ copy: 9 screen files, every MSG key in the registry, no typed copy; copy rules) |
| `brand/check_lockup.py` | OK |
| `tests/scan.mjs` | 0 failures |
| `scripts/check-state-map.mjs` | 148 pictures, drift 0 |
| `tests/compare-step1.mjs` | exact 14 · accepted 70 · failed 0 |
| Old `index.html` / `app.js` / `styles.css` | unchanged |

## 6 · D-92 re-render check (session 3)

20 pictures (7 returning-unlock + 3 Home Profile × 390 / 360) re-rendered with `capture-method-cap.py`. The old-name sources rendered on this Mac and diffed against the new: every changed pixel of all 20 lies inside the name box (unlock greeting 325,163–540,225; Profile name + initials 90,191–453,237) — `session-3/d92/d92-diff.json`. Contact sheets rebuilt; `visible-strings.json` regenerated (only the name strings changed). The built app takes the name from mock profile data (`app/data/doctor.js`), never typed in a screen.

## 7 · D-93 `offer_unavailable` (session 5)

- **Reference:** `ui-screens/faster-signin-offer/faster-signin-offer.html?capture=unavailable` — neutral notice at the top of the panel (same component, icon, classes and position as `unlock_unavailable`; text `unlock.unavailable`), Turn on and Not now hidden, **Continue** the single primary. The six approved offer states render pixel-identically from the edited file (12 / 12 vs the pre-edit file, both on this Mac — `session-5/d93/README.md`).
- **Registry:** `offer.continue` = "Continue" with metadata; `messages.js` / `native/messages.ts` regenerated.
- **Docs:** app-logic §2 offer outcomes and the notice-placement line; `feedback-state-map.md` row `offer.unavailable` (behaviour row until the picture is approved; the state map then links it by name).
- **App:** story value `unavailable` at Turn on / Try again → this state; Continue → Home; not enabled; stays recorded as offered, so the offer doesn't come back; phone Back = Continue. Test F5 no longer expects the old placeholder; F5d covers the journey (incl. no re-offer after a restart and an app reopen) and Jump.
- **Picture:** `session-5/d93/offer_unavailable_w390.png`, `_w360.png` — **not** in `ui-screens/`.
- **Judgement in the picture:** the hero fingerprint tile is hidden too, as `unlock_unavailable` hides its prompt tile "so only the notice speaks". Title, subtitle and the three points stay.

## 8 · Checklist v3.2 — Step-1 lines

| Line | Verdict | Evidence |
|---|---|---|
| 1.1 pictures in the state map, one owner | pass | `check-state-map.mjs` 148 / drift 0 |
| 1.2 behaviour-only states in the map | pass | `app/state-map.js` others (incl. `offer.unavailable`, step 1) |
| 1.3 calling rows vs app-logic | pass | `session-4/table-1.3.md`; doubts answered (§3) |
| 1.5 nothing on screen beyond pictures / app-logic | pass, with one pending picture | D-93 picture awaits approval (§7) |
| 1.6 unclear logic marked, not guessed | pass | `[MOCK ASSUMPTION]` sign-in during the resend wait (§9); OQ-021 links; drawn keyboard |
| 1.7 old files unchanged | pass | git diff empty |
| 2.1 / 2.2 picture compare, no unexplained pixels | pass (anti-aliasing allowance until D-94) | §4 |
| 2.3 / 2.4 frame, 430 and 360 × 640 | pass | `layout_check.py`, `--app`, F9 |
| 2.5 four guards on `app/` | pass | §5 |
| 3.1 every word via `MSG()` | pass | `check-sources.mjs` app/ copy |
| 3.2 settings from one file | pass | `app/core/settings.js` (resend waits, window, lock, prompt delay); `scan.mjs` |
| 3.3 "case" wording / labels | pass (no case labels in step 1) | `check-sources.mjs` |
| 3.4 tokens / components only, no inline styles | pass | `dom.js` refuses `style`; `scan.mjs` |
| 3.5 missing text added centrally | pass | `offer.continue` in `messages.json` |
| 3.6 logo | pass | `check_lockup.py`; locked specs |
| 3.7 copy rules on `app/` | pass | `check-sources.mjs` |
| 4.1 sign-in / OTP limits | pass | A1–A12, B-series; Codex fixes (§9) |
| 4.2 faster sign-in | pass (Profile toggle is step 2) | F3–F6c, F5d |
| 4.3 returning unlock | pass | F3b, F6c, F7–F7f, F8 |
| 4.39 phone Back | pass | B6, F4b, F5d, F7, F7d |
| 5.8 safe areas / OTP keyboard at 360 | not run (device line — Apurva's phones) | — |
| 6.1 no console errors | pass | every journey test checks errors |
| 6.2 offline / loading / failure rows reachable | pass for step 1 | B5c, F5, F5d, F7c |
| 6.4 synthetic data only | pass | `scan.mjs` |
| 7.1 project branch, own files only | pass | §10 |
| 7.2 `session_handoff.md` | not updated (brief: leave `docs/context/` alone) | main thread |
| 7.3 / 7.4 shared-core change re-runs checks; G7 | pass | full `run-all.sh` after every fix; 148 locked specs |
| 7.5 frozen after approval | waiting | Apurva |

## 9 · Codex (session 5, whole step)

- **Critique 1** (`codex-critique.md`): 1 blocker, 1 should-fix — both adopted.
  - Blocker: Send OTP → Change → Send OTP again during the resend wait sent a new code. Fixed: `requestCode` applies the per-number wait; no new code, OTP opens on the running wait. `[MOCK ASSUMPTION]` — app-logic §2 doesn't say what the server answers here; the code already sent stays valid. Tests A12, B6c.
  - Should-fix: the window's last code sent from sign-in opened OTP with a normal countdown. Fixed: OTP opens with the too-many-codes notice and Resend hidden. Tests A12, B6c.
- **Critique 2** (`codex-critique-2.md`): 0 blockers, 1 should-fix — adopted: returning unlock → Use OTP instead dropped the same last-code flag. Test F7f.
- Not adopted: none. Response: `session-5/codex-response.md`. Codex couldn't run browser tests in its sandbox (`EPERM` on server binding); all browser checks ran here.

## 10 · Commits pushed (project branch only; no pull request, no deploy)

Sessions 1–4: `f7a196f` set-up · `8164649` screen system · `7c89d20` entry journeys · `4413763` / `4f73098` / `76a770e` session 2 · `8d7fb23` / `6d97436` / `e012c24` session 3 · `ae52d90` / `817a8d1` / `49fe1f0` session 4. Session 5: `7e33151` D-93 · Codex fixes + this report + status (this checkpoint). Full list: `git log --oneline -- projects/truemeds-doctor-portal-prototype`.

## 11 · Known gaps

- D-93 picture not approved yet, so it isn't in `ui-screens/`, the README count (148), the contact sheet, the compare or `visible-strings.json`. After approval: copy the two PNGs, add `unavailable` to the README offer line, rebuild the offer contact sheet, add the state to `check-locked-specs.py` EXPECTED, remove `PENDING_PICTURE` in `app/shell/screen-host.js` and the `offer.unavailable` jump-name, regenerate the state map.
- OQ-036 is closed by D-93 in the decision log; `open_questions.md` and `session_handoff.md` were not touched (brief: leave `docs/context/` alone) — main thread.
- Capture noise on this Mac (button-corner bands come and go between two captures of the same page); the compare retries up to 3 times. Session 6 (D-94) makes captures repeatable and removes the retry and the anti-aliasing allowance.
- Checklist 5.8 (device) not run.

## NEEDS-APURVA

1. **Approve the new picture `offer_unavailable`** (D-93): `session-5/d93/offer_unavailable_w390.png` and `_w360.png`; side by side with the fingerprint offer and `unlock_unavailable` in `session-5/sheet.png`. One choice inside it to confirm: the hero fingerprint tile is hidden (as on unlock); title, subtitle and the three points stay.
