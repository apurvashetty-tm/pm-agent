# Decision: All Clinical Work Happens During the Live Call

**Date:** 2026-06-11
**Status:** Decided

## Context
Initial SOP structure implied a linear post-call sequence: call ends → prescribe → fill notes → confirm.

## Decision
All clinical work — prescribing, diagnosis, doctor notes, quantity decisions — happens DURING the live call with the patient. The call-end action depends on the CTA shown:
- `Confirm Order` — call has ended, doctor clicks confirm
- `Transfer` — call is STILL LIVE, patient stays on while transferred to Health Advisor
- `Forward` — call can end, Health Advisor will contact patient separately

## Reasoning
Confirmed by product owner. Reflects actual portal flow.

## Consequences
- Sections 3.6–3.9 of Doctor SOP rewritten to reflect live-call reality
- New Section 3.7 "End of Call — Follow the CTA" added with three-scenario table
- Do's/Don'ts updated: "Do not disconnect patient before completing Transfer"
