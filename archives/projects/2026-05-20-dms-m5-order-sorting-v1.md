# [PRD] DMS Integration — Milestone 5: Order Sorting

**Version:** v1
**Date:** 2026-05-20
**Author:** Tejas Bhalerao
**Status:** In Review

---

## RACI

| Function | R | A | C | I |
|---|---|---|---|---|
| Product | Tejas | Tejas | — | — |
| Engineering | Eng Lead | — | Tejas | Fahad |
| Ops | Ops Lead | — | Tejas | Kartik |
| Locus | Locus CSM | — | Eng Lead | — |

---

## Authorization Matrix

| Action | Permitted Roles |
|---|---|
| Generate Forward AWB | Warehouse Logistics, HO Central Logistics |
| Generate Reverse AWB | Warehouse Logistics, HO Central Logistics |
| Cancel AWB | Warehouse Logistics, HO Central Logistics |
| Reprint AWB | Warehouse Logistics, HO Central Logistics |
| View AWB records | All roles |
| Modify Sort Identifier Code mapping | Tech only |

---

## Objective

Replace Shipsy's AWB generation with Locus-sourced AWBs and Sort Identifier Codes for all hyperlocal orders — enabling correct physical sorting at warehouse before dispatch.

---

## Why Now?

Every downstream milestone depends on correct Sort Identifier Code generation:
- **M6 Planning Engine** ingests orders using Locus-format identifiers
- **M7 Driver App** scans and executes trips built on these order identifiers
- **M8 Alerts** monitors deviations in AWB and Sort Identifier Code generation

AWB generation is the first physical touch point in the fulfilment cycle. An error here propagates to every subsequent scan. This milestone must be complete before M6 integration testing begins.

---

## Field Reference — Forward AWB

| Field | Source | Notes |
|---|---|---|
| Order ID | Truemeds OMS | Unique per order; used as terminal component of Sort Identifier Code |
| Barcode for Order ID | Barcode generation service | Symbology: **Code 128** (linear, scanner-compatible, GS1-compliant) |
| Delivery Partner | Locus configuration | Maps to warehouse entity |
| Origin Hub | Geography setup (Hub entity) | `warehouse_details.Alias` column — must exist in active Locus geography |
| Mid Mile Hub | Geography setup (Hub entity) | Blank when no mid-mile segment. Blank format: **three-part code** `<OriginWH_Pincode_OrderID>` (hub segment omitted entirely — not double-underscore) |
| Delivery Pincode | OMS order record | Must be in active zone-pincode mapping |
| Drop Address | OMS order record | Unmasked on physical label — PII. Label disposal policy: shred on return/RTO |
| Drop Contact | OMS order record | Unmasked on physical label — PII. Label disposal policy: shred on return/RTO |
| Sort Identifier Code | Constructed by Truemeds | See format spec below |

---

## Field Reference — Reverse AWB

| Field | Source | Notes |
|---|---|---|
| Order ID | Truemeds OMS | Unique per original forward order |
| Barcode for Order ID | Barcode generation service | Symbology: **Code 128** |
| Delivery Partner | Locus configuration | Maps to warehouse entity |
| Destination Hub | Geography setup (Hub entity) | For reverse, this is the return warehouse |
| Mid Mile Hub | Geography setup (Hub entity) | Blank when no mid-mile segment. Same blank format as forward: three-part code |
| Pickup Pincode | OMS order record | Customer's pincode |
| Pickup Address | OMS order record | Unmasked on physical label — PII |
| Pickup Contact | OMS order record | Unmasked on physical label — PII |
| Sort Identifier Code | Constructed by Truemeds | See format spec below |

---

## Sort Identifier Code Format Specification

**With mid-mile hub:**
```
<OriginWH>_<MidMileHub>_<Pincode>_<OrderID>
```
Example: `MUMNWH_PUNDC_411001_TM9988776`

**Without mid-mile hub (direct delivery pincode):**
```
<OriginWH>_<Pincode>_<OrderID>
```
Example: `MUMNWH_400001_TM9988776`

