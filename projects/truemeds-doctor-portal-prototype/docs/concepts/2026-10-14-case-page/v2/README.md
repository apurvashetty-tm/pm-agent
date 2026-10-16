# Case page — concept v2, full phase D render (D-48, D-49, D-50)

Status: **CONCEPT — Reviewed (D-51 applied) — yet to be approved by Apurva.** `concept.html` is a copy of `index.html`; `index.html` and `app.js` are not edited. Only the case header, the content row, the end-of-case card and its exits, the D-50 labels, sentence case, the design-system success tag, and a Prescribe header **proposal** differ. No consultation logic, CTA routing or valid-call gate is changed. Nothing is built into the prototype until Apurva approves.

Files: `concept.html` · `full/<state>_w390.png` and `full/<state>_w360.png` (34 states × 2 widths) · `full/metrics.json` · group contact sheets `full/contact-A-…png` to `full/contact-E-…png` · Codex round 1 per batch `full/codex-round1-batch{1–9}.md`.

Open a state: `concept.html?start=case&s=<state>` (add `&w=360` for the 360 check).

## Coverage matrix (checked against index.html's sheets and docs/feedback-state-map.md)

Sheets in index.html: sheet-callback, sheet-skip-ha, sheet-retry (missed call), sheet-unavailable (patient unavailable), sheet-discard (Prescribe), sheet-disable-reason (Prescribe), sheet-overlay. Not part of the case page, so **not** in this matrix: sheet-bio, sheet-logout, sheet-profile (home, sign-in and profile flows). Not on the phone frame: `#desktop-side-panel` (shows only at 1100px and wider; it holds the HA banner) and the demo bar (developer controls).

### A. Case page
| State | Renders | Status |
|---|---|---|
| a-top | Cat4 before any call: header (Back, name 20/28, two meta lines, Help), content row (Order details ⓘ, View Rx), medicines, notes, Call patient pinned | rendered |
| a-scrolled | same, scrolled under the fixed header (header height constant) | rendered |
| a-order-details | Order details expanded in the content row | rendered |
| a-rx-viewer | Rx viewer (View Rx) | rendered |
| a-notes-typing | notes field focused; the pinned bar hides while typing (page CSS) | rendered; **no on-screen keyboard exists in the page** — see Needs Apurva 3 |
| a-leave-sheet | Leave this case? (D-48), Back before first attempt | rendered |
| a-releasing | Release case busy (L2) | rendered |
| a-back-blocked | Back during a call: neutral message above the bar | rendered |
| — HA transfer banner (value meds) | in `#side-ha-banner`, desktop side panel only | **not on the phone frame** — Needs Apurva 2 |

