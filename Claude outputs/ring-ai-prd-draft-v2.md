# AI-led Lead Qualification — Product Requirements

**Author:** Apurva Shetty (Product) · **Status:** Draft v2, for review · **Owner team:** ACOM

---

## 1. Executive summary

Today we recover dropped carts by having agents cold-call every eligible customer — it's slow and expensive, and even among the customers who already have a delivery address and patient details on file, we reach only about six in ten most months; the wider pool of dropped carts is larger still. We're adding an AI voice agent — from a voice-AI vendor (Ring AI) — that calls customers first, has a real conversation about their pending cart, and tells us who's genuinely interested. Human agents then spend their time only on the high-intent, ready-to-buy customers. Truemeds places the call and keeps all customer data on its own side; the vendor only holds the conversation and reads intent — it never becomes the caller. We start with dropped carts, but the design works for any customer segment we later want to re-engage.

## 2. The problem

The ACOM team manually calls every eligible dropped cart. Three facts describe why that's not enough:

- **Reach.** Today's queue only works higher-value carts — above ₹900 — from customers who already have a delivery address and patient details on file. Even within that pool of roughly 17,000 a month, only about 10,000 get called, so nearly 40% of even this ready-to-serve pool is never reached. The wider pool of dropped carts — lower-value carts, and customers without an address or patient on file — is larger still. That's recoverable revenue we simply can't get to.
- **Conversion.** Around 5% of the leads we do call end up placing an order.
- **Cost.** About ₹250 per placed order, with a large agent team spending most of its hours on customers who were never going to buy.

A proof-of-concept with the voice-AI vendor on ~1,300 real leads converted about 20% of the customers it qualified and passed on — roughly 4× the human-only rate — and an AI can call far more customers in parallel than a human team can. So the prize sits on both sides of the ledger: reach many more customers, and spend agent time only where it pays off.

*(Baseline figures are from the business-run POC, taken as our working truth pending Product/Analytics vetting.)*

## 3. What we're building

An AI voice agent calls the customer, talks through their pending cart, and afterwards gives us a clear read on how interested they are — **Hot, Warm, or Cold.** Interested customers are handed to a human agent who calls back and places the order. Everyone else is set aside, not chased with repeat calls.

Four choices shape the whole thing, and each is deliberate:

