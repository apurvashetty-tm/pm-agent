# [PRD] DMS Integration — Milestone 6: Planning Engine

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
| View plan (any state) | All roles |
| Mark driver attendance | Warehouse Dispatcher, HO Central Logistics |
| Finalise plan | Warehouse Dispatcher, HO Central Logistics |
| Override / reassign trip | Warehouse Dispatcher, HO Central Logistics |
| Emergency order injection into active trip | Warehouse Dispatcher, HO Central Logistics |
| Edit plan pre-handover (add/remove/resequence) | Warehouse Dispatcher, HO Central Logistics |
| Edit plan post-handover (resequence only) | Warehouse Dispatcher, HO Central Logistics |
| Cancel order pre-departure | Warehouse Dispatcher, HO Central Logistics |
| Cancel order post-departure | HO Central Logistics only |
| Trigger manual re-ingestion | Tech, HO Central Logistics |
| Update parked order address | Warehouse Dispatcher, HO Central Logistics |
| Mark mid-mile trip Complete | Runner (via Driver App) |
| Trigger driver breakdown | Driver (via Driver App) |

---

## Objective

Enable end-to-end dispatch planning on Locus for all hyperlocal forward and reverse orders — from order ingestion through address resolution, driver roster selection, route creation, and mid-trip replanning.

---

## Why Now?

Planning Engine is the operational core of the DMS migration. Every prior milestone (M2 Geography, M3 Driver Module, M5 Order Sorting) exists to feed this one. No dispatch can occur until M6 is live. This milestone is also the primary risk surface for the cutover — incorrect routing or driver assignment at launch directly degrades NPS and SLA performance.

---

## Dispatch Cutoff Definition

**Dispatch cutoff** = the time by which a plan must be finalised for orders to depart in the current dispatch window. It is:

- **Configured per hub** in Locus planning engine configuration
- **Typically set 30–45 minutes before expected departure time** (exact value: open question, see Q1)
- **Triggered manually** by the dispatcher clicking "Finalise Plan" — there is no automatic cutoff enforcement today
- **Referenced in:** UC2.2 (parked order escalation), UC3.2 (attendance lock), UC4 (plan finalisation)

Until dispatch cutoff: attendance is editable, orders can be added/parked/cancelled, plan remains a draft.
After dispatch cutoff: attendance is locked; orders cannot be added to plan; departures begin.

---

## Use Case 1: Passing Order to Locus

### UC1.1 — Standard Order Ingestion

**Trigger:** AWB generated for a forward or reverse hyperlocal order in Truemeds OMS.

**Pre-conditions:**
- Order has active, non-cancelled AWB (M5)
- Sort Identifier Code on AWB is valid (passes M5 format regex)
- Order not previously ingested in Locus (no active record for this order_id)

**Minimum required payload fields:**

| Field | Source |
|---|---|
| order_id | Truemeds OMS |
| order_type | OMS (forward / reverse) |
| delivery_address | OMS (full address string) |
| delivery_pincode | OMS |
| customer_contact | OMS |
| origin_hub | Geography (M2) |
| mid_mile_hub | Geography (M2) — blank if direct delivery |
| sort_identifier_code | AWB (M5) |
| awb_id | AWB (M5) |

**Sort Identifier Code validation at ingestion:** If `sort_identifier_code` fails M5 format regex, ingestion is blocked with a 422 validation error. Alert A5.3 fires. This is a hard block — an order with a malformed sort code must not enter Locus backlog.

**Happy path:**
1. OMS triggers ingestion API call with full payload
2. Locus validates payload; all required fields present and valid
3. Locus returns 201; order enters **Open** state in Locus backlog
4. Truemeds records Locus order reference alongside internal order_id

### UC1.2 — API Failure on Order Ingestion

**Failure types:**
- Network timeout
- Locus 5xx (service error)
- Connection refused (Locus completely down — distinct from per-order failure)

**Response — per-order retry:**
1. Retry up to 3 times with exponential backoff (5s, 15s, 30s)
2. After 3 failures: order enters **"Locus Ingestion Failed"** state
3. Alert A6.1 fires (Tech + Ops)
4. Order excluded from planning until manually re-triggered

