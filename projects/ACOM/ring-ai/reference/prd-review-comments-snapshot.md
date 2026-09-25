# PRD review snapshot — full document + inline comments + replies

*Diff-check baseline for **AI-led Lead Qualification — PRD** (Confluence PROD page 2023260174). Originally captured the entire document body plus every inline comment, reply, and our resolution status. Re-pulled 2026-09-09 ~17:00 IST; Batch-1-through-5 state last updated 2026-09-10 (page v6).*

**⚠️ Status note (25 Sep 2026):** PART A/C below (the 9–10 Sep comment tracker) is kept as the historical record of that review pass and is still accurate for the comments it covers. It has **not** been re-transcribed line-by-line for the 23–25 Sep pass — see **PART A.1 (new)** just below for what changed since, and **PART A.2 (new)** for what's still open. **PART B (full document body) is now stale** — the current full body lives in `docs/ai-led-lead-qualification-prd.md`, kept in sync with the live Confluence page; that file is the diff-check reference going forward, not the PART B snapshot below.

**Counts (as of 25 Sep 2026):** 52 root-level inline comments · 47 with at least one reply · 5 without a reply yet (4 already answered by current doc content, 1 genuinely new — see PART A.2) · 0 dangling (orphaned-anchor) comments on the live page.
**Reviewers:**
- **Reviewer A** = accountId `712020:94030b36-191a-4c44-9ecf-8833cc5cb028` — the senior stakeholder, comments 1–33 (left 06:42–07:27).
- **Reviewer B** = accountId `712020:993a2710-7eb3-4202-9945-338a85f6377a` — second stakeholder, comments 34–36 (left ~12:43–12:46).
- Reply on ₹250 = Abhishek Rao (`63723d9f…`).
**Status legend:** ADDRESSED = doc edited + reply drafted/posted · PENDING = not yet worked · N/A-EXTERNAL = needs Abhishek/Dinesh/Analytics input, not a doc edit.
**Note on replies:** replies we've posted are recorded in Part C with their comment IDs; comments not yet worked show no reply.

---

## PART A.1 — Resolved since the 9–10 Sep pull (23–25 Sep 2026)

This session recovered the Confluence page from an accidental corruption back to a known-good
state (verified 0 dangling comments before and after), then resolved a further round of review
comments and locked two new product rules, working comment-by-comment with the reviewing team.

| What | Resolution |
|---|---|
| #34 — ACOM team strength (anchor "10,000") | Answered by business on Confluence. |
| #35 — POC design / Hot-only? / criteria / BRD (anchor "20%...qualified and passed on") | Answered by business on Confluence. |
| SKU-level pricing in the vendor payload | Dropped from the doc per reviewer feedback — not something the PRD needed to specify at this level. |
| `discount_amount` + `discount_percent` fields | Resolved with the reviewer. |
| Callee name vs patient name (comment 2056454193, "Contract only has callee name in Ringg...") | §9 now states: we send the patient name; where not available, the customer name. Replaces the earlier open question about the vendor "pivoting" mid-call to the account holder. |
| Retry threshold | Confirmed at **4 attempts** (was a "~3, business to finalise" working placeholder), within TRAI/DND limits — 30/60/60 min gaps across the 4 attempts. Corrected in all three places it appeared in the doc (a first pass missed one occurrence — now the practice is to scan the whole document for every occurrence of a changed fact before calling an edit done). |
| **🆕 New locked rule** — human-assigned lead never goes to the bot | Added to PRD §9 (Decided): "Once a human agent is assigned to a lead, that lead is never assigned to the bot. Scoped to that lead — a new cart or order creates a fresh lead (§12) and is evaluated fresh." See `knowledge/decisions/2026-09-25-ring-ai-prd-clarifications.md`. |
| **🆕 New locked rule** — retry-exhausted closure is permanent | Added to PRD §6: "This closure is permanent for that lead. Retries exhausted means done — we don't reopen it or recheck it later. The only way this customer re-enters is a new cart or order creating a fresh lead with its own reference ID; nothing resurrects a closed one." See the same decision-log entry. |

## PART A.2 — Still open (as of 25 Sep 2026)

**Genuinely new, unanswered comment:**
- **2063761413** (created 25 Sep, anchor "A call that connects but") — "SIP instead of websocket in the design." PRD §13 already documents why WebSocket was chosen over SIP (Knowlarity has no SIP connectivity; audio is a live two-way stream) — needs a reply pointing there, or a fuller answer if the reviewer wants more.

**Answered in the doc, but no closing reply posted yet** (comment-level housekeeping, not a content gap):
- **2056454193** — callee/patient name — see PART A.1 above.
- **2056945670** — "telephony confirmed a connected call, Ring never returned a verdict" — covered by the §12 two-signal (Knowlarity/Ring) table.
- **2056552483** — bot-leg failure after the customer answered — covered by the §12 bot-leg-failure table; the exact Knowlarity error code is still open for Engineering to confirm before go-live.
- **2060779523** — "How is this different than Retry threshold?" (on Frequency cap) — the §6 settings table row for Frequency cap now states the distinction explicitly.

---

## PART A — Resolution tracker (all 36)

*(Historical — 9–10 Sep pull; comments 1–36 only. See PART A.1/A.2 above for everything since.)*

