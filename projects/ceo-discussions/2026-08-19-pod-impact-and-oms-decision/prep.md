# Prep — POD Impact + OMS/Cart Migration Scope

> **Every figure below is from the brain dump and marked `[VERIFY]` until confirmed
> against real data (tm-chotu / Metabase / Mixpanel).** Confirm before it is spoken
> in front of the CEO. Keep the source's own hedges (approximate / conservative /
> denominator + period).

## Impact scorecard

Outcome-level KPIs only. The reliability/functional fixes are **not** separate
scorecard lines — they are the "how" that enabled these outcomes (see *Enabling fixes* below).

| Metric | Baseline | Current | Impact | Status |
|---|---|---|---|---|
| HA CPO | ₹16.5 /order | ₹7.8 /order | −₹8.7 (~52.7%); conservative **~₹67L/mo** at 28k orders/day. Driven by **HA headcount reduction** enabled by reliability + functional fixes. FY-end goal (31 Mar 2026) hit **~8 months early** (~31 Jul 2025) | `[USER-PROVIDED]` |
| Pharmacist/CSR CPO | ₹14 /order | ~₹9 /order | −₹5 /order; **voicebot a major driver** (not sole). FY-end goal (31 Mar 2026) hit **~8 months early** (~31 Jul 2025) | `[USER-PROVIDED]` |
| Voicebot containment | — | 55% of call volume auto-handled + resolved | of that 55%, only **13% call back** (87% contained) | `[USER-PROVIDED]` |
| Stuck orders (all status issues: incomplete, payment-pending, etc.) | ~100 /day | ~0 /day | orders no longer get stuck | `[USER-PROVIDED]` |
| **Engineers freed to functional work** | on-call/support on bug-fix + KTLO for doctors+HAs | reduced to **~1/3** | more engineers now available for functional / impactful projects; Valuemeds toggle needs 0 eng | `[USER-PROVIDED]` |

### KPI driver tree (L1 outcome ← L2 drivers)
Present outcomes with what drove them — not the fixes as standalone numbers.

- **HA CPO ₹16.5 → ₹7.8** ← HA headcount reduction, enabled by:
  - substitution skips
  - portal-efficiency fixes: prescription-required handling, HAs unable to confirm orders, forced substitutions, HAs unable to log in, HAs not getting orders
- **Pharmacist/CSR CPO ₹14 → ~₹9** ← voicebot (55% calls contained, 13% callback)
- **Stuck orders ~100/day → ~0** ← incomplete / payment-pending / decimal-mismatch / status fixes
- **HA order confirmation failures** — every alternate day, most orders affected → now zero (big customer + HA experience win; feeds HA CPO)
- **Value-Meds telecom switching** — 4 incidents/mo, 2 eng × 0.5–1 day → business toggle; last month business switched with **zero engineering** (feeds engineers-freed)

### Business projects NOT blocked (Act 2)
Delivered/enabled alongside the above — proof the pod didn't stall business:
call-skipping logic · Valid-Rx categorisation · voicebot · Assisted Commerce · Ring AI · NFS salts.
| NFS salts | — | — | up to **₹2 crore** sales unlocked | `[VERIFY]` realized vs opportunity |
| Substitution (unauthorized) | ~200 orders/day | ~10 orders/day | compliance + processing-cost exposure removed | `[VERIFY]` |
| Order-cancellation recovery gap | — | ≥100 orders/day cancelled | recoverable if WH/logistics change existed | `[VERIFY]` |

## Verification checklist (lock BEFORE the meeting)

**CPO / cost** — values user-provided; data-confirm before locking
- [ ] HA CPO ₹16.5 → ₹7.8 (HA-specific) — exact measurement dates.
- [ ] Pharmacist/CSR CPO ₹14 → ~₹9 — exact current value + dates.
- [ ] Voicebot share of CPO reduction — "major driver, not 100%." Get the attributable split if possible (voicebot vs other work).
- [ ] Voicebot: 55% call volume auto-handled + 13% callback (87% contained) — confirm definitions (volume base, "resolved", callback window) + period.
- [ ] CPO definition: cost per order vs cost per **delivered** order.
- [ ] 28,000 daily orders is the correct denominator; 30-day month acceptable.
- [ ] CPO reduction fully attributable to this pod vs shared with other initiatives.

**Resolved (user-confirmed — no longer conflicts)**
- Voicebot is a **feature**, not a CPO metric — the major driver of the ₹14→₹9 Pharmacist/CSR CPO drop. Present as the "how," not a second number.
- Voicebot dates: committed 31 Mar 2026, delivered mid-Q2 (31 Jul 2025) — early delivery, correct as stated.
- Payment-pending: earlier ~1,500/day figure retracted. Real is ~100 stuck orders/day across all status issues → ~0 today.

**Substitution / compliance**
- [ ] Affected orders/day (200→10?), % of total, % not opted-in, cancel/RTO/discard caused.
- [ ] Validate ₹156 processing-cost proxy.

**Reliability (HA order confirmation)**
- [ ] Baseline frequency ("every alternate day, most orders that day") vs current (zero); internal vs telecom-partner split; repeat-call rate before/after.

**Payments / order states**
- [ ] Confirm ~100 stuck orders/day (all status issues combined) → ~0 today; exact period + denominator; which statuses are included.

**Engineers freed to functional work (headline)**
- Framing: on-call/support man-hours on bug-fix + KTLO reduced to **~1/3**, freeing engineers for functional/impactful work. **Do not quote exact engineer counts.**
- [ ] Value-Meds specifics (incidents/month, engineers/incident, hours) as supporting evidence.

**Cancellations & recovery**
- [ ] Validate ≥100/day; split WH vs logistics; recoverable %; CSR save rate.

**Business enablement**
- [ ] NFS salts: realized sales vs opportunity unlocked, period, attribution.

## Cart / OMS context (for the pivot)
- Cart cannot fully unblock until new OMS goes live.
- OMS go-live needs Portals + Payment services migrated; scope assessed and trimmed.
- Product doing the discovery/prioritization: **Super Doctor Portal 29 features → 16 useful** selected for migration.
- Current limitation: enhancements are being **identified, not implemented** — implementing in parallel risks the Cart date.

## Anticipated CEO questions
- Q: Is this impact attributable to your pod alone? → A: [have the attribution split ready — flagged `[VERIFY]` above].
- Q: What does enhance-and-migrate cost the Cart date? → A: [need per-enhancement effort estimate — see decision-brief open items].
- Q: Which enhancements? → A: two examples ready (call-preference propagation, configurable agent categorisation); full list in decision-brief.
