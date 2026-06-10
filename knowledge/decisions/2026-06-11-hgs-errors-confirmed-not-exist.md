# Decision: Removed Non-Existent Error Scenarios from Doctor SOP

**Date:** 2026-06-11
**Status:** Decided

## Context
Initial SOP drafts included two error scenarios based on earlier assumptions:

1. "Doctor is not authorized to process this molecule medicine" — listed as an explicit error doctors would see
2. "Please enter notes to proceed" — listed as an inline toast when confirming without notes

## Decision
Both removed from the Doctor SOP. Both confirmed as non-existent by the product owner during SOP review.

## Reasoning
- Error 1 does not exist in the system — the authorisation is enforced differently
- Error 2 (inline toast) does not exist — only the "Couldn't save note" banner exists
- Including phantom errors in an SOP trains doctors to look for things that will never appear

## Consequences
- Section 5.2 (Doctor Not Authorised) removed entirely from Doctor SOP
- Error section renumbered: 5.2 → Confirmation Blocked, 5.3 → Add Medicine Blocked, 5.4 → Notes Validation
- State A (empty notes toast) removed from Section 5.4
