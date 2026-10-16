---
name: tm-chotu-rx-cadence
description: The prescription (Rx) lifecycle and molecule-dosage cadence model — how an order moves through the doctor portal (digitized → doctor consult → HA consult → confirmed → scheduler), what each status ACTUALLY means versus what its label says, the Rx register (register_details), how to tell a fresh consultation from a system-reused Rx via user_details.doctor_invoice_name, the salt-dosage decode, and the days-of-supply derivation. Load when asked about prescriptions, Rx generation, doctor or Health Advisor consultations, doctor portal statuses, doctor TAT or workload, days of supply, refill timing, run-out dates, dosage or frequency decoding, or anything joining patient-level therapy to orders. NOTE: this skill maps the DATA and the locked derivations — it does not predict due dates; refill prediction and cohort targeting belong to DCOE.
---

# Rx lifecycle + molecule-dosage cadence

Two things live here: **how a prescription order actually moves through the doctor portal**, and **how to compute when a patient runs out of medicine**. Both are full of traps where the obvious reading is wrong.

---

## 🔴 The governing rule: the status label is not the status meaning

Truemeds order statuses were named early and reused later. **Several codes mean different things depending on where they sit in the flow, and two are used for two different actors.** Reading a status by its English name will produce confident, wrong analysis.

## The doctor-portal flow — LOCKED (user-taught 2026-08-19)

```
39  DIGITIZED                  order reaches the DOCTOR PORTAL
  ↓
209 DOCTOR ASSIGNED            ⚠️ also used for HA assignment — see below
  ↓
215 CALL ATTEMPTED             ⚠️ also used for the HA call
  ↓
  ├─ doesn't connect  → 216 ORDER ON HOLD
  └─ connects, consultation completes
        ├─ HA NOT required → straight to 317 (452 never fires)
        └─ HA required ↓
452 PARTIALLY DIGITIZED        🔴 = DOCTOR consult DONE, awaiting HA. ONLY on the HA path
  ↓
209 DOCTOR ASSIGNED (again)    ⚠️ this time it is the HA being assigned
  ↓
215 CALL ATTEMPTED (again)     ⚠️ this time it is the HA call
  ↓
317 DR ORDER CONFIRMED         = ALL doctor-portal consultations complete (doctor AND HA)
  ↓
scheduler picks the order up → moves it to PROCESSING (the real warehouse assignment)
  └─ on failure → 318 SCHEDULER ERROR DR CONFIRM ORDER
```

### What each of these actually means

| Code | Label | What it really means |
|---|---|---|
| **452** | PARTIALLY DIGITIZED | 🔴 **NOT a transcription state.** The doctor consultation is **done** and the order is waiting on the **HA** consultation. **It fires ONLY when an HA consult is required** — if no HA is needed the order reaches `317` without ever stamping `452`. So 452 is effectively the *HA-required* marker, not a doctor-consult marker |
| **209 / 215** | DOCTOR ASSIGNED / CALL ATTEMPTED | 🔴 **Used twice each — once for the doctor leg, once for the HA leg.** There is no separate "HA assigned" code. **Position relative to 452 is what tells you which actor it was**: before 452 = doctor, after 452 = HA |
| **317** | DR ORDER CONFIRMED | **All doctor-portal consultations are complete or were not required** — the scheduler's go-signal. **Not** "a doctor confirmed it" |
| **233** | WAREHOUSE ASSIGNED | 🔴 **Not physical assignment.** It means a warehouse id was attached for **pricing and catalogue**. The real warehouse assignment is the scheduler moving the order to **processing** |
| 318 | SCHEDULER ERROR DR CONFIRM ORDER | The scheduler failed to pick up a 317 order |

### Consequences you must apply

