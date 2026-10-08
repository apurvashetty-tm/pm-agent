# Ring AI Calling Platform — Low Level Design

Sep 30, 2026 · @Kartik A

## Overview

csr-service hands eligible incomplete orders to the Ring AI voice agent first. The agent qualifies each lead, and human CSRs then work the leads in priority order. This LLD describes the full design as if it were being built from scratch.

**Problem.** Every incomplete order (status `INCOMPLETE_ORDER`) goes into one human CSR queue, whatever its value or intent. Agents spend dials on customers who never pick up or have already decided. High-intent customers wait in line behind everyone else.

**Goals**

- Pick eligible incomplete orders on a schedule. An order is eligible when its value is over ₹500, it has a delivery address, and it is inside the calling time window. Hand them to Ring AI under a configurable concurrency quota.
- Upload each lead to Ring AI with personalised call variables: name, cart items, MRP and cart value. Then trigger the outbound dial through Knowlarity after the delay Ring AI requires.
- Take in Ring AI's verdict (HOT, WARM, COLD, DECLINED, RESCHEDULED) through a webhook, buffered on SQS. Store it on the order as its lead quality.
- Route leads to humans by verdict. HOT and WARM go above the general queue, COLD goes below it. DECLINED and RESCHEDULED return to the general pool.
- Retry calls that did not connect on a configurable backoff (30, 60 and 60 minutes today), then mark the order EXHAUSTED.
- Never let the AI and a human work the same order. Once a human has touched an order, the AI never dials it again.

**In scope:** lead selection and reservation, the SQS pipelines (push, dial, verdict), the Ring AI and Knowlarity integrations, the verdict webhook, the no-response reaper and retry model, lead-quality prioritisation in CSR assignment, cron triggers from scheduler-service, schema changes, configuration, security and rollout.

**Out of scope:** Ring AI's conversation script and scoring logic, Knowlarity telephony internals (reached through thirdparty-service), CSR dashboard UI changes, and reporting/analytics on verdicts.

## Glossary and key concepts

| Term | Meaning |
| --- | --- |
| Incomplete order / lead | A row in `incomplete_order_details` whose order is in `INCOMPLETE_ORDER` status. The customer built a cart but did not place the order. |
| Ring AI | Third-party voice-agent platform. We upload a callee with custom variables, and after the call it posts back a verdict. |
| Knowlarity | Telephony provider that places the outbound call and bridges the customer to the Ring AI session. Reached only through thirdparty-service. |
| Bot user (`RING_AI_USER_ID`) | A pseudo agent id. `assigned_to` is set to it while Ring AI owns the order, which keeps the order out of every human queue. |
| Reservation | Moving an order from the unassigned pool onto the bot user and taking one slot of the concurrency counter. |
| Concurrency counter | A row in `counter` (`limit_value`, `remaining_value`). It caps how many orders Ring AI holds at once. Reserve increments the consumed count; verdict, release and reaper decrement it. |
| `ai_status` | Where the order is in the AI pipeline: `NULL` (not pushed), `IN_FLIGHT` (pushed and dial queued), `DONE` (verdict applied), `EXHAUSTED` (retry cap used up). |
| Verdict / lead bucket | Ring AI's post-call classification: HOT, WARM, COLD, DECLINED, RESCHEDULED. HIGH, MEDIUM and LOW are accepted as aliases of HOT, WARM and COLD. |
| `lead_quality` / `lead_quality_at` | The verdict stored on the order and the time it was applied. That time starts the hot hold-time clock. |
| Hot hold-time | How long a HOT, WARM or COLD verdict keeps a lead in its priority tier: 36 hours by default. After that the lead is stale and no tier serves it. |
| Hot / warm / cold tier | Where a qualified lead sits in the CSR picker. HOT and WARM are served before the general queue, COLD after it. |
| Not-connected attempt | An AI dial that produced no verdict before the reaper timeout (30 minutes). Recorded as one row in `ring_ai_not_connected_attempt`. |
| Retry gap | The wait before the next attempt after a not-connected one. Configured as a list (30, 60, 60 minutes); the list length is the retry cap. |
| Reaper | A scheduled job that finds `IN_FLIGHT` orders older than the timeout. It either schedules a retry or marks the order EXHAUSTED with `ring_outcome = NO_RESPONSE`. |
| `last_hold_channel` | Who last put the order on hold: `AI` or `HUMAN`. Once it is `HUMAN` it never goes back, and the AI picker skips the order for good. |
| Calling window | The hours in which push and dial jobs may run: 09:00–21:00, enforced by the scheduler-service crons. |
| Drain job | A scheduled job that long-polls one SQS queue and handles up to 5 batches of 10 messages per run. |

## High-level architecture

csr-service owns the whole pipeline. Three SQS queues separate the steps that face a vendor, so a slow or failing vendor never blocks lead selection or CSR assignment.

&#91;embedded content: Ring AI architecture · 3 queues, 7 csr-service components, 3 external systems\]

scheduler-service triggers all four scheduled jobs (picker, push drain, dial drain, reaper), each on its own cron; only the picker's trigger is drawn. Every job reads and writes MySQL, and only the main writes are drawn.

| Component | Kind | Triggered by | Responsibility |
| --- | --- | --- | --- |
| Picker job `incomplete-orders-ring-ai` | Scheduled job | scheduler-service cron → `POST /scheduled-jobs/{job}/trigger` | Selects eligible orders up to the free slots, reserves them on the counter, assigns them to the bot user, builds callee variables and publishes one push message per order |
| Push drain `ring-ai-push-drain` | Scheduled job | scheduler-service cron | Long-polls the push queue, uploads the callee to Ring AI, marks the order `IN_FLIGHT` and publishes the dial message with a 300 s delay |
| Dial drain `knowlarity-dial-drain` | Scheduled job | scheduler-service cron | Checks the order is still awaiting a dial, reads the mobile number at dial time and calls the Knowlarity endpoint on thirdparty-service |
| Reaper `ring-ai-no-response-reaper` | Scheduled job | scheduler-service cron | Finds `IN_FLIGHT` orders older than 30 minutes, then schedules a retry or marks them EXHAUSTED |
| Verdict webhook `POST /webhook/ring-ai/verdict` | REST controller | Ring AI | Validates the payload, enqueues it, returns 202; returns 503 if the enqueue fails |
| Verdict listener | `@SqsListener` | Verdict queue | Applies the verdict, stores the call record and frees the slot in one transaction |
| CSR picker `assignOrderFromIncompleteOrders` | Existing method, extended | An agent asks for the next order | Serves the HOT/WARM tier before the general pool and the COLD tier after it |
| Human hold `POST /orderOnHold` | Existing endpoint, extended | An agent puts an order on hold | Also sets `last_hold_channel = HUMAN`, which removes the order from AI selection for good |
| Job registry and controller | Infrastructure | — | Maps job names to beans; exposes the trigger API that scheduler-service calls |
| Concurrency counter | MySQL row + `CounterManager` | — | Guarded `UPDATE`s that cap how many orders Ring AI holds at once |
| Redis locks | Redis `SETNX` with TTL | — | `lock:order:ring-ai:{orderId}` (30 s) for the push and dial drains; `lock:order:assign:{orderId}` (5 s) for the CSR picker |

### Job scheduling: scheduler-service

The four jobs are triggered by `RingAiScheduler` in scheduler-service, not by EventBridge. scheduler-service already runs the platform's `@Scheduled` jobs as a single instance, so each cron fires exactly once and no new AWS infrastructure is needed. csr-service owns the work; scheduler-service only decides when it runs, calling `POST /scheduled-jobs/{job}/trigger` over the internal network with the `X-Trusted-Author` header.

| Job | Cron (Asia/Kolkata) | Fires | Why this cadence |
| --- | --- | --- | --- |
| `incomplete-orders-ring-ai` | `0 0/30 9-20 * * ?` | Every 30 min, 09:00–20:30 | Matches the 30 min idle rule. The last reserve at 20:30 dials at about 20:36, before the 21:00 cut-off. |
| `ring-ai-push-drain` | `0 * 9-20 * * ?` | Every minute, 09:00–20:59 | Keeps the poll interval from stretching the 300 s dial delay |
| `knowlarity-dial-drain` | `0 * 9-20 * * ?` | Every minute, 09:00–20:59 | Same as the push drain |
| `ring-ai-no-response-reaper` | `0 0/10 9-21 * * ?` | Every 10 min, 09:00–21:50 | Cleanup only and never dials, so it runs an hour past the window to sweep the day's last in-flight orders |

