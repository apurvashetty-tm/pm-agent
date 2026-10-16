# Phase D · round 2 — changes (Codex round 2: nine batches, 34 states)

Fixed before round 2 (self-audit and round 1 blockers):
- Bar hides while a text field has focus: the page's own rule restored (a-notes-typing). Verified in the DOM.
- Closed notes and instruction fields are read-only and muted (e-*). Verified.
- Zoom hint: first moved over the text (regression, caught in the render), then placed as its own row above the paper. Hint colour is the on-dark inverse token (contrast on the dark viewer). The paper stays exempt (mock Rx document).
- Duration label-to-field gap: 8 px, matches the other cards (measured).
- Injection heading: "Dose" (D-15).
- Round 1 flags on the Rx hint and notes: see round 1.

Flagged by Codex round 2, with decision:
- Rx dates and the B12 Rx direction line (a-rx-viewer, a-order-details): **rejected for this round, raised as Needs Apurva** — mock-data alignment; not a layout decision.
- "Releasing…" button looks pale (a-releasing): **fixed** — an inherited 0.85 opacity from the page's busy style; busy primaries are full brand (verified opacity 1).
- End call: destructive boundary not visible (a-back-blocked, b-on-call, round 2 again): **fixed in the design system** — the destructive outline used the subtle error border; it now uses `--tm-border-error-strong` (red-600), a non-text contrast boundary. Also the call button's inset border had been removed by the glow fix; restored (verified).
- Side margin 16 px, required 24 px (RULES §8.2) on the case page, Prescribe and sheets (b-*, c-*, d-*): **fixed** — 24 px on the content, the bar, the Prescribe body and the sheets (verified: card left edge 24 px).
- View Rx and Order details look tappable when closed (e-*): **fixed** — muted, no raised button, icons secondary.
- Missed-call sheet should go straight to the unavailable end card (b-missed-call): **rejected** — D-51 changes the patient-unavailable end (the sheet after "Mark unavailable"); the missed-call sheet is the page's existing flow.
- Pending statuses on the unavailable end (e-patient-unavailable): **rejected** — see round 1; Needs Apurva.
- Keyboard on device (d-notes-keyboard): **rejected** — D-51.
- Toast over content (a-back-blocked): **rejected** — feedback rules §5.
