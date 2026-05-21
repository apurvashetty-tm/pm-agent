# [PRD] DMS Integration — Milestone 2: Geography Setup

**Version:** v2
**Date:** 2026-05-21
**Author:** Tejas Bhalerao
**Status:** In Review
**Supersedes:** [v1 — 2026-05-20](2026-05-20-dms-m2-geography-setup-v1.md)

**Changes from v1:**
- UC 1.2 edge cases 3 and 6: Locus does not validate coverage gaps or naming conventions. Changed to Ops SOP.
- UC 2 happy path: CSV upload happens in Truemeds internal system, not Locus directly.
- UC 2 edge cases 9 and 10: System does not block geography changes. Ops SOP governs timing (non-business hours). Solution changed to courier retry / order cancellation for stuck orders.
- UC 2 edge cases 12 and 13 (large CSV timeout, network drop): Dropped entirely.
- UC 3: Added bulk hub upload mechanism (new section, parallel to UC 2).
- UC 3 hub edit: Removed dispatcher notification on Lat/Long change. Destination hub removal no longer blocks; in-flight trips continue, new orders not routed.
- UC 3 hub deletion: No longer blocks on pre-conditions. Same in-flight continuation model as destination hub removal.
- UC 3 edge case 8: Expanded to call out reverse logistics dependency (DC hub → Mother Hub as eligible destination).
- UC 4: Complete rewrite. No webhook mechanism. Serviceability sync is implicit: Truemeds starts/stops sending orders; Ops must pre-configure zones per UC 1–2.
- UC 5: Cross-cutting scenarios 2, 3, 4, 6 rewritten. Geography changes never block; in-flight continues; new planning affected; stuck orders cancelled in Locus with Truemeds retry. New scenario added for orders placed after geography change but before planning cycle.

---

## RACI

| Function | R | A | C | I |
|---|---|---|---|---|
| Product | Tejas | Tejas | — | — |
| Engineering | Eng Lead | — | Tejas | Fahad |
| Ops | Ops Lead | — | Tejas | Kartik |
| Analytics | Analytics Lead | — | Tejas | — |
| Locus | Locus CSM | — | Eng Lead | — |

---

## Authorization Matrix

Geography changes affect live planning. Role restrictions apply to every action in this milestone.

| Action | Permitted Roles |
|---|---|
| Zone creation (KML upload) | Ops, HO Central Logistics |
| Pincode-to-zone mapping (Truemeds bulk upload) | Ops, HO Central Logistics |
| Hub creation / edit (API) | Tech (system-driven only) |
| Hub deletion (API) | Tech (system-driven only) |
| Serviceability update (Truemeds internal) | Ops |
| Viewing geography configuration | All roles |

---

## Objective

Establish the complete geography configuration on Locus — zones, pincode mappings, and hubs — such that the planning engine has accurate, complete, and current operational boundaries for all hyperlocal forward deliveries.

---

## Why Now?

No planning engine operation is possible without geography configuration. Zones, pincode mappings, and hub definitions are the prerequisite for every downstream milestone. This milestone must be complete and stable before M3 (Driver Module) and M6 (Planning Engine) can go live.

---

## Ordering Dependencies

The following sequence is mandatory. Actions performed out of order will fail validation or produce unusable configurations.

1. Zone creation (UC 1) — zones must exist before pincode mapping
2. Pincode-to-zone mapping (UC 2) — pincodes must be mapped before hubs reference zones meaningfully
3. Hub creation (UC 3) — hubs must reference existing zones; eligible destination hubs must already exist
4. Serviceability sync (UC 4) — Ops must ensure zone + pincode configuration is complete before activating a pincode in Truemeds; once a pincode is active, Truemeds will route orders to Locus automatically

---

## Use Cases

---

### Use Case 1: Zone Creation

---

#### Use Case 1.1: Zone Creation Logic

Locus operates on zones — a zone is a named collection of pincodes treated as a single operational unit for planning, driver assignment, and routing. Truemeds does not import zones from any existing system. All zones are created fresh as part of this migration.

**Zone design principles:**
- Zones must be grouped based on pincode-level demand patterns. Pincodes with similar demand volumes and proximity are grouped together.
- Each zone must be coverable by a single driver shift within the committed delivery window. The exact pincode threshold per zone is defined by Ops in consultation with Locus based on route optimisation analysis.
- Zone boundaries must not split geographically contiguous pincodes served from the same hub.
- One pincode belongs to exactly one zone at any point in time.