The verdict listener is not scheduled. It consumes its queue continuously through `@SqsListener`.

- **Kill switch.** `ringAi.scheduler.enabled` (`RING_AI_SCHEDULER_ENABLED`, default false) on scheduler-service, on top of csr-service's own flags.
- **Manual run.** `POST /triggerRingAiJob/{jobName}` on scheduler-service, or call csr-service's trigger endpoint directly.
- **Changing a cadence** is a property change plus a scheduler-service restart. There is no runtime interval API, so csr-service does not need the EventBridge Scheduler SDK, `SchedulerClientConfig`, the `/interval` endpoints or `scheduler.admin.trusted.author`.
- **Single instance.** If scheduler-service is down, nothing is reserved or dialled. That is safe: in-flight orders wait and the reaper sweeps them once it is back. If scheduler-service is ever scaled past one replica, every cron fires once per replica. The DB guards keep that correct, but the picker would run its query several times per tick.
- **Synchronous trigger.** The HTTP call holds one of scheduler-service's 5 scheduling threads, which are shared with every other job, until the csr-service job returns. A drain run can take about 25 s of long polling plus vendor calls. The `RestTemplate` read timeout must be longer than the slowest job run.

## End-to-end flows

An order passes through five flows: selection, push, dial, verdict, and not-connected recovery. A sixth flow, CSR routing, is where humans pick the lead up. Every state change is a guarded `UPDATE`, so a duplicate or late message changes nothing (see Error handling).

### Flow A — Lead selection and reservation (picker job)

1. scheduler-service's cron calls `POST /scheduled-jobs/incomplete-orders-ring-ai/trigger` with the `X-Trusted-Author` header. If `ring.ai.push.enabled=false`, the job exits.
2. Read the concurrency counter: free slots = `limit_value − remaining_value`. If there are no free slots, exit.
3. Prefilter on `order_details`: status `INCOMPLETE_ORDER`, `order_value > 500`, `created_on` in the last 24 h, `address_id IS NOT NULL`.
4. Select from `incomplete_order_details` among those ids, up to the free-slot count, ordered by `final_score DESC, order_value DESC`. A row must satisfy all of these:
   - active, `eligible_for_ranking = true`, `assigned_to IS NULL`
   - `order_value > 500`, and `cx_modified_on` falls between 24 h ago and 30 min ago (the customer has been idle for at least 30 min)
   - `rank_again_after` is null or has passed, and ai\_status is NULL (never pushed, or reset by a retry)
   - `last_hold_channel` is not `HUMAN`
   - at least one `sub_order_details` row has a `patient_id`
5. Reserve the slots: a guarded `UPDATE` adds N to `remaining_value`. If the guard fails (the limit would be exceeded), exit without assigning anything.
6. Set `assigned_to = RING_AI_USER_ID` on each selected row. From this point no human queue can see the order.
7. Build the callee variables for the whole batch (see APIs). This takes about five set-based queries per batch, not per order.
8. Publish one push message per order. If a publish fails, release that order straight away (Flow E, release).

### Pause rule — intake control on Flow A

The picker stops sending new leads to the AI while agents are behind on Hot/Warm. Retries already due still go out (PRD §6). The check runs on every picker tick, so the AI resumes by itself once agents catch up.

1. Before selecting, run `findOldestWaitingHotWarmVerdictAt`. It returns `MIN(lead_quality_at)` over leads that are bot-held (no agent has claimed them), `ai_status = DONE`, HOT or WARM, open, and with `lead_quality_at` inside the hold-time. Stale leads are left out so they can't keep the AI paused forever.
2. If `NOW() − MIN(lead_quality_at)` is more than `ring.ai.pause.max.wait.minutes` (120), the picker is **paused**. No rows means nothing is waiting, so it isn't paused.
3. While paused, the picker query adds `last_hold_channel = 'AI'`. Only retries go out: orders the reaper released after a not-connected AI attempt. New leads wait, and the concurrency counter still caps how many retries can go.
4. The wait is wall-clock time, including overnight. Hot/Warm verdicts from the evening can hold the AI paused the next morning until agents clear them, which is how the PRD states the rule.

| Setting | Default | Meaning |
| --- | --- | --- |
| `ring.ai.pause.enabled` (`RING_AI_PAUSE_ENABLED`) | true | Turns the rule on or off |
| `ring.ai.pause.max.wait.minutes` | 120 | Longest a Hot/Warm lead may wait for an agent before the AI pauses |

**Signals:** gauges `ring_ai_paused` (0 or 1) and `ring_ai_oldest_hot_warm_wait_minutes` are refreshed every tick, and a log line is written each time the picker runs paused. Alert when `ring_ai_paused = 1` for more than about 3 h inside the calling window; it usually means the team is short-staffed.

**Cost:** the check is answered from `idx_iod_bot_quality` alone and never touches table rows. It reads only the Hot/Warm verdicts inside the hold-time, however many old bot-held rows build up. The rule also limits its own input: while paused, the AI produces no new Hot/Warm.

### Flow B — Callee upload (push drain)

1. Long-poll the push queue: up to 5 batches of 10 messages, with a 5 s wait.
2. Drop the message (and release the order) in any of these cases: the body cannot be parsed, it has no `orderId`, `ApproximateReceiveCount > 3`, or `enqueuedAt` is more than 15 min old.
3. Acquire the Redis lock `lock:order:ring-ai:{orderId}` (30 s). If it is held, leave the message for redelivery.
4. Re-read the order. Drop the message if the order is no longer bot-held, already has a `ring_outcome`, or has a non-null `ai_status` (a duplicate delivery).
5. Call Ring AI `upload-json` with `agent_id` and one callee (`user_id = orderId` plus the custom variables).
6. Run `markInFlight`: `ai_status NULL → IN_FLIGHT` and `in_flight_at = NOW()`, guarded on `ai_status IS NULL`. If 0 rows change, another worker claimed the order: drop the message.
7. Publish the dial message with `DelaySeconds = 300`, the gap Ring AI requires between upload and dial. Then delete the push message.
8. On an HTTP 4xx from Ring AI, release the order and delete the message, since the same payload would be rejected again. On any other error, keep the message for retry.

### Flow C — Outbound dial (dial drain)

1. Long-poll the dial queue with the same batching and the same attempt cap of 3.
2. If `dispatchedAt` is more than 15 min old, release the order instead of dialling. By then the Ring AI session is too old to bridge the customer into.
3. Acquire the same per-order Redis lock, then re-read the order. Dial only when all of these hold: the order is bot-held, `ring_outcome IS NULL`, `lead_quality IS NULL` and `ai_status = IN_FLIGHT`.
4. Read the mobile number from `customer_details` now, not at enqueue time, so it cannot go stale during the delay. If it is blank, release the order.
5. Call thirdparty-service `knowlarity/ring-ai-call` with `{orderId, mobileNo}`. On 4xx, release the order. On any other error, keep the message for retry.

### Flow D — Verdict ingestion

1. Ring AI posts to `POST /webhook/ring-ai/verdict`. The controller rejects a missing `order_id` with 400. It then wraps the payload with `receivedAt` and publishes it to the verdict queue. It returns `202 {status: accepted}`, or `503` if the publish failed, so that Ring AI resends.
2. `RingAiVerdictListener` (`@SqsListener`, delete on success) parses the message. It drops a message that cannot be parsed or has no `orderId`.
3. `applyRingAiVerdict` runs in one transaction:
   - Map `lead_bucket` (HOT/HIGH, WARM/MEDIUM, COLD/LOW, DECLINED, RESCHEDULED). Anything else is a `BadRequestException`: logged and dropped, never retried.
   - For HOT, WARM or COLD, set `lead_quality`, set `lead_quality_at = NOW()` and set `ai_status = DONE`. The order stays on the bot so the CSR tiers can read it.
   - For DECLINED or RESCHEDULED, make the same update plus `assigned_to = NULL`. This releases the order back to the general pool.
   - Both updates are guarded on `assigned_to = bot`, `lead_quality IS NULL`, `ring_outcome IS NULL` and `is_active`. If 0 rows change, the verdict has already been applied (or the reaper or a release got there first): return quietly.
   - Insert a `ring_ai_call_verdict` row, then decrement the counter by 1. If the decrement fails, throw so the whole transaction rolls back.
