# [PRD] DMS Integration — Milestone 3: Driver Module

**Version:** v2
**Date:** 2026-05-21
**Author:** Tejas Bhalerao
**Status:** In Review
**Supersedes:** [v1 — 2026-05-20](2026-05-20-dms-m3-driver-module-v1.md)

**Changes from v1:**
- Field table: Aadhaar and DL no longer locked post-creation. Editable via standard edit flow.
- Location Details: Eligible Pincodes and Blacklisted Pincodes no longer validated against active Geography. Ops responsible for sanity.
- UC1 edge case 13: retry threshold changed from 2 to 10. Tech alert on persistent failure added.
- UC2: Locked fields restriction removed. Aadhaar and DL editable via standard flow.
- UC3: Termination no longer blocked for active trips. Standard path + emergency script path added for runaway/on-trip scenarios.
- UC3: COD cash reconciliation warning now conditional on payment method (QR vs cash — M7 dependency).
- UC3: Propagation section updated — emergency termination does not affect in-flight deliveries; cancels only allocated-but-undelivered orders.
- UC4.1: Suspension pending banner removed. Immediate suspension experience on trip completion per M7.
- UC3/UC4.1: Maker-Checker conflict language rewritten for clarity.
- UC5: Expiry (48-hour hard limit) removed. Requests open indefinitely. 24-hour recurring reminder added. Expired state removed from state machine.

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
| Driver creation | Warehouse Logistics, HO Central Logistics |
| Driver edit | Warehouse Logistics, HO Central Logistics |
| Driver termination (standard) | HO Central Logistics |
| Driver termination (emergency script) | Tech (Engineering-executed only) |
| Driver suspension | Warehouse Logistics, HO Central Logistics |
| Driver unsuspension | Warehouse Logistics, HO Central Logistics |
| Maker-Checker approval (Checker role) | Tech, HO Central Logistics |
| View driver records | All roles |

---

## Objective

Enable complete driver lifecycle management on Locus — creation, editing, termination, suspension, and unsuspension — with a reusable Maker-Checker control gate for high-risk actions.

---

## Why Now?

No planning engine operation is possible without a driver roster. Driver records on Locus are the prerequisite for M6 (Planning Engine) roster selection. This milestone must produce a complete, accurate driver database in Locus before any dispatch can occur.

---

## Field Reference — Driver Entity

| Category | Parameter | Data Type | Eligible Values | Locked Post-Creation |
|---|---|---|---|---|
| Personal Details | Driver Name | String | — | No |
| | Driver Mobile Number | Integer (10 digits) | — | No |
| | Aadhaar Number | Integer (12 digits) | — | No |
| | Driving License Number | String (15–16 chars) | — | No |
| | Vendor | String | Per vendor list (see open questions) | No |
| Vehicle Details | Vehicle Number | String | — | No |
| | Vehicle Type | String | 2-Wheeler, 3-Wheeler, Truck | No |
| Engagement Details | Work Type | String | Full Time, Part Time | No |
| | Driver Type | String | Delivery Boy, Runner | No |
| | Engagement Category | String | Permanent, Temporary | No |
| | Shift Start Time | Timestamp | — | No |
| | Shift End Time | Timestamp | — | No |
| | Payout Type | String | Salary, Order | No |
| Location Details | Eligible Pincodes | List (free entry) | No system restriction — Ops responsible for accuracy | No |
| | Eligible Pincodes Constraint | String | Soft, Hard | No |
| | Blacklisted Pincodes | List (free entry) | No system restriction — Ops responsible for accuracy | No |
| | Hub | String (single-select) | From active hubs in Geography | No |

**Aadhaar and Driving License are editable.** No system lock is applied post-creation. Since no automated document verification is performed, Ops must be able to correct data entry errors through the standard edit flow. Duplicate detection still runs on Aadhaar and DL at creation time — see UC1 validations.

