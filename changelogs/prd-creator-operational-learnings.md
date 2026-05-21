---
name: prd-creator-operational-learnings
description: >
  Generalizable PRD writing principles derived from real-world sessions. Read by
  prd-creator at Step 5 before drafting Use Cases. Updated weekly by the skill
  improvement pipeline — do not edit manually.
---

# Operational Learnings
*Principles derived from real-world session analysis — updated weekly.*

### 2026-05-14

- **PRDs describe desired state, not current state — never mention bugs**: If the user's context includes a known bug or current system deficiency, do not write it into the PRD. The PRD specifies how the system *should* behave once built. If relevant, add a one-line note: *"This PRD assumes bug [X] is resolved prior to implementation."*

- **When a specific parameter value is mentioned, ask whether the PM wants to experiment or hard-code it**: If the PM specifies a number (e.g., "use 20 as the sample threshold"), always ask: *"Do you want this as a fixed value, or do you want to run an experiment to validate the right threshold?"* Algorithmic features at Truemeds frequently require threshold calibration.

- **When addressing logic at one data hierarchy level, check the parent and sibling levels too**: If the PRD describes logic at city or state level, ask whether analogous logic is needed at the country level. Data pipelines often have a city → state → country hierarchy; defining logic at one level without specifying the others creates gaps in engineering.

- **Instrumentation requirements need their own structured section, not a bullet under Metrics**: When the PRD includes audit trail or instrumentation requirements, define them in a dedicated Instrumentation section with exact field names — event/table, granularity (order-level, session-level), and field list with expected types.

- **For any new algorithmic or model-driven feature, always ask about shadow mode before writing the rollout plan**: If the feature involves ML scoring, ranking, or complex allocation logic, ask: *"Do you want to run this in shadow mode before exposing it to live orders?"* If yes, the Rollout section must include shadow mode as Stage 1 with explicit success criteria for graduating to live.

- **Use tables for the Rollout & Stage Gates section**: Always present rollout stages as a table with columns: Stage | Entry Criteria | Success Criteria | Action on Failure.
