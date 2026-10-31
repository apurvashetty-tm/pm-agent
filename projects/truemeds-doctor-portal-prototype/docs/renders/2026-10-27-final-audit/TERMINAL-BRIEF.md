# Terminal brief — final audit before promotion

Owner: main Claude thread · Worker: terminal session · Date: 2026-10-27
Type: **audit only — find gaps, change nothing.** Agreed with Apurva (6-point checklist). The main thread brings the gaps to Apurva; fixes come after.

## What is being audited (the candidate set)
- Calling: `docs/renders/2026-10-22-calling/src/case.html` + renders in `docs/renders/2026-10-26-margin-16/round-1/calling/` (32 states incl. 8c).
- Entry, Home, case, Prescribe: `docs/renders/2026-10-26-entry-ds-pass/src/` + renders in `docs/renders/2026-10-26-margin-16/round-1/<family>/`.
- Late additions (main thread): `s-medicine-disabled` (recipe in entry-pass `src/case.html`), 7f new copy (D-68). Render both families' missing pictures into `round-1/` of this folder if they are not in the margin-16 set.
- Approved baseline (to compare against): `ui-screens/` (do not edit).

## Read first
`ui-screens/app-logic.md` (all sections), `docs/context/decision_log.md` D-56 → D-68, `docs/context/backlog.md`, `design-system/RULES.md`, `docs/feedback-rules.md`, `ui-screens/feedback/messages.json` + `metadata.json`, `ui-screens/README.md`.

## Checklist (each item → a table in the report)
1. **Flow coverage.** Walk every journey end to end: sign-in → OTP → faster sign-in offer → Home → request a case → case page → every call outcome (app-logic §4–§5, incl. 8c, 15b, fallback B) → closed case → next case; plus Prescribe (prescribe, disable, discard, every form), sheets (leave, callback, add time, end availability), Rx viewer. **Table: every state / branch named in `app-logic.md` × render id(s).** A state with no render = GAP. A render with no state in app-logic = ORPHAN.
2. **Edge cases per screen family:** loading, empty, error, offline, busy / double-tap, long content (long names, 10 medicines), 360 width, **large text** (system font scale 1.3 — render the main state of each family once at 390; report clipping or overlap; this was never checked before). Table: family × case → covered (render id) / GAP.
3. **Decisions.** Every decision D-56 → D-68 (and its numbered points) × screens that show it × pass / fail / not visible in a render (logic only).
4. **Copy.**
   - Every key in `messages.json` is used by at least one render or by logic noted in app-logic; list unused keys.
   - No message tells the user to do what a button on the same screen does (feedback-rules §4, D-65/D-66).
   - "Health Advisor" spelled out everywhere except the "Skip HA" button.
   - No hard-coded copy in recipes that differs from `messages.json` (rebuild item if labels are inline — list, don't fail).
5. **Visual rules.** 16 page margin (D-67); action bar 16 all sides + edge (D-62/67); status card tones and edge, no shadow (D-62/66); icon rule §9.1 (scope per D-66); **contrast AA** on every text incl. the struck-through Disabled medicine name, tags on tints and notices; **48px tap targets** (icons, ×, Back, chips, rows, links standing alone).
6. **Old vs new.** Every state in `ui-screens/` today → KEEP (unchanged) / REPLACE (by which new render) / RETIRE (which decision retires it). Every new render → which folder it goes to on promotion. Nothing may be "unaccounted". Proposed folders (Apurva, 2026-10-27): **`case/`** = case page, calling, sheets, closed cases, stress states; **`prescribe/`** = all `d-*` Prescribe states (pictures + a short README; source stays `case/case.html`, open with `?s=d-…`). Known replacements: old calling `b-*`, `c-*` → calling set; `e-prescription-confirmed` → 10a, `e-transferred` → 14, `e-forwarded` → 10b, `e-patient-unavailable` → 9.

## Codex
Second reader on items 1, 2 and 6 (coverage and old-vs-new): give Codex the state table and the file lists, ask it to find anything missing or double-counted. Read-only, cap 2 rounds. If blocked or rate-limited, do it yourself and say so.

## Report
`docs/renders/2026-10-27-final-audit/REPORT.md`: one table per checklist item; a **GAPS** list (each: what, where, which rule or state, suggested fix in one line); **NEEDS-APURVA** for anything that needs a decision; the promotion map (item 6) as a table ready to execute. Then stop.

## Never
- Fix anything, edit `ui-screens/`, working copies (except adding the two missing renders), the design system, `messages.json`, the decision log, open questions, project truth or backlog.
- Promote, publish, open or merge pull requests. Run git commands other than `git status`.
- Invent states or rules: a scenario not in app-logic or the decision log is listed under NEEDS-APURVA as "not covered by any decision".