### Addressed so far
| # | id | anchor | comment | our resolution |
|---|----|--------|---------|----------------|
| 1 | 2023030791 | "customer segment" | Any kind of leads — need not be only basis customer segments | §1 wording → "any lead or drop-off"; intent already in §3/§5 |
| 2 | 2023292958 | "250" | @Abhishek is this the latest cost? *(reply: "Yes, current cost per order, all-inclusive")* | No change — answered by Abhishek |
| 3 | 2022539282 | "business-run POC" | Incremental (non-cannibalised) sales from ACOM? | §2 "Expected impact [Analytics to confirm]" line added |
| 4 | 2023030799 | "gauges interes[t]" | Clearly call out the output expected from the AI | §4 step 5 → "returns a structured read: an intent verdict (Hot/Warm/Cold)" |
| 33 | 2022604828 | "cart details and that ID" | Enlist all data points passed to the vendor | §4 step 2 enumerated (uuid, cart contents, cart+SKU pricing, ETA, patient+customer name; no phone/address; item-level on-ask) |
| 9 | 2022735881 | "Today" (§5 dial-order) | Ask Engg to add the explicit logic here | Reply only — explicit logic → Engg companion spec; PRD keeps configurable rule (FTC-first today); config home now §6 |
| 11 | 2024210433 | "configuration" | Might need Engg efforts | §5 softened to "configuration change, not a ground-up rebuild"; config layer flagged as Engg build; non-exhaustive use-case list added |
| 17 | 2023555076 | "Ops setting" | Where? Which system | §6 new "Where these settings live" call-out: backend config, no deploy → self-serve tool; Product proposes/business sets |
| 20 | 2023948292 | "Ops setting." | Needs to be built on our system? | §6 call-out: yes, our side; frequency cap only enforceable by us; bounded by TRAI/DND |
| 22 | 2023620614 | "Ops" | Ops + Product please | §6 bullet reworded off blanket "Ops" → proposed by Product, set with business, within regulatory limits |
| 14 | 2022735889 | "fixed" | Mention the explicit aligned settings/limits | §6 new consolidated **settings table** (10 knobs, scope + starting value + owner); values seeded, business to finalise |
| 15 | 2023227396 | "outcome" | Add list of outcomes & retry logic; SOP? | §6 retry buckets → **signal→action table** (single retry rule); SOP flagged as a business dependency, not in PRD |
| 18 | 2023653387 | "retry" | Alignment on threshold at go-live? | §6 threshold named: ~3 attempts starting value (within TRAI/DND), business to finalise; in settings table |
| 21 | 2024013826 | "Kill switch" | Use-case level, say FTC? | §6 throttle + kill-switch reworded: global + per use-case/campaign (e.g. halt just FTC) |
| 5 | 2023751683 | "minutes" | Increasing calls? Why not handover? | Reply: live transfer needs a real-time intent event via Knowlarity (verdict is post-call today); §6 frequency-cap note + future-state case added |
| 7 | 2022637577 | "set aside" | Dispositions? quality tracked? in AI? | §6 dispositions table (working/waiting/verdict/terminal), captured our side; every dial counted |
| 24 | 2023358478 | "never sees a call" | Instrumented & tracked? | §9 bullet simplified (system-enforced retry threshold); manual-flow Hold frontend change flagged; "never sees a call" struck |
| 29 | 2023227404 | "Connect rate" | Might drop | Reply: watch metric, tracked so a drop is visible |
| 30 | 2023096338 | "Qualification quality" | What metric? | §10 redefined: conversion by verdict; validate by calling all verdicts early, confirm Hot>Warm>Cold |
| 31 | 2024210441 | "know" | Impact metrics | Reply: incremental ACOM/OPD/FTC-per-day/CAC are Analytics-owned (§2); Dinesh to size |
| 12 | 2023260197 | "most" | Quantify | Reply: Analytics number — % of FTC lacking patient+address; Dinesh to quantify |
| 6 | 2023915524 | "verdict turnaround…" | Simplify pl | §4 assumption reworded plainly ("we don't yet know how fast/reliably Ring returns the verdict"); flagged phrase struck |
| 32 | 2022998028 | "later" | Why not this release? close latency | Reply: live transfer future-state (post-call verdict); §9 latency bullet tightened — confirm with Ring in writing, close during integration before go-live |
| 36 | 2025455619 | "Interested customers" | Only Hot / Hot+Warm? | §3 already states Hot AND Warm to humans, Cold lowest (full order §5); reply confirms |
| 10 | 2022637585 | "ahead" | Humans call only Hot/Warm? | §3+§5 explicit priority: Hot FTC > Hot NFTC > Warm FTC > Warm NFTC > manual queue > Cold; Cold callable at lowest, not dropped |
| 13 | 2022604820 | "trade-off is business's to settle." | Too much AI; instrumentation? | §5 line: policy business-owned & revisable; each use-case instrumented separately |
| 25 | 2023620622 | "Business" | Diff configs per use-case? | Reply: per-use-case configs already in place (eligibility/dial-order/throttle/kill-switch scoped per use-case; generic uuid). FTC call business to close |
| 26 | 2023915532 | "Hot/Warm" | Priority stack | Adopted intent-tier-first order in §5; §9 open Q points to it, business to confirm |
| 27 | 2022768645 | "Business" | Align & mention values | §9 bullet trimmed to point at §6 settings table; starting values suggested, business to finalise |
| 28 | 2022703112 | "Business" | Close ASAP | Reply: suggested first segment (dropped-cart, patient+address, FTC-first); business to close before go-live |
| 8 | 2023358470 | "holds the lead… no human in parallel" | On hold, customer adds item → new cart, new lead? | §12 edge case #2: "in flight"=non-terminal; one in-flight lead (change attaches, no 2nd lead); live-cart re-read between calls; live-call snapshot accepted-not-blocking; new lead only when terminal AND within frequency cap |
| 16 | 2023161875 | "same agent" | Will AI differentiate; okay for now | Reply-only (sharpened): "same agent" is a **human-agent** routing rule — for the AI there's nothing to differentiate (any instance is identical); human leg gets continuity where possible, falls back to general queue; configurable; accepted okay-for-now |
| 19 | 2023424004 | "mid-call." | Not clear on proposed behaviour | §6 DNC reworked to two capture paths — (1) AI call: Ring returns opt-out on post-call read; (2) human call: agent one-click CTA — applied from next call onward. "mid-call" framing dropped; §9 now asks Ring to return DND as an explicit label (auto-capture vs inferred) |
| 23 | 2023325712 | "platform" | Build to accommodate future vendor change | §8: committed **vendor-agnostic by design** as in-scope principle (generic role + standard mapping contracts + telephony adapter; we own number/data/uuid). Full plug-and-play platform stays out-of-scope; new §9 effort-gate — Engg to size, do it now if delta is small, else fast-follow |