**Eligible Pincodes and Blacklisted Pincodes** accept free entry. Locus does not validate these against active Geography pincodes — that would create unnecessary engineering overhead and Locus-Geography coupling. Ops is responsible for ensuring the pincodes entered are valid and serviceable. Incorrect entries will surface as planning exclusions (driver never assigned) but will not block record creation.

**Implicitly created on successful driver creation:**
- `driver_id` — unique identifier auto-assigned by Locus
- `date_of_joining` — date of successful creation
- `driver_status` = Active

---

## Use Case 1: Driver Creation

**Happy path:**

When a dispatcher opens the Locus dashboard and navigates to the driver creation form, they enter all required fields. Locus validates inputs dynamically as the dispatcher types. Once all validations pass, the dispatcher clicks Submit. If Maker-Checker is configured for driver creation (or is mandatory due to a terminated driver re-onboarding), a Pending request is created and the change is held until a Checker approves. Otherwise, the driver entity is created immediately with status = Active.

**Validations (applied dynamically as the dispatcher types):**

1. Aadhaar Number must be exactly 12 digits. Error: "Please enter a valid Aadhaar number."
2. Driving License Number must be 15 or 16 characters. Error: "Please enter a valid Driving License Number."
3. Driver Mobile Number must be exactly 10 digits. Error: "Please enter a valid Mobile Number."
4. All fields in the field reference table are mandatory. Error per field: "Please enter a valid value."
5. Shift Start Time must be strictly less than Shift End Time. Error: "Shift Start Time must be earlier than Shift End Time."
6. Eligible Pincodes and Blacklisted Pincodes must not contain any common pincode. If overlap exists, Locus blocks submission: "Conflict detected: Pincode `<Pincode>` appears in both Eligible and Blacklisted lists. Remove it from one list before proceeding."
7. Eligible Pincodes list must contain at least one pincode. Error: "At least one eligible pincode must be selected."
8. Aadhaar Number or Driving License Number matches an existing Active or Suspended driver → submission blocked: "Driver already exists."
9. Aadhaar Number or Driving License Number matches a previously Terminated driver → submission allowed but Maker-Checker is mandatorily triggered regardless of configuration.
10. Hub selected does not exist as an active hub in the Locus Geography configuration → Error: "Hub not found. Verify the hub exists in Geography setup before creating a driver."
11. Driver Mobile Number already exists for another Active or Suspended driver → Error: "Mobile number already in use by another driver."
12. Without resolving all validation errors, Locus must not accept the driver entity. Each error message is shown inline against the specific field.

**Maker-Checker trigger rules:**
- Mandatory: terminated driver re-onboarding (Aadhaar or DL match with a Terminated record).
- Configurable: all other driver creations, controlled per-hub by HO Central Logistics.

**Edge cases:**

13. Locus API returns 5xx when the dispatcher submits the creation form → Locus displays: "Submission failed. Please retry." The form state is preserved. Locus retries up to 10 times. If failure persists after 10 retries, the dispatcher is instructed to contact Tech. No partial driver record is created. Tech receives a Metabase alert on persistent API failure for driver creation.
14. Locus dashboard crashes or disconnects mid-form → form state is lost. The dispatcher must restart the form. No partial driver record is created.
15. The hub specified in driver creation is deleted concurrently (M2 UC3 hub deletion) before the creation API call is processed → Locus returns a hub-not-found validation error. The dispatcher must select a valid hub before resubmitting.
16. Two concurrent creation attempts for the same Aadhaar/DL combination (race condition) → Locus enforces uniqueness at the database level. The second submission is rejected with "Driver already exists" regardless of timing.

**Callout:** All driver creation actions must be possible via API call in addition to the dashboard UI.

---

## Use Case 2: Edit Driver Details

**Happy path:**

When a dispatcher navigates to a driver's profile on the Locus dashboard and modifies eligible fields, Locus applies the same dynamic validations as during creation. If Maker-Checker is configured for driver edits, a Pending request is created and the change is held until approved. Otherwise, the edit is applied immediately.

