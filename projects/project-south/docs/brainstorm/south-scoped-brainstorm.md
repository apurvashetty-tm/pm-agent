# Project South — Scoped Brainstorm (South GTM)
**Date:** 2026-09-29 (narration Entry 6)
**Mode:** Brainstorm within the locked scope. Not a final solution.

---

## 1. Scope (locked by Swapnil)
| In scope | Future | Not in scope |
|---|---|---|
| Doctors with multiple languages (e.g. Tamil + English + Hindi) | Knowing the customer's own language | Removing voice dependence |
| Language routing, starting with South pincodes | "Hand over" / instant recovery | |
| Supply callout: doctor demand per language from pincode trends | | |

Time and attempt limits are **not** the blocker.

---

## 2. Sizing check
The arithmetic checks out:
- 24,484 × 4.46pp ≈ 1,091 confirmed
- 1,091 × 70.95% ≈ 774 delivered
- 774 ÷ 31 ≈ 25 delivered orders per day
- 774 ÷ 24,484 = 3.16pp (South FTC)
- 774 ÷ 80,323 = 0.96pp (South, all orders)

**Small note:** "OP → WH reached" (72.04% / 76.49%) is slightly lower than 1 − discard% (72.17% / 76.60%). The difference is about 0.1pp, probably orders still pending or a small difference in definition. It doesn't change the story.

---

## 3. What the data says

1. **The gap is FTC-only.**
   - South NFTC discard is 6.31% vs 6.49% Non-South. South repeat customers are at parity, even slightly better.
   - South FTC discard is 27.83% vs 23.40% (+4.43pp).
   - This fits the language hypothesis. First-time customers almost always need a doctor call, while repeat customers often have a valid prescription and may skip the call.
   - It could also be a first-time-customer trust issue that has nothing to do with language (see §5).
2. **South leans more on FTC.**
   - FTC is 30.5% of South orders vs 22.1% Non-South, so the FTC problem hurts South more.
3. **Cancellation is also higher in South, for FTC and NFTC.**
   - FTC: +3.6pp, about 880 orders/month. NFTC: +1.6pp.
   - This isn't in the sizing and isn't clearly caused by the doctor call, since NFTC is affected too.
   - Could language be hurting **HA calls** or delivery calls as well? This is a separate thread worth a callout.
4. **Upside not counted in the sizing:** a recovered FTC order becomes a repeat customer, and South NFTC performs at parity. So each recovered first order is worth more than one delivery (lifetime value).
5. **Risk not counted in the sizing:** recovered orders are assumed to deliver at the South average (70.95%). Orders that were nearly lost may deliver at a lower rate.

---

## 4. "South" is a region, not a language
Routing has to be done **per language**, not per "South". A Tamil-speaking doctor doesn't help a Telugu-speaking customer.

| State | Likely primary language | Notes |
|---|---|---|
| Tamil Nadu | Tamil | Chennai is somewhat mixed |
| Kerala | Malayalam | English is fairly common |
| Andhra Pradesh | Telugu | |
| Telangana | Telugu | **Hyderabad is mixed** (Telugu/Urdu/Hindi). Exclude it like Bangalore? |
| Karnataka (ex-Blr) | Kannada | |
| Border areas | Mixed | e.g. Hosur (Tamil/Kannada), Chittoor (Telugu/Tamil). Flag or skip. |

**Brainstorm points**
- Excluding Bangalore already applies the "mixed city → don't route" logic. Should Hyderabad, Chennai and Kochi follow the same rule?
- Start with **one state or language** (whichever has the highest FTC discard gap and the best doctor supply), then expand. Or launch all four South languages together?
- The pincode → language table only needs **South pincodes** for now, which is small and manageable.

---

## 5. Is the whole gap really language?
The sizing assumes **all** of the 4.46pp gap closes with language routing. Other reasons South FTC might discard more:
- Unfamiliarity with, or trust in, generic substitutes
- Price sensitivity / COD mix
- Unknown numbers not picked up
- Timing / doctor availability

**Cheap ways to see how much of the gap is language:**
- Listen to ~30–50 doctor-call recordings from discarded South FTC orders and tag which ones had a language issue.
- Ask South-handling doctors a few questions about language difficulties.
- Compare discard for South FTC orders that *happened* to get a doctor who speaks the local language vs those that didn't. **Doctor language data already exists**, so this is possible from today's data. It's the strongest pre-build evidence we can get.

This lets the sizing be shown as a **range**: e.g. 50% attribution → +12/day, 100% → +25/day.

---

## 6. Doctor side (multi-language)
- Doctors hold several languages, e.g. {Tamil, English, Hindi}.
- **Priority question:** a doctor who speaks Tamil and Hindi is useful to everyone. If they take Hindi orders, Tamil orders wait. So **orders in a scarce language should come first** for doctors who speak it.
- Which orders go into the language route?
  - **FTC only:** the gap is FTC-only, and it saves scarce regional doctors for the orders that need them.
  - **All South Dr-call orders:** simpler, but uses regional doctor time on NFTC orders that don't have a problem.
- How reliable is the current doctor language data? Self-declared? How complete is it?
- Is being able to chat in a language the same as being able to consult in it?

---

## 7. Routing (pincode → language → doctors)
- South FTC order → pincode → language L → offered to doctors who speak L first.
- Since time isn't the blocker, **waiting a bit longer for a doctor who speaks L is acceptable**. We still need a rule for when no doctor who speaks L is on shift (e.g. evening):
  - wait until the next shift with a doctor who speaks L (the clock allows it);
  - fall back to any doctor (Hindi/English) after X hours;
  - fall back to the "closest" language (e.g. English for Kerala)?
- Mixed or unknown pincode → normal routing.

---

## 8. Supply callout (future demand planning)
- **Demand:** South FTC ≈ **790 orders/day**, split by state/language from pincode trends and by hour of day.
- **Supply needed per language per shift** = (Dr-call orders in L per shift) ÷ (calls a doctor completes per shift).
- **Output:** a demand vs supply table per language and shift, showing where we're short. Feeds hiring or rostering.
- **Inputs we need:** current doctor count by language × shift, and doctor call capacity per hour.

---

## 9. How we'd measure it
- **Primary:** South FTC OP → WH reached (Dr confirm %). Baseline 72.04%, target 76.49%.
- **Pilot vs control:** route by language in some South pincodes or states, hold others back, and compare the same metric over the same period.
- **Health:** % of South FTC orders handled by a doctor who speaks their language, and wait time before a matched doctor picks the order.
- **Watch:** South FTC cancellation (11.88%). Make sure recovered orders don't just move into cancellations.
- Use **3 months of data**, not only August, to rule out seasonality.

---

## 10. Open brainstorm questions
1. FTC-only routing, or all South Dr-call orders?
2. Start with one language/state, or all four South languages?
3. Should Hyderabad, Chennai and Kochi be treated as mixed and left unrouted, like Bangalore?
4. When no doctor who speaks L is on shift: wait, fall back after X hours, or use English as the closest option?
5. Can we pull the §5 test ("matched by chance vs not") from today's data to check attribution before building?
6. Is the higher South cancellation (FTC and NFTC) a separate thread, possibly language on HA/delivery calls?
