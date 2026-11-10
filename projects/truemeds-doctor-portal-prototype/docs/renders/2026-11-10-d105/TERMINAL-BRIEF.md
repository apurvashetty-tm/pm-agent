# Brief — D-105 returning unlock with two buttons + D-104 leftovers (small run)

Folder: the project folder (project branch). Evidence: this folder. **Aim: an hour or two.** Read `docs/runs/RULINGS.md` first, then D-105 (and D-104, D-61, D-101) in `docs/context/decision_log.md`, and the D-105 table in `docs/proposals/2026-11-10-release-checklist.md` (C1–C12, A6–A8, B5) — that table is the full list of touchpoints. Starts after the wheel-keyboard run; build on its result.

## 1 · D-105 (C2–C10)
- **Rule:** returning unlock has two buttons: Unlock (primary) · Use OTP instead (quiet). "Not you? Switch account" is gone in every unlock state. Use OTP instead, and the automatic fallback after 3 failed unlocks, open **Sign-in with the remembered number filled in**; no SMS is sent until Send OTP. Editing the number there behaves as Switch account did. The "isn't available" state: Use OTP instead stays the main button and opens the same prefilled Sign-in. Sign-in reached this way follows the normal Sign-in rules (no Back; phone back leaves the app, D-101) — **no special back handling**.
- **Rules and copy:** `ui-screens/app-logic.md` §2 unlock line; `docs/feedback-state-map.md` unlock rows + one row "sign-in from unlock, number filled in", then regenerate `app/state-map.js` and `docs/state-map.md`; remove `unlock.notYou` / `unlock.switchAccount` from `messages.json`, `metadata.json`, `visible-strings.json` and regenerate `messages.js` (both copies) and `messages.ts`.
- **Approved screen:** `ui-screens/returning-unlock/returning-unlock.html` — remove the Switch account row only; nothing else moves except the bar height. **Re-render** the 7 unlock states × 360 and 390 (14 pictures) with the usual render script, update the README count and review sheet. These are for Apurva's approval: put a side-by-side before/after sheet in this folder.
- **Prototype:** `app/screens/returning-unlock.js` (drop the button, route Use OTP and the 3-failure fallback to sign-in) and `app/screens/sign-in.js` (accept a filled-in number; cursor at the end; Send OTP enabled when valid).
- **Tests:** update entry journeys for unlock (old "Use OTP → OTP screen with SMS" and "Switch account" steps are superseded by D-105 — test edits, not disputes); add: unlock → Use OTP → sign-in prefilled, no SMS; 3 failures → same; edit number → OTP for the new number. Picture compare against the new pictures.
- **Kit:** regenerate (`node scripts/build-handoff.mjs`), `--check`, `tests/codex/handoff/`.
- **PRD:** §5.4 "What the doctor can do" and rules in `docs/prd/PRD.md` and `docs/prd/PRD.confluence.md` (do NOT push to Confluence). `node docs/prd/check-prd.mjs`.
- **Leave alone:** `ui-screens/native/UnlockScreen.tsx` and the old prototype (`index.html`, `app.js`).

## 2 · Leftovers (A6–A8, B5)
- D-104 wording: `docs/feedback-state-map.md` "Shown once after the first successful OTP sign-in", `app/review/state-names.js` "Offer shown once after first sign-in", the comment in `app/screens/otp.js` → match D-104 (offered at each OTP sign-in, at most 3 times).
- `ui-screens/app-logic.md` §3: one line on how the availability wheel behaves, as built in the wheel-keyboard run (swipe, snap to 15-minute steps).
- Search the project once more for "Switch account", "notYou", "shown once" and "offered once" outside the two left-alone places; fix or list in the report.

## Checks
entry-journeys, run-checks, `check-sources.mjs`, `layout_check.py --app`, `check-locked-specs.py`, token check, PRD check. One Codex review (correctness vs D-105 and this brief), one fix pass. No deploy, no Confluence.

## End
Short `REPORT.md` here, listing C1–C10 and A6–A8, B5 as done / not done. Append `DONE d105` (or `STOPPED d105: <reason>`) to `docs/runs/STATUS.md`, publish with `bash ../../scripts/publish.sh -m "..." <files>`, stop.