### Pending — Reviewer B (new, ~12:45)
| # | id | anchor | comment |
|---|----|--------|---------|
| 34 | 2025488385 | "10,000" | What is the strength of our ACOM team? — **business to answer (not ours)** |
| 35 | 2025521153 | "20% of the customers it qualified and passed on" | POC design / Hot-only? / criteria / in the BRD? — **business to answer (not ours)** |
| B3 | 2028240908 | "re-check the live cart… never act on stale info" (§3) | "What does it mean? BAU?" → **Answered** (reply 2033418242): largely BAU; the AI adds a stale-snapshot gap, so agent + order always use the live cart; §12 edge 2 |
| B4 | 2028273668 | "Built to extend beyond carts." (§3) | "Not clear" → **Answered** (reply 2033319960): generic reference id → new drop-offs by config, not a rebuild; §5 lists candidates |

---

## PART B — Full document body (as of this pull)

**Author:** Apurva Shetty (Product) · **Status:** Draft v2, for review · **Owner team:** ACOM

---

### 1. Executive summary

Today we recover dropped carts by having agents cold-call every eligible customer — it's slow and expensive, and even among the customers who already have a delivery address and patient details on file, we reach only about six in ten most months; the wider pool of dropped carts is larger still. We're adding an AI voice agent — from a voice-AI vendor (Ring AI) — that calls customers first, has a real conversation about their pending cart, and tells us who's genuinely interested. Human agents then spend their time only on the high-intent, ready-to-buy customers. Truemeds places the call and keeps all customer data on its own side (except the name); the vendor only holds the conversation and reads intent — it never becomes the caller. We start with dropped carts, but the design works for **"any lead or drop-off"** [~~customer segment~~ — struck, comment #1] we later want to re-engage.

### 2. The problem

The ACOM team manually calls every eligible dropped cart. Three facts describe why that's not enough:

