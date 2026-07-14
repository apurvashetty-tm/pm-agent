# Page 09 Packet - Platform & Product Foundations

## 1. Status and freeze condition

- **Packet status:** FROZEN BASELINE (`DEC-01`, 2026-07-14).
- **Draft release:** Requires recorded post-freeze source SHA and explicit Phase 5 launch.
- **Evidence condition:** Incident activity totals remain excluded until `EVD-01`; capacity-drain estimate must remain visibly user-supplied.

## 2. Page job

Show three enabling capabilities that replace recurring fragmentation, manual control, and opaque operating work with better consultation quality, measurable customer friction, and safe self-service operations. Present Foundations beneath all customer outcomes, not as fourth outcome or maintenance backlog.

## 3. Single CEO takeaway

Foundations turn recurring manual and fragmented work into measurable, controllable product operations.

## 4. Narrative role

- **Before:** Pages 6-8 define customer outcomes and initiative hypotheses.
- **This page:** Shows capabilities required to execute and measure those outcomes sustainably.
- **After:** Page 10 makes measurement gaps and Analytics contract explicit.

## 5. Content blocks

1. **Doctor Experience Platform**
   - Reduce doctor effort and consultation time.
   - Improve quality/compliance visibility and doctor decision support.
   - Reduce workflow breakage, operational intervention, and engineering firefighting.
2. **Customer Friction Intelligence & CRM**
   - Map contacts to customer, order where relevant, journey stage, reason, channel, resolution, repeat contact, and callback TAT.
   - Consolidate fragmented CSR workflow and enable product-backward friction measurement.
   - Create base for chatbot/AI later.
3. **Core Configuration & Controls**
   - Move frequent portal/category changes from backend/manual DB work to safe self-service control.
   - Include change governance, safe in-day changes, validation, and rollback visibility.

## 6. Initiative scope

- `INIT-09` Doctor Experience Platform.
- `INIT-10` Customer Friction Intelligence & CRM.
- `INIT-11` Core Configuration & Controls.
- Do not split telephony resilience, portal stability, defect reduction, heat maps, or individual configuration examples into separate roadmap initiatives.
- Doctor Experience owns consultation workflow/quality; Core Configuration owns reusable control plane.

## 7. Evidence allowed

| ID | Allowed use | Caveat |
|---|---|---|
| `INC-01` | 21 named recurring defect families in source review. | `FILE-VERIFIED`; use one aggregate lesson, not bug inventory. |
| `INC-02` | Source snapshot: 20 resolved, 1 open. | `FILE-VERIFIED`; does not prove low operating load or permanent resolution. |
| `BASE-02` | Doctor-call cost working baseline: Rs23.84 per placed order, May. | `USER-SUPPLIED`; secondary baseline only. Primary Doctor proof remains effort/quality/compliance. |
| `BASE-13` | User estimate: ~50% portal bandwidth spent on debugging/clutter. | `USER-SUPPLIED`; never present as verified. Requires `DR-13`. |
| `DR-05` | Order-linked contact/friction model. | Open; defines CRM proof and product-backward measurement. |
| `DR-07` | Doctor effort/quality/compliance baseline. | Open; defines Doctor Experience proof. |
| `DR-13` | Incident/capacity model. | Open; needed to quantify recurring load and capacity release. |
| `DR-14` | Configuration baseline. | Open; needed to size self-service/control opportunity. |

## 8. Unknowns and decisions

| ID | Open item | What it blocks |
|---|---|---|
| `DEC-01` | Formal structure/takeaway freeze. | Resolved; source SHA and Phase 5 launch remain. |
| `DR-05` | Contact taxonomy, order mapping, FCR/repeats, callback TAT. | CRM scope and measurable foundation outcome. |
| `DR-07` | Doctor effort, duration, quality/compliance, rework, errors/intervention. | Doctor targets and proof. |
| `DR-13` / `EVD-01` | Reconciled incident activity and engineering effort. | Capacity-release claim; ping/reply totals remain prohibited. |
| `DR-14` | Configuration volume, lead time, manual effort, failure, rollback. | Core Configuration sizing and proof. |
| `EXE-06` | Kapture/equivalent CRM vendor and related commercial dependencies. | CRM sequencing and milestones. |

## 9. Visual

- **Primary:** Three linked capability cards on one foundation layer, each showing current operating constraint -> foundation capability -> outcome enabled.
- **Optional alternative:** One enabling layer with three pillars feeding all three customer outcomes; avoid suggesting each foundation supports only one outcome.

## 10. Failure modes and exclusions

- Treating Foundations as fourth customer outcome.
- Rehoming Doctor Experience under Cost to Serve.
- Reducing Friction Intelligence to generic `mapped contacts/FCR` without order-linked CRM, workflow consolidation, inbound/outbound/callback context, and future automation.
- Splitting telephony, stability, defect reduction, heat maps, or configuration examples into new initiatives.
- Using `INC-05`/`INC-06` activity totals before reconciliation.
- Calling BASE-13 verified or using it as capacity fact.
- Listing 21 defects on CEO page.

## 11. Creative freedom

Writer may choose pillars, capability cards, or an enabling-layer visual and may improve capability names through explicit proposal. Writer may vary which enabled outcomes appear, but cannot create new initiatives, rehome Doctor Experience, or turn page into maintenance inventory.

## 12. Draft exit criteria

- All three foundation initiatives appear once with clear boundary.
- Foundations visibly enable customer outcomes.
- CRM description includes full customer-friction/service-platform context.
- Doctor proof prioritises effort/quality/compliance over cost.
- Incident evidence uses only safe `INC-01`/`INC-02` headline if included.
- BASE-13 is labelled estimate or omitted.
- No separate stability/telephony/defect initiatives appear.
