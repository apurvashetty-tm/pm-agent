# ACOM × Ring AI — Project Truth

Status: Working product truth. Not a PRD.
Last updated: 2026-09-30

The durable, locked layer for the AI-led Lead Qualification build. The full spec is
`docs/ai-led-lead-qualification-prd.md` (Confluence PROD page 2023260174, published
Draft v3); this file holds only what is settled and load-bearing. Anything still open
lives in `open_questions.md`; history/why lives in `DESIGN_JOURNAL.md`.

## 1. Purpose

AI voice pre-qualification for top-of-funnel recovery at Truemeds. An AI voice agent
(Ring AI) calls a customer about their pending cart, holds a real conversation, and
returns an intent read; interested customers are handed to a human agent who places the
order. Dropped carts are use case #1; the same pipeline is built to extend to other
drop-offs. Ring AI = the voice-AI vendor; Knowlarity = the telephony provider.

The core problem is **reach, not AOV**: of ~12,500 eligible leads a day (₹900+), agents
attempt only ~40% (Analytics numbers, replacing the earlier BRD estimates).

## 2. Canonical terms

```text
Attempted / Connected = Truemeds funnel terms, used for both AI and agent calls
Reference id (uuid)   = Truemeds-generated generic correlation key sent to the vendor
                        (NOT the order number); rides in the "remark" field
Verdict               = the vendor's post-call intent read: Hot / Warm / Cold (/ don't-call)
Minimum AOV           = the lowest cart value eligible for calling — ₹500, same for the AI
                        and the manual queue (was ₹900)
Stale                 = a Hot/Warm lead an agent hasn't attempted within 24 h of the AI's verdict
Pause rule            = no new leads go to the AI while the oldest Hot/Warm lead has waited
                        more than 2 h for an agent
GTM split             = during rollout, the AI gets only customers whose customer ID ends in
                        set digits; everyone else stays with agents
In-flight lead        = a lead in any non-terminal disposition; one per customer at a time
Retry threshold       = max not-connected attempts before a lead is Closed (4)
Frequency cap         = max CONNECTED calls to a customer (AI + human) in a rolling window —
                        distinct from the retry threshold, which counts not-connected attempts
Contact PII           = phone number, address — never sent to the vendor (the name IS sent)
```

## 3. Locked principles [LOCKED]

- **Truemeds integrates Ring; Ring does not integrate Truemeds.**
- **Truemeds owns the whole call via Knowlarity** — dial, connect, retries, calling
  window, hangup. The vendor is the conversation + the verdict, never the caller.
- **No contact PII to the vendor** — no phone number or address. The name is sent:
  patient name; where not available, the customer name.
- **Correlation key is a generic reference id (uuid), not the order number.**
- **One customer, one channel at a time; one in-flight lead at a time.**
- **Truemeds data is the source of truth.** The live cart is re-read before an agent acts.
- **The manual queue's prioritisation score is NOT touched.** Hot/Warm ride as a tier in
  front of it.
- **A closed lead never re-enters any queue.** Retry-exhausted closure is permanent for
  that lead; only a new cart/order (a fresh lead) re-enters.
- **Once a human agent is assigned to a lead, that lead is never assigned to the bot.**
- **Minimum AOV ₹500 for both the AI and the manual queue** (down from ₹900).
- **The AI picks leads using today's queue logic, as is** — the same filters and
  `final_score` order the manual queue uses. That logic already puts FTC first; there is
  no separate FTC rule or threshold.
