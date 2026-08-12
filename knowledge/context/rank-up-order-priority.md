---
name: rank-up-order-priority
description: What "rank-up" means in Truemeds order/call flows and who can trigger it today
metadata:
  type: context
---

# Rank-up (order/lead priority escalation)

"Rank-up" moves a stuck or delayed order/lead to the top of the live call
pool, ahead of the normal LIFO/queue order, so it gets processed/called
next.

Source: `archives/projects/hgs-nfs-phase1/prds/PRD-HGS-Phase1.md` (Super
Doctor Portal PRD) — a superdoctor can manually rank-up an order when it's
stuck or needs priority handling. A customer can also trigger rank-up
(from the app, or via CSR) — the intent is that rank-up signals "customer
is available now, prioritise this."

## Trigger paths (as of 2026-07-14)

- **Super Doctor Portal:** superdoctor manually ranks up a stuck order.
- **CSR / Pharmacist Portal:** CSR agent presses a CTA on the Pharmacist
  Portal when a customer calls in requesting a callback — this was the
  path used before the Oration AI voice bot existed. See [[oration-ai-voicebot]].
- **Customer app:** direct customer-triggered rank-up (per HGS PRD intent).

## Known gap

Oration AI (external voice bot vendor) has no API path to trigger
rank-up — see [[oration-ai-voicebot]] and Jira PPE-199, which proposes
exposing a Rank-Up API for it to call mid-conversation.