4. A `TechnicalException` or runtime error is rethrown. SQS redelivers the message until the redrive policy moves it to the DLQ.

### Flow E — Not-connected retry and release (reaper)

1. scheduler-service triggers `ring-ai-no-response-reaper`. It selects orders where `assigned_to = bot`, `ai_status = IN_FLIGHT` and `in_flight_at` is more than 30 min old. It seeks on the `(assigned_to, ai_status)` prefix of `idx_iod_bot_quality`, and the in-flight set it reads is capped by the concurrency counter.
2. For each order, count its `ring_ai_not_connected_attempt` rows. Call that count *k*; the gap list is `[30, 60, 60]`.
   - **k < 3:** release with `rank_again_after = NOW() + gap[k]` and `last_hold_channel = 'AI'`, and clear `assigned_to`, `ai_status` and `in_flight_at`.
   - **k ≥ 3:** set `ai_status = EXHAUSTED` and `ring_outcome = NO_RESPONSE`, and keep `assigned_to` on the bot. It also closes the lead (lead\_state CLOSED, reason RETRIES\_EXHAUSTED), which removes it from every queue for good.
   - Both updates are guarded on `ai_status = IN_FLIGHT`. Only when the update changes a row do we insert an attempt row with `dial_channel = 'AI'`.
3. Decrement the counter once by the number of orders changed.
4. **Release** (used by the push and dial drains on a terminal failure) sets `assigned_to`, `ai_status` and `in_flight_at` to NULL and decrements the counter. It does not count as a not-connected attempt.

In total an order gets up to 4 AI attempts, 30, 60 and 60 minutes apart (plus the 30 min timeout each time), before it is EXHAUSTED. Adding a value to the gap list adds one attempt, with no code change.

### Flow F — CSR routing and cross-channel exclusion

When an agent asks for the next order, `assignOrderFromIncompleteOrders` serves the first match in this order:

1. Orders already assigned to this agent with no action taken yet, where any call schedule on them is due.
2. **HOT, then WARM** AI leads: bot-held, with `lead_quality_at` inside the hold-time. Within a bucket, the lead with the oldest `cx_modified_on` is served first. There is no `order_value` floor.
3. Call-scheduled orders assigned to this agent.
4. Call-scheduled orders from other agents that are more than 15 min overdue.
5. The general pool: `order_value > 900`, `cx_modified_on` in the last 24 h (Monday included), and not bot-held. If nothing matches, fall back to previous live orders from the last 5 days.
6. **COLD** AI leads: bot-held, inside the hold-time, oldest first, with no `order_value` floor.

The chosen order is claimed under the Redis lock `lock:order:assign:{orderId}` (5 s). The claim is `updateAgentIdForOrderFromPool`, guarded on `assigned_to IS NULL OR assigned_to = bot`. The picker then re-reads the row to confirm the claim, and retries up to 3 times.

**Cross-channel exclusion.** The two channels never work the same order:

- While the AI owns an order, `assigned_to = bot` hides it from every human query except the verdict tiers, which only match once `lead_quality` is set.
- When a human puts an order on hold (`/orderOnHold`), `last_hold_channel` becomes `HUMAN` and never changes back. The AI picker excludes those orders permanently.
- After an AI not-connected release, the order returns to the shared pool once `rank_again_after` passes. Whichever channel picks it first owns it.

## Order temperature and time-window rules

The verdict decides where a lead sits in the CSR picker. A configurable hold-time (36 h by default) decides how long it stays there. All time rules below are configuration, except the three marked hard-coded.

### Verdict to tier mapping

| Verdict | Aliases accepted | `assigned_to` after verdict | CSR tier | `order_value` floor in tier | Bounded by hold-time |
| --- | --- | --- | --- | --- | --- |
| HOT | HIGH | Bot (kept) | Priority 2, before the general pool; served first within the tier | None | Yes |
| WARM | MEDIUM | Bot (kept) | Priority 2, after HOT | None | Yes |
| COLD | LOW | Bot (kept) | Priority 6, after the general pool | None | Yes |
| DECLINED | — | NULL (released) | General pool | 900 (pool rule) | No |
| RESCHEDULED | — | NULL (released) | General pool | 900 (pool rule) | No |
| NOT\_CONNECTED | Never accepted from Ring AI; inferred by the reaper | NULL on retry; bot on EXHAUSTED | Shared pool after the gap; none once EXHAUSTED | 500 (AI) / 900 (human) | No |

The tiers drop the `order_value` floor on purpose. Ring AI calls orders above ₹500, but the general pool only serves orders above ₹900. Without the drop, a qualified lead between ₹500 and ₹900 would reach no one.

Within one bucket, leads are served oldest `cx_modified_on` first. A lead whose `lead_quality_at` is NULL counts as fresh, so older rows do not vanish from the tier.

### Time rules

| Rule | Value | Config key | Applies to |
| --- | --- | --- | --- |
| Customer idle before the AI picks the order | 30 min | hard-coded (`cx_modified_on ≤ now − 30 min`) | Picker job |
| Selection lookback | 24 h, every weekday including Monday | hard-coded (`previousDay = now − 1 day`) | Picker job and general CSR pool |
| Order creation lookback | 24 h | hard-coded in the `order_details` prefilter | Picker job |
| Calling window | 09:00–21:00 | scheduler-service crons (see Architecture) | Push and dial drains (they do not run outside it) |
| Upload-to-dial delay | 300 s | `ring.ai.dial.delay.seconds` | SQS `DelaySeconds` on the dial message |
| Push message max age | 15 min | `ring.ai.push.message.max.age.minutes` | Push drain |
| Dial max age (Ring AI session validity) | 15 min | `ring.ai.dial.max.age.minutes` | Dial drain |
| No-response timeout | 30 min | `ring.no.response.reaper.minutes` | Reaper |
| Not-connected retry gaps | 30, 60, 60 min | `ring.ai.not.connected.retry.gap.minutes` | Reaper |
| Hot hold-time | 36 h (PRD range 24–48 h) | `ring.ai.hot.hold.time.hours` / `RING_AI_HOT_HOLD_TIME_HOURS` | HOT, WARM and COLD tiers |
| Human hold cool-off | 60 min | existing `/orderOnHold` logic | General pool |

**Monday rule.** The general pool used to look back 48 h on Mondays to cover Sunday. It now looks back 24 h every day, which matches the AI picker. A from-scratch build should drop the weekday branch and make the lookback a single config value.

**After the hold-time.** A HOT, WARM or COLD lead past its hold-time stays bot-held but leaves both tiers. From then on nobody calls it. See Risks for the open decision on whether stale leads should go back to the general pool.

## Lead lifecycle, AI status and the lead quality guard

Three columns on `incomplete_order_details` carry an order's AI state: `assigned_to`, `ai_status` and `lead_quality`. Every transition is one conditional `UPDATE`, and only the caller that changes exactly one row may take the follow-up actions: freeing the counter slot, writing the audit row, queueing the next message.

&#91;embedded content: AI lifecycle of an incomplete order · 7 states, 10 transitions\]

The numbers on the arrows match the table below. A human-owned order never returns to the AI. Exhausted is terminal.