All fields in the driver entity are editable via the standard edit flow, including Aadhaar Number and Driving License Number. There are no system-locked fields. Ops is responsible for ensuring identity field corrections are legitimate.

**Field-level edit constraints:**

1. Hub can be changed. If the driver has an active trip at time of the edit, the new hub takes effect from the next planning cycle only. The active trip continues against the original hub assignment.
2. Driver Type (Delivery Boy ↔ Runner) can be changed. If the driver has an active trip at time of the edit, the new Driver Type takes effect from the next planning cycle only.
3. Shift Times can be changed. If the driver has an active trip, the new shift times take effect from the next shift only.
4. Eligible Pincodes can be edited. The resulting list must still contain at least one pincode. Overlap with Blacklisted Pincodes is blocked.
5. Eligible Pincodes Constraint can be changed from Soft to Hard or vice versa. Change takes effect from the next planning cycle.
6. Aadhaar Number or Driving License Number edited to a value matching an existing Active or Suspended driver → blocked: "Driver already exists with this Aadhaar/DL." Duplicate detection runs on edit, same as creation.

**Maker-Checker trigger rules for edits:**
- Mandatory: none by default (unless a specific field-level trigger is configured by HO Central Logistics).
- Configurable: any edit action, controlled per-hub.
- Recommendation: configure Maker-Checker for Driver Type and Hub changes, as these directly affect planning eligibility.

**Edge cases:**

7. Editing Mobile Number to one already used by another Active or Suspended driver → blocked: "Mobile number already in use by another driver."
8. Editing Eligible Pincodes to an empty list → blocked: "At least one eligible pincode must be selected."
9. A Maker-Checker request for this driver is already Pending when a new edit is submitted → Locus blocks the new edit: "A pending request already exists for this record. Wait for it to be resolved before submitting a new one." (Inherited from UC5 concurrency rule.)
10. Locus API returns 5xx on edit submission → Locus displays: "Edit failed. Please retry." Form state preserved.

**Callout:** All edit actions must be possible via API call.

---

## Use Case 3: Driver Termination

**Happy path:**

When a dispatcher navigates to a driver's profile on the Locus dashboard, they select one or more drivers for termination using the multi-select interface. The termination CTA is enabled upon selection. The dispatcher confirms termination and selects a mandatory termination reason from the pre-configured list. On confirmation, each selected driver's status is set to Terminated in Locus. Terminated drivers are immediately excluded from all future planning cycles.

**Termination reason list:** `<List of eligible termination reasons — TBD with Ops>`

**Standard termination — pre-conditions:**

Before termination is processed for a driver, Locus checks:
- If the driver has an active trip in progress → a warning is surfaced (not a hard block for standard flow): "Driver `<Name>` has an active trip." The dispatcher must confirm they wish to proceed. See Emergency Termination below for the runaway / on-trip override path.
- If the driver has collected COD cash that has not been reconciled at the hub AND that COD collection was not settled via QR code payment in the M7 Driver App → Locus surfaces a warning (not a block): "Driver `<Name>` may have unreconciled cash. Confirm cash handover before terminating." The dispatcher must confirm before proceeding. If COD was settled via QR code in the driver app, this warning is suppressed.

**Emergency termination (runaway or on-trip scenario):**

When a driver must be terminated immediately while on an active trip (runaway, misconduct, or safety incident), the standard dashboard flow is insufficient. The emergency path is:

1. Ops contacts Engineering directly (out-of-band channel: Slack / phone).
2. Engineering executes the emergency termination script against the driver record.
3. The script performs:
   - Sets `driver_status` = Terminated immediately in Locus, bypassing active-trip checks.
   - Cancels all orders allocated to that driver that are in a non-terminal state (allocated but not yet delivered). Orders already marked Delivered are not affected.
   - Truemeds OMS receives the order cancellation signals and re-routes each cancelled order via an alternative courier.
4. Engineering provides Ops with the list of cancelled order IDs.
5. Ops manually coordinates re-delivery to customers for each cancelled order.

