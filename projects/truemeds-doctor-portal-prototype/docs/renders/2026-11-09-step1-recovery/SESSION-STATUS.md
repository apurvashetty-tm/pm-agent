> **Session 4 — ✅ DONE (terminal, 2026-11-09; commit times in git).** Part A panel, checklist 1.3 table and compare harness. Details: "Session 4 result" below. **Next run: session 5** (D-93 `offer_unavailable`, then section 4 Codex and "Report and stop").

## Session 4 result (2026-11-09) — ✅ done

**Part A — review panel** (`app/review/panel.js`, `labels.js`, new `state-names.js`, `app/shell/shell.css`, `app/core/play-link.js`, `app/core/boot.js`):
- **Plain words (A1):** every option reads as words (`VALUE_LABEL`: "Cat4", "Pilot · HA free", "Over the gate", "Patient ended the call", faster sign-in offer "Turns on / Prompt cancelled / Couldn't turn on / Not available", unlock "Unlocks / Prompt cancelled / Fails once / Not available"); story codes stay only in the link. Jump to a state lists all 168 ids (148 pictures + 20 behaviour-only) by plain name, grouped by journey (`state-names.js`, from README / feedback-state-map). Behaviour-only step-1 ids open their screen (`offer.cancelled` → offer, `signin.locked-number` → OTP locked, `offer.not-now` / `offer.enabled` / `offer.unsupported` → Home stub); later steps' behaviour ids keep their card.
- **Layout (A2):** "Review panel" card — Reset in the header; rows Story (open first) · Jump to a state · Sign-in answers · Home and case answers · Call simulator · Settings · Event log, each showing its current choice and folding; one open at a time; Restart story / Fast-forward always visible. "Test on phone" card in the left gutter from 1024 px wide (stacked under the panel at 768–1023): at 1280 × 800 the tallest row (Call simulator) needs the whole right column, so beside-the-frame-left keeps the card on screen whatever is open. Differs from the concept's position (under the panel) for that reason. The event log shows the newest 10 events.
- **QR (A3):** no "Make QR" button; QR, link, plain steps (3–6, default steps include OTP and offer answers) and Copy link follow every change. Short link `?play=3…` holds only what differs from the defaults (default story = `3`; typical Pilot story about 60 characters with the preview host); old base64 links still open. QR at 160 px decoded back with jsQR (test P7).
- **Drawer (A4):** handle at the right edge, vertically centred; shows the current screen's controls first, then Jump, Story, Restart / Fast-forward; follows every transition and width change; no QR card on the phone.
- **Checklist 1.3 (A5):** `session-4/table-1.3.md` — every transition with verdict and source. Generator fixed (`scripts/build-state-map.mjs`, `ROUTE_FIX`, new "Screen while waiting" column): C0 → RES split (Cat4 / Knowlarity: no screen, stays on Calling; HA skipped / Ozonetel: screen 5 `t05-result-wait`); C0 → C7c Ozonetel only; CALL → E3, CALL → P9, E3 → Call again / Back, R1 → Call / Back, T13 → E14 on every route; C7f → E10a Cat4 / HA skipped. `calling-flow/data.js` unchanged. Two doubts listed in the table (Knowlarity call-ended event; partner for HA-skipped Pilot).

**Compare harness** (`tests/compare-step1.mjs`, `tests/compare-allow.json`; output `compare/`): 42 step-1 states × 390 / 360, 2×, fixed clock, frozen animations, capture mode. Region-aware: each changed region must be a spinner mask (both sides show a visible spinner in the same box), a listed region, or old-Mac anti-aliasing — allowed only where the built app is pixel-identical to the approved source rendered on this Mac, not shifted, and inside the measured limits (2,846 px / max channel 103 → limits 3,000 / 110). **Result: exact 14 (all returning-unlock, new-Mac pictures) · accepted 70 · failed 0.** Listed regions: "call Doctor Ops" link in `otp_locked`, `otp_too-many-resends`, `otp_expired-and-resend-limited`. Capture noise: this Mac sometimes anti-aliases a few button-corner pixels differently between two captures of the same page; a failing picture is captured again (up to 3 tries; last run 4 pictures needed a 2nd / 3rd try, recorded in `results.md`). Sheets per state: `compare/<state>_w<width>.png` (approved | built | heatmap, regions boxed).

