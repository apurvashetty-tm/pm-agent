# Home — approved wheel-only references

Final control selected by Apurva on 2026-10-13: **wheel**. Tap/stepper alternative removed from active handoff, HTML selectors and native picker implementation. Historical draft galleries are superseded comparisons.

## Approved files

- availability_wheel.png — initial setup, with “Minimum 15 minutes” once.
- home_active.png — active Home.
- add-availability_wheel.png — add-time sheet; no repeated minimum reminder.

Pictures: the approved 2026-10-15 set (360 and 390, `home_*_w360.png` / `_w390.png`). The 2026-10-13 pictures and their approval manifest are in `docs/_superseded/ui-screens-2026-10-13/home/`.

## Editable source

- availability.html, home.html, add-availability.html; shared home-reference.js/css.
- ../native/HomeScreen.tsx and DurationPicker.tsx: React Native reference components, wheel only.
- home.native.ts: native behavior contract.
- Decision: D-40; spec: ../../docs/concepts/2026-10-12-home-jtbd.md.

Presets 15/30/45 minutes and 1/2/3 hours remain. Minimum and increments are 15 minutes. “Remove tap option” means the plus/minus alternative, not the quick presets.

## Validation limits

PNG provenance is programmatic rendering, not captures of current HTML/native sources. HTML wheel remains a listbox stand-in; browser/native pixel parity and device gesture checks are outstanding. Setup CTA remains 56pt below active Home; final-option selection did not silently change approved layout.

See SOURCE-PARITY-2026-10-13.md for prior source audit and ../../docs/reviews/2026-10-13-feedback-consistency-audit.md for latest error-screen findings. The latest wheel-only selection supersedes references to two control options in earlier audit notes.
