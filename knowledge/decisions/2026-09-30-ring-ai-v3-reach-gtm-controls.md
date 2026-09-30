---
name: 2026-09-30-ring-ai-v3-reach-gtm-controls
description: PRD Draft v3 decisions on ACOM × Ring AI (29–30 Sep) — reach reframing, ₹500 minimum AOV for AI + manual queue, today's queue logic as dial order, one-lead-at-a-time per attempt, pause rule replacing the throttle, Hot/Warm 24 h hold, firm setting values, customer-ID GTM split with gates, sales as the final metric, vendor-agnostic dropped. Read for what was decided and why.
metadata:
  type: decision
  domain: acom
  status: locked
  supersedes: 2026-09-11-ring-ai-call-architecture (batch pre-load → per-attempt send; WebSocket leg → SIP trunk); 2026-09-09-ring-ai-fresh-platform-prd (throttle; vendor-agnostic in scope; FTC-first as a separate dial rule)
---

# ACOM × Ring AI — PRD v3: reach, ₹500 floor, pause rule, GTM (30 Sep 2026)

**Context.** Engineering raised that a ₹500–899 lead marked Cold by the AI had no route to a
human (the manual queue floor was ₹900). Business separately aligned on lowering the floor.
Working through it showed the real problem is **reach**: of ~12,500 eligible leads a day
(₹900+), agents attempt only ~40% (Analytics numbers, replacing the BRD's "~60% reached").
Published on Confluence as Draft v3 (PROD 2023260174) on 30 Sep.

## Decisions

1. **Minimum AOV ₹500 for both the AI and the manual queue** (was ₹900). ~17,000 leads/day;
   FTC share 20.2% → 25% (38% within ₹500–900). One threshold, not two — also closes the
   Cold ₹500–899 orphan gap.
2. **The AI uses today's queue logic, as is** — same filters, `final_score` order. The score's
   FTC weighting already puts FTC first; no separate FTC rule or threshold.
3. **One lead at a time, per attempt** — send to Ring, then dial via Knowlarity; every retry is
   sent to Ring fresh; retries are ours. Replaces the "pre-load in batch" step (11 Sep).
4. **Data sent per attempt:** reference id, cart items + quantities, order-level pricing (MRP,
   selling price, discount amount + percent, total savings), delivery ETA, patient name (else
   customer name). No phone, no address, no SKU-level pricing.
5. **Hot/Warm stay in the agents' queue 24 h from the verdict**, overriding the normal 24-hour
   window; not attempted by then = **stale** (new terminal disposition). A reviewer asked for
   48 h (29 Sep); Product kept 24 h.
6. **Pause rule replaces the throttle** — before sending new leads to the AI, if the oldest
   Hot/Warm lead has waited >2 h for an agent, send none. Due retries still go out.
   *Why:* stale is caused by the AI producing Hot/Warm faster than agents attempt them; a count
   of calls or leads in flight doesn't see that — the age of the oldest waiting lead does, and
   needs no number to calculate.
7. **Kill switch:** global master stop now; per-use-case stop later.
8. **Setting values firm:** retry 30/60/60 min (4 attempts), 2 min after a short drop; minimum
   connect 15 s; frequency cap 3 connected calls / rolling 7 days; calling window 09:00–21:00;
   hold-time 24 h; pause rule 2 h. Config — tunable at go-live.
9. **GTM split by customer ID** (not order ID — future leads may have no order): tech pilot
   00–04 (5%) → 00–24 → 00–49 → all on ₹900+, then ₹500 at 00–74 → all. Random-equivalent split,
   so AI and agent sides compare fairly.
10. **Gates:** safety (0 simultaneous AI + human calls); outcome + verdict within contract SLA;
    stale ≤10%; Hot/Warm conversion ≥2× human; 5% Cold sample (called by Ops outside allocation)
    converts clearly lower; sales per 100 customers AI ≥ agent. Missed gate → hold + RCA.
    *Why relative gates:* scaling should depend on "not worse than today", not on hitting an
    absolute target; the Cold sample catches the AI marking buyers Cold.
11. **Final business number = ACOM sales (₹/day) = converted orders × AOV.** Orders count within
    24 h (of the verdict / the agent's attempt).
12. **Vendor-agnostic by design dropped from scope** — one vendor, one telephony provider; a swap
    is a re-integration. The "how far to build the vendor layer" question is closed.
13. **§9 regrouped** — none of the open items blocks the build (go-live checks, InfoSec call-out,
    later).
14. **AI leg is a SIP trunk, not a WebSocket** (Engineering correction, late 30 Sep). §4 diagram
    now reads "telephony bridges to the vendor (SIP trunk)" and "bot speaks on that SIP call".
    Replaces the 11 Sep WebSocket choice; §6 and §13 of the PRD still to be aligned.

## Not decided here
See `projects/ACOM/ring-ai/docs/context/open_questions.md`.
