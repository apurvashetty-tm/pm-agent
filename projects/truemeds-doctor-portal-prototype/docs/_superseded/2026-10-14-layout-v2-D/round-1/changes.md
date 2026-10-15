# Phase D · round 1 — changes (Codex round 1: nine batches, 34 states)

Before review (self-audit): 44 pt targets on the Rx viewer controls and the Prescribe Disable action (RULES §8.6). Re-rendered.

Flagged by Codex, with decision:
- Notes field behind the pinned bar (a-notes-typing): **fixed** — the bar's page-level hide rule was overridden by the concept CSS; restored (round 2).
- Destructive End call read as red text with no visible boundary (a-back-blocked, b-on-call): **taken to round 2** — see round 2 and the design-system change.
- Closed notes field looks editable (e-transferred): **fixed** — read-only and muted in closed endings (round 2).
- Zoom hint overlaps the prescription's General advice (a-rx-viewer): **fixed** — hint moved to its own row above the paper (round 2).
- Viewer title "Prescription —" (a-rx-viewer): **rejected** — the page's own title text; out of this pass.
- Rx dated 14 Oct 2026, order created 12 Aug 2024 (a-rx-viewer, a-order-details): **rejected** — the Rx date is the day it is issued (the page's own clock); order dates are mock data. Raised as Needs Apurva (mock-data alignment).
- Duration label-to-field gap larger than other cards (d-default): **fixed** — measured: other cards 8 px, Duration was 24 px. Now 8 px (round 2).
- Callback sheet gap between date choices and "Time" (c-callback): **rejected** — measured 16 px, the related gap; no change.
- "Dose (units)" on the injection (d-error-other): **fixed** — D-15 says injection heading is plain "Dose"; the Other entry keeps "Dose in units". Concept label fix; the page build must follow.
- Keyboard absent from the notes and instructions states: **rejected** — D-51 defers keyboard checks to the device.
- Closed medicines show "Pending" (e-patient-unavailable): **rejected** — no prescription was confirmed, so the true status is Pending (D-48/D-51 apply to confirmed endings). Raised as a question.
- Badges in the closed state (b-unavailable-sheet): **rejected** — statuses stay readable; D-51 defines them.
- Medicine line wraps to three lines (b-post-gate-cat4): **rejected** — the page's own layout.
- Status-tag width changes the row wrap (e-prescription-confirmed): **rejected** — pre-existing layout; Needs Apurva (minor).
- Toast-style notice covers "Notes & symptoms" (a-back-blocked): **rejected** — feedback rules §5: the message sits above the action bar by design.