**Response — full service down (Locus API unreachable):**
1. All new ingestion attempts fail immediately at connection layer
2. Circuit breaker opens after 5 consecutive failures within 60 seconds
3. While circuit is open: new orders queued in Truemeds with status "Pending Ingestion" (not "Failed") — distinct from per-order retry failure
4. Alert fires to Tech (P0): Locus ingestion service unreachable
5. Circuit probed every 60 seconds; closes on successful health-check response
6. On circuit close: all "Pending Ingestion" orders sent to Locus in batches of 50, with 2-second spacing to avoid burst rejection

**Manual re-trigger:** Engineering maintains a re-trigger tool for individual failed orders and batch re-trigger for all orders in "Locus Ingestion Failed" state. Accessible to Tech and HO Central Logistics only.

**Stale failure gate:** Orders in "Locus Ingestion Failed" state for more than X hours without action trigger Alert A6.7 (threshold: open question, see Q2).

### UC1.3 — Locus Rejects the Order (4xx)

**Rejection types:**

| HTTP Code | Meaning | Resolution |
|---|---|---|
| 400 | Malformed payload — required field missing or wrong type | Fix payload; re-ingest |
| 409 | order_id already exists in Locus | Investigate duplicate ingestion (UC1.4) |
| 422 | Validation failure — pincode not in configured zones, hub not found | Fix Geography mapping; re-ingest |
| 403 | Auth failure — API key invalid or expired | Tech rotates API key |

**Response:**
1. Rejection reason logged against order_id
2. Order enters **"Locus Rejected"** state (distinct from "Locus Ingestion Failed")
3. Alert A6.3 fires; rejection reason surfaced in Locus Ingestion Failed dashboard queue
4. Order re-ingested once root cause corrected

**Dashboard view:** "Locus Ingestion Failed" and "Locus Rejected" queues must be visible in same ops dashboard. Dispatcher can see rejection reason per order without Tech assistance.

### UC1.4 — Duplicate Order Ingestion

**Detection:** Locus returns 409 on second ingestion attempt for same order_id.

**Response:**
1. Alert A6.4 fires
2. Truemeds checks: does active (non-cancelled) order with this order_id exist in Locus?
   - **Yes:** Log duplicate attempt; do not create second record; return existing Locus reference to OMS
   - **No (prior record cancelled):** Allow re-ingestion; new record created
3. Every duplicate attempt (whether blocked or allowed) logged with: `order_id`, `attempt_timestamp`, `requestor`, `outcome`
4. Duplicate attempt count per order surfaced in reconciliation report

### UC1.5 — Order Modification After Ingestion

**Pre-plan modification (address change before plan creation):**
1. OMS pushes updated address to Locus via address update API
2. Locus re-runs address resolution on updated address
3. If resolution result changes (e.g., previously Open → now Parked): order state updates accordingly; dispatcher notified
4. Alert A6.8 fires if update attempted after plan creation (blocked — see below)

**Post-plan modification (blocked):**
- Address updates not permitted once order is assigned to a plan
- Ops must: cancel order → re-ingest updated order → re-add to next dispatch window plan
- Re-ingested order joins backlog at time of re-ingestion; does not inherit original queue position
- Customer communication re: delay is Ops responsibility (outside Locus scope)

**Post-plan address update attempted:**
- Update request blocked at API layer; 409 returned
- Alert A6.8 fires (Tech + Ops)
- Dispatcher sees error in dashboard with instruction to cancel and re-ingest

**Parked order address update:**
- If order is in Parked state, address update IS permitted (this is the intended resolution path per UC2.2)
- On successful update: Locus auto-triggers re-resolution immediately
- No dispatcher manual action required to initiate re-resolution after address update on a Parked order

---

## Use Case 2: Address Resolution

### UC2.1 — Standard Resolution

**Trigger:** Automatic on successful order ingestion. No dispatcher action required.

**Confidence scoring:**

| Score | Meaning | Order State |
|---|---|---|
| High | Address matched to known location with high precision | Open — eligible for planning |
| Medium | Address matched with moderate confidence | Open — eligible for planning |
| Low | Address ambiguous or unrecognisable | **Parked** — excluded from planning |

