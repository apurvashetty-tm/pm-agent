# project_truth.md
**Status:** Draft v1
**Owner:** Apurva Shetty (PM)
**Purpose:** Working truth for the Valuemeds vendor-migration (OzoneTel → Knowlarity) project
**Last updated:** 2026-08-17

---

## 1. Purpose
This file locks the working truth for the **Valuemeds single-call warm-transfer**
flow and its telephony-vendor dependency. It locks:
- what the Valuemeds flow must do
- the transfer-CTA validation rules that must not be violated
- what is a confirmed fact vs an open decision
- what may be assumed while evaluating Knowlarity

It is **not** a full PRD or an integration spec. See `problem_statement.md` for
the framed problem.

---

## 2. How to use this file
Answer: what must the flow support, what is confirmed, what must not be invented,
what is still open. If older references conflict, this file decides until updated.

---

## 3. Product definition
**Valuemeds** = a single-connectivity order flow. `[LOCKED]`
- Doctor calls the customer, completes the consult, then **warm-transfers the
  same live call** to a Health Advisor (HA).
- Customer experiences **one call, one connection**.
- It is **NOT** the separate-call flow (doctor and HA calling the customer
  independently) — that is the degraded fallback, not Valuemeds.
- Value: single connectivity historically drives **higher order completion /
  lower discards**. (Magnitude = TO-DO sizing, not locked.)

---

## 4. Locked core journey
`[LOCKED]` transfer-enablement rule. Doctor → HA handoff (transfer CTA) is
allowed **only** when all three signals validate:
1. **Leg 1 connected** — doctor's leg live.
2. **Leg 2 connected** — customer's leg live.
3. **Call time window** — conversation on for the required duration.

Each signal is delivered by a telephony **webhook**. If any signal is missing or
late, the transfer CTA must **not** be enabled. (Failing safe > bad transfer.)

---

## 5. Confirmed facts (verified)
- `[LOCKED]` OzoneTel has sent **delayed webhook responses** for 1 month+.
- `[LOCKED]` Lag is **random**, across **all three** signals, at varying
  frequency/intervals — not constant.
- `[LOCKED]` Root cause is **majorly OzoneTel infra**; internal checks/quick fixes
  did not resolve it.
- `[LOCKED]` OzoneTel's **direct API also returns no response** (not just webhooks).
- `[LOCKED]` Raised with OzoneTel → they claim fixed → issue **recurs** on restart.
- `[LOCKED]` Current fallback = separate doctor + HA calls (no warm-transfer).
- `[LOCKED]` Knowlarity has provided a **transfer URL/endpoint** to evaluate.

---

## 6. What backend owns vs what frontend represents
- Backend/telephony owns: call-leg state, webhook receipt, the three-signal
  validation, and the decision to enable the transfer CTA.
- Frontend only **renders** the transfer CTA as enabled/disabled per backend
  validation — it must not infer transfer-readiness on its own.

---

## 7. What may be assumed (while evaluating Knowlarity)
- `[MOCK ASSUMPTION]` Knowlarity can, in principle, expose the same three signals
  — to be **verified** against their endpoint/docs, not taken as fact.
- Exact payload shapes and latency behavior are assumed unknown until tested.

---

## 8. What must never be casually hardcoded / invented
- Impact sizing (discard rate, completion, orders lost/month) — Analytics + Business owned.
- Vendor capabilities, SLA, or pricing (OzoneTel or Knowlarity).
- Acceptable webhook latency threshold ("on time" definition).
- The go/no-go vendor decision.

---

## 9. What is intentionally not locked yet
- Failover model: Knowlarity primary vs OzoneTel-primary-with-Knowlarity-fallback
  vs dual-vendor abstraction. `[OPEN DECISION]`
- Latency SLA per signal. `[OPEN DECISION]`
- Whether OzoneTel is dropped entirely or retained as secondary. `[OPEN DECISION]`
- Integration architecture and rollout sequencing.

---

## 10. Final build principle
Preserve the locked single-call journey and the three-signal transfer rule.
Separate verified facts from assumptions. Do not invent numbers or vendor
promises. Move the Knowlarity evaluation forward; stop where a business decision
is owed.
