# Milestone 8 — Alert Spec: DMS Integration (Locus)

**Version:** v1
**Date:** 2026-05-20
**Scope:** Milestones 1–3, 5–6
**Definition:** Alert = deviation from desired operating behaviour. Not error logs — actionable signals to a human.

---

## M1 — Role Based Access Controls

| # | Alert | Trigger | Recipient | Severity |
|---|-------|---------|-----------|----------|
| A1.1 | **Access Change Webhook Missing** | Access change in Locus but no webhook received by Truemeds within X mins | Tech | P1 |
| A1.2 | **Redshift Sync Failure** | Webhook received but Redshift write fails → Active flag stale | Tech | P1 |
| A1.3 | **Redshift-Locus State Mismatch** | User deactivated in Locus but Redshift shows Active (or vice versa) | Tech | P1 |
| A1.4 | **Cross-Warehouse Access Granted** | User assigned access to warehouse outside their mapped entity | Tech + HO Central Logistics | P0 |
| A1.5 | **Elevated Access Without Sign-Off** | Access ≥ Control Tower or HO Central Logistics granted, no sign-off record exists | Tech + Kartik/Tejas/Fahad | P0 |
| A1.6 | **Orphaned Access** | User has active Locus access but no longer in Truemeds employee/vendor roster | Tech + HO Central Logistics | P1 |
| A1.7 | **New Warehouse Without POC** | Warehouse created in Locus with no POC mapped | Tech + HO Central Logistics | P1 |

---

## M2 — Geography Setup

| # | Alert | Trigger | Recipient | Severity |
|---|-------|---------|-----------|----------|
| A2.1 | **Pincode Mapped to Multiple Zones** | Duplicate pincode entry across zone-pincode mapping | Tech + Ops | P0 |
| A2.2 | **Serviceable Pincode Unmapped** | Pincode serviceable in Truemeds but no zone assignment in Locus | Tech + Ops | P1 |
| A2.3 | **Zone Assigned to Multiple Hubs** | 1:1 zone-to-hub constraint violated | Tech | P0 |
| A2.4 | **Hub Created via Dashboard** | Hub creation detected outside API path | Tech | P1 |
| A2.5 | **Zone Polygon Upload Failed Validation** | KML upload rejected (overlap, gap, invalid geometry) | Ops | P1 |
| A2.6 | **Serviceability-Zone Mismatch** | Pincode added/removed in Truemeds serviceability but Locus zone mapping not updated within X hours | Ops + Tech | P1 |
| A2.7 | **Empty Zone** | Zone exists with zero pincodes assigned | Tech + Ops | P1 |
| A2.8 | **Orphaned Hub** | Hub exists with zero zones assigned | Tech + Ops | P1 |
| A2.9 | **Hub Missing Destination Hub Config** | Hub has no eligible destination hubs configured → mid-mile has no valid path | Tech + Ops | P0 |
| A2.10 | **Hub Deleted With In-Flight Orders** | Hub deletion completed while active orders reference it as origin or destination | Tech | P0 |
| A2.11 | **Pincode Removed From Zone With Active Trip** | Pincode removed from zone while driver assigned to that zone has open trip | Tech + Ops | P0 |

---

## M3 — Driver Module

| # | Alert | Trigger | Recipient | Severity |
|---|-------|---------|-----------|----------|
| A3.1 | **Maker-Checker SLA Warning** | Pending request reaches 36 hours without Checker action | All eligible Checkers + HO Central Logistics | P1 |
| A3.2 | **Maker-Checker Request Expired** | Pending request hits 48-hour limit without resolution | Tech + HO Central Logistics | P1 |
| A3.3 | **Checker Pool Empty** | No users with Checker-eligible role exist → all requests will expire | Tech | P0 |
| A3.4 | **Maker-Checker Approved by Non-Checker** | Approval action taken by user not in Tech or HO Central Logistics role | Tech | P0 |
| A3.5 | **Terminated Driver in Planning Roster** | Driver with status=Terminated appears in active attendance or plan | Tech + Ops | P0 |
| A3.6 | **Suspended Driver in Active Trip** | Driver with status=Suspended has trip assigned | Tech | P0 |
| A3.7 | **Terminated Driver Has Open Trips** | Driver termination processed but one or more trips still in non-terminal state | Tech + Ops | P0 |
| A3.8 | **Terminated Driver Re-onboarding Bypassed Maker-Checker** | Driver with prior Terminated status active without approved Maker-Checker record | Tech + HO Central Logistics | P0 |
| A3.9 | **Duplicate Driver Identity** | Aadhaar or DL matches existing Active/Suspended driver during creation | Tech + Ops | P1 |
| A3.10 | **Driver Hub Not Found** | Driver assigned to hub that doesn't exist in Geography setup | Tech | P1 |
| A3.11 | **Driver Permanently Unassignable** | Driver's eligible pincodes contain zero zone mappings → excluded from all planning silently | Tech + Ops | P1 |
| A3.12 | **Driver Config Conflict** | Driver's blacklisted pincodes overlap with eligible pincodes | Tech + Ops | P1 |
| A3.13 | **Driver No Hub Assigned** | Driver created/active with no hub assigned → excluded from planning silently | Tech + Ops | P1 |

