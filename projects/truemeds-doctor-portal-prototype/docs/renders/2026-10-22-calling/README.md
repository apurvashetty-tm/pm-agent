# Calling layouts (D-58) — render brief

Status: IN REVIEW (round 1) · Date: 2026-10-22 · Owner: Claude (main thread) · Rules: feedback-rules, RULES §5/§9, D-58

## Purpose and authority
- Review question: are the 3 new calling layouts right before the full 18-state run?
- Decisions/specs: D-58, D-59; `ui-screens/app-logic.md` §5 (state table).
- Approved baseline: `ui-screens/case/` (`b-on-call`, `b-ended-early`, `b-post-gate-transfer`, `b-calling`).
- Intended changes: no End call; layout 1 `call.on-call`; layout 2 `call.on-call-transfer`; layout 3 `call.ended-early` / `call.result-missing`.
- Proposed copy: `call.*` keys in `ui-screens/feedback/messages.json` (marked proposed).

## Sources
- `src/case.html` = working copy of `ui-screens/case/case.html` (paths adjusted), new recipes `n1-on-call`, `n2-on-call-transfer`, `n2b-on-call-transfer`, `n3-ended-early`, `n3-result-missing`. Approved `ui-screens/case/` untouched.
- Design system: repo `design-system/` (truemeds.css, icons.js). Old `app.js` used only for page scaffolding, as in the approved concept.
- Captured in the cloud workspace (headless Chromium, 2×), 390 and 360 wide.

## Capture plan (round 1)
| Output | State | Why a new image |
|---|---|---|
| n1-on-call | `call.on-call` | new bar layout |
| n2 / n2b-on-call-transfer | `call.on-call-transfer` | two options: notice + Callback (n2) vs busy "On call…" + Callback (n2b) |
| n3-ended-early, n3-result-missing | `call.ended-early`, `call.result-missing` | three actions, existing pattern |
| compare-*.png | approved vs new, 390 | review aid |

## QA evidence (round 1)
| Check | Result | Evidence |
|---|---|---|
| No End call | pass | all 5 renders |
| Primary on top, pair below (matches b-post-gate-transfer) | pass (after fix) | first capture had the pair above — bar `order` rule; fixed |
| Labels one line at 360 | pass | n3 at 360: "Unavailable" fits |
| Gate time from setting | pass | "Call ended before {seconds} seconds." |
| Busy style matches b-calling | pass | n1/n2b vs b-calling |
| Console / page errors | pass | none |
| Locked-spec guards, layout_check | not run | terminal loop step |
| Screen reader / large text | not run | terminal loop step |

Nothing promoted to `ui-screens/`. Not published.