**Rules:**
- `OriginWH`: value from `warehouse_details.Alias` column — short alphanumeric code, no spaces
- `MidMileHub`: value from Geography Hub entity alias — same constraint
- `Pincode`: 6-digit numeric string
- `OrderID`: Truemeds OMS order ID
- Delimiter: underscore `_` only
- No spaces, no special characters outside underscore
- Determination of mid-mile vs direct: if Delivery Pincode maps to a zone whose hub has a `destination_hub` configured → mid-mile hub populated; otherwise omitted

**Validation:** Generated code must match regex `^[A-Z0-9]+_([A-Z0-9]+_)?[0-9]{6}_[A-Z0-9]+$`

---

## Use Case 1: Forward AWB Generation

**Trigger:** Truemeds OMS dispatches a forward hyperlocal order for physical fulfilment.

**Pre-conditions:**
- Order ID exists in OMS with status = Ready for Dispatch
- Delivery Pincode exists in active zone-pincode mapping
- Origin Hub exists in Geography setup with `warehouse_details.Alias` populated
- No existing non-cancelled AWB for this Order ID

### Happy Path

1. OMS triggers AWB generation request with `order_id`, `delivery_pincode`, `drop_address`, `drop_contact`
2. System resolves `OriginWH` from `warehouse_details.Alias` for the dispatching warehouse
3. System queries hub-pincode mapping to determine if Delivery Pincode is mid-mile or direct
4. If mid-mile: fetch `MidMileHub` alias from Geography
5. Construct Sort Identifier Code per format spec
6. Generate Code 128 barcode for Order ID via barcode generation service
7. Assemble AWB with all required fields
8. Return AWB payload; print trigger sent to warehouse printer
9. Physical label printed and affixed to order package

### First-Order Failure Scenarios (Pass 2)

**F1.1 — `warehouse_details.Alias` missing or blank**
- System cannot construct Sort Identifier Code; OriginWH segment is null
- Outcome: AWB generation blocked; error returned to OMS
- Response: Alert A5.2 fired; order enters "AWB Generation Failed" state; Ops + Tech notified
- Resolution: Tech populates missing Alias in `warehouse_details`; trigger re-generation

**F1.2 — Delivery Pincode not in hub-pincode mapping**
- System cannot determine mid-mile vs direct; Sort Identifier Code construction blocked
- Outcome: AWB generation blocked
- Response: Alert A5.2 fired; check serviceability-geography sync (M2 A2.6)
- Resolution: Geography team adds pincode to correct zone; re-generate

**F1.3 — Mid-mile hub alias missing from Geography**
- Hub exists but `alias` field is blank → Sort Identifier Code mid-mile segment is null
- Outcome: AWB generation blocked to prevent malformed code
- Response: Alert A5.4 fired (stale hub reference); Tech notified
- Resolution: Tech populates hub alias; re-generate

**F1.4 — Order ID not resolvable in OMS**
- OMS sends `order_id` that doesn't exist or is in wrong status
- Outcome: AWB generation rejected at validation
- Response: OMS integration error logged; no alert fired (OMS-side issue)
- Resolution: OMS team investigates order state

**F1.5 — Barcode generation service failure**
- Barcode for Order ID cannot be generated
- Outcome: AWB generation fails; order stuck without label
- Response: Alert A5.1 fired; retry with exponential backoff (3 attempts, 5s/15s/30s); if all fail → "AWB Generation Failed" state
- Resolution: On service recovery, Tech triggers re-generation for orders in failed state

**F1.6 — Duplicate AWB generation attempt**
- Active (non-cancelled) AWB already exists for this Order ID
- Outcome: Request rejected; existing AWB returned
- Response: Alert A5.9 fired (multiple AWBs attempted); no new AWB created
- Resolution: Warehouse must cancel existing AWB before generating a new one

**F1.7 — Sort Identifier Code format validation failure**
- Code constructed but fails regex validation (illegal characters, wrong segment count)
- Outcome: AWB generation blocked; validation error returned
- Response: Alert A5.3 fired; Tech investigates alias data quality
- Resolution: Fix source alias values; re-generate

**F1.8 — Printer offline**
- AWB generated successfully but print job fails
- Outcome: AWB exists in system (retrievable) but no physical label
- Response: Warehouse Logistics notified; printer alert triggered
- Resolution: Reprint via explicit reprint flow (see UC3 below)

### External System Failure Scenarios (Pass 3)

**E1.1 — `warehouse_details` table unavailable**
- Database read fails for OriginWH resolution
- Response: Fail fast; do not generate partial AWB; retry 3x; escalate to Tech (P0)
- No downstream generation until resolved