**Mandatory naming convention:** `<HubCode>_<ZoneID>_<ZoneName>` (example: `Vikhroli_Z01_Powai`)

This convention is enforced by Ops discipline, not by Locus. Locus does not validate zone names against this format. Ops must adhere to the convention manually at upload time. Naming violations will not be caught by the system and will result in operational confusion in later milestones (M6 planning, M7 driver app).

Zone creation is owned by Analytics and Ops, with Locus providing algorithmic support on route optimisation. Only Ops and HO Central Logistics roles may upload zone configurations to Locus.

---

#### Use Case 1.2: Zone Creation via KML Upload

**Happy path:**

When Ops draws zone polygons in Google Maps, names each polygon according to the `<HubCode>_<ZoneID>_<ZoneName>` convention, and exports the result as a KML file, the Ops stakeholder uploads the KML to Locus. Locus validates the file for structural integrity, then creates the zones. Each successfully created zone is available for pincode mapping immediately.

**Edge cases:**

1. KML file is malformed (invalid XML, unparseable structure) → Locus rejects the entire file and surfaces: "File could not be parsed. Verify the KML is valid XML and re-export from Google Maps." No partial creation occurs.

2. KML contains overlapping polygons → Locus rejects the entire file and identifies the specific polygon pairs causing the overlap by name. Ops corrects the affected polygons in Google Maps and re-exports. There is no in-platform remediation path inside Locus.

3. KML contains blank areas between polygons (coverage gaps) → Locus does not detect or reject coverage gaps. Gaps may be intentional (non-serviceable areas) or accidental (Ops error). Ops must perform a stringent sanity check of the KML before upload to verify all intended pincodes are covered. A coverage gap that goes undetected at upload time will surface as "Zone Not Found" errors during order ingestion (M6 A6.11). Ops is responsible for the pre-upload QA.

4. KML contains invalid polygon coordinates (non-numeric values, coordinates outside valid lat/long range) → Locus rejects the affected polygon(s) individually and surfaces the polygon name and the invalid coordinate. Other valid polygons in the same KML are not blocked.

5. A polygon's name matches an existing active zone in the Truemeds Locus account → Locus rejects creation of that polygon only and surfaces: "Zone already exists: `<Zone Name>`." Other polygons in the same KML are not affected.

6. A polygon's name does not follow the `<HubCode>_<ZoneID>_<ZoneName>` format → Locus does not validate zone naming conventions. This is an Ops SOP responsibility. A mis-named zone is created successfully in Locus. The naming error will only be detected downstream when planning or driver assignment references the zone name. Ops must verify naming before upload.

7. Conflict: a KML file contains both structural issues (overlap) and a duplicate name in different polygons → structural validation runs first. The file is rejected for structural issues before name validation is applied. Ops resolves structural issues first, then re-uploads.

8. Zone is created successfully but is not tagged to any hub in UC 3 → the zone exists in Locus as an orphaned zone. Locus surfaces orphaned zones (zones with no hub assignment) on the ops configuration dashboard. Orphaned zones are excluded from planning. A Metabase alert fires if an orphaned zone exists for more than 24 hours post-creation (see M8 Alerts A2.7).

9. Google Maps is unavailable when Ops attempts to draw polygons → zone creation is blocked entirely until Google Maps is accessible. There is no alternative zone creation path in Locus.

10. KML exported from Google Maps uses a format version Locus does not support → Locus surfaces: "Unsupported KML version. Re-export from Google Maps and retry." Ops must re-export. If the issue persists, Tech and Locus engineering are engaged to resolve the format compatibility.

11. KML upload times out due to file size (large number of polygons) → Locus surfaces a timeout error. Ops splits the KML into smaller batches and uploads sequentially. Zones created in a prior batch are not affected by a subsequent batch timeout.

---

### Use Case 2: Pincode-to-Zone Mapping

**Happy path:**

When Ops creates a CSV with two columns — Zone Name and Pincode — and uploads it via the **Truemeds internal bulk upload tool**, Truemeds processes each row and calls the Locus zone-pincode mapping API per row. Each row is processed according to its specified action (insert, update, or delete). Rows passing all validations are committed. Rows failing validation are rejected individually with specific error messages. The upload is not all-or-nothing: valid rows commit regardless of other rows' failures. Ops receives a post-upload summary showing count of successes, failures, and the rejection reason per failed row.

**Defining "update":** An update action is equivalent to a delete of the existing mapping followed by an insert of the new mapping. It is provided as a convenience to avoid requiring two separate rows. Internally, it is processed as delete + insert in that order, atomically for that row.

