---
name: 2026-07-14-expose-rankup-api-to-oration-ai
description: Decision to expose the order Rank-Up capability as an API for Oration AI (external voice bot) to call mid-conversation
metadata:
  type: decision
---

# Expose Rank-Up API to Oration AI

**Decision:** File and pursue a ticket (Jira PPE-199) to expose the
existing order Rank-Up capability — today only reachable via the CSR
Pharmacist Portal CTA — as an API that Oration AI (external voice bot
vendor) can call mid-call.

**Why:** [[oration-ai-voicebot]] currently handles ~6% of inbound call
volume (~30,000 tickets/month) via FCR, much of it customers requesting a
callback after a missed HA/Dr call. Without rank-up access, the bot can
only offer a static "callback within 4 hours" — a regression from the
CSR-assisted flow where the CSR actually reprioritised the order (see
[[rank-up-order-priority]]). Giving the bot real-time rank-up access lets
it accurately tell the customer they've been prioritised (~5 min
callback) instead of over-promising or under-delivering.

**Impact / scope:** PPE-199, Portals and Payments — Engineering board.
Requires resolving (as open questions on the ticket, not yet decided):
whether a callable Rank-Up API already exists behind the Pharmacist
Portal CTA or needs to be built, auth model for third-party vendor access
(API key/OAuth/IP allowlist, possible security review), live-call
latency requirements, idempotency, fallback script on API failure,
expected volume (~30,000/month, ~300/day estimated), and whether order
status needs to be passed to Oration AI or the API should self-validate
and just handle errors.

**Status:** Ticket filed, not yet scoped/built. Revisit this decision
file once the open questions above are resolved by engineering.