**Resolution timeout:** Default 30 seconds (configurable per hub, see Q3). If resolution not completed within threshold → UC2.4.

**Silently missing case:** If resolution completes but returns High/Medium confidence AND pincode not mapped to any zone → UC2.3 (Zone Not Found), not Parked. These are two distinct error states with different resolution paths.

### UC2.2 — Parked Order — Dispatcher Resolution Flow

**On parking:**
1. Alert A6.9 fires to Warehouse Dispatcher
2. Dispatcher calls customer; collects corrected address
3. Dispatcher updates address in Locus dashboard
4. Locus auto-triggers re-resolution (per UC1.5 parked-order update rule)

**Resolution outcomes:**
- High or Medium → order moves to **Open**; enters planning backlog
- Low again → order remains **Parked**; dispatcher attempts again or escalates

**Escalation trigger:**
- Parked order within **2 hours of dispatch cutoff** without Open state → Alert A6.14 fires to Dispatcher + Central Logistics (P0)
- Escalation action: Central Logistics decides hold vs cancel

**Hold expiry:**
- Order in Parked/Hold state beyond **3 days** → Alert A6.15 fires
- Cancellation is **manual** — Ops must explicitly cancel; no auto-cancellation
- If Ops misses the alert: order remains in Parked state indefinitely until manually actioned. This is a known gap in the current flow. Recommendation: schedule daily report of all orders in Parked state > 2 days

**3-day clock starts:** from time order first enters Parked state (not from most recent address update attempt)

### UC2.3 — Pincode Not Mapped to Any Zone

**Distinct from Parked:** Confidence is High or Medium (address is valid) but pincode has no zone in Locus Geography — the order cannot be routed regardless of confidence.

**Order state: "Zone Not Found"** — not Parked. Must be visually distinct in dashboard.

**Response:**
1. Alert A6.11 fires (Tech + Ops, P0)
2. Order excluded from plan creation
3. Geography team adds pincode to correct zone (M2 scope)
4. On zone mapping creation: Locus re-evaluates order automatically vs requires manual re-trigger (open question — see Q4)

**Zone Not Found ≠ serviceability gap:** Pincode may be serviceable in Truemeds but not yet mapped in Locus Geography. Alert A2.6 (M2/M8) should already fire for this sync gap; A6.11 is the planning-layer signal of the same underlying issue.

### UC2.4 — Address Resolution Timeout

**Trigger:** Resolution not completed within configurable threshold (default 30s).

**Order state: "Resolution Pending"**

**Response:**
1. Alert A6.12 fires (Tech, P1)
2. Engineering re-triggers resolution for stuck order via internal tooling
3. If re-trigger also times out: order moves to Parked state (treated as Low confidence for planning purposes)
4. Alert A6.13 fires if order remains in Resolution Pending state beyond 10 minutes without completing

**Locus service health check:** If multiple orders enter Resolution Pending simultaneously → likely Locus-side resolution service degradation. Tech escalation path: P0 incident.

### UC2.5 — Reverse Order Address Resolution

**Resolves pickup address** (not delivery address). Confidence expected High (prior delivery occurred at same location).

**If reverse order enters Parked state:**
- Treated as anomaly
- Alert A6.10 fires (Tech + Ops, P0)
- Ops investigates whether pickup address changed since original delivery

---

## Use Case 3: Driver Roster Selection

### UC3.1 — Standard Roster Compilation

**At plan creation time, Locus presents drivers eligible for roster:**

**Included:**
- Driver status = Active
- Hub assignment matches current hub
- Driver type matches trip type (Runner for mid-mile, Driver for last-mile)
- No active trip (no trip in non-terminal state)
- Attendance marked for current shift

**Excluded:**
- Status = Suspended or Terminated
- Hub mismatch
- Active trip exists
- Attendance not marked
- No eligible pincodes with zone mapping (silently excluded risk — see SI2)

**"No Eligible Orders" visibility:** Drivers whose eligible pincodes do not intersect current backlog are shown in roster as **"No Eligible Orders"** status — never silently absent. Dispatcher can see them and manually assign if needed.

### UC3.2 — Manual Attendance Marking