**Operational SOP:** All pincode-zone mapping changes must be performed during non-business hours only. Business hours are defined as 8:00 AM–10:00 PM IST. Changes during active planning windows carry a risk of affecting in-flight orders. Ops owns the scheduling discipline.

**Edge cases — validation:**

1. Pincode already mapped to another zone and action is insert → row rejected: "Pincode `<Pincode>` already mapped to Zone `<Zone Name>`. Use delete action to remove existing mapping before inserting."

2. Zone Name or Pincode column is missing or empty → row rejected: "Please enter a valid value for `<column name>`."

3. Pincode does not match 6-digit integer format → row rejected: "Invalid pincode format: `<Pincode>`. Pincode must be a 6-digit integer."

4. Zone Name does not match any existing active zone in the Truemeds Locus account → row rejected: "Zone not found: `<Zone Name>`. Verify the zone name and retry."

5. Delete action for a pincode-zone combination that does not exist → row rejected: "Mapping not found: Pincode `<Pincode>` is not currently mapped to Zone `<Zone Name>`."

6. CSV contains duplicate pincodes across multiple rows in the same file → the first valid row for that pincode is processed. Subsequent rows for the same pincode in the same upload are rejected: "Duplicate pincode in upload: `<Pincode>`. Only the first occurrence was processed."

7. CSV has incorrect column headers or wrong file format (not a valid CSV) → the entire upload is rejected before any rows are processed: "File format invalid. Expected a CSV with columns: Zone Name, Pincode."

8. Pincode exists in the CSV but is not present in Truemeds' serviceability list → the row is accepted and the mapping is created. Serviceability is managed separately (UC 4). Zone mapping does not validate pincode-level serviceability at mapping time.

**Edge cases — state intersection:**

9. Delete action submitted for a pincode that currently has active orders in the planning queue → the system does not block the delete. The delete proceeds. Any orders already in an active plan for that pincode are unaffected (in-flight continues). New planning cycles initiated after the delete will not be able to route orders to that pincode — those orders will enter "Zone Not Found" state. When an order cannot be planned because its pincode has no zone mapping, Locus marks the order as unroutable. Truemeds' order management system detects this state and attempts fulfilment via an alternative courier. The order is not cancelled in Truemeds.

   **Ops SOP:** To prevent this scenario from affecting live operations, all pincode delete actions must be performed in non-business hours when no active planning cycles are running.

10. Pincode reassignment (delete Zone A + insert Zone B) while a new order for that pincode is submitted simultaneously → the delete and insert are processed sequentially. If an order is ingested between the delete completion and the insert completion, the order enters "Zone Not Found" state. Truemeds' order management system detects this and retries with an alternative courier. The order is not cancelled in Truemeds.

    **Ops SOP:** To prevent this window of exposure, all pincode reassignments must be performed in non-business hours. Reassignment should always be submitted as a single update action (not separate delete + insert rows) to minimise the exposure window.

11. Pincode reassignment: delete and insert rows are in the wrong order in the CSV (insert before delete) → Truemeds' upload tool processes the insert first. If the pincode is already mapped, the insert is rejected. The delete then runs and succeeds, leaving the pincode unmapped. Ops must resubmit with the correct row order (delete first, then insert). **Recommendation:** always submit reassignment as a single update action to avoid ordering risk.

**Rollback:**

There is no automated rollback for CSV uploads. If an incorrect CSV is uploaded, Ops must construct and upload a reverse CSV (with opposing actions) to correct the state. For large-scale errors, Tech can restore Redshift to a prior snapshot as a recovery path if a rollback CSV is impractical.

**Audit trail:**

Every pincode-zone mapping change (insert, update, delete) is logged in Redshift with: action type, pincode, from-zone, to-zone, performing user ID, and timestamp. This log is accessible via Metabase for ops accountability and planning failure investigations.

---

### Use Case 3: Hub Creation

**Happy path — single hub via API:**

When Truemeds' internal system calls the Locus hub creation API with Hub Name, Hub Lat/Long, list of Zones, and list of Eligible Destination Hubs, Locus validates all inputs and creates the hub. The hub is immediately available for zone tagging and planning. All hub lifecycle actions (create, edit, delete) are system-driven via API only. Dashboard-based hub creation is not permitted for Truemeds.

**Bulk hub creation:**

