# Ring AI — Call outcome handling

For: Kartik A · From: Apurva (Product) · 30 Sep 2026
Closes LLD open decisions **#1** (verdict and call-outcome SLA) and **#13** (timeout before "outcome unknown").

## The problem

In the LLD, only Ring reports back. If Ring says nothing for 30 minutes, the reaper treats the call as not connected and retries. Four different cases end up looking the same:

- the customer didn't answer
- the number is invalid
- the call dropped within a few seconds
- the customer talked to the AI, but the verdict never reached us

The last case is the bad one: the AI calls back a customer it has already spoken to.

## The fix

For every AI **and agent** dial, consume **Knowlarity's hangup callback (cause + duration)**.
**Knowlarity tells us whether the call connected. Ring tells us how good the lead is.**

What we need on the callback:

- our reference (`lead_ref` / order ID) to match the call
- hangup cause code
- talk time (from answer to hangup, not ring time)
- call end time

## Rules

### 1. Knowlarity callback arrives

| Callback says | Result | What happens | Counts toward retry limit of 4? |
|---|---|---|---|
| Talk time **15 s or more** | Connected | Wait for Ring's verdict. Counts toward the frequency cap (3 connected calls in 7 days). | No |
| Talk time **under 15 s** | Short drop | Retry after 2 min | Yes |
| Not answered: **900, 902, 903, 904, 905, 907, 917** (no answer, busy, rejected, switched off, out of coverage) | Not connected | Retry on the 30 / 60 / 60 schedule | Yes |
| Not answered: **906, 908, 919** (number changed, invalid format, unallocated) | Invalid number | Close the lead (`INVALID_NUMBER`), no retry | — |
| Not answered: **any other code** (network, carrier or our side, e.g. 100–111, 150, 200, 901, 909–916, 918, 920+) | Dial failed | Retry on the same schedule | **No**: the customer's phone may never have rung. The 24 h window is the backstop. |

Codes come from Knowlarity's hangup-cause list (`reference/knowlarity-hangup-causes.pdf`). The 5XX codes are fax-only and don't apply.

### 2. Ring verdict

- **Verdict arrives:** apply it (Hot / Warm / Cold / Declined / Rescheduled, as already decided). A Ring verdict always overrides the Knowlarity result, because Ring only talks to a customer who answered.
- **No verdict 30 min after a connected call:** move the lead to the manual queue as a normal lead. No AI retry. The normal 24 h window then applies. There is no separate "unknown" state and no separate purge.
- **Late verdict (after 30 min):** apply it if no agent has dialled the lead yet. Otherwise, record it only.

### 3. Safety net

- **No callback and no verdict within 30 min of the dial:** move the lead to the manual queue as a normal lead. It doesn't count as an attempt. Alert if this happens more than rarely.

### 4. Agent calls (hold)

Agent calls use the same Knowlarity callback. The agent's hold reason is only a fallback.

When an agent puts a lead on hold, look up the Knowlarity result of that agent's latest dial for the lead:

| Situation | What happens | Counts toward retry limit of 4? |
|---|---|---|
| Hold reason is **"Order already placed."** | Close the lead (`ORDER_PLACED`), whatever Knowlarity says. Knowlarity can't know this. | — |
| Knowlarity: talk time **15 s or more** | Connected. Ignore the hold reason. | No |
| Knowlarity: talk time **under 15 s**, or a **customer-side code** (900, 902, 903, 904, 905, 907, 917) | Not connected. Ignore the hold reason. | Yes |
| Knowlarity: **invalid number** (906, 908, 919) | Close the lead (`INVALID_NUMBER`) | — |
| Knowlarity: **any other code** (network, carrier or our side) | Dial failed | No |
| **No Knowlarity result** | Use the hold reason. "Customer did not answer.", "Customer is not reachable/unavailable.", "Customer disconnected." and "Poor Network." count as not connected. | Yes |

- **The hold itself works as today in release 1.** The agent's chosen callback time and the Hold button don't change. Only the counting changes.
- **Frequency cap:** every agent dial with talk time of 15 s or more counts as a connected call, whether or not the agent holds the lead.
- This refines answer **#6** (hold reasons) and the "human not-connected rows" checklist item. Hold reasons now count only when Knowlarity sends nothing.

## What changes in the LLD

- **Reaper:** no longer retries or exhausts leads. It only does the 30 min move to the manual queue (sections 2 and 3).
- **Retries, short-drop retry, `INVALID_NUMBER` closure:** driven by the Knowlarity callback.
- **Human not-connected rows:** written at hold time from the Knowlarity result, with the hold reason as the fallback (section 4).
- **`RETRIES_EXHAUSTED`:** set when the 4th counted attempt (AI + human holds) is recorded.
- **Frequency cap:** a connected call means talk time of 15 s or more on any AI or agent dial, from the callback.
- **#1:** the verdict SLA is a contract number that Business agrees with Ring. The 30 min timeout stays as config (`ring.no.response.reaper.minutes`).
- **#13:** 30 min, confirmed.

## To confirm with Knowlarity

1. **Internal retries.** Knowlarity's own SIP retry list includes 919 (and 910, 914, 920, 921). Do they retry these themselves before calling us back? If yes, the callback is final. This matters for 919, which we close on.
2. **Talk-time field.** Which field is answer-to-hangup (not total ring + talk)?
3. **Callback timing.** How soon after hangup does the callback arrive?
4. **Agent calls.** Confirm agent dials go through Knowlarity and their callback carries the order ID, so we can match it at hold time.
