# Valuemeds (OzoneTel → Knowlarity Vendor Migration) — Claude Rules

## What this project is
This project addresses the **Valuemeds single-call warm-transfer flow** (doctor
consult → warm-transfer to HA on the same live call). OzoneTel — the telephony
vendor powering the transfer — has been sending **delayed webhook responses** for
1 month+, breaking the flow, so we fell back to a worse separate-call flow. This
project defines the problem and drives the **evaluation and build of Knowlarity**
as a reliable backup/replacement vendor.

It is a **decision + evaluation project** (problem statement, vendor eval, build
plan), not a UI prototype. Source of truth is the markdown in `docs/`.

---

## Workspace memory

Before project-specific work, also read:
- `../../AGENTS.md`
- `../../CLAUDE.md`
- relevant files in `../../knowledge/context/` (esp. tm-chotu telephony/logistics if present)

Use project-local files for project truth and handoff. Use root knowledge files
only for reusable company/system context.

---

## Read these files before making any decision
1. `docs/context/project_truth.md`
2. `docs/context/problem_statement.md`
3. `docs/context/session_handoff.md`
4. `docs/roles/product_manager.md`
5. `docs/context/open_questions.md`
6. `docs/roles/backend_engineer.md` (telephony/webhook integration context)

---

## Priority order
1. **Latest user instruction** — always wins
2. **`docs/context/project_truth.md`** — locked product truth
3. **`docs/context/problem_statement.md`** — the framed problem this project solves
4. **`docs/context/session_handoff.md`** — current resume point and latest state
5. **`docs/roles/*`** — role-specific working rules
6. **`docs/context/open_questions.md`** — unresolved decisions that must not be silently answered
7. **`[MOCK ASSUMPTION]`** — temporary unblockers, small and local only, clearly labeled

If two sources conflict, follow the higher-priority source and surface the
conflict rather than silently blending.

---

## Core rules
- This is analysis/decision work first. Do not invent telephony behavior, webhook
  contracts, or vendor capabilities — mark unknowns `[OPEN DECISION]`.
- Do not fabricate impact numbers (discard rate, orders lost). Sizing is a
  **tracked TO-DO owned by Analytics + Business** — leave it as a call-out, never
  fill it with guessed figures.
- Do not claim Knowlarity capabilities we have not verified against their actual
  endpoint/docs.
- Work one file or one focused section at a time.
- Before working, continue from `docs/context/session_handoff.md` unless the user overrides.
- After working, update `docs/context/session_handoff.md` before the final report.

---

## What requires explicit user confirmation before implementing
Do not silently decide or implement:
- **Vendor decision** — declaring Knowlarity primary, OzoneTel dropped, or the
  failover model. This is a business/commercial call.
- **Impact / sizing numbers** — never assert a discard or order-loss figure
  without the Analytics + Business team's data.
- **SLA / latency thresholds** — what counts as "on time" for the three webhooks.
- **Any external message** (to OzoneTel, Knowlarity, or internal stakeholders) —
  draft only; do not treat as sent.

If one of these surfaces with no clear answer, mark it `[OPEN DECISION]`, use a
safe placeholder, and add it to `docs/context/open_questions.md`.

---

## Never silently invent final truth for
- Impact sizing (discard rate, order completion, orders lost/month)
- Vendor capabilities, pricing, or SLA commitments (OzoneTel or Knowlarity)
- Webhook contract details (payload shape, timing guarantees) not verified
- The go/no-go vendor decision

---

## Decision labeling rule
- `[LOCKED]` — already decided, must be followed exactly
- `[RECOMMENDED]` — best current suggestion, open to override
- `[MOCK ASSUMPTION]` — temporary unblocker, not final truth
- `[OPEN DECISION]` — requires user confirmation before implementing

---

## Reporting rule after every task
After each task, output a short structured report:
1. **Files changed**
2. **What changed** (plain English)
3. **What was intentionally not changed**
4. **Assumptions made** (labeled)
5. **Still open / needs verification**
6. **Next step**

Before this report, update `docs/context/session_handoff.md`.

---

## Final principle
Frame the problem sharply, keep verified facts separate from assumptions, and
push the Knowlarity evaluation forward without inventing numbers or vendor
promises. Stop and ask where the decision belongs to the user or the business.
