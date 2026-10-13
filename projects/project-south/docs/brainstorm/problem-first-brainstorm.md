# Project South — Problem-First Brainstorm
**Date:** 2026-09-29 (narration Entry 5)
**Mode:** Brainstorm. Everything below is open-ended. Nothing here is a decision.

---

## 0. North star
> **Language barrier is leading to discard.**

**North star metric:** Dr-call orders discarded where a language barrier played a part → as close to zero as possible.

Every idea below is judged on one question: does it reduce discards caused by language barriers, without slowing down or losing other orders?

---

## 1. How a language mismatch turns into a discard

A single mismatched call rarely discards an order on its own. The discard builds up over several steps:

```
Order needs Dr call
 → Doctor assigned (language not considered)
 → Call placed, customer picks up
 → Mismatch noticed (by whom? how fast?)
 → What happens next?
     • doctor tries broken Hindi/English → poor consult → customer declines
     • doctor or customer hangs up
     • doctor marks "not reachable" / hold / cancel (reason lost)
 → Retry goes to another doctor chosen without regard to language → may mismatch again
 → Customer starts ignoring calls from unknown numbers (trust erodes)
 → Order ages → attempts run out / time limit hits
 → DISCARD
```

**Discard happens when these combine: a mismatch, a retry that repeats it, the customer losing interest, and time running out.** Every arrow above is a point where we could step in. Solving "match the language on the first call" is only one of those points.

---

## 2. What we don't know about the problem yet

**Size**
- What share of Dr-call discards involve a language barrier: 2%, 10%, 30%? It isn't recorded anywhere today.
- Does a mismatch cause the discard outright, or does it just contribute (added to no-pickups, price objections, etc.)?

**Who and where**
- Which languages? Which states and pincodes? Is it concentrated in a few, or spread thin?
- Is the mismatch with the *customer* or with the *patient*? An elderly parent may be the patient while the child placed the order.
- New customers vs repeat customers?

**How it plays out**
- Is it a *complete* barrier (no shared language) or a *partial* one (they can chat but not discuss medicine, dosage or symptoms)?
- What do doctors do today when it happens? Pass it to a colleague informally? Mark something? Just move on?
- Does the customer usually convert if the next call is in their language?
- Does time of day matter, e.g. regional-language doctors mostly on morning shifts?

**Scope**
- Does the same problem exist on **HA calls** (the follow-up health advisor calls)? If yes, fixing it for Doctor calls alone leaves half the problem.
- Does it affect CSR calls and inbound callbacks too?

---

## 3. Root causes (why the mismatch happens and why it isn't recovered)

| # | Root cause | Gap type |
|---|---|---|
| R1 | We don't know what language the customer speaks | Demand data gap |
| R2 | We don't reliably know which languages each doctor speaks | Supply data gap |
| R3 | Even if we knew both, assignment ignores language | Routing gap |
| R4 | Not enough doctors speak certain languages, or not at certain hours | Supply capacity gap |
| R5 | When a mismatch happens, there's no fast way to recover | Recovery gap |
| R6 | Recovery is slow, so the order runs out of time or attempts | Time gap |
| R7 | After one bad call, the customer stops picking up | Trust gap |
| R8 | Consultation happens only by voice call, which needs a shared spoken language | Channel gap |

---

## 4. How might we… (divergent ideas — quantity over quality)

### HMW-1: Know the customer's language before the call? (R1)
- Pincode or state → likely language (the original idea)
- App language setting / phone language setting
- Ask at checkout: "Preferred language for doctor call?" (one tap)
- **WhatsApp or SMS before the call:** "Our doctor will call you shortly. Which language do you prefer? 1-Hindi 2-Tamil 3-…"
- Reuse past interactions: language used with CSR, IVR choice, past doctor calls
- Language of the prescription the customer uploaded, or of their past chats and reviews
- Delivery address state
- Let CSR record it whenever the customer calls in
- Ask once and remember forever on the customer profile

### HMW-2: Know the doctor's languages reliably? (R2)
- Self-declaration at onboarding, plus a one-time backfill survey
- Learn from call outcomes: a doctor who succeeds in Tamil pincodes likely speaks Tamil
- Simple language check at onboarding
- Separate "can chat in" from "can consult in"

### HMW-3: Get the right doctor on the first call? (R3)
- Language pools by pincode (the original idea)
- Language as a *priority* rather than a hard pool: matched doctors see these orders first
- Time-limited preference: matched doctors get first claim, then anyone
- Multilingual doctors count towards every pool they speak
- Scheduled calls: book the call when a doctor who speaks the language is on shift