**Rules:**
- Ops marks attendance for drivers who physically reported
- Only attendance-marked drivers eligible for plan
- Attendance editable until dispatcher clicks **"Finalise Plan"**
- Late-arriving driver: can be added to attendance before finalisation; included in plan
- After finalisation: attendance locked; no new drivers addable to current window's plan

**Suspended/Terminated driver marked present:**
- System blocks attendance marking for non-Active driver
- Alert A6.21 fires (Tech + Ops, P0)
- Attendance mark does not save

**Attendance marked for driver without active app session:**
- Allowed (driver may not have opened app yet)
- Alert A6.25 fires (Ops, P1) as a warning — Ops to verify driver is physically present
- Alert is informational, not a block

### UC3.3 — No Eligible Drivers Available

**Trigger:** Plan creation attempted; zero drivers on roster after filtering.

**Response:**
1. Locus surfaces "No Available Drivers" state; plan creation blocked
2. Alert A6.20 fires (Dispatcher + Ops, P0) if zone has pending orders with zero drivers
3. Dispatcher options:
   - Wait for driver to arrive; mark attendance; proceed
   - Request cross-hub driver deployment (initiated by Central Logistics in Truemeds internal workforce management — not through Locus)
   - Escalate for manual delivery
4. Every zero-driver event logged; surfaced in daily ops report

### UC3.4 — Driver Goes Offline After Roster Selection

**Trigger:** Driver included in roster loses connectivity or logs out before plan finalisation.

**Response:**
1. Locus flags driver as unavailable; alerts Dispatcher
2. Driver removed from active roster
3. No orders affected at this stage (allocation happens at plan creation, after roster selection)
4. Plan computed without offline driver
5. If driver reconnects before finalisation: dispatcher can re-add to attendance; driver included in plan

### UC3.5 — Driver Capacity Limits

**Capacity is configured per vehicle type** (not per driver):

| Vehicle Type | Default Capacity | Configurable? |
|---|---|---|
| 2-Wheeler | 15 orders/shift | Yes (per hub) |
| 3-Wheeler | 25 orders/shift | Yes (per hub) |
| Truck | TBD | Yes (per hub) |

**Rules:**
- Per-driver overrides not supported
- Driver must not be assigned orders beyond vehicle type limit
- When total roster capacity < backlog volume: overflow orders surface in **"Unallocated Orders"** queue with Alert A6.22 (Ops + Central Logistics, P1)

**Driver capacity limit not configured:**
- If vehicle type has no capacity limit set: unlimited orders assignable to that driver
- Alert A6.24 fires (Tech, P1) — this is a configuration gap, not a runtime error
- Must be caught in pre-launch checklist

**Unallocated orders across dispatch windows:**
- Orders in Unallocated queue do not automatically carry forward to next dispatch window
- They remain in Locus backlog (Open state) and are included in next window's plan creation
- Ops must re-assess: if order has been unallocated for N consecutive windows → escalate to Central Logistics
- Threshold N: open question, see Q5

---

## Use Case 4: Plan Creation

**Routing logic:**
1. Resolve address → identify pincode
2. Resolve pincode → configured zone
3. If zone served directly from main hub → last-mile plan (UC4.2)
4. If zone served via DC → mid-mile plan (UC4.1) first, then last-mile from DC

### UC4.1 — Order Orchestration for Mid-Mile

**Happy path:**
1. Locus identifies orders destined for DC-served pincodes
2. Orders batched into mid-mile trip
3. Dispatcher **manually selects and assigns** a Runner from Runner roster (not automated)
4. Runner's manifest lists all orders in batch
5. Runner departs; scans orders at DC on arrival
6. Once every order in batch has individual scan + DC staff acknowledgement → Runner marks trip **Complete**
7. Orders now in DC backlog; available for DC dispatcher to create last-mile plan

**Partial batch completion:**
- Trip not marked Complete until every order has terminal status (received at DC OR explicitly reassigned)
- Locus blocks Runner from marking Complete if any order in batch has no scan record
- Orders with scan record at DC: status = at DC backlog; cannot be re-queued
- Orders without scan record: remain on Runner's manifest; must be accounted for before Complete

