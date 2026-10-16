# D · round 10 changes (D-53) — final round 14

- Header: local `#case-head` replaced by the central `.tm-header-task--compact` (+ `__row`, `__title`, `__meta`, `--no-back`). Back hidden once a call is attempted or the case is closed.
- Pinned bar: every button 56px and full width; pair as equal halves (stacked below 380px); a lone secondary is full width; Back to Home primary only when availability has ended.
- Offline and confirm-failed notices inside the bar, above the buttons (D-53 4b).
- Status tags: `.tm-tag--fixed` (5.5).
- Schedule callback time slots: `.tm-chip-grid--3`, with a local 8px side padding (open item 2).
- Closed content: `.tm-readonly` on medicines and case tools, `.tm-field--readonly` on the notes field, `.tm-row--readonly` on rows; chevrons removed (`.tm-row__chevron`); rows disabled and not focusable.
- Concept loads `concept-styles.css` (a copy of styles.css with central restyles removed). Local muting, busy-fade and `.tm-btn` rules removed.
- Status card is the first thing in the content.
- Mock data: order dates patched before render (switchScenario); empty-medicines count hidden.
- Guard: 5.6 now detects the trailing chevron by position (icons.js replaces data-icon); 4.1 treats a 48px control as the tap target (central); 5.12 ignores comments; the D scan reads concept-styles.css.
- Codex checks (round 10 journeys): case/call blockers 5.7 and 5.12 fixed; round 11 blocker 5.6 (chevrons) fixed; round 12 blocker 5.6/7.6 fixed; sheets/Prescribe and endings/new/stress: no blockers; sign-in/OTP and Home: no blockers.
- Guards: round 14 zero failures for A–D at 390, 360 and 430; zero console errors.
