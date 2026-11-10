<!-- Codex's final report only; its session log (~6,900 lines) was trimmed. -->
# Codex review: PRD v0.1

## check-prd.mjs

17/17 checks reported PASS. No FAIL lines.

The Git subprocess emitted sandbox errors creating `/tmp/xcrun_db-*`; treat checklist #28’s Git evidence as incomplete.

Manual checks found issues the script does not detect, including prototype values in §7 and contradictory calling rules.

## Findings by section

### Header and §1 Executive summary

No issues found. Checklist #2 passes: the summary explains what, why and what remains open.

### §2 The problem

- [P2] [Clarity] Cat4 and Pilot first appear without an explanation of what distinguishes them — readers outside the team cannot explain the subsequent routing choices from this document alone. “HA skipped” is explained later, but the case types are not — source: `docs/prd/PRD.md:24`, `docs/prd/PRD.md:33`.

### §3 What we're building

- [P1] [Clarity] Several full rules recur outside their home sections: pull-only allocation, phone-first click-to-call, proof before counting, and system-selected final buttons — this fails the manual “say it once” check, despite the automated pass. The agreed plan allows the summary to repeat briefly; §3 is not the summary — source: `docs/prd/PRD.md:32`, `docs/prd/PRD.md:33`, `docs/prd/PRD.md:34`, `docs/prd/PRD.md:35`; repeated at `docs/prd/PRD.md:232`, `docs/prd/PRD.md:264`, `docs/prd/PRD.md:274`, `docs/prd/PRD.md:467`.

### §4 How it works

No issues found. The Pilot sentence describes the happy path; the forward branch is covered later and on the calling-flow page.

### §5 Screen by screen — introduction

No issues found.

### §5.1 Sign-in

No issues found.

### §5.2 OTP

No issues found.

### §5.3 Faster sign-in offer

No issues found.

### §5.4 Returning unlock

No issues found.

### §5.5 Home: availability, add time, end, Profile

No issues found.

### §5.6 Case page before the call

No issues found. Release eligibility and the backend guard agree with the frozen rules. The empty-case destination remains explicitly open in §10.

### §5.7 Calling: rules for every case, and Cat4 / Pilot with HA skipped

- [P0] [Fact] The universal rule “Before the call is valid, the app never shows” any confirm button contradicts the no-result path — that path deliberately offers Confirm prescription or Confirm & forward before the record proves validity, then waits for proof. Following the universal prohibition would remove the agreed recovery path. The table mentions this exception, but the rule does not — source: `docs/prd/PRD.md:263`; `docs/context/decision_log.md:896`, `calling-flow/data.js:141`, `calling-flow/data.js:150`, `calling-flow/data.js:241`.

- [P0] [Fact] The PRD does not distinguish the authority for the live Pilot gate from the authority for post-call confirmation — its blanket call-record language suggests that every route requires the partner’s duration to prove the gate. The frozen flow says the live Pilot count starts at patient-answer and is authoritative while live; partner duration is stored for reporting. Engineering could implement the wrong gate or delay the live Confirm button — source: `docs/prd/PRD.md:261`, `docs/prd/PRD.md:274`; `ui-screens/app-logic.md:119`, `calling-flow/data.js:171`.

- [P1] [Fact] “Callback or Unavailable when the call was too short or no result came” makes both actions sound available in both situations — Unavailable is available only when no result came; a too-short call offers Call again and Callback. §5.9 states the narrower rule correctly — source: `docs/prd/PRD.md:280`; `ui-screens/app-logic.md:204`, `ui-screens/app-logic.md:208`, `calling-flow/data.js:108`.

Checklist #9 passes: attempted means the patient answered. Checklist #22 passes for the final-button table’s coverage of all requested case types, subject to the gate contradictions above.

### §5.8 Calling: Pilot cases

No issues found. Launch flow B, Skip HA eligibility, reasons, waiting for the result after a live skip, and post-gate hang-up recovery agree with the frozen sources.

The calling-flow page also covers the important distinction between a transfer that could not start and an HA who does not answer; no additional state list is needed in this PRD.

### §5.9 Ending without a prescription: Callback, Patient unavailable, Release

No issues found. Callback eligibility, manual Unavailable eligibility and retry handling agree with the sources.

### §5.10 Prescribe

