---
name: oration-ai-voicebot
description: What Oration AI is, its call-handling role, and its gap vs the pre-existing CSR rank-up flow
metadata:
  type: context
---

# Oration AI (voice bot vendor)

Oration AI is Truemeds' external voice bot vendor. It handles inbound
support calls resolvable via FCR (first-call resolution) — currently
[USER-PROVIDED] ~6% of total inbound call volume (~30,000 tickets/month).

## Where it sits in the flow

A large share of FCR-eligible calls are customers calling because they
missed a Health Advisor (HA) / Doctor call, or never received one, and
want a callback.

- **Pre-voice-bot:** a CSR agent took the request and pressed a CTA on the
  Pharmacist Portal that "ranked-up" the order/lead — moving it to the top
  of the live call pool for priority processing. See [[rank-up-order-priority]].
- **Post-voice-bot (as of 2026-07-14):** Oration AI has no path to trigger
  rank-up. It can only tell the customer "you'll get a call within the next
  4-hour window" — a static promise with no actual pool reprioritisation
  behind it. This is a functional regression vs the CSR-assisted flow.

## Why this matters

Because Oration AI is the highest-volume automated resolution path, its
inability to invoke rank-up means the most common customer ask (missed
call, want priority callback) isn't actually being resolved faster —
just deferred to a fixed window, likely driving repeat calls.

## Related

- [[rank-up-order-priority]] — what rank-up does and how it's triggered today
- Jira PPE-199 — ticket to expose the Rank-Up API to Oration AI as an
  authenticated external integration