- **Reach.** Today's queue only works higher-value carts — above ₹900 — from customers who already have a delivery address and patient details on file. Even within that pool of roughly 17,000 a month, only about **10,000** [comment #34: team strength?] get called, so nearly 40% of even this ready-to-serve pool is never reached. The wider pool of dropped carts — lower-value carts, and customers without an address or patient on file — is larger still. That's recoverable revenue we simply can't get to.
- **Conversion.** Around 5% of the leads we do call end up placing an order.
- **Cost.** About ₹250 per placed order [comment #2], with a large agent team spending most of its hours on customers who were never going to buy.

A proof-of-concept with the voice-AI vendor on ~1,300 real leads converted about **20% of the customers it qualified and passed on** [comment #35: POC design/criteria/BRD?] — roughly 4× the human-only rate — and an AI can call far more customers in parallel than a human team can. So the prize sits on both sides of the ledger: reach many more customers, and spend agent time only where it pays off.

**Expected impact** *[Analytics to confirm — @Dinesh Penta]*: the incremental, non-cannibalised revenue this drives — incremental ACOM sales, incremental OPD, the FTC-orders/day uplift, and the resulting CAC impact — to be sized. [comment #3, #31]

*(Baseline figures are from the business-run POC, taken as our working truth pending Product/Analytics vetting.)* [comment #3 anchor]

### 3. What we're building

An AI voice agent calls the customer, talks through their pending cart, and afterwards gives us a clear read on how interested they are — **Hot, Warm, or Cold.** Interested customers [comment #36] — Hot and Warm — are handed to a human agent, worked ahead of everything else; below them the **normal manual queue** (leads the AI hasn't called), then **Cold** at the lowest priority. (Full order §5.)

Four choices shape the whole thing, and each is deliberate:

- **We own the call and the customer's data.** Truemeds places the call through its own telephony provider (Knowlarity) and keeps all personal data — phone number, address — on our side. The vendor never receives it (except the name). The vendor is the conversation and the judgment; it is not the caller.
- **Our data is the truth; what we send the AI is only a snapshot.** A cart can change between the call and the callback. Before an agent acts, we re-check the live cart — we never act on stale information.
- **One customer, one channel at a time.** A customer being worked by the AI is never also called by a human, and the reverse. No one gets two calls at once.
- **Built to extend beyond carts.** We tag each interaction with our own reference, not the order number — so the same system can later qualify other customers (uploaded a prescription but didn't order, signed up but never browsed, and so on) without a rebuild.

### 4. How it works

One customer, on the path where everything goes cleanly — the branches (no-connect, retries, waiting, stopping) are in §6:

1. **Pick.** We select an eligible customer and give this interaction our own reference ID.
2. **Send context to the vendor** — the cart details and that ID [comment #33]. (no contact PII — no phone/address; only the customer name is sent so the bot can address them)
   - our reference uuid
   - cart contents — items + quantities
   - cart pricing — total MRP, selling price, discount amount, and total savings
   - SKU-level pricing — per item: MRP, selling price, discount amount [confirm Ring can use per-SKU detail in-conversation]. Product note: the bot should read out item-level pricing only when the customer asks about a specific item — it should not recite the breakdown.
   - delivery ETA
   - patient name (whom the AI addresses) and customer name (the account holder, who may be the one who answers) — both always sent; identical when the same person
3. The vendor prepares the conversation and ~~hands back a live voice stream~~ warms up the bot, matching it to the lead by our reference id. [~~Assumption (bridging) unconfirmed~~ Resolved (Ring, 11 Sep) — see §13: telephony connects to the vendor over a WebSocket; bot streams on that, no stream handed to us.]
4. We place the call through our telephony provider, connecting the customer to the vendor's voice. On the same call, the telephony provider opens the WebSocket to the vendor; the bot stays silent until pickup. We run the whole call — dialling, waiting, retrying, inside calling hours. Not every call connects; §6.
5. The customer picks up → "customer answered" event → the bot starts talking (vendor is connected before pickup to avoid lag).
6. The conversation happens. The AI hears the customer out, handles their hesitation, and **gauges interest** [comment #4] and returns a structured read: an intent verdict (Hot/Warm/Cold).
7. The call ends and our telephony provider gives us the recording. We store it + the call's event log (dialled/answered/hung-up/verdict) our side, for audit/RCA.
8. ~~We send the recording to the vendor~~ The vendor records the bot–customer conversation on its own side and returns the verdict — Hot / Warm / Cold — within **minutes** [comment #5]; we don't send it a recording (see §13). [Assumption — verdict speed/reliability not yet confirmed [comment #6]; see §9.]
9. Hot and Warm go to a human agent as a priority callback, with the AI's context already on screen. The agent re-checks the live cart and places the order.
10. Cold, no-answer, wrong-number, and do-not-call are **set aside** [comment #7] per the rules in §6 — not blindly re-dialled.

*(ASCII fork diagram in the live doc — reworked per Ring call: pre-load → dial via telephony → telephony opens WebSocket to vendor (our ref id) → pickup "answered" event → bot streams → we store recording+events → vendor returns verdict (Hot/Warm/Cold/don't-call) on our ref id → Hot/Warm = priority callback; Cold = lowest priority (after manual queue), still called; don't-call = opted out/suppressed. Original assumed diagram kept in §13.)*

*Footnote (§4): a call that connects but drops before a real conversation (under the minimum duration) is treated as not-connected and goes to retry — see §6.*

One customer is only ever on one channel at a time — **the AI "holds" the lead while it's working it, so no human calls in parallel** [comment #8]. The existing manual calling flow keeps running underneath throughout, independent of the AI. The controls (how much the AI works, how to stop it) and everything that happens off this clean path are in §6.

### 5. Which leads the AI works, and in what order

**Working default (open — see §9):** the AI works dropped-cart leads that have a patient and address on file, dialling FTC customers first, then NFTC. This is a starting assumption so engineering has something to build against; the choices below are open to business, and their answers may change this default.

Three things sit here, and keeping them apart is what stops this getting tangled:

- **Who's eligible — what a lead needs before the AI can call it.** Today [comment #9: Engg explicit logic]: a **patient name** (so the AI can address the customer and hold the conversation) and an **address** (so the order can actually be completed). This is a **configuration** [comment #11: Engg efforts?] set, not a fixed rule — a later use case might need only a mobile number and a name. Note that *requiring* an address to exist is not the same as *sending* it to the vendor; the no-personal-data rule still holds. If someone other than the patient answers, the AI handles that on the call — confirming who it's speaking to is part of the conversation the vendor owns, not something we manage.
- **The order the AI dials — within its eligible pool.** Today: **FTC first, then NFTC.** FTC-first is an *ordering*, not an exclusion — the AI can call NFTC too. This order is also configurable.
- **What we don't touch — the manual queue's own prioritisation.** The score the "Assign Order" queue already uses to rank leads for agents stays exactly as it is; we don't change how it scores or orders anything. The AI works a *subset* of that pool; the human queue keeps running as it does. When the AI returns Hot/Warm, those leads are served **ahead** [comment #10] of that queue as a priority tier — the tier is new, the underlying score is untouched.

**Priority order (§5, explicit):** Hot FTC > Hot NFTC > Warm FTC > Warm NFTC > normal manual queue (AI-untouched leads) > Cold (lowest, callable — not dropped). Only do-not-call and invalid numbers are excluded. Starting order; business can re-order/switch off.

Which leads the AI calls should be configurable — so pointing it at a new drop-off later is largely a **configuration** [comment #11] change, not a ground-up rebuild (it still needs some Engineering effort; the config layer is in §6). Some drop-offs this could extend to — today's thinking, not an exhaustive list: prescription uploaded but no order · registered but never browsed · browsed but never added to cart · refill reminders for chronic patients · win-back of lapsed customers · recovering discarded or cancelled orders. It's the same reason each lead carries our own reference ID rather than the order number.

One tension worth naming up front (it's the open question in §9): a strict patient-and-address gate excludes **most** [comment #12: quantify] FTC customers, because they're the least likely to have those details on file yet — and FTC may be exactly the segment we most want the AI to prioritise. That **trade-off is business's to settle.** [comment #13] Policy is business-owned & revisable; each use-case instrumented separately.

### 6. The lead's journey — retries, waiting, and when we stop

§4 is the clean path. This is what happens when a call doesn't connect, when a lead waits, and when we stop working it.

**Two different signals from two places.** Whether the call connected (busy / no answer / switched off / bad number) comes from the **telephony provider**; how the conversation went (Hot/Warm/Cold, callback, do-not-call) comes from the **AI**, only for connected calls. So **retries are our decision, driven by the telephony outcome — a retry threshold decides when we stop.**

**Retries.** Single retry rule, one gap; values are config (settings table), not fixed in code. Signal → action:

| Signal — from | What we heard | Next state | When it comes back |
|---|---|---|---|
| Telephony webhook | Busy / no answer / switched off | Hold | after the retry gap |
| Telephony webhook | Temporary network / carrier error | Hold | after the retry gap |
| Telephony webhook | Connected but dropped under the minimum duration (no real conversation) | Hold | after a short retry gap |
| Telephony webhook | Invalid / wrong number | Closed | no retry — flag for cleanup |
| Human agent | Schedules a callback at a customer-named time | Scheduled | at the named time |
| AI (post-call read) | Customer asked to be called back later | Scheduled | at the requested time |
| AI (post-call read) | Do-not-call | Closed | never |

Full outcome codes from the provider's hangup-cause list, mapped in config; operating SOP is a business dependency, not in the PRD.

**Waiting.** System schedules the next **retry** (not-connected), an agent **schedules** a named-time callback, or the customer asks the AI to call back later — one idea, "come back at time T", each carrying who resumes it. (The old manual **Hold** button for re-queuing is retired — retries are system-enforced; see the manual-flow note.) Named-time callback defaults to the **same agent** [comment #16] else the queue — an Ops setting.

**When we stop.** A lead is **closed** at its **retry threshold** (~3 attempts, business to finalise, within TRAI/DND), a terminal outcome, or timeout; then it leaves every queue. System-enforced (no human watching AI attempts).

**"Don't call me."** DNC captured on **any** of our calls — the AI's or a human agent's (incl. leads the AI never touched) — permanently stops all calling this build controls (AI + all our human agents). Two capture paths: (1) **AI call** — Ring returns the opt-out on its post-call read (not ~~mid-call~~ [comment #19] — see §9); (2) **human call** — agent adds it via a one-click CTA on the lead. Applied from the next call onward. Cross-portal (HA etc.) needs a shared list — open dependency (§9).

**Not over-calling (frequency cap).** Separate from retries: cap on **connected** calls to a customer (AI + human) in a rolling window; once hit, no call goes out however many triggers re-queue the lead. Note: AI + human callback = at least **two** connected calls where manual made one, so a cap of 3 is two-thirds spent on one Hot lead — the case for live transfer.

**Controls Ops holds:** Throttle (global + per use-case) · Kill switch (global + per use-case) · the settings — proposed by Product, set with business, within regulatory limits, never hardcoded.

**Where these settings live.** Backend config values (not hardcoded), changeable without a deploy; end state a self-serve tool; Product proposes / business sets, within TRAI/DND. Frequency cap enforceable only our side. A config-layer build, not a free toggle.

**Settings, in one place:** Eligibility (patient+address) · Dial-order (FTC>NFTC) · Retry gap (~30 min std; ~1–2 min short-drop) · Retry threshold (~3, not-connected cap; counts every attempt equally) · **Minimum connect duration (~15–20 s → short retry, not counted/​sent to Ring)** · Frequency cap (~3/wk connected) · Calling window (09:00–21:00) · Hot hold-time (~24–48 h) · Callback routing (same agent else queue) · Throttle · Kill-switch. All starting values, business to finalise.

**How this touches the manual flow:** Hold button retired (frontend change) · **Call button backend-gated** (enabled only within cap / not DNC / not closed) · manual telephony stays its own two-leg SIP setup, not migrated — only **leg 2 (customer) connecting** counts, **leg 1 (agent) failure** handled in the manual flow.

**Lead states & dispositions** (captured our side; every dial counted): Eligible → Assigned-AI / Assigned-agent → Dialled-attempt-N → Awaiting-retry / Scheduled / **Outcome-unknown-parked** (waiting) → Hot/Warm/Cold (verdict) → terminal: **Order placed · Do-not-call · Invalid number · No order · Closed-retries-exhausted**.

### 7. User stories

**The customer.** *"I left some medicines in my cart and got one helpful call. Because I was interested, a person called me back quickly and already knew what I needed — so it was fast. When I'm not interested, I'm not chased again and again."*

**The ACOM agent.** *"The leads I get are already qualified and come with context — the customer's objection and a short call summary — so I spend my time closing orders, not dialing numbers that never pick up. When a call doesn't convert, I log the reason, and that makes the next round of qualification sharper."*

**Ops / team lead.** *"I can control how many customers the AI works at once, see how it's performing, and switch it off in a single move if anything looks wrong — all without disturbing my human team's normal flow."*

### 8. Scope — in and out

**In scope**

- AI qualification calls, starting with dropped carts as the first use case.
- We own the whole call through our telephony provider — dialling, retries, calling-window, and the rules for when to stop and close a lead.
- Configurable eligibility and dial-order — which leads the AI works, and in what order (§5).
- The ~~recording → verdict~~ verdict loop with the vendor — it records the conversation on its own side and returns Hot / Warm / Cold; we don't send it a recording (see §13).
- Priority callback routing of Hot/Warm to human agents, with AI context on screen and agent disposition captured.
- The waiting model (hold / schedule) and do-not-call suppression across every channel.
- Throttle and an instant kill-switch.
- Retaining, our side, the **call recording (from the telephony provider) + the event log** — for audit/RCA; not sent to the vendor.

**Out of scope (deliberately)**

- The AI placing or editing orders, applying coupons, searching for products, or collecting missing details like an address — humans place the order.
- Changing how the manual queue prioritises leads — its existing score stays as it is (§5).
- Live transfer of the call to an agent mid-conversation (see the future-state note).
- **Vendor-agnostic by design (in scope):** vendor behind a generic role; standard mapping contracts (lead+cart out, any bot's intent → our Hot/Warm/Cold); telephony adapter boundary; we own number/data/uuid → swap is a re-integration, not a rebuild.
- A full plug-and-play multi-vendor **platform** [comment #23: build to accommodate future vendor change] — new vendor as config + thin adapter — is out of scope for now; §9 effort-gates whether to build the full layer now or as a fast-follow.
- A self-serve campaign-builder tool for Ops.
- Handling a mid-call request to reach the patient on a different number than the one we dialled — out of scope for now.
- The bot giving medical advice, validating prescriptions, or deciding substitutions — these stay with the existing doctor/pharmacist post-order flow. A customer saying "don't call me" is treated as a do-not-call — stopped in this flow (the AI and all our human calling) at once, and extended to the other calling portals (HA and the rest) via a shared do-not-call list where one exists (see §9).

### 9. What's decided vs what's still open

**Decided — these are firm**

- No personal data (phone number, address) is sent to the vendor; Truemeds owns the number and the call.
- Truemeds owns the full call lifecycle — dialling, retries, calling hours — and can stop everything instantly.
- Retries on not-connected calls are system-enforced — count attempts from telephony, stop at the **retry threshold**, close the lead. ("never sees a call" [comment #24] struck.)
- A customer is worked by one channel at a time; the AI and a human never call the same customer at once.
- A closed lead never re-enters any queue.
- A do-not-call is permanent — it stops the AI and human callbacks for good; extending it across the other portals depends on a shared suppression list (open).
- One waiting model underneath hold and schedule, with each lead tagged for who resumes it (AI or human).
- Truemeds data is the source of truth; the live cart is re-checked before an agent acts.
- We don't change the manual queue's prioritisation score; the AI's own eligibility and dial-order are configurable. Qualified Hot/Warm are served ahead of that queue as a tier.
- Each interaction carries our own reference ID, not the order number, so the platform extends to other use cases.
- Recordings are retained on the Truemeds side.

**Still open — need a confirmed answer before build** *(owner in brackets)*

- **Who targets FTC, and how strict is the AI's eligibility?** *(may override the working default in §5)* Should the AI prioritise FTC, or should FTC stay with manual agents while the AI takes NFTC? And should the AI qualify only leads that already have patient + address — a strict gate that excludes most FTC? Options: keep the gate · relax it for FTC (name-only, a human collects the address later) · drop it for future use cases with only mobile + name. **[Business]** [comment #25 anchor "Business": diff configs per use-case; #27, #28]
- Where AI Hot/Warm [comment #26] leads sit relative to the manual queue — now explicit in §5 (Hot FTC > Hot NFTC > Warm FTC > Warm NFTC > manual queue > Cold); business to confirm final order. **[Business]**
- Starting values [comment #27] — retry gap, threshold, frequency caps, calling window, hot hold-time — listed with suggested values in the §6 settings table; business to finalise. **[Business]**
- ~~Can Ring's live voice be bridged onto a Knowlarity call?~~ **Resolved (Ring, 11 Sep):** yes — Knowlarity connects to the vendor over a WebSocket carrying our ref id (§13). **[Ring + Knowlarity]**
- ~~What starts the AI talking?~~ **Resolved (Ring, 11 Sep):** a "customer answered" event (vendor connected before pickup). **[Ring + Knowlarity]**
- ~~How do we get the recording to Ring?~~ **Resolved (Ring, 11 Sep):** we don't — vendor records its own copy; we keep ours from telephony (§13). **[Ring]**
- How quickly, and how reliably, does the verdict come back? Ring indicated ~within a minute; **to be confirmed with Ring in writing and closed during this integration, before go-live** [comment #32]. **[Ring]**
- Which languages does the conversation handle well — Hindi, Hinglish, English? **[Ring]**
- How do we handle personal details a customer may speak aloud in the recording — consent and any masking? **And:** the "customer answered" event carries the customer number today — strip it so only ref id + workspace id reach the vendor (security-tested our side; §13). **[Legal/Compliance + Ring + Knowlarity]**
- **Do-not-call reach.** Is there a shared do-not-call / suppression list that every calling portal honours? Without it, this build can only guarantee its own two channels. **[Engineering + Business + Ring]**
- Which customers form the first segment, and at what volume do we start? **[Business]**
- What set of intent labels does Ring return, and how do they map to Hot / Warm / Cold — and can it also return **do-not-call as an explicit label** (auto-capture vs inferred)? **[Ring + Engineering]**
- If the person who answers isn't the patient, can the vendor pivot to the account holder? We send both names — confirm. **[Ring + Business]**
- **How far do we build the vendor layer now?** Commit to vendor-agnostic design (§8); the *full* plug-and-play platform (new vendor = config + thin adapter) is an effort call — Engg to size, do it now if delta is small, else fast-follow. **[Engineering + Product]**

### 10. How we'll know it worked

- **Reach** — the share of eligible customers we actually call (target: well above today's ~60%).
- **Connect rate** [comment #29] — calls that reach a live customer (watch metric, may drop vs manual).
- **Qualification quality** [comment #30] — order-conversion by verdict; validate early by calling across all verdicts (Hot/Warm/Cold), confirm Hot>Warm>Cold before it drives routing.
- **The number that matters most** — conversion once a human takes over: an order placed within ~24 hours of hand-off, for AI-qualified leads vs today's manual baseline. Read as a guide, not a lab result.
- **Human productivity** — orders placed per agent-hour versus today.
- **Safety gate (hard):** zero cases of a customer called by the AI and a human at the same time; recordings reliably retained; complaints and opt-outs watched.
- **Cost per order**, once commercials with the vendor are finalised.

### 11. Annexure — suggestions to business

**1. Turn lead prioritisation into an analytics problem.** Today's priority score is built for carts. For a new drop-off with no cart, the useful signals are behavioural — app opens, product views, repeat visits, recency. Building a score for those is an analytics exercise; validate in the background against real conversions before it drives who gets called. Separately, one caution on the existing score: whenever Ops changes weights to favour a segment, watch — by cohort and by hour — that another segment isn't quietly getting no calls. A guaranteed minimum share per segment is the simplest guard.

**2. Build confidence in the AI's classification before it drives routing.** Rather than acting on Hot/Warm/Cold from day one, run the AI's calls while continuing today's checks regardless of its verdict, and compare against what actually converted. Once reliable on our own customers, let it drive prioritisation.

---

### 12. Edge cases

*Curated, not exhaustive.*

**1. Telephony webhook missing / late / wrong.** Much of §6 keys off the Knowlarity webhook; it's sometimes delayed/dropped/unreliable.
- **Hold, don't re-dial:** no webhook by timeout → mark **outcome unknown**, hold in place, no retry (customer may have declined / said don't call).
- **Order placed → close** (our-side data is the trusted signal).
- **Late webhook resolves it** — then act normally (~~send to Ring~~ take the vendor's verdict, apply outcome); if already closed, idempotent (enrich only, no re-open/re-dial).
- **Retain the unknown** even after it resolves: log every disposition change (status-history) so we keep that it *was* unknown & for how long — analytics/reliability. (Product owns requirement; Engg the mechanism; timeout is Engg-level.)
- **Forensics, not a fix:** our recording + event log (§4/§8) let us reconstruct/reconcile after the fact, but don't fix Knowlarity delivering signals reliably — a missing/late webhook is still missing; the real lever is a provider SLA + reconciliation.
- **Watch** the outcome-unknown rate → go-live reliability risk — chiefly **Knowlarity event/webhook reliability**, not only verdict latency (ties §9).

**2. Cart changes while a lead is already in the system.** *In flight = any non-terminal disposition; leaves it only at terminal.*
- **One customer, one in-flight lead:** a cart change/trigger attaches to the existing lead — no 2nd lead. New lead only once current is terminal, and only if it doesn't breach the frequency cap.
- **Between calls (held/awaiting-retry/scheduled):** change updates the lead; **live cart re-read** on re-entry; order always placed against live cart.
- **During a live call:** AI works off a call-start snapshot (mid-call change not reflected live). **Accepted, not blocking** — snapshot is only for the conversation; human places order against live cart. Guards: Ring handles "I changed my cart" (item-level on-ask only); agent screen shows live cart real-time. We do **not** freeze the cart.

### 13. Vendor integration — running MoM

*Living record of vendor call-architecture decisions. Ring — 11 Sep 2026 (telephony specifics pending Knowlarity):*
- **Chosen path:** Ring pre-loads leads (ref id + custom vars + workspace id, no PII); Knowlarity dials + opens a WebSocket to Ring (ref id); Ring warms up, speaks on a "customer answered" event; records its own copy; returns Hot/Warm/Cold by webhook on ref id.
- **Why WebSocket:** Knowlarity has no SIP + audio is a live 2-way stream; Ring already runs this WS path with Knowlarity in prod (inbound). Low-risk.
- **Alt set aside — Truemeds owns the bridge:** possible but discouraged (two WS open per call, relay at Ring's tuned packet size, cost + failure point). Parked → §9 "how far do we build the vendor layer".
- **No true platform-agnosticism:** a telephony swap always needs custom dev both sides → re-integration, not rebuild (§8).
- **PII on "answered" event:** strip customer number; pass only ref id + workspace id (+ optional agent id). Security-test our side.
- **Recording & events, our side:** store recording (from telephony) + event log for audit/RCA; not sent to Ring. Forensics — not a reliability fix (§12).
- **Commercials:** connected calls only; no before/after-pickup difference; telephony swap = one-time integration cost.
- **Dev split:** Knowlarity = pass ref id over WS + PII-masked "answered" event. Truemeds = trigger the Knowlarity call, own retries (Ring does none), store recording+events; drop the old "Ring webhook → phone number" flow (Ring's verdict webhook stays).
- **Pending:** confirm telephony specifics w/ Knowlarity; confirm verdict latency w/ Ring in writing.
- Original assumed flow kept in the live doc's §13.

### Future state (later, not this build): live transfer

Today an interested customer gets a fast callback (verdict lands minutes after the call). A natural later step is **live transfer** — AI hands the call straight to a live agent. Beyond conversion it **halves the calls** a customer gets (protects the frequency cap), so worth prioritising sooner. Needs both sides: Ring live intent (mid-call) + our telephony/transfer build. Future step, not a blocker.

---

## PART C — Replies captured

| comment id | anchor | reply author | reply body |
|---|---|---|---|
| 2023292958 | "250" | Abhishek Rao | *(confirmed current cost per order, all-inclusive)* |
| 2022735881 (#9) | "Today" | us | Explicit selection & dial-order logic → Engg companion spec; PRD keeps configurable rule (FTC-first today); config home §6. |
| 2024210433 (#11) | "configuration" | us | Softened to "configuration change, not a ground-up rebuild"; config layer is an Engg build (§6); non-exhaustive use-case list added. |
| 2023555076 (#17) | "Ops setting" | us | No "Ops setting" system today — that's why it read unclear. §6 "Where these settings live": backend config, no deploy; end state self-serve tool; Product proposes, business sets, within regulatory limits. |
| 2023948292 (#20) | "Ops setting." | us | Yes, built our side. Frequency cap only enforceable by us; bounded by TRAI/DND. |
| 2023620614 (#22) | "Ops" | us | Dropped blanket "Ops" → proposed by Product, set with business (or a team lead), within regulatory limits, never hardcoded. |

| 2022735889 (#14) | "fixed" | us | Consolidated settings table (10 knobs, scope + starting value + owner); values seeded, business to finalise. |
| 2023227396 (#15) | "outcome" | us | Retry buckets → signal→action table (single retry rule); outcome codes from provider hangup-cause list; SOP is a business dependency, not in PRD. |
| 2023653387 (#18) | "retry" | us | Threshold named ~3 attempts (within TRAI/DND), business to finalise; in settings table. No TRAI-mandated cap — our own policy number. |
| 2024013826 (#21) | "Kill switch" | us | Kill-switch + throttle now global + per use-case/campaign (e.g. halt just FTC), plus a global master stop. |

| 2022637585 (#10) | "ahead" | us | Priority order explicit in §5/§3: Hot FTC > Hot NFTC > Warm FTC > Warm NFTC > manual queue > Cold (lowest, callable). Only DNC + invalid excluded. |
| 2022604820 (#13) | "trade-off…" | us | §5: policy business-owned & revisable; each use-case instrumented separately. |
| 2023620622 (#25) | "Business" | us | Per-use-case configs already in place (eligibility/dial-order/throttle/kill-switch scoped per use-case; generic uuid). FTC-targeting call is business to close. |
| 2023915532 (#26) | "Hot/Warm" | us | Adopted intent-tier-first: Hot FTC > Hot NFTC > Warm FTC > Warm NFTC > manual queue > Cold; explicit in §5; business to confirm. |
| 2022768645 (#27) | "Business" | us | Settings + suggested starting values now in §6 table; bullet trimmed to point there; business to finalise before go-live. |
| 2022703112 (#28) | "Business" | us | Suggested first segment: dropped-cart, patient+address, FTC-first; business to take final call and close before go-live. |

| 2023751683 (#5) | "minutes" | us | Live transfer impossible today — verdict is post-call; needs Ring real-time intent event via Knowlarity; else a blind transfer needing no AI. Both-sides build; future-state. |
| 2022637577 (#7) | "set aside" | us | Every lead carries a disposition captured our side; §6 states table (working/waiting/verdict/terminal); every dial counted. |
| 2023358478 (#24) | "never sees a call" | us | Retries system-enforced (count attempts, stop at threshold, close). Manual Hold retired → frontend change (in-scope). |
| 2023227404 (#29) | "Connect rate" | us | Watch metric, may drop vs manual; tracked so any drop is visible. |
| 2023096338 (#30) | "Qualification quality" | us | §10 defined: conversion by verdict; validate across all verdicts early, confirm Hot>Warm>Cold before it drives routing. |
| 2024210441 (#31) | "know" | us | Impact metrics Analytics-owned (§2 Expected impact); Dinesh & Analytics to size. |
| 2023260197 (#12) | "most" | us | Analytics number — share of FTC lacking patient+address; Dinesh to quantify. |

| 2023358470 (#8) | "holds the lead" | us | §12 edge case #2: "in flight"=non-terminal; one in-flight lead (change attaches, no 2nd lead); live-cart re-read between calls; live-call snapshot accepted-not-blocking; new lead only when terminal AND within frequency cap. |
| 2023161875 (#16) | "same agent" | us | Human-agent routing rule, not AI judgment — for the AI there's nothing to differentiate (any instance is identical). Human leg gets continuity with the promised agent where possible; falls back to general queue; configurable. Accepted okay-for-now. *(Apurva to edit the live reply.)* |
| 2023424004 (#19) | "mid-call." | us | Reworked in §6. Two ways onto the do-not-call list: (1) AI call — Ring returns the opt-out on its post-call read; (2) human call — agent one-click CTA on the lead. Applied from next call onward. Dropped the "mid-call" framing; open ask to Ring now in §9 — can the bot return do-not-call as an explicit state alongside Hot/Warm/Cold, so capture is automatic. *(Apurva edited the live reply.)* |
| 2023325712 (#23) | "platform" | us | §8 now commits **vendor-agnostic by design** (generic role + standard mapping contracts for lead-out and intent-in + telephony adapter; we own number/data/uuid → swap = re-integration, not rebuild). Full plug-and-play platform is out-of-scope for now; §9 effort-gates building the full layer now vs fast-follow (Engg to size). |

| 2025455619 (#36) | "Interested customers" | us | Both — §3 states Hot AND Warm to a human, Cold lowest; full order §5. |
| 2023915524 (#6) | "verdict turnaround…" | us | Simplified to plain wording; §9 open question with Ring. |
| 2022998028 (#32) | "later" | us | Live transfer future-state (post-call verdict); latency not deferred — confirm with Ring in writing, close during integration before go-live (§9 tightened). |

*Reply comment IDs — Batch 1: #9 2026242051 · #11 2026078210 · #17 2026078217 · #20 2026274820 · #22 2026536961. Batch 2: #14 2026438658 · #15 2026831873 · #18 2026897409 · #21 2026733570. Batch 3: #10 2025914371 · #13 2026176514 · #25 2026602499 · #26 2025881603 · #27 2026307586 · #28 2026012675. Batch 4: #5 2026274832 · #7 2027028485 · #24 2026405895 · #29 2025881627 · #30 2026209294 · #31 2026602528 · #12 2026307608. Batch 5: #36 2029453317 · #6 2029846532 · #32 2030469122. Singles: #8 2030174218 · #16 2029813764 · #19 2029977604 · #23 2029617161.*

*#34, #35 — left open for business to answer (not ours). New Reviewer-B comments (10 Sep) answered: 2028240908 → reply 2033418242; 2028273668 → reply 2033319960.*