| # | Transition | Trigger | Guard (`WHERE`) | Writes |
| --- | --- | --- | --- | --- |
| 1 | Pool → Reserved | Picker job | `assigned_to IS NULL`, `ai_status IS NULL`, `last_hold_channel` ≠ HUMAN, eligibility filters; counter has room | `assigned_to = bot`; counter +N |
| 2 | Reserved → Pool | Push publish failed; push message unreadable, stale, over 3 attempts, or rejected with 4xx | `assigned_to = bot` | `assigned_to`, `ai_status`, `in_flight_at` = NULL; counter −1 |
| 3 | Reserved → In flight | Push drain, after a successful Ring AI upload | `assigned_to = bot AND ai_status IS NULL` | `ai_status = IN_FLIGHT`, `in_flight_at = NOW()`; dial message queued |
| 4 | In flight → Pool | Reaper timeout with fewer than 3 prior attempts (retry); or dial drain release (stale, no mobile, 4xx, over attempts) | Retry: `ai_status = IN_FLIGHT`. Release: `assigned_to = bot` | Retry: `rank_again_after = NOW() + gap[k]`, `last_hold_channel = AI`, attempt row. Both: clear the AI columns; counter −1 |
| 5 | In flight → Exhausted | Reaper timeout with 3 prior attempts | `ai_status = IN_FLIGHT` | `ai_status = EXHAUSTED`, `ring_outcome = NO_RESPONSE`; attempt row; counter −1 |
| 6 | In flight → Qualified | Verdict HOT, WARM or COLD | `assigned_to = bot`, `lead_quality IS NULL`, `ring_outcome IS NULL`, `is_active` | `lead_quality`, `lead_quality_at`, `ai_status = DONE`; verdict row; counter −1 |
| 7 | In flight → Declined | Verdict DECLINED or RESCHEDULED | Same as 6 | Same as 6, plus `assigned_to = NULL` |
| 8 | Qualified → Human-owned | CSR tier pick inside the hold-time | `assigned_to IS NULL OR assigned_to = bot`, under the Redis assign lock | `assigned_to = agent`, `eligible_for_ranking = false` |
| 9 | Pool → Human-owned | General pool pick, or an agent hold | `assigned_to IS NULL` | `assigned_to = agent`; a hold also sets `last_hold_channel = HUMAN` |
| 10 | Declined → Human-owned | General pool pick | Same as 9 | Same as 9 |

### `ai_status` values

| Value | Meaning | Who sets it |
| --- | --- | --- |
| NULL | Never pushed, or reset by a release or retry | Default; release; retry |
| IN\_FLIGHT | Callee uploaded, dial queued or placed | Push drain (`markInFlight`) |
| DONE | Verdict applied | Verdict listener |
| EXHAUSTED | Retry cap used up | Reaper |

A verdict sets `ai_status` to DONE, never back to NULL. NULL means "never pushed", so resetting it would let a redelivered push message dispatch the order a second time.

### Lead quality guard

- **First verdict wins.** Both verdict updates require `lead_quality IS NULL`. A redelivered or late verdict therefore changes 0 rows, and the counter is never decremented twice.
- **Reaper and verdict cannot both close an order.** The verdict requires `ring_outcome IS NULL`, and the reaper requires `ai_status = IN_FLIGHT`, which the verdict has already moved to DONE. Whichever writes first wins; the other does nothing.
- **No dial after a verdict.** The dial drain checks `lead_quality IS NULL`, `ring_outcome IS NULL` and `ai_status = IN_FLIGHT` again just before dialling. A verdict that lands during the 300 s delay cancels the dial.
- **No re-selection after a verdict.** The picker requires `ai_status IS NULL`. A DECLINED or RESCHEDULED order, which goes back to `assigned_to = NULL` with `ai_status = DONE`, can therefore never be reserved again.

### Lead closure

A closed lead never re-enters any queue, AI or human, and nothing reopens it (PRD §6). The customer only comes back through a new order ID, which is a fresh `incomplete_order_details` row. Editing the same cart updates the same row, so it cannot reopen a closed lead.

| Closed reason | Closed by | When |
| --- | --- | --- |
| `RETRIES_EXHAUSTED` | Reaper (AI) or the agent hold flow (human) | AI and human not-connected attempts together reach the threshold: gap list length + 1, so 4 today |
| `TIMED_OUT` | `lead-closure-sweep` job | No cart activity for `lead.timeout.hours` (24 h), and no channel holding or scheduling the lead |
| `STALE` | `lead-closure-sweep` job | A HOT, WARM or COLD lead still bot-held past the hold-time, i.e. no agent picked it up |
| `DNC`, `INVALID_NUMBER`, `ORDER_PLACED`, `NO_ORDER` | — | Reserved for PRD dispositions not built yet |

**How it is enforced**

- **Explicit state.** Four new columns: `lead_state` (NULL = open, `CLOSED`), `closed_reason`, `closed_at` and `lead_ref`. Only guarded `UPDATE`s write them, and a close applies only while the lead is still open, so the first reason and timestamp stick.
- **Every queue and claim checks it.** The AI picker, the HOT/WARM and COLD tiers, the general pool, the previous-live fallback, both call-schedule queries, the agent claim `updateAgentIdForOrderFromPool`, `markInFlight` and both verdict updates all require `lead_state` to be open. The push and dial drains release and drop any lead closed while its message was queued.
- **Entity saves cannot reopen a lead.** The csr-service entity maps the four columns with `insertable = false, updatable = false`. customer-service and order-management-service save the whole row on every cart edit, but they don't map these columns at all.
- **One shared retry threshold.** When an agent holds an order with a reason from `lead.human.not.connected.reasons`, a `HUMAN` row is written to `ring_ai_not_connected_attempt`. The reaper and the hold flow both count every row for the order, AI and human together.
- **Bounded sweep.** `TIMED_OUT` only touches rows whose `cx_modified_on` falls in the 48 h band just behind the timeout edge, in batches of 1,000 (up to 20 per run). It never walks the table's history.
- **Reference ID.** On first AI reservation, each lead gets a `lead_ref` UUID, kept across retries. For now it goes to Ring as a custom variable. `user_id` stays the order ID until Ring confirms it will echo `lead_ref` back on the verdict.

| Config key | Default | Meaning |
| --- | --- | --- |
| `lead.human.not.connected.reasons` (`LEAD_HUMAN_NOT_CONNECTED_REASONS`) | empty | Hold-reason texts from the agent portal that mean "not reached". Empty means human attempts are not counted. |
| `lead.closure.sweep.enabled` (`LEAD_CLOSURE_SWEEP_ENABLED`) | false | Turns on the `lead-closure-sweep` job |
| `lead.timeout.hours` | 24 | Inactivity after which an open lead is `TIMED_OUT` |
| `lead.timeout.sweep.lookback.hours` | 48 | Width of the band behind the timeout edge; this also covers sweeper downtime |
| `lead.closure.sweep.batch.size` / `max.batches` | 1000 / 20 | Rows per `UPDATE` / `UPDATE`s per run |

```sql
-- 20260930_incomplete_order_details_lead_closure.sql. Run BEFORE deploying:
-- ddl-auto=update is on in every environment.
ALTER TABLE incomplete_order_details
  ADD COLUMN lead_state    VARCHAR(10) NULL DEFAULT NULL,
  ADD COLUMN closed_reason VARCHAR(20) NULL DEFAULT NULL,
  ADD COLUMN closed_at     DATETIME    NULL DEFAULT NULL,
  ADD COLUMN lead_ref      CHAR(36)    NULL DEFAULT NULL;

-- Pause rule (covering), tiers, reaper, STALE sweep. Build off-peak.
CREATE INDEX idx_iod_bot_quality
  ON incomplete_order_details (assigned_to, ai_status, lead_quality, lead_quality_at, lead_state);
```

**Effect on the manual queue.** Once the sweep is on, `TIMED_OUT` also closes leads the AI never touched. Two existing behaviours stop:

- The general pool's calendar-day window, which can serve a lead for up to about 48 h after its last cart activity.
- The 5-day previous-live fallback.

Both now end at 24 h, as the PRD specifies. That is why the sweep is off by default.

## Data model

The design adds six nullable columns to `incomplete_order_details` and three small tables. Append-only tables hold per-call history, so hot rows never go through a read-modify-write on a shared counter column.

### `incomplete_order_details` — new columns (existing table, about 48M rows)

| Column | Type | Null | Written by | Purpose |
| --- | --- | --- | --- | --- |
| `ai_status` | VARCHAR(20) | Yes | Push drain, verdict listener, reaper, release | AI pipeline state: NULL, IN\_FLIGHT, DONE, EXHAUSTED |
| `in_flight_at` | DATETIME | Yes | Push drain; cleared on release or retry | Staleness clock for the reaper. `modified_on` cannot serve, because `@UpdateTimestamp` moves it on every write. |
| `lead_quality` | VARCHAR(20) | Yes | Verdict listener | HOT, WARM, COLD, DECLINED, RESCHEDULED |
| `lead_quality_at` | DATETIME | Yes | Verdict listener | Start of the hot hold-time. Kept on the row so the `LIMIT 1` tier queries need no `MAX()` join. |
| `ring_outcome` | VARCHAR(20) | Yes | Reaper | `NO_RESPONSE` once the order is EXHAUSTED |
| `last_hold_channel` | VARCHAR(10) | Yes | Reaper retry (`AI`), `/orderOnHold` (`HUMAN`) | Cross-channel exclusion. `HUMAN` is never overwritten. |

