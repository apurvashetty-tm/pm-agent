# [PRD] DMS Integration — Milestone 5: Order Sorting

**Version:** v2
**Date:** 2026-05-21
**Supersedes:** 2026-05-20-dms-m5-order-sorting-v1.md
**Author:** Tejas Bhalerao
**Status:** In Review

---

## Version History

| Version | Date | Summary of Changes |
|---|---|---|
| v1 | 2026-05-20 | Initial draft |
| v2 | 2026-05-21 | Auth matrix corrected (AWB generation is system-triggered); `.Alias` → `.name` throughout; Process Overview added; UC2 trigger corrected (Dispatch Portal only, not Driver); F2.3 removed (pickup address always present); UC3 rewritten (forward: re-scan box, reverse: portal download); UC4 removed (no AWB cancellation flow); Pass 4 and Pass 5 removed; barcode service internals removed; label disposal policy removed; all open questions resolved |

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

AWB generation is system-triggered and does not require manual authorisation. The following human-initiated actions require role-based access control:

| Action | Permitted Roles |
|---|---|
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

## Process Overview

**Forward AWB (no change to warehouse physical flow):**
Box scanned at warehouse → AWB generated automatically → AWB print begins immediately → physical label affixed to box before dispatch.

This is the same physical process used today with Shipsy. The change is that Locus now sources the AWB and Sort Identifier Code instead of Shipsy.

**Reverse AWB:**
Dispatcher portal login → Order ID selected → "Download AWB" clicked → AWB generated and presented as PDF → dispatcher prints and coordinates pickup.

---

## Field Reference — Forward AWB

| Field | Source | Notes |
|---|---|---|
| Order ID | Truemeds OMS | Unique per order; used as terminal component of Sort Identifier Code |
| Barcode for Order ID | Internal barcode service | Symbology: **Code 128** |
| Delivery Partner | Locus configuration | Maps to warehouse entity |
| Origin Hub | Geography setup (Hub entity) | `warehouse_details.name` column — must exist in active Locus geography |
| Mid Mile Hub | Geography setup (Hub entity) | Blank when no mid-mile segment. Blank format: three-part code `<OriginWH>_<Pincode>_<OrderID>` (hub segment omitted entirely) |
| Delivery Pincode | OMS order record | Must be in active zone-pincode mapping |
| Drop Address | OMS order record | Unmasked on physical label |
| Drop Contact | OMS order record | Unmasked on physical label |
| Sort Identifier Code | Constructed by Truemeds | See format spec below |

**Label format:** Same as current reverse AWB label format.

---

## Field Reference — Reverse AWB

| Field | Source | Notes |
|---|---|---|
| Order ID | Truemeds OMS | Unique per original forward order |
| Barcode for Order ID | Internal barcode service | Symbology: **Code 128** |
| Delivery Partner | Locus configuration | Maps to warehouse entity |
| Destination Hub | Geography setup (Hub entity) | Return warehouse |
| Mid Mile Hub | Geography setup (Hub entity) | Blank when no mid-mile segment. Same three-part blank format as forward |
| Pickup Pincode | OMS order record | Customer's pincode |
| Pickup Address | OMS order record | Unmasked on physical label |
| Pickup Contact | OMS order record | Unmasked on physical label |
| Sort Identifier Code | Constructed by Truemeds | See format spec below |

**Label format:** Same as current reverse AWB label format.

---

## Sort Identifier Code Format Specification

**With mid-mile hub:**
```
<OriginWH>_<MidMileHub>_<Pincode>_<OrderID>
```
Example: `MUMNWH_PUNDC_411001_TM9988776`

**Without mid-mile hub (direct delivery):**
```
<OriginWH>_<Pincode>_<OrderID>
```
Example: `MUMNWH_400001_TM9988776`

**Rules:**
- `OriginWH`: value from `warehouse_details.name` column — short alphanumeric code, no spaces
- `MidMileHub`: value from Geography Hub entity `name` field — same constraint
- `Pincode`: 6-digit numeric string
- `OrderID`: Truemeds OMS order ID
- Delimiter: underscore `_` only
- No spaces, no special characters outside underscore
- Mid-mile determination: if Delivery Pincode maps to a zone whose hub has a `destination_hub` configured → mid-mile hub populated; otherwise omitted

**Validation:** Generated code must match regex `^[A-Z0-9]+_([A-Z0-9]+_)?[0-9]{6}_[A-Z0-9]+$`

---

## Use Case 1: Forward AWB Generation

**Trigger:** OMS dispatches a forward hyperlocal order for physical fulfilment. AWB generation is automatic — no manual action required.

**Pre-conditions:**
- Order ID exists in OMS with status = Ready for Dispatch
- Delivery Pincode exists in active zone-pincode mapping
- Origin Hub exists in Geography setup with `warehouse_details.name` populated
- No existing AWB for this Order ID

### Happy Path

1. OMS triggers AWB generation request with `order_id`, `delivery_pincode`, `drop_address`, `drop_contact`
2. System resolves `OriginWH` from `warehouse_details.name` for the dispatching warehouse
3. System queries hub-pincode mapping to determine if Delivery Pincode is mid-mile or direct
4. If mid-mile: fetch `MidMileHub` name from Geography
5. Construct Sort Identifier Code per format spec
6. Generate Code 128 barcode for Order ID
7. Assemble AWB with all required fields
8. Return AWB payload; print trigger sent to warehouse printer automatically
9. Physical label printed and affixed to order package

### Edge Cases