---

## M5 — Order Sorting

| # | Alert | Trigger | Recipient | Severity |
|---|-------|---------|-----------|----------|
| A5.1 | **AWB Generation Failure** | AWB generation call fails for an order | Tech + Ops | P0 |
| A5.2 | **Sort Identifier Code Generation Failure** | Pincode not resolvable to hub → Sort Identifier Code cannot be constructed | Tech + Ops | P0 |
| A5.3 | **Sort Identifier Code Format Violation** | Generated code doesn't match `<OriginWH_MidMileHub_Pincode_OrderID>` pattern | Tech | P1 |
| A5.4 | **Sort Identifier Code References Stale Hub** | Code constructed successfully but hub referenced doesn't exist in current Geography setup | Tech + Ops | P1 |
| A5.5 | **AWB Missing Required Fields** | AWB generated with one or more mandatory fields null/empty | Tech | P1 |
| A5.6 | **Mid-Mile Hub Mismatch** | Mid-mile hub populated for non-DC pincode, or blank for DC-served pincode | Tech + Ops | P1 |
| A5.7 | **AWB Type Mismatch** | Forward AWB generated for reverse order or vice versa | Tech + Ops | P0 |
| A5.8 | **Duplicate Barcode** | AWB barcode already exists for a different order | Tech | P0 |
| A5.9 | **Multiple AWBs for Same Order** | Second AWB generated for an order without prior AWB cancellation | Tech | P1 |
| A5.10 | **AWB for Already-Cancelled Order** | AWB generation triggered for order already in cancelled state | Tech + Ops | P1 |
| A5.11 | **AWB for Non-Serviceable Pincode** | AWB generated for pincode not in serviceable list | Tech + Ops | P1 |

---

## M6 — Planning Engine

### 6.1 — Order Ingestion

| # | Alert | Trigger | Recipient | Severity |
|---|-------|---------|-----------|----------|
| A6.1 | **Locus Ingestion Failed** | Order fails ingestion after 3 retries | Tech + Ops | P0 |
| A6.2 | **Ingestion Never Attempted** | AWB generated but no ingestion call made → order silently absent from Locus | Tech | P0 |
| A6.3 | **Locus 4xx Rejection** | Locus returns 4xx on ingestion → validation/schema error | Tech | P1 |
| A6.4 | **Duplicate Order ID Submitted** | order_id already exists in Locus at ingestion time | Tech | P1 |
| A6.5 | **Ingestion Payload Incomplete** | Minimum required fields missing at ingestion | Tech | P1 |
| A6.6 | **Locus API Timeout on Ingestion** | Ingestion request exceeds response threshold | Tech | P1 |
| A6.7 | **Stale Ingestion Failures** | Orders in "Locus Ingestion Failed" state for >X hours unactioned | Tech + Ops | P1 |
| A6.8 | **Address Change Blocked Post-Plan** | Address update attempted after plan creation → silently rejected | Tech + Ops | P1 |

### 6.2 — Address Resolution

| # | Alert | Trigger | Recipient | Severity |
|---|-------|---------|-----------|----------|
| A6.9 | **Order Parked — Low Confidence Address** | Order enters Parked state after resolution | Dispatcher | P1 |
| A6.10 | **Reverse Order Parked** | Reverse order enters Parked state (anomaly per PRD) | Tech + Ops | P0 |
| A6.11 | **Zone Not Found** | Pincode not mapped to any zone at resolution time | Tech + Ops | P0 |
| A6.12 | **Address Resolution Timeout** | Resolution exceeds 30-second threshold | Tech | P1 |
| A6.13 | **Order Stuck in Resolution Pending** | Order neither resolved nor timed out — hanging indefinitely | Tech | P1 |
| A6.14 | **Parked Order Approaching Dispatch Cutoff** | Parked order within 2 hours of dispatch cutoff without updated address | Dispatcher + Central Logistics | P0 |
| A6.15 | **Parked Order Held >3 Days** | Order in Parked/Hold state beyond 3-day window without cancellation triggered | Tech + Ops | P0 |
| A6.16 | **High Parked Order Rate — Zone/Pincode** | Parked % from specific pincode or zone exceeds threshold → systemic address quality issue | Ops + Analytics | P1 |
| A6.17 | **High Zone Not Found Rate — Specific Zone** | Zone Not Found errors concentrated in one zone → systemic geography gap | Tech + Ops | P1 |

### 6.3 — Driver Roster Selection

