# Prescribe — one medicine

The Prescribe screen edits one medicine on a case: how often it is taken, the dose for that form, the duration, food, and any extra instructions. The doctor can also disable the medicine. Prescribe is part of the case page, so the source is `../case/case.html` (the screen is opened from a medicine row on the case page, D-54).

## What the doctor can do (app-logic §8)

- **Prescribe** sets the schedule and saves; the medicine becomes Prescribed (and is re-enabled if it was disabled).
- **Disable** removes the medicine from the order, with a reason (D-59).
- **✕ with changes** asks before discarding (D-54).
- The doctor does **not** add medicines or set the quantity (D-04, D-06). Quantity is read-only on the case page.

## How to open a state

Open `../case/case.html?s=<state>&start=case&capture=1` in a browser (add `&w=360` for the 360 width). The state id is the picture name without the size suffix, for example `d-every-x-hours`.

## States in this folder

| Group | States | What it shows |
|---|---|---|
| Form and dose | `d-default` (tablet and capsule, daily), `d-syrup`, `d-drops`, `d-inhaler`, `d-injection-default`, `d-cream` | Dose slots and units by form (D-54, D-56) |
| How often | `d-every-x-hours`, `d-alt-days`, `d-weekly`, `d-monthly`, `d-sos-only`, `d-sos-on` | Schedule choices, SOS maximums |
| Dose, duration, food, notes | `d-error-dose`, `d-error-other`, `d-duration-picker`, `d-food-selected`, `d-notes-keyboard`, `d-scrolled`, `d-header-white` | Validation messages, duration list, food choice, keyboard, scroll |
| Sheets and failures | `d-disable-sheet`, `d-discard-sheet`, `d-rx-failed` | Disable reasons, discard confirmation, prescription viewer failure |

## Decisions

- Doses are fixed per form (a single 7-row table keyed by form, D-70 pt 7). No per-medicine dose logic.
- "Max doses a day" is 1–4; "Every X hours" is 4, 6, 8 or 12 hours; durations are one standard list (D-70 pt 7).
- The screen shows no quantity (D-56 pt 7).
- Disabling a medicine removes it from the order; there is no extra warning for the last medicine (D-59 pt 3).
- The medicine name is shown in the header, and the "On prescription" line updates on every tap (app-logic §8).
- Copy comes from `feedback/messages.json`.
