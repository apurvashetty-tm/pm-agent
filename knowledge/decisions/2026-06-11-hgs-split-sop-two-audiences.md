# Decision: Split HGS SOP into Two Separate Documents

**Date:** 2026-06-11
**Status:** Decided

## Context
Initial SOP-HGS-001 was a single document covering both Doctor and Operations (Super Doctor) workflows. The audience, language, and information needs of the two groups are fundamentally different.

## Decision
Split into two separate documents:
- `SOP-HGS-Doctor-001` — Doctor persona only
- `SOP-HGS-Ops-001` — Operations / Super Doctor only

## Reasoning
- Doctors do not need to know portal metrics, manual assignment, or SPLIT order recreation
- Operations team does not need step-by-step prescription flow
- A combined document creates confusion and makes each audience read irrelevant sections
- SOPs are shared as DOCX with teams — audience-specific docs are cleaner to distribute

## Consequences
- Two files to maintain when product changes
- Any change touching both workflows (e.g. ETA change) must be updated in both