**E1.2 — Hub-pincode mapping table unavailable**
- Cannot determine mid-mile vs direct
- Response: Same fail-fast pattern; block generation; Tech P0

**E1.3 — Barcode generation service 5xx / timeout**
- Response: Retry 3x with backoff; after all retries fail → "AWB Generation Failed" state; Alert A5.1
- Deferred generation: auto-retry when service health check passes

**E1.4 — Locus Geography API unavailable (if hub alias fetched live)**
- Response: Fallback to local cached mapping if cache age < 30 minutes; else block generation
- Cache staleness threshold: configurable, default 30 minutes

**E1.5 — Print service timeout**
- AWB created in system; print fails silently
- Response: Return success to OMS for AWB creation; fire separate printer alert to Ops; do not block order flow

---

## Use Case 2: Reverse AWB Generation

**Trigger:** Driver or Dispatch Portal initiates a return/pickup request for a hyperlocal reverse order.

**Trigger Source Change:** Reverse AWB generation is triggered via **Locus Dispatch Portal** (not Shipsy). This is the key integration change for reverse orders in M5.

**Pre-conditions:**
- Original forward order exists or return is standalone reverse order
- Pickup Pincode exists in active zone-pincode mapping
- Destination Hub (return warehouse) exists in Geography setup

### Happy Path

1. Dispatch Portal sends reverse AWB request with `order_id`, `pickup_pincode`, `pickup_address`, `pickup_contact`
2. System resolves Destination Hub (return warehouse alias)
3. System queries hub-pincode mapping for Pickup Pincode to determine mid-mile routing
4. Construct Sort Identifier Code (same format as forward, using Destination Hub as OriginWH equivalent)
5. Generate Code 128 barcode for Order ID
6. Assemble Reverse AWB with all required fields
7. Return AWB payload; print trigger sent to printer

### First-Order Failure Scenarios (Pass 2)

**F2.1 — Dispatch Portal unavailable**
- Reverse AWB cannot be triggered
- Response: Alert A5.1 equivalent for reverse; Ops + Tech notified; orders queued in OMS pending portal recovery
- Note: Forward AWB unaffected (different trigger path)

**F2.2 — Duplicate reverse AWB generation**
- Active reverse AWB already exists for this Order ID
- Response: Alert A5.9 fired; request rejected; existing AWB returned
- Resolution: Cancel existing before regenerating

**F2.3 — Pickup address missing or incomplete**
- Pickup Address or Pickup Contact is null/blank
- Response: Alert A5.5 fired (missing required fields); AWB generation blocked
- Resolution: Update order record in OMS; re-trigger

**F2.4 — Forward AWB type generated for reverse order (or vice versa)**
- AWB type mismatch
- Response: Alert A5.7 fired (P0); generation blocked at type validation
- Resolution: Correct order type in trigger; re-generate

---

## Use Case 3: AWB Reprint

**Trigger:** Warehouse Logistics requests reprint of an existing AWB (damaged label, printer failure).

**Pre-conditions:**
- AWB exists in active (non-cancelled) state for the Order ID
- Requestor has Warehouse Logistics or HO Central Logistics role

### Happy Path

1. Requestor selects Order ID in Locus Dispatch Portal
2. System verifies active AWB exists
3. Print job re-sent to designated printer
4. Physical label reprinted

### Failure Scenarios

**R1 — Reprint attempted for cancelled AWB**
- Response: Request rejected; error shown ("AWB cancelled — generate new AWB")

**R2 — Printer offline during reprint**
- Response: Reprint job queued; retry when printer comes online; Ops notified

---

## Use Case 4: AWB Cancellation

**Trigger:** Order cancelled in OMS after AWB generated, or AWB re-generation needed.

**Pre-conditions:**
- Active AWB exists for the Order ID

### Happy Path

1. OMS sends AWB cancellation request
2. System marks AWB status = Cancelled
3. Physical label (if already printed) marked void in system
4. Sort Identifier Code no longer valid for this AWB

### Failure Scenarios

**C1 — Cancellation on AWB for in-transit order**
- Order already departed warehouse; AWB cancellation received
- Response: AWB marked Cancelled in system; Alert A5.10 equivalent if cancellation is unexpected (post-departure)
- Note: Mid-trip cancellation RTO flow is M6 scope (A6.36); M5 only marks the AWB status