Existing columns the design relies on: `assigned_to` (the bot id marks AI ownership), `rank_again_after` (retry gap and hold cool-off), `eligible_for_ranking`, `cx_modified_on`, `final_score`, `order_value`, `is_active`.

### New tables

| Table | Columns | Keys and indexes | Cardinality |
| --- | --- | --- | --- |
| `counter` | `id` BIGINT, `limit_value` INT NOT NULL, `remaining_value` INT NOT NULL | PK `id`; one seeded row per quota (`ring.ai.incomplete.counter.id = 1`) | 1 row |
| `ring_ai_call_verdict` | `id`, `order_id` BIGINT NOT NULL, `lead_bucket`, `non_completion_reason`, `customer_request` TEXT, `call_summary` TEXT, `received_on` DATETIME | PK `id`; index on `order_id` (recommended) | 1 row per applied verdict |
| `ring_ai_not_connected_attempt` | `id`, `order_id` BIGINT NOT NULL, `dial_channel` VARCHAR(10) NOT NULL (`AI` / `HUMAN`), `occurred_at` DATETIME NOT NULL | PK `id`; `idx_ring_ai_not_connected_attempt_order_id` | At most 4 AI rows per order |

The name `remaining_value` is misleading. The column holds the slots in use: a reservation adds to it, and a release, verdict or reaper sweep subtracts. Free slots are `limit_value − remaining_value`. A from-scratch build should call the column `in_use_value`.

### DDL

```sql
ALTER TABLE incomplete_order_details
  ADD COLUMN ai_status         VARCHAR(20) NULL,
  ADD COLUMN in_flight_at      DATETIME    NULL,
  ADD COLUMN lead_quality      VARCHAR(20) NULL,
  ADD COLUMN lead_quality_at   DATETIME    NULL,
  ADD COLUMN ring_outcome      VARCHAR(20) NULL,
  ADD COLUMN last_hold_channel VARCHAR(10) NULL;

-- Bot-held reads (reaper, pause rule, tiers, STALE sweep) all use idx_iod_bot_quality,
-- created with the lead-closure columns below (see Lead closure).

CREATE TABLE counter (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  limit_value     INT NOT NULL,
  remaining_value INT NOT NULL DEFAULT 0
);

CREATE TABLE ring_ai_call_verdict (
  id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id              BIGINT NOT NULL,
  lead_bucket           VARCHAR(20),
  non_completion_reason VARCHAR(255),
  customer_request      TEXT,
  call_summary          TEXT,
  received_on           DATETIME,
  INDEX idx_ring_ai_call_verdict_order_id (order_id)
);

CREATE TABLE ring_ai_not_connected_attempt (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id     BIGINT NOT NULL,
  dial_channel VARCHAR(10) NOT NULL,
  occurred_at  DATETIME NOT NULL,
  INDEX idx_ring_ai_not_connected_attempt_order_id (order_id)
);
```

**Migration notes.**

- The repo has no Flyway or Liquibase, so the DBA runs these scripts by hand. `ddl-auto=update` must not be relied on for a table this large.
- On MySQL 8, adding nullable columns with no default is usually an instant, metadata-only change. The DBA should confirm this, or use an online schema-change tool.
- Build the index during off-peak hours.
- One index, `idx_iod_bot_quality (assigned_to, ai_status, lead_quality, lead_quality_at, lead_state)`, serves every read of bot-held rows. The tier queries filter on `ai_status = 'DONE'`, which every lead with a verdict has, so they seek on it. Without that filter, every agent "next order" request would scan every row the bot has ever held. It replaces the earlier `idx_incomplete_order_ring_ai_stale`: drop that index wherever it was already created.

## APIs, webhooks and queue contracts

The integration has two inbound surfaces (the verdict webhook and the job-trigger/admin API), two outbound calls (Ring AI upload and the Knowlarity dial) and three queue messages. All timestamps are ISO-8601 instant strings, so no Jackson date configuration is needed.

### Inbound

| Method and path | Caller | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `POST /webhook/ring-ai/verdict` | Ring AI | Shared-secret header (to be added; see Security) | Verdict JSON, below | `202 {status: accepted, order_id}` · `400` when `order_id` is missing · `503` when the enqueue fails (Ring AI retries) |
| `POST /scheduled-jobs/{jobName}/trigger` | scheduler-service (`RingAiScheduler`) | `X-Trusted-Author` = `scheduler.trigger.trusted.author` | — | `200 {status: executed, jobName}` · `401` · `400` for an unknown job · `500` |

Registered job names: `incomplete-orders-ring-ai`, `ring-ai-push-drain`, `knowlarity-dial-drain`, `ring-ai-no-response-reaper`. scheduler-service fires each on its own cron (see Architecture). An unknown name returns 400.

