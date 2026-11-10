# Doctor app: everything before the final deploy (checklist)

2026-11-10 · Covers three changes: **D-104** (offer re-asked, max 3, built), **F-04 / F-05** (swipe wheel and keyboard, run in progress) and **D-105** (returning unlock: two buttons, built in the d105 run). Then one release. Found by searching the whole project for each change.

Legend: ✅ done · 🔄 in the running run · ⬜ to do

## A · D-104: faster sign-in offer re-asked at each OTP sign-in, max 3 (built, reviewed)

| # | Touchpoint | Status |
|---|---|---|
| A1 | Decision log D-104, OQ-023 answered | ✅ |
| A2 | App rules (`app-logic.md` §2) | ✅ |
| A3 | Prototype code + setting `fasterOfferMax` + tests | ✅ |
| A4 | Hand-off kit (DECIDED, setting) | ✅ |
| A5 | PRD §5.3, §7, §10 + Confluence | ✅ |
| A6 | **Leftover:** state map says "Shown once after the first successful OTP sign-in" (`docs/feedback-state-map.md`) | ✅ fixed in the d105 run |
| A7 | **Leftover:** review panel's state name "Offer shown once after first sign-in" (`app/review/state-names.js`) | ✅ fixed in the d105 run |
| A8 | **Leftover:** a code comment in `app/screens/otp.js` | ✅ fixed in the d105 run |
| A9 | Screen pictures | ✅ no change (nothing visible changed) |

Old review documents that say "offered once" (rebuild checklists from Oct–Nov) are history and stay as they are.

## B · F-04 swipe wheel, F-05 keyboard (done, reviewed 2026-11-10)

| # | Touchpoint | Status |
|---|---|---|
| B1 | Prototype: wheel swipes and snaps (Home setup + Add time sheet), same look | ✅ |
| B2 | Prototype: keyboard never covers the field or the main button, every screen | ✅ (case + Prescribe keep D-81 bar-hides) |
| B3 | Tests for both + picture compare (no visual change) | ✅ 15/15; 132 pictures 0 over 1 % |
| B4 | Kit: wheel rule (Android needs a wheel component) + keyboard rule | ✅ |
| B5 | **Missing from the run:** app rules (`app-logic.md` §3) say how the wheel *behaves* (swipe, snap) | ✅ added in the d105 run |
| B6 | PRD: §6 already has the keyboard rule; §5.5 "a wheel in 15-minute steps" is enough | ✅ no change |
| B7 | Design system: if the wheel needed a new design value, it goes to `main` first on its own shared PR | ✅ checked: wheel CSS uses existing tokens only; keyboard rules already in RULES §8.9 and D-81 — no design-system change |
| B8 | **Your phone check** through the local link: spin the wheel; type an OTP and see Verify stay visible | ⬜ after the run |

## C · D-105: returning unlock with two buttons (agreed 2026-11-10; no special back gesture; built in the d105 run — C2–C10 done, pictures await approval; see `docs/renders/2026-11-10-d105/REPORT.md`)

**Change:** drop "Not you? Switch account". **Use OTP instead** opens sign-in with the number filled in (no SMS until Send OTP; the doctor can change the number there). The automatic fallback after failed unlocks goes to the same place. "Not available" state: Use OTP instead is the one main button.

| # | Touchpoint | What changes |
|---|---|---|
| C1 | Decision log | D-105, amending D-61 point 3 |
| C2 | App rules `app-logic.md` §2 | unlock line: no Switch account; Use OTP → sign-in prefilled |
| C3 | State map `feedback-state-map.md` (+ generated `app/state-map.js`, `docs/state-map.md`) | unlock rows; new behaviour row "sign-in from unlock, number filled in" |
| C4 | Copy: `messages.json`, `metadata.json`, `visible-strings.json` → regenerated `messages.js` (both copies) and `messages.ts` | remove `unlock.notYou`, `unlock.switchAccount` |
| C5 | **Approved screen** `ui-screens/returning-unlock/returning-unlock.html` | remove the Switch account row |
| C6 | **Re-render pictures**: 7 unlock states × 360 and 390 = 14 pictures, plus the README count and review sheets | new pictures, for your approval |
| C7 | Prototype `app/screens/returning-unlock.js` + `sign-in.js` (accept a filled-in number) | build |
| C8 | Tests: entry journeys (unlock), picture compare against the new pictures | update |
| C9 | Hand-off kit: regenerate (unlock screen file, DECIDED, "When this shows" lines) | regenerate |
| C10 | PRD §5.4 (+ Confluence copy) | "What the doctor can do" and rules |
| C11 | Old October native files (`ui-screens/native/UnlockScreen.tsx`) | **leave** — already superseded by the kit |
| C12 | Old prototype (`index.html`, `app.js`) | **leave** — frozen reference |

**One question:** when a doctor comes from unlock to sign-in, should the phone's back gesture return to the unlock screen? I'd say yes. Sign-in shows no Back button, as now.

## D · Release (after A–C)

| # | Step |
|---|---|
| D0 | **Completeness sweep before the PR** (main thread): search the whole repo — project, `design-system/`, shared `scripts/`, `docs/` — for every rule changed in A–C (old wording, removed copy keys, old button names); every hit is fixed or listed as deliberately left. Plus the design-system diff and token guard. No PR until this is clean. |
| D1 | Review all three runs; all checks pass; you approve the new unlock pictures + phone check (one sitting) |
| D2 | New release PR from `main` (everything except run evidence), `[deploy]` in the title, merged → **final deploy** |
| D3 | Live check: app, `?demo=1`, `/kit`, downloads, **`/calling-flow/`**, wheel and keyboard on your phone |
| D4 | PRD: calling-flow link → new site; re-push to Confluence |
| D5 | Engineer walkthrough with the kit |
| D6 | Your approval of everything → archive tag on the branch |
| D7 | GitLab copy (last) |

## Order

B running now → C as one small run right after (it also fixes A6–A8 and B5) → D1 your review → D2 deploy.