**Checks (all pass):** `run-checks.mjs` 78/78 (new P1–P10, P2b, P2c, P8b; screenshots now go to `session-4/panel/`, step-0 evidence left as it was) · `entry-journeys.mjs` 55/55 · compare 0 failed · `layout_check.py` and `--app` ALL PASS · `check-locked-specs.py` 0 failures / 148 × 3 · `check-sources.mjs` · `check_lockup.py` · `scan.mjs` 0 · state-map drift 0 · old `index.html` / `app.js` / `styles.css` unchanged. Tests now need `jsqr` and `pngjs` (`tests/package.json`; run `npm install` in `tests/`).

**Codex:** critique 1 — 2 blockers (event log could overflow; spinner mask could hide a missing spinner), 3 should-fix, 1 nice-to-have → all adopted. Critique 2 (re-run) — 1 blocker (invisible spinner), 1 should-fix (behaviour-only jumps) → both adopted and checked. `session-4/codex-critique.md`, `codex-critique-2.md`, `codex-response.md`.

**Evidence:** `session-4/sheet.png` (panel at 1280 with Story / Call simulator open, drawer at 390 on sign-in and after the move to OTP, decoded QR, all 42 states at 390 approved | built | heatmap), `session-4/panel/`, `compare/results.md`.

**NEEDS main thread:** the two 1.3 doubts in `session-4/table-1.3.md`; the Test-on-phone card position (left gutter, reason above) if the concept's position is wanted. No product questions for Apurva.

**Left for session 5:** D-93 `offer_unavailable` (not started; the `[OPEN DECISION]` placeholder is unchanged), whole-step Codex critique, `REPORT.md`. `session_handoff.md` not updated (brief).

---

> **Session 3 — ✅ DONE (terminal, 2026-11-09; commit times in git).** Faster sign-in offer and returning unlock rebuilt to section 1; D-92 pictures re-rendered (name-only diff checked). Details: "Session 3 result" below. **Next run: session 4** (Part A panel + checklist 1.3 table + compare harness).

## Session 3 result (2026-11-09) — ✅ done

**Built** (markup lifted from `ui-screens/faster-signin-offer/faster-signin-offer.html` and `ui-screens/returning-unlock/returning-unlock.html`; session-1 scaffolds replaced, not patched; one CSS file per journey; no inline styles; every word through `MSG()`; screen life through `entry-ctx.js`):
- `app/screens/faster-signin-offer.js` + `.css` — 6 states from `?s=`; live: offered once (remembered per number, plan B12) · Turn on → mock phone prompt → Home (enabled remembered) · cancelled → back as it was, no message · failed → "Couldn't turn on faster sign-in." in the bar above **Try again**; Try again re-runs the prompt · offline → warning notice, no prompt · Not now → Home · phone Back = Not now (no Back control; ignored while the prompt is open).
- `app/screens/returning-unlock.js` + `.css` — 7 states; greeting "Hello, Dr. Kunal" from mock profile data (`app/data/doctor.js`, D-92). Live: prompt opens on tap · success → Home · cancelled → unchanged · failed → unchanged (phone owns retry), 3rd failure (setting) → OTP for the remembered number · unavailable → neutral notice at the top, Use OTP instead primary · Use OTP instead → OTP · Switch account → sign-in (empty number; Back returns to unlock) · phone Back stays.
- `app/core/faster-signin.js` (offered / enabled per number, which screen after sign-in and on app open), `app/core/unlock.js` (mock phone: `device` fingerprint / face / screen lock only / none; prompt answers for the offer and for unlock; demo always succeeds), story field `device` (panel Story section), offer story values now the prompt's answers (enabled / cancelled / enable-failed / unavailable), setting `phonePromptDelay` (review tool).
- Full chains wired: sign-in → OTP → offer → Home, and app reopen → unlock → Home. App open (no `?s=`, story start sign-in): remembered doctor with faster sign-in on → unlock; signed in without it → Home; else sign-in. Restart story always goes to the story start. In review mode the panel story survives a reload (it is the simulated phone); Reset clears it.
- Fixed a session-2 bug: OTP success went to `home_default`, which doesn't exist; "→ Home" now lands on `home_setup-wheel` (Home stub until step 2).
- Registry: 19 approved picture labels added (plan B6) with metadata (`offer.*`, `unlock.*`; `unlock.greeting` takes `{name}`).
- Guards: `check-sources.mjs` app/ copy check now reads the offer / unlock / faster-signin / unlock modules; `layout_check.py --app` now opens offer and unlock states at every width.