**Runner no-show or breakdown:**
- All orders in batch surfaced as **"Stranded Mid-Mile"** alert
- Ops reassigns to available Runner
- Orders already scanned and acknowledged at DC → not re-queued (DC has physical custody)
- Only orders not yet received at DC → reassigned to new Runner's manifest

**DC unavailable:**
- Ops removes serviceability for affected pincodes in Truemeds internal systems before dispatch window
- M6 does not handle live DC unavailability detection — Ops must proactively manage this

**Mid-mile trip edit lock:**
- Edits permitted until Runner confirms departure (trip marked "Departed")
- After "Departed": no order-level edits on mid-mile trip
- Last-mile plan (not yet created from DC side) remains fully editable

### UC4.2 — Order Orchestration for Last-Mile

**Happy path:**
1. Locus creates last-mile plan for orders from main warehouse or cleared mid-mile at DC
2. Orders grouped by proximity and zone; optimised routes and sequences generated
3. Each trip allocated to one Driver
4. Route and sequence appear on Driver App

**SLA breach at creation:**
- Trip cannot complete within promised delivery window given driver shift and route duration
- Locus flags as **"SLA Risk"** before finalisation
- Dispatcher must explicitly acknowledge flag before finalising plan
- Acknowledgement logged: dispatcher ID, timestamp, flagged trip ID

**SLA Risk does not block plan creation** — dispatcher can override with acknowledgement. This is intentional: blocking dispatch for SLA risk creates a worse outcome than dispatching late with awareness.

### UC4.3 — Driver Roster to Route Mapping

**Assignment logic:**
- Locus maps each driver's eligible pincodes to zones containing those pincodes
- Driver eligible for a zone if ≥1 eligible pincode falls within that zone
- Hard-constrained drivers: not assigned outside their eligible pincodes (Alert A6.28 if violated)
- Soft-constrained drivers: Locus prefers eligible pincodes but can assign outside if capacity demands

**Overrides:**
- Dispatchers can: reassign trips between drivers, add/remove orders, resequence deliveries
- All overrides logged: dispatcher user ID, timestamp, action type (reassign/add/remove/resequence), affected order IDs
- Override % metric = (overridden trips / total planned trips) × 100 per dispatch window
- Override % threshold: open question, see Q6

**Override % alerts:**
- A6.31: Override % for trip or shift exceeds threshold → Ops + Analytics
- A6.32: Single dispatcher's override rate significantly above warehouse average → Ops

**Concurrent plan editing:**
- Two dispatchers opening same plan simultaneously: **last editor wins is not acceptable**
- Plan must implement optimistic locking: each plan state has a version token
- On edit submit: version token validated; if mismatch (another edit occurred) → editor sees conflict error and must refresh before re-submitting
- Conflict resolution is manual: dispatcher reviews current state and re-applies their change if still valid
- Tech must implement version token on plan entity in Locus integration layer

**"No Eligible Orders" driver:**
- Driver whose eligible pincodes don't intersect current backlog shown as "No Eligible Orders" in roster
- Never silently excluded from roster view
- Dispatcher can manually assign if business need warrants

### UC4.4 — Order Cancellation After Plan Creation

**Sub-case A — Customer cancellation, pre-departure:**
1. OMS sends cancellation signal to Locus
2. Locus removes order from driver's plan in real time
3. Driver app reflects removal immediately (no restart required)
4. Route recomputed for remaining undelivered stops
5. If recompute fails: Alert A6.37 fires; driver app shows stale sequence until manual refresh

**Sub-case B — Customer cancellation, post-departure:**
1. Cancellation appears as urgent notification on Driver App
2. Driver instructed to return order to warehouse
3. Order marked **"RTO Initiated"** in Locus
4. Route recomputed for driver's remaining undelivered stops
5. **RTO physical handling SOP:** Driver retains item until return to warehouse. On warehouse return: driver scans item; warehouse staff acknowledge receipt; item returned to shelf/quarantine. RTO-specific OMS update triggered by scan.
6. If RTO not initiated within 30 minutes of post-departure cancellation: Alert A6.36 fires (Tech, P0)

