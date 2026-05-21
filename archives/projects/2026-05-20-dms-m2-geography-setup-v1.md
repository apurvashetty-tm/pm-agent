# [PRD] DMS Integration — Milestone 2: Geography Setup

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
| Analytics | Analytics Lead | — | Tejas | — |
| Locus | Locus CSM | — | Eng Lead | — |

---

## Authorization Matrix

Geography changes affect live planning. Role restrictions apply to every action in this milestone.

| Action | Permitted Roles |
|---|---|
| Zone creation (KML upload) | Ops, HO Central Logistics |
| Pincode-to-zone CSV upload | Ops, HO Central Logistics |
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
4. Serviceability sync (UC 4) — serviceability updates flow into Locus only after pincode-zone mapping is live

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

Zone creation is owned by Analytics and Ops, with Locus providing algorithmic support on route optimisation. Only Ops and HO Central Logistics roles may upload zone configurations to Locus.

---

#### Use Case 1.2: Zone Creation via KML Upload

**Happy path:**

When Ops draws zone polygons in Google Maps, names each polygon according to the `<HubCode>_<ZoneID>_<ZoneName>` convention, and exports the result as a KML file, the Ops stakeholder uploads the KML to Locus. Locus validates the file for structural integrity and naming, then creates the zones. Each successfully created zone is available for pincode mapping immediately.

**Edge cases:**

1. KML file is malformed (invalid XML, unparseable structure) → Locus rejects the entire file and surfaces: "File could not be parsed. Verify the KML is valid XML and re-export from Google Maps." No partial creation occurs.

2. KML contains overlapping polygons → Locus rejects the entire file and identifies the specific polygon pairs causing the overlap by name. Ops corrects the affected polygons in Google Maps and re-exports. There is no in-platform remediation path inside Locus.

3. KML contains blank areas between polygons (gaps in coverage) → Locus rejects the entire file and surfaces the names of the polygons adjacent to each gap. Ops corrects and re-exports.

4. KML contains invalid polygon coordinates (non-numeric values, coordinates outside valid lat/long range) → Locus rejects the affected polygon(s) individually and surfaces the polygon name and the invalid coordinate. Other valid polygons in the same KML are not blocked.

5. A polygon's name matches an existing active zone in the Truemeds Locus account → Locus rejects creation of that polygon only and surfaces: "Zone already exists: `<Zone Name>`." Other polygons in the same KML are not affected.

6. A polygon's name does not follow the `<HubCode>_<ZoneID>_<ZoneName>` format → Locus rejects that polygon and surfaces: "Invalid zone name format: `<Zone Name>`. Expected format: `<HubCode>_<ZoneID>_<ZoneName>`." Other polygons in the same KML are not affected.

7. Conflict: a KML file contains both structural issues (overlap) and a duplicate name in different polygons → structural validation runs first. The file is rejected for structural issues before name validation is applied. Ops resolves structural issues first, then re-uploads.

8. Zone is created successfully but is not tagged to any hub in UC 3 → the zone exists in Locus as an orphaned zone. Locus surfaces orphaned zones (zones with no hub assignment) on the ops configuration dashboard. Orphaned zones are excluded from planning. A Metabase alert fires if an orphaned zone exists for more than 24 hours post-creation (see M8 Alerts A2.7).

9. Google Maps is unavailable when Ops attempts to draw polygons → zone creation is blocked entirely until Google Maps is accessible. There is no alternative zone creation path in Locus.

10. KML exported from Google Maps uses a format version Locus does not support → Locus surfaces: "Unsupported KML version. Re-export from Google Maps and retry." Ops must re-export. If the issue persists, Tech and Locus engineering are engaged to resolve the format compatibility.

11. KML upload times out due to file size (large number of polygons) → Locus surfaces a timeout error. Ops splits the KML into smaller batches and uploads sequentially. Zones created in a prior batch are not affected by a subsequent batch timeout.

12. Network connection drops mid-upload → Locus does not partially commit. The upload must be retried in full. Ops re-uploads the complete KML file.

---

### Use Case 2: Pincode-to-Zone Mapping

**Happy path:**

When Ops creates a CSV with two columns — Zone Name and Pincode — and uploads it to Locus via the bulk upload mechanism, Locus processes each row according to its specified action (insert, update, or delete). Rows passing all validations are committed. Rows failing validation are rejected individually with specific error messages. The upload is not all-or-nothing: valid rows commit regardless of other rows' failures. Ops receives a post-upload summary showing count of successes, failures, and the rejection reason per failed row.

**Defining "update":** An update action is equivalent to a delete of the existing mapping followed by an insert of the new mapping. It is provided as a convenience to avoid requiring two separate rows. Internally, Locus processes it as delete + insert in that order, atomically for that row.

