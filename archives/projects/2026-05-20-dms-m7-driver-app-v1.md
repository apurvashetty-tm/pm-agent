# [PRD] DMS Integration — Milestone 7: Driver App & Execution Setup

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
| Analytics | Analytics Lead | — | Tejas | — |

---

## Objective

Enable delivery executives to execute their full shift — from handover to trip completion — through the Locus driver app, with complete digitisation of proof of delivery, COD collection, sequence management, and earnings visibility.

---

## Why Now?

Hyperlocal delivery execution is currently untracked from the moment an order leaves the warehouse. There is no digital record of handover, delivery sequence, POD, or COD collection. This creates reconciliation gaps, no recourse on disputes, and zero ops visibility once the driver departs. M7 closes this gap by making the Locus driver app the single system of record for all last-mile execution events.

---

## Use Cases

---

### Use Case 1: Trip Execution

---

#### Use Case 1.1: Handover from Dispatcher

**Happy path:**

When the dispatcher hands an order to a driver, the driver opens the Locus app and scans the barcode on the box. Locus calls Truemeds to resolve the barcode to an order_id and confirms acceptance. A successful scan is treated as the driver accepting that order. Once all orders in the plan are accepted by the driver, ops manually enables departure.

**Edge cases:**

1. Barcode scan fails on the driver's app → driver must reattempt. App displays retry prompt. If three consecutive scan failures occur, ops is alerted to intervene manually.
2. Barcode resolution returns an order_id that does not match the expected order for this driver and trip → Locus blocks acceptance and displays an error. Ops is alerted. The physical box is held at the hub for investigation.
3. Driver scans a barcode that belongs to a different driver's trip → Locus identifies the mismatch, blocks acceptance, and notifies both the scanning driver and the dispatcher.
4. Driver scans the same order barcode twice → Locus deduplicates silently. Second scan has no effect. No duplicate acceptance event is created.
5. Truemeds system is unavailable when Locus calls to resolve the barcode → Locus retries the resolution call up to 3 times with a configurable timeout (default: 10 seconds per attempt). If all retries fail, the order enters a "Resolution Pending — Truemeds Unavailable" state. Ops is alerted. The order is not counted as accepted until resolution succeeds.
6. Driver explicitly refuses to accept a specific order → Ops selects an eligible receiving driver from the dashboard and reassigns the order. The refused order is removed from the original driver's plan, and the receiving driver's route is recomputed. If no eligible receiving driver exists, the order is moved back to the Open queue for the next planning cycle.
7. Ops allows the driver to depart before all orders are scanned → All unscanned orders in that driver's plan must be moved back to the Open queue before the Trip Start button is enabled. Locus surfaces the count of unaccepted orders on the dispatcher dashboard before enabling departure.

---

#### Use Case 1.2: Trip Start Flow & Order List on App

**Happy path:**

After all orders in the plan are accepted via barcode scan, each accepted order is reflected in the driver's app in the same sequence as planned — regardless of the scan sequence at handover. When the driver taps "Trip Start", the trip is officially recorded as started in Locus. The driver can then begin navigation to the first stop.

**Edge cases:**

1. An accepted order fails to reflect in the driver's app after a successful scan → the driver must not be permitted to start the trip. Ops is alerted to resolve the sync failure before departure.
2. The order sequence displayed in the app diverges from the plan sequence → Locus must not permit Trip Start until the sequence is corrected. Ops is alerted.
3. The Trip Start button must remain disabled until all orders in the plan are accepted and reflected in the app.
4. All unaccepted orders must be removed from the plan before Trip Start is enabled. The dispatcher confirms this action explicitly on the dashboard.
5. When the driver taps Trip Start but is outside the hub's geofence → the app displays a warning: "You appear to be outside the hub. Please confirm your location before starting." The driver may proceed after acknowledging the warning, but the out-of-geofence event is logged for ops review.
6. Trip Start is tapped but Locus fails to record the event (server error) → the app displays an error and prompts the driver to retry. The trip is not considered started until Locus confirms the event. If the failure persists after two retries, ops is alerted to manually advance the trip state from the dashboard.
7. Driver's GPS is off or permissions are denied when Trip Start is tapped → the app prompts the driver to enable location services before proceeding. Trip Start is blocked until location is available.