| # | Alert | Trigger | Recipient | Severity |
|---|-------|---------|-----------|----------|
| A6.18 | **Unallocated Orders After Plan Creation** | Orders remain in Unallocated queue after plan created | Dispatcher + Ops | P1 |
| A6.19 | **Attendance Not Marked Before Cutoff** | Attendance not finalised within X minutes of dispatch cutoff | Dispatcher | P1 |
| A6.20 | **Zone Has Orders, Zero Drivers Rostered** | At plan creation, zone has pending orders but no driver marked present | Dispatcher + Ops | P0 |
| A6.21 | **Suspended/Terminated Driver Marked Present** | Attendance marked for driver with non-Active status | Tech + Ops | P0 |
| A6.22 | **Fleet Capacity Significantly Undersized** | Total order volume exceeds total rostered driver capacity by >X% | Ops + Central Logistics | P1 |
| A6.23 | **Driver Rostered to Wrong Hub** | Driver marked present at hub whose zones don't include driver's eligible pincodes | Tech + Ops | P1 |
| A6.24 | **Driver Capacity Limit Not Configured** | Driver's vehicle type has no order capacity limit set → unlimited orders assignable | Tech | P1 |
| A6.25 | **Attendance Marked for Driver Without App Session** | Attendance marked for driver with no active app login | Ops | P1 |

### 6.4 — Plan Creation

| # | Alert | Trigger | Recipient | Severity |
|---|-------|---------|-----------|----------|
| A6.26 | **SLA Risk Flag Raised** | Locus flags orders at risk of missing delivery window before plan finalisation | Dispatcher + Ops | P1 |
| A6.27 | **Plan Not Finalised Before Dispatch Cutoff** | Plan still in draft state at dispatch cutoff → no orders dispatched | Dispatcher + Ops | P0 |
| A6.28 | **Hard Pincode Constraint Violated** | Driver assigned order outside hard-constrained eligible pincodes | Tech | P0 |
| A6.29 | **Wrong Driver Type for Trip Type** | Runner assigned to last-mile trip, or Driver assigned to mid-mile trip | Tech + Ops | P0 |
| A6.30 | **Empty Trip Created** | Last-mile or mid-mile trip created with zero orders | Tech + Ops | P1 |
| A6.31 | **Planning Engine Override Rate Breach** | Override % for trip or shift exceeds defined threshold | Ops + Analytics | P1 |
| A6.32 | **High Override Rate — Specific Dispatcher** | Single dispatcher's override rate significantly above warehouse average | Ops | P1 |
| A6.33 | **Edit Lock Bypass Attempted** | Edit attempted on last-mile plan after first handover scan, or mid-mile after departure | Tech | P0 |
| A6.34 | **Mid-Mile Trip Completion Stalled** | Mid-mile trip not marked Complete within X hours of expected DC arrival | Ops + Central Logistics | P1 |
| A6.35 | **Partial Mid-Mile Batch at DC** | Not all orders in mid-mile batch scanned at DC within X hours of trip arrival | Ops | P1 |
| A6.36 | **Post-Departure Cancellation RTO Not Triggered** | Order cancelled post-departure but RTO not initiated in Locus | Tech | P0 |
| A6.37 | **Route Recompute Failed Post-Cancellation** | Recomputation fails after in-trip cancellation → driver app shows stale sequence | Tech | P0 |

### 6.5 — Replanning

| # | Alert | Trigger | Recipient | Severity |
|---|-------|---------|-----------|----------|
| A6.38 | **Driver Breakdown — No Replan Initiated** | Driver breakdown reported but no replanning action taken within X minutes | Dispatcher + Ops | P0 |
| A6.39 | **Stranded Orders Not Reassigned** | Stranded orders from breakdown unassigned for >X minutes | Dispatcher + Ops | P0 |
| A6.40 | **Stranded Orders Exceed Remaining Capacity** | Stranded volume cannot fit remaining active drivers' capacity | Ops + Central Logistics | P0 |
| A6.41 | **Emergency Injection by Non-Dispatcher** | Order injection into active trip by user without Dispatcher role | Tech | P0 |
| A6.42 | **Route Recompute Failed Post-Emergency Injection** | Recomputation fails after emergency order added | Tech | P0 |
| A6.43 | **Emergency Injection Silent App Fail** | Recompute succeeds on backend but driver app not notified → driver running stale route | Tech | P0 |

---

## Summary

| Milestone | Alert Count |
|-----------|-------------|
| M1 — RBAC | 7 |
| M2 — Geography | 11 |
| M3 — Driver Module | 13 |
| M5 — Order Sorting | 11 |
| M6 — Planning Engine | 43 |
| **Total** | **85** |

---

## Open Questions

| # | Question | Affects |
|---|----------|---------|
| Q1 | Webhook lag threshold (X mins) | A1.1 |
| Q2 | Serviceability sync lag tolerance (X hours) | A2.6 |
| Q3 | Maker-Checker SLA warning lead time (36h assumption — confirm with ops) | A3.1 |
| Q4 | Alert channel per severity — Metabase only, or Slack/email for P0s? | All |
| Q5 | Locus webhook coverage — does Locus expose hub creation source, hub deletion events? | A2.4, A2.10 |
| Q6 | Stale ingestion failure threshold (X hours) | A6.7 |
| Q7 | Attendance cutoff window (X minutes before dispatch) | A6.19 |
| Q8 | Fleet capacity breach % threshold | A6.22 |
| Q9 | Mid-mile completion stall window (X hours) | A6.34, A6.35 |
| Q10 | Stranded order reassignment window (X minutes) | A6.38, A6.39 |
| Q11 | Override rate threshold (% — define with Analytics) | A6.31, A6.32 |