**Sub-case C — Ops-initiated cancellation, pre-departure:**
1. Available for orders in Open, Parked, or Assigned (pre-departure) state via Locus dashboard
2. **Mandatory reason selection required** before confirmation (dropdown: Customer Request / Address Unresolvable / Stock Issue / Duplicate Order / Other)
3. Reason logged with: user ID, timestamp, order ID, selected reason, free-text notes (optional)
4. Post-departure self-serve cancellation: not available; HO Central Logistics only (see Authorization Matrix)

**Sub-case D — Entire trip cancellation:**
1. All orders in trip revert to **Open** state
2. Replanning triggered; orders available for next dispatch window or same-window replan if time permits
3. Driver app trip entry marked Cancelled
4. Reason required (same dropdown as sub-case C)

### UC4.5 — Editing a Created Plan

**Permitted edits:**
- Add an Open order to a trip
- Remove an order from a trip
- Reassign a trip to a different driver
- Resequence undelivered stops

**Edit lock — Last-Mile:**
- Add/remove: permitted until driver completes first handover scan (first order scanned and accepted by customer or marked attempted)
- Resequencing: remains available to dispatcher even after handover
- If add/remove attempted post-handover: request blocked; Alert A6.33 fires (Tech, P0)

**Edit lock — Mid-Mile:**
- All edits permitted until Runner confirms departure (trip marked "Departed")
- After "Departed": no order-level edits on mid-mile trip
- If edit attempted post-departure on mid-mile: request blocked; Alert A6.33 fires

**Capacity exceeded on add:**
1. Locus warns dispatcher: "Adding this order exceeds vehicle capacity for this driver"
2. Dispatcher must explicitly confirm before proceeding
3. Breach is logged; contributes to override % metric

**Route recomputation failure after edit:**
1. Pre-edit plan preserved in full
2. Alert A6.37 fires (Tech, P1)
3. Dispatcher notified: edit did not take effect; current plan unchanged
4. Edit must be re-attempted after recompute service recovers

**Plan versioning:**
- Every edit creates a new plan version: version number, editor ID, timestamp, changes applied
- Dispatcher can view version history
- Plan rollback to prior version: supported for up to last 5 versions
- Rollback requires HO Central Logistics role; standard Dispatcher cannot roll back unilaterally

---

## Use Case 5: Replanning

### UC5.1 — Driver Breakdown Mid-Trip

**Trigger:** Driver reports inability to continue via Driver App breakdown flow (M7 scope for UI).

**Response:**
1. Undelivered orders surface as **"Stranded Orders"** in Locus dashboard
2. Alert A6.38 fires: Dispatcher + Ops (P0) — if no replan action taken within X minutes (threshold: open question, see Q7)
3. Alert A6.39 fires: if stranded orders unassigned for >X minutes
4. Alert A6.40 fires: if stranded volume exceeds remaining active drivers' capacity

**Reassignment options:**
1. Assign stranded orders to another driver with remaining capacity → route recomputed
2. Dispatch newly available driver → route created from scratch for stranded orders

**Orders already marked Delivered:** retain status; not re-queued.

**Reassignment capacity check:**
- Before reassigning stranded orders to a driver: system validates remaining capacity
- If capacity insufficient: warn dispatcher; require explicit override confirmation
- Override logged; contributes to override % metric

**Stranded orders and emergency injection:**
- If stranded order total across all available drivers exceeds total remaining capacity: Alert A6.40 fires
- Escalation: Central Logistics notified; manual delivery or customer rescheduling required

### UC5.2 — Emergency Mid-Trip Order Injection

**Permitted roles:** Warehouse Dispatcher, HO Central Logistics only (not Driver).

**Happy path:**
1. Dispatcher selects active trip; injects priority order
2. System checks driver capacity before injection:
   - If within capacity: proceed to recompute
   - If at capacity: dispatcher warned; explicit confirmation required before proceeding; breach logged
3. Locus recomputes sequence of remaining undelivered stops
4. Driver app reflects updated sequence in real time (no logout/restart required)
5. If recompute fails: Alert A6.42 fires; driver app shows stale sequence
6. If recompute succeeds but driver app not notified: Alert A6.43 fires (silent app fail — Tech, P0)