**Emergency termination is Tech-only.** This path is not accessible via the Locus dashboard UI. Ops initiates it by contacting Engineering; Engineering executes it.

**Bulk termination behaviour:**

When multiple drivers are selected, each is processed independently. If one driver's API call fails, the others in the batch are still processed. The dispatcher sees a post-termination summary showing which drivers were successfully terminated and which failed, with the reason per failure.

**Re-onboarding a terminated driver:**

The dispatcher follows the same steps as UC1. Locus detects the Aadhaar or DL match with a Terminated record and mandatorily triggers the Maker-Checker flow. The re-onboarding does not proceed until a Checker approves.

**Edge cases:**

1. Locus API returns 5xx for a driver in the termination batch → that driver's termination fails. Locus surfaces the failure in the post-termination summary. Tech is alerted if the failure persists. The driver remains Active in Locus until the API failure is resolved and termination is retried.
2. Termination reason list fails to load from Locus → the dispatcher cannot proceed. Locus prompts retry. If the list fails after two retries, Tech is alerted.
3. A Maker-Checker request is waiting for Checker approval when termination is submitted → the pending Maker-Checker request is automatically withdrawn. The termination proceeds. The person who raised the original Maker-Checker request receives a notification: "Your pending request for `<Driver Name>` was withdrawn because the driver was terminated."

**Termination propagation:**

Termination takes effect in Locus's planning engine immediately. Propagation to the Locus driver app occurs within a configurable window (default: 5 minutes). Until propagation completes, the driver's app remains accessible but no new trip assignments are made.

For emergency terminations: the propagation window applies to app access revocation only. Cancelled orders (from the emergency script) are processed immediately — they do not wait for app propagation. In-flight deliveries the driver is currently executing are not automatically cancelled; only orders in allocated-but-not-yet-out-for-delivery state are cancelled by the script. Ops and Engineering coordinate on in-transit items case by case.

**Callout:** Standard termination must be possible via API call. Emergency termination is script-only (Tech-executed).

---

## Use Case 4: Driver Suspension & Unsuspension

### Use Case 4.1: Driver Suspension

**Happy path:**

When a dispatcher navigates to a driver's profile on the Locus dashboard, they select one or more drivers for suspension. The suspension CTA is enabled upon selection. The dispatcher confirms suspension and selects a mandatory suspension reason from the pre-configured list. On confirmation, each selected driver's status is set to Inactive in Locus. Inactive drivers are excluded from all future planning cycles until unsuspended.

**Suspension reason list:** `<List of eligible suspension reasons — TBD with Ops>`

**Mid-trip suspension:**

Suspension is deferred to the natural trip boundary. If a driver is mid-trip when suspension is applied:
- The active trip is not interrupted.
- Locus marks the driver's status internally as "Suspension Pending — Active Trip."
- No banner or notification is shown on the driver's app during the active trip. The driver experiences no change while the trip is in progress.
- Once the driver marks the trip as completed, the driver's status transitions immediately to Inactive. The driver app displays the suspension experience as defined in Milestone 7 (locked-out state, no new trip assignments visible).

**Attempting to suspend an already-suspended driver:**

Locus blocks the action and surfaces: "Driver `<Name>` is already suspended."

**Bulk suspension behaviour:**

Same as bulk termination — each driver processed independently. Post-suspension summary shows successes and failures with reasons.

**Edge cases:**

1. Suspension reason list fails to load → dispatcher cannot proceed. Locus prompts retry. Tech alerted if failure persists.
2. Locus API returns 5xx on suspension → that driver's suspension fails. Surfaces in post-suspension summary. Driver remains Active until failure is resolved.
3. A Maker-Checker request is waiting for Checker approval when suspension is submitted → the pending Maker-Checker request is automatically withdrawn. The suspension proceeds. The person who raised the original Maker-Checker request receives a notification: "Your pending request for `<Driver Name>` was withdrawn because the driver was suspended."

### Use Case 4.2: Driver Unsuspension

**Happy path:**

