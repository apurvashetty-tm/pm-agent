> **Main thread, 2026-11-09 07:45:** work is now split into sessions — see the table at the top of `TERMINAL-BRIEF.md`. Session 1 = done. Session 2 = started 2026-11-09 16:30, Codex critique complete.

# Step 1 Recovery — Session Status (2026-11-09)

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
