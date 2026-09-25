# PM projects — landscape

*What's currently being worked on across `projects/`, one paragraph each, so a new
teammate (or their Claude) can get oriented before going project-by-project. This is a
map, not the truth — each project's own `CLAUDE.md` / `docs/context/project_truth.md`
is authoritative; this file just points there. Update it when a project starts,
finishes, or materially changes shape — it doesn't need to track day-to-day status.*

## Active

**ACOM (Assisted Commerce)** — `projects/ACOM/` — the umbrella for cart-recovery /
cart-dropout work: reaching customers who abandoned an in-progress order, whether by
human agent call, AI voice call, or another channel. Read `projects/ACOM/CLAUDE.md`
first, then the relevant sub-initiative below.
- **Ring AI (AI-led Lead Qualification)** — `projects/ACOM/ring-ai/` — an AI voice
  agent (vendor: Ring AI, telephony: Knowlarity) calls dropped-cart customers first, so
  human agents spend their time only on the customers it qualifies as genuinely
  interested. PRD in review on Confluence (PROD 2023260174), kept in sync with
  `docs/ai-led-lead-qualification-prd.md`. Most actively worked project as of Sep 2026.
- **FTC Priority** — `projects/ACOM/ftc-priority/` — a sibling PRD on prioritising
  first-time-customer (FTC) leads within ACOM's existing manual queue. Written, not
  implemented.
- **Portal Revamp / "My Statistics"** — `projects/ACOM/acom-portal-revamp/` — see
  **Portal Unification** below; this folder holds its first shipped sub-project.

**Portal Unification** — vision lives in `projects/ACOM/acom-portal-revamp/CLAUDE.md`
(added Sep 2026; previously only in chat/memory, not git). Apurva's initiative to
enhance Truemeds' multiple internal agent/doctor portals individually first, then unify
them. First concrete piece shipped: the **My Statistics** page
(`projects/ACOM/acom-portal-revamp/My Statistics Page/`, PRD included). Broader
sub-initiatives (a shared calling+commerce layer across portals, a configurable Lead
Management System, a push-based agent/doctor allocation model) are still at the
proposal stage — not yet PRD'd.

**Doctor Portal prototype** — `projects/truemeds-doctor-portal-prototype/` — a
mobile-web prototype of the Truemeds Doctor Portal's consultation workflow (not the
production system). Functionality/JTBD considered solid; current focus is UI/UX —
bringing it in line with Truemeds' own design system rather than the IRIS BA app
styling it started from. Well underway: has its own locked `project_truth.md` and
several completed review cycles (see `docs/reviews/`).

**Valuemeds — OzoneTel → Knowlarity migration** — `projects/valuemeds/` — OzoneTel's
delayed webhooks are blocking the Valuemeds single-call warm-transfer flow (doctor →
Health Advisor on the same live call), forcing a degraded fallback for 1+ month. This
project frames the problem and drives evaluating Knowlarity as a backup vendor.

**PG (Payment Gateway) decision** — `projects/pg-payment-gateway-decision/` — a
commercial (MDR cost) comparison of payment gateways (Cashfree current, PayU,
EaseBuzz, Razorpay, Juspay as an optional orchestration layer) to pick the next one.
Documents/analysis only, no code.

**Roadmap** — `projects/Roadmap/` — active: `Q2_JAS_Stakeholder_Roadmap/`, a
clean-room Q2 stakeholder roadmap. `Roadmap Creation/` is a frozen earlier attempt,
kept for historical source material only.

**Post-Order AOP** — `projects/post-order-aop/` — charter-wide Annual Operating Plan
work for the Post-Order charter (Payments, Portals, Discards, Analytics) — a different
scope/cadence from any single quarter's roadmap. Active piece:
`PostOrder_Charter_Review/`.

**CEO discussions** — `projects/ceo-discussions/` — prep workspace for meetings with
the CEO, one dated subfolder per discussion; see its own `decisions-log.md` for a
running ledger of CEO decisions/commitments across meetings.

## Proposed, not yet a project folder

**Incentive Platform** — `projects/incentive-platform/` (added Sep 2026, minimal —
pre-PRD). Problem: agent incentives across portals are set, tracked, and reconciled
entirely by hand, are static (no way to shape by cohort or timeframe), agents can't see
what they're earning or why, and the manual nature blocks experimentation. Proposed
solution: a configurable incentive platform — structures configurable per
agent/cohort/portal, real-time visibility for agents, automatic reconciliation. Not yet
scoped into a PRD.

## Where the durable, cross-project facts live

- `knowledge/context/` — reusable company/system/glossary knowledge (this file included).
- `knowledge/context/tm-chotu/` — Truemeds business & data domain knowledge
  (metrics, order lifecycle, tables/enums, TAT/SLA) — skill-routed, see
  `knowledge/context/tm-chotu-integration.md`.
- `knowledge/decisions/` — dated, durable decisions that shouldn't be re-litigated.
- `knowledge/learnings/` — retrospectives and reusable operating patterns.
- `AGENTS.md` — the read-order and update protocol every project follows.
