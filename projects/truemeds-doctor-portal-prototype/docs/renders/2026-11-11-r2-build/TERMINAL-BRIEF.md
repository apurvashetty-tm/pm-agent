# Run 2 of 2 — Build everything agreed (checklist rows P, R, U, T, K, D, F1)

Folder: the project folder (project branch). Evidence: this folder. **Aim: 3–4 hours.** Read `docs/runs/RULINGS.md`, **D-106–D-109**, `docs/proposals/2026-11-11-release-checklist-2.md` (the list you tick), run 1's `docs/renders/2026-11-11-r1-rules/REPORT.md` and the updated `design-system/RULES.md`.

**Gate:** if run 1's last STATUS line isn't `DONE r1-rules`, or its checker unit tests don't pass now, write `STOPPED r2-build: run 1 not done` and stop.

## Order
1. **Codex writes the tests first** (T2–T4): unlock auto-prompt (opens once on arrival, cancel → today's screen, retry, 3 failures → sign-in prefilled), sign-in and OTP states incl. errors, Home wheel 0–10 h edges, add-time cap and "Add 9 h 45 min", Add time offline, Rx row → Profile and back, ended count row, every Home state, keyboard at 360. Existing tests that assert old behaviour (A-09 near-expiry Add time, A-10 labels, "no maximum", old copy) are superseded by D-106–D-109 — test edits, not disputes.
2. **Rules and copy** R1–R3 (app-logic, feedback-state-map → regenerate, messages registry → regenerate).
3. **App** P1–P10: one shared band block for the five screens, then each screen. Use the run-1 classes (inline link, sheet subtitle). Tokens only.
4. **Approved screens** U1–U3: the `ui-screens/` HTML matches the app; re-render every state at the set's sizes in real-size frames; before/after sheets for Apurva.
5. **Checks** T1 (the visible-gap checker on every in-scope screen and state, 360 × 640 and 390 × 844 — all pass), T5, T6.
6. **Kit** K1–K2, **PRD** D1 (no Confluence push).
7. **Codex review** of the build against D-106–D-109 and the checklist; one fix pass; re-run all checks.
8. **F1:** one side-by-side sheet `all-screens.png` — every in-scope screen and state at 390 wide, same scale, in flow order (sign-in → OTP → offer → Home setup → available → … ; unlock → Home).

## Rules for this run
- Don't reopen decisions; if something in D-106–D-109 can't be built as written, take the closest reading, note it, and list it under NEEDS-APURVA.
- Don't deploy. Don't push to Confluence. Don't merge anything.

## End
`REPORT.md` here: **every checklist row** (P, R, U, T, K, D, F1) ✅ / ❌ with evidence (file, test name, picture), the checker summary, Codex findings judged, NEEDS-APURVA. Append `DONE r2-build` (or `STOPPED r2-build: …`) to `docs/runs/STATUS.md`, publish, stop.