---

#### Use Case 1.3: Navigation to Customer's Location

**Happy path:**

When the driver opens the order list on the app, one order is active at a time in the planned sequence. For the active order, the driver can tap "Call Customer" to open the dialler with the customer's number pre-filled, or tap "Navigate" to open Google Maps directed to the customer's resolved delivery location. Only one order is actionable at a time; orders not yet in sequence are visible but not interactive.

**Edge cases:**

1. The order list fails to load on the driver's app → the driver must not attempt navigation or delivery. The app prompts the driver to retry. If the failure persists, the driver must contact ops.
2. The driver is able to interact with orders outside the current sequence (i.e., future stops are actionable prematurely) → Locus must block this. Only the current sequence position must be interactive.
3. Call Customer action fails to open the dialler → the app displays an error. Fallback: driver must contact ops, who can relay the customer's number.
4. Navigate action fails to open Google Maps → the app displays an error. The driver must use the printed route sheet as a fallback or contact ops.
5. Navigate action opens Google Maps but to a location that differs from Locus's resolved delivery coordinates → the driver must not proceed to the incorrect location. The driver must report the mismatch to ops. Ops fallback: dispatcher calls the customer to confirm the correct address and manually updates it in Locus if resolution allows.
6. Customer does not answer the call → the driver must wait at the customer's location for a configurable hold time (default: 5 minutes) before marking the order as a failed delivery attempt. The driver selects "Customer Unreachable" from the reason list. The order is escalated to ops for rescheduling.
7. Customer has no phone number on file → "Call Customer" action is disabled for that order. The driver proceeds to the delivery location and attempts in-person handover. If handover cannot be completed, the driver selects "Customer Unreachable" from the reason list.
8. While the driver is navigating to a stop, a real-time sequence update is pushed (emergency injection or dispatcher resequence) → the driver's app displays an in-app notification: "Your route has been updated. Tap to view the new sequence." Navigation to the current stop continues uninterrupted. The updated sequence takes effect when the driver completes the current delivery and moves to the next stop.

---

#### Use Case 1.4: Reordering Order Sequence

**Happy path — Flow 1: Delivery sequence edit:**

When the driver opens the order list on the app, they can select an order and drag it to a new position in the queue. Before persisting the change, Locus prompts the driver to select a resequencing reason from a pre-configured list. On selection, the order is moved to the new position. All resequencing events are logged with driver ID, timestamp, original position, new position, and reason, and are surfaced on the ops monitoring dashboard in real time.

**Happy path — Flow 2: Removing an order from the delivery sequence:**

When the driver opens the order list and taps the Edit icon on an order, the driver is presented with two options: "Reschedule Delivery" or "Cancel Delivery". The driver selects one option and a mandatory reason from the pre-configured list. The order is removed from the active delivery sequence and an alert is sent to the dispatcher.

- If "Reschedule Delivery" is selected: the order enters "Parked" state. Ops confirms a new delivery date with the customer and manually moves the order to "Open" state when ready. The reason for parking is visible to ops on the dispatcher dashboard.
- If "Cancel Delivery" is selected: the order enters "Parked" state. Ops reviews the cancellation with the customer before confirming. The reason for cancellation is visible to ops.
- For COD orders marked for rescheduling: the original payment intent is voided. A new payment event is generated when the order is re-dispatched.

**Edge cases:**