**Edge cases — validation:**

1. Pincode already mapped to another zone and action is insert → row rejected: "Pincode `<Pincode>` already mapped to Zone `<Zone Name>`. Use delete action to remove existing mapping before inserting."

2. Zone Name or Pincode column is missing or empty → row rejected: "Please enter a valid value for `<column name>`."

3. Pincode does not match 6-digit integer format → row rejected: "Invalid pincode format: `<Pincode>`. Pincode must be a 6-digit integer."

4. Zone Name does not match any existing active zone in the Truemeds Locus account → row rejected: "Zone not found: `<Zone Name>`. Verify the zone name and retry."

5. Delete action for a pincode-zone combination that does not exist → row rejected: "Mapping not found: Pincode `<Pincode>` is not currently mapped to Zone `<Zone Name>`."

6. CSV contains duplicate pincodes across multiple rows in the same file → the first valid row for that pincode is processed. Subsequent rows for the same pincode in the same upload are rejected: "Duplicate pincode in upload: `<Pincode>`. Only the first occurrence was processed."

7. CSV has incorrect column headers or wrong file format (not a valid CSV) → the entire upload is rejected before any rows are processed: "File format invalid. Expected a CSV with columns: Zone Name, Pincode."

8. Pincode exists in the CSV but is not present in Truemeds' serviceability list → the row is accepted and the mapping is created. Serviceability is managed separately (UC 4). Locus does not validate pincode-level serviceability at mapping time.

**Edge cases — state intersection:**

9. Delete action submitted for a pincode that currently has active orders in the planning queue → Locus blocks the delete and surfaces: "Pincode `<Pincode>` has active orders in planning. Resolve or cancel these orders before removing the mapping." Ops must clear the active orders before the delete can proceed.

10. Pincode reassignment (delete Zone A + insert Zone B in same CSV) while an order for that pincode is being ingested simultaneously → Locus processes the delete first, then the insert, atomically per the update definition. If an order ingestion happens between the delete and the insert, the order enters "Zone Not Found" state. Ops is alerted and must manually re-trigger zone resolution for that order once the insert completes.

11. Pincode reassignment: delete and insert rows are in the wrong order in the CSV (insert before delete) → Locus processes the insert first. If the pincode is already mapped, the insert is rejected. The delete then runs and succeeds, leaving the pincode unmapped. Ops must resubmit with the correct row order (delete first, then insert). **Recommendation:** always submit reassignment as a single update action to avoid ordering risk.

**Edge cases — operational:**

12. Large CSV upload (thousands of rows) causes Locus's upload endpoint to time out → Ops splits the CSV into batches of no more than `<configurable threshold — TBD with Locus>` rows and uploads sequentially. Rows committed in prior batches are not affected.

13. Network connection drops mid-upload → Locus does not partially commit the in-flight batch. Ops re-uploads the batch from the beginning.

**Rollback:**

There is no automated rollback for CSV uploads. If an incorrect CSV is uploaded, Ops must construct and upload a reverse CSV (with opposing actions) to correct the state. For large-scale errors, Tech can restore Redshift to a prior snapshot as a recovery path if a rollback CSV is impractical.

**Audit trail:**

Every pincode-zone mapping change (insert, update, delete) is logged in Redshift with: action type, pincode, from-zone, to-zone, performing user ID, and timestamp. This log is accessible via Metabase for ops accountability and planning failure investigations.

---

### Use Case 3: Hub Creation

**Happy path:**

When Truemeds' internal system calls the Locus hub creation API with Hub Name, Hub Lat/Long, list of Zones, and list of Eligible Destination Hubs, Locus validates all inputs and creates the hub. The hub is immediately available for zone tagging and planning. All hub lifecycle actions (create, edit, delete) are system-driven via API only. Dashboard-based hub creation is not permitted for Truemeds.

**Hub edit:**

Locus supports editing all hub fields post-creation via API. The following constraints apply during edit:
- Removing a zone from a hub is blocked if that zone has active orders in planning: "Zone `<Zone Name>` has active orders. Resolve before removing from hub."
- Changing hub Lat/Long is permitted. The new coordinates are validated against the same rules as creation. Dispatchers are notified of the coordinate change.
- Removing a destination hub from the eligible list is blocked if a mid-mile trip to that destination hub is currently in flight: "Active mid-mile trip in progress to `<Hub Name>`. Cannot remove until trip completes."

**Hub deletion:**