For initial migration (creating multiple hubs at once), Truemeds provides a bulk hub upload tool analogous to the pincode-to-zone CSV upload in UC 2. Ops prepares a CSV with the following columns: Hub Name, Lat, Long, Zones (pipe-separated list), Eligible Destination Hubs (pipe-separated list). The Truemeds internal tool processes each row and calls the Locus hub creation API per row. Rows passing all validations are committed. Rows failing validation are rejected individually with specific error messages. Ops receives a post-upload summary with successes, failures, and rejection reasons per failed row.

The same validation rules that apply to single hub creation apply to each row in the bulk upload. The upload is not all-or-nothing: valid rows commit regardless of other rows' failures. Ordering dependency applies: a hub listed as an eligible destination must already exist before the row referencing it is processed; rows must be ordered accordingly.

**Hub edit:**

Locus supports editing all hub fields post-creation via API. The following constraints apply during edit:
- Removing a zone from a hub is blocked if that zone has active orders in planning: "Zone `<Zone Name>` has active orders. Resolve before removing from hub."
- Changing hub Lat/Long is permitted. The new coordinates are validated against the same rules as creation. No dispatcher notification is required — Ops manages the operational communication.
- Removing a destination hub from the eligible list: the change is not blocked. Existing mid-mile trips in flight to the removed destination hub are not affected — they continue to completion. New orders submitted after the removal are not routed to that destination hub. If any new order cannot be routed because no eligible destination hub exists for its pincode, Truemeds' order management system detects the unroutable state and retries with an alternative courier.

**Hub deletion:**

Hub deletion is supported via API. Deletion is not blocked by active orders, active drivers, or in-flight mid-mile trips. The following in-flight continuation rules apply:

- Active orders referencing the hub as origin or destination at time of deletion: in-flight operations continue to completion against the pre-deletion hub configuration. The hub record is retained as a soft-delete (inactive) until all referencing orders reach a terminal state.
- Active drivers rostered to the hub: drivers remain on their current trips. After trip completion, driver-hub association is cleared.
- Active mid-mile trips referencing the hub: in-flight mid-mile trips continue to completion. No rerouting occurs.
- New planning cycles: once the hub is deleted (marked inactive), no new trips, routes, or plans are created that reference it. Orders whose origin or destination maps to the deleted hub enter an unroutable state. Truemeds' order management system detects this and retries with an alternative courier.

On deletion, all zone-hub assignments for that hub are cleared. Affected zones become orphaned and surface on the ops configuration dashboard (M8 alert A2.8).

**Edge cases — validation:**

1. Hub name already exists in the Truemeds Locus account → rejected: "Hub already exists: `<Hub Name>`."

2. Zone in the zones list is already tagged to another hub → rejected: "Zone `<Zone Name>` already tagged to Hub `<Hub Name>`."

3. Hub Lat/Long outside valid decimal degree range (latitude: −90 to 90, longitude: −180 to 180) → rejected: "Invalid coordinates. Provide valid decimal degree coordinates."

4. Hub Lat/Long within global range but outside India (approx. lat 6–37, long 68–97) → soft warning surfaced without blocking creation: "Coordinates appear outside India. Confirm before proceeding." Ops confirms to proceed.

5. Two hubs share identical Lat/Long → rejected: "A hub already exists at these coordinates: `<Existing Hub Name>`. Verify coordinates before proceeding."

6. A hub listed under Eligible Destination Hubs does not exist in the Truemeds Locus account → rejected: "Destination hub not found: `<Hub Name>`. Verify hub name and retry."

7. Zones list is empty → rejected: "At least one zone must be assigned to a hub." A hub with no zones is operationally useless and must not be created.

8. Eligible Destination Hubs list is empty → rejected: "At least one eligible destination hub must be configured." A hub with no destination hubs cannot support any mid-mile routing or reverse logistics.

   **Important — reverse logistics dependency:** For DC hubs, the Mother Hub must be configured as an eligible destination hub. Without this, the DC cannot perform reverse logistics — return orders originating at the DC have no valid path back to the Mother Hub for processing. This is a blocking configuration gap for any reverse flow. Ops must verify this configuration explicitly for every DC hub before the hub is used in production.

**Edge cases — system failures:**

9. Locus API returns 5xx on hub creation → Truemeds' calling system retries the creation call up to 3 times with exponential backoff. If all retries fail, the hub creation is flagged as failed in Truemeds and Tech is alerted. The hub is not considered created until Locus returns a success response.

10. Race condition — two concurrent API calls attempt to create hubs with the same name → Locus must enforce uniqueness at the database level. The second call is rejected with the duplicate name error regardless of timing. Truemeds' system must handle this rejection as a terminal error and surface it for ops review.

