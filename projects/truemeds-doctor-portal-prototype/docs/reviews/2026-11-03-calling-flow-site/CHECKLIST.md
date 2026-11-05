# Calling flow page — done checklist

**Status:** agreed by Apurva, 2026-11-03 (C2 and R2 wording updated after the independent check). The page is built and reviewed against this list.
**What it is:** one web page for Engineering showing the doctor app's whole calling flow, as the basis for agreeing what the app and the backend send each other. Two tabs: **Overview** (the approved block diagram, `calling-flow-blocks.png`) and **Screens** (the same flow drawn with the real pictures).
**Sources (nothing invented):** `ui-screens/app-logic.md` §5 – §7 (state table, rules), `ui-screens/README.md` (render ids), `ui-screens/feedback/messages.json` (copy), decision log D-58 → D-85, `open_questions.md`.

## Content
| # | Check | Pass when |
|---|---|---|
| C1 | All calling states | Every state in the app-logic §5 table, Fallback B (B1 – B3), 17 (D-85) and the call sheets (leave, callback, Skip HA, unavailable) appears once. A-only states (11, 12, 8b) appear only with the A switch on. Retired states (15b) don't appear. A script lists what's missing or extra. |
| C2 | Arrows are real | Every arrow matches a trigger or doctor action in app-logic; none invented, none missing. Loops and returns (Call again, Still talking, Unavailable → 9, Skip HA on 16…) may be **written on the box** instead of drawn, as in the approved diagram — they are still declared in the data and listed in the panel. Solid = doctor action (app → backend), dashed = backend event (app learns by polling). |
| C3 | Overview = approved diagram | Same lanes, boxes, arrows and labels as `calling-flow-blocks.png`. |
| C4 | Detail panel | Clicking a box shows: state no. + ID, picture (if any), how you get here, what the doctor sees (exact copy from `messages.json`), what each button sends, which events move it on, decisions (D-xx), open questions. Wording comes from the sources, not rewritten. |
| C5 | Contract stays open | Events and requests use plain-English names marked **"to be agreed with Engineering"**. No invented API names, fields or polling values. Open items (OQ-030, OQ-031, OQ-035, Knowlarity call-ended event) are flagged. |
| C6 | Pictures | Current `ui-screens/` pictures at 390, used as they are (no re-render). Linked from the page, not copied. |

## Use
| # | Check | Pass when |
|---|---|---|
| U1 | Click | Box click opens the panel; Esc or × closes it; arrow click shows its event or action (good to have). |
| U2 | Move around | Scroll / swipe moves the page (Shift + scroll sideways), pinch or ⌘ / Ctrl + scroll zooms, drag pans; opens at 100 % top-left; zoom % shown with 50 % / 100 % / Fit; jump-to-lane buttons; tab switch keeps the selected state. (Updated 2026-11-05.) |
| U3 | Filters | A on/off switch; case type filter (Cat4 · Pilot B · HA skipped). |
| U4 | Link to a state | `#state=<id>` opens the page on that state, so a link can go in a Jira ticket or meeting note. |
| U6 | Happy path and step-through (Apurva, 2026-11-03) | Happy path drawn thick brand-blue in every view (Cat4 / HA skipped → 10a; Pilot → 14 Transferred, not the forward); solid / dashed still means action / event. Highlighting a case type numbers its happy path (primary: thick blue), keeps its side branches at full strength in their own colours (secondary — never greyed, they are real outcomes) and fades only the other case types; Previous / Next steps box by box with the panel open. |
| U5 | Screens | Readable on a laptop (1366 px and up, Chrome and Safari); usable on a phone (scroll and zoom, panel full width). |

## Look
| # | Check | Pass when |
|---|---|---|
| L1 | Design system | Page frame uses `truemeds.css` tokens and fonts; no hand-made colours beyond the legend's four box styles. |
| L2 | Clean layout | No text runs into an arrow or past a box edge; no arrow through a box (checked by script and by eye at 100 % and fit-to-screen). |
| L3 | Legend | Arrow types, box colours and lanes explained on the page. |

## Build
| # | Check | Pass when |
|---|---|---|
| B1 | One data file | One file holds states, arrows and panel text; both tabs are drawn from it. |
| B2 | Self-contained | One folder, plain HTML / CSS / JS, no build step, no outside scripts or fonts from the internet. |
| B3 | No errors | No console errors; the coverage script (C1, C2) passes. |

## Review and publish
| # | Check | Pass when |
|---|---|---|
| R1 | Independent check | A separate agent checks the local page against this list; findings fixed. |
| R2 | Apurva review | Apurva opens the local page (no screenshots, her call 2026-11-03) and approves. Then frozen: anything new is a bug or next version. |
| R3 | Commit | On `project/truemeds-doctor-portal-prototype` only; reaches `main` through a PR Apurva merges. |
| R4 | Netlify | Deploys only when the PR title has `[deploy]`. Link checked after deploy. |

**Hosting (recommended):** a folder `calling-flow/` in the project, published by the current doctor-portal site at `doctor-portal-prototype.netlify.app/calling-flow/`. No new Netlify site, and the pictures link straight to `ui-screens/`. That site already publishes the whole project folder (backlog §4c), so nothing becomes public that isn't public already.

**Not in this page:** sign-in, OTP, Home, Prescribe; real API design; version A beyond the greyed switch.

## Results — 2026-11-03

Built: `calling-flow/` (`index.html`, `flow.css`, `flow.js`, `data.js`, `check-coverage.mjs`). Independent check (separate agent, given only this list and the sources): C2 and L2 failed, plus five text bugs — all fixed or answered:
- **C2:** 13 loop / return arrows were in the panels but not in the data → declared as "written on the box" arrows (picture unchanged); Pilot "no result" goes to 7c (D-85), not 7b; new arrow B1 Calling → "ended before the gate" → Call result.
- **L2:** with version A on, the trunk crossed the side-panel box → version A lane moved above "Other". Script check: no line through any box, both tabs, A on and off.
- **Text:** Back only on 1, 3, 4 (not 6); 17 and the Pilot 7d path say 7c (7b only if the hang-up event is missing); D-59 added for notes; CA-11 reference clarified (copy annex); `a-leave-sheet` moved onto 7e.
- **Use:** panel opens below the header (zoom buttons stay usable); first view opens readable (≥ 60 %), Fit shows everything.
- Rejected: none. Not checkable here: Safari (U5).
`node calling-flow/check-coverage.mjs` → PASS (44 states, 55 arrows, 53 of 62 case pictures; 9 are case-page states, not calling). No console errors.

## Change — 2026-11-03 (evening): happy path and step-through (U6)
Built as agreed: thick blue happy path; highlight shows numbered steps, muted branches, faded other types; Previous / Next stepper. Overview picture updated to match. Checked: coverage script PASS, no console errors, Pilot stepper reaches "Step 7 of 7" (14 Transferred).
Follow-up (Apurva): side branches were too washed out → now full strength, like a secondary button next to the primary one.
Follow-up 2 (Apurva): happy-path boxes filled brand blue with white text (primary) in every view; all other boxes white with their coloured border (secondary).
