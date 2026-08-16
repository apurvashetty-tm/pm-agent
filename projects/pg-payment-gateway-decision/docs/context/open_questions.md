# Open Questions — PG Payment Gateway Decision

---

## [OPEN DECISION] EaseBuzz Corporate Card rate confirmation

**Question:** EaseBuzz's Corporate Card rate of 1.72% was NOT re-quoted in Jul 2026 — it is carried forward from the April quote. If Corporate Card volume grows (currently 1.83% of CC GMV = ₹15.4L), this rate matters more.

**Needed:** Explicit Jul 2026 confirmation from EaseBuzz of their Corporate Card rate.

**Impact:** If EaseBuzz's actual Corp Card rate is higher (e.g. 2.00%+), it would add ~₹400–600/month in cost — still cheapest, but worth locking down before signing.

---

## [OPEN DECISION] Razorpay CC rate bank approval

**Question:** Razorpay's 1.75% CC rate is subject to bank approval. Fallback is 1.85%.

**Needed:** Confirmation from Razorpay whether 1.75% is approved or fallback applies.

**Impact:** At 1.85% instead of 1.75%, Razorpay's cost increases by ~₹84,000/month. Already most expensive — this just widens the gap further.

---

## [OPEN DECISION] Juspay + PG selection dependency

**Question:** If we adopt Juspay orchestration, Razorpay is not an option. If Razorpay is selected for any reason (e.g. specific feature need), Juspay must be dropped or replaced.

**Needed:** Decision on whether Juspay is a requirement or optional.

---

## [OPEN DECISION] Vendor selection — EaseBuzz vs staying on Cashfree

**Question:** EaseBuzz saves ₹3.07L/month vs Cashfree (~₹37L/year). Is the switching cost, integration effort, and risk worth it?

**Factors to assess:**
- EaseBuzz integration effort and timeline
- Settlement TAT difference vs Cashfree
- Chargeback and dispute handling quality
- EaseBuzz support SLA
- Cashfree contract exit terms / lock-in

---

## [OPEN DECISION] Traffic cutover strategy

**Question:** If we switch PGs, what is the cutover plan?

**Options to evaluate:**
- Hard cutover (all traffic on day 1)
- Gradual shift (e.g. 10% → 25% → 50% → 100% over weeks)
- A/B split by payment mode (e.g. shift only wallets first, then NB, then cards)

**Rollback trigger criteria** need to be defined before any cutover.