11. Network connection drops mid-API call → Truemeds retries the call as per the retry logic in edge case 9. If the hub was partially created on Locus's side before the connection dropped, Locus must surface the hub in a "Creation Pending" state. Tech investigates and resolves the partial state before the hub is used.

**Audit trail:**

Every hub creation, edit, and deletion is logged in Redshift with: action type, hub name, changed fields, performing system/user, and timestamp.

---

### Use Case 4: Serviceability and Zone Readiness

**Sync model:**

There is no webhook-based serviceability sync between Truemeds and Locus. Serviceability is managed entirely within Truemeds' internal systems. When a pincode is active in Truemeds, Truemeds automatically routes orders for that pincode to Locus. When a pincode is deactivated, Truemeds stops sending orders for that pincode to Locus. Locus has no awareness of Truemeds' serviceability state — it only processes orders it receives.

**Consequence:** If a pincode is activated in Truemeds but its zone configuration in Locus is incomplete (not mapped in UC 2, or mapped zone has no hub in UC 3), orders for that pincode will fail at ingestion or planning with "Zone Not Found" errors. Locus will not prevent the order from being sent — the error surfaces at the point of routing.

**Ops SOP — pre-activation checklist:**

Before activating a pincode in Truemeds, Ops must confirm:
1. Pincode is mapped to a zone in Locus (UC 2)
2. The zone is assigned to an active hub (UC 3)
3. The hub has eligible destination hubs configured (if DC-served pincode)

If any of these steps are incomplete, orders for that pincode will enter "Zone Not Found" state on ingestion. Ops owns this pre-activation verification.

**Happy path:**

When Ops activates a new pincode in Truemeds (following the pre-activation checklist above), Truemeds begins routing orders for that pincode to Locus from the next ingestion cycle. No Locus-side action is required. Orders flow to planning normally.

When Ops deactivates a pincode in Truemeds, Truemeds stops routing orders for that pincode. No new orders are sent to Locus for that pincode. In-flight orders already in Locus planning are unaffected.

**Edge cases:**

1. Pincode activated in Truemeds but not mapped to any zone in Locus → orders for that pincode enter "Zone Not Found" state on ingestion (M6 A6.11). Tech and Ops are alerted. Ops must complete the pincode-to-zone mapping (UC 2) before orders for that pincode can flow to planning. Orders in "Zone Not Found" state remain in Locus until manually resolved or expired.

2. Pincode deactivated in Truemeds while active orders for that pincode exist in the current planning cycle → deactivation applies to new ingestions only. Orders already in the planning queue for that pincode are not affected and must be fulfilled or cancelled through the normal ops process. No in-flight orders are automatically cancelled by a serviceability deactivation event.

3. Pincode activated in Truemeds but zone configuration in Locus is partially complete (zone exists, hub exists, but hub has no eligible destination hubs and it is a DC-served pincode) → orders ingest successfully but fail at planning when no mid-mile path is found. M8 alert A2.9 fires. Ops must complete the destination hub configuration before orders can be planned.

4. Bulk activation (many pincodes activated simultaneously in Truemeds) → each pincode generates an order flow from the next ingestion cycle. No special handling required at Truemeds–Locus layer. If zone configuration is incomplete for any of these pincodes, "Zone Not Found" errors surface per edge case 1 above.

5. Pincode deactivated in Truemeds while a serviceability sync mismatch exists (Redshift shows active, Locus-internal state is stale) → Truemeds stops sending orders regardless of Locus-internal state. The Redshift-Locus mismatch is flagged by M8 alert A1.3. Tech reconciles independently.

**Audit trail:**

Every serviceability change (pincode activation or deactivation) in Truemeds is logged in Redshift with: pincode, new status, changed by user ID, and timestamp. This log is the source of truth for reconciliation when planning failures are traced to missing zone configuration.

---

### Use Case 5: Geography Change Impact on In-Flight Operations

This cross-cutting use case defines behaviour when geography configuration is modified while orders or trips are active. It applies across UC 1–4.

**Governing principle:** Geography changes are never blocked by in-flight operations. In-flight trips and orders always continue to completion against the configuration that was valid when they were created. Geography changes take effect for new planning cycles only.