---

## State Intersection Scenarios (Pass 4)

**SI.1 — Order cancelled in OMS after AWB generated but before printing**
- AWB exists in system; physical label not yet produced
- Resolution: Auto-cancel AWB on order cancellation event from OMS; no print sent

**SI.2 — Order cancelled in OMS after AWB printed**
- Physical label already affixed to package
- Resolution: AWB marked Cancelled in system; physical label must be manually voided at warehouse (process: cross out label and note "CANCELLED" with timestamp); package returned to shelf
- Audit: Cancellation event logged with timestamp and user who actioned

**SI.3 — Hub alias changed in Geography after AWB printed**
- Sort Identifier Code on physical label now references old alias
- Resolution: Existing printed AWBs are NOT retroactively invalidated; alias change takes effect for future AWBs only
- Safeguard: Alert A5.4 fires if active AWBs reference a hub alias that no longer matches current Geography — Ops reviews and decides whether in-flight orders need re-labelling

**SI.4 — Pincode removed from zone mapping after AWB generated**
- Sort Identifier Code constructed with valid pincode; mapping now changed
- Resolution: Existing AWB valid; order continues on existing trip; next-day orders will fail AWB generation until pincode is re-mapped or serviceability removed

**SI.5 — Same Order ID submitted twice (duplicate ingestion)**
- Second AWB generation attempt for active Order ID
- Resolution: Alert A5.9; reject second request; return existing AWB details

**SI.6 — Transition period: Shipsy AWB exists, Locus AWB requested for same order**
- During cutover, an order may already have a Shipsy AWB
- Resolution: System checks for existing Shipsy AWB before Locus AWB generation; if both exist → Alert A5.8 (duplicate barcode risk); block Locus AWB creation until Shipsy AWB explicitly cancelled
- This scenario is bounded to the migration window; post-cutover, Shipsy no longer generates AWBs

---

## Cross-Cutting Concerns (Pass 5)

### Multi-Box Orders

If an order requires multiple packages (multi-box):
- **One AWB per box** (not per order) — each box gets its own barcode and Sort Identifier Code
- Sort Identifier Code includes a box suffix: `<OriginWH>_<Pincode>_<OrderID>_B<N>` where N = box number (1, 2, 3...)
- Example: `MUMNWH_400001_TM9988776_B1`, `MUMNWH_400001_TM9988776_B2`
- OMS must pass `box_count` in AWB generation request; system generates N AWBs
- If `box_count` absent → default to 1 box; no multi-box AWBs generated

**Open Question:** Current OMS passes `box_count`? Confirm with Eng.

### Barcode Symbology

Barcode format: **Code 128** (subset C for numeric, auto-selected by generation service)
- Min bar width: 0.25mm
- Human-readable text printed below barcode
- Label size: minimum 100mm × 60mm to ensure scan reliability at warehouse belt speed
- DPI: 203 dpi minimum (standard thermal printer)

### PII Handling

Drop Address, Drop Contact, Pickup Address, Pickup Contact are printed unmasked on physical labels.

**Data handling requirements:**
- Physical labels classified as PII-bearing documents
- Labels on undelivered returns / RTO packages: shred within 30 days of return to warehouse
- Digital AWB records: retain per standard order data retention policy (6 months active, archive after)
- Access to AWB records in Locus restricted to roles in Authorization Matrix above

### Label Format Versioning

If Sort Identifier Code format changes post-launch (e.g., new field added):
- New format takes effect only for AWBs generated after the format change date
- Existing printed AWBs are not reprocessed
- Tech must update regex validation to accept both old and new formats during transition window
- Format version tracked in AWB record for debugging

### Authorization at Generation Time

AWB generation must verify:
1. Requestor role is in Authorization Matrix
2. Order belongs to warehouse associated with requestor's entity (cross-warehouse AWB generation blocked)
3. Alert A1.4 (Cross-Warehouse Access) fires if violation detected

### Audit Trail

Every AWB event logged:
- Generation: `order_id`, `awb_id`, `generated_by`, `timestamp`, `sort_identifier_code`
- Cancellation: `order_id`, `awb_id`, `cancelled_by`, `timestamp`, `reason`
- Reprint: `order_id`, `awb_id`, `reprinted_by`, `timestamp`
- Format validation failure: `order_id`, `attempted_sort_code`, `validation_error`, `timestamp`

