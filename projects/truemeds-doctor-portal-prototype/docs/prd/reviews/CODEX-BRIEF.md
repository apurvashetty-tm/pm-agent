# Codex brief: review the doctor app PRD (one round)

**Run in:** `pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype`
**Output:** print the report to stdout; the caller saves it as `docs/prd/reviews/codex-round-<n>.md`. Do not edit `PRD.md` or any other file. Do not write to the decision log or record anything in Apurva's name.

## What you are reviewing

`docs/prd/PRD.md`, "Truemeds For Doctors - App_PRD", draft v0.1. It's a product PRD for the launch release of the doctor app (React Native). Readers: the app team, Backend, Ops and leadership. It states what and why; the how is Engineering's.

Read first:
1. `docs/prd/PRD-PLAN.md`: the agreed structure and the 28-line done-checklist. Review against it, not against your taste.
2. `../../templates/lean-prd-guide.md`: voice, say it once, AI tells.
3. `../../workflows/core/review-prd.md`: rubrics and severity (Steps 3–5 only; skip the widget and routing steps).
4. `docs/prd/TRACE.md`: where each rule comes from.

Frozen sources of truth (the PRD must agree with them; latest decision wins):
- `ui-screens/` pictures and `ui-screens/README.md`
- `ui-screens/app-logic.md`
- `docs/feedback-state-map.md`
- `docs/context/decision_log.md` up to D-92
- `calling-flow/data.js` (also live at https://doctor-portal-prototype.netlify.app/calling-flow/)
- `ui-screens/feedback/messages.json` and `visible-strings.json` (copy)
- `docs/context/open_questions.md`

Background only: `docs/Doctor_Portal_Developer_PRD.md` (8 Oct, outdated).

## Agreed choices: don't flag these

- Calling states are not listed in the PRD; the calling-flow page holds them. Only the calling rules are in the PRD.
- Decision numbers are kept out of the body (they're in `TRACE.md`).
- State numbers (1, 7d, B1…) appear only in picture captions.
- Prototype-only values (test numbers, OTP test codes, mock timers, the sample doctor, demo mode) are left out on purpose.
- Fallback B is the launch Pilot flow; version A is Annex A only.
- One picture per screen; other states are one line each.
- §11 measures are marked Proposed and baselines `[NEED]`: the primary measure is still open with Apurva.

## What to do

1. Run `node docs/prd/check-prd.mjs`. Report any FAIL.
2. Review every section with the three `review-prd` rubrics (Clarity, Metrics quality, Use-case coverage). Give each finding a severity: P0 = would cause the app to be built wrong or unmeasured; P1 = weakens the doc; P2 = polish.
3. Check facts against the frozen sources. Each finding of this kind must cite the source file and line. Priority areas:
   - §5.7 final-button table and the rules for every call
   - §5.8 Pilot flow, Skip HA conditions
   - §5.9 Callback / Patient unavailable / Release
   - §7 settings values
   - §5.10 medicine table
4. Check the eye lines of the checklist: 2, 3, 7, 9, 13, 20, 22, 23, 24, 25.
5. Coverage: is any behaviour a reviewer from Engineering or Ops would ask about missing from both the PRD and the calling-flow page?
6. Readability: could someone outside the team explain each sentence back? Flag jargon, coined labels, repeated rules.

## Report format

```
# Codex review: PRD v0.1

## check-prd.mjs
<PASS count / FAIL lines>

## Findings by section
### <section>
- [P0|P1|P2] [Clarity|Metrics|Coverage|Fact|Checklist #n] <what> — <why> — source: <file:line or "none">
(or "No issues found.")

## Out of scope
<good ideas that aren't for this PRD; say where they belong (backlog, engineering spec, test cases)>

## NEEDS-APURVA
<only questions that truly need a product decision; one line each>

## Summary
P0: n · P1: n · P2: n
```

Rules for the report: don't suggest rewrites of agreed choices above; don't invent facts; if you're unsure whether something is wrong, say so and mark it "doubt".