The dispatcher follows the same multi-select process as suspension. Unsuspension does not require a reason today. On confirmation, the driver's status is set to Active. The driver is immediately eligible for inclusion in future planning cycles.

**Note on future-proofing:** The unsuspension flow must be built to accept a reason field that can be activated without code changes. The data model must include an optional `unsuspension_reason` field from day one, even if the UI does not expose it initially.

**Attempting to unsuspend a terminated driver:**

Locus blocks the action: "Driver `<Name>` is terminated and cannot be unsuspended. Use the driver creation flow to re-onboard."

**Edge cases:**

1. Locus API returns 5xx on unsuspension → driver remains Inactive. Post-unsuspension summary surfaces the failure.
2. Driver was mid-trip when suspension was applied and is in "Suspension Pending — Active Trip" state → unsuspension cancels the pending suspension. The driver's status returns to Active with no interruption to the active trip.

**Callout:** All suspension and unsuspension actions must be possible via API call.

---

## Use Case 5: Maker-Checker Flow

### Use Case 5.1: Design Principle

The Maker-Checker flow is a standalone, reusable module. Any use case requiring a two-party review gate invokes this module. When a new use case needs a Maker-Checker, only two things are defined: the trigger condition and the email content. All other behaviour — states, reminders, concurrency, rejection path — is inherited from this spec without modification.

### Use Case 5.2: Roles

| Role | Who | Constraint |
|---|---|---|
| Maker | Any Locus platform user initiating a trigger action | Must have relevant module access |
| Checker | Users with Tech or HO Central Logistics role | Configurable in future |

### Use Case 5.3: Request Flow

**SLA:** Pending requests do not expire. A request remains open until a Checker approves, rejects, or the Maker cancels it. A 24-hour reminder is sent to all eligible Checkers for every request that remains Pending without action. The reminder repeats every 24 hours until the request is resolved.

**States:**

| State | Meaning | Transitions To |
|---|---|---|
| Pending | Maker submitted. No change applied. Awaiting Checker action. | Approved, Rejected, Cancelled |
| Approved | Checker approved. Change applied immediately. | Terminal |
| Rejected | Checker rejected. No change applied. Maker notified. Maker may resubmit. | Terminal |
| Cancelled | Maker self-cancelled, or auto-withdrawn due to termination/suspension of the subject driver. | Terminal |

**Flow:**

1. Maker performs a trigger action on the Locus platform.
2. Locus creates a request record in Pending state. The underlying change is not applied.
3. Locus sends an email notification to all eligible Checkers (excluding the Maker if the Maker does not hold the Checker role; if the Maker also holds the Checker role, they are excluded from the notification).
4. Checker navigates to the pending approvals section on the Locus dashboard and reviews the request.
5. Checker selects Approve or Reject.
   — On Approve: Locus applies the action, state → Approved.
   — On Reject: State → Rejected. Maker receives a rejection notification email with reason.
6. For Rejected requests, the Maker may submit a new request. Each submission creates a fresh request record.
7. If no Checker action is taken within 24 hours, a reminder email is sent to all eligible Checkers. This repeats every 24 hours until the request is resolved. The request does not expire.

**Concurrency:** Only one Pending request is permitted per entity at a time. If a Maker attempts to submit while a request for the same entity is already Pending, Locus blocks submission: "A pending request already exists for this record. Please wait for it to be resolved before submitting a new one."

**Edge cases:**

