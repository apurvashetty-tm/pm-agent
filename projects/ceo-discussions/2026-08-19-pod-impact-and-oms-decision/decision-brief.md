# Decision Brief — OMS/Cart Migration Scope

- **Audience:** VP Product (manager) + Engineering Director

## The decision
> We've reduced OMS migration scope from all existing functionality to what is
> genuinely useful. During this migration, do we **agree to take up a focused set of
> high-impact enhancements now** (enhance-and-migrate, explicit Cart-date risk), or
> **note them and stay migrate-only** to protect the Cart date?

Not do-everything vs do-nothing. Middle path = **migrate-only baseline + a small,
explicitly approved enhancement set**, each with impact + delivery-risk noted.

---

## Enhancement examples (the major ask — strongest first)

Each: **Gap today → What it costs → Enhancement → Why it's cheapest during migration.**

### Tier A — concrete, high-impact, doable in the migration window

**A1. Cross-portal substitute pricing consistency**
- **Gap:** Assisted Commerce shows a substitute with proportional pricing; in Type-1 / CSR-created orders via Pharmacist Portal, substitute pricing isn't matched — pharmacist pitches from memory, price can be higher than app/website.
- **Cost:** same medicine, inconsistent price → customer distrust, harder substitution pitch, conversion + cancellation + retention hit.
- **Enhancement:** one substitute-recommendation + proportional-pricing engine shared across all commercial flows.
- **Why now:** we're already inside these portals; a shared pricing service is far cheaper to wire during migration than to retrofit.

**A2. Warehouse / logistics-partner change on a live order**
- **Gap:** ≥100 orders/day cancelled because there's no way to change warehouse or 3PL. Even when CSR saves the customer, they must **restart the entire order journey**.
- **Cost:** avoidable cancellations, CSR effort, lost customer intent, extra processing, OP→OD + retention drag.
- **Enhancement:** preserve original order + customer context; allow WH/3PL swap; recover or replace instead of restart.
- **Why now:** order-state recovery hooks are cheapest to build while the order model is being migrated.

**A3. TM credits & coupons in Pill Reminder**
- **Gap:** Pill Reminder can't apply TM credits/coupons → order is discarded → pharmacist recreates it in Pharmacist Portal.
- **Cost:** avoidable discard, duplicate order creation, customer + pharmacist effort, lost conversion.
- **Enhancement:** support credits/coupons in the Pill Reminder flow (or a seamless recovery path).
- **Why now:** unify the order-creation path once, in the migrated OMS, instead of per-portal.

**A4. Call-preference propagation**
- **Gap:** a customer who opted out of HA calls can still be pulled into Assisted Commerce calls.
- **Cost:** unwanted calls, compliance + customer-experience risk.
- **Enhancement:** propagate call preference across all call flows (mandatory Doctor call excepted).
- **Why now:** make preference a first-class, shared attribute in the new OMS rather than a per-portal flag.

**A5. HA-call skip path for Type-1**
- **Gap:** in Type-1 the pharmacist is already the substitution touchpoint, but there's no path to skip the HA call.
- **Cost:** redundant calls, call cost, slower orders, worse customer/pharmacist experience.
- **Enhancement:** skip the HA call when the pharmacist workflow already completed the required interaction.
- **Why now:** call-routing logic is being rebuilt in the migration.

### Tier B — architectural direction (agree to pursue, or note for roadmap)

**B1. Unified commerce + CRM platform**
- **Gap:** Type-1, Pill Reminder, Assisted Commerce, Pharmacist Portal run as silos with inconsistent feature coverage — the same capability is rebuilt per portal, and some portals miss features others have.
- **Cost:** duplicate development, portal-specific gaps, inconsistent CX/workflows, every future migration is harder.
- **Enhancement:** one unified capability layer to place and manage orders across all commercial journeys, with a shared CRM.
- **Value:** consistent customer + pharmacist/CSR experience, less duplicate build, common instrumentation, easier next migration.
- **Status:** direction *exposed* by this migration. Decide to pursue now, or note for the roadmap.

**B2. Configurable agent categorisation (rule engine)**
- **Enhancement:** categorise agents uniquely across portals and route orders/customers on relevant signals via a rule engine.
- **Value:** differentiated workflows, faster business experimentation, lower recurring Product/Eng dependency.

**B3. Instrumentation during migration**
- **Enhancement:** add order-state / cancellation / recovery / call-outcome instrumentation while we're in the code.
- **Value:** measure goals directly, prove impact post-launch, reduce future debate about foundational work.

> **Two to lead with in the room** (per latest direction): **A4 call-preference
> propagation** and **B2 configurable agent categorisation**. Pull others in as the
> conversation opens up.

---

## Options

**Option A — Migrate-only**
- Benefits: protects Cart date; smaller scope; lower complexity; faster to new OMS.
- Trade-offs: known customer/operational gaps remain; duplicated portal behavior remains; likely later rework; instrumentation gaps persist.

**Option B — Enhance-and-migrate**
- Benefits: fixes known pain while already in the systems; consistency across platforms; removes avoidable failures/manual work; stronger Cart/OMS foundation; less future rework.
- Trade-offs: larger scope; higher delivery risk; may move the Cart date; needs explicit prioritization + capacity.

**Middle option `[RECOMMENDED]`**
- Migrate-only baseline **+ a small, explicitly approved set** (e.g. A4 + one of A1/A2), each with impact + effort + date-risk stated. Everything else noted for roadmap.

## Open items to make it decision-ready `[OPEN DECISION]`
1. Exact Cart go-live date + buffer.
2. Mandatory (non-negotiable) migration scope.
3. Which enhancements fit **without** moving the date.
4. Per-enhancement effort (Engineering to size).
5. Unified commerce + CRM: this-scope or roadmap?