**Emergency injection by non-dispatcher:**
- Alert A6.41 fires (Tech, P0) if injection attempted by user without Dispatcher role

---

## State Intersection Scenarios

**SI.1 — Driver suspended/terminated after plan finalised, before departure**
- Driver status changes (M3 event) after plan is already finalised and driver is assigned trips
- Response: Locus plan does not auto-update on driver status change
- Truemeds integration layer must listen for M3 status-change events and cross-check against active plans
- If match found: Alert A3.6/A3.5 fires; Dispatcher notified; Ops must manually remove driver from plan and reassign trips before departure
- Trip departure blocked at Locus level if driver status = Suspended or Terminated at departure-scan time

**SI.2 — Pincode zone mapping changes after orders parked for that pincode**
- Parked orders hold stale zone assignment
- On zone mapping update: Locus must re-evaluate all Parked orders with affected pincodes
- If zone assignment changes: dispatcher notified; parked order re-enters resolution queue
- If no zone found after update: order enters "Zone Not Found" state

**SI.3 — Hub deleted in Geography after mid-mile trips assigned to that hub**
- Alert A2.10 fires (M2/M8) at hub deletion if active orders reference it
- M6 response: active mid-mile trips referencing deleted hub must be surfaced as "Hub Invalid" state
- Dispatcher must reassign affected trips before departure
- Hub deletion with in-flight trips should be blocked at Geography layer (M2 scope); M6 handles the case where Geography layer fails to block it

**SI.4 — Parked order 3-day auto-cancel**
- 3-day cancellation is **manual**, not automatic
- Risk: Ops misses Alert A6.15; order sits in Parked state indefinitely
- Safeguard: daily scheduled report of all orders in Parked state > 2 days, sent to HO Central Logistics
- If order remains Parked > 7 days: secondary escalation alert fires to Tech + HO Central Logistics

**SI.5 — Two dispatchers editing same plan simultaneously**
- Handled via optimistic locking (see UC4.3 Concurrent Plan Editing)
- Last-write-wins is not acceptable; conflict must surface to second editor

**SI.6 — Mid-mile trip marked Complete with unscanned orders**
- Locus blocks Complete action if any order in batch has no scan record at DC
- If DC scanner is offline: Runner cannot complete trip until scanner restored or IT escalation
- Manual override for Complete (bypassing scan requirement): requires HO Central Logistics role; logged with mandatory reason

**SI.7 — Emergency injection into trip at capacity**
- Capacity check runs before recompute (see UC5.2)
- Dispatcher warned; breach requires explicit confirmation; logged to override %

**SI.8 — Address update while order is Parked**
- Permitted (intended resolution path)
- Re-resolution auto-triggers immediately on update
- No separate dispatcher action needed to initiate re-resolution

---

## Cross-Cutting Concerns

### Audit Trail

Every planning event logged:

| Event | Fields Logged |
|---|---|
| Order ingestion | order_id, timestamp, payload hash, response code, locus_order_ref |
| Ingestion failure / rejection | order_id, timestamp, failure_type, error_message, retry_count |
| Address resolution | order_id, timestamp, confidence_score, resolution_state |
| Attendance mark | driver_id, dispatcher_id, timestamp, action (mark/unmark) |
| Plan finalisation | plan_id, dispatcher_id, timestamp, order_count, driver_count |
| Override / edit | plan_id, dispatcher_id, timestamp, action_type, affected_order_ids, reason |
| Order cancellation | order_id, cancelled_by, timestamp, reason_code, reason_notes, cancellation_type |
| Emergency injection | order_id, trip_id, injected_by, timestamp, capacity_breach (bool) |
| Breakdown reported | driver_id, trip_id, timestamp, stranded_order_count |
| Stranded order reassignment | order_id, from_driver_id, to_driver_id, dispatcher_id, timestamp |
| Plan version created | plan_id, version_number, editor_id, timestamp, changes_summary |
| Plan rollback | plan_id, from_version, to_version, authorised_by, timestamp |

Audit logs retained: 90 days active, then archived per data retention policy.

### Override % Metric

**Definition:** (trips with at least one dispatcher override / total trips in dispatch window) × 100

**Threshold:** open question, see Q6. Recommended starting point: >20% triggers P1 alert; >35% triggers P0.