- **We own the call and the customer's data.** Truemeds places the call through its own telephony provider (Knowlarity) and keeps all personal data — phone number, address — on our side. The vendor never receives it. The vendor is the conversation and the judgment; it is not the caller.
- **Our data is the truth; what we send the AI is only a snapshot.** A cart can change between the call and the callback. Before an agent acts, we re-check the live cart — we never act on stale information.
- **One customer, one channel at a time.** A customer being worked by the AI is never also called by a human, and the reverse. No one gets two calls at once.
- **Built to extend beyond carts.** We tag each interaction with our own reference, not the order number — so the same system can later qualify other customers (uploaded a prescription but didn't order, signed up but never browsed, and so on) without a rebuild.

## 4. How it works

One customer, on the path where everything goes cleanly — the branches (no-connect, retries, waiting, stopping) are in §6:

1. **Pick.** We select an eligible customer and give this interaction our own reference ID.
2. **Send context to the vendor** — the cart details and that ID. No phone number.
3. **The vendor prepares the conversation** and hands back a live voice stream for this one call. *[Assumption — that the vendor can hand back a voice stream and we can bridge it onto our call this way is not yet confirmed; it's the first open question in §9.]*
4. **We place the call through our telephony provider**, connecting the customer to the vendor's voice. We run the whole call — dialling, waiting for pickup, retrying if they don't answer, staying inside allowed calling hours. Not every call connects; what happens when it doesn't is in §6.
5. **The conversation happens.** The AI hears the customer out, handles their hesitation, and gauges interest.
6. **The call ends** and our telephony provider gives us the recording.
7. **We send the recording to the vendor**, which analyses it and returns the verdict — Hot / Warm / Cold — within minutes, ideally with the customer's objection and a short summary. *[Assumption — the verdict turnaround and its reliability are not yet confirmed; see §9.]*
8. **Hot and Warm go to a human agent** as a priority callback, with the AI's context already on screen. The agent re-checks the live cart and places the order.
9. **Cold, no-answer, wrong-number, and do-not-call** are set aside per the rules in §6 — not blindly re-dialled.

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

One customer is only ever on one channel at a time — the AI "holds" the lead while it's working it, so no human calls in parallel. The existing manual calling flow keeps running underneath throughout, independent of the AI. The controls (how much the AI works, how to stop it) and everything that happens off this clean path are in §6.

## 5. Which leads the AI works, and in what order

**Working default (open — see §9):** the AI works dropped-cart leads that have a **patient and address on file**, dialling **FTC customers first, then NFTC**. This is a starting assumption so engineering has something to build against; the choices below are open to business, and their answers may change this default.

Three things sit here, and keeping them apart is what stops this getting tangled:

- **Who's eligible — what a lead needs before the AI can call it.** Today: a **patient name** (so the AI can address the customer and hold the conversation) and an **address** (so the order can actually be completed). This is a **configurable set, not a fixed rule** — a later use case might need only a mobile number and a name. Note that *requiring* an address to exist is not the same as *sending* it to the vendor; the no-personal-data rule still holds. If someone other than the patient answers, the AI handles that on the call — confirming who it's speaking to is part of the conversation the vendor owns, not something we manage.
- **The order the AI dials — within its eligible pool.** Today: **FTC first, then NFTC.** FTC-first is an *ordering*, not an exclusion — the AI can call NFTC too. This order is also configurable.
- **What we don't touch — the manual queue's own prioritisation.** The score the "Assign Order" queue already uses to rank leads for agents stays exactly as it is; we don't change how it scores or orders anything. The AI works a *subset* of that pool; the human queue keeps running as it does. When the AI returns Hot/Warm, those leads are served **ahead** of that queue as a priority tier — the tier is new, the underlying score is untouched.

Because eligibility and dial-order are configurable, pointing this at a new drop-off later — registered-but-no-order, prescription-uploaded-but-no-order — is a **configuration change, not a rebuild.** It's the same reason each lead carries our own reference ID rather than the order number.

One tension worth naming up front (it's the open question in §9): a strict patient-and-address gate **excludes most FTC customers**, because they're the least likely to have those details on file yet — and FTC may be exactly the segment we most want the AI to prioritise. That trade-off is business's to settle.

## 6. The lead's journey — retries, waiting, and when we stop

§4 is the clean path. This is what happens when a call doesn't connect, when a lead waits, and when we stop working it.

**Whether a call connected, and how the conversation went, are two different signals from two different places.** Whether the call connected — and if not, why (busy, no answer, switched off, wrong or invalid number) — comes from the **telephony provider**. How the conversation went — Hot, Warm, Cold, a callback request, a do-not-call — comes from the **AI**, and only exists for calls that actually connected. The AI can't "hear" a call that never connected. So **retries and giving up are our decision, driven by the telephony outcome — not the AI's.**

**Retries.** When a call doesn't connect, we try again — how many times and how far apart are Ops settings, not fixed in code. The telephony outcome decides whether a retry even makes sense:
- a **temporary network issue** → worth a quick retry;
- **busy / no answer / switched off** → the person exists but isn't reachable now → retry later, with a bigger gap;
- a **bad or invalid number** → not worth retrying → flag it for data cleanup and stop.

**Waiting — one idea, not two.** A lead can be set aside to come back later for several reasons: an agent puts it on **hold**, an agent **schedules** a callback for a time the customer named, our system schedules the next **retry**, or the customer asked the AI to call **back later**. To the agent this is still the two familiar buttons — Hold and Schedule; underneath it's one thing: *"come back to this lead at time T."* Each waiting lead also carries **who resumes it** — the AI or a human (and which agent, for a personal callback) — so an AI-deferred lead goes back to the AI, and a human callback goes back to a person. For a callback the customer named a time for, the default is the **same agent** who promised it, falling back to the general queue if they're not free then — but whether callbacks return to the same agent or to the next available one is an Ops setting, not fixed in code.

**When we stop, and it doesn't come back.** A lead is **closed** when it hits its **retry threshold**, reaches a terminal outcome, or times out. A closed lead **leaves every queue**, so no agent sees it again. Because the AI reads nothing about a call it couldn't complete, enforcing this retry threshold is the **system's** job — there's no human eyeballing each AI lead the way there is on the manual queue.

**"Don't call me."** A customer asking not to be called — on the AI call or with an agent — is a **do-not-call**. Within this system it immediately and permanently stops both channels — the AI and human callbacks. The intent is wider: suppress the customer from *all* Truemeds outbound calling, including other portals like HA — but that relies on a **shared do-not-call list every portal honours**; where none exists yet, it's a dependency this build can't enforce on its own. And today we learn a do-not-call from the AI's read of the call *after* it ends, not mid-call. (Both flagged in §9.)

**Not over-calling anyone.** We cap how often any one customer is contacted — across the AI and human agents together — so no one is over-called, however many triggers they hit. The exact cap is an Ops setting.

**The controls Ops holds:**
- **Throttle** — how many customers the AI works at once, and the pace of new calls. It's the main rollout dial: start small, keep the AI within what agents can follow up on so qualified leads don't pile up and go stale, and control cost.
- **Kill switch** — one action stops all *new* AI calls at once; calls already in progress finish and report; the manual flow keeps running untouched; fully reversible.
- **The settings above** — retry counts and gaps, the retry threshold, calling-window hours, how often one customer can be called, how long a qualified lead stays "hot", and whether a scheduled callback returns to the same agent or the next available one — are Ops settings, set and tuned with Ops, not fixed in code.

## 7. User stories

**The customer.** *"I left some medicines in my cart and got one helpful call. Because I was interested, a person called me back quickly and already knew what I needed — so it was fast. When I'm not interested, I'm not chased again and again."*

**The ACOM agent.** *"The leads I get are already qualified and come with context — the customer's objection and a short call summary — so I spend my time closing orders, not dialing numbers that never pick up. When a call doesn't convert, I log the reason, and that makes the next round of qualification sharper."*

**Ops / team lead.** *"I can control how many customers the AI works at once, see how it's performing, and switch it off in a single move if anything looks wrong — all without disturbing my human team's normal flow."*

## 8. Scope — in and out

**In scope**
- AI qualification calls, starting with dropped carts as the first use case.
- **We own the whole call through our telephony provider** — dialling, retries, calling-window, and the rules for when to stop and close a lead.
- **Configurable eligibility and dial-order** — which leads the AI works, and in what order (§5).
- The **recording → verdict loop** with the vendor, returning Hot / Warm / Cold (plus objection and summary where available).
- **Priority callback** routing of Hot/Warm to human agents, with AI context on screen and agent disposition captured.
- The **waiting model** (hold / schedule) and **do-not-call** suppression across every channel.
- **Throttle** and an instant **kill-switch**.
- Retaining call recordings on the Truemeds side.

**Out of scope (deliberately)**
- The AI placing or editing orders, applying coupons, searching for products, or collecting missing details like an address — humans place the order.
- **Changing how the manual queue prioritises leads** — its existing score stays as it is (§5).
- Live transfer of the call to an agent mid-conversation (see the future-state note).
- A multi-vendor platform — we run a single voice-AI vendor for now.
- A self-serve campaign-builder tool for Ops.
- The bot giving medical advice, validating prescriptions, or deciding substitutions — these stay with the existing doctor/pharmacist post-order flow. A customer saying "don't call me" is treated as a do-not-call — stopped in this flow (the AI and human callbacks) at once, and extended to the other calling portals (HA and the rest) via a shared do-not-call list where one exists (see §9).

## 9. What's decided vs what's still open

**Decided — these are firm**
- No personal data (phone number, address) is sent to the vendor; Truemeds owns the number and the call.
- Truemeds owns the full call lifecycle — dialling, retries, calling hours — and can stop everything instantly.
- **Retries and giving up are driven by the telephony outcome, not the AI** — the AI never sees a call that didn't connect.
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
- Where AI Hot/Warm leads sit relative to the manual queue — we assume they're worked **first**, and the existing prioritisation then runs as normal for everyone else; confirm. **[Business]**
- Starting values for business to set: retry counts and gaps (how often we redial and how far apart), the retry threshold (how many tries before we stop), per-customer frequency caps (how many calls one customer may get in a day or week, across the AI and humans), and the "hot" hold time (how long a qualified lead stays prioritised before it's treated as stale). **[Business]**
- Can Ring's live voice be bridged onto a Knowlarity call the way described in §4? **[Ring + Knowlarity]**
- What starts the AI talking — a "customer answered" signal from Knowlarity, or the AI simply waiting for the customer to speak first? **[Ring + Knowlarity]**
- How exactly do we get the recording to Ring — over the same channel we send the lead on, or a separate one? **[Ring]**
- How quickly, and how reliably, does the verdict come back? ("Within minutes" is the target.) **[Ring]**
- Which languages does the conversation handle well — Hindi, Hinglish, English? **[Ring]**
- How do we handle personal details a customer may speak aloud in the recording — consent and any masking? **[Legal/Compliance + Ring]**
- **Do-not-call reach.** Is there a shared do-not-call / suppression list that every calling portal (HA and the rest) honours, so a do-not-call captured here suppresses the customer across all Truemeds outbound calling? Without it, this build can only guarantee its own two channels (the AI and human callbacks). Also: Ring gives us a do-not-call from its *post-call* read, not mid-call. **[Engineering + Business + Ring]**
- Which customers form the first segment, and at what volume do we start? **[Business]**
- What set of intent labels does Ring return, and how do they map to Hot / Warm / Cold? **[Ring + Engineering]**

## 10. How we'll know it worked

The few numbers that matter:

- **Reach** — the share of eligible customers we actually call (target: well above today's ~60%).
- **Connect rate** — calls that reach a live customer.
- **Qualification quality** — how well Hot and Warm predict a real order; we expect Hot to beat Warm.
- **The number that matters most** — conversion once a human takes over: an order placed within ~24 hours of hand-off, for AI-qualified leads compared with today's manual baseline. Read as a guide, not a lab result — the AI works a chosen slice of customers, not a random sample.
- **Human productivity** — orders placed per agent-hour versus today.
- **Safety gate (hard):** zero cases of a customer called by the AI and a human at the same time; recordings reliably retained; complaints and opt-outs watched.
- **Cost per order**, once commercials with the vendor are finalised.

## 11. Annexure — suggestions to business

Not part of this build — recommendations for business to weigh.

**1. Turn lead prioritisation into an analytics problem.** Today's priority score is built for carts (order value, likelihood to connect and to convert). For a new drop-off that has *no* cart — someone who registered but never browsed, or viewed products but never added to cart — those signals don't exist; the useful ones are behavioural: app opens, product views, repeat visits, recency. Building a score for those is an analytics exercise — define the signals and weights per use case, and **validate them in the background** against real conversions before they drive who gets called. Separately, one caution on the *existing* score: whenever Ops changes its weights to favour a segment, keep an eye — **by cohort and by hour** — that another segment isn't quietly getting no calls at all. A guaranteed minimum share per segment is the simplest guard.

**2. Build confidence in the AI's classification before it drives routing.** Rather than acting on Hot / Warm / Cold from day one, run the AI's calls while continuing today's checks *regardless* of its verdict, and compare the verdict against what actually converted. Once the classification proves reliable on our own customers, let it drive prioritisation. It's cheap insurance against spending agent time on the strength of a label we haven't yet validated.

---

### Future state (later, not this build): live transfer

Today an interested customer gets a fast callback, because the verdict lands a few minutes after the call ends. A natural later step is **live transfer** — the AI hands the call straight to an available agent while the customer is still on the line, converting them in the moment. It needs two things this build doesn't have: the AI judging interest *during* the call rather than afterward from the recording, and a human free at that exact second. So it's a deliberate future step, noted here only so today's choices don't rule it out.