**What happens to new orders when their pincode's geography is broken:** If a new order is submitted for a pincode whose zone mapping, zone-hub assignment, or hub configuration is incomplete or has just been changed, that order enters "Zone Not Found" or "Unroutable" state in Locus. Truemeds' order management system detects this state and attempts fulfilment via an alternative delivery partner. The order is not cancelled in Truemeds — it is rerouted internally.

**Specific scenarios:**

1. Zone polygon boundary updated (new KML uploaded for an existing zone) while a driver is mid-trip assigned to that zone → the in-flight trip continues against the old zone boundaries. The new boundaries take effect from the next planning cycle. No re-routing of the active trip occurs.

2. Zone deleted while a driver has an active trip assigned to it → zone deletion proceeds. The in-flight trip continues to completion unaffected. New planning cycles after the deletion will not route orders to that zone. Orders submitted after the zone deletion whose pincode was previously in that zone enter "Zone Not Found" state — Truemeds retries with an alternative delivery partner. The zone is retained as a soft-delete (inactive) until all referencing active trips reach a terminal state.

3. Pincode removed from a zone (delete action in UC 2) while an order for that pincode is in an active plan → the delete proceeds. The active plan is unaffected — the order in the plan continues to completion. New orders for that pincode submitted after the delete enter "Zone Not Found" state — Truemeds retries with an alternative delivery partner.

4. Hub decommissioned (deleted) while a mid-mile trip is in flight to or from it → hub deletion proceeds per UC 3 hub deletion rules. The in-flight mid-mile trip continues to completion. New orders that would have routed through this hub enter "Unroutable" state — Truemeds retries with an alternative delivery partner.

5. Serviceability deactivation for a pincode while a driver is mid-delivery to that pincode → the in-flight delivery is unaffected. The deactivation applies to new ingestions only. See UC 4 edge case 2.

6. Zone polygon update creates a new overlap with an adjacent zone → Locus rejects the new KML upload per UC 1.2 edge case 2. The existing zone boundaries remain unchanged. No in-flight operations are affected.

7. Order placed and ingested into Locus after a geography change that makes its pincode unroutable (zone mapping removed, hub deleted, etc.) → the order enters "Zone Not Found" or "Unroutable" state at plan creation time. Locus cannot assign the order to any plan. Truemeds' order management system detects the unroutable state and retries with an alternative delivery partner. This is the primary recovery path for any geography configuration gap that affects live order flow.

---

## Metrics

| Metric | Definition | Baseline | Target | Timeframe |
|---|---|---|---|---|
| Pincode Mapping Coverage | % of serviceable pincodes mapped to a zone in Locus | 0% at M2 start | 100% | Before Stage 1 |
| Orphaned Zone Count | # of zones with no hub assignment | 0 (target) | 0 | Ongoing |
| Zone Not Found Rate | % of ingested orders entering Zone Not Found state | Unknown — baseline at Stage 1 | 0 after Stage 2 | Stage 2 onwards |
| Geography Config Errors Post-Upload | # of planning failures attributable to geography misconfiguration | Unknown — baseline at Stage 1 | 0 after Stage 2 | Stage 2 |
| Alternative Courier Retry Rate (Geography-Caused) | # of orders rerouted to alternative courier due to Locus geography failures | Unknown | Baseline in first 2 weeks; reduce to 0 | Ongoing |

---

## Rollout & Stage Gates

| Stage | Entry Criteria | Success Criteria | Action on Failure |
|---|---|---|---|
| Stage 1 — Config Complete | M2 UC 1–3 executed for at least 1 hub, 1 zone, non-DC pincodes | 100% of non-DC pincodes for Stage 1 hub mapped to zones. Hub creation confirmed via API. Pre-activation checklist verified for at least 5 test pincodes | Fix geography gaps before handing to M6 planning engine |
| Stage 2 — Minimal Rollout | Stage 1 passed. 1 zone, 1 hub, low order volume | Zero Zone Not Found errors in ingestion logs. Pincode Mapping Coverage = 100% for Stage 2 scope | Do not expand zones until coverage is verified |
| Stage 3a — Phased Non-DC Expansion | Stage 2 passed. Ops training complete per zone | All non-DC zones and hubs live. Zero geography-caused courier retries | Pause expansion. Investigate geography config before proceeding |
| Stage 3b — DC Expansion | Stage 3a stable | All DC hubs and zones created. Mid-mile destination hub configuration verified including reverse logistics (DC → Mother Hub) | Pause DC expansion. Fix hub configuration before proceeding |
| Stage 4 — Full | All pincodes and hubs live | Pincode Mapping Coverage = 100% across all hubs. Zero orphaned zones | — |