1. Checker's role is changed to a non-Checker role between submission and their approval attempt → Locus blocks the approval: "You no longer have permission to approve this request." The request remains Pending and is reassigned to other eligible Checkers.
2. Maker's Locus account is deactivated before the request is resolved → the 24-hour reminder is sent to all HO Central Logistics users as a fallback.
3. Maker attempts to cancel their own Pending request → Locus permits self-cancellation. The request state moves to Cancelled (terminal). The underlying change is not applied. All Checkers who received the submission email are notified of the cancellation.
4. Checker pool is empty (no users with Tech or HO Central Logistics role exist) → all Pending requests will remain unresolved indefinitely. Locus must surface an alert to the system administrator: "No eligible Checkers exist. All pending Maker-Checker requests cannot be resolved." Tech is alerted immediately (M8 alert A3.3).
5. A Checker clicks the approve/reject link in their email but the request has already been actioned by another Checker → Locus displays: "This request has already been `<approved/rejected/cancelled>` by `<Checker name>`." No duplicate action is taken.
6. Email notification delivery fails (SMTP failure) → Locus retries email delivery up to 3 times. If all retries fail, Locus surfaces an in-app notification badge on the pending approvals section for all eligible Checkers. The in-app badge is the fallback for email failure. Tech is alerted of the email delivery failure.

### Use Case 5.4: Approval Alerts

| Email Occasion | Recipient | Subject | Body Must Include |
|---|---|---|---|
| On Maker submission | All eligible Checkers (excluding Maker if Maker is not a Checker) | Defined per invoking use case | Maker email, entity details, Approve/Reject CTA, direct hyperlink to pending approvals section |
| On Checker rejection | Maker | `[Locus] Request Rejected — <action type> for <entity identifier>` | Checker email, entity identifier, rejection reason, resubmit guidance |
| On 24-hour reminder (repeating) | All eligible Checkers | `[Locus] Pending Approval Reminder — <action type> for <entity identifier>` | Entity identifier, time elapsed since submission, direct hyperlink to pending approvals section |
| On self-cancellation by Maker | All Checkers who received submission email | `[Locus] Request Cancelled — <action type> for <entity identifier>` | Maker email, entity identifier, cancellation timestamp |
| On auto-withdrawal (due to termination/suspension) | Person who raised the original request | `[Locus] Request Withdrawn — <action type> for <entity identifier>` | Entity identifier, reason for withdrawal (driver terminated / driver suspended), withdrawal timestamp |

---

## Use Case 6: Driver State Change — In-Flight Impact

This cross-cutting use case defines system behaviour when a driver's status changes while operations are active. It applies across UC1–UC4.

**Principle:** Status changes never retroactively invalidate completed deliveries. Changes to Active/Inactive/Terminated apply to future planning cycles and app access, not to events already recorded.

1. Driver terminated via standard flow while mid-trip → dispatcher is warned but can proceed. In-flight trip continues. Termination takes effect for new planning cycles immediately. App access revoked after propagation window.
2. Driver terminated via emergency script while mid-trip → allocated-but-undelivered orders cancelled immediately by script. In-transit deliveries (driver physically en route) not auto-cancelled — Ops and Engineering coordinate case by case. Termination takes effect in planning engine immediately. App access revoked after propagation window.
3. Driver suspended while mid-trip → suspension enters "Suspension Pending — Active Trip" state. Active trip continues uninterrupted. On trip completion, driver status transitions to Inactive immediately. Driver app shows suspension experience (M7) at that moment.
4. Driver's hub is changed (UC2 edit) while mid-trip → new hub takes effect next planning cycle. Active trip continues under original hub.
5. Driver's Driver Type changed (UC2 edit) while mid-trip → new type takes effect next planning cycle.
6. Driver created with a hub that is subsequently deleted (M2) before the driver is used in planning → driver record remains but references an invalid hub. M8 alert A3.10 fires. Ops must edit the driver record to assign an existing hub before the driver can be included in planning.
7. Driver's eligible pincodes edited to remove a pincode while a plan including that pincode is active → the active plan is not affected. The edit applies to future planning cycles only.

---

## Audit Trail

Every driver lifecycle action is logged in Redshift with the following fields:

