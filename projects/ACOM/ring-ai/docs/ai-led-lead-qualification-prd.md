# AI-led Lead Qualification — Product Requirements

**Author:** Apurva Shetty (Product) · **Status:** Draft v2, for review · **Owner team:** ACOM
**Source of truth:** this markdown. The Confluence page (PROD · 2023260174) is generated from it — don't edit there.


---

## 1. Executive summary

Today we recover dropped carts by having agents cold-call every eligible customer — it's slow and expensive, and even among the customers who already have a delivery address and patient details on file, we reach only about six in ten most months; the wider pool of dropped carts is larger still. We're adding an AI voice agent — from a voice-AI vendor (Ring AI) — that calls customers first, has a real conversation about their pending cart, and tells us who's genuinely interested. Human agents then spend their time only on the high-intent, ready-to-buy customers. Truemeds places the call and keeps all customer data on its own side (except the name); the vendor only holds the conversation and reads intent — it never becomes the caller. We start with dropped carts, but the design works for any customer segment we later want to re-engage.

## 2. The problem

The ACOM team manually calls every eligible dropped cart. Three facts describe why that's not enough:

- **Reach.** Today's queue only works higher-value carts — above ₹900 — from customers who already have a delivery address and patient details on file. Even within that pool of roughly 17,000 a month, only about 10,000 get called, so nearly 40% of even this ready-to-serve pool is never reached. The wider pool of dropped carts — lower-value carts, and customers without an address or patient on file — is larger still. That's recoverable revenue we simply can't get to.
- **Conversion.** Around 5% of the leads we do call end up placing an order.
- **Cost.** About ₹250 per placed order, with a large agent team spending most of its hours on customers who were never going to buy.

A proof-of-concept with the voice-AI vendor on ~1,300 real leads converted about 20% of the customers it qualified and passed on — roughly 4× the human-only rate — and an AI can call far more customers in parallel than a human team can. So the prize sits on both sides of the ledger: reach many more customers, and spend agent time only where it pays off.

*(Baseline figures are from the business-run POC, taken as our working truth pending Product/Analytics vetting.)*

## 3. What we're building

