# Doctor Portal — standards checklist (phases A–D)

Written by Claude from `design-system/RULES.md` §8–9 and decisions D-42 to D-52, for Apurva's approval. **The terminal checks against this list and never edits it.** If a line can't be checked, or two lines conflict, it reports that under Needs Apurva.

- **auto**: checked by `check-locked-specs.py` / `check-sources.mjs` on every captured state (390 and 360).
- **eye**: checked by Claude's self-audit and by Codex on the contact sheets.

A state passes only when every line that applies passes.

**Where this fits (three gates):** this pass covers **gate 1, standards compliance**, plus the visual half of **gate 2, UX integrity**: journeys, safety and states as they appear on screen. Real interaction testing (taps, focus movement, timing) happens in the rebuilt prototype. **Gate 3, release readiness**, is Apurva's approval before promotion. The evidence record is `round-N/checklist-results.md` (state × viewport × line, with the guard result and any open exception).

*Updated 2026-10-15 after Codex's review of this checklist: adopted lines are marked (R).*

## Approved exceptions (do not flag)
- Button / label wording kept as approved: **Back to Home**, **View Rx**, **Skip HA call**, **Send OTP**, **Use OTP instead**, **Verify & sign in**, **Confirm & transfer**, **Confirm & forward**, **Turn on faster sign-in**. Proper nouns and abbreviations (Home, Rx, HA, OTP, Truemeds, Doctor Ops) keep their capitals.
- The mock Rx paper inside the Rx viewer is exempt from contrast (a picture of a document).
- Disabled controls are exempt from contrast (WCAG 1.4.3) and keep the disabled style.
- Inline links inside a sentence (Change, Terms & Conditions, Privacy Policy, Sign up, call Doctor Ops) are exempt from the 48px target (WCAG 2.5.8).
- The mock OS keyboard is exempt from every line.
- Clinical options (dose values, injection "1 / Other", per-form error copy) are the doctor's choice; only their look is checked.

## 1. Layout
| # | Check | How |
|---|---|---|
| 1.1 | Side margin 24px on every block (fields, notices, cards, buttons, sheets). Cards on work screens also sit at 24 | auto |
| 1.2 | Vertical gaps between blocks only 8 / 16 / 32 (48 = home-base hero gap). Component internals keep their own specs (R) | eye |
| 1.3 | No horizontal overflow at 390 or 360 | auto |
| 1.4 | No clipped or hidden text; content scrolls instead | auto |
| 1.5 | Page surface: step screens white page under the tinted band; work screens grey page with white cards; nothing loose on the grey | eye |
| 1.6 | Main button placement: inline under content on typing screens, pinned to the bottom otherwise (§8.4) | eye |
| 1.7 | Keyboard open: at least 16px between the inline button and the keyboard; pinned bar steps aside while typing | auto (A) / eye (D) |

## 2. Type and copy
| # | Check | How |
|---|---|---|
| 2.1 | Only the four screen-text levels (32/40 · 16/24 · 14/20 · 12/16); components keep their own sizes | auto |
| 2.2 | No text smaller than 14px except L4 fine print and tags | auto |
| 2.3 | Titles: no full stop; balanced wrap, never one word alone on the last line | auto |
| 2.4 | Sentence case on buttons, titles, labels and sheet titles (exceptions above) | auto |
| 2.5 | Formats: time 3:00 PM · date 12 Aug 2024 · money ₹1,240 · timers m:ss | eye |
| 2.6 | "Case" for the doctor's unit of work; "order" only for the order ID and order data | eye |
| 2.7 | Copy exactly as in messages.json / the decision log; proposed copy marked as proposed | auto |
| 2.8 | Mock data is consistent (dates, Rx lines match schedules, names) | eye |

## 3. Buttons
| # | Check | How |
|---|---|---|
| 3.1 | Only these roles: primary · secondary · quiet · destructive · call end · link inside a sentence. No tertiary, ghost or link-styled standalone buttons | auto |
| 3.2 | At most one primary per screen or sheet. None is allowed when the state has no forward action (e.g. pending, read-only) (R) | auto |
| 3.3 | Group order top to bottom: primary → secondary → quiet | eye |
| 3.4 | Every button in a group is the same height: 56 for action buttons; 48 for compact inline buttons. No 40 / 32 buttons | auto |
| 3.5 | Side-by-side pair: equal width, no icons, labels on one line at 360 | auto |
| 3.6 | Destructive (Mark as unavailable, Disable) is a red outline, never solid. Solid red only for End call | auto |
| 3.7 | Busy primary = brand fill, white label and spinner (L2); quiet in progress = text only | auto |
| 3.8 | Quiet role for leave / cancel / dismiss: Back to Home, Stay on this case, Not now, End availability, Cancel | eye |

## 4. Tap targets and accessibility
| # | Check | How |
|---|---|---|
| 4.1 | Every tappable element at least 48 × 48 (exceptions above) | auto |
| 4.2 | Text contrast at least 4.5:1 on its real background (3:1 for 24px+) | auto |
| 4.3 | Every icon-only button has an accessible name | auto |
| 4.4 | Visible focus ring on keyboard focus | eye |
| 4.5 | Field errors are linked to their field (aria-describedby / aria-invalid) (R) | auto |
| 4.6 | Notices, toasts and status changes are announced (role="status" / "alert") (R) | auto |
| 4.7 | Open sheets are modal (aria-modal), focus starts inside, and returns to the trigger on close (R) | auto |
| 4.8 | Status is never shown by colour alone (tags carry text, errors carry an icon + words) (R) | eye |