Hub deletion is supported via API. Pre-conditions for deletion:
- No active orders reference the hub as origin or destination.
- No active drivers are rostered to the hub.
- No active mid-mile trips reference the hub.
If any pre-condition fails, Locus returns a specific error identifying the blocking entities. On successful deletion, all zone-hub assignments for that hub are cleared. Affected zones become orphaned and surface on the ops dashboard.

**Edge cases — validation:**

1. Hub name already exists in the Truemeds Locus account → rejected: "Hub already exists: `<Hub Name>`."

2. Zone in the zones list is already tagged to another hub → rejected: "Zone `<Zone Name>` already tagged to Hub `<Hub Name>`."

3. Hub Lat/Long outside valid decimal degree range (latitude: −90 to 90, longitude: −180 to 180) → rejected: "Invalid coordinates. Provide valid decimal degree coordinates."

4. Hub Lat/Long within global range but outside India (approx. lat 6–37, long 68–97) → soft warning surfaced without blocking creation: "Coordinates appear outside India. Confirm before proceeding." Ops confirms to proceed.

5. Two hubs share identical Lat/Long → rejected: "A hub already exists at these coordinates: `<Existing Hub Name>`. Verify coordinates before proceeding."

6. A hub listed under Eligible Destination Hubs does not exist in the Truemeds Locus account → rejected: "Destination hub not found: `<Hub Name>`. Verify hub name and retry."

7. Zones list is empty → rejected: "At least one zone must be assigned to a hub." A hub with no zones is operationally useless and must not be created.

8. Eligible Destination Hubs list is empty → rejected: "At least one eligible destination hub must be configured." A hub with no destination hubs cannot support any mid-mile routing.

**Edge cases — system failures:**

9. Locus API returns 5xx on hub creation → Truemeds' calling system retries the creation call up to 3 times with exponential backoff. If all retries fail, the hub creation is flagged as failed in Truemeds and Tech is alerted. The hub is not considered created until Locus returns a success response.

10. Race condition — two concurrent API calls attempt to create hubs with the same name → Locus must enforce uniqueness at the database level. The second call is rejected with the duplicate name error regardless of timing. Truemeds' system must handle this rejection as a terminal error and surface it for ops review.

11. Network connection drops mid-API call → Truemeds retries the call as per the retry logic in edge case 9. If the hub was partially created on Locus's side before the connection dropped, Locus must surface the hub in a "Creation Pending" state. Tech investigates and resolves the partial state before the hub is used.

**Audit trail:**

Every hub creation, edit, and deletion is logged in Redshift with: action type, hub name, changed fields, performing system/user, and timestamp.

---

### Use Case 4: Serviceability Updates

**Sync mechanism:**

Whenever a pincode's serviceability status changes in Truemeds' internal systems (activated or deactivated), Truemeds fires a webhook event to Locus with the pincode and its new status. Locus acknowledges the webhook and updates its internal serviceability state for that pincode. This webhook is the authoritative sync mechanism. There is no polling or batch job fallback.

**Happy path:**

When Ops activates a new pincode in Truemeds, Truemeds fires a serviceability webhook to Locus. Locus processes the event and marks the pincode as active. If the pincode is already mapped to a zone (UC 2), orders for that pincode begin flowing to Locus automatically from the next ingestion cycle. If the pincode is not yet mapped to a zone, it is held in "Unmapped — Pending Zone Assignment" state and does not flow to Locus until a zone mapping exists.

When Ops deactivates a pincode in Truemeds, Truemeds fires a serviceability webhook to Locus. Locus marks the pincode as inactive. No new orders are ingested for that pincode from this point forward.

**Edge cases:**

1. Pincode activated in Truemeds but not yet mapped to any zone in Locus → the webhook is received and processed by Locus, but orders for that pincode enter "Zone Not Found" state on ingestion (M6 A6.11). Tech and Ops are alerted. Ops must complete the pincode-to-zone mapping (UC 2) before orders for that pincode can flow to planning.

2. Pincode deactivated in Truemeds while active orders for that pincode exist in the current planning cycle → deactivation applies to new ingestions only. Orders already in the planning queue for that pincode are not affected and must be fulfilled or cancelled through the normal ops process. No in-flight orders are automatically cancelled by a serviceability deactivation event.

3. Truemeds fires the serviceability webhook but Locus does not acknowledge within the configurable timeout (default: 10 seconds) → Truemeds retries the webhook up to 3 times with exponential backoff. If all retries fail, the sync failure is logged in Redshift and a Metabase alert fires to Tech (M8 alert A2.6 equivalent). Ops is notified that Locus may have stale serviceability data until the sync is restored.

4. Locus processes the webhook but the internal state update fails → Locus returns a non-2xx acknowledgement. Truemeds treats this as a failed delivery and retries per edge case 3 logic.

