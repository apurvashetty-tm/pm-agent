# D · changes (rounds 1–7 review → fixes → final round 9)

Review history: round 1 (my contact-sheet review + Codex-free self-audit); round 2 Codex (case/call, sheets/Prescribe, endings/new/stress); round 3 Codex (case/call); round 4 Codex (sheets/Prescribe, endings/new/stress); round 5 Codex (sheets/Prescribe, endings/new/stress); round 6 Codex single-state batch (4 flagged); round 7 Codex single-state batches (home ×3 for C, and a-top/s-optional-empty/d-rx-failed for D). Final round 9 is the render set in `final/`.

## Flagged and fixed
- End call used the destructive outline; D-52 says call-end (solid red). Now call-end.
- Leave sheet invisible: local `.bottom-sheet` hides sheets until `.open`. Now the central `.tm-sheet` alone; focus moves in on open.
- Back-blocked toast was a light notice; now the central dark `.tm-toast`, one line (two lines at 360, RULES §9.5), anchored above the pinned bar through the frame variable.
- Frame: `#mobile-column` gets `transform` so fixed overlays anchor to the frame (RULES §7.4).
- Offline and confirm-failed notices were under the pinned bar (7b.4). Moved to the top of the content, on a white card (1.5).
- Sheets: six case sheets on the central template (header, title, close, body, actions), options as `.tm-option`, actions in `.tm-sheet__actions`, sentence-case titles and labels (Schedule callback, Skip HA call, Confirm callback, Retry call, Mark as unavailable, Request next case).
- Prescribe: edit header is central `.tm-header-edit`; disable sheet title "Disable <medicine>" and subtitle "Select reason" (D-52); retired 40/32 sizes removed (3.4).
- Viewer header: central `.tm-header-viewer`; tools on their own row, so the title is never cut (1.4).
- Medicine meta, order-detail and Prescribe helper text 12 → 14px (2.2).
- Schedule callback day chips are a free group; time slots on the central 4-column grid (5.4).
- SOS grids share the dose chips' inset, so every option chip on the screen is one size (5.4).
- Pair under the primary side by side (7.5); labels fit at 360 with 8px side padding (3.5 measured).
- Order details and View Rx on one white card (1.5, D-52).
- Back to Home quiet in every ending (D-52).
- Load failed: notice on a white card; Try again pinned in the bar (1.5, 1.6). Rx failed: Try again pinned at the foot of the viewer; zoom tools and hint hidden while the image cannot load.
- Callback failed: notice with 16px gap; error text has an icon (4.8).
- Stress: no-order-details case hides the order-details control; long names wrap to two lines on that screen (header height per screen, RULES §8.5).
- Mock data: Cat4 order dates 14 and 17 Oct 2026; B12 Rx line "1 injection once a month · Qty 4" (2.8).
- HA notice not shown (D-52).
- Notice copy: new states use messages.json (proposed), added to the registry. Build regenerated `messages.js` only; native file restored.

## Rejected (with reason)
- Codex round 4: header height on the long-name screen (7.4). RULES §8.5 sets header height per screen; the header is fixed while scrolling. Kept.
- Codex round 4: "order" in the end-of-call script (2.6). The script is patient-facing and "order" means the customer's order. Kept. Not a doctor's act.
- Codex round 5: Rx failure notice has no next step (7b.5). Copy is proposed and used as written. Route to Apurva (NEEDS-APURVA §D).
- Codex round 5 / 7: notes-keyboard capture (1.7). No on-screen keyboard in the concept. Device check (D-51).

## Central gaps (stop and report; not edited)
- Tag reserved width (5.5). Field control input height (4.1). Four-column chip padding (time slots wrap). Read-only variant for closed cases. Compact task header class. See NEEDS-APURVA §A.

## Open at round 9
- 5.5 (central tags), 4.1 (central field input, other-dose input), 5.12 (21: 19 in styles.css, 2 closed-case and busy-fade rules in concept).