1. Driver is unable to select the order to drag it to a new position → ops is alerted. The dispatcher can manually override the sequence from the Locus dashboard.
2. Locus fails to load the list of resequencing reasons → the driver cannot proceed with resequencing until the list loads. The app prompts retry. If the list fails to load after two retries, the driver must contact ops.
3. Driver attempts to submit the resequence without selecting a reason → Locus blocks the action and prompts reason selection.
4. Order resequencing fails to persist → the order returns to its original position. The app displays an error and the driver must retry or contact ops.
5. Ops is unable to view resequencing activities on the monitoring dashboard → this is a system failure. Tech is alerted.
6. Driver is unable to tap the Edit icon → ops is alerted. The dispatcher can manage the order from the Locus dashboard as a fallback.
7. Order is removed from the delivery sequence without the driver selecting an option and reason → Locus must block this action. Reason selection is mandatory before removal is persisted.
8. Driver marks "Reschedule Delivery" while outside the delivery location's geofence → the app displays a warning: "You appear to be outside the delivery location. Please confirm you are at the customer's address." The driver may proceed after acknowledging; the out-of-geofence event is logged.
9. Driver marks "Cancel Delivery" while outside the delivery location's geofence → same warning and logging as above.
10. Order removal from the delivery sequence fails to persist → the order remains in the sequence. The app displays an error and the driver must retry or contact ops.
11. Alert to dispatcher on order removal fails to fire → Tech is alerted. Ops must check the unallocated orders queue manually.
12. Order fails to transition to Parked state → Tech is alerted. The order must not remain in the active delivery sequence in an ambiguous state.
13. Order fails to return to Open state after rescheduling confirmation → Tech is alerted. The dispatcher manually overrides the state from the dashboard.
14. Driver attempts to resequence the first stop they are currently navigating to → Locus permits the drag but the stop does not take effect until the driver completes the current delivery. The resequence reason is still required.

---

#### Use Case 1.5: Proof of Delivery

**POD method selection:**

Barcode scan is the primary POD method. OTP-based handover is the fallback, used when the driver is unable to scan the barcode at delivery (e.g., package sealed in a bag, camera failure, or customer doorstep drop scenario). The POD method in effect for a given order is configurable by ops at the hub level. Both methods cannot be active simultaneously for the same order.

**Happy path — Flow 1: Barcode scan handover:**

When the driver reaches the customer's location and the customer is present, the driver opens the active order on the app and scans the barcode on the parcel. Locus records this as a confirmed handover event for that order. The delivery is logged as complete.

**Happy path — Flow 2: OTP-based handover:**

When the driver completes a prior delivery (or when the trip starts, depending on ops configuration), Locus generates an OTP and passes it to Truemeds. Truemeds delivers the OTP to the customer via SMS. When the driver reaches the customer's location, the customer shares the OTP verbally. The driver inputs the OTP in the app. Locus validates the OTP and logs the delivery as complete.

**Edge cases:**

1. Barcode scan action on the driver's app fails → the app prompts retry. If three consecutive scan failures occur, the driver is prompted to switch to OTP-based handover for that order.
2. Locus incorrectly identifies the order being handed over based on the scanned barcode → Locus must block the handover and surface the mismatch. The driver must not mark the order as delivered until the correct barcode is scanned.
3. OTP generation fails → the driver and dispatcher are alerted. The driver must hold the parcel and wait for ops to resolve. OTP delivery cannot be bypassed.
4. Generated OTP is not received by Truemeds systems → Locus retries the OTP push up to 3 times. If all retries fail, the dispatcher is alerted. Ops contacts the customer directly to arrange alternate handover.
5. Truemeds is unable to pass the OTP to the customer (SMS failure) → the dispatcher is alerted. Ops contacts the customer directly to relay the OTP.
6. Driver inputs a wrong OTP → Locus displays an error and permits one retry per OTP. After two failed attempts, the OTP is invalidated and a new one must be generated. The dispatcher is notified.
7. Customer shares a wrong OTP → same handling as above.
8. Handover logging fails after a successful scan or OTP input → the delivery event is not recorded. Tech is alerted. The order must not be shown as delivered in Truemeds until the event is re-logged.
9. OTP or barcode scan is attempted outside the delivery location's geofence → the app displays a warning: "You appear to be outside the delivery location. Confirm you are at the customer's address before completing handover." The warning is logged. The driver may proceed after acknowledgement, but the out-of-geofence event is flagged for ops review. The system does not hard-block the handover to avoid stranding the driver.
10. Customer is absent at the delivery location → the driver waits for the configurable hold time (default: 5 minutes), attempts to call the customer, and if unreachable selects "Customer Absent" from the reason list. The order enters "Failed Delivery Attempt" state. Ops is alerted and contacts the customer to reschedule.
11. OTP expires before the customer opens the door or is available → the driver can request a new OTP from the app. Locus invalidates the prior OTP and generates a fresh one. OTP validity window is configurable (default: 15 minutes).