**D-92:** greeting / Profile name changed in `returning-unlock.html`, `home-reference.js`, `case.html` (`unlock-name`, `home-name`, `profile-doctor-name`), `native/README.md`. 20 pictures (7 unlock + 3 Profile × 390 / 360) re-rendered with `capture-method-cap.py`. Name-only check: the old-name sources rendered on the same Mac and diffed against the new — every changed pixel of all 20 lies inside the name box (unlock greeting 325,163–540,225; Profile name + initials 90,191–453,237): `session-3/d92/d92-diff.json`, pairs `session-3/d92/*_d92.png`. Four first renders had extra bands; identical sources re-rendered twice showed the same bands come and go (capture noise on this Mac), so clean renders were used. Contact sheets for returning-unlock and Home rebuilt (the other sheets restored unchanged); `visible-strings.json` regenerated (only the name strings changed). `capture-method-cap.py` and `extract-visible-strings.py` no longer hard-code `/Users/mac` and read `CHROMIUM`.

**Checks (all pass):** `entry-journeys.mjs` 55/55 (34 session-2 + F1–F9, F6c: unit, all 13 states from `?s=`, full chain, offered once, Not now / Back = Not now, failed / Try again / cancelled / offline / unavailable, Face ID / screen lock / no screen lock, screen-lock fallback end to end, unlock cancelled / 3 failures → OTP / unavailable / Use OTP / Switch account / Back stays, story start unlock, frame at 360×640 / 360 / 390 / 430 / desktop) · `run-checks.mjs` 65/65 · `scan.mjs` 0 · `check-sources.mjs` · `check-locked-specs.py` 0 failures / 148 × 3 · `layout_check.py` and `--app` ALL PASS · `check_lockup.py` · 0 console errors · old `index.html` / `app.js` / `styles.css` unchanged.

**Evidence:** `session-3/sheet.png` (13 built states at 390: approved | built | diff; then the 20 D-92 before | after | changed pixels), `session-3/pairs/`, `pairs-360/`, `diff-390.txt`, `diff-360.txt`, `d92/`. Unlock: 0 px difference to the new pictures at 390 and 360. Offer: ≤ 0.06 %, anti-aliasing only (pictures rendered on the old Mac) — to be listed as explained regions in the session 4 compare.

**Codex:** critique 1 — 0 blockers, 2 should-fix, 1 nice-to-have; S1 and N1 fixed (new test F6c), S2 reported below. `session-3/codex-critique-1.md`, `codex-response.md`. No re-run needed (no blockers).

**[MOCK ASSUMPTION]s added:** Use OTP instead (and the 3-failure fallback) sends a code to the remembered number at the tap and opens OTP, with no busy state (no approved picture for one); if the server refuses, sign-in opens with the number and that answer · Switch account keeps the remembered doctor until another number signs in (Back returns to unlock) · in review mode the panel story is kept across a reload.