### HMW-4: Have enough doctors per language, at the right hours? (R4)
- Hire doctors in regional languages based on demand data
- Part-time or on-call regional doctors for peak hours
- Partner with regional telemedicine networks for overflow
- Extra incentive for shifts where a language is short of doctors
- Move regional-language demand to hours when those doctors are available

### HMW-5: Recover instantly when a mismatch happens? (R5)
- **"Hand over" button:** the doctor tags the language, and the order goes straight to a matched doctor who calls back within minutes
- The doctor tells the customer, in simple words, "A [Tamil]-speaking doctor will call you in 10 minutes" (a short scripted line per language)
- Ask the customer: "Is someone near you who speaks Hindi/English?" (a family member translates)
- **Conference in a colleague or HA** who speaks the language (a three-way call)
- Interpreter on demand for rare languages
- **AI live translation** (speech-to-speech) as a future option
- Short phrase-card per language for key questions (symptoms, allergies, dosage). Low-tech, but it helps with partial barriers.

### HMW-6: Stop the clock from killing a recoverable order? (R6)
- Language-barrier attempts don't count towards the customer's attempt limit
- Give language-tagged orders extra time before they escalate or discard
- Move tagged orders to the top of the queue for matched doctors
- Customer rank-up: "I'm available now, call me in Tamil"

### HMW-7: Keep the customer picking up after a bad call? (R7)
- WhatsApp in their language right after the failed call: "Sorry! Dr. Priya, who speaks Tamil, will call you at 11:30."
- Recognisable caller ID or pre-call message with the doctor's name and language
- The customer chooses the callback time slot

### HMW-8: Make the consultation not depend on a spoken language at all? (R8)
- **Pre-consult questionnaire** in the customer's language (WhatsApp form or in-app). The doctor reviews it in English, and a call happens only if needed.
- **Chat consultation with machine translation.** Text translation is far more reliable than speech translation today.
- Video call with on-screen translated captions
- More orders eligible for auto-confirm, so fewer need a call at all

---

## 5. Group the ideas by effort
| Effort | Ideas |
|---|---|
| **Fast, low-tech (weeks)** | Language-barrier tag, "hand over" to a matched doctor, don't count barrier attempts, WhatsApp in the customer's language after a failure, doctors self-declare languages, CSR records language |
| **Medium (a quarter)** | Pincode-based routing or priority, ask for language at checkout or via pre-call WhatsApp, customer language memory, scheduled calls in language shifts, supply dashboard by language |
| **Big bets** | Chat consultation with translation, pre-consult questionnaire, AI live translation, regional hiring or partner networks |

---

## 6. Hypotheses and cheap ways to test them

| # | Hypothesis | Cheapest test |
|---|---|---|
| H1 | Language barrier plays a part in a meaningful share of Dr-call discards | **Proxy from today's data:** compare discard rate by customer state (non-Hindi states vs Hindi states), using `order_details`, `order_status` (174 = ORDER DISCARD) and the customer address |
| H2 | Mismatched calls are *connected but very short* | If call duration data exists (call infra logs): share of connected calls under ~30–45 seconds followed by hold/discard, by customer state |
| H3 | Doctors already know it's happening | Quick doctor survey: "How often do you get a customer you can't understand? Which languages?" Plus 20–30 doctor call recordings |
| H4 | A matched second call recovers most of these orders | **Manual pilot for 2 weeks:** doctors message a WhatsApp group or tag the order, Ops manually reassigns to a matched doctor, and we track conversion. No build needed. |
| H5 | Customers will tell us their language if asked | Pre-call WhatsApp language question on a small cohort; measure the response rate |
| H6 | The problem sits in a few languages and states | Result of H1, split by state or pincode; compare with doctor supply by language |

**H1 and H4 need no engineering work.** H1 sizes the problem from data we already have, and H4 shows whether fixing the language actually brings the order back.

---

## 7. Stakeholder angles to keep exploring
- **Customer:** Did they feel respected or confused? Would they pick up again? Do they know a doctor call is coming at all?
- **Patient vs orderer:** The language needed may belong to the patient, not the person who placed the order.
- **Doctor:** A mismatched call wastes their time and hurts their productivity or incentives. Do they have a quick way to hand the order over?
- **Ops / Super Doctor:** Who owns recovery? How much manual work can they take on?
- **Business:** Recovered orders are revenue we lose today. What does a regional doctor cost compared with the discards they'd recover?

---

## 8. Questions for Swapnil (to steer the next round)
1. What made us think language barrier is behind discards: doctor complaints, customer feedback, call recordings, or data?
2. Do we have call-level data (duration, connected or not) we can query?
3. Should HA calls be in scope, or Doctor calls only?
4. Which directions feel most promising to go deeper on first: knowing the language (HMW-1), recovering fast (HMW-5), or the channel shift (HMW-8)?