---

#### Use Case 1.6: COD Collection

**Pre-requisite:**

Locus maintains an active integration with Truemeds' payment vendors. Initially, Locus is expected to have integrations with Cashfree, Juspay, Razorpay, PayU, and PineLabs and to orchestrate payment collection across all Truemeds accounts on these gateways as required.

**Happy path:**

After the driver completes the handover procedure (barcode scan or OTP), Locus calls Truemeds to determine the payment method and gateway for that order.

- If payment method = Prepaid: the driver marks the order delivered and proceeds to the next stop.
- If payment method = COD: Locus generates a dynamic QR code for that order. The customer may either scan the QR code to pay digitally, or hand over cash to the driver.
  - If paid by QR code: the driver's app transitions to a payment success state. Locus sends a payment success event to Truemeds. Truemeds runs reconciliation against the received payment.
  - If paid by cash: the driver marks the order delivered. Cash is recorded against the order for hub reconciliation at trip completion.

**Cash reconciliation at trip completion:** When the driver marks the trip complete at the hub, the driver hands over all collected cash to the hub ops agent. The hub ops agent reconciles cash received against the Locus-recorded COD order list for that trip. Any discrepancy is flagged to the dispatcher and logged in Truemeds.

**Edge cases:**

1. Locus does not have Truemeds' payment gateway partners integrated → Locus accepts a dynamic order-level QR code generated by Truemeds. Locus displays the QR code on the driver app. The payment collection flow proceeds as in the happy path.
2. Locus fails to fetch payment method and status from Truemeds → the driver is prompted to hold and retry. If the failure persists after two retries, the dispatcher is alerted. The driver must not proceed with delivery until payment method is confirmed.
3. Locus fails to generate the dynamic QR code → the driver is prompted to retry. If QR generation fails after two retries, the driver must collect cash as the fallback. The failure event is logged and Tech is alerted.
4. Payment gateway timeout or failure → Locus retries the payment call up to 3 times with exponential backoff. If all retries fail, the driver is prompted to collect cash. The payment failure event is logged and Tech is alerted.
5. Locus fails to send the payment success event to Truemeds → Locus retries up to 3 times. If all retries fail, the event is queued for asynchronous delivery. Tech is alerted. Truemeds reconciliation flags the order for manual review.
6. Customer refuses to pay COD (neither cash nor QR) → the driver selects "Customer Refused Payment" from the reason list. The order enters "Parked" state and the parcel is returned to the hub. Ops contacts the customer. The order is not marked delivered.
7. Customer offers to pay only a partial cash amount → the driver must not accept partial payment. The driver selects "Partial Payment Offered — Refused" from the reason list. The order enters "Parked" state. Ops contacts the customer to resolve.

---

#### Use Case 1.7: Trip Completion Flow

**Happy path:**

After completing all deliveries, the driver begins the return journey to the hub. On arrival at the hub, the driver taps "Mark Trip Complete" on the app. The trip is recorded as complete in Locus. Cash handover reconciliation is performed with the hub ops agent (see UC 1.6 cash reconciliation).

