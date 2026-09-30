# rollout-gates-and-control-signals.md

**Status:** Learnings — reusable for any phased launch or capacity-bound automation, not specific to one project.
**Last updated:** 2026-09-30
**Source:** ACOM × Ring AI PRD v3 (29–30 Sep 2026) — GTM and throttle design. Detail: `knowledge/decisions/2026-09-30-ring-ai-v3-reach-gtm-controls.md`.

---

## 1. Gate a rollout against the control group, not fixed targets
- Split traffic so one side gets the new thing and the other stays as today; step up only if the new side is **not worse** than the control (e.g. sales per 100 customers).
- Fixed targets ("conversion ≥15%") can block a change that already beats today, or pass one that looks good on a narrow slice while total outcomes drop.
- A missed gate means **hold and RCA** — the funnel shows which step broke; raising traffic fixes none of them.

## 2. Split on a stable, sequential id
- Last digits of a running id (customer id) give a random-equivalent split with one filter and nothing to store; each entity always stays on one side.
- Pick the id that survives future use cases (customer id, not order id, when later leads may have no order).

## 3. Control the signal that actually fails, not a proxy
- A cap on calls in flight protects vendor limits and cost — it does not prevent the real failure (qualified leads going stale).
- Watching the **age of the oldest waiting item** ("pause if the oldest has waited >2 h") targets it directly, needs no number to calculate, and adjusts on its own as capacity changes.

## 4. Watch for filters that "win" on rate but lose on volume
- A qualifier can post a high conversion rate by passing only a handful of leads. Pair the rate with a check on what's filtered out (a small random sample of rejects) and with the final value metric (converted orders × AOV).

## 5. Denominators must match
- "Converted X%" means nothing without the base: of attempted, of all qualified, of all eligible. POC "20%" was really 18% of attempted / 10.5% of all qualified once stale leads were counted.