- **Never count doctor calls off `215` alone** — it is inflated by HA calls. Disambiguate by whether the event precedes or follows `452`.
- **🔴 Never count doctor consultations off `452`.** It only fires when an HA consult follows, so it **undercounts by every doctor-only order**. `452` answers "how many orders needed an HA", not "how many doctor consults happened". The 17-Aug ratio (7,397 with 452 against 24,476 reaching 317) is the HA-required share, not a consult rate.
- **Never treat `317` as doctor workload.** Measured 17-Aug: of 24,475 orders carrying a 317, **5,636 (23%) were stamped by a single system actor on the `workflow_status = 242 NO_DOCTOR_CALL` path** — auto-confirm, no consultation, correct by design. Human doctor/HA actors sat at ~82–178 orders each per day.
- **`workflow_status = 242 NO_DOCTOR_CALL`** is the auto-confirm path: a valid Rx already attached ⇒ no consultation needed ⇒ straight to 317 so the scheduler can proceed. Correct behaviour, not a defect.
- **Don't read `233` as "it's in a warehouse".** For physical fulfilment state, use processing, not 233.

### ❌ `595 HEALTH ADVISOR CALL ATTEMPTED` is DEAD CODE — do not use it

It exists in the ORDER STATUS master and is **never stamped**. Probed 17-Aug-2026 over ~62k orders: **zero rows.** The HA leg reuses `209` / `215`. Any funnel or HA-volume metric built on `595` returns zero and looks like "no HA activity" rather than a broken metric.

### Measured corroboration of the flow (17-Aug-2026)

| Code | Orders | Events | **Events per order** |
|---|---|---|---|
| 209 DOCTOR ASSIGNED | 20,243 | 47,757 | **2.36** |
| 215 CALL ATTEMPTED | 20,193 | 55,058 | **2.73** |
| 452 PARTIALLY DIGITIZED | 7,397 | 7,413 | **1.00** |
| 317 DR ORDER CONFIRMED | 24,476 | 24,497 | **1.00** |

`209` and `215` firing ~2.4–2.7× per order is the signature of **two legs** (doctor, then HA); `452` and `317` fire exactly once as one-time checkpoints. Note also that only **7,397** orders hit `452` against **24,476** reaching `317`. **Confirmed:** `452` fires only when an HA consult is required — orders needing no HA go to `317` without it. So that ratio is the **HA-required share**, not a doctor-consult rate. (One-day probe; re-measure before quoting it.)

---

## `register_details` — the Rx register (DB 170 `tmmumpsdb`)

Summary-level prescription register. **This is the source that actually carries doctor identity and a doctor-confirmation timestamp** — `order_status` only carries an actor id you would have to resolve.

