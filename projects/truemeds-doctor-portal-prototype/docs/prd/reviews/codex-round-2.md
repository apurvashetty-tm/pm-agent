# Codex review: PRD v0.4

## check-prd.mjs

17/17 passed. No FAIL lines.

## Findings by section

### §1 Executive summary
No issues found. Checklist #2 passes.

### §2 The problem
No issues found.

### §3 What we're building
No issues found.

### §4 How it works
No issues found. The approved strip is retained.

### §5.1 Sign-in
No issues found.

### §5.2 OTP
No issues found.

### §5.3 Faster sign-in offer
No issues found. The added unavailable-at-tap behaviour agrees with D-93.

### §5.4 Returning unlock
No issues found.

### §5.5 Home
No issues found.

### §5.6 Case page before the call
No issues found.

### §5.7 Calling rules
- [P1] [Clarity] **Doubt: the new validity-authority sentence is broader than its intended route.** “On a live Pilot call” includes Pilot cases whose HA call was already skipped. Those cases must wait for the partner result; otherwise Confirm could appear during their live call. This is new evidence about the round-one fix’s scope, rather than reopening the agreed authority split — source: `docs/prd/PRD.md:267`; `ui-screens/app-logic.md:120`; `calling-flow/data.js:78`; `calling-flow/data.js:222`.

The final-button table, missing-result exception, Pending-medicine block and unproven-confirm handling otherwise agree with the frozen flow.

### §5.8 Pilot cases
No issues found. Skip HA eligibility, reasons, post-skip wait and transfer/forward handling agree with the frozen sources.

### §5.9 Callback / Patient unavailable / Release
No issues found. Eligibility, backend refusal, routing and notes handling agree with the frozen sources.

### §5.10 Prescribe
No issues found. Checklist #23 passes: all medicine forms are covered, and the added choices agree with app-logic.

### §5.11 Rx viewer and notes
No issues found.

### §6 Rules on every screen
No issues found.

### §7 Settings
- [P1] [Clarity] **Doubt: accumulation boundaries remain unspecified.** “At least about 10 s, within about 30 min” supports nominal examples but cannot establish which calls qualify at the boundaries or where the window starts. Different implementations could produce different gate totals. The frozen source has the same ambiguity; this is a source gap, not a transcription error — source: `docs/prd/PRD.md:430`; `ui-screens/app-logic.md:117`; `calling-flow/data.js:88`.

Other settings agree with the sources and locked owner decisions. `[NEED]` values remain explicit configuration dependencies.

### §8 User stories
No issues found.

### §9 Scope
No issues found. Checklist #24 passes with the locked exclusions and privacy questions.

### §10 Decided vs open
No issues found. Existing open dependencies have owners.

### §11 Measures
No issues found against the locked decisions. Checklist #25 passes.

### Annexes A–C
No issues found.

### Remaining eye checks
Checklist #3, #7, #9, #20 and #22 pass. Checklist #13 has the qualification noted under §5.7.

No additional launch behaviour was identified as missing from both the PRD and calling-flow page.

## Out of scope

- Exact aggregation cutoffs and window semantics belong in the Engineering contract and boundary test cases once Product confirms them.
- Physical-device telephony, delayed-result and recovery tests belong in Engineering/QA validation.
- Screenshot rendering approval remains checklist #27; this review does not claim visual sign-off.

## NEEDS-APURVA

Confirm exact minimum contributing-call duration and accumulation-window meaning, or explicitly delegate those boundary choices to Engineering; the frozen sources currently give approximate values.

## Summary

P0: 0 · P1: 2 · P2: 0

Created only `docs/prd/reviews/rule-tests.md`: 69 given/when/then cases with source references. Cases were written and structurally checked, not executed against the app.

rule-tests.md: 69 rules, 2 unclear