**Edge cases:**

1. Driver taps "Mark Trip Complete" while outside the hub's geofence → the app displays a warning: "You appear to be outside the hub. Confirm your location before completing the trip." The driver may proceed after acknowledgement, but the out-of-geofence event is logged for ops review.
2. Driver attempts to mark trip complete while one or more orders are in a non-terminal state (not delivered, not parked, not cancelled) → Locus must block trip completion. The app displays a list of unresolved orders. The driver must resolve each order (mark delivered, mark failed attempt, or select a reason for non-delivery) before trip completion is permitted.
3. App functionality of marking trip complete fails (server error) → the app displays an error and prompts retry. If the failure persists after two retries, the dispatcher manually marks the trip complete from the Locus dashboard.
4. Driver's phone dies mid-trip → on restart and re-login, the app restores the last confirmed trip state from Locus. Orders already marked as delivered retain their status. The driver resumes from the last unresolved order. No delivered orders are re-queued.

---

#### Use Case 1.8: On-Trip Driver Tracking

**Happy path:**

When a trip is in an active state (Trip Start has been recorded), the driver's real-time location is visible to ops on the Locus dispatcher dashboard. The ops agent can see: current driver location, the planned route, the next stop in sequence, and the estimated arrival time at each remaining stop. Location is updated at a configurable frequency (default: every 30 seconds).

**Edge cases:**

1. Driver's location has not updated for more than 5 minutes while the trip is active → the dispatcher dashboard flags the driver as "Location Stale." The dispatcher is prompted to call the driver to confirm status. This event is logged as a Location Gap against the trip.
2. Driver's app is sent to the background (phone locked, switched to another app) for more than 2 minutes while the trip is active → Locus attempts to maintain background location tracking. If background tracking is unavailable (OS-level restriction), the location is recorded as unavailable for that interval. The dispatcher is notified of the gap.
3. Driver's location deviates significantly from the planned route (more than a configurable threshold, default: 500 metres) for more than 3 minutes → the dispatcher dashboard flags a "Route Deviation" event. The dispatcher is prompted to review and optionally call the driver.
4. Driver's phone battery drops below 15% while the trip is active → the app displays a low battery warning to the driver and sends a notification to the dispatcher: "Driver [name] — low battery. Trip may be interrupted." This is a signal for ops to prepare a recovery plan if needed.
5. Driver revokes location permissions mid-trip → the app prompts the driver to re-enable location permissions. If permissions are not restored within 2 minutes, the dispatcher is alerted. The driver cannot mark orders as delivered or complete the trip until location permissions are active.
6. Dispatcher attempts to call the driver from the tracking view → clicking the driver card opens the dialler with the driver's number pre-filled. If the call fails, the dispatcher must use an external channel.

---

### Use Case 2: Viewing Earnings & Incentives

**Happy path:**

When the driver opens the Earnings section of the app, they can view their earnings for the current shift and for the past 30 days. The earnings breakdown shows: base earnings (Fixed Income + Rs. per Km × actual distance), incentive line items (attendance, route, order-level, holiday), and total payout for each shift. Earnings for the current shift are finalised at Shift End and updated in the app within 30 minutes. Past earnings are read-only.

**Edge cases:**

1. Earnings for the current shift are not updated within 30 minutes of Shift End → the driver can see a "Pending Calculation" label. If earnings remain uncalculated for more than 2 hours post Shift End, Tech is alerted.
2. Earnings display fails to load → the app prompts retry. If the failure persists, the driver must contact ops for manual confirmation of earnings. The underlying data is available in Redshift regardless of display failures.
3. Driver believes an earnings entry is incorrect → the driver can tap a "Report Issue" button on any earnings line item. The issue is logged against the driver_id, shift_id, and line_item type and surfaced to ops for manual review. The driver receives an in-app confirmation that the issue has been reported. Resolution is managed outside the app.
4. An incentive that the driver expects to see is not reflected in the earnings → the driver must use the "Report Issue" flow. Incentive eligibility is determined by Locus based on configurations set in M4 (Payout Manager). Disputes are resolved by ops cross-referencing the M4 incentive config.