---

## Appendix A — Sample Forward AWB Layout

```
┌─────────────────────────────────────────────────────┐
│  TRUEMEDS HYPERLOCAL — FORWARD DELIVERY             │
│                                                     │
│  Sort Code: MUMNWH_400001_TM9988776                 │
│  ─────────────────────────────────────────────────  │
│  [██████████████████████████████████████]           │
│  TM9988776                                          │
│  ─────────────────────────────────────────────────  │
│  Deliver To:                                        │
│  123, Sharma Building, Andheri West, Mumbai 400001  │
│  Contact: +91-9876543210                            │
│  ─────────────────────────────────────────────────  │
│  Origin Hub: MUMNWH    Pincode: 400001              │
│  Partner: Locus Hyperlocal                          │
└─────────────────────────────────────────────────────┘
```

---

## Appendix B — Sample Reverse AWB Layout

```
┌─────────────────────────────────────────────────────┐
│  TRUEMEDS HYPERLOCAL — REVERSE / RETURN             │
│                                                     │
│  Sort Code: MUMNWH_PUNDC_411001_TM9988776           │
│  ─────────────────────────────────────────────────  │
│  [██████████████████████████████████████]           │
│  TM9988776-REV                                      │
│  ─────────────────────────────────────────────────  │
│  Pickup From:                                       │
│  456, Patel Colony, Pune 411001                     │
│  Contact: +91-9123456780                            │
│  ─────────────────────────────────────────────────  │
│  Return Hub: MUMNWH   Mid-Mile: PUNDC               │
│  Pickup Pincode: 411001                             │
└─────────────────────────────────────────────────────┘
```

---

## Metrics

| Metric | Target | Notes |
|---|---|---|
| AWB generation success rate | ≥ 99.5% | Measured per dispatch window |
| AWB generation latency (p95) | < 3 seconds | From OMS trigger to AWB ready |
| Sort Identifier Code format validation failure rate | < 0.1% | Indicates data quality issue |
| Duplicate AWB alert rate | < 0.05% | A5.9 should be near-zero in steady state |
| Printer failure rate | Baseline (establish in first 2 weeks) | — |
| Re-print rate | Baseline | Elevated reprint = label quality problem |

---

## Rollout

**Phase 1 — Pre-launch (T-14 days):**
- Populate `warehouse_details.Alias` for all active warehouses
- Verify all hub aliases in Geography setup
- Configure barcode generation service and test Code 128 output
- Confirm printer DPI and label size compliance at all warehouse locations

**Phase 2 — Parallel run (T-7 to T-0):**
- Generate both Shipsy AWBs and Locus AWBs for same orders
- Compare Sort Identifier Codes; validate format and hub mapping
- Do NOT use Locus AWBs for physical sorting during parallel run

**Phase 3 — Cutover (T-0):**
- Switch OMS to Locus AWB generation exclusively
- Disable Shipsy AWB generation path
- Ops confirm Sort Identifier Code scan success rate in first 2 dispatch windows

**Phase 4 — Shipsy decommission (T+30 days):**
- After 30 days stable operation, remove Shipsy AWB generation code
- Archive any Shipsy AWB records per data retention policy

---

## Open Questions

| # | Question | Affects | Owner |
|---|----------|---------|-------|
| Q1 | Does OMS currently pass `box_count` in dispatch payload? | Multi-box handling | Eng |
| Q2 | Barcode generation service — existing vendor or new? Rate limits? | F1.5 retry logic | Tech |
| Q3 | Label size and DPI — confirm thermal printer spec per warehouse | Appendix A/B | Ops |
| Q4 | `warehouse_details.Alias` — is column already populated for all active warehouses or needs migration? | F1.1 | Eng |
| Q5 | Reverse AWB trigger via Dispatch Portal — is portal login already Locus-integrated or separate setup? | UC2 | Tech |
| Q6 | PII label disposal: 30-day shred — is this existing SOP or new policy to define? | Cross-cutting PII | Legal/Ops |
| Q7 | During transition window: how long will Shipsy remain active? SI.6 dual-AWB risk window size | SI.6 | Tech |