- [P1] [Coverage] The medicine-form table covers every form, but several selectable prescribing constraints are missing from both the PRD and the calling-flow page: Every X hours choices, SOS dose-count limits, duration choices and food-timing choices — Engineering cannot determine these controls from the PRD’s general action list. They are existing requirements, not new design suggestions — source: `docs/prd/PRD.md:349`; `ui-screens/app-logic.md:240`, `ui-screens/app-logic.md:241`, `ui-screens/app-logic.md:242`, `ui-screens/app-logic.md:243`.

Checklist #23 passes: all medicine forms and their dose options match app-logic §8. The omission above concerns schedule and duration controls outside that table.

### §5.11 Rx viewer and notes

No issues found.

### §6 Rules on every screen

- [P1] [Fact] Help is described as how a doctor reaches Doctor Ops when failures persist — the latest decision makes Help open a blank placeholder, also acknowledged in §9. The PRD therefore promises an operational escape route that this release does not provide — source: `docs/prd/PRD.md:413`, `docs/prd/PRD.md:460`; `docs/context/decision_log.md:939`.

### §7 Settings

- [P1] [Fact] Prototype-only values remain in the table: the OTP row explicitly includes prototype lock/window values, while resend waits and failed-unlock attempts become launch “working defaults.” App-logic marks those values MOCK; no later decision cited in TRACE promotes them to production defaults — this fails the manual portion of checklist #17 despite the script’s PASS — source: `docs/prd/PRD.md:432`, `docs/prd/PRD.md:433`, `docs/prd/PRD.md:434`; `ui-screens/app-logic.md:41`, `ui-screens/app-logic.md:42`, `ui-screens/app-logic.md:43`, `ui-screens/app-logic.md:51`.

- [P1] [Checklist #7] Settings ownership is presented as agreed, but TRACE says the owners were proposed by Claude and require confirmation — “set by its owner” turns an unconfirmed assignment into a requirement. Checklist #13 therefore does not fully pass either — source: `docs/prd/PRD.md:418`; `docs/prd/TRACE.md:85`.

### §8 User stories

No issues found.

### §9 Scope

- [P1] [Checklist #24] The old PRD’s clinical items are raised in §10, but other product constraints have no explicit disposition: patient-number masking, whether call recording is in scope, and the full Super Doctor role system — none is clearly retained, excluded or raised here. **Doubt:** some technical security details may properly belong in Engineering’s companion spec, but checklist #24 explicitly requires accounting for every old requirement; these product-level decisions are not accounted for — source: `docs/Doctor_Portal_Developer_PRD.md:509`, `docs/Doctor_Portal_Developer_PRD.md:519`, `docs/Doctor_Portal_Developer_PRD.md:583`; `docs/prd/PRD.md:454`, `docs/prd/PRD.md:511`.

### §10 Decided vs open

- [P1] [Fact] The question about a late record showing talk time below the gate is already answered — hold and retry, no confirmed prescription or payment, mismatch logged. Leaving it open invites a second decision that conflicts with §5.7 — source: `docs/prd/PRD.md:493`; `docs/context/decision_log.md:897`, `calling-flow/data.js:154`.

Otherwise, open items have owners and polling is labelled a working default. Checklist #3 passes: the document does not prescribe endpoints, schemas or polling intervals.

### §11 How we'll know it worked

- [P1] [Metrics] Several measures remain insufficiently defined even as proposals: release and patient-unavailable rates have no denominator; time to outcome does not say whether waiting for a record is an outcome; faster sign-in adoption can include OTP-free sessions unrelated to the feature — different teams could report different results from the named sources. Checklist #25 is only partially met. This finding does **not** concern the explicitly open primary measure, targets or baselines — source: `docs/prd/PRD.md:528`, `docs/prd/PRD.md:531`, `docs/prd/PRD.md:532`.

### Annex A

No issues found.

### Annex B

No issues found.

### Annex C

No issues found.

## Out of scope

- API contracts, webhook reconciliation, authorization implementation and concurrency controls belong in the engineering spec.
- Duplicate submissions, late events, repeated call attempts and app-reopen recovery deserve test cases; the PRD and calling-flow page already establish the relevant product outcomes.
- No additional calling-state list, version-A launch work or prototype test values are needed.

Checklist #20 passes: the screen design rationales relate to their stated jobs. The readability and repetition exceptions are recorded above.

## NEEDS-APURVA

- Confirm the proposed settings owners; TRACE explicitly leaves their approval pending.
- Confirm the disposition of the unaccounted old-PRD product constraints identified under §9; technical implementation details can remain in Engineering’s spec.

The primary measure and targets remain existing open decisions, not new findings.

## Summary

P0: 2 · P1: 9 · P2: 1