---

### Use Case 3: App Login & Shift Start & End Experience

**Happy path — Login:**

When the driver installs the Locus app and opens it, the driver inputs their registered mobile number. Locus sends an OTP to that number. The driver logs in via OTP. On successful login, the driver lands on the home screen with the Shift Start button active.

**Happy path — Shift Start & End:**

When the driver taps "Shift Start", Locus records the timestamp and marks the driver as active for planning. The Shift Start button transitions to "Shift End". When the driver taps "Shift End", Locus records the timestamp and marks the driver as inactive. Locus does not consider the driver for planning before Shift Start or after Shift End is recorded.

**Edge cases:**

1. Driver app installation fails → the driver must contact ops. Installation failure is outside Locus's control and must be resolved at the device level.
2. Driver inputs a wrong phone number → OTP is sent to the wrong number. The driver must re-enter their correct number and request a new OTP.
3. Driver inputs an invalid phone number format (not 10 digits) → Locus displays a format validation error before sending the OTP.
4. Locus fails to generate the OTP → the driver is prompted to retry. If OTP generation fails after two retries, Tech is alerted.
5. Locus fails to deliver the OTP to the driver's number (SMS failure) → the driver is prompted to retry. If delivery fails after two retries, the driver must contact ops for manual access provision.
6. Driver login after OTP submission fails → the driver is prompted to retry. If login fails persistently, Tech is alerted.
7. Driver is unable to tap Shift Start → the app is restarted. If the issue persists, ops manually marks the driver's attendance in the roster.
8. Shift Start button fails to transition to Shift End after being tapped → the driver must close and reopen the app. If the state does not update, ops manually advances the shift state from the dashboard.
9. Locus considers the driver for planning before Shift Start is recorded → Tech is alerted immediately. This is a P0 planning integrity failure.
10. Locus continues to consider the driver for planning after Shift End is recorded → Tech is alerted immediately. This is a P0 planning integrity failure.
11. Driver is unable to mark Shift End → ops manually marks Shift End from the dispatcher dashboard. The driver's earnings calculation is triggered at the time of the manual Shift End event.
12. Driver taps Shift Start while outside the warehouse geofence → the app displays a warning: "You appear to be outside the warehouse. Confirm your location before starting your shift." The driver may proceed after acknowledgement, but the out-of-geofence event is logged. Login Compliance Rate metric is flagged for this shift.
13. Driver taps Shift End while an active trip is in progress → the app blocks Shift End and displays: "You have an active trip. Complete or hand over your trip before ending your shift." Shift End cannot be recorded until the trip is in a terminal state.
14. Driver loses connectivity mid-shift → location tracking pauses and resumes on reconnection. The shift state (Shift Started) is maintained locally on the device and synced to Locus when connectivity is restored. Orders already marked as delivered retain their status. No re-delivery is triggered on reconnection.

---

### Use Case 4: Suspended Driver Experience

**Happy path:**

When a driver is suspended, the driver opens the app and is able to view their earnings and incentives history (read-only). The app displays a suspension banner with the reason for suspension as recorded in the Driver Module. All order-acceptance and scanning actions are disabled. The driver is not included in any planning roster while suspended. When the driver is unsuspended, the suspension banner is removed, order-acceptance and scanning actions are re-enabled, and the driver becomes eligible for planning from the next planning cycle.

**Edge cases:**

