# Run A1 — Codex test disputes (for the main thread to rule on)

Codex's tests (`tests/codex/run-A/`) are unchanged. Result for steps 2–4 after the build and the critique fixes
(`codex-run-A-2.log`): every A1 case passes except the four below. Each one contradicts an approved picture or decision; the app
follows the picture. Adapter gaps were fixed in the app, not here (reference ids kept, `role="switch"` + `aria-checked` on the
Profile toggle, the Ongoing chip named by its visible label, the printed line keeps a number and its unit together with a no-wrap
span instead of a no-break space so plain-text matching works).

| Test | What it expects | What the approved spec says | Proposed ruling |
|---|---|---|---|
| **A-C01** "ready Back opens leave; stay and close preserve case" | Clicks **"Stay on this case"** in the leave sheet. | The approved pictures `a-leave-sheet`, `s7e-leave-sheet` and `a-releasing` show **"Stay"**. The copy round changed it: D-84, `docs/reviews/2026-11-03-copy-audit/COPY-ANNEX.md` CA-22 / F20 ("Stay on this case" → "Stay", applied, 3 states); COPY-RULES rule 16 (the pair is "Release case" / "Stay"). `app-logic.md:90` and `:101` still say "Stay on this case" — a stale line. | Test bug: click **"Stay"**. Fix the two stale app-logic lines (main thread, docs). |
| **A-P07** "Other accepts only positive decimal numbers" (state `d-syrup`) | Clicks **Other** on `d-syrup`. | `d-syrup` is the syrup on a **Daily** schedule: the approved picture shows the M / A / N grid (0 · 2.5 · 5 · 10) and no Other. Other is a single-dose choice (app-logic §8 table "Single dose options … Other (ml)"; `case.html` renders Other only when How often is not Daily). | Test bug: on `d-syrup` pick a single-dose schedule first (e.g. **Weekly**), then Other. The same check on a single-dose schedule passes: `tests/build-fast-a1.mjs` R10-a (syrup, Weekly → Other: invalid values refused with the ml error; 7, 7.5 and .5 saved). |
| **A-OPTIONS-d-every-x-hours** | Buttons named exactly **4, 6, 8, 12**. | The approved `d-every-x-hours` picture shows chips **"4 h" · "6 h" · "8 h" · "12 h"**, each with the accessible name "Every 4 hours" … (approved `case.html`, kept as the lift). | Test bug: match `/^Every 4 hours$/` (or `"4 h"`). |
| **S-360 / S-390-a-loading** "opens built content" | Non-empty `innerText` in `#screen`. | `a-loading` is a skeleton with **no text and no actions** until loaded (D-81 F28; feedback-state-map `case.loading`). The built screen is the skeleton (role="status", aria-label "Loading case"), not a picture; it matches the picture exactly. | Test bug: for `a-loading` accept the skeleton (`[role=status][aria-label]`) instead of text. |

Not disputes (A2 scope, listed so nothing is lost): the calling states `t02`–`t09`, `s7*`, `c-*`, `e-callback-scheduled`,
`call.hold`, `flow.HOLD` and the A-CTA / A-CALL / A-HOLD / A-CB / A-U / A-EDGE / A-GATE / A-RECORD / A-ROUTE / A-COUNT / A-F / A-N
cases are step 5 (run A2). `t01-ready`, `t10a-confirmed` and `e-availability-ended` are already built (the case page's Ready and
closed looks) and pass their smoke checks.
