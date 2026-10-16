# Phase D · round 3 — changes (Codex round 3, the last allowed round: nine batches, 34 states)

Fixed before round 3: the round 2 fixes above (verified in the DOM), plus the design-system destructive border and the 24 px margins. No new fixes were needed for round 3 blockers.

Codex round 3:
- BLOCKERS: one — the Rx mock data (a-rx-viewer): Rx date and B12 direction versus the mock order and medicine data. **Not fixed here; it is a mock-data decision.** Goes to Needs Apurva (D/NEEDS-APURVA.md, item 1). Not an open blocker of the layout.
- Suggestions taken after the round cap (verified in the DOM, not re-reviewed by Codex):
  - Releasing: close and "Stay on this case" disabled while the release runs (a-releasing). Verified.
  - Closed endings use the neutral "Medicines" heading, not "Medicines to prescribe" (e-patient-unavailable and the other closed states). Verified; statuses unchanged.
- Suggestions rejected:
  - Rx title dangling dash (the page's own text).
  - Prescribe "Max extra doses" under the bar when scrolled (d-sos-on): the body scrolls; a device check (D-51 defers).
  - Status-tag width alignment (e-*): pre-existing layout; Needs Apurva (minor).
  - Keyboard clearance on device (d-notes-keyboard): D-51.