1. Driver is unable to see the full app after suspension (app becomes entirely inaccessible) → this is incorrect behaviour. Suspended drivers must retain read-only access to earnings. Tech is alerted.
2. Suspended driver is still able to accept orders or is included in planning → this is a P0 integrity failure. Tech is alerted immediately and the affected plan must be reviewed.
3. Driver is unsuspended but remains unable to accept orders or is still excluded from planning → Tech is alerted. Ops manually verifies the driver status in the Driver Module and forces a resync if needed.
4. Driver is mid-trip when the suspension is applied → the suspension takes effect at the next shift boundary. Active trips are not interrupted. Locus surfaces a banner to the driver indicating that their account is pending a status change effective after the current shift. Ops ensures the driver completes the trip and returns to the hub before the suspension is enforced.
5. The reason for suspension is not displayed on the driver's app → this is a configuration gap. Tech is alerted. Ops communicates the reason to the driver through an external channel as a fallback.

---

### Use Case 5: Terminated Driver Experience

**Happy path:**

When a driver is terminated, the driver is automatically signed out of the Locus app on their next app interaction or within a configurable propagation window (default: 5 minutes of the termination event being recorded). The driver cannot log back in. The app displays: "Your account has been deactivated. Please contact your fleet manager." The driver retains read-only access to their historical earnings for a 90-day window after termination, accessible via a separate earnings access link provided by ops.

**Edge cases:**

1. Driver is mid-trip when termination is applied → termination takes effect at the next shift boundary, not immediately. The active trip is not interrupted. Locus notifies ops to ensure the driver completes the trip, returns to the hub, and hands over all undelivered parcels and collected cash before the termination is enforced. Ops receives an alert: "Driver [name] — termination pending. Active trip in progress."
2. Termination takes more than the configurable propagation window to take effect on the driver's app → Tech is alerted. Until the termination propagates, the driver's access must be manually revoked from the Locus admin dashboard as an immediate override.
3. Driver has undelivered orders at the time termination is enforced → all undelivered orders in the driver's plan are surfaced as Stranded Orders on the dispatcher dashboard. Ops must reassign them before the next dispatch cycle.
4. Driver has cash collected from COD orders at the time termination is enforced → ops ensures cash reconciliation is completed at the hub before the driver departs. A manual reconciliation record is created and logged against the driver_id and trip_id.
5. Terminated driver attempts to access earnings history after the 90-day window → access is removed. The driver must contact ops if earnings records are needed beyond this window.

---

### Use Case 6: Connectivity Loss & Offline Behaviour

**Happy path:**

The driver app maintains a local state cache for the active trip. When connectivity is lost mid-trip, the driver can continue to view the order list and their current sequence. Scan events, delivery markings, and POD actions are queued locally and synced to Locus automatically when connectivity is restored. The driver receives an in-app indicator when offline. All locally queued events are timestamped at the time of the action, not at the time of sync.

**Edge cases:**

1. Connectivity is lost while a scan or delivery event is being submitted → the event is queued locally. The app confirms to the driver that the action has been captured and will sync when connectivity is restored. The driver proceeds normally.
2. Connectivity is restored and local event queue fails to sync → Tech is alerted. Ops must manually resolve the state discrepancy from the Locus dashboard before the trip can be closed.
3. Driver attempts to generate a COD QR code while offline → QR generation requires a live Locus call and cannot function offline. The driver is prompted to collect cash instead. The fallback is logged.
4. Driver is offline for the entire duration of a delivery and marks it complete locally → the event syncs on connectivity restoration. If the order is already in a terminal state in Locus (e.g., cancelled while the driver was offline), a conflict is surfaced to the dispatcher for resolution.
5. Navigation (Google Maps) is unavailable offline → this is a Google Maps limitation. The driver must use the last cached route or contact the customer for directions.

---

### Use Case 7: App Crash Recovery

**Happy path:**

When the driver's app crashes mid-trip and the driver relaunches it, the app restores the last confirmed trip state from Locus on reconnection. The driver lands on the current active order in the sequence. Orders already marked as delivered retain their delivered status. No delivered orders are re-queued.

**Edge cases:**