**Per-dispatcher tracking:** individual dispatcher override % compared to warehouse average. Single dispatcher >2× warehouse average → Alert A6.32.

### RTO SOP Summary

Post-departure cancellation RTO flow (M6 scope):
1. Driver receives urgent notification on Driver App
2. Driver marks order as "RTO" in app
3. Driver continues remaining deliveries; returns RTO item at end of trip
4. On warehouse return: driver scans RTO item at return counter
5. Warehouse staff acknowledge scan; item moves to RTO shelf/quarantine
6. OMS updated with RTO status; customer notified (OMS scope, not M6)

---

## Metrics

| Metric | Target | Notes |
|---|---|---|
| Ingestion success rate | ≥ 99.5% | Per dispatch window |
| Ingestion latency (p95) | < 5 seconds | OMS trigger to Locus Open state |
| Address resolution rate (High/Medium) | ≥ 95% | Lower = address data quality issue |
| Parked order resolution rate | ≥ 90% | Of parked orders, % resolved within 2 hours |
| Unallocated order rate | < 2% | Per dispatch window |
| Plan finalisation before cutoff | 100% | Zero missed cutoffs target |
| Override % | < 20% | Establish baseline in first 4 weeks |
| SLA risk flag rate | Baseline | Establish in first 4 weeks |
| Emergency injection rate | < 1% | Of total trip-orders |

---

## Rollout

**Phase 1 — Pre-launch (T-14 days):**
- Configure dispatch cutoff per hub in Locus
- Configure vehicle type capacity limits per hub
- Set ingestion retry policy and circuit breaker thresholds
- Verify all hub aliases present in Geography (M2 dependency)
- Verify all driver records migrated to Locus (M3 dependency)
- Verify Sort Identifier Code format validation is active at ingestion layer (M5 dependency)
- Enable optimistic locking on plan entity in integration layer

**Phase 2 — Shadow run (T-7 to T-0):**
- Shadow-ingest all orders into Locus in parallel with Shipsy
- Validate address resolution confidence rates per hub
- Validate driver-to-zone assignment logic
- Do NOT dispatch from Locus during shadow run

**Phase 3 — Cutover (T-0):**
- Switch OMS to Locus ingestion exclusively
- First 2 dispatch windows: senior dispatcher + Tech on-call present
- Monitor: ingestion success rate, address resolution rate, plan finalisation time, unallocated order count

**Phase 4 — Stabilise (T+7 to T+30):**
- Establish override % baseline
- Establish SLA risk flag rate baseline
- Tune dispatch cutoff per hub based on observed departure times
- Tune vehicle capacity limits based on observed load

---

## Open Questions

| # | Question | Affects | Owner |
|---|----------|---------|-------|
| Q1 | Dispatch cutoff time per hub — 30 or 45 minutes before departure? Confirm with Ops | UC2.2, UC3.2, overall timing | Ops |
| Q2 | Stale ingestion failure threshold — how many hours before A6.7 fires? | A6.7 | Ops + Tech |
| Q3 | Address resolution timeout — confirm 30s default is acceptable for Locus; configurable per hub? | UC2.4 | Tech |
| Q4 | On pincode zone mapping created: does Locus auto-re-evaluate Zone Not Found orders or require manual re-trigger? | UC2.3 | Locus CSM |
| Q5 | Unallocated order escalation threshold — how many consecutive windows before Central Logistics escalation? | UC3.5 | Ops |
| Q6 | Override % alert threshold — confirm with Analytics team (20% / 35% proposed) | UC4.3, A6.31/32 | Analytics + Ops |
| Q7 | Stranded order reassignment window — how many minutes before A6.38 / A6.39 fire? | UC5.1 | Ops |
| Q8 | Does OMS currently emit a real-time cancellation event to Locus, or is it polled? | UC4.4 Sub-A/B | Tech |
| Q9 | Plan rollback: is 5-version history sufficient, or do Ops need full history for audit? | UC4.3 plan versioning | Ops + Legal |
| Q10 | Mid-mile Complete manual override (bypassing scan): is this acceptable at all, or should it require Tech override? | SI.6 | Ops + Tech |