5. Truemeds fires a deactivation webhook for a pincode that Locus does not have in its system (pincode was never mapped or ingested) → Locus returns a 200 acknowledgement and takes no action. This is a no-op and is not an error state.

6. Serviceability update activates a pincode that overlaps with another zone's pincode mappings → this is a UC 2 data integrity issue, not a UC 4 issue. The webhook activates the pincode. If it is mapped to multiple zones (violating the 1:1 constraint), M8 alert A2.1 fires and Tech investigates the mapping conflict.

7. Bulk serviceability updates (many pincodes activated or deactivated simultaneously) → each pincode fires a separate webhook event. Locus must process these at its standard webhook throughput. If Locus's webhook endpoint is rate-limited and drops events, Truemeds surfaces the failed events in a retry queue. Tech monitors the queue until all events are acknowledged.

**Audit trail:**

Every serviceability webhook event received by Locus is logged in Redshift with: pincode, new status, event timestamp, Locus acknowledgement status, and retry count. This log is the source of truth for reconciliation when ops believes a pincode's serviceability state in Locus does not match Truemeds.

---

### Use Case 5: Geography Change Impact on In-Flight Operations

This cross-cutting use case defines behaviour when geography configuration is modified while orders or trips are active. It applies across UC 1–4.

**Principle:** Geography changes never retroactively affect trips or orders that are already in a terminal or active state. Changes apply to new planning cycles only, unless explicitly stated otherwise.

**Specific scenarios:**

1. Zone polygon boundary updated (new KML uploaded for an existing zone) while a driver is mid-trip assigned to that zone → the in-flight trip continues against the old zone boundaries. The new boundaries take effect from the next planning cycle. No re-routing of the active trip occurs.

2. Zone deleted while a driver has an active trip assigned to it → zone deletion is blocked until all active trips in that zone are in a terminal state. The ops dashboard surfaces the blocking trips. Ops must wait for trips to complete or manually close them before the deletion proceeds.

3. Pincode removed from a zone (delete action in UC 2) while an order for that pincode is in an active plan → the delete is blocked until the order is resolved (delivered, cancelled, or returned). See UC 2 edge case 9.

4. Hub decommissioned (deleted) while a mid-mile trip is in flight to or from it → hub deletion is blocked. See UC 3 hub deletion pre-conditions.

5. Serviceability deactivation for a pincode while a driver is mid-delivery to that pincode → the in-flight delivery is unaffected. The deactivation applies to new ingestions only. See UC 4 edge case 2.

6. Zone polygon update creates a new overlap with an adjacent zone → Locus rejects the new KML upload per UC 1.2 edge case 2. The existing zone boundaries remain unchanged.

---

## Metrics

| Metric | Definition | Baseline | Target | Timeframe |
|---|---|---|---|---|
| Pincode Mapping Coverage | % of serviceable pincodes mapped to a zone in Locus | 0% at M2 start | 100% | Before Stage 1 |
| Orphaned Zone Count | # of zones with no hub assignment | 0 (target) | 0 | Ongoing |
| Serviceability Sync Failure Rate | % of serviceability webhook events that fail all retries | Unknown | < 0.1% | Stage 2 onwards |
| Geography Config Errors Post-Upload | # of planning failures attributable to geography misconfiguration (Zone Not Found, missing destination hub, etc.) | Unknown — baseline at Stage 1 | 0 after Stage 2 | Stage 2 |

---

## Rollout & Stage Gates

| Stage | Entry Criteria | Success Criteria | Action on Failure |
|---|---|---|---|
| Stage 1 — Config Complete | M2 UC 1–3 executed for at least 1 hub, 1 zone, non-DC pincodes | 100% of non-DC pincodes for Stage 1 hub mapped to zones. Hub creation confirmed via API. Serviceability sync live and verified for at least 5 pincode activations | Fix geography gaps before handing to M6 planning engine |
| Stage 2 — Minimal Rollout | Stage 1 passed. 1 zone, 1 hub, low order volume | Zero Zone Not Found errors in ingestion logs. Pincode Mapping Coverage = 100% for Stage 2 scope | Do not expand zones until coverage and sync are verified |
| Stage 3a — Phased Non-DC Expansion | Stage 2 passed. Ops training complete per zone | All non-DC zones and hubs live. Serviceability sync lag < 15 minutes for all pincode updates | Pause expansion. Investigate sync pipeline before proceeding |
| Stage 3b — DC Expansion | Stage 3a stable | All DC hubs and zones created. Mid-mile destination hub configuration verified | Pause DC expansion. Fix hub configuration before proceeding |
| Stage 4 — Full | All pincodes and hubs live | Pincode Mapping Coverage = 100% across all hubs. Zero orphaned zones | — |