### B. Call
| State | Renders | Status |
|---|---|---|
| b-calling | Calling (the page's own calling state; there is no separate "connecting" state) | rendered |
| b-on-call | connected, Schedule callback and End call in the bar | rendered |
| b-ended-early | call ended before 50 s: back to assigned, gate not passed | rendered |
| b-missed-call | no pickup: the page's retry sheet, Retry call and Mark as unavailable | rendered |
| b-unavailable-sheet | Mark as unavailable: no sheet; straight to the end card "Patient unavailable" with a neutral icon (D-51) | rendered |
| b-post-gate-transfer | gate passed, value meds HA: Confirm & transfer, Skip HA call, Schedule callback | rendered |
| b-post-gate-cat4 | gate passed, Cat4: Confirm prescription, Schedule callback | rendered |
| b-post-gate-forward | gate passed, non-value meds HA: Confirm & forward, Skip HA call | rendered |
| — transfer-failed alert | the page has no transfer-failed path | **not in the page** — Needs Apurva 4 |

### C. Sheets
| State | Renders | Status |
|---|---|---|
| c-callback | Schedule callback sheet (day and time chips) | rendered |
| c-callback-error | Schedule callback with no day or time: "Pick a date and a time." | rendered |
| c-skip-ha | Skip HA call sheet with its three reasons | rendered |

### D. Prescribe screen (D-10 to D-20 and D-25 unchanged)
| State | Renders | Status |
|---|---|---|
| d-default | Metformin: header, On prescription line, schedule, dose, SOS, duration, food, instructions | rendered |
| d-scrolled | same, scrolled (the pinned Prescribe stays) | rendered |
| d-error-dose | Dose: "Choose a dose for at least one time of day." | rendered |
| d-error-other | Other dose not a number: "Use numbers only, e.g. 7.5 units." | rendered |
| d-sos-on | "Also as needed (SOS)" on: SOS dose and max extra doses | rendered |
| d-notes-keyboard | Additional instructions focused | rendered; no on-screen keyboard in the page |
| d-discard-sheet | Close with unsaved changes: Discard changes? (Keep editing / Discard) | rendered |
| d-disable-sheet | Disable Medicine: five reasons | rendered |
| d-header-white | **D-51:** white header kept (name, form, Disable, cross). The tinted proposal is rejected. Rendered as the decided design. | rendered (decided) |

### E. End of case (card title only; second line removed)
| State | Renders | Status |
|---|---|---|
| e-prescription-confirmed | Cat4 or HA skipped: "Prescription confirmed" | rendered |
| e-transferred | value meds: "Transferred to HA" | rendered |
| e-forwarded | non-value meds: "Forwarded to HA" | rendered |
| e-callback-scheduled | "Callback today at 3:00 PM" (chosen date and time, D-51) | rendered |
| e-patient-unavailable | "Patient unavailable", neutral icon, same exits (D-51) | rendered |
| e-availability-ended | Prescription confirmed; the pinned bar shows only Back to Home | rendered |

Pinned bar at every end state: Request next case (primary) above Back to Home (quiet), stacked like Home. In the availability-ended state only Back to Home remains.

## Applied in round 3 (D-51)
- Bar: primary on top; secondaries below, side by side in one row, 44 px tall (on call, ended early, all three post-gate CTAs, missed call). Verified: 44 px each.
- Closed case: header Back hidden (the bar's Back to Home is the exit; phone back goes Home). Content read-only and muted: no chevrons, nothing tappable, still readable. The card and the bar stay live.
- Prescribe: white header kept; tinted proposal rejected. Duration card: label-to-field gap equals the card's gap (24 px, measured). "On prescription" band keeps its normal colour in every state; its text/background pair is the design-system band (`.tm-band--brand`, blue-600 on brand-subtle, 5.5:1).
- HA transfer banner on mobile: neutral notice above the medicines on Pilot HA-required cases (display only; text "HA call required before confirming").
- Patient unavailable: no sheet; the end card "Patient unavailable" with a neutral icon and the usual exits. "Patient", never "customer".
- Callback scheduled card: "Callback today at 3:00 PM" from the chosen date and time.
- Removed: the blue focus outline on bottom sheets and the Prescribe screen; the glow ring on "Calling…".
- Order details labels in sentence case ("Order created", "Expected delivery").
- Closed medicine statuses: prescribed or disabled only (carried from round 2).
- Design system: `.tm-band--brand` added in `components.css` (AA pair); `--tm-content-success-strong` from round 2.

## Checks (round 3)
- 68 renders (34 states × 390 and 360), re-rendered after the global bar, closed-state and sheet changes. Zero console errors, zero overflow. The five group sheets are refreshed.
- DOM checks (all pass): bar secondaries 44 px; header Back hidden in closed states and during an attempted call; no chevrons in closed states; calling button has no animation; unavailable opens no sheet and shows the card; callback title uses the chosen time; the HA banner shows only on required cases; Duration label-to-field gap 24.
- Codex: one check on the five group sheets, read-only. Blockers: the unavailable sheet and closed chevrons. Both fixed and checked in the DOM (see above). Not re-sent to Codex.

## Open (after D-51)
1. **Transfer-failed alert.** The page has no transfer-failed path. Needs its own spec (copy, recovery, what the doctor can do) before any render. D-51 lists it as out of this pass.
2. **Keyboard states on device.** The page has no on-screen keyboard; the notes and instructions states show focus only. D-51: keyboard states are checked on device later. Not a decision now.
3. **Desktop side panel** (≥1100 px) is out of this pass by D-51.

Resolved by D-51 and removed from the list: Prescribe header, HA banner placement, patient unavailable end state, closed medicine statuses, card vs notice, mock Rx paper exemption, "On prescription" contrast, 44 px secondaries, unavailable copy (the sheet is gone), wording confirmations.