| Column | Use |
|---|---|
| `doctor_id`, `prescriber_name` | the **in-house** doctor who processed the order (`prescriber_name` is a saved copy of that doctor's name — never the external prescriber off an uploaded Rx) |
| **`doctor_confirm_date`** | **real doctor-confirmation timestamp** — prefer this over inferring from status 317 |
| `med_change_after_dr_call` (bool) | did the medicine change after the consult |
| `current_order_id`, `previous_order_id` | **the cadence linkage** — this fill vs the prior one |
| `medicine_composition`, `medicine_drug_type`, `medicine_schedule` | molecule, form, and drug schedule (H / H1 / X) |
| `drug_name`, `product_code`, `quantity` | what was dispensed |
| `fsp_id` | joins into the substitution chain (`final_substitute_product.final_subs_id`) |
| `checker_id`, `checker_name`, `batch_number`, `serial_number` | dispensing/audit trail |
| `invoice_number`, `warehouse_id`, `supply_date`, `expiry_date` | fulfilment |
| 🔴 `drx_link`, `invoice_link` | **document URLs — P0 PII. Never export, never paste.** See `tm-chotu-pii-register` |

---

## 🔒 Rx GENERATION — which doctor processed it, and was it a fresh consultation?

**This is the canonical route. Do NOT go to `order_status` for Rx counts or doctor attribution.**

### Grain first

`register_details` is **order × line-item** grain. Always roll up:

```sql
SELECT current_order_id, prescriber_name, doctor_id
FROM tmmumpsdb.register_details
GROUP BY 1,2,3          -- distinct order × doctor, never COUNT(*)
```

`COUNT(*)` counts dispensed medicines, not prescriptions, and inflates by several times.

### Two sources, in order

**SOURCE 1 (first) — `register_details.prescriber_name`.** The clean way to check **which doctor processed the order**. This is where you start. Roll up at distinct `(current_order_id, prescriber_name)`.

🔒 **`prescriber_name` is the IN-HOUSE Truemeds doctor only** — a copy of that doctor's name saved onto the register. It is **not** the external prescriber transcribed off a customer's uploaded prescription. That is precisely why comparing it against `user_details.doctor_invoice_name` is meaningful: both are in-house doctor identities, one a denormalised copy, one the master.

**SOURCE 2 (second) — the user master, reached via the register's `doctor_id`:**

```
register_details.doctor_id  →  user_details.id  →  user_details.doctor_invoice_name
```

**`user_details` is on DB 170 `tmmumpsdb`** (verified 2026-08-19) — same database as `register_details`, so this is a local join, not a cross-DB hop.

### The test: compare source 1 against source 2

| `prescriber_name` vs `doctor_invoice_name` | Meaning |
|---|---|
| **MATCH** | ✅ **FRESH consultation** — a doctor actually consulted on this order |
| **DO NOT match** | 🔴 **No doctor consultation happened on this order.** The system processed it using an Rx generated earlier — and **`previous_order_id` is the order that Rx came from** |

So `previous_order_id` is not merely a cadence link: on a name mismatch it is **the provenance of the reused prescription**. That comparison is how you separate genuine consultation volume from system-carried Rx.

⚠️ A mismatch is **not** a data error. It is the documented signature of Rx reuse. Treat it as a category, not a defect. And if the reused share comes back large, that is **not** a defect finding either — it is the auto-confirm path working as designed. Read it as consult **load**, not consult **failure**.

**Three grain edges to settle before reporting:**
- **Multi-doctor orders** — if one order carries register rows with different `doctor_id`, fresh and reused can both fire and the buckets will not sum to the total. Check grain on the sample and set a tie-break first.
- **Unresolved** — a `doctor_id` that fails to join `user_details` is its own bucket. Never fold it into fresh or reused.
- **The name test is a string compare** — normalise case and whitespace; if a meaningful near-match tail exists, report it separately rather than forcing it onto a side.

### When `order_status` IS the right tool

Only for **ledger-style actor tracking** — who stamped `452 PARTIALLY DIGITIZED`, who stamped `317 DR ORDER CONFIRMED`, call attempts, holds. That is event attribution, not Rx counting. For "how many Rx", "which doctor", "was it fresh", `register_details` + `user_details` is the answer and `order_status` is the wrong table.

### Probe note

Filtering `register_details` on `doctor_confirm_date` **timed out** on a single-day window (2026-08-19) — that column looks unindexed. Scope by `current_order_id` (or an order-id list from a bounded `order_details` pull) rather than a date range on this table.

---

## Days of supply — a documented DERIVATION, not a chotu prediction

### Source tables

| Table | Role |
|---|---|
| **`salt_dosage_prescribed_by_doctor`** (DCOE shorthand: **SDPBD**) | **Canonical Rx line source.** Carries `fsp_id`, `patient_id`, `ordered_quantity`, `available_prescribed_quantity`, `prescribed_dosage`, `frequency`, `prescribed_dosage_unit_quantity`, `prescribed_duration`, `active`, `createdon`. ~26.5M rows.<br>**Lives on MySQL — Main DB (DB 2) or Mangesh DB (DB 630)**, schema `TMMUMPSDB` UPPERCASE. Both are **prod**: extract by indexed key and compute locally, never an analytical GROUP BY there.<br>**Reaching an order:** it carries `fsp_id`, not `order_id` — hop `SDPBD.fsp_id → final_substitute_product.final_subs_id → .order_id` (FSP = `final_substitute_product`). That hop is also how you get to `customer_id` and a delivery-date anchor |
| **`salt_dosage_master_data_mapping`** | **The only decode truth.** 38 rows. `id` **is** the code, and `prescribed_dosage`, `frequency` and `prescribed_duration_unit` **all share one keyspace** — which is why codes run to 22 |
| `salt_dosage_master` | the per-salt template (46,980 active) with `max_allowed_*` ceilings |
| ❌ `dosage_master` | **9-row legacy — STALE, DO NOT USE.** Its decode is wrong (id 4 = '1-0-0' when the real `prescribed_dosage=4` is '1-0-1' = 2/day) and it lacks codes 16–22 |
| ❌ `analytics_salt_dosage_prescribed_by_doctor` (tmprod) | **FROZEN at 2026-02-14**, zero rows after 1 Aug — despite holding 25.5M rows |

### The decode

| `type` | ids | `value` means |
|---|---|---|
| `DOSAGE` | 3–9, 16, 17, 21, 22 | **doses per day** — '1-1-1'→3, '1-0-1'→2, '1-0-0'→1, 'SOS'→NULL |
| `FREQUENCY` | 13–15, 18–28 | **cycle length in days** — Everyday→1, alternate→2, weekly→7, 3-monthly→90 |
| `DURATION_UNIT` | 10, 11, 12 | days multiplier — Day→1, Week→7, Month→30 |
| `ADVICE` | 1, 2, 29–38 | food/timing text, no `value` — irrelevant to DoS |

### 🔒 The formula

```
doses_per_day = DOSAGE.value / FREQUENCY.value                  -- administrations per day
units_per_day = doses_per_day × prescribed_dosage_unit_quantity -- uq DOES multiply
DoS_days      = ordered_quantity / units_per_day
run_out_date  = COALESCE(actual_delivery_date, order_placed_date) + DoS_days
```

- **`ordered_quantity` is already in CONSUMABLE units** (tablets / ML / GM) — **no pack conversion.** Verified four ways, including `ordered_quantity = fsp.pack × fsp.subs_quantity` holding ~77% exactly and the packs-hypothesis holding ~0.4%. `medicine_master.pack` is a data-quality monitor only, never a DoS input. `strength` is potency, never a multiplier.
- **`uq` multiplies** — this was flip-flopped and then settled empirically: on edited-quantity lines (where the template can't vouch for itself) **WITH-uq won 488 to 27 (94.8%)**, and realised reorder behaviour agreed.
- **SOS lines (`prescribed_dosage = 16`) have no deterministic cadence — exclude them** (~1.87%).
- Pre-filter **`SDPBD.active = 1`** (~21% of lines are superseded).
- Computable fraction ≈ **98.1%**.
- Join the 38-row decode master **twice** — once `type='DOSAGE'` on `prescribed_dosage`, once `type='FREQUENCY'` on `frequency`.

### 🚩 The biggest trap: the line is a COPY of the salt's template

Measured on **3,157,301** lines since 2026-07-01:

| line field vs its master | identical |
|---|---|
| `prescribed_dosage` | **98.9%** |
| `frequency` | **97.7%** |
| `prescribed_dosage_unit_quantity` | **97.5%** |
| `prescribed_duration` | **96.5%** |
| `prescribed_quantity` | 81.1% |

➡️ **DoS is a per-SALT standard rate applied to a per-PATIENT quantity — not a doctor's bespoke instruction.** Nothing customer-facing may imply the doctor personally set this schedule.

The only genuinely per-order fields are **`ordered_quantity`** (what was dispensed) and **`available_prescribed_quantity`** — which is **remaining entitlement on the prescription, NOT stock in the patient's cupboard.**

⚠️ **Because `uq` equals the master ceiling on 97.5% of lines, you are usually multiplying by a CEILING, not an actual.** Known master defects: GLIMEPIRIDE reads 4 tablets/day; TELMISARTAN 40 MG carries `1-0-1` (2/day) though it is once-daily. A single wrong template field silently overestimates consumption for **every patient on that salt** and nudges them early — on the worked example it swung the governing run-out date by a **week**.

**Ship a confidence flag:** `HIGH` when `uq` deviates from the master max (someone set it deliberately), `LOW` when it equals the max (inherited ceiling).

#### DCOE prefers the empirical per-salt rate over the template

46,980 masters cannot be hand-fixed, and don't need to be — derive the rate from realised refills:

```
implied_units_per_day = ordered_quantity(fill N) / days_until(fill N+1)   -- median per salt
```

SDPBD `createdon` is set at **order** time, so intervals need no delivery lookup and the order→delivery lag cancels between two fills.

### DCOE's modelling decisions — recorded so you can READ their output, not so chotu reproduces them

🔴 **chotu does not predict refill dates.** It shows where the data lives and what the locked derivations are. "When is this customer due", "who is overdue", "next expected order date" are **DCOE model outputs** — point at DCOE, do not compute them here.

The rules below are recorded because you will need them to interpret a DCOE result, not as instructions for chotu to run.

#### Scoped to primary-disease (D1) salts only

**An OTC or non-primary-disease line must never dictate cadence.** A paracetamol strip bought alongside a chronic refill has its own short, irregular run-out and drags `next_expected_order_date` earlier — manufacturing a "due" customer who is not due.

Gate (already implemented — reuse, do not re-derive):
```
disease_product_mapping WHERE type='DISEASE' AND priority='D1' AND active=1
  → LOWER(dpm.product_code) = LOWER(fsp.product_code)
  → dpm.type_id = disease_master.id → disease_master.disease
```
Non-D1 and unmapped lines are computed but carried as an **EXCLUDED** flag for diagnostics only.

⚠️ **Scope FIRST, then roll up.** Rolling up before gating is the exact bug this rule exists to prevent.

#### Grain is per-patient, not per-customer

**Cadence key = `(customer_id, patient_id, molecule)`.** One account orders for several patients on unrelated intervals — a father's 30-day chronic refill and a child's 5-day antibiotic collapse into a ~17-day phantom cadence matching neither, and the customer gets chased on a date no patient is due.

`patient_id` is on SDPBD already. **The SEND is per customer** (the account is who we message) **but the DUE DATE is per patient**, and the D1 gate applies *within* each patient. Never collapse to customer grain at any layer, including the feature mart — that discards a fact that cannot be re-derived downstream.

**A patient whose D1 lines are all SOS/uncomputable has NO dosage cadence.** That is an honest UNKNOWN — never a defaulted date. Fall back to empirical rhythm and label which predictor produced the date.

#### DCOE's test case

**`order_id = 52637339`** — a real order placed by the owner for his father (`patient_id 6061442`), i.e. a genuine customer ≠ patient row. Validate the DoS formula, the D1 gate and the patient split against it line by line.

---

## 🔴 The boundary — what chotu does and does not do here

**chotu surfaces sources and locked definitions. It does not forecast.**

- ✅ "Days of supply is computed as follows, from these tables, with this caveat."
- ✅ "The Rx register lives here; this column means that; here is how to tell a fresh consultation from a reused Rx."
- ❌ "This customer is due on the 12th." — that is a prediction, and it belongs to DCOE's model.

**Why this line exists, with evidence:** DCOE back-tested refill-date logics on **n = 956,453** held-out (customer, patient, salt) pairs. **Days-of-supply came out worse than predicting a flat 34 days for everyone** — template DoS mdAE 20.2d and early 83% of the time, against 11.0d for flat-34 and **6.4d** for residual-life. DoS correctly answers *"when does the medicine in the cupboard run out"*. It is **not** the answer to *"when should we message them"*, and a plugin that hands someone a due-date implies an accuracy it cannot defend.

If a user asks for a due date, give them the data map and route them to DCOE.

## See also

`tm-chotu-tables-enums` (status decodes) · `tm-chotu-business-flows` (order lifecycle) · `tm-chotu-pii-register` (`drx_link`, prescription tables) · `tm-chotu-learnings` L21/L22 (the two mistakes this model recorded).