| Event | Fields Logged |
|---|---|
| Driver created | driver_id, performing_user_id, timestamp, all field values at creation |
| Driver edited | driver_id, performing_user_id, timestamp, changed fields (before and after values) |
| Driver terminated (standard) | driver_id, performing_user_id, timestamp, termination_reason |
| Driver terminated (emergency script) | driver_id, executing_engineer_id, timestamp, cancelled_order_ids, reason |
| Driver suspended | driver_id, performing_user_id, timestamp, suspension_reason |
| Driver unsuspended | driver_id, performing_user_id, timestamp |
| Maker-Checker submitted | request_id, driver_id, maker_user_id, action_type, timestamp |
| Maker-Checker approved | request_id, checker_user_id, timestamp |
| Maker-Checker rejected | request_id, checker_user_id, rejection_reason, timestamp |
| Maker-Checker cancelled (self) | request_id, maker_user_id, timestamp |
| Maker-Checker auto-withdrawn | request_id, trigger_event (terminated/suspended), timestamp |
| Maker-Checker 24h reminder sent | request_id, reminder_count, timestamp |

---

## Data Retention

| Data Category | Retention Period | Post-Retention Action |
|---|---|---|
| Active/Suspended driver records | Indefinite while status is Active or Suspended | — |
| Terminated driver records | 3 years post-termination | Anonymise Aadhaar and DL fields; retain driver_id and earning history |
| Audit log entries | 3 years | Archive to cold storage |
| Earnings history | 2 years post-termination | Accessible to driver via ops request |

---

## Open Questions

| # | Question | Owner | Affects |
|---|---|---|---|
| Q1 | Vendor dropdown values | Ops | UC1 field table |
| Q2 | Termination reason list | Ops | UC3 |
| Q3 | Suspension reason list | Ops | UC4.1 |
| Q4 | Which edit fields trigger Maker-Checker (configurable defaults) | Product + Ops | UC2 |
| Q5 | Navigation steps on Locus dashboard for all UCs | Locus CSM | UC1, UC2, UC3, UC4 |
| Q6 | Emergency termination script — does Locus support a force-terminate API bypass, or must this be a direct DB operation? Confirm with Locus engineering. | Tech + Locus CSM | UC3 emergency path |
| Q7 | COD-via-QR detection — does M7 Driver App write a QR payment flag to the order record that M3 can read at termination time? Confirm data model with M7. | Tech | UC3 COD warning condition |
| Q8 | 24-hour reminder frequency — confirm with Ops whether daily reminders are sufficient or if a different cadence (e.g., every 12 hours after 48 hours elapsed) is preferred. | Ops | UC5 reminder flow |

---

## Metrics

| Metric | Definition | Baseline | Target | Timeframe |
|---|---|---|---|---|
| Maker-Checker Resolution Rate | % of Pending requests resolved (approved or rejected) without requiring escalation | Unknown | > 95% | Stage 2 onwards |
| Driver Config Completeness | % of active drivers with all mandatory fields populated and no validation gaps | Unknown | 100% | Before Stage 1 |
| Orphaned Driver Count | # of active drivers with no hub assigned or no eligible pincodes | 0 (target) | 0 | Ongoing |
| Emergency Termination Rate | # of emergency script terminations per month | Unknown — baseline in first 4 weeks | Minimise; each is an ops incident | Ongoing |

---

## Rollout & Stage Gates

| Stage | Entry Criteria | Success Criteria | Action on Failure |
|---|---|---|---|
| Stage 1 — Config Complete | M2 Geography stable. At least 1 hub exists. | At least 1 driver successfully created with all fields valid. Maker-Checker tested end-to-end for at least 1 request including 24-hour reminder. | Fix creation or Maker-Checker flow before handing to M6. |
| Stage 2 — Minimal Rollout | Stage 1 passed. 1 zone, 1 warehouse live. | Driver Config Completeness = 100% for Stage 2 driver cohort. Zero planning failures attributable to driver misconfiguration. | Do not expand zones until driver config is verified. |
| Stage 3a — Phased Expansion | Stage 2 passed. | All non-DC driver cohorts onboarded. Maker-Checker Resolution Rate > 95%. Emergency termination script tested in staging. | Pause expansion if Maker-Checker flow is unresolved. |
| Stage 4 — Full | All drivers onboarded. | Zero orphaned drivers. All suspension/termination flows tested with active-trip scenarios including emergency path. | — |