## 5. Components
| # | Check | How |
|---|---|---|
| 5.1 | Every bottom sheet uses the template: title + ✕, no divider, no drag handle, 24 margins, 16 header→content, actions per §3, safe area | auto |
| 5.2 | Reason lists use the option row (title + description); tapping applies | eye |
| 5.3 | Free chips wrap to the next row; never squeezed, clipped or shrunk | auto |
| 5.4 | Grid chips share one size per screen; fewer options leave cells empty | auto |
| 5.5 | Status tags: Prescribed = success · Pending = warning · Disabled = neutral; width reserved | auto |
| 5.6 | Rows: chevron only when tappable; read-only rows muted, no chevron | auto |
| 5.7 | Status card at the top of the content for every case ending; success icon for completed, neutral icon for Patient unavailable | eye |
| 5.8 | Toast: dark, 14/20, one line, above the bottom bar; only "Time added" and "Finish this case first. Then you can go back to Home." | auto |
| 5.9 | Notices: neutral / warning / error per the state map; one message per cause | eye |
| 5.10 | Headers: home-base (sign-in, Home) · task hero (OTP, offer, unlock) · task compact (case page) · edit screen (Prescribe) · viewer (Rx) | eye |
| 5.11 | Wheel: one light-blue selection band across both columns, large blue values (D-40) | auto |
| 5.12 | No local restyling of a central component | auto |
| 5.13 | Each component looks identical to its design-system preview and the same across screens (R) | eye |
| 5.14 | Every interactive component shows each state it has (enabled, disabled, busy, error, recovered) somewhere in the coverage matrix (R) | eye |

## 6. Locked specs (D-46, D-47)
| # | Check | How |
|---|---|---|
| 6.1 | L1 OTP boxes 56×56, 24px digits, gap 8, centred | auto |
| 6.2 | L2 loading primary | auto |
| 6.3 | L3 OTP keyboard open while verifying | auto |
| 6.4 | L4 helper / error 14/20 · L5 notice 14/20 | auto |
| 6.5 | L6 sign-in logo-to-title gap 48 | auto |
| 6.6 | L7 helper aligns with its field (centred under OTP boxes) | auto |
| 6.7 | L8 balanced titles · L9 value display 32/40 semibold, fixed-width digits | auto |

## 7. Phase-specific decisions
| # | Check | How |
|---|---|---|
| 7.1 | A: wrong code stays visible with red borders; first keystroke replaces it; resend line per D-44 | eye |
| 7.2 | B: offer and unlock have no Back; unlock unavailable notice is neutral; offer icons neutral grey | eye |
| 7.3 | C: stop-pending has no time row; subtitles "You won't get new cases." on stop-pending and expired-pending; expired-pending notice "Your last request is still active."; Minimum 15 minutes visible | eye |
| 7.4 | D header: compact tint, two meta lines, fixed height while scrolling; Back by stage (D-48); when Back is hidden the name and meta move to the left margin; Help always present | eye |
| 7.5 | D bar: End call = call end on top, Schedule callback below; post-gate primary on top with Schedule callback + Skip HA call pair below; D-50 labels | eye |
| 7.6 | D endings: status card titles per D-52; closed case read-only and muted, no header Back, Request next case + Back to Home (only Back to Home when availability ended) | eye |
| 7.7 | D: no HA notice; Rx viewer title never overlaps the tools; "Disable Metformin 500mg" sheet title; order details in a white card; Prescribe white edit-screen header; SOS grids same size as dose grid | eye |
| 7.8 | D new states rendered: loading, load failed, offline, confirm busy, confirm failed, release failed, callback failed, Rx failed, no medicines, long names at 360 (copy per feedback-state-map.md, marked proposed) | eye |

## 7b. Journeys, safety and content (R)
| # | Check | How |
|---|---|---|
| 7b.1 | Each flow's states, in order, match the state map and D-48 exits: every state has a way forward or back, no dead ends. Contact sheets are grouped by journey | eye |
| 7b.2 | No final CTA before the valid-call gate; Skip HA call only where it applies | eye |
| 7b.3 | Irreversible or work-losing actions ask first: Release case, Mark as unavailable, Disable (reason), Discard changes, End availability | eye |
| 7b.4 | An error or failure is visible without scrolling when it appears, and nothing the doctor typed or chose is lost | eye |
| 7b.5 | Every error / notice says what happened and what to do next (§9.7) | eye |
| 7b.6 | Content stress: a case with 10+ medicines; a case with optional fields empty (no notes, no order details); long names at 360 | eye |
| 7b.7 | A–C compared with the 2026-10-14 approved finals: every visible change traces to a checklist line or decision; anything else is a regression | eye |

## 8. Coverage
| # | Check | How |
|---|---|---|
| 8.1 | Every state in the coverage matrix captured at 390 and 360; none missing or duplicated | auto |
| 8.2 | No console errors, page errors or missing files | auto |
| 8.3 | Every state also captured at 430 wide (larger phones), guards only, no review (R) | auto |

**Out of scope here (decided):** text enlargement / dynamic type (native app) · animation and perceived performance (native app) · real tap-through testing (rebuilt prototype).