1. App crash occurs during a scan event → the scan event may or may not have been recorded by Locus. On relaunch, the app checks Locus for the current state of the order. If the scan was recorded, the order is shown as accepted/delivered. If not, the driver must rescan.
2. App crash occurs during a COD payment flow → on relaunch, the app queries Locus for the payment status of the order. If payment was confirmed by the gateway, the order is shown as paid. If payment was not confirmed, the driver must restart the payment flow.
3. App state after crash does not match Locus's server state → the server state is authoritative. The app adopts the server state on relaunch. Any discrepancy is logged for Tech review.
4. App crashes repeatedly (three or more crashes within a single trip) → Tech is alerted. The dispatcher is notified. Ops may need to manually advance the trip state from the Locus dashboard if the driver cannot use the app.

---

### Use Case 8: Multi-Device & Session Management

**Happy path:**

Each driver account supports a single active session at a time. When a driver logs in on a new device, the previous session is automatically invalidated. The driver on the new device receives a full sync of the current trip state from Locus.

**Edge cases:**

1. Driver logs into a second device while an active trip is in progress → the first device is signed out immediately. The second device shows the current trip state. Any locally queued events from the first device that were not yet synced are lost. The driver must report any unsynced events to ops for manual resolution.
2. A second login is attempted on the same device (duplicate session) → Locus deduplicates silently and maintains a single session.
3. Driver needs to switch phones mid-shift (e.g., battery died on primary device) → the driver logs in on the secondary device. The prior session is invalidated. The driver reviews the current order list on the new device before proceeding. Ops is notified of the device switch event.

---

## Metrics

| Metric | Definition | Baseline | Target | Timeframe |
|---|---|---|---|---|
| POD Capture Rate | % of delivered orders with a scan or OTP event recorded before "Mark Delivered" | Unknown — to be established at Stage 2 | ≥ 95% | Stage 2 exit |
| Login Compliance Rate | % of Shift Start events where driver location = warehouse geofence | Unknown | ≥ 90% | Stage 3a |
| Arrived Compliance Rate | % of "Arrived" events marked within customer delivery location geofence | Unknown | ≥ 85% | Stage 3a |
| Scan Compliance Rate | % of delivery scans where GPS = planned delivery location | Unknown | ≥ 85% | Stage 3a |
| Driver Re-prioritisation Rate | % of trips where driver manually resequences at least one stop | Unknown — directional goal: minimise | < 15% | Stage 3a |
| COD Collection Success Rate | % of COD orders where payment is collected digitally (QR) vs cash | Unknown | Directional: increase digital % over time | Stage 4 |

---

## Rollout & Stage Gates

| Stage | Entry Criteria | Success Criteria | Action on Failure |
|---|---|---|---|
| Stage 1 — Sanity | M6 Planning Engine stable. 1 driver, 1 trip, test orders only | Driver completes end-to-end trip on app. All events logged in Locus with no data gaps. POD captured | Fix event logging gaps before proceeding |
| Stage 2 — Minimal Rollout | Stage 1 passed. 1 zone, 1 warehouse, 1 driver shift | POD Capture Rate ≥ 95%. Login and Arrived Compliance within acceptable range. No P0 app failures. Ops sign-off on driver behaviour | Do not expand zones until Stage 2 criteria met for 3 consecutive shifts |
| Stage 3a — Phased Non-DC Expansion | Stage 2 passed. Ops training complete per zone | Guardrail metrics stable for 3 days post each zone activation. No regression in POD Capture Rate | Roll back affected zone to manual process. Investigate before re-expansion |
| Stage 3b — DC Expansion | All non-DC zones on Locus app. Stage 3a guardrails stable | All DC zones live. Mid-mile trip events logging correctly | Pause DC expansion. Fix mid-mile event logging before proceeding |
| Stage 4 — Full Rollout | Stage 3b passed | 100% of hyperlocal forward orders on Locus driver app. Reverse flow live | — |