- **Hot/Warm stay in the agents' queue for 24 h from the AI's verdict**, even past the
  normal 24-hour window (from the customer's last cart activity); not attempted by then =
  stale, and the lead leaves the queue. Cold keeps the normal window.

## 4. Call architecture [LOCKED — Ring call 2026-09-11; per-attempt send from 2026-09-30]

- **One lead at a time, per attempt:** for each attempt Truemeds sends the lead to Ring,
  then dials via Knowlarity. **Every retry is sent to Ring as a fresh request.** Retries
  are Truemeds'; Ring does none. (Replaces the earlier "pre-load in batch".)
- **What we send the vendor per attempt:** reference id · cart contents (items +
  quantities) · cart pricing (total MRP, selling price, order-level discount amount and
  discount percent, total savings) · delivery ETA · patient name (else customer name).
  **No phone number, no address, no SKU-level pricing** (business agreed the bot has no
  use for it).
- **Dial + connect:** on the same call Knowlarity opens a **WebSocket** to Ring carrying the
  reference id; Ring warms up the bot; a **"customer answered" event** starts it.
- **Verdict:** Ring records the bot–customer leg on its own side and returns
  Hot / Warm / Cold by webhook on the reference id.
- **Recording & events, our side:** Truemeds stores its own recording (from Knowlarity) +
  an event log for audit/RCA. No recording is sent to Ring.
- **Single vendor + single telephony provider.** A swap later is a re-integration, not a
  rebuild. "Vendor-agnostic by design" and a plug-and-play platform are **out of scope**.

## 5. Priority order [LOCKED]

```text
Hot FTC  >  Hot NFTC  >  Warm FTC  >  Warm NFTC  >  normal manual queue  >  Cold
```

- Cold is the lowest priority — still callable, not dropped.
- Only do-not-call and invalid/wrong numbers are truly excluded.

## 6. The lead journey & controls [LOCKED]

- **Retries are ours, driven by the telephony disposition.** Stop at 4 attempts, then
  close — permanently.
- **One waiting state** ("come back at time T") underneath Hold and Schedule, each lead
  tagged with who resumes it.
- **Do-not-call** captured two ways (AI post-call read; agent one-click CTA), permanent
  across the AI + our human calling. Cross-portal needs a shared list (open).
- **Frequency cap** — connected calls across AI + human; enforceable only on our side.
- **Pause rule (2 h)** — checked before sending new leads to the AI; due retries still go
  out; adjusts by itself as agents fall behind or catch up. Replaces the earlier throttle.
- **Kill switch** — stops all new AI calls at once; in-progress calls finish; manual flow
  untouched. Global master stop today; a per-use-case stop can be built later.
- The manual flow always runs underneath as the fallback.

## 7. Settings [LOCKED values — backend config, tunable at go-live]

All values are backend config, never hardcoded; changed by Engineering on request
without a deploy (self-serve tool is the end state). Product proposes, business sets,
within TRAI/DND limits.

| Setting | Value |
|---|---|
| Eligibility | minimum AOV ₹500 + patient + address on file |
| Dial-order | today's queue logic (`final_score`), as is |
| Retry gap | 30 / 60 / 60 min (4 attempts); 2 min after a short drop |
| Retry threshold | 4 attempts |
| Minimum connect duration | 15 s |
| Frequency cap | 3 connected calls in a rolling 7 days |
| Calling window | 09:00–21:00 |
| Hot/Warm hold-time | 24 h from the verdict (a reviewer asked for 48 h on 29 Sep; Product keeps 24 h) |
| Pause rule | 2 h |
| Callback routing | same agent, else queue |
| GTM split | per §8 below |
| Kill switch | global |

## 8. GTM & rollout [LOCKED plan · durations are starting values]

Split by **customer ID** (works for future leads with no order id). Each step moves on
only when its gates hold; a missed gate = hold + RCA; a safety breach = kill switch.

| Phase | Min AOV | AI gets customer IDs ending | Duration |
|---|---|---|---|
| 0 — Tech pilot | ₹900 | 00–04 (5%) | 3–4 days |
| 1a / 1b / 1c | ₹900 | 00–24 / 00–49 / all | 1 wk / 1 wk / 2 wks |
| 2a / 2b | ₹500 | 00–74 / all | 1 wk / 1 wk |

- **Tech-pilot gate:** zero customers called by the AI and an agent at once; outcome +
  verdict within the agreed SLA; retry and frequency caps respected; kill switch tested.
- **Ramp gates:** stale ≤10%; Hot/Warm conversion ≥2× human conversion; the 5% Cold
  sample converts clearly lower; sales per 100 customers — AI side ≥ agent side. From 100%,
  compare to today's baselines (human conversion ~5%; ACOM sales/day). The ₹500 step is
  judged on sales, not AOV.
- **Cold sample:** Ops calls a random 5% of AI Cold leads throughout GTM, outside the
  allocation logic.

## 9. Success metrics [targets = starting values]

Final business number: **ACOM sales (₹/day) = converted orders × their AOV.** Also
tracked: reach (~40% → ≥95%), AI connect (POC 78.7%, ≥70%), Hot/Warm rate (POC 25.75%,
20–30%), stale (POC 42%, ≤10%), agent connect on Hot/Warm (POC 59%, ≥50%), Hot/Warm
conversion (POC 10.5% incl. stale, ≥2× human), human conversion (~5%), Cold sample, AOV
of converted orders, human productivity, cost per order (~₹250), safety gate (0).
Orders count if placed within 24 h (of the verdict for AI leads; of the agent's attempt
for agent leads).

## 10. What is NOT decided here

Open items live in `open_questions.md` (mirrors PRD §9): verdict + call-outcome SLA (set
in contracts), languages, do-not-call as its own Ring label, simultaneous-call limits,
the InfoSec call-out (spoken PII in recordings; stripping the number from the "answered"
event), and later items (leads without patient + address; cross-portal DNC). Telephony
specifics and the bot-leg-failure error code are pending with Knowlarity/Engineering.

## 11. Sources

- Current spec: `docs/ai-led-lead-qualification-prd.md` — last synced 30 Sep 2026.
- Decisions: `knowledge/decisions/2026-09-11-ring-ai-call-architecture.md`,
  `2026-09-25-ring-ai-prd-clarifications.md`, `2026-09-30-ring-ai-v3-reach-gtm-controls.md`.
- History / why: `DESIGN_JOURNAL.md`. Earlier (historical) docs: `rapid-pilot-prd.md`,
  `voicebot-cart-recovery-prd.md`, `mvp-engineering-walkthrough.md`.
- Reviewer comments state: `reference/prd-review-comments-snapshot.md`.
