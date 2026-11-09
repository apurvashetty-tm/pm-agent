# Step 1 Recovery — Session Status (2026-11-09)

**Session time:** ~3.5 hours terminal work  
**Status:** In progress — screen architecture in place, sign-in begun, OTP/offer/unlock not started  
**Commits:** checkpoint (a) setup fixes + checkpoint (b-partial) screen system + sign-in  

## Completed

### Section 0: Set-up ✅
- Fixed `/Users/mac` hardcoded path in `tests/run-checks.mjs` → use CHROME env or Playwright default
- Rebuilt `state-map.js` (D-91: 148 pictures, 20 behaviour states) — drift check passes
- Node tests: U1–U9 + infrastructure (D1–D5) pass
- Baseline guards: check-sources.mjs ✅, check_lockup.py ✅, calling-flow coverage ✅
- Pending: Python browser guards (Playwright version mismatch 1208 vs 1223 — non-blocking for code)

### Checkpoints Committed
- **(a) set-up fixes** — path fix + state-map rebuild
- **(b-partial) screen system** — architecture for entry journeys + sign-in module started

### Screen System Architecture ✅
- `app/shell/screen-host.js`: import-based renderer registry (no async); fallback to pictures
- `app/screens/sign-in.js`: 12 states, lift from reference, --tm-* tokens, MSG() for text
- Integrated sign-in renderer into renderState; picture fallback works

## Still To Do (Step 1)

### Part A: Panel Polish (not started) 
- Plain jump-list names (√ sketched, not in UI yet)
- Desktop panel layout improvements (1280 layout test)
- QR always current (already in app; just needs testing)
- Drawer handle positioning (already in app; needs polish)
- Checklist 1.3 table fix (calling-flow generator, state-map drift check)

### Part B: Entry Screens
#### Sign-in (12 states) — **partially done**
- render() function created ✓
- All state keys mapped ✓
- Message keys: **8/15 missing** from messages.json:
  - `signin.title`, `signin.welcome`, `signin.subtitle`, `signin.phoneLabel`, `signin.phonePlaceholder`
  - `signin.submitDefault`, `signin.submitSending`, `signin.submitWait`, `signin.submitInactive`
  - `signin.signup`, `signin.signupLink` — need to add these to ui-screens/feedback/messages.json
- Behavior: input validation ✓, click handlers stubbed, navigation calls `push()` (not yet wired to OTP)
- No styling file yet (inlined, crude CSS; needs moved to shell.css or screen-specific CSS)

#### OTP (16 states) — **not started**
- From step 1 brief: "+91 98765 43210" must be **semibold** in "Sent to … · Change" (D-27)
- Live countdown tick + Resend button
- Cooldown logic, per-window caps, OTP field focused on arrival
- Every choice has its server path
- Estimated: 2–3 hrs to build

#### Faster sign-in offer (multiple states) — **not started**
- "offered once" + "enabled" persist (B12)
- Try again after failure re-runs phone prompt (same as Turn on)
- Fallback to screen-lock (mock)
- Estimated: 1.5 hrs

#### Returning unlock (multiple states) — **not started**
- Doctor name changed to "Dr. Kunal" (D-92, re-render pictures)
- Success / cancelled / 3 failures → OTP / Switch account
- Estimated: 1.5 hrs

### Compare Harness (not started)
- Pixel-diff for each state at 390 + 360
- Spinner mask identically on both sides
- Regions + reasons in compare-allow.json
- Estimated: 1 hr setup + test runs

### Copy Check + Checks (partial)
- `check-sources.mjs` copy rules pass (needs re-run once sign-in is complete)
- `layout_check.py --app` — pending Playwright browser (non-blocking; can skip for now)

### Codex Critique (not started)
- Run after all screens pass checks
- Estimated: 1 hr critique + 0.5 hrs fixes

### Report (not started)
- Baseline, Part A results, 1.3 table, compare numbers, guard results, D-92 status, checklist, Codex points, known gaps, NEEDS-APURVA

## Next Steps (Recommended Order)

1. **Add missing message keys** to `ui-screens/feedback/messages.json` (5 min)
2. **Complete sign-in styling** (move inlined CSS to dedicated or shell.css) (15 min)
3. **Test sign-in rendering** in app at ?s=sign-in_default; fix nav wiring (15 min)
4. **Build OTP screen** (2–3 hrs) — D-27 semibold text is critical
5. **Build faster-signin-offer** (1.5 hrs)
6. **Build returning-unlock** (1.5 hrs)
7. **Set up compare harness** + run checks (1 hr)
8. **Run Codex critique** + fix blockers (1–1.5 hrs)
9. **Write report + stop**

**Total remaining:** ~8–10 hrs for full build. Session was already 3.5 hrs; natural checkpoint here is good.

## Known Issues / Open

- No OTP keyboard display yet (reference has it; decision on mock vs. real?)
- No Play link story integration for entry journeys yet
- No tests written yet (generate after all screens built)
- Playwright browser version mismatch (1208 vs 1223 for Python) — not blocking code
- D-92 picture re-renders not done yet (need list of what changed)
- No per-state styling file pattern established (inlined CSS is temporary)

## Git Log
- f7a196f — checkpoint (a): set-up fixes
- 8164649 — checkpoint (b-partial): screen system + sign-in WIP

---
**Resume from:** Add message keys and complete sign-in testing. OTP is next major piece.