**EC1.1 — `warehouse_details.name` missing or blank**
- System cannot construct Sort Identifier Code; OriginWH segment is null
- Outcome: AWB generation blocked; error returned to OMS
- Response: Alert A5.2 fired; order enters "AWB Generation Failed" state; Ops + Tech notified
- Resolution: Tech populates missing name in `warehouse_details`; trigger re-generation

**EC1.2 — Delivery Pincode not in hub-pincode mapping**
- System cannot determine mid-mile vs direct; Sort Identifier Code construction blocked
- Outcome: AWB generation blocked
- Response: Alert A5.2 fired; check serviceability-geography sync (M2 A2.6)
- Resolution: Geography team adds pincode to correct zone; re-generate

**EC1.3 — Mid-mile hub `name` field blank in Geography**
- Hub exists but `name` field is blank → Sort Identifier Code mid-mile segment is null
- Outcome: AWB generation blocked to prevent malformed code
- Response: Alert A5.4 fired (stale hub reference); Tech notified
- Resolution: Tech populates hub name; re-generate

**EC1.4 — Order ID not resolvable in OMS**
- OMS sends `order_id` that doesn't exist or is in wrong status
- Outcome: AWB generation rejected at validation
- Response: OMS integration error logged; no alert fired (OMS-side issue)
- Resolution: OMS team investigates order state

**EC1.5 — Duplicate AWB generation attempt**
- AWB already exists for this Order ID
- Outcome: Request rejected; existing AWB returned
- Response: Alert A5.9 fired; no new AWB created
- Resolution: Warehouse must verify order state before re-triggering

**EC1.6 — Sort Identifier Code format validation failure**
- Code constructed but fails regex validation (illegal characters, wrong segment count)
- Outcome: AWB generation blocked; validation error returned
- Response: Alert A5.3 fired; Tech investigates name data quality
- Resolution: Fix source name values; re-generate

**EC1.7 — Printer offline**
- AWB generated successfully but print job fails
- Outcome: AWB exists in system (retrievable) but no physical label
- Response: Warehouse Logistics notified; printer alert triggered
- Resolution: Reprint via UC3

**EC1.8 — `warehouse_details` table unavailable**
- Database read fails for OriginWH resolution
- Response: Fail fast; do not generate partial AWB; retry 3x; escalate to Tech (P0)

**EC1.9 — Hub-pincode mapping table unavailable**
- Cannot determine mid-mile vs direct
- Response: Fail-fast; block generation; Tech P0

**EC1.10 — Locus Geography API unavailable**
- Response: Fallback to local cached mapping if cache age < 30 minutes; else block generation
- Cache staleness threshold: configurable, default 30 minutes

**EC1.11 — Print service timeout**
- AWB created in system; print fails
- Response: Return success to OMS for AWB creation; fire separate printer alert to Ops; do not block order flow

---

## Use Case 2: Reverse AWB Generation

**Trigger:** Dispatch Portal generates a reverse AWB for a hyperlocal reverse order.

**Pre-conditions:**
- Original forward order exists or return is a standalone reverse order
- Pickup Pincode exists in active zone-pincode mapping
- Destination Hub (return warehouse) exists in Geography setup

### Happy Path

1. Dispatcher logs into Dispatch Portal, selects Order ID, clicks "Download AWB"
2. System resolves Destination Hub (return warehouse name)
3. System queries hub-pincode mapping for Pickup Pincode to determine mid-mile routing
4. Construct Sort Identifier Code (same format, using Destination Hub as OriginWH equivalent)
5. Generate Code 128 barcode for Order ID
6. Assemble Reverse AWB with all required fields
7. AWB presented to Dispatcher as PDF for download and print

### Edge Cases

**EC2.1 — Dispatch Portal unavailable**
- Reverse AWB cannot be triggered
- Response: Alert A5.1 equivalent for reverse; Ops + Tech notified; orders queued pending portal recovery
- Note: Forward AWB unaffected (different trigger path)

**EC2.2 — Duplicate reverse AWB generation**
- Reverse AWB already exists for this Order ID
- Response: Alert A5.9 fired; request rejected; existing AWB returned
- Resolution: Dispatcher downloads existing AWB instead of generating new one

**EC2.3 — AWB type mismatch (forward AWB generated for reverse order or vice versa)**
- Response: Alert A5.7 fired (P0); generation blocked at type validation
- Resolution: Correct order type in trigger; re-generate

---

## Use Case 3: AWB Reprint

**Trigger:** Warehouse Logistics or Dispatcher requests reprint of an existing AWB (damaged label, printer failure, download needed).

### Forward AWB Reprint

1. Warehouse staff scans the box again at warehouse
2. System detects existing active AWB for the scanned Order ID
3. Print job re-triggered to warehouse printer
4. Physical label reprinted and affixed

### Reverse AWB Reprint

1. Dispatcher logs into Dispatch Portal, selects Order ID
2. Clicks "Download AWB"
3. AWB PDF served again (same AWB, not a new generation)

### Edge Cases

**R1 — Reprint for a cancelled/invalid AWB**
- Response: Request rejected; error shown to Dispatcher

**R2 — Printer offline during forward reprint**
- Response: Reprint job queued; retry when printer comes online; Ops notified

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
- Populate `warehouse_details.name` for all active warehouses
- Verify all hub names in Geography setup
- Configure and test Code 128 barcode output
- Confirm label format matches current reverse AWB format at all warehouse locations

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
- Archive Shipsy AWB records per data retention policy

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