An AI voice agent calls the customer, talks through their pending cart, and afterwards gives us a clear read on how interested they are — **Hot, Warm, or Cold.** Interested customers — Hot and Warm — are handed to a human agent who calls back and places the order, worked ahead of everything else. Below them comes the **normal manual queue** (leads the AI hasn't called), and **Cold** leads come last, at the lowest priority. (Full order in §5.)

Four choices shape the whole thing, and each is deliberate:

- **We own the call and the customer's data.** Truemeds places the call through its own telephony provider (Knowlarity) and keeps all personal data — phone number, address — on our side. The vendor never receives it (except the name). The vendor is the conversation and the judgment; it is not the caller.
- **Our data is the truth; what we send the AI is only a snapshot.** A cart can change between the call and the callback. Before an agent acts, we re-check the live cart — we never act on stale information.
- **One customer, one channel at a time.** A customer being worked by the AI is never also called by a human, and the reverse. No one gets two calls at once.
- **Built to extend beyond carts.** We tag each interaction with our own reference, not the order number — so the same system can later qualify other customers (uploaded a prescription but didn't order, signed up but never browsed, and so on) without a rebuild.

## 4. How it works

One customer, on the path where everything goes cleanly — the branches (no-connect, retries, waiting, stopping) are in §6:

1. **Pick.** We select an eligible customer and give this interaction our own reference ID.
2. **Send context to the vendor** — the cart details and that ID. No contact PII (no phone number or address); the only personal detail sent is the customer's name, so the bot can address them.
3. **The vendor prepares the conversation** and ~~hands back a live voice stream for this one call.~~ warms up the bot for this call, matching it to the lead by our reference id. *~~[Assumption — that the vendor can hand back a voice stream and we can bridge it onto our call this way is not yet confirmed; it's the first open question in §9.]~~ [Resolved on the Ring call — see §13: the vendor doesn't hand us a stream to bridge; the telephony provider connects to the vendor over a WebSocket and the bot is streamed on that.]*
4. **We place the call through our telephony provider**, connecting the customer to the vendor's voice. On the same call, the telephony provider opens the WebSocket to the vendor; the bot stays silent until the customer picks up. We run the whole call — dialling, waiting for pickup, retrying if they don't answer, staying inside allowed calling hours. Not every call connects; what happens when it doesn't is in §6.
5. **The customer picks up, and the bot starts talking.** Because the vendor is connected before pickup (so it's ready with no lag), it waits for a "customer answered" signal, then begins the conversation.
6. **The conversation happens.** The AI hears the customer out, handles their hesitation, and gauges interest.
7. **The call ends** and our telephony provider gives us the recording. We store it — along with the call's event log (dialled, answered, hung up, verdict received) — on the Truemeds side, for audit and RCA.
8. ~~**We send the recording to the vendor**, which analyses it~~ **The vendor records the bot–customer conversation on its own side** and returns the verdict — Hot / Warm / Cold — within minutes, ideally with the customer's objection and a short summary. We don't send it a recording (see §13). *[Assumption — we don't yet know how fast, or how reliably, Ring returns the verdict; see §9.]*
9. **Hot and Warm go to a human agent** as a priority callback, with the AI's context already on screen. The agent re-checks the live cart and places the order.
10. **Cold, no-answer, wrong-number, and do-not-call** are set aside per the rules in §6 — not blindly re-dialled.

```
  Pre-load (batch, no phone number):
  send our reference id + cart / custom vars + workspace id to the AI vendor
                                    │   vendor stores it, ready to match
                                    ▼
  Dial: we call the customer via our telephony provider (mobile + our reference id)
                                    │
                 ┌──────────────────┴──────────────────┐
          connected                                 not connected
                 │                                        │
                 ▼                                        ▼
  telephony opens a WebSocket to the vendor       telephony tells us why
  (carries our reference id) → bot warms up       (busy / no-answer / switched
                 │                                  off / bad number) → §6:
  customer picks up → "answered" event             retry, wait, or stop
                 │
                 ▼
  AI conversation (bot streams on that WebSocket)
                 │
  call ends → telephony gives us the recording (we store it + the event log)
                 │
                 ▼
  vendor records its own copy → returns verdict (Hot / Warm / Cold / don't-call) on our reference id
                 │
      ┌──────────┼───────────────┐
      ▼          ▼                ▼
  HOT / WARM   COLD          DON'T-CALL
 priority     lowest          (from the AI's
 callback     priority —      post-call read)
 by a human   after the       → opted out,
 (AI context; manual queue,   suppressed (§6)
 re-checks    still called
 cart)        (§5)
```

*A call that connects but drops before a real conversation (under the minimum duration) is treated as not-connected and goes to retry — see §6.*

One customer is only ever on one channel at a time — the AI "holds" the lead while it's working it, so no human calls in parallel. The existing manual calling flow keeps running underneath throughout, independent of the AI. The controls (how much the AI works, how to stop it) and everything that happens off this clean path are in §6.

## 5. Which leads the AI works, and in what order

**Working default (open — see §9):** the AI works dropped-cart leads that have a **patient and address on file**, dialling **FTC customers first, then NFTC**. This is a starting assumption so engineering has something to build against; the choices below are open to business, and their answers may change this default.

Three things sit here, and keeping them apart is what stops this getting tangled:

- **Who's eligible — what a lead needs before the AI can call it.** Today: a **patient name** (so the AI can address the customer and hold the conversation) and an **address** (so the order can actually be completed). This is a **configurable set, not a fixed rule** — a later use case might need only a mobile number and a name. Note that *requiring* an address to exist is not the same as *sending* it to the vendor; the no-personal-data rule still holds. If someone other than the patient answers, the AI handles that on the call — confirming who it's speaking to is part of the conversation the vendor owns, not something we manage.
- **The order the AI dials — within its eligible pool.** Today: **FTC first, then NFTC.** FTC-first is an *ordering*, not an exclusion — the AI can call NFTC too. This order is also configurable.
- **What we don't touch — the manual queue's own prioritisation.** The score the "Assign Order" queue already uses to rank leads for agents stays exactly as it is; we don't change how it scores or orders anything. The AI works a *subset* of that pool; the human queue keeps running as it does. When the AI returns Hot/Warm, those leads are served **ahead** of that queue as a priority tier — the tier is new, the underlying score is untouched.

**Who agents pick up first — the priority order.** The AI's verdict adds a priority tier in front of the manual queue; the underlying queue score is untouched. Agents work leads in this order:

1. Hot FTC
2. Hot NFTC
3. Warm FTC
4. Warm NFTC

Below these four tiers sits the **normal manual queue** — leads the AI hasn't called (there are always some, because eligibility filters mean not every lead reaches the AI). **Cold** leads come last: callable at the lowest priority — a Cold verdict deprioritises a lead, it doesn't drop it. Only do-not-call and invalid numbers are truly excluded. This ordering is a starting point; business can re-order or switch tiers off.

Which leads the AI calls should be configurable — so pointing it at a new drop-off later is largely a **configuration change, not a ground-up rebuild** (it still needs some Engineering effort; the config layer is in §6). Some drop-offs this could extend to — today's thinking, not an exhaustive list: prescription uploaded but no order · registered but never browsed · browsed but never added to cart · refill reminders for chronic patients · win-back of lapsed customers · recovering discarded or cancelled orders. It's the same reason each lead carries our own reference ID rather than the order number.

One tension worth naming up front (it's the open question in §9): a strict patient-and-address gate **excludes most FTC customers**, because they're the least likely to have those details on file yet — and FTC may be exactly the segment we most want the AI to prioritise. That trade-off is business's to settle.

This policy is business-owned and can change over time; each use-case / campaign is instrumented separately, so business can see how it performs and adjust.

## 6. The lead's journey — retries, waiting, and when we stop

§4 is the clean path. This is what happens when a call doesn't connect, when a lead waits, and when we stop working it.

**Whether a call connected, and how the conversation went, are two different signals from two different places.** Whether the call connected — and if not, why (busy, no answer, switched off, wrong or invalid number) — comes from the **telephony provider**. How the conversation went — Hot, Warm, Cold, a callback request, a do-not-call — comes from the **AI**, and only exists for calls that actually connected. The AI can't "hear" a call that never connected. So **retries are our decision, driven by the telephony outcome — not the AI's — and a retry threshold decides when we stop.**

**Retries.** When a call doesn't connect, we try again — a single retry rule, one gap. How many times and how far apart are not fixed in code; they're config values business finalises before go-live (see the settings table below). What triggers a retry — and whether a retry even makes sense — depends on the outcome, and on who reports it:

| Signal — from | What we heard | Lead's next state | When it comes back |
|---|---|---|---|
| Telephony webhook | Busy / no answer / switched off | Hold | after the retry gap |
| Telephony webhook | Temporary network / carrier error | Hold | after the retry gap |
| Telephony webhook | Connected but dropped under the minimum duration (no real conversation) | Hold | after a short retry gap |
| Telephony webhook | Invalid / wrong number | Closed | no retry — flag for data cleanup |
| Human agent | Schedules a callback at a customer-named time | Scheduled | at the named time |
| AI (post-call read) | Customer asked to be called back later | Scheduled | at the requested time |
| AI (post-call read) | Do-not-call | Closed | never |

The full set of telephony responses comes from the provider's hangup-cause list, mapped to these actions in config; the operating runbook — who watches failures, when to escalate — is a business SOP, a dependency rather than part of this PRD. Retrying stops once the retry threshold is hit (see the settings table below).

**Waiting — a lead set aside to come back later.** A lead comes back for a few reasons: the system schedules the next **retry** for a not-connected call, an agent **schedules** a callback for a time the customer named, or the customer asked the AI to call **back later**. Underneath it's one idea — *"come back to this lead at time T"* — and each waiting lead carries **who resumes it** (the AI or a human, and which agent for a personal callback), so an AI-deferred lead returns to the AI and a human callback to a person. (The old manual **Hold** button for re-queuing a not-reached lead is retired — retries are now system-enforced; see the manual-flow note below.) For a callback the customer named a time for, the default is the **same agent** who promised it, falling back to the general queue if they're not free then — but whether callbacks return to the same agent or to the next available one is an Ops setting, not fixed in code.

**When we stop, and it doesn't come back.** A lead is **closed** when it hits its **retry threshold** (starting value ~3 attempts, business to finalise before go-live and kept within TRAI/DND limits), reaches a terminal outcome, or times out. A closed lead **leaves every queue**, so no agent sees it again. Because the AI reads nothing about a call it couldn't complete, enforcing this retry threshold is the **system's** job — there's no human eyeballing each AI lead the way there is on the manual queue.

**"Don't call me."** If a customer says "don't call me" on any of our calls — the AI's or a human agent's — we mark them do-not-call, and that permanently stops every call this build controls: the AI and all our human agents. A lead reaches our do-not-call list two ways: (1) from an **AI call** — Ring returns the opt-out as part of its **post-call** read (not ~~mid-call~~ — see §9); and (2) from a **human call** — the agent adds it directly via a **one-click CTA** on the lead. Either way it's applied from the next call onward. Extending it across Truemeds' other calling portals (like HA) needs a shared do-not-call list everyone honours — an open dependency (§9).

**Not over-calling anyone (frequency cap).** Separate from retries, we cap how many times a customer is actually **reached** — connected calls, across the AI and human agents — in a rolling window. A lead can keep re-entering the queue as the customer changes their cart or another trigger fires; once the frequency cap is hit, no further call goes out, however many triggers re-queue them. The exact cap is an Ops setting. One consequence to note: because the AI calls first and a human calls back, an interested customer now gets at least **two** connected calls where manual calling made one — so a cap of 3 is already two-thirds spent on a single Hot lead. That's the strongest argument for live transfer (future-state note): handing the AI call straight to a human collapses the two into one.

**The controls Ops holds:**
- **Throttle** — how many customers the AI works at once, and the pace of new calls. It's the main rollout dial: start small, keep the AI within what agents can follow up on so qualified leads don't pile up and go stale, and control cost. Throttle works globally and per use-case / campaign, so FTC can be paced differently from the rest.
- **Kill switch** — one action stops all *new* AI calls at once; calls already in progress finish and report; the manual flow keeps running untouched; fully reversible. There's a global master stop and a per-use-case stop — e.g. halt just FTC calling — so one campaign can be switched off without touching the others.
- **The settings above** — retry counts and gaps, the retry threshold, calling-window hours, how often one customer can be called, how long a qualified lead stays "hot", and whether a scheduled callback returns to the same agent or the next available one — are Ops settings — proposed by Product, set with business, within any regulatory limits, and never hardcoded (see "Where these settings live" below).

**Where these settings live.** There's no separate "Ops console" today, and none of this is a vendor feature. For this build the settings sit as **backend configuration values — not hardcoded** — so Engineering can change any of them (retry counts and gaps, the retry threshold, the frequency cap, calling window, hold-time, eligibility, dial-order) **on request, without a code deployment**. That "no redeploy to change an attribute" is the bare-minimum bar. The **end state** is a small **self-serve tool** where the team sets these directly, with no Engineering in the loop. **Who decides:** Product proposes the values; business (or a team lead) approves and sets them — and some aren't a free choice at all, but bounded by regulation (TRAI / DND rules on outbound calling). The **frequency cap in particular can only be enforced on our side**, since only we see AI and human calls together. Building this configuration layer is itself an Engineering effort — not a free runtime toggle.

**The settings, in one place.** Every knob above, with a starting value to finalise with business before go-live:

| Setting | What it controls | Scope | Starting value *(business to finalise)* | Owner |
|---|---|---|---|---|
| Eligibility set | what a lead needs to qualify | per use-case | patient + address | Product + Business |
| Dial-order | order the AI dials its eligible pool | per use-case | FTC first, then NFTC | Product + Business |
| Retry gap | wait before retrying a not-connected / held lead | global | ~30 min (standard); ~1–2 min for a short-drop | Business |
| Retry threshold | max attempts before a lead is Closed (not-connected cap); counts every not-connected attempt equally, short or standard gap | global | ~3 attempts (within TRAI/DND) | Business |
| Minimum connect duration | shortest connect that counts as a real conversation — below it, a short retry (not a connected call, not sent to Ring) | global | ~15–20 s | Business |
| Frequency cap | max connected calls to a customer, AI + human, in a rolling window (connected cap) | global | ~3 / week (to set) | Business |
| Calling window | allowed calling hours | global | 09:00–21:00 | Business + Compliance |
| Hot hold-time (stale) | how long a qualified lead stays prioritised before it's stale | global | ~24–48 h | Business |
| Callback routing | same agent vs next available (named-time callback) | global | same agent, else queue | Business + Product |
| Throttle | concurrency + pace of new AI calls | global + per use-case | start low, ramp | Product + Business |
| Kill-switch | stop new AI calls | global + per use-case | — (operational) | Business + Product |

**How this touches the existing manual flow.** The manual calling flow keeps running; a few interplay points:
- **Hold button retired.** With not-connected retries now system-enforced, the manual **Hold** (an agent re-queuing a not-reached lead) is no longer needed — a frontend change on the manual portal. (Schedule stays.)
- **Call button is backend-gated.** "Call patient" is enabled only when a call is actually allowed — within the frequency cap, not a do-not-call, not a closed lead — so the caps are enforced rather than an agent dialling freely. (Also a manual-portal frontend change.)
- **Telephony stays as-is.** The manual flow uses its own two-leg SIP-trunk setup (leg 1 dials the agent, leg 2 the customer), separate from the AI's Knowlarity streaming path. We don't migrate it — attempt counts, retry threshold and frequency cap sit on our side regardless. Assumed handled in the manual flow for now: only **leg 2 (the customer) connecting** counts as a customer connection, and a **leg 1 (the agent) failure** is a manual-flow error, not a customer attempt.

**Every state a lead can be in — dispositions we track.** Each lead carries a disposition through its whole journey, captured on the Truemeds side (not inside the vendor), and every dial is counted (the attempt number) so we always know how many calls a lead has taken. Because the telephony outcome is logged for every dial, calls that never connected — which the AI never sees — are tracked too.

| State / disposition | Type | Set by | Meaning |
|---|---|---|---|
| Eligible — picked | working | system | selected into a use-case, given a uuid |
| Assigned to AI | working | system | AI is working the lead (holds it; no human in parallel) |
| Assigned to a human agent | working | system | priority callback or manual queue |
| Dialled — attempt N | working | telephony | each dial increments the attempt count |
| Awaiting retry | waiting | system (telephony) | not connected / short-drop — auto-retry after the gap |
| Scheduled | waiting | agent / customer / AI | come back at a named time |
| Outcome unknown (parked) | waiting | system | no webhook by the timeout — held in place, **not** re-dialled; resolves if a late webhook or an order arrives. Each disposition change is logged, so the unknown period is retained even after it resolves (§12) |
| Hot / Warm / Cold | verdict | AI | intent read on a connected call |
| Order placed | terminal | agent | success; lead closes |
| Do-not-call | terminal | AI or any agent | opted out — stops all channels |
| Invalid / wrong number | terminal | telephony | bad number — cleanup, no retry |
| No order | terminal | agent | worked, no order |
| Closed — retries exhausted | terminal | system | hit the retry threshold or timed out |

## 7. User stories

**The customer.** *"I left some medicines in my cart and got one helpful call. Because I was interested, a person called me back quickly and already knew what I needed — so it was fast. When I'm not interested, I'm not chased again and again."*

**The ACOM agent.** *"The leads I get are already qualified and come with context — the customer's objection and a short call summary — so I spend my time closing orders, not dialing numbers that never pick up. When a call doesn't convert, I log the reason, and that makes the next round of qualification sharper."*

**Ops / team lead.** *"I can control how many customers the AI works at once, see how it's performing, and switch it off in a single move if anything looks wrong — all without disturbing my human team's normal flow."*

## 8. Scope — in and out

**In scope**
- AI qualification calls, starting with dropped carts as the first use case.
- **We own the whole call through our telephony provider** — dialling, retries, calling-window, and the rules for when to stop and close a lead.
- **Configurable eligibility and dial-order** — which leads the AI works, and in what order (§5).
- The **~~recording → verdict~~ verdict loop** with the vendor — it records the bot–customer conversation on its own side and returns Hot / Warm / Cold (plus objection and summary where available); we don't send it a recording (see §13).
- **Priority callback** routing of Hot/Warm to human agents, with AI context on screen and agent disposition captured.
- The **waiting model** (hold / schedule) and **do-not-call** suppression across every channel.
- **Throttle** and an instant **kill-switch**.
- Retaining, on the Truemeds side, the **call recording (from the telephony provider) and the call's event log** — for audit and RCA; not sent to the vendor.
- **Vendor-agnostic by design.** The voice-AI vendor sits behind a generic role, with standard mapping contracts — one shape for what we send a bot (lead + cart), one for what any bot returns (its intent, mapped to our Hot / Warm / Cold) — plus a telephony adapter boundary. We own the number, the data and the uuid, so a future vendor swap (AI or telephony) is a **re-integration, not a rebuild**.

**Out of scope (deliberately)**
- The AI placing or editing orders, applying coupons, searching for products, or collecting missing details like an address — humans place the order.
- **Changing how the manual queue prioritises leads** — its existing score stays as it is (§5).
- Live transfer of the call to an agent mid-conversation (see the future-state note).
- A full plug-and-play multi-vendor platform — a new vendor slotting in as config + a thin adapter, no re-integration. We run a single voice-AI vendor for now and design vendor-agnostic (see "Vendor-agnostic by design" above); whether to build the full platform layer now or as a fast-follow is an effort call, flagged in §9.
- A self-serve campaign-builder tool for Ops.
- Handling a mid-call request to reach the patient on a different number than the one we dialled — out of scope for now.
- The bot giving medical advice, validating prescriptions, or deciding substitutions — these stay with the existing doctor/pharmacist post-order flow. A customer saying "don't call me" is treated as a do-not-call — stopped in this flow (the AI and all our human calling) at once, and extended to the other calling portals (HA and the rest) via a shared do-not-call list where one exists (see §9).

## 9. What's decided vs what's still open

**Decided — these are firm**
- No personal data (phone number, address) is sent to the vendor; Truemeds owns the number and the call.
- Truemeds owns the full call lifecycle — dialling, retries, calling hours — and can stop everything instantly.
- **Retries on not-connected calls are system-enforced** — we count the attempts from the telephony response and stop when the **retry threshold** is hit; the lead is then closed and leaves every queue.
- A customer is worked by one channel at a time; the AI and a human never call the same customer at once.
- **A closed lead never re-enters any queue.**
- **A do-not-call is permanent — it stops the AI and human callbacks for good; extending it across the other portals depends on a shared suppression list (open).**
- One waiting model underneath hold and schedule, with each lead tagged for who resumes it (AI or human).
- Truemeds data is the source of truth; the live cart is re-checked before an agent acts.
- We **don't change the manual queue's prioritisation score**; the AI's own eligibility and dial-order are configurable. Qualified Hot/Warm are served ahead of that queue as a tier.
- Each interaction carries our own reference ID, not the order number, so the platform extends to other use cases.
- Recordings are retained on the Truemeds side.

**Still open — need a confirmed answer before build** *(owner in brackets)*
- **Who targets FTC, and how strict is the AI's eligibility?** *(may override the working default in §5 — flagged deliberately)* Should the **AI** prioritise FTC customers, or should FTC stay with **manual agents** while the AI takes NFTC? And should the AI qualify **only** leads that already have patient + address — a strict gate that excludes most FTC, the segment we may most want? Options: keep the gate · relax it for FTC (e.g. name-only, a human collects the address later — the bot won't) · drop it for future use cases that have only a mobile number + name. **[Business]**
- Where AI Hot/Warm leads sit relative to the manual queue — now set out explicitly in §5 (Hot FTC > Hot NFTC > Warm FTC > Warm NFTC, then the manual queue, then Cold). Business to confirm the final ordering. **[Business]**
- Starting values for business to set — retry gap, retry threshold, frequency caps, calling window, hot hold-time — are listed with suggested starting values in the §6 settings table; business to finalise before go-live. **[Business]**
- ~~Can Ring's live voice be bridged onto a Knowlarity call the way described in §4?~~ **Resolved (Ring call, 11 Sep):** yes — Knowlarity connects to the vendor over a WebSocket carrying our reference id (see §13). **[Ring + Knowlarity]**
- ~~What starts the AI talking — a "customer answered" signal from Knowlarity, or the AI simply waiting for the customer to speak first?~~ **Resolved (Ring call, 11 Sep):** a "customer answered" event starts the bot (the vendor is connected before pickup to avoid lag). **[Ring + Knowlarity]**
- ~~How exactly do we get the recording to Ring — over the same channel we send the lead on, or a separate one?~~ **Resolved (Ring call, 11 Sep):** we don't — the vendor records the conversation on its own side; we keep our own copy from the telephony provider (see §13). **[Ring]**
- How quickly, and how reliably, does the verdict come back? Ring has indicated ~within a minute; to be **confirmed with Ring in writing and closed during this integration, before go-live.** **[Ring]**
- Which languages does the conversation handle well — Hindi, Hinglish, English? **[Ring]**
- How do we handle personal details a customer may speak aloud in the recording — consent and any masking? **And:** the telephony provider's "customer answered" event carries the customer number today — it must be stripped so only our reference id + workspace id reach the vendor (to be security-tested our side; see §13). **[Legal/Compliance + Ring + Knowlarity]**
- **Do-not-call reach.** Is there a shared do-not-call / suppression list that every calling portal (HA and the rest) honours, so a do-not-call captured here suppresses the customer across all Truemeds outbound calling? Without it, this build can only guarantee its own two channels (the AI and human callbacks). **[Engineering + Business + Ring]**
- Which customers form the first segment, and at what volume do we start? **[Business]**
- What set of intent labels does Ring return, and how do they map to Hot / Warm / Cold — and can it also return a **do-not-call as an explicit label**, so an opt-out heard on the call is captured automatically rather than inferred? **[Ring + Engineering]**
- **How far do we build the vendor layer now?** We commit to vendor-agnostic design (§8); building the *full* plug-and-play platform — a new AI or telephony vendor as config + a thin adapter — is an effort call. Engineering to size it; if the delta over the agnostic design is small we do it now, otherwise it's a fast-follow. **[Engineering + Product]**

## 10. How we'll know it worked

The few numbers that matter:

- **Reach** — the share of eligible customers we actually call (target: well above today's ~60%).
- **Connect rate** — calls that reach a live customer.
- **Qualification quality** — order-conversion rate by verdict. Early on we validate the AI's labels by having humans call across **all** verdicts — Hot, Warm *and* Cold — regardless of what the AI recommends, then compare each one's conversion rate. If Hot > Warm > Cold as expected, we trust the categorisation and let it drive routing. (This is the validation run in the §11 annexure.)
- **The number that matters most** — conversion once a human takes over: an order placed within ~24 hours of hand-off, for AI-qualified leads compared with today's manual baseline. Read as a guide, not a lab result — the AI works a chosen slice of customers, not a random sample.
- **Human productivity** — orders placed per agent-hour versus today.
- **Safety gate (hard):** zero cases of a customer called by the AI and a human at the same time; recordings reliably retained; complaints and opt-outs watched.
- **Cost per order**, once commercials with the vendor are finalised.

## 11. Annexure — suggestions to business

Not part of this build — recommendations for business to weigh.

**1. Turn lead prioritisation into an analytics problem.** Today's priority score is built for carts (order value, likelihood to connect and to convert). For a new drop-off that has *no* cart — someone who registered but never browsed, or viewed products but never added to cart — those signals don't exist; the useful ones are behavioural: app opens, product views, repeat visits, recency. Building a score for those is an analytics exercise — define the signals and weights per use case, and **validate them in the background** against real conversions before they drive who gets called. Separately, one caution on the *existing* score: whenever Ops changes its weights to favour a segment, keep an eye — **by cohort and by hour** — that another segment isn't quietly getting no calls at all. A guaranteed minimum share per segment is the simplest guard.

**2. Build confidence in the AI's classification before it drives routing.** Rather than acting on Hot / Warm / Cold from day one, run the AI's calls while continuing today's checks *regardless* of its verdict, and compare the verdict against what actually converted. Once the classification proves reliable on our own customers, let it drive prioritisation. It's cheap insurance against spending agent time on the strength of a label we haven't yet validated.

## 12. Edge cases

*Curated, not exhaustive — the failure modes that genuinely threaten the build. We'll add as more surface.*

**1. The telephony webhook is missing, late, or wrong.** Much of §6 keys off one signal — the Knowlarity webhook at hangup — and in practice it's sometimes delayed, dropped, or unreliable.
- **Hold, don't re-dial.** If no webhook arrives by the timeout, we mark the lead **outcome unknown** and **hold it in place — no retry.** The customer may have spoken and declined, or asked not to be called; re-dialling blind would be a bad experience.
- **Order placed → close.** The trusted signal is our own data: if an order was placed for this lead, close it as success regardless of the missing webhook.
- **A late webhook resolves it.** If the webhook arrives later, it un-sticks the lead and we act normally then — ~~send the recording to Ring for a verdict,~~ take the vendor's verdict, apply the outcome, decide the next step. If the lead was already closed (e.g. order placed), the late webhook is **idempotent** — it only enriches the record, never re-opens or re-dials.
- **Retain the unknown, even after it resolves.** A late webhook overwrites the disposition, so "outcome unknown" would otherwise vanish. Every disposition change is logged as a timestamped event — we keep that the lead *was* unknown, and for how long, for analytics and reliability tracking. (Product owns the requirement; Engineering the mechanism — a status-history log; it may also reconcile via the telephony API, but the lead behaviour above is unchanged.)
- **Forensics, not a fix.** The recording and event log we keep our side (§4/§8) let us reconstruct and reconcile a call after the fact — but they don't remove the dependency on the telephony provider (Knowlarity) delivering its signals reliably; a missing or late webhook is still missing. That reliability is a live risk, addressed by a provider SLA + active reconciliation, not by our logs.
- **Watch it.** Track how often leads enter "outcome unknown" — if frequent, it's a go-live reliability risk. This is chiefly **Knowlarity's event/webhook reliability** (not only the vendor's verdict latency); reinforces the §9 reliability questions.

**2. The cart changes while a lead is already in the system.** *In flight = a lead in any non-terminal disposition (assigned to AI/agent, awaiting retry, scheduled, outcome-unknown); it leaves "in flight" only at a terminal disposition.*
- **One customer, one in-flight lead.** A cart change (or another trigger) while a lead is in flight does **not** create a second lead — it attaches to the existing one. A new lead can start only once the current one is terminal — and even then it's called only if it **doesn't breach the frequency cap** (the connected-call cap still governs).
- **Between calls (held / awaiting retry / scheduled):** handled — the change updates the lead, and the **live cart is re-read** when it re-enters (to the AI or a human). The order is always placed against the live cart.
- **During a live call:** the AI works from a call-start snapshot, so a mid-call change isn't reflected to the bot live. **Accepted, not blocking** — the snapshot is only for the conversation; the order is placed by a human against the live cart. Guards: (a) Ring handles "I've changed my cart" gracefully (the bot reads item-level only on ask); (b) the agent's screen shows the **live cart in real time**. We do **not** freeze the customer's cart during a call.

## 13. Vendor integration — running MoM

*A living record of what we settle with each vendor on the call architecture, so readers don't re-open the same questions. Dated entries; telephony-side items are confirmed with the telephony provider separately.*

### Ring — call architecture (11 Sep 2026)

- **Chosen path.** Ring pre-loads each lead in batch (our reference id + custom variables + workspace id, no PII). The telephony provider (Knowlarity) dials the customer and, on the same call, opens a WebSocket to Ring carrying our reference id; Ring warms up the bot against it and speaks only once a "customer answered" event fires. Ring records the bot–customer leg on its own side and returns Hot / Warm / Cold by webhook on our reference id.
- **Why a WebSocket (not SIP or a plain HTTP call).** Knowlarity doesn't offer SIP connectivity, and the audio is a live two-way stream — so it has to be a WebSocket. Ring already runs this exact WebSocket path with Knowlarity in production (for a simpler inbound case), which is why it's the low-risk option.
- **Alternative considered and set aside — Truemeds owning the audio bridge.** We explored Truemeds sitting in the middle (taking a streaming URL from Ring and relaying the audio itself, so nothing connects Ring to the telephony directly) to reduce lock-in. Technically possible, but Ring discourages it: we'd hold two WebSockets open per call and relay audio at Ring's exact tuned packet size (which took Ring real effort to stabilise with Knowlarity), at meaningful cost and a new point of failure. Parked — see the §9 "how far do we build the vendor layer now" question.
- **No true platform-agnosticism.** Ring confirmed a telephony swap always needs some custom dev on both sides (data formats and packet handling differ per vendor). A swap is a **re-integration, not a rebuild** (consistent with §8) — not a zero-touch change.
- **PII on the "answered" event.** The event carries the customer number today. Knowlarity must strip PII and pass only our reference id + workspace id (bot/agent id optional). To be security-tested on our side.
- **Recording & events, our side.** We store the recording from the telephony provider and the event log (dialled, answered, hung up, verdict received) for audit/RCA; we do not send a recording to Ring (it keeps its own copy to produce the verdict). This is forensics — it does not fix telephony reliability (§12).
- **Commercials.** Ring charges for connected calls only; no difference between connecting before vs after pickup. A future telephony change carries a one-time integration cost, same rate thereafter.
- **Dev split.** Knowlarity: pass our reference id over the WebSocket + the PII-masked "answered" event. Truemeds: trigger the Knowlarity call, own retries (Ring does none), store the recording + event log; the earlier "Ring calls our webhook to fetch the phone number" flow is dropped (Ring's verdict webhook to us stays).
- **Pending.** Confirm the telephony specifics with Knowlarity; confirm verdict latency with Ring in writing.

**Originally assumed flow (superseded by the above)** — kept for the record:

```
   Pick eligible customer  →  send cart + our ID to the AI vendor  (no phone number)
                                        │
                                        ▼
              The AI vendor returns a live voice stream for the call
                                        │
                                        ▼
              We dial via our telephony provider
                                        │
                     ┌──────────────────┴──────────────────┐
              connected                                 not connected
                     │                                        │
                     ▼                                        ▼
             AI conversation                        telephony tells us why
                     │                              (busy / no-answer / switched
              call ends → recording                  off / bad number) → §6:
                     │                               retry, wait, or stop
                     ▼
       Send recording to the AI vendor  →  verdict in minutes
                     │
      ┌──────────────┼───────────────┐
      ▼              ▼                ▼
  HOT / WARM       COLD        no-answer / wrong number /
 priority        set aside     do-not-call → set aside
 callback by a   (not          (see §6)
 human (with     re-chased)
 AI context;
 re-checks cart)
```

---

### Future state (later, not this build): live transfer

Today an interested customer gets a fast callback, because the verdict lands a few minutes after the call ends. A natural later step is **live transfer** — the AI hands the call straight to an available agent while the customer is still on the line, converting them in the moment. Beyond conversion, live transfer also **halves the calls a customer gets** — one call instead of an AI call plus a human callback — which protects both the frequency cap and the customer experience, so it's worth prioritising sooner rather than later. It needs capability on **both sides**: Ring judging interest live (mid-call), and our own telephony/transfer build. A deliberate future step — noted so today's choices don't rule it out — not an immediate blocker for this release.