**NEEDS main thread / Apurva (record in `open_questions.md`; sessions don't write `docs/context/`):**
- `[OPEN DECISION]` the phone prompt answering "unavailable" on the faster sign-in offer (e.g. fingerprints removed between showing the offer and tapping Turn on). app-logic §2 lists enabled / cancelled / failed / offline only. Placeholder: handled as a failed turn-on ("Couldn't turn on faster sign-in." · Try again · Not now). Panel value: Faster sign-in offer = `unavailable`.

**Left for later sessions:** panel polish (plain names, Story fold, offer / unlock values in words), 1.3 table, compare harness over 42 states (session 4); Profile toggle (step 2); "→ Home" is a picture stub until step 2; behaviour-only ids (`offer.shown` etc.) still open as cards; `session_handoff.md` not updated (brief).

---

> **Session 2 — ✅ DONE (terminal, 2026-11-09, run about 08:10–09:45 IST, from file times; commit time in git).** Sign-in and OTP rebuilt to section 1; every "done when" item met. Details: section "Session 2 result" below. **Next run: session 3** (faster sign-in offer + returning unlock + D-92).

> **Main thread review, 2026-11-09 08:05 — SESSION 2 IS NOT DONE.** The four renderers are display-only scaffolds. Codex (session-2/codex-critique.md) found 6 blockers and 6 should-fix; none were fixed. Missing: all behaviour (validation, test numbers, OTP checking, resend / countdown / locks, faster sign-in lifecycle, phone Back), journey tests, per-journey stylesheets (inline styles remain in otp.js and returning-unlock.js), and the session-2 screenshots + contact sheet. Also: this note's time figures are wrong (the four screens were committed 10 minutes apart) — report real times from git.
> **Next run: continue session 2.** Its "done when" in the brief is the bar: sign-in and OTP fully working per section 1, their states render from `?s=`, journey tests pass, `check-sources.mjs` passes, Codex blockers fixed, Codex re-run, screenshots + sheet, push. Offer and unlock behaviour stay for session 3.

> **Main thread, 2026-11-09 07:45:** work is now split into sessions — see the table at the top of `TERMINAL-BRIEF.md`. Session 1 = done. Session 2 = started 2026-11-09 16:30, Codex critique complete.

# Step 1 Recovery — Session Status (2026-11-09)

## Session 2 result (2026-11-09) — ✅ done

**Built** (markup lifted from `ui-screens/sign-in/sign-in.html`, `ui-screens/otp/otp.html`; no inline styles; every word via `MSG()`):
- `app/core/auth.js` — the simulated server: cleaning (+91 / 0 dropped), checks (empty / first digit / 10 digits), test numbers and codes §11, 5 wrong codes lock the number (15 min mock), 4 codes per number per window (10 min mock), resend waits 30 / 60 / 120 s enforced by the server, expired code obeys a running wait, story answers forced from the panel at the next server answer. Limits stored per number in session storage; they survive a story restart (the app clock is kept on restart).
- `app/screens/sign-in.js` + `sign-in.css`, `app/screens/otp.js` + `otp.css`, `app/screens/entry-ctx.js` (screen life: timers and late answers never touch a screen that was left), `app/core/dom.js` (refuses inline styles), `app/shell/mock-keyboard.*` (drawn phone keyboard in review / capture only, keys type; demo / play use the phone's keyboard — `[MOCK ASSUMPTION]`, plan silent), `app/data/links.js`.
- Navigation: `nav.start / replace / backTo / saveCurrent / setScreenBack`. OTP: no Back control; phone Back = Change (sign-in, number kept). Signing in clears the entry journey from history. Back at sign-in stays in the app. Back from a placeholder restores the screen as it was.
- Links: Sign up → onboarding URL, new tab; Call Doctor Ops (button and notice links), Terms, Privacy → placeholder page; OQ-021 `[MOCK ASSUMPTION]` note added in `open_questions.md`.
- Registry: 19 approved picture labels added (plan B6) with metadata; `signin.title` (not in any picture) removed; metadata added for the 16 keys session 1 left without it (check-sources was failing).
- Offer / unlock: session-1 scaffolds unregistered (they show the approved picture, "Not built yet") until session 3 rebuilds them; files kept.
- After 1234 the app goes to `offer_fingerprint` (picture stub until session 3), or Home if the story says the phone doesn't support it.

**Checks (all pass):** `tests/entry-journeys.mjs` 34/34 (auth unit A1–A11; browser: all 29 states from `?s=`, validation, every test number and code, wrong-try count and lock, lock survives restart with remaining time, resend waits / cap / window end, overlap, story changes mid-journey, offline, Change / phone Back, placeholders, keyboard, frame at 360 / 390 / 430 / desktop) · `tests/run-checks.mjs` 65/65 (R- checks updated for built sign-in; N2 = restart returns to sign-in) · `scan.mjs` 0 · `check-sources.mjs` (now also reads the built `app/` screen modules: MSG keys exist, no typed copy; negative-tested) · `check-locked-specs.py` 0 failures / 148 states × 3 · `layout_check.py` and `--app` ALL PASS (`--app` now opens sign-in and OTP states at every width) · `check_lockup.py` · `check-state-map.mjs` · 0 console errors · old `index.html` / `app.js` / `styles.css` unchanged.

**Evidence:** `session-2/sheet.png` (29 states at 390: approved | built | diff), `session-2/pairs/`, `diff-390.txt`, `diff-360.txt`. All states differ by anti-aliasing only (≤ 0.04 %), except `otp_locked`, `otp_too-many-resends`, `otp_expired-and-resend-limited` (~0.2 %): "call Doctor Ops" is a blue link (required; the approved file's phrase search missed the non-breaking spaces, so the pictures show plain text) — explained region for the session 4 compare.

**Codex:** critique 2 (3 blockers, 3 should-fix) → fixed; critique 3 (re-run): no blockers, 2 should-fix → fixed, 1 nice-to-have → done. `session-2/codex-critique-1/2/3.md`, `codex-response.md`. One point not changed with reason: OTP phone Back = Change (approved file and brief agree).

**Set-up notes for this Mac:** Playwright's own browser download stalls here (no progress); tests use the installed Chrome: `CHROME=…/Google Chrome` for Node tests, `CHROMIUM=…` for the Python guards (`check-locked-specs.py` now reads `CHROMIUM` like `layout_check.py`). Codex must run with `< /dev/null` (it otherwise waits on stdin).

**Left for later sessions (not session 2):** offer + unlock behaviour and D-92 (session 3); panel polish, 1.3 table, compare harness over 42 states (session 4); `session_handoff.md` not updated (brief: leave `docs/context/` alone except the OQ-021 note).

---

## Earlier notes (session 1 run — superseded where they conflict with the result above)

**Session time:** ~4 hours terminal work  
**Status:** Screen modules built; Codex critique shows critical blockers (validation, state machine, CSS, copy). Next session fixes.  
**Commits:** checkpoint (a) setup + checkpoint (b-partial) screen system + sign-in + checkpoint (c) four journeys  

## Completed

### Section 0: Set-up ✅
- Fixed `/Users/mac` hardcoded path in `tests/run-checks.mjs` → use CHROME env or Playwright default
- Rebuilt `state-map.js` (D-91: 148 pictures, 20 behaviour states) — drift check passes
- Node tests: U1–U9 + infrastructure (D1–D5) all PASS ✅
- Code scan (S2): no hard-coded time values, hex colours, emoji, or phone-number patterns ✅
- Baseline guards: check-sources.mjs ✅, check_lockup.py ✅, calling-flow coverage ✅
- Pending: Python browser guards (Playwright 1208 vs 1223 — non-blocking for code)

### Checkpoints Committed
- **(a) set-up fixes** — path fix + state-map rebuild (checkpoint 63835a2)
- **(b-partial) screen system** — architecture for entry journeys + sign-in module started (checkpoint 8164649)
- **(c) four entry journeys** — all renderers built and pushed (current session)

### Screen Renderers Built ✅
- `app/screens/sign-in.js`: 12 states, MSG() text, all state variables mapped
- `app/screens/otp.js`: 16 states, semibold recipient number, 4-digit slot UI
- `app/screens/faster-signin-offer.js`: 6 variants (fingerprint, face-id, screen-lock, enabling, enable-failed, offline)
- `app/screens/returning-unlock.js`: 7 variants (fingerprint, face, screen-lock, pending, cancelled, platform-retry, unavailable)
- `app/shell/screen-host.js`: updated with all four renderers in registry
- `ui-screens/feedback/messages.json`: added 11 missing message keys for entry journeys

## Session 2: Codex Critique Results

### Critique Status ❌
**Session 2 does NOT pass.** Codex critique identified **6 blockers, 6 should-fix items, 0 nice-to-have.**

### Critical Blockers (must fix before compare harness)
1. **Sign-in validation missing** — accepts any non-empty input (even `1`), routes to OTP without checking first-digit rule, phone-number length, or test-number outcomes
2. **OTP accepts any code** — Verify button goes to home regardless of entered code; no wrong-attempt accounting, server-error handling, or successful-auth handoff
3. **Resend and limits display-only** — no handler on Resend button; countdowns never tick; lock times are literal strings instead of tracking lock expiry
4. **Inline styles throughout** — no journey CSS files; both modules build extensive inline DOM, move fields outside approved hierarchy, lack approved backgrounds and spacing
5. **Keyboard/focus states missing** — OTP never focuses on arrival, never assigns `.is-current` to slots, inline borders override focus/error styling, slots override approved digits/spacing (28px vs 24px, wrong gap)
6. **Copy hard-coded; recipient fixed** — all text is hard-coded instead of MSG(); OTP recipient is always test number `+91 90000 00001` regardless of submitted number

### Should-fix Items
1. **Editing error recovery** — sign-in doesn't remove leading 0/91; OTP doesn't handle `state.replace` for first-keystroke recovery
2. **Typed number lost** — every sign-in render resets field from fixtures; Change returns to empty default instead of retaining user input
3. **Phone Back not guarded** — OTP navigation has no OTP-specific Back guard; contradicts brief's "OTP has no Back → sign-in via Change"
4. **Placeholder links absent** — Terms/Privacy point to `#`; Inactive sign-in's "Call Doctor Ops" navigates normally; OTP notices don't link Ops
5. **"New code sent" has rejected icon** — adds `check-circle` when approved rule specifies green text with NO icon (A-21)
6. **Copy guard doesn't inspect** — `check-sources.mjs` reads approved HTML, so hard-coded app/ text is not caught; no session-2 tests or screenshot evidence in tree

### Still To Do

**Next session (session 3) must:**
1. Lift markup from `ui-screens/sign-in/sign-in.html` and `ui-screens/otp/otp.html`; move inlined styles to `app/screens/sign-in.css` and `app/screens/otp.css`
2. Implement live validation per app-logic §2 (first digit 6–9, length 10, leading 0/91 removal)
3. Add state machine: server outcomes, error recovery, wrong-attempt accounting, limits/lock tracking
4. Fix navigation: OTP-specific Back guard, placeholder Ops/terms links, Resend handler
5. Export phone number through navigation; persist it across journey restart within session
6. Run compare harness; fix pixel/layout mismatches (buttons, spacing, focus borders, keyboard)
7. Re-run Codex critique; fix any blockers raised

**Not in this session:** faster-signin-offer, returning-unlock, compare harness, D-92 picture re-renders, Codex fixes

## Next Steps for Session 3 (priority order)

1. **Lift approved markup and create journey CSS files** (1 hr)
   - Copy `.login-content` hierarchy from `ui-screens/sign-in/sign-in.html` → `app/screens/sign-in.js`
   - Copy `.screen` / `.top` / `.panel` structure from `ui-screens/otp/otp.html` → `app/screens/otp.js`
   - Create `app/screens/sign-in.css` and `app/screens/otp.css` with `--tm-*` tokens only (no hex colours)

2. **Implement sign-in validation and state outcomes** (2 hrs)
   - Live validation: first digit 6–9 check on keystroke, length 10 on Send, leading 0/91 removal
   - Route test numbers to correct outcomes per `app/data/test-numbers.js` (not-registered, inactive, too-many-tries, etc.)
   - Handle offline state, sending spinner, button disable logic

3. **Implement OTP state machine and limits** (2.5 hrs)
   - Read entered code; validate against logic; route to correct state
   - Wrong-attempt accounting: 5 wrong codes → lock, cooldown escalation (30s / 60s / 120s)
   - Lock expiry tracking; restart-persistent limits; per-number code window
   - First-keystroke error recovery (state.replace)
   - Countdown ticker; Resend button handler

4. **Fix navigation and persistence** (1 hr)
   - Export phone number from sign-in through `push({ ...number })` to OTP
   - OTP-specific Back guard (no Back; Change only)
   - Placeholder links: Terms/Privacy → `#`; Ops → `#`; Sign-up → correct URL

5. **Run compare harness and fix pixel mismatches** (1 hr)
   - Verify layout at 360, 390, 430; desktop frame
   - Check button sizing (48px targets), spacing, focus borders, OTP slot styling
   - Generate diff sheets for review

6. **Re-run Codex, fix remaining blockers** (0.5 hrs)

**Total remaining for full session 2 pass:** ~7.5 hrs

## Known Issues / Gaps

- **Session 2 incomplete** — renderers built but not functional; Codex blockers must be fixed
- **Faster-signin-offer, returning-unlock** — built as static renderers; not tested in journey
- **Compare harness** — not set up; no pixel-diff infrastructure
- **D-92 picture re-renders** — doctor name changes not rendered; 10 pictures pending
- **Playwright browser** — Python guards (layout_check, locked-specs, screenshot tools) blocked; non-critical for code
- **No integration tests** — entry journey round-trips not verified
- **Keyboard mock** — not rendered in review/capture modes yet (decision pending)

## Git Log
- f7a196f — checkpoint (a): set-up fixes
- 8164649 — checkpoint (b-partial): screen system + sign-in WIP

---
**Resume from:** Add message keys and complete sign-in testing. OTP is next major piece.
