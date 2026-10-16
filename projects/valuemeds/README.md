# Valuemeds — OzoneTel → Knowlarity Vendor Migration

Decision + evaluation project for the **Valuemeds single-call warm-transfer** flow.

## The one-liner
OzoneTel's delayed webhooks (leg-1 status, leg-2 status, call duration) prevent us
from validating the transfer conditions in time, so the Valuemeds single-call
warm-transfer has been kept off for 1+ month — forcing a degraded separate-call
fallback. This project frames the problem and drives the **Knowlarity** backup-vendor
evaluation and build.

## What Valuemeds is
Doctor calls the customer, completes the consult, then warm-transfers the **same
live call** to a Health Advisor. One call, one connection → historically higher
order completion / lower discards.

## Start here
1. `docs/context/problem_statement.md` — the framed problem (core deliverable)
2. `docs/context/project_truth.md` — locked facts + the three-signal transfer rule
3. `docs/context/session_handoff.md` — current resume point
4. `docs/context/open_questions.md` — unresolved decisions
5. `CLAUDE.md` — working rules / guardrails for this project

## Structure
```
valuemeds/
├── CLAUDE.md                          ← guardrails, priority order, reporting
├── README.md                          ← this file
└── docs/
    ├── context/
    │   ├── problem_statement.md        ← THE framed problem (OzoneTel fail → Knowlarity)
    │   ├── project_truth.md            ← locked constitution
    │   ├── session_handoff.md          ← current resume point
    │   └── open_questions.md           ← unresolved decisions
    └── roles/                          ← product-agnostic working rules
```

## Guardrails (do not violate)
- **No invented sizing.** Discard/completion/orders-lost numbers are owned by
  Analytics + Business — never guessed.
- **No unverified vendor promises.** Knowlarity capabilities must be tested, not asserted.
- Preserve the locked single-call journey and the three-signal transfer rule.
