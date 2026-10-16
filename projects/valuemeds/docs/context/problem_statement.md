# Problem Statement — Valuemeds Single-Call Flow (OzoneTel Failure → Knowlarity Evaluation)

**Status:** Draft v1
**Owner:** Apurva Shetty (PM)
**Last updated:** 2026-08-17

> Naming note: vendor referred to in conversation as "Nolarity" is **Knowlarity**. Confirm if wrong.

---

## 1. What Valuemeds is
Valuemeds is a **single-connectivity** order flow. The doctor calls the customer,
completes the consult, then **warm-transfers the same live call** to a Health
Advisor (HA). The customer experiences **one call, one connection** — not
separate doctor and HA attempts.

Historically this drives **higher order completion / lower discards**, because
the customer only has to pick up and stay on the line once.

---

## 2. How the transfer works (the dependency)
Before we enable the **transfer CTA** (doctor → HA handoff), we validate three
conditions. Each is fed by an OzoneTel **webhook response**:

1. **Leg 1 connected** — is the doctor's leg live?
2. **Leg 2 connected** — is the customer's leg live?
3. **Call time window** — has the conversation been on for the required duration?

All three signals must arrive on time for us to safely enable the transfer CTA.
If we can't validate all three, we cannot allow the transfer.

---

## 3. What broke
For **1 month+**, OzoneTel has been sending **delayed webhook responses**. The lag is:
- **Random** — no fixed pattern.
- **Across all three signals** (leg 1, leg 2, call duration), at **different
  frequencies and time intervals** — not constant.

When any signal is delayed, we can't validate the transfer conditions in time, so
we have **kept the flow off** rather than risk a bad transfer.

---

## 4. What we already tried (root cause confirmed = OzoneTel)
- Ran internal checks and quick fixes → issue is **majorly on OzoneTel's side**,
  not our internal handling.
- Called OzoneTel's **API directly → no response** there either. Not just the
  webhooks — the API itself returns nothing.
- **Raised with OzoneTel.** They claim it is fixed. On restarting the flow, **the
  same issue recurs.**

**Conclusion:** OzoneTel infra fault. The flow is fully dependent on OzoneTel,
which lags randomly, and it is not reliably fixable from our side or on
OzoneTel's current commitment.

---

## 5. Current state (fallback)
Fallen back to a flow **without** Valuemeds warm-transfer: doctor and HA each
place a **separate call** to the customer. Two connection attempts instead of one
→ more drop-off, higher discards, worse customer experience.

---

## 6. Impact sizing — [TO-DO: Analytics + Business]
> **Call-out, not a decision input for this doc.** PM to raise with Analytics +
> Business team to quantify:
> - Discard-rate / order-completion delta: **Valuemeds vs separate-call fallback**,
>   **before vs after** the OzoneTel breakage.
> - **Orders lost per month** under the fallback.
>
> This sizes urgency and the ROI of building the backup vendor. Tracked here as an
> owned action item, deliberately excluded from the go/no-go on evaluating Knowlarity.

---

## 7. Way forward — evaluate Knowlarity as backup vendor
OzoneTel is unreliable and we have asked them to fix it, but we need a **backup
vendor** so Valuemeds is not single-vendor-dependent. Knowlarity has provided a
**transfer URL/endpoint** similar to OzoneTel's. Next steps:

1. **Evaluate** — can Knowlarity's transfer capability deliver the same three
   signals (leg 1 connected, leg 2 connected, call duration) **reliably and on
   time**?
2. **Build** — integrate against Knowlarity's endpoint to power the transfer-CTA
   validation.
3. **Validate reliability** — measure latency and signal completeness before
   routing live Valuemeds volume.
4. **Rollout** — restore the single-call warm-transfer on the dependable vendor;
   keep OzoneTel as secondary or drop it based on the eval.

**Outcome:** restore the Valuemeds single-call warm-transfer on a vendor we can
depend on, and remove single-vendor risk.

---

## 8. Open items
See `open_questions.md` for unresolved decisions (e.g. failover model —
Knowlarity primary vs OzoneTel-with-fallback, acceptable webhook latency
threshold, dual-vendor abstraction).
