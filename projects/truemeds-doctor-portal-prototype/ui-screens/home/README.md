# Home — approved wheel-only references

Final control selected by Apurva on 2026-10-13: **wheel**. Tap/stepper alternative removed from active handoff, HTML selectors and native picker implementation. Historical draft galleries are superseded comparisons.

## Approved states (in home.html)

- `setup-wheel` — initial setup, with “Minimum 15 minutes” once (picture `home_setup-wheel`).
- `active` — active Home (picture `home_active`).
- `add-wheel` — add-time sheet; no repeated minimum reminder (picture `home_add-wheel`).
- The other Home states and the Profile pages (`profile`, `profile-case-open`, `logout-confirm`) are listed in `../README.md`.

Pictures: `home_<state>_w360.png` / `_w390.png` in this folder, rendered from `home.html`. The 2026-10-13 pictures and their approval manifest are in `docs/_superseded/ui-screens-2026-10-13/home/`.

## Editable source

- home.html (all Home states, including the wheel add-time sheet and Profile); shared home-reference.js/css. The earlier separate reference pages `availability.html` and `add-availability.html` were retired on 2026-10-29 (their states are in `home.html`).
- ../native/HomeScreen.tsx and DurationPicker.tsx: React Native reference components, wheel only.
- home.native.ts: native behavior contract.
- Decision: D-40; spec: ../../docs/concepts/2026-10-12-home-jtbd.md.

Presets 15/30/45 minutes and 1/2/3 hours remain. Minimum and increments are 15 minutes. “Remove tap option” means the plus/minus alternative, not the quick presets.

## Validation limits

PNG provenance is programmatic rendering, not captures of current HTML/native sources. HTML wheel remains a listbox stand-in; browser/native pixel parity and device gesture checks are outstanding. Setup CTA remains 56pt below active Home; final-option selection did not silently change approved layout.

See SOURCE-PARITY-2026-10-13.md for prior source audit and ../../docs/reviews/2026-10-13-feedback-consistency-audit.md for latest error-screen findings. The latest wheel-only selection supersedes references to two control options in earlier audit notes.