**Verdict payload** (from Ring AI; the field names are Ring AI's, including the capitalised `Summary`):

```json
{
  "order_id": 123456789,
  "lead_bucket": "HOT",
  "customer_request": "Wants delivery by Friday",
  "non_completion_reason": "Price concern",
  "customer_name": "<name>",
  "Summary": "<post-call summary>"
}
```

Allowed `lead_bucket` values: HOT, WARM, COLD, DECLINED, RESCHEDULED, plus the aliases HIGH, MEDIUM and LOW, case-insensitive. Any other value, including NOT\_CONNECTED, is logged and dropped at apply time.

### Outbound

| Call | Endpoint | Auth | Body | Error handling |
| --- | --- | --- | --- | --- |
| Ring AI callee upload | `POST {ring.ai.base.url}/ca/api/v0/inbound-callees/upload-json` | `X-API-KEY: {ring.ai.api.key}` | `{agent_id, callees: [ {user_id: orderId, ...variables} ]}`, one callee per request | 4xx: release the order and drop the message · other errors: SQS retries, up to 3 attempts |
| Knowlarity dial | `POST http://thirdparty-service/knowlarity/ring-ai-call` | Internal network | `{orderId, mobileNo}` | Same as above |

**Callee variables.** Built once per batch. Ring AI passes every key except `user_id` to the agent prompt.

| Key | Source | Format and notes |
| --- | --- | --- |
| `order_id` | `incomplete_order_details.order_id` | String |
| `callee_name` | `customer_details.customer_name`; falls back to the first sub-order's `patient_details.patient_name` | Omitted if both are blank |
| `cart_items` | Active `final_substitute_product` rows | `NAME(qty)` joined with `,` |
| `cart_value` | `final_calculated_amount.final_amount` | 2 decimal places |
| `discount_amount` | `final_calculated_amount.discount` | 2 decimal places |
| `discount_percent` | `discount × 100 / subs_mrp` | 2 decimal places. Same MRP basis as customer-service's `buildBotBillDetails`, so the bot and the app quote the same percentage. |
| `eta` | `order_details.delivery_date` minus today | Whole days; omitted if in the past or unparseable |
| `previously_bought` | Items from the customer's latest delivered order | Same format as `cart_items` |

If an order ends up with fewer than 8 keys, a warning is logged but the order is still sent.

### Queue messages

| Queue (config key) | Producer → consumer | Delay | Body | Max age / attempts |
| --- | --- | --- | --- | --- |
| Push (`aws.sqs.ring.ai.push.queue.name`) | Picker job → push drain | 0 s | `{orderId, enqueuedAt, customVariables}` | 15 min / 3 |
| Dial (`aws.sqs.knowlarity.dial.queue.name`) | Push drain → dial drain | 300 s | `{orderId, dispatchedAt}`. The mobile number is deliberately left out and read at dial time. | 15 min from dispatch / 3 |
| Verdict (`aws.sqs.ring.ai.verdict.queue.name`) | Webhook → verdict listener | 0 s | `{verdict: {...payload above}, receivedAt}` | Redrive policy to DLQ |

All three are standard (not FIFO) queues. Delivery is at-least-once, and the order-level guards make duplicates harmless.

## Configuration and feature flags

Two flags gate the whole feature, and both default to off: `ring.ai.push.enabled` for the push, dial and picker jobs, and `ring.ai.verdict.listener.enabled` for the SQS listener. Every business threshold is a property, so tuning needs no code change.

### Feature flags

| Key (env var) | Default | Effect when off |
| --- | --- | --- |
| `ring.ai.push.enabled` (`RING_AI_PUSH_ENABLED`) | false | The picker, push drain and dial drain return immediately. The reaper and webhook still run, so in-flight orders drain cleanly. |
| `ring.ai.verdict.listener.enabled` (`RING_AI_VERDICT_LISTENER_ENABLED`) | false | The listener bean is not created, and verdicts wait on the queue. Enable it only after the queue, its DLQ and `sqs:ReceiveMessage` on the role are in place: the container binds at startup, and a missing queue stops the service from booting. |
| `aws.iam-role.enabled` | false | false: use static keys. true: use the pod IAM role (IRSA) and ignore static keys. Enable per environment. |

### Business thresholds

| Key | Default | Meaning |
| --- | --- | --- |
| `ring.ai.incomplete.counter.id` | 1 | Which `counter` row is the Ring AI concurrency quota |
| `ring.ai.min.order.value` | 500 | Eligibility floor (exclusive). Shared by the `order_details` prefilter and the detail query, so the two can never disagree. |
| `ring.ai.hot.hold.time.hours` (`RING_AI_HOT_HOLD_TIME_HOURS`) | 36 | How long a verdict keeps a lead in its tier |
| `ring.no.response.reaper.minutes` | 30 | How long `IN_FLIGHT` may last before the order counts as not connected |
| `ring.ai.not.connected.retry.gap.minutes` | 30,60,60 | Gap before each retry. The list length is the retry cap. |
| `ring.ai.dial.delay.seconds` | 300 | Gap between upload and dial, as Ring AI requires |
| `ring.ai.dial.max.age.minutes` | 15 | Oldest dispatch that may still be dialled |
| `ring.ai.push.message.max.age.minutes` | 15 | Oldest push message that may still be uploaded |
| `ring.ai.push.max.attempts` | 3 | Receive-count cap for the push and dial drains |
| `ring.ai.drain.max.batches` | 5 | Receive calls per drain run, 10 messages each |

### Integration settings

| Key (env var) | Notes |
| --- | --- |
| `ring.ai.base.url` (`RING_AI_BASE_URL`) | Ring AI API host |
| `ring.ai.api.key` (`RING_AI_API_KEY`) | Secret, injected from the secret store. Never committed. |
| `ring.ai.agent.id` (`RING_AI_AGENT_ID`) | Ring AI agent that runs the script |
| `thirdPartyServiceIp`, `thirdPartyService.knowlarity.ringAiCall` | `thirdparty-service`, `knowlarity/ring-ai-call`. The path is configurable while the Knowlarity SIP-forwarding contract is still being confirmed. |
| `aws.account.id`, `aws.sqs.queue.url` | Queue URL = `{base}/{account}/{queueName}` |
| `aws.sqs.ring.ai.push.queue.name`, `aws.sqs.knowlarity.dial.queue.name`, `aws.sqs.ring.ai.verdict.queue.name` | One set per environment |
| `scheduler.trigger.trusted.author` (`SCHEDULER_TRIGGER_TRUSTED_AUTHOR`) | Shared secret that scheduler-service sends as `X-Trusted-Author`. It must be the same value in both services (`csrService.scheduler.trusted.author` on scheduler-service). Injected per environment; the local default is a placeholder. |
| `cloud.aws.stack.auto=false`, `cloud.aws.region.auto=false`, `cloud.aws.region.static=ap-south-1`, `cloud.aws.credentials.instance-profile=false` | Stop spring-cloud-aws probing EC2 metadata at startup, which hangs outside AWS |

### Dependencies

| Dependency | Version source | Used for |
| --- | --- | --- |
| `com.amazonaws:aws-java-sdk-sqs` | Spring Boot 2.1 managed (v1 1.11.x) | Publish and poll |
| `spring-cloud-starter-aws`, `spring-cloud-aws-messaging` | Greenwich BOM (2.1.0.RELEASE) | `@SqsListener` for verdicts |
| `lombok` | Boot managed | DTOs |

The push and dial drains poll by hand instead of using `@SqsListener` for a reason. The calling window is enforced by their cron, and a listener would consume messages at any hour. The verdict listener never dials anyone, so it can safely run around the clock.

## Error handling, idempotency and concurrency

Correctness rests on the database, not on locks. Every state change is a conditional `UPDATE` whose row count decides who acts next. Redis locks and SQS visibility only reduce wasted work. The system stays correct if either one misbehaves.

### Idempotency rules

1. **Row-count ownership.** Only the caller whose guarded `UPDATE` returns 1 may decrement the counter, write an audit row or publish the next message. The guards: reserve on `assigned_to IS NULL`, `markInFlight` on `ai_status IS NULL`, verdict on `lead_quality IS NULL AND ring_outcome IS NULL`, reaper on `ai_status = IN_FLIGHT`, release on `assigned_to = bot`.
2. **Re-check at every hop.** Each consumer re-reads the order before acting, because an SQS delay is a timer, not a lock. During the 300 s dial delay an agent may claim the lead, a verdict may land, or the reaper may close it.
3. **Terminal errors are dropped; transient errors are retried.** An unreadable body, a missing `orderId`, an unknown `lead_bucket` or an HTTP 4xx is deleted and released. A timeout, a 5xx or a DB error leaves the message for redelivery.
4. **One transaction per verdict.** The order update, the `ring_ai_call_verdict` insert and the counter decrement commit together or not at all. `rollbackFor = TechnicalException` is required because `TechnicalException` extends `Throwable`, not `Exception`. For the same reason, catch blocks must name it explicitly.

### Concurrency controls

| Control | Scope | TTL | Purpose | If it fails |
| --- | --- | --- | --- | --- |
| Counter guarded `UPDATE` | All pods | — | Caps orders Ring AI holds at once | The reservation is refused and the picker exits |
| `lock:order:ring-ai:{orderId}` | Push and dial drains | 30 s | Stops two pods handling the same order's push and dial at the same moment | Fails open on a Redis error; the DB guards still hold |
| `lock:order:assign:{orderId}` | CSR picker | 5 s | Stops two agents racing for the same order | Fails open; the claim `UPDATE` plus a re-read still decides |
| SQS visibility timeout | Per message | Queue setting | Hides a message while it is being handled | The message is redelivered and absorbed by the guards |

### Failure modes

| Scenario | Behaviour | Order ends in |
| --- | --- | --- |
| Push publish fails in the picker | Released straight away; counter −1 | Pool |
| Ring AI returns 4xx on upload | Released; message deleted | Pool |
| Ring AI times out or returns 5xx | Message redelivered, up to 3 receives, then released | Pool |
| Push message older than 15 min (queue backlog) | Released without uploading | Pool |
| Dial message older than 15 min, or the calling window closed | Released without dialling, since the Ring AI session is too old | Pool |
| Customer has no mobile number | Released | Pool |
| Dial placed but no verdict within 30 min | Reaper retries after the gap, or marks EXHAUSTED after the 4th attempt | Pool (retry) or Exhausted |
| Duplicate or late verdict | The guard changes 0 rows; logged and dropped | Unchanged |
| Verdict arrives after the reaper released the order | Dropped: `assigned_to` is no longer the bot. The call itself is not recorded. | Pool |
| DB error while applying a verdict | Transaction rolls back; SQS redelivers; the DLQ takes the message after the redrive limit | In flight until it succeeds |
| SQS unavailable at the webhook | 503 returned; Ring AI must retry | In flight |
| Redis unavailable | Locks fail open; DB guards keep things correct; some duplicate API calls are possible | Correct state |
| A human puts the order on hold | `last_hold_channel = HUMAN`; the AI never picks it again | Human-owned |

### Design requirements a build must meet

- **Reserve with a guarded `UPDATE`, not an entity save.** Use `UPDATE … SET assigned_to = bot WHERE order_id IN (…) AND assigned_to IS NULL AND ai_status IS NULL`, and reserve counter slots for the rows actually changed. An entity `saveAll` can overwrite an agent who claimed the order between the select and the save.
- **Keep the counter consistent with the orders.** Reserve, reaper and release must each change the counter in the same transaction as their order update. If they cannot, run a reconciliation job that sets in-use to `COUNT(*) WHERE assigned_to = bot AND ai_status IN (NULL, 'IN_FLIGHT')`. Without either, a failed decrement leaks a slot forever and slowly starves the pipeline.
- **Give every queue a DLQ with a redrive policy**, not only the verdict queue. Alert on DLQ depth above 0.

## Security

The verdict webhook is the main exposure. It is reachable without authentication today: the security config ends in `anyRequest().permitAll()`, and the controller allows CORS from `*`. It must authenticate Ring AI before go-live.

- **Webhook authentication.** Agree an HMAC-SHA256 signature over the raw body (or at least a shared-secret header) with Ring AI. Verify it with a constant-time compare (`MessageDigest.isEqual`). Also allowlist Ring AI's egress IPs at the ingress, remove `@CrossOrigin("*")` (this is a server-to-server call), and rate-limit the path.
- **Input validation.** Require `order_id` and `lead_bucket` to be present, and cap text lengths: `customer_request` and `Summary` at a few KB, `non_completion_reason` at 255. Reject unknown buckets before enqueueing rather than after.
- **Job trigger API.** scheduler-service sends the shared secret as `X-Trusted-Author`. Keep it in the secret manager for both services, never in properties files. Compare it in constant time (`MessageDigest.isEqual`) and rotate it. scheduler-service's manual endpoint `POST /triggerRingAiJob/{jobName}` is open today: its security config ends in `anyRequest().permitAll()` and it allows CORS from `*`. It must require authentication, since anyone who can reach it can fire any Ring AI job.
- **Vendor secrets.** Inject `RING_AI_API_KEY` from the secret store. Never log it or return it in an error response.
- **Health data and PII.** The data flowing through this pipeline is sensitive:
  - Callee variables include the customer name and medicine names. Medicine names are health data.
  - Verdict text may quote the customer.
  - Rules: do not log payload bodies (log only `orderId`, the bucket and the reason); restrict read access to `ring_ai_call_verdict`; agree a retention period for it; and confirm that the Ring AI DPA covers health data.
  - The mobile number never enters a queue. It is read at dial time and sent only to thirdparty-service.
- **IAM least privilege** (pod role through IRSA, `aws.iam-role.enabled=true`):
  - `sqs:SendMessage`, `ReceiveMessage`, `DeleteMessage` and `GetQueueAttributes` on the three queues only.

## Observability

Every hop logs `orderId` and its decision, and log lines alone let you trace an order end to end. Metrics and alarms still need to be added. Prometheus is already exposed through Micrometer.

| Signal | Type | Alert |
| --- | --- | --- |
| Orders reserved, pushed, dialled per run | Counter | Pushed = 0 for 30 min inside the calling window |
| Verdicts by bucket | Counter | HOT + WARM share drops sharply day over day |
| Releases by reason (publish failed, 4xx, stale, no mobile, attempts) | Counter | Any single reason above 10% of dispatches |
| Reaper retries and EXHAUSTED | Counter | EXHAUSTED share above the agreed baseline |
| Counter in-use vs limit | Gauge | In-use equals the limit for over 60 min (a likely slot leak) |
| Queue depth and age of oldest message, per queue | CloudWatch | Oldest push or dial message older than 10 min |
| DLQ depth | CloudWatch | Any value above 0 |
| Webhook 4xx/5xx and p95 latency | APM (New Relic) | 5xx above 1% |
| Tier pick-up latency (`lead_quality_at` to agent assignment) | Derived | HOT p50 above 60 min |

## Rollout plan

1. The DBA runs the DDL (off-peak for the index) and seeds the `counter` row with a low limit.
2. Create the three SQS queues, each with a DLQ and redrive, in every environment. Attach the IAM policy to the pod role.
3. Deploy with `ring.ai.push.enabled=false` and `ring.ai.verdict.listener.enabled=false`. Nothing changes for agents except the new, still empty, tiers.
4. Deploy scheduler-service with `RingAiScheduler` and `RING_AI_SCHEDULER_ENABLED=false`. Set `SCHEDULER_TRIGGER_TRUSTED_AUTHOR` to the same secret on both services. The crons are fixed in scheduler-service's properties; push and dial run 09:00–20:59.
5. Turn on the verdict listener. Verify webhook → queue → apply using a test order in stage.
6. Turn on push in stage and UAT. Run the whole path: reserve, upload, dial after 300 s, verdict, tier pick-up, not-connected retry, exhaustion, and human hold exclusion.
7. In prod, start with a small counter limit for one week. Watch the counter gauge, the release reasons and the verdict mix. Then raise the limit step by step.
8. **Rollback:** set `ring.ai.push.enabled=false`. The reaper still clears in-flight orders, and already-qualified leads stay in their tiers until the hold-time runs out. No data migration is needed.

## Risks and open questions

**Gaps on the current branch.** The design above already assumes these are fixed.

- **Declined leads can be re-reserved and get stuck.** The picker query does not filter on `ai_status`. A DECLINED or RESCHEDULED order returns to `assigned_to = NULL` with `ai_status = DONE`, so it can be selected again. The push drain then drops the message as a duplicate without releasing the order. The order stays bot-held and a counter slot leaks. Fix: add `ai_status IS NULL` to the picker query.
- **The reservation can overwrite an agent.** The picker assigns the bot with `saveAll` after a plain select. An agent claim that lands between the two is overwritten. Fix: use a guarded `UPDATE` (see Error handling).
- **The reaper's counter decrement is outside the order-update transaction.** A failed decrement leaks slots. Fix: make the sweep transactional per order, or add reconciliation.
- **The webhook is unauthenticated** (see Security).

### Product decisions needed

23 product and business decisions were open. Product answered 21 of them on 30 Sep (marked Decided, with the "Default" column corrected to the decision). #1 and #13 (verdict / call-outcome handling) are still under discussion.

| # | Decision needed | Owner | Default if unanswered | Status |
| --- | --- | --- | --- | --- |
| 1 | Verdict and call-outcome SLA: how fast, how reliable, and what share of calls it must cover | Business + Ring + Knowlarity | Under discussion with Product (verdict / call-outcome handling) — see Product feedback below | **Under discussion** |
| 2 | Can Ring return do-not-call as its own label? | Ring | Not a release-1 blocker; built after release if Ring supports it. Release 1 has no do-not-call capture (the agent button is not built either). | **Decided (30 Sep)** |
| 3 | Concurrent-call limits at Ring and Knowlarity, which set the Ring AI counter limit in prod | Engineering + Ring + Knowlarity | Ring and Knowlarity confirmed ~17,500 simultaneous leads is fine. Set the counter limit per GTM phase; the pause rule keeps volume well below that. | **Decided (30 Sep)** |
| 4 | Consent and masking of personal details spoken in recordings; Knowlarity removing the customer's number from the "answered" event | InfoSec + Knowlarity + Ring | Not a dev blocker; InfoSec reviews and clears it externally. Store recordings as the PRD states. | **Decided (30 Sep)** |
| 5 | Languages Ring handles well: Hindi, Hinglish, English | Ring | No effect on the build; Business and Ring handle it. | **Decided (30 Sep)** |
| 6 | Which agent-portal hold-reason texts mean "not reached" (`lead.human.not.connected.reasons`) | Product / ACOM | Every hold reason counts as a not-connected attempt: "Customer did not answer.", "Customer is not reachable/unavailable.", "Customer disconnected.", "Poor Network." Exception: "Order already placed." closes the lead (`ORDER_PLACED`). | **Decided (30 Sep)** |
| 7 | Can TIMED\_OUT at 24 h end the manual queue's 48 h calendar-day window and its 5-day fallback? | Product | Yes. 24 h everywhere: drop the ~48 h calendar-day window and the 5-day previous-live fallback; turn the sweep on. | **Decided (30 Sep)** |
| 8 | "Attempted by an agent" for the pause rule and stale leads: does claiming count, or must the agent dial? | Product | The agent **dialling** counts. Claiming alone does not. | **Decided (30 Sep)** |
| 9 | Should overnight hours count toward the pause rule's 2 h wait? (If yes, the AI is paused each morning until agents clear the backlog.) | Business | Yes. Overnight counts. | **Decided (30 Sep)** |
| 10 | What does Ring's DECLINED verdict mean: Cold, do-not-call, or close as no order? | Product + Ring | DECLINED = **Cold**: bottom tier (Priority 6), not the general pool. A "don't call me" is do-not-call, not DECLINED. | **Decided (30 Sep)** |
| 11 | RESCHEDULED: can Ring send the requested callback time? If not, what's the fallback? | Product + Ring | If Ring's verdict webhook carries the requested callback time, consume it: Scheduled at that time, resumed by the AI (PRD §6). If not, release to the general pool. Confirmation with Ring is open. | **Decided (30 Sep)** |
| 12 | Cold keeps the normal window measured from cart activity, even when the verdict arrives late in that window | Product | Yes. | **Decided (30 Sep)** |
| 13 | How long without a Knowlarity webhook before a lead is marked "outcome unknown"? | Business | Under discussion with Product (same as #1) | **Under discussion** |
| 14 | Frequency cap: for human calls, does only the customer's leg connecting count? Does the agent callback after a Hot verdict count? | Business | Yes to both. | **Decided (30 Sep)** |
| 15 | ₹500 minimum AOV for the manual queue: from day one, or by GTM phase together with the AI? | Business | By GTM phase, together with the AI (₹900 first, ₹500 from phase 2a). | **Decided (30 Sep)** |
| 16 | GTM split: which ID's last digits? Do AI-cohort leads that fail AI eligibility go to the manual queue? | Product | Last 2 digits of `customer_id`; yes, they stay in the manual queue. | **Decided (30 Sep)** |
| 17 | Cold sample: how does Ops find its 5%? Is it exempt from the one-channel rule? | Ops + Product | Ops handles it operationally. Nothing to build. | **Decided (30 Sep)** |
| 18 | Agent dispositions (order placed, no order, do-not-call): which screen, and which values? | Product + Frontend | No frontend changes in release 1. Dispositions stay as today. The agent do-not-call button, retiring Hold and the backend-gated call button are all deferred. | **Decided (30 Sep)** |
| 19 | Callback routing: the same agent, or the next available? | Ops | Same agent, falling back to the queue. | **Decided (30 Sep)** |
| 20 | Invalid number: who does the data cleanup, and where does the flag show up? | Ops | Close the lead (`INVALID_NUMBER`), no retry. No Ops owner needed. | **Decided (30 Sep)** |
| 21 | When is the Hold button retired on the portal? | Product + Frontend | Hold stays in release 1. Retire it once telephony-driven retries are live. | **Decided (30 Sep)** |
| 22 | *Later:* leads without a patient or address on file | Business | Later. V1 keeps the patient and address requirement. | **Decided (30 Sep)** |
| 23 | *Later:* one do-not-call list shared by every calling portal | Engineering + Business | Later. | **Decided (30 Sep)** |

**Already decided by the PRD**

- Stale Hot/Warm leads and leads that run out of retries are both closed for good (built: STALE, RETRIES\_EXHAUSTED).
- Hot/Warm hold-time is **24 h** from the verdict. The config default is still 36 h and needs changing.
- The normal window is 24 h from the last cart activity, every day including Monday.
- Retry gaps are 30/60/60 min, 4 attempts in total, AI and human counted together. A connection shorter than 15 s is retried after 2 min.
- Frequency cap: 3 connected calls in a rolling 7 days. Pause rule: 2 h. Calling window: 09:00–21:00.
- Agent priority: Hot FTC, Hot non-FTC, Warm FTC, Warm non-FTC, then the manual queue, then Cold.
- Closure is permanent. No personal data goes to the vendor except the name.

**Technical and vendor questions**

- [ ] Ring AI: the webhook signing scheme, egress IPs, retry policy on 503, and the typical verdict latency. A verdict later than 30 min is currently dropped.
- [ ] Knowlarity: finalise the `ring-ai-call` contract (otpcall plus SIP forwarding into the Ring AI session) on thirdparty-service.
- [x] ~~The `dial_channel = HUMAN` rows … Decide whether human not-connected dispositions should count toward the retry cap.~~ **Decided (30 Sep):** yes. Write a `HUMAN` row for every agent hold (all reasons except "Order already placed."), counted with AI attempts toward the limit of 4 — see #6.
- [ ] Infra: confirm scheduler-service runs exactly one replica in every environment. A second replica fires every Ring AI cron twice.
- [ ] scheduler-service: set a `RestTemplate` read timeout above the slowest Ring AI job run. Also confirm its 5-thread scheduling pool has headroom, now that two jobs fire every minute.
- [ ] DBA: confirm the `ALTER` is metadata-only on the 48M-row table in prod.

**Lead closure follow-ups**

- [x] ~~Product / ACOM: supply the exact agent-portal hold-reason texts…~~ **Supplied (30 Sep):** "Customer did not answer.", "Customer is not reachable/unavailable.", "Customer disconnected.", "Poor Network." — "Order already placed." closes the lead instead.
- [ ] scheduler-service: add a `lead-closure-sweep` cron to `RingAiScheduler`, e.g. every 15 min, 00:00–23:59. It is cleanup only and never dials.
- [x] ~~Product: confirm that `TIMED_OUT` at 24 h should also cut…~~ **Confirmed (30 Sep):** yes — 24 h everywhere (#7).
- [ ] Ring: confirm the verdict can echo `lead_ref`, so `user_id` can switch from the order ID to `lead_ref`.
- [ ] Manual assignment by order ID (the pharmacist's `updateAssignedTo`) bypasses the queues and can still pick up a closed lead. **Product (30 Sep): accepted as a known release-1 gap** — the backend-gated call button is deferred with the other frontend work (#18).
- [ ] DBA: run `20260930_incomplete_order_details_lead_closure.sql` before the csr-service deploy.

### Product feedback on this LLD (30 Sep 2026)

Changes Product needs in the design, beyond the decisions table above. The verdict / call-outcome handling (#1, #13 and the reaper behaviour) is **still under discussion** and not included here.

| # | Area | Change |
|---|---|---|
| 1 | Callee variables | `callee_name`: **patient name first**, customer name only as the fallback (PRD §4). The LLD has it the other way round. |
| 2 | Callee variables | Add **total MRP, selling price and total savings** (PRD §4). Keep `previously_bought`. |
| 3 | CSR tiers (Flow F) | Within the Hot/Warm tier, serve **Hot FTC > Hot NFTC > Warm FTC > Warm NFTC** (PRD §5), not only Hot then Warm by oldest `cx_modified_on`. |
| 4 | Hold-time | `ring.ai.hot.hold.time.hours` default **24**, not 36. |
| 5 | Retry limit | Count AI attempts **and** human holds (all reasons except "Order already placed.") together toward **4**. At 4, the lead is excluded from the AI picker **and** from the agent Assign button. A hold with "Order already placed." closes the lead (`ORDER_PLACED`). |
| 6 | Frequency cap | A lead with **3 connected calls in a rolling 7 days** (AI + human) is excluded from the AI picker and the agent Assign button. |
| 7 | Pause rule / stale | "Attempted by an agent" = the agent **dialled** the lead, not just claimed it. |
| 8 | DECLINED | Treat as **Cold** (Priority 6), not released to the general pool. |
| 9 | RESCHEDULED | If Ring's webhook carries the callback time, schedule at that time and hand back to the AI; otherwise release to the general pool. |
| 10 | 24 h window | 24 h everywhere: drop the ~48 h calendar-day window and the 5-day previous-live fallback; turn the closure sweep on. |
| 11 | GTM split | Picker filters on the **last 2 digits of `customer_id`** per GTM phase (PRD §14: 00–04 → 00–24 → 00–49 → all on ₹900+, then ₹500 at 00–74 → all). |
| 12 | Invalid number | Close the lead (`INVALID_NUMBER`), no retry. |
| 13 | Recordings | Store them (PRD: recordings retained on the Truemeds side). InfoSec clears the spoken-PII question externally. |
| 14 | Concurrency limit | Set per GTM phase; both vendors confirmed ~17,500 simultaneous leads is fine. |

**Known gaps accepted for release 1**

- No do-not-call capture on either channel (no agent button; Ring's label comes after release).
- No frontend changes: the Hold button stays; the call button is not backend-gated.
- Manual assignment by order ID can still reach a closed or capped lead.

**Still under discussion (Product)**

- Verdict / call-outcome handling: when a lead becomes "outcome unknown", how not-connected is detected, retries, and the short-drop retry (a connect under 15 s retried after 2 min). This will likely need Knowlarity's call-status webhook in the `ring-ai-call` contract. Hold reaper changes until this is settled.

