# AI-led Lead Qualification — Product Requirements

**Author:** Apurva Shetty (Product) · **Status:** Draft v1, for review · **Owner team:** ACOM

---

## 1. TL;DR

Today we recover dropped carts by having agents cold-call every eligible customer — it's slow and expensive, and even among the customers who already have a delivery address and patient details on file, we reach only about six in ten most months; the wider pool of dropped carts is larger still. We're adding an AI voice agent — from a voice-AI vendor (Ring AI) — that calls customers first, has a real conversation about their pending cart, and tells us who's genuinely interested. Human agents then spend their time only on the warm, ready-to-buy customers. Truemeds places the call and keeps all customer data on its own side; the vendor only holds the conversation and reads intent — it never becomes the caller. We start with dropped carts, but the design works for any customer segment we later want to re-engage.

## 2. The problem

The ACOM team manually calls every eligible dropped cart. Three facts describe why that's not enough:

- **Reach.** Even among the customers who already have a delivery address and patient details on file — roughly 17,000 a month — only about 10,000 get called, so nearly 40% of even this ready-to-serve pool is never reached. The wider pool of dropped carts is larger still. That's recoverable revenue we simply can't get to.
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

One customer, start to finish:

1. **Pick.** We select an eligible customer and give this interaction our own reference ID.
2. **Send context to the vendor** — the cart details and that ID. No phone number.
3. **The vendor prepares the conversation** and hands back a live voice stream for this one call. *[Assumption — that the vendor can hand back a voice stream and we can bridge it onto our call this way is not yet confirmed; it's the first open question in §7.]*
4. **We place the call through our telephony provider**, connecting the customer to the vendor's voice. We run the whole call — dialing, waiting for pickup, retrying if they don't answer, staying inside allowed calling hours.
5. **The conversation happens.** The AI hears the customer out, handles their hesitation, and gauges interest.
6. **The call ends** and our telephony provider gives us the recording.
7. **We send the recording to the vendor**, which analyses it and returns the verdict — Hot / Warm / Cold — within minutes, ideally with the customer's objection and a short summary. *[Assumption — the verdict turnaround and its reliability are not yet confirmed; see §7.]*
8. **Hot and Warm go to a human agent** as a priority callback, with the AI's context already on screen. The agent re-checks the live cart and places the order.
9. **Cold, no-answer, wrong-number, and do-not-call** are set aside per rules — not blindly re-dialed.

```
   Pick eligible customer  →  send cart + our ID to the AI vendor  (no phone number)
                                        │
                                        ▼
              The AI vendor returns a live voice stream for the call
                                        │
                                        ▼
  We dial via our telephony provider ──► customer picks up ──► AI conversation
        (we own dialing, retries, calling hours, and can stop anytime)
                                        │
                                 call ends → recording
                                        │
                                        ▼
             Send recording to the AI vendor  →  verdict in minutes
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              ▼                         ▼                          ▼
         HOT / WARM                  COLD                 no-answer / wrong number /
   priority callback by a         set aside              do-not-call → set aside,
   human (with AI context;        (not re-chased)        honoured everywhere
   re-checks live cart)
```

Throughout: the customer is "held" by the AI while it's working them, so no human calls in parallel; we can turn the volume up or down and stop everything in one move; and the existing manual calling flow keeps running underneath as the fallback.

## 5. User stories

**The customer.** *"I left some medicines in my cart and got one helpful call. Because I was interested, a person called me back quickly and already knew what I needed — so it was fast. When I'm not interested, I'm not chased again and again."*

**The ACOM agent.** *"The leads I get are already qualified and come with context — the customer's objection and a short call summary — so I spend my time closing orders, not dialing numbers that never pick up. When a call doesn't convert, I log the reason, and that makes the next round of qualification sharper."*

**Ops / team lead.** *"I can control how many customers the AI works at once, see how it's performing, and switch it off in a single move if anything looks wrong — all without disturbing my human team's normal flow."*

## 6. Scope — in and out

**In scope**
- AI qualification calls, starting with dropped carts as the first use case.
- Truemeds-owned calling through our telephony provider, including retries and calling-window control.
- The recording → verdict loop with the voice-AI vendor, returning Hot / Warm / Cold (plus objection and summary where available).
- Priority callback routing of Hot/Warm to human agents, with AI context on screen and agent disposition captured.
- Volume control and an instant kill-switch.
- Retaining call recordings on the Truemeds side.

**Out of scope (deliberately)**
- The AI placing or editing orders, applying coupons, or searching for products — humans place the order.
- Live transfer of the call to an agent mid-conversation (see the future-state note).
- A multi-vendor platform — we run a single voice-AI vendor for now.
- A self-serve campaign-builder tool for Ops.
- The bot giving medical advice, validating prescriptions, or deciding substitutions — these stay with the existing doctor/pharmacist post-order flow. A customer saying "don't call me" is treated as a do-not-call and honoured across every calling channel — not just this flow, but the other agent portals too (HA and the rest).

## 7. What's decided vs what's still open

**Decided — these are firm**
- No personal data (phone number, address) is sent to the voice-AI vendor; Truemeds owns the number and the call.
- Truemeds owns the full call lifecycle — dialing, retries, calling hours — and can stop everything instantly.
- A customer is worked by one channel at a time; the AI and a human never call the same customer at once.
- Truemeds data is the source of truth; the live cart is re-checked before an agent acts.
- Each interaction carries our own reference ID, not the order number, so the platform extends to other use cases.
- Recordings are retained on the Truemeds side.

**Still open — need a confirmed answer before build** *(owner in brackets)*
- Can Ring's live voice be bridged onto a Knowlarity call the way described in §4? **[Ring + Knowlarity]**
- What starts the AI talking — a "customer answered" signal from Knowlarity, or the AI simply waiting for the customer to speak first? **[Ring + Knowlarity]**
- How exactly do we get the recording to Ring — over the same channel we send the lead on, or a separate one? **[Ring]**
- How quickly, and how reliably, does the verdict come back? ("Within minutes" is the target.) **[Ring]**
- Which languages does the conversation handle well — Hindi, Hinglish, English? **[Ring]**
- How do we handle personal details a customer may speak aloud in the recording — consent and any masking? **[Legal/Compliance + Ring]**
- Which customers form the first pilot segment, and at what volume do we start? **[Ops]**
- What set of intent labels does Ring return, and how do they map to Hot / Warm / Cold? **[Ring + Product]**

## 8. How we'll know it worked

The few numbers that matter:

- **Reach** — the share of eligible customers we actually call (target: well above today's ~60%).
- **Connect rate** — calls that reach a live customer.
- **Qualification quality** — how well Hot and Warm predict a real order; we expect Hot to beat Warm.
- **The number that matters most** — conversion once a human takes over: an order placed within ~24 hours of hand-off, for AI-qualified leads compared with today's manual baseline. Read as a guide, not a lab result — the AI works a chosen slice of customers, not a random sample.
- **Human productivity** — orders placed per agent-hour versus today.
- **Safety gate (hard):** zero cases of a customer called by the AI and a human at the same time; recordings reliably retained; complaints and opt-outs watched.
- **Cost per order**, once commercials with the vendor are finalised.

---

### Future state (later, not this build): live transfer

Today an interested customer gets a fast callback, because the verdict lands a few minutes after the call ends. A natural later step is **live transfer** — the AI hands the call straight to an available agent while the customer is still on the line, converting them in the moment. It needs two things this build doesn't have: the AI judging interest *during* the call rather than afterward from the recording, and a human free at that exact second. So it's a deliberate future step, noted here only so today's choices don't rule it out.
